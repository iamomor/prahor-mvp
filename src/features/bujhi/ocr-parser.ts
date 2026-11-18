import { classifyDocument, scanCandidates, type OcrLine } from "./ultrasound";
import { normalizeReport } from "./report-normalization";
﻿import type { ExtractedReport, ExtractedReportField } from "./types";
import { validDate } from "./validation";
const knownTest = /(beta[\s-]*hcg|b[\s-]*hcg|β[\s-]*hcg|hemoglobin|haemoglobin|hgb|hb|fetal heart rate|blood glucose|glucose|platelet(?:s)?|blood pressure)/iu;

/** Conservative allow-list parser. Unknown lines (including patient metadata) are never observations. */
export function parseOcrText(rawText: string, reportId: string, confidence?: number, layout?: OcrLine[]): ExtractedReport {
  const entries = layout?.length ? layout : rawText.split(/\r?\n/).map((text, index) => ({ text, location: { line: index + 1 } }));
  const lines = entries.map((line) => line.text.trim());
  const fields: ExtractedReportField[] = [], used = new Set<number>();
  const dateMatch = rawText.match(/report\s*date\s*[:|]?\s*(\d{4}-\d{2}-\d{2})/i);
  const reportDate = dateMatch && validDate(dateMatch[1]) ? dateMatch[1] : "";
  const scanDates = new Set(Array.from(rawText.matchAll(/^[ \t]*(?:scan|examination) date[ \t]*[:|][ \t]*(\d{4}-\d{2}-\d{2})[ \t]*$/gim), (match) => match[1]).filter(validDate));
  const scanDate = scanDates.size === 1 ? [...scanDates][0] : "";
  const isScan = /ultrasound|sonograph|\bUSG\b|anomaly scan|doppler|^\s*(?:BPD|CRL|EFW)\b/im.test(rawText);
  const scans = scanCandidates(entries, scanDate, isScan);
  for (const index of scans.consumed) used.add(index);
  fields.push(...scans.fields.map((field) => ({ ...field, reportDate })));
  for (let index = 0; index < lines.length; index++) {
    if (used.has(index)) continue;
    const line = lines[index], test = line.match(knownTest);
    if (!test || test.index !== 0 || /^\p{L}/u.test(line.slice(test[0].length))) continue;
    const snippet = line, tail = line.slice((test.index ?? 0) + test[0].length);
    const measurement = tail.match(/^\s*[:|=]?\s*([-−]?\d[\d,.]*(?:\s*\/\s*\d+)?)\s*(mIU\s*\/\s*mL|IU\s*\/\s*L|mIU\s*\/\s*L|g\s*\/\s*dL|mg\s*\/\s*dL|mmol\s*\/\s*L|mmHg|bpm|[μµu]IU\s*\/\s*mL)?(.*)$/i);
    // A range without an established result is not a patient measurement.
    const rangeOnly = /^\s*[:|=]?\s*(?:reference|ref\b|range|[<>≤≥])/i.test(tail) ||
      Boolean(measurement && /^\s*(?:[-–—]\s*\d|to\s+\d)/i.test(measurement[3]));
    const suffix = measurement?.[3]?.trim() ?? "";
    const unresolved = rangeOnly || Boolean(suffix && !/^(?:[|:;]\s*|(?:ref(?:erence)?|range)\b|[<>≤≥]|\d[\d.,]*\s*(?:[-–—]|to)\s*\d)/i.test(suffix));
    const value = unresolved ? "" : measurement?.[1] ?? "", unit = unresolved ? "" : measurement?.[2] ?? "";
    fields.push({ id: `field-${index}`, label: test[0], value, rawValue: value, unit,
      destination: "", category: /blood pressure|fetal heart rate/i.test(test[0]) ? "vital_signs" : "laboratory_tests", observedAt: "", reportDate, sourceLocation: entries[index].location ?? { line: index + 1 },
      referenceRange: rangeOnly ? tail.trim() : unresolved ? "" : measurement?.[3]?.replace(/^\s*[|:]\s*/, "").trim() ?? "", sourceText: snippet,
      reviewStatus: "pending", parsingReliability: value && unit ? "recognized" : "uncertain", ocrConfidence: confidence,
    }); used.add(index);
  }
  const classification = classifyDocument(rawText, isScan || scans.fields.length > 0, fields.some((field) => field.category === "laboratory_tests"), fields.some((field) => field.category === "vital_signs"));
  return normalizeReport({ ...classification, id: reportId, name: "স্ক্যান করা রিপোর্ট · Scanned report", source: "document_extracted", inputMethod: "image", status: "needs_review", observedAt: "", scanDate, rawText, ocrConfidence: confidence, fields, unrecognizedText: lines.filter((line, index) => line && !used.has(index)) });
}
