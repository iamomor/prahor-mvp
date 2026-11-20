import { parseOcrText } from "./ocr-parser";
import { VALUE_WORD_MIN_CONFIDENCE, valueTokenConfidence } from "./ocr-word-confidence";
import { fileSha256 } from "./sha256";
export { fileSha256 } from "./sha256";

/** Runs Tesseract in a browser worker. Engine and language files come from /ocr on our own origin; the image never leaves the device. */
export async function recognizeReportImage(file: File, onProgress: (status: string, progress: number) => void, signal: AbortSignal) {
  const { createWorker } = await import("tesseract.js");
  const sourceFileId = await fileSha256(file);
  if (signal.aborted) throw new Error("OCR cancelled.");
  const worker = await createWorker("eng", 1, { workerPath: "/ocr/worker.min.js", corePath: "/ocr/", langPath: "/ocr", logger: (event) => { if (!signal.aborted) onProgress(event.status, event.progress); } });
  let termination: Promise<unknown> | undefined;
  const terminate = () => termination ??= worker.terminate();
  const cancel = () => { void terminate().catch(() => undefined); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    if (signal.aborted) throw new Error("OCR cancelled.");
    await worker.setParameters({ preserve_interword_spaces: "1" });
    const { data } = await worker.recognize(file, {}, { text: true, blocks: true });
    if (signal.aborted) throw new Error("OCR cancelled.");
    const confidence = Number.isFinite(data.confidence) ? data.confidence : undefined;
    onProgress("matching results", 1);
    const layout = data.blocks?.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines)).map((line, index) => {
      const gapThreshold = Math.max(10, (line.bbox.y1 - line.bbox.y0) * 0.75);
      const spacedText = line.words.map((word, position) => {
        const previous = line.words[position - 1];
        return (previous ? word.bbox.x0 - previous.bbox.x1 > gapThreshold ? "  " : " " : "") + word.text;
      }).join("");
      return { text: /\s{2,}/.test(line.text.trim()) ? line.text.trim() : spacedText || line.text.trim(), location: { line: index + 1, page: 1, box: line.bbox } };
    });
    const report = parseOcrText(data.text, `ocr-${sourceFileId}`, confidence, layout);
    const lines = data.blocks?.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines)) ?? [];
    for (const field of report.fields) {
      const valueConfidence = valueTokenConfidence(lines, field.sourceText ?? "", field.value);
      if (valueConfidence === null || valueConfidence < VALUE_WORD_MIN_CONFIDENCE) {
        field.parsingReliability = "uncertain";
      }
    }
    return { ...report, sourceFileId };
  } finally {
    signal.removeEventListener("abort", cancel);
    await terminate().catch(() => undefined);
  }
}

