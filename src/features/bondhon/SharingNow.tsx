"use client";
import { useEffect, useId, useRef, useState, type SyntheticEvent } from "react";
import { Ban, Check, Clock, Eye, Lock, Pause, Plus, RefreshCw, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { bondhonDetailSchema, type BondhonDetail } from "@/lib/contracts/bondhon-detail";
import { careRecipientsSchema, type SupportRequest } from "@/lib/contracts/bondhon";
import { careFetch } from "./client";
import { fieldNames, recordNames, statusNames, words } from "./bondhon-copy";
import { accessState, digits, formatLeft, fractionLeft, isOpenAccess, msLeft, ringNodes, sharingOverview, splitSharing, stopRequests, summariseStop, type StopResult } from "./bondhon-view";
import { RevokeDialog } from "./RevokeDialog";
import { SharingRing } from "./SharingRing";
import styles from "./bondhon.module.css";

function SeeList({ account, id, now }: { account: string; id: string; now: number }) {
  const { t } = useLanguage();
  const [detail, setDetail] = useState<BondhonDetail | "loading" | "error" | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => { const current = controller; return () => current.current?.abort(); }, []);
  function open(event: SyntheticEvent<HTMLDetailsElement>) {
    controller.current?.abort();
    if (!event.currentTarget.open) { setDetail(null); return; }
    const request = new AbortController();
    controller.current = request;
    setDetail("loading");
    void careFetch(`/api/care-requests/${id}/coordination`, bondhonDetailSchema, account, { signal: request.signal })
      .then(value => { if (!request.signal.aborted) setDetail(value); }, () => { if (!request.signal.aborted) setDetail("error"); });
  }
  const snapshot = typeof detail === "object" ? detail : null;
  const verified = !!snapshot && snapshot.request.id === id && isOpenAccess(accessState(snapshot.request, now)) && snapshot.grants.every(g =>
    !g.revokedAt && Date.parse(g.startsAt) <= now && Date.parse(g.expiresAt) > now);
  return <details onToggle={open}>
    <summary className="pro-btn pro-btn-secondary"><Eye size={18} aria-hidden="true" /> {t(words("What can they see?", "তিনি কী দেখতে পাবেন?"))}</summary>
    {detail === "loading" && <p role="status">{t(words("Checking…", "যাচাই হচ্ছে…"))}</p>}
    {detail === "error" && <p role="alert">{t(words("Could not verify access. Close and reopen this section to retry.", "প্রবেশাধিকার নিশ্চিত হয়নি। আবার চেষ্টা করতে এই অংশ বন্ধ করে খুলুন।"))}</p>}
    {snapshot && (!verified ? <p>{t(words("Current access is not confirmed. Open the request to review its permission history.", "বর্তমান প্রবেশ নিশ্চিত নয়। অনুমতির ইতিহাস দেখতে অনুরোধ খুলুন।"))}</p> : <>
      <p>{t(words("Message, purpose, communication preference and selected access requests. Only the health-record fields listed below are included.", "বার্তা, উদ্দেশ্য, যোগাযোগের পছন্দ ও বাছাই করা সুবিধার অনুরোধ। নিচে দেখানো স্বাস্থ্য রেকর্ডের তথ্যই অন্তর্ভুক্ত।"))}</p>
      {snapshot.grants.length ? <ul className={styles.chips}>{snapshot.grants.map(g => <li className={styles.chip} key={g.id}>{t(recordNames[g.record.type])}: {g.record.fields.map(f => t(fieldNames[f] ?? words(f, f))).join(", ")}</li>)}</ul> : <p>{t(words("No health-record fields selected.", "স্বাস্থ্য রেকর্ডের কোনো তথ্য বাছা হয়নি।"))}</p>}
    </>)}
  </details>;
}

export function SharingNow({ account, items, now, ready, complete, onOpen, onNew, onChanged }: {
  account: string; items: readonly SupportRequest[]; now: number; ready: boolean; complete: boolean;
  onOpen: (id: string) => void; onNew: () => void; onChanged: () => void;
}) {
  const { language, t } = useLanguage();
  const id = useId();
  const [names, setNames] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<{ ids: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<StopResult[] | null>(null);
  const [outcomeNames, setOutcomeNames] = useState<Record<string, string>>({});
  const keys = useRef<Record<string, string>>({});
  const running = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    void careFetch("/api/care-recipients", careRecipientsSchema, account, { signal: controller.signal })
      .then(list => { if (!controller.signal.aborted) setNames(Object.fromEntries(list.map(person => [person.id, person.displayName]))); }, () => {});
    return () => controller.abort();
  }, [account]);
  const { active } = splitSharing(items, now);
  const nodes = ringNodes(active, names, now);
  const who = (item: SupportRequest) => names[item.recipientUserId] ?? t(words("Your chosen simulated recipient", "আপনার বাছাই করা সিমুলেটেড প্রাপক"));
  const count = active.length;
  const peopleRequests = new Map<string, SupportRequest[]>();
  for (const item of active) peopleRequests.set(item.recipientUserId, [...(peopleRequests.get(item.recipientUserId) ?? []), item]);
  const { people, unchecked } = sharingOverview(items, now, ready, complete);
  const heading = !ready ? t(words("Checking your sharing…", "আপনার শেয়ার যাচাই হচ্ছে…"))
    : !count && (!complete || unchecked) ? t(words("More sharing needs review", "আরও শেয়ার পর্যালোচনা দরকার"))
    : count === 0 ? t(words("Nothing is shared through these requests right now.", "এই অনুরোধগুলোতে এখন কিছুই শেয়ার করা নেই।"))
    : t(words(`Sharing with ${!complete ? "at least " : ""}${people} ${people === 1 ? "person" : "people"}.`, `${!complete ? "অন্তত " : ""}${digits(people, "bn")} জনের সঙ্গে শেয়ার চলছে।`));
  async function stop(ids: string[]) {
    if (running.current) return;
    running.current = true; setBusy(true);
    const labels: Record<string, string> = {};
    for (const requestId of ids) {
      const item = items.find(entry => entry.id === requestId);
      labels[requestId] = item ? `${who(item)} · ${item.purpose}` : outcomeNames[requestId] ?? t(words("Request", "অনুরোধ"));
    }
    setOutcomeNames(previous => ({ ...previous, ...labels }));
    try {
      const results = await stopRequests(ids, requestId => keys.current[requestId] ??= crypto.randomUUID(), {
        revoke: async (requestId, key) => (await careFetch(`/api/care-requests/${requestId}/revoke`, bondhonDetailSchema, account, { post: true, key })).request,
        read: async requestId => (await careFetch(`/api/care-requests/${requestId}/coordination`, bondhonDetailSchema, account)).request,
      });
      setOutcome(previous => [...(previous ?? []).filter(old => !ids.includes(old.id)), ...results]);
      setDialog(null); onChanged();
    } finally { running.current = false; setBusy(false); }
  }
  const summary = summariseStop(outcome ?? []);
  return <section className={`${styles.workspace} ${styles.sharingHome}`} aria-labelledby={`${id}-now`}>
    <div className={styles.hero}>
      <SharingRing nodes={ready ? nodes : []} label={heading} />
      <h2 id={`${id}-now`}>{heading}</h2>
      <p>{t(words("You choose the person, information and time. A ring shows that person’s next ending permission. These controls cover the listed requests.", "প্রাপক, তথ্য ও সময় আপনিই বাছবেন। বৃত্ত একজনের পরবর্তী শেষ হওয়া অনুমতি দেখায়। এই নিয়ন্ত্রণ দেখানো অনুরোধগুলোর জন্য।"))}</p>
      {ready && !complete && <p className={styles.notice}>{t(words("More requests remain to load. This is not your complete sharing history.", "আরও অনুরোধ আনা বাকি। এটি আপনার সম্পূর্ণ শেয়ারের ইতিহাস নয়।"))}</p>}
      {ready && unchecked && <p className={styles.notice}>{t(words("Older or unconfirmed permissions need review under Earlier requests. Do not assume that access has ended.", "আগের বা অনিশ্চিত অনুমতি ‘আগের অনুরোধ’ অংশে পর্যালোচনা করুন। প্রবেশ বন্ধ হয়েছে ধরে নেবেন না।"))}</p>}
      {ready && people > 3 && <p>{t(words(`The diagram shows 3 of ${people} people. All loaded requests are listed below.`, `চিত্রে ${digits(people, "bn")} জনের মধ্যে ৩ জন আছেন। আনা সব অনুরোধ নিচে আছে।`))}</p>}
    </div>
    <div className={styles.sharingContent}>
    <button type="button" className="pro-btn pro-btn-primary" disabled={busy} onClick={onNew}><Plus size={18} aria-hidden="true" /> {t(words("Ask for help or prepare a visit", "সহায়তা চান বা সাক্ষাতের প্রস্তুতি নিন"))}</button>
    {ready && [...peopleRequests.entries()].map(([personId, requests]) => {
      const person = who(requests[0]);
      return <article key={personId} className={styles.shareCard} aria-label={person}>
        <div className={styles.cardHead}>
          <span aria-hidden="true" className={styles.avatar}>{[...person][0]?.toUpperCase()}</span>
          <div><h3>{person}</h3><p className={styles.meta}>{t(words(`${requests.length} ${requests.length === 1 ? "active request" : "active requests"}`, `${digits(requests.length, "bn")}টি কার্যকর অনুরোধ`))}</p></div>
          <span className={`${styles.chip} ${styles.chipSim}`}>{t(words("Simulated", "সিমুলেটেড"))}</span>
        </div>
        {requests.map(item => {
          const c = item.coordination;
          if (!c) return null;
          const soon = accessState(item, now) === "ending_soon";
          return <section key={item.id} className={styles.requestInset} aria-label={item.purpose}>
            <h4>{item.purpose}</h4>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles.chipOk}`}><Check size={14} aria-hidden="true" /> {t(statusNames[item.status])}</span>
              <span className={`${styles.chip} ${soon ? styles.chipSoon : ""}`}><Clock size={14} aria-hidden="true" /> {formatLeft(msLeft(c.expiresAt, now), language)}</span>
            </div>
            <div aria-hidden="true" className={`${styles.meter} ${soon ? styles.meterSoon : ""}`}><span style={{ width: `${Math.round(fractionLeft(c, now) * 100)}%` }} /></div>
            <SeeList account={account} id={item.id} now={now} />
            <div className={styles.rowActions}>
              <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => onOpen(item.id)}>{t(words("Open request", "অনুরোধ খুলুন"))}</button>
              <button type="button" className={`pro-btn pro-btn-secondary ${styles.danger}`} disabled={busy} onClick={() => setDialog({ ids: [item.id] })}><Ban size={18} aria-hidden="true" /> {t(words("Stop this request’s sharing", "এই অনুরোধের শেয়ার বন্ধ করুন"))}</button>
            </div>
          </section>;
        })}
        {requests.length > 1 && <button type="button" className={`pro-btn pro-btn-secondary ${styles.danger}`} disabled={busy} onClick={() => setDialog({ ids: requests.map(item => item.id) })}>{t(words("Stop this person’s listed sharing", "এই ব্যক্তির দেখানো শেয়ার বন্ধ করুন"))}</button>}
      </article>;
    })}
    {ready && count > 1 && <div className={styles.dangerPanel}>
      <button type="button" className={`pro-btn pro-btn-secondary ${styles.danger}`} disabled={busy} onClick={() => setDialog({ ids: active.map(item => item.id) })}><Pause size={18} aria-hidden="true" /> {t(words(`Stop sharing for listed requests (${count})`, `দেখানো অনুরোধের শেয়ার বন্ধ করুন (${digits(count, "bn")})`))}</button>
      <p>{t(words("Other requests or record grants are not changed. Previously seen information cannot be recalled.", "অন্য অনুরোধ বা রেকর্ডের অনুমতি বদলাবে না। আগে দেখা তথ্য ফিরিয়ে নেওয়া যায় না।"))}</p>
    </div>}
    {outcome && <div role="status" className={styles.shareCard}>
      <h3>{t(words(`Access ended for ${summary.stopped + summary.ended} of ${summary.total} requests`, `${digits(summary.total, "bn")}টি অনুরোধের মধ্যে ${digits(summary.stopped + summary.ended, "bn")}টির প্রবেশ বন্ধ নিশ্চিত`))}</h3>
      <ul className={styles.outcome}>{outcome.map(result => <li key={result.id}>
        <strong>{outcomeNames[result.id]}</strong>
        <span>{result.state === "stopped" || result.state === "ended" ? <Check size={18} aria-hidden="true" /> : <TriangleAlert size={18} aria-hidden="true" />} {t(result.state === "stopped" ? words("Sharing stopped by server confirmation", "সার্ভার শেয়ার বন্ধ নিশ্চিত করেছে") : result.state === "ended" ? words("Request closed; access ended", "অনুরোধ বন্ধ; প্রবেশ শেষ") : result.state === "active" ? words("Server has not confirmed withdrawal", "সার্ভার প্রত্যাহার নিশ্চিত করেনি") : words("Not confirmed; assume access may continue", "নিশ্চিত নয়; প্রবেশ থাকতে পারে ধরে নিন"))}</span>
        {(result.state === "active" || result.state === "unknown") && <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void stop([result.id])}><RefreshCw size={18} aria-hidden="true" /> {t(words("Try again", "আবার চেষ্টা করুন"))}</button>}
      </li>)}</ul>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => setOutcome(null)}>{t(words("Dismiss result", "ফলাফল বন্ধ করুন"))}</button>
    </div>}
    </div>
    <div className={styles.privateBox}><Lock size={22} aria-hidden="true" /><p><strong>{t(words("Never shareable here", "এখানে কখনও শেয়ার হয় না"))}</strong><br />{t(words("Diary · AI conversations · Raw files", "ডায়েরি · এআই কথোপকথন · মূল ফাইল"))}</p></div>
    {dialog && <RevokeDialog action={dialog.ids.length > 1 ? "revoke_all" : "revoke"} busy={busy} onConfirm={() => void stop(dialog.ids)} onCancel={() => setDialog(null)} />}
  </section>;
}
