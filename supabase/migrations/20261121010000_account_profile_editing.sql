-- Account profile editing + fuller supporter help areas.
-- 1. prohor_update_profile: a signed-in, onboarded account edits its own name and self-reported details.
--    Details confer no role, approval or data access. Roles stay owned by onboarding/operator review.
-- 2. Supporter "scopes" are help areas the mother asks for. They label the relationship only and never
--    expose health records, reports, diary or AI conversations (nothing reads them for authorization).
-- Rollback: drop function public.prohor_update_profile(text,jsonb); restore the 2-value scopes check and
-- the previous prohor_invite_supporter body from 20261118000000_account_roles.sql (only if no row uses new values).
begin;

create function public.prohor_update_profile(p_name text, p_details jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); item record; dob date;
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id = actor for update;
  if not exists (select 1 from public.account_onboarding where user_id = actor) then
    raise exception 'Complete account setup first' using errcode = '22023'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 120 then
    raise exception 'Invalid name' using errcode = '22023'; end if;
  if p_details is null or jsonb_typeof(p_details) <> 'object' or octet_length(p_details::text) > 4096
    or p_details - array['phone','district','area','dateOfBirth','bloodGroup','emergencyName','emergencyRelation',
      'emergencyPhone','careStage','supporterType','qualification','specialty','serviceArea'] <> '{}'::jsonb then
    raise exception 'Unsupported profile fields' using errcode = '22023'; end if;
  for item in select key, value from jsonb_each(p_details) loop
    if jsonb_typeof(item.value) <> 'string' or char_length(item.value #>> '{}') >
      (case item.key when 'phone' then 32 when 'emergencyPhone' then 32 when 'district' then 100
        when 'emergencyRelation' then 60 when 'dateOfBirth' then 10 when 'bloodGroup' then 3 else 120 end) then
      raise exception 'Invalid profile field' using errcode = '22023'; end if;
  end loop;
  if coalesce(p_details->>'careStage', '') not in ('', 'planning', 'pregnant', 'postpartum', 'prefer_not_to_say')
    or coalesce(p_details->>'supporterType', '') not in ('', 'family', 'caregiver', 'supporter')
    or coalesce(p_details->>'bloodGroup', '') not in ('', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    or coalesce(p_details->>'phone', '') !~ '^[0-9+() -]*$'
    or coalesce(p_details->>'emergencyPhone', '') !~ '^[0-9+() -]*$' then
    raise exception 'Invalid profile choice' using errcode = '22023'; end if;
  if coalesce(p_details->>'dateOfBirth', '') <> '' then
    if p_details->>'dateOfBirth' !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Invalid date of birth' using errcode = '22023'; end if;
    begin dob := (p_details->>'dateOfBirth')::date;
    exception when others then raise exception 'Invalid date of birth' using errcode = '22023'; end;
    if dob > (now() at time zone 'Asia/Dhaka')::date or dob < date '1900-01-01' then
      raise exception 'Invalid date of birth' using errcode = '22023'; end if;
  end if;
  update public.profiles set display_name = btrim(p_name) where user_id = actor;
  update public.account_onboarding set details = details || p_details where user_id = actor;
  return public.prohor_account_access();
end $$;
alter function public.prohor_update_profile(text, jsonb) owner to postgres;
revoke all on function public.prohor_update_profile(text, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.prohor_update_profile(text, jsonb) to authenticated;

alter table public.supporter_connections drop constraint if exists supporter_connections_scopes_check;
alter table public.supporter_connections add constraint supporter_connections_scopes_check check (
  cardinality(scopes) between 1 and 11 and scopes <@ array['visit_preparation','appointment_company','transport',
    'medicine_reminders','nutrition_meals','household_help','emotional_support','paperwork_costs','care_coordination',
    'baby_care','emergency_contact']::text[]);

-- Same body as 20261118000000 except the allowed help areas (and a duplicate check); CREATE OR REPLACE keeps owner and grants.
create or replace function public.prohor_invite_supporter(p_supporter uuid,p_scopes text[],p_expires timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''); connection_id uuid;
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if not exists(select 1 from public.account_role_memberships where user_id=actor and role='mother' and status='approved')
    or actor=p_supporter or not exists(select 1 from public.account_role_memberships where user_id=p_supporter and role='supporter' and status='approved') then
    raise exception 'Recipient unavailable' using errcode='42501'; end if;
  if p_scopes is null or cardinality(p_scopes) not between 1 and 11
    or array_position(p_scopes,null) is not null
    or cardinality(p_scopes)<>(select count(distinct s) from unnest(p_scopes) s)
    or not(p_scopes <@ array['visit_preparation','appointment_company','transport','medicine_reminders','nutrition_meals',
      'household_help','emotional_support','paperwork_costs','care_coordination','baby_care','emergency_contact']::text[])
    or p_expires is null or not isfinite(p_expires) or p_expires<=clock_timestamp() or p_expires>clock_timestamp()+interval '30 days' then
    raise exception 'Invalid permission' using errcode='22023'; end if;
  if (select count(*) from public.supporter_connections where mother_id=actor and revoked_at is null and expires_at>now())>=20 then
    raise exception 'Revoke an existing invitation first' using errcode='22023'; end if;
  if exists(select 1 from public.supporter_connections where mother_id=actor and supporter_id=p_supporter
    and revoked_at is null and expires_at>clock_timestamp()) then
    raise exception 'An invitation or relationship already exists; revoke it before replacing it' using errcode='22023'; end if;
  insert into public.supporter_connections(mother_id,supporter_id,scopes,token_hash,expires_at)
    values(actor,p_supporter,p_scopes,encode(sha256(convert_to(token,'UTF8')),'hex'),p_expires) returning id into connection_id;
  insert into public.account_access_events(actor_id,subject_id,action,resource_id)
    values(actor,p_supporter,'supporter_invited',connection_id);
  return jsonb_build_object('id',connection_id,'code',token);
end;
$$;

commit;
