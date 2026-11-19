import { z } from "zod";
import type { LifelineRecord } from "./lifeline-record";

export const LIFELINE_KEY = "prohor-lifeline-experience-v1";
export const LIFELINE_DRAFT_KEY = "prohor-lifeline-draft-v1";
export const DEMO_AS_OF = "2026-11-19";

const recordSchema = z.object({
  id: z.string().min(1), kind: z.string().min(1), label: z.string().min(1), value: z.string(), unit: z.string().nullable(),
  observedAt: z.iso.date(), provenance: z.enum(["self", "extracted", "clinician_entered", "clinician_confirmed", "demo"]),
  subject: z.enum(["mother", "baby"]), supersedes: z.string().nullable().optional(), createdAt: z.string(), note: z.string().optional(),
});
export const lifelineStateSchema = z.object({
  version: z.literal(1), revision: z.number().int().nonnegative(),
  label: z.string().min(1), dateSource: z.enum(["clinician", "lmp", "ultrasound", "unknown"]), dateValue: z.iso.date().nullable(),
  dateHistory: z.array(z.object({ source: z.string(), value: z.string(), savedAt: z.string() })),
  babyLabel: z.string().min(1), babyBirthDate: z.iso.date().nullable(),
  records: z.array(recordSchema),
  nextVisit: z.object({ title: z.string(), date: z.iso.date(), provenance: z.enum(["self", "clinician_entered"]) }).nullable(),
  checklist: z.array(z.string()),
});
export type LifelineState = z.infer<typeof lifelineStateSchema>;

const sample = (id: string, kind: string, label: string, value: string, unit: string | null, observedAt: string, subject: LifelineRecord["subject"], provenance: LifelineRecord["provenance"], note?: string, supersedes?: string): LifelineRecord => ({
  id, kind, label, value, unit, observedAt, subject, provenance, createdAt: `${observedAt}T09:00:00+06:00`, ...(note ? { note } : {}), ...(supersedes ? { supersedes } : {}),
});

export const initialLifeline: LifelineState = {
  version: 1, revision: 0, label: "গর্ভকাল ১", dateSource: "clinician", dateValue: "2027-03-05", dateHistory: [],
  babyLabel: "আমার শিশু", babyBirthDate: null,
  nextVisit: { title: "প্রসবপূর্ব সেবা (ANC)", date: "2026-12-03", provenance: "self" },
  checklist: [],
  records: [
    sample("sample-bp", "blood_pressure", "রক্তচাপ", "110/70", "mmHg", "2026-11-14", "mother", "self"),
    sample("sample-weight-old", "weight", "ওজন", "64.2", "কেজি", "2026-11-14", "mother", "self"),
    { ...sample("sample-weight", "weight", "ওজন", "62.4", "কেজি", "2026-11-14", "mother", "self", "সংশোধিত ১৫ নভেম্বর। আগের মান রাখা আছে।", "sample-weight-old"), createdAt: "2026-11-15T09:00:00+06:00" },
    sample("sample-hb", "hemoglobin", "হিমোগ্লোবিন", "11.2", "g/dL", "2026-11-10", "mother", "extracted", "রিপোর্টের লেখা মিলিয়ে নিলে তবে রেকর্ডে স্থায়ী হবে।"),
    sample("sample-movement", "movement_note", "শিশুর নড়াচড়া — আপনার নোট", "সকালে নাশতার পর নড়াচড়া টের পেয়েছি।", null, "2026-11-17", "baby", "self"),
    sample("sample-ultrasound", "ultrasound", "আল্ট্রাসাউন্ড স্ক্যান", "বিস্তারিত রিপোর্টে।", null, "2026-11-12", "baby", "clinician_confirmed"),
    sample("sample-anc", "visit", "ANC ভিজিট", "চিকিৎসকের লেখা ভিজিট রেকর্ড।", null, "2026-11-12", "mother", "clinician_entered"),
    sample("sample-medicine", "medicine", "আয়রন-ফলিক অ্যাসিড ট্যাবলেট", "চিকিৎসকের লেখা ওষুধের নোট।", null, "2026-10-22", "mother", "clinician_entered"),
    sample("sample-condition", "condition", "গর্ভকালীন ডায়াবেটিস", "আপনি লিখেছেন; চিকিৎসক নিশ্চিত করেননি।", null, "2026-11-02", "mother", "self"),
    sample("sample-symptom", "symptom_note", "পিঠে ব্যথা", "সন্ধ্যায় বেশি।", null, "2026-11-16", "mother", "self"),
  ],
};

export function readLifeline(): LifelineState {
  const raw = localStorage.getItem(LIFELINE_KEY);
  if (!raw) return structuredClone(initialLifeline);
  return lifelineStateSchema.parse(JSON.parse(raw));
}
export function writeLifeline(previous: LifelineState, next: LifelineState): LifelineState {
  const raw = localStorage.getItem(LIFELINE_KEY);
  const current = raw ? lifelineStateSchema.parse(JSON.parse(raw)) : initialLifeline;
  if (current.revision !== previous.revision) throw new Error("অন্য ট্যাবে তথ্য বদলেছে। আপনার লেখা এখানেই আছে। পাতা রিফ্রেশ করে আবার চেষ্টা করুন।");
  const saved = lifelineStateSchema.parse({ ...next, revision: previous.revision + 1 });
  localStorage.setItem(LIFELINE_KEY, JSON.stringify(saved));
  return saved;
}

export function calculateJourney(state: LifelineState, asOf = DEMO_AS_OF) {
  if (!state.dateValue || state.dateSource === "unknown") return null;
  const chosen = Date.parse(`${state.dateValue}T00:00:00Z`);
  const current = Date.parse(`${asOf}T00:00:00Z`);
  const due = state.dateSource === "lmp" ? chosen + 280 * 86400000 : chosen;
  const elapsed = Math.floor((current - (due - 280 * 86400000)) / 86400000);
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 294) return null;
  return { weeks: Math.floor(elapsed / 7), days: elapsed % 7, dueDate: new Date(due).toISOString().slice(0, 10), trimester: elapsed < 98 ? 1 : elapsed < 196 ? 2 : 3 };
}
