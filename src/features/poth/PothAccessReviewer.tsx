"use client";
import { useRef, useState, type FormEvent } from "react";

const values = { reported_available: "Available", reported_limited: "Limited", reported_unavailable: "Not available", unknown: "Unknown" } as const;
const attributes = { wheelchair: "Wheelchair access", accessibleToilet: "Accessible toilet", hearingLoop: "Hearing loop" } as const;

// Shown only to people the database lists as Poth reviewers. The server re-checks that on every write.
export function PothAccessReviewer({ facilityId }: { facilityId: string }) {
  const [attribute, setAttribute] = useState<keyof typeof attributes>("wheelchair");
  const [value, setValue] = useState<keyof typeof values>("reported_available");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);

  async function send(event: FormEvent, state: "verified" | "withdrawn") {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/poth/access-evidence/review", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId, attribute, value, status: state, source }) });
      setMessage(response.ok ? (state === "verified" ? "Saved as verified under your reviewer identity. Reload to see it." : "Claim withdrawn. It is no longer shown as verified.")
        : response.status === 403 ? "You are not an authorised reviewer. Nothing was changed."
        : response.status === 400 ? "Check the evidence: a verified claim needs a source of at least 3 characters. Nothing was changed."
        : "Could not save. Nothing was changed. Try again.");
    } catch { setMessage("Could not reach the server. Nothing was changed."); }
    finally { setBusy(false); requestAnimationFrame(() => status.current?.focus()); }
  }
  const field = "min-h-11 rounded-field border border-pro-control-border bg-pro-bg px-3";
  return (
    <form className="grid gap-2 border-t border-pro-border pt-3" aria-label="Reviewer: access evidence" onSubmit={event => send(event, "verified")}>
      <h4 className="font-semibold">Reviewer only: verify access evidence</h4>
      <label className="grid gap-1">Attribute<select className={field} value={attribute} onChange={event => setAttribute(event.target.value as keyof typeof attributes)}>{Object.entries(attributes).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <label className="grid gap-1">Finding<select className={field} value={value} onChange={event => setValue(event.target.value as keyof typeof values)}>{Object.entries(values).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <label className="grid gap-1">Evidence source (for example “phone call with front desk, 2026-11-20”)<input className={field} value={source} maxLength={300} onChange={event => setSource(event.target.value)} /></label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="pro-btn pro-btn-primary">Verify and publish</button>
        <button type="button" disabled={busy} className="pro-btn pro-btn-secondary" onClick={event => void send(event, "withdrawn")}>Withdraw this claim</button>
      </div>
      <p ref={status} tabIndex={-1} role="status" aria-atomic="true">{message}</p>
    </form>
  );
}
