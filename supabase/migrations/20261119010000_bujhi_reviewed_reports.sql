-- Synthetic maternal hemoglobin from a mother-reviewed local OCR report.
begin;

alter table public.health_observations drop constraint health_observations_source_check;
alter table public.health_observations add constraint health_observations_source_check
  check (source in ('self_reported', 'document_extracted'));
alter table public.health_observations drop constraint health_observations_verification_check;
alter table public.health_observations add constraint health_observations_verification_check
  check (verification in ('self_reported', 'user_verified'));
alter table public.health_observations add constraint bujhi_source_verification_check
  check ((source = 'self_reported' and verification = 'self_reported') or
         (source = 'document_extracted' and verification = 'user_verified'));

create table public.bujhi_document_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  report_id uuid not null,
  pregnancy_id uuid not null,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  raw_label text not null,
  raw_value text not null,
  raw_unit text not null,
  reviewed_value text not null,
  observed_on date not null,
  observation_id uuid not null,
  created_at timestamptz not null default now(),
  unique (owner_user_id, report_id),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id),
  foreign key (observation_id, owner_user_id) references public.health_observations(id, owner_user_id)
);
alter table public.bujhi_document_reviews enable row level security;
alter table public.bujhi_document_reviews force row level security;
revoke all on public.bujhi_document_reviews from public, anon, authenticated;
grant select on public.bujhi_document_reviews to authenticated;
create policy bujhi_review_owner_read on public.bujhi_document_reviews for select to authenticated
  using (owner_user_id = (select auth.uid()) and exists (
    select 1 from public.profiles where user_id = (select auth.uid()) and role = 'mother'));

create function public.bujhi_commit_reviewed_hemoglobin(
  p_report_id uuid, p_pregnancy_id uuid, p_source_sha256 text,
  p_raw_label text, p_raw_value text, p_raw_unit text,
  p_reviewed_value text, p_reviewed_unit text, p_observed_on date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  previous public.bujhi_document_reviews;
  observation uuid;
begin
  if me is null or not exists (select 1 from public.profiles where user_id = me and role = 'mother') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if not exists (select 1 from public.pregnancy_records where id = p_pregnancy_id and owner_user_id = me) then
    raise exception 'pregnancy not found' using errcode = '42501';
  end if;
  if p_source_sha256 !~ '^[0-9a-f]{64}$' or lower(btrim(p_raw_label)) not in ('hemoglobin','haemoglobin','hb','hgb')
     or char_length(p_raw_value) > 40 or char_length(p_raw_unit) > 20
     or p_reviewed_value !~ '^[0-9]{1,3}(\.[0-9]{1,2})?$' or p_reviewed_unit is distinct from 'g/dL'
     or p_observed_on is null or p_observed_on > (now() at time zone 'Asia/Dhaka')::date then
    raise exception 'unsupported report field' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(me::text || ':' || p_report_id::text, 0));
  select * into previous from public.bujhi_document_reviews
    where owner_user_id = me and report_id = p_report_id;
  if found then
    if previous.pregnancy_id = p_pregnancy_id and previous.source_sha256 = p_source_sha256
       and previous.raw_label = p_raw_label and previous.raw_value = p_raw_value
       and previous.raw_unit = p_raw_unit and previous.reviewed_value = p_reviewed_value
       and previous.observed_on = p_observed_on then return previous.observation_id; end if;
    raise exception 'review already saved with different content' using errcode = '40001';
  end if;
  insert into public.health_observations (
    owner_user_id, pregnancy_id, kind, value, unit, observed_at,
    source, verification, recorded_by_user_id, source_note
  ) values (
    me, p_pregnancy_id, 'hemoglobin', p_reviewed_value, 'g/dL',
    p_observed_on::timestamp at time zone 'Asia/Dhaka',
    'document_extracted', 'user_verified', me, 'Bujhi local OCR; reviewed by mother'
  ) returning id into observation;
  insert into public.bujhi_document_reviews (
    owner_user_id, report_id, pregnancy_id, source_sha256, raw_label,
    raw_value, raw_unit, reviewed_value, observed_on, observation_id
  ) values (
    me, p_report_id, p_pregnancy_id, p_source_sha256, p_raw_label,
    p_raw_value, p_raw_unit, p_reviewed_value, p_observed_on, observation
  );
  return observation;
end $$;
revoke all on function public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date) from public, anon;
grant execute on function public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date) to authenticated;
commit;
