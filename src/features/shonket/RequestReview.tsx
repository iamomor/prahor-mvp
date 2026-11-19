"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CareRequestForm } from "@/features/bondhon/CareRequestForm";
import { rememberRequestId } from "@/features/bondhon/request-history";
import { useLanguage } from "@/i18n/use-language";
import { useCareRequestDraft, updateCareRequestDraft, type CareRequestDraft } from "./care-request-draft";
import { CareRequestEmpty } from "./CareRequestEmpty";
import styles from "./shonket.module.css";

/** Shonket uses the same reviewed, atomic permission flow as Bondhon. */
export function RequestReview({ account }: { account: string }) {
  const draft = useCareRequestDraft();
  const router = useRouter();
  const { t } = useLanguage();
  const [started, setStarted] = useState(false);
  const saveDraft = useCallback((next: CareRequestDraft) => {
    setStarted(true);
    updateCareRequestDraft(next);
  }, []);
  if (!started && !draft.message.trim()) return <CareRequestEmpty screen="review" />;
  return <section className={styles.experience}>
    <header className={styles.pageHeader}>
      <p className={styles.eyebrow}>{t({ en: "STEP 2 OF 3 · REVIEW AND SEND", bn: "ধাপ ২ / ৩ · পর্যালোচনা ও পাঠানো" })}</p>
      <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{t({ en: "Review before sending", bn: "পাঠানোর আগে পর্যালোচনা করুন" })}</h1>
      <p className={styles.lead}>{t({ en: "Choose who receives this, what you share and when permission ends. Review before approving.", bn: "প্রাপক, তথ্য এবং অনুমতির মেয়াদ বাছুন। অনুমোদনের আগে পর্যালোচনা করুন।" })}</p>
    </header>
    <CareRequestForm account={account} initialMessage={draft.message} initialMethod={draft.method}
      onDraftChange={saveDraft}
      onCreated={request => {
        rememberRequestId(request.id);
        updateCareRequestDraft({ message: "", method: "text" });
        router.push(`/app/care/status?id=${request.id}`);
      }} />
  </section>;
}
