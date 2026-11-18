import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("reviewed report commit is owner-only and safe to retry", async () => {
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
    for (const file of (await readdir(migrations)).filter(name => name.endsWith(".sql") && name < "20261118020000").sort()) {
      await db.exec(await readFile(new URL(file, migrations), "utf8"));
    }
    await db.exec(await readFile(new URL("../../supabase/migrations/20261118020000_private_records.sql", import.meta.url), "utf8"));
    await db.exec(await readFile(new URL("../../supabase/migrations/20261119010000_bujhi_reviewed_reports.sql", import.meta.url), "utf8"));
    const mother = "a4000000-0000-4000-8000-000000000001";
    const other = "a4000000-0000-4000-8000-000000000002";
    const provider = "a4000000-0000-4000-8000-000000000003";
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
    const pregnancy = (await asUser(mother, tx => tx.query("insert into public.pregnancy_records(label) values ('Synthetic pregnancy') returning id"))).rows[0].id;
    const reportId = "b4000000-0000-4000-8000-000000000001";
    const args = [reportId, pregnancy, "a".repeat(64), "Hemoglobin", "11.4", "g/dL", "11.4", "g/dL", "2025-01-14"];
    const sql = "select public.bujhi_commit_reviewed_hemoglobin($1,$2,$3,$4,$5,$6,$7,$8,$9) as id";
    const first = (await asUser(mother, tx => tx.query(sql, args))).rows[0].id;
    const retry = (await asUser(mother, tx => tx.query(sql, args))).rows[0].id;
    assert.equal(retry, first);
    assert.equal((await asUser(mother, tx => tx.query("select count(*)::int as count from public.health_observations where source='document_extracted'"))).rows[0].count, 1);
    assert.equal((await asUser(other, tx => tx.query("select count(*)::int as count from public.health_observations"))).rows[0].count, 0);
    await assert.rejects(asUser(other, tx => tx.query(sql, args)));
    await assert.rejects(asUser(provider, tx => tx.query(sql, args)));
    await assert.rejects(asUser(mother, tx => tx.query(sql, [reportId, pregnancy, ...args.slice(2, 6), "12.0", ...args.slice(7)])));
    await assert.rejects(asUser(mother, tx => tx.query(sql, ["b4000000-0000-4000-8000-000000000002", pregnancy, ...args.slice(2, 7), "mg/dL", args[8]])));
    await assert.rejects(asUser(mother, tx => tx.query(sql, ["b4000000-0000-4000-8000-000000000003", pregnancy, ...args.slice(2, 6), "11,4", "g/dL", args[8]])));
    await assert.rejects(asUser(mother, tx => tx.query(sql, ["b4000000-0000-4000-8000-000000000004", pregnancy, ...args.slice(2, 8), "2099-01-01"])));
    await assert.rejects(asUser(mother, tx => tx.query("insert into public.health_observations(pregnancy_id,kind,value,unit,observed_at,source,verification) values ($1,'hemoglobin','11.4','g/dL',now(),'document_extracted','user_verified')", [pregnancy])));
  } finally {
    await db.close();
  }
});
