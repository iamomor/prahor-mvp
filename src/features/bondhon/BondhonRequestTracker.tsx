"use client";
import { useId } from "react";
import { useLanguage } from "@/i18n/use-language";
import type { SupportRequestStatus, SupportRequestEventSummary } from "@/lib/contracts/bondhon";
import { buildTracker } from "./bondhon-status";
import { statusNames, words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

export function BondhonRequestTracker({ request, events, historyUnavailable }: {
  request: { id: string; status: SupportRequestStatus; createdAt: string; revision: number };
  events: readonly SupportRequestEventSummary[]; historyUnavailable: boolean;
}) {
  const { language, t } = useLanguage();
  const id = useId();
  const stages = buildTracker([{ type: "submitted", at: request.createdAt }, ...events
    .filter(event => event.requestId === request.id && event.requestRevision <= request.revision)
    .map(event => ({ type: event.status, at: event.occurredAt }))]);
  return <section className={styles.panel} aria-labelledby={`${id}-tracker`}>
    <h3 id={`${id}-tracker`}>{t(words("What has happened", "এখন পর্যন্ত যা হয়েছে"))}</h3>
    <p>{t(words("Delivery means saved to the simulated queue. Acknowledgement and a response each need separate server confirmation.", "পৌঁছানো মানে সিমুলেটেড তালিকায় সংরক্ষিত হওয়া। গ্রহণ ও উত্তর প্রতিটির জন্য আলাদা সার্ভার নিশ্চিতকরণ দরকার।"))}</p>
    <ol className={styles.tracker}>{stages.map(stage => {
      const current = stage.status === request.status;
      const recorded = stage.reached || current;
      return <li key={stage.status} className={styles.trackerStage} data-recorded={recorded} aria-current={current ? "step" : undefined}>
        <span aria-hidden="true" className={styles.stageMark}>{recorded ? "✓" : "○"}</span>
        <div><strong>{t(statusNames[stage.status])}</strong>
          <p>{t(current ? words("Current server status", "সার্ভারের বর্তমান অবস্থা") : recorded ? words("Recorded", "লিপিবদ্ধ হয়েছে") : words("No event shown", "এই ঘটনার তথ্য দেখানো হয়নি"))}</p>
          {stage.at && <time dateTime={stage.at}>{new Date(stage.at).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</time>}
        </div>
      </li>;
    })}</ol>
    {historyUnavailable && <p className={styles.notice}>{t(words("Event history could not be loaded completely. The current status above comes from the saved request. Refresh to check again.", "ঘটনার ইতিহাস পুরোপুরি আনা যায়নি। উপরের বর্তমান অবস্থা সংরক্ষিত অনুরোধ থেকে এসেছে। আবার যাচাই করতে রিফ্রেশ করুন।"))}</p>}
  </section>;
}
