"use client";
import { useState } from "react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, HeartHandshake, MapPin, MessageCircleQuestion, Navigation, Phone, Search } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { PothFacilityExplorer } from "./PothFacilityExplorer";
import { PothNearbyMap } from "./PothNearbyMap";
import { PothEmergencySOS } from "./PothEmergencySOS";
import { PothCareCoverage } from "./PothCareCoverage";
import { PothVisitPreparation, type VisitFacility } from "./PothVisitPreparation";
import styles from "./poth.module.css";
/** The public page supplies its main landmark; embedded dashboards keep their own shell. */
export function PothDirectoryMvp({ embedded = false }: { embedded?: boolean }) {
  const [facility, setFacility] = useState<VisitFacility | null>(null);
  const { language, setLanguage } = useLanguage();
  const bn = language === "bn";
  const t = (en: string, bangla: string) => bn ? bangla : en;
  const journey = [
    { href: "#poth-reviewed-directory", icon: Search, main: true, title: t("Search the directory", "তালিকায় খুঁজুন"), text: t("By name, district or type. No location needed.", "নাম, জেলা বা ধরন দিয়ে। অবস্থান লাগবে না।") },
    { href: "#poth-nearby-map", icon: Navigation, main: false, title: t("Look nearby", "কাছের সেবা"), text: t("Pick an area or use GPS to see places around you.", "এলাকা বাছুন বা GPS ব্যবহার করুন।") },
    { href: "#poth-visit-preparation", icon: ClipboardCheck, main: false, title: t("Prepare a visit", "সাক্ষাতের প্রস্তুতি"), text: t("A personal checklist and your questions.", "নিজের চেকলিস্ট ও প্রশ্ন।") },
  ];
  return <div lang={language} className={`${styles.root} ${embedded ? "" : styles.public}`}>
    <div className={`${styles.container} ${styles.stack}`}>
      {!embedded && <header className={styles.topbar}>
        <Link className={styles.button} href="/">PROHOR | প্রহর</Link>
        <div className={styles.topbarGroup}>
          <AccessPreferencesControl />
          <div className={styles.topbarGroup} role="group" aria-label="Language / ভাষা">
            <button type="button" className={`${styles.chip}`} aria-pressed={bn} onClick={() => setLanguage("bn")}>বাংলা</button>
            <button type="button" className={`${styles.chip}`} aria-pressed={!bn} onClick={() => setLanguage("en")}>English</button>
          </div>
        </div>
      </header>}
      <header className={`${styles.panel} ${styles.hero} ${styles.stack}`}>
        <p className={styles.eyebrow}><MapPin size={16} aria-hidden="true" />{t("Poth · Find and prepare for care", "পথ · সেবা খুঁজুন, প্রস্তুতি নিন")}</p>
        <h1 id="poth-title">{t("Find care. Prepare with confidence.", "সেবা খুঁজুন। প্রস্তুতি নিন।")}</h1>
        <p className={styles.lead}>{t("Find a place, check the details and prepare your questions. You can use the directory without GPS.", "প্রতিষ্ঠান খুঁজুন, তথ্য দেখুন, প্রশ্ন গুছিয়ে নিন। GPS ছাড়াই তালিকা ব্যবহার করতে পারবেন।")}</p>
        <nav className={styles.journey} aria-label={t("Poth sections", "পথের অংশগুলো")}>
          {journey.map(({ href, icon: Icon, main, title, text }) => <a key={href} href={href} className={`${styles.journeyCard} ${main ? styles.main : ""}`}>
            <span className={styles.iconTile}><Icon size={22} aria-hidden="true" /></span>
            <span><strong>{title}</strong><span>{text}</span></span>
            <ArrowRight size={20} aria-hidden="true" />
          </a>)}
        </nav>
        <div className={styles.safetyBar}>
          <a className={styles.dangerButton} href="tel:999"><Phone size={18} aria-hidden="true" />{t("Emergency? Call 999", "জরুরি? ৯৯৯-এ কল করুন")}</a>
          <p>{t("No booking or emergency dispatch in this app.", "এই অ্যাপে বুকিং বা জরুরি সেবা পাঠানো হয় না।")} <a className={styles.attribution} href="#poth-sos">{t("More help ↓", "আরও সহায়তা ↓")}</a></p>
        </div>
      </header>
      <PothFacilityExplorer onPrepare={setFacility} />
      <PothNearbyMap onPrepare={setFacility} />
      <PothVisitPreparation facility={facility} onClearFacility={() => setFacility(null)} />
      <details className={`${styles.panel} ${styles.disclosure}`}>
        <summary><span className={styles.sectionHead}><MessageCircleQuestion size={20} aria-hidden="true" />{t("Understand facility types", "প্রতিষ্ঠানের ধরন জানুন")}</span></summary>
        <PothCareCoverage />
      </details>
      <PothEmergencySOS />
      <footer className={`${styles.panel} ${styles.stack}`}>
        <h2>{t("Need help planning your care?", "সেবার পরিকল্পনায় সহায়তা চান?")}</h2>
        <div className={styles.ctaGrid}>
          <Link className={styles.ctaCard} href="/ask"><span className={styles.iconTile}><MessageCircleQuestion size={22} aria-hidden="true" /></span><span><strong>{t("Ask Barta", "বার্তাকে জিজ্ঞাসা করুন")}</strong><span>{t("Learn with source-backed answers.", "উৎসসহ উত্তরে জানুন।")}</span></span><ArrowRight size={20} aria-hidden="true" /></Link>
          <Link className={styles.ctaCard} href="/bondhon"><span className={styles.iconTile}><HeartHandshake size={22} aria-hidden="true" /></span><span><strong>{t("Explore Bondhon", "বন্ধন দেখুন")}</strong><span>{t("A separate request you control.", "আপনার নিয়ন্ত্রণে আলাদা অনুরোধ।")}</span></span><ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </footer>
    </div>
  </div>;
}
