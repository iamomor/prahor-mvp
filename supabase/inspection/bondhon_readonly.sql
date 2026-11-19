-- Read-only preflight. Missing prerequisites mean the existing migration chain needs review.
select to_regclass('public.account_role_memberships') as account_roles,
       to_regclass('public.pregnancy_records') as private_records,
       to_regclass('prohor_care.support_requests') as care_requests,
       to_regclass('prohor_care.request_permissions') as bondhon_permissions;
select to_regprocedure('public.mvp_care_create_coordinated_request(jsonb,uuid)') as reviewed_submit,
       to_regprocedure('public.mvp_care_coordination_detail(uuid)') as request_detail,
       to_regprocedure('public.mvp_care_shareable_records()') as selectable_records;
select schemaname, tablename, rowsecurity from pg_tables
 where schemaname='prohor_care' and tablename in ('request_permissions','follow_up_messages');

-- Both new tables must enable AND force RLS, with no direct application grants.
select n.nspname as schema_name,c.relname as table_name,c.relrowsecurity,c.relforcerowsecurity,
  r.role_name,has_table_privilege(r.role_name,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') as direct_access
from pg_class c join pg_namespace n on n.oid=c.relnamespace
cross join (values ('anon'),('authenticated'),('service_role')) r(role_name)
where n.nspname='prohor_care' and c.relname in ('request_permissions','follow_up_messages') and c.relkind='r';

-- Six public coordination RPCs: authenticated=true; anon/service_role=false.
-- Legacy creation building block: ALL application roles=false after 060000.
with functions(signature) as (values
  ('public.mvp_care_create_coordinated_request(jsonb,uuid)'),
  ('public.mvp_care_owner_requests(integer,timestamptz,uuid)'),
  ('public.mvp_care_coordination_detail(uuid)'),
  ('public.mvp_care_revoke_request(uuid)'),
  ('public.mvp_care_follow_up(uuid,integer,text,uuid)'),
  ('public.mvp_care_shareable_records()'),
  ('public.mvp_care_create_request(uuid,text,text,text,uuid[],boolean,uuid)')
)
select f.signature,to_regprocedure(f.signature) is not null as exists,r.role_name,
  has_function_privilege(r.role_name,to_regprocedure(f.signature),'EXECUTE') as can_execute
from functions f cross join (values ('anon'),('authenticated'),('service_role')) r(role_name);

-- Internal helpers must not be directly callable by application roles.
select p.proname,r.role_name,has_function_privilege(r.role_name,p.oid,'EXECUTE') as can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
cross join (values ('anon'),('authenticated'),('service_role')) r(role_name)
where n.nspname='prohor_care';
