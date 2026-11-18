-- PROHOR illustrative staging schema — NOT approved clinical production data system.
-- Run only in an isolated Supabase project with synthetic demo data, after owner review.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.access_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 settings jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.pregnancy_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 estimated_due_date date, due_date_source text not null default 'self_reported',
 created_at timestamptz not null default now()
);
create table if not exists public.baby_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 pregnancy_id uuid references public.pregnancy_records(id) on delete set null,
 label text not null default 'Baby record', created_at timestamptz not null default now()
);
create table if not exists public.health_observations (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null, value_text text not null, unit text,
 source text not null default 'self_reported' check(source in ('self_reported','document_extracted','clinician_entered','clinician_confirmed')),
 observed_at timestamptz not null default now()
);
create table if not exists public.maternal_conditions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 label text not null, source text not null default 'self_reported' check(source in ('self_reported','clinician_entered','clinician_confirmed')),
 documented_at timestamptz not null default now()
);
create table if not exists public.wellness_entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 mood_label text, rest_note text, activity_note text, private_note text,
 created_at timestamptz not null default now()
);
create table if not exists public.care_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 assigned_provider_id uuid references auth.users(id),
 message text not null, preferred_method text not null check(preferred_method in('text','aac','call')),
 status text not null default 'draft' check(status in('draft','submitted','delivered','acknowledged','responded','closed')),
 created_at timestamptz not null default now()
);
create table if not exists public.provider_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 approved_at timestamptz not null default now()
);
create table if not exists public.consent_grants (
 id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
 grantee_user_id uuid not null references auth.users(id) on delete cascade,
 scope text not null, revoked_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.facility_directory (
 id uuid primary key default gen_random_uuid(), name text not null,
 locality text, accessibility_status text not null default 'not_verified' check(accessibility_status in('verified','not_verified')),
 source_url text, visible boolean not null default false, reviewed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.access_preferences enable row level security;
alter table public.pregnancy_records enable row level security;
alter table public.baby_records enable row level security;
alter table public.health_observations enable row level security;
alter table public.maternal_conditions enable row level security;
alter table public.wellness_entries enable row level security;
alter table public.care_requests enable row level security;
alter table public.provider_memberships enable row level security;
alter table public.consent_grants enable row level security;
alter table public.facility_directory enable row level security;

create policy "profiles own read" on public.profiles for select to authenticated using (user_id=auth.uid());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (user_id=auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "preferences own read" on public.access_preferences for select to authenticated using (user_id=auth.uid());
create policy "preferences own insert" on public.access_preferences for insert to authenticated with check (user_id=auth.uid());
create policy "preferences own update" on public.access_preferences for update to authenticated using (user_id=auth.uid()) with check(user_id=auth.uid());
create policy "pregnancies own read" on public.pregnancy_records for select to authenticated using(user_id=auth.uid());
create policy "pregnancies own insert" on public.pregnancy_records for insert to authenticated with check(user_id=auth.uid() and due_date_source='self_reported');
create policy "baby own read" on public.baby_records for select to authenticated using(user_id=auth.uid());
create policy "baby own insert" on public.baby_records for insert to authenticated with check(user_id=auth.uid() and (pregnancy_id is null or exists(select 1 from public.pregnancy_records p where p.id=pregnancy_id and p.user_id=auth.uid())));
create policy "observations own read" on public.health_observations for select to authenticated using(user_id=auth.uid());
create policy "observations self-reported insert" on public.health_observations for insert to authenticated with check(user_id=auth.uid() and source='self_reported');
create policy "conditions own read" on public.maternal_conditions for select to authenticated using(user_id=auth.uid());
create policy "conditions self-reported insert" on public.maternal_conditions for insert to authenticated with check(user_id=auth.uid() and source='self_reported');
create policy "wellness own read" on public.wellness_entries for select to authenticated using(user_id=auth.uid());
create policy "wellness own insert" on public.wellness_entries for insert to authenticated with check(user_id=auth.uid());
create policy "requests own read" on public.care_requests for select to authenticated using(user_id=auth.uid());
create policy "requests draft insert" on public.care_requests for insert to authenticated with check(user_id=auth.uid() and assigned_provider_id is null and status='draft');
create policy "provider membership own read" on public.provider_memberships for select to authenticated using(user_id=auth.uid());
create policy "consent own read" on public.consent_grants for select to authenticated using(owner_user_id=auth.uid());
create policy "consent own insert" on public.consent_grants for insert to authenticated with check(owner_user_id=auth.uid() and grantee_user_id<>auth.uid());
create policy "facilities public verified listing" on public.facility_directory for select to anon,authenticated using(visible=true);
-- No default provider access to private health data; no provider client-side updates to care requests.
-- Grant provider membership + assigned requests only from a separately reviewed, authorized server workflow.
-- Never embed service-role keys in browser or source control.
