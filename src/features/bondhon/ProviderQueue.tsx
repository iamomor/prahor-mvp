"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { providerRequestSchema, providerRequestSummarySchema, type ProviderRequest, type ProviderRequestSummary } from "@/lib/contracts/bondhon";

const methodLabels = { text: "Text message", aac: "AAC / picture-and-text", call: "Phone call" } as const;
const statusLabels = { submitted: "Submitted", delivered: "New", acknowledged: "Acknowledged", responded: "Responded", closed: "Closed" } as const;
const when = (value: string) => new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));
const action = "min-h-11 rounded-control px-4 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus aria-disabled:opacity-60";

/** Plain-language rendering of one consented field; provenance stays visible (self-report is never shown as clinical). */
function sharedField(field: string, value: unknown): string {
  if (value === null || value === undefined) return `${field}: not recorded`;
  if (field === "measurement" && typeof value === "object") {
    const { kind, value: amount, unit } = value as { kind: string; value: string; unit: string | null };
    return `${kind.charAt(0).toUpperCase()}${kind.slice(1).replaceAll("_", " ")}: ${amount}${unit ? ` ${unit}` : ""}`;
  }
  if (field === "provenance" && typeof value === "object") {
    return (value as { source?: string }).source === "document_extracted" ? "Source: from a report, checked by the mother" : "Source: recorded by the mother (not clinician-confirmed)";
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return `Date: ${when(value)}`;
  return `${field.replace(/([A-Z])/g, " $1").toLowerCase()}: ${String(value)}`;
}

async function readJson(response: Response) {
  return await response.json().catch(() => ({})) as { data?: unknown; error?: { message?: string } };
}

/** Assigned simulated provider only: the server returns requests sent to this account, and only consented fields. */
export function ProviderQueue() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ProviderRequestSummary[] | null>(null);
  const [open, setOpen] = useState<ProviderRequest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"acknowledge" | "respond" | null>(null);
  const [reply, setReply] = useState("");
  const actionKey = useRef<{ id: string; kind: string; key: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/provider/requests?limit=50", { cache: "no-store" });
      const body = await readJson(response);
      const parsed = providerRequestSummarySchema.array().safeParse((body.data as { items?: unknown } | undefined)?.items);
      if (!response.ok || !parsed.success) throw new Error(body.error?.message ?? "The queue could not be loaded.");
      setItems(parsed.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The queue could not be loaded."); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function openRequest(id: string) {
    setNotice(""); setError(""); setReply("");
    const response = await fetch(`/api/care-requests/${id}`, { cache: "no-store" });
    const body = await readJson(response);
    const parsed = providerRequestSchema.safeParse(body.data);
    if (!response.ok || !parsed.success) { setError(body.error?.message ?? "This request is no longer available to you."); setOpen(null); return; }
    setOpen(parsed.data);
  }

  async function act(kind: "acknowledge" | "respond") {
    if (!open || busy) return;
    if (kind === "respond" && !reply.trim()) { setError("Write a reply before sending."); return; }
    setBusy(kind); setError(""); setNotice("");
    // Same key for retries of the same action on the same request revision.
    if (actionKey.current?.id !== `${open.id}:${open.revision}` || actionKey.current.kind !== kind) actionKey.current = { id: `${open.id}:${open.revision}`, kind, key: crypto.randomUUID() };
    try {
      const response = await fetch(`/api/provider/requests/${open.id}/${kind}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": actionKey.current.key },
        body: JSON.stringify(kind === "respond" ? { expectedRevision: open.revision, message: reply.trim() } : { expectedRevision: open.revision }),
      });
      const body = await readJson(response);
      const parsed = providerRequestSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error(body.error?.message ?? "The action was not confirmed.");
      setOpen(parsed.data); setReply("");
      setNotice(kind === "acknowledge" ? `Acknowledged at ${when(parsed.data.updatedAt)}. The mother now sees this status.` : `Reply saved at ${when(parsed.data.updatedAt)}.`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The action was not confirmed."); }
    finally { setBusy(null); }
  }

  return <div className="grid gap-6">
    <p className="rounded-field border border-pro-border bg-pro-surface px-4 py-3 text-sm"><strong>{t({ en: "Simulated provider.", bn: "সিমুলেটেড সেবাদাতা।" })}</strong> {t({ en: "Demo data only. You see requests sent to this account and only the records each mother chose to share.", bn: "শুধু ডেমো তথ্য। এই অ্যাকাউন্টে পাঠানো অনুরোধ এবং মায়েরা যেটুকু শেয়ার করেছেন শুধু সেটুকু দেখবেন।" })}</p>
    {error && <p role="alert" className="text-pro-danger">{error}</p>}
    {notice && <p role="status" className="text-pro-success">{notice}</p>}

    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="queue-heading" className="grid content-start gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="queue-heading" className="text-xl font-semibold">{t({ en: "Requests", bn: "অনুরোধ" })} {items && <span className="text-pro-muted">({items.length})</span>}</h2>
          <button type="button" onClick={() => void load()} className={`${action} inline-flex items-center gap-2 border-[1.5px] border-pro-control-border text-pro-primary`}><RefreshCw size={16} aria-hidden="true" />{t({ en: "Refresh", bn: "রিফ্রেশ" })}</button>
        </div>
        {items === null && !error && <p role="status">{t({ en: "Loading queue…", bn: "তালিকা আসছে…" })}</p>}
        {items && !items.length && <p>{t({ en: "No requests yet. New requests appear here after a mother sends one.", bn: "এখনো কোনো অনুরোধ নেই।" })}</p>}
        {items && items.length > 0 && <div className="overflow-x-auto rounded-card border border-pro-border">
          <table className="w-full text-left">
            <caption className="sr-only">Care requests assigned to you</caption>
            <thead className="bg-pro-surface"><tr><th scope="col" className="p-3">Received</th><th scope="col" className="p-3">Message</th><th scope="col" className="p-3">Preferred contact</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3"><span className="sr-only">Action</span></th></tr></thead>
            <tbody>{items.map(item => <tr key={item.id} className={`border-t border-pro-border ${open?.id === item.id ? "bg-pro-surface" : ""}`}>
              <td className="p-3 text-sm">{when(item.createdAt)}</td>
              <td className="p-3"><span className="line-clamp-2 break-words">{item.message}</span></td>
              <td className="p-3">{methodLabels[item.method]}</td>
              <td className="p-3 font-semibold">{statusLabels[item.status]}</td>
              <td className="p-3"><button type="button" onClick={() => void openRequest(item.id)} className="min-h-11 font-semibold text-pro-primary underline underline-offset-4">Open<span className="sr-only"> request from {when(item.createdAt)}</span></button></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>

      <section aria-labelledby="detail-heading" className="grid content-start gap-4 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card,1.25rem)]">
        <h2 id="detail-heading" className="text-xl font-semibold">{t({ en: "Request detail", bn: "অনুরোধের বিস্তারিত" })}</h2>
        {!open ? <p className="text-pro-muted">{t({ en: "Open a request to see the message and shared records.", bn: "বার্তা ও শেয়ার করা রেকর্ড দেখতে একটি অনুরোধ খুলুন।" })}</p> : <>
          <dl className="grid gap-3">
            <div><dt className="text-sm text-pro-muted">Status</dt><dd className="font-semibold">{statusLabels[open.status]} · {when(open.updatedAt)}</dd></div>
            <div><dt className="text-sm text-pro-muted">Message</dt><dd className="whitespace-pre-wrap">{open.message}</dd></div>
            <div><dt className="text-sm text-pro-muted">Preferred contact</dt><dd>{methodLabels[open.method]}</dd></div>
            <div><dt className="text-sm text-pro-muted">Shared records</dt><dd>{open.consentedRecords.length ? <ul className="grid gap-2">{open.consentedRecords.map(record => <li key={record.id} className="rounded-field border border-pro-border px-3 py-2 text-sm">
              {Object.entries(record.fields).map(([field, value]) => <span key={field} className="block">{sharedField(field, value)}</span>)}
            </li>)}</ul> : "None shared"}</dd></div>
          </dl>
          {open.status === "delivered" && <button type="button" onClick={() => void act("acknowledge")} aria-disabled={busy !== null} className={`${action} w-fit bg-pro-primary text-pro-on-primary`}>{busy === "acknowledge" ? "Acknowledging…" : "Acknowledge request"}</button>}
          {open.status === "acknowledged" && <div className="grid gap-2">
            <label htmlFor="provider-reply" className="font-semibold">Reply to the mother</label>
            <textarea id="provider-reply" value={reply} onChange={event => setReply(event.target.value)} maxLength={2000} rows={3} className="min-h-11 rounded-field border-[1.5px] border-pro-control-border bg-pro-bg px-3 py-2" />
            <p className="text-sm text-pro-muted">Educational follow-up only. Do not diagnose or prescribe in this demo.</p>
            <button type="button" onClick={() => void act("respond")} aria-disabled={busy !== null} className={`${action} w-fit bg-pro-primary text-pro-on-primary`}>{busy === "respond" ? "Sending reply…" : "Send reply"}</button>
          </div>}
        </>}
      </section>
    </div>
  </div>;
}
