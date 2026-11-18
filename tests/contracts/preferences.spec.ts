import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handlePreferences } from "../../src/features/adapt/server/handlers";
import { DEFAULT_ACCESS_PREFERENCES, accessPreferencesSchema, preferencesResponseSchema } from "../../src/lib/contracts/adapt";
import { apiErrorSchema } from "../../src/lib/contracts/common";
import { loadAccountPreferences, saveAccountPreferences, PreferencesApiError } from "../../src/features/adapt/api/client";

const id = "d2130000-0000-4000-8000-000000000001";
const at = "2026-11-17T00:00:00.123456+00:00";
function fixture(options: { missing?: boolean; unauthenticated?: boolean; dbError?: string; badSave?: boolean; unknownStoredKey?: boolean } = {}) {
  const calls: unknown[] = [];
  const settings = { ...DEFAULT_ACCESS_PREFERENCES, theme: "original-rose" as const, language: "en" as const, communication: "aac" as const };
  const row = { settings, schema_version: 2, updated_at: at };
  const client = {
    auth: { getUser: async () => ({ error: null, data: { user: options.unauthenticated ? null :
      { id, email: "ayesha-preferences@example.invalid", email_confirmed_at: at } } }) },
    from: (table: string) => ({ select: (columns: string) => ({ eq: (column: string, value: string) => {
      if (table === "profiles") return { maybeSingle: async () => ({ error: null,
        data: { user_id: id, display_name: "Ayesha", role: "mother" } }) };
      calls.push({ table, columns, column, value });
      return { maybeSingle: async () => ({ error: options.dbError ? { code: options.dbError, message: "synthetic-private-SQL" } : null,
        data: options.missing ? null : options.unknownStoredKey ? { ...row, settings: { ...settings, unknown: true } } : row }) };
    } }) }),
    rpc: async (name: string, args: { p_patch: object }) => {
      calls.push({ name, args });
      return { error: options.dbError ? { code: options.dbError, message: "synthetic-private-SQL" } : null,
        data: options.badSave ? [] : [{ ...row, settings: { ...settings, ...args.p_patch } }] };
    },
  } as unknown as SupabaseClient;
  return { client, calls, settings };
}
function request(method: "GET" | "PATCH", body?: unknown, headers: Record<string,string> = {}) {
  return new Request("http://localhost:3000/api/preferences?userId=someone-else", {
    method, headers: { origin: "http://localhost:3000", "content-type": "application/json", ...headers },
    ...(method === "PATCH" ? { body: JSON.stringify(body) } : {}),
  });
}
function run(method: "GET" | "PATCH", body?: unknown, setup = fixture(), headers?: Record<string,string>) {
  return handlePreferences(request(method, body, headers), { createClient: async () => setup.client, siteUrl: "http://localhost:3000" });
}

test("GET returns exactly the verified caller's full validated settings", async () => {
  const setup = fixture();
  const response = await run("GET", undefined, setup);
  expect(response.status).toBe(200);
  expect(preferencesResponseSchema.parse(await response.json()).data).toEqual(setup.settings);
  expect(response.headers.get("etag")).toBe(JSON.stringify(at));
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(setup.calls).toEqual([{ table: "access_preferences", columns: "settings, updated_at, schema_version", column: "user_id", value: id }]);
});

test("GET missing row returns documented defaults without writing", async () => {
  const setup = fixture({ missing: true });
  const response = await run("GET", undefined, setup);
  const body = preferencesResponseSchema.parse(await response.json());
  expect(body.data).toEqual(DEFAULT_ACCESS_PREFERENCES);
  expect(body.updatedAt).toBeNull();
  expect(response.headers.get("etag")).toBe('"missing"');
  expect(setup.calls).toHaveLength(1);
});

test("partial PATCH calls the atomic RLS RPC without a target user ID", async () => {
  const setup = fixture();
  const response = await run("PATCH", { textScale: "large" }, setup, { "if-match": JSON.stringify(at) });
  expect(response.status).toBe(200);
  expect(preferencesResponseSchema.parse(await response.json()).data).toEqual({ ...setup.settings, textScale: "large" });
  expect(setup.calls).toEqual([{ name: "patch_access_preferences", args: {
    p_patch: { textScale: "large" }, p_check_version: true, p_expected_updated_at: at,
  } }]);
});

test("missing-row conditional creation and unconditional atomic patch are both supported", async () => {
  for (const [header, check] of [['"missing"', true], [undefined, false]] as const) {
    const setup = fixture({ missing: true });
    const response = await run("PATCH", { reducedMotion: true }, setup, header ? { "if-match": header } : {});
    expect(response.status).toBe(200);
    expect(setup.calls[0]).toMatchObject({ args: { p_check_version: check, p_expected_updated_at: null } });
  }
});

for (const body of [{}, { role: "provider" }, { userId: id }, { user_id: id }, { language: null },
  { language: "fr" }, { highContrast: "true" }, { textScale: "huge" }, { theme: "invented" },
  { communication: "call" }, { schemaVersion: 3 }, [], null]) {
  test(`invalid PATCH ${JSON.stringify(body)} is rejected before any preference write`, async () => {
    const setup = fixture();
    const response = await run("PATCH", body, setup);
    expect(response.status).toBe(400);
    expect(apiErrorSchema.parse(await response.json()).error.code).toBe("invalid_request");
    expect(setup.calls).toEqual([]);
  });
}

test("GET and PATCH reject unauthenticated users before preference access", async () => {
  for (const method of ["GET", "PATCH"] as const) {
    const setup = fixture({ unauthenticated: true });
    const response = await run(method, { textScale: "large" }, setup);
    expect(response.status).toBe(401);
    expect(setup.calls).toEqual([]);
  }
});

test("cross-site PATCH is forbidden", async () => {
  const setup = fixture();
  expect((await run("PATCH", { textScale: "large" }, setup, { origin: "https://external.invalid" })).status).toBe(403);
  expect(setup.calls).toEqual([]);
});

test("malformed conditional versions are rejected", async () => {
  for (const version of ["*", 'W/"weak"', '"invalid-date"', "null"]) {
    const setup = fixture();
    expect((await run("PATCH", { textScale: "large" }, setup, { "if-match": version })).status).toBe(400);
    expect(setup.calls).toEqual([]);
  }
});

for (const [code, status, errorCode] of [["40001",409,"conflict"], ["42501",403,"forbidden"], ["22023",400,"invalid_request"], ["XX000",500,"unavailable"]] as const) {
  test(`database ${code} is safely mapped to ${status}`, async () => {
    const response = await run("PATCH", { textScale: "large" }, fixture({ dbError: code }));
    expect(response.status).toBe(status);
    const body = await response.json();
    expect(apiErrorSchema.parse(body).error.code).toBe(errorCode);
    expect(JSON.stringify(body)).not.toContain("synthetic-private-SQL");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
}

test("unconfirmed persistence and unknown stored settings are never reported as success", async () => {
  expect((await run("PATCH", { language: "bn" }, fixture({ badSave: true }))).status).toBe(500);
  expect((await run("GET", undefined, fixture({ unknownStoredKey: true }))).status).toBe(500);
  expect((await run("GET", undefined, fixture({ dbError: "XX000" }))).status).toBe(500);
});

test("all ten approved settings can be patched independently", async () => {
  for (const [key,value] of Object.entries(DEFAULT_ACCESS_PREFERENCES)) {
    const response = await run("PATCH", { [key]: value });
    expect(response.status).toBe(200);
    expect(accessPreferencesSchema.safeParse((await response.json()).data).success).toBe(true);
  }
});

test("client adapter uses confirmed snapshots and conditional PATCH without local storage side effects", async () => {
  const responseBody = { data: DEFAULT_ACCESS_PREFERENCES, schemaVersion: 2, updatedAt: at,
    requestId: id, contractVersion: "1" };
  const fetcher: typeof fetch = async (_url, init) => {
    if (init?.method === "PATCH") {
      expect(new Headers(init.headers).get("if-match")).toBe(JSON.stringify(at));
      expect(JSON.parse(String(init.body))).toEqual({ textScale: "large" });
      return Response.json({ ...responseBody, data: { ...DEFAULT_ACCESS_PREFERENCES, textScale: "large" } }, { headers: { etag: JSON.stringify(at) } });
    }
    return Response.json(responseBody, { headers: { etag: JSON.stringify(at) } });
  };
  const loaded = await loadAccountPreferences(fetcher);
  expect((await saveAccountPreferences({ textScale: "large" }, loaded.etag, fetcher)).preferences.textScale).toBe("large");
  await expect(saveAccountPreferences({ textScale: "large" }, loaded.etag, async () => Response.json({}, { status: 409 })))
    .rejects.toBeInstanceOf(PreferencesApiError);
});

test("client adapter normalizes network and malformed-response failures", async () => {
  await expect(loadAccountPreferences(async () => { throw new TypeError("synthetic network failure"); }))
    .rejects.toBeInstanceOf(PreferencesApiError);
  await expect(loadAccountPreferences(async () => new Response("{invalid-json", { headers: { etag: '"missing"' } })))
    .rejects.toBeInstanceOf(PreferencesApiError);
});

test("client adapter cannot accept a default-only GET snapshot as a confirmed PATCH", async () => {
  const defaultsOnly = { data: DEFAULT_ACCESS_PREFERENCES, schemaVersion: 2, updatedAt: null,
    requestId: id, contractVersion: "1" };
  await expect(saveAccountPreferences({ textScale: "large" }, '"missing"',
    async () => Response.json(defaultsOnly, { headers: { etag: '"missing"' } })))
    .rejects.toBeInstanceOf(PreferencesApiError);
  await expect(saveAccountPreferences({ textScale: "large" }, JSON.stringify(at),
    async () => Response.json({ ...defaultsOnly, updatedAt: at }, { headers: { etag: JSON.stringify(at) } })))
    .rejects.toBeInstanceOf(PreferencesApiError);
});
