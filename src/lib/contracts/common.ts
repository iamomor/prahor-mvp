import { z } from "zod";

/** Proposed v1 wire contracts, not generated Supabase Database row types. */
export const contractVersion = "1" as const;
export const idSchema = z.uuid();
export const timestampSchema = z.iso.datetime({ offset: true });
export const dateSchema = z.iso.date();
export const languageSchema = z.enum(["bn", "en"]);
export const communicationMethodSchema = z.enum(["text", "aac", "call"]);
export const revisionSchema = z.number().int().positive();
export const nonEmptyText = (max: number) => z.string().trim().min(1).max(max);
export const rowShape = {
  id: idSchema,
  ownerUserId: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  revision: revisionSchema,
  dataMode: z.literal("synthetic"),
};

export const recordDestinationSchema = z.discriminatedUnion("subject", [
  z.strictObject({ subject: z.literal("mother"), pregnancyId: idSchema.nullable() }),
  z.strictObject({ subject: z.literal("baby"), babyId: idSchema }),
]);

export const provenanceSchema = z.discriminatedUnion("source", [
  z.strictObject({
    source: z.literal("self_reported"),
    verification: z.literal("self_reported"),
    recordedByUserId: idSchema,
    recordedAt: timestampSchema,
    sourceNote: nonEmptyText(500).nullable(),
  }),
  z.strictObject({
    source: z.literal("document_extracted"),
    verification: z.literal("user_verified"),
    recordedByUserId: idSchema,
    recordedAt: timestampSchema,
    documentId: idSchema,
    extractedFieldId: idSchema,
    reviewId: idSchema,
  }),
  z.strictObject({
    source: z.literal("clinician_entered"),
    verification: z.literal("clinician_unconfirmed"),
    recordedByUserId: idSchema,
    recordedAt: timestampSchema,
    clinicianUserId: idSchema,
    clinicianReference: nonEmptyText(500),
  }),
  z.strictObject({
    source: z.literal("clinician_confirmed"),
    verification: z.literal("clinician_confirmed"),
    recordedByUserId: idSchema,
    recordedAt: timestampSchema,
    clinicianUserId: idSchema,
    clinicianReference: nonEmptyText(500),
    confirmedAt: timestampSchema,
    supersedesRecordId: idSchema,
  }),
]);

/** Minimal shareable labels: no source notes, document locators or clinician identifiers. */
const provenanceLabelFields = { source: true, verification: true, recordedAt: true } as const;
export const provenanceLabelSchema = z.discriminatedUnion("source", [
  provenanceSchema.options[0].pick(provenanceLabelFields),
  provenanceSchema.options[1].pick(provenanceLabelFields),
  provenanceSchema.options[2].pick(provenanceLabelFields),
  provenanceSchema.options[3].pick(provenanceLabelFields),
]);

export const apiErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum([
      "invalid_request", "unauthenticated", "forbidden", "not_found", "conflict",
      "unsupported_format", "file_too_large", "rate_limited", "not_implemented",
      "unavailable", "insufficient_evidence",
    ]),
    message: nonEmptyText(500),
    fieldErrors: z.array(z.strictObject({
      path: nonEmptyText(200), message: nonEmptyText(300),
    })).optional(),
  }),
  requestId: idSchema,
});

export type RecordDestination = z.infer<typeof recordDestinationSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = { data: T; requestId: string; contractVersion: typeof contractVersion };
export type ApiResult<T> = ApiSuccess<T> | ApiError;
export type Page<T> = { items: T[]; nextCursor: string | null };
