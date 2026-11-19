"use client";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/i18n/use-language";
import { ReadAloudButton } from "@/features/adapt";
import { bondhonDetailSchema, type BondhonDetail } from "@/lib/contracts/bondhon-detail";
import { providerRequestSchema, supportRequestSchema } from "@/lib/contracts/bondhon";
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
      const value = await careFetch(`/api/care-requests/${requestId}/coordination`, bondhonDetailSchema, account);
      if (current !== loadCounter.current) return;
      setDetail(value); setError(""); setNow(Date.now());
    } catch {
      if (current !== loadCounter.current) return;
      setDetail(null); setError("load");
    } finally { if (current === loadCounter.current) setLoading(false); }
  }, [account, requestId]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => { setNow(Date.now()); if (!running.current && !document.hidden) void load(); }, 30_000);
    function visibility() {
      if (document.hidden && provider) { loadCounter.current++; setDetail(null); }
      if (!document.hidden && !running.current) void load();
    }
    document.addEventListener("visibilitychange", visibility);
    return () => { loadCounter.current++; window.clearTimeout(initial); window.clearInterval(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [load, provider]);
  async function perform(action: Action) {
    if (running.current) return;
    running.current = true; setBusy(true); setError(""); setNotice(""); setPending(action);
    // Discard a read started before this mutation, so it cannot restore stale content.
    loadCounter.current++;
    try {
      if (action.detail) {
        const value = await careFetch(action.path, bondhonDetailSchema, account, { post: true, body: action.body, key: action.key });
        setDetail(value);
      } else if (provider) {
        await careFetch(action.path, providerRequestSchema, account, { post: true, body: action.body, key: action.key });
      } else {
        await careFetch(action.path, supportRequestSchema, account, { post: true, body: action.body, key: action.key });
      }
      setPending(null); setConfirmation(null); setText(""); setApproved(false);
      setNotice(t(words("The server confirmed this action.", "সার্ভার কাজটি নিশ্চিত করেছে।")));
      await load();
    } catch (cause) {
      if (cause instanceof CareError && cause.status < 500) {
        setPending(null); setDetail(null); setError("rejected");
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
  const recordExpired = detail?.grants.some(grant => Date.parse(grant.expiresAt) <= now);
  const state = policy ? permissionState(policy.expiresAt, policy.revokedAt, now) : "legacy";
  const accessState = recordRevoked ? "revoked" : recordExpired ? "expired" : state;
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
    {r && detail && <>
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
      <strong>{t(r.status === "closed" ? words("Request closed. Provider access ended.", "অনুরোধ বন্ধ। সেবাদাতার প্রবেশ শেষ।") : accessState === "revoked" ? words("Permission revoked", "অনুমতি প্রত্যাহার হয়েছে") : accessState === "expired" ? words("Permission expired", "অনুমতির মেয়াদ শেষ") : words("Permission active", "অনুমতি কার্যকর"))}</strong>
      </p>
          <p>{t(words("Expires", "মেয়াদ শেষ"))} {new Date(policy.expiresAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
          <p>{t(policy.allowReplies ? words("View and scoped messages approved", "দেখা ও এই উদ্দেশ্যে বার্তার অনুমতি আছে") : words("View only", "শুধু দেখার অনুমতি"))}</p>
          {policy.accommodations.length > 0 && <ul>{policy.accommodations.map(key => <li key={key}>{t(accommodations[key])}</li>)}</ul>}
          <p>{t(words("Consent receipt version", "সম্মতির রসিদের সংস্করণ"))} {policy.version} · {new Date(policy.approvedAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</p>
        </div> : <p>{t(words("This earlier request has no request-bound permission receipt. Close or revoke it and create a reviewed request to use follow-up.", "এই পুরোনো অনুরোধে অনুরোধভিত্তিক সম্মতির রসিদ নেই। বন্ধ বা প্রত্যাহার করে পর্যালোচিত নতুন অনুরোধ তৈরি করুন।"))}</p>}
        {!provider && detail.grants.length > 0 && <details>
      <summary className="pro-btn pro-btn-secondary">{t(words("Exact record permissions", "রেকর্ডের নির্দিষ্ট অনুমতি"))}</summary>
      <ul className={styles.list}>{detail.grants.map(grant => <li className={styles.record} key={grant.id}>{t(recordNames[grant.record.type])} · {grant.record.fields.map(field => t(fieldNames[field] ?? words(field, field))).join(" · ")}</li>)}</ul>
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
        {confirmation && <div className={styles.notice} role="group" aria-label={t(words("Confirm your choice", "সিদ্ধান্ত নিশ্চিত করুন"))}>
          <p>{t(confirmation === "revoke" ? words("This stops future provider access and messages for this request. Previously seen information and the consent history remain.", "এতে এই অনুরোধে সেবাদাতার ভবিষ্যতের প্রবেশ ও বার্তা বন্ধ হবে। আগে দেখা তথ্য ও সম্মতির ইতিহাস থাকবে।") : words("Closing ends this request and its provider access. A new request needs a new sharing review.", "বন্ধ করলে এই অনুরোধ ও সেবাদাতার প্রবেশ শেষ হবে। নতুন অনুরোধে নতুন শেয়ার পর্যালোচনা লাগবে।"))}</p>
          <div className={styles.actions}>
      <button className="pro-btn pro-btn-primary" disabled={busy} onClick={() => mutate(confirmation)}>{t(words("Confirm", "নিশ্চিত করুন"))}</button>
      <button className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => setConfirmation(null)}>{t(words("Keep current settings", "বর্তমান সিদ্ধান্ত রাখুন"))}</button>
      </div>
        </div>}
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
      <textarea className="pro-input" rows={3} value={text} required maxLength={2000} disabled={busy || !!pending} onChange={event => { setText(event.target.value); setApproved(false); }} />
      </label>
          <label className={styles.check}>
      <input type="checkbox" checked={approved} disabled={busy || !!pending} onChange={event => setApproved(event.target.checked)} />
      <span>{t(words("I reviewed this message. It stays within the approved purpose and information scope.", "এই বার্তা পর্যালোচনা করেছি। এটি অনুমোদিত উদ্দেশ্য ও তথ্যের সীমার মধ্যে আছে।"))}</span>
      </label>
          <button className="pro-btn pro-btn-primary" disabled={busy || !!pending || !approved}>{t(words("Send reviewed message", "পর্যালোচিত বার্তা পাঠান"))}</button>
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
