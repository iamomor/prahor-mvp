-- One metadata row for SQL-editor/CLI read-only inspection. No private data rows.
select
  to_regclass('public.profiles') is not null as profiles_exists,
  to_regclass('public.access_preferences') is not null as preferences_exists,
  to_regclass('supabase_migrations.schema_migrations') is not null as migration_history_exists,
  coalesce((select jsonb_agg(tablename order by tablename) from pg_tables
    where schemaname='public'),'[]'::jsonb) as public_tables,
  coalesce((select jsonb_agg(tgname order by tgname) from pg_trigger
    where tgrelid=to_regclass('auth.users') and not tgisinternal),'[]'::jsonb) as auth_user_triggers,
  coalesce((select jsonb_agg(column_name order by column_name) from information_schema.columns
    where table_schema='auth' and table_name='users'
      and column_name in ('id','email','email_confirmed_at','is_anonymous')),'[]'::jsonb) as auth_identity_columns;
