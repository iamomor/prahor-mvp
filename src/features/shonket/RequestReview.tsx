"use client";

import { ArrowRight, ClipboardCheck, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { rememberRequestId } from "@/features/bondhon/request-history";
import { useCareRequestDraft, updateCareRequestDraft } from "./care-request-draft";
import { CareRequestEmpty } from "./CareRequestEmpty";
import styles from "./shonket.module.css";

const methodLabels = { text: "Text message", aac: "AAC-friendly", call: "Phone call (stated preference; no call is placed automatically)" } as const;
const purposes = ["I have a question about my pregnancy", "I would like help understanding my records", "Please contact me about my wellbeing"] as const;
type Recipient = { id: string; displayName: string };
type Observation = { id: string; subject: "mother" | "baby"; kind: string; value: string; unit: string | null; observed_at: string };
type ApiFailure = { error?: { message?: string } };

const when = (value: string) => new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(value));
const kindLabel = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1).replaceAll("_", " ");

async function postCare(url: string, body: unknown, key: string) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({})) as { data?: { id?: string } } & ApiFailure;
  if (!response.ok || !result.data?.id) {
    const uncertain = response.status === 503 || response.status >= 500;
    throw new Error(`${result.error?.message ?? "The request was rejected."}${uncertain ? " It may not have been sent. Press Send again: PROHOR reuses the same retry key, so it will not be sent twice." : ""}`);
  }
  return result.data.id;
}

export function RequestReview() {
  const draft = useCareRequestDraft();
  const router = useRouter();
  const id = useId();
  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [observations, setObservations] = useState<Observation[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [purpose, setPurpose] = useState<string>(purposes[0]);
  const [shareIds, setShareIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Retry keys survive a failed attempt so a resend is deduplicated by the server.
  const keys = useRef<{ payload: string; request: string; consents: Record<string, string>; startsAt: number } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/care-recipients", { cache: "no-store" });
        const body = await response.json() as { data?: Recipient[] } & ApiFailure;
        if (!response.ok || !body.data) throw new Error(body.error?.message);
        setRecipients(body.data);
        setRecipientId(previous => previous || (body.data?.[0]?.id ?? "")); // never override a choice already made
      } catch (cause) { setLoadError(cause instanceof Error && cause.message ? cause.message : "Care recipients could not be loaded. Reload to try again."); }
    })();
    void (async () => {
      try {
        const response = await fetch("/api/jibonrekha", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const records = await response.json() as { observations: Observation[]; corrections: { old_observation_id: string }[] };
        const superseded = new Set(records.corrections.map(item => item.old_observation_id));
        setObservations(records.observations.filter(item => item.subject === "mother" && item.kind !== "note" && !superseded.has(item.id)).slice(0, 5));
      } catch { setObservations([]); /* sharing records is optional; the request can still be sent */ }
    })();
  }, []);

  if (!draft.message.trim()) return <CareRequestEmpty screen="review" />;
  const recipient = recipients?.find(item => item.id === recipientId);

  async function send() {
    if (busy || !recipient) return;
    setBusy(true); setError("");
    const payload = JSON.stringify({ recipientId, purpose, shareIds, message: draft.message, method: draft.method });
    if (keys.current?.payload !== payload) keys.current = { payload, request: crypto.randomUUID(), consents: {}, startsAt: Math.floor(Date.now() / 60_000) * 60_000 };
    const k = keys.current;
    try {
      const startsAt = new Date(k.startsAt);
      const consentGrantIds: string[] = [];
      for (const recordId of shareIds) {
        k.consents[recordId] ??= crypto.randomUUID();
        consentGrantIds.push(await postCare("/api/consents", {
          granteeUserId: recipientId, record: { type: "maternal_observation", id: recordId, fields: ["measurement", "observedAt", "provenance"] },
          purpose, startsAt: startsAt.toISOString(), expiresAt: new Date(startsAt.getTime() + 7 * 86_400_000).toISOString(), reviewConfirmed: true,
        }, k.consents[recordId]));
      }
      const requestId = await postCare("/api/care-requests", {
        recipientUserId: recipientId, message: draft.message.trim(), method: draft.method, purpose, consentGrantIds, reviewConfirmed: true,
      }, k.request);
      rememberRequestId(requestId);
      keys.current = null;
      updateCareRequestDraft({ message: "", method: "text" });
      router.push(`/app/care/status?id=${requestId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Not sent. Check your connection. Your message is kept.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.experience}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>STEP 2 OF 3 · REVIEW AND SEND</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Review before sending</h1>
        <p className={styles.lead}>Choose who receives this and what you share. Nothing is sent until you press Send request.</p>
      </header>
      <AppCard as="article" className={styles.reviewCard} aria-label="Request review">
        <div className={styles.reviewHeader}><span className={styles.reviewIcon}><ClipboardCheck size={21} aria-hidden="true" /></span><div><p className={styles.eyebrow}>YOUR REQUEST</p><h2 className={styles.cardTitle}>What will be sent</h2></div></div>

        {loadError && <p role="alert" className="text-pro-danger">{loadError}</p>}
        {!recipients && !loadError && <p role="status">Loading care recipients…</p>}
        {recipients && !recipients.length && <p role="alert">No care recipient is available right now, so this request cannot be sent. Your message is kept.</p>}

        {recipients && recipients.length > 0 && <>
          <fieldset className="grid gap-2">
            <legend className="mb-1 font-semibold">Send to</legend>
            {recipients.map(item => <label key={item.id} className="flex min-h-11 items-center gap-3">
              <input type="radio" name={`${id}-recipient`} checked={recipientId === item.id} onChange={() => setRecipientId(item.id)} className="size-5" />
              <span>{item.displayName} <span className="text-pro-muted">(demo care queue, simulated)</span></span>
            </label>)}
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="mb-1 font-semibold">Why are you asking?</legend>
            {purposes.map(item => <label key={item} className="flex min-h-11 items-center gap-3">
              <input type="radio" name={`${id}-purpose`} checked={purpose === item} onChange={() => setPurpose(item)} className="size-5" />{item}
            </label>)}
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="mb-1 font-semibold">Share records (optional)</legend>
            <p className="text-sm text-pro-muted">Nothing is selected for you. Sharing lasts 7 days and ends if you close the request. Your private diary and AI conversations can never be shared.</p>
            {observations === null ? <p role="status" className="text-sm">Loading your measurements…</p> : observations.length ? observations.map(item => <label key={item.id} className="flex min-h-11 items-center gap-3">
              <input type="checkbox" checked={shareIds.includes(item.id)} onChange={event => setShareIds(ids => event.target.checked ? [...ids, item.id] : ids.filter(value => value !== item.id))} className="size-5" />
              <span>{kindLabel(item.kind)}: {item.value}{item.unit ? ` ${item.unit}` : ""} · {when(item.observed_at)}</span>
            </label>) : <p className="text-sm">No saved measurements to share. You can still send your message.</p>}
          </fieldset>
        </>}

        <dl className={styles.reviewList}>
          <div><dt>Preferred method</dt><dd>{methodLabels[draft.method]}</dd></div>
          <div className={styles.messageSummary}><dt>Your message</dt><dd className={styles.userMessage}>{draft.message}</dd></div>
          <div><dt>Shared</dt><dd>{shareIds.length ? `${shareIds.length} measurement${shareIds.length > 1 ? "s" : ""} (value, date, source)` : "Your message and contact method only"}</dd></div>
        </dl>
        <div className={styles.demoNoticeBox}><strong>Simulated provider.</strong><span>A demo provider account receives this. It is not a real clinician and is not an emergency service. For an emergency, call 999.</span></div>
        {error && <p role="alert" className="text-pro-danger">Not sent. {error}</p>}
        <div className={styles.reviewActions}>
          <Link href="/app/care" className={`pro-btn pro-btn-secondary ${styles.reviewButton}`}><PencilLine size={17} aria-hidden="true" /> Edit message</Link>
          <button type="button" onClick={() => void send()} aria-disabled={busy || !recipient} className={`pro-btn pro-btn-primary ${styles.reviewButton}`}>
            {busy ? "Sending your request…" : "Send request"} <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
        {!recipient && recipients && <p className="text-sm text-pro-muted">Send is unavailable until a recipient is selected.</p>}
      </AppCard>
    </div>
  );
}
