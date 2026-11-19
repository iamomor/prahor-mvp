import { expect, test } from "@playwright/test";
import { PGlite } from "@electric-sql/pglite";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { handleCare, type CareOperation } from "../../src/lib/care/handlers";
import { providerRequestSchema, supportRequestSchema } from "../../src/lib/contracts/bondhon";
import { establishFixtureRole } from "../database/care-fixtures.mjs";

// Real disposable SQL + candidate HTTP adapters, with injected synthetic identity.
// This does not use a browser, hosted Supabase or an actual GoTrue session.
const db = new PGlite();
const users = { mother: randomUUID(), foreign: randomUUID(), provider: randomUUID(), providerQ: randomUUID() };
const origin = "http://localhost:3000";
const start = new Date(Date.now() - 60000).toISOString();
let recordId: string;

function asUser<T>(userId: string, operation: (tx: Pick<PGlite, "query" | "exec">) => Promise<T>) {
  return db.transaction(async tx => {
    await tx.exec("set local role authenticated");
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [userId]);
    return operation(tx);
  });
}
function clientFor(userId: string): SupabaseClient {
  return {
    auth: { getUser: async () => ({ data: { user: { id: userId, email: "synthetic@example.invalid", email_confirmed_at: start, is_anonymous: false } }, error: null }) },
    from: (table: string) => ({ select: () => ({ eq: (column: string, id: string) => ({ maybeSingle: async () => {
      expect(table).toBe("profiles"); expect(column).toBe("user_id"); expect(id).toBe(userId);
      const result = await asUser(userId, tx => tx.query("select user_id,display_name,role from public.profiles where user_id=$1", [id]));
      return { data: result.rows[0] ?? null, error: null };
    } }) }) }),
    rpc: async (name: string, params: Record<string, unknown> = {}) => {
      expect(name).toMatch(/^(mvp_(care|shonket)_[a-z_]+|prohor_account_access)$/);
      const entries = Object.entries(params);
      try {
        const data = await asUser(userId, async tx => (await tx.query<{ data: unknown }>(
          `select public.${name}(${entries.map(([key], index) => `${key}=>$${index + 1}`).join(",")}) as data`, entries.map(([, value]) => value),
        )).rows[0].data);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { code: typeof error === "object" && error !== null && "code" in error ? String(error.code) : "P0001", message: "Synthetic SQL failure" } };
      }
    },
  } as unknown as SupabaseClient;
}
async function call(userId: string, operation: CareOperation, body?: unknown, id?: string, key = randomUUID(), query = "") {
  const reading = ["recipients", "request-detail", "request-events", "provider-list", "request-list"].includes(operation);
  return handleCare(new Request(origin + "/api/candidate" + query, { method: reading ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", "Idempotency-Key": key, "X-Prohor-Account": userId },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }), operation, { createClient: async () => clientFor(userId), siteUrl: origin }, id);
}
async function createFlow() {
  const input = { recipientUserId: users.provider, message: "Synthetic explicit message", method: "aac", purpose: "Synthetic reviewed support",
    consentGrantIds: [], reviewConfirmed: true, coordination: {
      termsVersion: "bondhon-demo-2026-11-19", expiresAt: new Date(Date.now() + 3600000).toISOString(),
      allowReplies: true, language: "en", accommodations: [],
      records: [{ type: "maternal_observation", id: recordId, fields: ["provenance"] }],
    } };
  const key = randomUUID();
  const response = await call(users.mother, "create-request", input, undefined, key);
  expect(response.status).toBe(201);
  const request = supportRequestSchema.parse((await response.json()).data);
  return { grant: { id: request.consentGrantIds[0] }, input, key, request };
}

test.beforeAll(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; grant usage on schema public,auth to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean not null default false,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;`);
  for (const name of (await readdir("supabase/migrations")).filter(name => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
  }
  for (const [name, id] of Object.entries(users)) {
    await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,$3)", [id, `${name}@example.invalid`, start]);
    await establishFixtureRole(db, id, name.startsWith("provider") ? "provider" : "mother");
  }
  recordId = await asUser(users.mother, async tx => (await tx.query<{ id: string }>(
    "insert into public.health_observations(kind,value,unit,observed_at,source_note) values('note','Synthetic note',null,now(),'PRIVATE_SOURCE_SENTINEL') returning id",
  )).rows[0].id);
});
test.afterAll(async () => { await db.close(); });

test("SQL-backed recipient directory contains only safe approved simulated recipients", async () => {
  const response = await call(users.mother, "recipients");
  expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual([users.provider, users.providerQ].sort().map(id => ({ id, displayName: "Synthetic provider", providerMode: "simulated" })));
  expect((await call(users.provider, "recipients")).status).toBe(403);
});

test("SQL-to-adapter care journey validates existing DTOs, acknowledgement, mother status and grant revocation", async () => {
  const { grant, request } = await createFlow();
  expect(request.status).toBe("delivered");
  const providerResponse = await call(users.provider, "request-detail", undefined, request.id);
  expect(providerResponse.status).toBe(200);
  const detail = providerRequestSchema.parse((await providerResponse.json()).data);
  expect(Object.keys(detail.consentedRecords[0].fields)).toEqual(["provenance"]);
  expect(JSON.stringify(detail)).not.toContain("PRIVATE_SOURCE_SENTINEL");
  const ack = await call(users.provider, "acknowledge", { expectedRevision: request.revision }, request.id);
  expect(ack.status).toBe(200);
  expect(providerRequestSchema.parse((await ack.json()).data).status).toBe("acknowledged");
  const mother = await call(users.mother, "request-detail", undefined, request.id);
  expect(supportRequestSchema.parse((await mother.json()).data).status).toBe("acknowledged");
  expect((await call(users.mother, "revoke-consent", undefined, grant.id)).status).toBe(200);
  expect((await call(users.provider, "request-detail", undefined, request.id)).status).toBe(404);
  expect((await call(users.foreign, "request-detail", undefined, request.id)).status).toBe(404);
});

test("SQL-backed receipt reconciles an identical retry once and maps changed payload to conflict", async () => {
  const { input, key, request } = await createFlow();
  const replay = await call(users.mother, "create-request", input, undefined, key);
  expect(replay.status).toBe(201);
  expect(supportRequestSchema.parse((await replay.json()).data).id).toBe(request.id);
  const changed = await call(users.mother, "create-request", { ...input, message: "Different synthetic input" }, undefined, key);
  expect(changed.status).toBe(409);
  const queue = await db.query<{ count: number }>("select count(*)::integer as count from prohor_care.queue_receipts where request_id=$1", [request.id]);
  expect(queue.rows[0].count).toBe(1);
});

test("SQL-backed stale action is conflict, and provider cannot bypass role/owner grants via the adapter", async () => {
  const { request } = await createFlow();
  expect((await call(users.provider, "acknowledge", { expectedRevision: 1 }, request.id)).status).toBe(409);
  expect((await call(users.mother, "acknowledge", { expectedRevision: 2 }, request.id)).status).toBe(403);
  expect((await call(users.foreign, "close", { expectedRevision: 2 }, request.id)).status).toBe(404);
  const events = await call(users.mother, "request-events", undefined, request.id);
  expect((await events.json()).data.items.map((value: { status: string }) => value.status)).toEqual(["submitted", "delivered"]);
});

test("Shonket HTTP adapter persists, retries, opens and acknowledges only the server-assigned request", async () => {
  const body = { message: "Synthetic Shonket request", method: "aac", concernTypes: ["fever", "other"], onset: "today" };
  const key = randomUUID();
  const submit = await call(users.mother, "create-request", body, undefined, key);
  expect(submit.status).toBe(201);
  const first = (await submit.json()).data;
  expect(first).toMatchObject({ status: "submitted", revision: 1, ...body });
  const again = await call(users.mother, "create-request", body, undefined, key);
  expect(again.status).toBe(201);
  expect((await again.json()).data.id).toBe(first.id);
  const count = ((await db.query("select count(*) as n from prohor_care.support_requests where workflow='shonket'")).rows[0] as { n: number | string }).n;
  expect(Number(count)).toBe(1);

  const motherHistory = await call(users.mother, "request-list", undefined, undefined, randomUUID(), "?workflow=shonket&limit=50");
  expect(motherHistory.status).toBe(200);
  expect((await motherHistory.json()).data[0].events.map((event: { status: string }) => event.status)).toEqual(["submitted"]);
  const otherMother = await call(users.foreign, "request-list", undefined, undefined, randomUUID(), "?workflow=shonket");
  expect((await otherMother.json()).data).toEqual([]);

  const providerList = await call(users.provider, "provider-list", undefined, undefined, randomUUID(), "?workflow=shonket");
  const queueP = (await providerList.json()).data;
  const providerQList = await call(users.providerQ, "provider-list", undefined, undefined, randomUUID(), "?workflow=shonket");
  const queueQ = (await providerQList.json()).data;
  const assignedId = queueP.some((item: { id: string }) => item.id === first.id) ? users.provider : users.providerQ;
  const unassignedId = assignedId === users.provider ? users.providerQ : users.provider;
  const queue = assignedId === users.provider ? queueP : queueQ;
  const unassignedQueue = assignedId === users.provider ? queueQ : queueP;
  expect(queue.some((item: { id: string }) => item.id === first.id)).toBe(true);
  expect(unassignedQueue).toEqual([]);
  expect((await call(unassignedId, "shonket-open", {}, first.id)).status).toBe(404);
  expect((await call(assignedId, "acknowledge", { expectedRevision: 1 }, first.id)).status).toBe(409);

  const opened = await call(assignedId, "shonket-open", {}, first.id);
  expect(opened.status).toBe(200);
  expect((await opened.json()).data).toMatchObject({ status: "delivered", revision: 2 });
  const acknowledged = await call(assignedId, "acknowledge", { expectedRevision: 2 }, first.id);
  expect(acknowledged.status).toBe(200);
  const final = await call(users.mother, "request-list", undefined, undefined, randomUUID(), "?workflow=shonket");
  expect((await final.json()).data[0].events.map((event: { status: string }) => event.status)).toEqual(["submitted", "delivered", "acknowledged"]);
});
