-- care-backend-v1 RPC candidate. NOT approved or applied to Supabase.
-- Load after 20261118_care_backend.sql in the disposable test runner only.
begin;
create function prohor_care.fail(state text) returns void language plpgsql set search_path='' as $$
begin
  raise exception using errcode=case
    when state in ('22023','23514','23502','22P02','22008') then '22023'
    when state='23503' then 'P0002'
    when state in ('42501','P0002','40001') then state else 'P0001' end,
    message=case when state='42501' then 'Access denied'
      when state in ('23503','P0002') then 'Resource unavailable'
      when state='40001' then 'Revision or retry conflict'
      when state in ('22023','23514','23502','22P02','22008') then 'Invalid request'
      else 'Care service unavailable' end;
end;
$$;

create function public.mvp_care_create_consent(
  p_grantee_user_id uuid, p_record_type text, p_record_id uuid, p_fields text[],
  p_purpose text, p_starts_at timestamptz, p_expires_at timestamptz,
  p_review_confirmed boolean, p_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); g prohor_care.consent_grants;
  original prohor_care.mutation_receipts; canonical_fields text[];
begin
  if p_review_confirmed is distinct from true or not prohor_care.valid_fields(p_record_type,p_fields)
    or p_grantee_user_id is null or p_record_id is null or p_grantee_user_id=actor_id
    or p_purpose is null or char_length(btrim(p_purpose)) not between 1 and 300
    or p_starts_at is null or p_expires_at is null or not isfinite(p_starts_at) or not isfinite(p_expires_at)
    or p_expires_at<=p_starts_at then raise exception using errcode='22023',message='Invalid request'; end if;
  select array_agg(f order by f) into canonical_fields from unnest(p_fields) f;
  perform prohor_care.lock_retry(actor_id,'consent.create',p_idempotency_key);
  select * into original from prohor_care.mutation_receipts where actor_user_id=actor_id
    and operation='consent.create' and idempotency_key=p_idempotency_key;
  if found then
    select * into strict g from prohor_care.consent_grants where id=original.grant_id and owner_user_id=actor_id for share;
    if (g.grantee_user_id,g.record_type,g.record_id,g.fields,g.purpose,g.starts_at,g.expires_at)
      is distinct from (p_grantee_user_id,p_record_type,p_record_id,canonical_fields,btrim(p_purpose),p_starts_at,p_expires_at)
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    return prohor_care.consent_dto(g);
  end if;
  perform prohor_care.recipient(p_grantee_user_id);
  if p_expires_at<=clock_timestamp() then raise exception using errcode='22023',message='Expired consent'; end if;
  insert into prohor_care.consent_grants(owner_user_id,grantee_user_id,record_type,record_id,fields,purpose,starts_at,expires_at)
    values(actor_id,p_grantee_user_id,p_record_type,p_record_id,canonical_fields,btrim(p_purpose),p_starts_at,p_expires_at) returning * into g;
  insert into prohor_care.mutation_receipts(actor_user_id,operation,idempotency_key,grant_id)
    values(actor_id,'consent.create',p_idempotency_key,g.id);
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,actor_id,g.id,'consent.created');
  return prohor_care.consent_dto(g);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_care_revoke_consent(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); g prohor_care.consent_grants;
begin
  select * into g from prohor_care.consent_grants where id=p_id and owner_user_id=actor_id for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  if g.revoked_at is null then
    update prohor_care.consent_grants set revoked_at=clock_timestamp(),updated_at=clock_timestamp(),revision=revision+1
      where id=g.id returning * into g;
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,actor_id,g.id,'consent.revoked');
  end if;
  return jsonb_build_object('id',g.id,'revokedAt',g.revoked_at);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_care_create_request(
  p_recipient_user_id uuid, p_message text, p_method text, p_purpose text,
  p_consent_grant_ids uuid[], p_review_confirmed boolean, p_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); r prohor_care.support_requests;
  g prohor_care.consent_grants; original prohor_care.mutation_receipts;
  grant_ids uuid[]; existing_ids uuid[]; grant_id uuid; v_assignment_id uuid; receipt_id uuid;
begin
  if p_review_confirmed is distinct from true or p_recipient_user_id is null or p_recipient_user_id=actor_id
    or p_message is null or char_length(btrim(p_message)) not between 1 and 1000
    or p_method is null or p_method not in ('text','aac','call')
    or p_purpose is null or char_length(btrim(p_purpose)) not between 1 and 300
    or p_consent_grant_ids is null or cardinality(p_consent_grant_ids)>20
    or cardinality(p_consent_grant_ids)<>(select count(distinct i) from unnest(p_consent_grant_ids) i)
    then raise exception using errcode='22023',message='Invalid request'; end if;
  select coalesce(array_agg(i order by i),array[]::uuid[]) into grant_ids from unnest(p_consent_grant_ids) i;
  perform prohor_care.lock_retry(actor_id,'request.create',p_idempotency_key);
  select * into original from prohor_care.mutation_receipts where actor_user_id=actor_id
    and operation='request.create' and idempotency_key=p_idempotency_key;
  if found then
    select * into strict r from prohor_care.support_requests where id=original.request_id and owner_user_id=actor_id for update;
    select coalesce(array_agg(l.grant_id order by l.grant_id),array[]::uuid[]) into existing_ids
      from prohor_care.request_grants l where request_id=r.id;
    if (r.recipient_user_id,r.message,r.method,r.purpose,existing_ids)
      is distinct from (p_recipient_user_id,btrim(p_message),p_method,btrim(p_purpose),grant_ids)
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    -- Owner-only reconciliation still works after recipient/grant revocation; it grants no provider access.
    return prohor_care.owner_dto(r);
  end if;
  perform prohor_care.recipient(p_recipient_user_id);
  foreach grant_id in array grant_ids loop
    select * into g from prohor_care.consent_grants where id=grant_id and owner_user_id=actor_id for share;
    if not found or g.grantee_user_id<>p_recipient_user_id or g.purpose<>btrim(p_purpose)
      or g.revoked_at is not null or g.starts_at>clock_timestamp() or g.expires_at<=clock_timestamp()
      then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  end loop;
  if exists(select 1 from prohor_care.consent_grants c where c.id=any(grant_ids)
    and (c.starts_at>clock_timestamp() or c.expires_at<=clock_timestamp() or c.revoked_at is not null))
    then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  insert into prohor_care.support_requests(owner_user_id,recipient_user_id,message,method,purpose)
    values(actor_id,p_recipient_user_id,btrim(p_message),p_method,btrim(p_purpose)) returning * into r;
  insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision) values(r.id,actor_id,'submitted',1);
  insert into prohor_care.assignments(request_id,owner_user_id,recipient_user_id,purpose)
    values(r.id,actor_id,p_recipient_user_id,r.purpose) returning id into v_assignment_id;
  insert into prohor_care.request_grants(request_id,grant_id,owner_user_id,recipient_user_id,purpose)
    select r.id,i,actor_id,p_recipient_user_id,r.purpose from unnest(grant_ids) i;
  insert into prohor_care.queue_receipts(request_id,assignment_id) values(r.id,v_assignment_id) returning id into receipt_id;
  if not exists(select 1 from prohor_care.queue_receipts q where q.id=receipt_id and q.request_id=r.id and q.assignment_id=v_assignment_id)
    then raise exception using errcode='P0001',message='Queue unavailable'; end if;
  update prohor_care.support_requests set status='delivered',revision=2,updated_at=clock_timestamp() where id=r.id returning * into r;
  insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision,receipt_id) values(r.id,actor_id,'delivered',2,receipt_id);
  insert into prohor_care.mutation_receipts(actor_user_id,operation,idempotency_key,request_id) values(actor_id,'request.create',p_idempotency_key,r.id);
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,actor_id,r.id,'request.delivered');
  return prohor_care.owner_dto(r);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_care_get_request(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor(); actor_role text; r prohor_care.support_requests;
begin
  select role into actor_role from public.profiles where user_id=actor_id;
  if actor_role='provider' then perform prohor_care.recipient(actor_id); end if;
  select * into r from prohor_care.support_requests where id=p_id and
    ((actor_role='mother' and owner_user_id=actor_id) or (actor_role='provider' and recipient_user_id=actor_id)) for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  if actor_role='mother' and r.owner_user_id=actor_id then
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.owner_read');
    return prohor_care.owner_dto(r);
  end if;
  if actor_role<>'provider' or not prohor_care.provider_access(r,actor_id)
    then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.provider_read');
  return prohor_care.provider_dto(r);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_care_provider_requests(p_limit integer default 20,p_after_created_at timestamptz default null,p_after_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); r prohor_care.support_requests;
  items jsonb:='[]'::jsonb; last_row prohor_care.support_requests; has_more boolean:=false;
begin
  if p_limit is null or p_limit not between 1 and 50 or (p_after_created_at is null)<>(p_after_id is null)
    or (p_after_created_at is not null and not isfinite(p_after_created_at))
    then raise exception using errcode='22023',message='Invalid request'; end if;
  perform prohor_care.recipient(actor_id);
  for r in select s.* from prohor_care.support_requests s where s.recipient_user_id=actor_id and s.status<>'closed'
    and (p_after_id is null or (s.created_at,s.id)>(p_after_created_at,p_after_id))
    order by s.created_at,s.id for update of s
  loop
    if prohor_care.provider_access(r,actor_id) then
      if jsonb_array_length(items)=p_limit then has_more:=true; exit; end if;
      insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.provider_read');
      items:=items || jsonb_build_array(prohor_care.provider_summary(r)); last_row:=r;
    end if;
  end loop;
  return jsonb_build_object('items',items,'nextCursor',case when has_more then
    jsonb_build_object('createdAt',last_row.created_at,'id',last_row.id)::text else null end);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_care_request_events(p_id uuid,p_limit integer default 20,p_after_revision integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor(); r prohor_care.support_requests; actor_role text;
  items jsonb; next_revision integer;
begin
  if p_limit is null or p_limit not between 1 and 50 or p_after_revision is null or p_after_revision<0
    then raise exception using errcode='22023',message='Invalid request'; end if;
  select role into actor_role from public.profiles where user_id=actor_id;
  if actor_role='provider' then perform prohor_care.recipient(actor_id); end if;
  select * into r from prohor_care.support_requests where id=p_id and
    ((actor_role='mother' and owner_user_id=actor_id) or (actor_role='provider' and recipient_user_id=actor_id)) for update;
  if not found or not ((actor_role='mother' and r.owner_user_id=actor_id) or
    (actor_role='provider' and prohor_care.provider_access(r,actor_id)))
    then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select coalesce(jsonb_agg(e.dto order by e.revision),'[]'::jsonb),max(e.revision) into items,next_revision from (
    select ev.request_revision as revision,jsonb_build_object('id',ev.id,'requestId',ev.request_id,'status',ev.status,
      'occurredAt',ev.occurred_at,'requestRevision',ev.request_revision) as dto from prohor_care.request_events ev
    where ev.request_id=p_id and ev.request_revision>p_after_revision order by ev.request_revision limit p_limit) e;
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.events_read');
  return jsonb_build_object('items',items,'nextCursor',case when exists(select 1 from prohor_care.request_events
    where request_id=p_id and request_revision>next_revision) then next_revision::text else null end);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function prohor_care.mutate_request(p_id uuid,p_action text,p_expected_revision integer,p_idempotency_key uuid,p_message text default null)
returns jsonb language plpgsql set search_path='' as $$
declare actor_id uuid:=prohor_care.actor(); actor_role text; v_operation text:='request.' || p_action;
  r prohor_care.support_requests; assignment_id uuid; response_id uuid; original prohor_care.mutation_receipts; new_status text;
begin
  select role into actor_role from public.profiles where user_id=actor_id;
  if p_action is null or p_action not in ('acknowledge','respond','close') or p_expected_revision is null or p_expected_revision<1
    or (p_action='respond' and (p_message is null or char_length(btrim(p_message)) not between 1 and 2000))
    or (p_action<>'respond' and p_message is not null)
    then raise exception using errcode='22023',message='Invalid request'; end if;
  if p_action<>'close' and actor_role<>'provider' then raise exception using errcode='42501',message='Access denied'; end if;
  perform prohor_care.lock_retry(actor_id,v_operation,p_idempotency_key);
  if actor_role='provider' then perform prohor_care.recipient(actor_id); end if;
  select * into r from prohor_care.support_requests where id=p_id and
    ((actor_role='mother' and owner_user_id=actor_id) or (actor_role='provider' and recipient_user_id=actor_id)) for update;
  if not found or not ((actor_role='mother' and p_action='close' and r.owner_user_id=actor_id) or
    (actor_role='provider' and prohor_care.provider_access(r,actor_id)))
    then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select * into original from prohor_care.mutation_receipts where actor_user_id=actor_id
    and mutation_receipts.operation=v_operation and idempotency_key=p_idempotency_key;
  if found then
    if original.request_id<>p_id or original.input_revision<>p_expected_revision or (p_action='respond' and
      not exists(select 1 from prohor_care.response_messages m where m.id=original.response_message_id and m.message=btrim(p_message)))
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    if actor_role='mother' then return prohor_care.owner_dto(r); end if;
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.provider_read');
    return prohor_care.provider_dto(r);
  end if;
  if r.revision<>p_expected_revision or r.status='closed' or (p_action='acknowledge' and r.status<>'delivered')
    or (p_action='respond' and r.status<>'acknowledged') then raise exception using errcode='40001',message='Revision conflict'; end if;
  select id into assignment_id from prohor_care.assignments where request_id=r.id and revoked_at is null for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  new_status:=case p_action when 'acknowledge' then 'acknowledged' when 'respond' then 'responded' else 'closed' end;
  if p_action='respond' then
    insert into prohor_care.response_messages(request_id,assignment_id,sender_user_id,message)
      values(r.id,assignment_id,actor_id,btrim(p_message)) returning id into response_id;
  end if;
  update prohor_care.support_requests set status=new_status,revision=revision+1,updated_at=clock_timestamp() where id=r.id returning * into r;
  insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision,assignment_id,response_message_id,reason)
    values(r.id,actor_id,new_status,r.revision,case when actor_role='provider' then assignment_id end,response_id,
      case when p_action='close' then case when actor_role='mother' then 'owner_closed' else 'provider_closed' end end);
  if p_action='close' then update prohor_care.assignments set revoked_at=clock_timestamp() where id=assignment_id; end if;
  insert into prohor_care.mutation_receipts(actor_user_id,operation,idempotency_key,request_id,input_revision,response_message_id)
    values(actor_id,v_operation,p_idempotency_key,r.id,p_expected_revision,response_id);
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.' || new_status);
  if actor_role='mother' then return prohor_care.owner_dto(r); end if;
  -- A close response contains no shared records: closure has already revoked provider access.
  if p_action='close' then return prohor_care.provider_summary(r) || jsonb_build_object('consentedRecords','[]'::jsonb); end if;
  return prohor_care.provider_dto(r);
end;
$$;

create function public.mvp_care_acknowledge(p_id uuid,p_expected_revision integer,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  return prohor_care.mutate_request(p_id,'acknowledge',p_expected_revision,p_idempotency_key);
exception when others then perform prohor_care.fail(sqlstate); return null; end; $$;
create function public.mvp_care_respond(p_id uuid,p_expected_revision integer,p_message text,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  return prohor_care.mutate_request(p_id,'respond',p_expected_revision,p_idempotency_key,p_message);
exception when others then perform prohor_care.fail(sqlstate); return null; end; $$;
create function public.mvp_care_close(p_id uuid,p_expected_revision integer,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  return prohor_care.mutate_request(p_id,'close',p_expected_revision,p_idempotency_key);
exception when others then perform prohor_care.fail(sqlstate); return null; end; $$;

create function public.mvp_care_recipients()
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('id',p.user_id,'displayName',p.display_name,'providerMode','simulated') order by p.user_id),'[]'::jsonb)
    into result from prohor_care.provider_approvals a join public.profiles p on p.user_id=a.user_id join auth.users u on u.id=p.user_id
    where p.role='provider' and a.revoked_at is null and a.approved_at<=clock_timestamp()
      and u.email_confirmed_at is not null and u.email is not null and not coalesce(u.is_anonymous,false);
  return result;
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

-- Definer functions run as the trusted migration owner; no dynamic table names or caller actor/role parameters.
do $$ declare signature regprocedure; begin
  foreach signature in array array[
    'public.mvp_care_create_consent(uuid,text,uuid,text[],text,timestamptz,timestamptz,boolean,uuid)'::regprocedure,
    'public.mvp_care_revoke_consent(uuid)'::regprocedure,
    'public.mvp_care_create_request(uuid,text,text,text,uuid[],boolean,uuid)'::regprocedure,
    'public.mvp_care_get_request(uuid)'::regprocedure,
    'public.mvp_care_provider_requests(integer,timestamptz,uuid)'::regprocedure,
    'public.mvp_care_request_events(uuid,integer,integer)'::regprocedure,
    'public.mvp_care_acknowledge(uuid,integer,uuid)'::regprocedure,
    'public.mvp_care_respond(uuid,integer,text,uuid)'::regprocedure,
    'public.mvp_care_close(uuid,integer,uuid)'::regprocedure,
    'public.mvp_care_recipients()'::regprocedure]
  loop
    execute format('alter function %s owner to postgres',signature);
    execute format('revoke all on function %s from public, anon, authenticated, service_role',signature);
    execute format('grant execute on function %s to authenticated',signature);
  end loop;
end; $$;
revoke all on all functions in schema prohor_care from public, anon, authenticated, service_role;
commit;
