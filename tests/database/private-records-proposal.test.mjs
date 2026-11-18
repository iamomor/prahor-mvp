import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { establishFixtureRole } from "./care-fixtures.mjs";

// Disposable embedded PostgreSQL only. Never load .env or accept a database URL.
// This executes the proposal in memory, not in Supabase or the migration chain.
const db = new PGlite();
const a = "e3000000-0000-4000-8000-000000000001";
const b = "e3000000-0000-4000-8000-000000000002";
const provider = "e3000000-0000-4000-8000-000000000003";
const stamp = "2026-11-18T00:00:00Z";
const rows = {};
let parents;
let foundationTables;

function asUser(user, operation, role = "authenticated") {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [user ?? ""]);
    return operation(tx);
  });
}
function insert(tx, table, values) {
  const keys = Object.keys(values);
  return tx.query(`insert into public.${table} (${keys.join(",")}) values (${keys.map((_, i) => `$${i + 1}`).join(",")}) returning *`, Object.values(values));
}
const resources = {
  pregnancy_records: () => ({ label: "Synthetic pregnancy", estimated_due_date: null, last_menstrual_period_date: null }),
  baby_records: user => ({ pregnancy_id: parents[user].pregnancy, label: "Synthetic baby", birth_date: null }),
  maternal_conditions: user => ({ pregnancy_id: parents[user].pregnancy, label: "Synthetic self-recorded label", documented_at: stamp, source_note: null }),
  health_observations: user => ({ pregnancy_id: parents[user].pregnancy, kind: "weight", value: "012.3400", unit: "kg", observed_at: stamp, source_note: null }),
  baby_observations: user => ({ baby_id: parents[user].baby, kind: "note", value: "Synthetic baby note", unit: null, observed_at: stamp, source_note: null }),
  maternal_symptom_notes: user => ({ pregnancy_id: parents[user].pregnancy, note: "Synthetic self-recorded note", occurred_at: stamp }),
  wellness_entries: () => ({ occurred_at: stamp, mood: "prefer_not_to_say", energy: null, activity_note: null, rest_note: null }),
  wellness_diary_entries: () => ({ text: "Synthetic private diary", occurred_at: stamp }),
};

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    grant usage on schema public, auth to anon, authenticated, service_role;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz,
      is_anonymous boolean not null default false, raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
  `);
  const directory = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(directory)).filter(name => name.endsWith(".sql") && name < "20261118020000").sort()) {
    await db.exec(await readFile(new URL(file, directory), "utf8"));
  }
  foundationTables = (await db.query("select tablename from pg_tables where schemaname='public'")).rows.map(row => row.tablename);
  await db.exec(await readFile(new URL("../../supabase/proposals/20261118_private_records.sql", import.meta.url), "utf8"));
  for (const [user, email] of [[a, "mother-a"], [b, "mother-b"], [provider, "simulated-provider"]]) {
    await db.query("insert into auth.users(id,email,email_confirmed_at) values ($1,$2,$3)", [user, `${email}@example.invalid`, stamp]);
    await establishFixtureRole(db, user, user === provider ? "provider" : "mother");
  }
  parents = {};
  for (const user of [a, b]) {
    const pregnancy = (await asUser(user, tx => insert(tx, "pregnancy_records", resources.pregnancy_records()))).rows[0].id;
    parents[user] = { pregnancy };
    parents[user].baby = (await asUser(user, tx => insert(tx, "baby_records", resources.baby_records(user)))).rows[0].id;
  }
  // Provider insert tests use valid owned-parent identifiers to reach role denial.
  parents[provider] = { pregnancy: null, baby: parents[a].baby };
  for (const [table, values] of Object.entries(resources)) {
    rows[table] = {};
    for (const user of [a, b]) rows[table][user] = (await asUser(user, tx => insert(tx, table, values(user)))).rows[0];
  }
});
after(async () => { await db.close(); });

for (const [table, values] of Object.entries(resources)) {
  test(`${table}: owner persistence, cross-owner isolation, guest/provider denial and immutable metadata`, async () => {
    const stored = rows[table][a];
    assert.equal(stored.owner_user_id, a);
    assert.equal(stored.data_mode, "synthetic");
    assert.equal(stored.revision, 1);
    assert.equal((await asUser(a, tx => tx.query(`select id from public.${table} where id=$1`, [stored.id]))).rows.length, 1);
    assert.equal((await asUser(b, tx => tx.query(`select id from public.${table} where id=$1`, [stored.id]))).rows.length, 0);
    assert.equal((await asUser(provider, tx => tx.query(`select * from public.${table}`))).rows.length, 0);
    await assert.rejects(asUser(null, tx => tx.query(`select * from public.${table}`), "anon"), { code: "42501" });
    await assert.rejects(asUser(provider, tx => insert(tx, table, values(provider))), { code: "42501" });
    await assert.rejects(asUser(a, tx => insert(tx, table, { ...values(a), owner_user_id: b })), { code: "42501" });
    await assert.rejects(asUser(a, tx => insert(tx, table, { ...values(a), revision: 99 })), { code: "42501" });
    await assert.rejects(asUser(a, tx => tx.query(`update public.${table} set owner_user_id=$1 where id=$2`, [b, stored.id])), { code: "42501" });
    await assert.rejects(asUser(a, tx => tx.query(`delete from public.${table} where id=$1`, [stored.id])), { code: "42501" });
    assert.equal((await db.query(`select owner_user_id from public.${table} where id=$1`, [stored.id])).rows[0].owner_user_id, a);
  });
}

test("every new table forces RLS; no provider role or PUBLIC grants bypass it", async () => {
  const result = await db.query("select relname,relrowsecurity,relforcerowsecurity from pg_class where relnamespace='public'::regnamespace and relname = any($1::text[])", [Object.keys(resources)]);
  assert.equal(result.rows.length, 8);
  assert(result.rows.every(row => row.relrowsecurity && row.relforcerowsecurity));
  for (const table of Object.keys(resources)) {
    const grants = await db.query("select has_table_privilege('service_role',$1,'SELECT') as allowed", [`public.${table}`]);
    assert.equal(grants.rows[0].allowed, false);
  }
});

test("same-owner composite parent constraints deny cross-owner babies and all linked facts", async () => {
  for (const table of ["baby_records", "maternal_conditions", "health_observations", "maternal_symptom_notes"]) {
    await assert.rejects(asUser(a, tx => insert(tx, table, { ...resources[table](a), pregnancy_id: parents[b].pregnancy })), { code: "23503" });
  }
  await assert.rejects(asUser(a, tx => insert(tx, "baby_observations", { ...resources.baby_observations(a), baby_id: parents[b].baby })), { code: "23503" });
  // Even a trusted maintenance mistake cannot violate composite ownership.
  await assert.rejects(insert(db, "baby_records", { owner_user_id: a, pregnancy_id: parents[b].pregnancy, label: "Synthetic invalid link" }), { code: "23503" });
});

test("maternal facts can omit a pregnancy; baby observations must retain a distinct owned baby", async () => {
  const saved = await asUser(a, tx => insert(tx, "health_observations", { ...resources.health_observations(a), pregnancy_id: null }));
  assert.equal(saved.rows[0].pregnancy_id, null);
  assert.equal(saved.rows[0].value, "012.3400");
  await assert.rejects(asUser(a, tx => insert(tx, "baby_observations", { ...resources.baby_observations(a), baby_id: null })), { code: "23502" });
});

test("subject-specific measurement vocabulary rejects mismatched units and malformed decimal strings", async () => {
  for (const patch of [{ unit: "lb" }, { value: "NaN" }, { value: "1e3" }, { value: "1.1234567" }, { kind: "unknown" }, { kind: "fetal_heart_rate", unit: "/min" }]) {
    await assert.rejects(asUser(a, tx => insert(tx, "health_observations", { ...resources.health_observations(a), ...patch })), { code: "23514" });
  }
  for (const patch of [{ kind: "hemoglobin", value: "1", unit: "g/dL" }, { value: "  " }, { unit: "kg" }]) {
    await assert.rejects(asUser(a, tx => insert(tx, "baby_observations", { ...resources.baby_observations(a), ...patch })), { code: "23514" });
  }
});

test("clients cannot forge clinical/OCR provenance, actor, record identity or time", async () => {
  for (const patch of [{ source: "document_extracted" }, { verification: "clinician_confirmed" }, { recorded_by_user_id: b }, { recorded_at: stamp }, { created_at: stamp }, { id: b }, { data_mode: "real" }]) {
    await assert.rejects(asUser(a, tx => insert(tx, "health_observations", { ...resources.health_observations(a), ...patch })), { code: "42501" });
  }
  const own = rows.health_observations[a];
  assert.equal(own.source, "self_reported");
  assert.equal(own.verification, "self_reported");
  assert.equal(own.recorded_by_user_id, a);
});

test("wellness rejects empty/unknown states and keeps diary text in a separate owner-only table", async () => {
  for (const patch of [{ mood: null }, { mood: "diagnosed" }, { rest_note: " " }]) {
    await assert.rejects(asUser(a, tx => insert(tx, "wellness_entries", { ...resources.wellness_entries(a), ...patch })), { code: "23514" });
  }
  await assert.rejects(asUser(a, tx => insert(tx, "wellness_entries", { ...resources.wellness_entries(a), text: "Diary must not be accepted" })), { code: "42703" });
  await assert.rejects(asUser(a, tx => insert(tx, "wellness_diary_entries", { ...resources.wellness_diary_entries(a), privacy: "shared" })), { code: "42501" });
  assert.equal(rows.wellness_diary_entries[a].privacy, "owner_only");
  assert.equal((await asUser(provider, tx => tx.query("select text from public.wellness_diary_entries"))).rows.length, 0);
});

test("invalid or oversized text, nonfinite instants and partial batches roll back", async () => {
  for (const patch of [{ text: " " }, { text: "x".repeat(10001) }, { occurred_at: "infinity" }]) {
    await assert.rejects(asUser(a, tx => insert(tx, "wellness_diary_entries", { ...resources.wellness_diary_entries(a), ...patch })), { code: "23514" });
  }
  const count = (await db.query("select count(*) as count from public.wellness_diary_entries")).rows[0].count;
  await assert.rejects(asUser(a, async tx => {
    await insert(tx, "wellness_diary_entries", resources.wellness_diary_entries(a));
    await insert(tx, "baby_records", { ...resources.baby_records(a), pregnancy_id: parents[b].pregnancy });
  }), { code: "23503" });
  assert.equal((await db.query("select count(*) as count from public.wellness_diary_entries")).rows[0].count, count);
});

test("existing foundation profile/preferences permissions and table chain remain intact", async () => {
  const tables = await db.query("select tablename from pg_tables where schemaname='public' order by tablename");
  assert.deepEqual(tables.rows.map(row => row.tablename), [...foundationTables, ...Object.keys(resources)].sort());
  await assert.rejects(asUser(a, tx => tx.exec("update public.profiles set role='provider'")), { code: "42501" });
  const patched = await asUser(a, tx => tx.query("select * from public.patch_access_preferences($1::jsonb)", ['{"textScale":"large"}']));
  assert.equal(patched.rows[0].settings.textScale, "large");
  assert.equal((await asUser(b, tx => tx.query("select settings from public.access_preferences"))).rows[0].settings.textScale, "default");
});

test("an authenticated database role without a user cannot access or create private rows", async () => {
  for (const [table, values] of Object.entries(resources)) {
    assert.equal((await asUser(null, tx => tx.query(`select * from public.${table}`))).rows.length, 0);
    await assert.rejects(asUser(null, tx => insert(tx, table, values(a))), { code: "42501" });
  }
});

test("operator foundation inspection executes read-only without changing records or schema", async () => {
  const before = await db.query("select tablename from pg_tables where schemaname='public' order by tablename");
  const count = (await db.query("select count(*) as count from public.profiles")).rows[0].count;
  await db.exec(await readFile(new URL("../../supabase/inspection/auth_foundation_readonly.sql", import.meta.url), "utf8"));
  const presence = (await db.query(await readFile(new URL("../../supabase/inspection/auth_foundation_presence.sql", import.meta.url), "utf8"))).rows[0];
  assert.equal(presence.profiles_exists, true);
  assert.equal(presence.preferences_exists, true);
  assert.equal(presence.migration_history_exists, false);
  // Model only migration metadata for the post-application inspector, never a hosted write.
  await db.exec("create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key); insert into supabase_migrations.schema_migrations values('20261116000000'),('20261117000000');");
  const verified = (await db.query(await readFile(new URL("../../supabase/inspection/auth_foundation_verify.sql", import.meta.url), "utf8"))).rows[0];
  assert.deepEqual(verified.applied_versions, ["20261116000000", "20261117000000"]);
  assert.equal(verified.foundation_policies.length, 5);
  assert(verified.foundation_rls.every(row => row.rls));
  assert.equal(verified.client_privileges.profileRoleUpdate, false);
  assert.equal(verified.client_privileges.preferenceSettingsUpdate, true);
  const care = await db.exec(await readFile(new URL("../../supabase/inspection/care_backend_readonly.sql", import.meta.url), "utf8"));
  assert.equal(care[0].rows.length, 18);
  assert.equal(care[0].rows.filter(row => row.present).length, 8);
  assert.equal(care[1].rows.length, 0);
  assert.deepEqual((await db.query("select tablename from pg_tables where schemaname='public' order by tablename")).rows, before.rows);
  assert.equal((await db.query("select count(*) as count from public.profiles")).rows[0].count, count);
});
