-- Shusthota P1 private records. Synthetic demo data only; append-only and owner-only.
begin;

create function public.mvp_is_unique_text_array(input_values text[]) returns boolean
language sql immutable set search_path = '' as $$
  select cardinality(coalesce(input_values, array[]::text[])) =
    (select count(distinct value) from unnest(coalesce(input_values, array[]::text[])) as x(value));
$$;
revoke all on function public.mvp_is_unique_text_array(text[]) from public, anon, authenticated, service_role;
grant execute on function public.mvp_is_unique_text_array(text[]) to authenticated;

create table public.hydration_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  amount_ml integer not null check (amount_ml between 1 and 5000),
  occurred_at timestamptz not null default now() check (isfinite(occurred_at)),
  created_at timestamptz not null default now(),
  retry_key uuid not null,
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  unique (owner_user_id, retry_key)
);

create table public.wellness_habits (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  label text not null check (char_length(btrim(label)) between 1 and 60),
  icon text not null check (icon in ('water','reading','rest','movement','care','custom')),
  created_at timestamptz not null default now(),
  retry_key uuid not null,
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  unique (owner_user_id, retry_key)
);

create table public.wellness_habit_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  habit_id uuid not null,
  event_type text not null check (event_type in ('completed','completion_undone','archived')),
  related_event_id uuid,
  occurred_at timestamptz not null default now() check (isfinite(occurred_at)),
  created_at timestamptz not null default now(),
  retry_key uuid not null,
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  unique (id, owner_user_id, habit_id),
  unique (owner_user_id, retry_key),
  foreign key (habit_id, owner_user_id) references public.wellness_habits(id, owner_user_id),
  foreign key (related_event_id, owner_user_id, habit_id) references public.wellness_habit_events(id, owner_user_id, habit_id),
  check ((event_type = 'completion_undone' and related_event_id is not null) or
         (event_type <> 'completion_undone' and related_event_id is null))
);

create unique index wellness_habit_one_undo_per_completion
  on public.wellness_habit_events(owner_user_id, related_event_id)
  where event_type = 'completion_undone';

create function public.mvp_validate_habit_event() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.event_type = 'completion_undone' and not exists (
    select 1 from public.wellness_habit_events e
    where e.id = new.related_event_id and e.owner_user_id = new.owner_user_id
      and e.habit_id = new.habit_id and e.event_type = 'completed'
  ) then
    raise exception using errcode = '23503', message = 'Completion event unavailable';
  end if;
  return new;
end;
$$;
revoke all on function public.mvp_validate_habit_event() from public, anon, authenticated, service_role;
create trigger wellness_habit_event_validate
  before insert on public.wellness_habit_events
  for each row execute function public.mvp_validate_habit_event();

create table public.wellness_activity_preferences (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references public.profiles(user_id),
  preferences text[] not null check (
    preferences <@ array['walking','assisted','seated','gentle_movement','resting','other','none']::text[]
    and public.mvp_is_unique_text_array(preferences)
    and (not ('none' = any(preferences)) or cardinality(preferences) = 1)
  ),
  occurred_at timestamptz not null default now() check (isfinite(occurred_at)),
  created_at timestamptz not null default now(),
  retry_key uuid not null,
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  unique (id, owner_user_id),
  unique (owner_user_id, retry_key)
);

do $$
declare resource text;
begin
  foreach resource in array array['hydration_entries','wellness_habits','wellness_habit_events','wellness_activity_preferences'] loop
    execute format('alter table public.%I enable row level security', resource);
    execute format('alter table public.%I force row level security', resource);
    execute format('revoke all on public.%I from public, anon, authenticated, service_role', resource);
    execute format('grant select, insert on public.%I to authenticated', resource);
    execute format('create policy %I on public.%I for select to authenticated using (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()))', resource || '_owner_read', resource);
    execute format('create policy %I on public.%I for insert to authenticated with check (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()))', resource || '_owner_create', resource);
    execute format('create index %I on public.%I(owner_user_id, created_at desc, id)', resource || '_owner_history_idx', resource);
  end loop;
end;
$$;

create view public.wellness_habits_active with (security_invoker = true) as
select h.id, h.owner_user_id, h.label, h.icon, h.created_at
from public.wellness_habits h
where not exists (
  select 1 from public.wellness_habit_events e
  where e.habit_id = h.id and e.owner_user_id = h.owner_user_id and e.event_type = 'archived'
);
revoke all on public.wellness_habits_active from public, anon, authenticated, service_role;
grant select on public.wellness_habits_active to authenticated;

grant insert (amount_ml, occurred_at, retry_key) on public.hydration_entries to authenticated;
grant insert (label, icon, retry_key) on public.wellness_habits to authenticated;
grant insert (habit_id, event_type, related_event_id, occurred_at, retry_key) on public.wellness_habit_events to authenticated;
grant insert (preferences, occurred_at, retry_key) on public.wellness_activity_preferences to authenticated;

comment on table public.hydration_entries is 'Synthetic-only, owner-only hydration self-reports; append-only.';
comment on table public.wellness_habits is 'Synthetic-only, mother-authored personal habits; archival is represented by an event.';
comment on table public.wellness_habit_events is 'Synthetic-only append-only habit events. Never means failure when absent.';
comment on table public.wellness_activity_preferences is 'Synthetic-only snapshots of optional self-selected activity preferences.';
commit;
