-- Application revision/retry conflicts must not trigger PostgREST serialization retries.
begin;
create or replace function prohor_care.fail(state text) returns void
language plpgsql set search_path='' as $$
begin
  raise exception using errcode=case
    when state in ('22023','23514','23502','22P02','22008') then '22023'
    when state='23503' then 'P0002'
    when state in ('40001','PT409') then 'PT409'
    when state in ('42501','P0002') then state else 'P0001' end,
    message=case when state='42501' then 'Access denied'
      when state in ('23503','P0002') then 'Resource unavailable'
      when state in ('40001','PT409') then 'Revision or retry conflict'
      when state in ('22023','23514','23502','22P02','22008') then 'Invalid request'
      else 'Care service unavailable' end;
end;
$$;
revoke all on function prohor_care.fail(text) from public,anon,authenticated,service_role;
commit;
