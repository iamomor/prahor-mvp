import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginRequest, siteOrigin } from "@/lib/auth/validation";
import { patchAccessPreferencesSchema, type PreferencesResponse } from "@/lib/contracts/adapt";
import { contractVersion, timestampSchema, type ApiError } from "@/lib/contracts/common";
import { loadPreferences, patchPreferences, PreferenceStoreError, type PreferenceSnapshot } from "./preferences";

export type PreferencesDependencies = { createClient: () => Promise<SupabaseClient | null>; siteUrl?: string };

export async function handlePreferences(request: Request, dependencies: PreferencesDependencies) {
  const requestId = crypto.randomUUID();
  function respond(body: PreferencesResponse | ApiError, status: number, etag?: string) {
    const response = jsonNoStore(body, status);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    if (etag) response.headers.set("ETag", etag);
    return response;
  }
  function fail(code: ApiError["error"]["code"], message: string, status: number) {
    return respond({ error: { code, message }, requestId }, status);
  }
  function saved(snapshot: PreferenceSnapshot) {
    return respond({ data: snapshot.settings, schemaVersion: 2, updatedAt: snapshot.updatedAt, requestId, contractVersion },
      200, JSON.stringify(snapshot.updatedAt ?? "missing"));
  }
  try {
    const client = await dependencies.createClient();
    const identity = await readIdentity(client);
    if (identity.status === 401) return fail("unauthenticated", "Authentication required.", 401);
    if (identity.status !== 200 || !client) return fail("unavailable", "Preferences are unavailable.", 500);
    if (request.method === "GET") return saved(await loadPreferences(client, identity.profile.user_id));
    if (request.method !== "PATCH") return fail("invalid_request", "Unsupported method.", 405);
    const origin = siteOrigin(dependencies.siteUrl);
    if (!origin) return fail("unavailable", "Preferences are unavailable.", 500);
    if (!sameOriginRequest(request, origin)) {
      return fail("forbidden", "This request is not permitted.", 403);
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("invalid_request", "Send a JSON preference patch.", 400);
    let input: unknown;
    try { input = await boundedJson(request); } catch { return fail("invalid_request", "Send a valid preference patch.", 400); }
    const parsed = patchAccessPreferencesSchema.safeParse(input);
    if (!parsed.success) return fail("invalid_request", "Use only supported preference fields and values.", 400);
    const condition = request.headers.get("if-match");
    let updatedAt: string | null = null;
    if (condition !== null) {
      try {
        const value: unknown = JSON.parse(condition);
        if (value !== "missing") updatedAt = timestampSchema.parse(value);
      } catch { return fail("invalid_request", "Use the ETag from your latest preference response.", 400); }
    }
    return saved(await patchPreferences(client, parsed.data, { check: condition !== null, updatedAt }));
  } catch (error) {
    if (error instanceof PreferenceStoreError) {
      if (error.kind === "conflict") return fail("conflict", "Preferences changed. Reload and review before saving.", 409);
      if (error.kind === "forbidden") return fail("forbidden", "This request is not permitted.", 403);
      if (error.kind === "invalid") return fail("invalid_request", "Use only supported preference fields and values.", 400);
    }
    return fail("unavailable", "Preferences are unavailable. Your save was not confirmed.", 500);
  }
}
