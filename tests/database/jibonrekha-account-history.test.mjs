import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("Jibonrekha account writes are retry-safe, owner-only, and retain correction history", async () => {
  const db = new PGlite();
  try {
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
    const migrations = new URL("../../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(migrations)).filter(name => name.endsWith(".sql") && name <= "20261119020000_jibonrekha_account_history.sql").sort()) {
      await db.exec(await readFile(new URL(file, migrations), "utf8"));
    }
    const mother = "a5000000-0000-4000-8000-000000000001";
    const other = "a5000000-0000-4000-8000-000000000002";
    const provider = "a5000000-0000-4000-8000-000000000003";
    for (const [id, role] of [[mother, "mother"], [other, "mother"], [provider, "provider"]]) {
      await db.query("insert into auth.users(id,email,email_confirmed_at) values ($1,$2,now())", [id, `${role}-${id}@example.invalid`]);
      await db.query("update public.profiles set display_name=$2,role=$3 where user_id=$1", [id, "Synthetic account", role]);
    }
    async function asUser(id, operation) {
      return db.transaction(async tx => {
        await tx.exec("set local role authenticated");
        await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
        return operation(tx);
      });
    }
    const save = (tx, action, data, key = randomUUID()) => tx.query("select public.jr_save($1,$2,$3) as id", [action, JSON.stringify(data), key]);
    const pregnancyData = { label: "Synthetic pregnancy", due: "2027-03-08", period: "2026-06-01" };
    const key = randomUUID();
    const pregnancy = (await asUser(mother, tx => save(tx, "pregnancy", pregnancyData, key))).rows[0].id;
    assert.equal((await db.query("select owner_user_id from public.pregnancy_records where id=$1", [pregnancy])).rows[0].owner_user_id, mother);
    assert.equal((await asUser(mother, tx => tx.query("select auth.uid() as id"))).rows[0].id, mother);
    assert.equal((await db.query("select role from public.profiles where user_id=$1", [mother])).rows[0].role, "mother");
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as n from public.profiles where user_id=auth.uid() and role='mother'"))).rows[0].n, 1);
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as n from public.pregnancy_records"))).rows[0].n, 1);
    assert.equal((await asUser(mother, tx => save(tx, "pregnancy", pregnancyData, key))).rows[0].id, pregnancy);
    await assert.rejects(asUser(mother, tx => save(tx, "pregnancy", { ...pregnancyData, label: "Changed" }, key)), { code: "40001" });
    assert.equal((await db.query("select count(*)::int as n from public.pregnancy_records")).rows[0].n, 1);
    const baby = (await asUser(mother, tx => save(tx, "baby", { label: "Baby A", pregnancyId: pregnancy, birthDate: null }))).rows[0].id;
    await assert.rejects(asUser(other, tx => save(tx, "baby", { label: "Wrong owner", pregnancyId: pregnancy, birthDate: null })), { code: "42501" });
    const observedAt = "2026-11-10T00:00:00+06:00";
    const observation = (await asUser(mother, tx => save(tx, "observation", { subject: "mother", parentId: pregnancy, kind: "weight", value: "61.25", unit: "kg", observedAt, sourceNote: null }))).rows[0].id;
    await assert.rejects(asUser(other, tx => save(tx, "observation", { subject: "baby", parentId: baby, kind: "weight", value: "3", unit: "kg", observedAt, sourceNote: null })), { code: "42501" });
    const correctionData = { subject: "mother", observationId: observation, value: "61.5", unit: "kg", reason: "Scale was off" };
    const correctionKey = randomUUID();
    const corrected = (await asUser(mother, tx => save(tx, "correction", correctionData, correctionKey))).rows[0].id;
    assert.equal((await asUser(mother, tx => save(tx, "correction", correctionData, correctionKey))).rows[0].id, corrected);
    await assert.rejects(asUser(mother, tx => save(tx, "correction", correctionData)), { code: "40001" });
    assert.deepEqual((await db.query("select value,source from public.health_observations where id=$1", [observation])).rows[0], { value: "61.25", source: "self_reported" });
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as n from public.health_observations"))).rows[0].n, 2);
    assert.deepEqual((await db.query("select value,source,verification from public.health_observations where id=$1", [corrected])).rows[0], { value: "61.5", source: "self_reported", verification: "self_reported" });
    const report = (await asUser(mother, tx => tx.query("select public.bujhi_commit_reviewed_hemoglobin($1,$2,$3,$4,$5,$6,$7,$8,$9) as id", [randomUUID(), pregnancy, "a".repeat(64), "Hemoglobin", "11.4", "g/dL", "11.4", "g/dL", "2026-11-10"]))).rows[0].id;
    const amendedReport = (await asUser(mother, tx => save(tx, "correction", { subject: "mother", observationId: report, value: "11.9", unit: "g/dL", reason: "I read the report incorrectly" }))).rows[0].id;
    assert.deepEqual((await db.query("select source,verification from public.health_observations where id=$1", [report])).rows[0], { source: "document_extracted", verification: "user_verified" });
    assert.deepEqual((await db.query("select source,verification from public.health_observations where id=$1", [amendedReport])).rows[0], { source: "self_reported", verification: "self_reported" });
    await assert.rejects(asUser(other, tx => save(tx, "correction", { ...correctionData, observationId: corrected })), { code: "42501" });
    const visit = (await asUser(mother, tx => save(tx, "visit", { subject: "baby", parentId: baby, occurredAt: observedAt, placeNote: "Fictional clinic", note: "Routine visit" }))).rows[0].id;
    assert.ok(visit);
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as n from public.jr_visits"))).rows[0].n, 1);
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as n from public.jr_observation_corrections"))).rows[0].n, 2);
    assert.equal((await asUser(other, tx => tx.query("select count(*)::int as n from public.jr_visits"))).rows[0].n, 0);
    assert.equal((await asUser(other, tx => tx.query("select count(*)::int as n from public.jr_observation_corrections"))).rows[0].n, 0);
    await assert.rejects(asUser(provider, tx => save(tx, "visit", { subject: "mother", parentId: pregnancy, occurredAt: observedAt })), { code: "42501" });
    await assert.rejects(asUser(mother, tx => save(tx, "observation", { subject: "mother", parentId: pregnancy, kind: "hemoglobin", value: "11.4", unit: "mg/dL", observedAt })), { code: "22023" });
  } finally { await db.close(); }
});
