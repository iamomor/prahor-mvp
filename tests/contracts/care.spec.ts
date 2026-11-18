import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleCare, type CareOperation } from "../../src/lib/care/handlers";
import { apiErrorSchema, contractVersion } from "../../src/lib/contracts/common";
import { consentGrantSchema, providerRequestSchema, supportRequestSchema } from "../../src/lib/contracts/bondhon";

const actor = "e3000000-0000-4000-8000-000000000001";
const provider = "e3000000-0000-4000-8000-000000000003";
const resource = "e3000000-0000-4000-8000-000000000010";
const grant = "e3000000-0000-4000-8000-000000000011";
const record = "e3000000-0000-4000-8000-000000000012";
const retryKey = "e3000000-0000-4000-8000-000000000013";
const stamp = "2026-11-18T00:00:00Z";
const origin = "http://localhost:3000";
const row = { id: resource, ownerUserId: actor, createdAt: stamp, updatedAt: stamp, revision: 2, dataMode: "synthetic" };
const ownerRequest = { ...row, recipientUserId: provider, message: "Synthetic reviewed message", method: "text", purpose: "Synthetic support",
  consentGrantIds: [grant], status: "delivered", providerMode: "simulated" };
const providerRequest = { id: resource, createdAt: stamp, updatedAt: stamp, revision: 2, status: "delivered", providerMode: "simulated",
  method: "text", message: "Synthetic reviewed message", consentedRecords: [] };
const consentInput = { granteeUserId: provider, record: { type: "maternal_observation", id: record, fields: ["provenance"] },
  purpose: "Synthetic support", startsAt: stamp, expiresAt: "2026-11-19T00:00:00Z", reviewConfirmed: true };
const requestInput = { recipientUserId: provider, message: "Synthetic reviewed message", method: "text", purpose: "Synthetic support",
  consentGrantIds: [grant], reviewConfirmed: true };

function fixture({ role = "mother", expired = false, unconfirmed = false, userId = actor,
  result = ownerRequest as unknown, error = null as { code: string; message: string } | null, throws = false } = {}) {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: expired ? null : { id: userId, email: "synthetic@example.invalid",
      email_confirmed_at: unconfirmed ? null : stamp, is_anonymous: false } }, error: expired ? { status: 401 } : null }) },
    from: () => ({ select: () => ({ eq: (_key: string, id: string) => ({ maybeSingle: async () => ({
      data: { user_id: id, display_name: "Synthetic account", role }, error: null,
    }) }) }) }),
    rpc: async (name: string, params: Record<string, unknown>) => {
      if (name === "prohor_account_access") return { data: null, error: { code: "PGRST202" } };
      calls.push({ name, params });
      if (throws) throw new Error("PRIVATE_BACKEND_ERROR_SENTINEL");
      return { data: result, error };
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}
function request(operation: CareOperation, data?: unknown, headers: Record<string, string> = {}, query = "") {
  const reading = ["recipients", "provider-list", "request-detail", "request-events"].includes(operation);
  return new Request(origin + "/api/candidate" + query, { method: reading ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", "Idempotency-Key": retryKey, ...headers },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
}
function run(operation: CareOperation, data?: unknown, setup = fixture(), headers: Record<string, string> = {}, query = "") {
  return handleCare(request(operation, data, headers, query), operation, { createClient: async () => setup.client, siteUrl: origin }, resource);
}

test("care candidate validates persisted owner response and sends no client actor/role to RPC", async () => {
  const setup = fixture();
  const response = await run("create-request", requestInput, setup);
  expect(response.status).toBe(201);
  const body = await response.json();
  expect(supportRequestSchema.parse(body.data)).toEqual(ownerRequest);
  expect(body.contractVersion).toBe(contractVersion);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  expect(setup.calls).toEqual([{ name: "mvp_care_create_request", params: {
    p_recipient_user_id: provider, p_message: requestInput.message, p_method: "text", p_purpose: requestInput.purpose,
    p_consent_grant_ids: [grant], p_review_confirmed: true, p_idempotency_key: retryKey,
  } }]);
});

test("recipient selection exposes only approved simulated DTOs and is restricted to mothers", async () => {
  const data = [{ id: provider, displayName: "Synthetic provider", providerMode: "simulated" }];
  const setup = fixture({ result: data });
  const response = await run("recipients", undefined, setup);
  expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual(data);
  expect(setup.calls).toEqual([{ name: "mvp_care_recipients", params: {} }]);
  expect((await run("recipients", undefined, fixture({ role: "provider" }))).status).toBe(403);
  for (const result of [[{ ...data[0], email: "private@example.invalid" }], [data[0], data[0]], [{ ...data[0], providerMode: "real" }]]) {
    expect((await run("recipients", undefined, fixture({ result }))).status).toBe(503);
  }
  expect((await run("recipients", undefined, fixture({ result: [] }), {}, "?ownerUserId=" + actor)).status).toBe(400);
});

test("consent adapter reuses typed reviewed scopes and validates returned owner identity", async () => {
  const stored = { ...row, id: grant, revision: 1, ...consentInput, revokedAt: null };
  const { reviewConfirmed: _review, ...data } = stored;
  void _review;
  const setup = fixture({ result: data });
  const response = await run("create-consent", consentInput, setup);
  expect(response.status).toBe(201);
  expect(consentGrantSchema.parse((await response.json()).data)).toEqual(data);
  expect(setup.calls[0].name).toBe("mvp_care_create_consent");
  const foreign = fixture({ result: { ...data, ownerUserId: provider } });
  expect((await run("create-consent", consentInput, foreign)).status).toBe(503);
});

test("care rejects owner, role, false review and private-context injection before domain RPC", async () => {
  for (const patch of [{ ownerUserId: provider }, { actorUserId: provider }, { role: "provider" }, { status: "delivered" },
    { diaryText: "PRIVATE_DIARY_SENTINEL" }, { reviewConfirmed: false }, { consentGrantIds: [grant, grant] }]) {
    const setup = fixture();
    const response = await run("create-request", { ...requestInput, ...patch }, setup);
    expect(response.status).toBe(400);
    expect(setup.calls).toHaveLength(0);
  }
});

test("cross-origin, missing origin/config, wrong method and malformed retry key never contact Auth", async () => {
  let calls = 0;
  const dependencies = { createClient: async () => { calls++; return fixture().client; }, siteUrl: origin };
  for (const headers of [{ origin: "https://foreign.invalid" }, { origin: "" }]) {
    expect((await handleCare(request("create-request", requestInput, headers), "create-request", dependencies)).status).toBe(403);
  }
  expect((await handleCare(request("create-request", requestInput), "create-request", { ...dependencies, siteUrl: undefined })).status).toBe(503);
  expect((await handleCare(new Request(origin), "create-request", dependencies)).status).toBe(405);
  for (const value of ["", "invalid", actor + "," + provider]) {
    expect((await handleCare(request("create-request", requestInput, { "Idempotency-Key": value }), "create-request", dependencies)).status).toBe(400);
  }
  expect(calls).toBe(0);
});

test("expired/unconfirmed sessions and role mismatch deny direct candidate actions", async () => {
  for (const setup of [fixture({ expired: true }), fixture({ unconfirmed: true })]) {
    expect((await run("create-request", requestInput, setup)).status).toBe(401);
    expect(setup.calls).toHaveLength(0);
  }
  const mother = fixture();
  expect((await run("acknowledge", { expectedRevision: 2 }, mother)).status).toBe(403);
  const providerSetup = fixture({ role: "provider", userId: provider });
  expect((await run("create-request", requestInput, providerSetup)).status).toBe(403);
});

test("stale account snapshot is rejected before care reads or mutations", async () => {
  for (const operation of ["create-request", "request-detail"] as const) {
    const setup = fixture();
    expect((await run(operation, operation === "create-request" ? requestInput : undefined, setup, { "X-Prohor-Account": provider })).status).toBe(409);
    expect(setup.calls).toHaveLength(0);
  }
});

test("unknown backend errors and timeouts never claim not-sent, delivered or saved", async () => {
  for (const setup of [fixture({ throws: true }), fixture({ error: { code: "P0001", message: "PRIVATE_BACKEND_ERROR_SENTINEL" } }), fixture({ result: null })]) {
    const response = await run("create-request", requestInput, setup);
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(apiErrorSchema.safeParse(body).success).toBe(true);
    expect(body.error.message).toContain("could not be confirmed");
    expect(body.error.message).toContain("same retry key");
    expect(JSON.stringify(body)).not.toMatch(/PRIVATE_BACKEND|not_sent|delivered|saved/);
  }
});

for (const [code, status] of [["42501", 403], ["P0002", 404], ["23503", 404], ["40001", 409], ["PT409", 409], ["22023", 400], ["PGRST202", 503]] as const) {
  test(`care candidate maps database ${code} to safe ${status} without exposing backend details`, async () => {
    const response = await run("create-request", requestInput, fixture({ error: { code, message: "PRIVATE_SQL_DETAIL_SENTINEL" } }));
    expect(response.status).toBe(status);
    const body = await response.json();
    expect(apiErrorSchema.safeParse(body).success).toBe(true);
    expect(JSON.stringify(body)).not.toContain("PRIVATE_SQL_DETAIL_SENTINEL");
  });
}

test("provider detail rejects owner DTOs or unsafe extra source/provenance data", async () => {
  const setup = fixture({ role: "provider", userId: provider, result: providerRequest });
  const response = await run("request-detail", undefined, setup);
  expect(response.status).toBe(200);
  expect(providerRequestSchema.parse((await response.json()).data)).toEqual(providerRequest);
  for (const result of [ownerRequest, { ...providerRequest, ownerUserId: actor }, { ...providerRequest, consentedRecords: [{ type: "maternal_observation", id: record,
    fields: { provenance: { source: "self_reported", verification: "self_reported", recordedAt: stamp, sourceNote: "PRIVATE_SOURCE_SENTINEL" } } }] }]) {
    const bad = await run("request-detail", undefined, fixture({ role: "provider", userId: provider, result }));
    expect(bad.status).toBe(503);
    expect(await bad.text()).not.toContain("PRIVATE_SOURCE_SENTINEL");
  }
});

test("action adapter uses only canonical acknowledge/respond/close RPCs and expected revision", async () => {
  for (const [operation, status] of [["acknowledge", "acknowledged"], ["respond", "responded"], ["close", "closed"]] as const) {
    const setup = fixture({ role: "provider", userId: provider, result: { ...providerRequest, status, revision: 3 } });
    const response = await run(operation, { expectedRevision: 2, ...(operation === "respond" ? { message: "Synthetic response" } : {}) }, setup);
    expect(response.status).toBe(200);
    expect(setup.calls[0].name).toBe(`mvp_care_${operation}`);
    expect(setup.calls[0].params.p_expected_revision).toBe(2);
    expect(setup.calls[0].params.p_idempotency_key).toBe(retryKey);
    expect(setup.calls[0].params.p_id).toBe(resource);
  }
});

test("pagination rejects unknown/duplicate query keys and malformed cursor structures", async () => {
  for (const query of ["?ownerUserId=" + actor, "?limit=1&limit=2", "?limit=51", "?cursor=not-json", "?cursor=" + encodeURIComponent(JSON.stringify({ id: resource, createdAt: stamp, ownerUserId: actor }))]) {
    const setup = fixture({ role: "provider", userId: provider });
    expect((await run("provider-list", undefined, setup, {}, query)).status).toBe(400);
    expect(setup.calls).toHaveLength(0);
  }
  const setup = fixture({ role: "provider", userId: provider, result: { items: [], nextCursor: null } });
  const cursor = JSON.stringify({ id: resource, createdAt: stamp });
  expect((await run("provider-list", undefined, setup, {}, "?limit=5&cursor=" + encodeURIComponent(cursor))).status).toBe(200);
  expect(setup.calls[0].params).toEqual({ p_limit: 5, p_after_created_at: stamp, p_after_id: resource });
});

test("events and revoke keep resource identity and safe response shape", async () => {
  const events = fixture({ result: { items: [{ id: grant, requestId: resource, status: "delivered", occurredAt: stamp, requestRevision: 2 }], nextCursor: null } });
  expect((await run("request-events", undefined, events, {}, "?cursor=1")).status).toBe(200);
  expect(events.calls[0].params.p_after_revision).toBe(1);
  const revoke = fixture({ result: { id: resource, revokedAt: stamp } });
  expect((await run("revoke-consent", undefined, revoke)).status).toBe(200);
  expect(revoke.calls[0].name).toBe("mvp_care_revoke_consent");
  expect((await run("revoke-consent", {}, revoke)).status).toBe(400);
  const emptyPost = new Request(origin + "/api/consents/" + resource + "/revoke", {
    method: "POST", headers: { origin }, body: "",
  });
  expect((await handleCare(emptyPost, "revoke-consent", {
    createClient: async () => revoke.client, siteUrl: origin,
  }, resource)).status).toBe(200);
  expect((await run("request-events", undefined, events, {}, "?cursor=9999999999")).status).toBe(400);
});

test("bounded JSON and strict body validation prevent a care RPC on malformed or oversized input", async () => {
  for (const body of ["{broken", JSON.stringify({ ...requestInput, message: "x".repeat(9000) })]) {
    const setup = fixture();
    const request = new Request(origin + "/api/care-requests", { method: "POST", headers: { origin, "content-type": "application/json", "Idempotency-Key": retryKey }, body });
    expect((await handleCare(request, "create-request", { createClient: async () => setup.client, siteUrl: origin })).status).toBe(400);
    expect(setup.calls).toHaveLength(0);
  }
});
