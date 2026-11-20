import { z } from "zod";
import { idSchema, languageSchema, timestampSchema } from "./common";
import { shareableRecordSchema, sharedRecordProjectionSchema } from "./sharing";

export const bondhonTermsVersion = "bondhon-demo-2026-11-19" as const;
export const accommodationKeys = ["written", "interpreter", "step_free", "quiet", "easy_read", "support_person"] as const;
export const coordinationTermsSchema = z.strictObject({
  termsVersion: z.literal(bondhonTermsVersion),
  expiresAt: timestampSchema,
  allowReplies: z.boolean(),
  language: languageSchema,
  accommodations: z.array(z.enum(accommodationKeys)).max(6).refine(items => new Set(items).size === items.length),
});
export const coordinationApprovalSchema = coordinationTermsSchema.extend({
  records: z.array(shareableRecordSchema).max(20).refine(items =>
    new Set(items.map(item => `${item.type}/${item.id}`)).size === items.length, "Select each record once."),
});
export const shonketTermsVersion = "shonket-demo-2026-11-20" as const;
// Receipts also cover Shonket requests; only Bondhon approvals (creation input) stay pinned to the Bondhon terms.
export const coordinationReceiptSchema = coordinationTermsSchema.extend({
  termsVersion: z.enum([bondhonTermsVersion, shonketTermsVersion]),
  approvedAt: timestampSchema,
  revokedAt: timestampSchema.nullable(),
  version: z.number().int().positive(),
});
export const followUpRequestSchema = z.strictObject({
  message: z.string().trim().min(1).max(2000),
  expectedRevision: z.number().int().positive(),
});
export const coordinationMessageSchema = z.strictObject({
  id: idSchema, sender: z.enum(["mother", "provider"]), message: z.string().min(1).max(2000),
  sentAt: timestampSchema, simulated: z.literal(true),
});
export const coordinationAuditSchema = z.strictObject({
  id: idSchema, action: z.string().min(1).max(80), actor: z.enum(["mother", "provider"]),
  occurredAt: timestampSchema, policyVersion: z.number().int().positive().nullable(),
});
export const availableRecordSchema = z.strictObject({
  record: sharedRecordProjectionSchema,
  recordedAt: timestampSchema,
  dataMode: z.literal("synthetic"),
});
export type CoordinationApproval = z.infer<typeof coordinationApprovalSchema>;
export type CoordinationReceipt = z.infer<typeof coordinationReceiptSchema>;
export type CoordinationMessage = z.infer<typeof coordinationMessageSchema>;
export type Accommodation = typeof accommodationKeys[number];
