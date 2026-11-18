\pset format unaligned
\pset tuples_only on
insert into auth.users(id) values ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),('00000000-0000-0000-0000-0000000000f1');
insert into public.profiles values ('00000000-0000-0000-0000-00000000000a','mother'),('00000000-0000-0000-0000-00000000000b','mother'),('00000000-0000-0000-0000-0000000000f1','provider');
insert into public.pregnancy_records(id,owner_user_id) values ('aaaaaaaa-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a'),('bbbbbbbb-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b');
\set dec_ok '[{"fieldId":"field-5","decision":"accepted","kind":"hemoglobin","value":"11.4","unit":"g/dL","observedOn":"2026-11-14","rawLabel":"Hemoglobin","rawValue":"11.4","rawUnit":"g/dL"},{"fieldId":"field-6","decision":"rejected","rawLabel":"Beta hCG","rawValue":"1250","rawUnit":"mIU/mL"}]'
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select 'B1 A saves review -> ' || status || ' rev ' || revision from public.bujhi_save_review('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-00000000000a','tesseract.js','7.0.0',repeat('a',64),:'dec_ok'::jsonb);
select 'B2 retry same payload -> distinct ids ' || count(distinct id) from public.bujhi_save_review('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-00000000000a','tesseract.js','7.0.0',repeat('a',64),:'dec_ok'::jsonb);
select 'B3 same report id, different content'; select * from public.bujhi_save_review('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-00000000000a','tesseract.js','7.0.0',repeat('a',64),'[{"fieldId":"field-5","decision":"corrected","kind":"hemoglobin","value":"12.0","unit":"g/dL","observedOn":"2026-11-14"}]'::jsonb);
select 'B4 hCG accepted'; select * from public.bujhi_save_review(gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1',null,'[{"fieldId":"field-6","decision":"accepted","kind":"hcg","value":"1250","unit":"mIU/mL","observedOn":"2026-11-14"}]'::jsonb);
select 'B5 wrong unit'; select * from public.bujhi_save_review(gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1',null,'[{"fieldId":"f1","decision":"accepted","kind":"hemoglobin","value":"11.4","unit":"mg/dL","observedOn":"2026-11-14"}]'::jsonb);
select 'B6 bad value 11,4'; select * from public.bujhi_save_review(gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1',null,'[{"fieldId":"f1","decision":"accepted","kind":"hemoglobin","value":"11,4","unit":"g/dL","observedOn":"2026-11-14"}]'::jsonb);
select 'B6b future date'; select * from public.bujhi_save_review(gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1',null,'[{"fieldId":"f1","decision":"accepted","kind":"hemoglobin","value":"11.4","unit":"g/dL","observedOn":"2099-01-01"}]'::jsonb);
select 'B7 other mother''s pregnancy'; select * from public.bujhi_save_review(gen_random_uuid(),'bbbbbbbb-0000-0000-0000-00000000000b','e','1',null,:'dec_ok'::jsonb);
select 'B8 direct INSERT into health_observations'; insert into public.health_observations(owner_user_id,kind,value,source,verification) values ('00000000-0000-0000-0000-00000000000a','hemoglobin','9.9','document_extracted','user_verified');
select 'B9 direct INSERT into document_reviews'; insert into public.document_reviews(owner_user_id,report_id,pregnancy_id,engine,engine_version,decisions,decisions_md5) values ('00000000-0000-0000-0000-00000000000a',gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1','[]','x');
select 'B10 commit stale revision'; select * from public.bujhi_commit_review((select id from public.document_reviews limit 1),5);
select 'B11 commit -> rows ' || count(*) || ' | ' || min(kind||' '||value||' '||unit||' '||source||' '||verification) from public.bujhi_commit_review((select id from public.document_reviews limit 1),1);
select 'B12 commit retry (old revision) -> rows ' || count(*) from public.bujhi_commit_review((select id from public.document_reviews limit 1),1);
select 'B12b review status ' || status || ' rev ' || revision from public.document_reviews;
select 'B13 observations visible to A: ' || count(*) from public.health_observations;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b',false);
select 'B14 B sees A reviews: ' || count(*) from public.document_reviews;
select 'B14b B sees A observations: ' || count(*) from public.health_observations;
select 'B15 B commits A review'; select * from public.bujhi_commit_review((select id from public.document_reviews limit 1),1);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000f1',false);
select 'B16 provider saves review'; select * from public.bujhi_save_review(gen_random_uuid(),'aaaaaaaa-0000-0000-0000-00000000000a','e','1',null,:'dec_ok'::jsonb);
reset role; set role anon; select 'B17 anon'; select * from public.document_reviews;
reset role; select 'B18 totals (superuser): reviews ' || (select count(*) from public.document_reviews) || ', observations ' || (select count(*) from public.health_observations);
