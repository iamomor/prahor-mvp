"use client";

import { useId, useState, type FormEvent } from "react";
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
  const id = useId();
  const [errors, setErrors] = useState<FieldErrors>({});
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
    if (!Object.hasOwn(observationCategories, category)) nextErrors.category = "Choose an observation category.";
    if (!label) nextErrors.label = "Enter an observation name in Bangla or English.";
    if (!value) nextErrors.value = "Enter a value or a note in Bangla or English.";
    // Round-trip validation rejects impossible dates instead of allowing Date to normalize them.
    const date = new Date(`${observedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(observedAt) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== observedAt) {
      nextErrors.observedAt = "Enter a valid observation date using the date field.";
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
      setFeedback({ kind: "error", message: "Observation not saved. Your inputs are still here. Check that browser storage is available and has space, then try again." });
      return;
    }
    onSaved(updated);
    for (const name of ["label", "value", "unit"]) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = "";
    }
    setFeedback({ kind: "success", message: "Saved to Mother's record on this device — not sent. This entry is self-reported and has not been clinically verified." });
  }

  function errorProps(name: FieldName) {
    return { "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined };
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`} aria-describedby={`${id}-note`} className="mt-6 grid min-w-0 gap-[var(--pro-gap-field)] border-t border-pro-border pt-6">
      <h3 id={`${id}-heading`} className="text-xl font-semibold">Add maternal observation · <span lang="bn">মায়ের স্বাস্থ্য তথ্য</span></h3>
      <p id={`${id}-note`} className="text-pro-muted">Use fictional information only. Entries always go to {motherName}&apos;s mother record. Bangla and English text are supported. Required fields are labelled.</p>
      <label className="grid min-w-0 gap-2">সহজে নাম বেছে নিন · Observation template (optional)<select className={fieldClass} defaultValue="" onChange={event=>{const form=event.currentTarget.form;if(form&&event.target.value)(form.elements.namedItem("label") as HTMLInputElement).value=event.target.value;}}><option value="">Choose a name, or write your own below</option>{["Blood pressure","Weight","Pulse","Temperature","Fundal height","Edema","Fetal heart rate","Fetal movement note","Hemoglobin","Blood group/Rh","Urine protein","Urine glucose","OGTT","Blood glucose","Infection screening","Mood note","Symptom note"].map(name=><option value={name} key={name}>{name}</option>)}</select></label>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-category`} className="font-semibold">Category (required)</label>
        <select id={`${id}-category`} name="category" defaultValue="general_notes" required className={fieldClass} {...errorProps("category")}>
          {Object.entries(observationCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {errors.category && <p id={`${id}-category-error`} role="alert" className="text-pro-danger">{errors.category}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-label`} className="font-semibold">Observation name (required)</label>
        <input id={`${id}-label`} name="label" required className={fieldClass} {...errorProps("label")} />
        {errors.label && <p id={`${id}-label-error`} role="alert" className="text-pro-danger">{errors.label}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-value`} className="font-semibold">Value or note (required)</label>
        <textarea id={`${id}-value`} name="value" rows={3} required className={`${fieldClass} resize-y`} {...errorProps("value")} />
        {errors.value && <p id={`${id}-value-error`} role="alert" className="text-pro-danger">{errors.value}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-unit`} className="font-semibold">Unit (optional)</label>
        <input id={`${id}-unit`} name="unit" className={fieldClass} aria-describedby={`${id}-unit-hint`} />
        <p id={`${id}-unit-hint`} className="text-pro-muted">Add a unit only when it applies to your value. Leave blank for notes.</p>
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-observedAt`} className="font-semibold">Observation date (required)</label>
        <input id={`${id}-observedAt`} name="observedAt" type="date" required className={fieldClass} {...errorProps("observedAt")} />
        {errors.observedAt && <p id={`${id}-observedAt-error`} role="alert" className="text-pro-danger">{errors.observedAt}</p>}
      </div>
      <details className="rounded-field border border-pro-border p-3"><summary className="min-h-12 cursor-pointer font-semibold">রিপোর্টের অতিরিক্ত তথ্য · Optional laboratory/report context</summary><div className="mt-3 grid gap-3">{[["reportDate","Report date"],["referenceRange","Report-provided reference interval"],["sourceDocument","Source document reference"],["notes","Notes"]].map(([name,label])=><label key={name} className="grid gap-2">{label}<input name={name} type={name==="reportDate"?"date":"text"} className={fieldClass} /></label>)}</div></details>
      <button type="submit" disabled={disabled} className="min-h-12 whitespace-normal rounded-control border border-pro-primary bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:cursor-wait disabled:opacity-60">{disabled ? "Loading records…" : "Save maternal observation"}</button>
      <p role="status" aria-atomic="true" className={feedback?.kind === "error" ? "text-pro-danger" : "text-pro-text"}>{feedback?.message}</p>
    </form>
  );
}

