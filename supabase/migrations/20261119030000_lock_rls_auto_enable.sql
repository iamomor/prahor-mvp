-- Advisor 0028/0029: the hosted ensure_rls event-trigger function was callable via /rest/v1/rpc.
-- Event triggers fire regardless of EXECUTE grants, so revoking API access is behaviour-neutral.
-- The function exists only on the hosted project (dashboard-created), so local/test DBs skip it.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
