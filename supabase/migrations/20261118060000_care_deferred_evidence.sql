-- PostgREST checks deferred constraints after a SECURITY DEFINER RPC has returned.
-- Run only this narrow evidence trigger as its trusted owner; keep app execution denied.
begin;
alter function prohor_care.check_request_evidence() owner to postgres;
alter function prohor_care.check_request_evidence() security definer;
revoke all on function prohor_care.check_request_evidence() from public,anon,authenticated,service_role;
commit;
