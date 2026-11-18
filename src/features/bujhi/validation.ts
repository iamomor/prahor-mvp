import type { ExtractedReportField } from "./types";

/** String-only normalization: no floating-point conversion, rounding, or unit conversion. */
export function parseNumeric(raw: string): { kind: "number" | "text" | "ambiguous"; normalized?: string; reason?: string } {
  const candidate = raw.trim().replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6)).replace(/−/g, "-");
  if (!candidate) return { kind: "ambiguous", reason: "A value or note is required." };
  if (/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(candidate)) return { kind: "number", normalized: candidate.replaceAll(",", "") };
  if (/^[+-]?[\d.,]+$/.test(candidate)) return { kind: "ambiguous", reason: "The numeric separators are ambiguous or invalid. Check the original value; do not guess a decimal or thousands separator." };
  if (/\d[OoIl]|[OoIl]\d/.test(candidate)) return { kind: "ambiguous", reason: "Letters resembling digits were found beside a number. Correct the value from the source." };
  return { kind: "text" };
}
export function validDate(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && validDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}
export function fieldIssues(field: ExtractedReportField, defaultDate: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  if (!field.label.trim()) errors.push("Enter a test or observation name.");
  if (!field.value.trim()) errors.push("Enter a result or a note; it does not need to be numeric.");
  if (!["mother", "baby"].includes(field.destination)) errors.push("Choose Mother or Baby.");
  if (!validDate(field.observedAt ?? defaultDate)) errors.push("Enter a valid observation date from the source or your own record.");
  if (field.reportDate && !validDate(field.reportDate)) errors.push("Correct the report date.");
  const numeric = parseNumeric(field.value);
  if (field.value.trim() && numeric.kind === "ambiguous") errors.push(numeric.reason!);
  if ((numeric.kind === "number" || /^\d+\s*\/\s*\d+$/.test(field.value.trim())) && !field.unit.trim() && !field.unitUnavailable) errors.push("Supply the measurement unit, or explicitly mark the unit as unavailable/not applicable.");
  if (field.reportDate && validDate(field.reportDate) && validDate(field.observedAt ?? defaultDate) && field.reportDate < (field.observedAt ?? defaultDate).slice(0, 10)) warnings.push("The report date precedes the observation date. Check both dates against the source.");
  if (field.parsingReliability && field.parsingReliability !== "recognized") warnings.push("Parsing is uncertain or the test name was not recognized. Check every field against the original source.");
  if (field.ocrConfidence !== undefined && field.ocrConfidence < 80) warnings.push("OCR confidence is below 80. This is a text-recognition flag, not a clinical assessment.");
  if (field.category === "laboratory_tests" && !/(?:hcg|hemoglobin|haemoglobin|glucose|platelet|fetal heart rate|blood pressure)/i.test(field.label)) warnings.push("This test name is not recognized by the local allow-list. Preserve the original spelling and check the report; no clinical interpretation is available.");
  if (!field.sourceText && field.parsingReliability) warnings.push("No original source snippet is available for this field.");
  return { errors, warnings };
}



