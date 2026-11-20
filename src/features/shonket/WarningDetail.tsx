"use client";
import { ArrowLeft, BookOpenText, ExternalLink, FileText, HeartHandshake, Info, Phone } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { SOURCE, topicContent } from "./topic-content";
import { educationTopics } from "@/features/barta/education-topics";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

const topics = {
  pregnancy: { title: "pregnancy", question: educationTopics.warningSigns.en },
  "labour-and-childbirth": { title: "labour", question: educationTopics.birthPlan.en },
  postpartum: { title: "postpartum", question: educationTopics.postnatalVisits.en },
  "perinatal-mental-health": { title: "mental", question: educationTopics.mentalWellbeing.en },
} as const;

export function WarningDetail({ slug }: { slug: string }) {
  const { language, t } = useLanguage();
  const copy = translations.shonket;
  const topic = topics[slug as keyof typeof topics];
  const content = topicContent[slug];
  return <div className={styles.experience} lang={language}>
    <nav className={styles.breadcrumbs} aria-label={t(copy.nav.breadcrumb)}><Link href="/safety">{t(copy.nav.shonketHome)}</Link><span aria-hidden="true">/</span><Link href="/safety/information">{t(copy.nav.safetyInformation)}</Link><span aria-hidden="true">/</span><span aria-current="page">{topic ? t(copy.warningList[topic.title]) : t(copy.detail.fallbackTitle)}</span></nav>
    <header className={styles.pageHeader}><p className={styles.eyebrow}>{t(copy.detail.eyebrow)}</p><h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{topic ? t(copy.warningList[topic.title]) : t(copy.detail.fallbackTitle)}</h1><p className={styles.lead}>{t(copy.detail.lead)}</p></header>
    <section className={styles.warningActions} aria-labelledby="warning-actions-title">
      <h2 id="warning-actions-title">{t(copy.emergency.rightNow)}</h2>
      <a className="pro-btn pro-btn-primary" href="tel:999"><Phone size={18} aria-hidden="true" /> {t(copy.emergency.callNow)}</a>
      <Link className="pro-btn pro-btn-secondary" href="/app/care/new"><HeartHandshake size={18} aria-hidden="true" /> {t(copy.emergency.askPerson)}</Link>
      <Link className="pro-btn pro-btn-secondary" href={`/ask?q=${encodeURIComponent(topic?.question ?? "")}`}><BookOpenText size={18} aria-hidden="true" /> {t(copy.emergency.readBarta)}</Link>
    </section>
    {content ? <AppCard as="article" className={styles.detailArticle}>
      <div className={styles.detailArticleHeader}><span className={styles.emptyIcon}><FileText size={26} aria-hidden="true" /></span><div><p className={styles.eyebrow}>{t(copy.detail.pending)}</p><h2 className={styles.cardTitle}>{t(copy.detail.draftTitle)}</h2></div></div>
      <p className={styles.cardText}>{t(content.intro)}</p>
      {content.groups.map(g => <section key={g.id} aria-labelledby={`g-${g.id}`}>
        <h3 id={`g-${g.id}`} className={styles.subheading}>{t(g.title)}</h3>
        <ul>{g.items.map(item => <li key={item.en}>{t(item)}</li>)}</ul>
        <p className={styles.cardText}>{t(copy.detail.citedFrom)} {g.cite}</p>
      </section>)}
      <dl className={styles.provenanceList}>
        <div><dt>{t(copy.detail.source)}</dt><dd><a href={SOURCE.url} target="_blank" rel="noopener noreferrer">{SOURCE.title} <ExternalLink size={14} aria-hidden="true" /></a> · {SOURCE.org}, {SOURCE.year} · {t(copy.detail.checkedOn)} {SOURCE.checked}</dd></div>
        <div><dt>{t(copy.detail.reviewer)}</dt><dd>{t(copy.detail.notReviewed)}</dd></div>
      </dl>
    </AppCard> : null}
    <div className={styles.noticeBox}><Info size={18} aria-hidden="true" /><p>{t(copy.detail.draftNotice)}</p></div>
    <Link href="/safety/information" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> {t(copy.detail.back)}</Link>
  </div>;
}
