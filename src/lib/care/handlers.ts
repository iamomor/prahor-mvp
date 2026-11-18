import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { jsonNoStore } from "../api-response";
import { readIdentity } from "../auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "../auth/validation";
import {
  careRecipientsSchema, closeSupportRequestRequestSchema, consentGrantSchema, createConsentGrantRequestSchema,
  createSupportRequestRequestSchema, providerAcknowledgeRequestSchema, providerRequestSchema,
  providerRequestSummarySchema, providerRespondRequestSchema, supportRequestEventSummarySchema,
  supportRequestSchema, revokeConsentResponseSchema,
} from "../contracts/bondhon";
import { type ApiError, contractVersion, idSchema, timestampSchema } from "../contracts/common";
import { paginationQuerySchema, pageSchema } from "../contracts/transport";

/** Local routes; database adoption and hosted acceptance are separate gates. */
export type CareOperation = "recipients" | "create-consent" | "revoke-consent" | "create-request" |
  "request-detail" | "request-events" | "provider-list" | "acknowledge" | "respond" | "close";
export type CareDependencies = {
  createClient: () => Promise<SupabaseClient | null>;
  siteUrl?: string;
};
const readOperations = new Set<CareOperation>(["recipients", "request-detail", "request-events", "provider-list"]);
const providerOperations = new Set<CareOperation>(["provider-list", "acknowledge", "respond"]);
const motherOperations = new Set<CareOperation>(["recipients", "create-consent", "revoke-consent", "create-request"]);
const pathOperations = new Set<CareOperation>(["revoke-consent", "request-detail", "request-events", "acknowledge", "respond", "close"]);
const retryOperations = new Set<CareOperation>(["create-consent", "create-request", "acknowledge", "respond", "close"]);
const providerCursorSchema = z.strictObject({ createdAt: timestampSchema, id: idSchema });
const revisionCursorSchema = z.string().regex(/^[1-9]\d{0,9}$/).transform(Number).pipe(z.number().int().max(2147483647));
const sameIds = (first: readonly string[], second: readonly string[]) => [...first].sort().join(",") === [...second].sort().join(",");

function queryInput(request: Request): Record<string, string> | null {
  const result: Record<string, string> = Object.create(null);
  for (const [key, value] of new URL(request.url).searchParams) {
    if (Object.hasOwn(result, key)) return null;
    result[key] = value;
  }
  return result;
}

/** Reuses confirmed identity, cookie-bound client, bounded bodies and existing DTOs. */
export async function handleCare(
  request: Request, operation: CareOperation, dependencies: CareDependencies, resourceId?: string,
) {
  const requestId = crypto.randomUUID();
  const reading = readOperations.has(operation);
  function respond(body: unknown, status: number) {
    const response = jsonNoStore(body, status);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  function fail(code: ApiError["error"]["code"], status: number, message: string) {
    return respond({ error: { code, message }, requestId } satisfies ApiError, status);
  }
  function unavailable() {
    return fail("unavailable", 503, reading ? "Care information is unavailable. Try again." :
      "The action could not be confirmed. Keep your draft and retry the same action with the same retry key.");
  }
  const method = reading ? "GET" : "POST";
  if (request.method !== method) {
    const response = fail("invalid_request", 405, "Unsupported method.");
    response.headers.set("Allow", method);
    return response;
  }
  if (!reading) {
    const origin = siteOrigin(dependencies.siteUrl);
    if (!origin) return unavailable();
    if (!sameOriginPost(request, origin)) return fail("forbidden", 403, "This request is not permitted.");
  }
  if (pathOperations.has(operation) && !idSchema.safeParse(resourceId).success) {
    return fail("invalid_request", 400, "Use a valid resource identifier.");
  }
  const retryKey = request.headers.get("Idempotency-Key");
  if (retryOperations.has(operation) && !idSchema.safeParse(retryKey).success) {
    return fail("invalid_request", 400, "Use one UUID retry key and keep it for retries of this action.");
  }
  try {
    const client = await dependencies.createClient();
    const identity = await readIdentity(client);
    if (identity.status === 401) return fail("unauthenticated", 401, "Authentication required.");
    if (identity.status !== 200 || !client) return unavailable();
    const { user_id: actorId, role } = identity.profile;
    if ((providerOperations.has(operation) && role !== "provider") || (motherOperations.has(operation) && role !== "mother")) {
      return fail("forbidden", 403, "This action is not permitted for your account.");
    }
    const expectedAccount = request.headers.get("X-Prohor-Account");
    if (expectedAccount !== null && expectedAccount !== actorId) {
      return fail("conflict", 409, "Your signed-in account changed. Reload and review before continuing.");
    }
    let input: unknown;
    if (!reading && operation !== "revoke-consent") {
      if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("invalid_request", 400, "Send a JSON request.");
      try { input = await boundedJson(request); } catch { return fail("invalid_request", 400, "Send a valid request within the supported size."); }
    } else if (request.body !== null) {
      // HTTP servers may expose an empty POST stream even without payload bytes.
      const reader = request.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.byteLength > 0) {
            await reader.cancel();
            return fail("invalid_request", 400, "This operation accepts no request body.");
          }
        }
      } finally { reader.releaseLock(); }
    }
    const query = queryInput(request);
    if (query === null) return fail("invalid_request", 400, "Use each query parameter once.");
    if (!["provider-list", "request-events"].includes(operation) && Object.keys(query).length > 0) {
      return fail("invalid_request", 400, "This operation accepts no query parameters.");
    }
    let rpcName: string;
    let params: Record<string, unknown>;
    let responseSchema: z.ZodType;
    let created = false;
    switch (operation) {
      case "recipients":
        rpcName = "mvp_care_recipients";
        params = {};
        responseSchema = careRecipientsSchema;
        break;
      case "create-consent": {
        const parsed = createConsentGrantRequestSchema.safeParse(input);
        if (!parsed.success) return fail("invalid_request", 400, "Review the recipient, record fields, purpose and consent dates.");
        const value = parsed.data;
        rpcName = "mvp_care_create_consent";
        params = { p_grantee_user_id: value.granteeUserId, p_record_type: value.record.type,
          p_record_id: value.record.id, p_fields: value.record.fields, p_purpose: value.purpose,
          p_starts_at: value.startsAt, p_expires_at: value.expiresAt,
          p_review_confirmed: value.reviewConfirmed, p_idempotency_key: retryKey };
        responseSchema = consentGrantSchema.refine(value => value.ownerUserId === actorId &&
          value.granteeUserId === parsed.data.granteeUserId && value.record.id === parsed.data.record.id &&
          value.record.type === parsed.data.record.type && sameIds(value.record.fields, parsed.data.record.fields) &&
          value.purpose === parsed.data.purpose && Date.parse(value.startsAt) === Date.parse(parsed.data.startsAt) &&
          Date.parse(value.expiresAt) === Date.parse(parsed.data.expiresAt));
        created = true;
        break;
      }
      case "create-request": {
        const parsed = createSupportRequestRequestSchema.safeParse(input);
        if (!parsed.success) return fail("invalid_request", 400, "Review the recipient, message, purpose and selected consent grants.");
        const value = parsed.data;
        rpcName = "mvp_care_create_request";
        params = { p_recipient_user_id: value.recipientUserId, p_message: value.message,
          p_method: value.method, p_purpose: value.purpose, p_consent_grant_ids: value.consentGrantIds,
          p_review_confirmed: value.reviewConfirmed, p_idempotency_key: retryKey };
        responseSchema = supportRequestSchema.refine(value => value.ownerUserId === actorId && value.recipientUserId === parsed.data.recipientUserId &&
          value.message === parsed.data.message && value.method === parsed.data.method && value.purpose === parsed.data.purpose &&
          sameIds(value.consentGrantIds, parsed.data.consentGrantIds));
        created = true;
        break;
      }
      case "revoke-consent":
        rpcName = "mvp_care_revoke_consent";
        params = { p_id: resourceId };
        responseSchema = revokeConsentResponseSchema.refine(value => value.id === resourceId);
        break;
      case "request-detail":
        rpcName = "mvp_care_get_request";
        params = { p_id: resourceId };
        responseSchema = role === "provider" ? providerRequestSchema.refine(value => value.id === resourceId) :
          supportRequestSchema.refine(value => value.ownerUserId === actorId && value.id === resourceId);
        break;
      case "provider-list": {
        const parsed = paginationQuerySchema.safeParse(query);
        if (!parsed.success) return fail("invalid_request", 400, "Use a supported page limit and cursor.");
        let cursor: z.infer<typeof providerCursorSchema> | null = null;
        if (parsed.data.cursor) {
          try { cursor = providerCursorSchema.parse(JSON.parse(parsed.data.cursor)); }
          catch { return fail("invalid_request", 400, "Use the cursor from your previous request page."); }
        }
        rpcName = "mvp_care_provider_requests";
        params = { p_limit: parsed.data.limit, p_after_created_at: cursor?.createdAt ?? null, p_after_id: cursor?.id ?? null };
        responseSchema = pageSchema(providerRequestSummarySchema).refine(value => value.items.length <= parsed.data.limit && (value.nextCursor === null ||
          (() => { try { return providerCursorSchema.safeParse(JSON.parse(value.nextCursor!)).success; } catch { return false; } })()));
        break;
      }
      case "request-events": {
        const parsed = paginationQuerySchema.safeParse(query);
        if (!parsed.success) return fail("invalid_request", 400, "Use a supported page limit and cursor.");
        const cursor = parsed.data.cursor ? revisionCursorSchema.safeParse(parsed.data.cursor) : null;
        if (cursor && !cursor.success) return fail("invalid_request", 400, "Use the cursor from your previous event page.");
        rpcName = "mvp_care_request_events";
        params = { p_id: resourceId, p_limit: parsed.data.limit, p_after_revision: cursor?.success ? cursor.data : 0 };
        responseSchema = pageSchema(supportRequestEventSummarySchema.refine(value => value.requestId === resourceId))
          .refine(value => value.items.length <= parsed.data.limit && (value.nextCursor === null || revisionCursorSchema.safeParse(value.nextCursor).success));
        break;
      }
      case "acknowledge":
      case "respond":
      case "close": {
        const validator = operation === "respond" ? providerRespondRequestSchema : operation === "close" ? closeSupportRequestRequestSchema : providerAcknowledgeRequestSchema;
        const parsed = validator.safeParse(input);
        if (!parsed.success) return fail("invalid_request", 400, "Review the request revision and action fields.");
        rpcName = operation === "acknowledge" ? "mvp_care_acknowledge" : operation === "respond" ? "mvp_care_respond" : "mvp_care_close";
        params = { p_id: resourceId, p_expected_revision: parsed.data.expectedRevision, p_idempotency_key: retryKey,
          ...("message" in parsed.data ? { p_message: parsed.data.message } : {}) };
        responseSchema = role === "provider" ? providerRequestSchema.refine(value => value.id === resourceId &&
          (operation === "close" ? value.status === "closed" && value.consentedRecords.length === 0 :
            operation === "respond" ? value.status === "responded" : ["acknowledged", "responded"].includes(value.status))) :
          supportRequestSchema.refine(value => value.ownerUserId === actorId && value.id === resourceId && value.status === "closed");
        break;
      }
    }
    const result = await client.rpc(rpcName, params);
    if (result.error) {
      const code = result.error.code;
      if (code === "42501") return fail("forbidden", 403, "This action is not permitted.");
      if (code === "P0002" || code === "23503") return fail("not_found", 404, "This resource is unavailable.");
      if (code === "PT409" || code === "40001" || code === "23505") return fail("conflict", 409, "The revision or retry payload changed. Reload and review before continuing.");
      if (["22023", "23514", "23502", "22P02", "22008"].includes(code)) return fail("invalid_request", 400, "Review the request fields and try again.");
      return unavailable();
    }
    const parsed = responseSchema.safeParse(result.data);
    if (!parsed.success) return unavailable();
    return respond({ data: parsed.data, requestId, contractVersion }, created ? 201 : 200);
  } catch { return unavailable(); }
}
