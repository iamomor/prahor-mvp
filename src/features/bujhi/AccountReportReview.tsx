"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Check, FileCheck2 } from "lucide-react";
import { ImageMedicalEntry } from "./ImageMedicalEntry";
import { SourcePreview } from "./SourcePreview";
import { WorkflowProgress } from "./WorkflowProgress";
import { ReportUnderstanding } from "./ReportUnderstanding";
import { isHemoglobinLabel, parseNumeric, validDate } from "./validation";
import type { ExtractedReport, ExtractedReportField } from "./types";

type Pregnancy = { id: string; label: string };
type Draft = { report: ExtractedReport; source: File; reportId: string };
type Stage = "check" | "learn" | "save";
const primary = "inline-flex min-h-12 items-center justify-center rounded-control bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";
const secondary = "inline-flex min-h-12 items-center justify-center rounded-control border border-pro-control-border px-4 py-3 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";
const control = "min-h-12 w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";

export function AccountReportReview({ pregnancies }: { pregnancies: Pregnancy[] }) {
  const [draft, setDraft] = useState<Draft>();
  const [fields, setFields] = useState<ExtractedReportField[]>([]);
  const [stage, setStage] = useState<Stage>("check");
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [fieldId, setFieldId] = useState("");
  const [date, setDate] = useState("");
  const [pregnancyId, setPregnancyId] = useState(pregnancies.length === 1 ? pregnancies[0].id : "");
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const pending = useRef(false);
  const snapshot = useRef<string | undefined>(undefined);
  const reviewFocus = useRef<HTMLHeadingElement>(null);
  const uploadFocus = useRef<HTMLHeadingElement>(null);
  const w = (bn: string, en: string) => language === "bn" ? bn : en;
  function go(next: Stage) {
    setStage(next); setFeedback("");
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }
  function openReview(report: ExtractedReport, file?: File) {
    if (!file) return;
    setDraft({ report, source: file, reportId: crypto.randomUUID() });
    setFields(report.fields.map((field) => ({ ...field, reviewStatus: "pending" })));
    setStage("check"); setFieldId(""); setDate(""); setConfirmed(false);
    setFeedback(""); setSaved(false); setLocked(false); snapshot.current = undefined;
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }
  function update(id: string, patch: Partial<ExtractedReportField>) {
    setFields((current) => current.map((field) => field.id !== id ? field : {
      ...field, ...patch, reviewStatus: "pending",
      originalLabel: field.originalLabel ?? field.label, originalUnit: field.originalUnit ?? field.unit,
      correctionHistory: [...(field.correctionHistory ?? []), ...Object.entries(patch).map(([property, value]) => ({ property, before: String(field[property as keyof ExtractedReportField] ?? ""), after: String(value ?? ""), at: new Date().toISOString() }))],
    }));
    setConfirmed(false); setFeedback("");
  }
  function check(field: ExtractedReportField) {
    if (!field.value.trim() || parseNumeric(field.value).kind === "ambiguous" ||
      (parseNumeric(field.value).kind === "number" && !field.unit.trim() && !field.unitUnavailable)) {
      setFeedback(w("ফল ও একক মূল রিপোর্ট দেখে ঠিক করুন। একক না থাকলে সেটি স্পষ্টভাবে চিহ্নিত করুন।", "Check the value and unit against the original. Explicitly mark a missing unit; do not guess."));
      document.getElementById("account-value-" + field.id)?.focus(); return;
    }
    setFields((current) => current.map((item) => item.id === field.id ? { ...item, reviewStatus: "verified", reviewedAt: new Date().toISOString() } : item));
    setFeedback(""); setConfirmed(false);
  }
  const checked = fields.filter((field) => field.reviewStatus === "verified");
  const supported = checked.filter((field) => isHemoglobinLabel(field.label) && field.unit.trim() === "g/dL" && !field.unitUnavailable);
  const field = supported.find((item) => item.id === fieldId) ?? (supported.length === 1 ? supported[0] : undefined);
  const ready = checked.length > 0 && fields.every((item) => item.reviewStatus !== "pending");

  async function save() {
    if (pending.current || !draft || !field || saved) return;
    if (!snapshot.current) {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      if (!pregnancies.some((item) => item.id === pregnancyId) || !confirmed || !validDate(date) || date > today ||
          !/^[0-9]{1,3}(\.[0-9]{1,2})?$/.test(field.value.trim()) || !draft.report.sourceFileId) {
        setFeedback(w("সঠিক গর্ভকাল, মূল রিপোর্টের মান, g/dL একক ও তারিখ দেখে সংরক্ষণের সম্মতি দিন।", "Check the pregnancy, printed value, g/dL unit and date, then confirm your review."));
        return;
      }
      const original = draft.report.fields.find((item) => item.id === field.id)!;
      snapshot.current = JSON.stringify({
        reportId: draft.reportId, pregnancyId, sourceSha256: draft.report.sourceFileId,
        rawLabel: original.label, rawValue: original.rawValue ?? original.value, rawUnit: original.unit,
        reviewedValue: field.value.trim(), reviewedUnit: "g/dL", observedOn: date, confirmSave: true,
      });
      setLocked(true);
    }
    pending.current = true; setSaving(true); setFeedback(w("সংরক্ষণ করা হচ্ছে…", "Saving reviewed measurement…"));
    try {
      const response = await fetch("/api/reports/commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: snapshot.current });
      if (response.ok && !response.redirected) {
        const receipt: unknown = await response.json();
        if (!receipt || typeof receipt !== "object" || !("saved" in receipt) || receipt.saved !== true || !("observationId" in receipt) || typeof receipt.observationId !== "string" || !receipt.observationId) throw new Error("Save receipt missing.");
        setSaved(true); setFeedback(w("আপনার অ্যাকাউন্টে হিমোগ্লোবিনের মান সংরক্ষিত। এটি আপনার যাচাই করা তথ্য; চিকিৎসকের যাচাই নয়।", "Hemoglobin saved to your account. This measurement was reviewed by you, not a clinician."));
        requestAnimationFrame(() => reviewFocus.current?.focus());
      } else if (response.status === 400) {
        snapshot.current = undefined; setLocked(false); setFeedback(w("সংরক্ষিত হয়নি। মান ও তারিখ দেখে আবার চেষ্টা করুন।", "Not saved. Check the measurement and date, then try again."));
      } else {
        setFeedback(w("সংরক্ষণ নিশ্চিত হয়নি। একই সংরক্ষণ আবার চেষ্টা করুন।", "Save could not be confirmed. Retry to check the same save."));
      }
    } catch {
      setFeedback(w("সংরক্ষণ নিশ্চিত হয়নি। সংযোগ দেখে একই সংরক্ষণ আবার চেষ্টা করুন।", "Save could not be confirmed. Check your connection and retry the same save."));
    } finally { pending.current = false; setSaving(false); }
  }
  function reset() {
    setDraft(undefined); setFields([]); setFeedback(""); snapshot.current = undefined;
    requestAnimationFrame(() => uploadFocus.current?.focus());
  }

  return <div className="mx-auto grid w-full max-w-6xl min-w-0 gap-6 px-4 py-6 pb-12 text-pro-text [overflow-wrap:anywhere] sm:px-6">
    <h2 ref={uploadFocus} tabIndex={-1} className="sr-only">Report review</h2>
    {!draft && <><ImageMedicalEntry onDraft={openReview} /><Link href="/app/jibonrekha" className="inline-flex min-h-12 w-fit max-w-full items-center rounded-control px-2 font-semibold text-pro-primary underline">নিজে তথ্য লিখুন · Enter health information in Jibonrekha</Link></>}
    {draft && <>
      <WorkflowProgress current={saved ? "done" : stage} language={language} />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2"><p className="font-semibold text-pro-primary">{w("ছবি থেকে পড়া · আপনার যাচাই প্রয়োজন", "Read from your image · your review matters")}</p><h2 ref={reviewFocus} tabIndex={-1} className="text-2xl font-semibold sm:text-3xl">{saved ? w("সংরক্ষণ সম্পন্ন", "Saved to your account") : stage === "check" ? w("মূল রিপোর্টের সঙ্গে মিলিয়ে দেখুন", "Check what was read") : stage === "learn" ? w("এবার সহজ করে বুঝি", "Understand your checked results") : w("কী সংরক্ষণ হবে দেখে নিন", "Review before saving")}</h2></div>
        <label className="grid gap-2 font-semibold">{w("ব্যাখ্যার ভাষা", "Explanation language")}<select className={control} value={language} onChange={(event) => setLanguage(event.target.value as "bn" | "en")}><option value="bn">বাংলা</option><option value="en">English</option></select></label>
      </header>
      {!saved && stage === "check" && <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <aside className="grid min-w-0 gap-4">
          <SourcePreview source={draft.source} />
          <p className="rounded-field border border-pro-border bg-pro-surface p-4">{w("প্রতিটি ফল দেখুন। ভুল হলে ঠিক করুন, না বুঝলে বাদ দিন। কোনো ফল চিকিৎসকের যাচাই করা বলে চিহ্নিত হবে না।", "Check each result, correct mistakes or skip anything you cannot confirm. Your review is not clinician confirmation.")}</p>
          <details className="rounded-card border border-pro-border bg-pro-elevated p-4"><summary className="min-h-12 cursor-pointer py-2 font-semibold text-pro-primary">OCR text and other fields</summary><pre className="mt-3 whitespace-pre-wrap font-body">{draft.report.rawText || "No text recognized."}</pre><p className="mt-3 text-pro-muted">{w("OCR কোনো লেখা বা লাইন বাদ দিতে পারে। মূল রিপোর্টের সব তথ্য মিলিয়ে দেখুন।", "OCR can miss text or entire lines. Compare the complete original report.")}</p></details>
        </aside>
        <div className="grid min-w-0 gap-4">
          <p className="font-semibold">{w("আপনার যাচাই করা ফল", "Results checked by you")}: {checked.length} / {fields.length}</p>
          {!fields.length && <p role="status" className="rounded-field border border-pro-warning bg-pro-warning-soft p-4">{w("কোনো সমর্থিত ফল চেনা যায়নি। কিছু সংরক্ষিত হয়নি। পরিষ্কার ছবি দিন বা রিপোর্টটি চিকিৎসককে দেখান।", "No supported results were recognized. Nothing was saved. Try a clearer image or show the report to your clinician.")}</p>}
          {fields.map((item) => <fieldset key={item.id} disabled={item.reviewStatus === "rejected"} className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-elevated p-5">
            <legend className="max-w-full px-1 text-xl font-semibold">{item.label}</legend>
            <p className="font-semibold text-pro-primary">{item.reviewStatus === "verified" ? w("আপনার যাচাই করা", "Checked by you") : item.reviewStatus === "rejected" ? w("বাদ রাখা হয়েছে", "Excluded") : w("যাচাই বাকি", "Needs checking")}</p>
            {item.parsingReliability !== "recognized" && <p className="text-pro-warning">{w("লেখা শনাক্তকরণ অনিশ্চিত। মূল রিপোর্ট দেখে মান ও একক ঠিক করুন।", "Text recognition is uncertain. Confirm the digits and unit from the original.")}</p>}
            <label className="grid gap-2" htmlFor={"account-value-" + item.id}>{item.label}: {w("রিপোর্টের মান", "value from report")}<input id={"account-value-" + item.id} className={control} value={item.value} onChange={(event) => update(item.id, { value: event.target.value })} /></label>
            <label className="grid gap-2">{item.label}: {w("মুদ্রিত একক", "printed unit")}<input className={control} value={item.unit} onChange={(event) => update(item.id, { unit: event.target.value, unitUnavailable: false })} /></label>
            {!item.unit.trim() && <label className="flex min-h-12 items-start gap-3"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={Boolean(item.unitUnavailable)} onChange={(event) => update(item.id, { unitUnavailable: event.target.checked })} />{w("রিপোর্টে একক নেই বা প্রযোজ্য নয়; অনুমান করব না।", "Unit unavailable or not applicable — do not infer.")}</label>}
            <label className="grid gap-2">{item.label}: {w("মুদ্রিত সীমা ও একক (ঐচ্ছিক)", "printed interval and unit (optional)")}<input className={control} value={item.referenceRange ?? ""} onChange={(event) => update(item.id, { referenceRange: event.target.value })} /></label>
            {item.sourceText && <p className="whitespace-pre-wrap rounded-field bg-pro-bg p-3 text-pro-muted">{item.sourceText}</p>}
            <button type="button" className={secondary} disabled={item.reviewStatus === "verified"} onClick={() => check(item)}><Check aria-hidden="true" className="mr-2 size-5 shrink-0" />{w("মূল রিপোর্টের সঙ্গে মিলেছে", "Mark " + item.label + " as checked")}</button>
          </fieldset>)}
          {fields.length > 0 && <div className="flex flex-wrap gap-3">{fields.map((item) => <button key={item.id} type="button" className="min-h-12 rounded-control px-2 font-semibold text-pro-primary underline" onClick={() => { setFields((current) => current.map((entry) => entry.id === item.id ? { ...entry, reviewStatus: entry.reviewStatus === "rejected" ? "pending" : "rejected" } : entry)); setFeedback(""); }}>{item.reviewStatus === "rejected" ? w("ফিরিয়ে আনুন", "Restore") : w("বাদ দিন", "Skip")}: {item.label}</button>)}</div>}
          <button type="button" disabled={!ready} className={primary} onClick={() => go("learn")}>{w("যাচাই করা ফল বুঝে নিন", "Explain checked results")}</button>
          {!ready && fields.length > 0 && <p className="text-pro-muted">{w("এগোতে অন্তত একটি ফল যাচাই করুন এবং বাকি ফল যাচাই বা বাদ দিন।", "Check at least one result and check or skip every remaining result.")}</p>}
        </div>
      </div>}
      {!saved && stage === "learn" && <><ReportUnderstanding fields={fields} language={language} /><div className="flex flex-wrap gap-3"><button type="button" className={secondary} onClick={() => go("check")}>{w("যাচাইয়ে ফিরুন", "Back to check")}</button><button type="button" className={primary} onClick={() => go("save")}>{w("সংরক্ষণে এগোন", "Continue to save")}</button></div></>}
      {!saved && stage === "save" && <section className="mx-auto grid w-full max-w-2xl gap-5 rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-8" aria-label="Save reviewed information">
        <div className="grid gap-3 rounded-field bg-pro-surface p-4"><FileCheck2 aria-hidden="true" className="size-6 text-pro-primary" /><h3 className="text-xl font-semibold">{w("আপনার অ্যাকাউন্টে যা রাখা যাবে", "What can be saved to your account")}</h3><p>{w("এই সংস্করণে শুধু মায়ের হিমোগ্লোবিনের মান (g/dL) সংরক্ষণ করা যায়। অন্য ফল পড়া ও বোঝার জন্য এই পাতায় থাকে; সেগুলো অ্যাকাউন্টে সংরক্ষিত হবে না।", "This version saves maternal hemoglobin in g/dL only. Other results remain available for reading and understanding on this page; they will not be saved to your account.")}</p></div>
        {!supported.length ? <p role="status">{w("সমর্থিত এককে যাচাই করা হিমোগ্লোবিন পাওয়া যায়নি। কিছু সংরক্ষণ করা যাবে না।", "No checked hemoglobin result in the supported unit was found. Nothing can be saved to the account.")}</p> : <>
          {supported.length > 1 && <label className="grid gap-2">Hemoglobin field to review<select className={control} value={fieldId} disabled={locked} onChange={(event) => { setFieldId(event.target.value); setConfirmed(false); }}><option value="">Choose a field</option>{supported.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.value} {item.unit}</option>)}</select></label>}
          {field && <><p className="text-xl font-semibold">{field.label} · {field.value} {field.unit}</p>
            <label className="grid gap-2">{w("পর্যবেক্ষণের তারিখ", "Observation date")}<input className={control} type="date" value={date} disabled={locked} aria-describedby="account-report-date-hint" onChange={(event) => { setDate(event.target.value); setConfirmed(false); }} /></label>
            <p id="account-report-date-hint" className="text-pro-muted">{w("মূল রিপোর্টে তারিখ অস্পষ্ট হলে অনুমান করবেন না। নিশ্চিত না হওয়া পর্যন্ত সংরক্ষণ বাকি রাখুন।", "If you cannot verify the date, leave this review unsaved. Do not guess.")}</p>
            <label className="grid gap-2">{w("মায়ের গর্ভকালের রেকর্ড", "Pregnancy record")}<select className={control} value={pregnancyId} disabled={locked} onChange={(event) => { setPregnancyId(event.target.value); setConfirmed(false); }}><option value="">Choose a record</option>{pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="flex min-h-12 items-start gap-3 rounded-field bg-pro-surface p-4"><input className="mt-1 size-5 shrink-0" type="checkbox" checked={confirmed} disabled={locked} onChange={(event) => setConfirmed(event.target.checked)} />{w("মান, একক ও তারিখ মূল রিপোর্টের সঙ্গে মিলেছে এবং সঠিক গর্ভকাল বেছেছি। শুধু এই মানটি অ্যাকাউন্টে সংরক্ষণ করতে চাই।", "I checked the value, unit and date against the report and chose the correct pregnancy. Save only this measurement to my account.")}</label>
            <button type="button" disabled={saving} onClick={() => void save()} className={primary}>{saving ? w("সংরক্ষণ হচ্ছে…", "Saving…") : locked ? w("একই সংরক্ষণ আবার চেষ্টা করুন", "Retry account save") : w("যাচাই করা হিমোগ্লোবিন সংরক্ষণ", "Save reviewed hemoglobin")}</button>
          </>}
        </>}
        {!locked && <button type="button" className={secondary} onClick={() => go("check")}>{w("তথ্য সংশোধন করুন", "Edit checked information")}</button>}
      </section>}
      {saved && <section className="grid gap-5 rounded-hero border border-pro-border bg-pro-surface p-6 sm:p-8"><Check aria-hidden="true" className="size-8 text-pro-primary" /><p className="text-xl font-semibold">{field?.label} · {field?.value} {field?.unit}</p><p>{w("অন্য ফল বা মূল ছবি অ্যাকাউন্টে সংরক্ষিত হয়নি। কোনো চিকিৎসককে পাঠানো হয়নি।", "Other results and the source image were not saved to the account. Nothing was sent to a clinician.")}</p><Link href="/app/jibonrekha" className={primary}>{w("জীবনরেখায় দেখুন", "View Jibonrekha")}</Link></section>}
      <p role="status" aria-atomic="true">{feedback}</p>
      <button type="button" disabled={saving} className="min-h-12 w-fit rounded-control px-2 font-semibold text-pro-primary underline disabled:opacity-60" onClick={reset}>{w("অন্য ছবি বেছে নিন", "Choose another image")}</button>
    </>}
  </div>;
}
