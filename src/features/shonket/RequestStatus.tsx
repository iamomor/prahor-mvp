"use client";

import { ArrowRight, CircleSlash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import { useCareRequestDraft } from "./care-request-draft";
import { CareRequestEmpty } from "./CareRequestEmpty";
import styles from "./shonket.module.css";

export function RequestStatus() {
  const draft = useCareRequestDraft();
  if (!draft.message.trim()) return <CareRequestEmpty screen="status" />;

  return (
    <div className={styles.experience}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>STEP 3 OF 3 · DEMO STATUS</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>This message was not sent</h1>
        <p className={styles.lead}>This preview does not connect to a care worker or submit your message.</p>
      </header>
      <AppCard as="section" className={styles.statusCard} aria-labelledby="not-sent-heading">
        <div className={styles.statusIcon}><CircleSlash2 size={27} aria-hidden="true" /></div>
        <div className={styles.statusContent}>
          <p className={styles.eyebrow}>NOT SENT</p>
          <h2 id="not-sent-heading" className={styles.cardTitle}>No one has received this message</h2>
          <p className={styles.cardText}>This page did not submit a request. No delivery, provider response or acknowledgement has occurred.</p>
        </div>
        <div className={styles.statusBoundary}><ShieldAlert size={18} aria-hidden="true" /><p>The current Bondhon starter endpoint returns HTTP 501 with status “not_sent”. This preview does not call that endpoint or provide emergency response.</p></div>
        <Link href="/safety" className={`pro-btn pro-btn-secondary ${styles.statusAction}`}>Return to Shonket <ArrowRight size={17} aria-hidden="true" /></Link>
      </AppCard>
    </div>
  );
}
