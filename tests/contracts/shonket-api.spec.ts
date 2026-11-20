import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleCare, type CareOperation } from "../../src/lib/care/handlers";

const mother = "d9000000-0000-4000-8000-000000000001";
const provider = "d9000000-0000-4000-8000-000000000002";
const requestId = "d9000000-0000-4000-8000-000000000003";
const key = "d9000000-0000-4000-8000-000000000004";
const origin = "http://localhost:3000";
const stamp = "2026-11-20T00:00:00Z";
const draft = { message: "Synthetic request", method: "text", concernTypes: ["fever"], onset: "today" };
const input = { ...draft, language: "bn", reviewConfirmed: true };
const row = { id: requestId, createdAt: stamp, updatedAt: stamp, revision: 1, status: "submitted",
  message: input.message, method: input.method, concernTypes: input.concernTypes, onset: input.onset, events: [{ status: "submitted", occurredAt: stamp, requestRevision: 1 }],
  consent: { termsVersion: "shonket-demo-2026-11-20", expiresAt: "2026-12-20T00:00:00Z", revokedAt: null, version: 1 } };

function setup(result: unknown, role: "mother" | "provider" = "mother", noSession = false) {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: noSession ? null : { id: role === "mother" ? mother : provider, email: "synthetic@example.invalid", email_confirmed_at: stamp } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { user_id: role === "mother" ? mother : provider, display_name: "Fictional", role }, error: null }) }) }) }),
    rpc: async (name: string, params: Record<string, unknown>) => {
      if (name === "prohor_account_access") return { data: null, error: { code: "PGRST202" } };
      calls.push({ name, params }); return { data: result, error: null };
    },
  } as unknown as SupabaseClient;
  return { calls, client };
}
function request(method: "GET" | "POST", body?: unknown, headers: Record<string, string> = {}, query = "") {
  return new Request(`${origin}/api/care-requests${query}`, { method, headers: { origin, "content-type": "application/json", "Idempotency-Key": key, ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
function call(operation: CareOperation, mock: ReturnType<typeof setup>, req: Request, id?: string) {
  return handleCare(req, operation, { createClient: async () => mock.client, siteUrl: origin }, id);
}

test("Shonket submit validates exact body and calls the existing support-request RPC with a retry key", async () => {
  const mock = setup(row);
  const response = await call("create-request", mock, request("POST", input));
  expect(response.status).toBe(201);
  expect(mock.calls).toEqual([{ name: "mvp_shonket_submit_request", params: {
    p_message: input.message, p_method: input.method, p_concern_types: input.concernTypes,
    p_onset: input.onset, p_language: "bn", p_review_confirmed: true, p_idempotency_key: key,
  } }]);
  for (const bad of [{ ...input, reviewConfirmed: false }, { ...draft }, { ...input, language: "fr" }, { ...input, ownerUserId: mother }, { ...input, extra: true }, { ...input, concernTypes: ["invented"] }, { ...input, message: " " }]) {
    const invalid = setup(row);
    expect((await call("create-request", invalid, request("POST", bad))).status).toBe(400);
    expect(invalid.calls).toHaveLength(0);
  }
});

test("Shonket submit rejects wrong origin, missing retry key and provider role before persistence", async () => {
  const mock = setup(row);
  expect((await call("create-request", mock, request("POST", input, { origin: "https://attacker.invalid" }))).status).toBe(403);
  expect((await call("create-request", mock, request("POST", input, { "Idempotency-Key": "" }))).status).toBe(400);
  const providerMock = setup(row, "provider");
  expect((await call("create-request", providerMock, request("POST", input))).status).toBe(403);
  expect(providerMock.calls).toHaveLength(0);
  const guest = setup(row, "mother", true);
  expect((await call("create-request", guest, request("POST", input))).status).toBe(401);
  expect(guest.calls).toHaveLength(0);
});

test("mother history and provider queue use bounded workflow-specific projections", async () => {
  const own = setup([row]);
  const ownResponse = await call("request-list", own, request("GET", undefined, {}, "?workflow=shonket&limit=50"));
  expect(ownResponse.status).toBe(200);
  expect(own.calls[0].name).toBe("mvp_shonket_my_requests");
  expect(own.calls[0].params).toEqual({ p_limit: 50 });
  const assigned = setup([{ ...row, events: [] }], "provider");
  expect((await call("provider-list", assigned, request("GET", undefined, {}, "?workflow=shonket&limit=25"))).status).toBe(200);
  expect(assigned.calls[0]).toEqual({ name: "mvp_shonket_provider_requests", params: { p_limit: 25 } });
  const unauthorized = setup([], "provider");
  expect((await call("request-list", unauthorized, request("GET", undefined, {}, "?workflow=shonket"))).status).toBe(403);
});

test("provider open and acknowledge stay assigned, same-origin and revision-bound", async () => {
  const opened = { ...row, status: "delivered", revision: 2 };
  const mock = setup(opened, "provider");
  const openReq = request("POST", {}, { origin });
  expect((await call("shonket-open", mock, openReq, requestId)).status).toBe(200);
  expect(mock.calls[0]).toEqual({ name: "mvp_shonket_open_request", params: { p_id: requestId } });
  const ackResult = { id: requestId, createdAt: stamp, updatedAt: stamp, revision: 3, status: "acknowledged",
    providerMode: "simulated", method: "text", message: input.message, consentedRecords: [] };
  const ackMock = setup(ackResult, "provider");
  const current = request("POST", { expectedRevision: 2 });
  expect((await call("acknowledge", ackMock, current, requestId)).status).toBe(200);
  expect(ackMock.calls.at(-1)?.name).toBe("mvp_care_acknowledge");
  expect(ackMock.calls.at(-1)?.params).toMatchObject({ p_id: requestId, p_expected_revision: 2, p_idempotency_key: key });
});

test("denied provider open is a non-revealing 404 and mother revoke calls only the Shonket revoke RPC", async () => {
  const denied = setup({ denied: true }, "provider");
  const response = await call("shonket-open", denied, request("POST", {}, { origin }), requestId);
  expect(response.status).toBe(404);
  expect(JSON.stringify(await response.json())).not.toMatch(/revoked|expired|consent/i);
  const revoked = { ...row, consent: { ...row.consent, revokedAt: stamp, version: 2 } };
  const mock = setup(revoked);
  expect((await call("shonket-revoke", mock, request("POST", undefined, {}), requestId)).status).toBe(200);
  expect(mock.calls).toEqual([{ name: "mvp_shonket_revoke_request", params: { p_id: requestId } }]);
  const notRevoked = setup(row);
  expect((await call("shonket-revoke", notRevoked, request("POST", undefined, {}), requestId)).status).toBe(503);
  const asProvider = setup(revoked, "provider");
  expect((await call("shonket-revoke", asProvider, request("POST", undefined, {}), requestId)).status).toBe(403);
  expect(asProvider.calls).toHaveLength(0);
});
