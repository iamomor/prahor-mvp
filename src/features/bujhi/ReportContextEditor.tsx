"use client";
import { useId } from "react";
import { datum, readDatum, setDatum, sectionFields, sectionLabels, type AntenatalSections, type Presence, type ReportSection } from "./report-schema";
import { estimateEdd } from "./report-normalization";
import { validDate } from "./validation";
const control = "w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg p-3 text-pro-text";
export function ReportContextEditor({ sections, onChange, disabled = false }: { sections: AntenatalSections; onChange: (sections: AntenatalSections) => void; disabled?: boolean }) {
  const id = useId();
  function estimate() {
    const lmp = sections.dating?.lmp?.value ?? "", result = estimateEdd(lmp);
    if (result) onChange({ ...sections, dating: { ...sections.dating, calculation: { method: "LMP_PLUS_280_DAYS", lmpInput: lmp, estimatedEdd: result, days: 280 } } });
  }
  return <fieldset disabled={disabled} className="grid min-w-0 gap-3"><legend className="mb-3 text-xl font-semibold">রিপোর্টের অতিরিক্ত তথ্য · Report details (optional)</legend><p>যতটুকু জানা আছে লিখুন। সব ঘর পূরণ করতে হবে না। Copy documented information; missing information stays unknown.</p>
    {(Object.keys(sectionLabels) as ReportSection[]).map((section) => <details key={section} className="min-w-0 rounded-field border border-pro-border p-3"><summary className="min-h-12 cursor-pointer font-semibold">{sectionLabels[section]}</summary>
      {section === "risk" && <p className="my-3">{sections.risk?.classification?.value ? "রিপোর্টে যেমন লেখা আছে · Classification as recorded; not independently authenticated." : "নথিভুক্ত নেই · Not documented"} — PROHOR does not assign a risk category.</p>}
      {section === "provider" && <p className="my-3">A written name, signature, or stamp is a document claim, not proof of authenticity or clinician confirmation.</p>}
      <div className="mt-3 grid min-w-0 gap-4">{sectionFields[section].map((descriptor) => {
        const item = readDatum(sections, section, descriptor.key), date = "date" in descriptor && descriptor.date;
        const value = item?.value ?? "";
        return <div key={descriptor.key} className="grid min-w-0 gap-2"><label htmlFor={`${id}-${section}-${descriptor.key}`} className="font-semibold">{descriptor.label}</label><input id={`${id}-${section}-${descriptor.key}`} type={date ? "date" : "text"} value={date && value && !validDate(value) ? "" : value} onChange={(event) => onChange(setDatum(sections, section, descriptor.key, { ...datum(event.target.value, item?.source === "profile" ? "self_reported" : item?.source ?? "self_reported"), original: item?.original ?? event.target.value, sourceText: item?.sourceText }))} className={control} />
          {item?.source === "profile" && <p className="text-pro-muted">আগের ডেমো প্রোফাইল থেকে · From existing demo profile; correct if needed.</p>}
          {item?.original && item.original !== value && <p className="text-pro-muted">মূল লেখা · Original: {item.original}</p>}
          {date && value && !validDate(value) && <p className="text-pro-danger">তারিখটি বোঝা যায়নি · Uninterpretable date: {value}. Check the source and select the date.</p>}
          <label htmlFor={`${id}-${section}-${descriptor.key}-presence`} className="text-pro-muted">তথ্যের অবস্থা · Information status</label><select id={`${id}-${section}-${descriptor.key}-presence`} value={item?.presence ?? "not_provided"} onChange={(event) => {
            const presence = event.target.value as Presence;
            onChange(setDatum(sections, section, descriptor.key, { ...(item ?? datum("")), value: presence === "provided" || presence === "not_reviewed" || presence === "conflicting" ? item?.value : undefined, presence, reviewStatus: "pending" }));
          }} className={control}><option value="provided">লেখা আছে · Provided</option><option value="not_provided">দেওয়া হয়নি · Not provided</option><option value="not_applicable">প্রযোজ্য নয় · Not applicable</option><option value="not_reviewed">যাচাই বাকি · Not yet reviewed</option><option value="unreadable">পড়া যাচ্ছে না · Unreadable</option><option value="conflicting">তথ্যে অমিল · Conflicting information</option></select>
        </div>;
      })}</div>
      {section === "dating" && <div className="mt-4 grid gap-3"><button type="button" disabled={!estimateEdd(sections.dating?.lmp?.value ?? "")} onClick={estimate} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary disabled:opacity-60">LMP থেকে আনুমানিক তারিখ দেখুন · Estimate LMP + 280 days</button>{sections.dating?.calculation && <p>LMP {sections.dating.calculation.lmpInput} + {sections.dating.calculation.days} days → estimated EDD {sections.dating.calculation.estimatedEdd}. This is an estimate; the documented EDD was not replaced.</p>}</div>}
    </details>)}
  </fieldset>;
}
