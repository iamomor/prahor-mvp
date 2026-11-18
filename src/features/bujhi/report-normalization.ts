import type { AntenatalReportV2, ExtractedReport, ExtractedReportField } from "./types";
import type { AntenatalSections, DocumentType, ReportSection, StructuredResult } from "./report-schema";
import { parseNumeric, validDate } from "./validation";

export function inferDocumentType(report: ExtractedReport): DocumentType {
  if (report.documentType) return report.documentType;
  if (report.fields.some((field) => field.category === "ultrasound_report_notes")) return "ultrasound";
  if (report.fields.some((field) => field.category === "laboratory_tests")) return "laboratory";
  if (report.fields.some((field) => field.category === "vital_signs")) return "vital_sign";
  return "observation";
}
export function resultStructure(field: ExtractedReportField): StructuredResult {
  const numeric = parseNumeric(field.value);
  if (numeric.kind === "number") return { type: "numeric", original: field.value, normalizedCandidate: field.normalizedValue };
  if (field.structuredResult?.original === field.value && field.structuredResult.type !== "numeric") return field.structuredResult;
  const pressure = (field.observationCode === "blood_pressure" || /blood pressure|রক্তচাপ|প্রেসার/i.test(field.label)) && field.value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (pressure) return { type: "compound", original: field.value, components: [{ label: "systolic", original: pressure[1] }, { label: "diastolic", original: pressure[2] }] };
  return { type: /^(?:positive|negative|reactive|non[- ]?reactive|detected|not detected|trace|[ABO]+[+-]|[<>≤≥]\s*\d)/i.test(field.value) ? "qualitative" : "textual", original: field.value };
}
export function normalizeReport(report: ExtractedReport): AntenatalReportV2 {
  const sections: AntenatalSections = { ...report.sections };
  const observationSections = { vitals: [] as string[], laboratory: [] as string[], ultrasound: [] as string[] };
  const fields = report.fields.map((field) => {
    const section: ReportSection = field.section ?? (field.category === "laboratory_tests" ? "laboratory" : field.category === "ultrasound_report_notes" ? "ultrasound" : "vitals");
    if (section === "vitals" || section === "laboratory" || section === "ultrasound") observationSections[section].push(field.id);
    return { ...field, section, structuredResult: resultStructure(field), laboratory: section === "laboratory" ? { originalTestLabel: field.label, ...field.laboratory } : field.laboratory };
  });
  for (const section of ["vitals", "laboratory", "ultrasound"] as const) {
    const fieldIds = observationSections[section];
    if (fieldIds.length || sections[section]) sections[section] = { ...sections[section], fieldIds };
  }
  return { ...report, schemaVersion: 2, documentType: inferDocumentType(report), fields, sections, clinicianVerification: { status: "unverified", documentedClaimOnly: Boolean(sections.provider?.name?.value || sections.provider?.signatureOrStamp?.value) } };
}
/** Estimate only; never overwrites an explicitly documented EDD. No other clinical calculations are performed. */
export function estimateEdd(lmp: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lmp) || !validDate(lmp)) return null;
  const date = new Date(`${lmp}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 280); return date.toISOString().slice(0, 10);
}
