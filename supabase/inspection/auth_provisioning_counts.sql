-- Aggregate operational diagnostics only. No identity, email, token or profile values.
select
  (select count(*) from auth.users where not coalesce(is_anonymous,false)) as nonanonymous_accounts,
  (select count(*) from auth.users where email_confirmed_at is not null and not coalesce(is_anonymous,false)) as confirmed_accounts,
  (select count(*) from auth.users u left join public.profiles p on p.user_id=u.id where p.user_id is null) as missing_profiles,
  (select count(*) from auth.users u left join public.access_preferences p on p.user_id=u.id where p.user_id is null) as missing_preferences,
  (select count(*) from public.profiles where role='provider') as provider_profiles;
