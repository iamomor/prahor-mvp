-- Day 2, Steps 8-9: identity and Adapt only. No clinical tables.
-- Also upgrades the two tables if the historical illustrative schema was applied.
begin;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles
  add column role text not null default 'mother',
  add column updated_at timestamptz not null default now(),
  add constraint profiles_role_check check (role in ('mother', 'provider')),
  add constraint profiles_display_name_length check (char_length(display_name) <= 120);

create table if not exists public.access_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.access_preferences
  add column schema_version integer not null default 2,
  add column created_at timestamptz not null default now(),
  add constraint access_preferences_version_check check (schema_version = 2);

-- Names/defaults match src/lib/contracts/adapt.ts. Appearance stays independent
-- of contrast; these settings confer no permission or clinical meaning.
create function public.day2_preference_defaults()
returns jsonb language sql immutable set search_path = '' as $$
  select '{"theme":"quiet-garden","highContrast":false,"textScale":"default",
    "spaciousLayout":false,"reducedMotion":false,"simplifiedContent":false,
    "communication":"text","language":"bn","textSpacing":"default","readAloud":false}'::jsonb;
$$;

create function public.day2_valid_preferences(value jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(
    jsonb_typeof(value) = 'object'
    and value ?& array['theme','highContrast','textScale','spaciousLayout',
      'reducedMotion','simplifiedContent','communication','language','textSpacing','readAloud']
    and (value - array['theme','highContrast','textScale','spaciousLayout',
      'reducedMotion','simplifiedContent','communication','language','textSpacing','readAloud']) = '{}'::jsonb
    and value->'theme' in ('"quiet-garden"'::jsonb,'"original-rose"'::jsonb,'"morning-mist"'::jsonb)
    and value->'textScale' in ('"default"'::jsonb,'"large"'::jsonb,'"extra-large"'::jsonb)
    and value->'language' in ('"bn"'::jsonb,'"en"'::jsonb)
    and value->'communication' in ('"text"'::jsonb,'"aac"'::jsonb)
    and value->'textSpacing' in ('"default"'::jsonb,'"increased"'::jsonb)
    and jsonb_typeof(value->'highContrast') = 'boolean'
    and jsonb_typeof(value->'spaciousLayout') = 'boolean'
    and jsonb_typeof(value->'reducedMotion') = 'boolean'
    and jsonb_typeof(value->'simplifiedContent') = 'boolean'
    and jsonb_typeof(value->'readAloud') = 'boolean', false);
$$;

-- Fill missing legacy v1 fields without discarding existing values. Invalid or
-- unknown legacy fields fail the constraint and roll back for owner review.
update public.access_preferences
set settings = public.day2_preference_defaults() || settings;
alter table public.access_preferences
  alter column settings set default public.day2_preference_defaults(),
  add constraint access_preferences_settings_check
    check (public.day2_valid_preferences(settings));

create function public.day2_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.day2_touch_updated_at();
create trigger access_preferences_touch_updated_at before update on public.access_preferences
for each row execute function public.day2_touch_updated_at();

-- SECURITY DEFINER is limited to Auth provisioning; user metadata is never used
-- for authorization (including role). No client may invoke this function.
create function public.day2_provision_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, role) values (new.id, 'mother')
    on conflict (user_id) do nothing;
  insert into public.access_preferences (user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;
alter function public.day2_provision_auth_user() owner to postgres;
create trigger day2_auth_user_created after insert on auth.users
for each row execute function public.day2_provision_auth_user();

-- Existing accounts are provisioned as mothers, never inferred as providers.
insert into public.profiles (user_id) select id from auth.users
on conflict (user_id) do nothing;
insert into public.access_preferences (user_id) select id from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.access_preferences enable row level security;

-- Replace legacy policies only on these two tables. Column grants, alongside
-- RLS, prevent owner/role/timestamp changes and direct client provisioning.
do $$
declare policy_row record;
begin
  for policy_row in select tablename, policyname from pg_catalog.pg_policies
    where schemaname = 'public' and tablename in ('profiles','access_preferences')
  loop
    execute format('drop policy %I on public.%I', policy_row.policyname, policy_row.tablename);
  end loop;
end;
$$;
revoke all on public.profiles, public.access_preferences from public, anon, authenticated;
-- Clear any legacy column-level grants as well as table-level grants.
revoke all (user_id, display_name, role, created_at, updated_at)
  on public.profiles from public, anon, authenticated;
revoke all (user_id, settings, schema_version, created_at, updated_at)
  on public.access_preferences from public, anon, authenticated;
grant select on public.profiles, public.access_preferences to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant update (settings) on public.access_preferences to authenticated;
grant all on public.profiles, public.access_preferences to service_role;

create policy profiles_select_own on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy access_preferences_select_own on public.access_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy access_preferences_update_own on public.access_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on function public.day2_provision_auth_user(), public.day2_touch_updated_at(),
  public.day2_preference_defaults(), public.day2_valid_preferences(jsonb)
  from public, anon, authenticated;
grant execute on function public.day2_preference_defaults(), public.day2_valid_preferences(jsonb)
  to authenticated, service_role;

-- The user_id primary keys already index every FK and owner-policy lookup.
comment on column public.profiles.role is
  'Trusted platform assignment only; provider status grants no cross-user access.';
comment on column public.access_preferences.settings is
  'Adapt v2 presentation/communication preferences; not clinical or consent data.';
commit;
