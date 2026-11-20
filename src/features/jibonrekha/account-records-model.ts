import { z } from "zod";

const id = z.string().min(1);
const date = z.iso.date();
const timestamp = z.iso.datetime({ offset: true });
export const accountRecordsSchema = z.object({
  pregnancies: z.array(z.object({ id, label: z.string(), estimated_due_date: date.nullable(), last_menstrual_period_date: date.nullable() })),
  babies: z.array(z.object({ id, pregnancy_id: id.nullable(), label: z.string(), birth_date: date.nullable() })),
  observations: z.array(z.object({ id, subject: z.enum(["mother", "baby"]), pregnancy_id: id.nullable().optional(), baby_id: id.optional(), kind: z.string(), value: z.string(), unit: z.string().nullable(), observed_at: timestamp, source: z.string(), verification: z.string() })),
  conditions: z.array(z.object({ id, pregnancy_id: id.nullable(), label: z.string(), documented_at: timestamp, source_note: z.string().nullable() })),
  symptomNotes: z.array(z.object({ id, pregnancy_id: id.nullable(), note: z.string(), occurred_at: timestamp })),
  visits: z.array(z.object({ id, subject: z.enum(["mother", "baby"]), pregnancy_id: id.nullable(), baby_id: id.nullable(), occurred_at: timestamp, place_note: z.string().nullable(), note: z.string().nullable() })),
  corrections: z.array(z.object({ id, subject: z.enum(["mother", "baby"]), old_observation_id: id, new_observation_id: id, reason: z.string(), corrected_at: timestamp })),
});
export type AccountRecordsData = z.infer<typeof accountRecordsSchema>;
export type AccountPregnancy = AccountRecordsData["pregnancies"][number];
export type GuideSelection = { week: number; day: number };
export function selectAccountPregnancy(pregnancies: AccountPregnancy[], selectedId: string) {
  return pregnancies.find((item) => item.id === selectedId)
    ?? pregnancies.find((item) => item.estimated_due_date || item.last_menstrual_period_date)
    ?? pregnancies[0];
}
export function belongsToPregnancy(item: { subject: "mother" | "baby"; pregnancy_id?: string | null; baby_id?: string | null }, pregnancyId: string | undefined, babies: AccountRecordsData["babies"]) {
  if (!pregnancyId) return true;
  return item.subject === "mother" ? item.pregnancy_id === pregnancyId : babies.some((baby) => baby.id === item.baby_id && baby.pregnancy_id === pregnancyId);
}
