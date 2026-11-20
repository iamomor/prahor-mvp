"use client";
import { ArrowRight, Baby, BookOpenText, Heart, HeartPulse, Info } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

const categories = [
  { slug: "pregnancy", title: "pregnancy", description: "pregnancyDescription", Icon: Baby },
  { slug: "labour-and-childbirth", title: "labour", description: "labourDescription", Icon: Heart },
  { slug: "postpartum", title: "postpartum", description: "postpartumDescription", Icon: BookOpenText },
  { slug: "perinatal-mental-health", title: "mental", description: "mentalDescription", Icon: HeartPulse },
] as const;

export function WarningSigns() {
  const { language, t } = useLanguage();
  const copy = translations.shonket;
  return <div className={styles.experience} lang={language}>
    <nav className={styles.breadcrumbs} aria-label={t(copy.nav.breadcrumb)}><Link href="/safety">{t(copy.nav.shonketHome)}</Link><span aria-hidden="true">/</span><span aria-current="page">{t(copy.nav.safetyInformation)}</span></nav>
    <header className={styles.pageHeader}><p className={styles.eyebrow}>{t(copy.warningList.eyebrow)}</p><h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{t(copy.warningList.title)}</h1><p className={styles.lead}>{t(copy.warningList.lead)}</p></header>
    <aside className={styles.warningNotice} aria-label={t(copy.nav.emergencyHelp)}><strong>{t(copy.emergency.somethingWrong)}</strong><span><a href="tel:999">{t(copy.emergency.call)}</a> {language === "bn" ? "অথবা" : "or"} <Link href="/app/care/new">{t(copy.emergency.askPerson)}</Link>.</span></aside>
    <div className={styles.categoryGrid}>{categories.map(({ slug, title, description, Icon }, index) => <AppCard as="article" key={slug} className={styles.categoryCard}>
      <div className={styles.categoryTop}><span className={styles.categoryIcon}><Icon size={22} aria-hidden="true" /></span><span className={styles.categoryIndex}>0{index + 1}</span></div>
      <h2 className={styles.cardTitle}>{t(copy.warningList[title])}</h2><p className={styles.cardText}>{t(copy.warningList[description])}</p>
      <p className={styles.unavailableLabel}><Info size={15} aria-hidden="true" /> {t(copy.warningList.clinicianUnavailable)}</p>
      <Link href={`/safety/information/${slug}`} className={styles.textLink}>{t(copy.warningList.viewStatus)} <ArrowRight size={16} aria-hidden="true" /></Link>
    </AppCard>)}</div>
    <aside className={styles.provenanceAside} aria-labelledby="provenance-title"><p className={styles.eyebrow}>{t(copy.warningList.sourcesEyebrow)}</p><h2 id="provenance-title" className={styles.subheading}>{t(copy.warningList.sourcesTitle)}</h2><p className={styles.cardText}>{t(copy.warningList.sourcesDescription)}</p></aside>
    <div className={styles.noticeBox}><Info size={18} aria-hidden="true" /><p>{t(copy.warningList.pendingNotice)}</p></div>
    <Link href="/safety" className={styles.backLink}><ArrowRight size={16} aria-hidden="true" /> {t(copy.warningList.backHome)}</Link>
  </div>;
}
