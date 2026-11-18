-- Synthetic fixtures only. Run as postgres against LOCAL Supabase with psql
-- -v ON_ERROR_STOP=1. No pgTAP dependency; any failed assertion raises an error.
begin;

create function pg_temp.assert_true(ok boolean, description text)
returns void language plpgsql as $$
begin
  if ok is distinct from true then raise exception 'FAIL: %', description; end if;
end;
$$;

create function pg_temp.expect_error(statement text, expected_state text)
returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate = expected_state then return; end if;
    raise exception 'Expected SQLSTATE %, received %: %', expected_state, sqlstate, sqlerrm;
  end;
  raise exception 'Expected SQLSTATE %, but statement succeeded: %', expected_state, statement;
end;
$$;
grant execute on function pg_temp.assert_true(boolean,text), pg_temp.expect_error(text,text)
  to authenticated, anon, service_role;

select pg_temp.assert_true((select count(*) = 2 from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in ('profiles','access_preferences')
    and c.relrowsecurity), 'both tables have RLS enabled');
select pg_temp.assert_true((select count(*) = 4 from pg_policies
  where schemaname = 'public' and tablename in ('profiles','access_preferences') and cmd in ('SELECT','UPDATE')),
  'only four explicit owner read/update policies');
select pg_temp.assert_true(not has_function_privilege('authenticated',
  'public.day2_provision_auth_user()', 'execute'), 'provisioning is not a client RPC');

-- Fictional accounts: metadata deliberately attempts provider self-promotion.
insert into auth.users (id, email, raw_user_meta_data) values
  ('d2000000-0000-4000-8000-000000000001', 'day2-mother-a@example.invalid', '{"role":"provider"}'),
  ('d2000000-0000-4000-8000-000000000002', 'day2-mother-b@example.invalid', '{}');
select pg_temp.assert_true((select count(*) = 2 from public.profiles
  where user_id in ('d2000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000002')
    and role = 'mother'), 'signup creates mothers and ignores role metadata');
select pg_temp.assert_true((select count(*) = 2 from public.access_preferences
  where user_id in ('d2000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000002')
    and schema_version = 2 and settings = public.day2_preference_defaults()), 'signup creates valid defaults');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"d2000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select pg_temp.assert_true((select count(*) = 1 from public.profiles), 'A sees only own profile');
select pg_temp.assert_true((select count(*) = 1 from public.access_preferences), 'A sees only own preferences');
update public.profiles set display_name = 'Fictional Mother A' returning user_id;
update public.access_preferences set settings = settings || '{"language":"en","textScale":"extra-large","spaciousLayout":true,"highContrast":true,"reducedMotion":true,"simplifiedContent":true,"communication":"aac"}' returning user_id;
select pg_temp.assert_true((select display_name = 'Fictional Mother A' and updated_at > created_at
  from public.profiles), 'own profile update succeeds and timestamp advances');
select pg_temp.assert_true((select settings->>'communication' = 'aac' and settings->>'language' = 'en'
  and updated_at > created_at from public.access_preferences), 'own preferences update succeeds');
with changed as (update public.profiles set display_name = 'Intrusion'
  where user_id = 'd2000000-0000-4000-8000-000000000002' returning *)
select pg_temp.assert_true((select count(*) = 0 from changed), 'A cannot update B profile');
with changed as (update public.access_preferences set settings = public.day2_preference_defaults()
  where user_id = 'd2000000-0000-4000-8000-000000000002' returning *)
select pg_temp.assert_true((select count(*) = 0 from changed), 'A cannot update B preferences');

select pg_temp.expect_error('update public.profiles set role = ''provider''', '42501');
select pg_temp.expect_error('update public.profiles set user_id = ''d2000000-0000-4000-8000-000000000002''', '42501');
select pg_temp.expect_error('update public.access_preferences set user_id = ''d2000000-0000-4000-8000-000000000002''', '42501');
select pg_temp.expect_error('update public.profiles set created_at = now()', '42501');
select pg_temp.expect_error('update public.access_preferences set updated_at = now()', '42501');
select pg_temp.expect_error('update public.access_preferences set schema_version = 1', '42501');
select pg_temp.expect_error('insert into public.profiles (user_id,role) values (''d2000000-0000-4000-8000-000000000001'',''provider'')', '42501');
select pg_temp.expect_error('insert into public.access_preferences (user_id) values (''d2000000-0000-4000-8000-000000000002'')', '42501');
select pg_temp.expect_error('delete from public.profiles', '42501');
select pg_temp.expect_error('delete from public.access_preferences', '42501');
select pg_temp.expect_error('update public.profiles set display_name = repeat(''x'',121)', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = ''{}''', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = settings || ''{"role":"provider"}''', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = settings || ''{"textScale":"huge"}''', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = settings || ''{"language":null}''', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = settings || ''{"highContrast":"true"}''', '23514');
select pg_temp.expect_error('update public.access_preferences set settings = ''[]''', '23514');
do $$
declare key text;
begin
  foreach key in array array['highContrast','spaciousLayout','reducedMotion','simplifiedContent','readAloud']
  loop
    perform pg_temp.expect_error(format(
      'update public.access_preferences set settings = settings || jsonb_build_object(%L, null)', key), '23514');
  end loop;
  foreach key in array array['theme','textScale','language','communication','textSpacing']
  loop
    perform pg_temp.expect_error(format(
      'update public.access_preferences set settings = settings || jsonb_build_object(%L, %L)', key, 'unsupported'), '23514');
  end loop;
end;
$$;

-- Reverse direction, including an approved provider: role never bypasses RLS.
reset role;
set local role service_role;
update public.profiles set role = 'provider' where user_id = 'd2000000-0000-4000-8000-000000000002';
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"d2000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select pg_temp.assert_true((select count(*) = 1 and bool_and(role = 'provider') from public.profiles), 'B provider sees own profile only');
select pg_temp.assert_true((select count(*) = 1 and bool_and(settings = public.day2_preference_defaults())
  from public.access_preferences), 'B cannot read A preferences or see modified defaults');
update public.profiles set display_name = 'Fictional Provider B';
update public.access_preferences set settings = settings || '{"language":"en"}';
with changed as (update public.profiles set display_name = 'Intrusion'
  where user_id = 'd2000000-0000-4000-8000-000000000001' returning *)
select pg_temp.assert_true((select count(*) = 0 from changed), 'B cannot update A profile');
with changed as (update public.access_preferences set settings = public.day2_preference_defaults()
  where user_id = 'd2000000-0000-4000-8000-000000000001' returning *)
select pg_temp.assert_true((select count(*) = 0 from changed), 'B cannot update A preferences');
select pg_temp.expect_error('update public.profiles set role = ''mother''', '42501');

-- Authenticated without a subject also has no rows.
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);
select pg_temp.assert_true((select count(*) = 0 from public.profiles), 'missing subject denies profiles');
select pg_temp.assert_true((select count(*) = 0 from public.access_preferences), 'missing subject denies preferences');
set local role anon;
select pg_temp.expect_error('select * from public.profiles', '42501');
select pg_temp.expect_error('select * from public.access_preferences', '42501');
select pg_temp.expect_error('update public.profiles set display_name = ''Intrusion''', '42501');
select pg_temp.expect_error('update public.access_preferences set settings = ''{}''', '42501');

reset role;
select pg_temp.expect_error('update public.profiles set role = ''admin''', '23514');
select pg_temp.expect_error('insert into public.profiles (user_id) values (''d2000000-0000-4000-8000-000000000099'')', '23503');
select pg_temp.expect_error('insert into public.access_preferences (user_id) values (''d2000000-0000-4000-8000-000000000099'')', '23503');
delete from auth.users where id = 'd2000000-0000-4000-8000-000000000002';
select pg_temp.assert_true(not exists(select from public.profiles where user_id = 'd2000000-0000-4000-8000-000000000002'), 'auth deletion cascades profile');
select pg_temp.assert_true(not exists(select from public.access_preferences where user_id = 'd2000000-0000-4000-8000-000000000002'), 'auth deletion cascades preferences');

rollback;
