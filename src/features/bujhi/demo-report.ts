import type { ExtractedReport } from "./types";

/** Fixed fictional example of the workflow. It never represents OCR output. */
export const demoReport: ExtractedReport = {
  id: "sample-bujhi-hemoglobin",
  name: "নমুনা রিপোর্ট · Sample report",
  status: "needs_review",
  source: "self_reported",
  inputMethod: "manual",
  documentType: "laboratory",
  observedAt: "2026-11-14",
  fields: [{
    id: "hemoglobin", label: "Hemoglobin", value: "10.2", rawValue: "10.2", unit: "g/dL",
    destination: "mother", reviewStatus: "pending", category: "laboratory_tests", observedAt: "2026-11-14",
    referenceRange: "11.0–14.0 g/dL", sourceText: "Fictional sample · Hemoglobin 10.2 g/dL · Printed interval: 11.0–14.0 g/dL",
  }],
};
