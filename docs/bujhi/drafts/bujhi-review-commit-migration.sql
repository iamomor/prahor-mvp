-- DRAFT migration: Bujhi reviewed-report commit slice (one supported field: maternal hemoglobin, g/dL).
-- Flow: browser OCR -> mother reviews/corrects/rejects -> bujhi_save_review (immutable snapshot) -> bujhi_commit_review (writes the timeline).
-- ASSUMES these tables from the Jibonrekha health migration (Ifty/Omor). Rename columns here if the real ones differ:
--   public.pregnancy_records(id uuid pk, owner_user_id uuid)
--   public.health_observations(id uuid pk default gen_random_uuid(), owner_user_id uuid, pregnancy_id uuid null, kind text,
--       value text, unit text, observed_on date, source text, verification text, document_report_id uuid,
--       extracted_field_id text, review_id uuid, recorded_at timestamptz default now(),
--       UNIQUE (review_id, extracted_field_id))        <- required for retry-safe commits
-- Tested only on a scratch Postgres with a stubbed auth schema and stub copies of those two tables, NOT on your hosted project.
begin;

create table public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null,                      -- created once in the browser per review attempt; makes retries safe
  pregnancy_id uuid not null,
  engine text not null check (char_length(engine) between 1 and 100),
  engine_version text not null check (char_length(engine_version) between 1 and 100),
  source_file_sha256 text check (source_file_sha256 ~ '^[0-9a-f]{64}$'),
  decisions jsonb not null,                     -- immutable snapshot: raw OCR values + the mother's decision per field
  decisions_md5 text not null,
  status text not null default 'reviewed' check (status in ('reviewed','committed')),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  committed_at timestamptz,
  unique (owner_user_id, report_id)
);
alter table public.document_reviews enable row level security;
create policy "owner reads own reviews" on public.document_reviews for select to authenticated using (owner_user_id = auth.uid());
revoke all on public.document_reviews from anon, authenticated;
grant select on public.document_reviews to authenticated;

-- 1) Save the mother's review. Browser sends raw OCR + decisions; the server validates and freezes them.
create function public.bujhi_save_review(
  p_report_id uuid, p_pregnancy_id uuid, p_engine text, p_engine_version text, p_source_sha256 text, p_decisions jsonb
) returns public.document_reviews
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d jsonb; r public.document_reviews; n int := 0; md text;
begin
  if me is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.profiles where user_id = me and role = 'mother') then
    raise exception 'only mothers may save reviews' using errcode = '42501'; end if;
  if jsonb_typeof(p_decisions) <> 'array' or jsonb_array_length(p_decisions) not between 1 and 20 then
    raise exception 'decisions must be 1 to 20 items' using errcode = '22023'; end if;
  if not exists (select 1 from public.pregnancy_records where id = p_pregnancy_id and owner_user_id = me) then
    raise exception 'pregnancy not found' using errcode = '42501'; end if;
  for d in select * from jsonb_array_elements(p_decisions) loop
    if jsonb_typeof(d) <> 'object' or coalesce(d->>'fieldId','') !~ '^[A-Za-z0-9_-]{1,64}$'
       or d->>'decision' not in ('accepted','corrected','rejected') then
      raise exception 'bad decision item' using errcode = '22023'; end if;
    if d->>'decision' <> 'rejected' then
      if d->>'kind' is distinct from 'hemoglobin' then raise exception 'unsupported measurement' using errcode = '22023'; end if;
      if d->>'unit' is distinct from 'g/dL' then raise exception 'unsupported unit' using errcode = '22023'; end if;
      if coalesce(d->>'value','') !~ '^\d{1,3}(\.\d{1,2})?$' then raise exception 'bad value format' using errcode = '22023'; end if;
      if coalesce(d->>'observedOn','') !~ '^\d{4}-\d{2}-\d{2}$' or (d->>'observedOn')::date > current_date then
        raise exception 'bad observation date' using errcode = '22023'; end if;
      n := n + 1;
    end if;
  end loop;
  md := md5(p_decisions::text);
  select * into r from public.document_reviews where owner_user_id = me and report_id = p_report_id;
  if found then
    if r.decisions_md5 = md and r.pregnancy_id = p_pregnancy_id then return r; end if;   -- same retry: same review
    raise exception 'review already saved with different content' using errcode = '40001';
  end if;
  insert into public.document_reviews(owner_user_id, report_id, pregnancy_id, engine, engine_version, source_file_sha256, decisions, decisions_md5)
    values (me, p_report_id, p_pregnancy_id, p_engine, p_engine_version, p_source_sha256, p_decisions, md) returning * into r;
  return r;
end $$;

-- 2) Commit the frozen snapshot to the timeline. Values come from the snapshot, never from a second client payload.
create function public.bujhi_commit_review(p_review_id uuid, p_expected_revision integer)
returns setof public.health_observations
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); r public.document_reviews; d jsonb;
begin
  select * into r from public.document_reviews where id = p_review_id and owner_user_id = me for update;
  if not found then raise exception 'not found' using errcode = '42501'; end if;
  if r.status = 'reviewed' then
    if r.revision <> p_expected_revision then raise exception 'stale revision' using errcode = '40001'; end if;
    for d in select * from jsonb_array_elements(r.decisions) loop
      if d->>'decision' in ('accepted','corrected') then
        insert into public.health_observations(owner_user_id, pregnancy_id, kind, value, unit, observed_on, source, verification,
            document_report_id, extracted_field_id, review_id)
          values (me, r.pregnancy_id, 'hemoglobin', d->>'value', 'g/dL', (d->>'observedOn')::date,
            'document_extracted', 'user_verified', r.report_id, d->>'fieldId', r.id)
          on conflict (review_id, extracted_field_id) do nothing;
      end if;
    end loop;
    update public.document_reviews set status = 'committed', revision = revision + 1, committed_at = now() where id = r.id;
  end if;
  return query select * from public.health_observations where review_id = r.id and owner_user_id = me order by recorded_at, id;
end $$;

revoke all on function public.bujhi_save_review(uuid,uuid,text,text,text,jsonb), public.bujhi_commit_review(uuid,integer) from public, anon;
grant execute on function public.bujhi_save_review(uuid,uuid,text,text,text,jsonb), public.bujhi_commit_review(uuid,integer) to authenticated;
commit;
