"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { validateReportFile, type ReportMediaKind } from "./upload-validation";

const control = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg p-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
const button = "min-h-12 whitespace-normal rounded-control border border-pro-primary px-4 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";

type SelectedMedia = { file: File; kind: ReportMediaKind; url: string };
export function ReportUpload({ onContinue, continueLabel = "Run local English OCR" }: { onContinue: (file: File, kind: ReportMediaKind) => void; continueLabel?: string }) {
  const id = useId();
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [message, setMessage] = useState("No file selected. Choose a fictional or non-sensitive file to start.");
  const activeUrl = useRef<string | null>(null);
  const request = useRef(0);
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
  function ready() { setPreviewReady(true); setError(null); setMessage("Preview ready. Check your selection before running local OCR."); }

  return <section aria-labelledby={`${id}-heading`} className="grid min-w-0 grid-cols-1 gap-[var(--pro-gap-field)] rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]">
    <h2 id={`${id}-heading`} className="text-2xl font-semibold">Choose a photo</h2>
    <p id={`${id}-privacy`} className="text-pro-muted">Use synthetic or non-sensitive files only. Selection and preview stay in this browser. Nothing is sent to a server or stored in localStorage. Returning here preserves your current review corrections.</p>
    <div className="grid min-w-0 gap-2">
      <label htmlFor={`${id}-photo`} className="font-semibold">Photo Upload · <span lang="bn">ছবি নির্বাচন</span></label>
      <p id={`${id}-photo-hint`} className="text-pro-muted">JPG/JPEG, PNG, or WebP · Maximum 10 MiB. Selecting another file replaces the current preview.</p>
      <input ref={photoInput} id={`${id}-photo`} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className={control} onChange={(event) => void choose(event, "photo")} aria-describedby={`${id}-photo-hint ${id}-privacy ${id}-error`} aria-invalid={Boolean(error)} />
    </div>
    <p role="status" aria-atomic="true">{message}</p>
    <p id={`${id}-error`} role="alert" className="text-pro-danger">{error}</p>
    {selected && <section aria-label="Selected file preview" className="grid min-w-0 gap-3 rounded-field border border-pro-border p-3">
      <dl className="grid min-w-0 gap-2 [overflow-wrap:anywhere]">
        <div><dt className="font-semibold">File name</dt><dd>{selected.file.name}</dd></div>
        <div><dt className="font-semibold">File type</dt><dd>{selected.file.type || "Browser MIME type unavailable; extension and file signature checked"}</dd></div>
        <div><dt className="font-semibold">File size</dt><dd>{(selected.file.size / 1024 / 1024).toFixed(2)} MiB ({selected.file.size.toLocaleString("en-BD")} bytes)</dd></div>
      </dl>
      {/* Blob URLs stay in the browser; no image optimization request is needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={selected.url} src={selected.url} alt="Local preview of your selected fictional photo" className="h-auto max-h-96 w-full min-w-0 object-contain" onLoad={ready} onError={previewFailed} />
      <p className="text-pro-muted">Preview only. Nothing has been analyzed.</p>
    </section>}
    {(selected || validating) && <button type="button" onClick={remove} className={`${button} text-pro-primary`}>Remove selected file</button>}
    <button type="button" disabled={!selected || validating || !previewReady || Boolean(error)} onClick={() => { if (selected && previewReady && !error) onContinue(selected.file, selected.kind); }} className={`${button} bg-pro-primary text-pro-on-primary disabled:text-pro-on-primary`}>{continueLabel}</button>
  </section>;
}


