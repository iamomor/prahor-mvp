"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import { discoveryResponseSchema } from "@/lib/contracts/poth-discovery";
import { bdDistricts, divisionNames, type Division } from "./bdDistricts";
import { geoLabel } from "./geoLabels";
import { accessKeys, directoryKinds, type DirectoryResult, type DirectoryPlace } from "./directoryCore";
import styles from "./poth.module.css";
const empty = { q: "", division: "", district: "", kind: "", source: "", access: "", page: 1 };

export function PothFacilityExplorer({ onPrepare }: { onPrepare?: (place: DirectoryPlace) => void } = {}) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const t = (en: string, bangla: string) => bn ? bangla : en;
  const [filters, setFilters] = useState(empty);
  const [retry, setRetry] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [result, setResult] = useState<DirectoryResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [requestKey, setRequestKey] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const changedPage = useRef(false);
  const key = JSON.stringify(filters);
  const expansionKey = JSON.stringify({ ...filters, page: 0 });
  const expanded = expandedKey === expansionKey;
  const current = requestKey === key;
  const visible = status === "ready" && current;
  const kindNames = { hospital: t("Hospital", "হাসপাতাল"), clinic: t("Clinic", "ক্লিনিক"), maternity: t("Maternity-tagged", "মাতৃসেবার ট্যাগযুক্ত"), midwife: t("Midwife", "ধাত্রীর সেবা"), doctor: t("Doctor", "চিকিৎসক"), pharmacy: t("Pharmacy", "ফার্মেসি") };
  const accessNames = { wheelchair: t("Wheelchair access", "হুইলচেয়ার প্রবেশ"), accessibleToilet: t("Accessible toilet", "প্রবেশগম্য টয়লেট"), hearingLoop: t("Hearing loop", "হিয়ারিং লুপ") };
  const states = { reported_available: t("Reported available · not verified", "পাওয়া যায় বলে উল্লেখ · যাচাই হয়নি"), reported_limited: t("Reported limited · not verified", "সীমিত বলে উল্লেখ · যাচাই হয়নি"), reported_unavailable: t("Reported unavailable · not verified", "নেই বলে উল্লেখ · যাচাই হয়নি"), unknown: t("Unknown · not verified", "অজানা · যাচাই হয়নি") };
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    const timer = window.setTimeout(() => {
      setStatus("loading");
      const query = new URLSearchParams(JSON.parse(key) as Record<string, string>);
      void fetch(`/api/poth/facilities?view=discovery&${query}`, { signal: controller.signal })
        .then(async response => { if (!response.ok) throw new Error("Directory unavailable"); return discoveryResponseSchema.parse(await response.json()); })
        .then(value => {
          if (controller.signal.aborted) return;
          setResult(value); setRequestKey(key); setStatus("ready");
          if (changedPage.current) { heading.current?.focus(); changedPage.current = false; }
        }).catch(() => { if (!controller.signal.aborted) { setRequestKey(key); setStatus("error"); } }).finally(() => window.clearTimeout(timeout));
    }, 200);
    const timedOut = () => { setRequestKey(key); setStatus("error"); };
    controller.signal.addEventListener("abort", timedOut, { once: true });
    return () => { controller.signal.removeEventListener("abort", timedOut); controller.abort(); window.clearTimeout(timer); window.clearTimeout(timeout); };
  }, [key, retry]);
  function update(name: keyof typeof empty, value: string) {
    changedPage.current = false;
    setExpandedKey(null);
    setFilters(previous => ({ ...previous, [name]: value, ...(name === "division" ? { district: "" } : {}), page: 1 }));
  }
  const districts = filters.division ? [...bdDistricts[filters.division as Division]] : Object.values(bdDistricts).flatMap(items => [...items]).sort();
  function page(value: number) { changedPage.current = true; setFilters(previous => ({ ...previous, page: value })); }
  return <section id="poth-reviewed-directory" className={`${styles.panel} ${styles.stack}`} aria-labelledby="poth-directory-title">
    <h2 id="poth-directory-title" ref={heading} tabIndex={-1}>{t("Find a facility", "স্বাস্থ্যসেবা প্রতিষ্ঠান খুঁজুন")}</h2>
    <p>{t("Search the saved directory without sharing your location. Official registry profiles and community-map records are labelled separately. Results do not confirm current services or appointments.", "অবস্থান না জানিয়েই রাখা তালিকায় খুঁজুন। সরকারি রেজিস্ট্রি ও কমিউনিটি মানচিত্রের তথ্য আলাদাভাবে চিহ্নিত। ফলাফল বর্তমান সেবা বা অ্যাপয়েন্টমেন্ট নিশ্চিত করে না।")}</p>
    <label className={styles.field}>{t("Facility name, area or district", "প্রতিষ্ঠানের নাম, এলাকা বা জেলা")}
      <input type="search" value={filters.q} maxLength={120} onChange={event => update("q", event.target.value)} placeholder={t("Try a name in English or Bangla", "বাংলা বা ইংরেজিতে নাম লিখুন")} />
    </label>
    <div className={styles.filters}>
      <label className={styles.field}>{t("Division", "বিভাগ")}<select value={filters.division} onChange={e => update("division", e.target.value)}><option value="">{t("All divisions", "সব বিভাগ")}</option>{divisionNames.map(d => <option key={d} value={d}>{geoLabel(d, language)}</option>)}</select></label>
      <label className={styles.field}>{t("District recorded by the source", "উৎসে উল্লেখিত জেলা")}<select value={filters.district} onChange={e => update("district", e.target.value)}><option value="">{t("All districts", "সব জেলা")}</option>{districts.map(d => <option key={d} value={d}>{geoLabel(d, language)}</option>)}</select></label>
      <label className={styles.field}>{t("Facility type", "প্রতিষ্ঠানের ধরন")}<select value={filters.kind} onChange={e => update("kind", e.target.value)}><option value="">{t("All types", "সব ধরন")}</option>{directoryKinds.map(k => <option key={k} value={k}>{kindNames[k]}</option>)}</select></label>
      <label className={styles.field}>{t("Information source", "তথ্যের উৎস")}<select value={filters.source} onChange={e => update("source", e.target.value)}><option value="">{t("All sources", "সব উৎস")}</option><option value="registry">{t("DGHS registry profiles", "DGHS রেজিস্ট্রি প্রোফাইল")}</option><option value="community">{t("Community map · unverified", "কমিউনিটি মানচিত্র · যাচাই হয়নি")}</option></select></label>
      <label className={styles.field}>{t("Access reported available · unverified", "সুবিধা আছে বলে উল্লেখ · যাচাই হয়নি")}<select value={filters.access} onChange={e => update("access", e.target.value)}><option value="">{t("Any / unknown access", "সব / অজানা সুবিধা")}</option>{accessKeys.map(k => <option key={k} value={k}>{accessNames[k]}</option>)}</select></label>
    </div>
    <div className={styles.actions}><button className={styles.button} type="button" onClick={() => { setFilters(empty); setExpandedKey(null); setRetry(v => v + 1); }}>{t("Clear filters", "ফিল্টার মুছুন")}</button></div>
    <p className={styles.notice}>{t("District filters include only records with a district field. Many community entries lack it; search by name or use nearby search to find those. An unknown access feature does not mean access is unavailable.", "জেলার ফিল্টারে শুধু উৎসে জেলা লেখা তথ্য আসে। অনেক কমিউনিটি তথ্যে জেলা নেই; সেগুলো নাম বা কাছের সেবা অংশে খুঁজুন। সুবিধা অজানা মানেই সুবিধা নেই নয়।")}</p>
    <div role="status" aria-live="polite" aria-atomic="true">
      {(!current || status === "loading") && <p>{t("Searching saved records…", "রাখা তথ্যে খোঁজা হচ্ছে…")}</p>}
      {current && status === "error" && <p className={styles.error}>{t("Directory could not load. Your filters are kept.", "তালিকা আনা যায়নি। ফিল্টার রাখা আছে।")} <button className={styles.button} onClick={() => setRetry(v => v + 1)}>{t("Retry", "আবার চেষ্টা করুন")}</button></p>}
      {visible && result && <p>{t(`${result.total} matching records · Page ${result.page} of ${result.pages}`, `${result.total.toLocaleString("bn-BD")}টি ফলাফল · পাতা ${result.page.toLocaleString("bn-BD")}/${result.pages.toLocaleString("bn-BD")}`)}</p>}
    </div>
    {visible && result && <>
      <p className={styles.meta}>{t(`Saved coverage: ${result.registryCount} DGHS profiles and ${result.communityCount} community features. These may describe the same facility; counts are records, not unique hospitals.`, `রাখা তথ্য: ${result.registryCount.toLocaleString("bn-BD")}টি DGHS প্রোফাইল ও ${result.communityCount.toLocaleString("bn-BD")}টি কমিউনিটি স্থান। একই প্রতিষ্ঠান একাধিক উৎসে থাকতে পারে; এটি অনন্য হাসপাতালের সংখ্যা নয়।`)}</p>
      {result.total === 0 && <p className={styles.notice}>{t("No matching record in this saved selection. This does not mean care is unavailable. Clear filters, try nearby search or consult the official registry.", "রাখা এই তালিকায় মিল নেই। এর অর্থ স্বাস্থ্যসেবা নেই নয়। ফিল্টার মুছে, কাছের সেবা বা সরকারি রেজিস্ট্রিতে খুঁজুন।")}</p>}
      {result.total > 0 && <p className={styles.meta}>{t(`Showing ${Math.min(result.places.length, expanded ? result.pageSize : 6)} records on this page. Expand to browse more; collapse to return to six.`, `এই পাতায় ${Math.min(result.places.length, expanded ? result.pageSize : 6).toLocaleString("bn-BD")}টি তথ্য দেখানো হচ্ছে। আরও দেখতে তালিকা খুলুন; বন্ধ করলে ছয়টিতে ফিরবে।`)}</p>}
      <div id="poth-facility-cards" className={styles.cards}>{(expanded ? result.places : result.places.slice(0, 6)).map(p => <article key={p.id} className={styles.card}>
        <div><span className={styles.badge}>{p.source === "registry" ? t("DGHS-listed identity", "DGHS-এ তালিকাভুক্ত পরিচয়") : t("Community record · unverified", "কমিউনিটি তথ্য · যাচাই হয়নি")}</span></div>
        <h3>{bn ? p.nameBn ?? p.name : p.name}</h3>
        {p.nameBn && bn && <p lang="en" className={styles.meta}>{p.name}</p>}
        <p>{kindNames[p.kind]} · {p.district ? geoLabel(p.district, language) : t("District not recorded", "জেলা উল্লেখ নেই")}</p>
        <p>{p.area ?? t("Address not supplied", "ঠিকানা দেওয়া নেই")}</p>
        <p className={styles.meta}>{p.source === "registry" ? t("Registry area, not a verified entrance. Services, availability and accessibility are not independently confirmed.", "রেজিস্ট্রির এলাকা, যাচাইকৃত প্রবেশপথ নয়। সেবা, প্রাপ্যতা ও প্রবেশগম্যতা স্বাধীনভাবে নিশ্চিত নয়।") : t("Saved map data; its collection date is not recorded. Confirm this place still operates before travelling.", "রাখা মানচিত্রের তথ্য; সংগ্রহের তারিখ উল্লেখ নেই। যাওয়ার আগে প্রতিষ্ঠান চালু আছে কি না নিশ্চিত করুন।")}</p>
        <div className={styles.actions}><a className={styles.button} href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{t("View source ↗", "উৎস দেখুন ↗")}</a>{p.phone && <a className={styles.button} href={`tel:${p.phone.replace(/[^+0-9]/g, "")}`}>{t("Call published number", "উৎসে দেওয়া নম্বরে কল")}</a>}</div>
        {onPrepare && <button type="button" className={styles.button} onClick={() => onPrepare(p)}>{t("Prepare a visit here", "এখানে সাক্ষাতের প্রস্তুতি")}</button>}
        <details className={styles.details}><summary>{t("Contacts and accessibility evidence", "যোগাযোগ ও সুবিধার তথ্য")}</summary><dl className={styles.facts}>
          <div><dt>{t("Phone · not call-verified", "ফোন · কল করে যাচাই হয়নি")}</dt><dd>{p.phone ?? t("Not supplied", "দেওয়া নেই")}</dd></div>
          <div><dt>{t("Email published by source", "উৎসে দেওয়া ইমেইল")}</dt><dd>{p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : t("Not supplied", "দেওয়া নেই")}</dd></div>
          <div><dt>{t("Opening hours · not verified", "খোলার সময় · যাচাই হয়নি")}</dt><dd>{p.hours ?? t("Unknown", "অজানা")}</dd></div>
          {accessKeys.map(k => <div key={k}><dt>{accessNames[k]}</dt><dd>{states[p.accessibility[k]]}</dd></div>)}
          <div><dt>{t("Source reviewed", "উৎস পর্যালোচনা")}</dt><dd>{p.reviewedOn ?? t("Collection/review date not recorded", "সংগ্রহ/পর্যালোচনার তারিখ নেই")}</dd></div>
        </dl>{p.website && <a className={styles.button} href={p.website} target="_blank" rel="noopener noreferrer">{t("Source-listed website ↗", "উৎসে দেওয়া ওয়েবসাইট ↗")}</a>}
        <p>{t("Ask about step-free entry, toilet and examination access, transfer assistance and your preferred communication method before a routine visit.", "সাধারণ সাক্ষাতের আগে সিঁড়িবিহীন প্রবেশ, টয়লেট ও পরীক্ষার সুবিধা, স্থানান্তর সহায়তা এবং পছন্দের যোগাযোগ সম্পর্কে জেনে নিন।")}</p></details>
      </article>)}</div>
      {result.total > 6 && <button type="button" className={styles.button} aria-expanded={expanded} aria-controls="poth-facility-cards"
        onClick={() => { setExpandedKey(expanded ? null : expansionKey); if (expanded) heading.current?.focus(); }}>
        {expanded ? t("Show only six facilities", "শুধু ছয়টি প্রতিষ্ঠান দেখুন") : t("Show more facilities", "আরও প্রতিষ্ঠান দেখুন")}
      </button>}
      {expanded && result.pages > 1 && <nav className={styles.pagination} aria-label={t("Directory pages", "তালিকার পাতা")}><button className={styles.button} disabled={result.page <= 1} onClick={() => page(result.page - 1)}>{t("Previous", "আগের")}</button><span>{result.page} / {result.pages}</span><button className={styles.button} disabled={result.page >= result.pages} onClick={() => page(result.page + 1)}>{t("Next", "পরের")}</button></nav>}
    </>}
    <p className={styles.meta}>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors · ODbL ↗</a>. {t("Community records are a saved extract, not a complete or live inventory.", "কমিউনিটি তথ্য রাখা একটি অংশ; সম্পূর্ণ বা সরাসরি হালনাগাদ তালিকা নয়।")}</p>
    <a className={styles.button} href="https://hrm.dghs.gov.bd/public/facility-registry" target="_blank" rel="noopener noreferrer">{t("Search the official DGHS registry ↗", "সরকারি DGHS রেজিস্ট্রিতে খুঁজুন ↗")}</a>
  </section>;
}
