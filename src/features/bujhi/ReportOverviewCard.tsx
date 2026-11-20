"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";

import { useLanguage } from "@/i18n/use-language";
import { buildReportOverview } from "./report-overview";

/** Plain-language "what is in this report" card. Explains words only; never judges values. */
export function ReportOverviewCard({ rawText }: { rawText: string }) {
  const { t } = useLanguage();
  const overview = useMemo(() => buildReportOverview(rawText), [rawText]);
  if (overview.kind === "unknown" && !overview.terms.length) return null;
  return <section className="grid min-w-0 gap-4" aria-label={t({ en: "What is in this report", bn: "এই রিপোর্টে কী আছে" })}>
    <h3 className="flex items-center gap-2 text-lg font-semibold"><BookOpen aria-hidden="true" className="size-5 shrink-0 text-pro-primary" />{t({ en: "What is in this report", bn: "এই রিপোর্টে কী আছে" })}</h3>
    <p className="max-w-[65ch]">{t(overview.intro)}</p>
    {overview.timeMentions.length > 0 && <p className="text-pro-muted">{t({ en: "Time written on the report (as printed): ", bn: "রিপোর্টে লেখা সময় (যেভাবে ছাপা আছে): " })}<span className="font-semibold text-pro-text">{overview.timeMentions.join(" · ")}</span></p>}
    <dl className="grid gap-3">
      {overview.terms.map((term) => <div key={term.key} className="min-w-0 rounded-field border border-pro-border bg-pro-bg p-4">
        <dt className="font-semibold">{t(term.title)}</dt>
        <dd className="mt-1 max-w-[65ch] text-pro-muted">{t(term.meaning)}</dd>
        <dd className="mt-2 text-sm text-pro-muted [overflow-wrap:anywhere]">{t({ en: "Read from your photo: ", bn: "আপনার ছবি থেকে পড়া: " })}“{term.seen}”</dd>
      </div>)}
    </dl>
    <p className="rounded-field bg-pro-bg p-4 text-pro-muted">{t({ en: "This only explains the words. It does not say whether anything is normal or wrong. The photo may have been read with mistakes, so check the paper report. Ask your health worker or doctor what it means for you. If you have a danger sign, go to a clinic now.", bn: "এটি শুধু শব্দের মানে বোঝায়। কিছু স্বাভাবিক না অস্বাভাবিক, তা বলে না। ছবি পড়তে ভুল হয়ে থাকতে পারে, তাই কাগজের রিপোর্টের সঙ্গে মিলিয়ে নিন। আপনার ক্ষেত্রে এর মানে কী, স্বাস্থ্যকর্মী বা ডাক্তারকে জিজ্ঞেস করুন। বিপদচিহ্ন থাকলে এখনই ক্লিনিকে যান।" })}</p>
  </section>;
}
