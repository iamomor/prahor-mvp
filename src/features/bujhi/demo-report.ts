import type { ExtractedReport } from "./types";

/** Synthetic fixture, not an AI call or an actual patient's report. */
export const demoReport: ExtractedReport = {
  id: "demo-report-001",
  name: "Fictional Maternal Health Report",
  status: "needs_review",
  source: "document_extracted",
  observedAt: "2026-11-16T06:00:00.000Z",
  fields: [
    { id: "hemoglobin", label: "Hemoglobin", value: "11.2", unit: "g/dL", destination: "mother", reviewStatus: "pending" },
    { id: "fetal-heart-rate", label: "Fetal Heart Rate", value: "145", unit: "bpm", destination: "baby", reviewStatus: "pending" },
  ],
};
