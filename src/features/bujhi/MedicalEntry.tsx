"use client";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { useRef, useState } from "react";
import { ManualMedicalEntry } from "./ManualMedicalEntry";
import { ImageMedicalEntry } from "./ImageMedicalEntry";
import { VoiceMedicalEntry } from "./VoiceMedicalEntry";
import { ReportReview } from "./ReportReview";
import type { ExtractedReport } from "./types";

type Method = "manual" | "image" | "voice" | "review";
export function MedicalEntry() {
  const [method, setMethod] = useState<Method>("manual"), [drafts, setDrafts] = useState<ExtractedReport[]>([]), [activeId, setActiveId] = useState("");
  const reviewFocus = useRef<HTMLDivElement>(null);
  function acceptDraft(report: ExtractedReport) {
    setDrafts((current) => [...current.filter((item) => item.id !== report.id), report]); setActiveId(report.id); setMethod("review");
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }
  return <div className="min-w-0 text-pro-text [overflow-wrap:anywhere]">
    <header className="mx-auto grid max-w-4xl gap-3 px-4 pt-6 sm:px-6"><h1 className="text-3xl font-semibold">Bujhi — <span lang="bn">বুঝি</span></h1><p>Enter, scan, or speak fictional health information. Review and explicitly check each field before saving.</p><p className="rounded-field border border-pro-border bg-pro-surface p-4">Development demo — synthetic data only. No diagnosis, clinician confirmation, or production medical storage.</p><AccessPreferencesControl />
      <nav aria-label="Bujhi entry methods" className="grid min-w-0 gap-3 sm:grid-cols-3">{([["manual", "1. Enter Manually"], ["image", "2. Upload Report Image"], ["voice", "3. Speak Information"]] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setMethod(key)} aria-pressed={method === key} className={`min-h-12 rounded-control border border-pro-primary p-3 font-semibold ${method === key ? "bg-pro-primary text-pro-on-primary" : "text-pro-primary"}`}>{label}</button>)}</nav>
      {drafts.length > 0 && <button type="button" onClick={() => setMethod("review")} className="min-h-12 rounded-control border border-pro-primary px-3 text-pro-primary">Review current drafts ({drafts.length})</button>}
    </header>
    <div hidden={method === "review"}><div className="mx-auto grid w-full min-w-0 max-w-4xl grid-cols-1 gap-6 px-4 py-6 sm:px-6">
      <div hidden={method !== "manual"}><ManualMedicalEntry onDraft={acceptDraft} /></div>
      <div hidden={method !== "image"}><ImageMedicalEntry active={method === "image"} onDraft={acceptDraft} /></div>
      <div hidden={method !== "voice"}><VoiceMedicalEntry active={method === "voice"} onDraft={acceptDraft} /></div>
    </div></div>
    <div hidden={method !== "review"} ref={reviewFocus} tabIndex={-1} aria-label="Draft review">
      {drafts.length > 1 && <nav aria-label="Choose draft" className="mx-auto flex max-w-4xl flex-wrap gap-3 p-4">{drafts.map((report) => <button key={report.id} onClick={() => setActiveId(report.id)} aria-pressed={activeId === report.id} className="min-h-12 rounded-control border border-pro-primary p-3">{report.name}</button>)}</nav>}
      {drafts.map((report) => <div key={report.id} hidden={activeId !== report.id}><ReportReview report={report} /></div>)}
    </div>
  </div>;
}


