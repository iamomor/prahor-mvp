"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { validateReportFile, type ReportMediaKind } from "./upload-validation";

const control = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg p-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
const button = "min-h-12 whitespace-normal rounded-control border border-pro-primary px-4 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";

type SelectedMedia = { file: File; kind: ReportMediaKind; url: string };
export function ReportUpload({ onContinue, autoContinue = false, continueLabel = "Run local English OCR" }: { onContinue: (file: File, kind: ReportMediaKind) => void; autoContinue?: boolean; continueLabel?: string }) {
  const id = useId();
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [message, setMessage] = useState("No file selected. Choose a fictional or non-sensitive file to start.");
  const activeUrl = useRef<string | null>(null);
  const request = useRef(0);
  const autoStarted = useRef("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);


  useEffect(() => () => {
    request.current++;
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
  }, []);

  function clearPreview() {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    activeUrl.current = null;
    setSelected(null);
    setPreviewReady(false);
  }
  async function choose(event: ChangeEvent<HTMLInputElement>, kind: ReportMediaKind) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = ""; // Allow choosing the same file again after removal or an error.
    if (!file) return;
    const current = ++request.current;
    clearPreview();
    setError(null);
    setValidating(true);
    setMessage("Checking the selected file locally…");
    try {
      const problem = await validateReportFile(file, kind);
      if (current !== request.current) return;
      if (problem) { setError(problem); setMessage("No file selected. Choose another file."); return; }
      const url = URL.createObjectURL(file);
      activeUrl.current = url;
      setSelected({ file, kind, url });
      setMessage("File checked locally. Loading preview…");
    } catch {
      if (current === request.current) { setError("This file could not be read. Choose it again or try another supported file."); setMessage("No file selected."); }
    } finally {
      if (current === request.current) setValidating(false);
    }
  }
  function remove() {
    request.current++;
    clearPreview();
    setError(null);
    setValidating(false);
    setMessage("File removed. No file contents were saved or sent.");
    photoInput.current?.focus();
  }
  function previewFailed() {
    setPreviewReady(false);
    setError("Your browser could not preview this file. It may be damaged or use an unsupported encoding. Replace or remove it to continue.");
    setMessage("Preview unavailable.");
  }
  function ready() {
    setPreviewReady(true);
    setError(null);
    setMessage("Preview ready. Check your selection before running local OCR.");

  }

  useEffect(() => {
    if (!selected || !previewReady || !autoContinue || autoStarted.current === selected.url) return;
    autoStarted.current = selected.url;
    void Promise.resolve().then(() => onContinue(selected.file, selected.kind));
  }, [autoContinue, onContinue, previewReady, selected]);

  return <section aria-labelledby={`${id}-heading`} className="grid min-w-0 grid-cols-1 gap-4">
    <div className="grid gap-1">
      <h3 id={`${id}-heading`} className="text-lg font-semibold">Choose a photo</h3>
      <p id={`${id}-privacy`} className="text-pro-muted">Choose a fictional report. The photo stays in this browser.</p>
    </div>
    <div className="grid min-w-0 gap-3 rounded-card border-2 border-dashed border-pro-control-border bg-pro-bg p-4">
      <button type="button" className={button + " text-pro-primary sm:justify-self-start"} onClick={() => cameraInput.current?.click()}>ছবি তুলুন · Take a photo</button>
      <input id="bujhi-photo-camera" ref={cameraInput} type="file" hidden capture="environment" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => void choose(event, "photo")} />
      <div className="grid min-w-0 gap-2">
        <label htmlFor="bujhi-photo-gallery" className="font-semibold">Photo Upload · <span lang="bn">ছবি নির্বাচন</span></label>
        <p id={`${id}-photo-hint`} className="text-sm text-pro-muted">JPG, PNG or WebP · Up to 10 MiB</p>
        <input ref={photoInput} id="bujhi-photo-gallery" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className={control} onChange={(event) => void choose(event, "photo")} aria-describedby={`${id}-photo-hint ${id}-privacy ${id}-error`} aria-invalid={Boolean(error)} />
      </div>
    </div>
    <p role="status" aria-atomic="true" className="text-pro-muted">{message}</p>
    <p id={`${id}-error`} role="alert" className="text-pro-danger">{error}</p>
    {selected && <section aria-label="Selected file preview" className="grid min-w-0 gap-3 rounded-card border border-pro-border bg-pro-bg p-4">
      <p className="font-semibold [overflow-wrap:anywhere]">{selected.file.name}</p>
      {/* Blob URLs stay in the browser; no image optimization request is needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={selected.url} src={selected.url} alt="Local preview of your selected fictional photo" className="h-auto max-h-96 w-full min-w-0 rounded-field object-contain" onLoad={ready} onError={previewFailed} />
      <p className="text-sm text-pro-muted">Preview only. Nothing has been analyzed.</p>
    </section>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pro-border pt-4">
      {(selected || validating) ? <button type="button" onClick={remove} className="min-h-12 whitespace-normal rounded-control px-3 py-3 font-semibold text-pro-primary underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus">Remove selected file</button> : <span />}
      <button type="button" disabled={!selected || validating || !previewReady || Boolean(error)} onClick={() => { if (selected && previewReady && !error) onContinue(selected.file, selected.kind); }} className={`${button} bg-pro-primary text-pro-on-primary disabled:text-pro-on-primary sm:min-w-56`}>{continueLabel}</button>
    </div>
  </section>;
}


