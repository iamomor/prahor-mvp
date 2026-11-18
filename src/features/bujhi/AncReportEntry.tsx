"use client";
import { useRef, useState } from "react";
import { ReportContextEditor } from "./ReportContextEditor";
import { readDatum, sectionFields, sectionLabels, type AntenatalSections, type ReportSection } from "./report-schema";
import { normalizeReport } from "./report-normalization";
import type { ExtractedReport, ExtractedReportField } from "./types";
const control = "w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg p-3";
export function AncReportEntry({ onDraft }: { onDraft: (report: ExtractedReport) => void }) {
  const id = useRef<string | null>(null);
  const [sections, setSections] = useState<AntenatalSections>({});
  const [fields, setFields] = useState<ExtractedReportField[]>([]);
  const filled = Object.values(sections).filter((section) => Object.values(section ?? {}).some((item) => typeof item === "object" && item !== null && "value" in item && Boolean(item.value))).length;
  function add(section: "vitals" | "laboratory" | "ultrasound") {
    const fieldId = crypto.randomUUID();
    setFields((current) => [...current, { id: fieldId, label: "", value: "", unit: "", destination: "mother", observedAt: "", reviewStatus: "pending", section, category: section === "laboratory" ? "laboratory_tests" : section === "ultrasound" ? "ultrasound_report_notes" : "vital_signs" }]);
    requestAnimationFrame(() => document.getElementById(`${fieldId}-label`)?.focus());
  }
  function update(fieldId: string, patch: Partial<ExtractedReportField>) { setFields((current) => current.map((field) => field.id === fieldId ? { ...field, ...patch, reviewStatus: "pending" } : field)); }
  function keepDraft() {
    id.current ??= crypto.randomUUID();
    const contextFields = (Object.keys(sectionFields) as ReportSection[]).flatMap((section) => sectionFields[section].flatMap(({ key, label }) => {
      const item = readDatum(sections, section, key);
      if (!item?.value?.trim() || item.source === "profile" || item.source === "calculated") return [];
      return [{ id: "context-" + section + "-" + key, section, label, value: item.value, rawValue: item.original ?? item.value, unit: "", destination: "mother" as const, observedAt: "", reviewStatus: "pending" as const }];
    }));
    onDraft(normalizeReport({ id: id.current, name: "গর্ভকালীন রিপোর্ট · ANC draft", status: "needs_review", source: "self_reported", inputMethod: "manual", documentType: "anc", observedAt: "", sections, fields: [...contextFields, ...fields].map((field) => ({ ...field, rawValue: field.rawValue ?? field.value })) }));
  }
  return <section aria-label="Complete antenatal report entry" className="grid min-w-0 gap-5 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]">
    <h2 className="text-2xl font-semibold">গর্ভকালীন রিপোর্ট · Complete antenatal report</h2><p>যে অংশ দরকার শুধু সেটি খুলুন। This is an optional report draft, not a clinical assessment. You may keep it incomplete.</p>
    <p role="status">{filled} of 10 sections contain context. {fields.length} observation(s). This is completion progress, not a health score.</p><progress value={filled} max={10} aria-label="Report sections with information" className="w-full" />
    <ReportContextEditor sections={sections} onChange={setSections} />
    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => add("vitals")} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">পরিমাপ যোগ করুন · Add vital sign</button><button type="button" onClick={() => add("laboratory")} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">পরীক্ষার ফল যোগ করুন · Add laboratory result</button><button type="button" onClick={() => add("ultrasound")} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">স্ক্যানের তথ্য যোগ করুন · Add ultrasound finding</button></div>
    {fields.map((field, index) => <fieldset key={field.id} className="grid min-w-0 gap-3 rounded-field border border-pro-border p-3"><legend className="font-semibold">{index + 1}. {sectionLabels[field.section as ReportSection]}</legend>
      <label htmlFor={`${field.id}-label`}>নাম · Observation name</label><input id={`${field.id}-label`} value={field.label} onChange={(event) => update(field.id, { label: event.target.value })} className={control} />
      <label htmlFor={`${field.id}-value`}>মূল ফল বা নোট · Result or note</label><input id={`${field.id}-value`} value={field.value} onChange={(event) => update(field.id, { value: event.target.value })} className={control} />
      <label htmlFor={`${field.id}-unit`}>একক · Unit</label><input id={`${field.id}-unit`} value={field.unit} onChange={(event) => update(field.id, { unit: event.target.value })} className={control} />
      <label htmlFor={`${field.id}-date`}>পর্যবেক্ষণের তারিখ · Observation date</label><input id={`${field.id}-date`} type="date" value={field.observedAt ?? ""} onChange={(event) => update(field.id, { observedAt: event.target.value })} className={control} />
      <label htmlFor={`${field.id}-destination`}>কার তথ্য? · Record destination</label><select id={`${field.id}-destination`} value={field.destination} onChange={(event) => update(field.id, { destination: event.target.value as "mother" | "baby" })} className={control}><option value="mother">মা · Mother</option><option value="baby">শিশু · Baby</option></select>
      <button type="button" onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary">এই খসড়া পর্যবেক্ষণ সরান · Remove draft observation</button>
    </fieldset>)}
    <button type="button" onClick={keepDraft} className="min-h-12 rounded-control border border-pro-primary bg-pro-primary p-3 font-semibold text-pro-on-primary">অসম্পূর্ণ খসড়া রাখুন ও যাচাই করুন · Keep draft and review</button>
  </section>;
}
