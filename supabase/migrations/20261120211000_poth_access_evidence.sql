begin;
create table public.poth_access_evidence (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null,
  attribute text not null check(attribute in ('wheelchair','accessibleToilet','hearingLoop')),
  value text not null check(value in ('reported_available','reported_limited','reported_unavailable','unknown')),
  verification_status text not null default 'unverified' check(verification_status in ('unverified','verified','withdrawn')),
  verification_source text,
  verified_by uuid references public.profiles(user_id),
  verified_on date,
  updated_at timestamptz not null default now(),
  unique(facility_id,attribute),
  check (verification_status<>'verified' or
    (verification_source is not null and char_length(btrim(verification_source))>0 and verified_by is not null and verified_on is not null))
);
alter table public.poth_access_evidence enable row level security;
alter table public.poth_access_evidence force row level security;
revoke all on public.poth_access_evidence from public,anon,authenticated;
grant select on public.poth_access_evidence to anon,authenticated;
create policy poth_verified_public_read on public.poth_access_evidence for select to anon,authenticated
  using (verification_status='verified');
-- No browser write grant: a verified claim requires an authorized review workflow.
commit;
