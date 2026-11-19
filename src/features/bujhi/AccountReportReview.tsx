"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImageMedicalEntry } from "./ImageMedicalEntry";
import { isHemoglobinLabel, validDate } from "./validation";
import type { ExtractedReport, ExtractedReportField } from "./types";

type Pregnancy = { id: string; label: string };
type Draft = { report: ExtractedReport; imageUrl: string; reportId: string };

export function AccountReportReview({ pregnancies }: { pregnancies: Pregnancy[] }) {
  const [draft, setDraft] = useState<Draft>();
  const [fieldId, setFieldId] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
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

  useEffect(() => () => { if (draft) URL.revokeObjectURL(draft.imageUrl); }, [draft]);

  function openReview(report: ExtractedReport, file?: File) {
    if (!file) return;
    const supported = report.fields.filter((field) => isHemoglobinLabel(field.label));
    setDraft({ report, imageUrl: URL.createObjectURL(file), reportId: crypto.randomUUID() });
    setFieldId(supported.length === 1 ? supported[0].id : "");
    setValue(supported.length === 1 && supported[0].parsingReliability === "recognized" ? supported[0].value : "");
    setUnit(supported.length === 1 ? supported[0].unit : "");
    setDate("");
    setConfirmed(false);
    setFeedback("");
    setSaved(false);
    setLocked(false);
    snapshot.current = undefined;
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }

  const field: ExtractedReportField | undefined = draft?.report.fields.find((item) => item.id === fieldId);
  const supported = draft?.report.fields.filter((item) => isHemoglobinLabel(item.label)) ?? [];

  async function save() {
    if (pending.current || !draft || !field || saved) return;
    if (!snapshot.current) {
      if (!pregnancyId || !confirmed || !validDate(date) || date > new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) ||
          !/^[0-9]{1,3}(\.[0-9]{1,2})?$/.test(value) || unit.trim() !== "g/dL" || !draft.report.sourceFileId) {
        setFeedback("Check the pregnancy, printed value, g/dL unit and date, then confirm your review.");
        return;
      }
      snapshot.current = JSON.stringify({
        reportId: draft.reportId, pregnancyId, sourceSha256: draft.report.sourceFileId,
        rawLabel: field.label, rawValue: field.rawValue ?? field.value, rawUnit: field.unit,
        reviewedValue: value, reviewedUnit: "g/dL", observedOn: date, confirmSave: true,
      });
      setLocked(true);
    }
    pending.current = true;
    setSaving(true);
    setFeedback("Saving reviewed measurement…");
    try {
      const response = await fetch("/api/reports/commit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: snapshot.current,
      });
      if (response.ok) {
        setSaved(true);
        setFeedback("Saved to your account. This measurement was reviewed by you, not a clinician.");
      } else if (response.status === 400) {
        snapshot.current = undefined;
        setLocked(false);
        setFeedback("Not saved. Check the measurement and date, then try again.");
      } else {
        setFeedback("Save could not be confirmed. Retry to check the same save.");
      }
    } catch {
      setFeedback("Save could not be confirmed. Check your connection and retry the same save.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  const control = "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
  return <div className="mx-auto grid max-w-4xl gap-5 px-4 py-6 text-pro-text">
    <h2 ref={reviewFocus} tabIndex={-1} className="text-2xl font-semibold">রিপোর্ট যাচাই · Account review</h2>
    <p>Limited prototype for fictional report images. OCR runs on this device. Account saving supports maternal hemoglobin in g/dL.</p>
    <Link href="/accessibility" className="min-h-12 text-pro-primary underline">Adjust how you use PROHOR</Link>
    {!draft && <ImageMedicalEntry onDraft={openReview} />}
    {draft && <section className="grid gap-4 rounded-card border border-pro-border p-4" aria-label="Review extracted report">
      <button type="button" className="min-h-12 justify-self-start text-pro-primary underline" onClick={() => setDraft(undefined)}>Choose another image</button>
      {/* Local blob URL for comparison with the source. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={draft.imageUrl} alt="Original fictional report for checking the extracted value" className="h-auto max-w-full" />
      {draft.report.rawText && <details><summary className="min-h-12 cursor-pointer">Raw OCR text</summary><pre className="whitespace-pre-wrap">{draft.report.rawText}</pre></details>}
      {draft.report.fields.filter((item) => !isHemoglobinLabel(item.label)).map((item) => <p key={item.id}>{item.label}: {item.value} {item.unit}. Read from image, unsupported for account saving.</p>)}
      {!supported.length ? <p role="status">No supported hemoglobin field found. Nothing can be saved to the account.</p> : <>
        {supported.length > 1 && <label className="grid gap-2">Hemoglobin field to review<select className={control} value={fieldId} disabled={locked || saved} onChange={(event) => { const selected = supported.find((item) => item.id === event.target.value); setFieldId(event.target.value); setValue(selected?.parsingReliability === "recognized" ? selected.value : ""); setUnit(selected?.unit ?? ""); setConfirmed(false); }}><option value="">Choose a field</option>{supported.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.value} {item.unit}</option>)}</select></label>}
        {field && <>
          {field.parsingReliability !== "recognized" && <p className="font-semibold">The extracted digits are unclear. Enter the printed value from the image.</p>}
          <label className="grid gap-2">Hemoglobin value from report<input className={control} value={value} disabled={locked || saved} onChange={(event) => { setValue(event.target.value); setConfirmed(false); }} inputMode="decimal" /></label>
          <label className="grid gap-2">Printed unit<input className={control} value={unit} disabled={locked || saved} onChange={(event) => { setUnit(event.target.value); setConfirmed(false); }} /></label>
          <label className="grid gap-2">Observation date<input className={control} type="date" value={date} disabled={locked || saved} onChange={(event) => { setDate(event.target.value); setConfirmed(false); }} /></label>
          <label className="grid gap-2">Pregnancy record<select className={control} value={pregnancyId} disabled={locked || saved} onChange={(event) => { setPregnancyId(event.target.value); setConfirmed(false); }}><option value="">Choose a record</option>{pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="flex gap-3"><input type="checkbox" checked={confirmed} disabled={locked || saved} onChange={(event) => setConfirmed(event.target.checked)} />I compared the value, unit, date and pregnancy record with the image.</label>
          <button type="button" disabled={saving || saved} onClick={() => void save()} className="min-h-12 rounded-control bg-pro-primary px-4 font-semibold text-pro-on-primary disabled:opacity-60">{saving ? "Saving…" : locked ? "Retry account save" : "Save reviewed hemoglobin"}</button>
        </>}
      </>}
      <p role="status" aria-atomic="true">{feedback}</p>
      <Link href="/app/jibonrekha" className="min-h-12 text-pro-primary underline">View Jibonrekha account timeline</Link>
    </section>}
  </div>;
}
