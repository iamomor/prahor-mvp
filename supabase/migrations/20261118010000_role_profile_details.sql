-- Additional self-declared profile fields. Does not approve roles or share data.
begin;
alter table public.account_onboarding add column details jsonb not null default '{}'::jsonb;

create function public.prohor_role_profile_ready() returns integer
language sql immutable set search_path='' as $$ select 1; $$;

create function public.prohor_save_role_profile(p_name text,p_purposes text[],p_organization text,p_registration text,p_details jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item record; result jsonb;
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if p_details is null or jsonb_typeof(p_details)<>'object' or octet_length(p_details::text)>4096
    or p_details-array['phone','district','careStage','supporterType','qualification','specialty','serviceArea']<>'{}'::jsonb then
    raise exception 'Unsupported profile fields' using errcode='22023'; end if;
  for item in select key,value from jsonb_each(p_details) loop
    if jsonb_typeof(item.value)<>'string' or char_length(item.value#>>'{}')>
      (case item.key when 'phone' then 32 when 'district' then 100 else 120 end) then
      raise exception 'Invalid profile field' using errcode='22023'; end if;
  end loop;
  if coalesce(p_details->>'careStage','') not in ('','planning','pregnant','postpartum','prefer_not_to_say')
    or coalesce(p_details->>'supporterType','') not in ('','family','caregiver','supporter') then
    raise exception 'Invalid profile choice' using errcode='22023'; end if;
  -- Existing onboarding owns role grants. Details here confer no extra authority.
  result:=public.prohor_complete_onboarding(p_name,p_purposes,p_organization,p_registration);
  update public.account_onboarding set details=p_details where user_id=actor;
  return result || jsonb_build_object('details',p_details);
end;
$$;

create or replace function public.prohor_account_access() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); p public.profiles; result jsonb;
begin
  if actor is null or not exists(select 1 from auth.users where id=actor and email is not null
    and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then
    raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict p from public.profiles where user_id=actor;
  result:=jsonb_build_object('userId',actor,'displayName',p.display_name,
    'activeRole',case when exists(select 1 from public.account_role_memberships
      where user_id=actor and role=p.role and status='approved') then p.role else 'member' end,
    'onboarded',exists(select 1 from public.account_onboarding where user_id=actor),
    'details',coalesce((select details from public.account_onboarding where user_id=actor),'{}'::jsonb),
    'roles',coalesce((select jsonb_agg(jsonb_build_object('role',role,'status',status) order by role)
      from public.account_role_memberships where user_id=actor),'[]'::jsonb),
    'provider',(select jsonb_build_object('kinds',kinds,'organization',organization,
      'registrationNumber',registration_number,'status',status,'mode',mode)
      from public.provider_applications where user_id=actor));
  return result;
end;
$$;
alter function public.prohor_role_profile_ready() owner to postgres;
alter function public.prohor_save_role_profile(text,text[],text,text,jsonb) owner to postgres;
revoke all on function public.prohor_role_profile_ready(),public.prohor_save_role_profile(text,text[],text,text,jsonb)
  from public,anon,authenticated,service_role;
grant execute on function public.prohor_role_profile_ready() to anon,authenticated;
grant execute on function public.prohor_save_role_profile(text,text[],text,text,jsonb) to authenticated;
commit;
