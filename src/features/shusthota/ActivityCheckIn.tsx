"use client";

import { useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { saveWellnessEntry, shusthotaErrorCopy } from "./api";

type Activity = "walking" | "assisted" | "seated" | "resting" | "other" | "none";
const options: readonly { value: Activity; label: { en: string; bn: string } }[] = [
  { value: "walking", label: { en: "Walking", bn: "হাঁটা" } },
  { value: "assisted", label: { en: "Assisted activity", bn: "সহায়তা নিয়ে কাজকর্ম" } },
  { value: "seated", label: { en: "Seated or wheelchair-friendly activity", bn: "বসে বা হুইলচেয়ার ব্যবহার করে করা যায় এমন কাজ" } },
  { value: "resting", label: { en: "Resting", bn: "বিশ্রাম" } },
  { value: "other", label: { en: "Other", bn: "অন্য কিছু" } },
  { value: "none", label: { en: "None", bn: "কোনোটিই নয়" } },
];
const copy = {
  title: { en: "Which activity would you like to note?", bn: "কোন কাজকর্মটি নোট করতে চান?" },
  instruction: { en: "These are personal choices, not measures of performance. Every option is equally valid.", bn: "এগুলো ব্যক্তিগত পছন্দ, কাজের মাপকাঠি নয়। প্রতিটি বিকল্পই সমানভাবে গ্রহণযোগ্য।" },
  privacy: { en: "The selected label is saved as free text in activityNote, not as a structured activity category.", bn: "বাছাই করা নামটি activityNote-এ সাধারণ লেখা হিসেবে সংরক্ষিত হয়; নির্দিষ্ট কাজকর্মের ধরন হিসেবে নয়।" },
  recommendation: { en: "These choices are not exercise instructions or recommendations.", bn: "এই ধরনগুলো কোনো ব্যায়ামের নির্দেশনা বা পরামর্শ নয়।" },
  review: { en: "Review your activity note", bn: "কাজকর্মের নোট দেখে নিন" },
  save: { en: "Save activity note", bn: "কাজকর্মের নোট সংরক্ষণ করুন" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  change: { en: "Change selection", bn: "বাছাই বদলান" },
  skip: { en: "Skip and return to overview", bn: "এড়িয়ে সারসংক্ষেপে ফিরুন" },
  saved: { en: "Demo entry confirmed by the server.", bn: "সার্ভার ডেমো এন্ট্রিটি নিশ্চিত করেছে।" },
  keepSelection: { en: "Your selection is still here. Check history before retrying if the save was not confirmed.", bn: "আপনার বাছাই এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
} as const;

export function ActivityCheckIn({ onClose, onSaved }: { onClose: () => void; onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<Activity | null>(null);
  const [step, setStep] = useState<"choose" | "review">("choose");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const hintId = "shusthota-activity-help";
  useEffect(() => { heading.current?.focus(); }, [step]);

  async function save() {
    if (!selected || saving || submitting.current || status?.kind === "success") return;
    submitting.current = true;
    setSaving(true); setStatus(null);
    try {
      const option = options.find(item => item.value === selected);
      await saveWellnessEntry({ activityNote: option ? `${option.label.en} (${option.label.bn})` : selected });
      setStatus({ kind: "success", message: t(copy.saved) });
      await onSaved?.();
    } catch (cause) {
      setStatus({ kind: "error", message: `${t(shusthotaErrorCopy(cause, "save"))} ${t(copy.keepSelection)}` });
    } finally { submitting.current = false; setSaving(false); }
  }

  const selectedOption = options.find(option => option.value === selected);
  return (
    <section id="shusthota-activity-preview" aria-labelledby="shusthota-activity-title" lang={language}>
      <AppCard className="grid gap-5 sm:p-6">
        <div className="grid gap-2">
          <h3 id="shusthota-activity-title" ref={heading} tabIndex={-1} className="text-xl font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:text-2xl">{t(step === "choose" ? copy.title : copy.review)}</h3>
          <p className="pro-muted leading-relaxed">{t(copy.privacy)}</p>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.recommendation)}</p>
          {status && <p role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "text-pro-danger" : "text-pro-success"}>{status.message}</p>}
        </div>
        {step === "choose" ? (
          <>
            <fieldset aria-describedby={hintId} className="grid gap-3">
              <legend className="mb-3 font-medium text-pro-text">{t({ en: "Choose one option if you like.", bn: "ইচ্ছা হলে একটি বেছে নিন।" })}</legend>
              <p id={hintId} className="pro-muted leading-relaxed">{t(copy.instruction)}</p>
              {options.map(option => <label key={option.value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"><input type="radio" name="shusthota-activity-choice" value={option.value} checked={selected === option.value} onChange={() => setSelected(option.value)} className="size-5 shrink-0 accent-pro-primary" /><span>{t(option.label)}</span></label>)}
            </fieldset>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap"><AppButton disabled={!selected} onClick={() => setStep("review")}>{t({ en: "Review this choice", bn: "এই বাছাইটি দেখে নিন" })}</AppButton><AppButton variant="secondary" onClick={onClose}>{t(copy.skip)}</AppButton></div>
          </>
        ) : (
          <>
            <div className="rounded-field border border-pro-border bg-pro-surface p-4"><p className="text-sm font-medium text-pro-muted">{t({ en: "Activity note", bn: "কাজকর্মের নোট" })}</p><p className="text-lg font-semibold">{selectedOption ? t(selectedOption.label) : ""}</p></div>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap"><AppButton variant="secondary" onClick={() => { setStatus(null); setStep("choose"); }}>{t(copy.change)}</AppButton><AppButton disabled={saving || status?.kind === "success"} onClick={() => void save()}>{saving ? t(copy.saving) : t(status?.kind === "success" ? copy.saved : copy.save)}</AppButton><AppButton variant="ghost" onClick={onClose}>{t(copy.skip)}</AppButton></div>
          </>
        )}
      </AppCard>
    </section>
  );
}
