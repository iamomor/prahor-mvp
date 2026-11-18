-- Forward migration promoted for the operator-authorized care activation.
-- care-backend-v1 candidate. NOT an approved migration. Disposable tests only.
-- Requires the foundation and private-records-v1 proposals, in that order.
-- No privileged key is used by the application. Public RPCs derive auth.uid().
begin;
create schema prohor_care;
revoke all on schema prohor_care from public, anon, authenticated, service_role;

create table prohor_care.provider_approvals (
  user_id uuid primary key references public.profiles(user_id),
  mode text not null default 'simulated' check (mode = 'simulated'),
  approved_at timestamptz not null default now() check(isfinite(approved_at)), revoked_at timestamptz
);

create function prohor_care.valid_fields(kind text, fields text[])
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(cardinality(fields) between 1 and 6
    and cardinality(fields) = (select count(distinct f) from unnest(fields) f)
    and fields <@ case kind
      when 'pregnancy_record' then array['label','estimatedDueDate','lastMenstrualPeriodDate','provenance']
      when 'maternal_condition' then array['label','documentedAt','provenance']
      when 'maternal_observation' then array['measurement','observedAt','provenance']
      when 'maternal_symptom_note' then array['note','occurredAt']
      when 'baby_record' then array['label','birthDate']
      when 'baby_observation' then array['measurement','observedAt','provenance']
      when 'wellness_entry' then array['mood','energy','activityNote','restNote','occurredAt']
      else array[]::text[] end, false);
$$;

create table prohor_care.consent_grants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id),
  grantee_user_id uuid not null references prohor_care.provider_approvals(user_id),
  record_type text not null, record_id uuid not null, fields text[] not null,
  purpose text not null check (char_length(purpose) between 1 and 300 and purpose = btrim(purpose)),
  starts_at timestamptz not null check (isfinite(starts_at)),
  expires_at timestamptz not null check (isfinite(expires_at)), revoked_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision > 0),
  data_mode text not null default 'synthetic' check (data_mode = 'synthetic'),
  pregnancy_id uuid generated always as (case when record_type='pregnancy_record' then record_id end) stored,
  condition_id uuid generated always as (case when record_type='maternal_condition' then record_id end) stored,
  maternal_observation_id uuid generated always as (case when record_type='maternal_observation' then record_id end) stored,
  symptom_id uuid generated always as (case when record_type='maternal_symptom_note' then record_id end) stored,
  baby_id uuid generated always as (case when record_type='baby_record' then record_id end) stored,
  baby_observation_id uuid generated always as (case when record_type='baby_observation' then record_id end) stored,
  wellness_id uuid generated always as (case when record_type='wellness_entry' then record_id end) stored,
  check (owner_user_id <> grantee_user_id), check (expires_at > starts_at),
  check (prohor_care.valid_fields(record_type, fields)),
  unique(id, owner_user_id), unique(id, owner_user_id, grantee_user_id, purpose),
  foreign key (pregnancy_id, owner_user_id) references public.pregnancy_records(id, owner_user_id),
  foreign key (condition_id, owner_user_id) references public.maternal_conditions(id, owner_user_id),
  foreign key (maternal_observation_id, owner_user_id) references public.health_observations(id, owner_user_id),
  foreign key (symptom_id, owner_user_id) references public.maternal_symptom_notes(id, owner_user_id),
  foreign key (baby_id, owner_user_id) references public.baby_records(id, owner_user_id),
  foreign key (baby_observation_id, owner_user_id) references public.baby_observations(id, owner_user_id),
  foreign key (wellness_id, owner_user_id) references public.wellness_entries(id, owner_user_id)
);

create table prohor_care.support_requests (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references public.profiles(user_id),
  recipient_user_id uuid not null references prohor_care.provider_approvals(user_id),
  message text not null check (char_length(message) between 1 and 1000 and message=btrim(message)),
  method text not null check (method in ('text','aac','call')),
  purpose text not null check (char_length(purpose) between 1 and 300 and purpose=btrim(purpose)),
  status text not null default 'submitted' check (status in ('submitted','delivered','acknowledged','responded','closed')),
  provider_mode text not null default 'simulated' check (provider_mode='simulated'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision>0),
  data_mode text not null default 'synthetic' check (data_mode='synthetic'),
  check (owner_user_id<>recipient_user_id),
  unique(id,owner_user_id,recipient_user_id,purpose)
);
create table prohor_care.request_grants (
  request_id uuid not null, grant_id uuid not null, owner_user_id uuid not null,
  recipient_user_id uuid not null, purpose text not null,
  primary key(request_id,grant_id),
  foreign key(request_id,owner_user_id,recipient_user_id,purpose)
    references prohor_care.support_requests(id,owner_user_id,recipient_user_id,purpose),
  foreign key(grant_id,owner_user_id,recipient_user_id,purpose)
    references prohor_care.consent_grants(id,owner_user_id,grantee_user_id,purpose)
);
create table prohor_care.assignments (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique,
  owner_user_id uuid not null, recipient_user_id uuid not null, purpose text not null,
  assigned_at timestamptz not null default now(), revoked_at timestamptz,
  unique(id,request_id), unique(id,request_id,recipient_user_id),
  foreign key(request_id,owner_user_id,recipient_user_id,purpose)
    references prohor_care.support_requests(id,owner_user_id,recipient_user_id,purpose)
);
-- A row is actual persisted membership in the simulated queue, not an external receipt.
create table prohor_care.queue_receipts (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique,
  assignment_id uuid not null unique, queued_at timestamptz not null default now(),
  unique(id,request_id),
  foreign key(assignment_id,request_id) references prohor_care.assignments(id,request_id)
);
create table prohor_care.response_messages (
  id uuid primary key default gen_random_uuid(), request_id uuid not null,
  assignment_id uuid not null, sender_user_id uuid not null,
  message text not null check (char_length(message) between 1 and 2000 and message=btrim(message)),
  sent_at timestamptz not null default now(), unique(id,request_id),
  foreign key(assignment_id,request_id,sender_user_id)
    references prohor_care.assignments(id,request_id,recipient_user_id)
);
create table prohor_care.request_events (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references prohor_care.support_requests(id),
  actor_user_id uuid not null references public.profiles(user_id),
  status text not null, occurred_at timestamptz not null default now(),
  request_revision integer not null check(request_revision>0),
  receipt_id uuid, assignment_id uuid, response_message_id uuid, reason text,
  unique(request_id,request_revision),
  foreign key(receipt_id,request_id) references prohor_care.queue_receipts(id,request_id),
  foreign key(assignment_id,request_id,actor_user_id) references prohor_care.assignments(id,request_id,recipient_user_id),
  foreign key(response_message_id,request_id) references prohor_care.response_messages(id,request_id),
  check (coalesce((
    (status='submitted' and num_nonnulls(receipt_id,assignment_id,response_message_id,reason)=0) or
    (status='delivered' and receipt_id is not null and num_nonnulls(assignment_id,response_message_id,reason)=0) or
    (status='acknowledged' and assignment_id is not null and num_nonnulls(receipt_id,response_message_id,reason)=0) or
    (status='responded' and assignment_id is not null and response_message_id is not null and num_nonnulls(receipt_id,reason)=0) or
    (status='closed' and receipt_id is null and response_message_id is null and
      ((reason='owner_closed' and assignment_id is null) or (reason='provider_closed' and assignment_id is not null)))),false))
);
create table prohor_care.mutation_receipts (
  actor_user_id uuid not null references public.profiles(user_id), operation text not null,
  idempotency_key uuid not null, grant_id uuid, request_id uuid references prohor_care.support_requests(id),
  input_revision integer, response_message_id uuid, created_at timestamptz not null default now(),
  primary key(actor_user_id,operation,idempotency_key),
  foreign key(grant_id,actor_user_id) references prohor_care.consent_grants(id,owner_user_id),
  foreign key(response_message_id,request_id) references prohor_care.response_messages(id,request_id),
  check (coalesce((
    (operation='consent.create' and grant_id is not null and num_nonnulls(request_id,input_revision,response_message_id)=0) or
    (operation='request.create' and request_id is not null and num_nonnulls(grant_id,input_revision,response_message_id)=0) or
    (operation in ('request.acknowledge','request.close') and request_id is not null and input_revision>0 and num_nonnulls(grant_id,response_message_id)=0) or
    (operation='request.respond' and request_id is not null and input_revision>0 and response_message_id is not null and grant_id is null)),false))
);
create table prohor_care.audit_events (
  id uuid primary key default gen_random_uuid(), actor_user_id uuid not null references public.profiles(user_id),
  owner_user_id uuid not null references public.profiles(user_id), resource_id uuid not null,
  action text not null check(action in ('consent.created','consent.revoked','request.delivered','request.acknowledged',
    'request.responded','request.closed','request.owner_read','request.provider_read','request.events_read')),
  occurred_at timestamptz not null default now()
);
create index support_requests_recipient_history on prohor_care.support_requests(recipient_user_id,created_at,id);
create index support_requests_owner_history on prohor_care.support_requests(owner_user_id,created_at,id);
create index request_grants_grant on prohor_care.request_grants(grant_id);
create index consent_grants_owner on prohor_care.consent_grants(owner_user_id,created_at,id);

-- Internal helpers are not externally callable. Public RPC wrappers are deliberately narrow.
create function prohor_care.actor(required_role text default null)
returns uuid language plpgsql set search_path='' as $$
declare actor_id uuid := auth.uid();
begin
  perform 1 from public.profiles p join auth.users u on u.id=p.user_id
    where p.user_id=actor_id and (required_role is null or p.role=required_role)
      and p.role in ('mother','provider') and u.email is not null
      and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    for share of p,u;
  if not found then raise exception using errcode='42501',message='Access denied'; end if;
  return actor_id;
end;
$$;
create function prohor_care.recipient(provider_id uuid)
returns void language plpgsql set search_path='' as $$
begin
  perform 1 from prohor_care.provider_approvals a join public.profiles p on p.user_id=a.user_id
    join auth.users u on u.id=p.user_id
    where a.user_id=provider_id and a.mode='simulated' and a.revoked_at is null and a.approved_at<=clock_timestamp()
      and p.role='provider' and u.email_confirmed_at is not null
      and u.email is not null and not coalesce(u.is_anonymous,false)
    for share of a,p,u;
  if not found then raise exception using errcode='42501',message='Recipient unavailable'; end if;
end;
$$;
create function prohor_care.lock_retry(actor_id uuid, operation text, retry_key uuid)
returns void language plpgsql set search_path='' as $$
begin
  if retry_key is null then raise exception using errcode='22023',message='Idempotency key required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_id::text || operation || retry_key::text,0));
end;
$$;
create function prohor_care.consent_dto(g prohor_care.consent_grants)
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('id',g.id,'ownerUserId',g.owner_user_id,'createdAt',g.created_at,'updatedAt',g.updated_at,
    'revision',g.revision,'dataMode',g.data_mode,'granteeUserId',g.grantee_user_id,'purpose',g.purpose,
    'startsAt',g.starts_at,'expiresAt',g.expires_at,'revokedAt',g.revoked_at,
    'record',jsonb_build_object('type',g.record_type,'id',g.record_id,'fields',g.fields));
$$;
create function prohor_care.owner_dto(r prohor_care.support_requests)
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('id',r.id,'ownerUserId',r.owner_user_id,'createdAt',r.created_at,'updatedAt',r.updated_at,
    'revision',r.revision,'dataMode',r.data_mode,'recipientUserId',r.recipient_user_id,'purpose',r.purpose,
    'message',r.message,'method',r.method,'status',r.status,'providerMode',r.provider_mode,
    'consentGrantIds',coalesce((select jsonb_agg(g.grant_id order by g.grant_id)
      from prohor_care.request_grants g where g.request_id=r.id),'[]'::jsonb));
$$;
create function prohor_care.provider_summary(r prohor_care.support_requests)
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('id',r.id,'createdAt',r.created_at,'updatedAt',r.updated_at,'revision',r.revision,
    'status',r.status,'providerMode',r.provider_mode,'method',r.method,'message',r.message);
$$;
create function prohor_care.provider_access(r prohor_care.support_requests, provider_id uuid)
returns boolean language plpgsql set search_path='' as $$
declare g prohor_care.consent_grants; decision_at timestamptz;
begin
  if r.recipient_user_id<>provider_id or r.status='closed' then return false; end if;
  perform 1 from prohor_care.assignments a join prohor_care.queue_receipts q on q.assignment_id=a.id and q.request_id=a.request_id
    where a.request_id=r.id and a.recipient_user_id=provider_id and a.revoked_at is null for share of a;
  if not found then return false; end if;
  -- Lock every grant in UUID order. Revocation takes only the grant lock, never a request lock.
  for g in select c.* from prohor_care.consent_grants c join prohor_care.request_grants l on l.grant_id=c.id
    where l.request_id=r.id order by c.id for share of c
  loop
    null;
  end loop;
  -- Check all windows at one instant AFTER acquiring all locks, including a wait.
  decision_at:=clock_timestamp();
  return not exists(select 1 from prohor_care.consent_grants c join prohor_care.request_grants l on l.grant_id=c.id
    where l.request_id=r.id and (c.owner_user_id<>r.owner_user_id or c.grantee_user_id<>provider_id or c.purpose<>r.purpose
      or c.revoked_at is not null or c.starts_at>decision_at or c.expires_at<=decision_at));
end;
$$;
create function prohor_care.shared_projection(g prohor_care.consent_grants)
returns jsonb language plpgsql set search_path='' as $$
declare available jsonb; selected jsonb;
begin
  case g.record_type
    when 'pregnancy_record' then select jsonb_build_object('label',r.label,'estimatedDueDate',r.estimated_due_date,
      'lastMenstrualPeriodDate',r.last_menstrual_period_date,'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))
      into available from public.pregnancy_records r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'maternal_condition' then select jsonb_build_object('label',r.label,'documentedAt',r.documented_at,
      'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))
      into available from public.maternal_conditions r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'maternal_observation' then select jsonb_build_object('measurement',jsonb_build_object('kind',r.kind,'value',r.value,'unit',r.unit),
      'observedAt',r.observed_at,'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))
      into available from public.health_observations r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'maternal_symptom_note' then select jsonb_build_object('note',r.note,'occurredAt',r.occurred_at)
      into available from public.maternal_symptom_notes r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'baby_record' then select jsonb_build_object('label',r.label,'birthDate',r.birth_date)
      into available from public.baby_records r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'baby_observation' then select jsonb_build_object('measurement',jsonb_build_object('kind',r.kind,'value',r.value,'unit',r.unit),
      'observedAt',r.observed_at,'provenance',jsonb_build_object('source',r.source,'verification',r.verification,'recordedAt',r.recorded_at))
      into available from public.baby_observations r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    when 'wellness_entry' then select jsonb_build_object('mood',r.mood,'energy',r.energy,'activityNote',r.activity_note,'restNote',r.rest_note,'occurredAt',r.occurred_at)
      into available from public.wellness_entries r where r.id=g.record_id and r.owner_user_id=g.owner_user_id;
    else raise exception using errcode='42501',message='Record unavailable';
  end case;
  if available is null then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  select jsonb_object_agg(f,available->f) into selected from unnest(g.fields) f;
  return jsonb_build_object('type',g.record_type,'id',g.record_id,'fields',selected);
end;
$$;
create function prohor_care.provider_dto(r prohor_care.support_requests)
returns jsonb language sql stable set search_path='' as $$
  select prohor_care.provider_summary(r) || jsonb_build_object('consentedRecords',coalesce((
    select jsonb_agg(prohor_care.shared_projection(c) order by c.id) from prohor_care.consent_grants c
      join prohor_care.request_grants l on l.grant_id=c.id where l.request_id=r.id),'[]'::jsonb));
$$;

-- Final request state cannot commit without its matching evidence event.
create function prohor_care.check_request_evidence()
returns trigger language plpgsql set search_path='' as $$
declare r prohor_care.support_requests;
begin
  select * into r from prohor_care.support_requests where id=new.id;
  if not exists(select 1 from prohor_care.request_events e where e.request_id=r.id
    and e.status=r.status and e.request_revision=r.revision
    and (e.status not in ('submitted','delivered') or e.actor_user_id=r.owner_user_id)
    and (e.reason is distinct from 'owner_closed' or e.actor_user_id=r.owner_user_id)) then
    raise exception using errcode='23514',message='Request status evidence required';
  end if;
  return null;
end;
$$;
create constraint trigger request_status_evidence after insert or update on prohor_care.support_requests
  deferrable initially deferred for each row execute function prohor_care.check_request_evidence();

-- No table or internal function access for application roles, including service_role.
do $$ declare resource text; begin
  for resource in select tablename from pg_tables where schemaname='prohor_care' loop
    execute format('alter table prohor_care.%I enable row level security',resource);
    execute format('alter table prohor_care.%I force row level security',resource);
    execute format('revoke all on prohor_care.%I from public, anon, authenticated, service_role',resource);
  end loop;
end; $$;
revoke all on all functions in schema prohor_care from public, anon, authenticated, service_role;
commit;
