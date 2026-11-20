"use client";

import { useEffect, useRef, useState } from "react";
import { FileImage, ScanLine, ShieldCheck } from "lucide-react";
import { ReportUpload } from "./ReportUpload";
import { recognizeReportImage } from "./ocr-service";
import { WorkflowProgress } from "./WorkflowProgress";
import type { ExtractedReport } from "./types";

export function ImageMedicalEntry({ onDraft, active = true, onManual }: { active?: boolean; onDraft: (report: ExtractedReport, source?: File) => void; onManual?: () => void }) {
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0), [status, setStatus] = useState("Select a fictional report image. No OCR has run."), [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!active) {
      controller.current?.abort();
      void Promise.resolve().then(() => { setBusy(false); setStatus("OCR is idle. Choose an image when ready."); });
    }
  }, [active]);
  async function scan(file: File) {
    if (!consent || busy) { setError("Allow the OCR engine/language downloads before starting. The image stays local."); return; }
    const operation = new AbortController(); controller.current = operation;
    setBusy(true); setProgress(0); setError(""); setStatus("Starting local English OCR…");
    try {
      const draft = await recognizeReportImage(file, (message, fraction) => {
        setStatus(message === "matching results" ? "Matching results…" : message === "recognizing text" ? "Finding text in the photo…" : "Preparing the local reader…");
        setProgress(Math.max(0, Math.min(100, Math.round(fraction * 100))));
      }, operation.signal);
      if (operation.signal.aborted) return;
      setStatus(draft.fields.length ? "Image read. Compare the extracted values with the original." : "OCR finished but no supported test fields were recognized. Review the raw text and use manual entry for unrecognized information.");
      onDraft(draft, file);
    } catch {
      if (!operation.signal.aborted) { setError("The image could not be read. Check your connection and try again, or choose another image."); setStatus("OCR failed. Nothing saved."); }
    } finally { if (!operation.signal.aborted) setBusy(false); }
  }
  function cancel() { controller.current?.abort(); setBusy(false); setStatus("OCR cancelled. Nothing saved."); }
  return <section className="grid min-w-0 gap-6" aria-label="Image OCR entry">
    <WorkflowProgress current="add" language="bn" />
    <header className="grid gap-3">
      <p className="flex items-center gap-2 font-semibold text-pro-primary"><ScanLine aria-hidden="true" className="size-5 shrink-0" />বুঝি · REPORT READER</p>
      <h2 className="text-2xl font-semibold sm:text-3xl">{busy ? <>Reading your report · <span lang="bn">রিপোর্ট পড়া হচ্ছে</span></> : <>Scan Medical Report · <span lang="bn">রিপোর্টের ছবি স্ক্যান করুন</span></>}</h2>
      <p className="max-w-[65ch] text-pro-muted" lang="bn">একবারে এক পাতা দিন। ছবির লেখা পড়ার পরে প্রতিটি ফল আপনার সঙ্গে মিলিয়ে নেওয়া হবে।</p>
    </header>
    <div hidden={busy} className="min-w-0">
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-4">
          <p className="rounded-field border border-pro-border bg-pro-bg p-4">Use a fictional report. This reader supports English text. <span lang="bn">এটি উন্নয়ন পর্যায়ের ডেমো; আসল ব্যক্তিগত রিপোর্ট দেবেন না।</span></p>
          <label className="flex min-h-12 items-start gap-3 rounded-field border border-pro-control-border bg-pro-surface p-4"><input className="mt-1 size-5 shrink-0" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} /><span>Allow downloads for the English reader. Your image is read on this device.<span className="mt-1 block text-pro-muted" lang="bn">রিডার চালু করতে ইন্টারনেট লাগতে পারে। রিপোর্টের ছবি বাইরে পাঠানো হয় না।</span></span></label>
          <fieldset disabled={busy} className="min-w-0"><legend className="sr-only">Select report image</legend><ReportUpload autoContinue={active && consent && !busy} onContinue={(file) => void scan(file)} /></fieldset>
        </div>
        <aside className="grid min-w-0 gap-5 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-6" aria-label="Photo tips and privacy">
          <div className="grid gap-3"><FileImage aria-hidden="true" className="size-7 text-pro-primary" /><h3 className="text-xl font-semibold" lang="bn">একটি পরিষ্কার ছবিই শুরু</h3><ul className="list-disc space-y-3 pl-5 text-pro-muted" lang="bn"><li>রিপোর্ট সমতলে রেখে আলোতে ছবি তুলুন।</li><li>লেখা, ফল ও একক যেন দেখা যায়; ছায়া বা ঝলক এড়ান।</li><li>তারিখ বা কোনো সংখ্যা বোঝা না গেলে অনুমান করবেন না।</li></ul></div>
          <div className="border-t border-pro-border pt-5"><h3 className="font-semibold" lang="bn">আগে নমুনা দিয়ে দেখুন</h3><a href="/bujhi/prohor-synthetic-lab-v1.png" download className="inline-flex min-h-12 items-center font-semibold text-pro-primary underline">Download sample report (PNG)</a><p className="text-pro-muted">The sample has an incomplete date. Use it to practice checking the extracted values.</p></div>
          <p className="flex items-start gap-2 border-t border-pro-border pt-5 text-pro-muted"><ShieldCheck aria-hidden="true" className="mt-1 size-5 shrink-0" /><span lang="bn">আপনি যাচাই না করা পর্যন্ত কোনো ফল সংরক্ষিত হয় না। এটি চিকিৎসকের পর্যালোচনা নয়।</span></p>
        </aside>
      </div>
    </div>
    {busy && <div className="grid gap-5 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-8"><p>Photo received. Reading runs on this device.</p><progress value={progress} max={100} aria-label="OCR engine progress" className="h-3 w-full accent-pro-primary" /><p className="text-pro-muted">OCR text-recognition progress: {progress}%. This does not measure medical accuracy.</p><button type="button" onClick={cancel} className="min-h-12 w-fit rounded-control border border-pro-control-border px-5 py-3 font-semibold text-pro-primary">Cancel OCR</button></div>}
    {onManual && <button type="button" onClick={onManual} className="min-h-12 justify-self-start rounded-control px-2 font-semibold text-pro-primary underline">নিজে লিখব · Type it myself</button>}
    <p role="status" aria-atomic="true" className="text-pro-muted">{status}</p><p role="alert" className="text-pro-danger">{error}</p>
  </section>;
}
