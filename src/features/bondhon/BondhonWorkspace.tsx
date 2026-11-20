"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BondhonGuide } from "./BondhonGuide";
import { useBondhonPageGuard } from "./use-bondhon-page-guard";
import { Clock, MessageSquare, PersonStanding, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";
import { providerRequestSummarySchema, supportRequestSchema, type ProviderRequestSummary, type SupportRequest } from "@/lib/contracts/bondhon";
import { pageSchema } from "@/lib/contracts/transport";
import { CareRequestForm, type FormInitial } from "./CareRequestForm";
import { CareRequestDetail } from "./CareRequestDetail";
import { RevokeDialog } from "./RevokeDialog";
import { SharingNow } from "./SharingNow";
import { careFetch } from "./client";
import { accommodations, statusNames, words } from "./bondhon-copy";
import { accessState, accessWords, digits, formatLeft, formatWhen, msLeft, queueView, splitSharing, type QueueFilter } from "./bondhon-view";
import styles from "./bondhon.module.css";
import { NotificationPreferences } from "./NotificationPreferences";
import { ModuleFeatureOverview } from "@/components/product/ModuleFeatureOverview";

const filterNames: Record<QueueFilter, { en: string; bn: string }> = {
  new: words("New", "নতুন"), progress: words("In progress", "চলছে"), replied: words("Replied", "উত্তর দেওয়া"), all: words("All open", "সব খোলা"),
};

/** `embedded`: the page already supplies the heading, navigation and sign-out (the provider dashboard), so only the notice and the queue render. */
export function BondhonWorkspace({ profile, embedded = false }: { profile: OwnProfile; embedded?: boolean }) {
  return <BondhonSession key={`${profile.user_id}:${profile.role}`} profile={profile} embedded={embedded} />;
}
function BondhonSession({ profile, embedded }: { profile: OwnProfile; embedded: boolean }) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const privateRoot = useBondhonPageGuard();
  const heading = useRef<HTMLHeadingElement>(null);
  const [leavePath, setLeavePath] = useState<string | null>(null);
  const provider = profile.role === "provider";
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState<Array<SupportRequest | ProviderRequestSummary>>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState<QueueFilter>("new");
  const [initial, setInitial] = useState<FormInitial | undefined>();
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "unconfirmed">("idle");
  const [leaving, setLeaving] = useState(false);
  const sequence = useRef(0);
  const loading = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const loadedPages = useRef(1);
  const [checked, setChecked] = useState(false);
  const load = useCallback(async (after?: string) => {
    if (loading.current) return;
    loading.current = true;
    const seq = ++sequence.current;
    const request = new AbortController();
    controller.current = request;
    setBusy(true); setFailed(false);
    try {
      const path = provider ? "/api/provider/requests" : "/api/care-requests";
      const schema = provider ? pageSchema(providerRequestSummarySchema) : pageSchema(supportRequestSchema);
      let nextCursor: string | null = after ?? null;
      const collected: Array<SupportRequest | ProviderRequestSummary> = [];
      const seenCursors = new Set<string>();
      const rounds = after ? 1 : loadedPages.current;
      for (let page = 0; page < rounds; page++) {
        const suffix = nextCursor ? `?limit=20&cursor=${encodeURIComponent(nextCursor)}` : "?limit=20";
        const result = await careFetch(path + suffix, schema, profile.user_id, { signal: request.signal });
        if (seq !== sequence.current) return;
        collected.push(...result.items);
        nextCursor = result.nextCursor;
        if (!nextCursor) break;
        if (seenCursors.has(nextCursor)) throw new Error("Repeated pagination cursor");
        seenCursors.add(nextCursor);
      }
      if (seq !== sequence.current) return;
      if (after) loadedPages.current++;
      const fresh = [...new Map(collected.map(item => [item.id, item])).values()];
      setItems(previous => after ? [...previous.filter(item => !fresh.some(next => next.id === item.id)), ...fresh] : fresh);
      setCursor(nextCursor); setNow(Date.now()); setChecked(true);
    } catch {
      if (seq === sequence.current) { setItems([]); setCursor(null); setFailed(true); }
    } finally { if (seq === sequence.current) { setBusy(false); loading.current = false; } }
  }, [profile.user_id, provider]);
  useEffect(() => {
    if (view !== "list" && !provider) return;
    const counter = sequence;
    const activeController = controller;
    const loadLock = loading;
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const initialLoad = window.setTimeout(() => void load(), 0);
    function visibility() {
      if (document.hidden && provider) { counter.current++; activeController.current?.abort(); loadLock.current = false; setBusy(false); setChecked(false); setItems([]); setCursor(null); }
      if (!document.hidden) void load();
    }
    document.addEventListener("visibilitychange", visibility);
    const interval = window.setInterval(() => { if (!document.hidden) void load(); }, 30_000);
    return () => { counter.current++; activeController.current?.abort(); loadLock.current = false; window.clearInterval(clock); window.clearTimeout(initialLoad); document.removeEventListener("visibilitychange", visibility); window.clearInterval(interval); };
  }, [load, view, refresh, provider]);
  useEffect(() => {
    if (view !== "list") return;
    const focus = window.setTimeout(() => heading.current?.focus(), 0);
    return () => window.clearTimeout(focus);
  }, [view]);
  useEffect(() => {
    function protectDraft(event: MouseEvent) {
    if (view !== "new" || provider || !(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.hash && destination.pathname === window.location.pathname) return;
    event.preventDefault(); event.stopPropagation();
    if (submissionState !== "idle") return;
    setLeavePath(destination.pathname + destination.search + destination.hash); setLeaving(true);

    }
    document.addEventListener("click", protectDraft, true);
    return () => document.removeEventListener("click", protectDraft, true);
  }, [view, provider, submissionState]);
  function created(request: SupportRequest) { setInitial(undefined); setSelected(request.id); setView("detail"); }
  function open(id: string) { setSelected(id); setView("detail"); }
  const queue = provider ? queueView(items, now, filter) : null;
  const earlier = provider ? [] : splitSharing(items as SupportRequest[], now).earlier;
  return <div ref={privateRoot} className={`${styles.workspace} ${styles.bondhonPage}`} lang={language}>
    {!embedded && <nav className={styles.actions} aria-label={t(words("Care navigation", "সেবার পথ"))}>
      <Link className="pro-btn pro-btn-secondary" href={provider ? "/provider" : "/app"}>{t(words("Dashboard", "ড্যাশবোর্ড"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href="/poth">{t(words("Find care and visit preparation", "সেবা খোঁজা ও সাক্ষাতের প্রস্তুতি"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href={provider ? "/account" : "/app/account"}>{t(words("Account and roles", "অ্যাকাউন্ট ও পরিচয়"))}</Link>
    </nav>}
    {!embedded && <header className={styles.pageHeader}>
      <p className={styles.eyebrow}>{t(words("PROHOR / Bondhon", "প্রহর / বন্ধন"))}</p>
      <h1 ref={heading} tabIndex={-1} className={styles.heading}>{t(provider ? words("Bondhon · Simulated provider queue", "বন্ধন · সিমুলেটেড সেবাদাতার তালিকা") : words("Bondhon · Your sharing decisions", "বন্ধন · শেয়ারের সিদ্ধান্ত আপনার"))}</h1>
      <p>{t(words("A little support, on your terms. Choose what to share and keep every request in one place.", "আপনার সিদ্ধান্তে একটু সহায়তা। কী শেয়ার করবেন বাছুন, প্রতিটি অনুরোধ এক জায়গায় রাখুন।"))}</p>
    </header>}

    {view === "list" && !provider && <BondhonGuide />}
    <aside className={styles.simulationNote}>
      <p>{t(words("Simulated care coordination · synthetic information only. This is not a staffed medical or emergency service.", "সিমুলেটেড সেবা সমন্বয় · শুধু নমুনা তথ্য। এটি কর্মরত চিকিৎসা বা জরুরি সেবা নয়।"))}</p>
      <Link className="underline inline-flex min-h-12 items-center" href="/poth#poth-sos" target="_blank" rel="noopener noreferrer">{t(words("Open emergency and care information (new tab)", "জরুরি ও সেবার তথ্য খুলুন (নতুন ট্যাব)"))}</Link>

    </aside>
    {view === "new" && !provider && <>
      <button className="pro-btn pro-btn-secondary justify-self-start" disabled={submissionState !== "idle"} onClick={() => { setLeavePath(null); setLeaving(true); }}>{t(words("Return to requests", "অনুরোধে ফিরুন"))}</button>
      <CareRequestForm key={profile.user_id} account={profile.user_id} onCreated={created} initial={initial} onSubmissionStateChange={setSubmissionState} />
      {submissionState === "unconfirmed" && <p role="status" className={styles.notice}>{t(words("Keep this request open and retry the same reviewed submission. Returning now could lose its retry key.", "এই অনুরোধ খোলা রাখুন এবং একই পর্যালোচিত জমা আবার চেষ্টা করুন। এখন ফিরলে পুনঃচেষ্টার চাবি হারাতে পারে।"))}</p>}
      {leaving && <RevokeDialog action="discard" busy={false} onCancel={() => { setLeaving(false); setLeavePath(null); }} onConfirm={() => { setLeaving(false); setInitial(undefined); if (leavePath) router.push(leavePath); else setView("list"); }} />}
    </>}
    <div className={provider && view === "detail" ? styles.providerSplit : styles.workspace}>
    {(view === "list" || provider) && <div className={styles.queuePane}>
      {busy && !items.length && <p role="status">{t(words("Checking the current queue…", "বর্তমান তালিকা যাচাই হচ্ছে…"))}</p>}
      {failed && <p role="alert" className={styles.error}>{t(words("Requests could not be loaded. Check your connection and sign-in, then refresh. If the problem continues, contact the project administrator.", "অনুরোধ আনা যায়নি। সংযোগ ও সাইন ইন দেখে আবার আনুন। সমস্যা থাকলে প্রকল্পের প্রশাসকের সঙ্গে যোগাযোগ করুন।"))}</p>}
      {!provider && !failed && <SharingNow account={profile.user_id} items={items as SupportRequest[]} now={now} ready={checked && !busy} complete={cursor === null} onOpen={open}
        onNew={() => { setInitial(undefined); setView("new"); }} onChanged={() => setRefresh(value => value + 1)} />}
      {!provider && <NotificationPreferences />}
      {!provider && <button className="pro-btn pro-btn-secondary justify-self-start" disabled={busy} onClick={() => void load()}>{t(words("Refresh", "আবার দেখুন"))}</button>}
      {!provider && earlier.length > 0 && <details className={styles.panel}>
        <summary className="pro-btn pro-btn-secondary">{t(words(`Earlier requests (${earlier.length})`, `আগের অনুরোধ (${digits(earlier.length, "bn")})`))}</summary>
        <ul className={styles.list}>{earlier.map(item => {
          const access = accessState(item, now);
          return <li key={item.id}><button className={`${styles.record} pro-btn-secondary`} onClick={() => open(item.id)}>
            <strong>{item.purpose}</strong><br />
            <span>{t(statusNames[item.status])} · {t(accessWords[access])}</span><br />
            <span>{formatWhen(item.createdAt, language, now)}</span>
          </button></li>;
        })}</ul>
      </details>}
      {provider && <section className={styles.panel} aria-labelledby="queue-title">
        <div className={styles.actions}>
          <h2 id="queue-title" ref={embedded ? heading : undefined} tabIndex={-1}>{t(words("Your authorized queue", "আপনার অনুমোদিত তালিকা"))}</h2>
          <button className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load()}>{t(words("Refresh", "আবার দেখুন"))}</button>
        </div>
        {queue && <fieldset className={styles.pillRow}>
          <legend className="sr-only">{t(words("Show", "দেখান"))}</legend>
          {(["new", "progress", "replied", "all"] as const).map(name => <label key={name} className={styles.pill}>
            <input type="radio" name="queue-filter" checked={filter === name} onChange={() => setFilter(name)} />
            {t(filterNames[name])} · {digits(queue.counts[name], language)}
          </label>)}
        </fieldset>}
        <p className={styles.meta}>{t(words("Sorted by access ending soonest. Closed, stopped and expired requests are not shown.", "যার প্রবেশ আগে শেষ হবে সেটি আগে। বন্ধ, থামানো ও মেয়াদ-শেষ অনুরোধ দেখানো হয় না।"))}</p>
        {!busy && !failed && queue && !queue.rows.length && <p>{t(words("No requests here right now. Expired, stopped and closed requests are excluded.", "এখন এখানে কোনো অনুরোধ নেই। মেয়াদ শেষ, থামানো ও বন্ধ অনুরোধ বাদ।"))}</p>}
        <ul className={styles.list}>{queue?.rows.map(item => {
          const c = item.coordination, soon = accessState(item, now) === "ending_soon";
          return <li key={item.id}><button className={styles.queueRow} aria-current={view === "detail" && selected === item.id ? "true" : undefined} onClick={() => open(item.id)}>
            {!!c?.accommodations.length && <span className={styles.chips}>{c.accommodations.map(key => <span key={key} className={styles.chip}><PersonStanding size={14} aria-hidden="true" /> {t(accommodations[key])}</span>)}</span>}
            {item.purpose && <span className={styles.meta}>{item.purpose}</span>}
            <strong>{item.message}</strong>
            <span className={styles.chips}>
              <span className={styles.chip}>{t(statusNames[item.status])}</span>
              {c && <span className={`${styles.chip} ${soon ? styles.chipSoon : ""}`}>{soon ? <TriangleAlert size={14} aria-hidden="true" /> : <Clock size={14} aria-hidden="true" />} {formatLeft(msLeft(c.expiresAt, now), language)}</span>}
              {c?.allowReplies && <span className={styles.chip}><MessageSquare size={14} aria-hidden="true" /> {t(words("Replies allowed", "উত্তরের অনুমতি আছে"))}</span>}
            </span>
          </button></li>;
        })}</ul>
        {cursor && <p>{t(words("Counts and sorting cover loaded requests. Load more to include earlier requests.", "সংখ্যা ও সাজানো আনা অনুরোধগুলোর জন্য। আগের অনুরোধ যোগ করতে আরও আনুন।"))}</p>}
      </section>}
      {cursor && <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load(cursor)}>{t(words("Load more requests", "আরও অনুরোধ আনুন"))}</button>}
    </div>}
    {view === "detail" && <CareRequestDetail key={selected} account={profile.user_id} requestId={selected} provider={provider}
      onShareAgain={next => { setInitial(next); setView("new"); }} onBack={() => { setView("list"); setRefresh(value => value + 1); }} />}
    </div>
  </div>;
}
