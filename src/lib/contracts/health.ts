import { z } from "zod";
import {
  dateSchema, idSchema, nonEmptyText, provenanceSchema, recordDestinationSchema,
  rowShape, timestampSchema,
} from "./common";

/** Decimal strings preserve the recorded precision; bounds here are format, not clinical advice. */
const decimalSchema = z.string().regex(/^-?\d{1,9}(\.\d{1,6})?$/);
const numericMeasurement = <T extends string, U extends readonly [string, ...string[]]>(kind: T, units: U) =>
  z.strictObject({ kind: z.literal(kind), value: decimalSchema, unit: z.enum(units) });

const measurements = {
  weight: numericMeasurement("weight", ["kg", "g"] as const),
  temperature: numericMeasurement("temperature", ["Cel", "[degF]"] as const),
  systolic: numericMeasurement("systolic_blood_pressure", ["mm[Hg]"] as const),
  diastolic: numericMeasurement("diastolic_blood_pressure", ["mm[Hg]"] as const),
  hemoglobin: numericMeasurement("hemoglobin", ["g/dL"] as const),
  glucose: numericMeasurement("glucose", ["mg/dL", "mmol/L"] as const),
  fetalHeartRate: numericMeasurement("fetal_heart_rate", ["/min"] as const),
  note: z.strictObject({ kind: z.literal("note"), value: nonEmptyText(2000), unit: z.null() }),
};

/** Explicit unions keep runtime rules and inferred TypeScript types consistent. */
export const maternalMeasurementSchema = z.discriminatedUnion("kind", [
  measurements.weight, measurements.temperature, measurements.systolic, measurements.diastolic,
  measurements.hemoglobin, measurements.glucose, measurements.note,
]);
export const babyMeasurementSchema = z.discriminatedUnion("kind", [
  measurements.weight, measurements.temperature, measurements.fetalHeartRate, measurements.note,
]);
export const measurementSchema = z.discriminatedUnion("kind", [
  ...maternalMeasurementSchema.options, measurements.fetalHeartRate,
]);
export type Measurement = z.infer<typeof measurementSchema>;

export function measurementFitsDestination(
  destination: z.infer<typeof recordDestinationSchema>, measurement: Measurement,
): boolean {
  return (destination.subject === "mother" ? maternalMeasurementSchema : babyMeasurementSchema)
    .safeParse(measurement).success;
}

export const createPregnancyRequestSchema = z.strictObject({
  estimatedDueDate: dateSchema.nullable(),
  lastMenstrualPeriodDate: dateSchema.nullable(),
  label: nonEmptyText(100),
});
export const pregnancyRecordSchema = z.strictObject({
  ...rowShape, ...createPregnancyRequestSchema.shape, provenance: provenanceSchema,
});
export const createBabyRequestSchema = z.strictObject({
  pregnancyId: idSchema.nullable(), label: nonEmptyText(100), birthDate: dateSchema.nullable(),
});
export const babyRecordSchema = z.strictObject({ ...rowShape, ...createBabyRequestSchema.shape });
export const createMaternalConditionRequestSchema = z.strictObject({
  pregnancyId: idSchema.nullable(), label: nonEmptyText(300), documentedAt: timestampSchema,
  sourceNote: nonEmptyText(500).nullable(),
});
export const maternalConditionSchema = z.strictObject({
  ...rowShape, ...createMaternalConditionRequestSchema.omit({ sourceNote: true }).shape,
  provenance: provenanceSchema,
});
export const createSymptomNoteRequestSchema = z.strictObject({
  pregnancyId: idSchema.nullable(), note: nonEmptyText(2000), occurredAt: timestampSchema,
});
function observationSchema<S extends z.ZodRawShape>(extra: S) {
  return z.union([
    z.strictObject({
      ...extra, destination: recordDestinationSchema.options[0],
      measurement: maternalMeasurementSchema, observedAt: timestampSchema,
    }),
    z.strictObject({
      ...extra, destination: recordDestinationSchema.options[1],
      measurement: babyMeasurementSchema, observedAt: timestampSchema,
    }),
  ]);
}

export const createObservationRequestSchema = observationSchema({
  sourceNote: nonEmptyText(500).nullable(),
});
export const healthObservationSchema = observationSchema({ ...rowShape, provenance: provenanceSchema });

export type PregnancyRecord = z.infer<typeof pregnancyRecordSchema>;
export type BabyRecord = z.infer<typeof babyRecordSchema>;
export type MaternalCondition = z.infer<typeof maternalConditionSchema>;
export type CreateObservationRequest = z.infer<typeof createObservationRequestSchema>;
export type HealthObservation = z.infer<typeof healthObservationSchema>;
