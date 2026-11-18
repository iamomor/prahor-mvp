import type { AntenatalSections, DocumentType, ReportSection } from "./report-schema";
import { readDatum, sectionFields } from "./report-schema";
import type { AntenatalReportV2 } from "./types";
import { validDate } from "./validation";
export type ReportFinding = { section?: ReportSection; status: "needs_information" | "needs_correction" | "cannot_determine"; message: string };
export function reportFindings(report: AntenatalReportV2): ReportFinding[] {
  const issues: ReportFinding[] = [];
  if (!report.documentType) issues.push({ status: "needs_information", message: "রিপোর্টের ধরন বেছে নিন · Identify the report type." });
  if (!report.id || !["self_reported", "document_extracted"].includes(report.source)) issues.push({ status: "needs_correction", message: "উৎসের তথ্য নেই · Missing report identity or provenance." });
  const applicable: Record<DocumentType, ReportSection[]> = { anc: ["patient", "dating", "history", "vitals", "laboratory", "ultrasound", "supplements", "risk", "carePlan", "provider"], laboratory: ["patient", "laboratory"], ultrasound: ["patient", "ultrasound"], clinical_note: ["patient", "carePlan"], vital_sign: ["vitals"], observation: [] };
  for (const section of applicable[report.documentType]) {
    const data = report.sections[section];
    const hasContext = sectionFields[section].some((field) => Boolean(readDatum(report.sections, section, field.key)?.value));
    const hasObservation = report.fields.some((field) => field.section === section);
    if (!hasContext && !hasObservation && report.documentType === "anc") issues.push({ section, status: "needs_information", message: "এই অংশে তথ্য নেই · Not provided. It is optional; do not invent missing information." });
    if (!data) continue;
    for (const descriptor of sectionFields[section]) {
      const item = readDatum(report.sections, section, descriptor.key);
      if (item?.presence === "conflicting") issues.push({ section, status: "needs_correction", message: `${descriptor.label}: conflicting information; check the source.` });
      if (item?.presence === "unreadable") issues.push({ section, status: "cannot_determine", message: `${descriptor.label}: unreadable; do not guess.` });
      if (item?.value && "date" in descriptor && descriptor.date && !validDate(item.value)) issues.push({ section, status: "cannot_determine", message: `${descriptor.label}: date could not be interpreted.` });
    }
  }
  const dating = report.sections.dating, lmp = dating?.lmp?.value, edd = dating?.edd?.value;
  if (lmp && edd && validDate(lmp) && validDate(edd) && edd <= lmp) issues.push({ section: "dating", status: "needs_correction", message: "EDD is not after LMP. Check both source dates; no date was overwritten." });
  if (dating?.calculation && edd && edd !== dating.calculation.estimatedEdd) issues.push({ section: "dating", status: "cannot_determine", message: "The documented EDD differs from the LMP + 280-day estimate. Preserve both and ask the care provider; the estimate does not replace documented dating." });
  if (report.fields.length && report.fields.some((field) => !validDate(field.observedAt ?? report.observedAt))) issues.push({ status: "needs_information", message: "পরীক্ষার ফল আছে, কিন্তু পর্যবেক্ষণের তারিখ নেই বা বোঝা যায়নি · Results are present, but the observation date is missing or unclear." });
  if (report.fields.some((field) => field.parsingReliability === "uncertain" && !field.value)) issues.push({ status: "cannot_determine", message: "OCR ফল আর রেফারেন্স সীমা আলাদা করতে পারেনি · OCR could not distinguish a patient result from a printed reference interval. Check the original image." });
  return issues;
}
export function markContextReviewed(sections: AntenatalSections, reviewedAt: string): AntenatalSections {
  const result: AntenatalSections = { ...sections };
  for (const section of Object.keys(sectionFields) as ReportSection[]) {
    for (const descriptor of sectionFields[section]) {
      const item = readDatum(result, section, descriptor.key);
      if (item) (result[section] as Record<string, unknown>)[descriptor.key] = { ...item, reviewStatus: "verified", reviewedAt };
    }
  }
  return result;
}
