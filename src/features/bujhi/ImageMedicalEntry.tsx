"use client";
import { useEffect, useRef, useState } from "react";
import { ReportUpload } from "./ReportUpload";
import { recognizeReportImage } from "./ocr-service";
import type { ExtractedReport } from "./types";
export function ImageMedicalEntry({ onDraft, active = true }: { active?: boolean; onDraft: (report: ExtractedReport) => void }) {
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0), [status, setStatus] = useState("Select a fictional report image. No OCR has run."), [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (!active) { controller.current?.abort(); void Promise.resolve().then(() => { setBusy(false); setStatus("OCR is idle. Choose an image when ready."); }); } }, [active]);
  async function scan(file: File) {
    if (!consent || busy) { setError("Allow the OCR engine/language downloads before starting. The image stays local."); return; }
    const active = new AbortController(); controller.current = active;
    setBusy(true); setError(""); setStatus("Starting local English OCR…");
    try {
      const draft = await recognizeReportImage(file, (message, fraction) => { setStatus(message); setProgress(Math.round(fraction * 100)); }, active.signal);
      setStatus(draft.fields.length ? "OCR complete. Review the raw text and correct every field." : "OCR finished but no supported test fields were recognized. Review the raw text and use manual entry for unrecognized information.");
      onDraft(draft);
    } catch { if (!active.signal.aborted) { setError("OCR could not complete. Engine/language downloads or image decoding may have failed. Retry or use manual entry; no result was invented."); setStatus("OCR failed."); } }
    finally { if (!active.signal.aborted) setBusy(false); }
  }
  function cancel() { controller.current?.abort(); setBusy(false); setStatus("OCR cancelled. Nothing saved."); }
  return <section className="grid min-w-0 gap-4" aria-label="Image OCR entry">
    <h2 className="text-2xl font-semibold">Scan Medical Report — <span lang="bn">রিপোর্টের ছবি স্ক্যান করুন</span></h2>
    <p>English OCR only. Bangla OCR is not validated. Use synthetic reports only. Raw OCR text is retained in this session for checking, not automatically saved.</p>
    <label className="flex gap-3 rounded-field border border-pro-border bg-pro-surface p-4"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} />Allow downloads of Tesseract engine and English language data. The image itself is processed locally and is not sent to an OCR service.</label>
    <fieldset disabled={busy} className="min-w-0"><legend className="sr-only">Select report image</legend><ReportUpload onContinue={(file) => void scan(file)} /></fieldset>
    {busy && <><progress value={progress} max={100} aria-label="OCR engine progress" className="w-full" /><button type="button" onClick={cancel} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">Cancel OCR</button></>}
    <p role="status" aria-atomic="true">{status}{busy ? ` (${progress}%, current engine stage)` : ""}</p><p role="alert" className="text-pro-danger">{error}</p>
  </section>;
}

