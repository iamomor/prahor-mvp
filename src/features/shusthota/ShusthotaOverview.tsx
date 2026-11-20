"use client";

import { useLanguage } from "@/i18n/use-language";
import { ArrowUpRight, BookHeart, CircleAlert, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { ActivityPlans } from "./ActivityPlans";
import { ActivityPreferences } from "./ActivityPreferences";
import { HydrationHabits } from "./HydrationHabits";
import { PrivateDiary } from "./PrivateDiary";
import { ProviderWellnessSharing } from "./ProviderWellnessSharing";
import { RelaxationResources } from "./RelaxationResources";
import { RemindersGuide } from "./RemindersGuide";
import { ShusthotaHistory } from "./ShusthotaHistory";
import styles from "./ShusthotaOverview.module.css";
import { Wellbeing } from "./Wellbeing";
import { ModuleFeatureOverview } from "@/components/product/ModuleFeatureOverview";
import { WellnessTrendSummary } from "./WellnessTrendSummary";

const copy = {
    eyebrow: { en: "MODULE 06 · SHUSTHOTA", bn: "মডিউল ০৬ · সুস্থতা" },
    title: { en: "A little care for yourself", bn: "নিজের জন্য একটু যত্ন" },
    intro: {
        en: "A quiet place to notice how today feels. Take what is useful, leave the rest. There is no pressure to check in.",
        bn: "আজ আপনার কেমন লাগছে তা খেয়াল করার একটি শান্ত জায়গা। যেটুকু কাজে লাগে নিন, বাকিটা ছেড়ে দিন। খোঁজখবর জানানোর কোনো চাপ নেই।",
    },
    today: { en: "Today", bn: "আজ" },
    testTitle: { en: "Test environment", bn: "পরীক্ষামূলক পরিবেশ" },
    testCopy: {
        en: "This environment uses fictional test records only. Please do not enter real maternal health information or personal diary writing.",
        bn: "এই পরিবেশে শুধু কাল্পনিক পরীক্ষামূলক রেকর্ড ব্যবহৃত হয়। মায়ের বাস্তব স্বাস্থ্যতথ্য বা ব্যক্তিগত ডায়েরির লেখা দেবেন না।",
    },
    formHeading: { en: "A gentle daily check-in", bn: "দিনের ছোট্ট খোঁজখবর" },
    formLead: {
        en: "Choose any parts that feel right for you today.",
        bn: "আজ আপনার কাছে যেগুলো ঠিক মনে হয়, সেগুলো বেছে নিন।",
    },
    sharingTitle: { en: "Your notes stay yours", bn: "আপনার নোট আপনারই" },
    sharingCopy: {
        en: "Wellness entries are not automatically shared. You can share selected wellness records only through Bondhon after choosing the records and fields and giving explicit consent.",
        bn: "সুস্থতার এন্ট্রি স্বয়ংক্রিয়ভাবে শেয়ার হয় না। বন্ধনে রেকর্ড ও তথ্য বেছে নিয়ে স্পষ্ট সম্মতি দিলেই শুধু নির্বাচিত সুস্থতার রেকর্ড শেয়ার হতে পারে।",
    },
    diaryPrivacy: {
        en: "Your diary stays in its own private space and is never sent to Barta or AI or shared with providers.",
        bn: "আপনার ডায়েরি আলাদা ব্যক্তিগত জায়গায় থাকে; এটি বার্তা বা এআই-তে পাঠানো হয় না এবং সেবাদাতার সঙ্গে শেয়ার হয় না।",
    },
    bartaKicker: { en: "A question on your mind?", bn: "মনে কোনো প্রশ্ন আছে?" },
    bartaCopy: {
        en: "Barta receives only the question you choose to send. Shusthota records are not automatically included.",
        bn: "আপনি যে প্রশ্ন পাঠাতে বাছেন, বার্তা শুধু সেটিই পায়। সুস্থতার রেকর্ড স্বয়ংক্রিয়ভাবে এতে যুক্ত হয় না।",
    },
    askBarta: { en: "Ask Barta", bn: "বার্তাকে জিজ্ঞেস করুন" },
} as const;

const formatDate = (value: string, language: string, includeTime = true) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
        dateStyle: "medium",
        ...(includeTime ? { timeStyle: "short" as const } : {}),
        timeZone: "Asia/Dhaka",
    }).format(new Date(value));
const subscribeNever = () => () => {};
const todayInDhaka = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const value = (type: string) => parts.find(part => part.type === type)?.value ?? "00";
    return `${value("year")}-${value("month")}-${value("day")}`;
};

export function ShusthotaOverview() {
    const { language, t } = useLanguage();
    const id = useId();
    const [historyRevision, setHistoryRevision] = useState(0);
    const today = useSyncExternalStore(subscribeNever, todayInDhaka, () => "");

    return (
        <div
            lang={language}
            className="mx-auto grid w-full grid-cols-[minmax(0,1fr)] max-w-6xl gap-8 px-4 pb-12 pt-6 text-pro-text sm:gap-10 sm:px-6 sm:pt-10 lg:px-8"
        >
            <header
                className={`${styles.enter} relative isolate overflow-hidden rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-8 lg:grid lg:min-h-72 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-center lg:px-10`}
            >
                <div className="relative z-10 grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-4">
                    <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
                    <h1 className="pro-display max-w-2xl [overflow-wrap:anywhere] text-4xl leading-tight sm:text-5xl">
                        {t(copy.title)} <span aria-hidden="true">/</span> <span lang="bn">সুস্থতা</span>
                    </h1>
                    <p className="pro-muted max-w-prose text-base leading-relaxed sm:text-lg">{t(copy.intro)}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-pro-primary">
                        <Sparkles size={16} aria-hidden="true" />
                        {t(copy.today)}
                        {today && (
                            <>
                                {" "}
                                · <time dateTime={today}>{formatDate(`${today}T12:00:00+06:00`, language, false)}</time>
                            </>
                        )}
                    </p>
                </div>
                <div
                    aria-hidden="true"
                    className={`${styles.botanical} pointer-events-none absolute -end-8 -top-8 grid size-48 place-items-center rounded-full border border-pro-border text-pro-primary sm:size-56 lg:static lg:ms-auto`}
                >
                    <span className="absolute inset-4 rounded-full border border-pro-border/70" />
                    <Leaf className={`${styles.botanicalLeaf} size-24 stroke-[1.1] sm:size-28`} />
                    <span className="absolute bottom-7 start-5 size-2 rounded-full bg-pro-accent" />
                    <span className="absolute end-7 top-8 size-3 rounded-full bg-pro-surface-2" />
                </div>
            </header>

            <aside
                aria-labelledby={`${id}-test-title`}
                className={`${styles.enter} flex items-start gap-3 rounded-control border border-pro-warning bg-pro-warning-soft p-4 sm:px-5`}
            >
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-pro-warning" aria-hidden="true" />
                <div className="grid gap-1">
                    <h2 id={`${id}-test-title`} className="font-semibold">
                        {t(copy.testTitle)}
                    </h2>
                    <p className="leading-relaxed">{t(copy.testCopy)}</p>
                </div>
            </aside>

            <ModuleFeatureOverview module="shusthota" />
            <section aria-labelledby={`${id}-checkin-title`} className={`${styles.enter} grid gap-4`}>
                <header className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
                    <div>
                        <p className="pro-eyebrow tracking-normal">
                            {t({ en: "Optional, and in your own time", bn: "ঐচ্ছিক, আপনার নিজের সময়ে" })}
                        </p>
                        <h2 id={`${id}-checkin-title`} className="pro-display mt-1 text-2xl sm:text-3xl">
                            {t(copy.formHeading)}
                        </h2>
                    </div>
                    <p className="pro-muted max-w-sm leading-relaxed sm:text-right">{t(copy.formLead)}</p>
                </header>
                <Wellbeing onSaved={() => setHistoryRevision(value => value + 1)} />
            </section>

            <ShusthotaHistory refreshVersion={historyRevision} />

            <HydrationHabits onSaved={() => setHistoryRevision(value => value + 1)} />

            <ActivityPreferences onSaved={() => setHistoryRevision(value => value + 1)} />

            <section
                aria-labelledby={`${id}-diary-title`}
                className={`${styles.enter} grid gap-5 border-t border-pro-border pt-7 sm:pt-9`}
            >
                <header className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,24rem)] sm:items-end sm:gap-8">
                    <div className="flex items-start gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-primary">
                            <BookHeart size={20} aria-hidden="true" />
                        </span>
                        <div className="grid gap-1">
                            <p className="pro-eyebrow tracking-normal">
                                {t({ en: "A quieter corner", bn: "নিজের জন্য নিরিবিলি এক কোণ" })}
                            </p>
                            <h2 id={`${id}-diary-title`} className="pro-display text-2xl sm:text-3xl">
                                {t({ en: "Private diary", bn: "ব্যক্তিগত ডায়েরি" })}
                            </h2>
                        </div>
                    </div>
                    <p className="pro-muted leading-relaxed">{t(copy.diaryPrivacy)}</p>
                </header>
                <PrivateDiary />
            </section>

            <RelaxationResources />

            <ActivityPlans />

            <ProviderWellnessSharing />

            <WellnessTrendSummary />

            <RemindersGuide />

            <aside
                className={`${styles.enter} grid gap-3 border-t border-pro-border pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8`}
            >
                <div className="grid gap-1">
                    <p className="pro-eyebrow tracking-normal">{t(copy.bartaKicker)}</p>
                    <p className="pro-muted max-w-prose leading-relaxed">{t(copy.bartaCopy)}</p>
                </div>
                <Link
                    href="/app/ask"
                    className={`${styles.motionControl} inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-pro-control-border px-5 font-semibold text-pro-primary transition-colors duration-[var(--pro-duration-fast)] hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus motion-reduce:transition-none`}
                >
                    {t(copy.askBarta)}
                    <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
            </aside>
        </div>
    );
}
