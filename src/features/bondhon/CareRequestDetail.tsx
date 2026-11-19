"use client";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/i18n/use-language";
import { ReadAloudButton } from "@/features/adapt";
import { bondhonDetailSchema, type BondhonDetail } from "@/lib/contracts/bondhon-detail";
import { providerRequestSchema, supportRequestSchema, careRecipientsSchema, supportRequestEventSummarySchema, type SupportRequestEventSummary } from "@/lib/contracts/bondhon";
import { pageSchema } from "@/lib/contracts/transport";
import { BondRing } from "./BondRing";
import { RevokeDialog } from "./RevokeDialog";
import { BondhonRequestTracker } from "./BondhonRequestTracker";
import { careFetch, CareError } from "./client";
import { accommodations, displayValue, fieldNames, permissionState, recordNames, statusNames, words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

type Action = { path: string; key: string; body?: unknown; detail: boolean };
export function CareRequestDetail({ account, requestId, provider, onBack }: {
  account: string; requestId: string; provider: boolean; onBack: () => void;
}) {
  const { language, t } = useLanguage();
  const id = useId();
  const [detail, setDetail] = useState<BondhonDetail | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [events, setEvents] = useState<SupportRequestEventSummary[]>([]);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const revision = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<"revoke" | "close" | null>(null);
  const [text, setText] = useState("");
  const [approved, setApproved] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const running = useRef(false);
  const loadCounter = useRef(0);
  const [now, setNow] = useState(0);
  const load = useCallback(async () => {
    const current = ++loadCounter.current;
    setLoading(true);
    try {
      const [requestResult, eventResult, recipientsResult] = await Promise.allSettled([
        careFetch(`/api/care-requests/${requestId}/coordination`, bondhonDetailSchema, account),
        careFetch(`/api/care-requests/${requestId}/events?limit=50`, pageSchema(supportRequestEventSummarySchema), account),
        provider ? Promise.resolve([]) : careFetch("/api/care-recipients", careRecipientsSchema, account),
      ]);
      if (requestResult.status === "rejected") throw requestResult.reason;
      if (eventResult.status === "rejected" && eventResult.reason instanceof CareError &&
        [401, 403, 404].includes(eventResult.reason.status)) throw eventResult.reason;
      const value = requestResult.value;
      if (current !== loadCounter.current) return;
      if (revision.current !== value.request.revision) setApproved(false);
      revision.current = value.request.revision;
      const receiverId = "recipientUserId" in value.request ? value.request.recipientUserId : null;
      setRecipientName(recipientsResult.status === "fulfilled" ? recipientsResult.value.find(person => person.id === receiverId)?.displayName ?? "" : "");
      setDetail(value); setError(""); setNow(Date.now());
      setEvents(eventResult.status === "fulfilled" ? eventResult.value.items : []);
      setHistoryUnavailable(eventResult.status !== "fulfilled" || eventResult.value.nextCursor !== null);
    } catch {
      if (current !== loadCounter.current) return;
      setDetail(null); setEvents([]); setApproved(false); setError("load");
    } finally { if (current === loadCounter.current) setLoading(false); }
  }, [account, requestId, provider]);
  useEffect(() => {
    const counter = loadCounter;
    const initial = window.setTimeout(() => void load(), 0);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const timer = window.setInterval(() => { setNow(Date.now()); if (!running.current && !document.hidden) void load(); }, 30_000);
    function visibility() {
      if (document.hidden && provider) { counter.current++; setDetail(null); setEvents([]); setApproved(false); }
      if (!document.hidden && !running.current) void load();
    }
    document.addEventListener("visibilitychange", visibility);
    return () => { counter.current++; window.clearInterval(clock); window.clearTimeout(initial); window.clearInterval(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [load, provider]);
  async function perform(action: Action) {
    if (running.current) return;
    running.current = true; setBusy(true); setError(""); setNotice(""); setPending(action);
    // Discard a read started before this mutation, so it cannot restore stale content.
    loadCounter.current++;
    const operation = loadCounter.current;
    try {
      if (action.detail) {
        const value = await careFetch(action.path, bondhonDetailSchema, account, { post: true, body: action.body, key: action.key });
        if (operation === loadCounter.current && (!provider || !document.hidden)) setDetail(value);
      } else if (provider) {
        await careFetch(action.path, providerRequestSchema, account, { post: true, body: action.body, key: action.key });
      } else {
        await careFetch(action.path, supportRequestSchema, account, { post: true, body: action.body, key: action.key });
      }
      setPending(null); setConfirmation(null); setText(""); setApproved(false);
      setNotice(t(words("The server confirmed this action.", "সার্ভার কাজটি নিশ্চিত করেছে।")));
      if (!provider || !document.hidden) await load();
    } catch (cause) {
      if (cause instanceof CareError && cause.status < 500) {
        setPending(null); setDetail(null); setEvents([]); setApproved(false); setConfirmation(null); setError("rejected");
      } else { setError("uncertain"); if (provider) setDetail(null); }
    } finally { running.current = false; setBusy(false); }
  }
  function mutate(action: "acknowledge" | "close" | "revoke") {
    if (!detail) return;
    const path = action === "acknowledge" ? `/api/provider/requests/${requestId}/acknowledge` : `/api/care-requests/${requestId}/${action}`;
    void perform({ path, key: crypto.randomUUID(), detail: action === "revoke",
      ...(action !== "revoke" ? { body: { expectedRevision: detail.request.revision } } : {}) });
  }
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || !approved || !text.trim()) return;
    const initialResponse = provider && detail.request.status === "acknowledged" && !detail.messages.some(item => item.sender === "provider");
    void perform({ path: initialResponse ? `/api/provider/requests/${requestId}/respond` : `/api/care-requests/${requestId}/messages`,
      key: crypto.randomUUID(), detail: !initialResponse, body: { expectedRevision: detail.request.revision, message: text.trim() } });
  }
  const r = detail?.request;
  const policy = r?.coordination;
  const recordRevoked = detail?.grants.some(grant => grant.revokedAt !== null);
  const recordNotStarted = detail?.grants.some(grant => Date.parse(grant.startsAt) > now);
  const recordExpired = detail?.grants.some(grant => Date.parse(grant.expiresAt) <= now);
  const state = policy ? permissionState(policy.expiresAt, policy.revokedAt, now) : "legacy";
  const accessState = recordRevoked ? "revoked" : recordExpired ? "expired" : recordNotStarted ? "scheduled" : state;
  const active = !!r && r.status !== "closed" && accessState === "active";
  const canWrite = active && policy?.allowReplies && (!provider || r?.status === "acknowledged" || r?.status === "responded");
  return <section className={styles.workspace} aria-labelledby={`${id}-title`}>
    <div className={styles.actions}>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={onBack}>{t(words("Back to requests", "অনুরোধের তালিকায় ফিরুন"))}</button>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load()}>{t(words("Refresh current access", "বর্তমান অনুমতি আবার দেখুন"))}</button>
      </div>
    <h2 id={`${id}-title`} className="text-2xl font-semibold">{t(words("Request and permissions", "অনুরোধ ও অনুমতি"))}</h2>
    {loading && <p role="status">{t(words("Checking current access…", "বর্তমান অনুমতি যাচাই হচ্ছে…"))}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    {error && <div role="alert" className={styles.error}>{t(error === "uncertain" ? words("Action unconfirmed. Retry the same action with its preserved retry key.", "কাজটি নিশ্চিত হয়নি। একই চাবি দিয়ে একই কাজ আবার চেষ্টা করুন।") : error === "rejected" ? words("This action was rejected or the request changed. Refresh and review before continuing.", "কাজটি গ্রহণ করা হয়নি অথবা অনুরোধ বদলেছে। আবার এনে পর্যালোচনা করুন।") : words("Current access could not be verified. The request may have expired, been revoked or closed, or the connection may be unavailable.", "বর্তমান অনুমতি নিশ্চিত হয়নি। মেয়াদ শেষ, অনুমতি প্রত্যাহার, অনুরোধ বন্ধ অথবা সংযোগ বিচ্ছিন্ন হতে পারে।"))}</div>}
    {pending && !busy && <button type="button" className="pro-btn pro-btn-primary" onClick={() => void perform(pending)}>{t(words("Retry the same action", "একই কাজ আবার চেষ্টা করুন"))}</button>}
    {provider && r && policy && !active && <p role="status" className={styles.notice}>{t(words("Current permission is no longer active. Request text and shared fields are hidden. Refresh to verify access.", "বর্তমান অনুমতি আর কার্যকর নেই। অনুরোধের লেখা ও শেয়ার করা তথ্য লুকানো হয়েছে। প্রবেশাধিকার যাচাই করতে রিফ্রেশ করুন।"))}</p>}
    {r && detail && (!provider || !policy || active) && <>
      <BondhonRequestTracker request={r} events={events} historyUnavailable={historyUnavailable} />
      <BondRing active={active} provider={provider}
        recipientLabel={recipientName || t(provider ? words("Your simulated provider account", "আপনার সিমুলেটেড সেবাদাতার অ্যাকাউন্ট") : words("Your chosen simulated recipient", "আপনার বাছাই করা সিমুলেটেড প্রাপক"))}
        recordCount={provider && "consentedRecords" in r ? r.consentedRecords.length : detail.grants.length} />
      <div className={styles.panel}>
        <p>
      <strong>{t(statusNames[r.status])}</strong>
      </p>
        <p className={styles.meta}>{t(words("Simulated coordination · synthetic data", "সিমুলেটেড সমন্বয় · নমুনা তথ্য"))} · {new Date(r.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
        {"purpose" in r && <p>
      <strong>{t(words("Purpose", "উদ্দেশ্য"))}</strong> {r.purpose}</p>}
        <p className="whitespace-pre-wrap">{r.message}</p>
        <ReadAloudButton text={r.message} language={policy?.language ?? language} label={t(words("Read request aloud", "অনুরোধ পড়ে শোনান"))} />
        {policy ? <div className={styles.notice}>
          <p>
      <strong>{t(r.status === "closed" ? words("Request closed. Provider access ended.", "অনুরোধ বন্ধ। সেবাদাতার প্রবেশ শেষ।") : accessState === "revoked" ? words("Permission revoked", "অনুমতি প্রত্যাহার হয়েছে") : accessState === "expired" ? words("Permission expired", "অনুমতির মেয়াদ শেষ") : accessState === "scheduled" ? words("Record permission has not started", "রেকর্ড দেখার অনুমতি এখনো শুরু হয়নি") : words("Permission active", "অনুমতি কার্যকর"))}</strong>
      </p>
          <p>{t(words("Expires", "মেয়াদ শেষ"))} {new Date(policy.expiresAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
          <p>{t(policy.allowReplies ? words("View and scoped messages approved", "দেখা ও এই উদ্দেশ্যে বার্তার অনুমতি আছে") : words("View only", "শুধু দেখার অনুমতি"))}</p>
          {policy.accommodations.length > 0 && <ul>{policy.accommodations.map(key => <li key={key}>{t(accommodations[key])}</li>)}</ul>}
          <p>{t(words("Consent receipt version", "সম্মতির রসিদের সংস্করণ"))} {policy.version} · {new Date(policy.approvedAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
        </div> : <p>{t(words("This earlier request has no request-bound permission receipt. Close or revoke it and create a reviewed request to use follow-up.", "এই পুরোনো অনুরোধে অনুরোধভিত্তিক সম্মতির রসিদ নেই। বন্ধ বা প্রত্যাহার করে পর্যালোচিত নতুন অনুরোধ তৈরি করুন।"))}</p>}
        {!provider && detail.grants.length > 0 && <details>
      <summary className="pro-btn pro-btn-secondary">{t(words("Exact record permissions", "রেকর্ডের নির্দিষ্ট অনুমতি"))}</summary>
      <ul className={styles.list}>{detail.grants.map(grant => <li className={styles.record} key={grant.id}>{t(recordNames[grant.record.type])} · {grant.record.fields.map(field => t(fieldNames[field] ?? words(field, field))).join(" · ")}
        <p>{t(words("Starts", "শুরু"))} <time dateTime={grant.startsAt}>{new Date(grant.startsAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</time></p>
        <p>{t(words("Ends", "শেষ"))} <time dateTime={grant.expiresAt}>{new Date(grant.expiresAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</time></p>
        <p>{t(grant.revokedAt ? words("Revoked", "প্রত্যাহার হয়েছে") : Date.parse(grant.expiresAt) <= now ? words("Expired", "মেয়াদ শেষ") : Date.parse(grant.startsAt) > now ? words("Not started", "এখনো শুরু হয়নি") : active ? words("Active for this request", "এই অনুরোধে কার্যকর") : words("No current request access", "এই অনুরোধে বর্তমান প্রবেশাধিকার নেই"))}</p>
        </li>)}</ul>
      </details>}
        {provider && "consentedRecords" in r && r.consentedRecords.map(record => <div className={styles.record} key={record.id}>
      <h3>{t(recordNames[record.type])}</h3>
      <dl className={styles.values}>{Object.entries(record.fields).map(([field, value]) => <div key={field}>
      <dt>{t(fieldNames[field] ?? words(field, field))}</dt>
      <dd>{displayValue(value)}</dd>
      </div>)}</dl>
      </div>)}
        <div className={styles.actions}>
          {provider && r.status === "delivered" && <button className="pro-btn pro-btn-primary" disabled={busy || !!pending} onClick={() => mutate("acknowledge")}>{t(words("Acknowledge simulated request", "সিমুলেটেড অনুরোধ গ্রহণ করুন"))}</button>}
          {!provider && state !== "revoked" && <button className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={() => setConfirmation("revoke")}>{t(words("Revoke future access", "ভবিষ্যতের অনুমতি প্রত্যাহার করুন"))}</button>}
          {r.status !== "closed" && <button className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={() => setConfirmation("close")}>{t(words("Close request", "অনুরোধ বন্ধ করুন"))}</button>}
        </div>
        {confirmation && <RevokeDialog action={confirmation} busy={busy} onConfirm={() => mutate(confirmation)} onCancel={() => setConfirmation(null)} />}
      </div>
      <section className={styles.panel} aria-labelledby={`${id}-messages`}>
        <h3 id={`${id}-messages`}>{t(words("Messages about this request", "এই অনুরোধের বার্তা"))}</h3>
        <p>{t(words("All provider messages are simulated. A new purpose, recipient or record category needs a new reviewed request.", "সেবাদাতার সব বার্তা সিমুলেটেড। নতুন উদ্দেশ্য, প্রাপক বা ধরনের তথ্যের জন্য নতুন পর্যালোচিত অনুরোধ দরকার।"))}</p>
        {!detail.messages.length && <p>{t(words("No replies recorded.", "কোনো উত্তর লিপিবদ্ধ হয়নি।"))}</p>}
        <ol className={styles.list}>{detail.messages.map(item => <li className={styles.message} key={item.id}>
      <strong>{t(item.sender === "mother" ? words("Mother", "মা") : words("Simulated provider", "সিমুলেটেড সেবাদাতা"))}</strong>
      <p className={styles.meta}>{new Date(item.sentAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
      <p>{item.message}</p>
      </li>)}</ol>
        {canWrite && <form onSubmit={send} className={styles.choices}>
          <label className={styles.field}>
      <span>{t(words("Follow-up message", "পরবর্তী বার্তা"))}</span>
      <textarea className="pro-input" rows={3} value={text} required maxLength={2000} disabled={busy || !!pending || loading} onChange={event => { setText(event.target.value); setApproved(false); }} />
      </label>
          <label className={styles.check}>
      <input type="checkbox" checked={approved} disabled={busy || !!pending || loading} onChange={event => setApproved(event.target.checked)} />
      <span>{t(words("I reviewed this message. It stays within the approved purpose and information scope.", "এই বার্তা পর্যালোচনা করেছি। এটি অনুমোদিত উদ্দেশ্য ও তথ্যের সীমার মধ্যে আছে।"))}</span>
      </label>
          <button className="pro-btn pro-btn-primary" disabled={busy || !!pending || loading || !approved}>{t(words("Send reviewed message", "পর্যালোচিত বার্তা পাঠান"))}</button>
        </form>}
      </section>
      {!provider && <details className={styles.panel}>
      <summary className="pro-btn pro-btn-secondary">{t(words("Access and action history", "প্রবেশ ও কাজের ইতিহাস"))}</summary>
      <p>{t(words("Latest 100 recorded actions. This history records requests and actions; it does not track screenshots or every field a person read.", "সর্বশেষ লিপিবদ্ধ ১০০টি কাজ। এই ইতিহাস অনুরোধ ও কাজ দেখায়; স্ক্রিনশট বা কোন তথ্য কেউ পড়েছেন তার প্রতিটি ঘটনা ধরে না।"))}</p>
      <ol className={styles.list}>{detail.audit.map(item => <li key={item.id}>
      <strong>{t(item.actor === "mother" ? words("Mother", "মা") : words("Simulated provider", "সিমুলেটেড সেবাদাতা"))}</strong> · <span lang="en">{item.action.replaceAll("request.", "").replaceAll("consent.", "consent ").replaceAll("_", " ")}</span>
      <br />{new Date(item.occurredAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}{item.policyVersion && <> · {t(words("Permission version", "অনুমতির সংস্করণ"))} {item.policyVersion}</>}</li>)}</ol>
      </details>}
    </>}
  </section>;
}
