-- Additive review gate. The previous direct commit RPC is revoked before the new API is deployed.
begin;
revoke execute on function public.bujhi_commit_reviewed_hemoglobin(uuid,uuid,text,text,text,text,text,text,date) from authenticated;

create table public.bujhi_field_decisions (
  review_id uuid not null default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id) on delete cascade,
  report_id uuid not null,
  pregnancy_id uuid not null,
  field_id uuid not null,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  raw_label text not null, raw_value text not null, raw_unit text not null,
  reviewed_value text not null, reviewed_unit text not null,
  observed_on date not null,
  decision text not null check (decision in ('verified','pending','rejected')),
  verified_by uuid references public.profiles(user_id),
  verified_at timestamptz,
  observation_id uuid,
  created_at timestamptz not null default now(),
  primary key (review_id,field_id),
  unique (owner_user_id,report_id,field_id),
  foreign key (pregnancy_id,owner_user_id) references public.pregnancy_records(id,owner_user_id),
  foreign key (observation_id,owner_user_id) references public.health_observations(id,owner_user_id),
  check ((decision='verified')=(verified_by is not null and verified_at is not null))
);
create unique index bujhi_field_decisions_observation on public.bujhi_field_decisions(observation_id) where observation_id is not null;
alter table public.bujhi_field_decisions enable row level security;
alter table public.bujhi_field_decisions force row level security;
revoke all on public.bujhi_field_decisions from public,anon,authenticated;
grant select on public.bujhi_field_decisions to authenticated;
create policy bujhi_field_owner_read on public.bujhi_field_decisions for select to authenticated
  using (owner_user_id=(select auth.uid()));

create function public.bujhi_record_field_decision(
  p_report_id uuid,p_pregnancy_id uuid,p_field_id uuid,p_source_sha256 text,
  p_raw_label text,p_raw_value text,p_raw_unit text,p_reviewed_value text,
  p_reviewed_unit text,p_observed_on date,p_decision text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); existing public.bujhi_field_decisions; review uuid;
begin
  if actor is null or not exists(select 1 from public.profiles where user_id=actor and role='mother')
     or not exists(select 1 from public.pregnancy_records where id=p_pregnancy_id and owner_user_id=actor) then
    raise exception 'account or pregnancy unavailable' using errcode='42501'; end if;
  if p_report_id is null or p_field_id is null or p_source_sha256 !~ '^[0-9a-f]{64}$'
     or p_decision not in ('verified','pending','rejected') or p_decision is null
     or p_observed_on is null or p_observed_on>(now() at time zone 'Asia/Dhaka')::date
     or char_length(p_raw_label) not between 1 and 120 or char_length(p_raw_value)>40
     or char_length(p_raw_unit)>20 or char_length(p_reviewed_value)>40 or char_length(p_reviewed_unit)>20 then
    raise exception 'invalid review' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text||':'||p_report_id::text||':'||p_field_id::text,0));
  select * into existing from public.bujhi_field_decisions
    where owner_user_id=actor and report_id=p_report_id and field_id=p_field_id for update;
  if found then
    if existing.pregnancy_id=p_pregnancy_id and existing.source_sha256=p_source_sha256
       and existing.raw_label=p_raw_label and existing.raw_value=p_raw_value and existing.raw_unit=p_raw_unit
       and existing.reviewed_value=p_reviewed_value and existing.reviewed_unit=p_reviewed_unit
       and existing.observed_on=p_observed_on and existing.decision=p_decision then return existing.review_id; end if;
    raise exception 'review immutable' using errcode='PT409';
  end if;
  insert into public.bujhi_field_decisions(owner_user_id,report_id,pregnancy_id,field_id,source_sha256,
    raw_label,raw_value,raw_unit,reviewed_value,reviewed_unit,observed_on,decision,verified_by,verified_at)
  values(actor,p_report_id,p_pregnancy_id,p_field_id,p_source_sha256,p_raw_label,p_raw_value,p_raw_unit,
    p_reviewed_value,p_reviewed_unit,p_observed_on,p_decision,
    case when p_decision='verified' then actor end,case when p_decision='verified' then now() end)
  returning review_id into review;
  return review;
end $$;

create function public.bujhi_commit_verified_field(p_review_id uuid,p_field_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item public.bujhi_field_decisions; observation uuid;
begin
  if actor is null or not exists(select 1 from public.profiles where user_id=actor and role='mother') then
    raise exception 'not authorized' using errcode='42501'; end if;
  select * into item from public.bujhi_field_decisions
    where review_id=p_review_id and field_id=p_field_id and owner_user_id=actor for update;
  if not found then raise exception 'review unavailable' using errcode='42501'; end if;
  if item.decision<>'verified' or item.verified_by is distinct from actor or item.verified_at is null then
    raise exception 'field not verified' using errcode='22023'; end if;
  if item.observation_id is not null then return item.observation_id; end if;
  if lower(btrim(item.raw_label)) not in ('hemoglobin','haemoglobin','hb','hgb')
     or item.reviewed_value !~ '^[0-9]{1,3}(\.[0-9]{1,2})?$'
     or item.reviewed_unit<>'g/dL' then
    raise exception 'unsupported account field' using errcode='22023'; end if;
  if not exists(select 1 from public.pregnancy_records where id=item.pregnancy_id and owner_user_id=actor) then
    raise exception 'pregnancy unavailable' using errcode='42501'; end if;
  insert into public.health_observations(owner_user_id,pregnancy_id,kind,value,unit,observed_at,
    source,verification,recorded_by_user_id,source_note)
  values(actor,item.pregnancy_id,'hemoglobin',item.reviewed_value,'g/dL',
    item.observed_on::timestamp at time zone 'Asia/Dhaka','document_extracted','user_verified',actor,
    case when item.raw_value='' then 'Bujhi manual entry; reviewed by mother' else 'Bujhi OCR; reviewed by mother' end)
  returning id into observation;
  update public.bujhi_field_decisions set observation_id=observation where review_id=p_review_id and field_id=p_field_id;
  return observation;
end $$;
revoke all on function public.bujhi_record_field_decision(uuid,uuid,uuid,text,text,text,text,text,text,date,text) from public,anon;
revoke all on function public.bujhi_commit_verified_field(uuid,uuid) from public,anon;
grant execute on function public.bujhi_record_field_decision(uuid,uuid,uuid,text,text,text,text,text,text,date,text) to authenticated;
grant execute on function public.bujhi_commit_verified_field(uuid,uuid) to authenticated;
commit;
