import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const a = "a6000000-0000-4000-8000-000000000001";
const b = "a6000000-0000-4000-8000-000000000002";
const provider = "a6000000-0000-4000-8000-000000000003";
const key = "a6000000-0000-4000-8000-000000000011";

async function asUser(user, role, operation) {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [user ?? ""]);
    return operation(tx);
  });
}

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    grant usage on schema public,auth to anon,authenticated,service_role;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
    $$;
    create table public.profiles(user_id uuid primary key,role text not null);
    insert into public.profiles values ('${a}','mother'),('${b}','mother'),('${provider}','provider');
    create function public.mvp_private_is_mother() returns boolean language sql stable security definer set search_path='' as $$
      select exists(select 1 from public.profiles where user_id=auth.uid() and role='mother');
    $$;
    grant execute on function public.mvp_private_is_mother() to authenticated;
  `);
  const migration = await readFile(new URL("../../supabase/migrations/20261119184243_shusthota_p1_wellness_records.sql", import.meta.url), "utf8");
  await db.exec(migration);
});

after(async () => { await db.close(); });

test("hydration defaults owner and synthetic provenance; isolates owners; rejects invalid values and duplicate retries", async () => {
  const created = await asUser(a, "authenticated", tx => tx.query(
    "insert into public.hydration_entries(amount_ml, occurred_at, retry_key) values (250,now(),$1) returning *", [key]));
  assert.equal(created.rows[0].owner_user_id, a);
  assert.equal(created.rows[0].data_mode, "synthetic");
  assert.equal((await asUser(b, "authenticated", tx => tx.query("select id from public.hydration_entries"))).rows.length, 0);
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.hydration_entries(amount_ml,retry_key) values (0,$1)", ["a6000000-0000-4000-8000-000000000012"])), { code: "23514" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.hydration_entries(amount_ml,retry_key) values (250,$1)", [key])), { code: "23505" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.hydration_entries(owner_user_id,amount_ml,retry_key) values ($1,250,$2)", [b,"a6000000-0000-4000-8000-000000000013"])), { code: "42501" });
  await assert.rejects(asUser(provider, "authenticated", tx => tx.query(
    "insert into public.hydration_entries(amount_ml,retry_key) values (250,$1)", ["a6000000-0000-4000-8000-000000000014"])), { code: "42501" });
  await assert.rejects(asUser(null, "anon", tx => tx.query(
    "insert into public.hydration_entries(amount_ml,retry_key) values (250,$1)", ["a6000000-0000-4000-8000-000000000015"])), { code: "42501" });
});

test("habit events enforce same-owner references, append-only operations and mother role", async () => {
  const habit = await asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habits(label,icon,retry_key) values ('My own routine','custom',$1) returning id", ["a6000000-0000-4000-8000-000000000021"]));
  const event = await asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,retry_key) values ($1,'completed',$2) returning id",
    [habit.rows[0].id,"a6000000-0000-4000-8000-000000000022"]));
  const undo = await asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,related_event_id,retry_key) values ($1,'completion_undone',$2,$3) returning id",
    [habit.rows[0].id,event.rows[0].id,"a6000000-0000-4000-8000-000000000025"]));
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,related_event_id,retry_key) values ($1,'completion_undone',$2,$3)",
    [habit.rows[0].id,event.rows[0].id,"a6000000-0000-4000-8000-000000000026"])), { code: "23505" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,related_event_id,retry_key) values ($1,'completion_undone',$2,$3)",
    [habit.rows[0].id,event.rows[0].id,"a6000000-0000-4000-8000-000000000027"])), { code: "23505" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,related_event_id,retry_key) values ($1,'completion_undone',$2,$3)",
    [habit.rows[0].id,undo.rows[0].id,"a6000000-0000-4000-8000-000000000028"])), { code: "23503" });
  await assert.rejects(asUser(b, "authenticated", tx => tx.query(
    "insert into public.wellness_habit_events(habit_id,event_type,retry_key) values ($1,'completed',$2)",
    [habit.rows[0].id,"a6000000-0000-4000-8000-000000000023"])), { code: "23503" });
  await assert.rejects(asUser(provider, "authenticated", tx => tx.query(
    "insert into public.wellness_habits(label,icon,retry_key) values ('No provider habit','custom',$1)", ["a6000000-0000-4000-8000-000000000024"])), { code: "42501" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query("update public.wellness_habits set label='changed' where id=$1", [habit.rows[0].id])), { code: "42501" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query("delete from public.wellness_habit_events where id=$1", [event.rows[0].id])), { code: "42501" });
  assert.equal((await asUser(provider, "authenticated", tx => tx.query("select * from public.wellness_habit_events"))).rows.length, 0);
});

test("activity preferences are optional, synthetic snapshots with constrained values", async () => {
  const empty = await asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_activity_preferences(preferences,retry_key) values ('{}',$1) returning *",
    ["a6000000-0000-4000-8000-000000000031"]));
  assert.deepEqual(empty.rows[0].preferences, []);
  assert.equal(empty.rows[0].data_mode, "synthetic");
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_activity_preferences(preferences,retry_key) values ('{walking,walking}',$1)",
    ["a6000000-0000-4000-8000-000000000032"])), { code: "23514" });
  await assert.rejects(asUser(a, "authenticated", tx => tx.query(
    "insert into public.wellness_activity_preferences(preferences,retry_key) values ('{none,walking}',$1)",
    ["a6000000-0000-4000-8000-000000000033"])), { code: "23514" });
  await assert.rejects(asUser(provider, "authenticated", tx => tx.query(
    "insert into public.wellness_activity_preferences(preferences,retry_key) values ('{}',$1)", ["a6000000-0000-4000-8000-000000000034"])), { code: "42501" });
});

test("anonymous users cannot read private P1 records and every table forces RLS", async () => {
  await assert.rejects(asUser(null,"anon",tx=>tx.query("select * from public.hydration_entries")),{code:"42501"});
  const rows=await db.query("select relname,relrowsecurity,relforcerowsecurity from pg_class where relnamespace='public'::regnamespace and relname=any($1::text[])",["{hydration_entries,wellness_habits,wellness_habit_events,wellness_activity_preferences}"]);
  assert.equal(rows.rows.length,4);
  assert(rows.rows.every(row=>row.relrowsecurity&&row.relforcerowsecurity));
  for(const table of ["hydration_entries","wellness_habits","wellness_habit_events","wellness_activity_preferences"]){
    assert.equal((await db.query("select has_table_privilege('service_role',$1,'SELECT') as allowed",[`public.${table}`])).rows[0].allowed,false);
  }
});
