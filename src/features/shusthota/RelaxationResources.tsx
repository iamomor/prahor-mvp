"use client";

import { useId, useState } from "react";
import { BookOpen, CheckCircle2, ChevronRight, CircleAlert, Sparkles, Wind } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import styles from "./ShusthotaOverview.module.css";
import {
  getPublishedReviewedResources, resourceCategories, type ResourceCategory, type ReviewedResource,
} from "./reviewed-content";

const categoryLabels: Record<ResourceCategory, { en: string; bn: string }> = {
  breathing: { en: "Breathing & calm", bn: "শ্বাসপ্রশ্বাস ও প্রশান্তি" },
  gentle_rest: { en: "Gentle rest", bn: "হালকা বিশ্রাম" },
  mindful_calm: { en: "Mindful moments", bn: "মননশীল মুহূর্ত" },
  body_awareness: { en: "Gentle body awareness", bn: "শরীরের হালকা যত্ন" },
};

const copy = {
  eyebrow: { en: "PHASE 04 · CALM CORNER", bn: "ধাপ ০৪ · প্রশান্তির কোণ" },
  title: { en: "Reviewed relaxation guides", bn: "পর্যালোচিত প্রশান্তির নির্দেশিকা" },
  lead: {
    en: "Gentle, non-clinical exercises to help you rest and pause. Every guide requires verification by an accredited maternal care specialist before publication.",
    bn: "আপনাকে বিশ্রাম নিতে ও একটু থামতে সাহায্য করার মৃদু, অ-চিকিৎসাগত নির্দেশিকা। প্রকাশের আগে প্রতিটি নির্দেশিকা স্বীকৃত মাতৃসেবা বিশেষজ্ঞ দ্বারা যাচাই আবশ্যক।",
  },
  all: { en: "All guides", bn: "সকল নির্দেশিকা" },
  emptyTitle: { en: "Pending clinical approval", bn: "চিকিৎসাগত অনুমোদনের অপেক্ষায়" },
  emptyDescription: {
    en: "No relaxation resources have completed official clinical sign-off yet. Under PROHOR integrity standards, unverified content remains strictly unpublished to protect maternal well-being.",
    bn: "এখনো কোনো প্রশান্তির নির্দেশিকা আনুষ্ঠানিক চিকিৎসাগত অনুমোদন সম্পন্ন করেনি। প্রহর সততা নীতিমালা অনুযায়ী, মায়েদের সুরক্ষায় অপরীক্ষিত কনটেন্ট কঠোরভাবে অপ্রকাশিত রাখা হয়েছে।",
  },
  gateTitle: { en: "Clinical review standards for this library", bn: "এই লাইব্রেরির চিকিৎসাগত পর্যালোচনা মানদণ্ড" },
  gateRule1: {
    en: "Must be reviewed by an accredited maternal healthcare specialist (certified midwife or obstetrician).",
    bn: "অবশ্যই একজন স্বীকৃত মাতৃস্বাস্থ্য বিশেষজ্ঞ (সনদপ্রাপ্ত মিডওয়াইফ বা প্রসূতি বিশেষজ্ঞ) দ্বারা পর্যালোচিত হতে হবে।",
  },
  gateRule2: {
    en: "Verifiable reviewer ID, role, and approval timestamp must be permanently attached.",
    bn: "যাচাইযোগ্য পর্যালোচক পরিচিতি, পদবি ও অনুমোদনের সময় স্থায়ীভাবে সংযুক্ত থাকতে হবে।",
  },
  gateRule3: {
    en: "Educational only; must never diagnose, prescribe, or replace individual medical care.",
    bn: "শুধুমাত্র শিক্ষামূলক; কখনোই রোগ নির্ণয়, ওষুধ প্রদান বা চিকিৎসকের বিকল্প হতে পারবে না।",
  },
  viewDetails: { en: "View details", bn: "বিস্তারিত দেখুন" },
  closeDetails: { en: "Close details", bn: "বন্ধ করুন" },
  sourceAttribution: { en: "Source attribution", bn: "উৎস তথ্য" },
  reviewerRole: { en: "Reviewer role", bn: "পর্যালোচকের পদবি" },
  reviewedAt: { en: "Approved on", bn: "অনুমোদনের তারিখ" },
  version: { en: "Version", bn: "সংস্করণ" },
  status: { en: "Review status", bn: "পর্যালোচনা অবস্থা" },
  approvedStatus: { en: "Clinically approved", bn: "চিকিৎসাগতভাবে অনুমোদিত" },
} as const;

export function RelaxationResources() {
  const { language, t } = useLanguage();
  const id = useId();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all">("all");
  const [activeResource, setActiveResource] = useState<ReviewedResource | null>(null);

  const published = getPublishedReviewedResources(language === "bn" ? "bn" : "en");
  const filtered = selectedCategory === "all"
    ? published
    : published.filter(res => res.category === selectedCategory);

  return (
    <section id="relaxation-resources" aria-labelledby={`${id}-title`} lang={language} className="grid gap-6 border-t border-pro-border pt-7 sm:pt-9">
      <header className="grid gap-2">
        <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl flex items-center gap-2">
            <Wind size={26} className="text-pro-primary" aria-hidden="true" />
            {t(copy.title)}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-muted">
            <CheckCircle2 size={14} className="text-pro-primary" aria-hidden="true" />
            {t({ en: "Gated verification", bn: "নিয়ন্ত্রিত যাচাইকরণ" })}
          </span>
        </div>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.lead)}</p>
      </header>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t({ en: "Resource categories", bn: "উপকরণ বিভাগ" })}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          className={`min-h-10 rounded-pill px-4 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus motion-reduce:transition-none ${
            selectedCategory === "all"
              ? "bg-pro-primary text-pro-primary-contrast"
              : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface"
          }`}
        >
          {t(copy.all)}
        </button>
        {resourceCategories.map(cat => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-10 rounded-pill px-4 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus motion-reduce:transition-none ${
              selectedCategory === cat
                ? "bg-pro-primary text-pro-primary-contrast"
                : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface"
            }`}
          >
            {t(categoryLabels[cat])}
          </button>
        ))}
      </div>

      {/* Published Listing or Honest Empty State */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(item => (
            <article
              key={item.id}
              className="grid gap-3 rounded-hero border border-pro-border bg-pro-surface p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="pro-eyebrow text-xs">{t(categoryLabels[item.category])}</span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-pro-surface-2 px-2.5 py-0.5 text-xs font-medium text-pro-primary">
                  <Sparkles size={12} aria-hidden="true" />
                  v{item.contentVersion}
                </span>
              </div>
              <h3 className="pro-display text-xl text-pro-text">{item.title}</h3>
              <p className="pro-muted line-clamp-3 text-sm leading-relaxed">{item.body}</p>
              <div className="border-t border-pro-border/70 pt-3 flex items-center justify-between">
                <span className="text-xs text-pro-muted">{item.review.reviewerRole}</span>
                <AppButton
                  type="button"
                  variant="ghost"
                  className="min-h-9 text-xs"
                  onClick={() => setActiveResource(item)}
                >
                  {t(copy.viewDetails)}
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
              <BookOpen size={24} aria-hidden="true" className={styles.botanicalLeaf} />
            </span>
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-pro-text">{t(copy.emptyTitle)}</h3>
              <p className="pro-muted leading-relaxed max-w-2xl">{t(copy.emptyDescription)}</p>
            </div>
          </div>

          <div className="rounded-control border border-pro-border/80 bg-pro-surface p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-pro-primary">
              <CircleAlert size={16} aria-hidden="true" />
              {t(copy.gateTitle)}
            </h4>
            <ul className="mt-3 grid gap-2 text-sm text-pro-muted ps-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.gateRule1)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.gateRule2)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
                <span>{t(copy.gateRule3)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal / Detailed View */}
      {activeResource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-modal-title`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <div className="grid max-h-[90vh] w-full max-w-2xl gap-5 overflow-y-auto rounded-hero border border-pro-border bg-pro-surface p-6 sm:p-8 shadow-xl">
            <header className="grid gap-1">
              <span className="pro-eyebrow text-xs">{t(categoryLabels[activeResource.category])}</span>
              <h3 id={`${id}-modal-title`} className="pro-display text-2xl text-pro-text">
                {activeResource.title}
              </h3>
            </header>

            <div className="prose max-w-none text-pro-text whitespace-pre-line leading-relaxed text-base">
              {activeResource.body}
            </div>

            <div className="grid gap-2 rounded-control border border-pro-border bg-pro-elevated p-4 text-xs text-pro-muted">
              <div className="flex justify-between">
                <span>{t(copy.status)}:</span>
                <span className="font-semibold text-pro-success">{t(copy.approvedStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.reviewerRole)}:</span>
                <span className="font-medium text-pro-text">{activeResource.review.reviewerRole}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.reviewedAt)}:</span>
                <span>{new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(activeResource.review.reviewedAt))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.sourceAttribution)}:</span>
                <span className="font-medium text-pro-text text-right max-w-xs">{activeResource.sourceReference}</span>
              </div>
              <div className="flex justify-between">
                <span>{t(copy.version)}:</span>
                <span>v{activeResource.contentVersion}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => setActiveResource(null)}
              >
                {t(copy.closeDetails)}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
