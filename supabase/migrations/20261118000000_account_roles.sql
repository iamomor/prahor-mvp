-- Role-aware onboarding. Apply forward after review; no reset or clinical tables.
begin;
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles alter column role set default 'member';
alter table public.profiles add constraint profiles_role_check
  check (role in ('mother','provider','supporter','member'));

create table public.account_role_memberships (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role text not null check(role in ('mother','provider','supporter')),
  status text not null check(status in ('approved','pending','revoked')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz, reviewed_by text,
  primary key(user_id,role)
);
create table public.account_onboarding (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  completed_at timestamptz not null default now()
);
create table public.provider_applications (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  kinds text[] not null check(cardinality(kinds) between 1 and 2 and kinds <@ array['doctor','chw']::text[]),
  organization text not null check(char_length(organization) between 1 and 160),
  registration_number text not null check(char_length(registration_number)<=100),
  status text not null default 'pending' check(status in ('pending','approved','revoked')),
  mode text not null default 'simulated' check(mode='simulated'),
  check(not ('doctor'=any(kinds)) or char_length(registration_number)>0)
);
create table public.supporter_connections (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles(user_id) on delete cascade,
  supporter_id uuid not null references public.profiles(user_id) on delete cascade,
  scopes text[] not null check(cardinality(scopes) between 1 and 2 and scopes <@ array['visit_preparation','care_coordination']::text[]),
  token_hash text not null unique,
  created_at timestamptz not null default now(), expires_at timestamptz not null,
  accepted_at timestamptz, revoked_at timestamptz,
  check(mother_id<>supporter_id), check(isfinite(expires_at) and expires_at>created_at)
);
create index supporter_connections_mother on public.supporter_connections(mother_id,created_at desc);
create index supporter_connections_supporter on public.supporter_connections(supporter_id,created_at desc);
create table public.account_access_events (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(user_id) on delete set null,
  subject_id uuid references public.profiles(user_id) on delete set null,
  action text not null check(action in ('onboard','switch','provider_approved','provider_revoked','supporter_invited','supporter_accepted','supporter_revoked')),
  resource_id uuid, occurred_at timestamptz not null default now(), reviewer text
);

-- Preserve existing accounts and active roles; no bulk promotion.
insert into public.account_role_memberships(user_id,role,status)
select user_id,role,'approved' from public.profiles where role in ('mother','provider');
-- Existing accounts may complete their name and add roles via /account.
create or replace function public.day2_provision_auth_user()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(user_id,role) values(new.id,'member') on conflict do nothing;
  insert into public.access_preferences(user_id) values(new.id) on conflict do nothing;
  return new;
end;
$$;

create function public.prohor_roles_version() returns integer
language sql immutable set search_path='' as $$ select 1; $$;

create function public.prohor_account_access() returns jsonb
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
    'roles',coalesce((select jsonb_agg(jsonb_build_object('role',role,'status',status) order by role)
      from public.account_role_memberships where user_id=actor),'[]'::jsonb),
    'provider',(select jsonb_build_object('kinds',kinds,'organization',organization,
      'registrationNumber',registration_number,'status',status,'mode',mode)
      from public.provider_applications where user_id=actor));
  return result;
end;
$$;

create function public.prohor_complete_onboarding(p_name text,p_purposes text[],p_organization text,p_registration text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); purpose text; selected_role text; kinds text[];
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if char_length(btrim(p_name)) not between 1 and 120 or p_name is null
    or p_purposes is null or cardinality(p_purposes) not between 1 and 4
    or not(p_purposes <@ array['mother','supporter','doctor','chw']::text[])
    or array_position(p_purposes,null) is not null
    or char_length(coalesce(p_organization,''))>160 or char_length(coalesce(p_registration,''))>100 then
    raise exception 'Invalid profile' using errcode='22023'; end if;
  select coalesce(array_agg(x order by x),'{}'::text[]) into kinds
    from (select distinct unnest(p_purposes) x) s where x in ('doctor','chw');
  if cardinality(kinds)>0 and (char_length(btrim(coalesce(p_organization,'')))=0
    or ('doctor'=any(kinds) and char_length(btrim(coalesce(p_registration,'')))=0)) then
    raise exception 'Professional details required' using errcode='22023'; end if;
  -- Repeat after uncertain success is safe; approved applications cannot be edited through onboarding.
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

create function public.prohor_switch_workspace(p_role text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if not exists(select 1 from public.account_role_memberships where user_id=actor and role=p_role and status='approved') then
    raise exception 'Role unavailable' using errcode='42501'; end if;
  update public.profiles set role=p_role where user_id=actor;
  insert into public.account_access_events(actor_id,subject_id,action) values(actor,actor,'switch');
  return public.prohor_account_access();
end;
$$;

-- Operator-only review: no browser/anon/authenticated/service_role execution.
-- select public.prohor_review_provider('<account UUID>', true, '<operator name>');
create function public.prohor_review_provider(p_user uuid,p_approve boolean,p_reviewer text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_approve is null or char_length(btrim(coalesce(p_reviewer,''))) not between 1 and 120 then
    raise exception 'Reviewer required' using errcode='22023'; end if;
  perform 1 from public.profiles where user_id=p_user for update;
  if not exists(select 1 from public.provider_applications where user_id=p_user) then
    raise exception 'Application not found' using errcode='P0002'; end if;
  update public.provider_applications set status=case when p_approve then 'approved' else 'revoked' end where user_id=p_user;
  update public.account_role_memberships set status=case when p_approve then 'approved' else 'revoked' end,
    reviewed_at=now(),reviewed_by=btrim(p_reviewer) where user_id=p_user and role='provider';
  update public.profiles set role=case when p_approve and role='member' then 'provider'
    when not p_approve and role='provider' then coalesce((select role from public.account_role_memberships
      where user_id=p_user and role<>'provider' and status='approved' order by role limit 1),'member') else role end
    where user_id=p_user;
  insert into public.account_access_events(subject_id,action,reviewer)
    values(p_user,case when p_approve then 'provider_approved' else 'provider_revoked' end,btrim(p_reviewer));
end;
$$;

create function public.prohor_supporter_connections() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
  perform public.prohor_account_access();
  return coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'motherId',c.mother_id,
    'supporterId',c.supporter_id,'motherName',m.display_name,'supporterName',s.display_name,
    'scopes',c.scopes,'expiresAt',c.expires_at,'status',case when c.revoked_at is not null then 'revoked'
      when c.expires_at<=clock_timestamp() then 'expired' when c.accepted_at is not null then 'active' else 'pending' end)
    order by c.created_at desc) from public.supporter_connections c
    join public.profiles m on m.user_id=c.mother_id join public.profiles s on s.user_id=c.supporter_id
    where (c.mother_id=actor and exists(select 1 from public.account_role_memberships where user_id=actor and role='mother' and status='approved'))
      or (c.supporter_id=actor and exists(select 1 from public.account_role_memberships where user_id=actor and role='supporter' and status='approved'))),'[]'::jsonb);
end;
$$;

create function public.prohor_invite_supporter(p_supporter uuid,p_scopes text[],p_expires timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); token text:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''); connection_id uuid;
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if not exists(select 1 from public.account_role_memberships where user_id=actor and role='mother' and status='approved')
    or actor=p_supporter or not exists(select 1 from public.account_role_memberships where user_id=p_supporter and role='supporter' and status='approved') then
    raise exception 'Recipient unavailable' using errcode='42501'; end if;
  if p_scopes is null or cardinality(p_scopes) not between 1 and 2
    or array_position(p_scopes,null) is not null or not(p_scopes <@ array['visit_preparation','care_coordination']::text[])
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

create function public.prohor_accept_supporter(p_code text) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); c public.supporter_connections;
begin
  perform public.prohor_account_access();
  perform 1 from public.profiles where user_id=actor for update;
  if not exists(select 1 from public.account_role_memberships where user_id=actor and role='supporter' and status='approved') then
    raise exception 'Supporter access required' using errcode='42501'; end if;
  select * into c from public.supporter_connections where supporter_id=actor
    and token_hash=encode(sha256(convert_to(p_code,'UTF8')),'hex') for update;
  if c.id is null or c.revoked_at is not null or c.expires_at<=clock_timestamp()
    or not exists(select 1 from public.account_role_memberships where user_id=c.mother_id and role='mother' and status='approved') then
    raise exception 'Invitation unavailable' using errcode='P0002'; end if;
  if c.accepted_at is null then
    update public.supporter_connections set accepted_at=clock_timestamp() where id=c.id;
    insert into public.account_access_events(actor_id,subject_id,action,resource_id) values(actor,c.mother_id,'supporter_accepted',c.id);
  end if;
end;
$$;

create function public.prohor_revoke_supporter(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); c public.supporter_connections;
begin
  perform public.prohor_account_access();
  select * into c from public.supporter_connections where id=p_id and (mother_id=actor or supporter_id=actor) for update;
  if c.id is null then raise exception 'Connection unavailable' using errcode='P0002'; end if;
  if c.revoked_at is null then
    update public.supporter_connections set revoked_at=clock_timestamp() where id=c.id;
    insert into public.account_access_events(actor_id,subject_id,action,resource_id)
      values(actor,case when actor=c.mother_id then c.supporter_id else c.mother_id end,'supporter_revoked',c.id);
  end if;
end;
$$;

do $$ declare resource text; fn record; begin
  foreach resource in array array['account_role_memberships','account_onboarding','provider_applications','supporter_connections','account_access_events'] loop
    execute format('alter table public.%I enable row level security',resource);
    execute format('alter table public.%I force row level security',resource);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',resource);
  end loop;
  for fn in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('prohor_roles_version','prohor_account_access','prohor_complete_onboarding',
      'prohor_switch_workspace','prohor_review_provider','prohor_supporter_connections','prohor_invite_supporter',
      'prohor_accept_supporter','prohor_revoke_supporter') loop
    execute format('alter function %s owner to postgres',fn.signature);
    execute format('revoke all on function %s from public,anon,authenticated,service_role',fn.signature);
  end loop;
end $$;
grant execute on function public.prohor_roles_version() to anon,authenticated;
grant execute on function public.prohor_account_access(),public.prohor_complete_onboarding(text,text[],text,text),
  public.prohor_switch_workspace(text),public.prohor_supporter_connections(),public.prohor_invite_supporter(uuid,text[],timestamptz),
  public.prohor_accept_supporter(text),public.prohor_revoke_supporter(uuid) to authenticated;
commit;
