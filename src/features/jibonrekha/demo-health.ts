import { DEFAULT_EPISODE_ID, DEMO_ACTOR, initialWorkspace, validateWorkspace, validDestination, observationDate, structuredRecordedValue } from "./records-model";
import type { RecordsWorkspace, AuditEvent, ObservationRevision } from "./records-model";
﻿import type { AntenatalReportV2 } from "../bujhi/types";
import type { AntenatalSections, DocumentType, StructuredResult, LaboratoryDetails, SourceLocation } from "../bujhi/report-schema";
/** Fictional records only. localStorage is temporary demo storage, not secure medical storage. */
export type RecordType = "mother" | "baby";

export const observationCategories = {
  vital_signs: "Vital signs",
  symptoms: "Symptoms",
  medical_conditions: "Medical conditions",
  general_notes: "General notes",
  laboratory_tests: "Laboratory tests",
  pregnancy_observations: "Pregnancy observations",
} as const;
export const babyObservationCategories = {
  fetal_movement: "Fetal movement observation",
  clinician_documented_assessment: "Clinician-documented fetal assessment",
  ultrasound_report_notes: "Ultrasound or report notes",
  general_observations: "General observations",
  growth: "Growth measurements", feeding: "Feeding notes", milestones: "Developmental milestones", newborn: "Newborn observations",
} as const;
export const allObservationCategories = { ...observationCategories, ...babyObservationCategories };
export type ObservationCategory = keyof typeof allObservationCategories;

export type HealthObservation = {
  pregnancyId?: string; enteredAt?: string; enteredBy?: string; updatedAt?: string; revision?: number; archived?: boolean; versions?: ObservationRevision[];
  reportSchemaVersion?: 2;
  documentType?: DocumentType;
  reportContext?: AntenatalSections;
  reportContextReviewedAt?: string;
  structuredResult?: StructuredResult;
  laboratory?: LaboratoryDetails;
  sourceLocation?: SourceLocation;
  sourceDocument?: string;
  category?: ObservationCategory;
  id: string;
  recordType: RecordType;
  recordId: string;
  label: string;
  value: string;
  unit: string;
  observedAt: string;
  source: "self_reported" | "document_extracted";
  sourceReportId?: string;
  sourceFieldId?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewStatus?: "verified";
  inputMethod?: "manual" | "image" | "voice";
  unitUnavailable?: boolean;
  rawValue?: string;
  normalizedValue?: string;
  referenceRange?: string;
  reportDate?: string;
  notes?: string;
  sourceText?: string;
  sourceFileId?: string;
  ocrConfidence?: number;
  parsingReliability?: "recognized" | "uncertain" | "unrecognized";
  correctionHistory?: { property: string; before: string; after: string; at: string }[];
};

export const demoUser = {
  id: "demo-user-001",
  name: "Ayesha Rahman",
} as const;

export const demoMother = {
  id: "demo-mother-001",
  userId: demoUser.id,
  name: demoUser.name,
  pregnancyWeek: 24,
  estimatedDueDate: "2027-03-08",
} as const;

export const demoBaby = {
  id: "demo-baby-001",
  motherId: demoMother.id,
  label: "Baby's Health — শিশুর স্বাস্থ্য",
} as const;

const STORAGE_KEY = "prohor-demo-health-v1";

function isHealthObservation(value: unknown): value is HealthObservation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const observation = value as Record<string, unknown>;
  return (
    typeof observation.id === "string" &&
    (observation.recordType === "mother" || observation.recordType === "baby") &&
    typeof observation.recordId === "string" &&
    typeof observation.label === "string" &&
    typeof observation.value === "string" &&
    typeof observation.unit === "string" &&
    typeof observation.observedAt === "string" &&
    (observation.source === "self_reported" || (
      observation.source === "document_extracted" &&
      typeof observation.sourceReportId === "string" && observation.sourceReportId.length > 0 &&
      typeof observation.sourceFieldId === "string" && observation.sourceFieldId.length > 0 &&
      typeof observation.reviewedAt === "string" && Number.isFinite(Date.parse(observation.reviewedAt)) &&
      typeof observation.reviewedBy === "string" && observation.reviewStatus === "verified" &&
      typeof observation.value === "string" && observation.value.trim().length > 0 &&
      typeof observation.observedAt === "string" && Number.isFinite(Date.parse(observation.observedAt)) &&
      typeof observation.recordId === "string"
    )) && (observation.category === undefined || (typeof observation.category === "string" && Object.hasOwn(allObservationCategories, observation.category)))
  );
}

export function getDemoObservations(): HealthObservation[] {
  if (typeof window === "undefined") return [];

  // Replace this storage read with a validated database/API response later.
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isHealthObservation)) return [];

    return parsed;
  } catch {
    return [];
  }
}

/** One storage write for the complete batch; report/field identity makes retries idempotent. */
export function saveDemoObservations(observations: HealthObservation[]): HealthObservation[] {
  if (typeof window === "undefined") throw new Error("Demo observations can only be saved in the browser.");
  if (!observations.every(isHealthObservation)) throw new Error("Invalid demo health observation.");
  for (const observation of observations) {
    const workspace = getDemoWorkspace();
    if (!validDestination(workspace, observation.recordType, observation.recordId, observation.pregnancyId ?? DEFAULT_EPISODE_ID) || !observation.label.trim() || !observation.value.trim() || !observationDate(observation.observedAt)) throw new Error("Invalid observation destination, value, or date.");
    if (observation.reportDate && !observationDate(observation.reportDate)) throw new Error("Invalid report date.");
    if (observation.inputMethod && (observation.reviewStatus !== "verified" || !observation.reviewedBy?.trim() || !observation.reviewedAt || !Number.isFinite(Date.parse(observation.reviewedAt)))) throw new Error("Input-method drafts require explicit user review before saving.");
  }
  // Fail closed on unreadable storage so a save cannot silently erase existing records.
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isHealthObservation)) throw new Error("Existing demo records could not be read.");
  const updated: HealthObservation[] = [...parsed];
  for (const observation of observations) {
    const duplicate = updated.some((existing) => existing.id === observation.id || (
      Boolean(observation.sourceReportId && observation.sourceFieldId) &&
      existing.sourceReportId === observation.sourceReportId && existing.sourceFieldId === observation.sourceFieldId
    ));
    if (!duplicate) updated.push({ ...observation, structuredResult: observation.structuredResult ?? structuredRecordedValue(observation.value), pregnancyId: observation.pregnancyId ?? DEFAULT_EPISODE_ID, enteredAt: observation.enteredAt ?? new Date().toISOString(), enteredBy: observation.enteredBy ?? DEMO_ACTOR, revision: observation.revision ?? 1 });
  }
  if (updated.length !== parsed.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function saveDemoObservation(observation: HealthObservation): HealthObservation[] {
  return saveDemoObservations([observation]);
}



/** Separate draft collection in the same adapter; never mixed with verified observations or media. */
const DRAFT_STORAGE_KEY = "prohor-demo-bujhi-drafts-v2";
function isReportDraft(value: unknown): value is AntenatalReportV2 {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return item.schemaVersion === 2 && typeof item.id === "string" && typeof item.name === "string" &&
    ["anc", "laboratory", "ultrasound", "clinical_note", "vital_sign", "observation"].includes(String(item.documentType)) &&
    (item.source === "self_reported" || item.source === "document_extracted") && typeof item.observedAt === "string" &&
    typeof item.sections === "object" && item.sections !== null && !Array.isArray(item.sections) &&
    Array.isArray(item.fields) && item.fields.every((field: unknown) => {
      if (typeof field !== "object" || field === null) return false;
      const entry = field as Record<string, unknown>;
      return typeof entry.id === "string" && typeof entry.label === "string" && typeof entry.value === "string" && typeof entry.unit === "string" &&
        ["mother", "baby", ""].includes(String(entry.destination)) && ["pending", "verified", "rejected"].includes(String(entry.reviewStatus));
    });
}
export function getDemoReportDrafts(): AntenatalReportV2[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  const parsed: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isReportDraft)) throw new Error("Report drafts could not be read. Existing data was not changed.");
  return parsed;
}
export function saveDemoReportDraft(report: AntenatalReportV2): void {
  if (typeof window === "undefined" || !isReportDraft(report)) throw new Error("Invalid demo report draft.");
  const drafts = getDemoReportDrafts();
  // Media, blob URLs and recordings are not part of the serialized report contract.
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify([...drafts.filter((draft) => draft.id !== report.id), report]));
}

/** V2 domain metadata shares this adapter. Observations retain their original storage key. */
const WORKSPACE_KEY = "prohor-demo-records-v2";
export function getDemoWorkspace(): RecordsWorkspace {
  if (typeof window === "undefined") return initialWorkspace();
  const raw = window.localStorage.getItem(WORKSPACE_KEY);
  return raw === null ? initialWorkspace() : validateWorkspace(JSON.parse(raw));
}
export function getDemoObservationsStrict(): HealthObservation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isHealthObservation)) throw new Error("Existing observations could not be read. No data was changed.");
  return parsed;
}
export function saveDemoWorkspace(next: RecordsWorkspace, targetId: string, action: AuditEvent["action"], reason = ""): RecordsWorkspace {
  return commitDemoWorkspace(next, targetId, action, reason);
}
function commitDemoWorkspace(next: RecordsWorkspace, targetId: string, action: AuditEvent["action"], reason: string, allowFictionalExample = false): RecordsWorkspace {
  const current = getDemoWorkspace();
  if (current.revision !== next.revision) throw new Error("Records changed in another view. Reload before saving; your inputs are still here.");
  if (next.profile.id !== current.profile.id || next.profile.userId !== current.profile.userId) throw new Error("Mother identity cannot be changed in the demo adapter.");
  for (const episode of current.episodes) {
    if (!next.episodes.some(e => e.id === episode.id && e.motherId === episode.motherId)) throw new Error("Existing pregnancy links must be preserved.");
  }
  for (const baby of current.babies) {
    if (!next.babies.some(b => b.id === baby.id && b.motherId === baby.motherId && b.pregnancyId === baby.pregnancyId)) throw new Error("Existing baby/pregnancy links must be preserved.");
  }
  for (const entry of current.entries) {
    const updated = next.entries.find(e => e.id === entry.id);
    if (updated && (updated.recordId !== entry.recordId || updated.recordType !== entry.recordType || updated.pregnancyId !== entry.pregnancyId)) throw new Error("Do not move existing clinical history between records. Preserve it and add a new entry.");
    if (!next.entries.some(e => e.id === entry.id)) throw new Error("Archive clinical history instead of deleting it.");
    if (entry.provenance.source.startsWith("clinician_") && JSON.stringify(next.entries.find(e => e.id === entry.id)) !== JSON.stringify(entry)) throw new Error("Provider examples are read-only. Add a separate self-reported entry for a discrepancy.");
  }
  for (const entry of next.entries) {
    if (!allowFictionalExample && entry.provenance.source.startsWith("clinician_") && !current.entries.some(e => e.id === entry.id)) throw new Error("Provider records require a trusted integration. The demo interface cannot assert provider confirmation.");
  }
  const snapshot = (workspace: RecordsWorkspace) => workspace.profile.id === targetId ? workspace.profile : [...workspace.episodes, ...workspace.babies, ...workspace.entries, ...workspace.appointments, ...workspace.consents].find(item => item.id === targetId) ?? null;
  const before = JSON.stringify(snapshot(current));
  const after = JSON.stringify(snapshot(next));
  const event: AuditEvent = { id: crypto.randomUUID(), targetId, action, actor: DEMO_ACTOR, at: new Date().toISOString(), reason, before, after };
  const saved = validateWorkspace({ ...next, revision: current.revision + 1, audit: [...current.audit, event] });
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(saved));
  return saved;
}
export function reviseDemoObservation(id: string, patch: Partial<Pick<HealthObservation, "label" | "value" | "unit" | "observedAt" | "archived">>, expectedRevision: number, reason: string): HealthObservation[] {
  const observations = getDemoObservationsStrict();
  const current = observations.find(o => o.id === id);
  if (!current || current.source !== "self_reported" || (current.enteredBy && current.enteredBy !== DEMO_ACTOR)) throw new Error("Only your own self-reported entries can be corrected. Preserve document/provider records and add a separate entry.");
  if (!validDestination(getDemoWorkspace(), current.recordType, current.recordId, current.pregnancyId ?? DEFAULT_EPISODE_ID)) throw new Error("The record relationship needs review before correction.");
  if ((current.revision ?? 1) !== expectedRevision) throw new Error("This observation changed. Reload before correcting it.");
  const at = new Date().toISOString();
  const updated = { ...current, ...patch, rawValue: current.rawValue ?? current.value, normalizedValue: undefined, structuredResult: structuredRecordedValue(patch.value ?? current.value), reviewedAt: current.inputMethod ? at : current.reviewedAt, reviewedBy: current.inputMethod ? DEMO_ACTOR : current.reviewedBy, updatedAt: at, revision: expectedRevision + 1 };
  if (!updated.label.trim() || !updated.value.trim() || !observationDate(updated.observedAt)) throw new Error("Enter a name, a result or note, and a valid date.");
  const snapshot = (o: HealthObservation) => ({ label: o.label, value: o.value, unit: o.unit, observedAt: o.observedAt, archived: Boolean(o.archived) });
  const version: ObservationRevision = { at, actor: DEMO_ACTOR, reason, action: patch.archived === undefined ? "correct" : patch.archived ? "archive" : "restore", before: snapshot(current), after: snapshot(updated) };
  updated.versions = [...(current.versions ?? []), version];
  const result = observations.map(o => o.id === id ? updated : o);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); // Revision and value commit atomically.
  return result;
}

/** Explicit opt-in training fixture; never asserts a real provider or diagnosis. */
export function addFictionalProviderExample(pregnancyId: string, recordType: RecordType, recordId: string): RecordsWorkspace {
  const state = getDemoWorkspace(), id = crypto.randomUUID(), at = new Date().toISOString();
  const example: RecordsWorkspace["entries"][number] = { id, pregnancyId, recordType, recordId, kind: "event", name: "Fictional provider-confirmed training example", date: at.slice(0,10), endDate: "", status: "unknown", dose: "", frequency: "", doseNumber: "", notes: "Synthetic example only. No real provider reviewed this record. It contains no diagnosis or measurement.", archived: false, provenance: { source: "clinician_confirmed", enteredBy: "fictional-provider-demo", enteredAt: at, reviewStatus: "clinician_confirmed", sourceDocument: "Fictional training fixture, not a medical report", confirmedBy: "Fictional provider ? training example only", confirmedAt: at, fictionalProvider: true } };
  return commitDemoWorkspace({ ...state, entries: [...state.entries, example] }, id, "create", "User explicitly loaded a fictional provider example", true);
}
