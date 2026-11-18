import { z } from "zod";
import type { HealthObservation } from "./demo-health";

export const DEFAULT_EPISODE_ID = "demo-pregnancy-001";
export const DEMO_ACTOR = "demo-user-001";
export function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function observationDate(value: string): boolean {
  return calendarDate(value) || (/^\d{4}-\d{2}-\d{2}T/.test(value) && calendarDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value)));
}
export function dhakaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
const text = z.string().max(4000);
const date = z.string().refine(calendarDate, "Choose a real calendar date.");
const optionalDate = z.union([z.literal(""), date]);
const id = z.string().min(1).max(100);
const provenance = z.object({
  source: z.enum(["self_reported", "document_extracted", "clinician_entered", "clinician_confirmed"]),
  enteredBy: id, enteredAt: z.string().datetime(),
  reviewStatus: z.enum(["unverified", "user_reviewed", "clinician_confirmed"]),
  sourceDocument: text.default(""), confirmedBy: text.default(""), confirmedAt: text.default(""), fictionalProvider: z.boolean().default(false),
}).refine(p => p.source !== "document_extracted" || Boolean(p.sourceDocument.trim()), "Document-extracted entries need a source document reference.")
  .refine(p => !p.source.startsWith("clinician_") || (p.fictionalProvider && Boolean(p.confirmedBy) && Number.isFinite(Date.parse(p.confirmedAt))), "Provider provenance requires a labelled fictional example or a future trusted server.")
  .refine(p => p.reviewStatus !== "clinician_confirmed" || p.source === "clinician_confirmed", "User checking is not clinician confirmation.");
export const profileSchema = z.object({ id, userId: id, name: z.string().trim().min(1).max(160), birthDate: optionalDate, age: text, contact: text, language: z.enum(["bn", "en"]), history: z.object({ gravida: text, para: text, losses: text, living: text, cSection: z.enum(["unknown", "yes", "no"]), previousBirths: text, complications: text, notes: text }) });
export const episodeSchema = z.object({ id, motherId: id, label: z.string().trim().min(1).max(160), lmp: optionalDate, edd: optionalDate, eddSource: z.enum(["unknown", "lmp", "ultrasound", "clinician_documented"]), status: z.enum(["unknown", "ongoing", "ended"]), startDate: optionalDate, endDate: optionalDate, notes: text });
export const babySchema = z.object({ id, motherId: id, pregnancyId: id, label: z.string().trim().min(1).max(160), stage: z.enum(["fetal", "newborn", "child", "unknown"]), birthDate: optionalDate, birthWeight: text, weightUnit: text, birthLength: text, lengthUnit: text, sex: text, deliveryMode: text, apgar: text, outcome: text });
export const entryKinds = { condition: "অবস্থা · Condition", allergy: "অ্যালার্জি · Allergy", medicine: "ওষুধ/সাপ্লিমেন্ট · Medicine or supplement", vaccine: "টিকা · Immunization", encounter: "ভিজিট/পরীক্ষা · Visit or examination", event: "ঘটনা · Pregnancy event" } as const;
export const clinicalSchema = z.object({ id, pregnancyId: id, recordType: z.enum(["mother", "baby"]), recordId: id, kind: z.enum(["condition", "allergy", "medicine", "vaccine", "encounter", "event"]), name: z.string().trim().min(1).max(200), date, endDate: optionalDate, status: z.enum(["active", "resolved", "suspected", "unknown"]), dose: text, frequency: text, doseNumber: text, notes: text, provenance, archived: z.boolean().default(false) });
export const appointmentSchema = z.object({ id, pregnancyId: id, recordType: z.enum(["mother", "baby"]), recordId: id, title: z.string().trim().min(1).max(200), date, kind: z.enum(["anc", "vaccination", "lab_recheck", "immunization", "follow_up"]), notes: text, completed: z.boolean(), provenance });
export const consentSchema = z.object({ id, recordType: z.enum(["mother", "baby"]), recordId: id, recipient: z.enum(["family", "provider", "barta"]), allowed: z.boolean(), observationIds: z.array(id), updatedAt: z.string().datetime() });
export const auditSchema = z.object({ id, targetId: id, action: z.enum(["create", "update", "archive", "restore", "consent", "access", "export"]), at: z.string().datetime(), actor: id, reason: text, before: z.string().max(100000), after: z.string().max(100000) });
export const workspaceSchema = z.object({ version: z.literal(2), revision: z.number().int().nonnegative(), profile: profileSchema, episodes: z.array(episodeSchema).min(1), babies: z.array(babySchema), entries: z.array(clinicalSchema), appointments: z.array(appointmentSchema), consents: z.array(consentSchema), audit: z.array(auditSchema) });
export type MotherProfile = z.infer<typeof profileSchema>;
export type PregnancyEpisode = z.infer<typeof episodeSchema>;
export type BabyRecord = z.infer<typeof babySchema>;
export type ClinicalEntry = z.infer<typeof clinicalSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Consent = z.infer<typeof consentSchema>;
export type AuditEvent = z.infer<typeof auditSchema>;
export type RecordsWorkspace = z.infer<typeof workspaceSchema>;
export type Provenance = ClinicalEntry["provenance"];
export type ObservationRevision = { at: string; actor: string; reason: string; action: "correct" | "archive" | "restore"; before: { value: string; unit: string; observedAt: string; label: string; archived: boolean }; after: { value: string; unit: string; observedAt: string; label: string; archived: boolean } };

export function initialWorkspace(): RecordsWorkspace {
  return { version: 2, revision: 0,
    profile: { id: "demo-mother-001", userId: DEMO_ACTOR, name: "Ayesha Rahman", birthDate: "", age: "", contact: "", language: "bn", history: { gravida: "", para: "", losses: "", living: "", cSection: "unknown", previousBirths: "", complications: "", notes: "" } },
    episodes: [{ id: DEFAULT_EPISODE_ID, motherId: "demo-mother-001", label: "প্রথম ডেমো গর্ভকাল · Original demo pregnancy", lmp: "", edd: "2027-03-08", eddSource: "unknown", status: "unknown", startDate: "", endDate: "", notes: "Fictional existing EDD; source needs review." }],
    babies: [{ id: "demo-baby-001", motherId: "demo-mother-001", pregnancyId: DEFAULT_EPISODE_ID, label: "Baby's Health — শিশুর স্বাস্থ্য", stage: "unknown", birthDate: "", birthWeight: "", weightUnit: "", birthLength: "", lengthUnit: "", sex: "", deliveryMode: "", apgar: "", outcome: "" }], entries: [], appointments: [], consents: [], audit: [] };
}
export function validateWorkspace(input: unknown): RecordsWorkspace {
  const state = workspaceSchema.parse(input);
  if (state.profile.birthDate && state.profile.birthDate > dhakaToday()) throw new Error("Date of birth cannot be in the future.");
  for (const value of [state.profile.history.gravida, state.profile.history.para, state.profile.history.losses, state.profile.history.living]) if (value && !/^\d+$/.test(value)) throw new Error("Documented G/P/A/L counts must be whole numbers, or left unknown.");
  const allIds = [...state.episodes, ...state.babies, ...state.entries, ...state.appointments, ...state.consents].map(item => item.id);
  if (new Set(allIds).size !== allIds.length) throw new Error("Duplicate record identifiers.");
  if (!state.episodes.some(e => e.id === DEFAULT_EPISODE_ID)) throw new Error("The original pregnancy must remain linked for legacy and Bujhi records.");
  for (const e of state.episodes) {
    if (e.motherId !== state.profile.id) throw new Error("Pregnancy belongs to another mother.");
    if (e.startDate && e.endDate && e.endDate < e.startDate) throw new Error("Pregnancy end date precedes its start date.");
    if (e.lmp && e.edd && e.edd <= e.lmp) throw new Error("EDD must follow LMP. Check the source dates.");
  }
  for (const b of state.babies) {
    if (b.motherId !== state.profile.id || !state.episodes.some(e => e.id === b.pregnancyId)) throw new Error("Baby needs a valid mother and pregnancy relationship.");
    if ((b.birthWeight && !b.weightUnit) || (b.birthLength && !b.lengthUnit)) throw new Error("Document the unit for newborn measurements.");
  }
  for (const item of [...state.entries, ...state.appointments]) {
    if (!validDestination(state, item.recordType, item.recordId, item.pregnancyId)) throw new Error("Entry destination and pregnancy do not match.");
    if ("endDate" in item && item.endDate && item.endDate < item.date) throw new Error("End date precedes the recorded start date.");
  }
  const clinicalIdentities = new Set<string>();
  for (const entry of state.entries.filter(e => !e.archived)) {
    const identity = JSON.stringify([entry.pregnancyId, entry.recordType, entry.recordId, entry.kind, entry.name.toLowerCase().trim(), entry.date, entry.endDate, entry.status, entry.dose, entry.frequency, entry.doseNumber, entry.notes, entry.provenance.source, entry.provenance.sourceDocument]);
    if (clinicalIdentities.has(identity)) throw new Error("An identical clinical record already exists. Correct or review the existing record instead.");
    clinicalIdentities.add(identity);
  }
  const scopes = new Set<string>();
  for (const c of state.consents) {
    if (c.recordType === "mother" ? c.recordId !== state.profile.id : !state.babies.some(b => b.id === c.recordId)) throw new Error("Consent record does not exist.");
    const scope = `${c.recordType}/${c.recordId}/${c.recipient}`;
    if (scopes.has(scope)) throw new Error("Duplicate consent scope."); scopes.add(scope);
  }
  return state;
}
export function validDestination(state: RecordsWorkspace, type: "mother" | "baby", recordId: string, pregnancyId: string): boolean {
  return state.episodes.some(e => e.id === pregnancyId) && (type === "mother" ? recordId === state.profile.id : state.babies.some(b => b.id === recordId && b.pregnancyId === pregnancyId));
}
export function episodeOf(observation: HealthObservation): string { return observation.pregnancyId ?? DEFAULT_EPISODE_ID; }
export function gestationalDating(episode: PregnancyEpisode, onDate: string): { weeks: number; days: number; totalDays: number; method: string; warning?: string } | null {
  if (!calendarDate(onDate)) return null;
  // A documented ultrasound/clinician EDD takes precedence; no stored date is overwritten.
  const useEdd = Boolean(episode.edd && calendarDate(episode.edd) && (episode.eddSource === "ultrasound" || episode.eddSource === "clinician_documented" || !episode.lmp));
  const reference = useEdd ? episode.edd : episode.lmp;
  if (!calendarDate(reference)) return null;
  const days = Math.floor((Date.parse(`${onDate}T00:00:00Z`) - Date.parse(`${reference}T00:00:00Z`)) / 86400000) + (useEdd ? 280 : 0);
  if (days < 0) return null; // A negative estimate means these dates need review.
  const difference = episode.lmp && episode.edd ? Math.abs((Date.parse(episode.edd) - Date.parse(episode.lmp)) / 86400000 - 280) : 0;
  return { weeks: Math.floor(days / 7), days: days % 7, totalDays: days, method: useEdd ? `Recorded EDD (${episode.eddSource}) minus 280-day reference` : "Recorded LMP", warning: difference ? "Recorded EDD differs from LMP + 280 days. Both dates are preserved; ask the provider to review." : undefined };
}
export function trimester(episode: PregnancyEpisode, date: string): number | null {
  const dating = gestationalDating(episode, date.slice(0, 10));
  return dating ? dating.weeks < 14 ? 1 : dating.weeks < 28 ? 2 : 3 : null;
}
export function provenanceLabel(p: Provenance): string {
  if (p.source === "clinician_confirmed") return "Fictional clinician-confirmed example — not a real provider";
  if (p.source === "clinician_entered") return "Fictional clinician-entered example";
  return p.source === "document_extracted" ? "Document-extracted · User-reviewed · Not clinically verified" : "Self-reported · Not clinically verified";
}
export function observationLabel(o: HealthObservation): string {
  return o.source === "document_extracted" ? "Medical report (user-reviewed) · Not clinically verified" : "Self-reported · Not clinically verified";
}
export function observationFindings(observations: HealthObservation[], state: RecordsWorkspace): { id: string; message: string }[] {
  const findings: { id: string; message: string }[] = [];
  for (const o of observations.filter(o => !o.archived)) {
    const add = (message: string) => findings.push({ id: o.id, message: `${o.label}: ${message}` });
    if (!validDestination(state, o.recordType, o.recordId, episodeOf(o))) add("Mother/baby and pregnancy links need review.");
    if (!observationDate(o.observedAt)) add("The observation date is missing or invalid.");
    if (!o.value.trim()) add("A result or note is missing.");
    if (!o.unit && !o.unitUnavailable && /\d/.test(o.value) && (o.category === "vital_signs" || o.category === "laboratory_tests")) add("Unit is missing; check the source. No unit was inferred.");
    if (/^[\d.,+-]+$/.test(o.value) && !/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(o.value)) add("Numeric formatting is ambiguous; check the original.");
    if (o.unit && /weight|ওজন/i.test(o.label) && !["kg", "g", "lb"].includes(o.unit)) add("This weight unit is not supported by the trend view. It is preserved without conversion.");
    if (o.unit && /blood pressure|রক্তচাপ/i.test(o.label) && o.unit !== "mmHg") add("This blood-pressure unit is not supported by the trend view. Check the source.");
    if (o.source === "document_extracted" && (!o.sourceReportId || !o.sourceFieldId || !o.reviewedAt || !o.reviewedBy || o.reviewStatus !== "verified")) add("Source/review metadata is incomplete; this is not clinician confirmation.");
    if (!o.enteredBy || !o.enteredAt) add("Legacy entry: original actor or entry time was not recorded.");
    const peers = observations.filter(x => !x.archived && x.id !== o.id && episodeOf(x) === episodeOf(o) && x.recordId === o.recordId && x.recordType === o.recordType && x.label.toLowerCase().trim() === o.label.toLowerCase().trim() && x.observedAt.slice(0, 10) === o.observedAt.slice(0, 10));
    if (peers.some(x => x.value === o.value && x.unit === o.unit)) add("Possible duplicate on the same date; review both sources.");
    if (peers.some(x => x.value !== o.value || x.unit !== o.unit)) add("Recorded measurements disagree on the same date. Both are retained; seek professional review.");
  }
  return findings;
}
export type BartaContext = { schemaVersion: 1; pregnancyId: string; generatedAt: string; gestationalEstimate: ReturnType<typeof gestationalDating>; observations: Pick<HealthObservation, "id" | "recordType" | "recordId" | "label" | "value" | "unit" | "observedAt" | "source" | "reviewStatus">[] };
export function buildBartaContext(state: RecordsWorkspace, observations: HealthObservation[], pregnancyId: string, selectedIds: string[], now = new Date()): BartaContext {
  const episode = state.episodes.find(e => e.id === pregnancyId);
  if (!episode || !selectedIds.length) throw new Error("Select a pregnancy and the minimum necessary observations.");
  const selected = observations.filter(o => selectedIds.includes(o.id));
  if (selected.length !== new Set(selectedIds).size) throw new Error("A selected observation is unavailable.");
  for (const o of selected) {
    const grant = state.consents.find(c => c.recipient === "barta" && c.recordId === o.recordId && c.recordType === o.recordType && c.allowed && c.observationIds.includes(o.id));
    if (!grant || o.archived || episodeOf(o) !== pregnancyId || !validDestination(state, o.recordType, o.recordId, pregnancyId) || (o.source === "document_extracted" && o.reviewStatus !== "verified")) throw new Error("Explicit per-record and per-observation Barta consent is required.");
  }
  return { schemaVersion: 1, pregnancyId, generatedAt: now.toISOString(), gestationalEstimate: gestationalDating(episode, dhakaToday(now)), observations: selected.map(({ id, recordType, recordId, label, value, unit, observedAt, source, reviewStatus }) => ({ id, recordType, recordId, label, value, unit, observedAt, source, reviewStatus })) };
}

export function structuredRecordedValue(value: string): NonNullable<HealthObservation["structuredResult"]> {
  if (/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(value)) return { type: "numeric", original: value };
  const pressure = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (pressure) return { type: "compound", original: value, components: [{ label: "systolic", original: pressure[1] }, { label: "diastolic", original: pressure[2] }] };
  return { type: /^(positive|negative|reactive|non-reactive|detected|not detected|trace)$/i.test(value) ? "qualitative" : "textual", original: value };
}
