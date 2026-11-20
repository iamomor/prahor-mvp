-- Shonket uses the existing care request, assignment, queue receipt and
-- append-only request event tables. It adds no parallel request store.
begin;

alter table prohor_care.support_requests
  add column workflow text not null default 'bondhon' check (workflow in ('bondhon','shonket')),
  add column concern_types text[] not null default '{}',
  add column onset text;
create function prohor_care.valid_shonket_concerns(p_values text[])
returns boolean language sql immutable set search_path='' as $$
  select coalesce(cardinality(p_values)<=9
    and cardinality(p_values)=(select count(distinct item) from unnest(p_values) item)
    and p_values <@ array['headache_vision','bleeding_fluid','baby_movement','breathing_chest','fever','swelling','pain','mood_safety','other']::text[],false);
$$;
alter table prohor_care.support_requests add constraint shonket_concern_values check (
  prohor_care.valid_shonket_concerns(concern_types)
  and (workflow = 'shonket' or (cardinality(concern_types)=0 and onset is null))
);
alter table prohor_care.support_requests add constraint shonket_onset_value check (
  onset is null or onset in ('now','today','this_week','longer')
);
create index support_requests_shonket_owner on prohor_care.support_requests(owner_user_id,created_at desc,id desc) where workflow='shonket';
create index support_requests_shonket_provider on prohor_care.support_requests(recipient_user_id,created_at,id) where workflow='shonket';

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
  );
$$;

create function public.mvp_shonket_submit_request(p_message text,p_method text,p_concern_types text[],p_onset text,p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); provider_id uuid; r prohor_care.support_requests;
  existing prohor_care.mutation_receipts; v_assignment_id uuid; v_receipt_id uuid;
begin
  if p_message is null or char_length(btrim(p_message)) not between 1 and 1000
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
    if r.workflow<>'shonket' or (r.message,r.method,r.concern_types,r.onset)
      is distinct from (btrim(p_message),p_method,p_concern_types,p_onset)
      then raise exception using errcode='40001',message='Retry conflict'; end if;
    return prohor_care.shonket_dto(r,true);
  end if;

  -- The configured workflow assigns to an approved simulated provider server-side.
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
  insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision)
    values(r.id,actor_id,'submitted',r.revision);
  insert into prohor_care.assignments(request_id,owner_user_id,recipient_user_id,purpose)
    values(r.id,actor_id,provider_id,r.purpose) returning id into v_assignment_id;
  insert into prohor_care.queue_receipts(request_id,assignment_id) values(r.id,v_assignment_id) returning id into v_receipt_id;
  if not exists(select 1 from prohor_care.queue_receipts q where q.id=v_receipt_id and q.request_id=r.id and q.assignment_id=v_assignment_id)
    then raise exception using errcode='P0001',message='Queue unavailable'; end if;
  insert into prohor_care.mutation_receipts(actor_user_id,operation,idempotency_key,request_id)
    values(actor_id,'request.create',p_idempotency_key,r.id);
  return prohor_care.shonket_dto(r,true);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_shonket_my_requests(p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); result jsonb;
begin
  if p_limit is null or p_limit not between 1 and 50 then raise exception using errcode='22023',message='Invalid request'; end if;
  select coalesce(jsonb_agg(prohor_care.shonket_dto(rows.request_row,true) order by rows.created_at desc,rows.id desc),'[]'::jsonb)
    into result from (
      select s as request_row,s.created_at,s.id from prohor_care.support_requests s
      where s.owner_user_id=actor_id and s.workflow='shonket' order by s.created_at desc,s.id desc limit p_limit
    ) rows;
  return result;
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_shonket_provider_requests(p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); result jsonb;
begin
  if p_limit is null or p_limit not between 1 and 50 then raise exception using errcode='22023',message='Invalid request'; end if;
  perform prohor_care.recipient(actor_id);
  select coalesce(jsonb_agg(prohor_care.shonket_dto(rows.request_row,false) order by rows.created_at,rows.id),'[]'::jsonb)
    into result from (
      select s as request_row,s.created_at,s.id from prohor_care.support_requests s
      where s.recipient_user_id=actor_id and s.workflow='shonket' and s.status in ('submitted','delivered','acknowledged')
      and prohor_care.provider_access(s,actor_id) order by s.created_at,s.id limit p_limit
    ) rows;
  return result;
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function public.mvp_shonket_open_request(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); r prohor_care.support_requests; receipt_id uuid;
begin
  perform prohor_care.recipient(actor_id);
  select * into r from prohor_care.support_requests where id=p_id and workflow='shonket'
    and recipient_user_id=actor_id for update;
  if not found or not prohor_care.provider_access(r,actor_id) then
    raise exception using errcode='P0002',message='Resource unavailable';
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

-- Existing Bondhon read surfaces must not implicitly expose an unopened
-- Shonket request. The dedicated POST /open operation records delivery.
create or replace function public.mvp_care_get_request(p_id uuid)
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
  if actor_role<>'provider' or r.workflow='shonket' or not prohor_care.provider_access(r,actor_id)
    then raise exception using errcode='P0002',message='Resource unavailable'; end if;
  insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action) values(actor_id,r.owner_user_id,r.id,'request.provider_read');
  return prohor_care.provider_dto(r);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create or replace function public.mvp_care_provider_requests(p_limit integer default 20,p_after_created_at timestamptz default null,p_after_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('provider'); r prohor_care.support_requests;
  items jsonb:='[]'::jsonb; last_row prohor_care.support_requests; has_more boolean:=false;
begin
  if p_limit is null or p_limit not between 1 and 50 or (p_after_created_at is null)<>(p_after_id is null)
    or (p_after_created_at is not null and not isfinite(p_after_created_at))
    then raise exception using errcode='22023',message='Invalid request'; end if;
  perform prohor_care.recipient(actor_id);
  for r in select s.* from prohor_care.support_requests s where s.recipient_user_id=actor_id
    and s.workflow<>'shonket' and s.status<>'closed'
    and (p_after_id is null or (s.created_at,s.id)>(p_after_created_at,p_after_id))
    order by s.created_at,s.id for update of s
  loop
    if prohor_care.provider_access(r,actor_id) then
      if jsonb_array_length(items)=p_limit then has_more:=true; exit; end if;
      insert into prohor_care.audit_events(actor_user_id,owner_user_id,resource_id,action)
        values(actor_id,r.owner_user_id,r.id,'request.provider_read');
      items:=items || jsonb_build_array(prohor_care.provider_summary(r)); last_row:=r;
    end if;
  end loop;
  return jsonb_build_object('items',items,'nextCursor',case when has_more then
    jsonb_build_object('createdAt',last_row.created_at,'id',last_row.id)::text else null end);
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

create function prohor_care.guard_shonket_phase_scope()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.workflow='shonket' and new.status not in ('submitted','delivered','acknowledged') then
    raise exception using errcode='40001',message='Shonket phase scope conflict';
  end if;
  return new;
end;
$$;
create trigger shonket_phase_scope before update of status on prohor_care.support_requests
for each row execute function prohor_care.guard_shonket_phase_scope();

-- Provider-opened delivery is evidenced by the assigned provider and queue receipt.
-- Keep SECURITY DEFINER: the hosted definition has it, and CREATE OR REPLACE would otherwise drop it.
create or replace function prohor_care.check_request_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare r prohor_care.support_requests;
begin
  select * into r from prohor_care.support_requests where id=new.id;
  if not exists(select 1 from prohor_care.request_events e where e.request_id=r.id
    and e.status=r.status and e.request_revision=r.revision
    and (e.status<>'submitted' or e.actor_user_id=r.owner_user_id)
    and (e.status<>'delivered' or e.actor_user_id=r.owner_user_id or exists(
      select 1 from prohor_care.queue_receipts q join prohor_care.assignments a
        on a.id=q.assignment_id and a.request_id=q.request_id
      where q.id=e.receipt_id and q.request_id=r.id and a.recipient_user_id=e.actor_user_id
    ))
    and (e.reason is distinct from 'owner_closed' or e.actor_user_id=r.owner_user_id)) then
    raise exception using errcode='23514',message='Request status evidence required';
  end if;
  return null;
end;
$$;

do $$ declare signature regprocedure; begin
  foreach signature in array array[
    'public.mvp_shonket_submit_request(text,text,text[],text,uuid)'::regprocedure,
    'public.mvp_shonket_my_requests(integer)'::regprocedure,
    'public.mvp_shonket_provider_requests(integer)'::regprocedure,
    'public.mvp_shonket_open_request(uuid)'::regprocedure
  ] loop
    execute format('alter function %s owner to postgres',signature);
    execute format('revoke all on function %s from public,anon,authenticated,service_role',signature);
    execute format('grant execute on function %s to authenticated',signature);
  end loop;
end; $$;
revoke all on function prohor_care.shonket_dto(prohor_care.support_requests,boolean) from public,anon,authenticated,service_role;
revoke all on function prohor_care.valid_shonket_concerns(text[]) from public,anon,authenticated,service_role;
revoke all on function prohor_care.guard_shonket_phase_scope() from public,anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
