"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { shusthotaErrorCopy, saveWellnessEntry } from "./api";

type Mood = "comfortable" | "mixed" | "difficult" | "prefer_not_to_say";
type Energy = "low" | "medium" | "high" | "prefer_not_to_say";

const moods: readonly { value: Mood; label: { en: string; bn: string } }[] = [
  { value: "comfortable", label: { en: "Comfortable", bn: "স্বস্তিতে" } },
  { value: "mixed", label: { en: "Mixed", bn: "মিশ্র" } },
  { value: "difficult", label: { en: "Difficult", bn: "কঠিন" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];

const energies: readonly { value: Energy; label: { en: string; bn: string } }[] = [
  { value: "high", label: { en: "High", bn: "বেশি" } },
  { value: "medium", label: { en: "Medium", bn: "মাঝারি" } },
  { value: "low", label: { en: "Low", bn: "কম" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];

const field = "min-h-11 w-full rounded-field border border-pro-control-border bg-pro-elevated px-3 py-2 text-base text-pro-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";

export function Wellbeing({ onSaved }: { onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const id = useId();
  const submitting = useRef(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [activityNote, setActivityNote] = useState("");
  const [restNote, setRestNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || saving) return;

    if (!mood && !energy && !activityNote.trim() && !restNote.trim()) {
      setStatus({
        kind: "error",
        message: t({ en: "Choose or write at least one optional item, or leave this form blank.", bn: "অন্তত একটি ঐচ্ছিক বিষয় বাছুন বা লিখুন, অথবা ফর্মটি ফাঁকা রাখুন।" }),
      });
      return;
    }

    submitting.current = true;
    setSaving(true);
    setStatus(null);
    try {
      await saveWellnessEntry({
        mood,
        energy,
        activityNote: activityNote.trim() || null,
        restNote: restNote.trim() || null,
      });
      setMood(null);
      setEnergy(null);
      setActivityNote("");
      setRestNote("");
      setStatus({
        kind: "success",
        message: t({ en: "The server confirmed this synthetic demo entry.", bn: "সার্ভার এই ডেমোর কৃত্রিম এন্ট্রিটি নিশ্চিত করেছে।" }),
      });
      await onSaved?.();
    } catch (error) {
      setStatus({ kind: "error", message: t(shusthotaErrorCopy(error, "save")) });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <AppCard className="grid gap-5 sm:p-6">
      <header className="grid gap-2">
        <p className="pro-eyebrow">{t({ en: "OPTIONAL COMBINED CHECK-IN", bn: "ঐচ্ছিক একসঙ্গে খোঁজখবর" })}</p>
        <h2 className="text-xl font-semibold sm:text-2xl">{t({ en: "Add more than one detail at once", bn: "একসঙ্গে একাধিক বিষয় যোগ করুন" })}</h2>
        <p className="pro-muted max-w-prose leading-relaxed">
          {t({ en: "This keeps the combined check-in from the Wellbeing page. Each field is optional; activity and rest are saved as notes.", bn: "Wellbeing পাতার একসঙ্গে খোঁজখবরের সুবিধাটি এখানে রাখা হয়েছে। প্রতিটি ঘর ঐচ্ছিক; কাজকর্ম ও বিশ্রাম নোট হিসেবে সংরক্ষিত হয়।" })}
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-5" lang={language}>
        <fieldset className="grid gap-2">
          <legend className="mb-1 font-semibold">{t({ en: "Mood (optional)", bn: "মনের অবস্থা (ঐচ্ছিক)" })}</legend>
          {moods.map(option => (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-field border border-pro-control-border px-3 py-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
              <input type="radio" name={`${id}-mood`} value={option.value} checked={mood === option.value} onChange={() => setMood(option.value)} className="size-5 shrink-0 accent-pro-primary" />
              <span>{t(option.label)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-1 font-semibold">{t({ en: "Energy (optional)", bn: "শক্তি (ঐচ্ছিক)" })}</legend>
          {energies.map(option => (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-field border border-pro-control-border px-3 py-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
              <input type="radio" name={`${id}-energy`} value={option.value} checked={energy === option.value} onChange={() => setEnergy(option.value)} className="size-5 shrink-0 accent-pro-primary" />
              <span>{t(option.label)}</span>
            </label>
          ))}
          <p className="pro-muted text-sm">{t({ en: "This records energy only; it is not a separate fatigue measurement.", bn: "এতে শুধু শক্তির মাত্রা নথিভুক্ত হয়; ক্লান্তির আলাদা পরিমাপ নয়।" })}</p>
        </fieldset>

        <label htmlFor={`${id}-activity`} className="grid gap-2">
          <span className="font-semibold">{t({ en: "Activity note (optional)", bn: "কাজকর্মের নোট (ঐচ্ছিক)" })}</span>
          <span id={`${id}-activity-hint`} className="pro-muted text-sm">{t({ en: "Free text only; this is not stored as a structured activity category.", bn: "শুধু সাধারণ লেখা; এটি নির্দিষ্ট কাজকর্মের ধরন হিসেবে সংরক্ষিত হয় না।" })}</span>
          <textarea id={`${id}-activity`} value={activityNote} onChange={event => setActivityNote(event.target.value)} maxLength={1000} rows={3} aria-describedby={`${id}-activity-hint`} className={`${field} resize-y`} />
          <span className="pro-muted text-sm">{activityNote.length}/1000</span>
        </label>

        <label htmlFor={`${id}-rest`} className="grid gap-2">
          <span className="font-semibold">{t({ en: "Rest note (optional)", bn: "বিশ্রামের নোট (ঐচ্ছিক)" })}</span>
          <span id={`${id}-rest-hint`} className="pro-muted text-sm">{t({ en: "Free text only; structured sleep tracking is not available.", bn: "শুধু সাধারণ লেখা; ঘুমের কাঠামোবদ্ধ হিসাব এখানে নেই।" })}</span>
          <textarea id={`${id}-rest`} value={restNote} onChange={event => setRestNote(event.target.value)} maxLength={1000} rows={3} aria-describedby={`${id}-rest-hint`} className={`${field} resize-y`} />
          <span className="pro-muted text-sm">{restNote.length}/1000</span>
        </label>

        <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <AppButton type="submit" disabled={saving}>{saving ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }) : t({ en: "Save combined check-in", bn: "একসঙ্গে খোঁজখবর সংরক্ষণ করুন" })}</AppButton>
          <p className="pro-muted text-sm">{t({ en: "You can also use the separate optional check-ins below.", bn: "নিচে আলাদা ঐচ্ছিক খোঁজখবরও ব্যবহার করতে পারেন।" })}</p>
        </div>
        {status && <p role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "text-pro-danger" : "text-pro-success"}>{status.message}</p>}
      </form>
    </AppCard>
  );
}
