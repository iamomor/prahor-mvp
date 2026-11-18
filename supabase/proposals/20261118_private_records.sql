-- PROPOSAL private-records-v1. NOT an approved migration; excluded from migrations/.
-- Apply only to disposable PGlite through test-private-records-proposal.mjs.
-- Requires actual project/history inspection and Omor + Ifty + Samin review.
-- Synthetic, self-reported, append-only saves. No provider sharing or OCR writes.
begin;

create function public.mvp_draft_valid_measurement(kind text, value text, unit text, subject text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(subject in ('mother', 'baby') and case
    when kind = 'note' then unit is null and char_length(btrim(value)) between 1 and 2000
    else value ~ '^-?[0-9]{1,9}(\.[0-9]{1,6})?$' and case
      when kind = 'weight' then unit in ('kg', 'g')
      when kind = 'temperature' then unit in ('Cel', '[degF]')
      when kind in ('systolic_blood_pressure', 'diastolic_blood_pressure') then subject = 'mother' and unit = 'mm[Hg]'
      when kind = 'hemoglobin' then subject = 'mother' and unit = 'g/dL'
      when kind = 'glucose' then subject = 'mother' and unit in ('mg/dL', 'mmol/L')
      when kind = 'fetal_heart_rate' then subject = 'baby' and unit = '/min'
      else false end
    end, false);
$$;
revoke all on function public.mvp_draft_valid_measurement(text,text,text,text) from public, anon;
grant execute on function public.mvp_draft_valid_measurement(text,text,text,text) to authenticated, service_role;

create table public.pregnancy_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  label text not null check (char_length(btrim(label)) between 1 and 100),
  estimated_due_date date check (isfinite(estimated_due_date)),
  last_menstrual_period_date date check (isfinite(last_menstrual_period_date)),
  source text not null default 'self_reported' check (source = 'self_reported'),
  verification text not null default 'self_reported' check (verification = 'self_reported'),
  recorded_by_user_id uuid not null default auth.uid(),
  recorded_at timestamptz not null default now() check (isfinite(recorded_at)),
  source_note text check (char_length(btrim(source_note)) between 1 and 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id), check (recorded_by_user_id = owner_user_id)
);

create table public.baby_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  pregnancy_id uuid,
  label text not null check (char_length(btrim(label)) between 1 and 100),
  birth_date date check (isfinite(birth_date)),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id)
);

create table public.maternal_conditions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  pregnancy_id uuid,
  label text not null check (char_length(btrim(label)) between 1 and 300),
  documented_at timestamptz not null check (isfinite(documented_at)),
  source text not null default 'self_reported' check (source = 'self_reported'),
  verification text not null default 'self_reported' check (verification = 'self_reported'),
  recorded_by_user_id uuid not null default auth.uid(),
  recorded_at timestamptz not null default now() check (isfinite(recorded_at)),
  source_note text check (char_length(btrim(source_note)) between 1 and 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id), check (recorded_by_user_id = owner_user_id),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id)
);

create table public.health_observations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  pregnancy_id uuid,
  kind text not null, value text not null, unit text,
  observed_at timestamptz not null check (isfinite(observed_at)),
  source text not null default 'self_reported' check (source = 'self_reported'),
  verification text not null default 'self_reported' check (verification = 'self_reported'),
  recorded_by_user_id uuid not null default auth.uid(),
  recorded_at timestamptz not null default now() check (isfinite(recorded_at)),
  source_note text check (char_length(btrim(source_note)) between 1 and 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id), check (recorded_by_user_id = owner_user_id),
  check (public.mvp_draft_valid_measurement(kind, value, unit, 'mother')),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id)
);

create table public.baby_observations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  baby_id uuid not null,
  kind text not null, value text not null, unit text,
  observed_at timestamptz not null check (isfinite(observed_at)),
  source text not null default 'self_reported' check (source = 'self_reported'),
  verification text not null default 'self_reported' check (verification = 'self_reported'),
  recorded_by_user_id uuid not null default auth.uid(),
  recorded_at timestamptz not null default now() check (isfinite(recorded_at)),
  source_note text check (char_length(btrim(source_note)) between 1 and 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id), check (recorded_by_user_id = owner_user_id),
  check (public.mvp_draft_valid_measurement(kind, value, unit, 'baby')),
  foreign key (baby_id, owner_user_id) references public.baby_records(id, owner_user_id)
);

create table public.maternal_symptom_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  pregnancy_id uuid,
  note text not null check (char_length(btrim(note)) between 1 and 2000),
  occurred_at timestamptz not null check (isfinite(occurred_at)),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id)
);

create table public.wellness_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  occurred_at timestamptz not null check (isfinite(occurred_at)),
  mood text check (mood in ('comfortable', 'mixed', 'difficult', 'prefer_not_to_say')),
  energy text check (energy in ('low', 'medium', 'high', 'prefer_not_to_say')),
  activity_note text check (char_length(btrim(activity_note)) between 1 and 1000),
  rest_note text check (char_length(btrim(rest_note)) between 1 and 1000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  check (coalesce(mood, energy, activity_note, rest_note) is not null)
);

create table public.wellness_diary_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  text text not null check (char_length(btrim(text)) between 1 and 10000),
  occurred_at timestamptz not null check (isfinite(occurred_at)),
  privacy text not null default 'owner_only' check (privacy = 'owner_only'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision = 1),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id)
);

-- Fresh tables only: no edits of foundation policies, roles or legacy data.
-- Table SELECT is owner/mother-only; there are no UPDATE/DELETE policies/grants.
-- Column INSERT grants exclude identity, provenance, revisions and timestamps.
do $$
declare resource text;
begin
  foreach resource in array array['pregnancy_records', 'baby_records', 'maternal_conditions',
    'health_observations', 'baby_observations', 'maternal_symptom_notes',
    'wellness_entries', 'wellness_diary_entries']
  loop
    execute format('alter table public.%I enable row level security', resource);
    execute format('alter table public.%I force row level security', resource);
    execute format('revoke all on public.%I from public, anon, authenticated, service_role', resource);
    execute format('grant select on public.%I to authenticated', resource);
    execute format('create policy %I on public.%I for select to authenticated using (
      owner_user_id = (select auth.uid()) and exists (
        select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = ''mother''))',
      resource || '_owner_read', resource);
    execute format('create policy %I on public.%I for insert to authenticated with check (
      owner_user_id = (select auth.uid()) and exists (
        select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = ''mother''))',
      resource || '_owner_create', resource);
    execute format('create index %I on public.%I(owner_user_id, created_at, id)', resource || '_owner_history_idx', resource);
  end loop;
end;
$$;

grant insert (label, estimated_due_date, last_menstrual_period_date) on public.pregnancy_records to authenticated;
grant insert (pregnancy_id, label, birth_date) on public.baby_records to authenticated;
grant insert (pregnancy_id, label, documented_at, source_note) on public.maternal_conditions to authenticated;
grant insert (pregnancy_id, kind, value, unit, observed_at, source_note) on public.health_observations to authenticated;
grant insert (baby_id, kind, value, unit, observed_at, source_note) on public.baby_observations to authenticated;
grant insert (pregnancy_id, note, occurred_at) on public.maternal_symptom_notes to authenticated;
grant insert (occurred_at, mood, energy, activity_note, rest_note) on public.wellness_entries to authenticated;
grant insert (text, occurred_at) on public.wellness_diary_entries to authenticated;

create index baby_records_pregnancy_owner_idx on public.baby_records(pregnancy_id, owner_user_id);
create index maternal_conditions_pregnancy_owner_idx on public.maternal_conditions(pregnancy_id, owner_user_id);
create index health_observations_pregnancy_owner_idx on public.health_observations(pregnancy_id, owner_user_id);
create index maternal_symptom_notes_pregnancy_owner_idx on public.maternal_symptom_notes(pregnancy_id, owner_user_id);
create index baby_observations_baby_owner_idx on public.baby_observations(baby_id, owner_user_id);

comment on table public.wellness_diary_entries is 'Owner-only synthetic diary. No provider/AI sharing scope.';
comment on table public.health_observations is 'Synthetic self-report proposal only. Reviewed OCR and corrections require a later approved transaction.';
commit;
