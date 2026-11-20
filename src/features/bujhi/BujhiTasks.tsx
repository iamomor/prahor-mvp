"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Camera, FileText, FlaskConical, ListChecks, Save, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

const digit = (n: number, language: string) => language === "bn" ? String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(n);
const action = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control px-5 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:w-fit";

export function BujhiTasks() {
  const { t, language } = useLanguage();
  const reportSteps = [
    { icon: Camera, label: t({ en: "Photo", bn: "ছবি" }) },
    { icon: ListChecks, label: t({ en: "Check", bn: "মিলান" }) },
    { icon: Save, label: t({ en: "Save", bn: "সংরক্ষণ" }) },
  ];
  return <section className="grid min-w-0 gap-6 pb-8 text-pro-text" aria-labelledby="bujhi-task-title">
    <header className="grid gap-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-pro-primary">{t({ en: "Bujhi · Understand your reports", bn: "বুঝি · আপনার রিপোর্ট বুঝুন" })}</p>
      <h1 id="bujhi-task-title" className="text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: "What would you like to understand today?", bn: "আজ কী বুঝতে চান?" })}</h1>
      <p className="max-w-[65ch] text-lg text-pro-muted">{t({ en: "Choose one. Each path guides you step by step, in simple words.", bn: "যেকোনো একটি বাছুন। প্রতিটি পথে সহজ ভাষায়, ধাপে ধাপে দেখানো হবে।" })}</p>
    </header>
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <article className="grid min-w-0 content-start gap-4 rounded-hero border-2 border-pro-primary bg-pro-surface p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-card bg-pro-elevated text-pro-primary"><FileText aria-hidden="true" className="size-6" /></span><h2 className="text-2xl font-semibold">{t({ en: "Medical report", bn: "মেডিকেল রিপোর্ট" })}</h2></div>
        <p className="max-w-[50ch]">{t({ en: "For a printed test report from a lab or clinic. We read your photo; you check the values and choose what to save.", bn: "ল্যাব বা ক্লিনিকের ছাপা পরীক্ষার রিপোর্টের জন্য। আমরা ছবি পড়ব, আপনি মান মিলিয়ে ঠিক করবেন কী সংরক্ষণ করবেন।" })}</p>
        <ol aria-label={t({ en: "Three steps", bn: "তিনটি ধাপ" })} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold">
          {reportSteps.map(({ icon: Icon, label }, at) => <li key={label} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-pro-elevated px-3 py-1.5"><Icon aria-hidden="true" className="size-4 text-pro-primary" />{digit(at + 1, language)}. {label}</span>
            {at < reportSteps.length - 1 && <ArrowRight aria-hidden="true" className="size-4 text-pro-muted" />}
          </li>)}
        </ol>
        <p className="text-sm text-pro-muted">{t({ en: "You need: a photo of the report · About 3 minutes", bn: "লাগবে: রিপোর্টের একটি ছবি · প্রায় ৩ মিনিট" })}</p>
        <a href="#report-review" className={action + " bg-pro-primary text-pro-on-primary"}>{t({ en: "Start with a report", bn: "রিপোর্ট দিয়ে শুরু করুন" })}<ArrowDown aria-hidden="true" className="size-4" /></a>
      </article>
      <article className="grid min-w-0 content-start gap-4 rounded-hero border border-pro-border bg-pro-elevated p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-card bg-pro-surface text-pro-primary"><FlaskConical aria-hidden="true" className="size-6" /></span><h2 className="text-2xl font-semibold">{t({ en: "Home pregnancy kit", bn: "ঘরে করা প্রেগন্যান্সি কিট" })}</h2></div>
        <p className="max-w-[50ch]">{t({ en: "For the test stick you used at home. Answer a few short questions about the lines you see.", bn: "ঘরে ব্যবহার করা টেস্ট স্টিকের জন্য। যে দাগ দেখছেন, তা নিয়ে কয়েকটি ছোট প্রশ্নের উত্তর দিন।" })}</p>
        <p className="text-sm text-pro-muted">{t({ en: "No photo needed · Nothing is saved automatically · About 2 minutes", bn: "ছবি লাগবে না · নিজে থেকে কিছু সংরক্ষণ হয় না · প্রায় ২ মিনিট" })}</p>
        <Link href="/app/bujhi/kit" className={action + " border-2 border-pro-primary text-pro-primary"}>{t({ en: "Understand my kit", bn: "কিটের ফল বুঝুন" })}<ArrowRight aria-hidden="true" className="size-4" /></Link>
      </article>
    </div>
    <p className="flex items-start gap-2 text-pro-muted"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />{t({ en: "You check and you decide what to save. This does not give a diagnosis. For urgent help, use the Urgent help button at the top.", bn: "আপনি যাচাই করবেন, সংরক্ষণের সিদ্ধান্তও আপনার। এটি রোগ নির্ণয় করে না। জরুরি সাহায্যের জন্য ওপরের “জরুরি সাহায্য” বোতাম ব্যবহার করুন।" })}</p>
  </section>;
}
