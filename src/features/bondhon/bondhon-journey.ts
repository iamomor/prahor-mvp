/** Presentation helpers only. Server authorization remains authoritative. */
export type JourneyLanguage = "en" | "bn";
export type JourneySelection = Record<string, string[]>;
type RecordLike = { type: string; id: string; fields: Record<string, unknown> };
const measurementNames: Record<string, { en: string; bn: string }> = {
  systolic_blood_pressure: { en: "Blood pressure · systolic", bn: "রক্তচাপ · সিস্টোলিক" },
  diastolic_blood_pressure: { en: "Blood pressure · diastolic", bn: "রক্তচাপ · ডায়াস্টোলিক" },
  hemoglobin: { en: "Haemoglobin", bn: "হিমোগ্লোবিন" },
  weight: { en: "Weight", bn: "ওজন" }, temperature: { en: "Temperature", bn: "তাপমাত্রা" },
  glucose: { en: "Blood glucose", bn: "রক্তের গ্লুকোজ" },
  fetal_heart_rate: { en: "Recorded heart rate", bn: "লিপিবদ্ধ হৃদস্পন্দন" },
  note: { en: "Recorded note", bn: "লিপিবদ্ধ নোট" },
};
export function recordDescription(record: RecordLike, language: JourneyLanguage): string | null {
  const measurement = record.fields.measurement;
  if (measurement && typeof measurement === "object" && "kind" in measurement && typeof measurement.kind === "string")
    return measurementNames[measurement.kind]?.[language] ?? null;
  return typeof record.fields.label === "string" ? record.fields.label : null;
}
/** Refreshes can remove a record/field. Never keep an invisible selection or add a newly available field. */
export function reconcileSelection(selection: JourneySelection, records: readonly { record: RecordLike }[]): JourneySelection {
  return Object.fromEntries(records.flatMap(({ record }) => {
    const key = `${record.type}/${record.id}`;
    const fields = [...new Set(selection[key] ?? [])].filter(field => Object.hasOwn(record.fields, field));
    return fields.length ? [[key, fields]] : [];
  }));
}
export function composeIssue(step: number, draft: { purpose: string; message: string; recipient: string }, recipients: readonly { id: string }[]): "message" | "recipient" | null {
  if (step === 0 && (!draft.purpose.trim() || !draft.message.trim())) return "message";
  if (step === 1 && !recipients.some(person => person.id === draft.recipient)) return "recipient";
  return null;
}
