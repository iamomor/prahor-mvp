"use client";
import type { BabyRecord } from "./records-model";
import { DEFAULT_EPISODE_ID, episodeOf } from "./records-model";

import { useId, useState, type FormEvent } from "react";
import {
  demoMother,
  demoBaby,
  babyObservationCategories,
  allObservationCategories,
  saveDemoObservation,
  type HealthObservation,
  type ObservationCategory,
} from "./demo-health";

type BabyHealthRecordProps = {
  observations: HealthObservation[];
  onSaved: (observations: HealthObservation[]) => void;
  loading?: boolean;
  baby?: BabyRecord; pregnancyId?: string; motherName?: string;
};
type FieldName = "category" | "label" | "value" | "observedAt";
type FieldErrors = Partial<Record<FieldName, string>>;
const fieldClass = "w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";

/** Mock-first baby record; the service owns persistence and the parent owns the timeline. */
export function BabyHealthRecord({ observations, onSaved, loading = false, baby = { ...demoBaby, pregnancyId: DEFAULT_EPISODE_ID } as BabyRecord, pregnancyId = DEFAULT_EPISODE_ID, motherName = demoMother.name }: BabyHealthRecordProps) {
  const id = useId();
  const babyObservations = observations
    .filter((item) => item.recordType === "baby" && item.recordId === baby.id && episodeOf(item) === pregnancyId && !item.archived)
    .sort((a, b) => (Date.parse(b.observedAt) || 0) - (Date.parse(a.observedAt) || 0));
  const latest = babyObservations.find((item) => Number.isFinite(Date.parse(item.observedAt)));
  function displayDate(value: string) {
    return new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(value));
  }
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const category = String(data.get("category") ?? "");
    const label = String(data.get("label") ?? "").trim();
    const value = String(data.get("value") ?? "").trim();
    const unit = String(data.get("unit") ?? "").trim();
    const observedAt = String(data.get("observedAt") ?? "");
    const nextErrors: FieldErrors = {};
    if (!Object.hasOwn(babyObservationCategories, category)) nextErrors.category = "Choose an observation category.";
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
        recordType: "baby",
        recordId: baby.id, pregnancyId,
        category: category as ObservationCategory,
        label, value, unit,
        // Preserve a calendar date; no observation time was collected.
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
    setFeedback({ kind: "success", message: "Saved to Baby's record on this device — not sent. This entry is self-reported and has not been clinically verified." });
  }

  function errorProps(name: FieldName) {
    return { "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined };
  }

  return (
    <section aria-labelledby={`${id}-overview`} className="min-w-0 rounded-card border border-t-4 border-pro-border border-t-pro-control-border bg-pro-elevated p-[var(--pro-pad-card)]">
      <h2 id={`${id}-overview`} className="text-xl font-semibold">Baby&apos;s Health — <span lang="bn">শিশুর স্বাস্থ্য</span></h2>
      <dl className="mt-4 grid min-w-0 gap-3">
        <div><dt className="text-pro-muted">Baby record ID</dt><dd className="break-words font-semibold">{baby.id}</dd></div>
        <div><dt className="text-pro-muted">Linked mother&apos;s record ID</dt><dd className="break-words font-semibold">{baby.motherId}</dd></div>
        <div><dt className="text-pro-muted">Linked pregnancy episode</dt><dd className="break-words">{pregnancyId}</dd></div>
      </dl>
      <p className="mt-3 text-pro-muted">{baby.motherId === demoMother.id ? `Linked to ${motherName}'s pregnancy record. Observations stay in the baby's separate record.` : "Mother link could not be verified."}</p>
      {loading ? <p className="mt-4" role="status">Loading baby observations…</p> : <>
        <p className="mt-4"><strong className="text-3xl font-semibold tabular-nums">{babyObservations.length}</strong> saved baby {babyObservations.length === 1 ? "observation" : "observations"}</p>
        {latest && <p className="mt-2 text-pro-muted">Most recent observation: <time dateTime={latest.observedAt}>{displayDate(latest.observedAt)}</time></p>}
        {babyObservations.length === 0 && <p className="mt-3 text-pro-muted">No baby observations yet. Add your first fictional note below to start this record.</p>}
      </>}
    <form onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`} aria-describedby={`${id}-note`} className="mt-6 grid min-w-0 gap-[var(--pro-gap-field)] border-t border-pro-border pt-6">
      <h3 id={`${id}-heading`} className="text-xl font-semibold">Add baby observation · <span lang="bn">শিশুর স্বাস্থ্য তথ্য</span></h3>
      <p id={`${id}-note`} className="text-pro-muted">Use fictional information only. Entries always go to the baby record. Notes about clinician-provided information remain self-reported; they do not confirm a clinical assessment. Bangla and English text are supported. Required fields are labelled.</p>
      <label className="grid min-w-0 gap-2">সহজে নাম বেছে নিন · Baby observation template<select className={fieldClass} defaultValue="" onChange={event=>{const form=event.currentTarget.form;if(form&&event.target.value)(form.elements.namedItem("label") as HTMLInputElement).value=event.target.value;}}><option value="">Choose a name, or write your own</option>{["Fetal heartbeat finding","Fetal movement note","Estimated fetal weight","Fetal presentation","Weight","Length","Head circumference","Feeding note","Jaundice observation","Developmental milestone","Ultrasound finding"].map(name=><option key={name}>{name}</option>)}</select></label>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-category`} className="font-semibold">Category (required)</label>
        <select id={`${id}-category`} name="category" defaultValue="general_observations" required className={fieldClass} {...errorProps("category")}>
          {Object.entries(babyObservationCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {errors.category && <p id={`${id}-category-error`} role="alert" className="text-pro-danger">{errors.category}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-label`} className="font-semibold">Observation name or description (required)</label>
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
      <button type="submit" disabled={loading} className="min-h-12 whitespace-normal rounded-control border border-pro-primary bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:cursor-wait disabled:opacity-60">{loading ? "Loading records…" : "Save baby observation"}</button>
      <p role="status" aria-atomic="true" className={feedback?.kind === "error" ? "text-pro-danger" : "text-pro-text"}>{feedback?.message}</p>
    </form>
      <section aria-labelledby={`${id}-history`} className="mt-6 min-w-0 border-t border-pro-border pt-6">
        <h3 id={`${id}-history`} className="text-xl font-semibold">Baby health history</h3>
        <p className="mt-2 text-pro-muted">Baby entries only, newest first. Dates are shown in Bangladesh time; an exact observation time is not collected by this form.</p>
        {!loading && babyObservations.length === 0 && <p className="mt-4">Your saved fictional observations will appear here.</p>}
        {!loading && <ol className="mt-4 divide-y divide-pro-border">
          {babyObservations.map((item, index) => <li key={`${item.id}-${index}`} className="min-w-0 py-4 [overflow-wrap:anywhere]">
            <h4 className="font-semibold">{item.label}</h4>
            <p className="mt-2 text-pro-muted">Category: {item.category ? allObservationCategories[item.category] : "Not recorded"}</p>
            <p className="mt-2 whitespace-pre-wrap">{item.value}{item.unit ? ` ${item.unit}` : ""}</p>
            <p className="mt-2">Observation date: {Number.isFinite(Date.parse(item.observedAt)) ? <time dateTime={item.observedAt}>{displayDate(item.observedAt)}</time> : "Date unavailable"}</p>
            <p className="mt-2 text-pro-muted">Source: {item.source === "self_reported" ? "Self-reported" : item.reviewStatus === "verified" && item.reviewedAt && Number.isFinite(Date.parse(item.reviewedAt)) && item.reviewedBy?.trim() ? "Medical report (user-reviewed)" : item.reviewStatus === "verified" ? "Medical report (review status unknown)" : "Medical report (not yet reviewed)"} · Not clinically verified</p>
          </li>)}
        </ol>}
      </section>
    </section>
  );
}



