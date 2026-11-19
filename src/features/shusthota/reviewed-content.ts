import { z } from "zod";
import { idSchema, languageSchema, timestampSchema } from "@/lib/contracts/common";

/** Content cannot be published unless its review provenance is complete and approved. */
export const reviewedResourceSchema = z.strictObject({
  id: idSchema,
  language: languageSchema,
  category: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(12000),
  sourceReference: z.string().trim().min(1).max(1000),
  contentVersion: z.string().trim().min(1).max(40),
  review: z.strictObject({
    status: z.literal("approved"),
    reviewerId: idSchema,
    reviewerRole: z.string().trim().min(1).max(100),
    reviewedAt: timestampSchema,
  }),
  publicationStatus: z.literal("published"),
  educationalOnly: z.literal(true),
});

/** Future plan metadata has the same publication gate; there are intentionally no plan records today. */
export const clinicianApprovedPlanSchema = z.strictObject({
  id: idSchema,
  language: languageSchema,
  title: z.string().trim().min(1).max(160),
  instructions: z.string().trim().min(1).max(12000),
  version: z.string().trim().min(1).max(40),
  sourceReference: z.string().trim().min(1).max(1000),
  review: z.strictObject({
    status: z.literal("approved"),
    clinicianId: idSchema,
    qualification: z.string().trim().min(1).max(120),
    approvedAt: timestampSchema,
  }),
  publicationStatus: z.literal("published"),
});

/** No diary field is representable in this future provider interface. */
export type WellnessTrendInput = {
  consented: true;
  fields: readonly ("mood" | "energy" | "activityNote" | "restNote" | "hydration")[];
  records: readonly { occurredAt: string; mood?: string | null; energy?: string | null; activityNote?: string | null; restNote?: string | null; hydrationMl?: number }[];
};
export type WellnessTrendOutput = { summary: string; informationalOnly: true; nonDiagnostic: true };
export interface WellnessTrendProvider {
  summarize(input: WellnessTrendInput): Promise<WellnessTrendOutput>;
}
