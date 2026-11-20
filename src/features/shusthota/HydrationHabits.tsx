"use client";

import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import {
    BookOpen,
    Check,
    CircleHelp,
    Droplets,
    Flower2,
    Heart,
    MoonStar,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./ShusthotaOverview.module.css";
import {
    addHydration,
    createHabit,
    createHabitEvent,
    getHabitEvents,
    getHabits,
    getHydration,
    type HabitEventRecord,
    type HabitRecord,
    type HydrationRecord,
} from "./api";

type HabitIcon = HabitRecord["icon"];
type Habit = HabitRecord & { events: HabitEventRecord[]; done: boolean; busy: boolean };
const icons = {
    water: Droplets,
    reading: BookOpen,
    rest: MoonStar,
    movement: Flower2,
    care: Heart,
    custom: Sparkles,
} as const;
const copy = {
    preview: { en: "Synthetic demo records", bn: "কৃত্রিম ডেমো রেকর্ড" },
    notice: {
        en: "This environment accepts fictional test records only. Do not enter real maternal or personal health information. Availability also depends on the migration being deployed.",
        bn: "এই পরিবেশে শুধু কাল্পনিক পরীক্ষামূলক রেকর্ড ব্যবহার করুন। মায়ের বাস্তব বা ব্যক্তিগত স্বাস্থ্যতথ্য দেবেন না। মাইগ্রেশন চালু থাকা সাপেক্ষে সেবাটি পাওয়া যাবে।",
    },
    water: { en: "Water, your way", bn: "নিজের মতো পানি" },
    waterHint: {
        en: "A simple personal note, with no daily target.",
        bn: "কোনো দৈনিক লক্ষ্য ছাড়া নিজের জন্য একটি সাধারণ নোট।",
    },
    today: { en: "Today's recorded total", bn: "আজকের নথিভুক্ত মোট" },
    amount: { en: "Amount in ml", bn: "পরিমাণ (মিলি.)" },
    custom: { en: "Custom amount", bn: "নিজের পরিমাণ" },
    add: { en: "Add entry", bn: "এন্ট্রি যোগ করুন" },
    history: { en: "Today's entries", bn: "আজকের এন্ট্রি" },
    emptyWater: { en: "No entries are recorded for today.", bn: "আজকের কোনো এন্ট্রি নথিভুক্ত হয়নি।" },
    habits: { en: "Habits you choose", bn: "আপনার পছন্দের অভ্যাস" },
    habitsHint: {
        en: "Create personal routines that matter to you. These are not medical recommendations.",
        bn: "আপনার কাছে গুরুত্বপূর্ণ ব্যক্তিগত অভ্যাস তৈরি করুন। এগুলো চিকিৎসা-পরামর্শ নয়।",
    },
    name: { en: "Habit name", bn: "অভ্যাসের নাম" },
    addHabit: { en: "Add a habit", bn: "অভ্যাস যোগ করুন" },
    mark: { en: "Mark recorded", bn: "নথিভুক্ত হিসেবে চিহ্নিত করুন" },
    undo: { en: "Undo recorded", bn: "নথিভুক্ত চিহ্ন সরান" },
    remove: { en: "Archive habit", bn: "অভ্যাসটি আর্কাইভ করুন" },
    none: {
        en: "No personal habits added. Add one only if it is useful to you.",
        bn: "কোনো ব্যক্তিগত অভ্যাস যোগ করা হয়নি। আপনার কাজে লাগলে তবেই যোগ করুন।",
    },
    reminder: { en: "Reminders are not available yet.", bn: "রিমাইন্ডার এখনো চালু নেই।" },
    savedWater: {
        en: "The server confirmed this synthetic demo entry.",
        bn: "সার্ভার এই কৃত্রিম ডেমো এন্ট্রি নিশ্চিত করেছে।",
    },
    loadError: {
        en: "Your demo records could not be loaded. Try again.",
        bn: "ডেমো রেকর্ড আনা যায়নি। আবার চেষ্টা করুন।",
    },
    saveError: {
        en: "The server did not confirm this change. Check the connection and try again.",
        bn: "সার্ভার পরিবর্তনটি নিশ্চিত করেনি। সংযোগ দেখে আবার চেষ্টা করুন।",
    },
    loading: { en: "Loading demo records…", bn: "ডেমো রেকর্ড আনা হচ্ছে…" },
    working: { en: "Working…", bn: "কাজ চলছে…" },
    noHistory: { en: "No entries recorded.", bn: "কোনো এন্ট্রি নথিভুক্ত হয়নি।" },
    invalid: { en: "Enter a whole amount greater than zero.", bn: "শূন্যের বেশি পূর্ণ সংখ্যা লিখুন।" },
} as const;

export function HydrationHabits({ onSaved }: { onSaved?: () => void } = {}) {
    const { language, t } = useLanguage();
    const id = useId();
    const [amount, setAmount] = useState("");
    const [entries, setEntries] = useState<HydrationRecord[]>([]);
    const [waterMessage, setWaterMessage] = useState("");
    const [habitName, setHabitName] = useState("");
    const [habitIcon, setHabitIcon] = useState<HabitIcon>("custom");
    const [habits, setHabits] = useState<Habit[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const submitting = useRef(false);
    const creatingHabit = useRef(false);
    const pendingEvents = useRef(new Set<string>());
    const [dataError, setDataError] = useState("");
    const total = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    const load = useCallback(async () => {
        setLoading(true);
        setDataError("");
        try {
            const [water, activeHabits] = await Promise.all([getHydration("today"), getHabits()]);
            const withEvents = await Promise.all(
                activeHabits.map(async habit => {
                    const events = await getHabitEvents(habit.id);
                    const latest = events[0];
                    return { ...habit, events, done: latest?.event_type === "completed", busy: false };
                }),
            );
            setEntries(water);
            setHabits(withEvents);
        } catch {
            setDataError(t(copy.loadError));
        } finally {
            setLoading(false);
        }
    }, [t]);
    useEffect(() => {
        let active = true;
        void Promise.resolve().then(() => {
            if (active) void load();
        });
        return () => {
            active = false;
        };
    }, [load]);
    async function addWater(raw: string) {
        const value = Number(raw);
        if (!Number.isInteger(value) || value <= 0 || value > 5000) {
            setError(t(copy.invalid));
            document.getElementById(`${id}-amount`)?.focus();
            return;
        }
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        setWaterMessage("");
        try {
            await addHydration(value);
            setAmount("");
            setWaterMessage(t(copy.savedWater));
            await load();
            onSaved?.();
        } catch {
            setError(t(copy.saveError));
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }
    async function addHabit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = habitName.trim();
        if (!name || busy || creatingHabit.current) return;
        creatingHabit.current = true;
        setBusy(true);
        setError("");
        try {
            await createHabit(name, habitIcon);
            setHabitName("");
            await load();
            onSaved?.();
        } catch {
            setError(t(copy.saveError));
        } finally {
            creatingHabit.current = false;
            setBusy(false);
        }
    }
    async function habitAction(habit: Habit, action: "completed" | "completion_undone" | "archived") {
        if (habit.busy || pendingEvents.current.has(habit.id)) return;
        pendingEvents.current.add(habit.id);
        setHabits(list => list.map(item => (item.id === habit.id ? { ...item, busy: true } : item)));
        try {
            if (action === "completion_undone") {
                const undone = new Set(
                    habit.events
                        .filter(item => item.event_type === "completion_undone")
                        .map(item => item.related_event_id),
                );
                const completion = habit.events.find(item => item.event_type === "completed" && !undone.has(item.id));
                if (!completion) throw new Error("Completion unavailable");
                await createHabitEvent(habit.id, { eventType: action, relatedEventId: completion.id });
            } else await createHabitEvent(habit.id, { eventType: action });
            await load();
            onSaved?.();
        } catch {
            setError(t(copy.saveError));
            setHabits(list => list.map(item => (item.id === habit.id ? { ...item, busy: false } : item)));
        } finally {
            pendingEvents.current.delete(habit.id);
        }
    }
    return (
        <section lang={language} className="grid gap-8 border-t border-pro-border pt-8 sm:pt-10">
            <div className="flex items-start gap-3 rounded-control border border-pro-warning bg-pro-warning-soft p-4">
                <CircleHelp size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-pro-warning" />
                <div>
                    <h2 className="font-semibold">{t(copy.preview)}</h2>
                    <p className="mt-1 leading-relaxed">{t(copy.notice)}</p>
                </div>
            </div>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
                <section
                    aria-labelledby={`${id}-water`}
                    className="grid content-start gap-5 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-7"
                >
                    <header className="flex items-start gap-3">
                        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pro-elevated text-pro-primary">
                            <Droplets size={22} aria-hidden="true" className={styles.botanicalLeaf} />
                        </span>
                        <div>
                            <h2 id={`${id}-water`} className="pro-display text-2xl">
                                {t(copy.water)}
                            </h2>
                            <p className="pro-muted mt-1 leading-relaxed">{t(copy.waterHint)}</p>
                        </div>
                    </header>
                    <div className="rounded-control border border-pro-border bg-pro-elevated p-4">
                        <p className="pro-muted text-sm">{t(copy.today)}</p>
                        <p aria-live="polite" className="pro-display mt-1 text-3xl tabular-nums">
                            {loading ? "—" : total.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}{" "}
                            <span className="text-base font-medium">ml</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[150, 250, 350].map(value => (
                            <AppButton
                                key={value}
                                type="button"
                                variant="secondary"
                                disabled={loading || busy}
                                className="min-h-12 whitespace-normal"
                                onClick={() => void addWater(String(value))}
                            >
                                +{value} ml
                            </AppButton>
                        ))}
                    </div>
                    <form
                        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                        onSubmit={event => {
                            event.preventDefault();
                            addWater(amount);
                        }}
                    >
                        <label htmlFor={`${id}-amount`} className="grid gap-2">
                            <span className="font-medium">{t(copy.amount)}</span>
                            <input
                                id={`${id}-amount`}
                                type="number"
                                min="1"
                                max="5000"
                                step="1"
                                inputMode="numeric"
                                value={amount}
                                aria-invalid={error === t(copy.invalid) || undefined}
                                aria-describedby={error ? `${id}-error` : undefined}
                                onChange={event => setAmount(event.target.value)}
                                placeholder={t(copy.custom)}
                                className="min-h-12 w-full rounded-field border border-pro-control-border bg-pro-elevated px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                            />
                        </label>
                        <AppButton
                            type="submit"
                            disabled={!amount || loading || busy}
                            className="min-h-12 whitespace-normal"
                        >
                            <Plus size={17} aria-hidden="true" className="me-1" />
                            {busy ? t(copy.working) : t(copy.add)}
                        </AppButton>
                    </form>
                    {error && (
                        <p id={`${id}-error`} role="alert" className="text-pro-danger">
                            {error}
                        </p>
                    )}
                    {waterMessage && (
                        <p role="status" className="text-pro-success">
                            {waterMessage}
                        </p>
                    )}
                    {dataError && (
                        <div className="grid gap-2">
                            <p role="alert" className="text-pro-danger">
                                {dataError}
                            </p>
                            <AppButton type="button" variant="secondary" onClick={() => void load()}>
                                {t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}
                            </AppButton>
                        </div>
                    )}
                    <div className="grid gap-2 border-t border-pro-border pt-4">
                        <h3 className="font-semibold">{t(copy.history)}</h3>
                        {loading ? (
                            <p role="status" className="pro-muted text-sm">
                                {t(copy.loading)}
                            </p>
                        ) : entries.length === 0 ? (
                            <p className="pro-muted text-sm leading-relaxed">{t(copy.emptyWater)}</p>
                        ) : (
                            <ol className="grid gap-2">
                                {entries.map(entry => (
                                    <li
                                        key={entry.id}
                                        className="flex items-center justify-between gap-3 border-b border-pro-border/60 py-2"
                                    >
                                        <span>{entry.amount_ml} ml</span>
                                        <time className="pro-muted text-sm" dateTime={entry.occurred_at}>
                                            {new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                timeZone: "Asia/Dhaka",
                                            }).format(new Date(entry.occurred_at))}
                                        </time>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                    <p className="pro-muted border-t border-pro-border pt-4 text-sm leading-relaxed">
                        {t({
                            en: "Recent hydration entries appear in the Wellness history below, with date and category filters.",
                            bn: "সাম্প্রতিক পানি পানের এন্ট্রি নিচের সুস্থতার ইতিহাসে তারিখ ও বিভাগ ফিল্টারসহ দেখা যাবে।",
                        })}
                    </p>
                </section>

                <section aria-labelledby={`${id}-habits`} className="grid content-start gap-5">
                    <header>
                        <p className="pro-eyebrow tracking-normal">
                            {t({ en: "Personal routines", bn: "ব্যক্তিগত অভ্যাস" })}
                        </p>
                        <h2 id={`${id}-habits`} className="pro-display mt-1 text-2xl">
                            {t(copy.habits)}
                        </h2>
                        <p className="pro-muted mt-2 max-w-prose leading-relaxed">{t(copy.habitsHint)}</p>
                        <p className="pro-muted mt-1 text-sm">
                            {t({
                                en: "Showing up to 100 active habits. Event history shows the 100 newest entries per habit; no pagination.",
                                bn: "সর্বোচ্চ ১০০টি সক্রিয় অভ্যাস দেখানো হয়। প্রতিটি অভ্যাসের সর্বশেষ ১০০টি কাজের রেকর্ড দেখানো হয়; পৃষ্ঠা ভাগ নেই।",
                            })}
                        </p>
                    </header>
                    <form
                        onSubmit={addHabit}
                        className="grid gap-3 rounded-hero border border-pro-border bg-pro-elevated p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5"
                    >
                        <label htmlFor={`${id}-habit-name`} className="grid gap-2">
                            <span className="font-medium">{t(copy.name)}</span>
                            <input
                                id={`${id}-habit-name`}
                                maxLength={60}
                                value={habitName}
                                onChange={event => setHabitName(event.target.value)}
                                className="min-h-12 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                            />
                        </label>
                        <AppButton
                            type="submit"
                            disabled={!habitName.trim() || busy || loading || habits.length >= 100}
                            className="min-h-12"
                        >
                            <Plus size={17} aria-hidden="true" className="me-1" />
                            {t(copy.addHabit)}
                        </AppButton>
                        <fieldset className="grid gap-2 sm:col-span-2">
                            <legend className="text-sm font-medium">
                                {t({ en: "Choose a symbol", bn: "একটি প্রতীক বেছে নিন" })}
                            </legend>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(icons) as HabitIcon[]).map(key => {
                                    const Icon = icons[key];
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            aria-label={t({ en: `${key} symbol`, bn: `${key} প্রতীক` })}
                                            aria-pressed={habitIcon === key}
                                            onClick={() => setHabitIcon(key)}
                                            className={`grid size-11 place-items-center rounded-full border focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus ${habitIcon === key ? "border-pro-primary bg-pro-surface text-pro-primary" : "border-pro-control-border bg-pro-bg text-pro-muted"}`}
                                        >
                                            <Icon size={18} aria-hidden="true" />
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>
                    </form>
                    {habits.length === 0 ? (
                        <p className="pro-muted rounded-hero border border-dashed border-pro-border p-5 leading-relaxed">
                            {loading ? t(copy.loading) : t(copy.none)}
                        </p>
                    ) : (
                        <ul className="grid gap-2">
                            {habits.map(habit => {
                                const Icon = icons[habit.icon];
                                return (
                                    <li
                                        key={habit.id}
                                        className={`${styles.choiceCard} grid gap-3 border-b border-pro-border py-3`}
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-primary">
                                                <Icon size={18} aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1 break-words font-medium">
                                                {habit.label}
                                            </span>
                                            <AppButton
                                                type="button"
                                                variant="secondary"
                                                disabled={habit.busy || busy}
                                                className="min-h-11 whitespace-normal"
                                                aria-pressed={habit.done}
                                                onClick={() =>
                                                    void habitAction(
                                                        habit,
                                                        habit.done ? "completion_undone" : "completed",
                                                    )
                                                }
                                            >
                                                {habit.busy ? (
                                                    t(copy.working)
                                                ) : habit.done ? (
                                                    <>
                                                        <RotateCcw size={15} aria-hidden="true" className="me-1" />
                                                        {t(copy.undo)}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={15} aria-hidden="true" className="me-1" />
                                                        {t(copy.mark)}
                                                    </>
                                                )}
                                            </AppButton>
                                            <button
                                                type="button"
                                                disabled={habit.busy || busy}
                                                aria-label={`${t(copy.remove)}: ${habit.label}`}
                                                onClick={() => void habitAction(habit, "archived")}
                                                className="grid min-h-11 min-w-11 place-items-center rounded-full text-pro-muted hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-60"
                                            >
                                                <Trash2 size={17} aria-hidden="true" />
                                            </button>
                                        </div>
                                        {habit.events.length > 0 && (
                                            <ul className="grid gap-1 ps-4 text-sm text-pro-muted">
                                                {habit.events.map(event => (
                                                    <li key={event.id}>
                                                        {t(
                                                            event.event_type === "completed"
                                                                ? { en: "Recorded", bn: "নথিভুক্ত" }
                                                                : event.event_type === "completion_undone"
                                                                  ? {
                                                                        en: "Completion undone",
                                                                        bn: "সম্পন্ন চিহ্ন সরানো হয়েছে",
                                                                    }
                                                                  : { en: "Archived", bn: "আর্কাইভ করা হয়েছে" },
                                                        )}{" "}
                                                        ·{" "}
                                                        <time dateTime={event.occurred_at}>
                                                            {new Intl.DateTimeFormat(
                                                                language === "bn" ? "bn-BD" : "en-BD",
                                                                {
                                                                    dateStyle: "medium",
                                                                    timeStyle: "short",
                                                                    timeZone: "Asia/Dhaka",
                                                                },
                                                            ).format(new Date(event.occurred_at))}
                                                        </time>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <p className="flex items-center gap-2 border-t border-pro-border pt-4 text-sm text-pro-muted">
                        <CircleHelp size={16} aria-hidden="true" />
                        {t(copy.reminder)}
                    </p>
                </section>
            </div>
        </section>
    );
}
