-- Local synthetic SQL regressions, not evidence of live Auth sessions.
begin;
create function pg_temp.expect_state(statement text, expected text)
returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate = expected then return; end if;
    raise exception 'Expected %, received %', expected, sqlstate;
  end;
  raise exception 'Expected SQLSTATE % but operation succeeded', expected;
end;
$$;
create function pg_temp.require(ok boolean, description text)
returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', description; end if; end;
$$;
grant execute on function pg_temp.expect_state(text,text), pg_temp.require(boolean,text) to authenticated, anon;

insert into auth.users (id,email) values
 ('d2130000-0000-4000-8000-000000000001','ayesha-preferences@example.invalid'),
 ('d2130000-0000-4000-8000-000000000002','nusrat-preferences@example.invalid');
-- Simulate a missing row without granting users DELETE.
delete from public.access_preferences where user_id='d2130000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','d2130000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"d2130000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select * from public.patch_access_preferences('{"textScale":"large","theme":"original-rose","communication":"aac"}',null,true);
select pg_temp.require((select count(*)=1 and bool_and(settings->>'textScale'='large') from public.access_preferences),'secure missing-row creation');
select * from public.patch_access_preferences('{"language":"en"}');
select pg_temp.require((select settings->>'textScale'='large' and settings->>'theme'='original-rose'
  and settings->>'communication'='aac' and settings->>'language'='en' from public.access_preferences),'partial patch preserves all unrelated fields');
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"userId":"d2130000-0000-4000-8000-000000000002"}'')','22023');
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"textScale":"huge"}'')','22023');
select pg_temp.expect_state('select * from public.patch_access_preferences(''{}'')','22023');
select pg_temp.expect_state('select * from public.patch_access_preferences(''[]'')','22023');
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"language":"bn"}'',null,true)','40001');
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"language":"bn"}'',''2000-01-01T00:00:00Z'',true)','40001');
do $$ declare version timestamptz; begin
 select updated_at into version from public.access_preferences;
 perform public.patch_access_preferences('{"highContrast":true}',version,true);
 begin
   perform public.patch_access_preferences('{"theme":"morning-mist"}',version,true);
   raise exception 'Stale update unexpectedly succeeded';
 exception when serialization_failure then null; end;
end; $$;
select pg_temp.require((select settings->>'theme'='original-rose' and settings->>'highContrast'='true' from public.access_preferences),'stale writes roll back');

select set_config('request.jwt.claim.sub','d2130000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"d2130000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select pg_temp.require((select count(*)=1 and bool_and(settings->>'textScale'='default') from public.access_preferences),'Nusrat sees only her defaults');
select * from public.patch_access_preferences('{"textScale":"extra-large"}');
select pg_temp.require(not exists(select from public.access_preferences where user_id='d2130000-0000-4000-8000-000000000001'),'Nusrat cannot select Ayesha');
select pg_temp.expect_state('insert into public.access_preferences(user_id) values(''d2130000-0000-4000-8000-000000000001'')','42501');
select pg_temp.expect_state('update public.access_preferences set user_id=''d2130000-0000-4000-8000-000000000001''','42501');

select set_config('request.jwt.claim.sub','d2130000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"d2130000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select pg_temp.require((select settings->>'textScale'='large' from public.access_preferences),'Ayesha unchanged across identity switch');
reset role;
delete from public.access_preferences where user_id='d2130000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"language":"en"}'',''2000-01-01T00:00:00Z'',true)','40001');
select pg_temp.require(not exists(select from public.access_preferences),'failed conditional creation leaves no row');
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{}',true);
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"language":"en"}'')','42501');
set local role anon;
select pg_temp.expect_state('select * from public.patch_access_preferences(''{"language":"en"}'')','42501');
reset role;
select pg_temp.require((select not prosecdef from pg_proc where oid='public.patch_access_preferences(jsonb,timestamptz,boolean)'::regprocedure),'RPC never bypasses RLS');
delete from public.access_preferences where user_id='d2130000-0000-4000-8000-000000000002';
insert into public.access_preferences(user_id,updated_at) values('d2130000-0000-4000-8000-000000000002','2080-01-01T00:00:00Z');
set local role authenticated;
select set_config('request.jwt.claim.sub','d2130000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"d2130000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select * from public.patch_access_preferences('{"language":"en"}','2080-01-01T00:00:00Z',true);
select pg_temp.require((select updated_at > '2080-01-01T00:00:00Z'::timestamptz from public.access_preferences),'ETag version advances despite clock skew');
rollback;
