"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { readRequestIds } from "@/features/bondhon/request-history";
import { RequestTracker } from "@/features/bondhon/RequestTracker";
import { supportRequestSchema, type SupportRequest } from "@/lib/contracts/bondhon";
import { CareRequestEmpty } from "./CareRequestEmpty";
import styles from "./shonket.module.css";

const methodLabels = { text: "Text message", aac: "AAC-friendly", call: "Phone call (stated preference)" } as const;

/** Shows only what the server returned for this account's request; never a local guess. */
export function RequestStatus({ requestId }: { requestId?: string }) {
  const [id, setId] = useState(requestId);
  const [resolved, setResolved] = useState(Boolean(requestId));
  // Fallback to this device's latest request after hydration (localStorage is client-only).
  useEffect(() => { if (!requestId) void Promise.resolve().then(() => { setId(readRequestIds()[0]); setResolved(true); }); }, [requestId]);
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const closeKey = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/care-requests/${encodeURIComponent(id)}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({})) as { data?: unknown; error?: { message?: string } };
      const parsed = supportRequestSchema.safeParse(body.data);
      if (!response.ok || !parsed.success) throw new Error(body.error?.message ?? "This request could not be loaded.");
      setRequest(parsed.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Status could not be checked. Try again."); }
  }, [id]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function close() {
    if (!request || busy) return;
    setBusy(true); setError("");
    closeKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch(`/api/care-requests/${request.id}/close`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": closeKey.current }, body: JSON.stringify({ expectedRevision: request.revision }) });
      const body = await response.json().catch(() => ({})) as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "The request could not be closed.");
      closeKey.current = null;
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The request could not be closed."); }
    finally { setBusy(false); }
  }

  if (!resolved) return <p role="status">Checking status…</p>;
  if (!id) return <CareRequestEmpty screen="status" />;
  const closed = request?.status === "closed";

  return (
    <div className={styles.experience}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>STEP 3 OF 3 · STATUS</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Your request status</h1>
        <p className={styles.lead}>This is the status saved in PROHOR. It changes only when the provider acts. Refresh to check again.</p>
      </header>
      <AppCard as="section" className={styles.statusCard} aria-labelledby="request-status-heading">
        <div className="grid gap-4">
          <h2 id="request-status-heading" className={styles.cardTitle}>{closed ? "This request is closed" : "Request sent to the demo care queue"}</h2>
          {!request && !error && <p role="status">Checking status…</p>}
          {error && <p role="alert" className="text-pro-danger">{error}</p>}
          {request && <>
            <div role="status" aria-live="polite"><RequestTracker status={request.status} updatedAt={request.updatedAt} /></div>
            <dl className={styles.reviewList}>
              <div><dt>Message</dt><dd className={styles.userMessage}>{request.message}</dd></div>
              <div><dt>Preferred method</dt><dd>{methodLabels[request.method]}</dd></div>
              <div><dt>Why</dt><dd>{request.purpose}</dd></div>
              <div><dt>Records shared</dt><dd>{request.consentGrantIds.length || "None"}</dd></div>
              {request.coordination && <div><dt>Permission ends</dt><dd>{new Date(request.coordination.expiresAt).toLocaleString("en-GB")}. Closing or revoking ends future access sooner.</dd></div>}
              <div><dt>Request ID</dt><dd className="break-all font-mono text-sm">{request.id}</dd></div>
            </dl>
          </>}
          <p className="text-sm text-pro-muted">The provider is simulated: a demo account, not a real clinician or emergency service. For an emergency, call 999.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void load()} className="pro-btn pro-btn-secondary"><RefreshCw size={17} aria-hidden="true" /> Refresh status</button>
            {request && !closed && <button type="button" onClick={() => void close()} aria-disabled={busy} className="pro-btn pro-btn-secondary text-pro-danger">{busy ? "Closing…" : "Close request and stop sharing"}</button>}
            <Link href="/app" className="pro-btn pro-btn-primary">Back to dashboard <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
