import { z } from "zod";
import {
  idSchema, nonEmptyText, recordDestinationSchema, revisionSchema, timestampSchema,
} from "./common";
import { measurementFitsDestination, measurementSchema } from "./health";

/** Proposed first template. Extraction remains unavailable until the synthetic fixture is approved. */
export const supportedReportFormat = "prohor-synthetic-lab-v1" as const;
export const createDocumentRequestSchema = z.strictObject({
  format: z.literal(supportedReportFormat), contentType: z.literal("application/pdf"),
  byteSize: z.number().int().positive().max(5 * 1024 * 1024),
  syntheticConfirmed: z.literal(true),
});
export const startExtractionRequestSchema = z.strictObject({ documentId: idSchema });
// Validate that text exists without altering the original OCR evidence.
const rawText = (max: number) => z.string().max(max).refine(
  value => value.trim().length > 0, "Expected nonempty extracted text.",
);
export const extractedFieldSchema = z.strictObject({
  id: idSchema, rawLabel: rawText(200), rawValue: rawText(1000),
  rawUnit: rawText(100).nullable(), parsedMeasurement: measurementSchema.nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  uncertainty: z.array(z.enum(["illegible", "unknown_unit", "ambiguous_label", "missing_date", "engine_uncertain"])),
  source: z.strictObject({ page: z.number().int().positive(), locator: nonEmptyText(300) }),
  verification: z.literal("unverified"),
});
export const extractionResultSchema = z.strictObject({
  id: idSchema, documentId: idSchema, revision: revisionSchema,
  engine: nonEmptyText(100), engineVersion: nonEmptyText(100),
  format: z.literal(supportedReportFormat),
  status: z.enum(["queued", "processing", "review_required", "failed"]),
  fields: z.array(extractedFieldSchema).max(100),
  errorCode: z.enum(["unsupported_format", "unreadable", "engine_unavailable"]).nullable(),
}).superRefine((value, ctx) => {
  if (new Set(value.fields.map(field => field.id)).size !== value.fields.length) {
    ctx.addIssue({ code: "custom", path: ["fields"], message: "Extraction field IDs must be unique." });
  }
  if ((value.status === "failed") !== (value.errorCode !== null)) {
    ctx.addIssue({ code: "custom", path: ["errorCode"], message: "Failure needs an error code; other states must not have one." });
  }
  if (value.status !== "review_required" && value.fields.length > 0) {
    ctx.addIssue({ code: "custom", path: ["fields"], message: "Only completed extraction exposes reviewable fields." });
  }
  if (value.status === "review_required" && value.fields.length === 0) {
    ctx.addIssue({ code: "custom", path: ["fields"], message: "An empty extraction must fail instead of requesting review." });
  }
});

const fieldDecisionSchema = z.discriminatedUnion("decision", [
  z.strictObject({ extractedFieldId: idSchema, decision: z.literal("rejected") }),
  z.strictObject({
    extractedFieldId: idSchema, decision: z.enum(["accepted", "corrected"]),
    measurement: measurementSchema, observedAt: timestampSchema,
  }),
]);
export const reviewExtractionRequestSchema = z.strictObject({
  expectedExtractionRevision: revisionSchema,
  destination: recordDestinationSchema,
  decisions: z.array(fieldDecisionSchema).min(1).max(100),
  reviewedByMother: z.literal(true),
}).superRefine((value, ctx) => {
  const ids = value.decisions.map(item => item.extractedFieldId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: "custom", path: ["decisions"], message: "Review each field once." });
  }
  value.decisions.forEach((decision, index) => {
    if (decision.decision !== "rejected" && !measurementFitsDestination(value.destination, decision.measurement)) {
      ctx.addIssue({ code: "custom", path: ["decisions", index, "measurement"], message: "Measurement does not match the chosen subject." });
    }
  });
});

/** Values and destination come from the immutable reviewed snapshot, never from a second client payload. */
export const commitDocumentReviewRequestSchema = z.strictObject({
  reviewId: idSchema, expectedReviewRevision: revisionSchema, confirmSave: z.literal(true),
});
export type ExtractedField = z.infer<typeof extractedFieldSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;
export type ReviewExtractionRequest = z.infer<typeof reviewExtractionRequestSchema>;
export type CommitDocumentReviewRequest = z.infer<typeof commitDocumentReviewRequestSchema>;
