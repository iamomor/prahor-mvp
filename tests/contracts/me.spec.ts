import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleIdentityGet, handleMeGet } from "../../src/lib/auth/handlers";
import { apiErrorSchema, idSchema } from "../../src/lib/contracts/common";
import { currentUserSchema } from "../../src/lib/contracts/platform";

const ayesha = "d2000000-0000-4000-8000-000000000001";
const nusrat = "d2000000-0000-4000-8000-000000000002";
function fixture(options: {
  id?: string; role?: string; displayName?: string; missing?: boolean; noUser?: boolean;
  authError?: { status: number; message: string }; databaseError?: boolean; foreign?: boolean;
  throwAuth?: boolean; throwDatabase?: boolean; unconfirmed?: boolean; anonymous?: boolean;
} = {}) {
  const queries: unknown[] = [];
  let authCalls = 0;
  const client = {
    auth: { getUser: async () => {
      authCalls++;
      if (options.throwAuth) throw new Error("secret Auth failure");
      return { error: options.authError ?? null, data: { user: options.noUser ? null : {
        id: options.id ?? ayesha, email: "ayesha-rls@example.invalid",
        email_confirmed_at: options.unconfirmed ? null : "2026-11-17T00:00:00Z",
        is_anonymous: options.anonymous ?? false,
        user_metadata: { role: "provider", userId: nusrat },
      } } };
    } },
    rpc: async (name: string) => {
      if (name !== "prohor_account_access") throw new Error(`Unexpected RPC: ${name}`);
      const role = options.role ?? "mother";
      return { error: null, data: {
        userId: options.id ?? ayesha, displayName: options.displayName ?? "Ayesha",
        activeRole: role, onboarded: true,
        roles: [{ role, status: "approved" }], provider: null,
      } };
    },
    from: (table: string) => ({ select: (columns: string) => ({ eq: (column: string, value: string) => {
      queries.push({ table, columns, column, value });
      return { maybeSingle: async () => {
        if (options.throwDatabase) throw new Error("password=synthetic-secret SQL detail");
        return { error: options.databaseError ? { message: "private database error", details: "sensitive SQL" } : null,
          data: options.missing ? null : {
            user_id: options.foreign ? nusrat : options.id ?? ayesha,
            role: options.role ?? "mother", display_name: options.displayName ?? "Ayesha",
            email: "must-not-return@example.invalid", access_token: "must-not-return",
            private_note: "must-not-return", created_at: "must-not-return",
          } };
      } };
    } }) }),
  } as unknown as SupabaseClient;
  return { client, queries, authCalls: () => authCalls };
}

for (const [role, id, displayName] of [["mother", ayesha, "Ayesha"], ["provider", nusrat, "Nusrat"]]) {
  test(`${role} receives exactly the approved own-profile projection`, async () => {
    const setup = fixture({ role, id, displayName });
    const response = await handleMeGet(async () => setup.client);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(["contractVersion", "data", "requestId"]);
    expect(body.data).toEqual({ id, role, displayName });
    expect(currentUserSchema.parse(body.data)).toEqual(body.data);
    expect(idSchema.safeParse(body.requestId).success).toBe(true);
    expect(body.contractVersion).toBe("1");
    expect(setup.queries).toEqual([{ table: "profiles", columns: "user_id, display_name, role", column: "user_id", value: id }]);
    expect(setup.authCalls()).toBe(1);
  });
}

test("authentication is verified on every request; no application identity cache", async () => {
  const setup = fixture();
  await handleMeGet(async () => setup.client);
  await handleMeGet(async () => setup.client);
  expect(setup.authCalls()).toBe(2);
});

for (const [label, options] of [
  ["absent", { noUser: true }],
  ["invalid", { authError: { status: 400, message: "secret invalid token" } }],
  ["expired", { authError: { status: 401, message: "secret expired token" } }],
  ["unconfirmed", { unconfirmed: true }],
  ["anonymous", { anonymous: true }],
] as const) {
  test(`${label} session receives 401 before profile lookup`, async () => {
    const setup = fixture(options);
    const response = await handleMeGet(async () => setup.client);
    expect(response.status).toBe(401);
    expect(apiErrorSchema.parse(await response.json()).error).toEqual({ code: "unauthenticated", message: "Authentication required." });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(setup.queries).toEqual([]);
  });
}

test("an authenticated missing profile is 404 without changing legacy Step 11 behavior", async () => {
  const setup = fixture({ missing: true });
  const response = await handleMeGet(async () => setup.client);
  expect(response.status).toBe(404);
  expect(apiErrorSchema.parse(await response.json()).error.code).toBe("not_found");
  expect((await handleIdentityGet(setup.client)).status).toBe(503);
});

test("client metadata cannot choose a different profile or grant provider status", async () => {
  const setup = fixture();
  const body = await (await handleMeGet(async () => setup.client)).json();
  expect(body.data.id).toBe(ayesha);
  expect(body.data.role).toBe("mother");
  expect(setup.queries).toHaveLength(1);
  expect(setup.queries[0]).toMatchObject({ value: ayesha });
});

for (const [label, options] of [
  ["foreign owner", { foreign: true }], ["invalid role", { role: "admin" }],
  ["database error", { databaseError: true }], ["database exception", { throwDatabase: true }],
  ["Auth outage", { authError: { status: 503, message: "secret service details" } }],
  ["Auth exception", { throwAuth: true }],
] as const) {
  test(`${label} fails safely with 500`, async () => {
    const response = await handleMeGet(async () => fixture(options).client);
    expect(response.status).toBe(500);
    expect(apiErrorSchema.parse(await response.json()).error).toEqual({ code: "unavailable", message: "Unable to retrieve your profile." });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
}

test("configuration and client creation failures return sanitized non-cacheable 500s", async () => {
  for (const create of [async () => null, async () => { throw new Error("synthetic-secret"); }]) {
    const response = await handleMeGet(create);
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain("synthetic-secret");
    expect(apiErrorSchema.parse(JSON.parse(text)).error.code).toBe("unavailable");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  }
});

test("empty provisioned display names remain valid and sensitive fields are absent", async () => {
  const body = await (await handleMeGet(async () => fixture({ displayName: "" }).client)).json();
  expect(body.data).toEqual({ id: ayesha, role: "mother", displayName: "" });
  expect(JSON.stringify(body)).not.toContain("must-not-return");
});
