import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Disposable embedded PostgreSQL: applies the full migration chain, then checks single-role onboarding.
const dir = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; grant usage on schema public, auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}',
    email_confirmed_at timestamptz, is_anonymous boolean default false);
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid $$;
`);
for (const f of files) await db.exec(await readFile(new URL(f, dir), "utf8"));

const as = async (id, sql) => {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`);
  try { return await db.query(sql); } finally { await db.exec("reset role"); }
};
const mk = (id) => db.exec(`insert into auth.users(id,email,email_confirmed_at) values('${id}','${id}@example.invalid',now())`);
const A = "a1000000-0000-4000-8000-000000000001", B = "b1000000-0000-4000-8000-000000000002";
await mk(A); await mk(B);

await assert.rejects(as(A, `select public.prohor_complete_onboarding('Fictional A', array['mother','supporter'], '', '')`),
  (e) => e.code === "22023");
await as(B, `select public.prohor_complete_onboarding('Fictional B', array['mother'], '', '')`);
console.log("PASS: onboarding rejects 2 purposes and accepts exactly 1");
await db.close();
