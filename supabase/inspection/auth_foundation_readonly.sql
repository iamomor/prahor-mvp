-- Operator inspection only. Run in the intended project's trusted SQL editor.
-- No data/DDL changes, no Auth user rows, secrets or personal records are read.
-- Paste the SQL CONTENTS, not this file's path. Multiple result sets/notices follow.
begin read only;

select current_database() as database_name, current_user as inspection_role;
select to_regclass('public.profiles') is not null as profiles_exists,
  to_regclass('public.access_preferences') is not null as preferences_exists,
  to_regclass('supabase_migrations.schema_migrations') is not null as migration_history_exists;

select column_name, data_type from information_schema.columns
where table_schema='auth' and table_name='users'
  and column_name in ('id','email','email_confirmed_at','is_anonymous') order by column_name;

select c.relname as table_name, c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'access_preferences');

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
  and tablename in ('profiles', 'access_preferences') order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('profiles', 'access_preferences')
order by table_name, grantee, privilege_type;

select table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name in ('profiles', 'access_preferences')
order by table_name, column_name, grantee, privilege_type;

select n.nspname as schema_name, p.proname as function_name,
  p.prosecdef as security_definer, p.proconfig as function_settings,
  p.proacl as execution_grants
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in
  ('day2_provision_auth_user', 'patch_access_preferences', 'adapt_touch_preference_timestamp');

select t.tgname as trigger_name, pg_get_triggerdef(t.oid) as trigger_definition
from pg_trigger t where t.tgrelid = to_regclass('auth.users') and not t.tgisinternal;

do $$
declare versions text;
begin
  if to_regclass('supabase_migrations.schema_migrations') is null then
    raise notice 'Migration history relation absent; no migration application is authorized by this inspection.';
  else
    execute 'select string_agg(version::text, '', '' order by version) from supabase_migrations.schema_migrations'
      into versions;
    raise notice 'Recorded migration versions: %', coalesce(versions, '(empty)');
  end if;
end;
$$;
rollback;
