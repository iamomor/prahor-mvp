import { z } from "zod";
import { nonEmptyText, rowShape, timestampSchema } from "./common";

/** No arbitrary private_note field: diary uses a separate owner-only resource. */
export const createWellnessEntryRequestSchema = z.strictObject({
  occurredAt: timestampSchema,
  mood: z.enum(["comfortable", "mixed", "difficult", "prefer_not_to_say"]).nullable(),
  energy: z.enum(["low", "medium", "high", "prefer_not_to_say"]).nullable(),
  activityNote: nonEmptyText(1000).nullable(), restNote: nonEmptyText(1000).nullable(),
}).refine(value => Boolean(value.mood || value.energy || value.activityNote || value.restNote), {
  message: "Choose at least one optional check-in field.",
});
// safeExtend preserves the check-in refinement; copying .shape silently discards it.
export const wellnessEntrySchema = createWellnessEntryRequestSchema.safeExtend(rowShape);
export const createDiaryEntryRequestSchema = z.strictObject({
  text: nonEmptyText(10000), occurredAt: timestampSchema,
});
export const diaryEntrySchema = z.strictObject({
  ...rowShape, ...createDiaryEntryRequestSchema.shape, privacy: z.literal("owner_only"),
});
export type WellnessEntry = z.infer<typeof wellnessEntrySchema>;
export type DiaryEntry = z.infer<typeof diaryEntrySchema>;
