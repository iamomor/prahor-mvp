"use client";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { allObservationCategories, demoBaby, demoMother, demoUser, getDemoObservations, saveDemoObservations, type HealthObservation } from "@/features/jibonrekha/demo-health";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { resultStructure } from "./report-normalization";
import { DataJudgement } from "./DataJudgement";
import { fieldIssues, parseNumeric } from "./validation";
import type { ExtractedReport, ExtractedReportField } from "./types";

const card = "min-w-0 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]";
const control = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
const button = "min-h-12 whitespace-normal rounded-control border border-pro-primary px-4 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";

export function ReportReview({ report }: { report: ExtractedReport }) {
  const id = useId();
  const [fields, setFields] = useState(() => report.fields.map((field) => ({ ...field, reviewStatus: "pending" as ExtractedReportField["reviewStatus"] })));
  const [existingRecords, setExistingRecords] = useState<HealthObservation[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const loaded = getDemoObservations();
      setExistingRecords(loaded);
      const saved = loaded.filter((item) => item.sourceReportId === report.id);
      setSavedIds(saved.flatMap((item) => item.sourceFieldId ? [item.sourceFieldId] : []));
      setFields(report.fields.map((field) => {
        const entry = saved.find((item) => item.sourceFieldId === field.id);
        return entry ? { ...field, label: entry.label, value: entry.value, unit: entry.unit, destination: entry.recordType,
          category: entry.category ?? field.category, observedAt: entry.observedAt, reportDate: entry.reportDate,
          referenceRange: entry.referenceRange, notes: entry.notes, rawValue: entry.rawValue ?? field.rawValue,
          normalizedValue: entry.normalizedValue, unitUnavailable: entry.unitUnavailable,
          correctionHistory: entry.correctionHistory, reviewStatus: "verified" } : { ...field, reviewStatus: "pending" };
      }));
      setLoading(false);
    });
    return () => { active = false; };
  }, [report]);

  function update(fieldId: string, patch: Partial<ExtractedReportField>) {
    setFields((current) => current.map((field) => field.id === fieldId ? { ...field, ...patch, normalizedValue: Object.hasOwn(patch, "value") ? undefined : (Object.hasOwn(patch, "normalizedValue") ? patch.normalizedValue : field.normalizedValue), reviewStatus: "pending", correctionHistory: [...(field.correctionHistory ?? []), ...Object.entries(patch).map(([property, value]) => ({ property, before: String(field[property as keyof ExtractedReportField] ?? ""), after: String(value ?? ""), at: new Date().toISOString() }))] } : field));
    setErrors((current) => ({ ...current, [fieldId]: "" }));
    setFeedback(null);
  }
  function verify(field: ExtractedReportField) {
    const issues = report.inputMethod ? fieldIssues(field, report.observedAt) : { errors: [] };
    if (issues.errors.length || !field.value.trim() || (field.destination !== "mother" && field.destination !== "baby")) {
      setErrors((current) => ({ ...current, [field.id]: issues.errors.join(" ") || "Enter a value and choose Mother or Baby before marking this field checked." }));
      document.getElementById(`${id}-${field.id}-${!field.value.trim() ? "value" : "destination"}`)?.focus();
      return;
    }
    setFields((current) => current.map((item) => item.id === field.id ? { ...item, reviewStatus: "verified" } : item));
    setErrors((current) => ({ ...current, [field.id]: "" }));
    setFeedback(null);
  }
  function save() {
    const verified = fields.filter((field) => field.reviewStatus === "verified" && !savedIds.includes(field.id));
    if (verified.length === 0) { setFeedback({ error: true, message: "No new verified information to save. Check a pending field, or view information already saved in Jibonrekha." }); return; }
    if (verified.some((field) => !field.value.trim() || !["mother", "baby"].includes(field.destination) || (report.inputMethod && fieldIssues(field, report.observedAt).errors.length > 0))) {
      setFeedback({ error: true, message: "Check each selected value and record destination before saving." }); return;
    }
    const reviewedAt = new Date().toISOString();
    try {
      const observations: HealthObservation[] = verified.map((field) => ({
        id: crypto.randomUUID(), recordType: field.destination as "mother" | "baby",
        recordId: field.destination === "mother" ? demoMother.id : demoBaby.id,
        label: field.label, value: field.value.trim(), unit: field.unit.trim(), observedAt: field.observedAt ?? report.observedAt,
        source: report.source, sourceReportId: report.id, sourceFieldId: field.id,
        reviewedAt, reviewedBy: demoUser.id, reviewStatus: "verified",
        category: field.category, inputMethod: report.inputMethod,
        reportSchemaVersion: report.schemaVersion, documentType: report.documentType,
        structuredResult: resultStructure(field), laboratory: field.laboratory, sourceLocation: field.sourceLocation,
        rawValue: field.rawValue ?? report.fields.find((original) => original.id === field.id)?.value,
        unitUnavailable: field.unitUnavailable, normalizedValue: field.normalizedValue, referenceRange: field.referenceRange, reportDate: field.reportDate,
        notes: field.notes, sourceText: field.sourceText, sourceFileId: report.sourceFileId,
        ocrConfidence: field.ocrConfidence, parsingReliability: field.parsingReliability, correctionHistory: field.correctionHistory,
      }));
      const result = saveDemoObservations(observations);
      setExistingRecords(result);
      setSavedIds(result.filter((item) => item.sourceReportId === report.id).flatMap((item) => item.sourceFieldId ? [item.sourceFieldId] : []));
      setFeedback({ error: false, message: `${verified.length} verified field(s) saved on this device — not sent. User review is not clinician confirmation. Pending and rejected fields were excluded.` });
    } catch {
      setFeedback({ error: true, message: "Information not saved. Your corrections and checks are still here. Check browser storage and available space, then try again. No fields were partially saved." });
    }
  }
  const pending = fields.filter((field) => field.reviewStatus === "pending").length;
  const verified = fields.filter((field) => field.reviewStatus === "verified").length;
  const rejected = fields.filter((field) => field.reviewStatus === "rejected").length;
  const complete = fields.length > 0 && fields.every((field) => savedIds.includes(field.id) || field.reviewStatus === "rejected");

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-4xl grid-cols-1 gap-[var(--pro-gap-group)] px-4 py-6 text-pro-text [overflow-wrap:anywhere] sm:px-6 sm:py-10">
      <aside className="rounded-field border border-pro-border bg-pro-surface p-4" aria-label="Demo information">Development mode — fictional test records only. Local OCR is text recognition, not clinical interpretation. Do not enter real patient information.</aside>
      <header><h1 className="text-3xl font-semibold">Bujhi — <span lang="bn">বুঝি</span></h1><p className="mt-3">Review your entered, spoken, or extracted information.</p><AccessPreferencesControl /></header>
      <section className={card} aria-labelledby={`${id}-report`}>
        <h2 id={`${id}-report`} className="text-2xl font-semibold">{report.name}</h2>
        <dl className="mt-4 grid gap-3">
          <div><dt className="text-pro-muted">Report ID</dt><dd>{report.id}</dd></div>
          <div><dt className="text-pro-muted">Extraction source</dt><dd>{report.inputMethod ? (report.source === "self_reported" ? `Self-reported · ${report.inputMethod} entry` : "Document-extracted · Local image OCR") : "Document-extracted · Fictional AI extraction"}</dd></div>
          <div><dt className="text-pro-muted">Review status</dt><dd>{loading ? "Loading saved review…" : complete ? (savedIds.length ? "Review complete — included fields saved locally" : "Review complete — all fields excluded; nothing saved") : savedIds.length ? "Partially saved — review remaining fields" : "Needs review"}</dd></div>
          <div><dt className="text-pro-muted">Extracted fields</dt><dd>{fields.length}</dd></div>
          <div><dt className="text-pro-muted">Draft observation date</dt><dd><time dateTime={report.observedAt}>{Number.isFinite(Date.parse(report.observedAt)) ? new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(report.observedAt)) : "Unknown — enter the observation date for each field"}</time></dd></div>
        </dl>
        <p className="mt-4 text-pro-muted">{pending} pending · {verified} checked by you · {rejected} excluded. Checking confirms your review only; no clinician has verified these values.</p>
      </section>
      {report.inputMethod && <DataJudgement fields={fields} report={report} existing={existingRecords} />}
      {report.rawText !== undefined && <details className={card} open><summary className="min-h-12 cursor-pointer font-semibold">Raw OCR text — review against original</summary><pre className="mt-3 whitespace-pre-wrap font-body">{report.rawText || "No text recognized."}</pre><p>OCR confidence: {report.ocrConfidence === undefined ? "Confidence unavailable" : `${report.ocrConfidence.toFixed(1)} / 100 (engine text confidence only)`}</p>{report.unrecognizedText?.length ? <details><summary>Unrecognized content — not imported as observations</summary><pre className="whitespace-pre-wrap font-body">{report.unrecognizedText.join("\n")}</pre></details> : null}</details>}
      {report.transcript && <section className={card} aria-label="Original speech transcript"><h2 className="text-xl font-semibold">Original speech transcript</h2><p className="whitespace-pre-wrap">{report.transcript}</p></section>}
      {fields.length === 0 && <p className={card}>No extracted fields to review. Nothing will be saved to Jibonrekha.</p>}
      {fields.map((field) => {
        const prefix = `${id}-${field.id}`;
        const saved = savedIds.includes(field.id);
        const original = report.fields.find((item) => item.id === field.id);
        return <fieldset key={field.id} className={card} disabled={loading || saved} aria-describedby={`${prefix}-status ${prefix}-original`}>
          <legend className="px-2 text-xl font-semibold">{field.label}</legend>
          <p id={`${prefix}-original`} className="text-pro-muted">{report.inputMethod ? "Original input" : "Fictional extraction"}: {original?.rawValue ?? original?.value} {original?.unit}. Compare and correct before checking.</p>
          <p id={`${prefix}-status`} className="mt-3 font-semibold">{saved ? "Saved locally · User-reviewed" : field.reviewStatus === "verified" ? "Verified by you · Not clinically verified" : field.reviewStatus === "rejected" ? "Rejected · Excluded from saving" : "Pending · Needs your review"}</p>
          <div className="mt-4 grid min-w-0 gap-[var(--pro-gap-field)]">
            {report.inputMethod && <>
              <div><label htmlFor={`${prefix}-category`} className="mb-2 block font-semibold">{field.label}: record category</label><select id={`${prefix}-category`} className={control} value={field.category ?? "general_notes"} onChange={(event) => update(field.id, { category: event.target.value as ExtractedReportField["category"] })}>{Object.entries(allObservationCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><label htmlFor={`${prefix}-label`} className="mb-2 block font-semibold">Observation name (required)</label><input id={`${prefix}-label`} className={control} value={field.label} onChange={(event) => update(field.id, { label: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-date`} className="mb-2 block font-semibold">{field.label}: observation date (required)</label><input id={`${prefix}-date`} type="date" className={control} value={(field.observedAt ?? report.observedAt).slice(0, 10)} onChange={(event) => update(field.id, { observedAt: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-reportDate`} className="mb-2 block font-semibold">{field.label}: report date (optional)</label><input id={`${prefix}-reportDate`} type="date" className={control} value={field.reportDate ?? ""} onChange={(event) => update(field.id, { reportDate: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-range`} className="mb-2 block font-semibold">{field.label}: printed reference range (optional)</label><input id={`${prefix}-range`} className={control} value={field.referenceRange ?? ""} onChange={(event) => update(field.id, { referenceRange: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-notes`} className="mb-2 block font-semibold">{field.label}: notes (optional)</label><textarea id={`${prefix}-notes`} className={control} value={field.notes ?? ""} onChange={(event) => update(field.id, { notes: event.target.value })} /></div>
              <label className="flex gap-3"><input type="checkbox" checked={field.unitUnavailable ?? false} onChange={(event) => update(field.id, { unitUnavailable: event.target.checked })} />Unit unavailable or not applicable — do not infer</label>
              {parseNumeric(field.value).kind === "number" && parseNumeric(field.value).normalized !== field.value && <label className="flex gap-3"><input type="checkbox" checked={Boolean(field.normalizedValue)} onChange={(event) => update(field.id, { normalizedValue: event.target.checked ? parseNumeric(field.value).normalized : undefined })} />Keep original and also save candidate normalization {parseNumeric(field.value).normalized}</label>}
              {field.sourceText && <p className="whitespace-pre-wrap text-pro-muted">Source snippet: {field.sourceText}</p>}
              <p className="text-pro-muted">Parsing: {field.parsingReliability ?? "Manual review required"}. OCR page confidence (not per-field): {field.ocrConfidence === undefined ? "Confidence unavailable" : field.ocrConfidence.toFixed(1)}. User check is not clinician confirmation.</p>
            </>}
            <div><label htmlFor={`${prefix}-value`} className="mb-2 block font-semibold">{field.label}: extracted value (required)</label><input id={`${prefix}-value`} className={control} value={field.value} onChange={(event) => update(field.id, { value: event.target.value })} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${prefix}-error` : undefined} /></div>
            <div><label htmlFor={`${prefix}-unit`} className="mb-2 block font-semibold">{field.label}: unit (optional)</label><input id={`${prefix}-unit`} className={control} value={field.unit} onChange={(event) => update(field.id, { unit: event.target.value })} /></div>
            <div><label htmlFor={`${prefix}-destination`} className="mb-2 block font-semibold">{field.label}: record destination (required)</label><select id={`${prefix}-destination`} className={control} value={field.destination} onChange={(event) => update(field.id, { destination: event.target.value as ExtractedReportField["destination"] })} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${prefix}-error` : undefined}><option value="">Choose a record</option><option value="mother">Mother · {demoMother.id}</option><option value="baby">Baby · {demoBaby.id}</option></select></div>
            {errors[field.id] && <p id={`${prefix}-error`} role="alert" className="text-pro-danger">{errors[field.id]}</p>}
            <div className="flex flex-wrap gap-3"><button type="button" className={`${button} text-pro-primary`} onClick={() => verify(field)}>Mark {field.label} as checked</button><button type="button" className={`${button} text-pro-primary`} onClick={() => { setFields((current) => current.map((item) => item.id === field.id ? { ...item, reviewStatus: field.reviewStatus === "rejected" ? "pending" : "rejected" } : item)); setErrors((current) => ({ ...current, [field.id]: "" })); setFeedback(null); }}>{field.reviewStatus === "rejected" ? `Restore ${field.label} for review` : `Exclude ${field.label}`}</button></div>
          </div>
        </fieldset>;
      })}
      <section className={card} aria-label="Save reviewed information">
        <p>Only checked fields will be saved to the selected records. Review destinations before saving. Saved fields are locked here to prevent accidental duplicate submissions.</p>
        <button
          type="button"
          disabled={loading || fields.length === 0}
          onClick={save}
          className={`${button} mt-4 bg-pro-primary text-pro-on-primary disabled:text-pro-on-primary`}
        >
          Save Verified Information
        </button>
        <p role="status" aria-atomic="true" className={`mt-3 ${feedback?.error ? "text-pro-danger" : "text-pro-text"}`}>{feedback?.message}</p>
        <Link href="/jibonrekha" className="mt-4 inline-flex min-h-12 items-center text-pro-primary underline">View Jibonrekha health timeline</Link>
      </section>
    </div>
  );
}
