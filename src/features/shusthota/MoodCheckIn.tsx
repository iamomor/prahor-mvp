"use client";

import { useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import type { WellnessEntry } from "@/lib/contracts/wellness";
import { saveWellnessEntry, shusthotaErrorCopy } from "./api";

type MoodValue = NonNullable<WellnessEntry["mood"]>;
const options: readonly { value: MoodValue; label: { en: string; bn: string } }[] = [
  { value: "comfortable", label: { en: "I feel comfortable", bn: "স্বচ্ছন্দ লাগছে" } },
  { value: "mixed", label: { en: "A mix of feelings", bn: "মিশ্র অনুভূতি" } },
  { value: "difficult", label: { en: "It feels difficult", bn: "কঠিন লাগছে" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];
const copy = {
  choose: { en: "How are you feeling right now?", bn: "এই মুহূর্তে আপনার কেমন লাগছে?" },
  help: { en: "Choose one option if you like.", bn: "ইচ্ছা হলে একটি বেছে নিন।" },
  instruction: { en: "This check-in is optional, and there is no right answer.", bn: "এই খোঁজখবর ঐচ্ছিক—এখানে কোনো সঠিক বা ভুল উত্তর নেই।" },
  review: { en: "Review your mood selection", bn: "মনের অবস্থার বাছাই দেখে নিন" },
  privacy: { en: "Your mood is added to this synthetic demo only after you choose Save and the server confirms it.", bn: "সংরক্ষণ বাছার পর সার্ভার নিশ্চিত করলেই আপনার মনের অবস্থা এই কৃত্রিম ডেমোতে যোগ হবে।" },
  clinical: { en: "This is your own description, not a clinical assessment.", bn: "এটি আপনার নিজের অনুভূতি, চিকিৎসাগত মূল্যায়ন নয়।" },
  save: { en: "Save mood check-in", bn: "মনের অবস্থার খোঁজখবর সংরক্ষণ করুন" },
  saved: { en: "Demo entry confirmed by the server.", bn: "সার্ভার ডেমো এন্ট্রিটি নিশ্চিত করেছে।" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  change: { en: "Change selection", bn: "বাছাই বদলান" },
  skip: { en: "Skip and return to overview", bn: "এড়িয়ে সারসংক্ষেপে ফিরুন" },
  keepSelection: { en: "Your selection is still here. Check history before retrying if the save was not confirmed.", bn: "আপনার বাছাই এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
} as const;

export function MoodCheckIn({ onClose, onSaved }: { onClose: () => void; onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [step, setStep] = useState<"choose" | "review">("choose");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const hintId = "shusthota-mood-help";

  useEffect(() => { heading.current?.focus(); }, [step]);

  async function save() {
    if (!selected || saving || submitting.current || status?.kind === "success") return;
    submitting.current = true;
    setSaving(true);
    setStatus(null);
    try {
      await saveWellnessEntry({ mood: selected });
      setStatus({ kind: "success", message: t(copy.saved) });
      await onSaved?.();
    } catch (cause) {
      setStatus({ kind: "error", message: `${t(shusthotaErrorCopy(cause, "save"))} ${t(copy.keepSelection)}` });
    } finally { submitting.current = false; setSaving(false); }
  }

  const selectedOption = options.find(option => option.value === selected);
  return (
    <section id="shusthota-mood-preview" aria-labelledby="shusthota-mood-title" lang={language}>
      <AppCard className="grid gap-5 sm:p-6">
        <div className="grid gap-2">
          <h3 id="shusthota-mood-title" ref={heading} tabIndex={-1} className="text-xl font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:text-2xl">
            {t(step === "choose" ? copy.choose : copy.review)}
          </h3>
          <p className="pro-muted leading-relaxed">{t(copy.privacy)}</p>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.clinical)}</p>
          {status && <p role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "text-pro-danger" : "text-pro-success"}>{status.message}</p>}
        </div>
        {step === "choose" ? (
          <>
            <fieldset aria-describedby={hintId} className="grid gap-3">
              <legend className="mb-3 font-medium text-pro-text">{t(copy.help)}</legend>
              <p id={hintId} className="pro-muted leading-relaxed">{t(copy.instruction)}</p>
              {options.map(option => (
                <label key={option.value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 text-base text-pro-text focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
                  <input type="radio" name="shusthota-mood-choice" value={option.value} checked={selected === option.value} onChange={() => setSelected(option.value)} className="size-5 shrink-0 accent-pro-primary" />
                  <span>{t(option.label)}</span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap">
              <AppButton disabled={!selected} onClick={() => setStep("review")}>{t({ en: "Review this choice", bn: "এই বাছাইটি দেখে নিন" })}</AppButton>
              <AppButton variant="secondary" onClick={onClose}>{t(copy.skip)}</AppButton>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-field border border-pro-border bg-pro-surface p-4"><p className="text-sm font-medium text-pro-muted">{t({ en: "Selected mood", bn: "বাছাই করা মনের অবস্থা" })}</p><p className="text-lg font-semibold">{selectedOption ? t(selectedOption.label) : ""}</p></div>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap">
              <AppButton variant="secondary" onClick={() => { setStatus(null); setStep("choose"); }}>{t(copy.change)}</AppButton>
              <AppButton disabled={saving || status?.kind === "success"} onClick={() => void save()}>{saving ? t(copy.saving) : t(status?.kind === "success" ? copy.saved : copy.save)}</AppButton>
              <AppButton variant="ghost" onClick={onClose}>{t(copy.skip)}</AppButton>
            </div>
          </>
        )}
      </AppCard>
    </section>
  );
}
