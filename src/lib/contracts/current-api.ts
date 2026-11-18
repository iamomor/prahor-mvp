import { z } from "zod";
import { apiErrorSchema, nonEmptyText } from "./common";
import { currentUserSchema } from "./platform";
import { bartaRequestSchema } from "./barta";
import { createSupportRequestRequestSchema } from "./bondhon";
import { patchAccessPreferencesSchema, preferencesResponseSchema } from "./adapt";
import { currentUserResponseSchema } from "./transport";

// Derived from the existing feature schemas; no second domain validation system.
export const starterBartaRequestSchema = bartaRequestSchema.pick({ question: true });
export const starterCareRequestSchema = createSupportRequestRequestSchema.pick({ message: true, method: true });
export const starterBartaResponseSchema = z.strictObject({ message: nonEmptyText(500), status: z.literal("not_connected") });
export const starterCareResponseSchema = z.strictObject({ message: nonEmptyText(500), status: z.literal("not_sent") });
export const starterHealthResponseSchema = z.strictObject({ message: nonEmptyText(500) });
export const starterAudioResponseSchema = z.strictObject({ message: nonEmptyText(500) });
export const legacyIdentityResponseSchema = z.strictObject({ profile: z.strictObject({
  user_id: currentUserSchema.shape.id, display_name: currentUserSchema.shape.displayName,
  role: currentUserSchema.shape.role,
}) });
export const legacyIdentityErrorSchema = z.strictObject({ code: z.enum(["session-required", "unavailable", "access-denied"]) });

type CurrentRoute = {
  source: string;
  status: "Implemented" | "Mock";
  owners: readonly string[];
  auth: "confirmed-user" | "provider" | "session-only-stub" | "public-stub";
  request: z.ZodType;
  responses: Readonly<Record<number, z.ZodType>>;
};

/** Actual exported /api route methods, not a promise that planned services exist. */
export const currentApiContracts = {
  "GET /api/me": {
    source: "src/app/api/me/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: z.undefined(), responses: { 200: currentUserResponseSchema, 401: apiErrorSchema, 404: apiErrorSchema, 500: apiErrorSchema },
  },
  "GET /api/preferences": {
    source: "src/app/api/preferences/route.ts", status: "Implemented", owners: ["Omor", "Apurbo"], auth: "confirmed-user",
    request: z.undefined(), responses: { 200: preferencesResponseSchema, 401: apiErrorSchema, 403: apiErrorSchema, 500: apiErrorSchema },
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
  "POST /api/ai/chat": {
    source: "src/app/api/ai/chat/route.ts", status: "Mock", owners: ["Iftee", "Omor"], auth: "public-stub",
    request: starterBartaRequestSchema, responses: { 400: starterBartaResponseSchema, 501: starterBartaResponseSchema },
  },
  "POST /api/ai/barta-audio": {
    source: "src/app/api/ai/barta-audio/route.ts", status: "Implemented", owners: ["Iftee", "Omor"], auth: "public-stub",
    request: z.unknown(), responses: { 400: starterAudioResponseSchema, 403: starterAudioResponseSchema, 503: starterAudioResponseSchema },
  },
  "POST /api/care-requests": {
    source: "src/app/api/care-requests/route.ts", status: "Mock", owners: ["Omor", "Samin"], auth: "public-stub",
    request: starterCareRequestSchema, responses: { 400: starterCareResponseSchema, 501: starterCareResponseSchema },
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
