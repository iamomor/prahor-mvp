"use client";

import { useId, useState } from "react";
import { Award, CheckCircle2, ChevronRight, FileCheck, ShieldAlert, Stethoscope } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import styles from "./ShusthotaOverview.module.css";
import {
  getPublishedActivityPlans, type ClinicianApprovedPlan,
} from "./reviewed-content";

const copy = {
  eyebrow: { en: "PHASE 07 · ACTIVITY GUIDES", bn: "ধাপ ০৭ · কাজকর্মের নির্দেশিকা" },
  title: { en: "Clinician-approved activity plans", bn: "চিকিৎসক-অনুমোদিত কাজকর্মের পরিকল্পনা" },
  lead: {
    en: "Personalized movement guides require direct clinical clearance. Generic exercise prescriptions can be unsafe during pregnancy without professional assessment.",
    bn: "ব্যক্তিগত কাজকর্মের নির্দেশিকার জন্য সরাসরি চিকিৎসকের অনুমতি প্রয়োজন। শারীরিক অবস্থা যাচাই ছাড়া গর্ভাবস্থায় সাধারণ ব্যায়ামের পরামর্শ ঝুঁকিপূর্ণ হতে পারে।",
  },
  emptyTitle: { en: "No approved clinical plans published", bn: "অনুমোদিত কোনো পরিকল্পনা প্রকাশিত নেই" },
  emptyDescription: {
    en: "PROHOR does not generate automated or unverified pregnancy exercise instructions. To protect maternal and fetal safety, activity plans are strictly held until verified and signed off by an accredited obstetrician or physiotherapist.",
    bn: "প্রহর স্বয়ংক্রিয় বা অপ্রমাণিত কোনো গর্ভাবস্থার ব্যায়ামের নির্দেশনা তৈরি করে না। মা ও শিশুর সুরক্ষায়, সনদপ্রাপ্ত প্রসূতি বিশেষজ্ঞ বা ফিজিওথেরাপিস্টের স্বাক্ষর ছাড়া সব পরিকল্পনা কঠোরভাবে অপ্রকাশিত রাখা হয়।",
  },
  clinicalRequirementsTitle: { en: "Mandatory clinical sign-off requirements", bn: "বাধ্যতামূলক চিকিৎসাগত অনুমোদনের শর্তাবলি" },
  req1: {
    en: "Individual clinical assessment: each maternal trimester and medical condition demands specific movement boundaries.",
    bn: "ব্যক্তিগত চিকিৎসাগত মূল্যায়ন: গর্ভাবস্থার প্রতিটি ধাপ ও শারীরিক অবস্থার জন্য আলাদা সতর্কতার প্রয়োজন।",
  },
  req2: {
    en: "Named clinician qualification: must record verifiable medical credentials (e.g., MBBS, FCPS Ob/Gyn).",
    bn: "স্বীকৃত চিকিৎসকের যোগ্যতা: যাচাইযোগ্য ডিগ্রি ও পদবি (যেমন, এমবিবিএস, এফসিপিএস) লিপিবদ্ধ থাকতে হবে।",
  },
  req3: {
    en: "Exact source and protocol version: must cite peer-reviewed clinical guidelines, never LLM generations.",
    bn: "সুনির্দিষ্ট উৎস ও প্রোটোকল সংস্করণ: পিয়ার-রিভিউ করা নির্দেশিকা উদ্ধৃত থাকতে হবে, কৃত্রিম বুদ্ধিমত্তা দিয়ে তৈরি নয়।",
  },
  viewPlan: { en: "View plan details", bn: "পরিকল্পনার বিস্তারিত" },
  close: { en: "Close", bn: "বন্ধ করুন" },
  qualification: { en: "Clinician qualification", bn: "চিকিৎসকের যোগ্যতা" },
  approvedOn: { en: "Approved on", bn: "অনুমোদনের তারিখ" },
  source: { en: "Clinical source", bn: "চিকিৎসাগত উৎস" },
  version: { en: "Version", bn: "সংস্করণ" },
  status: { en: "Publication status", bn: "প্রকাশের অবস্থা" },
  published: { en: "Clinically published", bn: "চিকিৎসাগতভাবে প্রকাশিত" },
} as const;

export function ActivityPlans() {
  const { language, t } = useLanguage();
  const id = useId();
  const [activePlan, setActivePlan] = useState<ClinicianApprovedPlan | null>(null);

  const plans = getPublishedActivityPlans(language === "bn" ? "bn" : "en");

  return (
    <section id="activity-plans" aria-labelledby={`${id}-title`} lang={language} className="grid gap-6 border-t border-pro-border pt-7 sm:pt-9">
      <header className="grid gap-2">
        <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl flex items-center gap-2">
            <Stethoscope size={26} className="text-pro-primary" aria-hidden="true" />
            {t(copy.title)}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-muted">
            <CheckCircle2 size={14} className="text-pro-primary" aria-hidden="true" />
            {t({ en: "No AI prescriptions", bn: "কোনো এআই প্রেসক্রিপশন নয়" })}
          </span>
        </div>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.lead)}</p>
      </header>

      {plans.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map(plan => (
            <article
              key={plan.id}
              className="grid gap-3 rounded-hero border border-pro-border bg-pro-surface p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="pro-eyebrow text-xs">{plan.review.qualification}</span>
                <span className="rounded-pill bg-pro-surface-2 px-2.5 py-0.5 text-xs font-medium text-pro-primary">
                  v{plan.version}
                </span>
              </div>
              <h3 className="pro-display text-xl text-pro-text">{plan.title}</h3>
              <p className="pro-muted line-clamp-3 text-sm leading-relaxed">{plan.instructions}</p>
              <div className="border-t border-pro-border/70 pt-3 flex items-center justify-between">
                <span className="text-xs text-pro-muted">{plan.sourceReference}</span>
                <AppButton
                  type="button"
                  variant="ghost"
                  className="min-h-9 text-xs"
                  onClick={() => setActivePlan(plan)}
                >
                  {t(copy.viewPlan)}
                  <ChevronRight size={14} className="ms-1" aria-hidden="true" />
                </AppButton>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 rounded-hero border border-pro-border bg-pro-elevated p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-primary">
              <ShieldAlert size={24} aria-hidden="true" className={styles.botanicalLeaf} />
            </span>
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-pro-text">{t(copy.emptyTitle)}</h3>
              <p className="pro-muted leading-relaxed max-w-2xl">{t(copy.emptyDescription)}</p>
            </div>
          </div>

          <div className="rounded-control border border-pro-border/80 bg-pro-surface p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-pro-primary">
              <Award size={16} aria-hidden="true" />
              {t(copy.clinicalRequirementsTitle)}
            </h4>
            <ul className="mt-3 grid gap-2 text-sm text-pro-muted ps-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.req1)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.req2)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.req3)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Plan Detail Modal */}
      {activePlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-plan-title`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <div className="grid max-h-[90vh] w-full max-w-2xl gap-5 overflow-y-auto rounded-hero border border-pro-border bg-pro-surface p-6 sm:p-8 shadow-xl">
            <header className="grid gap-1">
              <span className="pro-eyebrow text-xs flex items-center gap-1.5 text-pro-primary">
                <FileCheck size={14} aria-hidden="true" />
                {t(copy.published)}
              </span>
              <h3 id={`${id}-plan-title`} className="pro-display text-2xl text-pro-text">
                {activePlan.title}
              </h3>
            </header>

            <div className="prose max-w-none text-pro-text whitespace-pre-line leading-relaxed text-base">
              {activePlan.instructions}
            </div>

            <div className="grid gap-2 rounded-control border border-pro-border bg-pro-elevated p-4 text-xs text-pro-muted">
              <div className="flex justify-between">
                <span>{t(copy.qualification)}:</span>
                <span className="font-semibold text-pro-text">{activePlan.review.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.approvedOn)}:</span>
                <span>{new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(activePlan.review.approvedAt))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.source)}:</span>
                <span className="font-medium text-pro-text text-right max-w-xs">{activePlan.sourceReference}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.version)}:</span>
                <span>v{activePlan.version}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => setActivePlan(null)}
              >
                {t(copy.close)}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
