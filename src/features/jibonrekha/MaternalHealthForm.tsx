"use client";

import { useId, useState, type FormEvent } from "react";
import { AACComposer, HeldAacText, VoiceDictationButton, mergeAacText } from "@/features/adapt";
import { useLanguage } from "@/i18n/use-language";
import { useL, categoryLabel, reportTemplateLabel } from "./use-l";
import {
  demoMother,
  observationCategories,
  saveDemoObservation,
  type HealthObservation,
  type ObservationCategory,
} from "./demo-health";

type MaternalHealthFormProps = {
  onSaved: (observations: HealthObservation[]) => void;
  disabled?: boolean;
  pregnancyId?: string; motherName?: string;
};
type FieldName = "category" | "label" | "value" | "observedAt";
type FieldErrors = Partial<Record<FieldName, string>>;
const fieldClass = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";

/** Mock-first maternal entry; the service owns persistence and the parent owns the timeline. */
export function MaternalHealthForm({ onSaved, disabled = false, pregnancyId, motherName = demoMother.name }: MaternalHealthFormProps) {
  const L = useL();
  const id = useId();
  const [errors, setErrors] = useState<FieldErrors>({});
  const { language } = useLanguage();
  const [noteText, setNoteText] = useState("");
  const [heldAac, setHeldAac] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const category = String(data.get("category") ?? "");
    const label = String(data.get("label") ?? "").trim();
    const value = String(data.get("value") ?? "").trim();
    const unit = String(data.get("unit") ?? "").trim();
    const observedAt = String(data.get("observedAt") ?? "");
    const nextErrors: FieldErrors = {};
    if (!Object.hasOwn(observationCategories, category)) nextErrors.category = L("Choose an observation category.", "একটি পর্যবেক্ষণের ধরন বেছে নিন।");
    if (!label) nextErrors.label = L("Enter an observation name in Bangla or English.", "বাংলা বা ইংরেজিতে পর্যবেক্ষণের নাম লিখুন।");
    if (!value) nextErrors.value = L("Enter a value or a note in Bangla or English.", "বাংলা বা ইংরেজিতে একটি মান বা নোট লিখুন।");
    // Round-trip validation rejects impossible dates instead of allowing Date to normalize them.
    const date = new Date(`${observedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(observedAt) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== observedAt) {
      nextErrors.observedAt = L("Enter a valid observation date using the date field.", "তারিখের ঘর ব্যবহার করে সঠিক পর্যবেক্ষণের তারিখ দিন।");
    }
    setErrors(nextErrors);
    setFeedback(null);
    const firstError = (Object.keys(nextErrors) as FieldName[])[0];
    if (firstError) {
      const field = form.elements.namedItem(firstError);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    let updated: HealthObservation[];
    try {
      updated = saveDemoObservation({
        id: crypto.randomUUID(),
        pregnancyId,
        recordType: "mother",
        recordId: demoMother.id,
        category: category as ObservationCategory,
        label, value, unit, rawValue: value,
        reportDate: String(data.get("reportDate") ?? ""), referenceRange: String(data.get("referenceRange") ?? ""), notes: String(data.get("notes") ?? ""), sourceDocument: String(data.get("sourceDocument") ?? ""),
        // Preserve the chosen calendar date without inventing an observation time.
        observedAt,
        source: "self_reported",
      });
    } catch {
      setFeedback({ kind: "error", message: L("Observation not saved. Your inputs are still here. Check that browser storage is available and has space, then try again.", "পর্যবেক্ষণ সংরক্ষণ হয়নি। আপনার লেখা এখানেই আছে। ব্রাউজারের সংরক্ষণের জায়গা আছে কি না দেখে আবার চেষ্টা করুন।") });
      return;
    }
    onSaved(updated);
    for (const name of ["label", "value", "unit"]) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = "";
      setNoteText("");
    }
    setFeedback({ kind: "success", message: L("Saved to Mother's record on this device — not sent. This entry is self-reported and has not been clinically verified.", "এই ডিভাইসে মায়ের নথিতে সংরক্ষিত — কোথাও পাঠানো হয়নি। এটি আপনার নিজের দেওয়া তথ্য, চিকিৎসাগতভাবে যাচাই করা হয়নি।") });
  }

  function errorProps(name: FieldName) {
    return { "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined };
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`} aria-describedby={`${id}-note`} className="mt-6 grid min-w-0 gap-[var(--pro-gap-field)] border-t border-pro-border pt-6">
      <h3 id={`${id}-heading`} className="text-xl font-semibold">{L("Add maternal observation", "মায়ের স্বাস্থ্য তথ্য যোগ করুন")}</h3>
      <p id={`${id}-note`} className="text-pro-muted">{L(`Use fictional information only. Entries always go to ${motherName}'s mother record. Bangla and English text are supported. Required fields are labelled.`, `শুধু কাল্পনিক তথ্য ব্যবহার করুন। তথ্য সবসময় ${motherName}-এর মায়ের নথিতে যাবে। বাংলা ও ইংরেজি লেখা যায়। আবশ্যক ঘরগুলো চিহ্নিত।`)}</p>
      <label className="grid min-w-0 gap-2">{L("Observation template (optional)", "সহজে নাম বেছে নিন · পর্যবেক্ষণের ধরন (ঐচ্ছিক)")}<select className={fieldClass} defaultValue="" onChange={event=>{const form=event.currentTarget.form;if(form&&event.target.value)(form.elements.namedItem("label") as HTMLInputElement).value=event.target.value;}}><option value="">{L("Choose a name, or write your own below", "একটি নাম বাছুন, অথবা নিচে নিজের মতো লিখুন")}</option>{["Blood pressure","Weight","Pulse","Temperature","Fundal height","Edema","Fetal heart rate","Fetal movement note","Hemoglobin","Blood group/Rh","Urine protein","Urine glucose","OGTT","Blood glucose","Infection screening","Mood note","Symptom note"].map(name=><option value={name} key={name}>{reportTemplateLabel(name, L.bn)}</option>)}</select></label>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-category`} className="font-semibold">{L("Category (required)", "ধরন (আবশ্যক)")}</label>
        <select id={`${id}-category`} name="category" defaultValue="general_notes" required className={fieldClass} {...errorProps("category")}>
          {Object.entries(observationCategories).map(([key, label]) => <option key={key} value={key}>{categoryLabel(key, label, L.bn)}</option>)}
        </select>
        {errors.category && <p id={`${id}-category-error`} role="alert" className="text-pro-danger">{errors.category}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-label`} className="font-semibold">{L("Observation name (required)", "পর্যবেক্ষণের নাম (আবশ্যক)")}</label>
        <input id={`${id}-label`} name="label" required className={fieldClass} {...errorProps("label")} />
        {errors.label && <p id={`${id}-label-error`} role="alert" className="text-pro-danger">{errors.label}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-value`} className="font-semibold">{L("Value or note (required)", "মান বা নোট (আবশ্যক)")}</label>
        <textarea id={`${id}-value`} name="value" rows={3} required maxLength={2000} value={noteText} onChange={event => setNoteText(event.target.value)} className={`${fieldClass} resize-y`} {...errorProps("value")} />
        <VoiceDictationButton language={language === "bn" ? "bn" : "en"} value={noteText} maxLength={2000} onChange={setNoteText} />
        <details className="rounded-field border border-pro-border p-3">
          <summary className="min-h-12 cursor-pointer font-semibold">{L("Say it with pictures (adds words to the note above)", "ছবি দিয়ে বলুন (ওপরের নোটে কথা যোগ হবে)")}</summary>
          <AACComposer bare initialLanguage={language === "bn" ? "bn" : "en"} targetLabel={L("Add to note", "নোটে যোগ করুন")} onInsert={text => { const next = mergeAacText(noteText, text); if (next.length <= 2000) setNoteText(next); else setHeldAac(text); }} />
          {heldAac && <HeldAacText text={heldAac} value={noteText} maxLength={2000} lang={language === "bn" ? "bn" : "en"} onDismiss={() => setHeldAac("")} onAdd={next => { setNoteText(next); setHeldAac(""); }} />}
        </details>
        <p className="text-pro-muted">{L("If you speak a number or unit, check it carefully before saving. Nothing is saved until you press Save.", "সংখ্যা বা একক মুখে বললে সংরক্ষণের আগে ভালোভাবে দেখে নিন। সংরক্ষণ চাপার আগে কিছুই সংরক্ষিত হয় না।")}</p>
        {errors.value && <p id={`${id}-value-error`} role="alert" className="text-pro-danger">{errors.value}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-unit`} className="font-semibold">{L("Unit (optional)", "একক (ঐচ্ছিক)")}</label>
        <input id={`${id}-unit`} name="unit" className={fieldClass} aria-describedby={`${id}-unit-hint`} />
        <p id={`${id}-unit-hint`} className="text-pro-muted">{L("Add a unit only when it applies to your value. Leave blank for notes.", "মানের সঙ্গে প্রযোজ্য হলেই একক দিন। নোট হলে ফাঁকা রাখুন।")}</p>
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-observedAt`} className="font-semibold">{L("Observation date (required)", "পর্যবেক্ষণের তারিখ (আবশ্যক)")}</label>
        <input id={`${id}-observedAt`} name="observedAt" type="date" required className={fieldClass} {...errorProps("observedAt")} />
        {errors.observedAt && <p id={`${id}-observedAt-error`} role="alert" className="text-pro-danger">{errors.observedAt}</p>}
      </div>
      <details className="rounded-field border border-pro-border p-3"><summary className="min-h-12 cursor-pointer font-semibold">{L("Optional laboratory or report context", "রিপোর্টের অতিরিক্ত তথ্য (ঐচ্ছিক)")}</summary><div className="mt-3 grid gap-3">{[["reportDate",L("Report date","রিপোর্টের তারিখ")],["referenceRange",L("Report-provided reference interval","রিপোর্টে দেওয়া স্বাভাবিক সীমা")],["sourceDocument",L("Source document reference","মূল নথির পরিচিতি")],["notes",L("Notes","নোট")]].map(([name,label])=><label key={name} className="grid gap-2">{label}<input name={name} type={name==="reportDate"?"date":"text"} className={fieldClass} /></label>)}</div></details>
      <button type="submit" disabled={disabled} className="min-h-12 whitespace-normal rounded-control border border-pro-primary bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:cursor-wait disabled:opacity-60">{disabled ? L("Loading records…", "নথি লোড হচ্ছে…") : "Save maternal observation"}</button>
      <p role="status" aria-atomic="true" className={feedback?.kind === "error" ? "text-pro-danger" : "text-pro-text"}>{feedback?.message}</p>
    </form>
  );
}
