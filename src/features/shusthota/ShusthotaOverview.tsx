"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { BookHeart, Footprints, Heart, MoonStar, Zap } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { loadWellnessEntries, shusthotaErrorCopy, type WellnessHistoryEntry } from "./api";
import { ActivityCheckIn } from "./ActivityCheckIn";
import { EnergyCheckIn } from "./EnergyCheckIn";
import { MoodCheckIn } from "./MoodCheckIn";
import { PrivateDiary } from "./PrivateDiary";
import { RestSleepCheckIn } from "./RestSleepCheckIn";
import { Wellbeing as CombinedWellnessCheckIn } from "./Wellbeing";

type CheckIn = "mood" | "energy" | "activity" | "restSleep" | "diary";

const disclosure = {
  label: { en: "Limited · synthetic demo", bn: "সীমিত · কৃত্রিম ডেমো" },
  title: { en: "Demo data and privacy limits", bn: "ডেমোর তথ্য ও গোপনীয়তার সীমা" },
  synthetic: {
    en: "This workspace stores synthetic demo records only. Do not enter real maternal health information or personal diary text.",
    bn: "এই কর্মক্ষেত্রে শুধু ডেমোর কৃত্রিম রেকর্ড রাখা হয়। মায়ের বাস্তব স্বাস্থ্যতথ্য বা ব্যক্তিগত ডায়েরির লেখা দেবেন না।",
  },
  history: {
    en: "Entries are append-only and cannot be edited or deleted. History shows up to the 100 newest entries; there is no pagination.",
    bn: "এন্ট্রি শুধু যোগ করা যায়; সম্পাদনা বা মুছে ফেলা যায় না। ইতিহাসে সর্বশেষ ১০০টি পর্যন্ত এন্ট্রি দেখা যায়; পৃষ্ঠা ভাগের সুবিধা নেই।",
  },
  fields: {
    en: "Energy records energy, not a separate fatigue measure. Activity is saved as free-text activityNote, not a structured category. Rest is saved as restNote, not structured sleep tracking.",
    bn: "এখানে শক্তির মাত্রা নথিভুক্ত হয়, আলাদা ক্লান্তির মাপ নয়। কাজকর্ম activityNote-এ সাধারণ লেখা হিসেবে থাকে, নির্দিষ্ট ধরন হিসেবে নয়। বিশ্রাম restNote-এ থাকে, ঘুমের কাঠামোবদ্ধ হিসাব হিসেবে নয়।",
  },
  sharing: {
    en: "Diary entries are owner-only and are never sent to Barta or AI or shared with providers. Wellness records may be shared through Bondhon only after you select records and fields and give explicit consent.",
    bn: "ডায়েরির লেখা শুধু মালিক দেখতে পারেন; তা বার্তা বা এআই-তে পাঠানো হয় না বা সেবাদাতার সঙ্গে শেয়ার হয় না। বন্ধনে রেকর্ড ও তথ্য বেছে নিয়ে স্পষ্ট সম্মতি দিলেই শুধু সুস্থতার রেকর্ড শেয়ার হতে পারে।",
  },
} as const;

const copy = {
  eyebrow: { en: "Module 06 · Optional well-being", bn: "মডিউল ০৬ · ঐচ্ছিক সুস্থতা" },
  intro: {
    en: "Make space for how your day feels, at your own pace. Each check-in is optional, and you can skip it.",
    bn: "নিজের গতিতে দিনের অনুভূতির জন্য একটু জায়গা রাখুন। প্রতিটি খোঁজখবর ঐচ্ছিক; চাইলে এড়িয়ে যেতে পারেন।",
  },
  overviewTitle: { en: "Your wellness overview", bn: "আপনার সুস্থতার সারসংক্ষেপ" },
  historyTitle: { en: "Recent wellness entries", bn: "সাম্প্রতিক সুস্থতার এন্ট্রি" },
  emptyTitle: { en: "No wellness entries yet", bn: "এখনো কোনো সুস্থতার এন্ট্রি নেই" },
  emptyDescription: { en: "Optional check-ins you save will appear here.", bn: "আপনি ঐচ্ছিক খোঁজখবর সংরক্ষণ করলে এখানে দেখা যাবে।" },
  loading: { en: "Loading wellness history…", bn: "সুস্থতার ইতিহাস আনা হচ্ছে…" },
  retry: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  combinedTitle: { en: "One combined check-in", bn: "একসঙ্গে খোঁজখবর" },
  areasTitle: { en: "Optional check-ins", bn: "ঐচ্ছিক খোঁজখবর" },
  openMood: { en: "Open mood check-in", bn: "মনের অবস্থার খোঁজখবর খুলুন" },
  closeMood: { en: "Close mood check-in", bn: "মনের অবস্থার খোঁজখবর বন্ধ করুন" },
  openEnergy: { en: "Open energy check-in", bn: "শক্তির খোঁজখবর খুলুন" },
  closeEnergy: { en: "Close energy check-in", bn: "শক্তির খোঁজখবর বন্ধ করুন" },
  openActivity: { en: "Open activity check-in", bn: "কাজকর্মের খোঁজখবর খুলুন" },
  closeActivity: { en: "Close activity check-in", bn: "কাজকর্মের খোঁজখবর বন্ধ করুন" },
  openRestSleep: { en: "Open rest note", bn: "বিশ্রামের নোট খুলুন" },
  closeRestSleep: { en: "Close rest note", bn: "বিশ্রামের নোট বন্ধ করুন" },
  openDiary: { en: "Open private diary", bn: "ব্যক্তিগত ডায়েরি খুলুন" },
  closeDiary: { en: "Close private diary", bn: "ব্যক্তিগত ডায়েরি বন্ধ করুন" },
  mood: { en: "Mood", bn: "মনের অবস্থা" },
  comfortable: { en: "Comfortable", bn: "স্বস্তিতে" },
  mixed: { en: "Mixed", bn: "মিশ্র" },
  difficult: { en: "Difficult", bn: "কঠিন" },
  preferNotToSay: { en: "Prefer not to say", bn: "বলতে চাই না" },
  energy: { en: "Energy", bn: "শক্তি" },
  low: { en: "Low", bn: "কম" },
  medium: { en: "Medium", bn: "মাঝারি" },
  high: { en: "High", bn: "বেশি" },
  activityNote: { en: "Activity note", bn: "কাজকর্মের নোট" },
  restNote: { en: "Rest note", bn: "বিশ্রামের নোট" },
  bartaTitle: { en: "Have a question about everyday care?", bn: "দৈনন্দিন যত্ন নিয়ে কোনো প্রশ্ন আছে?" },
  bartaCopy: {
    en: "Barta receives only the question you choose to send. Shusthota records are not automatically included.",
    bn: "আপনি যে প্রশ্ন পাঠাতে বাছেন, বার্তা শুধু সেটিই পায়। সুস্থতার রেকর্ড স্বয়ংক্রিয়ভাবে এতে যুক্ত হয় না।",
  },
  askBarta: { en: "Ask Barta", bn: "বার্তাকে জিজ্ঞেস করুন" },
  statusLimited: { en: "Limited · synthetic demo", bn: "সীমিত · কৃত্রিম ডেমো" },
  statusEnergy: { en: "Limited · energy only", bn: "সীমিত · শুধু শক্তির মাত্রা" },
  statusActivity: { en: "Limited · free-text note", bn: "সীমিত · সাধারণ লেখার নোট" },
  statusRest: { en: "Limited · restNote only", bn: "সীমিত · শুধু restNote" },
  statusDiary: { en: "Limited · owner-only demo", bn: "সীমিত · শুধু মালিকের ডেমো" },
} as const;

const areas = [
  { key: "mood", title: { en: "Mood check-in", bn: "মনের অবস্থা" }, description: { en: "A brief, optional self-report.", bn: "নিজের অনুভূতি জানাতে ছোট্ট ঐচ্ছিক খোঁজখবর।" }, status: copy.statusLimited, Icon: Heart },
  { key: "energy", title: { en: "Energy", bn: "শক্তি" }, description: { en: "Energy level only; no separate fatigue measurement.", bn: "শুধু শক্তির মাত্রা; আলাদা ক্লান্তির মাপ নয়।" }, status: copy.statusEnergy, Icon: Zap },
  { key: "activity", title: { en: "Activity", bn: "কাজকর্ম" }, description: { en: "A selected label is saved as free-text activityNote.", bn: "বাছাই করা নামটি সাধারণ activityNote হিসেবে সংরক্ষিত হয়।" }, status: copy.statusActivity, Icon: Footprints },
  { key: "restSleep", title: { en: "Rest and sleep", bn: "বিশ্রাম ও ঘুম" }, description: { en: "Optional restNote only; no structured sleep tracking.", bn: "ঐচ্ছিক restNote; ঘুমের কাঠামোবদ্ধ হিসাব নয়।" }, status: copy.statusRest, Icon: MoonStar },
  { key: "diary", title: { en: "Private diary", bn: "ব্যক্তিগত ডায়েরি" }, description: { en: "Owner-only demo entries, separate from Barta and provider projections.", bn: "শুধু মালিকের ডেমো এন্ট্রি; বার্তা ও সেবাদাতার প্রদর্শন থেকে আলাদা।" }, status: copy.statusDiary, Icon: BookHeart },
] as const;

const moodLabels: Record<string, { en: string; bn: string }> = {
  comfortable: copy.comfortable,
  mixed: copy.mixed,
  difficult: copy.difficult,
  prefer_not_to_say: copy.preferNotToSay,
};
const energyLabels: Record<string, { en: string; bn: string }> = {
  low: copy.low,
  medium: copy.medium,
  high: copy.high,
  prefer_not_to_say: copy.preferNotToSay,
};
const previewIds: Record<CheckIn, string> = {
  mood: "shusthota-mood-preview",
  energy: "shusthota-energy-preview",
  activity: "shusthota-activity-preview",
  restSleep: "shusthota-rest-sleep-preview",
  diary: "shusthota-diary-preview",
};
const formatDate = (value: string, language: string) => new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
}).format(new Date(value));

export function ShusthotaOverview() {
  const { language, t } = useLanguage();
  const id = useId();
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [history, setHistory] = useState<WellnessHistoryEntry[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const triggerGroup = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const result = await loadWellnessEntries(signal);
      if (!signal?.aborted) setHistory(result);
    } catch (error) {
      if (!signal?.aborted) {
        setHistory(null);
        setHistoryError(t(shusthotaErrorCopy(error, "load")));
      }
    } finally {
      if (!signal?.aborted) setHistoryLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) void loadHistory(controller.signal);
    });
    return () => {
      controller.abort();
    };
  }, [loadHistory]);

  function closeCheckIn(checkIn: CheckIn) {
    setActiveCheckIn(null);
    requestAnimationFrame(() => triggerGroup.current?.querySelector<HTMLButtonElement>(`[data-checkin-trigger="${checkIn}"]`)?.focus());
  }

  const historyRows = history?.map(entry => {
    const values = [
      entry.mood && `${t(copy.mood)}: ${t(moodLabels[entry.mood] ?? copy.preferNotToSay)}`,
      entry.energy && `${t(copy.energy)}: ${t(energyLabels[entry.energy] ?? copy.preferNotToSay)}`,
      entry.activity_note && `${t(copy.activityNote)}: ${entry.activity_note}`,
      entry.rest_note && `${t(copy.restNote)}: ${entry.rest_note}`,
    ].filter((value): value is string => Boolean(value));
    return { entry, values };
  });

  return (
    <div lang={language} className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 text-pro-text sm:px-6 sm:py-10 lg:px-8">
      <header className="max-w-3xl">
        <p className="pro-eyebrow mb-3">{t(copy.eyebrow)}</p>
        <h1 className="pro-editorial mb-4 text-4xl leading-tight sm:text-5xl"><span lang="en">Shusthota</span><span aria-hidden="true"> / </span><span lang="bn">সুস্থতা</span></h1>
        <p className="pro-muted max-w-prose text-base leading-relaxed sm:text-lg">{t(copy.intro)}</p>
      </header>

      <section aria-labelledby={`${id}-disclosure`} className="grid gap-3 border-s-4 border-pro-warning ps-4 sm:ps-5">
        <p className="pro-eyebrow">{t(disclosure.label)}</p>
        <h2 id={`${id}-disclosure`} className="text-xl font-semibold">{t(disclosure.title)}</h2>
        <p className="max-w-prose leading-relaxed">{t(disclosure.synthetic)}</p>
        <p className="pro-muted max-w-prose leading-relaxed">{t(disclosure.history)}</p>
        <p className="pro-muted max-w-prose leading-relaxed">{t(disclosure.fields)}</p>
        <p className="pro-muted max-w-prose leading-relaxed">{t(disclosure.sharing)}</p>
      </section>

      <section className="grid gap-5" aria-labelledby={`${id}-overview`}>
        <div className="grid gap-2">
          <h2 id={`${id}-overview`} className="text-2xl font-semibold sm:text-3xl">{t(copy.overviewTitle)}</h2>
          <p className="pro-muted max-w-prose">{t({ en: "Optional check-ins with limited synthetic demo storage.", bn: "সীমিত কৃত্রিম ডেমো সংরক্ষণসহ ঐচ্ছিক খোঁজখবর।" })}</p>
        </div>

        <CombinedWellnessCheckIn onSaved={loadHistory} />

        <AppCard className="grid gap-4 sm:p-6" aria-labelledby={`${id}-history-title`}>
          <div className="grid gap-2">
            <h3 id={`${id}-history-title`} className="text-xl font-semibold">{t(copy.historyTitle)}</h3>
            <p className="pro-muted text-sm leading-relaxed">{t({ en: "Latest first; up to 100 entries from the service.", bn: "সর্বশেষটি আগে; সেবা থেকে সর্বোচ্চ ১০০টি এন্ট্রি।" })}</p>
          </div>
          {historyLoading && <p role="status" className="pro-muted">{t(copy.loading)}</p>}
          {!historyLoading && historyError && <div className="grid justify-items-start gap-2"><p role="alert" className="text-pro-danger">{historyError}</p><AppButton variant="secondary" onClick={() => void loadHistory()}>{t(copy.retry)}</AppButton></div>}
          {!historyLoading && !historyError && history?.length === 0 && <p className="pro-muted">{t(copy.emptyDescription)}</p>}
          {!historyLoading && !historyError && historyRows && historyRows.length > 0 && (
            <ul className="grid gap-3">
              {historyRows.map(({ entry, values }) => <li key={entry.id} className="grid gap-2 rounded-field border border-pro-border bg-pro-elevated p-4">
                <time className="text-sm text-pro-muted" dateTime={entry.occurred_at}>{formatDate(entry.occurred_at, language)}</time>
                <ul className="grid gap-1">{values.map((value, index) => <li key={`${entry.id}-${index}`} className="break-words leading-relaxed">{value}</li>)}</ul>
              </li>)}
            </ul>
          )}
        </AppCard>
      </section>

      <section className="grid gap-4" aria-labelledby={`${id}-checkins`}>
        <h2 id={`${id}-checkins`} className="text-2xl font-semibold sm:text-3xl">{t(copy.areasTitle)}</h2>
        <div ref={triggerGroup} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {areas.map(area => {
            const open = activeCheckIn === area.key;
            const labels = {
              mood: [copy.openMood, copy.closeMood], energy: [copy.openEnergy, copy.closeEnergy],
              activity: [copy.openActivity, copy.closeActivity], restSleep: [copy.openRestSleep, copy.closeRestSleep],
              diary: [copy.openDiary, copy.closeDiary],
            }[area.key];
            return <AppButton key={area.key} variant="secondary" className="whitespace-normal text-center" data-checkin-trigger={area.key} aria-expanded={open} aria-controls={open ? previewIds[area.key] : undefined} onClick={() => open ? closeCheckIn(area.key) : setActiveCheckIn(area.key)}>
              {t(open ? labels[1] : labels[0])}
            </AppButton>;
          })}
        </div>

        {activeCheckIn === "mood" && <MoodCheckIn onClose={() => closeCheckIn("mood")} onSaved={loadHistory} />}
        {activeCheckIn === "energy" && <EnergyCheckIn onClose={() => closeCheckIn("energy")} onSaved={loadHistory} />}
        {activeCheckIn === "activity" && <ActivityCheckIn onClose={() => closeCheckIn("activity")} onSaved={loadHistory} />}
        {activeCheckIn === "restSleep" && <RestSleepCheckIn onClose={() => closeCheckIn("restSleep")} onSaved={loadHistory} />}
        {activeCheckIn === "diary" && <PrivateDiary onClose={() => closeCheckIn("diary")} />}
      </section>

      <section className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-6" aria-labelledby={`${id}-areas`}>
        <h2 id={`${id}-areas`} className="text-xl font-semibold">{t({ en: "What each check-in supports", bn: "প্রতিটি খোঁজখবর কী সমর্থন করে" })}</h2>
        <ul className="divide-y divide-pro-border border-y border-pro-border">
          {areas.map(({ key, title, description, status, Icon }) => <li key={key} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-control bg-pro-bg text-pro-primary" aria-hidden="true"><Icon size={19} /></span>
              <div className="grid min-w-0 gap-1"><h3 className="break-words font-semibold">{t(title)}</h3><p className="pro-muted break-words leading-relaxed">{t(description)}</p></div>
            </div>
            <span className="ms-[3.25rem] w-fit max-w-full break-words rounded-pill border border-pro-border px-3 py-1 text-sm font-medium text-pro-muted sm:ms-0">{t(status)}</span>
          </li>)}
        </ul>
      </section>

      <section className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-6" aria-labelledby={`${id}-barta`}>
        <div className="grid gap-2">
          <p className="pro-eyebrow">{t({ en: "EDUCATIONAL SUPPORT", bn: "শিক্ষামূলক সহায়তা" })}</p>
          <h2 id={`${id}-barta`} className="text-2xl font-semibold">{t(copy.bartaTitle)}</h2>
          <p className="pro-muted max-w-prose leading-relaxed">{t(copy.bartaCopy)}</p>
        </div>
        <Link href="/app/ask" className="pro-btn pro-btn-secondary w-fit whitespace-normal text-center">{t(copy.askBarta)}</Link>
      </section>
    </div>
  );
}
