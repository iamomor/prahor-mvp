import { z } from "zod";
import { idSchema, timestampSchema } from "./common";

export const hydrationRequestSchema = z.strictObject({
  amountMl: z.number().int().min(1).max(5000),
  occurredAt: timestampSchema,
  retryKey: idSchema,
});
export const hydrationGetQuerySchema = z.strictObject({ scope: z.enum(["today", "history"]).optional() });
export const hydrationEntrySchema = z.strictObject({
  id: idSchema, amount_ml: z.number().int().min(1).max(5000),
  occurred_at: timestampSchema, created_at: timestampSchema,
});
export const hydrationResponseSchema = z.strictObject({ entries: z.array(hydrationEntrySchema).max(100) });

export const habitIconSchema = z.enum(["water", "reading", "rest", "movement", "care", "custom"]);
export const createHabitRequestSchema = z.strictObject({ label: z.string().trim().min(1).max(60), icon: habitIconSchema, retryKey: idSchema });
export const habitSchema = z.strictObject({ id: idSchema, label: z.string().min(1).max(60), icon: habitIconSchema, created_at: timestampSchema });
export const habitsResponseSchema = z.strictObject({ habits: z.array(habitSchema).max(100) });
export const habitEventRequestSchema = z.discriminatedUnion("eventType", [
  z.strictObject({ eventType: z.literal("completed"), occurredAt: timestampSchema, retryKey: idSchema }),
  z.strictObject({ eventType: z.literal("completion_undone"), occurredAt: timestampSchema, retryKey: idSchema, relatedEventId: idSchema }),
  z.strictObject({ eventType: z.literal("archived"), occurredAt: timestampSchema, retryKey: idSchema }),
]);
export const habitEventSchema = z.strictObject({
  id: idSchema, habit_id: idSchema, event_type: z.enum(["completed", "completion_undone", "archived"]),
  related_event_id: idSchema.nullable(), occurred_at: timestampSchema, created_at: timestampSchema,
});
export const habitEventsResponseSchema = z.strictObject({ entries: z.array(habitEventSchema).max(100) });
export const combinedHabitEventSchema = habitEventSchema.extend({ habit_label: z.string().min(1).max(60) });
export const combinedHabitEventsResponseSchema = z.strictObject({ entries: z.array(combinedHabitEventSchema).max(100) });

export const activityPreferenceValues = ["walking", "assisted", "seated", "gentle_movement", "resting", "other", "none"] as const;
export const activityPreferencesRequestSchema = z.strictObject({
  preferences: z.array(z.enum(activityPreferenceValues)).max(activityPreferenceValues.length)
    .refine(values => new Set(values).size === values.length)
    .refine(values => !values.includes("none") || values.length === 1),
  occurredAt: timestampSchema,
  retryKey: idSchema,
});
export const activityPreferenceSchema = z.strictObject({
  id: idSchema, preferences: z.array(z.enum(activityPreferenceValues)), occurred_at: timestampSchema, created_at: timestampSchema,
});
export const activityPreferencesResponseSchema = z.strictObject({ entries: z.array(activityPreferenceSchema).max(100) });
