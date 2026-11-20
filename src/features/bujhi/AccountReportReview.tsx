"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Check, FileCheck2 } from "lucide-react";
import { ImageMedicalEntry } from "./ImageMedicalEntry";

import { fileSha256 } from "./sha256";

import { SourcePreview } from "./SourcePreview";

import type { ExtractedReport, ExtractedReportField } from "./types";
import { isHemoglobinLabel, validDate } from "./validation";
import { educationTopics } from "../barta/education-topics";

type Pregnancy = { id: string; label: string };

type Draft = { report: ExtractedReport; source: File; reportId: string };
type Stage = "check" | "learn" | "save";
const primary = "inline-flex min-h-12 items-center justify-center rounded-control bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";
const secondary = "inline-flex min-h-12 items-center justify-center rounded-control border border-pro-control-border px-4 py-3 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";
const control = "min-h-12 w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";

export function AccountReportReview({
  pregnancies,
}: {
  pregnancies: Pregnancy[];
}) {
  const [draft, setDraft] = useState<Draft>();
  const [fields, setFields] = useState<ExtractedReportField[]>([]);
  const [stage, setStage] = useState<Stage>("check");
  const [language, setLanguage] = useState<"bn" | "en">("bn");
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
      const original = draft.report.fields.find((item) => item.id === field.id)!;
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
    pending.current = true; setSaving(true); setFeedback("Saving reviewed measurement…");
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
    <div className="mx-auto grid w-full max-w-3xl min-w-0 gap-5 px-4 py-6 text-pro-text [overflow-wrap:anywhere] sm:px-6">
      <header className="grid gap-2">
        <h2 ref={uploadFocus} tabIndex={-1} className="text-2xl font-semibold">
          Report review
        </h2>
        <p className="text-pro-muted">
          Prototype. Account saving supports maternal hemoglobin in g/dL.
        </p>
        <p>Saved now: hemoglobin (g/dL). Other values are shown for reading only.</p>
        <p lang="bn">এখন সংরক্ষণ করা যায়: হিমোগ্লোবিন (g/dL)। অন্য মানগুলো শুধু পড়ার জন্য দেখানো হয়।</p>
      </header>
      {!draft && <ImageMedicalEntry onDraft={openReview} onManualFile={openManual} />}
      {draft && (
        <section
          className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6"
          aria-labelledby="account-report-heading"
        >
          <h3
            id="account-report-heading"
            ref={reviewFocus}
            tabIndex={-1}
            className="text-xl font-semibold"
          >
            {draft.report.inputMethod === "manual" ? "Check the printed value" : "Check what was read"}
          </h3>
          {draft.report.inputMethod === "manual" && <p>Manual entry from this report image. OCR did not read it. Check the printed value before saving.</p>}
          <SourcePreview source={draft.source} />
          {(draft.report.rawText ||
            draft.report.fields.some(
              (item) => !isHemoglobinLabel(item.label),
            )) && (
            <details className="rounded-field border border-pro-border px-3">
              <summary className="min-h-12 cursor-pointer py-3 font-semibold text-pro-primary">
                OCR text and other fields
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
          {!supported.length ? (
            <p role="status">
              No supported hemoglobin field found. Nothing can be saved to the
              account.
            </p>
          ) : (
            <>
              {supported.length > 1 && (
                <label className="grid gap-2">
                  Hemoglobin field to review
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
                    <option value="">Choose a field</option>
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
                  <label className="grid gap-2">
                    Hemoglobin value from report
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
                  <label className="grid gap-2">
                    Printed unit
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
                  <label className="grid gap-2">
                    Observation date
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
                  <p id="account-report-date-hint" className="text-pro-muted">
                    If you can’t verify the date, leave this review unsaved.
                  </p>
                  <label className="grid gap-2">
                    Pregnancy record
                    <select
                      className={control}
                      value={pregnancyId}
                      disabled={locked || saved}
                      onChange={(event) => {
                        setPregnancyId(event.target.value);
                        setConfirmed(false);
                      }}
                    >
                      <option value="">Choose a record</option>
                      {pregnancies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex min-h-12 items-start gap-3 rounded-field bg-pro-surface p-3">
                    <input
                      className="mt-1 size-5 shrink-0"
                      type="checkbox"
                      checked={confirmed}
                      disabled={locked || saved}
                      onChange={(event) => setConfirmed(event.target.checked)}
                    />
                    I checked the value, unit and date against the report and
                    chose the correct pregnancy record.
                  </label>
                  {!saved && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void save()}
                      className="min-h-12 rounded-control bg-pro-primary px-4 font-semibold text-pro-on-primary disabled:opacity-60"
                    >
                      {saving
                        ? "Saving…"
                        : locked
                          ? "Retry account save"
                          : "Save reviewed hemoglobin"}
                    </button>
                  )}
                </>
              )}
            </>
          )}
          <p ref={feedbackFocus} tabIndex={-1} role="status" aria-atomic="true" className="focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
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
              Choose another image
            </button>
            {saved && (
              <Link
                href="/app/jibonrekha"
                className="inline-flex min-h-12 items-center text-pro-primary underline"
              >
                View Jibonrekha
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );

}
