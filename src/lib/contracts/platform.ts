import { z } from "zod";
import { idSchema, nonEmptyText, timestampSchema } from "./common";
import { activeRoleSchema } from "./account";

export const profileSchema = z.strictObject({
  userId: idSchema, displayName: nonEmptyText(100).nullable(),
  createdAt: timestampSchema, updatedAt: timestampSchema, dataMode: z.literal("synthetic"),
});
export const userRoleSchema = z.enum(["mother", "provider", "supporter"]);
/** Active workspace. Full memberships and approval states are returned by /auth/account. */
export const currentUserSchema = z.strictObject({
  id: idSchema,
  displayName: z.string().max(120),
  role: activeRoleSchema,
});
export type CurrentUser = z.infer<typeof currentUserSchema>;
export const providerProfileSchema = z.strictObject({
  userId: idSchema, displayName: nonEmptyText(100), mode: z.literal("simulated"),
  approval: z.discriminatedUnion("status", [
    z.strictObject({ status: z.literal("pending") }),
    z.strictObject({ status: z.literal("approved"), approvedByUserId: idSchema, approvedAt: timestampSchema }),
    z.strictObject({ status: z.literal("revoked"), revokedAt: timestampSchema }),
  ]),
});
export const auditEventSchema = z.strictObject({
  id: idSchema, actorUserId: idSchema.nullable(), ownerUserId: idSchema.nullable(),
  action: z.enum([
    "record_created", "record_corrected", "record_deleted", "record_shared_read",
    "consent_granted", "consent_revoked", "request_submitted", "request_status_changed",
    "document_reviewed", "document_committed", "provider_approved", "access_denied",
  ]),
  resourceType: z.enum([
    "pregnancy_record", "baby_record", "maternal_condition", "maternal_observation",
    "baby_observation", "maternal_symptom_note", "wellness_entry", "wellness_diary_entry",
    "medical_document", "document_review", "consent_grant", "support_request", "provider_profile",
  ]),
  resourceId: idSchema, requestId: idSchema,
  outcome: z.enum(["allowed", "denied"]), occurredAt: timestampSchema,
});
export type Profile = z.infer<typeof profileSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type ProviderProfile = z.infer<typeof providerProfileSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
