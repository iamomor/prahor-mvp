-- Metadata only. Run with CLI --read-only; no patient rows, writes or RPC calls.
select wanted.schema_name, wanted.table_name,
  c.oid is not null as present,
  coalesce(c.relrowsecurity,false) as rls,
  coalesce(c.relforcerowsecurity,false) as forced_rls,
  case when c.oid is null then null else has_table_privilege('anon',c.oid,'SELECT') end as anon_select,
  case when c.oid is null then null else has_table_privilege('authenticated',c.oid,'SELECT') end as authenticated_select
from (values
  ('public','pregnancy_records'),('public','baby_records'),('public','maternal_conditions'),
  ('public','health_observations'),('public','baby_observations'),('public','maternal_symptom_notes'),
  ('public','wellness_entries'),('public','wellness_diary_entries'),
  ('prohor_care','provider_approvals'),('prohor_care','consent_grants'),
  ('prohor_care','support_requests'),('prohor_care','request_grants'),
  ('prohor_care','assignments'),('prohor_care','queue_receipts'),
  ('prohor_care','request_events'),('prohor_care','response_messages'),
  ('prohor_care','mutation_receipts'),('prohor_care','audit_events')
) wanted(schema_name,table_name)
left join pg_namespace n on n.nspname=wanted.schema_name
left join pg_class c on c.relnamespace=n.oid and c.relname=wanted.table_name and c.relkind='r'
order by wanted.schema_name,wanted.table_name;

select p.proname,pg_get_function_identity_arguments(p.oid) as signature,
  p.prosecdef as security_definer,pg_get_userbyid(p.proowner) as owner,p.proconfig as settings,
  has_function_privilege('anon',p.oid,'EXECUTE') as anonymous_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
  'mvp_care_recipients','mvp_care_create_consent','mvp_care_revoke_consent',
  'mvp_care_create_request','mvp_care_get_request','mvp_care_provider_requests',
  'mvp_care_request_events','mvp_care_acknowledge','mvp_care_respond','mvp_care_close')
order by p.proname;
