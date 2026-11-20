-- Let a mother fix the label/dates of her own pregnancy and baby records.
-- Records stay self-reported and synthetic. Every edit first copies the previous
-- values into jr_profile_edits, so nothing she entered is silently lost.
-- jr_save is left untouched (it carries in-place patches from later migrations).
-- Rollback: drop function public.jr_edit_profile(text,uuid,jsonb); drop table public.jr_profile_edits;
begin;

create table public.jr_profile_edits (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(user_id),
  subject text not null check (subject in ('pregnancy', 'baby')),
  record_id uuid not null,
  previous jsonb not null check (jsonb_typeof(previous) = 'object'),
  edited_at timestamptz not null default now()
);
alter table public.jr_profile_edits enable row level security;
revoke all on public.jr_profile_edits from public, anon, authenticated;
grant select on public.jr_profile_edits to authenticated;
create policy jr_profile_edits_owner_read on public.jr_profile_edits for select to authenticated
  using (owner_user_id = (select auth.uid()) and (select public.mvp_private_is_mother()));
create index jr_profile_edits_owner_record on public.jr_profile_edits(owner_user_id, record_id, edited_at desc);

create function public.jr_edit_profile(p_subject text, p_id uuid, p_data jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_variable
declare
  me uuid := auth.uid();
  old_pregnancy public.pregnancy_records;
  old_baby public.baby_records;
  parent_id uuid;
begin
  if me is null or not public.mvp_private_is_mother() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_id is null or p_data is null or jsonb_typeof(p_data) <> 'object'
    or char_length(btrim(p_data->>'label')) not between 1 and 100 then
    raise exception 'invalid request' using errcode = '22023';
  end if;

  if p_subject = 'pregnancy' then
    if p_data->>'due' is not null and p_data->>'period' is not null and (p_data->>'due')::date <= (p_data->>'period')::date then
      raise exception 'invalid dates' using errcode = '22023';
    end if;
    select * into old_pregnancy from public.pregnancy_records where id = p_id and owner_user_id = me for update;
    if not found then raise exception 'not found' using errcode = 'P0002'; end if;
    insert into public.jr_profile_edits(owner_user_id, subject, record_id, previous)
      values (me, p_subject, p_id, jsonb_build_object('label', old_pregnancy.label,
        'estimatedDueDate', old_pregnancy.estimated_due_date, 'lastMenstrualPeriodDate', old_pregnancy.last_menstrual_period_date));
    update public.pregnancy_records
      set label = btrim(p_data->>'label'), estimated_due_date = (p_data->>'due')::date,
          last_menstrual_period_date = (p_data->>'period')::date, updated_at = now()
      where id = p_id and owner_user_id = me;
  elsif p_subject = 'baby' then
    parent_id := (p_data->>'pregnancyId')::uuid;
    if parent_id is not null and not exists (select 1 from public.pregnancy_records where id = parent_id and owner_user_id = me) then
      raise exception 'not owned' using errcode = '42501';
    end if;
    if (p_data->>'birthDate')::date > (now() at time zone 'Asia/Dhaka')::date then
      raise exception 'future date' using errcode = '22023';
    end if;
    select * into old_baby from public.baby_records where id = p_id and owner_user_id = me for update;
    if not found then raise exception 'not found' using errcode = 'P0002'; end if;
    insert into public.jr_profile_edits(owner_user_id, subject, record_id, previous)
      values (me, p_subject, p_id, jsonb_build_object('label', old_baby.label,
        'pregnancyId', old_baby.pregnancy_id, 'birthDate', old_baby.birth_date));
    update public.baby_records
      set label = btrim(p_data->>'label'), pregnancy_id = parent_id, birth_date = (p_data->>'birthDate')::date, updated_at = now()
      where id = p_id and owner_user_id = me;
  else
    raise exception 'unsupported subject' using errcode = '22023';
  end if;
  return p_id;
end $$;
revoke all on function public.jr_edit_profile(text,uuid,jsonb) from public, anon;
grant execute on function public.jr_edit_profile(text,uuid,jsonb) to authenticated;

commit;
