import type { ExtractedReportField } from "./types";
/** Explicit patterns only; never interpret a number as a diagnosis. */
export function parseSpeechDraft(transcript: string): Partial<ExtractedReportField> {
  const digits = transcript.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6));
  const bp = digits.match(/(?:blood pressure|প্রেসার|রক্তচাপ)[^\d]*(\d{2,3})\s*(?:over|by|\/|বাই)\s*(\d{2,3})/i);
  const today = /\btoday\b|আজ(?:কের)?/.test(transcript.toLowerCase());
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return { label: bp ? "Blood pressure" : "", value: bp ? `${bp[1]}/${bp[2]}` : transcript, rawValue: transcript,
    unit: "", observedAt: today ? date : "", destination: "", category: bp ? "vital_signs" : "general_notes", sourceText: transcript };
}

/** Split explicit clauses while preserving decimal punctuation and uncertain wording. */
export function parseSpokenFields(transcript: string): Partial<ExtractedReportField>[] {
  const clauses = transcript.trim().split(/\s*(?:[;\n।]+|[.!?](?=\s+[A-Za-z\u0980-\u09FF]))\s*|\s+(?:and|এবং)\s+(?=(?:my\s+)?(?:blood pressure|রক্তচাপ|প্রেসার|BPD|FL|AC|CRL|HC|EFW|AFI|FHR)\b)/i).filter(Boolean);
  return clauses.map((clause) => {
    const scan = clause.match(/^(BPD|FL|AC|CRL|HC|EFW|AFI|FHR)\s*(?:is|[:=])?\s*([+−-]?[0-9০-৯][0-9০-৯,.]*)\s*(mm|cm|g|kg|bpm)?\s*[.!]?$/i);
    if (!scan) return parseSpeechDraft(clause);
    const label = scan[1].toUpperCase();
    return { label, value: scan[2], rawValue: scan[2], unit: scan[3] ?? "", destination: "", category: "ultrasound_report_notes", sourceText: clause, ultrasound: { group: label === "FHR" ? "heartbeat" : label === "AFI" ? "placenta" : "biometry", originalLabel: scan[1], originalUnit: scan[3] ?? "" } };
  });
}
