-- PROHOR Migration 002: Access Preferences Sync Enhancement
-- Forward-only migration for authenticated preference sync.
-- Preserves existing data, ensures owner-only DELETE policy, provides an updated_at trigger,
-- and grants minimum required privileges to authenticated users.
--
-- NOTE: Do not apply directly from unreviewed automated runners.
-- Review in Supabase SQL editor or staging CLI.

-- 1. Ensure table exists if not previously created by 001_initial.sql
create table if not exists public.access_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure RLS is active
alter table public.access_preferences enable row level security;

-- 2. Owner-only policies (preserving existing SELECT, INSERT, UPDATE if present)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'access_preferences' and policyname = 'preferences own read'
  ) then
    create policy "preferences own read" on public.access_preferences for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'access_preferences' and policyname = 'preferences own insert'
  ) then
    create policy "preferences own insert" on public.access_preferences for insert to authenticated with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'access_preferences' and policyname = 'preferences own update'
  ) then
    create policy "preferences own update" on public.access_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  -- 3. Owner-only DELETE policy for revoking cloud sync
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'access_preferences' and policyname = 'preferences own delete'
  ) then
    create policy "preferences own delete" on public.access_preferences for delete to authenticated using (user_id = auth.uid());
  end if;
end $$;

-- 4. Trigger to reliably maintain updated_at on UPDATE
create or replace function public.set_access_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_access_preferences_updated_at on public.access_preferences;
create trigger tr_access_preferences_updated_at
  before update on public.access_preferences
  for each row
  execute function public.set_access_preferences_timestamp();

-- 5. Explicit table privileges: minimum required for authenticated users
grant select, insert, update, delete on table public.access_preferences to authenticated;
revoke all on table public.access_preferences from anon;
