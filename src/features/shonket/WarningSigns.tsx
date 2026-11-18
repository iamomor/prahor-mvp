import { ArrowRight, Baby, BookOpenText, Heart, HeartPulse, Info } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import styles from "./shonket.module.css";

const categories = [
  { slug: "pregnancy", title: "Pregnancy", description: "Reviewed information for pregnancy and antenatal care.", Icon: Baby },
  { slug: "labour-and-childbirth", title: "Labour and Childbirth", description: "Information about labour, birth and care around childbirth.", Icon: Heart },
  { slug: "postpartum", title: "Postpartum", description: "Information about care and wellbeing after birth.", Icon: BookOpenText },
  { slug: "perinatal-mental-health", title: "Perinatal Mental Health", description: "Information about emotional wellbeing during pregnancy and after birth.", Icon: HeartPulse },
];

export function WarningSigns() {
  return (
    <div className={styles.experience}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/safety">Shonket home</Link><span aria-hidden="true">/</span><span aria-current="page">Safety information</span>
      </nav>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>SHONKET · REVIEWED INFORMATION</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Browse by topic</h1>
        <p className={styles.lead}>Choose a topic to see whether clinician-reviewed information is available. No pending research is shown as approved guidance.</p>
      </header>
      <div className={styles.categoryGrid}>
        {categories.map(({ slug, title, description, Icon }, index) => (
          <AppCard as="article" key={slug} className={styles.categoryCard}>
            <div className={styles.categoryTop}><span className={styles.categoryIcon}><Icon size={22} aria-hidden="true" /></span><span className={styles.categoryIndex}>0{index + 1}</span></div>
            <h2 className={styles.cardTitle}>{title}</h2>
            <p className={styles.cardText}>{description}</p>
            <p className={styles.unavailableLabel}><Info size={15} aria-hidden="true" /> Clinician-reviewed information is not available yet.</p>
            <Link href={`/safety/information/${slug}`} className={styles.textLink}>View topic status <ArrowRight size={16} aria-hidden="true" /></Link>
          </AppCard>
        ))}
      </div>
      <aside className={styles.provenanceAside} aria-labelledby="provenance-title">
        <p className={styles.eyebrow}>CLEAR SOURCES</p>
        <h2 id="provenance-title" className={styles.subheading}>What approved information will show</h2>
        <p className={styles.cardText}>Each approved item will include its reviewed text, source link, clinical reviewer reference and review date.</p>
      </aside>
      <div className={styles.noticeBox}><Info size={18} aria-hidden="true" /><p>These topics organize future information; they are not clinical recommendations. No warning signs or urgency classifications are currently approved for publication.</p></div>
      <Link href="/safety" className={styles.backLink}><ArrowRight size={16} aria-hidden="true" /> Back to Safety Home</Link>
    </div>
  );
}
