"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import { ReadAloudButton, VoiceDictationButton } from "@/features/adapt";

import { ArrowRight, Check, CircleCheckBig, RotateCcw } from "lucide-react";
import { ImageMedicalEntry } from "./ImageMedicalEntry";
import { ReportOverviewCard } from "./ReportOverviewCard";
import { SaveReportSummary } from "./SaveReportSummary";

import { fileSha256 } from "./sha256";

import { SourcePreview } from "./SourcePreview";

import type { ExtractedReport, ExtractedReportField } from "./types";
import { isHemoglobinLabel, validDate } from "./validation";
import { educationTopics } from "../barta/education-topics";

type Pregnancy = { id: string; label: string };

type Draft = { report: ExtractedReport; source: File; reportId: string };

const digit = (n: number, language: string) => language === "bn" ? String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(n);

/**
 * Guided three-step map. Each step says what happens in it and its state in words
 * ("Done", "You are here", "Next"), so progress never depends on colour alone.
 */
function ReportSteps({ current }: { current: 0 | 1 | 2 | 3 }) {
  const { t, language } = useLanguage();
  const steps = [
    { title: t({ en: "Add a photo", bn: "ছবি দিন" }), text: t({ en: "Take or choose a photo of your report.", bn: "রিপোর্টের ছবি তুলুন বা বাছুন।" }) },
    { title: t({ en: "Check the values", bn: "মান মিলিয়ে নিন" }), text: t({ en: "Compare what was read with your paper report.", bn: "যা পড়া হয়েছে তা কাগজের রিপোর্টের সঙ্গে মেলান।" }) },
    { title: t({ en: "Save", bn: "সংরক্ষণ করুন" }), text: t({ en: "Save it to your pregnancy record, if you want.", bn: "চাইলে গর্ভকালের রেকর্ডে রাখুন।" }) },
  ];
  const state = (at: number) => at < current ? t({ en: "Done", bn: "শেষ" }) : at === current ? t({ en: "You are here", bn: "আপনি এখানে" }) : t({ en: "Next", bn: "পরে" });
  return (
    <div className="grid min-w-0 gap-3">
    <ol aria-label={t({ en: "Report steps", bn: "রিপোর্টের ধাপ" })} className="grid min-w-0 grid-cols-3 gap-2 sm:gap-4">
      {steps.map((step, at) => {
        const done = at < current, now = at === current;
        return <li key={step.title} aria-current={now ? "step" : undefined} className={`grid min-w-0 content-start gap-2 rounded-card border-2 p-3 transition-colors duration-200 motion-reduce:transition-none sm:p-4 ${now ? "border-pro-primary bg-pro-surface" : "border-pro-border bg-pro-bg"}`}>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-pill text-sm font-bold ${done || now ? "bg-pro-primary text-pro-on-primary" : "border-2 border-pro-control-border text-pro-muted"}`}>{done ? <Check className="size-4" /> : digit(at + 1, language)}</span>
            <span className={`text-xs font-semibold uppercase tracking-wide ${now ? "text-pro-primary" : "text-pro-muted"}`}>{state(at)}</span>
          </span>
          <span className={`font-semibold leading-snug ${done || now ? "text-pro-text" : "text-pro-muted"}`}>{step.title}</span>
          <span className="hidden text-sm text-pro-muted sm:block">{step.text}</span>
        </li>;
      })}
    </ol>
    {current < 3 && <p aria-hidden="true" className="rounded-field bg-pro-surface px-4 py-3 text-pro-text sm:hidden">{steps[current].text}</p>}
    </div>
  );
}

/** A lettered part of the check form, so a long form reads as a short checklist. */
function Part({ letter, title, hint }: { letter: string; title: string; hint: string }) {
  return <div className="flex items-start gap-3 border-t border-pro-border pt-4 sm:col-span-2">
    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-pill bg-pro-surface text-sm font-bold text-pro-primary">{letter}</span>
    <span className="grid gap-0.5"><span className="font-semibold">{title}</span><span className="text-sm font-normal text-pro-muted">{hint}</span></span>
  </div>;
}

export function AccountReportReview({
  pregnancies,
}: {
  pregnancies: Pregnancy[];
}) {
  const { language, t } = useLanguage();
  const [draft, setDraft] = useState<Draft>();
  const [fieldId, setFieldId] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [pregnancyId, setPregnancyId] = useState(
    pregnancies.length === 1 ? pregnancies[0].id : "",
  );
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [summaryStage, setSummaryStage] = useState<"none" | "read" | "saved">("none");
  const pending = useRef(false);
  const snapshot = useRef<string | undefined>(undefined);
  const reviewId = useRef<string | undefined>(undefined);
  const reviewFocus = useRef<HTMLHeadingElement>(null);
  const uploadFocus = useRef<HTMLHeadingElement>(null);

  const feedbackFocus = useRef<HTMLParagraphElement>(null);

  // OCR failed or found nothing: the mother types the printed value from the same image. rawValue stays empty, so it is never recorded as an OCR read.
  async function openManual(file: File) {
    const sourceFileId = await fileSha256(file);
    openReview(
      {
        id: `manual-${sourceFileId}`,
        name: "Manual hemoglobin entry",
        status: "needs_review",
        source: "self_reported",
        observedAt: "",
        sourceFileId,
        inputMethod: "manual",
        fields: [
          {
            id: "manual-hemoglobin",
            label: "Hemoglobin",
            value: "",
            unit: "g/dL",
            rawValue: "",
            destination: "",
            reviewStatus: "pending",
            parsingReliability: "unrecognized",
          },
        ],
      },
      file,
    );
  }

  function openReview(report: ExtractedReport, file?: File) {
    if (!file) return;
    const supported = report.fields.filter((field) =>
      isHemoglobinLabel(field.label),
    );

    setDraft({ report, source: file, reportId: crypto.randomUUID() });

    setFieldId(supported.length === 1 ? supported[0].id : "");
    setValue(
      supported.length === 1 && supported[0].parsingReliability === "recognized"
        ? supported[0].value
        : "",
    );
    setUnit(supported.length === 1 ? supported[0].unit : "");
    setDate("");
    setConfirmed(false);
    setFeedback("");
    setSaved(false);
    setLocked(false);
    setRejected(false);
    snapshot.current = undefined;
    reviewId.current = undefined;
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }

  const field: ExtractedReportField | undefined = draft?.report.fields.find(
    (item) => item.id === fieldId,
  );
  const supported =
    draft?.report.fields.filter((item) => isHemoglobinLabel(item.label)) ?? [];


  async function save() {
    if (pending.current || !draft || !field || saved) return;
    if (!snapshot.current) {

      if (
        !pregnancyId ||
        !confirmed ||
        !validDate(date) ||
        date >
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()) ||
        !/^[0-9]{1,3}(\.[0-9]{1,2})?$/.test(value) ||
        unit.trim() !== "g/dL" ||
        !draft.report.sourceFileId
      ) {
        setFeedback(
          t({ en: "Check the pregnancy, printed value, g/dL unit and date, then confirm your review.", bn: "গর্ভকাল, ছাপানো মান, g/dL একক ও তারিখ দেখে নিন, তারপর আপনার যাচাই নিশ্চিত করুন।" }),
        );
        requestAnimationFrame(() => feedbackFocus.current?.focus());

        return;
      }
      snapshot.current = JSON.stringify({

        reportId: draft.reportId,
        pregnancyId,
        sourceSha256: draft.report.sourceFileId,
        rawLabel: field.label,
        rawValue: field.rawValue ?? field.value,
        rawUnit: field.unit,
        reviewedValue: value,
        reviewedUnit: "g/dL",
        observedOn: date,
        fieldId: crypto.randomUUID(),
        decision: "verified",
      });
      setLocked(true);
    }

    pending.current = true; setSaving(true); setFeedback(t({ bn: "সংরক্ষণ করা হচ্ছে…", en: "Saving reviewed measurement…" }));

    try {
      const post = (url: string, body: unknown) => fetch(url, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const review = JSON.parse(snapshot.current ?? "{}") as { fieldId: string };
      // Stage 1: the server records the mother's explicit verification. Stage 2 commits only what the server approved.
      if (!reviewId.current) {
        const response = await post("/api/reports/reviews", review);
        const data = (await response.json().catch(() => ({}))) as { reviewId?: string; code?: string };
        if (!response.ok || !data.reviewId) {
          if (response.status === 400 || response.status === 409) {
            if (response.status === 400) { snapshot.current = undefined; setLocked(false); }
            setFeedback(response.status === 409
              ? t({ en: "This report field already has a different saved review decision, so it cannot be changed. Nothing new was saved. Choose another image to start again.", bn: "এই রিপোর্টের ঘরে আগে থেকেই ভিন্ন একটি যাচাইয়ের সিদ্ধান্ত সংরক্ষিত আছে, তাই বদলানো যায় না। নতুন কিছু সংরক্ষণ হয়নি। আবার শুরু করতে অন্য ছবি বেছে নিন।" })
              : t({ en: "Your review was not recorded. Check the value, unit and date, then try again.", bn: "আপনার যাচাই নথিভুক্ত হয়নি। মান, একক ও তারিখ দেখে আবার চেষ্টা করুন।" }));
          } else if (response.status === 401 || response.status === 403) {
            setFeedback(t({ en: "Your review was not recorded and nothing was saved. Sign in as the account owner and try again.", bn: "আপনার যাচাই নথিভুক্ত হয়নি এবং কিছুই সংরক্ষণ হয়নি। অ্যাকাউন্টের মালিক হিসেবে সাইন ইন করে আবার চেষ্টা করুন।" }));
          } else setFeedback(t({ en: "Your review could not be recorded. Nothing was saved. Retry to try the same review again.", bn: "আপনার যাচাই নথিভুক্ত করা যায়নি। কিছুই সংরক্ষণ হয়নি। একই যাচাই আবার চেষ্টা করুন।" }));
          return;
        }
        reviewId.current = data.reviewId;
      }
      const response = await post("/api/reports/commit", { reviewId: reviewId.current, fieldId: review.fieldId, confirmSave: true });
      if (response.ok) {
        setSaved(true);
        setFeedback(
          t({ en: "Saved to your account (not only this device). This measurement was reviewed by you, not a clinician. Open Jibonrekha to see it.", bn: "আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে (শুধু এই ডিভাইসে নয়)। এই মাপ আপনি নিজে যাচাই করেছেন, কোনো চিকিৎসক নন। দেখতে জীবনরেখা খুলুন।" }),
        );
      } else if (response.status === 400) {
        setFeedback(t({ en: "Your review is recorded, but this field cannot be saved to the account. Only hemoglobin in g/dL can be saved. Nothing was saved.", bn: "আপনার যাচাই নথিভুক্ত হয়েছে, কিন্তু এই ঘর অ্যাকাউন্টে সংরক্ষণ করা যায় না। শুধু g/dL এককে হিমোগ্লোবিন সংরক্ষণ করা যায়। কিছুই সংরক্ষণ হয়নি।" }));
      } else {
        setFeedback(
          t({ en: "Your review is recorded, but the account save could not be confirmed. Retry to check the same save.", bn: "আপনার যাচাই নথিভুক্ত হয়েছে, কিন্তু অ্যাকাউন্টে সংরক্ষণ নিশ্চিত হয়নি। একই সংরক্ষণ আবার চেষ্টা করুন।" }),
        );
      }
    } catch {
      setFeedback(
        t({ en: "Save could not be confirmed. Check your connection and retry the same save.", bn: "সংরক্ষণ নিশ্চিত হয়নি। সংযোগ দেখে একই সংরক্ষণ আবার চেষ্টা করুন।" }),
      );
    } finally {
      pending.current = false;
      setSaving(false);
      requestAnimationFrame(() => feedbackFocus.current?.focus());
    }
  }

  // Records "rejected" on the server so the value can never be committed later. Nothing is saved to health records.
  async function reject() {
    if (pending.current || !draft || !field || !pregnancyId || !draft.report.sourceFileId) {
      setFeedback(t({ en: "Choose the pregnancy record first, then you can record that you do not want to save this value.", bn: "আগে গর্ভকাল বেছে নিন, তারপর এই মান সংরক্ষণ করতে চান না বলে নথিভুক্ত করতে পারবেন।" }));
      return;
    }
    pending.current = true; setSaving(true);
    try {
      const response = await fetch("/api/reports/reviews", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        reportId: draft.reportId, pregnancyId, fieldId: crypto.randomUUID(), sourceSha256: draft.report.sourceFileId,
        rawLabel: field.label, rawValue: field.rawValue ?? field.value, rawUnit: field.unit,
        reviewedValue: value, reviewedUnit: unit, observedOn: date || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date()), decision: "rejected" }) });
      if (response.ok) { setLocked(true); setSaved(true); setRejected(true); setFeedback(t({ en: "Recorded as not saved. This value will not be added to your account or Jibonrekha.", bn: "সংরক্ষণ হবে না বলে নথিভুক্ত হয়েছে। এই মান আপনার অ্যাকাউন্টে বা জীবনরেখায় যোগ হবে না।" })); }
      else setFeedback(t({ en: "Your decision could not be recorded. Nothing was saved. You can try again.", bn: "আপনার সিদ্ধান্ত নথিভুক্ত করা যায়নি। কিছুই সংরক্ষণ হয়নি। আবার চেষ্টা করতে পারেন।" }));
    } catch { setFeedback(t({ en: "Your decision could not be recorded. Check your connection. Nothing was saved.", bn: "আপনার সিদ্ধান্ত নথিভুক্ত করা যায়নি। সংযোগ দেখুন। কিছুই সংরক্ষণ হয়নি।" })); }
    finally { pending.current = false; setSaving(false); requestAnimationFrame(() => feedbackFocus.current?.focus()); }
  }

  const control =
    "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";

  return (
    <div className="grid w-full min-w-0 gap-6 py-6 text-pro-text [overflow-wrap:anywhere]">
      <header className="grid gap-5 border-b border-pro-border pb-6">
        <div className="grid gap-2">
          <h2 ref={uploadFocus} tabIndex={-1} className="text-2xl font-semibold sm:text-3xl">
            {t({ en: "Check a medical report in 3 steps", bn: "৩টি ধাপে মেডিকেল রিপোর্ট যাচাই" })}
          </h2>
          <p className="max-w-[65ch] text-pro-muted">
            {t({ en: "You don't need to know medical words. We guide you through each step, and nothing is saved unless you choose to save it.", bn: "চিকিৎসার শব্দ জানা লাগবে না। প্রতিটি ধাপে আমরা পথ দেখাব, আর আপনি না চাইলে কিছুই সংরক্ষণ হবে না।" })}
          </p>
        </div>
        <ReportSteps current={saved && !rejected ? 3 : summaryStage === "saved" ? 3 : saved ? 2 : draft || summaryStage === "read" ? 1 : 0} />
        <p className="max-w-[80ch] text-sm text-pro-muted">
          <span className="font-semibold text-pro-text">{t({ en: "What can be saved now:", bn: "এখন যা সংরক্ষণ করা যায়:" })}</span>{" "}
          {t({ en: "hemoglobin (g/dL) from a blood test. Other parts of a report are explained in simple words, but not saved.", bn: "রক্তপরীক্ষার হিমোগ্লোবিন (g/dL)। রিপোর্টের অন্য অংশ সহজ ভাষায় বোঝানো হয়, তবে সংরক্ষণ হয় না।" })}
        </p>
      </header>
      {!draft && <ImageMedicalEntry onDraft={openReview} onManualFile={openManual} showProgress={false} onStage={(stage) => setSummaryStage(stage === "read" ? "read" : "none")} renderSave={(rawText) => <SaveReportSummary rawText={rawText} pregnancies={pregnancies} onSaved={() => setSummaryStage("saved")} />} />}
      {draft && (
        <section
          className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8"
          aria-labelledby="account-report-heading"
        >
          <div className="grid gap-2 lg:col-span-2">
          <h3
            id="account-report-heading"
            ref={reviewFocus}
            tabIndex={-1}
            className="text-2xl font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          >
            {saved && !rejected ? t({ en: "Saved", bn: "সংরক্ষিত হয়েছে" }) : draft.report.inputMethod === "manual" ? t({ en: "Type the value from your report", bn: "রিপোর্ট দেখে মানটি লিখুন" }) : t({ en: "Check what was read", bn: "যা পড়া হয়েছে মিলিয়ে নিন" })}
          </h3>
          {!saved && <p className="max-w-[70ch] text-pro-muted">
            {t({ en: "Keep your paper report next to you. Your photo is shown here so you can compare. Fill in or correct each part, then save.", bn: "কাগজের রিপোর্টটি পাশে রাখুন। মিলিয়ে দেখার জন্য আপনার ছবি এখানে দেখানো হচ্ছে। প্রতিটি অংশ পূরণ বা ঠিক করুন, তারপর সংরক্ষণ করুন।" })}
          </p>}
          </div>
          <div className="grid min-w-0 gap-4 lg:sticky lg:top-24">
          {draft.report.inputMethod === "manual" && <p className="rounded-field border border-pro-warning bg-pro-warning-soft p-4">{t({ en: "The value could not be read from this photo, so you type it in. Look at the photo or your paper report.", bn: "এই ছবি থেকে মানটি পড়া যায়নি, তাই আপনি নিজে লিখবেন। ছবি বা কাগজের রিপোর্ট দেখে নিন।" })}</p>}
          <SourcePreview source={draft.source} expanded />
          {(draft.report.rawText ||
            draft.report.fields.some(
              (item) => !isHemoglobinLabel(item.label),
            )) && (
            <details className="rounded-field border border-pro-border px-3">
              <summary className="min-h-12 cursor-pointer py-3 font-semibold text-pro-primary">

                {t({ en: "Other parts of this report, in simple words", bn: "রিপোর্টের অন্য অংশ, সহজ ভাষায়" })}

              </summary>
              <div className="grid min-w-0 gap-3 pb-3">
                {draft.report.rawText && <ReportOverviewCard rawText={draft.report.rawText} />}
                {draft.report.rawText && (
                  <pre className="whitespace-pre-wrap font-body [overflow-wrap:anywhere]">
                    {draft.report.rawText}
                  </pre>
                )}
                {draft.report.fields
                  .filter((item) => !isHemoglobinLabel(item.label))
                  .map((item) => (
                    <p key={item.id}>
                      {item.label} · {item.value} {item.unit}. {t({ en: "Read from image, unsupported for account saving.", bn: "ছবি থেকে পড়া; অ্যাকাউন্টে সংরক্ষণের জন্য সমর্থিত নয়।" })}
                    </p>
                  ))}
              </div>
            </details>
          )}
          </div>
          <div className="grid min-w-0 gap-5 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6">
          {!(saved && !rejected) && <p className="border-b border-pro-border pb-4 font-semibold text-pro-primary">{t({ en: "Your review · nothing saves until you confirm", bn: "আপনার যাচাই · নিশ্চিত না করা পর্যন্ত সংরক্ষণ হবে না" })}</p>}
          {saved && !rejected && <div className="grid gap-4 rounded-card border-2 border-pro-success bg-pro-success-soft p-5">
            <p className="flex items-center gap-3 text-xl font-semibold"><CircleCheckBig aria-hidden="true" className="size-7 shrink-0 text-pro-success" />{t({ en: "Saved to your pregnancy record", bn: "আপনার গর্ভকালের রেকর্ডে সংরক্ষিত হয়েছে" })}</p>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div><dt className="text-sm text-pro-muted">{t({ en: "Hemoglobin", bn: "হিমোগ্লোবিন" })}</dt><dd className="text-lg font-semibold tabular-nums">{value} {unit}</dd></div>
              <div><dt className="text-sm text-pro-muted">{t({ en: "Test date", bn: "পরীক্ষার তারিখ" })}</dt><dd className="text-lg font-semibold tabular-nums">{date}</dd></div>
            </dl>
            <p className="text-pro-muted">{t({ en: "You checked this value yourself. A doctor has not reviewed it.", bn: "এই মান আপনি নিজে মিলিয়েছেন। কোনো চিকিৎসক এটি পর্যালোচনা করেননি।" })}</p>
            <Link href="/app/jibonrekha" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:w-fit">{t({ en: "See it in Jibonrekha", bn: "জীবনরেখায় দেখুন" })}<ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>}
          {saved && !rejected ? null : !supported.length ? (
            <p role="status">
              {t({ en: "No supported hemoglobin field found. Nothing can be saved to the account.", bn: "সমর্থিত কোনো হিমোগ্লোবিনের ঘর পাওয়া যায়নি। অ্যাকাউন্টে কিছু সংরক্ষণ করা যাবে না।" })}
            </p>
          ) : (
            <>
              {supported.length > 1 && (
                <label className="grid gap-2">

                  {t({ en: "Hemoglobin field to review", bn: "যে হিমোগ্লোবিনের মান যাচাই করবেন" })}

                  <select
                    className={control}
                    value={fieldId}
                    disabled={locked || saved}
                    onChange={(event) => {
                      const selected = supported.find(
                        (item) => item.id === event.target.value,
                      );
                      setFieldId(event.target.value);
                      setValue(
                        selected?.parsingReliability === "recognized"
                          ? selected.value
                          : "",
                      );
                      setUnit(selected?.unit ?? "");
                      setConfirmed(false);
                    }}
                  >

                    <option value="">{t({ en: "Choose a field", bn: "একটি মান বেছে নিন" })}</option>

                    {supported.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} · {item.value} {item.unit}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {field && (
                <>
                  {field.parsingReliability !== "recognized" && (
                    <p className="font-semibold">
                      {draft.report.inputMethod === "manual" ? t({ en: "Enter the hemoglobin value printed on this image.", bn: "এই ছবিতে ছাপানো হিমোগ্লোবিনের মান লিখুন।" }) : t({ en: "The extracted digits are unclear. Enter the printed value from the image.", bn: "পড়া সংখ্যাগুলো অস্পষ্ট। ছবি থেকে ছাপানো মানটি লিখুন।" })}
                    </p>
                  )}
                  <p className="rounded-field bg-pro-surface p-3">
                    {field.rawValue ? t({ en: `Read from your photo: “${field.rawValue} ${field.unit}”. If it is different on paper, correct it below.`, bn: `আপনার ছবি থেকে পড়া: “${field.rawValue} ${field.unit}”। কাগজে অন্যরকম লেখা থাকলে নিচে ঠিক করে দিন।` }) : t({ en: "Nothing was read from the photo for this value. Type it from your report.", bn: "এই মানের জন্য ছবি থেকে কিছু পড়া যায়নি। রিপোর্ট দেখে লিখুন।" })}
                  </p>
                  <ReadAloudButton sensitive language={language === "bn" ? "bn" : "en"} label={t({ en: "Read this value aloud", bn: "এই মান পড়ে শোনান" })} text={t({
                    en: `Hemoglobin, as you have entered it: ${value || "not entered yet"} ${unit}. Original text read from the image: ${field.rawValue || "nothing"}. Check it against the printed report before you save.`,
                    bn: `হিমোগ্লোবিন, আপনার লেখা মান: ${value || "এখনো লেখা হয়নি"} ${unit}। ছবি থেকে পড়া মূল লেখা: ${field.rawValue || "কিছু নেই"}। সংরক্ষণের আগে ছাপানো রিপোর্টের সঙ্গে মিলিয়ে নিন।` })} />
                  <div className="grid gap-4 sm:grid-cols-2">
                  <Part letter={t({ en: "A", bn: "ক" })} title={t({ en: "Hemoglobin value and unit", bn: "হিমোগ্লোবিনের মান ও একক" })} hint={t({ en: "Copy the number and unit (for example g/dL) exactly as printed.", bn: "ছাপা সংখ্যা ও একক (যেমন g/dL) হুবহু লিখুন।" })} />
                  <label className="grid gap-2 font-semibold">

                    {t({ en: "Hemoglobin value from report", bn: "রিপোর্টে লেখা হিমোগ্লোবিনের মান" })}

                    <input
                      className={control}
                      value={value}
                      disabled={locked || saved}
                      onChange={(event) => {
                        setValue(event.target.value);
                        setConfirmed(false);
                      }}
                      inputMode="decimal"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <VoiceDictationButton language={language === "bn" ? "bn" : "en"} value={value} maxLength={32} onChange={next => { setValue(next); setConfirmed(false); }} />
                    <p className="mt-1 text-sm text-pro-muted">{t({ en: "Voice input is an unverified draft. Check the printed report and confirm the value and unit before saving.", bn: "কণ্ঠে লেখা তথ্য যাচাইহীন খসড়া। সংরক্ষণের আগে ছাপানো রিপোর্টের সঙ্গে মান ও একক মিলিয়ে নিশ্চিত করুন।" })}</p>
                  </div>
                  <label className="grid gap-2 font-semibold">

                    {t({ en: "Printed unit", bn: "রিপোর্টে লেখা একক" })}

                    <input
                      className={control}
                      value={unit}
                      disabled={locked || saved}
                      onChange={(event) => {
                        setUnit(event.target.value);
                        setConfirmed(false);
                      }}
                    />
                  </label>
                  <Part letter={t({ en: "B", bn: "খ" })} title={t({ en: "Date of the test", bn: "পরীক্ষার তারিখ" })} hint={t({ en: "The date printed on the report, not today's date.", bn: "রিপোর্টে ছাপা তারিখ, আজকের তারিখ নয়।" })} />
                  <label className="grid gap-2 font-semibold sm:col-span-2">

                    {t({ en: "Observation date", bn: "তথ্যের তারিখ" })}

                    <input
                      className={control}
                      type="date"
                      value={date}
                      disabled={locked || saved}
                      aria-describedby="account-report-date-hint"
                      onChange={(event) => {
                        setDate(event.target.value);
                        setConfirmed(false);
                      }}
                    />
                  </label>
                  <p id="account-report-date-hint" className="-mt-2 text-pro-muted sm:col-span-2">

                    {t({ en: "If you can’t verify the date, leave this review unsaved.", bn: "তারিখ মিলিয়ে দেখতে না পারলে এই তথ্য সংরক্ষণ করবেন না।" })}
                  </p>
                  <Part letter={t({ en: "C", bn: "গ" })} title={t({ en: "Where to keep it", bn: "কোথায় রাখবেন" })} hint={t({ en: "Choose the pregnancy this report belongs to.", bn: "রিপোর্টটি কোন গর্ভকালের, তা বেছে নিন।" })} />
                  <label className="grid gap-2 font-semibold sm:col-span-2">
                    {t({ en: "Pregnancy record", bn: "গর্ভকালের রেকর্ড" })}

                    <select
                      className={control}
                      value={pregnancyId}
                      disabled={locked || saved}
                      onChange={(event) => {
                        setPregnancyId(event.target.value);
                        setConfirmed(false);
                      }}
                    >

                      <option value="">{t({ en: "Choose a record", bn: "একটি রেকর্ড বেছে নিন" })}</option>

                      {pregnancies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  </div>
                  <Part letter={t({ en: "D", bn: "ঘ" })} title={t({ en: "Confirm and save", bn: "নিশ্চিত করে সংরক্ষণ করুন" })} hint={t({ en: "Tick only if everything above matches your paper report.", bn: "ওপরের সব কাগজের রিপোর্টের সঙ্গে মিললে তবেই টিক দিন।" })} />
                  <label className="flex min-h-12 items-start gap-3 rounded-field bg-pro-surface p-3">
                    <input
                      className="mt-1 size-5 shrink-0"
                      type="checkbox"
                      checked={confirmed}
                      disabled={locked || saved}
                      onChange={(event) => setConfirmed(event.target.checked)}
                    />

                    {t({ en: "I checked the value, unit and date against the report and chose the correct pregnancy record.", bn: "রিপোর্টের সঙ্গে মান, একক ও তারিখ মিলিয়েছি এবং সঠিক গর্ভকালের রেকর্ড বেছে নিয়েছি।" })}

                  </label>
                  {!saved && !reviewId.current && !locked && (
                    <button type="button" disabled={saving} onClick={() => void reject()} className="min-h-12 text-left text-pro-primary underline disabled:opacity-60">
                      {t({ en: "Do not save this value (record that I rejected it)", bn: "এই মান সংরক্ষণ করব না (আমি বাতিল করেছি বলে নথিভুক্ত করুন)" })}
                    </button>
                  )}
                  {!saved && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void save()}
                      className="min-h-12 rounded-control bg-pro-primary px-4 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-60"
                    >
                      {saving
                        ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" })
                        : locked

                          ? t({ en: "Retry account save", bn: "আবার সংরক্ষণ চেষ্টা করুন" })

                          : t({ en: "Save reviewed hemoglobin", bn: "যাচাই করা হিমোগ্লোবিন সংরক্ষণ করুন" })}
                    </button>
                  )}
                </>
              )}
            </>
          )}
          <p ref={feedbackFocus} tabIndex={-1} role="status" aria-atomic="true" className={`${feedback ? "rounded-field border p-4 " + (saved ? "border-pro-success bg-pro-success-soft" : "border-pro-info bg-pro-info-soft") : ""} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus`}>
            {feedback}
          </p>
          <Link href={`/ask?q=${encodeURIComponent(educationTopics.ironFolate.en)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center text-pro-primary underline">
            {t({ en: "Read general education about iron and folic acid (opens a new tab)", bn: "আয়রন ও ফলিক অ্যাসিড নিয়ে সাধারণ শিক্ষামূলক তথ্য পড়ুন (নতুন ট্যাবে খুলবে)" })}
          </Link>
          <div className="flex flex-wrap gap-x-5">
            <button
              type="button"
              disabled={saving}
              className="min-h-12 text-pro-primary underline disabled:opacity-60"
              onClick={() => {
                setDraft(undefined);
                requestAnimationFrame(() => uploadFocus.current?.focus());
              }}
            >
              <RotateCcw aria-hidden="true" className="mr-2 inline size-4" />{saved ? t({ en: "Check another report", bn: "আরেকটি রিপোর্ট যাচাই করুন" }) : t({ en: "Start again with another photo", bn: "অন্য ছবি দিয়ে আবার শুরু করুন" })}
            </button>
            
          </div>
          </div>
        </section>
      )}
    </div>
  );

}
