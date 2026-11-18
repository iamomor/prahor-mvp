-- Step 13: no new tables/columns; allow only own missing-row creation.
begin;
grant insert (user_id, settings) on public.access_preferences to authenticated;
create policy access_preferences_insert_own on public.access_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Keep ETag versions distinct even if the system clock has low resolution or
-- moves backwards. This changes only the preference timestamp trigger.
create function public.adapt_touch_preference_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end;
$$;
drop trigger access_preferences_touch_updated_at on public.access_preferences;
create trigger access_preferences_touch_updated_at before update on public.access_preferences
  for each row execute function public.adapt_touch_preference_timestamp();
revoke all on function public.adapt_touch_preference_timestamp() from public, anon, authenticated, service_role;

-- Invoker permissions + existing RLS apply to EVERY statement in this function.
-- No user UUID parameter, privileged credentials or SECURITY DEFINER bypass.
create function public.patch_access_preferences(
  p_patch jsonb,
  p_expected_updated_at timestamptz default null,
  p_check_version boolean default false
)
returns table (settings jsonb, updated_at timestamptz, schema_version integer)
language plpgsql security invoker set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_created_id uuid;
  v_current public.access_preferences%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if jsonb_typeof(p_patch) is distinct from 'object' or p_patch = '{}'::jsonb then
    raise exception using errcode = '22023', message = 'Invalid preference patch';
  end if;
  if not public.day2_valid_preferences(public.day2_preference_defaults() || p_patch) then
    raise exception using errcode = '22023', message = 'Invalid preference patch';
  end if;

  insert into public.access_preferences (user_id) values (v_user_id)
    on conflict (user_id) do nothing returning user_id into v_created_id;
  select a.* into strict v_current from public.access_preferences a
    where a.user_id = v_user_id for update;

  if p_check_version and (
    (p_expected_updated_at is null and v_created_id is null) or
    (p_expected_updated_at is not null and (v_created_id is not null or
      v_current.updated_at is distinct from p_expected_updated_at))
  ) then
    raise exception using errcode = '40001', message = 'Preferences changed; reload before saving';
  end if;
  return query update public.access_preferences a
    set settings = v_current.settings || p_patch
    where a.user_id = v_user_id
    returning a.settings, a.updated_at, a.schema_version;
end;
$$;
revoke all on function public.patch_access_preferences(jsonb,timestamptz,boolean)
  from public, anon, service_role;
grant execute on function public.patch_access_preferences(jsonb,timestamptz,boolean)
  to authenticated;
commit;
