"use client";
import { useId, useRef } from "react";
import { AccessPreferencesPanel } from "./AccessPreferencesPanel";

/** Adjust in place so a chat, medical-entry form or review stays mounted. */
export function AccessPreferencesControl({ compact = false }: { compact?: boolean } = {}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={trigger} type="button" className={`pro-btn pro-btn-secondary min-w-0 max-w-full whitespace-normal! ${compact ? "!min-h-11 !rounded-field !px-2 !py-1 !text-sm" : ""}`}
      aria-label={compact ? "পছন্দ · Adjust how you use PROHOR" : undefined}
      aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>{compact ? "☷ পছন্দ" : "Adjust how you use PROHOR"}</button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => trigger.current?.focus()}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-pro-border bg-pro-bg p-4 text-pro-text backdrop:bg-pro-text/40">
      <div className="mb-4 flex justify-end"><button type="button" className="pro-btn pro-btn-secondary" onClick={() => dialog.current?.close()}>Close settings</button></div>
      <AccessPreferencesPanel titleId={titleId} />
    </dialog>
  </>;
}
