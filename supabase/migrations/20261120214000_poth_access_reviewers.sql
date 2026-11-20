-- Additive: only people listed in poth_access_reviewers (inserted by a database administrator, never by the browser)
-- can publish, change or withdraw a Poth access claim. Not applied to any hosted database.
begin;
create table public.poth_access_reviewers (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.poth_access_reviewers enable row level security;
alter table public.poth_access_reviewers force row level security;
revoke all on public.poth_access_reviewers from public,anon,authenticated;
grant select on public.poth_access_reviewers to authenticated;
create policy poth_reviewer_self_read on public.poth_access_reviewers for select to authenticated using (user_id=(select auth.uid()));

create function public.poth_set_access_claim(p_facility_id text,p_attribute text,p_value text,p_status text,p_source text)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
  if actor is null or not exists(select 1 from public.poth_access_reviewers where user_id=actor) then
    raise exception 'not a reviewer' using errcode='42501'; end if;
  if p_facility_id !~ '^(dghs/|(node|way|relation)/)[A-Za-z0-9_-]{1,80}$'
     or p_attribute not in ('wheelchair','accessibleToilet','hearingLoop')
     or p_value not in ('reported_available','reported_limited','reported_unavailable','unknown')
     or p_status not in ('verified','withdrawn')
     or (p_status='verified' and (p_source is null or char_length(btrim(p_source)) not between 3 and 300)) then
    raise exception 'invalid claim' using errcode='22023'; end if;
  insert into public.poth_access_evidence(facility_id,attribute,value,verification_status,verification_source,verified_by,verified_on,updated_at)
  values(p_facility_id,p_attribute,p_value,p_status,nullif(btrim(p_source),''),
    case when p_status='verified' then actor end,
    case when p_status='verified' then (now() at time zone 'Asia/Dhaka')::date end,now())
  on conflict(facility_id,attribute) do update set value=excluded.value,verification_status=excluded.verification_status,
    verification_source=excluded.verification_source,verified_by=excluded.verified_by,verified_on=excluded.verified_on,updated_at=now();
end $$;
revoke all on function public.poth_set_access_claim(text,text,text,text,text) from public,anon;
grant execute on function public.poth_set_access_claim(text,text,text,text,text) to authenticated;
commit;
