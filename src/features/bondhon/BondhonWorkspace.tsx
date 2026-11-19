"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";
import { providerRequestSummarySchema, supportRequestSchema, type ProviderRequestSummary, type SupportRequest } from "@/lib/contracts/bondhon";
import { pageSchema } from "@/lib/contracts/transport";
import { CareRequestForm } from "./CareRequestForm";
import { CareRequestDetail } from "./CareRequestDetail";
import { careFetch } from "./client";
import { statusNames, words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

export function BondhonWorkspace({ profile }: { profile: OwnProfile }) {
  const { language, t } = useLanguage();
  const provider = profile.role === "provider";
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState<Array<SupportRequest | ProviderRequestSummary>>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const sequence = useRef(0);
  const loading = useRef(false);
  const load = useCallback(async (after?: string) => {
    if (loading.current) return;
    loading.current = true;
    const seq = ++sequence.current;
    setBusy(true); setFailed(false);
    try {
      const path = provider ? "/api/provider/requests" : "/api/care-requests";
      const suffix = after ? `?limit=20&cursor=${encodeURIComponent(after)}` : "?limit=20";
      const schema = provider ? pageSchema(providerRequestSummarySchema) : pageSchema(supportRequestSchema);
      const result = await careFetch(path + suffix, schema, profile.user_id);
      if (seq !== sequence.current) return;
      setItems(previous => after ? [...previous.filter(item => !result.items.some(next => next.id === item.id)), ...result.items] : result.items);
      setCursor(result.nextCursor);
    } catch {
      if (seq === sequence.current) { setItems([]); setCursor(null); setFailed(true); }
    } finally { if (seq === sequence.current) setBusy(false); loading.current = false; }
  }, [profile.user_id, provider]);
  useEffect(() => {
    if (view !== "list") return;
    const initial = window.setTimeout(() => void load(), 0);
    function visibility() {
      if (document.hidden && provider) { sequence.current++; setItems([]); }
      if (!document.hidden) void load();
    }
    document.addEventListener("visibilitychange", visibility);
    const interval = window.setInterval(() => { if (!document.hidden) void load(); }, 30_000);
    return () => { sequence.current++; window.clearTimeout(initial); document.removeEventListener("visibilitychange", visibility); window.clearInterval(interval); };
  }, [load, view, refresh, provider]);
  function created(request: SupportRequest) { setSelected(request.id); setView("detail"); }
  return <div className={styles.workspace} lang={language}>
    <nav className={styles.actions} aria-label={t(words("Care navigation", "সেবার পথ"))}>
      <Link className="pro-btn pro-btn-secondary" href={provider ? "/provider" : "/app"}>{t(words("Dashboard", "ড্যাশবোর্ড"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href="/poth">{t(words("Find care and visit preparation", "সেবা খোঁজা ও সাক্ষাতের প্রস্তুতি"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href="/account">{t(words("Account and roles", "অ্যাকাউন্ট ও পরিচয়"))}</Link>
      </nav>
    <header>
      <h1 className={styles.heading}>{t(provider ? words("Bondhon · Simulated provider queue", "বন্ধন · সিমুলেটেড সেবাদাতার তালিকা") : words("Bondhon · Your sharing decisions", "বন্ধন · শেয়ারের সিদ্ধান্ত আপনার"))}</h1>
      <p>{t(words("Choose the person, information and time. Follow each request in one place.", "প্রাপক, তথ্য ও সময় বাছুন। প্রতিটি অনুরোধ এক জায়গায় দেখুন।"))}</p>
      </header>
    <aside className={styles.notice}>
      <p>{t(words("Hackathon simulation. Use synthetic information. No staffed medical service or emergency monitoring is connected.", "হ্যাকাথনের সিমুলেশন। নমুনা তথ্য ব্যবহার করুন। কোনো কর্মরত চিকিৎসাসেবা বা জরুরি পর্যবেক্ষণ যুক্ত নেই।"))}</p>
      <Link className="underline inline-flex min-h-12 items-center" href="/poth#poth-sos">{t(words("Open emergency and care information", "জরুরি ও সেবার তথ্য খুলুন"))}</Link>
      </aside>
    {view === "new" && !provider && <>
      <button className="pro-btn pro-btn-secondary justify-self-start" onClick={() => {
        if (window.confirm(t(words("Leave this draft? Text in this tab will be discarded.", "খসড়া ছাড়বেন? এই ট্যাবের লেখা বাদ যাবে।")))) setView("list");
      }}>{t(words("Return to requests", "অনুরোধে ফিরুন"))}</button>
      <CareRequestForm account={profile.user_id} onCreated={created} />
    </>}
    {view === "detail" && <CareRequestDetail key={selected} account={profile.user_id} requestId={selected} provider={provider} onBack={() => { setView("list"); setRefresh(value => value + 1); }} />}
    {view === "list" && <section className={styles.panel}>
      <div className={styles.actions}>
      <h2>{t(provider ? words("Your authorized queue", "আপনার অনুমোদিত তালিকা") : words("Your requests", "আপনার অনুরোধ"))}</h2>
      <button className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load()}>{t(words("Refresh", "আবার দেখুন"))}</button>{!provider && <button className="pro-btn pro-btn-primary" onClick={() => setView("new")}>{t(words("Create a reviewed request", "পর্যালোচনা করে অনুরোধ তৈরি করুন"))}</button>}</div>
      {busy && <p role="status">{t(words("Checking the current queue…", "বর্তমান তালিকা যাচাই হচ্ছে…"))}</p>}
      {failed && <p role="alert" className={styles.error}>{t(words("Requests could not be loaded. Check your connection and sign-in, then refresh. If the problem continues, contact the project administrator.", "অনুরোধ আনা যায়নি। সংযোগ ও সাইন ইন দেখে আবার আনুন। সমস্যা থাকলে প্রকল্পের প্রশাসকের সঙ্গে যোগাযোগ করুন।"))}</p>}
      {!busy && !failed && !items.length && <p>{t(provider ? words("No currently authorized open requests. Expired, revoked and closed requests are excluded.", "বর্তমানে অনুমোদিত খোলা অনুরোধ নেই। মেয়াদ শেষ, প্রত্যাহার করা ও বন্ধ অনুরোধ তালিকার বাইরে।") : words("You have no submitted requests. Start with a routine purpose and a named simulated recipient.", "আপনার জমা দেওয়া অনুরোধ নেই। সাধারণ উদ্দেশ্য ও নামসহ সিমুলেটেড প্রাপক দিয়ে শুরু করুন।"))}</p>}
      <ul className={styles.list}>{items.map(item => <li key={item.id}>
      <button className={`${styles.record} pro-btn-secondary`} onClick={() => { setSelected(item.id); setView("detail"); }}>
        <strong>{"purpose" in item ? item.purpose : t(words("Authorized simulated request", "অনুমোদিত সিমুলেটেড অনুরোধ"))}</strong>
      <br />
      <span>{t(statusNames[item.status])}</span>
      <br />
      <span>{new Date(item.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</span>
      </button>
      </li>)}</ul>
      {cursor && <button className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => void load(cursor)}>{t(words("Load more requests", "আরও অনুরোধ আনুন"))}</button>}
    </section>}
  </div>;
}
