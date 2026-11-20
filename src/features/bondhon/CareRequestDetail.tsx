"use client";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Clock, Printer, RefreshCw, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { ReadAloudButton } from "@/features/adapt";
import { bondhonDetailSchema, type BondhonDetail } from "@/lib/contracts/bondhon-detail";
import { providerRequestSchema, supportRequestSchema, careRecipientsSchema, supportRequestEventSummarySchema, type SupportRequestEventSummary } from "@/lib/contracts/bondhon";
import { pageSchema } from "@/lib/contracts/transport";
import { SharingRing } from "./SharingRing";
import { RevokeDialog } from "./RevokeDialog";
import { BondhonRequestTracker } from "./BondhonRequestTracker";
import { careFetch, CareError } from "./client";
import { accommodations, displayValue, fieldNames, recordNames, statusNames, words } from "./bondhon-copy";
import { accessState as accessOf, accessWords, auditTimeline, digits, isOpenAccess, closestHours, formatLeft, formatWhen, fractionLeft, msLeft, nextStep, providerOpens, ringNodes } from "./bondhon-view";
import type { FormInitial } from "./CareRequestForm";
import styles from "./bondhon.module.css";

type Action = { path: string; key: string; body?: unknown; detail: boolean };
export function CareRequestDetail({ account, requestId, provider, onBack, onShareAgain }: {
  account: string; requestId: string; provider: boolean; onBack: () => void; onShareAgain?: (initial: FormInitial) => void;
}) {
  const { language, t } = useLanguage();
  const id = useId();
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const receipt = useRef<HTMLElement>(null);
  const printCleanup = useRef<(() => void) | null>(null);
  useEffect(() => { const current = printCleanup; return () => current.current?.(); }, []);
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
  const poll = useRef(true); // false once nothing can change, so we stop writing read events to the history
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
      setDetail(value); setError(previous => previous === "load" ? "" : previous); setNow(Date.now());
      setEvents(eventResult.status === "fulfilled" ? eventResult.value.items : []);
      setHistoryUnavailable(eventResult.status !== "fulfilled" || eventResult.value.nextCursor !== null);
    } catch {
      if (current !== loadCounter.current) return;
      setDetail(null); setEvents([]); setApproved(false); setError("load");
    } finally { if (current === loadCounter.current) setLoading(false); }
  }, [account, requestId, provider]);
  useEffect(() => {
    const counter = loadCounter;
    const initial = window.setTimeout(() => { detailHeading.current?.focus(); void load(); }, 0);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const timer = window.setInterval(() => { setNow(Date.now()); if (!running.current && !document.hidden && poll.current) void load(); }, 30_000);
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
  const recordUnknown = detail?.grants.some(grant => !Number.isFinite(Date.parse(grant.startsAt)) || !Number.isFinite(Date.parse(grant.expiresAt)));
  const requestAccess = r ? accessOf(r, now) : "legacy";
  const state = requestAccess === "ending_soon" ? "active" : requestAccess;
  const accessState = recordRevoked ? "revoked" : recordExpired ? "expired" : recordNotStarted ? "scheduled" : recordUnknown ? "unknown" : state;
  const active = !!r && r.status !== "closed" && accessState === "active";
  const access = r?.status === "closed" ? "closed" : accessState === "active" ? requestAccess : accessState;
  useEffect(() => { poll.current = provider || !r || isOpenAccess(access) || access === "unknown" || access === "scheduled"; });
  const step = nextStep(r?.status ?? "submitted", access);
  const left = policy ? msLeft(policy.expiresAt, now) : 0;
  const soon = access === "ending_soon";
  const timeline = detail ? auditTimeline(detail.audit, r?.createdAt) : [];
  const opens = detail ? providerOpens(detail.audit) : { count: 0, lastAt: null, atLeast: false };
  const receiverId = r && "recipientUserId" in r ? r.recipientUserId : "";
  const person = recipientName || t(words("Your chosen simulated recipient", "আপনার বাছাই করা সিমুলেটেড প্রাপক"));
  const nodes = !provider && r && active ? ringNodes([{ id: r.id, status: r.status, recipientUserId: receiverId, createdAt: r.createdAt, coordination: policy }], { [receiverId]: recipientName }, now) : [];
  function printReceipt() {
    if (!receipt.current) return;
    printCleanup.current?.();
    const isolated = document.createElement("div");
    isolated.className = styles.printRoot;
    isolated.dataset.bondhonPrintRoot = "true";
    isolated.lang = language;
    isolated.appendChild(receipt.current.cloneNode(true));
    isolated.querySelectorAll("button").forEach(button => button.remove());
    document.body.appendChild(isolated);
    document.body.dataset.print = "receipt";
    const cleanup = () => {
      isolated.remove(); delete document.body.dataset.print;
      window.removeEventListener("afterprint", cleanup);
      printCleanup.current = null;
    };
    printCleanup.current = cleanup;
    window.addEventListener("afterprint", cleanup, { once: true });
    try { window.print(); } catch { cleanup(); }
  }
  function shareAgain() {
    if (!r || !policy || !("recipientUserId" in r)) return;
    onShareAgain?.({ recipient: r.recipientUserId, purpose: r.purpose, method: r.method, hours: closestHours(Date.parse(policy.expiresAt) - Date.parse(policy.approvedAt)),
      allowReplies: policy.allowReplies, needs: [...policy.accommodations] });
  }
  const canWrite = active && policy?.allowReplies && (!provider || r?.status === "acknowledged" || r?.status === "responded");
  return <section className={styles.workspace} aria-labelledby={`${id}-title`}>
    <div className={styles.actions}>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={onBack}>{t(words("Back to requests", "অনুরোধের তালিকায় ফিরুন"))}</button>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load()}>{t(words("Refresh current access", "বর্তমান অনুমতি আবার দেখুন"))}</button>
      </div>
    <h2 ref={detailHeading} tabIndex={-1} id={`${id}-title`} className="text-2xl font-semibold">{t(words("Request and permissions", "অনুরোধ ও অনুমতি"))}</h2>
    {loading && <p role="status">{t(words("Checking current access…", "বর্তমান অনুমতি যাচাই হচ্ছে…"))}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    {error && <div role="alert" className={styles.error}>{t(error === "uncertain" ? words("Action unconfirmed. Retry the same action with its preserved retry key.", "কাজটি নিশ্চিত হয়নি। একই চাবি দিয়ে একই কাজ আবার চেষ্টা করুন।") : error === "rejected" ? words("This action was rejected or the request changed. Refresh and review before continuing.", "কাজটি গ্রহণ করা হয়নি অথবা অনুরোধ বদলেছে। আবার এনে পর্যালোচনা করুন।") : words("Current access could not be verified. The request may have expired, been revoked or closed, or the connection may be unavailable.", "বর্তমান অনুমতি নিশ্চিত হয়নি। মেয়াদ শেষ, অনুমতি প্রত্যাহার, অনুরোধ বন্ধ অথবা সংযোগ বিচ্ছিন্ন হতে পারে।"))}</div>}
    {pending && !busy && <button type="button" className="pro-btn pro-btn-primary" onClick={() => void perform(pending)}>{t(words("Retry the same action", "একই কাজ আবার চেষ্টা করুন"))}</button>}
    {provider && r && policy && !active && <p role="status" className={styles.notice}>{t(words("Current permission is no longer active. Request text and shared fields are hidden. Refresh to verify access.", "বর্তমান অনুমতি আর কার্যকর নেই। অনুরোধের লেখা ও শেয়ার করা তথ্য লুকানো হয়েছে। প্রবেশাধিকার যাচাই করতে রিফ্রেশ করুন।"))}</p>}
    {r && detail && (!provider || !policy || active) && <>
      {!provider && policy && <section className={styles.summary} aria-labelledby={`${id}-summary`}>
        <h3 id={`${id}-summary`} className={styles.statusWord}>{t(statusNames[r.status])}</h3>
        <p>{t(step.meaning)}</p>
        <p><strong>{t(words("Next:", "এরপর:"))}</strong> {t(step.next)}</p>
        {(access === "active" || soon) && <>
          <div aria-hidden="true" className={`${styles.meter} ${soon ? styles.meterSoon : ""}`}><span style={{ width: `${Math.round(fractionLeft(policy, now) * 100)}%` }} /></div>
          <p>{soon ? <TriangleAlert size={18} aria-hidden="true" /> : <Clock size={18} aria-hidden="true" />} <strong>{formatLeft(left, language)}</strong> · {formatWhen(policy.expiresAt, language, now)}</p>
        </>}
        <button type="button" className="pro-btn pro-btn-secondary justify-self-start" disabled={busy || loading} onClick={() => void load()}><RefreshCw size={18} aria-hidden="true" /> {t(words("Refresh", "আবার দেখুন"))}</button>
      </section>}
      {provider && policy && <div className={styles.banner} role="status">
        <Clock size={22} aria-hidden="true" />
        <div><strong>{t(words("Your access to this request:", "এই অনুরোধে আপনার প্রবেশ:"))} {formatLeft(left, language)}</strong>
          <p>{t(words("When it ends, this screen empties itself and the mother’s information is hidden.", "শেষ হলে এই পাতা নিজে থেকে খালি হবে এবং মায়ের তথ্য লুকানো হবে।"))}</p></div>
      </div>}
      {provider && !!policy?.accommodations.length && <section className={styles.panel} aria-labelledby={`${id}-needs`}>
        <h3 id={`${id}-needs`}>{t(words("Access requests from the mother", "মায়ের সুবিধার অনুরোধ"))}</h3>
        <ul className={styles.chips}>{policy.accommodations.map(key => <li key={key} className={styles.chip}>{t(accommodations[key])}</li>)}</ul>
        <p className={styles.meta}>{t(words("These are requests. Confirm separately whether you can meet them.", "এগুলো অনুরোধ। পূরণ করা সম্ভব কি না আলাদাভাবে নিশ্চিত করুন।"))}</p>
      </section>}
      {!provider && <nav className={styles.jump} aria-label={t(words("On this page", "এই পাতায়"))}>
        <a href={`#${id}-progress`}>{t(words("Progress", "অগ্রগতি"))}</a><a href={`#${id}-sharing`}>{t(words("Sharing", "শেয়ার"))}</a>
        <a href={`#${id}-messages`}>{t(words("Messages", "বার্তা"))}</a><a href={`#${id}-history`}>{t(words("History", "ইতিহাস"))}</a>
      </nav>}
      <div id={`${id}-progress`} className={styles.anchor}><BondhonRequestTracker request={r} now={now} events={events} historyUnavailable={historyUnavailable} /></div>
      {!provider && <div className={styles.hero}>
        <SharingRing nodes={nodes} label={active ? `${person}: ${formatLeft(left, language)}` : t(words("Nothing is shared for this request now.", "এই অনুরোধে এখন কিছু শেয়ার হচ্ছে না।"))} />
        <p>{t(active ? words(`${person} can see what is listed under “Who can see what”, until the time shown.`, `${person} “কে কী দেখতে পারেন” অংশের তথ্য দেখতে পারবেন, দেখানো সময় পর্যন্ত।`) : words("Current access for this request is not active or could not be confirmed.", "এই অনুরোধে বর্তমান প্রবেশ কার্যকর নয় অথবা নিশ্চিত করা যায়নি।"))}</p>
      </div>}
      <div id={`${id}-sharing`} className={`${styles.panel} ${styles.anchor}`}>
        {!provider && <h3>{t(words("Who can see what", "কে কী দেখতে পারেন"))}</h3>}
        <p className={styles.meta}>{t(words("Simulated coordination · synthetic data", "সিমুলেটেড সমন্বয় · নমুনা তথ্য"))} · {formatWhen(r.createdAt, language, now)}</p>
        {"purpose" in r && <p>
      <strong>{t(words("Purpose", "উদ্দেশ্য"))}</strong> {r.purpose}</p>}
        <p className="whitespace-pre-wrap">{r.message}</p>
        <ReadAloudButton text={r.message} language={policy?.language ?? language} label={t(words("Read request aloud", "অনুরোধ পড়ে শোনান"))} />
        {policy ? <div className={styles.notice}>
          <p>
      <strong>{t(accessWords[access])}</strong>
      </p>
          <p>{t(words("Expires", "মেয়াদ শেষ"))} {formatWhen(policy.expiresAt, language, now)}</p>
          <p>{t(policy.allowReplies ? words("View and scoped messages approved", "দেখা ও এই উদ্দেশ্যে বার্তার অনুমতি আছে") : words("View only", "শুধু দেখার অনুমতি"))}</p>
          {policy.accommodations.length > 0 && <ul>{policy.accommodations.map(key => <li key={key}>{t(accommodations[key])}</li>)}</ul>}
          <p>{t(words("Consent receipt version", "সম্মতির রসিদের সংস্করণ"))} {policy.version} · {formatWhen(policy.approvedAt, language, now)}</p>
        </div> : <p>{t(words("This earlier request has no request-bound permission receipt. Close or revoke it and create a reviewed request to use follow-up.", "এই পুরোনো অনুরোধে অনুরোধভিত্তিক সম্মতির রসিদ নেই। বন্ধ বা প্রত্যাহার করে পর্যালোচিত নতুন অনুরোধ তৈরি করুন।"))}</p>}
        {!provider && detail.grants.length > 0 && <details>
      <summary className="pro-btn pro-btn-secondary">{t(words("Exact record permissions", "রেকর্ডের নির্দিষ্ট অনুমতি"))}</summary>
      <ul className={styles.list}>{detail.grants.map(grant => <li className={styles.record} key={grant.id}>{t(recordNames[grant.record.type])} · {grant.record.fields.map(field => t(fieldNames[field] ?? words(field, field))).join(" · ")}
        <p>{t(words("Starts", "শুরু"))} <time dateTime={grant.startsAt}>{formatWhen(grant.startsAt, language, now)}</time></p>
        <p>{t(words("Ends", "শেষ"))} <time dateTime={grant.expiresAt}>{formatWhen(grant.expiresAt, language, now)}</time></p>
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
        {provider && <div className={styles.privateBox}><p><strong>{t(words("Not shared with you", "আপনার সঙ্গে শেয়ার হয়নি"))}</strong><br />{t(words("Anything not listed above. To see more, the mother must send a new request.", "ওপরে যা নেই তা। আরও দেখতে হলে মাকে নতুন অনুরোধ পাঠাতে হবে।"))}</p></div>}
        <div className={styles.actions}>
          {provider && r.status === "delivered" && <button className="pro-btn pro-btn-primary" disabled={busy || !!pending} onClick={() => mutate("acknowledge")}>{t(words("Acknowledge simulated request", "সিমুলেটেড অনুরোধ গ্রহণ করুন"))}</button>}
          {!provider && state !== "revoked" && <button className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={() => setConfirmation("revoke")}>{t(words("Revoke future access", "ভবিষ্যতের অনুমতি প্রত্যাহার করুন"))}</button>}
          {r.status !== "closed" && <button className="pro-btn pro-btn-secondary" disabled={busy || !!pending} onClick={() => setConfirmation("close")}>{t(words("Close request", "অনুরোধ বন্ধ করুন"))}</button>}
        </div>
        {confirmation && <RevokeDialog action={confirmation} busy={busy} onConfirm={() => mutate(confirmation)} onCancel={() => setConfirmation(null)} />}
      </div>
      <section id={`${id}-messages`} className={`${styles.panel} ${styles.anchor}`} aria-labelledby={`${id}-messages-title`}>
        <h3 id={`${id}-messages-title`}>{t(words("Messages about this request", "এই অনুরোধের বার্তা"))}</h3>
        <p>{t(words("All provider messages are simulated. A new purpose, recipient or record category needs a new reviewed request.", "সেবাদাতার সব বার্তা সিমুলেটেড। নতুন উদ্দেশ্য, প্রাপক বা ধরনের তথ্যের জন্য নতুন পর্যালোচিত অনুরোধ দরকার।"))}</p>
        {!detail.messages.length && <p>{t(words("No replies recorded.", "কোনো উত্তর লিপিবদ্ধ হয়নি।"))}</p>}
        <ol className={styles.list}>{detail.messages.map(item => <li className={styles.message} key={item.id}>
      <strong>{t(item.sender === "mother" ? words("Mother", "মা") : words("Simulated provider", "সিমুলেটেড সেবাদাতা"))}</strong>
      <p className={styles.meta}>{formatWhen(item.sentAt, language, now)}</p>
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
      {!provider && <section id={`${id}-history`} className={`${styles.panel} ${styles.anchor}`} aria-labelledby={`${id}-history-title`}>
        <h3 id={`${id}-history-title`}>{t(words("History", "ইতিহাস"))}</h3>
        {opens.count > 0 && <p><strong>{t(words(`A provider account opened this request ${opens.atLeast ? "at least " : ""}${opens.count} ${opens.count === 1 ? "time" : "times"}.`, `একটি সেবাদাতা অ্যাকাউন্ট অনুরোধটি ${opens.atLeast ? "অন্তত " : ""}${digits(opens.count, "bn")} বার খুলেছে।`))}</strong> {opens.lastAt && <>{t(words("Last:", "শেষবার:"))} {formatWhen(opens.lastAt, language, now)}</>}</p>}
        {detail.audit.length >= 100 && <p className={styles.notice}>{t(words("Only the latest 100 recorded actions were returned. Older actions may be missing from this view.", "শুধু সর্বশেষ ১০০টি কাজ পাওয়া গেছে। আরও আগের কাজ এই অংশে নাও থাকতে পারে।"))}</p>}
        <ol className={styles.timeline}>{timeline.map(entry => <li key={entry.key}>
          <span aria-hidden="true" className={styles.dot}>{entry.who === "you" ? "•" : entry.who === "provider" ? "◦" : "·"}</span>
          <span><strong>{t(entry.text)}</strong><br /><time className={styles.meta} dateTime={entry.at}>{formatWhen(entry.at, language, now)}</time></span>
        </li>)}</ol>
        <p className={styles.meta}>{t(words("Recorded by the server. “Opened” means a provider account fetched the request, not that a person read it. Automatic provider refreshes may also be counted. Your own page refreshes are not listed. Latest 100 events.", "সার্ভার লিপিবদ্ধ করেছে। “খুলেছে” মানে একটি সেবাদাতা অ্যাকাউন্ট অনুরোধটি এনেছে, কেউ পড়েছেন তা নয়। আপনার নিজের পাতা নতুন করে আনা দেখানো হয় না। সর্বশেষ ১০০টি ঘটনা।"))}</p>
      </section>}
      {!provider && policy && <section ref={receipt} className={`${styles.receipt}`} aria-labelledby={`${id}-receipt`}>
        <h3 id={`${id}-receipt`}>{t(words("Sharing receipt", "শেয়ারের রসিদ"))}</h3>
        <dl>
          <div><dt>{t(words("Shared with", "যাঁর সঙ্গে"))}</dt><dd>{person} · {t(words("Simulated", "সিমুলেটেড"))}</dd></div>
          <div><dt>{t(words("Purpose", "উদ্দেশ্য"))}</dt><dd>{"purpose" in r ? r.purpose : ""}</dd></div>
          {"recipientUserId" in r && <div><dt>{t(words("Recipient account", "প্রাপকের অ্যাকাউন্ট"))}</dt><dd>{r.recipientUserId}</dd></div>}
          <div><dt>{t(words("Items", "তথ্য"))}</dt><dd>{detail.grants.length ? detail.grants.map(g => `${t(recordNames[g.record.type])}: ${g.record.fields.map(f => t(fieldNames[f] ?? words(f, f))).join(", ")}`).join("; ") : t(words("Message, purpose, communication preference and selected access requests", "বার্তা, উদ্দেশ্য, যোগাযোগের পছন্দ ও বাছাই করা সুবিধার অনুরোধ"))}</dd></div>
          <div><dt>{t(words("They can", "তিনি পারবেন"))}</dt><dd>{t(policy.allowReplies ? words("View · reply about this request", "দেখা · এই অনুরোধ নিয়ে উত্তর") : words("View only", "শুধু দেখা"))}</dd></div>
          <div><dt>{t(words("Approved", "অনুমোদন"))}</dt><dd>{formatWhen(policy.approvedAt, language, now)}</dd></div>
          <div><dt>{t(policy.revokedAt ? words("Stopped", "বন্ধ করা হয়েছে") : words("Ends", "শেষ"))}</dt><dd>{formatWhen(policy.revokedAt ?? policy.expiresAt, language, now)}</dd></div>
          <div><dt>{t(words("Receipt version", "রসিদের সংস্করণ"))}</dt><dd>{digits(policy.version, language)}</dd></div>
        </dl>
        <p>{t(words("Request ID", "অনুরোধের পরিচয়"))}: {r.id}</p>
        <p className={styles.meta}>{t(words("Demo record. This is not a legal consent form.", "ডেমো রেকর্ড। এটি আইনি সম্মতিপত্র নয়।"))}</p>
        <div className={styles.rowActions}>
          <button type="button" className="pro-btn pro-btn-secondary" onClick={printReceipt}><Printer size={18} aria-hidden="true" /> {t(words("Print or save as PDF", "প্রিন্ট বা পিডিএফ করুন"))}</button>
          <ReadAloudButton text={[t(words("Sharing receipt. Demo record.", "শেয়ারের রসিদ। ডেমো রেকর্ড।")), person, "purpose" in r ? r.purpose : "", r.message,
            ...detail.grants.map(grant => `${t(recordNames[grant.record.type])}: ${grant.record.fields.map(field => t(fieldNames[field] ?? words(field, field))).join(", ")}`),
            t(policy.allowReplies ? words("Replies allowed for this request", "এই অনুরোধে উত্তরের অনুমতি আছে") : words("View only", "শুধু দেখা")),
            t(words("Approved", "অনুমোদন")), formatWhen(policy.approvedAt, language, now), t(policy.revokedAt ? words("Stopped", "বন্ধ") : words("Ends", "শেষ")), formatWhen(policy.revokedAt ?? policy.expiresAt, language, now)].join(". ")} language={policy.language} label={t(words("Read it aloud", "পড়ে শোনান"))} />
        </div>
      </section>}
      {!provider && policy && onShareAgain && <section className={styles.shareCard}>
        <h3>{t(words("Need the same help again?", "আবার একই সহায়তা লাগবে?"))}</h3>
        <p>{t(words("Start a new request with the same person and purpose. You choose the message and information again.", "একই ব্যক্তি ও উদ্দেশ্যে নতুন অনুরোধ শুরু করুন। বার্তা ও তথ্য আবার আপনি বাছবেন।"))}</p>
        <button type="button" className="pro-btn pro-btn-primary justify-self-start" onClick={shareAgain}><RefreshCw size={18} aria-hidden="true" /> {t(words("Share again", "আবার শেয়ার করুন"))}</button>
      </section>}
    </>}
  </section>;
}
