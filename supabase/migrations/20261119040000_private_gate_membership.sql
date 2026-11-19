-- Fix: 20261119010000/020000 gated on the scalar profiles.role, which OR-bypassed the
-- membership/email gate (mvp_private_is_mother) added in 20261118050000. Revoked or
-- unconfirmed mothers could still read and write private records. Forward-only repair.
begin;

-- 1. Redundant owner-read policies: the *_owner_read policies already cover these tables.
drop policy jr_pregnancy_owner_read on public.pregnancy_records;
drop policy jr_baby_records_owner_read on public.baby_records;
drop policy jr_health_observations_owner_read on public.health_observations;
drop policy jr_baby_observations_owner_read on public.baby_observations;
drop policy jr_maternal_conditions_owner_read on public.maternal_conditions;
drop policy jr_maternal_symptom_notes_owner_read on public.maternal_symptom_notes;

-- 2. New tables use the same membership gate as every other private record.
drop policy jr_corrections_owner_read on public.jr_observation_corrections;
create policy jr_corrections_owner_read on public.jr_observation_corrections for select to authenticated
  using (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()));
drop policy jr_visits_owner_read on public.jr_visits;
create policy jr_visits_owner_read on public.jr_visits for select to authenticated
  using (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()));
drop policy bujhi_review_owner_read on public.bujhi_document_reviews;
create policy bujhi_review_owner_read on public.bujhi_document_reviews for select to authenticated
  using (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()));

-- 3. SECURITY DEFINER writers: swap only the authorization gate, keeping bodies byte-identical otherwise.
do $$
declare
  fn regprocedure;
  old_def text;
  new_def text;
  old_gate constant text := 'not exists (select 1 from public.profiles where user_id = me and role = ''mother'')';
begin
  foreach fn in array array[
    'public.jr_save(text,jsonb,uuid)'::regprocedure,
    'public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date)'::regprocedure]
  loop
    old_def := pg_get_functiondef(fn);
    new_def := replace(old_def, old_gate, 'not public.mvp_private_is_mother()');
    if new_def = old_def then raise exception 'authorization gate not found in %', fn; end if;
    execute new_def;
  end loop;
end $$;
commit;
