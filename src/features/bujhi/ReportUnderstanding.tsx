"use client";

import Link from "next/link";
import { BookOpen, CheckCheck, ClipboardList, ShieldCheck } from "lucide-react";
import type { ExtractedReportField } from "./types";
import { explainCheckedField, understandingSummary, type UnderstandingLanguage } from "./report-understanding";

export function ReportUnderstanding({ fields, language }: { fields: ExtractedReportField[]; language: UnderstandingLanguage }) {
  const w = (bn: string, en: string) => language === "bn" ? bn : en;
  const summary = understandingSummary(fields);
  const checked = fields.filter((field) => field.reviewStatus === "verified");
  if (!checked.length) return <p role="status">{w("ব্যাখ্যা দেখতে আগে মূল রিপোর্টের সঙ্গে অন্তত একটি ফল মিলিয়ে দেখুন।", "Check at least one result against the original before opening an explanation.")}</p>;
  return <section className="grid min-w-0 gap-6" lang={language} aria-label={w("আপনার রিপোর্টের ব্যাখ্যা", "Your report explained")}>
    <header className="grid gap-4 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-8">
      <p className="flex items-center gap-2 font-semibold text-pro-primary"><BookOpen aria-hidden="true" className="size-5 shrink-0" />{w("একটু একটু করে, পরিষ্কারভাবে", "A clearer picture, one result at a time")}</p>
      <h2 className="text-2xl font-semibold sm:text-3xl">{w("আপনার রিপোর্ট, সহজ ভাষায়", "Your report, in simple words")}</h2>
      <p className="max-w-[65ch] text-pro-muted">{w("যে তথ্য আপনি মিলিয়ে দেখেছেন, শুধু সেটিই এখানে আছে। এটি শিক্ষামূলক ব্যাখ্যা; চিকিৎসকের পর্যালোচনা নয়।", "These explanations use only the information you checked. This is educational guidance, not a clinician review.")}</p>
      <dl className="grid gap-4 border-t border-pro-border pt-4 sm:grid-cols-3">
        {[[summary.checked, w("ফল মিলিয়ে দেখা হয়েছে", "results checked by you")], [summary.outsidePrinted, w("মুদ্রিত সীমার বাইরে", "outside the printed interval")], [summary.noComparison, w("তুলনা করা যায়নি", "without a confirmed comparison")]].map(([count, label]) => <div key={label}><dt className="text-pro-muted">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{count}</dd></div>)}
      </dl>
      <p className="text-pro-muted">{w("সীমার বাইরে মান মানেই রোগ নয়; সীমার মধ্যে মানও সুস্থতার নিশ্চয়তা নয়।", "An interval comparison alone cannot establish a diagnosis or confirm good health.")}</p>
      {summary.pending > 0 && <p role="status">{w("কিছু ফল এখনো যাচাই বাকি। সেগুলোর ব্যাখ্যা দেখানো হচ্ছে না।", "Some results still need checking. They are excluded from these explanations.")}</p>}
    </header>
    <div className="grid min-w-0 gap-4">
      {checked.map((field) => {
        const explanation = explainCheckedField(field, language)!;
        const comparison = explanation.comparison;
        const status = comparison?.position === "below" ? w("মুদ্রিত সীমার নিচে", "Below the printed interval") : comparison?.position === "above" ? w("মুদ্রিত সীমার ওপরে", "Above the printed interval") : comparison ? w("মুদ্রিত সীমার মধ্যে", "Within the printed interval") : w("তুলনার জন্য যথেষ্ট তথ্য নেই", "Not enough information to compare");
        return <article key={field.id} className="min-w-0 rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0"><h3 className="text-xl font-semibold [overflow-wrap:anywhere]">{field.label}</h3><p className="mt-2 whitespace-pre-wrap text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{field.value} <span className="text-lg font-normal">{field.unit}</span></p></div>
            <p className="flex items-center gap-2 text-pro-primary"><CheckCheck aria-hidden="true" className="size-5 shrink-0" />{w("আপনার যাচাই করা", "Checked by you")}</p>
          </div>
          <div className="mt-5 grid gap-4 border-t border-pro-border pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
            <div className="grid content-start gap-3"><h4 className="font-semibold">{w("এটি কী বলে", "What this tells you")}</h4><p className="max-w-[65ch]">{explanation.meaning}</p><p className="text-pro-muted">{explanation.context}</p></div>
            <div className="grid content-start gap-3 rounded-field bg-pro-bg p-4">
              <h4 className="font-semibold">{status}</h4>
              <p>{comparison ? w("রিপোর্টে মুদ্রিত সীমা: ", "Interval printed on your report: ") + comparison.lower + "–" + comparison.upper + " " + comparison.unit : w("সঠিক এককসহ স্পষ্ট মুদ্রিত সীমা নিশ্চিত হয়নি, অথবা এই তথ্যের জন্য সংখ্যার তুলনা প্রযোজ্য নয়। কোনো সীমা অনুমান করা হয়নি।", "An explicit interval in matching units could not be confirmed, or a numeric comparison does not apply. No interval has been assumed.")}</p>
              <p className="font-semibold">{w("চিকিৎসককে জিজ্ঞেস করতে পারেন", "A question for your clinician")}</p><p>{explanation.question}</p>
            </div>
          </div>
          {field.sourceText && <details className="mt-5 border-t border-pro-border pt-2"><summary className="min-h-12 cursor-pointer py-3 font-semibold text-pro-primary">{w("মূল রিপোর্টে কী পড়া হয়েছিল", "What was read from the report")}</summary><p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{field.sourceText}</p>{field.correctionHistory?.length ? <p className="mt-2 text-pro-muted">{w("আপনার সংশোধনসহ দেখানো হয়েছে। মূল লেখা বদলানো হয়নি।", "Shown with your corrections. The source text is retained.")}</p> : null}</details>}
          <a href={explanation.source.url} className="mt-3 inline-flex min-h-12 items-center text-pro-primary underline">{explanation.source.title}</a>
        </article>;
      })}
    </div>
    <aside className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-7">
      <h3 className="flex items-center gap-2 text-xl font-semibold"><ClipboardList aria-hidden="true" className="size-5 shrink-0" />{w("পরের সাক্ষাতের জন্য", "For your next care visit")}</h3>
      <ul className="list-disc space-y-2 pl-5"><li>{w("মূল রিপোর্টটি সঙ্গে রাখুন। অস্পষ্ট তারিখ, একক বা শব্দ ল্যাবের সঙ্গে মিলিয়ে নিন।", "Keep the original report. Ask the lab to clarify unreadable dates, units or wording.")}</li><li>{w("আপনার গর্ভকাল, আগের রিপোর্ট এবং চিকিৎসককে জানাতে চান এমন তথ্য প্রস্তুত রাখুন।", "Bring your pregnancy details, previous reports and anything you want your clinician to know.")}</li><li>{w("এই ব্যাখ্যার ভিত্তিতে নিজে থেকে ওষুধ শুরু, বন্ধ বা পরিবর্তন করবেন না।", "Do not start, stop or change medicines based on this explanation.")}</li></ul>
      <div className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/safety" className="inline-flex min-h-12 items-center gap-2 font-semibold text-pro-primary underline"><ShieldCheck aria-hidden="true" className="size-5 shrink-0" />{w("জরুরি সাহায্য ও নিরাপত্তার তথ্য", "Safety information and urgent help")}</Link><Link href="/find-care" className="inline-flex min-h-12 items-center font-semibold text-pro-primary underline">{w("সেবার জায়গা খুঁজুন", "Find care")}</Link></div>
      <p className="text-pro-muted">{w("কোনো রিপোর্ট, ব্যাখ্যা বা প্রশ্ন স্বয়ংক্রিয়ভাবে চিকিৎসক বা পরিবারের কাছে পাঠানো হয়নি।", "No report, explanation or question has been automatically sent to a clinician or family member.")}</p>
    </aside>
  </section>;
}
