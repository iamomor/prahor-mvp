import { ArrowLeft, FileSearch2, Info } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import styles from "./shonket.module.css";

const categoryTitles: Record<string, string> = {
  pregnancy: "Pregnancy",
  "labour-and-childbirth": "Labour and Childbirth",
  postpartum: "Postpartum",
  "perinatal-mental-health": "Perinatal Mental Health",
};

export function WarningDetail({ slug }: { slug: string }) {
  const categoryTitle = categoryTitles[slug];
  return (
    <div className={styles.experience}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/safety">Shonket home</Link><span aria-hidden="true">/</span><Link href="/safety/information">Safety information</Link><span aria-hidden="true">/</span><span aria-current="page">{categoryTitle ?? "Information detail"}</span>
      </nav>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>INFORMATION DETAIL · PREVIEW</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{categoryTitle ?? "No approved item to display"}</h1>
        <p className={styles.lead}>Clinician-reviewed information is not available yet. No clinical content has been supplied for this preview.</p>
      </header>
      <AppCard as="article" className={styles.detailArticle}>
        <div className={styles.detailArticleHeader}>
          <span className={styles.emptyIcon}><FileSearch2 size={26} aria-hidden="true" /></span>
          <div><p className={styles.eyebrow}>PENDING APPROVAL · NOT FOR PUBLICATION</p><h2 className={styles.cardTitle}>Waiting for reviewed content</h2></div>
        </div>
        <p className={styles.cardText}>When an approved item is available, its reviewed description and guidance will appear here without changing the original source wording.</p>
        <dl className={styles.provenanceList}>
          <div><dt>Source</dt><dd>Not available</dd></div>
          <div><dt>Clinical reviewer</dt><dd>Not available</dd></div>
          <div><dt>Review date</dt><dd>Not available</dd></div>
        </dl>
      </AppCard>
      <div className={styles.noticeBox}><Info size={18} aria-hidden="true" /><p>This is an unavailable-content state, not a clinical warning or urgency classification.</p></div>
      <Link href="/safety/information" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Back to safety information</Link>
    </div>
  );
}
