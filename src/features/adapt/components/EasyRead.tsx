"use client";
import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/use-language";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { approvedEasyRead, hasApprovedEasyRead } from "../lib/easy-read";

/**
 * Shows a reviewed Easy Read version of `children` when she chose Easy Read and one is approved.
 * Otherwise the original stays exactly as it is. The original is always one tap away.
 */
export function EasyRead({ id, children }: { id: string; children: ReactNode }) {
  const { prefs } = useAdaptPreferences();
  const { language } = useLanguage();
  // A stored "on" from before the toggle was hidden must not leave her a notice she cannot turn off.
  if (prefs.simplifiedContent !== true || !hasApprovedEasyRead()) return <>{children}</>;
  const entry = approvedEasyRead(id);
  const bn = language === "bn";
  if (!entry) {
    return <>
      <p className="text-sm text-pro-muted" lang={language}>
        {bn ? "এই অংশের পর্যালোচিত সহজ পাঠ এখনো নেই। মূল লেখা দেখানো হচ্ছে।" : "No reviewed Easy Read version of this part yet. Showing the original."}
      </p>
      {children}
    </>;
  }
  const text = entry[language];
  return (
    <section aria-label={bn ? "সহজ পাঠ" : "Easy Read"} lang={language} className="grid gap-2 rounded-field border border-pro-border p-3" data-easy-read={entry.id}>
      <p className="text-xs font-semibold uppercase text-pro-muted">
        {bn ? `সহজ পাঠ · পর্যালোচনা: ${entry.reviewedBy}, ${entry.reviewedAt}` : `Easy Read · reviewed by ${entry.reviewedBy}, ${entry.reviewedAt}`}
      </p>
      <h2 className="text-lg font-semibold">{text.title}</h2>
      <ul className="grid gap-1">{text.sentences.map(sentence => <li key={sentence}>{sentence}</li>)}</ul>
      {text.nextAction && <p className="font-semibold">{text.nextAction}</p>}
      <details>
        <summary className="min-h-11 cursor-pointer text-pro-primary underline">{bn ? "মূল লেখা দেখুন" : "Show the original text"}</summary>
        {children}
      </details>
    </section>
  );
}
