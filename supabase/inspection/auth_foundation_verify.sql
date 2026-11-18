-- Read-only post-application metadata. Requires the migration history relation.
select
  coalesce((select jsonb_agg(version order by version) from supabase_migrations.schema_migrations),'[]'::jsonb) as applied_versions,
  coalesce((select jsonb_agg(tablename order by tablename) from pg_tables where schemaname='public'),'[]'::jsonb) as public_tables,
  coalesce((select jsonb_agg(jsonb_build_object('table',c.relname,'rls',c.relrowsecurity) order by c.relname)
    from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public'
    and c.relname in ('profiles','access_preferences')),'[]'::jsonb) as foundation_rls,
  coalesce((select jsonb_agg(jsonb_build_object('table',tablename,'policy',policyname,'command',cmd,'using',qual,'check',with_check) order by tablename,policyname)
    from pg_policies where schemaname='public' and tablename in ('profiles','access_preferences')),'[]'::jsonb) as foundation_policies,
  coalesce((select jsonb_agg(tgname order by tgname) from pg_trigger where tgrelid=to_regclass('auth.users') and not tgisinternal),'[]'::jsonb) as auth_user_triggers,
  coalesce((select jsonb_agg(jsonb_build_object('name',p.proname,'owner',pg_get_userbyid(p.proowner),
    'securityDefiner',p.prosecdef,'settings',p.proconfig,'anonymousExecute',has_function_privilege('anon',p.oid,'EXECUTE'),
    'authenticatedExecute',has_function_privilege('authenticated',p.oid,'EXECUTE')) order by p.proname)
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
    and p.proname in ('day2_provision_auth_user','patch_access_preferences')),'[]'::jsonb) as foundation_functions,
  jsonb_build_object(
    'profileRoleUpdate',has_column_privilege('authenticated','public.profiles','role','UPDATE'),
    'profileOwnerUpdate',has_column_privilege('authenticated','public.profiles','user_id','UPDATE'),
    'profileInsert',has_table_privilege('authenticated','public.profiles','INSERT'),
    'profileDelete',has_table_privilege('authenticated','public.profiles','DELETE'),
    'displayNameUpdate',has_column_privilege('authenticated','public.profiles','display_name','UPDATE'),
    'preferenceSettingsUpdate',has_column_privilege('authenticated','public.access_preferences','settings','UPDATE'),
    'preferenceOwnerUpdate',has_column_privilege('authenticated','public.access_preferences','user_id','UPDATE'),
    'preferenceDelete',has_table_privilege('authenticated','public.access_preferences','DELETE')) as client_privileges;
