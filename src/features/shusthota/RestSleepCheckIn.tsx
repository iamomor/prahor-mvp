"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { AACComposer, HeldAacText, mergeAacText, ReadAloudButton, VoiceDictationButton } from "@/features/adapt";
import { saveWellnessEntry, shusthotaErrorCopy } from "./api";

const copy = {
  title: { en: "Would you like to note anything about rest or sleep?", bn: "বিশ্রাম বা ঘুম নিয়ে কিছু নোট করতে চান?" },
  help: { en: "A short note is optional. Share only what feels comfortable.", bn: "ছোট্ট একটি নোট ঐচ্ছিক। যতটুকু স্বচ্ছন্দ বোধ করেন, ততটুকুই লিখুন।" },
  label: { en: "Your rest note", bn: "আপনার বিশ্রামের নোট" },
  placeholder: { en: "For example, how rest or sleep felt for you…", bn: "যেমন, বিশ্রাম বা ঘুম আপনার কাছে কেমন লেগেছে…" },
  contract: { en: "Only a voluntary rest note is supported. Sleep duration and quality measurements are not collected.", bn: "শুধু আপনার ইচ্ছায় লেখা বিশ্রামের নোট সমর্থিত। ঘুমের সময়কাল বা মানের মাপ নেওয়া হয় না।" },
  save: { en: "Save rest note", bn: "বিশ্রামের নোট সংরক্ষণ করুন" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  change: { en: "Change note", bn: "নোট বদলান" },
  skip: { en: "Skip and return to overview", bn: "এড়িয়ে সারসংক্ষেপে ফিরুন" },
  saved: { en: "Demo entry confirmed by the server.", bn: "সার্ভার ডেমো এন্ট্রিটি নিশ্চিত করেছে।" },
  keepNote: { en: "Your note is still here. Check history before retrying if the save was not confirmed.", bn: "আপনার নোট এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
} as const;

export function RestSleepCheckIn({ onClose, onSaved }: { onClose: () => void; onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const [note, setNote] = useState("");
  const [heldAac, setHeldAac] = useState("");
  const [step, setStep] = useState<"write" | "review">("write");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const id = useId();
  const hintId = `${id}-hint`;
  useEffect(() => { heading.current?.focus(); }, [step]);

  async function save() {
    const value = note.trim();
    if (!value || saving || submitting.current || status?.kind === "success") return;
    submitting.current = true;
    setSaving(true); setStatus(null);
    try {
      await saveWellnessEntry({ restNote: value });
      setStatus({ kind: "success", message: t(copy.saved) });
      await onSaved?.();
    } catch (cause) {
      setStatus({ kind: "error", message: `${t(shusthotaErrorCopy(cause, "save"))} ${t(copy.keepNote)}` });
    } finally { submitting.current = false; setSaving(false); }
  }

  return (
    <section id="shusthota-rest-sleep-preview" aria-labelledby="shusthota-rest-sleep-title" lang={language}>
      <AppCard className="grid gap-5 sm:p-6">
        <div className="grid gap-2">
          <h3 id="shusthota-rest-sleep-title" ref={heading} tabIndex={-1} className="text-xl font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:text-2xl">{t(step === "write" ? copy.title : { en: "Review your rest note", bn: "আপনার বিশ্রামের নোট দেখে নিন" })}</h3>
          <p className="pro-muted leading-relaxed">{t(copy.contract)}</p>
          {status && <p role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "text-pro-danger" : "text-pro-success"}>{status.message}</p>}
        </div>
        {step === "write" ? (
          <>
            <label htmlFor={`${id}-note`} className="grid gap-2"><span className="font-medium">{t(copy.label)}</span><span id={hintId} className="pro-muted leading-relaxed">{t(copy.help)}</span><textarea id={`${id}-note`} value={note} onChange={event => setNote(event.target.value)} maxLength={1000} rows={3} aria-describedby={hintId} placeholder={t(copy.placeholder)} className="min-h-28 w-full resize-y rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 text-base leading-relaxed text-pro-text placeholder:text-pro-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus" /><span className="pro-muted text-sm">{note.length}/1000</span></label>
            <VoiceDictationButton language={language === "en" ? "en" : "bn"} value={note} maxLength={1000} onChange={setNote} />
            <AACComposer initialLanguage={language === "en" ? "en" : "bn"} targetLabel={t({ en: "Add to rest note", bn: "বিশ্রামের নোটে যোগ করুন" })} onInsert={phrase => {
              const next = mergeAacText(note, phrase);
              if (next.length <= 1000) { setNote(next); setHeldAac(""); } else setHeldAac(phrase);
            }} />
            {heldAac && <HeldAacText text={heldAac} value={note} maxLength={1000} lang={language === "en" ? "en" : "bn"} onDismiss={() => setHeldAac("")} onAdd={next => { setNote(next); setHeldAac(""); }} />}
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap"><AppButton disabled={!note.trim()} onClick={() => setStep("review")}>{t({ en: "Review note", bn: "নোট দেখে নিন" })}</AppButton><AppButton variant="secondary" onClick={onClose}>{t(copy.skip)}</AppButton></div>
          </>
        ) : (
          <>
            <div className="rounded-field border border-pro-border bg-pro-surface p-4"><p className="text-sm font-medium text-pro-muted">{t(copy.label)}</p><p className="whitespace-pre-wrap break-words leading-relaxed">{note}</p><ReadAloudButton text={note} language={language === "en" ? "en" : "bn"} /></div>
            <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap"><AppButton variant="secondary" onClick={() => { setStatus(null); setStep("write"); }}>{t(copy.change)}</AppButton><AppButton disabled={saving || status?.kind === "success"} onClick={() => void save()}>{saving ? t(copy.saving) : t(status?.kind === "success" ? copy.saved : copy.save)}</AppButton><AppButton variant="ghost" onClick={onClose}>{t(copy.skip)}</AppButton></div>
          </>
        )}
      </AppCard>
    </section>
  );
}
