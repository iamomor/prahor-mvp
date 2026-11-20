"use client";

import { useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import type { WellnessEntry } from "@/lib/contracts/wellness";
import { ReadAloudButton } from "@/features/adapt";
import { saveWellnessEntry, shusthotaErrorCopy } from "./api";

type EnergyValue = NonNullable<WellnessEntry["energy"]>;
type EnergyOption = {
  value: EnergyValue;
  label: { en: string; bn: string };
};

const energyOptions: readonly EnergyOption[] = [
  { value: "low", label: { en: "Low energy", bn: "শক্তি কম" } },
  { value: "medium", label: { en: "Some energy", bn: "মাঝারি শক্তি" } },
  { value: "high", label: { en: "High energy", bn: "শক্তি বেশি" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];

const symbols: Record<string, string> = { low: "🪫", medium: "🔋", high: "☀️", prefer_not_to_say: "🔒" };
const copy = {
  chooseTitle: { en: "How is your energy right now?", bn: "এই মুহূর্তে আপনার শক্তির মাত্রা কেমন?" },
  chooseHelp: { en: "Choose one option if you like.", bn: "ইচ্ছা হলে একটি বেছে নিন।" },
  chooseInstruction: {
    en: "This check-in is optional, and there is no right answer.",
    bn: "এই খোঁজখবর ঐচ্ছিক—এখানে কোনো সঠিক বা ভুল উত্তর নেই।",
  },
  previewNote: {
    en: "Review your choice before adding it to this synthetic demo.",
    bn: "এই কৃত্রিম ডেমোতে যোগ করার আগে আপনার বাছাইটি দেখে নিন।",
  },
  clinicalNote: {
    en: "This is your own description of energy, not a health assessment or medical advice.",
    bn: "এটি শক্তি সম্পর্কে আপনার নিজের অনুভূতি—স্বাস্থ্য মূল্যায়ন বা চিকিৎসা পরামর্শ নয়।",
  },
  fatigueNote: {
    en: "A separate fatigue check-in is not supported yet; this preview covers energy only.",
    bn: "আলাদা ক্লান্তির খোঁজখবর এখনো সমর্থিত নয়; এই প্রিভিউতে শুধু শক্তির মাত্রা আছে।",
  },
  skip: { en: "Skip and return to overview", bn: "এড়িয়ে সারসংক্ষেপে ফিরুন" },
  previewChoice: { en: "Preview this choice", bn: "এই বাছাইটি প্রিভিউ করুন" },
  previewTitle: { en: "Your selection preview", bn: "আপনার বাছাইয়ের প্রিভিউ" },
  change: { en: "Change energy selection", bn: "শক্তির মাত্রার বাছাই বদলান" },
  selectedLabel: { en: "Selected energy level", bn: "বাছাই করা শক্তির মাত্রা" },
  saved: { en: "Demo entry confirmed by the server.", bn: "সার্ভার ডেমো এন্ট্রিটি নিশ্চিত করেছে।" },
  keepSelection: { en: "Your selection is still here. Check history before retrying if the save was not confirmed.", bn: "আপনার বাছাই এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
} as const;

export function EnergyCheckIn({ onClose, onSaved }: { onClose: () => void; onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyValue | null>(null);
  const [step, setStep] = useState<"choose" | "preview">("choose");
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const hintId = "shusthota-energy-help";

  useEffect(() => {
    stepHeading.current?.focus();
  }, [step]);

  const selectedOption = energyOptions.find(option => option.value === selectedEnergy);

  async function saveEnergy() {
    if (!selectedEnergy || saving || submitting.current || status?.kind === "success") return;
    submitting.current = true;
    setSaving(true);
    setStatus(null);
    try {
      await saveWellnessEntry({ energy: selectedEnergy });
      setStatus({
        kind: "success",
        message: t(copy.saved),
      });
      await onSaved?.();
    } catch (cause) {
      setStatus({
        kind: "error",
        message: `${t(shusthotaErrorCopy(cause, "save"))} ${t(copy.keepSelection)}`,
      });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <section id="shusthota-energy-preview" aria-labelledby="shusthota-energy-title" lang={language}>
      <AppCard className="grid gap-5 sm:p-6">
        <div className="grid gap-2">
          <h3
            id="shusthota-energy-title"
            ref={stepHeading}
            tabIndex={-1}
            className="text-xl font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:text-2xl"
          >
            {t(step === "choose" ? copy.chooseTitle : copy.previewTitle)}
          </h3>
          <p className="pro-muted leading-relaxed">
            {t(step === "choose"
              ? {
                en: "This check-in is optional. Your answer is saved only when you choose Save.",
                bn: "এই খোঁজখবর ঐচ্ছিক। আপনি সংরক্ষণ বাছলেই শুধু আপনার উত্তর রাখা হবে।",
              }
              : copy.previewNote)}
          </p>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.clinicalNote)}</p>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.fatigueNote)}</p>
          {status && (
            <p role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "text-pro-danger" : "text-pro-success"}>
              {status.message}
            </p>
          )}
        </div>

        {step === "choose" ? (
          <>
            <fieldset aria-describedby={hintId} className="grid gap-3">
              <legend className="mb-3 font-medium text-pro-text">{t(copy.chooseHelp)}</legend>
              <p id={hintId} className="pro-muted leading-relaxed">{t(copy.chooseInstruction)}</p>
              {energyOptions.map(option => (
                <label
                  key={option.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 text-base text-pro-text focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"
                >
                  <input
                    type="radio"
                    name="shusthota-energy-preview-choice"
                    value={option.value}
                    checked={selectedEnergy === option.value}
                    onChange={() => setSelectedEnergy(option.value)}
                    className="size-5 shrink-0 accent-pro-primary"
                  />
                  <span aria-hidden="true" className="text-2xl">{symbols[option.value]}</span><span>{t(option.label)}</span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap">
              <AppButton
                disabled={!selectedEnergy}
                className="whitespace-normal text-center"
                onClick={() => setStep("preview")}
              >
                {t(copy.previewChoice)}
              </AppButton>
              <AppButton variant="secondary" className="whitespace-normal text-center" onClick={onClose}>
                {t(copy.skip)}
              </AppButton>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-2 rounded-field border border-pro-border bg-pro-surface p-4">
              <p className="text-sm font-medium text-pro-muted">{t(copy.selectedLabel)}</p>
              <p className="text-lg font-semibold text-pro-text">{selectedOption ? t(selectedOption.label) : ""}</p>
              {selectedOption && <ReadAloudButton text={t(selectedOption.label)} language={language === "en" ? "en" : "bn"} />}
              <p className="pro-muted text-sm">{t(copy.previewNote)}</p>
            </div>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap">
              <AppButton variant="secondary" className="whitespace-normal text-center" onClick={() => { setStatus(null); setStep("choose"); }}>
                {t(copy.change)}
              </AppButton>
              <AppButton variant="ghost" className="whitespace-normal text-center" onClick={saveEnergy} disabled={saving || status?.kind === "success"}>
                {saving ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }) : t(status?.kind === "success" ? copy.saved : { en: "Save check-in", bn: "খোঁজখবর সংরক্ষণ করুন" })}
              </AppButton>
              <AppButton variant="secondary" className="whitespace-normal text-center" onClick={onClose}>
                {t(copy.skip)}
              </AppButton>
            </div>
          </>
        )}
      </AppCard>
    </section>
  );
}
