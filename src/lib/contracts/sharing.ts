import { z } from "zod";
import { idSchema, provenanceLabelSchema, timestampSchema } from "./common";
import {
  babyMeasurementSchema, babyRecordSchema, createSymptomNoteRequestSchema,
  maternalConditionSchema, maternalMeasurementSchema, pregnancyRecordSchema,
} from "./health";
import { wellnessEntrySchema } from "./wellness";

/** One field definition drives both consent keys and provider response validation. */
const shareableFields = {
  pregnancy: pregnancyRecordSchema.pick({ label: true, estimatedDueDate: true, lastMenstrualPeriodDate: true })
    .extend({ provenance: provenanceLabelSchema }),
  condition: maternalConditionSchema.pick({ label: true, documentedAt: true })
    .extend({ provenance: provenanceLabelSchema }),
  maternalObservation: z.strictObject({
    measurement: maternalMeasurementSchema,
    observedAt: timestampSchema,
    provenance: provenanceLabelSchema,
  }),
  symptom: createSymptomNoteRequestSchema.pick({ note: true, occurredAt: true }),
  baby: babyRecordSchema.pick({ label: true, birthDate: true }),
  babyObservation: z.strictObject({
    measurement: babyMeasurementSchema,
    observedAt: timestampSchema,
    provenance: provenanceLabelSchema,
  }),
  // Construct from the field validators to avoid inheriting the full check-in refinement.
  wellness: z.strictObject({
    mood: wellnessEntrySchema.shape.mood,
    energy: wellnessEntrySchema.shape.energy,
    activityNote: wellnessEntrySchema.shape.activityNote,
    restNote: wellnessEntrySchema.shape.restNote,
    occurredAt: wellnessEntrySchema.shape.occurredAt,
  }),
};

function scope<T extends string, S extends z.ZodRawShape>(type: T, fields: z.ZodObject<S>) {
  return z.strictObject({
    type: z.literal(type), id: idSchema,
    fields: z.array(fields.keyof()).min(1).max(Object.keys(fields.shape).length)
      .refine(value => new Set(value).size === value.length, "Select each field once."),
  });
}

function projection<T extends string, S extends z.ZodRawShape>(type: T, fields: z.ZodObject<S>) {
  return z.strictObject({
    type: z.literal(type), id: idSchema,
    fields: fields.partial().refine(
      value => Object.values(value).some(field => field !== undefined),
      "A projection must contain an authorized field.",
    ),
  });
}

/** Diary, AI conversations and raw documents deliberately have no sharing scope. */
export const shareableRecordSchema = z.discriminatedUnion("type", [
  scope("pregnancy_record", shareableFields.pregnancy),
  scope("maternal_condition", shareableFields.condition),
  scope("maternal_observation", shareableFields.maternalObservation),
  scope("maternal_symptom_note", shareableFields.symptom),
  scope("baby_record", shareableFields.baby),
  scope("baby_observation", shareableFields.babyObservation),
  scope("wellness_entry", shareableFields.wellness),
]);
export const sharedRecordProjectionSchema = z.discriminatedUnion("type", [
  projection("pregnancy_record", shareableFields.pregnancy),
  projection("maternal_condition", shareableFields.condition),
  projection("maternal_observation", shareableFields.maternalObservation),
  projection("maternal_symptom_note", shareableFields.symptom),
  projection("baby_record", shareableFields.baby),
  projection("baby_observation", shareableFields.babyObservation),
  projection("wellness_entry", shareableFields.wellness),
]);

export type ShareableRecord = z.infer<typeof shareableRecordSchema>;
export type SharedRecordProjection = z.infer<typeof sharedRecordProjectionSchema>;
