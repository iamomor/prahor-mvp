-- New requests must use the atomic, explicitly approved expiring permission path.
-- The SECURITY DEFINER coordinator retains owner execution of this building block.
-- Historical requests and their read/action functions are unchanged.
begin;
revoke all on function public.mvp_care_create_request(uuid,text,text,text,uuid[],boolean,uuid)
  from public,anon,authenticated,service_role;
notify pgrst, 'reload schema';
commit;
