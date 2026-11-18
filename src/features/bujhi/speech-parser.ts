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
