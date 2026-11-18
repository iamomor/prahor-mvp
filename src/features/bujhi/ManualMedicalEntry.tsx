"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { allObservationCategories, demoMother, type ObservationCategory } from "@/features/jibonrekha/demo-health";
import type { ExtractedReport, ExtractedReportField, InputMethod } from "./types";
import { fieldIssues, validDate } from "./validation";
import { AncReportEntry } from "./AncReportEntry";
import { datum, type DocumentType } from "./report-schema";
import { ultrasoundGroups, type UltrasoundGroup } from "./ultrasound";
import { normalizeReport } from "./report-normalization";
const control = "w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg p-3 text-pro-text";
type EntryKind = "test" | "vital" | "symptom" | "pregnancy" | "ultrasound" | "anc" | "other";
const kinds: { key: EntryKind; label: string; category: ObservationCategory; documentType: DocumentType }[] = [
  { key: "test", label: "পরীক্ষার ফল · A test result", category: "laboratory_tests", documentType: "laboratory" },
  { key: "vital", label: "প্রেসার বা অন্য পরিমাপ · Blood pressure or vital sign", category: "vital_signs", documentType: "vital_sign" },
  { key: "symptom", label: "উপসর্গ বা পর্যবেক্ষণ · Symptom or observation", category: "symptoms", documentType: "observation" },
  { key: "pregnancy", label: "গর্ভাবস্থার তথ্য · Pregnancy information", category: "pregnancy_observations", documentType: "observation" },
  { key: "ultrasound", label: "আল্ট্রাসাউন্ডের তথ্য · Ultrasound information", category: "ultrasound_report_notes", documentType: "ultrasound" },
  { key: "anc", label: "সম্পূর্ণ গর্ভকালীন রিপোর্ট · Complete antenatal report", category: "general_notes", documentType: "anc" },
  { key: "other", label: "অন্য তথ্য · Something else", category: "general_notes", documentType: "clinical_note" },
];
export function ManualMedicalEntry({ onDraft, initial, method = "manual", sourceText = "" }: {
  onDraft: (report: ExtractedReport) => void; initial?: Partial<ExtractedReportField>; method?: InputMethod; sourceText?: string;
}) {
  const id = useId(), formRef = useRef<HTMLFormElement>(null), draftId = useRef<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]), [kind, setKind] = useState<EntryKind>(initial?.category === "vital_signs" ? "vital" : initial?.category === "ultrasound_report_notes" ? "ultrasound" : "test");
  const chosen = kinds.find((item) => item.key === kind)!;
  function build(allowIncomplete: boolean) {
    if (!formRef.current) return;
    const data = new FormData(formRef.current), read = (name: string) => String(data.get(name) ?? "").trim();
    const category = (read("category") || chosen.category) as ObservationCategory;
    const field: ExtractedReportField = {
      ultrasound: kind === "ultrasound" ? { group: (read("ultrasoundGroup") || "details") as UltrasoundGroup, originalLabel: read("label"), originalUnit: read("unit") } : undefined,
      id: "entry-1", label: read("label"), value: read("value"), rawValue: initial?.rawValue ?? read("value"), unit: read("unit"),
      destination: read("destination") as "mother" | "baby" | "", category, observedAt: read("observedAt"), reportDate: read("reportDate"), referenceRange: read("referenceRange"), notes: read("notes"),
      section: category === "laboratory_tests" ? "laboratory" : category === "ultrasound_report_notes" ? "ultrasound" : "vitals",
      sourceText, reviewStatus: "pending", unitUnavailable: data.has("unitUnavailable"),
      laboratory: category === "laboratory_tests" ? { originalTestLabel: read("label"), specimen: read("specimen"), collectionDate: read("collectionDate"), facility: read("facility"), method: read("labMethod"), referenceIntervalUnit: read("referenceIntervalUnit"), sampleTiming: read("sampleTiming") ? { type: "unspecified", original: read("sampleTiming") } : undefined } : undefined,
    };
    const issues = fieldIssues(field, ""); setErrors(allowIncomplete ? [] : issues.errors);
    if (!allowIncomplete && issues.errors.length) {
      const name = !field.label ? "label" : !field.value ? "value" : !validDate(field.observedAt ?? "") ? "observedAt" : !field.unit && !field.unitUnavailable ? "unit" : "value";
      (formRef.current.elements.namedItem(name) as HTMLElement | null)?.focus(); return;
    }
    draftId.current ??= crypto.randomUUID();
    onDraft(normalizeReport({ id: draftId.current, name: method === "voice" ? "কথা থেকে লেখা · Self-reported voice draft" : "নিজে লেখা তথ্য · Self-reported manual draft", status: "needs_review", source: "self_reported", inputMethod: method,
      documentType: chosen.documentType, observedAt: field.observedAt!, transcript: method === "voice" ? sourceText : undefined,
      sections: { patient: { name: datum(demoMother.name, "profile") } }, fields: [field] }));
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); build(false); }
  function renderInput(name: "label" | "value" | "unit" | "observedAt" | "reportDate" | "referenceRange" | "notes", label: string, required = false) {
    const messages = errors.filter((error) => name === "label" ? error.includes("observation name") : name === "value" ? /result or a note|numeric|Letters/.test(error) : name === "unit" ? error.includes("measurement unit") : name === "observedAt" ? error.includes("observation date") : name === "reportDate" ? error.includes("report date") : false);
    return <div key={name} className="grid gap-2"><label htmlFor={`${id}-${name}`} className="font-semibold">{label} ({required ? "required" : "optional"})</label><input id={`${id}-${name}`} name={name} type={name === "observedAt" || name === "reportDate" ? "date" : "text"} defaultValue={initial?.[name] ?? ""} required={required} className={control} aria-invalid={messages.length > 0} aria-describedby={messages.length ? `${id}-${name}-error` : undefined} />{messages.length > 0 && <p id={`${id}-${name}-error`} className="text-pro-danger">{messages.join(" ")}</p>}</div>;
  }
  return <section className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6">
    <h2 id={`${id}-title`} className="text-2xl font-semibold">{method === "voice" ? "Correct your spoken draft" : <>স্বাস্থ্য তথ্য লিখুন · Enter Health Information</>}</h2>
    <label htmlFor={`${id}-kind`} className="font-semibold">কী তথ্য রাখতে চান? · What would you like to record?</label><select id={`${id}-kind`} value={kind} onChange={(event) => setKind(event.target.value as EntryKind)} className={control}>{kinds.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
    <div hidden={kind === "anc"}><form ref={formRef} onSubmit={submit} noValidate aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4 border-t border-pro-border pt-4">

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="grid gap-2"><label htmlFor={id + "-destination"} className="font-semibold">কার তথ্য? · Record destination (required)</label><select id={`${id}-destination`} name="destination" defaultValue={initial?.destination ?? "mother"} className={control}><option value="">বেছে নিন · Choose record</option><option value="mother">মা · Mother</option><option value="baby">শিশু · Baby</option></select></div>
      {kind === "ultrasound" && <div><label htmlFor={id + "-scan-group"} className="mb-2 block font-semibold">স্ক্যানের কোন তথ্য? · Which scan detail?</label><select className={control} id={id + "-scan-group"} name="ultrasoundGroup" defaultValue={initial?.ultrasound?.group ?? "biometry"}>{Object.entries(ultrasoundGroups).filter(([group]) => group !== "doppler" && group !== "anatomy").map(([group, label]) => <option key={group} value={group}>{label}</option>)}</select></div>}
      {renderInput("label", "পরীক্ষা বা পর্যবেক্ষণের নাম · Test or observation name", true)}
      {renderInput("value", "ফল বা নিজের কথা · Result or observation (a note is also accepted)", true)}
      {renderInput("unit", "একক · Measurement unit")}
      {renderInput("observedAt", "তথ্যের তারিখ · Observation date", true)}
      </div>
      <label className="flex items-start gap-3"><input type="checkbox" name="unitUnavailable" defaultChecked={initial?.unitUnavailable} className="mt-1 size-5 shrink-0" />একক নেই বা প্রযোজ্য নয় · Unit is not available or not applicable; do not infer a unit.</label>
      <details className="min-w-0 rounded-field border border-pro-border p-3"><summary className="min-h-12 cursor-pointer font-semibold">আরও তথ্য যোগ করুন · Add more information</summary><div className="mt-3 grid min-w-0 gap-4">
        <div><label htmlFor={`${id}-category`} className="mb-2 block font-semibold">তথ্যের ধরন · Record category (optional)</label><select id={`${id}-category`} name="category" className={control} defaultValue=""><option value="">{chosen.label}</option>{Object.entries(allObservationCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        {renderInput("reportDate", "রিপোর্টের তারিখ · Report date")}{renderInput("referenceRange", "রিপোর্টে লেখা তুলনার সীমা · Reference range copied from report")}{renderInput("notes", "অতিরিক্ত কথা · Optional notes")}
        {kind === "test" && [["referenceIntervalUnit", "রেফারেন্সের একক · Reference interval unit"], ["specimen", "নমুনার ধরন · Specimen"], ["collectionDate", "নমুনা নেওয়ার তারিখ · Collection date"], ["facility", "ল্যাব বা প্রতিষ্ঠান · Laboratory/facility"], ["labMethod", "পরীক্ষার পদ্ধতি · Laboratory method"], ["sampleTiming", "OGTT নমুনার সময় যেমন লেখা আছে · OGTT sample timing"]].map(([name, label]) => <div key={name}><label htmlFor={`${id}-${name}`} className="mb-2 block font-semibold">{label} (optional)</label><input id={`${id}-${name}`} name={name} type={name === "collectionDate" ? "date" : "text"} className={control} /></div>)}
      </div></details>
      {errors.length > 0 && <ul role="alert" className="list-disc pl-5 text-pro-danger">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      <button type="submit" className="min-h-12 justify-self-start rounded-control border border-pro-primary bg-pro-primary px-4 py-3 font-semibold text-pro-on-primary">যাচাই করুন · Submit for review</button>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => build(true)} className="min-h-12 rounded-control px-2 font-semibold text-pro-primary underline">পরে পূরণ করব · Keep incomplete draft</button><button type="button" onClick={() => { draftId.current = null; formRef.current?.reset(); setErrors([]); document.getElementById(`${id}-label`)?.focus(); }} className="min-h-12 rounded-control px-2 font-semibold text-pro-primary underline">নতুন তথ্য লিখুন · Clear form for a new entry</button></div>
    </form></div>
    <div hidden={kind !== "anc"}><AncReportEntry onDraft={onDraft} /></div>
  </section>;
}
