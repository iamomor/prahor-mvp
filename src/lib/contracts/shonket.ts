import { z } from "zod";
import { idSchema, languageSchema, nonEmptyText, timestampSchema } from "./common";

/** Public projection only after trusted clinical review; no guidance text is supplied by Step 7. */
export const safetyGuidanceSchema = z.strictObject({
  id: idSchema, version: nonEmptyText(100), language: languageSchema,
  title: nonEmptyText(300), reviewedText: nonEmptyText(12000),
  sourceUrls: z.array(z.url({ protocol: /^https$/ })).min(1).max(20),
  clinicalReviewerReference: nonEmptyText(300), reviewedAt: timestampSchema,
  status: z.literal("approved"),
});
export type SafetyGuidance = z.infer<typeof safetyGuidanceSchema>;
