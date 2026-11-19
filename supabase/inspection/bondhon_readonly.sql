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
