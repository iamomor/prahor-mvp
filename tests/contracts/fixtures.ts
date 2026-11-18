/** Synthetic structural test data only. No clinical recommendation or approved medical source. */
export const ids = {
  motherA: "10000000-0000-4000-8000-000000000001",
  motherB: "10000000-0000-4000-8000-000000000002",
  provider: "10000000-0000-4000-8000-000000000003",
  pregnancy: "20000000-0000-4000-8000-000000000001",
  baby: "20000000-0000-4000-8000-000000000002",
  document: "30000000-0000-4000-8000-000000000001",
  field: "30000000-0000-4000-8000-000000000002",
  extraction: "30000000-0000-4000-8000-000000000003",
  review: "30000000-0000-4000-8000-000000000004",
  request: "40000000-0000-4000-8000-000000000001",
  event: "40000000-0000-4000-8000-000000000002",
  receipt: "40000000-0000-4000-8000-000000000003",
  source: "50000000-0000-4000-8000-000000000001",
  chunk: "50000000-0000-4000-8000-000000000002",
} as const;
export const at = "2026-11-16T09:00:00+06:00";
export const later = "2026-11-17T09:00:00+06:00";
export const maternalNote = {
  destination: { subject: "mother", pregnancyId: ids.pregnancy },
  measurement: { kind: "note", value: "Synthetic record used only for contract tests.", unit: null },
  observedAt: at, sourceNote: null,
} as const;
export const review = {
  expectedExtractionRevision: 1,
  destination: { subject: "mother", pregnancyId: ids.pregnancy },
  decisions: [{
    extractedFieldId: ids.field, decision: "corrected",
    measurement: { kind: "hemoglobin", value: "10.00", unit: "g/dL" }, observedAt: at,
  }],
  reviewedByMother: true,
} as const;
