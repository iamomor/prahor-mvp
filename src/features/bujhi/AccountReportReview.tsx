"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";

import { ImageMedicalEntry } from "./ImageMedicalEntry";

import { fileSha256 } from "./sha256";

import { SourcePreview } from "./SourcePreview";

import type { ExtractedReport, ExtractedReportField } from "./types";
import { isHemoglobinLabel, validDate } from "./validation";
import { educationTopics } from "../barta/education-topics";

type Pregnancy = { id: string; label: string };

type Draft = { report: ExtractedReport; source: File; reportId: string };

/** Three-step strip: words first (never only colour); step 1 add photo, 2 check values, 3 saved. */
function ReportSteps({ current }: { current: 0 | 1 | 2 }) {
  const { t } = useLanguage();
  const steps = [t({ en: "Add photo", bn: "ছবি দিন" }), t({ en: "Check values", bn: "মান মিলান" }), t({ en: "Save", bn: "সংরক্ষণ" })];
  return (
    <ol aria-label={t({ en: "Report steps", bn: "রিপোর্টের ধাপ" })} className="grid grid-cols-3 gap-2 text-sm font-semibold">
      {steps.map((name, at) => (
        <li key={name} aria-current={at === current ? "step" : undefined} className={`grid gap-1.5 ${at <= current ? "text-pro-text" : "text-pro-muted"}`}>
          <span aria-hidden="true" className={`h-1.5 rounded-pill ${at <= current ? "bg-pro-primary" : "bg-pro-control-border/40"}`} />
          <span>{at + 1}. {name}</span>
        </li>
      ))}
    </ol>
  );
}

export function AccountReportReview({
  pregnancies,
}: {
  pregnancies: Pregnancy[];
}) {
  const { t } = useLanguage();
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
  const pending = useRef(false);
  const snapshot = useRef<string | undefined>(undefined);
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
    snapshot.current = undefined;
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
          "Check the pregnancy, printed value, g/dL unit and date, then confirm your review.",
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
        confirmSave: true,

      });
      setLocked(true);
    }

    pending.current = true; setSaving(true); setFeedback(t({ bn: "সংরক্ষণ করা হচ্ছে…", en: "Saving reviewed measurement…" }));

    try {

      const response = await fetch("/api/reports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: snapshot.current,
      });
      if (response.ok) {
        setSaved(true);
        setFeedback(
          "Saved to your account. This measurement was reviewed by you, not a clinician.",
        );
      } else if (response.status === 400) {
        snapshot.current = undefined;
        setLocked(false);
        setFeedback(
          "Not saved. Check the measurement and date, then try again.",
        );
      } else {
        setFeedback(
          "Save could not be confirmed. Retry to check the same save.",
        );
      }
    } catch {
      setFeedback(
        "Save could not be confirmed. Check your connection and retry the same save.",
      );
    } finally {
      pending.current = false;
      setSaving(false);
      requestAnimationFrame(() => feedbackFocus.current?.focus());
    }
  }

  const control =
    "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";

  return (
    <div className="grid w-full min-w-0 gap-6 py-6 text-pro-text [overflow-wrap:anywhere]">
      <header className="grid gap-4 border-b border-pro-border pb-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <h2 ref={uploadFocus} tabIndex={-1} className="text-2xl font-semibold">
          {t({ en: "Report review", bn: "রিপোর্ট যাচাই" })}
        </h2>
        <ReportSteps current={saved ? 2 : draft ? 1 : 0} />
        <p className="max-w-[80ch] border-l-2 border-pro-info pl-4 text-pro-muted md:col-span-2">
          <span className="font-semibold">{t({ en: "Prototype.", bn: "প্রোটোটাইপ।" })}</span>{" "}
          {t({ en: "Account saving supports maternal hemoglobin in g/dL. Other values are shown for reading only.", bn: "অ্যাকাউন্টে এখন শুধু হিমোগ্লোবিন (g/dL) সংরক্ষণ করা যায়। অন্য মানগুলো শুধু পড়ার জন্য দেখানো হয়।" })}
        </p>
      </header>
      {!draft && <ImageMedicalEntry onDraft={openReview} onManualFile={openManual} showProgress={false} />}
      {draft && (
        <section
          className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          aria-labelledby="account-report-heading"
        >
          <h3
            id="account-report-heading"
            ref={reviewFocus}
            tabIndex={-1}
            className="text-2xl font-semibold xl:col-span-2"
          >
            {draft.report.inputMethod === "manual" ? t({ en: "Check the printed value", bn: "রিপোর্টে লেখা মান মিলিয়ে দেখুন" }) : t({ en: "Check what was read", bn: "যা পড়া হয়েছে মিলিয়ে দেখুন" })}
          </h3>
          <div className="grid min-w-0 gap-4">
          {draft.report.inputMethod === "manual" && <p className="rounded-field border border-pro-warning bg-pro-warning-soft p-4">Manual entry from this report image. OCR did not read it. Check the printed value before saving.</p>}
          <SourcePreview source={draft.source} expanded />
          {(draft.report.rawText ||
            draft.report.fields.some(
              (item) => !isHemoglobinLabel(item.label),
            )) && (
            <details className="rounded-field border border-pro-border px-3">
              <summary className="min-h-12 cursor-pointer py-3 font-semibold text-pro-primary">
                {t({ en: "OCR text and other fields", bn: "পড়া লেখা ও অন্যান্য মান" })}
              </summary>
              <div className="grid min-w-0 gap-3 pb-3">
                {draft.report.rawText && (
                  <pre className="whitespace-pre-wrap font-body [overflow-wrap:anywhere]">
                    {draft.report.rawText}
                  </pre>
                )}
                {draft.report.fields
                  .filter((item) => !isHemoglobinLabel(item.label))
                  .map((item) => (
                    <p key={item.id}>
                      {item.label} · {item.value} {item.unit}. Read from image,
                      unsupported for account saving.
                    </p>
                  ))}
              </div>
            </details>
          )}
          </div>
          <div className="grid min-w-0 gap-5 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6">
          <p className="border-b border-pro-border pb-4 font-semibold text-pro-primary">{t({ en: "Your review · nothing saves until you confirm", bn: "আপনার যাচাই · নিশ্চিত না করা পর্যন্ত সংরক্ষণ হবে না" })}</p>
          {!supported.length ? (
            <p role="status">
              No supported hemoglobin field found. Nothing can be saved to the
              account.
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
                      {draft.report.inputMethod === "manual" ? "Enter the hemoglobin value printed on this image." : "The extracted digits are unclear. Enter the printed value from the image."}
                    </p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
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
            Read general education about iron and folic acid (opens a new tab)
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
              {t({ en: "Choose another image", bn: "অন্য ছবি বেছে নিন" })}
            </button>
            {saved && (
              <Link
                href="/app/jibonrekha"
                className="inline-flex min-h-12 items-center text-pro-primary underline"
              >
                {t({ en: "View Jibonrekha", bn: "জীবনরেখায় দেখুন" })}
              </Link>
            )}
          </div>
          </div>
        </section>
      )}
    </div>
  );

}
