-- Integrate care authorization with approved account memberships. Synthetic MVP only.
begin;

create function prohor_care.sync_provider_approval() returns trigger
language plpgsql security definer set search_path='' as $$
declare subject_id uuid;
begin
  if tg_table_name='account_role_memberships' then
    if coalesce(to_jsonb(new)->>'role',to_jsonb(old)->>'role')<>'provider' then return null; end if;
  end if;
  subject_id:=case when tg_op='DELETE' then old.user_id else new.user_id end;
  if exists(select 1 from public.account_role_memberships m join public.provider_applications a using(user_id)
    where m.user_id=subject_id and m.role='provider' and m.status='approved' and a.status='approved' and a.mode='simulated') then
    insert into prohor_care.provider_approvals(user_id) values(subject_id)
    on conflict(user_id) do update set approved_at=clock_timestamp(),revoked_at=null;
  else
    update prohor_care.provider_approvals set revoked_at=coalesce(revoked_at,clock_timestamp()) where user_id=subject_id;
  end if;
  return null;
end;
$$;
alter function prohor_care.sync_provider_approval() owner to postgres;
revoke all on function prohor_care.sync_provider_approval() from public,anon,authenticated,service_role;
create trigger care_provider_membership after insert or update or delete on public.account_role_memberships
for each row execute function prohor_care.sync_provider_approval();
create trigger care_provider_application after insert or update or delete on public.provider_applications
for each row execute function prohor_care.sync_provider_approval();
insert into prohor_care.provider_approvals(user_id)
select m.user_id from public.account_role_memberships m join public.provider_applications a using(user_id)
where m.role='provider' and m.status='approved' and a.status='approved' and a.mode='simulated';

create or replace function prohor_care.actor(required_role text default null)
returns uuid language plpgsql set search_path='' as $$
declare actor_id uuid:=auth.uid();
begin
  perform 1 from public.profiles p join auth.users u on u.id=p.user_id
    join public.account_role_memberships m on m.user_id=p.user_id and m.role=p.role
    where p.user_id=actor_id and (required_role is null or p.role=required_role)
      and p.role in ('mother','provider') and m.status='approved' and u.email is not null
      and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    for share of p,u,m;
  if not found then raise exception using errcode='42501',message='Access denied'; end if;
  return actor_id;
end;
$$;
create or replace function prohor_care.recipient(provider_id uuid)
returns void language plpgsql set search_path='' as $$
begin
  perform 1 from prohor_care.provider_approvals a join public.profiles p on p.user_id=a.user_id
    join auth.users u on u.id=p.user_id
    join public.account_role_memberships m on m.user_id=p.user_id and m.role='provider'
    join public.provider_applications app on app.user_id=p.user_id
    where a.user_id=provider_id and a.mode='simulated' and a.revoked_at is null and a.approved_at<=clock_timestamp()
      and m.status='approved' and app.status='approved' and app.mode='simulated'
      and u.email_confirmed_at is not null and u.email is not null and not coalesce(u.is_anonymous,false)
    for share of a,p,u,m,app;
  if not found then raise exception using errcode='42501',message='Recipient unavailable'; end if;
end;
$$;
create or replace function public.mvp_care_recipients()
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor_id uuid:=prohor_care.actor('mother'); result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('id',p.user_id,'displayName',p.display_name,'providerMode','simulated') order by p.user_id),'[]'::jsonb)
  into result from prohor_care.provider_approvals a join public.profiles p on p.user_id=a.user_id
    join auth.users u on u.id=p.user_id
    join public.account_role_memberships m on m.user_id=p.user_id and m.role='provider'
    join public.provider_applications app on app.user_id=p.user_id
  where a.revoked_at is null and a.approved_at<=clock_timestamp() and m.status='approved' and app.status='approved'
    and app.mode='simulated' and u.email_confirmed_at is not null and u.email is not null and not coalesce(u.is_anonymous,false);
  return result;
exception when others then perform prohor_care.fail(sqlstate); return null;
end;
$$;

-- Owner-only direct private-table access also needs a current approved mother membership.
create function public.mvp_private_is_mother() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join public.account_role_memberships m
    on m.user_id=p.user_id and m.role='mother' join auth.users u on u.id=p.user_id
    where p.user_id=auth.uid() and p.role='mother' and m.status='approved' and u.email is not null
      and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false));
$$;
alter function public.mvp_private_is_mother() owner to postgres;
revoke all on function public.mvp_private_is_mother() from public,anon,authenticated,service_role;
grant execute on function public.mvp_private_is_mother() to authenticated;
do $$ declare resource text; begin
  foreach resource in array array['pregnancy_records','baby_records','maternal_conditions','health_observations',
    'baby_observations','maternal_symptom_notes','wellness_entries','wellness_diary_entries'] loop
    execute format('drop policy %I on public.%I',resource||'_owner_read',resource);
    execute format('drop policy %I on public.%I',resource||'_owner_create',resource);
    execute format('create policy %I on public.%I for select to authenticated using
      (owner_user_id=(select auth.uid()) and (select public.mvp_private_is_mother()))',resource||'_owner_read',resource);
    execute format('create policy %I on public.%I for insert to authenticated with check
      (owner_user_id=(select auth.uid()) and (select public.mvp_private_is_mother()))',resource||'_owner_create',resource);
  end loop;
end; $$;
notify pgrst,'reload schema';
commit;
