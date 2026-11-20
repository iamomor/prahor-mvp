"use client";
import type { BabyRecord } from "./records-model";
import { DEFAULT_EPISODE_ID, episodeOf } from "./records-model";

import { useId, useState, type FormEvent } from "react";
import { AACComposer, HeldAacText, ReadAloudButton, VoiceDictationButton, mergeAacText } from "@/features/adapt";
import { useLanguage } from "@/i18n/use-language";
import { useL, categoryLabel, sourceLabel } from "./use-l";
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
  const L = useL();
  const id = useId();
  const babyObservations = observations
    .filter((item) => item.recordType === "baby" && item.recordId === baby.id && episodeOf(item) === pregnancyId && !item.archived)
    .sort((a, b) => (Date.parse(b.observedAt) || 0) - (Date.parse(a.observedAt) || 0));
  const latest = babyObservations.find((item) => Number.isFinite(Date.parse(item.observedAt)));
  function displayDate(value: string) {
    return new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(value));
  }
  const [errors, setErrors] = useState<FieldErrors>({});
  const { language } = useLanguage();
  const [noteText, setNoteText] = useState("");
  const [heldAac, setHeldAac] = useState("");
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
    if (!Object.hasOwn(babyObservationCategories, category)) nextErrors.category = L("Choose an observation category.", "একটি পর্যবেক্ষণের ধরন বেছে নিন।");
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
        recordType: "baby",
        recordId: baby.id, pregnancyId,
        category: category as ObservationCategory,
        label, value, unit,
        // Preserve a calendar date; no observation time was collected.
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
    setFeedback({ kind: "success", message: L("Saved to Baby's record on this device — not sent. This entry is self-reported and has not been clinically verified.", "এই ডিভাইসে শিশুর নথিতে সংরক্ষিত — কোথাও পাঠানো হয়নি। এটি আপনার নিজের দেওয়া তথ্য, চিকিৎসাগতভাবে যাচাই করা হয়নি।") });
  }

  function errorProps(name: FieldName) {
    return { "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined };
  }

  return (
    <section aria-labelledby={`${id}-overview`} className="min-w-0 rounded-card border border-t-4 border-pro-border border-t-pro-control-border bg-pro-elevated p-[var(--pro-pad-card)]">
      <h2 id={`${id}-overview`} className="text-xl font-semibold">Baby&apos;s Health — <span lang="bn">শিশুর স্বাস্থ্য</span></h2>
      <dl className="mt-4 grid min-w-0 gap-3">
        <div><dt className="text-pro-muted">{L("Baby record ID", "শিশুর নথির আইডি")}</dt><dd className="break-words font-semibold">{baby.id}</dd></div>
        <div><dt className="text-pro-muted">{L("Linked mother's record ID", "যুক্ত মায়ের নথির আইডি")}</dt><dd className="break-words font-semibold">{baby.motherId}</dd></div>
        <div><dt className="text-pro-muted">{L("Linked pregnancy episode", "যুক্ত গর্ভকাল")}</dt><dd className="break-words">{pregnancyId}</dd></div>
      </dl>
      <p className="mt-3 text-pro-muted">{baby.motherId === demoMother.id ? `Linked to ${motherName}'s pregnancy record. Observations stay in the baby's separate record.` : "Mother link could not be verified."}</p>
      {loading ? <p className="mt-4" role="status">{L("Loading baby observations…", "শিশুর পর্যবেক্ষণ লোড হচ্ছে…")}</p> : <>
        <p className="mt-4"><strong className="text-3xl font-semibold tabular-nums">{babyObservations.length}</strong> saved baby {babyObservations.length === 1 ? "observation" : "observations"}</p>
        {latest && <p className="mt-2 text-pro-muted">{L("Most recent observation", "সবচেয়ে সাম্প্রতিক পর্যবেক্ষণ")}: <time dateTime={latest.observedAt}>{displayDate(latest.observedAt)}</time></p>}
        {babyObservations.length === 0 && <p className="mt-3 text-pro-muted">{L("No baby observations yet. Add your first fictional note below to start this record.", "এখনো শিশুর কোনো পর্যবেক্ষণ নেই। নথি শুরু করতে নিচে প্রথম কাল্পনিক নোট যোগ করুন।")}</p>}
      </>}
    <form onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`} aria-describedby={`${id}-note`} className="mt-6 grid min-w-0 gap-[var(--pro-gap-field)] border-t border-pro-border pt-6">
      <h3 id={`${id}-heading`} className="text-xl font-semibold">Add baby observation · <span lang="bn">শিশুর স্বাস্থ্য তথ্য</span></h3>
      <p id={`${id}-note`} className="text-pro-muted">Use fictional information only. Entries always go to the baby record. Notes about clinician-provided information remain self-reported; they do not confirm a clinical assessment. Bangla and English text are supported. Required fields are labelled.</p>
      <label className="grid min-w-0 gap-2">সহজে নাম বেছে নিন · Baby observation template<select className={fieldClass} defaultValue="" onChange={event=>{const form=event.currentTarget.form;if(form&&event.target.value)(form.elements.namedItem("label") as HTMLInputElement).value=event.target.value;}}><option value="">Choose a name, or write your own</option>{["Fetal heartbeat finding","Fetal movement note","Estimated fetal weight","Fetal presentation","Weight","Length","Head circumference","Feeding note","Jaundice observation","Developmental milestone","Ultrasound finding"].map(name=><option key={name}>{name}</option>)}</select></label>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-category`} className="font-semibold">{L("Category (required)", "ধরন (আবশ্যক)")}</label>
        <select id={`${id}-category`} name="category" defaultValue="general_observations" required className={fieldClass} {...errorProps("category")}>
          {Object.entries(babyObservationCategories).map(([key, label]) => <option key={key} value={key}>{categoryLabel(key, label, L.bn)}</option>)}
        </select>
        {errors.category && <p id={`${id}-category-error`} role="alert" className="text-pro-danger">{errors.category}</p>}
      </div>
      <div className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-label`} className="font-semibold">{L("Observation name or description (required)", "পর্যবেক্ষণের নাম বা বিবরণ (আবশ্যক)")}</label>
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
      <button type="submit" disabled={loading} className="min-h-12 whitespace-normal rounded-control border border-pro-primary bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:cursor-wait disabled:opacity-60">{loading ? L("Loading records…", "নথি লোড হচ্ছে…") : L("Save baby observation", "শিশুর পর্যবেক্ষণ সংরক্ষণ করুন")}</button>
      <p role="status" aria-atomic="true" className={feedback?.kind === "error" ? "text-pro-danger" : "text-pro-text"}>{feedback?.message}</p>
    </form>
      <section aria-labelledby={`${id}-history`} className="mt-6 min-w-0 border-t border-pro-border pt-6">
        <h3 id={`${id}-history`} className="text-xl font-semibold">{L("Baby health history", "শিশুর স্বাস্থ্যের ইতিহাস")}</h3>
        <p className="mt-2 text-pro-muted">{L("Baby entries only, newest first. Dates are shown in Bangladesh time; an exact observation time is not collected by this form.", "শুধু শিশুর তথ্য, নতুন আগে। তারিখ বাংলাদেশ সময়ে দেখানো হয়; এই ফর্মে সঠিক সময় নেওয়া হয় না।")}</p>
        {!loading && babyObservations.length === 0 && <p className="mt-4">{L("Your saved fictional observations will appear here.", "আপনার সংরক্ষিত কাল্পনিক পর্যবেক্ষণ এখানে দেখা যাবে।")}</p>}
        {!loading && <ol className="mt-4 divide-y divide-pro-border">
          {babyObservations.map((item, index) => <li key={`${item.id}-${index}`} className="min-w-0 py-4 [overflow-wrap:anywhere]">
            <h4 className="font-semibold">{item.label}</h4>
            <p className="mt-2 text-pro-muted">{L("Category", "ধরন")}: {item.category ? categoryLabel(item.category, allObservationCategories[item.category], L.bn) : L("Not recorded", "লেখা নেই")}</p>
            <p className="mt-2 whitespace-pre-wrap">{item.value}{item.unit ? ` ${item.unit}` : ""}</p>
            <ReadAloudButton language={L.bn ? "bn" : "en"} text={L(`${item.label}: ${item.value}${item.unit ? " " + item.unit : ""}. Baby record. Date: ${item.observedAt}. Self-reported entries are not clinically verified.`, `${item.label}: ${item.value}${item.unit ? " " + item.unit : ""}। শিশুর নথি। তারিখ: ${item.observedAt}। নিজে দেওয়া তথ্য চিকিৎসাগতভাবে যাচাই করা হয়নি।`)} />
            <p className="mt-2">{L("Observation date", "পর্যবেক্ষণের তারিখ")}: {Number.isFinite(Date.parse(item.observedAt)) ? <time dateTime={item.observedAt}>{displayDate(item.observedAt)}</time> : L("Date unavailable", "তারিখ পাওয়া যায়নি")}</p>
            <p className="mt-2 text-pro-muted">{L("Source", "উৎস")}: {sourceLabel(L, item)}</p>
          </li>)}
        </ol>}
      </section>
    </section>
  );
}
