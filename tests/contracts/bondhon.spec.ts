import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleCare, type CareOperation } from "../../src/lib/care/handlers";
import { coordinationApprovalSchema } from "../../src/lib/contracts/coordination";
import { permissionState } from "../../src/features/bondhon/bondhon-copy";

const actor = "e4000000-0000-4000-8000-000000000001";
const provider = "e4000000-0000-4000-8000-000000000002";
const id = "e4000000-0000-4000-8000-000000000003";
const key = "e4000000-0000-4000-8000-000000000004";
const stamp = "2026-11-19T00:00:00Z";
const origin = "http://localhost:3000";
const coordination = { termsVersion: "bondhon-demo-2026-11-19", expiresAt: "2026-11-20T00:00:00Z", allowReplies: true,
  language: "bn", accommodations: ["written"], records: [] };
const input = { recipientUserId: provider, purpose: "Synthetic purpose", message: "Synthetic message", method: "text",
  consentGrantIds: [], reviewConfirmed: true, coordination };
const stored = { id, ownerUserId: actor, createdAt: stamp, updatedAt: stamp, revision: 2, dataMode: "synthetic",
  ...input, providerMode: "simulated", status: "delivered", coordination: { ...coordination, records: undefined,
    approvedAt: stamp, revokedAt: null, version: 1 } };
// JSON omits undefined fields, as a database response would.
const requestRow = JSON.parse(JSON.stringify(stored));
delete requestRow.reviewConfirmed;
function fixture(result: unknown, role = "mother") {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: actor, email: "synthetic@example.invalid", email_confirmed_at: stamp } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { user_id: actor, display_name: "Synthetic", role }, error: null }) }) }) }),
    rpc: async (name: string, params: Record<string, unknown>) => {
      if (name === "prohor_account_access") return { data: null, error: { code: "PGRST202" } };
      calls.push({ name, params }); return { data: result, error: null };
    },
  } as unknown as SupabaseClient;
  return { calls, client };
}
function call(operation: CareOperation, setup: ReturnType<typeof fixture>, body?: unknown) {
  const reading = ["request-list", "coordination-detail", "shareable-records"].includes(operation);
  return handleCare(new Request(origin + "/api/care-requests", { method: reading ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", "X-Prohor-Account": actor, "Idempotency-Key": key },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }), operation, { createClient: async () => setup.client, siteUrl: origin }, id);
}

test("permission state ends at exact expiry and revocation takes precedence", () => {
  const end = Date.parse("2026-11-20T00:00:00Z");
  expect(permissionState(coordination.expiresAt, null, end - 1)).toBe("active");
  expect(permissionState(coordination.expiresAt, null, end)).toBe("expired");
  expect(permissionState(coordination.expiresAt, stamp, end)).toBe("revoked");
});
test("coordination contract rejects hidden data, implicit proxy authority and duplicate scopes", () => {
  expect(coordinationApprovalSchema.safeParse(coordination).success).toBe(true);
  for (const patch of [{ diary: "private" }, { marketing: true }, { legalGuardian: true }, { accommodations: ["written", "written"] },
    { records: [{ type: "wellness_diary_entry", id, fields: ["text"] }] }])
    expect(coordinationApprovalSchema.safeParse({ ...coordination, ...patch }).success).toBe(false);
});
test("atomic reviewed submission uses one RPC and validates the stored permission receipt", async () => {
  const setup = fixture(requestRow);
  expect((await call("create-request", setup, input)).status).toBe(201);
  expect(setup.calls).toEqual([{ name: "mvp_care_create_coordinated_request", params: { p_payload: input, p_idempotency_key: key } }]);
  const changed = fixture({ ...requestRow, coordination: { ...requestRow.coordination, allowReplies: false } });
  expect((await call("create-request", changed, input)).status).toBe(503);
});
test("mixing old grants with a new record-selection approval is rejected before write", async () => {
  const setup = fixture(null);
  expect((await call("create-request", setup, { ...input, consentGrantIds: [id] })).status).toBe(400);
  expect(setup.calls).toHaveLength(0);
});
test("owner request list and record candidates cannot be used by provider accounts", async () => {
  for (const operation of ["request-list", "shareable-records", "revoke-request"] as const) {
    const setup = fixture(null, "provider");
    expect((await call(operation, setup)).status).toBe(403);
    expect(setup.calls).toHaveLength(0);
  }
});
test("provider coordination detail never accepts owner-only grants or audit data", async () => {
  const { ownerUserId: _owner, purpose: _purpose, consentGrantIds: _grants, dataMode: _mode, recipientUserId: _recipient, ...row } = requestRow;
  void _owner; void _purpose; void _grants; void _mode; void _recipient;
  const data = { request: { ...row, consentedRecords: [] }, messages: [], grants: [], audit: [] };
  expect((await call("coordination-detail", fixture(data, "provider"))).status).toBe(200);
  expect((await call("coordination-detail", fixture({ ...data, request: requestRow }, "provider"))).status).toBe(503);
});
