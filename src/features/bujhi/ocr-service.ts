import { parseOcrText } from "./ocr-parser";

/** Runs Tesseract in a browser worker. CDN requests fetch engine/language assets, never the image. */
export async function recognizeReportImage(file: File, onProgress: (status: string, progress: number) => void, signal: AbortSignal) {
  const { createWorker } = await import("tesseract.js");
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const sourceFileId = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (signal.aborted) throw new Error("OCR cancelled.");
  const worker = await createWorker("eng", 1, { logger: (event) => { if (!signal.aborted) onProgress(event.status, event.progress); } });
  let termination: Promise<unknown> | undefined;
  const terminate = () => termination ??= worker.terminate();
  const cancel = () => { void terminate().catch(() => undefined); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    if (signal.aborted) throw new Error("OCR cancelled.");
    await worker.setParameters({ preserve_interword_spaces: "1" });
    const { data } = await worker.recognize(file);
    if (signal.aborted) throw new Error("OCR cancelled.");
    const confidence = Number.isFinite(data.confidence) ? data.confidence : undefined;
    return { ...parseOcrText(data.text, `ocr-${sourceFileId}`, confidence), sourceFileId };
  } finally {
    signal.removeEventListener("abort", cancel);
    await terminate().catch(() => undefined);
  }
}
