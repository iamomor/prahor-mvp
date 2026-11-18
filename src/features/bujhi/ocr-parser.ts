import type { ExtractedReport, ExtractedReportField } from "./types";
import { validDate } from "./validation";
const knownTest = /(beta[\s-]*hcg|b[\s-]*hcg|β[\s-]*hcg|hemoglobin|haemoglobin|fetal heart rate|blood glucose|glucose|platelet(?:s)?|blood pressure)/iu;

/** Conservative allow-list parser. Unknown lines (including patient metadata) are never observations. */
export function parseOcrText(rawText: string, reportId: string, confidence?: number): ExtractedReport {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fields: ExtractedReportField[] = [], used = new Set<number>();
  const dateMatch = rawText.match(/report\s*date\s*[:|]?\s*(\d{4}-\d{2}-\d{2})/i);
  const reportDate = dateMatch && validDate(dateMatch[1]) ? dateMatch[1] : "";
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index], test = line.match(knownTest);
    if (!test) continue;
    let snippet = line, tail = line.slice((test.index ?? 0) + test[0].length);
    if (!/\d/.test(tail) && index + 1 < lines.length && /^[-−]?\d/.test(lines[index + 1])) { tail += ` ${lines[index + 1]}`; snippet += `\n${lines[index + 1]}`; used.add(index + 1); }
    const measurement = tail.match(/^\s*[:|=]?\s*([-−]?\d[\d,.]*(?:\s*\/\s*\d+)?)\s*(mIU\s*\/\s*mL|IU\s*\/\s*L|mIU\s*\/\s*L|g\s*\/\s*dL|mg\s*\/\s*dL|mmol\s*\/\s*L|mmHg|bpm|[μµu]IU\s*\/\s*mL)?(.*)$/i);
    // A range without an established result is not a patient measurement.
    const rangeOnly = /^\s*[:|=]?\s*(?:reference|ref\b|range|[<>??])/i.test(tail) ||
      Boolean(measurement && /^\s*(?:[-??]\s*\d|to\s+\d)/i.test(measurement[3]));
    const value = rangeOnly ? "" : measurement?.[1] ?? "", unit = rangeOnly ? "" : measurement?.[2] ?? "";
    fields.push({ id: `field-${index}`, label: test[0], value, rawValue: value, unit,
      destination: /fetal/i.test(test[0]) ? "baby" : "", category: "laboratory_tests", observedAt: "", reportDate,
      referenceRange: rangeOnly ? tail.trim() : measurement?.[3]?.replace(/^\s*[|:]\s*/, "").trim() ?? "", sourceText: snippet,
      reviewStatus: "pending", parsingReliability: value && unit ? "recognized" : "uncertain", ocrConfidence: confidence,
    }); used.add(index);
  }
  return { id: reportId, name: "Local OCR draft — check against the image", source: "document_extracted", inputMethod: "image", status: "needs_review", observedAt: "", rawText, ocrConfidence: confidence, fields, unrecognizedText: lines.filter((_, index) => !used.has(index)) };
}
