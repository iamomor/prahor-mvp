"use client";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { ArrowRight, Camera, FileText, Images, Mic, PencilLine, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ManualMedicalEntry } from "./ManualMedicalEntry";
import { ImageMedicalEntry } from "./ImageMedicalEntry";
import { VoiceMedicalEntry } from "./VoiceMedicalEntry";
import { demoReport } from "./demo-report";
import { normalizeReport } from "./report-normalization";
import { WorkflowProgress } from "./WorkflowProgress";
import { ReportReview } from "./ReportReview";
import { getDemoReportDrafts } from "@/features/jibonrekha/demo-health";
import type { ExtractedReport } from "./types";

type Method = "manual" | "image" | "voice" | "review";
const entryMethods = [
  ["manual", "নিজে লিখুন", "Enter Information", PencilLine],
  ["image", "রিপোর্ট স্ক্যান করুন", "Scan Report", ScanLine],
  ["voice", "কথা বলে বলুন", "Speak Information", Mic],
] as const;

export function MedicalEntry({ recordsHref = "/demo/jibonrekha" }: { recordsHref?: string }) {
  const [method, setMethod] = useState<Method | null>(null), [drafts, setDrafts] = useState<ExtractedReport[]>([]), [activeId, setActiveId] = useState("");
  const [sources, setSources] = useState<Record<string, File>>({});
  const [draftError, setDraftError] = useState("");
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      try {
        const saved = getDemoReportDrafts();
        setDrafts((current) => [...saved.filter((draft) => !current.some((item) => item.id === draft.id)), ...current]);
        setActiveId((current) => current || saved[0]?.id || "");
      } catch { setDraftError("Stored drafts could not be loaded. You can start a new review."); }
    });
    return () => { mounted = false; };
  }, []);
  const reviewFocus = useRef<HTMLDivElement>(null);
  function acceptDraft(report: ExtractedReport, source?: File) {
    if (source) setSources((current) => ({ ...current, [report.id]: source }));
    setDrafts((current) => source && current.some((item) => item.id === report.id) ? current : [...current.filter((item) => item.id !== report.id), report]); setActiveId(report.id); setMethod("review");
    requestAnimationFrame(() => reviewFocus.current?.focus());
  }
  function openPhotoPicker(input: "camera" | "gallery") {
    setMethod("image");
    document.getElementById("bujhi-photo-" + input)?.click();
  }
  const methodNavigation = (
    <nav aria-label="Bujhi entry methods" className="grid min-w-0 gap-2 sm:grid-cols-3">
          {entryMethods.filter(([key]) => method !== null || key !== "image").map(([key, bangla, english, Icon]) => <button key={key} type="button" onClick={() => setMethod(key)} aria-pressed={method === key} aria-label={bangla + " — " + english} className={`flex min-h-14 min-w-0 items-center gap-3 rounded-control border px-3 py-2 text-left font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus ${method === key ? "border-pro-primary bg-pro-primary text-pro-on-primary" : "border-pro-border bg-pro-elevated text-pro-primary hover:border-pro-primary"}`}>
            <Icon aria-hidden="true" className="size-5 shrink-0" /><span className="min-w-0"><span lang="bn" className="block">{bangla}</span><span className="sr-only"> — </span><span className="block font-normal">{english}</span></span><ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0" />
          </button>)}
        </nav>
  );
  return <div className="min-w-0 text-pro-text [overflow-wrap:anywhere]">
    <header className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-pro-border pb-3">
        <h1 id="bujhi-title" tabIndex={-1} className="flex items-center gap-3 text-2xl font-semibold tracking-tight"><FileText aria-hidden="true" className="size-5 text-pro-primary" />Bujhi · <span lang="bn">বুঝি</span></h1>
        <AccessPreferencesControl />
      </div>
      <div className={method === null ? "mt-4 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-7" : "pt-4"}>
        {method === null && <div className="mb-5 grid gap-4"><WorkflowProgress current="add" language="bn" /><p className="max-w-[60ch] text-2xl font-semibold tracking-tight" lang="bn">সহজ ভাষায় রিপোর্ট বুঝুন</p><p className="mt-1 text-pro-muted">Check the results, read a plain-language explanation, and choose what to save.</p><p className="mt-2 text-pro-muted">Development demo · Synthetic data only.</p></div>}
        {method === null && <button type="button" onClick={() => openPhotoPicker("camera")} className="mb-3 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-control bg-pro-primary px-4 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"><Camera aria-hidden="true" className="size-5 shrink-0" />ছবি তুলুন · Take a photo</button>}
        {method === null && <div className="mb-3 grid min-w-0 grid-cols-2 gap-2">
          <button type="button" onClick={() => openPhotoPicker("gallery")} aria-label="গ্যালারি — Gallery — Scan Report" className="flex min-h-14 min-w-0 flex-wrap items-center justify-center gap-2 rounded-control border border-pro-control-border bg-pro-elevated p-2 font-semibold text-pro-primary"><Images aria-hidden="true" className="size-5 shrink-0" /><span>গ্যালারি · Gallery</span></button>
          <button type="button" onClick={() => acceptDraft(normalizeReport(demoReport))} aria-label="নমুনা রিপোর্ট — Try a sample report" className="flex min-h-14 min-w-0 flex-wrap items-center justify-center gap-2 rounded-control border border-pro-control-border bg-pro-elevated p-2 font-semibold text-pro-primary"><FileText aria-hidden="true" className="size-5 shrink-0" /><span>নমুনা রিপোর্ট · Sample</span></button>
        </div>}
        {method === "review" ? <details className="rounded-control border border-pro-border bg-pro-elevated px-3"><summary className="min-h-12 cursor-pointer py-3 font-semibold text-pro-primary">Add another report</summary><div className="pb-3">{methodNavigation}</div></details> : methodNavigation}

      </div>
      {draftError && <p role="alert">{draftError}</p>}
      {method !== "review" && drafts.length > 0 && <button type="button" onClick={() => { setMethod("review"); requestAnimationFrame(() => reviewFocus.current?.focus()); }} className="min-h-12 rounded-control px-2 font-semibold text-pro-primary underline">Review current drafts ({drafts.length})</button>}
    </header>
    <div hidden={method === null || method === "review"}><main className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6">
      <div hidden={method !== "manual"}><ManualMedicalEntry onDraft={acceptDraft} /></div>
      <div hidden={method !== "image"}><ImageMedicalEntry active={method === "image"} onDraft={acceptDraft} onManual={() => setMethod("manual")} /></div>
      <div hidden={method !== "voice"}><VoiceMedicalEntry active={method === "voice"} onDraft={acceptDraft} /></div>
    </main></div>
    <div hidden={method !== "review"} ref={reviewFocus} tabIndex={-1} aria-label="Draft review">
      {drafts.length > 1 && <nav aria-label="Choose draft" className="mx-auto flex max-w-4xl flex-wrap gap-3 p-4">{drafts.map((report) => <button key={report.id} onClick={() => setActiveId(report.id)} aria-pressed={activeId === report.id} className="min-h-12 rounded-control border border-pro-primary p-3">{report.name}</button>)}</nav>}
      {drafts.map((report) => <div key={report.id} hidden={activeId !== report.id}><ReportReview report={report} recordsHref={recordsHref} source={sources[report.id]} onNew={() => { setMethod(null); requestAnimationFrame(() => document.getElementById("bujhi-title")?.focus()); }} /></div>)}
    </div>
  </div>;
}


