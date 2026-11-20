-- Additive: read-only supporter activity history for the signed-in mother or supporter. Not applied to any hosted database.
begin;
create function public.prohor_supporter_activity() returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'action',e.action,'occurredAt',e.occurred_at,'connectionId',e.resource_id,
           'byYou',e.actor_id=auth.uid()) order by e.occurred_at desc),'[]'::jsonb)
  from (select * from public.account_access_events
        where action in ('supporter_invited','supporter_accepted','supporter_revoked')
          and (actor_id=auth.uid() or subject_id=auth.uid())
        order by occurred_at desc limit 50) e
  where auth.uid() is not null;
$$;
revoke all on function public.prohor_supporter_activity() from public,anon,authenticated;
grant execute on function public.prohor_supporter_activity() to authenticated;
commit;
