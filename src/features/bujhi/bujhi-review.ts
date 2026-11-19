// Pure review logic for Bujhi. Shapes follow src/lib/contracts/bujhi.ts (extractedField, reviewExtractionRequest).
export type Uncertainty = "illegible" | "unknown_unit" | "ambiguous_label" | "missing_date" | "engine_uncertain";
export type Measurement = { kind: string; value: string; unit: string | null };
export type Field = { id: string; rawLabel: string; rawValue: string; rawUnit: string | null; parsedMeasurement: Measurement | null; confidence: number | null; uncertainty: Uncertainty[] };
export type Decision = { extractedFieldId: string; decision: "accepted" | "corrected"; measurement: Measurement; observedAt: string } | { extractedFieldId: string; decision: "rejected" };

export const CLEAR_AT = 0.9; // placeholder threshold, to be tuned on real fixtures; never shown as a percentage.
export type Band = "clear" | "low" | "check" | "unknown";
export function band(f: Field): Band {
  if (f.uncertainty.length) return "check";
  if (f.confidence === null) return "unknown";
  return f.confidence >= CLEAR_AT ? "clear" : "low";
}
// Check the least certain lines first; stable within a band.
const RANK: Record<Band, number> = { check: 0, low: 1, unknown: 2, clear: 3 };
export const reviewOrder = (fs: Field[]) => fs.map((f, i) => ({ f, i })).sort((a, b) => RANK[band(a.f)] - RANK[band(b.f)] || a.i - b.i).map((x) => x.f);

// "Looks right" is not allowed when the reading is incomplete: no measurement, or a unit we do not know.
export const canAccept = (f: Field) => !!f.parsedMeasurement?.value.trim() && !!f.parsedMeasurement.unit?.trim() && !f.uncertainty.includes("unknown_unit") && !f.uncertainty.includes("illegible");

export type Draft = { fields: Field[]; decisions: Record<string, { kind: "accept" | "correct" | "reject"; measurement?: Measurement }>; observedAt: string; destination: { subject: "mother"; pregnancyId: string | null } | { subject: "baby"; babyId: string }; expectedExtractionRevision: number };
export type Built = { ok: true; request: object } | { ok: false; reason: "undecided" | "bad_correction" | "need_date" | "cannot_accept" | "nothing_to_save" };
const dateOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
export function buildReview(d: Draft): Built {
  const out: Decision[] = [];
  for (const f of d.fields) {
    const x = d.decisions[f.id];
    if (!x) return { ok: false, reason: "undecided" };
    if (x.kind === "reject") { out.push({ extractedFieldId: f.id, decision: "rejected" }); continue; }
    if (x.kind === "accept") {
      if (!canAccept(f)) return { ok: false, reason: "cannot_accept" };
      if (!dateOk(d.observedAt)) return { ok: false, reason: "need_date" };
      out.push({ extractedFieldId: f.id, decision: "accepted", measurement: f.parsedMeasurement!, observedAt: d.observedAt }); continue;
    }
    const m = x.measurement;
    if (!m || !/^-?\d{1,9}(\.\d{1,6})?$/.test(m.value) || (m.kind !== "note" && !m.unit)) return { ok: false, reason: "bad_correction" };
    if (!dateOk(d.observedAt)) return { ok: false, reason: "need_date" };
    out.push({ extractedFieldId: f.id, decision: "corrected", measurement: m, observedAt: d.observedAt });
  }
  if (!out.length) return { ok: false, reason: "undecided" };
  if (out.every((o) => o.decision === "rejected")) return { ok: false, reason: "nothing_to_save" };
  return { ok: true, request: { expectedExtractionRevision: d.expectedExtractionRevision, destination: d.destination, decisions: out, reviewedByMother: true } };
}
