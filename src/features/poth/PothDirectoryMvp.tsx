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
        <h1 id="poth-title">{t("Find care with clearer information", "সঠিক তথ্য জেনে সেবা খুঁজুন")}</h1>
        <p>{t("Find a facility, check what is known and prepare your questions. Search saved records without location permission; nearby search is optional.", "প্রতিষ্ঠান খুঁজুন, কী তথ্য জানা আছে দেখুন এবং প্রশ্ন প্রস্তুত করুন। অবস্থানের অনুমতি ছাড়াই রাখা তালিকায় খুঁজতে পারবেন; কাছের সেবা খোঁজা ঐচ্ছিক।")}</p>
        <nav className={styles.actions} aria-label={t("Poth sections", "পথের অংশগুলো")}>
          <a className={`${styles.button} ${styles.primary}`} href="#poth-reviewed-directory">{t("Search directory", "তালিকায় খুঁজুন")}</a>
          <a className={styles.button} href="#poth-nearby-map">{t("Nearby care", "কাছের সেবা")}</a>
          <a className={styles.button} href="#poth-visit-preparation">{t("Prepare a visit", "সাক্ষাতের প্রস্তুতি")}</a>
          <a className={styles.button} href="#poth-sos">{t("Emergency information", "জরুরি তথ্য")}</a>
        </nav>
        <p className={styles.notice}>{t("No appointment booking or emergency dispatch is connected. A listing does not confirm maternity services, open hours or accessible entrances.", "অ্যাপয়েন্টমেন্ট বুকিং বা জরুরি সেবা পাঠানো যুক্ত নেই। তালিকায় থাকা মানেই মাতৃসেবা, খোলার সময় বা প্রবেশগম্য দরজা নিশ্চিত নয়।")}</p>
      </header>
      <PothFacilityExplorer onPrepare={setFacility} />
      <PothNearbyMap />
      <PothVisitPreparation facility={facility} onClearFacility={() => setFacility(null)} />
      <details className={styles.panel}>
        <summary className={styles.button}>{t("Understand facility types", "প্রতিষ্ঠানের ধরন জানুন")}</summary>
        <PothCareCoverage />
      </details>
      <PothEmergencySOS />
      <footer className={`${styles.panel} ${styles.stack}`}>
        <h2>{t("Need help planning your care?", "সেবার পরিকল্পনায় সহায়তা চান?")}</h2>
        <p>{t("Barta helps prepare educational questions. Bondhon lets you review and authorize a separate simulated care request; opening these links shares no facility selection, location or health record.", "বার্তায় স্বাস্থ্যশিক্ষার প্রশ্ন প্রস্তুত করতে পারবেন। বন্ধনে আলাদাভাবে সিমুলেটেড সেবার অনুরোধ পর্যালোচনা ও অনুমতি দিতে পারবেন; এই লিংক খুললে প্রতিষ্ঠান, অবস্থান বা স্বাস্থ্য রেকর্ড শেয়ার হয় না।")}</p>
        <div className={styles.actions}><Link className={styles.button} href="/ask">{t("Ask Barta", "বার্তাকে জিজ্ঞাসা করুন")}</Link><Link className={styles.button} href="/bondhon">{t("Explore Bondhon", "বন্ধন দেখুন")}</Link></div>
      </footer>
    </div>
  </div>;
}
