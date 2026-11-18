// Provisional threshold from the synthetic CLI comparison in the Bujhi playbook.
export const VALUE_WORD_MIN_CONFIDENCE = 85;

type OcrWord = { text: string; confidence: number };
type OcrLine = { text: string; words: OcrWord[] };

export function valueTokenConfidence(lines: OcrLine[], snippet: string, value: string): number | null {
  const source = snippet.trim().split(/\r?\n/).at(-1)?.trim();
  const matches = lines.filter((line) => line.text.trim() === source);
  if (!value || matches.length !== 1) return null;
  const words = matches[0].words.filter((word) => word.text.replace(/^[|:=]+|[|:=]+$/g, "") === value);
  return words.length === 1 && Number.isFinite(words[0].confidence) ? words[0].confidence : null;
}
