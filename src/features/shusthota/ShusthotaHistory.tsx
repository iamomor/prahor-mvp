"use client";

import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import styles from "./ShusthotaOverview.module.css";
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
type View = "calendar" | "timeline";

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
function dateFromKey(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
}
function keyFromDate(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function shiftDate(day: string, amount: number) {
    const date = dateFromKey(day);
    date.setUTCDate(date.getUTCDate() + amount);
    return keyFromDate(date);
}
const monthKey = (day: string) => day.slice(0, 7);
function shiftMonth(month: string, amount: number) {
    const [year, value] = month.split("-").map(Number);
    const next = new Date(Date.UTC(year, value - 1 + amount, 1, 12));
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}
function shiftCalendarMonth(day: string, amount: number) {
    const targetMonth = shiftMonth(monthKey(day), amount);
    const [year, month] = targetMonth.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${targetMonth}-${String(Math.min(Number(day.slice(8)), lastDay)).padStart(2, "0")}`;
}
const dayName = (day: string, language: string, style: "short" | "numeric" = "numeric") =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        ...(style === "short" ? { weekday: "short" as const } : { day: "numeric" as const }),
        timeZone: "Asia/Dhaka",
    }).format(dateFromKey(day));
const formatMonth = (month: string, language: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Dhaka",
    }).format(dateFromKey(`${month}-01`));
const shiftDays = (day: string, amount: number) => {
    return shiftDate(day, amount);
};
const displayDate = (value: string, language: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Dhaka",
    }).format(new Date(value));
const displayCalendarDate = (day: string, language: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        dateStyle: "full",
        timeZone: "Asia/Dhaka",
    }).format(dateFromKey(day));

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
    const today = dhakaToday();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partial, setPartial] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [category, setCategory] = useState<Category | "all">("all");
    const [view, setView] = useState<View>("calendar");
    const [selectedDate, setSelectedDate] = useState(today);
    const [visibleMonth, setVisibleMonth] = useState(monthKey(today));

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
    const monthItems = filtered.filter(item => monthKey(dateKey(item.occurredAt)) === visibleMonth);
    const selectedItems = filtered.filter(item => dateKey(item.occurredAt) === selectedDate);
    const counts = {
        days: new Set(monthItems.map(item => dateKey(item.occurredAt))).size,
        mood: monthItems.filter(item => item.category === "mood").length,
        hydration: monthItems.filter(item => item.category === "hydration").length,
        habits: monthItems.filter(item => item.category === "habit").length,
    };
    const firstDay = dateFromKey(`${visibleMonth}-01`);
    const gridStart = shiftDate(`${visibleMonth}-01`, -firstDay.getUTCDay());
    const calendarDays = Array.from({ length: 42 }, (_, index) => shiftDate(gridStart, index));
    const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
        dayName(shiftDate("2026-01-04", index), language, "short"),
    );
    const eventsByDay = new Map<string, Category[]>();
    for (const item of filtered) {
        const day = dateKey(item.occurredAt);
        const categories = eventsByDay.get(day) ?? [];
        if (!categories.includes(item.category)) categories.push(item.category);
        eventsByDay.set(day, categories);
    }
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

    const changeMonth = (amount: number) => {
        const nextMonth = shiftMonth(visibleMonth, amount);
        setVisibleMonth(nextMonth);
        setSelectedDate(`${nextMonth}-01`);
    };
    const chooseCalendarDay = (day: string, moveFocus = false) => {
        setSelectedDate(day);
        setVisibleMonth(monthKey(day));
        if (moveFocus) {
            window.requestAnimationFrame(() => {
                document.querySelector<HTMLButtonElement>(`[data-calendar-date="${day}"]`)?.focus();
            });
        }
    };

    return (
        <section
            id="shusthota-history"
            aria-labelledby={`${id}-title`}
            lang={language}
            className="grid gap-5 border-t border-pro-border pt-7 sm:pt-9"
        >
            <header className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="grid gap-1">
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
                </div>
                <div className="flex w-fit max-w-full flex-wrap rounded-pill border border-pro-border bg-pro-elevated p-1" role="group" aria-label={t({ en: "History view", bn: "ইতিহাস দেখার ধরন" })}>
                    {(["calendar", "timeline"] as const).map(option => (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={view === option}
                            onClick={() => setView(option)}
                            className={`min-h-10 rounded-pill px-3 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus ${view === option ? "bg-pro-primary text-pro-primary-on" : "text-pro-muted hover:bg-pro-surface"}`}
                        >
                            {t(option === "calendar" ? { en: "Calendar", bn: "ক্যালেন্ডার" } : { en: "Timeline", bn: "সময়রেখা" })}
                        </button>
                    ))}
                </div>
            </header>
            <section aria-label={t({ en: "Monthly statistics", bn: "মাসিক পরিসংখ্যান" })} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                    `${counts.days.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")} ${t({ en: "days with records", bn: "দিনে রেকর্ড" })}`,
                    `${counts.mood.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")} ${t({ en: "mood entries", bn: "মনের নোট" })}`,
                    `${counts.hydration.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")} ${t({ en: "hydration entries", bn: "পানির নোট" })}`,
                    `${counts.habits.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")} ${t({ en: "habit events", bn: "অভ্যাসের কাজ" })}`,
                ].map(label => <p key={label} className="rounded-control border border-pro-border bg-pro-surface px-3 py-2.5 text-sm font-medium leading-snug">{label}</p>)}
            </section>
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
            {!loading && !error && view === "calendar" && (
                <div className="grid min-w-0 gap-4 lg:h-[34rem] lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
                    <section aria-label={t({ en: "History calendar", bn: "ইতিহাসের ক্যালেন্ডার" })} className="min-w-0 rounded-hero border border-pro-border bg-pro-surface p-3 sm:p-5 lg:h-full lg:min-h-0">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <AppButton type="button" variant="ghost" className="min-h-11 min-w-11 px-2" aria-label={t({ en: "Previous month", bn: "আগের মাস" })} onClick={() => changeMonth(-1)}>
                                <ArrowLeft aria-hidden="true" size={18} />
                            </AppButton>
                            <h3 className="pro-display text-center text-lg font-semibold sm:text-xl" aria-live="polite">{formatMonth(visibleMonth, language)}</h3>
                            <AppButton type="button" variant="ghost" className="min-h-11 min-w-11 px-2" aria-label={t({ en: "Next month", bn: "পরের মাস" })} onClick={() => changeMonth(1)}>
                                <ArrowRight aria-hidden="true" size={18} />
                            </AppButton>
                        </div>
                        <div role="grid" aria-label={formatMonth(visibleMonth, language)} className="grid min-w-0 grid-cols-7 gap-1">
                            <div role="row" className="col-span-7 grid grid-cols-7 gap-1">
                                {weekdayLabels.map((weekday, index) => (
                                    <div key={`${weekday}-${index}`} role="columnheader" className="grid min-h-8 min-w-0 place-items-center text-center text-xs font-semibold text-pro-muted">{weekday}</div>
                                ))}
                            </div>
                            {Array.from({ length: 6 }, (_, week) => (
                                <div key={`week-${week}`} role="row" className="col-span-7 grid grid-cols-7 gap-1">
                                    {calendarDays.slice(week * 7, week * 7 + 7).map(day => {
                                        const dayCategories = eventsByDay.get(day) ?? [];
                                        const selected = day === selectedDate;
                                        const isToday = day === today;
                                        const inMonth = monthKey(day) === visibleMonth;
                                        const outsideRange = (!!from && day < from) || (!!to && day > to);
                                        const categoryNames = dayCategories.map(value => t(labels[value])).join(", ");
                                        const accessibleDate = displayCalendarDate(day, language);
                                        const description = categoryNames ? `${accessibleDate}; ${categoryNames}` : accessibleDate;
                                        return (
                                            <div key={day} role="gridcell" aria-selected={selected} className="min-w-0">
                                                <button
                                                    type="button"
                                                    data-calendar-date={day}
                                                    onClick={() => chooseCalendarDay(day)}
                                                    onKeyDown={event => {
                                                        let target: string | null = null;
                                                        if (event.key === "ArrowLeft") target = shiftDate(day, -1);
                                                        else if (event.key === "ArrowRight") target = shiftDate(day, 1);
                                                        else if (event.key === "ArrowUp") target = shiftDate(day, -7);
                                                        else if (event.key === "ArrowDown") target = shiftDate(day, 7);
                                                        else if (event.key === "Home") target = shiftDate(day, -dateFromKey(day).getUTCDay());
                                                        else if (event.key === "End") target = shiftDate(day, 6 - dateFromKey(day).getUTCDay());
                                                        else if (event.key === "PageUp") target = shiftCalendarMonth(day, -1);
                                                        else if (event.key === "PageDown") target = shiftCalendarMonth(day, 1);
                                                        if (target) {
                                                            event.preventDefault();
                                                            chooseCalendarDay(target, true);
                                                        }
                                                    }}
                                                    aria-label={description}
                                                    aria-current={isToday ? "date" : undefined}
                                                    aria-pressed={selected}
                                                    tabIndex={selected ? 0 : -1}
                                                    className={`relative grid aspect-square min-h-10 w-full min-w-0 place-items-center rounded-field text-sm focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-pro-focus ${!inMonth ? "text-pro-muted/70" : "text-pro-text"} ${outsideRange ? "opacity-50" : ""} ${selected ? "bg-pro-primary text-pro-primary-on" : isToday ? "border-2 border-pro-primary bg-pro-elevated font-bold" : "hover:bg-pro-elevated"}`}
                                                >
                                                    <span>{dayName(day, language)}</span>
                                                    {dayCategories.length > 0 && <span aria-hidden="true" className={`absolute bottom-1 flex gap-0.5 ${selected ? "text-pro-primary-on" : "text-pro-primary"}`}>
                                                        {dayCategories.slice(0, 3).map(value => <span key={value} className="size-1 rounded-full bg-current" />)}
                                                    </span>}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-pro-muted">
                            {t({ en: "Dots mark recorded categories. A border marks today; a filled day is selected.", bn: "বিন্দুতে নথিভুক্ত বিভাগ বোঝায়। বর্ডারে আজ এবং ভরাট ঘরে নির্বাচিত দিন বোঝায়।" })}
                        </p>
                    </section>
                    <section
                        aria-labelledby={`${id}-day-title`}
                        className="grid h-[28rem] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] rounded-hero border border-pro-border bg-pro-bg p-4 sm:p-5 lg:h-full"
                    >
                        <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                            <h3 id={`${id}-day-title`} className="pro-display text-lg font-semibold">{displayCalendarDate(selectedDate, language)}</h3>
                            <p className="text-sm text-pro-muted">{t({ en: `${selectedItems.length} records`, bn: `${selectedItems.length}টি রেকর্ড` })}</p>
                        </header>
                        {selectedItems.length ? (
                            <div className={`${styles.historyScroll} min-h-0 min-w-0 overflow-y-auto overscroll-contain pe-1`}>
                                <ol className="grid divide-y divide-pro-border/70">
                                    {selectedItems.map(item => {
                                        const translated = item.category === "mood" || item.category === "energy" ? valueLabels[item.value] : undefined;
                                        return (
                                            <li key={`${item.category}-${item.id}`} className="grid min-w-0 gap-1 py-3">
                                                <p className="font-semibold leading-snug">{t(item.label)}</p>
                                                <time dateTime={item.occurredAt} className="text-sm text-pro-muted">{displayDate(item.occurredAt, language)}</time>
                                                <p className="break-words leading-relaxed">{translated ? t(translated) : item.value}</p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        ) : (
                            <p className="self-start rounded-control border border-dashed border-pro-border p-4 text-sm leading-relaxed text-pro-muted">
                                {t({ en: "No records for this day in the available history and selected filters.", bn: "উপলভ্য ইতিহাস ও নির্বাচিত ফিল্টারে এই দিনে কোনো রেকর্ড নেই।" })}
                            </p>
                        )}
                    </section>
                </div>
            )}
            {!loading && !error && view === "timeline" && (
                <section aria-label={t({ en: "Wellness timeline", bn: "সুস্থতার সময়রেখা" })} className="rounded-hero border border-pro-border bg-pro-surface px-4 sm:px-6">
                    <p className="py-3 text-sm text-pro-muted">{t({ en: `${filtered.length} records in the selected range.`, bn: `নির্বাচিত সময়ে ${filtered.length}টি রেকর্ড।` })}</p>
                    {filtered.length ? (
                        <ol className="grid gap-0 border-s border-pro-border sm:ms-2">
                            {filtered.map(item => {
                                const translated = item.category === "mood" || item.category === "energy" ? valueLabels[item.value] : undefined;
                                return (
                                    <li key={`${item.category}-${item.id}`} className="relative grid min-w-0 gap-2 border-b border-pro-border/60 py-4 ps-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                                        <span aria-hidden="true" className="absolute -start-[0.35rem] top-5 size-2.5 rounded-full border-2 border-pro-bg bg-pro-primary" />
                                        <time dateTime={item.occurredAt} className="text-sm font-medium text-pro-muted">{displayDate(item.occurredAt, language)}</time>
                                        <div className="grid min-w-0 gap-1">
                                            <p className="text-sm font-semibold text-pro-primary">{t(item.label)}</p>
                                            <p className="break-words leading-relaxed">{translated ? t(translated) : item.value}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="mb-4 rounded-control border border-dashed border-pro-border p-4 leading-relaxed text-pro-muted">{t({ en: "No entries in this date range and category.", bn: "এই তারিখ ও বিভাগে কোনো এন্ট্রি নেই।" })}</p>
                    )}
                </section>
            )}
        </section>
    );
}
