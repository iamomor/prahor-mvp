import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Disposable embedded PostgreSQL only: no URL, key, network DB, or .env reads.
// Models the Supabase role/auth boundary; the same test SQL must also run on
// local Supabase to verify the actual GoTrue/PostgREST environment.
const migrationDir = new URL("../supabase/migrations/", import.meta.url);
const migrations = (await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort();
const testSql = await readFile(new URL("../supabase/tests/database_foundation.sql", import.meta.url), "utf8");
const preferenceTests = await readFile(new URL("../supabase/tests/preferences.sql", import.meta.url), "utf8");
const legacySql = await readFile(new URL("../supabase/reference/001_initial.sql", import.meta.url), "utf8");
const bootstrap = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  grant usage on schema public, auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text,
    raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid;
  $$;
`;

async function apply(db) {
  for (const name of migrations) await db.exec(await readFile(new URL(name, migrationDir), "utf8"));
}

for (const scenario of ["fresh", "legacy", "invalid legacy"]) {
  const db = new PGlite();
  try {
    await db.exec(bootstrap);
    if (scenario !== "fresh") {
      // Deliberately load only the two historical table definitions, never the
      // future domains. Their legacy policies/grants are simulated below.
      const definitions = legacySql.match(/create table if not exists public\.(profiles|access_preferences)\s*\([\s\S]*?\);/g);
      assert.equal(definitions?.length, 2);
      await db.exec(definitions.join("\n"));
      await db.exec(`
        alter table public.profiles enable row level security;
        alter table public.access_preferences enable row level security;
        grant all on public.profiles, public.access_preferences to anon, authenticated;
        grant update(display_name, user_id) on public.profiles to authenticated;
      `);
      await db.exec(`
        create policy legacy_profile_all on public.profiles for all to authenticated using (true) with check (true);
        create policy legacy_preferences_all on public.access_preferences for all to authenticated using (true) with check (true);
        insert into auth.users (id,email) values ('d2000000-0000-4000-8000-000000000003','day2-existing@example.invalid');
        insert into public.profiles (user_id,display_name) values ('d2000000-0000-4000-8000-000000000003','Existing Fictional Mother');
        insert into public.access_preferences (user_id,settings) values
          ('d2000000-0000-4000-8000-000000000003','{"language":"en","textScale":"large"}');
      `);
      if (scenario === "invalid legacy") {
        await db.exec(`update public.access_preferences set settings = '{"language":"unsupported"}'`);
        await assert.rejects(apply(db), (error) => error.code === "23514");
        await db.exec("rollback");
        const result = await db.query("select settings from public.access_preferences");
        assert.deepEqual(result.rows[0].settings, { language: "unsupported" });
        const columns = await db.query("select column_name from information_schema.columns where table_schema='public' and table_name='profiles'");
        assert(!columns.rows.some((row) => row.column_name === "role"));
        console.log("PASS: invalid legacy data rolls back without loss");
        continue;
      }
    } else {
      // Verify accounts predating the migration are backfilled even without rows.
      await db.exec(`insert into auth.users (id,email) values ('d2000000-0000-4000-8000-000000000003','day2-existing@example.invalid')`);
    }
    await apply(db);
    const tables = await db.query("select tablename from pg_tables where schemaname='public' order by tablename");
    assert.deepEqual(tables.rows.map((row) => row.tablename), ["access_preferences", "profiles"]);
    const existing = await db.query("select p.role,p.display_name,a.settings from public.profiles p join public.access_preferences a using(user_id)");
    assert.equal(existing.rows.length, 1);
    assert.equal(existing.rows[0].role, "mother");
    if (scenario === "legacy") {
      assert.equal(existing.rows[0].display_name, "Existing Fictional Mother");
      assert.equal(existing.rows[0].settings.language, "en");
      assert.equal(existing.rows[0].settings.textScale, "large");
    }
    await db.exec(testSql);
    await db.exec(preferenceTests);
    console.log(`PASS: ${scenario} migration, exactly two tables, backfill, constraints, two-account RLS and atomic preference patches`);
  } finally {
    await db.close();
  }
}
