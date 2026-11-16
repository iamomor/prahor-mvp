import type { z } from "zod";
import type { babyMeasurementSchema, maternalMeasurementSchema } from "../../src/lib/contracts/health";
import type { CreateObservationRequest } from "../../src/lib/contracts/health";
import type { ShareableRecord } from "../../src/lib/contracts/sharing";

type Assert<T extends true> = T;

/** Compile-time regression checks: runtime subject restrictions must also narrow shared types. */
export type MaternalMeasurementsExcludeFetalReadings = Assert<
  Extract<z.infer<typeof maternalMeasurementSchema>, { kind: "fetal_heart_rate" }> extends never ? true : false
>;
export type BabyMeasurementsExcludeMaternalOnlyReadings = Assert<
  Extract<z.infer<typeof babyMeasurementSchema>, { kind: "hemoglobin" | "glucose" }> extends never ? true : false
>;
export type BabyConsentFieldsStaySpecific = Assert<
  Exclude<Extract<ShareableRecord, { type: "baby_record" }>["fields"][number], "label" | "birthDate"> extends never ? true : false
>;

type FetalReadingOnMother = {
  destination: { subject: "mother"; pregnancyId: null };
  measurement: { kind: "fetal_heart_rate"; value: "120"; unit: "/min" };
  observedAt: string;
  sourceNote: null;
};
export type RequestRejectsIncompatibleSubject = Assert<
  FetalReadingOnMother extends CreateObservationRequest ? false : true
>;
