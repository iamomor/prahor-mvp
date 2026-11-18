-- Self-service onboarding grants exactly one role. Redefines the function only to tighten
-- the purposes cardinality (was 1..4); ownership and grants are unchanged by CREATE OR REPLACE.
begin;
create or replace function public.prohor_complete_onboarding(p_name text,p_purposes text[],p_organization text,p_registration text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); purpose text; selected_role text; kinds text[];
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if char_length(btrim(p_name)) not between 1 and 120 or p_name is null
    or p_purposes is null or cardinality(p_purposes)<>1
    or not(p_purposes <@ array['mother','supporter','doctor','chw']::text[])
    or array_position(p_purposes,null) is not null
    or char_length(coalesce(p_organization,''))>160 or char_length(coalesce(p_registration,''))>100 then
    raise exception 'Invalid profile' using errcode='22023'; end if;
  select coalesce(array_agg(x order by x),'{}'::text[]) into kinds
    from (select distinct unnest(p_purposes) x) s where x in ('doctor','chw');
  if cardinality(kinds)>0 and (char_length(btrim(coalesce(p_organization,'')))=0
    or ('doctor'=any(kinds) and char_length(btrim(coalesce(p_registration,'')))=0)) then
    raise exception 'Professional details required' using errcode='22023'; end if;
  if exists(select 1 from public.account_onboarding where user_id=actor) then
    return public.prohor_account_access(); end if;
  foreach purpose in array p_purposes loop
    selected_role:=case when purpose in ('doctor','chw') then 'provider' else purpose end;
    insert into public.account_role_memberships(user_id,role,status)
      values(actor,selected_role,case when selected_role='provider' then 'pending' else 'approved' end)
      on conflict(user_id,role) do nothing;
  end loop;
  if cardinality(kinds)>0 then
    insert into public.provider_applications(user_id,kinds,organization,registration_number,status)
      values(actor,kinds,btrim(p_organization),btrim(coalesce(p_registration,'')),
        case when exists(select 1 from public.account_role_memberships where user_id=actor
          and role='provider' and status='approved') then 'approved' else 'pending' end)
      on conflict do nothing;
  end if;
  update public.profiles set display_name=btrim(p_name),role=coalesce(
    (select m.role from public.account_role_memberships m where m.user_id=actor and m.status='approved'
      order by case m.role when 'mother' then 1 when 'supporter' then 2 else 3 end limit 1),'member')
    where user_id=actor;
  insert into public.account_onboarding(user_id) values(actor);
  insert into public.account_access_events(actor_id,subject_id,action) values(actor,actor,'onboard');
  return public.prohor_account_access();
end;
$$;
commit;
