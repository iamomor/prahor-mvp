import { z } from "zod";
import { communicationMethodSchema, idSchema, revisionSchema, timestampSchema } from "./common";

export const shonketConcernTypes = [
  "headache_vision", "bleeding_fluid", "baby_movement", "breathing_chest", "fever",
  "swelling", "pain", "mood_safety", "other",
] as const;
export const shonketOnsetValues = ["now", "today", "this_week", "longer"] as const;
export const shonketRequestStatusSchema = z.enum(["submitted", "delivered", "acknowledged"]);
export const shonketRequestCreateSchema = z.strictObject({
  message: z.string().trim().min(1).max(1000),
  method: communicationMethodSchema,
  concernTypes: z.array(z.enum(shonketConcernTypes)).max(9).refine(items => new Set(items).size === items.length),
  onset: z.enum(shonketOnsetValues).nullable(),
  language: z.enum(["bn", "en"]),
  reviewConfirmed: z.literal(true),
});
export const shonketConsentSchema = z.strictObject({
  termsVersion: z.string().min(1), expiresAt: timestampSchema, revokedAt: timestampSchema.nullable(), version: z.number().int().positive(),
});
export const shonketRequestEventSchema = z.strictObject({ status: shonketRequestStatusSchema, occurredAt: timestampSchema, requestRevision: revisionSchema });
export const shonketRequestSchema = z.strictObject({
  id: idSchema, createdAt: timestampSchema, updatedAt: timestampSchema, revision: revisionSchema,
  status: shonketRequestStatusSchema, message: z.string().min(1).max(1000), method: communicationMethodSchema,
  concernTypes: z.array(z.enum(shonketConcernTypes)).max(9), onset: z.enum(shonketOnsetValues).nullable(),
  events: z.array(shonketRequestEventSchema).max(10).optional(),
  consent: shonketConsentSchema.optional(),
});
export const shonketRequestListSchema = z.array(shonketRequestSchema).max(50);
export const shonketProviderQueueSchema = z.array(shonketRequestSchema).max(50);
export type ShonketRequestCreate = z.infer<typeof shonketRequestCreateSchema>;
export type ShonketRequest = z.infer<typeof shonketRequestSchema>;
