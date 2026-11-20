"use client";
import { ArrowRight, BookOpenText, HeartHandshake, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { ReadAloudButton, useAdaptPreferences } from "@/features/adapt";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

/** Listen for the reviewed card text, shown only when she chose "Show Listen buttons"; it never plays by itself. */
function Listen({ parts }: { parts: string[] }) {
  const { prefs } = useAdaptPreferences();
  const { language } = useLanguage();
  if (prefs.readAloud !== true) return null;
  return <ReadAloudButton text={parts.join(" ")} language={language} label={language === "bn" ? "পড়ে শুনুন" : "Listen"} />;
}

export function SafetyHome() {
  const { language, t } = useLanguage();
  const c = translations.shonket.home;
  return <div className={styles.experience} lang={language}>
    <header className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>{t(c.eyebrow)}</p><h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{t(c.title)}</h1><p className={styles.lead}>{t(c.lead)}</p><Link href="/app/care/new" className={`pro-btn pro-btn-primary ${styles.heroAction}`}><HeartHandshake size={19} aria-hidden="true" /> {t(c.humanHelp)} <ArrowRight size={18} aria-hidden="true" /></Link></div><div className={styles.heroArt} aria-hidden="true"><div className={styles.artCircle}><ShieldCheck size={58} strokeWidth={1.4} /></div><span className={styles.artLeaf} /><span className={styles.artDot} /></div><p className={styles.heroCaption}><ShieldCheck size={16} aria-hidden="true" /> {t(c.choiceNote)}</p></header>
    <section className={styles.emergencyServices} aria-labelledby="bangladesh-services-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{t(c.servicesEyebrow)}</p><h2 id="bangladesh-services-title" className={`${styles.sectionTitle} pro-editorial`}>{t(c.servicesTitle)}</h2></div><p className={styles.sectionIntro}>{t(c.servicesLead)}</p></div><div className={styles.serviceGrid}>
      <AppCard as="article" className={styles.serviceCard}><div className={styles.serviceTop}><span className={`${styles.serviceIcon} ${styles.emergencyIcon}`}><Phone size={22} aria-hidden="true" /></span><span className={styles.serviceKind}>{t(c.emergencyKind)}</span></div><h3 className={styles.cardTitle}>{t(c.emergencyName)}</h3><a className={styles.serviceNumber} href="tel:999" aria-label={t(c.emergencyCallLabel)}>{t({ en: "999", bn: "৯৯৯" })}</a><p className={styles.cardText}>{t(c.emergencyDescription)}</p><p className={styles.serviceBangla}>{t(c.emergencyBangla)}</p><div className={styles.serviceCaveat}>{t(c.emergencyCaveat)}</div><Listen parts={[t(c.emergencyName), t(c.emergencyDescription), t(c.emergencyBangla), t(c.emergencyCaveat)]} /><div className={styles.serviceLinks}><a href="tel:999" className={`pro-btn pro-btn-primary ${styles.serviceCall}`}><Phone size={17} aria-hidden="true" /> {t(c.call999)}</a><a href="https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89" target="_blank" rel="noreferrer">{t(c.officialDirectory)} <ArrowRight size={15} aria-hidden="true" /></a></div><p className={styles.sourceDate}>{t(c.emergencyChecked)}</p></AppCard>
      <AppCard as="article" className={styles.serviceCard}><div className={styles.serviceTop}><span className={styles.serviceIcon}><HeartHandshake size={22} aria-hidden="true" /></span><span className={styles.serviceKind}>{t(c.healthKind)}</span></div><h3 className={styles.cardTitle}>{t(c.healthName)}</h3><a className={styles.serviceNumber} href="tel:16263" aria-label={t(c.healthCallLabel)}>{t({ en: "16263", bn: "১৬২৬৩" })}</a><p className={styles.cardText}>{t(c.healthDescription)}</p><p className={styles.serviceBangla}>{t(c.healthBangla)}</p><p className={styles.serviceCaveat}>{t(c.healthCaveat)}</p><Listen parts={[t(c.healthName), t(c.healthDescription), t(c.healthBangla), t(c.healthCaveat)]} /><div className={styles.serviceLinks}><a href="tel:16263" className={`pro-btn pro-btn-secondary ${styles.serviceCall}`}><Phone size={17} aria-hidden="true" /> {t(c.call16263)}</a><a href="https://16263.dghs.gov.bd/" target="_blank" rel="noreferrer">{t(c.dghsWebsite)} <ArrowRight size={15} aria-hidden="true" /></a></div><p className={styles.sourceDate}>{t(c.healthChecked)}</p></AppCard>
    </div><p className={styles.dispatchDisclosure}>{t(translations.shonket.emergency.helpWithoutAi)} {t(c.dispatchDisclosure)}</p></section>
    <section className={styles.homeNextSteps} aria-labelledby="safety-choices-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{t(c.startEyebrow)}</p><h2 id="safety-choices-title" className={`${styles.sectionTitle} pro-editorial`}>{t(c.choicesTitle)}</h2></div><p className={styles.sectionIntro}>{t(c.choicesLead)}</p></div><div className={styles.homeActionGrid}>
      <AppCard as="article" className={styles.helpCard}><div className={`${styles.choiceIcon} ${styles.helpIcon}`}><HeartHandshake size={23} aria-hidden="true" /></div><p className={styles.actionKicker}>{t(c.humanKicker)}</p><h3 className={styles.cardTitle}>{t(c.prepareMessage)}</h3><p className={styles.cardText}>{t(c.prepareDescription)}</p><Link href="/app/care/new" className={`pro-btn pro-btn-primary ${styles.cardAction}`}>{t(c.startMessage)} <ArrowRight size={17} aria-hidden="true" /></Link></AppCard>
      <div className={styles.informationPath}><div className={`${styles.choiceIcon} ${styles.infoIcon}`}><BookOpenText size={23} aria-hidden="true" /></div><div><p className={styles.actionKicker}>{t(c.reviewedKicker)}</p><h3 className={styles.cardTitle}>{t(c.explore)}</h3><p className={styles.cardText}>{t(c.exploreDescription)}</p></div><Link href="/safety/information" className={styles.textLink}>{t(c.visitInformation)} <ArrowRight size={17} aria-hidden="true" /></Link></div>
    </div></section>
    <section className={styles.trustStrip} aria-label={t(c.trustLabel)}><div><span className={styles.trustIcon}><BookOpenText size={18} aria-hidden="true" /></span><p><strong>{t(c.reviewedContent)}</strong><span>{t(c.shownAfterReview)}</span></p></div><div><span className={styles.trustIcon}><HeartHandshake size={18} aria-hidden="true" /></span><p><strong>{t(c.yourWords)}</strong><span>{t(c.notSent)}</span></p></div><p className={styles.previewNotice}>{t(c.preview)}</p></section>
  </div>;
}
