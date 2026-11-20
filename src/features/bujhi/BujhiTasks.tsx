"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, FileText, FlaskConical, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

/** The two Bujhi journeys share a home, but never imply the same saving capability. */
export function BujhiTasks() {
  const { t } = useLanguage();
  const action = "inline-flex min-h-12 items-center justify-center gap-2 rounded-field px-5 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";
  return <section className="grid gap-6 text-pro-text" aria-labelledby="bujhi-task-title">
    <header className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-pro-primary">{t({ en: "BUJHI · UNDERSTAND & REVIEW", bn: "বুঝি · জানুন ও যাচাই করুন" })}</p>
        <h1 id="bujhi-task-title" className="text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: "A little clarity. Your next step.", bn: "বুঝে নিন। তারপর এগিয়ে যান।" })}</h1>
        <p className="max-w-[65ch] text-lg text-pro-muted">{t({ en: "Check a medical report, or understand the marks on your home pregnancy kit.", bn: "মেডিকেল রিপোর্ট মিলিয়ে দেখুন, অথবা ঘরে করা কিটের চিহ্ন বুঝুন।" })}</p>
      </div>
      <p className="flex items-center gap-2 text-sm text-pro-muted"><ShieldCheck aria-hidden="true" className="size-4 shrink-0" />{t({ en: "You review. You choose what to save.", bn: "আপনি যাচাই করবেন। সংরক্ষণের সিদ্ধান্তও আপনার।" })}</p>
    </header>
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section className="grid content-start gap-4 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-card bg-pro-elevated text-pro-primary"><FileText aria-hidden="true" className="size-6" /></span><h2 className="text-2xl font-semibold">{t({ en: "Medical report", bn: "মেডিকেল রিপোর্ট" })}</h2></div>
        <p className="max-w-[50ch] text-pro-muted">{t({ en: "Add a report photo, compare the extracted values, then confirm what belongs in your record.", bn: "রিপোর্টের ছবি দিন, পড়া মানগুলো মিলিয়ে নিন, তারপর সঠিক রেকর্ডে সংরক্ষণ করুন।" })}</p>
        <a href="#report-review" className={`${action} w-fit bg-pro-primary text-pro-on-primary`}>{t({ en: "Review a report", bn: "রিপোর্ট যাচাই করি" })}<ArrowDown aria-hidden="true" className="size-4" /></a>
      </section>
      <section className="grid content-start gap-4 rounded-hero border border-pro-border bg-pro-elevated p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-card bg-pro-surface text-pro-primary"><FlaskConical aria-hidden="true" className="size-6" /></span><h2 className="text-2xl font-semibold">{t({ en: "Home pregnancy kit", bn: "ঘরে করা কিট" })}</h2></div>
        <p className="max-w-[50ch] text-pro-muted">{t({ en: "A few short questions about what you see. No photo needed, and nothing is saved automatically.", bn: "যা দেখছেন তা নিয়ে কয়েকটি ছোট প্রশ্ন। ছবি লাগে না, কিছু নিজে থেকে সংরক্ষণও হয় না।" })}</p>
        <Link href="/app/bujhi/kit" className={`${action} w-fit border border-pro-control-border text-pro-primary`}>{t({ en: "Understand my kit", bn: "কিটের ফল বুঝি" })}<ArrowRight aria-hidden="true" className="size-4" /></Link>
      </section>
    </div>
  </section>;
}
