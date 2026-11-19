-- Additive synthetic Jibonrekha history on the existing private-record schema.
begin;

-- Keep owner reads deterministic for the account journey on the existing RLS tables.
create policy jr_pregnancy_owner_read on public.pregnancy_records for select to authenticated
  using (owner_user_id = auth.uid() and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'mother'));
do $$
declare resource text;
begin
  foreach resource in array array['baby_records','health_observations','baby_observations','maternal_conditions','maternal_symptom_notes'] loop
    execute format('create policy %I on public.%I for select to authenticated using (
      owner_user_id = auth.uid() and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = ''mother''))',
      'jr_' || resource || '_owner_read', resource);
  end loop;
end $$;

create table public.jr_operation_keys (
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  key uuid not null,
  action text not null,
  payload_hash text not null,
  result_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (owner_user_id, key)
);
alter table public.jr_operation_keys enable row level security;
alter table public.jr_operation_keys force row level security;
revoke all on public.jr_operation_keys from public, anon, authenticated, service_role;

create table public.jr_observation_corrections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  subject text not null check (subject in ('mother', 'baby')),
  old_observation_id uuid not null,
  new_observation_id uuid not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 500),
  corrected_at timestamptz not null default now(),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (owner_user_id, subject, old_observation_id),
  unique (owner_user_id, subject, new_observation_id)
);
alter table public.jr_observation_corrections enable row level security;
alter table public.jr_observation_corrections force row level security;
revoke all on public.jr_observation_corrections from public, anon, authenticated, service_role;
grant select on public.jr_observation_corrections to authenticated;
create policy jr_corrections_owner_read on public.jr_observation_corrections for select to authenticated
  using (owner_user_id = (select auth.uid()) and exists (
    select 1 from public.profiles where user_id = (select auth.uid()) and role = 'mother'));

create table public.jr_visits (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  subject text not null check (subject in ('mother', 'baby')),
  pregnancy_id uuid,
  baby_id uuid,
  occurred_at timestamptz not null check (isfinite(occurred_at)),
  place_note text check (char_length(btrim(place_note)) between 1 and 300),
  note text check (char_length(btrim(note)) between 1 and 2000),
  source text not null default 'self_recorded' check (source = 'self_recorded'),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  created_at timestamptz not null default now(),
  check ((subject = 'mother' and baby_id is null) or (subject = 'baby' and pregnancy_id is null and baby_id is not null)),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id),
  foreign key (baby_id, owner_user_id) references public.baby_records(id, owner_user_id)
);
alter table public.jr_visits enable row level security;
alter table public.jr_visits force row level security;
revoke all on public.jr_visits from public, anon, authenticated, service_role;
grant select on public.jr_visits to authenticated;
create policy jr_visits_owner_read on public.jr_visits for select to authenticated
  using (owner_user_id = (select auth.uid()) and exists (
    select 1 from public.profiles where user_id = (select auth.uid()) and role = 'mother'));
create index jr_visits_owner_date on public.jr_visits(owner_user_id, occurred_at desc);

create function public.jr_save(p_action text, p_data jsonb, p_key uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_variable
declare
  me uuid := auth.uid();
  old_key public.jr_operation_keys;
  old_mother public.health_observations;
  old_baby public.baby_observations;
  result_id uuid;
  fingerprint text;
  subject text;
  parent_id uuid;
  observed timestamptz;
  kind text;
  value_text text;
  unit_text text;
begin
  if me is null or not exists (select 1 from public.profiles where user_id = me and role = 'mother') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_key is null or p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'invalid request' using errcode = '22023';
  end if;
  fingerprint := md5(p_action || ':' || p_data::text);
  perform pg_advisory_xact_lock(hashtextextended(me::text || ':' || p_key::text, 0));
  select * into old_key from public.jr_operation_keys where owner_user_id = me and key = p_key;
  if found then
    if old_key.action = p_action and old_key.payload_hash = fingerprint then return old_key.result_id; end if;
    raise exception 'key reused for different content' using errcode = '40001';
  end if;

  if p_action = 'pregnancy' then
    if char_length(btrim(p_data->>'label')) not between 1 and 100 then raise exception 'invalid label' using errcode = '22023'; end if;
    if p_data->>'due' is not null and p_data->>'period' is not null and (p_data->>'due')::date <= (p_data->>'period')::date then
      raise exception 'invalid dates' using errcode = '22023';
    end if;
    insert into public.pregnancy_records(owner_user_id, recorded_by_user_id, label, estimated_due_date, last_menstrual_period_date)
      values (me, me, btrim(p_data->>'label'), (p_data->>'due')::date, (p_data->>'period')::date) returning id into result_id;
  elsif p_action = 'baby' then
    parent_id := (p_data->>'pregnancyId')::uuid;
    if char_length(btrim(p_data->>'label')) not between 1 and 100 then raise exception 'invalid label' using errcode = '22023'; end if;
    if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
    if (p_data->>'birthDate')::date > (now() at time zone 'Asia/Dhaka')::date then raise exception 'future date' using errcode = '22023'; end if;
    insert into public.baby_records(owner_user_id, pregnancy_id, label, birth_date)
      values (me, parent_id, btrim(p_data->>'label'), (p_data->>'birthDate')::date) returning id into result_id;
  elsif p_action = 'observation' then
    subject := p_data->>'subject';
    parent_id := (p_data->>'parentId')::uuid;
    kind := p_data->>'kind'; value_text := p_data->>'value'; unit_text := p_data->>'unit';
    observed := (p_data->>'observedAt')::timestamptz;
    if observed is null or observed > now() or not isfinite(observed)
      or not public.mvp_draft_valid_measurement(kind, value_text, unit_text, subject) then
      raise exception 'invalid observation' using errcode = '22023';
    end if;
    if p_data->>'sourceNote' is not null and char_length(btrim(p_data->>'sourceNote')) not between 1 and 500 then raise exception 'invalid note' using errcode = '22023'; end if;
    if subject = 'mother' then
      if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
      insert into public.health_observations(owner_user_id, recorded_by_user_id, pregnancy_id, kind, value, unit, observed_at, source_note)
        values (me, me, parent_id, kind, value_text, unit_text, observed, p_data->>'sourceNote') returning id into result_id;
    elsif subject = 'baby' then
      if parent_id is null or not exists (select 1 from public.baby_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
      insert into public.baby_observations(owner_user_id, recorded_by_user_id, baby_id, kind, value, unit, observed_at, source_note)
        values (me, me, parent_id, kind, value_text, unit_text, observed, p_data->>'sourceNote') returning id into result_id;
    else raise exception 'invalid subject' using errcode = '22023'; end if;
  elsif p_action = 'condition' then
    parent_id := (p_data->>'pregnancyId')::uuid;
    observed := (p_data->>'documentedAt')::timestamptz;
    if char_length(btrim(p_data->>'label')) not between 1 and 300 or observed is null or observed > now() or not isfinite(observed) then raise exception 'invalid condition' using errcode = '22023'; end if;
    if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
    insert into public.maternal_conditions(owner_user_id, recorded_by_user_id, pregnancy_id, label, documented_at, source_note)
      values (me, me, parent_id, btrim(p_data->>'label'), observed, p_data->>'sourceNote') returning id into result_id;
  elsif p_action = 'symptom_note' then
    parent_id := (p_data->>'pregnancyId')::uuid;
    observed := (p_data->>'occurredAt')::timestamptz;
    if char_length(btrim(p_data->>'note')) not between 1 and 2000 or observed is null or observed > now() or not isfinite(observed) then raise exception 'invalid note' using errcode = '22023'; end if;
    if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
    insert into public.maternal_symptom_notes(owner_user_id, pregnancy_id, note, occurred_at)
      values (me, parent_id, btrim(p_data->>'note'), observed) returning id into result_id;
  elsif p_action = 'visit' then
    subject := p_data->>'subject'; parent_id := (p_data->>'parentId')::uuid;
    observed := (p_data->>'occurredAt')::timestamptz;
    if observed is null or observed > now() or not isfinite(observed) or subject not in ('mother','baby') then raise exception 'invalid visit' using errcode = '22023'; end if;
    if p_data->>'placeNote' is not null and char_length(btrim(p_data->>'placeNote')) not between 1 and 300 then raise exception 'invalid place' using errcode = '22023'; end if;
    if p_data->>'note' is not null and char_length(btrim(p_data->>'note')) not between 1 and 2000 then raise exception 'invalid note' using errcode = '22023'; end if;
    if subject = 'mother' then
      if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
      insert into public.jr_visits(owner_user_id, subject, pregnancy_id, occurred_at, place_note, note)
        values (me, subject, parent_id, observed, p_data->>'placeNote', p_data->>'note') returning id into result_id;
    else
      if parent_id is null or not exists (select 1 from public.baby_records where id = parent_id and owner_user_id = me) then raise exception 'not owned' using errcode = '42501'; end if;
      insert into public.jr_visits(owner_user_id, subject, baby_id, occurred_at, place_note, note)
        values (me, subject, parent_id, observed, p_data->>'placeNote', p_data->>'note') returning id into result_id;
    end if;
  elsif p_action = 'correction' then
    subject := p_data->>'subject'; parent_id := (p_data->>'observationId')::uuid;
    value_text := p_data->>'value'; unit_text := p_data->>'unit';
    if char_length(btrim(p_data->>'reason')) not between 1 and 500 or parent_id is null then raise exception 'invalid correction' using errcode = '22023'; end if;
    if exists (select 1 from public.jr_observation_corrections c where c.owner_user_id = me and c.subject = subject and c.old_observation_id = parent_id) then
      raise exception 'already corrected' using errcode = '40001';
    end if;
    if subject = 'mother' then
      select * into old_mother from public.health_observations where id = parent_id and owner_user_id = me;
      if not found then raise exception 'not owned' using errcode = '42501'; end if;
      if not public.mvp_draft_valid_measurement(old_mother.kind, value_text, unit_text, subject) then raise exception 'invalid value' using errcode = '22023'; end if;
      insert into public.health_observations(owner_user_id, recorded_by_user_id, pregnancy_id, kind, value, unit, observed_at, source_note)
        values (me, me, old_mother.pregnancy_id, old_mother.kind, value_text, unit_text, old_mother.observed_at, 'Corrected by record owner') returning id into result_id;
    elsif subject = 'baby' then
      select * into old_baby from public.baby_observations where id = parent_id and owner_user_id = me;
      if not found then raise exception 'not owned' using errcode = '42501'; end if;
      if not public.mvp_draft_valid_measurement(old_baby.kind, value_text, unit_text, subject) then raise exception 'invalid value' using errcode = '22023'; end if;
      insert into public.baby_observations(owner_user_id, recorded_by_user_id, baby_id, kind, value, unit, observed_at, source_note)
        values (me, me, old_baby.baby_id, old_baby.kind, value_text, unit_text, old_baby.observed_at, 'Corrected by record owner') returning id into result_id;
    else raise exception 'invalid subject' using errcode = '22023'; end if;
    insert into public.jr_observation_corrections(owner_user_id, subject, old_observation_id, new_observation_id, reason)
      values (me, subject, parent_id, result_id, btrim(p_data->>'reason'));
  else raise exception 'unsupported action' using errcode = '22023'; end if;

  insert into public.jr_operation_keys(owner_user_id, key, action, payload_hash, result_id)
    values (me, p_key, p_action, fingerprint, result_id);
  return result_id;
end $$;
revoke all on function public.jr_save(text,jsonb,uuid) from public, anon;
grant execute on function public.jr_save(text,jsonb,uuid) to authenticated;
commit;
