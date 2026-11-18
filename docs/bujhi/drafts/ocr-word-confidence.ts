// DRAFT (not compiled). Idea for ocr-service.ts: tesseract.js returns per-word confidence in data.words.
// Evidence (Tesseract CLI 5.3.4, our ambiguous fixture): the misread "11.0" had word confidence 72.6 vs 94.5 for a clean "11.4",
// but global confidence + parser still said "recognized". Re-measure with the app's WASM engine before trusting the number.
export const VALUE_WORD_MIN_CONFIDENCE = 85;           // team to tune on the 4 fixtures + a few real-photo style tests
export function valueTokenConfidence(words: { text: string; confidence: number }[], value: string): number | null {
  const hit = words.find(w => w.text.replace(/[^0-9.]/g, "") === value);
  return hit ? hit.confidence : null;
}
// in the parser result handling:
//   const c = valueTokenConfidence(data.words, field.value);
//   if (c === null || c < VALUE_WORD_MIN_CONFIDENCE) { field.reliability = "uncertain"; }   // mother must check this digit
