-- Bondhon request-bound consent and coordination. Apply after the existing care chain.
-- All identities, records and provider responses remain synthetic/simulated.
begin;
create table prohor_care.request_permissions (
  request_id uuid primary key references prohor_care.support_requests(id),
  terms_version text not null check (terms_version='bondhon-demo-2026-11-19'),
  expires_at timestamptz not null check(isfinite(expires_at)),
  allow_replies boolean not null,
  language text not null check(language in ('bn','en')),
  accommodations text[] not null check(accommodations <@ array['written','interpreter','step_free','quiet','easy_read','support_person']::text[]),
  selection jsonb not null,
  approved_at timestamptz not null default clock_timestamp(), revoked_at timestamptz,
  version integer not null default 1 check(version>0)
);
create table prohor_care.follow_up_messages (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references prohor_care.support_requests(id),
  sender_user_id uuid not null references public.profiles(user_id), sender_role text not null check(sender_role in ('mother','provider')),
  message text not null check(char_length(message) between 1 and 2000 and message=btrim(message)),
  sent_at timestamptz not null default clock_timestamp(), retry_key uuid not null,
  policy_version integer not null check(policy_version>0), input_revision integer not null check(input_revision>0),
  unique(sender_user_id,retry_key)
);
alter table prohor_care.audit_events drop constraint audit_events_action_check;
alter table prohor_care.audit_events add constraint audit_events_action_check check(action in (
  'consent.created','consent.revoked','request.delivered','request.acknowledged','request.responded','request.closed',
  'request.owner_read','request.provider_read','request.events_read','request.permission_revoked','request.follow_up'));
alter table prohor_care.audit_events add column policy_version integer;
create function prohor_care.audit_policy_version() returns trigger language plpgsql set search_path='' as $$
begin
  select p.version into new.policy_version from prohor_care.request_permissions p where p.request_id=new.resource_id;
  return new;
end; $$;
create trigger bondhon_audit_policy before insert on prohor_care.audit_events
  for each row execute function prohor_care.audit_policy_version();
create function prohor_care.permission_dto(request_id uuid) returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('termsVersion',p.terms_version,'expiresAt',p.expires_at,'allowReplies',p.allow_replies,
    'language',p.language,'accommodations',p.accommodations,'approvedAt',p.approved_at,'revokedAt',p.revoked_at,'version',p.version)
    from prohor_care.request_permissions p where p.request_id=$1;
$$;
-- Preserve the established DTOs for old requests. Extend new receipts only.
alter function prohor_care.owner_dto(prohor_care.support_requests) rename to legacy_owner_dto;
create function prohor_care.owner_dto(r prohor_care.support_requests) returns jsonb language sql stable set search_path='' as $$
  select prohor_care.legacy_owner_dto(r) || case when prohor_care.permission_dto(r.id) is null then '{}'::jsonb
    else jsonb_build_object('coordination',prohor_care.permission_dto(r.id)) end;
$$;
alter function prohor_care.provider_summary(prohor_care.support_requests) rename to legacy_provider_summary;
create function prohor_care.provider_summary(r prohor_care.support_requests) returns jsonb language sql stable set search_path='' as $$
  select prohor_care.legacy_provider_summary(r) || case when prohor_care.permission_dto(r.id) is null then '{}'::jsonb
    else jsonb_build_object('coordination',prohor_care.permission_dto(r.id),'purpose',r.purpose) end;
$$;
-- SQL-language provider_dto may retain the old function OID. Rebind explicitly.
create or replace function prohor_care.provider_dto(r prohor_care.support_requests)
returns jsonb language sql stable set search_path='' as $$
  select prohor_care.provider_summary(r) || jsonb_build_object('consentedRecords',coalesce((
    select jsonb_agg(prohor_care.shared_projection(c) order by c.id) from prohor_care.consent_grants c
      join prohor_care.request_grants l on l.grant_id=c.id where l.request_id=r.id),'[]'::jsonb));
$$;
alter function prohor_care.provider_access(prohor_care.support_requests,uuid) rename to record_access;
create function prohor_care.provider_access(r prohor_care.support_requests,provider_id uuid)
returns boolean language plpgsql set search_path='' as $$
declare p prohor_care.request_permissions;
begin
  if not prohor_care.record_access(r,provider_id) then return false; end if;
  select * into p from prohor_care.request_permissions where request_id=r.id for share;
  return not found or (p.revoked_at is null and p.expires_at>clock_timestamp());
end; $$;
-- Reply permission also applies to the original provider response endpoint.
create function prohor_care.check_reply_permission() returns trigger language plpgsql set search_path='' as $$
begin
  if exists(select 1 from prohor_care.request_permissions p where p.request_id=new.request_id
    and (not p.allow_replies or p.revoked_at is not null or p.expires_at<=clock_timestamp())) then
    raise exception using errcode='42501',message='Access denied'; end if;
  return new;
end; $$;
create trigger bondhon_response_permission before insert on prohor_care.response_messages
  for each row execute function prohor_care.check_reply_permission();

create function public.mvp_care_create_coordinated_request(p_payload jsonb,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); input jsonb:=p_payload; c jsonb:=input->'coordination';
  r prohor_care.support_requests; prior prohor_care.request_permissions; item jsonb; g jsonb; result jsonb;
  grant_ids uuid[]:='{}'; expiry timestamptz; selected jsonb;
begin
  if input is null or jsonb_typeof(input)<>'object' or c is null or jsonb_typeof(c)<>'object'
    or input->'reviewConfirmed' is distinct from 'true'::jsonb
    or input->'consentGrantIds' is distinct from '[]'::jsonb
    or c->>'termsVersion' is distinct from 'bondhon-demo-2026-11-19'
    or jsonb_typeof(c->'allowReplies') is distinct from 'boolean'
    or c->>'language' not in ('en','bn') or c->>'language' is null
    or jsonb_typeof(c->'records') is distinct from 'array' or jsonb_array_length(c->'records')>20
    or jsonb_typeof(c->'accommodations') is distinct from 'array' or jsonb_array_length(c->'accommodations')>6
    or exists(select 1 from jsonb_array_elements_text(c->'accommodations') a where a not in ('written','interpreter','step_free','quiet','easy_read','support_person'))
    or exists(select 1 from jsonb_object_keys(input) k where k not in ('recipientUserId','message','method','purpose','consentGrantIds','reviewConfirmed','coordination'))
    or exists(select 1 from jsonb_object_keys(c) k where k not in ('termsVersion','expiresAt','allowReplies','language','accommodations','records'))
    then raise exception using errcode='22023',message='Invalid request'; end if;
  expiry:=(c->>'expiresAt')::timestamptz;
  if expiry is null or not isfinite(expiry) then raise exception using errcode='22023',message='Invalid expiry'; end if;
  -- Canonical selection excludes clinical values; scopes only. Same key is reusable only for identical consent.
  selected:=c->'records';
  perform prohor_care.lock_retry(actor_id,'request.create',p_idempotency_key);
  select s.* into r from prohor_care.mutation_receipts m join prohor_care.support_requests s on s.id=m.request_id
    where m.actor_user_id=actor_id and m.operation='request.create' and m.idempotency_key=p_idempotency_key for update of s;
  if found then
    select * into prior from prohor_care.request_permissions where request_id=r.id;
    if not found or (r.recipient_user_id,r.message,r.method,r.purpose,prior.expires_at,prior.allow_replies,prior.language,prior.accommodations,prior.selection)
      is distinct from ((input->>'recipientUserId')::uuid,btrim(input->>'message'),input->>'method',btrim(input->>'purpose'),expiry,
        (c->>'allowReplies')::boolean,c->>'language',array(select jsonb_array_elements_text(c->'accommodations')),selected)
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    return prohor_care.owner_dto(r);
  end if;
  if expiry<=clock_timestamp() or expiry>clock_timestamp()+interval '30 days' then
    raise exception using errcode='22023',message='Invalid expiry'; end if;
  if (select count(*) from jsonb_array_elements(selected))<>(select count(distinct (v->>'type',v->>'id')) from jsonb_array_elements(selected) v)
    then raise exception using errcode='22023',message='Duplicate scope'; end if;
  for item in select * from jsonb_array_elements(selected) loop
    if exists(select 1 from jsonb_object_keys(item) k where k not in ('type','id','fields')) then
      raise exception using errcode='22023',message='Invalid scope'; end if;
    g:=public.mvp_care_create_consent((input->>'recipientUserId')::uuid,item->>'type',(item->>'id')::uuid,
      array(select jsonb_array_elements_text(item->'fields')),btrim(input->>'purpose'),clock_timestamp(),expiry,true,
      md5(p_idempotency_key::text || (item->>'type') || (item->>'id'))::uuid);
    grant_ids:=array_append(grant_ids,(g->>'id')::uuid);
  end loop;
  result:=public.mvp_care_create_request((input->>'recipientUserId')::uuid,input->>'message',input->>'method',input->>'purpose',grant_ids,true,p_idempotency_key);
  select * into strict r from prohor_care.support_requests where id=(result->>'id')::uuid;
  insert into prohor_care.request_permissions(request_id,terms_version,expires_at,allow_replies,language,accommodations,selection)
    values(r.id,c->>'termsVersion',expiry,(c->>'allowReplies')::boolean,c->>'language',array(select jsonb_array_elements_text(c->'accommodations')),selected);
  update prohor_care.audit_events set policy_version=1 where resource_id=r.id and policy_version is null;
  return prohor_care.owner_dto(r);
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

create function public.mvp_care_owner_requests(p_limit integer default 20,p_after_created_at timestamptz default null,p_after_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); items jsonb; last_row prohor_care.support_requests;
begin
  if p_limit not between 1 and 50 or p_limit is null or (p_after_id is null)<>(p_after_created_at is null) then
    raise exception using errcode='22023',message='Invalid page'; end if;
  select coalesce(jsonb_agg(prohor_care.owner_dto(s::prohor_care.support_requests) order by s.created_at,s.id),'[]'::jsonb) into items from (
    select r.* from prohor_care.support_requests r where r.owner_user_id=actor_id
      and (p_after_id is null or (r.created_at,r.id)>(p_after_created_at,p_after_id)) order by r.created_at,r.id limit p_limit) s;
  if jsonb_array_length(items)>0 then select * into last_row from prohor_care.support_requests where id=(items->-1->>'id')::uuid; end if;
  return jsonb_build_object('items',items,'nextCursor',case when exists(select 1 from prohor_care.support_requests r
    where r.owner_user_id=actor_id and (r.created_at,r.id)>(last_row.created_at,last_row.id)) then
    jsonb_build_object('createdAt',last_row.created_at,'id',last_row.id)::text else null end);
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

create function public.mvp_care_coordination_detail(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor(); r prohor_care.support_requests; dto jsonb; messages jsonb; grants jsonb; audit jsonb;
begin
  -- Canonical detail enforces current role, ownership, recipient, assignment, grants and permission, and audits the read.
  dto:=public.mvp_care_get_request(p_id);
  select * into strict r from prohor_care.support_requests where id=p_id for update;
  select coalesce(jsonb_agg(x.dto order by x.sent_at,x.id),'[]'::jsonb) into messages from (
    select * from (
      select m.id,m.sent_at,jsonb_build_object('id',m.id,'sender','provider','message',m.message,'sentAt',m.sent_at,'simulated',true) dto
        from prohor_care.response_messages m where m.request_id=r.id
      union all
      select m.id,m.sent_at,jsonb_build_object('id',m.id,'sender',m.sender_role,'message',m.message,'sentAt',m.sent_at,'simulated',true)
        from prohor_care.follow_up_messages m where m.request_id=r.id
    ) history order by sent_at desc,id desc limit 200) x;
  if actor_id=r.owner_user_id then
    select coalesce(jsonb_agg(prohor_care.consent_dto(g) order by g.id),'[]'::jsonb) into grants
      from prohor_care.consent_grants g join prohor_care.request_grants l on l.grant_id=g.id where l.request_id=r.id;
    select coalesce(jsonb_agg(x.dto order by x.occurred_at desc,x.id),'[]'::jsonb) into audit from (
      select a.id,a.occurred_at,jsonb_build_object('id',a.id,'action',a.action,'actor',case when a.actor_user_id=r.owner_user_id then 'mother' else 'provider' end,
        'occurredAt',a.occurred_at,'policyVersion',a.policy_version) dto
      from prohor_care.audit_events a where a.owner_user_id=actor_id and (a.resource_id=r.id or a.resource_id in
        (select l.grant_id from prohor_care.request_grants l where l.request_id=r.id))
      order by a.occurred_at desc,a.id limit 100) x;
  else grants:='[]'; audit:='[]'; end if;
  return jsonb_build_object('request',dto,'messages',messages,'grants',grants,'audit',audit);
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

create function public.mvp_care_revoke_request(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); r prohor_care.support_requests; p prohor_care.request_permissions;
begin
  select * into r from prohor_care.support_requests where id=p_id and owner_user_id=actor_id for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select * into p from prohor_care.request_permissions where request_id=r.id for update;
  if not found then
    -- Historical requests have no reviewed terms receipt. Close them without manufacturing an approval.
    if r.status<>'closed' then
      perform public.mvp_care_close(r.id,r.revision,md5('bondhon.legacy.withdraw' || r.id::text)::uuid);
    end if;
    return public.mvp_care_coordination_detail(r.id);
  elsif p.revoked_at is null then
    update prohor_care.request_permissions set revoked_at=clock_timestamp(),version=version+1 where request_id=r.id returning * into p;
  else return public.mvp_care_coordination_detail(r.id); end if;
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
    values(actor_id,actor_id,r.id,'request.permission_revoked');
  return public.mvp_care_coordination_detail(r.id);
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

create function public.mvp_care_follow_up(p_id uuid,p_expected_revision integer,p_message text,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor(); actor_role text; r prohor_care.support_requests;
  p prohor_care.request_permissions; prior prohor_care.follow_up_messages;
begin
  select role into actor_role from public.profiles where user_id=actor_id;
  if p_message is null or char_length(btrim(p_message)) not between 1 and 2000 or p_expected_revision is null or p_expected_revision<1 then
    raise exception using errcode='22023',message='Invalid message'; end if;
  perform prohor_care.lock_retry(actor_id,'request.follow_up',p_idempotency_key);
  select * into r from prohor_care.support_requests where id=p_id and
    ((actor_role='mother' and owner_user_id=actor_id) or (actor_role='provider' and recipient_user_id=actor_id)) for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  perform prohor_care.recipient(r.recipient_user_id);
  if not prohor_care.provider_access(r,r.recipient_user_id) then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select * into p from prohor_care.request_permissions where request_id=r.id for share;
  if not found or not p.allow_replies then raise exception using errcode='42501',message='Access denied'; end if;
  select * into prior from prohor_care.follow_up_messages where sender_user_id=actor_id and retry_key=p_idempotency_key;
  if found then
    if prior.request_id<>r.id or prior.message<>btrim(p_message) or prior.input_revision<>p_expected_revision then raise exception using errcode='40001',message='Retry conflict'; end if;
    return public.mvp_care_coordination_detail(r.id);
  end if;
  if r.revision<>p_expected_revision then raise exception using errcode='40001',message='Revision conflict'; end if;
  if actor_role='provider' and r.status not in ('acknowledged','responded') then raise exception using errcode='42501',message='Acknowledge first'; end if;
  if (select count(*) from prohor_care.follow_up_messages where request_id=r.id)>=199 then raise exception using errcode='22023',message='Thread full'; end if;
  insert into prohor_care.follow_up_messages(request_id,sender_user_id,sender_role,message,retry_key,policy_version,input_revision)
    values(r.id,actor_id,actor_role,btrim(p_message),p_idempotency_key,p.version,p_expected_revision);
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.follow_up');
  return public.mvp_care_coordination_detail(r.id);
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

-- Owner-only, bounded field candidates for explicit selection. Diary, conversations and raw attachments are absent.
create function public.mvp_care_shareable_records() returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('record',x.record,'recordedAt',x.stamp,'dataMode','synthetic') order by x.stamp desc),'[]'::jsonb) into result from (
    select jsonb_build_object('type','pregnancy_record','id',r.id,'fields',jsonb_build_object('label',r.label,'estimatedDueDate',r.estimated_due_date,'lastMenstrualPeriodDate',r.last_menstrual_period_date)) record,r.created_at stamp
      from public.pregnancy_records r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','baby_record','id',r.id,'fields',jsonb_build_object('label',r.label,'birthDate',r.birth_date)),r.created_at
      from public.baby_records r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','maternal_condition','id',r.id,'fields',jsonb_build_object('label',r.label,'documentedAt',r.documented_at)),r.created_at
      from public.maternal_conditions r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','maternal_observation','id',r.id,'fields',jsonb_build_object('measurement',jsonb_build_object('kind',r.kind,'value',r.value,'unit',r.unit),'observedAt',r.observed_at,'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))),r.created_at
      from public.health_observations r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','maternal_symptom_note','id',r.id,'fields',jsonb_build_object('note',r.note,'occurredAt',r.occurred_at)),r.created_at
      from public.maternal_symptom_notes r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','baby_observation','id',r.id,'fields',jsonb_build_object('measurement',jsonb_build_object('kind',r.kind,'value',r.value,'unit',r.unit),'observedAt',r.observed_at,'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))),r.created_at
      from public.baby_observations r where r.owner_user_id=actor_id
    union all select jsonb_build_object('type','wellness_entry','id',r.id,'fields',jsonb_build_object('mood',r.mood,'energy',r.energy,'activityNote',r.activity_note,'restNote',r.rest_note,'occurredAt',r.occurred_at)),r.created_at
      from public.wellness_entries r where r.owner_user_id=actor_id
    order by stamp desc limit 100) x;
  return result;
exception when others then perform prohor_care.fail(sqlstate); return null;
end; $$;

alter table prohor_care.request_permissions enable row level security;
alter table prohor_care.request_permissions force row level security;
alter table prohor_care.follow_up_messages enable row level security;
alter table prohor_care.follow_up_messages force row level security;
revoke all on prohor_care.request_permissions,prohor_care.follow_up_messages from public,anon,authenticated,service_role;
revoke all on all functions in schema prohor_care from public,anon,authenticated,service_role;
revoke all on function public.mvp_care_create_coordinated_request(jsonb,uuid),public.mvp_care_owner_requests(integer,timestamptz,uuid),
  public.mvp_care_coordination_detail(uuid),public.mvp_care_revoke_request(uuid),public.mvp_care_follow_up(uuid,integer,text,uuid),
  public.mvp_care_shareable_records() from public,anon,authenticated,service_role;
grant execute on function public.mvp_care_create_coordinated_request(jsonb,uuid),public.mvp_care_owner_requests(integer,timestamptz,uuid),
  public.mvp_care_coordination_detail(uuid),public.mvp_care_revoke_request(uuid),public.mvp_care_follow_up(uuid,integer,text,uuid),
  public.mvp_care_shareable_records() to authenticated;
notify pgrst, 'reload schema';
commit;
