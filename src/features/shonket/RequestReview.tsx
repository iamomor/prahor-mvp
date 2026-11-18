"use client";

import { ArrowRight, ClipboardCheck, PencilLine } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { useCareRequestDraft } from "./care-request-draft";
import { CareRequestEmpty } from "./CareRequestEmpty";
import styles from "./shonket.module.css";

const methodLabels = { text: "Text message", aac: "AAC-friendly", call: "Phone call (visual choice only)" } as const;

export function RequestReview() {
  const draft = useCareRequestDraft();
  if (!draft.message.trim()) return <CareRequestEmpty screen="review" />;

  return (
    <div className={styles.experience}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>STEP 2 OF 3 · REVIEW</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Review your message</h1>
        <p className={styles.lead}>Check the message and communication method you chose.</p>
      </header>
      <AppCard as="article" className={styles.reviewCard} aria-label="Message review">
        <div className={styles.reviewHeader}><span className={styles.reviewIcon}><ClipboardCheck size={21} aria-hidden="true" /></span><div><p className={styles.eyebrow}>MESSAGE PREVIEW</p><h2 className={styles.cardTitle}>Your details</h2></div></div>
        <dl className={styles.reviewList}>
          <div><dt>Preferred method</dt><dd>{methodLabels[draft.method]}</dd></div>
          <div className={styles.messageSummary}><dt>Message you entered</dt><dd className={styles.userMessage}>{draft.message}</dd></div>
          <div><dt>Shown in this preview</dt><dd>Your message and selected communication method only.</dd></div>
        </dl>
        <div className={styles.demoNoticeBox}><strong>Demo only — not sent.</strong><span>No recipient is selected. Continuing to status will not submit a request or place a call.</span></div>
        <div className={styles.reviewActions}>
          <Link href="/app/care" className={`pro-btn pro-btn-secondary ${styles.reviewButton}`}><PencilLine size={17} aria-hidden="true" /> Edit message</Link>
          <Link href="/app/care/status" className={`pro-btn pro-btn-primary ${styles.reviewButton}`}>View demo status <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </AppCard>
    </div>
  );
}
