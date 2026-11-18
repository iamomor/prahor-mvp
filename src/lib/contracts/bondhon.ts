import { z } from "zod";
import {
  communicationMethodSchema, idSchema, nonEmptyText,
  revisionSchema, rowShape, timestampSchema,
} from "./common";
import { shareableRecordSchema, sharedRecordProjectionSchema } from "./sharing";
/** Approved simulated recipients only; no email, credentials or patient directory. */
export const careRecipientSchema = z.strictObject({
  id: idSchema, displayName: z.string().max(120), providerMode: z.literal("simulated"),
});
export const careRecipientsSchema = z.array(careRecipientSchema).refine(
  values => new Set(values.map(value => value.id)).size === values.length, "Recipients must be unique.",
);
export const revokeConsentResponseSchema = z.strictObject({ id: idSchema, revokedAt: timestampSchema });
// Preserve existing imports while keeping field rules in one place.
export { shareableRecordSchema, sharedRecordProjectionSchema } from "./sharing";
export type { ShareableRecord, SharedRecordProjection } from "./sharing";
const consentGrantShape = {
  granteeUserId: idSchema,
  record: shareableRecordSchema,
  purpose: nonEmptyText(300),
  startsAt: timestampSchema,
  expiresAt: timestampSchema,
};
export const createConsentGrantRequestSchema = z.strictObject({
  ...consentGrantShape,
  reviewConfirmed: z.literal(true),
}).refine(value => Date.parse(value.expiresAt) > Date.parse(value.startsAt), {
  path: ["expiresAt"], message: "Consent must expire after it starts.",
});
export const consentGrantSchema = z.strictObject({
  ...rowShape, ...consentGrantShape,
  revokedAt: timestampSchema.nullable(),
}).refine(value => Date.parse(value.expiresAt) > Date.parse(value.startsAt), {
  path: ["expiresAt"], message: "Consent must expire after it starts.",
}).refine(value => value.ownerUserId !== value.granteeUserId, {
  path: ["granteeUserId"], message: "Choose a recipient other than the record owner.",
});

export const supportRequestStatuses = ["submitted", "delivered", "acknowledged", "responded", "closed"] as const;
export const supportRequestStatusSchema = z.enum(supportRequestStatuses);
export type SupportRequestStatus = z.infer<typeof supportRequestStatusSchema>;

export const createSupportRequestRequestSchema = z.strictObject({
  recipientUserId: idSchema, message: nonEmptyText(1000), method: communicationMethodSchema,
  purpose: nonEmptyText(300),
  consentGrantIds: z.array(idSchema).max(20).refine(
    value => new Set(value).size === value.length, "Reference each grant once.",
  ),
  reviewConfirmed: z.literal(true),
});
export const supportRequestSchema = z.strictObject({
  ...rowShape, ...createSupportRequestRequestSchema.omit({ reviewConfirmed: true }).shape,
  status: supportRequestStatusSchema, providerMode: z.literal("simulated"),
});

export const providerRequestSummarySchema = z.strictObject({
  id: idSchema, createdAt: timestampSchema, updatedAt: timestampSchema,
  revision: revisionSchema, status: supportRequestStatusSchema,
  providerMode: z.literal("simulated"), method: communicationMethodSchema,
  message: nonEmptyText(1000),
});
export const providerRequestSchema = providerRequestSummarySchema.extend({
  consentedRecords: z.array(sharedRecordProjectionSchema).max(20),
});
export const supportRequestEventSummarySchema = z.strictObject({
  id: idSchema, requestId: idSchema, status: supportRequestStatusSchema,
  occurredAt: timestampSchema, requestRevision: revisionSchema,
});

const eventShape = {
  id: idSchema, requestId: idSchema, actorUserId: idSchema,
  occurredAt: timestampSchema, requestRevision: revisionSchema,
};
export const supportRequestEventSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...eventShape, status: z.literal("submitted") }),
  z.strictObject({ ...eventShape, status: z.literal("delivered"), deliveryReceiptId: idSchema }),
  z.strictObject({ ...eventShape, status: z.literal("acknowledged"), assignmentId: idSchema }),
  z.strictObject({ ...eventShape, status: z.literal("responded"), assignmentId: idSchema, responseMessageId: idSchema }),
  z.strictObject({ ...eventShape, status: z.literal("closed"), reason: z.enum(["owner_closed", "provider_closed"]) }),
]);

const nextStatuses: Record<SupportRequestStatus, readonly SupportRequestStatus[]> = {
  submitted: ["delivered", "closed"],
  delivered: ["acknowledged", "closed"],
  acknowledged: ["responded", "closed"],
  responded: ["closed"],
  closed: [],
};
/** Structural rule only. Server transaction must additionally verify actor, assignment and evidence. */
export function isPermittedSupportTransition(from: SupportRequestStatus, to: SupportRequestStatus): boolean {
  return nextStatuses[from].includes(to);
}
export const providerAcknowledgeRequestSchema = z.strictObject({ expectedRevision: revisionSchema });
export const providerRespondRequestSchema = z.strictObject({
  expectedRevision: revisionSchema, message: nonEmptyText(2000),
});
export const closeSupportRequestRequestSchema = z.strictObject({ expectedRevision: revisionSchema });

export type ConsentGrant = z.infer<typeof consentGrantSchema>;
export type CreateSupportRequestRequest = z.infer<typeof createSupportRequestRequestSchema>;
export type SupportRequest = z.infer<typeof supportRequestSchema>;
export type SupportRequestEvent = z.infer<typeof supportRequestEventSchema>;
export type SupportRequestEventSummary = z.infer<typeof supportRequestEventSummarySchema>;
export type ProviderRequestSummary = z.infer<typeof providerRequestSummarySchema>;
export type ProviderRequest = z.infer<typeof providerRequestSchema>;
