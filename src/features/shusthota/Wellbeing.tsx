"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Armchair, Check, CircleOff, Footprints, HandHelping, Leaf, MoonStar, RotateCcw, Sparkles, Star, type LucideIcon } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { saveWellnessEntry, shusthotaErrorCopy } from "./api";
import styles from "./ShusthotaOverview.module.css";

type Mood = "comfortable" | "mixed" | "difficult" | "prefer_not_to_say";
type Energy = "low" | "medium" | "high" | "prefer_not_to_say";
type Activity = "walking" | "assisted" | "seated" | "resting" | "other" | "none";
type Choice = { value: string; label: { en: string; bn: string }; Icon?: LucideIcon };

const moods: readonly Choice[] = [
  { value: "comfortable", label: { en: "Comfortable", bn: "স্বস্তিতে" } },
  { value: "mixed", label: { en: "Mixed", bn: "মিশ্র" } },
  { value: "difficult", label: { en: "Difficult", bn: "কঠিন" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];
const energies: readonly Choice[] = [
  { value: "low", label: { en: "Low", bn: "কম" }, Icon: MoonStar },
  { value: "medium", label: { en: "Medium", bn: "মাঝারি" }, Icon: Leaf },
  { value: "high", label: { en: "High", bn: "বেশি" }, Icon: Sparkles },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" }, Icon: Star },
];
const activities: readonly { value: Activity; label: Choice["label"] }[] = [
  { value: "walking", label: { en: "Walking", bn: "হাঁটা" } },
  { value: "assisted", label: { en: "Assisted activity", bn: "সহায়তা নিয়ে কাজকর্ম" } },
  { value: "seated", label: { en: "Seated or wheelchair-friendly activity", bn: "বসে বা হুইলচেয়ার ব্যবহার করে করা যায় এমন কাজ" } },
  { value: "resting", label: { en: "Resting", bn: "বিশ্রাম" } },
  { value: "other", label: { en: "Other", bn: "অন্য কিছু" } },
  { value: "none", label: { en: "None", bn: "কোনোটিই নয়" } },
];

const copy = {
  kicker: { en: "A moment for you", bn: "নিজের জন্য একটু সময়" },
  title: { en: "Today, as you are", bn: "আজ আপনি যেমন আছেন" },
  intro: { en: "Share as much or as little as feels right. Every part is optional.", bn: "যতটুকু স্বচ্ছন্দ বোধ করেন, ততটুকুই জানান। প্রতিটি অংশ ঐচ্ছিক।" },
  mood: { en: "How are you feeling?", bn: "আপনার কেমন লাগছে?" },
  moodHint: { en: "There is no right answer.", bn: "এখানে সঠিক বা ভুল কোনো উত্তর নেই।" },
  energy: { en: "How is your energy?", bn: "আপনার শক্তির মাত্রা কেমন?" },
  energyHint: { en: "Your own sense of energy; this is not a separate fatigue measure.", bn: "আপনার নিজের অনুভব করা শক্তির মাত্রা; এটি আলাদা ক্লান্তির মাপ নয়।" },
  activity: { en: "Anything you would like to note about activity?", bn: "কাজকর্ম নিয়ে কিছু নোট করতে চান?" },
  activityHint: { en: "Choose one, if you like. Each is a personal choice, not a performance measure. Saved as a free-text activityNote.", bn: "ইচ্ছা হলে একটি বেছে নিন। প্রতিটি ব্যক্তিগত পছন্দ, কাজের মাপকাঠি নয়। এটি সাধারণ activityNote হিসেবে সংরক্ষিত হবে।" },
  rest: { en: "A note about rest", bn: "বিশ্রাম নিয়ে একটি নোট" },
  restHint: { en: "Optional, up to 1,000 characters. This is a note, not structured sleep tracking.", bn: "ঐচ্ছিক, সর্বোচ্চ ১,০০০ অক্ষর। এটি নোট, ঘুমের কাঠামোবদ্ধ হিসাব নয়।" },
  placeholder: { en: "Anything you’d like to remember…", bn: "মনে রাখতে চান এমন কিছু লিখুন…" },
  save: { en: "Save today’s check-in", bn: "আজকের খোঁজখবর সংরক্ষণ করুন" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  saved: { en: "The server confirmed this synthetic test entry.", bn: "সার্ভার এই কৃত্রিম পরীক্ষামূলক এন্ট্রিটি নিশ্চিত করেছে।" },
  reset: { en: "Clear answers", bn: "উত্তর মুছে দিন" },
  savedLock: { en: "This check-in is confirmed. Clear the answers to start another entry.", bn: "এই খোঁজখবর সংরক্ষণ নিশ্চিত হয়েছে। নতুন এন্ট্রি শুরু করতে উত্তর মুছে দিন।" },
  empty: { en: "Choose or write at least one item to save, or leave this check-in blank.", bn: "সংরক্ষণ করতে অন্তত একটি বিষয় বাছুন বা লিখুন, অথবা খোঁজখবরটি ফাঁকা রাখুন।" },
  moodComfortable: { en: "If you like, notice one small thing you appreciate right now.", bn: "ইচ্ছা হলে, এই মুহূর্তে ভালো লাগা ছোট্ট একটি বিষয় খেয়াল করুন।" },
  moodMixed: { en: "More than one feeling can be here at once.", bn: "একই সঙ্গে একাধিক অনুভূতি থাকা স্বাভাবিক।" },
  moodDifficult: { en: "You do not have to solve everything right now. If it feels helpful, you could talk with someone you trust.", bn: "এখনই সবকিছুর সমাধান করতে হবে না। ভালো মনে হলে, বিশ্বাসের কারও সঙ্গে কথা বলতে পারেন।" },
  moodSupport: { en: "Would a little pause feel welcome?", bn: "একটু বিরতি কি আপনার ভালো লাগবে?" },
  pauseOpen: { en: "Take a little pause", bn: "একটু বিরতি নিন" },
  pauseClose: { en: "Close this pause", bn: "বিরতিটি বন্ধ করুন" },
  pauseCopy: { en: "Let your breathing stay natural and comfortable. There is nothing to count or hold. Stop whenever you like.", bn: "শ্বাস-প্রশ্বাস স্বাভাবিক ও স্বচ্ছন্দ থাকতে দিন। গোনার বা ধরে রাখার কিছু নেই। ইচ্ছা হলেই থামুন।" },
  pauseLabel: { en: "A quiet moment", bn: "একটু শান্ত মুহূর্ত" },
  restAccent: { en: "Rest, in your own words", bn: "নিজের কথায় বিশ্রাম" },
} as const;

const field = "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 text-base leading-relaxed text-pro-text placeholder:text-pro-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";

function MoodCharacter({ mood, selected }: { mood: Mood; selected: boolean }) {
  return <span className={`${styles.moodCharacter} ${selected ? styles.characterSelected : ""}`} aria-hidden="true">
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.moodSvg}>
      {mood === "comfortable" && <>
        <g className={styles.sunRays} stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"><path d="M32 4v5M32 55v5M4 32h5M55 32h5M12.2 12.2l3.6 3.6M48.2 48.2l3.6 3.6M51.8 12.2l-3.6 3.6M15.8 48.2l-3.6 3.6" /></g>
        <circle cx="32" cy="32" r="19" className={styles.sunFace} stroke="currentColor" strokeWidth="2.2" />
        <path d="M25 31h.1M39 31h.1M27 38c1.4 1.8 3 2.7 5 2.7s3.6-.9 5-2.7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        <path className={styles.tinySparkle} d="M51 11v7M47.5 14.5h7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </>}
      {mood === "mixed" && <>
        <circle cx="39" cy="24" r="13" className={styles.sunFace} stroke="currentColor" strokeWidth="2" />
        <path d="M16 45.5h31a8 8 0 0 0 0-16 11.5 11.5 0 0 0-22-2.5A9.5 9.5 0 0 0 16 45.5Z" className={styles.cloudFace} stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
        <path d="M27 37h.1M39 37h.1M29 41c1 .7 2 .9 3 .7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      </>}
      {mood === "difficult" && <>
        <path d="M13 43a8 8 0 0 1 5-14.6 12 12 0 0 1 22-2.3A9 9 0 1 1 45 43H13Z" className={styles.cloudFace} stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
        <path d="M25 36h.1M38 36h.1M28 41c1.2.8 2.3 1.1 3.5 1" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        <path d="M48 46c0-2 1.5-3.5 3.3-3.5 1.2 0 2.2.7 2.7 1.7.5-1 1.5-1.7 2.7-1.7 1.8 0 3.3 1.5 3.3 3.5 0 2.7-3.3 4.8-6 6.7-2.7-1.9-6-4-6-6.7Z" className={styles.heart} />
      </>}
      {mood === "prefer_not_to_say" && <>
        <path d="M39.5 11.5a21 21 0 1 0 13 36.7A20 20 0 0 1 39.5 11.5Z" className={styles.moonFace} stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
        <path d="M45 13v8M41 17h8M21 21v5M18.5 23.5h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </>}
    </svg>
  </span>;
}

export function Wellbeing({ onSaved }: { onSaved?: () => Promise<void> | void }) {
  const { language, t } = useLanguage();
  const id = useId();
  const submitting = useRef(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [restNote, setRestNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);

  const hasAnswers = Boolean(mood || energy || activity || restNote.trim());
  const clear = () => {
    setMood(null);
    setEnergy(null);
    setActivity(null);
    setRestNote("");
    setSaved(false);
    setStatus(null);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasAnswers || saving || submitting.current || saved) return;
    submitting.current = true;
    setSaving(true);
    setStatus(null);
    const selectedActivity = activities.find(option => option.value === activity);
    try {
      await saveWellnessEntry({
        mood,
        energy,
        activityNote: selectedActivity ? `${selectedActivity.label.en} (${selectedActivity.label.bn})` : null,
        restNote: restNote.trim() || null,
      });
      setSaved(true);
      setStatus({ kind: "success", message: t(copy.saved) });
      await onSaved?.();
    } catch (error) {
      setStatus({ kind: "error", message: t(shusthotaErrorCopy(error, "save")) });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  function options(name: string, values: readonly Choice[], selected: string | null, onChange: (value: string) => void) {
    return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{values.map(option => {
      const checked = selected === option.value;
      const Icon = option.Icon;
      return <label key={option.value} className={`${styles.choiceCard} group flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-3 py-2 text-base transition-[background-color,border-color,box-shadow,transform] duration-[var(--pro-duration-fast)] hover:-translate-y-0.5 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus motion-reduce:transform-none motion-reduce:transition-none ${checked ? "border-pro-primary bg-pro-surface shadow-pro-1" : "border-pro-control-border bg-pro-elevated hover:bg-pro-surface"}`}>
        <input type="radio" name={`${id}-${name}`} value={option.value} checked={checked} onChange={() => { onChange(option.value); setStatus(null); setSaved(false); }} className="size-5 shrink-0 accent-pro-primary" />
        {Icon && <span className={`${styles.choiceIcon} grid size-9 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-primary transition-transform duration-[var(--pro-duration-fast)] group-hover:rotate-3 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none`}><Icon className="size-4" aria-hidden="true" /></span>}
        <span className="min-w-0 leading-relaxed">{t(option.label)}</span>
        {checked && <Check className={`${styles.selectedMark} ms-auto size-4 shrink-0 text-pro-primary`} aria-hidden="true" />}
      </label>;
    })}</div>;
  }

  return (
    <section aria-labelledby={`${id}-title`} lang={language} className="rounded-hero border border-pro-border bg-pro-elevated p-4 shadow-pro-1 sm:p-6 lg:p-8">
      <header className="mb-7 grid gap-2 border-b border-pro-border pb-5 sm:mb-8 sm:pb-6">
        <p className="pro-eyebrow">{t(copy.kicker)}</p>
        <h2 id={`${id}-title`} className="pro-display text-2xl leading-tight sm:text-3xl">{t(copy.title)}</h2>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.intro)}</p>
      </header>
      <form onSubmit={submit} className="grid gap-7 sm:gap-8">
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-lg font-semibold">{t(copy.mood)}</legend>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.moodHint)}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {moods.map(option => {
              const value = option.value as Mood;
              const checked = mood === value;
              return <label key={value} className={`${styles.moodOption} ${checked ? styles.moodSelected : ""} group relative flex min-h-28 cursor-pointer items-center gap-3 overflow-hidden rounded-hero border p-3 transition-[background-color,border-color,box-shadow,transform] duration-[var(--pro-duration-normal)] hover:-translate-y-0.5 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus motion-reduce:transform-none motion-reduce:transition-none sm:min-h-32 sm:gap-4 sm:p-4`}>
                <input type="radio" name={`${id}-mood`} value={value} checked={checked} onChange={() => { setMood(value); setPauseOpen(false); setStatus(null); setSaved(false); }} className="size-5 shrink-0 accent-pro-primary" />
                <MoodCharacter mood={value} selected={checked} />
                <span className="min-w-0 flex-1 font-semibold leading-relaxed">{t(option.label)}</span>
                {checked && <Check className={`${styles.selectedMark} absolute end-3 top-3 size-4 text-pro-primary`} aria-hidden="true" />}
              </label>;
            })}
          </div>
          {mood && mood !== "prefer_not_to_say" && <div className={`${styles.supportMoment} grid gap-3 rounded-control border border-pro-border bg-pro-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center`}>
            <div className="grid gap-1"><p className="font-medium">{t(mood === "comfortable" ? copy.moodComfortable : mood === "mixed" ? copy.moodMixed : copy.moodDifficult)}</p><p className="pro-muted text-sm leading-relaxed">{t(copy.moodSupport)}</p></div>
            <AppButton type="button" variant="secondary" aria-expanded={pauseOpen} aria-controls={`${id}-pause`} onClick={() => setPauseOpen(value => !value)} className="min-h-11 whitespace-normal">{t(pauseOpen ? copy.pauseClose : copy.pauseOpen)}</AppButton>
            {pauseOpen && <div id={`${id}-pause`} role="region" aria-label={t(copy.pauseLabel)} className={`${styles.pauseMoment} col-span-full grid justify-items-center gap-3 border-t border-pro-border pt-4 text-center`}>
              <span className={styles.breathingOrb} aria-hidden="true"><span /></span>
              <p className="pro-muted max-w-md text-sm leading-relaxed">{t(copy.pauseCopy)}</p>
            </div>}
          </div>}
        </fieldset>
        <fieldset className="grid gap-3 border-t border-pro-border pt-6">
          <legend className="mb-1 text-lg font-semibold">{t(copy.energy)}</legend>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.energyHint)}</p>
          {options("energy", energies, energy, value => setEnergy(value as Energy))}
        </fieldset>
        <fieldset className="grid gap-3 border-t border-pro-border pt-6">
          <legend className="mb-1 text-lg font-semibold">{t(copy.activity)}</legend>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.activityHint)}</p>
          {options("activity", activities.map(option => ({ ...option, Icon: ({ walking: Footprints, assisted: HandHelping, seated: Armchair, resting: MoonStar, other: Sparkles, none: CircleOff } as const)[option.value] })), activity, value => setActivity(value as Activity))}
        </fieldset>
        <div className={`${styles.restSection} grid gap-3 border-t border-pro-border pt-6`}>
          <p className="flex items-center gap-2 text-sm font-medium text-pro-primary"><MoonStar size={17} aria-hidden="true" className={styles.restIcon} />{t(copy.restAccent)}</p>
          <label htmlFor={`${id}-rest`} className="text-lg font-semibold">{t(copy.rest)}</label>
          <p id={`${id}-rest-help`} className="pro-muted text-sm leading-relaxed">{t(copy.restHint)}</p>
          <textarea id={`${id}-rest`} value={restNote} onChange={event => { setRestNote(event.target.value); setStatus(null); setSaved(false); }} maxLength={1000} rows={4} aria-describedby={`${id}-rest-help ${id}-rest-count`} className={`${field} min-h-28 resize-y`} placeholder={t(copy.placeholder)} />
          <p id={`${id}-rest-count`} className="pro-muted text-sm tabular-nums">{restNote.length}/1000</p>
        </div>
        {status && <p role={status.kind === "error" ? "alert" : "status"} aria-live={status.kind === "error" ? "assertive" : "polite"} className={`${status.kind === "error" ? "rounded-control border border-pro-danger bg-pro-danger-soft p-3 text-pro-danger" : `rounded-control border border-pro-success bg-pro-success-soft p-3 text-pro-success ${styles.saveConfirmed}`}`}>{status.message}{status.kind === "success" && <Sparkles size={17} aria-hidden="true" className="ms-2 inline-block" />}</p>}
        <div className="grid gap-3 border-t border-pro-border pt-5 sm:flex sm:flex-wrap sm:items-center">
          <AppButton type="submit" disabled={!hasAnswers || saving || saved} className="min-h-12 w-full whitespace-normal sm:w-auto">{saving ? t(copy.saving) : t(copy.save)}</AppButton>
          <AppButton type="button" variant="secondary" onClick={clear} disabled={saving || (!hasAnswers && !saved)} className="min-h-12 w-full whitespace-normal sm:w-auto"><RotateCcw size={16} aria-hidden="true" className="me-2" />{t(copy.reset)}</AppButton>
          <p className="pro-muted text-sm leading-relaxed sm:max-w-xs">{saved ? t(copy.savedLock) : t(copy.empty)}</p>
        </div>
      </form>
    </section>
  );
}
