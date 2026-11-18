"use client";

import { allObservationCategories, demoMother, demoUser, getDemoObservations, getDemoWorkspace, saveDemoObservations, saveDemoReportDraft, type HealthObservation } from "@/features/jibonrekha/demo-health";
import Link from "next/link";
import { Check, FileText, Pencil, Plus, ScanLine } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { normalizeReport, resultStructure } from "./report-normalization";
import { DataJudgement } from "./DataJudgement";
import { fieldIssues, isHemoglobinLabel, parseNumeric } from "./validation";
import { documentLabels, sectionLabels, type DocumentType, type SourceLocation } from "./report-schema";
import { abbreviationHelp, documentSubtypes, ultrasoundGroups, type UltrasoundSubtype } from "./ultrasound";
import { WorkflowProgress } from "./WorkflowProgress";
import { SourcePreview } from "./SourcePreview";
import { autoAnswerLanguage, QuickAnswers, words, type AnswerLanguage } from "./QuickAnswers";
import type { ExtractedReport, ExtractedReportField } from "./types";

const card = "min-w-0 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]";
const control = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
const groupOf = (field: ExtractedReportField) => field.ultrasound?.group ?? (field.section ? "section-" + field.section : "other");
const rowAction = "inline-flex min-h-12 items-center gap-2 rounded-control px-2 text-left font-semibold text-pro-primary hover:underline focus-visible:outline-3 focus-visible:outline-pro-focus disabled:opacity-60";
const button = "min-h-12 whitespace-normal rounded-control border border-pro-primary px-4 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";

const primary = button + " inline-flex items-center justify-center bg-pro-primary text-pro-on-primary";

export function ReportReview({ report, source, recordsHref, onNew }: { report: ExtractedReport; source?: File; recordsHref: string; onNew?: () => void }) {
  const id = useId();
  const [stage, setStage] = useState<"check" | "learn" | "save" | "done">("check");
  const [answerLanguage, setAnswerLanguage] = useState<AnswerLanguage>("auto");
  const [locale, setLocale] = useState("bn");
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const language = answerLanguage === "auto" ? autoAnswerLanguage(locale) : answerLanguage;
  const w = (bn: string, en: string) => words(language, bn, en);
  function go(next: typeof stage) {
    if (next === "save") setFields((current) => current.map((field) => !field.destination && isHemoglobinLabel(field.label) ? { ...field, destination: "mother" } : field));
    setStage(next);
    requestAnimationFrame(() => stageHeading.current?.focus());
  }
  const [fields, setFields] = useState(() => report.fields.map((field) => ({ ...field, reviewStatus: "pending" as ExtractedReportField["reviewStatus"] })));
  const [workspace, setWorkspace] = useState<ReturnType<typeof getDemoWorkspace> | null>(null);
  const [episodeId, setEpisodeId] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>(report.documentType ?? "unknown");
  const [scanSubtype, setScanSubtype] = useState<UltrasoundSubtype | "">(report.scanSubtype ?? "");
  const [detailed, setDetailed] = useState(false);
  const [confirmedLink, setConfirmedLink] = useState(false);
  const [returnFieldId, setReturnFieldId] = useState("");
  const [region, setRegion] = useState<SourceLocation>();
  const [existingRecords, setExistingRecords] = useState<HealthObservation[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setLocale(navigator.languages?.[0] || navigator.language || "bn");
      setStage("check");
      const loaded = getDemoObservations();
      setExistingRecords(loaded);
      try { setWorkspace(getDemoWorkspace()); }
      catch { setFeedback({ error: true, message: "Pregnancy records could not be loaded. Your draft is still available." }); }
      setDocumentType(report.documentType ?? "unknown");
      setScanSubtype(report.scanSubtype ?? "");
      setConfirmedLink(false);
      const saved = loaded.filter((item) => item.sourceReportId === report.id);
      const firstSaved = saved[0];
      setEpisodeId(firstSaved?.pregnancyId ?? report.selectedEpisodeId ?? "");
      if (firstSaved?.documentType) setDocumentType(firstSaved.documentType);
      if (firstSaved?.scanSubtype) setScanSubtype(firstSaved.scanSubtype);
      setSavedIds(saved.flatMap((item) => item.sourceFieldId ? [item.sourceFieldId] : []));
      setFields(report.fields.map((field) => {
        const entry = saved.find((item) => item.sourceFieldId === field.id);
        return entry ? { ...field, label: entry.label, value: entry.value, unit: entry.unit, destination: entry.recordType,
          category: entry.category ?? field.category, observedAt: entry.observedAt, reportDate: entry.reportDate,
          referenceRange: entry.referenceRange, notes: entry.notes, rawValue: entry.rawValue ?? field.rawValue,
          normalizedValue: entry.normalizedValue, unitUnavailable: entry.unitUnavailable,
          recordId: entry.recordId, reviewedAt: entry.reviewedAt, originalLabel: entry.originalLabel ?? field.originalLabel, originalUnit: entry.originalUnit ?? field.originalUnit, correctionHistory: entry.correctionHistory, reviewStatus: "verified" } : { ...field, reviewStatus: field.reviewStatus === "rejected" ? "rejected" : "pending" };
      }));
      setLoading(false);
    });
    return () => { active = false; };
  }, [report]);

  function update(fieldId: string, patch: Partial<ExtractedReportField>) {
    setFields((current) => current.map((field) => field.id === fieldId ? { ...field, ...patch, originalLabel: field.originalLabel ?? (field.label || undefined), originalUnit: field.originalUnit ?? field.unit, normalizedValue: Object.hasOwn(patch, "value") ? undefined : (Object.hasOwn(patch, "normalizedValue") ? patch.normalizedValue : field.normalizedValue), reviewStatus: "pending", correctionHistory: [...(field.correctionHistory ?? []), ...Object.entries(patch).map(([property, value]) => ({ property, before: String(field[property as keyof ExtractedReportField] ?? ""), after: String(value ?? ""), at: new Date().toISOString() }))] } : field));
    if (Object.hasOwn(patch, "value") || Object.hasOwn(patch, "label")) setConfirmedLink(false);
    setErrors((current) => ({ ...current, [fieldId]: "" }));
    setFeedback(null);
  }
  function verify(field: ExtractedReportField) {
    if (field.reviewStatus === "rejected") return;
    const issues = fieldIssues(field, report.observedAt, false);
    if (issues.errors.length || !field.value.trim()) {
      setErrors((current) => ({ ...current, [field.id]: issues.errors.join(" ") || "Enter a result before checking this field." }));
      const editor = document.getElementById(id + "-" + field.id + "-editor") as HTMLDetailsElement | null;
      if (editor) editor.open = true;
      const invalid = !field.value.trim() ? "value" : issues.errors.some((error) => error.includes("observation date")) ? "date" : issues.errors.some((error) => error.includes("measurement unit")) ? "unit" : "value";
      document.getElementById(id + "-" + field.id + "-" + invalid)?.focus();
      return;
    }
    const reviewedAt = new Date().toISOString();
    setFields((current) => current.map((item) => item.id === field.id ? { ...item, reviewedAt, reviewStatus: "verified" } : item));
    setErrors((current) => ({ ...current, [field.id]: "" }));
    setFeedback(null);
  }
  function save() {
    if (!episodeId) { setFeedback({ error: true, message: "Choose the pregnancy record before saving." }); document.getElementById(id + "-episode")?.focus(); return; }
    if (linkConflict && !confirmedLink) { setFeedback({ error: true, message: "Confirm the pregnancy link before saving." }); return; }
    const verified = fields.filter((field) => field.reviewStatus === "verified" && !savedIds.includes(field.id));
    if (verified.length === 0) { setFeedback({ error: true, message: "No new verified information to save. Check a pending field, or view information already saved in Jibonrekha." }); return; }
    if (verified.some((field) => fieldIssues(field, report.observedAt).errors.length > 0 || (field.destination === "baby" && !field.recordId))) {
      setFeedback({ error: true, message: "Choose a valid mother or specific baby destination for each result." }); return;
    }
    const reviewedAt = new Date().toISOString();
    try {
      const observations: HealthObservation[] = verified.map((field) => ({
        id: crypto.randomUUID(), recordType: field.destination as "mother" | "baby",
        recordId: field.destination === "mother" ? workspace?.profile.id ?? demoMother.id : field.recordId!,
        pregnancyId: episodeId || undefined,
        label: field.label, value: field.value.trim(), unit: field.unit.trim(), observedAt: field.observedAt ?? report.observedAt,
        source: report.source, sourceReportId: report.id, sourceFieldId: field.id,
        reviewedAt: field.reviewedAt ?? reviewedAt, reviewedBy: demoUser.id, reviewStatus: "verified",
        category: field.category, inputMethod: report.inputMethod,
        reportSchemaVersion: report.schemaVersion, documentType, scanSubtype: documentType === "ultrasound" ? scanSubtype || undefined : undefined, ultrasound: field.ultrasound,
        structuredResult: resultStructure(field), laboratory: field.laboratory, sourceLocation: field.sourceLocation,
        originalLabel: field.ultrasound?.originalLabel ?? field.originalLabel ?? report.fields.find((original) => original.id === field.id)?.label,
        originalUnit: field.ultrasound?.originalUnit ?? field.originalUnit ?? report.fields.find((original) => original.id === field.id)?.unit,
        rawValue: field.rawValue ?? report.fields.find((original) => original.id === field.id)?.value,
        unitUnavailable: field.unitUnavailable, normalizedValue: field.normalizedValue, referenceRange: field.referenceRange, reportDate: field.reportDate,
        notes: field.notes, sourceText: field.sourceText, sourceFileId: report.sourceFileId, sourceDocument: report.sourceFileId ?? (report.source === "document_extracted" ? report.name : undefined),
        ocrConfidence: field.ocrConfidence, parsingReliability: field.parsingReliability, correctionHistory: field.correctionHistory,
      }));
      const result = saveDemoObservations(observations);
      setExistingRecords(result);
      go("done");
      setSavedIds(result.filter((item) => item.sourceReportId === report.id).flatMap((item) => item.sourceFieldId ? [item.sourceFieldId] : []));
      setFeedback({ error: false, message: `${verified.filter((field) => result.some((item) => item.sourceReportId === report.id && item.sourceFieldId === field.id)).length} verified field(s) saved on this device — not sent. User review is not clinician confirmation. Pending and rejected fields were excluded.` });
    } catch {
      setFeedback({ error: true, message: "Information not saved. Your corrections and checks are still here. Check browser storage and available space, then try again. No fields were partially saved." });
    }
  }
  function keepDraft() {
    try {
      saveDemoReportDraft(normalizeReport({ ...report, documentType, scanSubtype: scanSubtype || undefined, selectedEpisodeId: episodeId, fields: fields.map((field) => ({ ...field, reviewStatus: field.reviewStatus === "rejected" ? "rejected" : "pending" })) }));
      setFeedback({ error: false, message: "Draft kept on this device. Check the fields again before saving to Jibonrekha." });
    } catch { setFeedback({ error: true, message: "Could not keep the draft. Your current edits are still here." }); }
  }
  function addField() {
    const fieldId = crypto.randomUUID();
    setFields((current) => [...current, { id: fieldId, label: "", value: "", unit: "", destination: "", observedAt: report.scanDate || report.observedAt, reviewStatus: "pending" }]);
    requestAnimationFrame(() => {
      const editor = document.getElementById(id + "-" + fieldId + "-editor") as HTMLDetailsElement | null;
      if (editor) editor.open = true;
      document.getElementById(id + "-" + fieldId + "-label")?.focus();
    });
  }
  function resetChecks() {
    setFields((current) => current.map((field) => field.reviewStatus === "verified" && !savedIds.includes(field.id) ? { ...field, reviewStatus: "pending" } : field));
    setFeedback(null);
  }
  const episode = workspace?.episodes.find((item) => item.id === episodeId);
  const eddConflict = episode?.edd && fields.some((field) => field.reviewStatus !== "rejected" && /\bEDD\b/i.test(field.label) && field.value.trim() && field.value.trim() !== episode.edd);
  const patientIds = new Set(fields.filter((field) => field.reviewStatus !== "rejected" && /^patient ID$/i.test(field.label)).map((field) => field.value.trim()).filter(Boolean));
  const sourceEdds = new Set(fields.filter((field) => field.reviewStatus !== "rejected" && /\bEDD\b/i.test(field.label)).map((field) => field.value.trim()).filter(Boolean));
  const linkConflict = Boolean(eddConflict || patientIds.size > 1 || sourceEdds.size > 1);
  const checkedFields = fields.filter((field) => field.reviewStatus === "verified");
  const readyToLearn = !loading && checkedFields.length > 0 && fields.every((field) => field.reviewStatus !== "pending");
  const pending = fields.filter((field) => field.reviewStatus === "pending").length;
  const verified = fields.filter((field) => field.reviewStatus === "verified").length;
  const rejected = fields.filter((field) => field.reviewStatus === "rejected").length;
  const complete = fields.length > 0 && fields.every((field) => savedIds.includes(field.id) || field.reviewStatus === "rejected");

  return (
    <main className={"mx-auto grid w-full min-w-0 grid-cols-1 gap-4 px-4 py-4 text-pro-text [overflow-wrap:anywhere] sm:gap-5 sm:px-6 sm:py-6 " + (stage === "check" && source ? "max-w-7xl" : "max-w-3xl")}>
      <header className="grid gap-3" lang={language}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1 basis-64"><WorkflowProgress current={stage} language={language} /></div>
          <label className="flex flex-wrap items-center gap-2 font-semibold">Language · ভাষা<select value={answerLanguage} onChange={(event) => setAnswerLanguage(event.target.value as AnswerLanguage)} className="min-h-12 rounded-control border border-pro-control-border bg-pro-elevated px-2"><option value="auto">Auto</option><option value="bn" lang="bn">বাংলা</option><option value="en" lang="en">English</option></select></label>
        </div>
        <h2 ref={stageHeading} tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl">{stage === "check" ? w("যা পড়া হয়েছে মিলিয়ে দেখুন", "Check what was read") : stage === "learn" ? w("সহজ ভাষায় বুঝুন", "In simple words") : stage === "save" ? w("কার রেকর্ডে রাখবেন?", "Choose where to save") : w("সংরক্ষণ সম্পন্ন", "Saved")}</h2>
      </header>
      {stage === "check" && <div className="grid min-w-0 gap-4">
      <section className="grid min-w-0 gap-x-6 gap-y-3 rounded-card bg-pro-surface px-4 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:px-6" aria-labelledby={`${id}-report`}>
        <div className="flex min-w-0 items-start gap-3 sm:col-span-2"><FileText aria-hidden="true" className="mt-1 size-6 shrink-0 text-pro-primary" /><h2 id={`${id}-report`} className="text-xl font-semibold tracking-tight sm:text-2xl">{documentType === "ultrasound" ? "আল্ট্রাসাউন্ড রিপোর্ট · Ultrasound report" : report.name}</h2></div>
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-pro-muted">
          {report.scanDate && <div><dt className="text-pro-muted">স্ক্যানের তারিখ · Scan date</dt><dd>{report.scanDate}</dd></div>}
          {detailed && <div><dt className="text-pro-muted">Report ID</dt><dd>{report.id}</dd></div>}
          <div><dt className="sr-only">Extraction source</dt><dd>{report.inputMethod ? (report.source === "self_reported" ? `Self-reported · ${report.inputMethod} entry` : "Document-extracted · Local image OCR") : "Document-extracted · Fictional AI extraction"}</dd></div>
          <div><dt className="sr-only">Review status</dt><dd>{loading ? "Loading saved review…" : complete ? (savedIds.length ? "Review complete — included fields saved locally" : "Review complete — all fields excluded; nothing saved") : savedIds.length ? "Partially saved — review remaining fields" : "Needs review"}</dd></div>
          {report.observedAt && <div><dt className="text-pro-muted">Observation date</dt><dd><time dateTime={report.observedAt}>{Number.isFinite(Date.parse(report.observedAt)) ? new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(report.observedAt)) : "Unknown — enter the observation date for each field"}</time></dd></div>}
        </dl>
        <dl className="flex flex-wrap items-start gap-x-5 gap-y-2 border-t border-pro-border pt-2 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div><dt className="text-pro-muted">To review</dt><dd className="text-2xl font-semibold tabular-nums">{pending}</dd></div>
          <div><dt className="text-pro-muted">Checked by you</dt><dd className="text-2xl font-semibold tabular-nums">{verified}</dd></div>
          {rejected > 0 && <div><dt className="text-pro-muted">Excluded</dt><dd className="text-2xl font-semibold tabular-nums">{rejected}</dd></div>}
        </dl>
      </section>
      <div className={source ? "grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : "grid min-w-0 gap-5"}>
      <aside id={id + "-source"} className="grid min-w-0 gap-3 empty:hidden lg:sticky lg:top-4" aria-label="Report source" tabIndex={-1}>
      {source && <SourcePreview source={source} location={region} onReturn={returnFieldId ? () => document.getElementById(returnFieldId)?.focus() : undefined} />}
      {report.rawText !== undefined && <details className={card}><summary className="min-h-12 cursor-pointer font-semibold">Raw OCR text — review against original</summary><pre className="mt-3 whitespace-pre-wrap font-body">{report.rawText || "No text recognized."}</pre><p>OCR confidence: {report.ocrConfidence === undefined ? "Confidence unavailable" : `${report.ocrConfidence.toFixed(1)} / 100 (engine text confidence only)`}</p>{report.unrecognizedText?.length ? <details><summary>Unrecognized content — not imported as observations</summary><pre className="whitespace-pre-wrap font-body">{report.unrecognizedText.join("\n")}</pre></details> : null}</details>}
      {report.transcript && <section className={card} aria-label="Original speech transcript"><h2 className="text-xl font-semibold">Original speech transcript</h2><p className="whitespace-pre-wrap">{report.transcript}</p></section>}
      </aside>
      <div className="grid min-w-0 gap-5">
      <details className="min-w-0">
          <summary className="min-h-12 cursor-pointer py-2 font-semibold text-pro-primary">Report settings</summary>
          <div className="pb-2">
        <label className="mb-2 block font-semibold" htmlFor={id + "-type"}>রিপোর্টের ধরন · Report type</label>
        <select id={id + "-type"} className={control} disabled={savedIds.length > 0} value={documentType} onChange={(event) => { setDocumentType(event.target.value as DocumentType); resetChecks(); }}>{Object.entries(documentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        {documentType === "ultrasound" && <><label className="mb-2 mt-4 block font-semibold" htmlFor={id + "-subtype"}>স্ক্যানের ধরন · Scan type</label><select id={id + "-subtype"} className={control} disabled={savedIds.length > 0} value={scanSubtype} onChange={(event) => { setScanSubtype(event.target.value as UltrasoundSubtype | ""); resetChecks(); }}><option value="">Unknown · Check the heading</option>{Object.entries(documentSubtypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></>}

          </div>
        </details>
      <section className="min-w-0 overflow-hidden rounded-card border border-pro-border bg-pro-elevated" aria-label="Report observations">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-5">
        <h3 className="text-xl font-semibold">রিপোর্টের তথ্য · Results</h3>
        <button type="button" className={rowAction} onClick={() => setDetailed(!detailed)} aria-pressed={detailed}>{detailed ? "Simple review" : "Detailed report"}</button>
      </div>
      {(documentType === "ultrasound" || fields.some((field) => field.ultrasound)) && <details className={card}><summary className="min-h-12 cursor-pointer font-semibold">পরিমাপের অর্থ · Measurement abbreviations</summary><dl className="grid gap-3">{abbreviationHelp.map(([code, name, bangla]) => <div key={code}><dt className="font-semibold">{code} · {name}</dt><dd lang="bn">{bangla}</dd></div>)}</dl></details>}
      {fields.length === 0 && <p className={card}>No fields identified. Compare the original and add any information you want to review.</p>}
      {Array.from(new Set(fields.map(groupOf))).map((group) => <details key={group} open className="min-w-0 border-t border-pro-border"><summary className="min-h-12 cursor-pointer bg-pro-surface px-4 py-3 font-semibold sm:px-5">{group === "other" ? "অন্যান্য তথ্য · Other observations" : group in ultrasoundGroups ? ultrasoundGroups[group as keyof typeof ultrasoundGroups] : sectionLabels[group.slice("section-".length) as keyof typeof sectionLabels]}</summary><div className="divide-y divide-pro-border">{fields.filter((field) => groupOf(field) === group).map((field) => {
        const prefix = `${id}-${field.id}`;
        const saved = savedIds.includes(field.id);
        const issue = report.inputMethod && field.reviewStatus === "pending" ? fieldIssues(field, report.observedAt, false).errors[0] : undefined;
        const original = report.fields.find((item) => item.id === field.id);
        return <fieldset key={field.id} className="min-w-0 px-4 py-3 sm:px-5" disabled={loading} aria-describedby={`${prefix}-status ${prefix}-original`}>
          <legend className="sr-only">{field.label || "New observation"}</legend>
          <div className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-4">
            <p className="!m-0 font-semibold">{field.label || "New observation"}</p>
            <p className="!m-0 whitespace-pre-wrap font-semibold tabular-nums">{field.ultrasound?.fetus && field.ultrasound.fetus + " · "}{field.value || "No readable value"} {field.unit}</p>
          <p id={prefix + "-original"} className={detailed || (source && original?.sourceText) ? "!mt-1 whitespace-pre-wrap text-pro-muted sm:col-span-2" : "sr-only"}>{original?.sourceText ? "On the report: " + original.sourceText : "Original input: " + (original?.rawValue ?? original?.value ?? "") + " " + (original?.unit ?? "")}</p>
          <p id={`${prefix}-status`} aria-live="polite" className="!mt-1 text-pro-muted sm:col-span-2">{saved ? "Saved locally · User-reviewed" : field.reviewStatus === "verified" ? "Verified by you · Not clinically verified" : field.reviewStatus === "rejected" ? "Rejected · Excluded from saving" : "Pending · Needs your review"}</p>
          {issue && !errors[field.id] && <p className="text-pro-muted sm:col-span-2">{issue}</p>}
          </div>
          {field.ultrasound?.group === "narrative" && report.source === "document_extracted" && <p>As stated in the source report</p>}
          {source && field.sourceLocation?.box && <button type="button" className={rowAction} id={prefix + "-source-link"} onClick={() => { setReturnFieldId(prefix + "-source-link"); setRegion(field.sourceLocation); const preview = document.getElementById(id + "-source"); const details = preview?.querySelector("details"); if (details) details.open = true; preview?.focus(); }}><ScanLine aria-hidden="true" className="size-4 shrink-0" />Show source line</button>}
          <details id={prefix + "-editor"} name={id + "-field-editor"} className="mr-3 inline-block min-w-0 align-top open:mr-0 open:block"><summary className="min-h-12 w-fit cursor-pointer py-3 font-semibold text-pro-primary"><Pencil aria-hidden="true" className="mr-2 inline size-4 align-text-bottom" /><span>{w("সংশোধন করুন", "Edit field")}</span></summary>
          <div className="mb-3 min-w-0 rounded-field border border-pro-border bg-pro-bg p-4">
          <fieldset disabled={saved} className="grid min-w-0 gap-[var(--pro-gap-field)]"><legend className="sr-only">Field correction</legend>
            {report.inputMethod && <>
              <div><label htmlFor={`${prefix}-category`} className="mb-2 block font-semibold">{field.label}: record category</label><select id={`${prefix}-category`} className={control} value={field.category ?? "general_notes"} onChange={(event) => update(field.id, { category: event.target.value as ExtractedReportField["category"] })}>{Object.entries(allObservationCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><label htmlFor={`${prefix}-label`} className="mb-2 block font-semibold">Observation name (required)</label><input id={prefix + "-label"} className={control} value={field.label} onChange={(event) => update(field.id, { label: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-date`} className="mb-2 block font-semibold">{field.label}: observation date (required)</label><input id={`${prefix}-date`} type="date" className={control} value={(field.observedAt ?? report.observedAt).slice(0, 10)} onChange={(event) => update(field.id, { observedAt: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-reportDate`} className="mb-2 block font-semibold">{field.label}: report date (optional)</label><input id={`${prefix}-reportDate`} type="date" className={control} value={field.reportDate ?? ""} onChange={(event) => update(field.id, { reportDate: event.target.value })} /></div>
              <div><label htmlFor={`${prefix}-range`} className="mb-2 block font-semibold">{field.label}: printed reference range (optional)</label><input id={`${prefix}-range`} className={control} value={field.referenceRange ?? ""} onChange={(event) => update(field.id, { referenceRange: event.target.value })} /></div>
              {isHemoglobinLabel(field.label) && <label className="grid gap-2 font-semibold">Unit printed for the reference range<input className={control} value={field.laboratory?.referenceIntervalUnit ?? ""} onChange={(event) => update(field.id, { laboratory: { originalTestLabel: field.laboratory?.originalTestLabel ?? field.label, ...field.laboratory, referenceIntervalUnit: event.target.value } })} /></label>}
            <div><label htmlFor={`${prefix}-notes`} className="mb-2 block font-semibold">{field.label}: notes (optional)</label><textarea id={`${prefix}-notes`} className={control} value={field.notes ?? ""} onChange={(event) => update(field.id, { notes: event.target.value })} /></div>
              <label className="flex gap-3"><input type="checkbox" checked={field.unitUnavailable ?? false} onChange={(event) => update(field.id, { unitUnavailable: event.target.checked })} />Unit unavailable or not applicable — do not infer</label>
              {parseNumeric(field.value).kind === "number" && parseNumeric(field.value).normalized !== field.value && <label className="flex gap-3"><input type="checkbox" checked={Boolean(field.normalizedValue)} onChange={(event) => update(field.id, { normalizedValue: event.target.checked ? parseNumeric(field.value).normalized : undefined })} />Keep original and also save candidate normalization {parseNumeric(field.value).normalized}</label>}
              {field.sourceText && <p className="whitespace-pre-wrap text-pro-muted">Source snippet: {field.sourceText}</p>}
              <p className="text-pro-muted">Parsing: {field.parsingReliability ?? "Manual review required"}. OCR page confidence (not per-field): {field.ocrConfidence === undefined ? "Confidence unavailable" : field.ocrConfidence.toFixed(1)}. User check is not clinician confirmation.</p>
            </>}
            <div><label htmlFor={`${prefix}-value`} className="mb-2 block font-semibold">{field.label}: extracted value (required)</label><textarea rows={field.ultrasound?.group === "narrative" ? 4 : 1} id={prefix + "-value"} className={control} value={field.value} onChange={(event) => update(field.id, { value: event.target.value })} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${prefix}-error` : undefined} /></div>
            <div><label htmlFor={`${prefix}-unit`} className="mb-2 block font-semibold">{field.label}: unit (optional)</label><input id={`${prefix}-unit`} className={control} value={field.unit} onChange={(event) => update(field.id, { unit: event.target.value })} /></div>
            {detailed && field.ultrasound && <p>Original label: {field.ultrasound.originalLabel} · Original unit: {field.ultrasound.originalUnit || "Unspecified"}</p>}

            </fieldset></div></details>
          {errors[field.id] && <p id={prefix + "-error"} role="alert" className="text-pro-danger">{errors[field.id]}</p>}

            <div className="inline-flex max-w-full flex-wrap gap-x-3 align-top"><button type="button" className={rowAction} disabled={saved || field.reviewStatus === "rejected" || field.reviewStatus === "verified"} onClick={() => verify(field)} aria-label={"Mark " + field.label + " as checked"}><Check aria-hidden="true" className="size-4 shrink-0" />{field.reviewStatus === "verified" ? w("যাচাই হয়েছে", "Checked") : w("ঠিক আছে", "Correct")}</button><button type="button" className={rowAction} disabled={saved} onClick={() => { setFields((current) => current.map((item) => item.id === field.id ? { ...item, reviewStatus: field.reviewStatus === "rejected" ? "pending" : "rejected" } : item)); setErrors((current) => ({ ...current, [field.id]: "" })); setFeedback(null); }} aria-label={field.reviewStatus === "rejected" ? "Restore " + field.label + " for review" : "Exclude " + field.label}>{field.reviewStatus === "rejected" ? w("ফিরিয়ে আনুন", "Restore") : w("বাদ দিন", "Skip")}</button></div>
        </fieldset>;
      })}</div></details>)}
      {report.inputMethod && <div className="border-t border-pro-border px-4 sm:px-5"><button type="button" className={rowAction} onClick={addField}><Plus aria-hidden="true" className="size-4 shrink-0" />তথ্য যোগ করুন · Add missing observation</button></div>}
      </section>
      {report.inputMethod && <DataJudgement fields={fields} report={{ ...report, documentType }} existing={existingRecords} />}
      </div></div>
      <div className="flex flex-wrap items-center gap-3 border-t border-pro-border pt-4">
        <button type="button" disabled={!readyToLearn} className={primary} onClick={() => go("learn")}>{w("বুঝে নিন", "Explain it")}</button>
        {!readyToLearn && <p className="!m-0 text-pro-muted">{w("এগোতে অন্তত একটি ফল যাচাই করুন এবং বাকি ফল যাচাই বা বাদ দিন।", "Check at least one result and check or skip every remaining result to continue.")}</p>}
        {report.source === "self_reported" && <button type="button" className={rowAction} onClick={keepDraft}>{w("খসড়া রাখুন", "Keep local draft")}</button>}
      </div>
      </div>}
      {stage === "learn" && <div className="grid gap-4" lang={language}>
        <QuickAnswers fields={checkedFields} language={language} />
        <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={() => go("check")}>{w("যাচাইয়ে ফিরুন", "Back to check")}</button><button type="button" className={primary} onClick={() => go("save")}>{w("সংরক্ষণে এগোন", "Continue to save")}</button></div>
      </div>}
      {stage === "save" && <section className={card} aria-label="Save reviewed information" lang={language}>
      <section className="grid min-w-0 gap-2 border-b border-pro-border px-1 pb-2" aria-label="Report type and destination">
        <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <label className="font-semibold" htmlFor={id + "-episode"}>কোন গর্ভকাল? · Pregnancy record</label>
        <select id={id + "-episode"} className={control} disabled={savedIds.length > 0} value={episodeId} onChange={(event) => { setEpisodeId(event.target.value); setConfirmedLink(false); setFields((current) => current.map((field) => savedIds.includes(field.id) ? field : { ...field, recordId: "", reviewStatus: field.reviewStatus })); setFeedback(null); }}><option value="">Choose based on the original report</option>{workspace?.episodes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </div>
        
        {savedIds.length > 0 && <p className="mt-2 text-pro-muted">The report type and pregnancy are fixed after the first save.</p>}
        {linkConflict && <label className="mt-4 flex gap-3"><input id={id + "-link-check"} type="checkbox" checked={confirmedLink} onChange={(event) => { setConfirmedLink(event.target.checked); setFeedback(null); }} />I compared the original report and confirmed this is the correct pregnancy.</label>}
        {eddConflict && <p role="status" className="mt-2 text-pro-danger">The source due date differs from the selected pregnancy record. Compare the dates and confirm the pregnancy before checking fields. Each source date is kept separately.</p>}
      </section>
        <h3 className="mt-5 text-xl font-semibold">{w("যা সংরক্ষণ হবে", "What will be saved")}</h3>
        <ul className="divide-y divide-pro-border">
          {checkedFields.filter((field) => !savedIds.includes(field.id)).map((field) => {
            const prefix = id + "-" + field.id;
            const destinationError = fieldIssues(field, report.observedAt).errors.filter((error) => /choose/i.test(error))[0];
            return <li key={field.id} className="grid min-w-0 gap-2 py-4">
              <p className="!m-0 font-semibold">{field.label} · {field.value} {field.unit}</p>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                <label className="grid gap-1">{field.label}: {w("রেকর্ড বেছে নিন", "record destination (required)")}<select className={control} value={field.destination} onChange={(event) => { const target = event.target.value as ExtractedReportField["destination"]; setFields((current) => current.map((item) => item.id === field.id ? { ...item, destination: target, recordId: "" } : item)); setFeedback(null); }}><option value="">{w("বেছে নিন", "Choose a record")}</option><option value="mother">{w("মা", "Mother")}</option><option value="baby" disabled={isHemoglobinLabel(field.label)}>{w("শিশু", "Baby")}</option></select></label>
                {field.destination === "baby" && <label className="grid gap-1" htmlFor={prefix + "-baby"}>{w("শিশুর রেকর্ড", "Specific baby record")}<select id={prefix + "-baby"} className={control} value={field.recordId ?? ""} onChange={(event) => { const recordId = event.target.value; setFields((current) => current.map((item) => item.id === field.id ? { ...item, recordId } : item)); setFeedback(null); }}><option value="">{w("শিশু বেছে নিন", "Choose a baby record")}</option>{workspace?.babies.filter((item) => item.pregnancyId === episodeId).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
              </div>
              {destinationError && <p className="!m-0 text-pro-muted" lang="en">{destinationError}</p>}
            </li>;
          })}
        </ul>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={() => go("learn")}>{w("ব্যাখ্যায় ফিরুন", "Back to explanation")}</button><button type="button" className={primary} onClick={save}>{w("যাচাই করা তথ্য সংরক্ষণ করুন", "Save Verified Information")}</button></div>
      </section>}
      {stage === "done" && <section aria-label="Save reviewed information" className={card} lang={language}>
        <p className="!mt-0 flex items-center gap-2"><Check aria-hidden="true" className="size-6 shrink-0 text-pro-primary" />{w("এই ডিভাইসে সংরক্ষিত। তথ্য কোথাও পাঠানো হয়নি।", "Saved to Jibonrekha on this device.")}</p>
        <ul className="my-4 list-disc pl-5">{existingRecords.filter((entry) => entry.sourceReportId === report.id).map((entry) => <li key={entry.id}>{entry.label} · {entry.value} {entry.unit} · {entry.recordType === "mother" ? w("মা", "Mother") : workspace?.babies.find((baby) => baby.id === entry.recordId)?.label ?? w("শিশু", "Baby")}</li>)}</ul>
        <div className="flex flex-wrap items-center gap-3"><Link href={recordsHref} className={primary}>{w("জীবনরেখা দেখুন", "View Jibonrekha health timeline")}</Link>{onNew && <button type="button" onClick={onNew} className={button}>{w("নতুন রিপোর্ট", "New report")}</button>}</div>
      </section>}
      <p role="status" aria-atomic="true" className={feedback?.error ? "text-pro-danger" : "text-pro-text"} lang="en">{feedback?.message}</p>
    </main>
  );
}









