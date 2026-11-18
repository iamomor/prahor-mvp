"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { AACComposer, clearStoredAacDraft, mergeAacText } from "@/features/adapt";
import { starterCareResponseSchema } from "@/lib/contracts/current-api";

export function CareRequestStarter() {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("text");
  const [status, setStatus] = useState("");
  const [incoming, setIncoming] = useState("");
  const [busy, setBusy] = useState(false);
  function insert(text: string) {
    const next = mergeAacText(message, text);
    if (next.length > 1000) { setIncoming(text); return; }
    setMessage(next); setIncoming(""); clearStoredAacDraft(); input.current?.focus();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/care-requests", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, method }),
      });
      const parsed = starterCareResponseSchema.safeParse(await response.json());
      setStatus(parsed.success ? parsed.data.message : "Not sent. Delivery could not be verified.");
    } catch { setStatus("Not sent. The connection is unavailable."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="pro-card grid max-w-xl gap-5">
    <label className="pro-field" htmlFor={`${id}-method`}><span className="font-semibold">Preferred communication</span>
      <select id={`${id}-method`} value={method} onChange={event => setMethod(event.target.value)} className="pro-input">
        <option value="text">Text</option><option value="aac">Picture-and-text / AAC</option><option value="call">Phone call (only if desired)</option>
      </select></label>
    {method === "aac" && <AACComposer onInsert={insert} targetLabel="Insert into care request" />}
    <label className="pro-field" htmlFor={`${id}-message`}><span className="font-semibold">Your message</span>
      <textarea id={`${id}-message`} ref={input} className="pro-input min-h-30" value={message} onChange={event => setMessage(event.target.value)} maxLength={1000} required placeholder="Describe the support you want" /></label>
    {incoming && <div role="alert"><p>The combined message exceeds 1000 characters. Your request is unchanged. Review this incoming text:</p><p className="whitespace-pre-wrap">{incoming}</p></div>}
    <p className="pro-note text-sm">DEMO: No real care worker is connected. This form returns a clear “not sent” response. Inserting an AAC message does not send it.</p>
    <button disabled={busy} className="pro-btn pro-btn-primary">{busy ? "Checking…" : "Review request availability"}</button>
    {status && <p role="status" className="pro-note">{status}</p>}
  </form>;
}
