import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("mothers can edit their own pregnancy/baby records; previous values are logged; others cannot", async () => {
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
    for (const file of (await readdir(migrations)).filter(name => name.endsWith(".sql") && name <= "20261121000000_jibonrekha_profile_edits.sql").sort()) {
      await db.exec(await readFile(new URL(file, migrations), "utf8"));
    }
    const mother = "a6000000-0000-4000-8000-000000000001";
    const other = "a6000000-0000-4000-8000-000000000002";
    for (const id of [mother, other]) {
      await db.query("insert into auth.users(id,email,email_confirmed_at) values ($1,$2,now())", [id, `mother-${id}@example.invalid`]);
      await db.query("update public.profiles set display_name='Synthetic account',role='mother' where user_id=$1", [id]);
      await db.query("insert into public.account_role_memberships(user_id,role,status) values ($1,'mother','approved') on conflict (user_id,role) do update set status='approved'", [id]);
    }
    const asUser = (id, operation) => db.transaction(async tx => {
      await tx.exec("set local role authenticated");
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
      return operation(tx);
    });
    const save = (tx, action, data) => tx.query("select public.jr_save($1,$2,$3) as id", [action, JSON.stringify(data), randomUUID()]);
    const edit = (tx, subject, id, data) => tx.query("select public.jr_edit_profile($1,$2,$3) as id", [subject, id, JSON.stringify(data)]);

    const pregnancy = (await asUser(mother, tx => save(tx, "pregnancy", { label: "Typo pregnancy", due: null, period: null }))).rows[0].id;
    const baby = (await asUser(mother, tx => save(tx, "baby", { label: "Baby", pregnancyId: null, birthDate: null }))).rows[0].id;

    await asUser(mother, tx => edit(tx, "pregnancy", pregnancy, { label: "First pregnancy", due: "2027-03-08", period: null }));
    assert.deepEqual((await db.query("select label, estimated_due_date::text as due from public.pregnancy_records where id=$1", [pregnancy])).rows[0], { label: "First pregnancy", due: "2027-03-08" });
    await asUser(mother, tx => edit(tx, "baby", baby, { label: "Baby A", pregnancyId: pregnancy, birthDate: "2026-11-01" }));
    assert.deepEqual((await db.query("select label, pregnancy_id, birth_date::text as born from public.baby_records where id=$1", [baby])).rows[0], { label: "Baby A", pregnancy_id: pregnancy, born: "2026-11-01" });

    const log = (await asUser(mother, tx => tx.query("select subject, previous from public.jr_profile_edits order by edited_at, subject desc"))).rows;
    assert.equal(log.length, 2);
    assert.equal(log.find(row => row.subject === "pregnancy").previous.label, "Typo pregnancy");
    assert.equal(log.find(row => row.subject === "baby").previous.label, "Baby");

    await assert.rejects(asUser(other, tx => edit(tx, "pregnancy", pregnancy, { label: "Hijack", due: null, period: null })), { code: "P0002" });
    await assert.rejects(asUser(other, tx => edit(tx, "baby", baby, { label: "Hijack", pregnancyId: null, birthDate: null })), { code: "P0002" });
    const otherPregnancy = (await asUser(other, tx => save(tx, "pregnancy", { label: "Other", due: null, period: null }))).rows[0].id;
    await assert.rejects(asUser(mother, tx => edit(tx, "baby", baby, { label: "Baby A", pregnancyId: otherPregnancy, birthDate: null })), { code: "42501" });
    await assert.rejects(asUser(mother, tx => edit(tx, "pregnancy", pregnancy, { label: "Bad", due: "2026-01-01", period: "2026-02-01" })), { code: "22023" });
    await assert.rejects(asUser(mother, tx => edit(tx, "pregnancy", pregnancy, { label: " ", due: null, period: null })), { code: "22023" });
    assert.equal((await asUser(other, tx => tx.query("select count(*)::int as n from public.jr_profile_edits"))).rows[0].n, 0);
    await assert.rejects(asUser(mother, tx => tx.query("insert into public.jr_profile_edits(owner_user_id,subject,record_id,previous) values ($1,'baby',$2,'{}')", [mother, baby])));
  } finally { await db.close(); }
});
