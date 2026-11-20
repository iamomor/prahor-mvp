-- Shonket consent enforcement. NOT APPLIED to any hosted Supabase project; validate on a disposable database only.
-- Fixes: (1) submit routed a request to a provider with no consent record, expiry or revoke path;
-- (2) provider_access treated "no permission row" as allowed for Shonket; (3) denied provider opens were unaudited.
-- Behaviour: submit needs reviewConfirmed=true and writes a request_permissions row (fixed 30-day expiry,
-- allow_replies=false, no records). Revoke/expiry take effect on the next provider call. Legacy Shonket rows with no
-- permission row become unavailable to providers (fail closed); no approval is manufactured for them.
-- Replies: Shonket permissions are allow_replies=false by design (Phase 01-05 has no provider replies), so
-- acknowledge works and respond is denied. Provider replies need a separate, explicit consent change.
-- Deploy together with the matching app code: the 5-argument submit is dropped, so an older app build gets a 404.
-- Status is intentionally unchanged by revoke (the mother's timeline stays truthful); access stops via provider_access.
-- ROLLBACK (manual, in this order): 1) delete from prohor_care.audit_events where action in
--   ('request.consent_created','request.access_denied'); 2) re-add the audit/terms check constraints from
--   20261119050000; 3) restore provider_access from 20261119050000 (WARNING: it treats a missing permission row as
--   allowed, so first revoke or delete every Shonket request/assignment you do not want providers to see);
--   4) restore mvp_care_acknowledge/mvp_care_respond from 20261118040000; 5) drop prohor_care.shonket_provider_denied(uuid),
--   prohor_care.audit_denied(uuid,uuid,uuid), public.mvp_shonket_revoke_request(uuid) and the 7-argument submit;
--   6) restore shonket_dto/mvp_shonket_open_request and the 5-argument submit from 20261120100000.
begin;

alter table prohor_care.request_permissions drop constraint if exists request_permissions_terms_version_check;
alter table prohor_care.request_permissions add constraint request_permissions_terms_version_check
  check (terms_version in ('bondhon-demo-2026-11-19','shonket-demo-2026-11-20'));

alter table prohor_care.audit_events drop constraint if exists audit_events_action_check;
alter table prohor_care.audit_events add constraint audit_events_action_check check(action in (
  'consent.created','consent.revoked','request.delivered','request.acknowledged','request.responded','request.closed',
  'request.owner_read','request.provider_read','request.events_read','request.permission_revoked','request.follow_up',
  'request.consent_created','request.access_denied'));

-- Shonket has no records or Bondhon-style grants, so the permission row is the only consent gate: it must exist.
create or replace function prohor_care.provider_access(r prohor_care.support_requests,provider_id uuid)
returns boolean language plpgsql set search_path='' as $$
declare p prohor_care.request_permissions;
begin
  if not prohor_care.record_access(r,provider_id) then return false; end if;
  select * into p from prohor_care.request_permissions where request_id=r.id for share;
  if not found then return r.workflow<>'shonket'; end if;
  return p.revoked_at is null and p.expires_at>clock_timestamp();
end; $$;

-- include_events=true is the owner view and also carries the consent state; the provider projection never does.
create or replace function prohor_care.shonket_dto(r prohor_care.support_requests, include_events boolean default false)
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object(
    'id',r.id,'createdAt',r.created_at,'updatedAt',r.updated_at,'revision',r.revision,
    'status',r.status,'message',r.message,'method',r.method,'concernTypes',r.concern_types,'onset',r.onset,
    'events',case when include_events then coalesce((
      select jsonb_agg(jsonb_build_object('status',e.status,'occurredAt',e.occurred_at,'requestRevision',e.request_revision)
        order by e.request_revision)
      from prohor_care.request_events e where e.request_id=r.id and e.status in ('submitted','delivered','acknowledged')
    ),'[]'::jsonb) else '[]'::jsonb end
  ) || case when include_events then jsonb_build_object('consent',(
      select jsonb_build_object('termsVersion',p.terms_version,'expiresAt',p.expires_at,'revokedAt',p.revoked_at,'version',p.version)
      from prohor_care.request_permissions p where p.request_id=r.id)) else '{}'::jsonb end;
$$;

drop function if exists public.mvp_shonket_submit_request(text,text,text[],text,uuid);
create or replace function public.mvp_shonket_submit_request(p_message text,p_method text,p_concern_types text[],p_onset text,
  p_language text,p_review_confirmed boolean,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); provider_id uuid; r prohor_care.support_requests;
  existing prohor_care.mutation_receipts; v_assignment_id uuid; v_receipt_id uuid; expiry timestamptz:=clock_timestamp()+interval '30 days';
begin
  if p_review_confirmed is distinct from true or p_language is null or p_language not in ('bn','en')
    or p_message is null or char_length(btrim(p_message)) not between 1 and 1000
    or p_method is null or p_method not in ('text','aac','call')
    or p_concern_types is null or cardinality(p_concern_types)>9
    or cardinality(p_concern_types)<>(select count(distinct value) from unnest(p_concern_types) value)
    or not (p_concern_types <@ array['headache_vision','bleeding_fluid','baby_movement','breathing_chest','fever','swelling','pain','mood_safety','other']::text[])
    or (p_onset is not null and p_onset not in ('now','today','this_week','longer'))
    then raise exception using errcode='22023',message='Invalid request'; end if;
  perform prohor_care.lock_retry(actor_id,'request.create',p_idempotency_key);
  select * into existing from prohor_care.mutation_receipts where actor_user_id=actor_id
    and operation='request.create' and idempotency_key=p_idempotency_key;
  if found then
    select * into strict r from prohor_care.support_requests where id=existing.request_id and owner_user_id=actor_id for share;
    if r.workflow<>'shonket' or (r.message,r.method,r.concern_types,r.onset,(select language from prohor_care.request_permissions where request_id=r.id))
      is distinct from (btrim(p_message),p_method,p_concern_types,p_onset,p_language)
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    return prohor_care.shonket_dto(r,true);
  end if;

  select a.user_id into provider_id from prohor_care.provider_approvals a
    join public.profiles p on p.user_id=a.user_id and p.role='provider'
    join public.account_role_memberships m on m.user_id=a.user_id and m.role='provider' and m.status='approved'
    join public.provider_applications app on app.user_id=a.user_id and app.status='approved' and app.mode='simulated'
    join auth.users u on u.id=a.user_id and u.email is not null and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    where a.mode='simulated' and a.revoked_at is null and a.approved_at<=clock_timestamp()
    order by a.approved_at,a.user_id limit 1;
  if provider_id is null then raise exception using errcode='P0002',message='Support workflow unavailable'; end if;
  perform prohor_care.recipient(provider_id);
  insert into prohor_care.support_requests(owner_user_id,recipient_user_id,message,method,purpose,workflow,concern_types,onset)
    values(actor_id,provider_id,btrim(p_message),p_method,'Shonket human support request','shonket',p_concern_types,p_onset)
    returning * into r;
  insert into prohor_care.request_permissions(request_id,terms_version,expires_at,allow_replies,language,accommodations,selection)
    values(r.id,'shonket-demo-2026-11-20',expiry,false,p_language,'{}','[]'::jsonb);
  insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision)
    values(r.id,actor_id,'submitted',r.revision);
  insert into prohor_care.assignments(request_id,owner_user_id,recipient_user_id,purpose)
    values(r.id,actor_id,provider_id,r.purpose) returning id into v_assignment_id;
  insert into prohor_care.queue_receipts(request_id,assignment_id) values(r.id,v_assignment_id) returning id into v_receipt_id;
  if not exists(select 1 from prohor_care.queue_receipts q where q.id=v_receipt_id and q.request_id=r.id and q.assignment_id=v_assignment_id)
    then raise exception using errcode='P0001',message='Queue unavailable'; end if;
  insert into prohor_care.mutation_receipts(actor_user_id,operation,idempotency_key,request_id)
    values(actor_id,'request.create',p_idempotency_key,r.id);
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
    values(actor_id,actor_id,r.id,'request.consent_created');
  return prohor_care.shonket_dto(r,true);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

-- Denial audits are rate-limited per (actor, request): a poll on a revoked request writes one row per 5 minutes.
create or replace function prohor_care.audit_denied(p_actor uuid,p_owner uuid,p_resource uuid) returns void
language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from prohor_care.audit_events where actor_user_id=p_actor and resource_id=p_resource
    and action='request.access_denied' and occurred_at>clock_timestamp()-interval '5 minutes') then
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(p_actor,p_owner,p_resource,'request.access_denied');
  end if;
end; $$;

-- Opening distinguishes "never yours" (no audit, no existence leak) from "yours but consent no longer valid"
-- (audited, then returned as a denial so the audit row commits; the route maps it to 404).
create or replace function public.mvp_shonket_open_request(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); r prohor_care.support_requests; receipt_id uuid;
begin
  perform prohor_care.recipient(actor_id);
  select * into r from prohor_care.support_requests where id=p_id and workflow='shonket'
    and recipient_user_id=actor_id for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  if not prohor_care.provider_access(r,actor_id) then
    perform prohor_care.audit_denied(actor_id,r.owner_user_id,r.id);
    return jsonb_build_object('denied',true);
  end if;
  if r.status='submitted' then
    select q.id into receipt_id from prohor_care.queue_receipts q join prohor_care.assignments a
      on a.id=q.assignment_id and a.request_id=q.request_id where q.request_id=r.id
      and a.recipient_user_id=actor_id and a.revoked_at is null;
    if receipt_id is null then raise exception using errcode='P0002',message='Resource unavailable'; end if;
    update prohor_care.support_requests set status='delivered',revision=revision+1,updated_at=clock_timestamp()
      where id=r.id returning * into r;
    insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision,receipt_id)
      values(r.id,actor_id,'delivered',r.revision,receipt_id);
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
      values(actor_id,r.owner_user_id,r.id,'request.delivered');
  else
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
      values(actor_id,r.owner_user_id,r.id,'request.provider_read');
  end if;
  return prohor_care.shonket_dto(r,false);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create or replace function public.mvp_shonket_revoke_request(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); r prohor_care.support_requests; p prohor_care.request_permissions;
begin
  select * into r from prohor_care.support_requests where id=p_id and workflow='shonket' and owner_user_id=actor_id for update;
  if not found then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select * into p from prohor_care.request_permissions where request_id=r.id for update;
  if not found then
    -- Older request with no permission row: record an already-revoked, already-expired row (no approval is invented).
    insert into prohor_care.request_permissions(request_id,terms_version,expires_at,allow_replies,language,accommodations,selection,revoked_at)
      values(r.id,'shonket-demo-2026-11-20',clock_timestamp(),false,'bn','{}','[]'::jsonb,clock_timestamp());
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
      values(actor_id,actor_id,r.id,'request.permission_revoked');
  elsif p.revoked_at is null then
    update prohor_care.request_permissions set revoked_at=clock_timestamp(),version=version+1 where request_id=r.id;
    insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
      values(actor_id,actor_id,r.id,'request.permission_revoked');
  end if;
  return prohor_care.shonket_dto(r,true);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

-- Provider actions on a Shonket request whose consent was revoked/expired are audited, then returned as a denial
-- (the audit row must commit, so these paths cannot raise). Any other case falls through to the unchanged logic.
create or replace function prohor_care.shonket_provider_denied(p_id uuid) returns boolean
language plpgsql set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); r prohor_care.support_requests;
begin
  select * into r from prohor_care.support_requests where id=p_id and workflow='shonket' and recipient_user_id=actor_id for update;
  if not found or prohor_care.provider_access(r,actor_id) then return false; end if;
  perform prohor_care.audit_denied(actor_id,r.owner_user_id,r.id);
  return true;
end; $$;
create or replace function public.mvp_care_acknowledge(p_id uuid,p_expected_revision integer,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  if prohor_care.shonket_provider_denied(p_id) then return jsonb_build_object('denied',true); end if;
  return prohor_care.mutate_request(p_id,'acknowledge',p_expected_revision,p_idempotency_key);
exception when others then perform prohor_care.fail(sqlstate); return null; end; $$;
create or replace function public.mvp_care_respond(p_id uuid,p_expected_revision integer,p_message text,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  if prohor_care.shonket_provider_denied(p_id) then return jsonb_build_object('denied',true); end if;
  return prohor_care.mutate_request(p_id,'respond',p_expected_revision,p_idempotency_key,p_message);
exception when others then perform prohor_care.fail(sqlstate); return null; end; $$;

do $$ declare signature regprocedure; begin
  foreach signature in array array[
    'public.mvp_shonket_submit_request(text,text,text[],text,text,boolean,uuid)'::regprocedure,
    'public.mvp_shonket_open_request(uuid)'::regprocedure,
    'public.mvp_shonket_revoke_request(uuid)'::regprocedure,
    'public.mvp_care_acknowledge(uuid,integer,uuid)'::regprocedure,
    'public.mvp_care_respond(uuid,integer,text,uuid)'::regprocedure
  ] loop
    execute format('alter function %s owner to postgres',signature);
    execute format('revoke all on function %s from public,anon,authenticated,service_role',signature);
    execute format('grant execute on function %s to authenticated',signature);
  end loop;
end; $$;
revoke all on function prohor_care.shonket_dto(prohor_care.support_requests,boolean) from public,anon,authenticated,service_role;
revoke all on function prohor_care.provider_access(prohor_care.support_requests,uuid) from public,anon,authenticated,service_role;
revoke all on function prohor_care.shonket_provider_denied(uuid) from public,anon,authenticated,service_role;
revoke all on function prohor_care.audit_denied(uuid,uuid,uuid) from public,anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
