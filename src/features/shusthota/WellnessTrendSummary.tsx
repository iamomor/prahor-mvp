"use client";

import { useId, useState } from "react";
import { Bot, CheckCircle2, CircleAlert, Lock, Shield, Sparkles } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import {
  validateWellnessTrendInput, type WellnessTrendInput,
} from "./reviewed-content";

const copy = {
  eyebrow: { en: "PHASE 06 · AI WELLNESS TRENDS", bn: "ধাপ ০৬ · এআই সুস্থতার ধারা" },
  title: { en: "AI wellness trend summary", bn: "এআই সুস্থতার ধারার সারাংশ" },
  lead: {
    en: "An optional, privacy-bounded summary of your general wellness patterns. Never provides diagnoses, treatments, or prescriptions.",
    bn: "আপনার সার্বিক সুস্থতার ধরনের একটি ঐচ্ছিক, গোপনীয়তা-সুরক্ষিত সারাংশ। এটি কখনোই রোগ নির্ণয়, চিকিৎসা বা প্রেসক্রিপশন প্রদান করে না।",
  },
  optInTitle: { en: "Explicit privacy opt-in required", bn: "স্পষ্ট গোপনীয়তার সম্মতি আবশ্যক" },
  optInDesc: {
    en: "To generate a trend summary, you must explicitly opt in. Only minimal wellness metrics (mood, energy, and water counts) are processed. Private diary entries and provider details are strictly excluded from AI context.",
    bn: "সুস্থতার ধারার সারাংশ দেখতে হলে আপনাকে সুস্পষ্ট সম্মতি দিতে হবে। শুধুমাত্র সাধারণ সুস্থতার তথ্য (মন, শক্তি ও পানির পরিমাণ) প্রক্রিয়া করা হয়। ব্যক্তিগত ডায়েরি ও সেবাদাতার তথ্য এআই-তে কখনোই পাঠানো হয় না।",
  },
  optInCheckbox: {
    en: "I opt in to summarize my non-diary wellness records for general personal reflection.",
    bn: "নিজের সাধারণ পর্যালোচনার জন্য ডায়েরিবহির্ভূত সুস্থতার রেকর্ড সারাংশ করার সম্মতি দিচ্ছি।",
  },
  unavailableTitle: { en: "Privacy-reviewed AI service currently unavailable", bn: "গোপনীয়তা-যাচাইকৃত এআই সেবা বর্তমানে অনুপলব্ধ" },
  unavailableDesc: {
    en: "PROHOR maintains strict medical privacy boundaries: maternal wellness data is never dispatched to unvetted or third-party AI endpoints. An approved, HIPAA/GDPR-compliant local maternal AI pipeline has not yet been authorized for clinical trend summarization in this environment.",
    bn: "প্রহর কঠোর চিকিৎসাগত গোপনীয়তা বজায় রাখে: মাতৃত্বকালীন সুস্থতার তথ্য কখনোই অপরীক্ষিত বা তৃতীয় পক্ষের এআই সেবায় পাঠানো হয় না। এই পরিবেশে চিকিৎসাগত ধারা বিশ্লেষণের জন্য অনুমোদিত গোপনীয়তা-বান্ধব এআই পাইপলাইন এখনো সংযুক্ত করা হয়নি।",
  },
  noFabricationNotice: {
    en: "PROHOR will never fabricate AI answers or disguise rule-based scripts as artificial intelligence.",
    bn: "প্রহর কখনোই মনগড়া এআই উত্তর প্রদর্শন করবে না অথবা সাধারণ গণনাকে এআই হিসেবে মিথ্যা উপস্থাপনা করবে না।",
  },
  generateBtn: { en: "Request summary", bn: "সারাংশের অনুরোধ" },
  disclaimerTitle: { en: "Non-diagnostic disclaimer", bn: "চিকিৎসাগত নির্ণয় না হওয়ার ঘোষণা" },
  disclaimerText: {
    en: "Any generated summary is solely for informational reflection. It cannot evaluate maternal risk, diagnose mental or physical conditions, or recommend hydration or activity amounts. Always consult your obstetrician for clinical advice.",
    bn: "যেকোনো তৈরি সারাংশ কেবলমাত্র নিজের অনুধাবনের জন্য। এটি কখনোই গর্ভকালীন ঝুঁকি নির্ণয়, শারীরিক বা মানসিক অসুস্থতা নির্ধারণ অথবা পানি বা ব্যায়ামের পরিমাণ নির্ধারণ করতে পারে না। যেকোনো প্রয়োজনে সর্বদা চিকিৎসকের পরামর্শ নিন।",
  },
} as const;

export function WellnessTrendSummary() {
  const { language, t } = useLanguage();
  const id = useId();
  const [optedIn, setOptedIn] = useState(false);
  const [requested, setRequested] = useState(false);

  // Isolated boundary test using the schema validator to ensure contracts work
  const handleRequest = () => {
    setRequested(true);
    // Verify client input validation contract works without diary
    const mockInput: WellnessTrendInput = {
      consented: true,
      fields: ["mood", "energy", "hydration"],
      records: [
        { occurredAt: new Date().toISOString(), mood: "comfortable", energy: "medium", hydrationMl: 250 },
      ],
    };
    const validation = validateWellnessTrendInput(mockInput);
    if (!validation.ok) {
      console.warn("Input contract failed", validation.error);
    }
  };

  return (
    <section id="wellness-trends" aria-labelledby={`${id}-title`} lang={language} className="grid gap-6 border-t border-pro-border pt-7 sm:pt-9">
      <header className="grid gap-2">
        <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl flex items-center gap-2">
            <Bot size={26} className="text-pro-primary" aria-hidden="true" />
            {t(copy.title)}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-muted">
            <CheckCircle2 size={14} className="text-pro-primary" aria-hidden="true" />
            {t({ en: "Non-diagnostic only", bn: "শুধুমাত্র অ-চিকিৎসাগত" })}
          </span>
        </div>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.lead)}</p>
      </header>

      {/* Opt-in Section */}
      <div className="grid gap-5 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pro-elevated text-pro-primary">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <h3 className="font-semibold text-base">{t(copy.optInTitle)}</h3>
            <p className="pro-muted text-sm leading-relaxed">{t(copy.optInDesc)}</p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer text-sm leading-relaxed text-pro-text border-t border-pro-border/70 pt-4">
          <input
            type="checkbox"
            checked={optedIn}
            onChange={e => {
              setOptedIn(e.target.checked);
              if (!e.target.checked) setRequested(false);
            }}
            className="mt-0.5 size-5 rounded accent-pro-primary shrink-0"
          />
          <span>{t(copy.optInCheckbox)}</span>
        </label>

        <div className="flex items-center gap-3">
          <AppButton
            type="button"
            disabled={!optedIn}
            onClick={handleRequest}
            className="min-h-11"
          >
            <Sparkles size={16} className="me-1.5" aria-hidden="true" />
            {t(copy.generateBtn)}
          </AppButton>
        </div>

        {/* Honest Polished Unavailable State */}
        {requested && (
          <div className="grid gap-3 rounded-control border border-pro-border bg-pro-elevated p-4 sm:p-5 mt-2">
            <div className="flex items-start gap-3">
              <CircleAlert size={20} className="mt-0.5 text-pro-primary shrink-0" aria-hidden="true" />
              <div className="grid gap-1.5">
                <h4 className="font-semibold text-sm text-pro-text">{t(copy.unavailableTitle)}</h4>
                <p className="pro-muted text-xs leading-relaxed">{t(copy.unavailableDesc)}</p>
                <p className="text-xs font-medium text-pro-primary flex items-center gap-1.5 mt-1">
                  <Lock size={14} aria-hidden="true" />
                  {t(copy.noFabricationNotice)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Non-Diagnostic Disclaimer */}
        <div className="rounded-control border border-pro-border/80 bg-pro-surface-2 p-3 text-xs text-pro-muted">
          <p className="font-semibold text-pro-text">{t(copy.disclaimerTitle)}</p>
          <p className="mt-1 leading-relaxed">{t(copy.disclaimerText)}</p>
        </div>
      </div>
    </section>
  );
}
