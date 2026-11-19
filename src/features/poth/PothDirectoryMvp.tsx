"use client";
import { useState } from "react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import Link from "next/link";
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
  return <div lang={language} className={`${styles.root} ${embedded ? "" : styles.public}`}>
    <div className={`${styles.container} ${styles.stack}`}>
      {!embedded && <header className={styles.actions}>
        <Link className={styles.button} href="/">PROHOR | প্রহর</Link>
        <AccessPreferencesControl />
        <div className={styles.actions} role="group" aria-label="Language / ভাষা">
          <button className={styles.button} aria-pressed={bn} onClick={() => setLanguage("bn")}>বাংলা</button>
          <button className={styles.button} aria-pressed={!bn} onClick={() => setLanguage("en")}>English</button>
        </div>
      </header>}
      <header className={`${styles.panel} ${styles.hero} ${styles.stack}`}>
        <p>{t("Poth · Find and prepare for care", "পথ · সেবা খুঁজুন, প্রস্তুতি নিন")}</p>
        <h1 id="poth-title">{t("Find care. Prepare with confidence.", "সেবা খুঁজুন। প্রস্তুতি নিন।")}</h1>
        <p>{t("Find a place, check the details and prepare your questions. Use the directory without GPS.", "প্রতিষ্ঠান খুঁজুন, তথ্য দেখুন, প্রশ্ন গুছিয়ে নিন। GPS ছাড়াই তালিকা ব্যবহার করতে পারবেন।")}</p>
        <nav className={styles.actions} aria-label={t("Poth sections", "পথের অংশগুলো")}>
          <a className={`${styles.button} ${styles.primary}`} href="#poth-reviewed-directory">{t("Search directory", "তালিকায় খুঁজুন")}</a>
          <a className={styles.button} href="#poth-nearby-map">{t("Nearby care", "কাছের সেবা")}</a>
          <a className={styles.button} href="#poth-visit-preparation">{t("Prepare a visit", "সাক্ষাতের প্রস্তুতি")}</a>
        </nav>
        <div className={styles.safetyStrip}><a href="tel:999">{t("Emergency? Call 999", "জরুরি সহায়তা? ৯৯৯-এ কল করুন")}</a><span>{t("No booking or emergency dispatch in this app.", "এই অ্যাপে বুকিং বা জরুরি সেবা পাঠানো হয় না।")}</span><a href="#poth-sos">{t("More help", "আরও সহায়তা")}</a></div>
      </header>
      <PothFacilityExplorer onPrepare={setFacility} />
      <PothNearbyMap onPrepare={setFacility} />
      <PothVisitPreparation facility={facility} onClearFacility={() => setFacility(null)} />
      <details className={styles.panel}>
        <summary className={styles.button}>{t("Understand facility types", "প্রতিষ্ঠানের ধরন জানুন")}</summary>
        <PothCareCoverage />
      </details>
      <PothEmergencySOS />
      <footer className={`${styles.panel} ${styles.stack}`}>
        <h2>{t("Need help planning your care?", "সেবার পরিকল্পনায় সহায়তা চান?")}</h2>
        <p className={styles.meta}>{t("Learn with Barta or explore a separate, consent-controlled request in Bondhon.", "বার্তায় জানুন, বা বন্ধনে নিজের অনুমতিতে আলাদা সেবার অনুরোধ দেখুন।")}</p>
        <div className={styles.actions}><Link className={styles.button} href="/ask">{t("Ask Barta", "বার্তাকে জিজ্ঞাসা করুন")}</Link><Link className={styles.button} href="/bondhon">{t("Explore Bondhon", "বন্ধন দেখুন")}</Link></div>
      </footer>
    </div>
  </div>;
}
