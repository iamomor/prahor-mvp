-- Additive: explicit opt-in record per channel. No provider is configured, so rows never imply that anything was sent. Not applied to any hosted database.
begin;
create table public.notification_opt_ins (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  channel text not null check (channel in ('sms','push')),
  opted_in boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id,channel)
);
alter table public.notification_opt_ins enable row level security;
alter table public.notification_opt_ins force row level security;
revoke all on public.notification_opt_ins from public,anon,authenticated;
grant select,insert,update on public.notification_opt_ins to authenticated;
create policy notification_opt_in_owner_read on public.notification_opt_ins for select to authenticated using (user_id=(select auth.uid()));
create policy notification_opt_in_owner_insert on public.notification_opt_ins for insert to authenticated with check (user_id=(select auth.uid()));
create policy notification_opt_in_owner_update on public.notification_opt_ins for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
commit;
