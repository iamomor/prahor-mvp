"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import { FileCheck2, ScanLine, ShieldCheck } from "lucide-react";
import { ReportUpload } from "./ReportUpload";
import { recognizeReportImage } from "./ocr-service";
import type { ExtractedReport } from "./types";
import { isHemoglobinLabel } from "./validation";
export function ImageMedicalEntry({ onDraft, active = true, onManual, onManualFile }: { active?: boolean; onDraft: (report: ExtractedReport, source?: File) => void; onManual?: () => void; onManualFile?: (file: File) => void }) {
  const { t } = useLanguage();
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0), [status, setStatus] = useState("Select a fictional report image. No OCR has run."), [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (!active) { controller.current?.abort(); void Promise.resolve().then(() => { setBusy(false); setStatus("OCR is idle. Choose an image when ready."); }); } }, [active]);
  async function scan(file: File) {
    if (!consent || busy) { setError("Allow the OCR engine/language downloads before starting. The image stays local."); return; }
    const active = new AbortController(); controller.current = active;
    setBusy(true); setError(""); setFallbackFile(file); setStatus("Starting local English OCR…");
    try {
      const draft = await recognizeReportImage(file, (message, fraction) => { setStatus(message === "matching results" ? "Matching results…" : message === "recognizing text" ? "Finding text in the photo…" : "Preparing the local reader…"); setProgress(Math.round(fraction * 100)); }, active.signal);

      setStatus(draft.fields.length ? "Image read. Compare the extracted values with the original." : "OCR finished but no supported test fields were recognized. Review the raw text and use manual entry for unrecognized information.");
      if (onManualFile && !draft.fields.some(field => isHemoglobinLabel(field.label))) {
        setFallbackFile(file);
        setStatus("No hemoglobin field was read. You can type the printed value from this image. Nothing saved.");
      } else {
        onDraft(draft, file);
      }
    } catch { if (!active.signal.aborted) { setFallbackFile(file); setError("The image could not be read. Check your connection and try again, or type the printed value yourself."); setStatus("OCR failed. Nothing saved."); } }

    finally { if (!active.signal.aborted) setBusy(false); }
  }
  function cancel() { controller.current?.abort(); setBusy(false); setStatus("OCR cancelled. Nothing saved."); }
  return <section className="grid min-w-0 gap-6 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6" aria-label="Image OCR entry">
    <header className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-field bg-pro-surface text-pro-primary"><ScanLine aria-hidden="true" className="size-6" /></span><div className="grid gap-1"><h2 className="text-xl font-semibold">{busy ? t({ en: "Reading your report", bn: "রিপোর্ট পড়া হচ্ছে" }) : t({ en: "Scan a medical report", bn: "রিপোর্টের ছবি স্ক্যান করুন" })}</h2><p className="text-pro-muted">{t({ en: "Use a fictional report. This reader supports English text.", bn: "কাল্পনিক রিপোর্ট ব্যবহার করুন। এই পাঠক শুধু ইংরেজি লেখা পড়তে পারে।" })}</p></div></header>
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
    <div hidden={busy} className="grid min-w-0 gap-5">
      <label className="flex items-start gap-3 rounded-field border border-pro-control-border bg-pro-surface p-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} className="mt-1 size-5 shrink-0 accent-pro-primary" /><span>{t({ en: "Allow downloads for the English reader. Your image is read on this device.", bn: "ইংরেজি পাঠকের ফাইল ডাউনলোডের অনুমতি দিন। আপনার ছবিটি এই ডিভাইসেই পড়া হয়।" })}</span></label>
      <fieldset disabled={busy} className="min-w-0"><legend className="sr-only">Select report image</legend><ReportUpload autoContinue={active && consent && !busy} onContinue={(file) => void scan(file)} /></fieldset>
    </div>

    {busy && <div className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5"><p className="!m-0">Photo received. Reading runs on this device.</p><progress value={progress} max={100} aria-label="OCR engine progress" className="w-full" /><p aria-hidden="true" className="!m-0 text-sm">{progress}%</p><button type="button" onClick={cancel} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">Cancel OCR</button></div>}
    {onManual && <button type="button" onClick={onManual} className="min-h-12 justify-self-start rounded-control px-2 font-semibold text-pro-primary underline">নিজে লিখব · Type it myself</button>}
    {onManualFile && fallbackFile && !busy && <button type="button" onClick={() => onManualFile(fallbackFile)} className="min-h-12 justify-self-start rounded-control border border-pro-primary px-4 font-semibold text-pro-primary">নিজে হিমোগ্লোবিন লিখব · Type the hemoglobin value myself</button>}
    <p role="status" aria-atomic="true">{status}</p><p role="alert" className="text-pro-danger">{error}</p>

  </section>;
}

