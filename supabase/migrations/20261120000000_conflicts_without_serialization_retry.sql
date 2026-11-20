-- Application conflicts must not use SQLSTATE 40001: PostgREST treats it as a
-- serialization failure and retries the transaction until the gateway times out
-- (~125 s) instead of returning 409. PT409 maps straight to HTTP 409, matching
-- prohor_care.fail() from 20261118070000_care_conflict_http_status.
-- Only the errcode literal changes; CREATE OR REPLACE keeps owner, SECURITY
-- DEFINER/INVOKER, search_path and grants. Rollback: same block with the
-- literals swapped.
begin;
do $$
declare
  fn regprocedure;
  def text;
begin
  foreach fn in array array[
    'public.patch_access_preferences(jsonb,timestamptz,boolean)'::regprocedure,
    'public.jr_save(text,jsonb,uuid)'::regprocedure,
    'public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date)'::regprocedure
  ] loop
    def := pg_get_functiondef(fn);
    if position('''40001''' in def) = 0 then
      raise exception 'expected a 40001 conflict in %', fn;
    end if;
    execute replace(def, '''40001''', '''PT409''');
    if position('''40001''' in pg_get_functiondef(fn)) > 0 then
      raise exception '40001 still present in %', fn;
    end if;
  end loop;
end;
$$;
commit;
