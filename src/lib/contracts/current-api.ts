import { z } from "zod";
import { apiErrorSchema, nonEmptyText } from "./common";
import { currentUserSchema } from "./platform";
import { bartaRequestSchema, bartaAnswerSchema, bartaAudioRequestSchema } from "./barta";
import {
  careRecipientsSchema, closeSupportRequestRequestSchema, consentGrantSchema, createConsentGrantRequestSchema,
  createSupportRequestRequestSchema, providerAcknowledgeRequestSchema, providerRequestSchema,
  providerRequestSummarySchema, providerRespondRequestSchema, revokeConsentResponseSchema,
  supportRequestEventSummarySchema, supportRequestSchema,
} from "./bondhon";
import { bondhonDetailSchema } from "./bondhon-detail";
import { availableRecordSchema, followUpRequestSchema } from "./coordination";
import { patchAccessPreferencesSchema, preferencesResponseSchema } from "./adapt";
import { apiSuccessSchema, currentUserResponseSchema, pageSchema, paginationQuerySchema } from "./transport";
import { directoryQuerySchema, directoryResponseSchema, nearbyQuerySchema, nearbyResponseSchema, pothErrorSchema } from "./poth-current";
import { createDiaryEntryRequestSchema, createWellnessEntryRequestSchema } from "./wellness";
import { createBabyRequestSchema, createMaternalConditionRequestSchema, createObservationRequestSchema, createPregnancyRequestSchema, createSymptomNoteRequestSchema } from "./health";

// Derived from the existing feature schemas; no second domain validation system.
export const starterBartaRequestSchema = bartaRequestSchema.pick({ question: true });
export const starterCareRequestSchema = createSupportRequestRequestSchema.pick({ message: true, method: true });
export const starterBartaResponseSchema = z.strictObject({ message: nonEmptyText(500), status: z.literal("not_connected") });
const bartaErrorSchema = z.strictObject({ message: nonEmptyText(500) });
export const currentBartaRequestSchema = z.union([bartaRequestSchema, starterBartaRequestSchema]);
export const currentBartaResponseSchema = z.union([bartaAnswerSchema, starterBartaResponseSchema, bartaErrorSchema]);
export const starterCareResponseSchema = z.strictObject({ message: nonEmptyText(500), status: z.literal("not_sent") });
export const starterHealthResponseSchema = z.strictObject({ message: nonEmptyText(500) });
export const legacyIdentityResponseSchema = z.strictObject({ profile: z.strictObject({
  user_id: currentUserSchema.shape.id, display_name: currentUserSchema.shape.displayName,
  role: currentUserSchema.shape.role,
}) });
export const legacyIdentityErrorSchema = z.strictObject({ code: z.enum(["session-required", "unavailable", "access-denied"]) });

type CurrentRoute = {
  source: string;
  status: "Implemented" | "Limited" | "Mock";
  owners: readonly string[];
  auth: "confirmed-user" | "mother" | "request-participant" | "provider" | "session-only-stub" | "public-stub" | "public";
  request: z.ZodType;
  responses: Readonly<Record<number, z.ZodType>>;
};

const careErrorResponses = {
  400: apiErrorSchema, 401: apiErrorSchema, 403: apiErrorSchema,
  404: apiErrorSchema, 409: apiErrorSchema, 503: apiErrorSchema,
} as const;

/** Actual exported /api route methods; care uses a simulated queue with separate UI acceptance. */
export const currentApiContracts = {
  "GET /api/me": {
    source: "src/app/api/me/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: z.undefined(), responses: { 200: currentUserResponseSchema, 401: apiErrorSchema, 404: apiErrorSchema, 500: apiErrorSchema },
  },
  "GET /api/preferences": {
    source: "src/app/api/preferences/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: z.undefined(), responses: { 200: preferencesResponseSchema, 401: apiErrorSchema, 403: apiErrorSchema, 409: apiErrorSchema, 500: apiErrorSchema },
  },
  "PATCH /api/preferences": {
    source: "src/app/api/preferences/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: patchAccessPreferencesSchema,
    responses: { 200: preferencesResponseSchema, 400: apiErrorSchema, 401: apiErrorSchema, 403: apiErrorSchema, 409: apiErrorSchema, 500: apiErrorSchema },
  },
  "GET /api/auth/me": {
    source: "src/app/api/auth/me/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: z.undefined(), responses: { 200: legacyIdentityResponseSchema, 401: legacyIdentityErrorSchema, 503: legacyIdentityErrorSchema },
  },
  "GET /api/auth/provider": {
    source: "src/app/api/auth/provider/route.ts", status: "Implemented", owners: ["Omor", "Samin"], auth: "provider",
    request: z.undefined(), responses: { 200: legacyIdentityResponseSchema, 401: legacyIdentityErrorSchema, 403: legacyIdentityErrorSchema, 503: legacyIdentityErrorSchema },
  },
  "GET /api/health": {
    source: "src/app/api/health/route.ts", status: "Mock", owners: ["Ifty", "Omor"], auth: "session-only-stub",
    request: z.undefined(), responses: { 401: starterHealthResponseSchema, 501: starterHealthResponseSchema, 503: starterHealthResponseSchema },
  },
  "GET /api/jibonrekha": {
    source: "src/app/api/jibonrekha/route.ts", status: "Limited", owners: ["Ifty", "Omor"], auth: "mother",
    request: z.undefined(), responses: {
      200: z.strictObject({
        pregnancies: z.array(z.object({ id: z.uuid(), label: z.string() })),
        babies: z.array(z.object({ id: z.uuid(), label: z.string() })),
        observations: z.array(z.object({ id: z.uuid(), subject: z.enum(["mother", "baby"]), kind: z.string(), value: z.string() })),
        conditions: z.array(z.object({ id: z.uuid(), label: z.string() })),
        symptomNotes: z.array(z.object({ id: z.uuid(), note: z.string() })),
        visits: z.array(z.object({ id: z.uuid(), subject: z.enum(["mother", "baby"]) })),
        corrections: z.array(z.object({ id: z.uuid(), old_observation_id: z.uuid(), new_observation_id: z.uuid() })),
      }),
      401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 503: starterHealthResponseSchema,
    },
  },
  "POST /api/jibonrekha": {
    source: "src/app/api/jibonrekha/route.ts", status: "Limited", owners: ["Ifty", "Omor"], auth: "mother",
    request: z.discriminatedUnion("type", [
      z.strictObject({ type: z.literal("pregnancy"), record: createPregnancyRequestSchema }),
      z.strictObject({ type: z.literal("baby"), record: createBabyRequestSchema }),
      z.strictObject({ type: z.literal("observation"), record: createObservationRequestSchema }),
      z.strictObject({ type: z.literal("condition"), record: createMaternalConditionRequestSchema }),
      z.strictObject({ type: z.literal("symptom_note"), record: createSymptomNoteRequestSchema }),
      z.strictObject({ type: z.literal("visit"), record: z.strictObject({ subject: z.enum(["mother", "baby"]), parentId: z.uuid().nullable(), occurredAt: z.iso.datetime({ offset: true }), placeNote: z.string().trim().min(1).max(300).nullable(), note: z.string().trim().min(1).max(2000).nullable() }) }),
      z.strictObject({ type: z.literal("correction"), record: z.strictObject({ subject: z.enum(["mother", "baby"]), observationId: z.uuid(), value: z.string().trim().min(1).max(2000), unit: z.string().trim().max(20).nullable(), reason: z.string().trim().min(1).max(500) }) }),
    ]),
    responses: { 201: z.strictObject({ saved: z.literal(true), id: z.uuid() }), 400: starterHealthResponseSchema, 401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 409: starterHealthResponseSchema, 503: starterHealthResponseSchema },
  },
  "POST /api/reports/commit": {
    source: "src/app/api/reports/commit/route.ts", status: "Limited", owners: ["Ifty", "Omor"], auth: "mother",
    request: z.strictObject({
      reportId: z.string().uuid(), pregnancyId: z.string().uuid(),
      sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
      rawLabel: z.string().min(1).max(120), rawValue: z.string().max(40), rawUnit: z.string().max(20),
      reviewedValue: z.string().regex(/^[0-9]{1,3}(\.[0-9]{1,2})?$/),
      reviewedUnit: z.literal("g/dL"), observedOn: z.iso.date(), confirmSave: z.literal(true),
    }),
    responses: {
      200: z.strictObject({ saved: z.literal(true), observationId: z.string().uuid() }),
      400: starterHealthResponseSchema, 401: starterHealthResponseSchema, 403: starterHealthResponseSchema,
      409: starterHealthResponseSchema, 503: starterHealthResponseSchema,
    },
  },
  "GET /api/wellness": {
    source: "src/app/api/wellness/route.ts", status: "Limited", owners: ["Samin", "Omor"], auth: "mother",
    request: z.undefined(), responses: {
      // Mirrors the route's select list exactly (snake_case wire rows, max 100, newest first).
      200: z.strictObject({ entries: z.array(z.strictObject({
        id: z.uuid(), occurred_at: z.iso.datetime({ offset: true }), created_at: z.iso.datetime({ offset: true }),
        mood: createWellnessEntryRequestSchema.shape.mood, energy: createWellnessEntryRequestSchema.shape.energy,
        activity_note: z.string().nullable(), rest_note: z.string().nullable(),
      })).max(100) }),
      401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 503: starterHealthResponseSchema,
    },
  },
  "POST /api/wellness": {
    source: "src/app/api/wellness/route.ts", status: "Limited", owners: ["Samin", "Omor"], auth: "mother",
    request: createWellnessEntryRequestSchema,
    responses: { 201: z.strictObject({ saved: z.literal(true), id: z.uuid() }), 400: starterHealthResponseSchema, 401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 503: starterHealthResponseSchema },
  },
  "GET /api/diary": {
    source: "src/app/api/diary/route.ts", status: "Limited", owners: ["Samin", "Omor"], auth: "mother",
    request: z.undefined(), responses: {
      200: z.strictObject({ entries: z.array(z.strictObject({
        id: z.uuid(), text: z.string(), privacy: z.literal("owner_only"),
        occurred_at: z.iso.datetime({ offset: true }), created_at: z.iso.datetime({ offset: true }),
      })).max(100) }),
      401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 503: starterHealthResponseSchema,
    },
  },
  "POST /api/diary": {
    source: "src/app/api/diary/route.ts", status: "Limited", owners: ["Samin", "Omor"], auth: "mother",
    request: createDiaryEntryRequestSchema,
    responses: { 201: z.strictObject({ saved: z.literal(true), id: z.uuid() }), 400: starterHealthResponseSchema, 401: starterHealthResponseSchema, 403: starterHealthResponseSchema, 503: starterHealthResponseSchema },
  },
  "POST /api/ai/chat": {
    source: "src/app/api/ai/chat/route.ts", status: "Limited", owners: ["Iftee", "Omor"], auth: "public",
    request: currentBartaRequestSchema,
    responses: { 200: bartaAnswerSchema, 400: currentBartaResponseSchema, 501: currentBartaResponseSchema, 503: currentBartaResponseSchema },
  },
  "POST /api/ai/barta-audio": {
    source: "src/app/api/ai/barta-audio/route.ts", status: "Limited", owners: ["Iftee", "Omor"], auth: "public",
    request: bartaAudioRequestSchema,
    responses: { 200: z.instanceof(Uint8Array), 400: bartaErrorSchema, 403: bartaErrorSchema, 404: bartaErrorSchema, 429: bartaErrorSchema, 502: bartaErrorSchema, 503: bartaErrorSchema },
  },
  "GET /api/poth/facilities": {
    source: "src/app/api/poth/facilities/route.ts", status: "Limited", owners: ["Iftee", "Samin", "Omor"], auth: "public",
    request: directoryQuerySchema, responses: { 200: directoryResponseSchema, 400: pothErrorSchema },
  },
  "GET /api/poth/nearby": {
    source: "src/app/api/poth/nearby/route.ts", status: "Limited", owners: ["Iftee", "Samin", "Omor"], auth: "public",
    request: nearbyQuerySchema, responses: { 200: nearbyResponseSchema, 400: pothErrorSchema, 429: pothErrorSchema, 503: pothErrorSchema },
  },
  "GET /api/care-recipients": {
    source: "src/app/api/care-recipients/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: z.undefined(), responses: { 200: apiSuccessSchema(careRecipientsSchema), ...careErrorResponses },
  },
  "POST /api/consents": {
    source: "src/app/api/consents/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: createConsentGrantRequestSchema, responses: { 201: apiSuccessSchema(consentGrantSchema), ...careErrorResponses },
  },
  "POST /api/consents/:id/revoke": {
    source: "src/app/api/consents/[id]/revoke/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: z.undefined(), responses: { 200: apiSuccessSchema(revokeConsentResponseSchema), ...careErrorResponses },
  },
  "POST /api/care-requests": {
    source: "src/app/api/care-requests/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: createSupportRequestRequestSchema, responses: { 201: apiSuccessSchema(supportRequestSchema), ...careErrorResponses },
  },
  "GET /api/care-records": {
    source: "src/app/api/care-records/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: z.undefined(), responses: { 200: apiSuccessSchema(z.array(availableRecordSchema).max(100)), ...careErrorResponses },
  },
  "GET /api/care-requests": {
    source: "src/app/api/care-requests/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: paginationQuerySchema, responses: { 200: apiSuccessSchema(pageSchema(supportRequestSchema)), ...careErrorResponses },
  },
  "GET /api/care-requests/:id": {
    source: "src/app/api/care-requests/[id]/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "request-participant",
    request: z.undefined(), responses: { 200: apiSuccessSchema(z.union([supportRequestSchema, providerRequestSchema])), ...careErrorResponses },
  },
  "GET /api/care-requests/:id/coordination": {
    source: "src/app/api/care-requests/[id]/coordination/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "request-participant",
    request: z.undefined(), responses: { 200: apiSuccessSchema(bondhonDetailSchema), ...careErrorResponses },
  },
  "POST /api/care-requests/:id/messages": {
    source: "src/app/api/care-requests/[id]/messages/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "request-participant",
    request: followUpRequestSchema, responses: { 200: apiSuccessSchema(bondhonDetailSchema), ...careErrorResponses },
  },
  "POST /api/care-requests/:id/revoke": {
    source: "src/app/api/care-requests/[id]/revoke/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "mother",
    request: z.undefined(), responses: { 200: apiSuccessSchema(bondhonDetailSchema), ...careErrorResponses },
  },
  "GET /api/care-requests/:id/events": {
    source: "src/app/api/care-requests/[id]/events/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "request-participant",
    request: z.undefined(), responses: { 200: apiSuccessSchema(pageSchema(supportRequestEventSummarySchema)), ...careErrorResponses },
  },
  "GET /api/provider/requests": {
    source: "src/app/api/provider/requests/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "provider",
    request: z.undefined(), responses: { 200: apiSuccessSchema(pageSchema(providerRequestSummarySchema)), ...careErrorResponses },
  },
  "POST /api/provider/requests/:id/acknowledge": {
    source: "src/app/api/provider/requests/[id]/acknowledge/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "provider",
    request: providerAcknowledgeRequestSchema, responses: { 200: apiSuccessSchema(providerRequestSchema), ...careErrorResponses },
  },
  "POST /api/provider/requests/:id/respond": {
    source: "src/app/api/provider/requests/[id]/respond/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "provider",
    request: providerRespondRequestSchema, responses: { 200: apiSuccessSchema(providerRequestSchema), ...careErrorResponses },
  },
  "POST /api/care-requests/:id/close": {
    source: "src/app/api/care-requests/[id]/close/route.ts", status: "Limited", owners: ["Omor", "Samin"], auth: "request-participant",
    request: closeSupportRequestRequestSchema, responses: { 200: apiSuccessSchema(z.union([supportRequestSchema, providerRequestSchema])), ...careErrorResponses },
  },
} as const satisfies Record<string, CurrentRoute>;

export type CurrentApiRoute = keyof typeof currentApiContracts;
type CurrentOperation<K extends CurrentApiRoute> = {
  request: z.input<(typeof currentApiContracts)[K]["request"]>;
  response: z.output<(typeof currentApiContracts)[K]["responses"][keyof (typeof currentApiContracts)[K]["responses"]]>;
};
export type CurrentApiOperations = { [K in CurrentApiRoute]: CurrentOperation<K> };
export type CurrentApiRequest<K extends CurrentApiRoute> = CurrentApiOperations[K]["request"];
export type CurrentApiResponse<K extends CurrentApiRoute> = CurrentApiOperations[K]["response"];
