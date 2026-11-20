"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ClipboardCheck, ExternalLink, Info, Loader2, MapPin, Phone, Search, ShieldCheck, X } from "lucide-react";
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
  const kindNames = { hospital: t("Hospital", "হাসপাতাল"), clinic: t("Clinic", "ক্লিনিক"), maternity: t("Women’s / maternity care (tagged)", "নারী ও মাতৃসেবা (ট্যাগ)"), midwife: t("Midwife", "ধাত্রীর সেবা"), doctor: t("Doctor", "চিকিৎসক"), pharmacy: t("Pharmacy", "ফার্মেসি") };
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
  function toggleResults() {
    setExpandedKey(expanded ? null : expansionKey);
    if (expanded) heading.current?.focus();
    else window.requestAnimationFrame(() => document.querySelectorAll<HTMLElement>("#poth-facility-cards article h3")[6]?.focus());
  }
  return <section id="poth-reviewed-directory" className={`${styles.panel} ${styles.stack}`} aria-labelledby="poth-directory-title">
    <div className={styles.sectionHead}><span className={styles.iconTile} aria-hidden="true"><Search size={22} /></span><div><span className={styles.step}>{t("Step 1", "ধাপ ১")}</span><h2 id="poth-directory-title" ref={heading} tabIndex={-1}>{t("Find a place", "প্রতিষ্ঠান খুঁজুন")}</h2><p className={styles.meta}>{t("Search by name or area. You do not need to share your location.", "নাম বা এলাকা দিয়ে খুঁজুন। নিজের অবস্থান জানানোর প্রয়োজন নেই।")}</p></div></div>
    <label className={styles.field}>{t("Facility name, area or district", "প্রতিষ্ঠানের নাম, এলাকা বা জেলা")}
      <span className={styles.searchBox}><Search size={20} aria-hidden="true" /><input type="search" value={filters.q} maxLength={120} onChange={event => update("q", event.target.value)} placeholder={t("Try a name in English or Bangla", "বাংলা বা ইংরেজিতে নাম লিখুন")} /></span>
    </label>
    <div className={styles.filters}>
      <label className={styles.field}>{t("Division", "বিভাগ")}<select value={filters.division} onChange={e => update("division", e.target.value)}><option value="">{t("All divisions", "সব বিভাগ")}</option>{divisionNames.map(d => <option key={d} value={d}>{geoLabel(d, language)}</option>)}</select></label>
      <label className={styles.field}>{t("District", "জেলা")}<select value={filters.district} onChange={e => update("district", e.target.value)}><option value="">{t("All districts", "সব জেলা")}</option>{districts.map(d => <option key={d} value={d}>{geoLabel(d, language)}</option>)}</select></label>
    </div>
    <div className={styles.chipRow}>
      <button type="button" className={styles.chip} aria-pressed={filters.kind === "maternity"} onClick={() => update("kind", filters.kind === "maternity" ? "" : "maternity")}>{filters.kind === "maternity" && <Check size={17} aria-hidden="true" />}{t("Women’s / maternity care", "নারী ও মাতৃসেবা")}</button>
      <button className={styles.textButton} type="button" onClick={() => { setFilters(empty); setExpandedKey(null); setRetry(v => v + 1); }}><X size={16} aria-hidden="true" />{t("Clear filters", "ফিল্টার মুছুন")}</button>
    </div>
    <details className={styles.disclosure}>
      <summary>{t("More filters", "আরও ফিল্টার")}{(filters.kind || filters.source || filters.access) ? t(" · active", " · চালু") : ""}</summary>
      <div className={styles.filters}>
      <label className={styles.field}>{t("Facility type", "প্রতিষ্ঠানের ধরন")}<select value={filters.kind} onChange={e => update("kind", e.target.value)}><option value="">{t("All types", "সব ধরন")}</option>{directoryKinds.map(k => <option key={k} value={k}>{kindNames[k]}</option>)}</select></label>
      <label className={styles.field}>{t("Information source", "তথ্যের উৎস")}<select value={filters.source} onChange={e => update("source", e.target.value)}><option value="">{t("All sources", "সব উৎস")}</option><option value="registry">{t("DGHS registry profiles", "DGHS রেজিস্ট্রি প্রোফাইল")}</option><option value="community">{t("Community map · unverified", "কমিউনিটি মানচিত্র · যাচাই হয়নি")}</option></select></label>
      <label className={styles.field}>{t("Access reported available · unverified", "সুবিধা আছে বলে উল্লেখ · যাচাই হয়নি")}<select value={filters.access} onChange={e => update("access", e.target.value)}><option value="">{t("Any / unknown access", "সব / অজানা সুবিধা")}</option>{accessKeys.map(k => <option key={k} value={k}>{accessNames[k]}</option>)}</select></label>
      </div>
      <p className={styles.meta}>{t("Access filters use unverified map reports. Missing information means unknown, not unavailable.", "সুবিধার ফিল্টার যাচাইহীন মানচিত্রের তথ্য ব্যবহার করে। তথ্য না থাকলে অজানা, নেই এমন নয়।")}</p>
    </details>
    {(filters.division || filters.district) && <p className={styles.meta}>{t("Some records have no district. Try name or nearby search for more options.", "কিছু তথ্যে জেলা নেই। আরও পেতে নাম বা কাছের সেবা দিয়ে খুঁজুন।")}</p>}

    <div role="status" aria-live="polite" aria-atomic="true">
      {(!current || status === "loading") && <p className={styles.statusLine}><Loader2 size={18} aria-hidden="true" />{t("Searching saved records…", "রাখা তথ্যে খোঁজা হচ্ছে…")}</p>}
      {current && status === "error" && <p className={styles.error}>{t("Directory could not load. Your filters are kept.", "তালিকা আনা যায়নি। ফিল্টার রাখা আছে।")} <button type="button" className={styles.button} onClick={() => setRetry(v => v + 1)}>{t("Retry", "আবার চেষ্টা করুন")}</button></p>}
      {visible && result && <p className={styles.count}>{t(`${result.total.toLocaleString("en")} matching listings`, `${result.total.toLocaleString("bn-BD")}টি মিল আছে এমন তথ্য`)}</p>}
    </div>
    {visible && result && <>

      {result.total === 0 && <p className={styles.notice}><Info size={18} aria-hidden="true" />{t("No matching record in this saved selection. This does not mean care is unavailable. Clear filters, try nearby search or consult the official registry.", "রাখা এই তালিকায় মিল নেই। এর অর্থ স্বাস্থ্যসেবা নেই নয়। ফিল্টার মুছে, কাছের সেবা বা সরকারি রেজিস্ট্রিতে খুঁজুন।")}</p>}
      {result.total > 0 && <p className={`${styles.meta} ${styles.small}`}>{t("Services and access are not independently verified. Confirm before travelling.", "সেবা ও প্রবেশের সুবিধা স্বাধীনভাবে যাচাই হয়নি। যাওয়ার আগে নিশ্চিত করুন।")}</p>}

      <div id="poth-facility-cards" className={styles.cards}>{(expanded ? result.places : result.places.slice(0, 6)).map(p => <article key={p.id} className={styles.card}>
        <div className={styles.cardTop}><span className={`${styles.badge} ${p.source === "registry" ? "" : styles.badgeWarn}`}>{p.source === "registry" ? <ShieldCheck size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}{p.source === "registry" ? t("DGHS profile", "DGHS প্রোফাইল") : t("Map listing · unverified", "মানচিত্রের তথ্য · যাচাই হয়নি")}</span><span className={`${styles.meta} ${styles.small}`}>{kindNames[p.kind]}</span></div>
        <h3 tabIndex={-1}>{bn ? p.nameBn ?? p.name : p.name}</h3>
        <p className={styles.line}><MapPin size={17} aria-hidden="true" /><span>{p.area ?? t("Address not supplied", "ঠিকানা দেওয়া নেই")} · {p.district ? geoLabel(p.district, language) : t("District not recorded", "জেলা উল্লেখ নেই")}</span></p>
        <div className={styles.cardActions}>
          {onPrepare && <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onPrepare(p)}><ClipboardCheck size={18} aria-hidden="true" />{t("Prepare a visit", "সাক্ষাতের প্রস্তুতি")}</button>}
          {p.phone && <a className={styles.button} href={`tel:${p.phone.replace(/[^+0-9]/g, "")}`}><Phone size={17} aria-hidden="true" />{t("Call", "কল করুন")}</a>}
        </div>
        <details className={styles.details}><summary>{t("Details, access & source", "বিস্তারিত, সুবিধা ও উৎস")}</summary>        <p className={styles.meta}>{p.source === "registry" ? t("Registry area, not a verified entrance. Services, availability and accessibility are not independently confirmed.", "রেজিস্ট্রির এলাকা, যাচাইকৃত প্রবেশপথ নয়। সেবা, প্রাপ্যতা ও প্রবেশগম্যতা স্বাধীনভাবে নিশ্চিত নয়।") : t("Saved map data; its collection date is not recorded. Confirm this place still operates before travelling.", "রাখা মানচিত্রের তথ্য; সংগ্রহের তারিখ উল্লেখ নেই। যাওয়ার আগে প্রতিষ্ঠান চালু আছে কি না নিশ্চিত করুন।")}</p><a className={styles.textButton} href={p.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />{t("View source", "উৎস দেখুন")}</a><dl className={styles.facts}>
          <div><dt>{t("Phone · not call-verified", "ফোন · কল করে যাচাই হয়নি")}</dt><dd>{p.phone ?? t("Not supplied", "দেওয়া নেই")}</dd></div>
          <div><dt>{t("Email published by source", "উৎসে দেওয়া ইমেইল")}</dt><dd>{p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : t("Not supplied", "দেওয়া নেই")}</dd></div>
          <div><dt>{t("Opening hours · not verified", "খোলার সময় · যাচাই হয়নি")}</dt><dd>{p.hours ?? t("Unknown", "অজানা")}</dd></div>
          {accessKeys.map(k => <div key={k}><dt>{accessNames[k]}</dt><dd>{states[p.accessibility[k]]}</dd></div>)}
          <div><dt>{t("Source reviewed", "উৎস পর্যালোচনা")}</dt><dd>{p.reviewedOn ?? t("Collection/review date not recorded", "সংগ্রহ/পর্যালোচনার তারিখ নেই")}</dd></div>
        </dl>{p.website && <a className={styles.button} href={p.website} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />{t("Source-listed website", "উৎসে দেওয়া ওয়েবসাইট")}</a>}
        <p>{t("Ask about step-free entry, toilet and examination access, transfer assistance and your preferred communication method before a routine visit.", "সাধারণ সাক্ষাতের আগে সিঁড়িবিহীন প্রবেশ, টয়লেট ও পরীক্ষার সুবিধা, স্থানান্তর সহায়তা এবং পছন্দের যোগাযোগ সম্পর্কে জেনে নিন।")}</p></details>
      </article>)}</div>
      {result.total > 6 && <button type="button" className={styles.button} aria-expanded={expanded} aria-controls="poth-facility-cards"
        onClick={toggleResults}>
        {expanded ? t("Show only six facilities", "শুধু ছয়টি প্রতিষ্ঠান দেখুন") : t("Show more facilities", "আরও প্রতিষ্ঠান দেখুন")}
      </button>}
      {expanded && result.pages > 1 && <nav className={styles.pagination} aria-label={t("Directory pages", "তালিকার পাতা")}><button type="button" className={styles.button} disabled={result.page <= 1} onClick={() => page(result.page - 1)}>{t("Previous", "আগের")}</button><span>{result.page} / {result.pages}</span><button type="button" className={styles.button} disabled={result.page >= result.pages} onClick={() => page(result.page + 1)}>{t("Next", "পরের")}</button></nav>}
    </>}
    <div className={styles.sourceFooter}>
      <a className={styles.attribution} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors · ODbL ↗</a>
      <details className={styles.disclosure}>
        <summary>{t("Sources & coverage", "উৎস ও তথ্যের পরিসর")}</summary>
        <p>{t("Saved listings may be incomplete or refer to the same facility. A listing does not confirm current services, appointments or accessibility.", "রাখা তালিকা অসম্পূর্ণ হতে পারে বা একই প্রতিষ্ঠানের একাধিক তথ্য থাকতে পারে। তালিকায় থাকা মানেই বর্তমান সেবা, অ্যাপয়েন্টমেন্ট বা প্রবেশগম্যতা নিশ্চিত নয়।")}</p>
        {result && <p>{t(`${result.registryCount} DGHS profiles · ${result.communityCount.toLocaleString("en")} community-map records. Community collection date is not recorded.`, `${result.registryCount.toLocaleString("bn-BD")}টি DGHS প্রোফাইল · ${result.communityCount.toLocaleString("bn-BD")}টি কমিউনিটি তথ্য। কমিউনিটি তথ্য সংগ্রহের তারিখ নেই।`)}</p>}
        <p>{t("District filters require a recorded district; name and nearby search can include entries missing that field.", "জেলার ফিল্টারে উল্লেখিত জেলা লাগে; নাম বা কাছের সেবা দিয়ে জেলা-না-থাকা তথ্যও খুঁজতে পারবেন।")}</p>
        <a className={styles.textButton} href="https://hrm.dghs.gov.bd/public/facility-registry" target="_blank" rel="noopener noreferrer">{t("Open DGHS registry ↗", "DGHS রেজিস্ট্রি খুলুন ↗")}</a>
      </details>
    </div>
  </section>;
}
