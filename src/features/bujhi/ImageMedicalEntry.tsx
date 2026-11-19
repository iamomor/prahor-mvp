"use client";
import { useEffect, useRef, useState } from "react";
import { ReportUpload } from "./ReportUpload";
import { recognizeReportImage } from "./ocr-service";
import type { ExtractedReport } from "./types";
export function ImageMedicalEntry({ onDraft, active = true, onManual, onManualFile }: { active?: boolean; onDraft: (report: ExtractedReport, source?: File) => void; onManual?: () => void; onManualFile?: (file: File) => void }) {
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0), [status, setStatus] = useState("Select a fictional report image. No OCR has run."), [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (!active) { controller.current?.abort(); void Promise.resolve().then(() => { setBusy(false); setStatus("OCR is idle. Choose an image when ready."); }); } }, [active]);
  async function scan(file: File) {
    if (!consent || busy) { setError("Allow the OCR engine/language downloads before starting. The image stays local."); return; }
    const active = new AbortController(); controller.current = active;
    setBusy(true); setError(""); setFallbackFile(null); setStatus("Starting local English OCR…");
    try {
      const draft = await recognizeReportImage(file, (message, fraction) => { setStatus(message === "matching results" ? "Matching results…" : message === "recognizing text" ? "Finding text in the photo…" : "Preparing the local reader…"); setProgress(Math.round(fraction * 100)); }, active.signal);

      setStatus(draft.fields.length ? "Image read. Compare the extracted values with the original." : "OCR finished but no supported test fields were recognized. Review the raw text and use manual entry for unrecognized information.");
      onDraft(draft, file);
    } catch { if (!active.signal.aborted) { setError("The image could not be read. Check your connection and try again, or choose another image."); setStatus("OCR failed."); } }

    finally { if (!active.signal.aborted) setBusy(false); }
  }
  function cancel() { controller.current?.abort(); setBusy(false); setStatus("OCR cancelled. Nothing saved."); }
  return <section className="grid min-w-0 gap-4" aria-label="Image OCR entry">
    <h2 className="text-2xl font-semibold">{busy ? <>Reading your report · <span lang="bn">রিপোর্ট পড়া হচ্ছে</span></> : <>Scan Medical Report · <span lang="bn">রিপোর্টের ছবি স্ক্যান করুন</span></>}</h2>
    <div hidden={busy} className="min-w-0"><p className="max-w-[60ch]">Use a fictional report. This reader supports English text.</p>
    <a href="/bujhi/prohor-synthetic-lab-v1.png" download className="inline-flex min-h-12 items-center font-semibold text-pro-primary underline">Download sample report (PNG)</a>
    <p className="mb-3 text-pro-muted">The sample has an incomplete date. Use it to practice checking the extracted values.</p>
    <label className="flex gap-3 rounded-field border border-pro-border bg-pro-surface p-4"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} />Allow downloads for the English reader. Your image is read on this device.</label>
    <fieldset disabled={busy} className="min-w-0"><legend className="sr-only">Select report image</legend><ReportUpload autoContinue={active && consent && !busy} onContinue={(file) => void scan(file)} /></fieldset>
    </div>
    {busy && <div className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5"><p className="!m-0">Photo received. Reading runs on this device.</p><progress value={progress} max={100} aria-label="OCR engine progress" className="w-full" /><button type="button" onClick={cancel} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">Cancel OCR</button></div>}
    {onManual && <button type="button" onClick={onManual} className="min-h-12 justify-self-start rounded-control px-2 font-semibold text-pro-primary underline">নিজে লিখব · Type it myself</button>}
    {onManualFile && fallbackFile && !busy && <button type="button" onClick={() => onManualFile(fallbackFile)} className="min-h-12 justify-self-start rounded-control border border-pro-primary px-4 font-semibold text-pro-primary">নিজে হিমোগ্লোবিন লিখব · Type the hemoglobin value myself</button>}
    <p role="status" aria-atomic="true">{status}{busy ? ` (${progress}%, current engine stage)` : ""}</p><p role="alert" className="text-pro-danger">{error}</p>
  </section>;
}

