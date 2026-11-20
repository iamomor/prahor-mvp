"use client";

import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { useCallback, useEffect, useId, useState } from "react";
import {
    getActivityPreferences,
    getCombinedHabitEvents,
    getHydration,
    loadWellnessEntries,
    shusthotaErrorCopy,
    type WellnessHistoryEntry,
} from "./api";

type Category = "mood" | "energy" | "activity" | "rest" | "hydration" | "habit" | "preference";
type Item = { id: string; category: Category; occurredAt: string; label: { en: string; bn: string }; value: string };

const labels = {
    mood: { en: "Mood", bn: "মনের অবস্থা" },
    energy: { en: "Energy", bn: "শক্তি" },
    activity: { en: "Activity note", bn: "কাজকর্মের নোট" },
    rest: { en: "Rest note", bn: "বিশ্রামের নোট" },
    hydration: { en: "Hydration", bn: "পানি" },
    habit: { en: "Habit activity", bn: "অভ্যাসের কাজ" },
    preference: { en: "Activity preferences", bn: "কাজকর্মের পছন্দ" },
} satisfies Record<Category, { en: string; bn: string }>;
const valueLabels: Record<string, { en: string; bn: string }> = {
    comfortable: { en: "Comfortable", bn: "স্বস্তিতে" },
    mixed: { en: "Mixed", bn: "মিশ্র" },
    difficult: { en: "Difficult", bn: "কঠিন" },
    prefer_not_to_say: { en: "Prefer not to say", bn: "বলতে চাই না" },
    low: { en: "Low", bn: "কম" },
    medium: { en: "Medium", bn: "মাঝারি" },
    high: { en: "High", bn: "বেশি" },
    walking: { en: "Walking", bn: "হাঁটা" },
    assisted: { en: "Assisted activity", bn: "সহায়তায় কাজকর্ম" },
    seated: { en: "Seated or wheelchair-friendly activity", bn: "বসে বা হুইলচেয়ারে করা যায় এমন কাজকর্ম" },
    gentle_movement: { en: "Gentle movement", bn: "হালকা নড়াচড়া" },
    resting: { en: "Resting", bn: "বিশ্রাম" },
    other: { en: "Other", bn: "অন্য কিছু" },
    none: { en: "No preference", bn: "কোনো পছন্দ নেই" },
    completed: { en: "Recorded", bn: "নথিভুক্ত" },
    completion_undone: { en: "Completion undone", bn: "সম্পন্ন চিহ্ন সরানো হয়েছে" },
    archived: { en: "Archived", bn: "আর্কাইভ করা হয়েছে" },
};
const dateKey = (value: string) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
const dhakaToday = () => dateKey(new Date().toISOString());
const shiftDays = (day: string, amount: number) => {
    const date = new Date(`${day}T12:00:00+06:00`);
    date.setUTCDate(date.getUTCDate() + amount);
    return dateKey(date.toISOString());
};
const displayDate = (value: string, language: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Dhaka",
    }).format(new Date(value));

function fromWellness(entries: WellnessHistoryEntry[]): Item[] {
    const items: Item[] = [];
    for (const entry of entries) {
        if (entry.mood)
            items.push({
                id: `${entry.id}-mood`,
                category: "mood",
                occurredAt: entry.occurred_at,
                label: labels.mood,
                value: entry.mood,
            });
        if (entry.energy)
            items.push({
                id: `${entry.id}-energy`,
                category: "energy",
                occurredAt: entry.occurred_at,
                label: labels.energy,
                value: entry.energy,
            });
        if (entry.activity_note)
            items.push({
                id: `${entry.id}-activity`,
                category: "activity",
                occurredAt: entry.occurred_at,
                label: labels.activity,
                value: entry.activity_note,
            });
        if (entry.rest_note)
            items.push({
                id: `${entry.id}-rest`,
                category: "rest",
                occurredAt: entry.occurred_at,
                label: labels.rest,
                value: entry.rest_note,
            });
    }
    return items;
}

export function ShusthotaHistory({ refreshVersion = 0 }: { refreshVersion?: number }) {
    const { language, t } = useLanguage();
    const id = useId();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partial, setPartial] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [category, setCategory] = useState<Category | "all">("all");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        setPartial(false);
        try {
            const [wellnessResult, hydrationResult, habitsResult, preferencesResult] = await Promise.allSettled([
                loadWellnessEntries(),
                getHydration("history"),
                getCombinedHabitEvents(),
                getActivityPreferences(),
            ]);
            if (wellnessResult.status === "rejected") throw wellnessResult.reason;
            const next: Item[] = [...fromWellness(wellnessResult.value)];
            if (hydrationResult.status === "fulfilled")
                next.push(
                    ...hydrationResult.value.map(entry => ({
                        id: entry.id,
                        category: "hydration" as const,
                        occurredAt: entry.occurred_at,
                        label: labels.hydration,
                        value: `${entry.amount_ml.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")} ${t({ en: "ml", bn: "মি.লি." })}`,
                    })),
                );
            if (habitsResult.status === "fulfilled")
                next.push(
                    ...habitsResult.value.map(entry => ({
                        id: entry.id,
                        category: "habit" as const,
                        occurredAt: entry.occurred_at,
                        label: { en: `Habit · ${entry.habit_label}`, bn: `অভ্যাস · ${entry.habit_label}` },
                        value: t(valueLabels[entry.event_type] ?? { en: entry.event_type, bn: entry.event_type }),
                    })),
                );
            if (preferencesResult.status === "fulfilled")
                next.push(
                    ...preferencesResult.value.map(entry => ({
                        id: entry.id,
                        category: "preference" as const,
                        occurredAt: entry.occurred_at,
                        label: labels.preference,
                        value: entry.preferences.length
                            ? entry.preferences
                                  .map(value => t(valueLabels[value] ?? { en: value, bn: value }))
                                  .join(", ")
                            : t({ en: "No preference", bn: "কোনো পছন্দ নেই" }),
                    })),
                );
            setPartial(
                hydrationResult.status === "rejected" ||
                    habitsResult.status === "rejected" ||
                    preferencesResult.status === "rejected",
            );
            setItems(next.sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt)));
        } catch (cause) {
            setError(t(shusthotaErrorCopy(cause, "load")));
        } finally {
            setLoading(false);
        }
    }, [language, t]);

    useEffect(() => {
        void Promise.resolve().then(() => load());
    }, [load, refreshVersion]);

    const filtered = items.filter(item => {
        const day = dateKey(item.occurredAt);
        return (category === "all" || item.category === category) && (!from || day >= from) && (!to || day <= to);
    });
    const summary =
        category === "all"
            ? t({
                  en: `${filtered.length} recorded items in the selected dates.`,
                  bn: `নির্বাচিত তারিখে ${filtered.length}টি নথিভুক্ত তথ্য।`,
              })
            : t({
                  en: `${filtered.length} ${labels[category].en.toLowerCase()} items in the selected dates.`,
                  bn: `নির্বাচিত তারিখে ${filtered.length}টি ${labels[category].bn} তথ্য।`,
              });

    return (
        <section
            id="shusthota-history"
            aria-labelledby={`${id}-title`}
            lang={language}
            className="grid gap-5 border-t border-pro-border pt-7 sm:pt-9"
        >
            <header className="grid gap-1">
                <p className="pro-eyebrow tracking-normal">
                    {t({ en: "Your recorded notes", bn: "আপনার নথিভুক্ত তথ্য" })}
                </p>
                <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl">
                    {t({ en: "Wellness history", bn: "সুস্থতার ইতিহাস" })}
                </h2>
                <p className="pro-muted max-w-prose leading-relaxed">
                    {t({
                        en: "A neutral timeline of your own entries. No scores or medical interpretation.",
                        bn: "আপনার নিজের এন্ট্রির একটি নিরপেক্ষ সময়রেখা। কোনো স্কোর বা চিকিৎসাগত ব্যাখ্যা নয়।",
                    })}
                </p>
                <p className="pro-muted text-sm">
                    {t({
                        en: "Each source returns up to its 100 newest entries. No pagination; a date filter covers only the entries available here.",
                        bn: "প্রতিটি উৎস থেকে সর্বশেষ ১০০টি পর্যন্ত এন্ট্রি আসে। পৃষ্ঠা ভাগ নেই; তারিখের ফিল্টার এখানে পাওয়া এন্ট্রির মধ্যেই সীমিত।",
                    })}
                </p>
            </header>
            <div className="grid gap-3 rounded-hero border border-pro-border bg-pro-elevated p-4 sm:grid-cols-2 sm:p-5">
                <label htmlFor={`${id}-category`} className="grid gap-2">
                    <span className="font-medium">{t({ en: "Category", bn: "বিভাগ" })}</span>
                    <select
                        id={`${id}-category`}
                        value={category}
                        onChange={event => setCategory(event.target.value as Category | "all")}
                        className="min-h-12 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                    >
                        <option value="all">{t({ en: "All supported categories", bn: "সব সমর্থিত বিভাগ" })}</option>
                        {(Object.keys(labels) as Category[]).map(value => (
                            <option key={value} value={value}>
                                {t(labels[value])}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-2">
                        <span className="font-medium">{t({ en: "From", bn: "থেকে" })}</span>
                        <input
                            type="date"
                            value={from}
                            onChange={event => setFrom(event.target.value)}
                            className="min-h-12 min-w-0 rounded-field border border-pro-control-border bg-pro-bg px-2 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="font-medium">{t({ en: "To", bn: "পর্যন্ত" })}</span>
                        <input
                            type="date"
                            value={to}
                            onChange={event => setTo(event.target.value)}
                            className="min-h-12 min-w-0 rounded-field border border-pro-control-border bg-pro-bg px-2 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                        />
                    </label>
                </div>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <AppButton
                        type="button"
                        variant="secondary"
                        className="min-h-11"
                        onClick={() => {
                            const end = dhakaToday();
                            setFrom(shiftDays(end, -6));
                            setTo(end);
                        }}
                    >
                        {t({ en: "Weekly · 7 days", bn: "সাপ্তাহিক · ৭ দিন" })}
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="secondary"
                        className="min-h-11"
                        onClick={() => {
                            const end = dhakaToday();
                            setFrom(shiftDays(end, -29));
                            setTo(end);
                        }}
                    >
                        {t({ en: "Monthly · 30 days", bn: "মাসিক · ৩০ দিন" })}
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="ghost"
                        className="min-h-11"
                        onClick={() => {
                            setFrom("");
                            setTo("");
                            setCategory("all");
                        }}
                    >
                        {t({ en: "Clear filters", bn: "ফিল্টার মুছুন" })}
                    </AppButton>
                </div>
            </div>
            {!loading && !error && (
                <p role="status" className="pro-muted text-sm">
                    {summary}
                </p>
            )}
            {!loading && !error && partial && (
                <p
                    role="status"
                    className="rounded-control border border-pro-warning bg-pro-warning-soft p-3 text-sm leading-relaxed"
                >
                    {t({
                        en: "Some P1 history sources are unavailable right now. The entries shown are only from sources that responded.",
                        bn: "কিছু P1 ইতিহাসের উৎস এখন পাওয়া যাচ্ছে না। এখানে শুধু যেসব উৎস থেকে তথ্য এসেছে সেগুলো দেখানো হয়েছে।",
                    })}
                </p>
            )}
            {loading && (
                <p role="status" className="pro-muted py-3">
                    {t({ en: "Loading wellness history…", bn: "সুস্থতার ইতিহাস আনা হচ্ছে…" })}
                </p>
            )}
            {!loading && error && (
                <div className="flex flex-wrap items-center gap-3 rounded-control border border-pro-danger bg-pro-danger-soft p-4">
                    <p role="alert" className="text-pro-danger">
                        {error}
                    </p>
                    <AppButton type="button" variant="secondary" onClick={() => void load()}>
                        {t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}
                    </AppButton>
                </div>
            )}
            {!loading && !error && filtered.length === 0 && (
                <p className="rounded-hero border border-dashed border-pro-border p-5 leading-relaxed text-pro-muted">
                    {t({
                        en: "No entries in this date range and category.",
                        bn: "এই তারিখ ও বিভাগে কোনো এন্ট্রি নেই।",
                    })}
                </p>
            )}
            {!loading && !error && filtered.length > 0 && (
                <ol className="grid gap-0 border-s border-pro-border sm:ms-2">
                    {filtered.map(item => {
                        const translated =
                            item.category === "mood" || item.category === "energy"
                                ? valueLabels[item.value]
                                : undefined;
                        return (
                            <li
                                key={`${item.category}-${item.id}`}
                                className="relative grid gap-2 border-b border-pro-border/60 py-4 ps-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute -start-[0.35rem] top-5 size-2.5 rounded-full border-2 border-pro-bg bg-pro-primary"
                                />
                                <time dateTime={item.occurredAt} className="text-sm font-medium text-pro-muted">
                                    {displayDate(item.occurredAt, language)}
                                </time>
                                <div className="grid gap-1">
                                    <p className="text-sm font-semibold text-pro-primary">{t(item.label)}</p>
                                    <p className="break-words leading-relaxed">
                                        {translated ? t(translated) : item.value}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}
