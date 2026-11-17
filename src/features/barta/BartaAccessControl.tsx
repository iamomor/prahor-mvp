"use client";

import { useRef } from "react";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";

/** Native modal keeps the chat mounted and restores focus without losing drafts. */
export function BartaAccessControl() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  return <>
    <button ref={trigger} type="button" className="pro-btn pro-btn-secondary"
      style={{ whiteSpace: "normal", maxWidth: "100%", textAlign: "center" }}
      aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      Adjust how you use PROHOR
    </button>
    <dialog ref={dialog} aria-labelledby="access-title"
      onClose={() => trigger.current?.focus()}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-pro-border bg-pro-bg p-4 text-pro-text backdrop:bg-pro-text/40">
      <div className="mb-4 flex justify-end">
        <button type="button" className="pro-btn pro-btn-secondary" onClick={() => dialog.current?.close()}>Close settings</button>
      </div>
      <AccessPreferencesPanel />
    </dialog>
  </>;
}
