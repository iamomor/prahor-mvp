"use client";
import { readRequestIds } from "@/features/bondhon/request-history";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";
import {
  supportRequestSchema,
  type SupportRequest,
} from "@/lib/contracts/bondhon";
import {
  Accessibility,
  Activity,
  ArrowRight,
  Baby,
  ChevronRight,
  FolderOpen,
  HandHeart,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  PhoneCall,
  RotateCw,
  ShieldCheck,
  Smile,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* ── Shapes returned by /api/jibonrekha and /api/wellness (read-only here) ── */
type Observation = {
  id: string;
  subject: "mother" | "baby";
  kind: string;
  value: string;
  unit: string | null;
  observed_at: string;
  source: string;
};
type Pregnancy = {
  id: string;
  label?: string | null;
  estimated_due_date?: string | null;
  last_menstrual_period_date?: string | null;
};
type Visit = {
  id: string;
  subject: string;
  occurred_at: string;
  place_note?: string | null;
};
type Records = {
  pregnancies: Pregnancy[];
  babies: { id: string }[];
  observations: Observation[];
  corrections: { old_observation_id: string }[];
  visits?: Visit[];
};
type CheckIn = { id: string; occurred_at: string; mood: string | null };
type Load<T> =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; data: T };
type Text = { en: string; bn: string };

const DAY = 86_400_000;
const TERM_DAYS = 280;
const card =
  "rounded-card border border-pro-border bg-pro-elevated shadow-pro-1";
const eyebrow =
  "text-xs font-semibold text-pro-primary [&:lang(en)]:uppercase [&:lang(en)]:tracking-[0.16em]";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

/** Today's calendar date in Bangladesh as UTC midnight, so day counts never drift with time zones. */
function dhakaToday(): number {
  return Date.parse(
    `${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date())}T00:00:00Z`,
  );
}
const dhakaHour = () =>
  Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Dhaka",
    }).format(new Date()),
  );
const subscribeNever = () => () => {};
const dateOnly = (value: string) =>
  Date.parse(`${value.slice(0, 10)}T00:00:00Z`);

type Dating =
  | { kind: "none" }
  | { kind: "no-date" }
  | { kind: "past-due"; due: number }
  | {
      kind: "dated";
      weeks: number;
      days: number;
      trimester: 1 | 2 | 3;
      due: number;
    };

/** Educational estimate from the mother's own saved due date (or LMP + 280 days). Never invented. */
function datePregnancy(
  pregnancy: Pregnancy | undefined,
  today: number,
): Dating {
  if (!pregnancy) return { kind: "none" };
  const due = pregnancy.estimated_due_date
    ? dateOnly(pregnancy.estimated_due_date)
    : pregnancy.last_menstrual_period_date
      ? dateOnly(pregnancy.last_menstrual_period_date) + TERM_DAYS * DAY
      : NaN;
  if (Number.isNaN(due)) return { kind: "no-date" };
  const elapsed = Math.round((today - (due - TERM_DAYS * DAY)) / DAY);
  if (elapsed < 0) return { kind: "no-date" };
  if (today > due) return { kind: "past-due", due };
  const weeks = Math.floor(elapsed / 7);
  return {
    kind: "dated",
    weeks,
    days: elapsed % 7,
    trimester: weeks < 14 ? 1 : weeks < 28 ? 2 : 3,
    due,
  };
}

const measurement: Record<string, Text> = {
  weight: { en: "Weight", bn: "ওজন" },
  temperature: { en: "Temperature", bn: "তাপমাত্রা" },
  systolic_blood_pressure: {
    en: "Blood pressure (top)",
    bn: "রক্তচাপ (উপরের)",
  },
  diastolic_blood_pressure: {
    en: "Blood pressure (bottom)",
    bn: "রক্তচাপ (নিচের)",
  },
  hemoglobin: { en: "Hemoglobin", bn: "হিমোগ্লোবিন" },
  glucose: { en: "Glucose", bn: "গ্লুকোজ" },
  fetal_heart_rate: { en: "Baby's heart rate", bn: "শিশুর হৃৎস্পন্দন" },
  note: { en: "Note", bn: "নোট" },
};
const unitLabel = (unit: string | null) =>
  unit === "mm[Hg]"
    ? "mmHg"
    : unit === "Cel"
      ? "°C"
      : unit === "/min"
        ? "/min"
        : (unit ?? "");
const moodLabel: Record<string, Text> = {
  comfortable: { en: "comfortable", bn: "স্বস্তিতে" },
  mixed: { en: "mixed", bn: "মিশ্র" },
  difficult: { en: "difficult", bn: "কঠিন" },
  prefer_not_to_say: { en: "not shared", bn: "বলা হয়নি" },
};
const requestLabel: Record<SupportRequest["status"], Text> = {
  submitted: {
    en: "Saved to PROHOR, waiting",
    bn: "প্রহরে সংরক্ষিত, অপেক্ষমাণ",
  },
  delivered: {
    en: "Delivered to the demo care queue",
    bn: "ডেমো সেবা তালিকায় পৌঁছেছে",
  },
  acknowledged: { en: "A provider has seen it", bn: "একজন সেবাদাতা দেখেছেন" },
  responded: { en: "A provider responded", bn: "সেবাদাতা উত্তর দিয়েছেন" },
  closed: { en: "Closed", bn: "বন্ধ" },
};

export function MotherDashboard({ profile }: { profile?: OwnProfile }) {
  const { t, language } = useLanguage();
  const [records, setRecords] = useState<Load<Records>>({ state: "loading" });
  const [wellness, setWellness] = useState<Load<CheckIn[]>>({
    state: "loading",
  });
  const [requests, setRequests] = useState<Load<SupportRequest[]>>({
    state: "loading",
  });
  const hour = useSyncExternalStore(subscribeNever, dhakaHour, () => null);
  const today = useSyncExternalStore(subscribeNever, dhakaToday, () => null);

  const locale = language === "bn" ? "bn-BD" : "en-GB";
  const num = (value: number) => new Intl.NumberFormat(locale).format(value);
  const day = (value: number | string, style: "medium" | "short" = "medium") =>
    new Intl.DateTimeFormat(locale, {
      ...(style === "short"
        ? { day: "numeric", month: "short" }
        : { dateStyle: "medium" }),
      timeZone: typeof value === "number" ? "UTC" : "Asia/Dhaka",
    }).format(new Date(value));

  const loadRecords = useCallback(() => {
    setRecords({ state: "loading" });
    getJson<Records>("/api/jibonrekha").then(
      (data) => setRecords({ state: "ready", data }),
      () => setRecords({ state: "error" }),
    );
  }, []);
  const loadRest = useCallback(() => {
    getJson<{ entries: CheckIn[] }>("/api/wellness").then(
      (data) => setWellness({ state: "ready", data: data.entries }),
      () => setWellness({ state: "error" }),
    );
    // This device only remembers request IDs; status is always re-read from the server.
    Promise.all(
      readRequestIds()
        .slice(0, 3)
        .map((id) =>
          getJson<{ data: unknown }>(`/api/care-requests/${id}`)
            .then((body) => supportRequestSchema.safeParse(body.data))
            .then(
              (parsed) => (parsed.success ? parsed.data : null),
              () => null,
            ),
        ),
    ).then((items) =>
      setRequests({
        state: "ready",
        data: items.filter((item): item is SupportRequest => item !== null),
      }),
    );
  }, []);
  useEffect(() => {
    void Promise.resolve().then(() => {
      loadRecords();
      loadRest();
    });
  }, [loadRecords, loadRest]);

  const pregnancy =
    records.state === "ready" ? records.data.pregnancies[0] : undefined;
  const dating =
    records.state === "ready" && today !== null
      ? datePregnancy(pregnancy, today)
      : null;
  const lastCheckIn =
    wellness.state === "ready"
      ? [...wellness.data].sort((a, b) =>
          b.occurred_at.localeCompare(a.occurred_at),
        )[0]
      : undefined;
  const latestRequest =
    requests.state === "ready"
      ? [...requests.data].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        )[0]
      : undefined;
  const nextVisit =
    records.state === "ready" && today !== null
      ? (records.data.visits ?? [])
          .filter((visit) => Date.parse(visit.occurred_at) >= today)
          .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))[0]
      : undefined;

  const name = profile?.display_name?.trim();
  const greeting: Text =
    hour === null
      ? { en: "Welcome back", bn: "স্বাগতম" }
      : hour < 12
        ? { en: "Good morning", bn: "শুভ সকাল" }
        : hour < 17
          ? { en: "Good afternoon", bn: "শুভ দুপুর" }
          : { en: "Good evening", bn: "শুভ সন্ধ্যা" };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
      {/* ════ Main column ════ */}
      <div className="grid min-w-0 gap-6">
        <header className="flex items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <p className={eyebrow}>
              {t({ en: "A little care, every day", bn: "প্রতিদিন একটু যত্ন" })}
            </p>
            <h1 className="[font-family:var(--font-roboto-slab),var(--font-noto-serif-bn),serif] text-4xl font-normal leading-tight text-pro-text sm:text-[2.75rem]">
              {t(greeting)}
              {name ? "," : "."}
              {name && (
                <>
                  <br />
                  {name}.
                </>
              )}
            </h1>
            <p className="text-pro-muted">
              {t({
                en: "Everything important, in one gentle place.",
                bn: "দরকারি সবকিছু, এক শান্ত জায়গায়।",
              })}
            </p>
          </div>
          {dating?.kind === "dated" && (
            <span className="mt-2 inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-pro-surface px-3 py-1 text-sm font-semibold text-pro-primary">
              <Heart size={14} aria-hidden="true" />
              {num(dating.weeks)} {t({ en: "weeks", bn: "সপ্তাহ" })}
            </span>
          )}
        </header>

        <JourneyCard
          records={records}
          dating={dating}
          pregnancy={pregnancy}
          onRetry={loadRecords}
          num={num}
          day={day}
        />

        <section aria-labelledby="dash-tasks" className="grid gap-3">
          <h2 id="dash-tasks" className="text-lg font-semibold text-pro-text">
            {t({ en: "What would you like to do?", bn: "আপনি কী করতে চান?" })}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <Tile
              href="/app/ask"
              icon={MessageCircle}
              label={{ en: "Ask PROHOR", bn: "প্রহরকে জিজ্ঞাসা" }}
            />
            <Tile
              href="/app/jibonrekha"
              icon={Activity}
              label={{ en: "Log my health", bn: "স্বাস্থ্য তথ্য লিখুন" }}
            />
            <Tile
              href="/app/bujhi"
              icon={FolderOpen}
              label={{ en: "Understand a report", bn: "রিপোর্ট বুঝুন" }}
            />
            <Tile
              href="/app/poth"
              icon={MapPin}
              label={{ en: "Find care near me", bn: "কাছের সেবা খুঁজুন" }}
            />
          </ul>
        </section>

        <ListCard title={{ en: "Today's essentials", bn: "আজকের জরুরি কাজ" }}>
          <Row
            href="/app/wellbeing"
            icon={Smile}
            title={{ en: "Check in with yourself", bn: "নিজের খোঁজ নিন" }}
            detail={
              lastCheckIn
                ? {
                    en: `Last check-in ${day(lastCheckIn.occurred_at, "short")}${lastCheckIn.mood ? `, feeling ${moodLabel[lastCheckIn.mood]?.en ?? ""}` : ""}`,
                    bn: `শেষ চেক-ইন ${day(lastCheckIn.occurred_at, "short")}${lastCheckIn.mood ? `, ${moodLabel[lastCheckIn.mood]?.bn ?? ""}` : ""}`,
                  }
                : {
                    en: "Optional and private, skip any day",
                    bn: "ঐচ্ছিক ও ব্যক্তিগত, যেকোনো দিন বাদ দিন",
                  }
            }
          />
          <Row
            href={
              latestRequest
                ? `/app/care/status?id=${encodeURIComponent(latestRequest.id)}`
                : "/app/care"
            }
            icon={HandHeart}
            title={{
              en: "Talk to a care worker",
              bn: "সেবাকর্মীর সঙ্গে কথা বলুন",
            }}
            detail={
              latestRequest
                ? requestLabel[latestRequest.status]
                : {
                    en: "Ask for a human follow-up, your way",
                    bn: "নিজের মতো করে মানুষের সাহায্য চান",
                  }
            }
          />
          <Row
            href="/safety"
            icon={ShieldCheck}
            title={{ en: "Know the warning signs", bn: "সতর্কতার লক্ষণ জানুন" }}
            detail={{
              en: "Reviewed information, no chat needed",
              bn: "যাচাইকৃত তথ্য, চ্যাট লাগবে না",
            }}
          />
          <Row
            href="/app/accessibility"
            icon={Accessibility}
            title={{
              en: "Adjust how you use PROHOR",
              bn: "প্রহর নিজের মতো সাজান",
            }}
            detail={{
              en: "Text size, contrast, language, reading aloud",
              bn: "লেখার আকার, কনট্রাস্ট, ভাষা, পড়ে শোনানো",
            }}
          />
        </ListCard>

        <RecentRecords records={records} onRetry={loadRecords} day={day} />
      </div>

      {/* ════ Side column ════ */}
      <div className="grid min-w-0 gap-5">
        <section
          aria-labelledby="dash-wellbeing"
          className={`${card} grid gap-4 p-5`}
        >
          <CardHead
            id="dash-wellbeing"
            title={{ en: "For your wellbeing", bn: "আপনার সুস্থতার জন্য" }}
            href="/app/wellbeing"
            action={{ en: "Explore", bn: "দেখুন" }}
          />
          <WellbeingArt />
          <div className="flex gap-3 rounded-field bg-pro-surface/70 p-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-pro-elevated text-pro-primary">
              <Leaf size={15} aria-hidden="true" />
            </span>
            <p className="text-sm leading-relaxed text-pro-muted">
              <span className="block font-semibold text-pro-text">
                {t({ en: "A note for today", bn: "আজকের জন্য একটি কথা" })}
              </span>
              {t({
                en: "Choose a small moment of rest, and make room for your needs too.",
                bn: "একটু বিশ্রামের সময় বেছে নিন, নিজের প্রয়োজনকেও জায়গা দিন।",
              })}
            </p>
          </div>
          <Link
            href="/app/wellbeing"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-field bg-pro-surface font-semibold text-pro-primary hover:bg-pro-surface-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          >
            {t({
              en: "Check in or write my diary",
              bn: "চেক-ইন বা ডায়েরি লিখুন",
            })}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section
          aria-labelledby="dash-upcoming"
          className={`${card} grid gap-3 p-5`}
        >
          <CardHead
            id="dash-upcoming"
            title={{ en: "Upcoming care", bn: "আসন্ন চেকআপ" }}
            href="/app/jibonrekha"
            action={{ en: "View all", bn: "সব দেখুন" }}
          />
          {nextVisit ? (
            <div className="flex items-center gap-3">
              <DateChip value={nextVisit.occurred_at} locale={locale} />
              <div className="grid min-w-0">
                <p className="font-semibold text-pro-text">
                  {t({ en: "Visit you saved", bn: "আপনার সংরক্ষিত চেকআপ" })}
                </p>
                <p className="truncate text-sm text-pro-muted">
                  {nextVisit.place_note ||
                    t({ en: "No place added", bn: "স্থান যোগ করা হয়নি" })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-pro-muted">
              {records.state === "loading"
                ? t({ en: "Loading…", bn: "আনা হচ্ছে…" })
                : t({
                    en: "No upcoming visit saved. Add your next check-up to keep it on your timeline.",
                    bn: "পরের কোনো চেকআপ সংরক্ষিত নেই। টাইমলাইনে রাখতে পরের চেকআপ যোগ করুন।",
                  })}
            </p>
          )}
        </section>

        <section
          aria-labelledby="dash-circle"
          className={`${card} grid gap-3 p-5`}
        >
          <CardHead
            id="dash-circle"
            title={{ en: "Your care circle", bn: "আপনার কেয়ার সার্কেল" }}
            href="/app/care"
            action={{ en: "Manage", bn: "পরিচালনা" }}
          />
          <p className="text-sm leading-relaxed text-pro-muted">
            {t({
              en: "You decide who may see your information. Sharing is off until you choose who, what and why, and press Send.",
              bn: "আপনার তথ্য কে দেখবে আপনিই ঠিক করেন। কাকে, কী, কেন বেছে পাঠান না চাপা পর্যন্ত শেয়ার বন্ধ থাকে।",
            })}
          </p>
          {latestRequest && (
            <p className="w-fit rounded-pill bg-pro-surface px-3 py-1 text-sm font-semibold text-pro-primary">
              {t(requestLabel[latestRequest.status])}
            </p>
          )}
        </section>

        <section
          aria-labelledby="dash-help"
          className="grid gap-3 rounded-card border border-pro-danger/40 bg-pro-elevated p-5"
        >
          <h2 id="dash-help" className="font-semibold text-pro-text">
            {t({ en: "Worried right now?", bn: "এখনই চিন্তা হচ্ছে?" })}
          </h2>
          <p className="text-sm text-pro-muted">
            {t({
              en: "Don't wait for an app or a reply. Get care now.",
              bn: "অ্যাপ বা উত্তরের জন্য অপেক্ষা করবেন না। এখনই সেবা নিন।",
            })}
          </p>
          <a
            href="tel:999"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-field bg-pro-danger px-4 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          >
            <PhoneCall size={16} aria-hidden="true" />
            {t({ en: "Call 999", bn: "৯৯৯-এ কল করুন" })}
          </a>
        </section>

        <p className="rounded-field bg-pro-surface/70 px-4 py-3 text-sm leading-relaxed text-pro-muted">
          {t({
            en: "Demo: use fictional information only. Care providers are simulated; no diagnosis or emergency response is connected.",
            bn: "ডেমো: শুধু কাল্পনিক তথ্য ব্যবহার করুন। সেবাদাতারা সিমুলেটেড; কোনো রোগ নির্ণয় বা জরুরি সেবা যুক্ত নেই।",
          })}
        </p>
      </div>
    </div>
  );
}

/* ═══ Pregnancy journey (Jibonrekha) ═══ */

function JourneyCard({
  records,
  dating,
  pregnancy,
  onRetry,
  num,
  day,
}: {
  records: Load<Records>;
  dating: Dating | null;
  pregnancy?: Pregnancy;
  onRetry: () => void;
  num: (n: number) => string;
  day: (v: number) => string;
}) {
  const { t } = useLanguage();
  const trimester: Text[] = [
    { en: "First trimester", bn: "প্রথম ত্রৈমাসিক" },
    { en: "Second trimester", bn: "দ্বিতীয় ত্রৈমাসিক" },
    { en: "Third trimester", bn: "তৃতীয় ত্রৈমাসিক" },
  ];
  let body: ReactNode;

  if (records.state === "error") {
    body = (
      <div role="alert" className="grid gap-3">
        <p>
          {t({
            en: "Your pregnancy record could not load. Nothing was changed.",
            bn: "গর্ভাবস্থার রেকর্ড আনা যায়নি। কিছুই বদলায়নি।",
          })}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-field border border-pro-border bg-pro-elevated px-4 font-semibold text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus"
        >
          <RotateCw size={15} aria-hidden="true" />
          {t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}
        </button>
      </div>
    );
  } else if (dating === null) {
    body = (
      <div aria-hidden="true" className="grid gap-4">
        <div className="h-14 w-48 animate-pulse rounded-field bg-pro-surface-2 motion-reduce:animate-none" />
        <div className="h-1.5 animate-pulse rounded-pill bg-pro-surface-2 motion-reduce:animate-none" />
      </div>
    );
  } else if (dating.kind === "dated") {
    const weeks = Array.from(
      { length: 7 },
      (_, index) => dating.weeks - 6 + index,
    ).filter((week) => week >= 1);
    body = (
      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="[font-family:var(--font-roboto-slab),var(--font-noto-serif-bn),serif] text-6xl leading-none text-pro-text">
              {num(dating.weeks)}
            </span>
            <span className="grid">
              <span className="text-lg font-semibold text-pro-text">
                {t({ en: "weeks", bn: "সপ্তাহ" })}
                {dating.days > 0 && (
                  <span className="font-normal text-pro-muted">
                    {" "}
                    + {num(dating.days)}{" "}
                    {t({ en: dating.days === 1 ? "day" : "days", bn: "দিন" })}
                  </span>
                )}
              </span>
              <span className="text-sm text-pro-muted">
                {t(trimester[dating.trimester - 1])} ·{" "}
                {t({
                  en: `${dating.weeks} of 40 weeks`,
                  bn: `৪০ সপ্তাহের ${num(dating.weeks)}`,
                })}
              </span>
            </span>
          </div>
          {/* Decorative recent-weeks bars; the text above carries the meaning. */}
          <div aria-hidden="true" className="flex items-end gap-1.5">
            {weeks.map((week, index) => (
              <span key={week} className="grid justify-items-center gap-1">
                <span
                  className={`w-5 rounded-t-[6px] ${week === dating.weeks ? "bg-pro-primary" : "bg-pro-primary/30"}`}
                  style={{ height: `${18 + (index + 7 - weeks.length) * 7}px` }}
                />
                <span className="text-[0.7rem] text-pro-muted">
                  {num(week)}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <div
            className="h-1.5 overflow-hidden rounded-pill bg-pro-elevated"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-pill bg-pro-primary"
              style={{
                width: `${Math.min(100, ((dating.weeks + dating.days / 7) / 40) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between gap-2 text-xs text-pro-muted">
            <span>{t({ en: "Week 1", bn: "সপ্তাহ ১" })}</span>
            <span>
              {t({ en: "Due", bn: "প্রত্যাশিত" })} {day(dating.due)}
            </span>
            <span>{t({ en: "Week 40", bn: "সপ্তাহ ৪০" })}</span>
          </div>
        </div>
        <p className="text-xs text-pro-muted">
          {t({
            en: "Estimated from the date you saved. Your clinician's dating comes first.",
            bn: "আপনার দেওয়া তারিখ থেকে আনুমানিক। চিকিৎসকের হিসাবই প্রধান।",
          })}
        </p>
      </div>
    );
  } else {
    const copy =
      dating.kind === "none"
        ? {
            title: {
              en: "Start your pregnancy record",
              bn: "গর্ভাবস্থার রেকর্ড শুরু করুন",
            },
            cta: { en: "Create my record", bn: "রেকর্ড তৈরি করুন" },
          }
        : dating.kind === "no-date"
          ? {
              title: {
                en: "Add your due date to follow your weeks",
                bn: "সপ্তাহ দেখতে প্রত্যাশিত তারিখ যোগ করুন",
              },
              cta: { en: "Add due date", bn: "তারিখ যোগ করুন" },
            }
          : {
              title: {
                en: "Your saved due date has passed",
                bn: "সংরক্ষিত প্রসবের তারিখ পার হয়েছে",
              },
              cta: { en: "Update my records", bn: "রেকর্ড হালনাগাদ করুন" },
            };
    body = (
      <div className="grid gap-3">
        <p className="font-display text-2xl text-pro-text">{t(copy.title)}</p>
        <p className="max-w-[52ch] text-sm leading-relaxed text-pro-muted">
          {dating.kind === "past-due"
            ? t({
                en: "If your baby has arrived, you can add your baby's own record. Follow your clinician's advice.",
                bn: "শিশু জন্মালে শিশুর আলাদা রেকর্ড যোগ করতে পারেন। চিকিৎসকের পরামর্শ মেনে চলুন।",
              })
            : t({
                en: "Add the due date your clinician gave you, or the first day of your last period. PROHOR then shows your week and keeps your notes in one timeline.",
                bn: "চিকিৎসকের দেওয়া প্রত্যাশিত তারিখ বা শেষ মাসিকের প্রথম দিন দিন। প্রহর তখন আপনার সপ্তাহ দেখাবে ও সব তথ্য এক টাইমলাইনে রাখবে।",
              })}
        </p>
        <Link
          href="/app/jibonrekha"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-field bg-pro-primary px-5 font-semibold text-pro-on-primary hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
        >
          {t(copy.cta)}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="dash-journey"
      aria-busy={records.state === "loading"}
      className="grid gap-5 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dash-journey" className="text-sm font-semibold text-pro-text">
          {t({ en: "Your pregnancy journey", bn: "আপনার গর্ভকালীন যাত্রা" })}
          {pregnancy?.label && (
            <span className="font-normal text-pro-muted">
              {" "}
              · {pregnancy.label}
            </span>
          )}
        </h2>
        <Link
          href="/app/jibonrekha"
          className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-pro-primary underline underline-offset-4"
        >
          {t({ en: "View journey", bn: "পুরো যাত্রা দেখুন" })}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      {body}
    </section>
  );
}

/* ═══ Recent records (Jibonrekha), real values only ═══ */

function RecentRecords({
  records,
  onRetry,
  day,
}: {
  records: Load<Records>;
  onRetry: () => void;
  day: (v: string, s?: "medium" | "short") => string;
}) {
  const { t } = useLanguage();
  if (records.state === "loading") return null;
  if (records.state === "error") {
    return (
      <p className="text-sm text-pro-muted">
        {t({
          en: "Recent records could not load.",
          bn: "সাম্প্রতিক রেকর্ড আনা যায়নি।",
        })}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 font-semibold text-pro-primary underline"
        >
          {t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}
        </button>
      </p>
    );
  }
  const superseded = new Set(
    records.data.corrections.map((item) => item.old_observation_id),
  );
  const latest = records.data.observations
    .filter((item) => !superseded.has(item.id))
    .slice(0, 3);
  return (
    <ListCard
      title={{ en: "Your care, in one place", bn: "আপনার যত্ন, এক জায়গায়" }}
      href="/app/jibonrekha"
      action={{ en: "See timeline", bn: "টাইমলাইন দেখুন" }}
    >
      {latest.length === 0 ? (
        <li className="py-3 text-sm text-pro-muted">
          {t({
            en: "Nothing saved yet. Your readings and notes will appear here with their date and unit.",
            bn: "এখনও কিছু সংরক্ষিত নেই। আপনার তথ্য ও নোট তারিখ ও এককসহ এখানে দেখাবে।",
          })}
        </li>
      ) : (
        latest.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-pro-surface text-pro-primary">
              {item.subject === "baby" ? (
                <Baby size={16} aria-hidden="true" />
              ) : (
                <Activity size={16} aria-hidden="true" />
              )}
            </span>
            <span className="grid min-w-0 flex-1">
              <span className="font-semibold text-pro-text">
                {item.subject === "baby"
                  ? t({ en: "Baby · ", bn: "শিশু · " })
                  : ""}
                {t(
                  measurement[item.kind] ?? {
                    en: item.kind.replaceAll("_", " "),
                    bn: item.kind.replaceAll("_", " "),
                  },
                )}
                {item.kind !== "note" && (
                  <span className="font-normal">
                    {" "}
                    · {item.value} {unitLabel(item.unit)}
                  </span>
                )}
              </span>
              <span className="text-sm text-pro-muted">
                {day(item.observed_at, "short")} ·{" "}
                {item.source === "document_extracted"
                  ? t({
                      en: "from a report you checked",
                      bn: "রিপোর্ট থেকে, আপনি যাচাই করেছেন",
                    })
                  : t({ en: "recorded by you", bn: "আপনি লিখেছেন" })}
              </span>
            </span>
          </li>
        ))
      )}
    </ListCard>
  );
}

/* ═══ Small building blocks ═══ */

function CardHead({
  id,
  title,
  href,
  action,
}: {
  id: string;
  title: Text;
  href: string;
  action: Text;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 id={id} className="font-semibold text-pro-text">
        {t(title)}
      </h2>
      <Link
        href={href}
        className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-pro-primary underline underline-offset-4"
      >
        {t(action)}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

function ListCard({
  title,
  href,
  action,
  children,
}: {
  title: Text;
  href?: string;
  action?: Text;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const id = `dash-${title.en.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={`${card} px-5 pb-2 pt-4`}>
      {href && action ? (
        <CardHead id={id} title={title} href={href} action={action} />
      ) : (
        <h2 id={id} className="font-semibold text-pro-text">
          {t(title)}
        </h2>
      )}
      <ul className="mt-1 divide-y divide-pro-border">{children}</ul>
    </section>
  );
}

function Tile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: Text;
}) {
  const { t } = useLanguage();
  return (
    <li>
      <Link
        href={href}
        className={`${card} group flex min-h-16 items-center gap-3 px-4 transition-[border-color,box-shadow] duration-200 hover:border-pro-primary/50 hover:shadow-pro-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus motion-reduce:transition-none`}
      >
        <Icon
          size={19}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0 text-pro-primary"
        />
        <span className="flex-1 font-semibold text-pro-text">{t(label)}</span>
        <ArrowRight
          size={17}
          aria-hidden="true"
          className="shrink-0 text-pro-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-pro-primary motion-reduce:transition-none"
        />
      </Link>
    </li>
  );
}

function Row({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: LucideIcon;
  title: Text;
  detail: Text;
}) {
  const { t } = useLanguage();
  return (
    <li>
      <Link
        href={href}
        className="group -mx-2 flex min-h-16 items-center gap-3 rounded-field px-2 py-2.5 hover:bg-pro-surface/50 focus-visible:outline-3 focus-visible:outline-pro-focus"
      >
        <Icon
          size={19}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0 text-pro-primary"
        />
        <span className="grid min-w-0 flex-1">
          <span className="font-semibold text-pro-text">{t(title)}</span>
          <span className="text-sm text-pro-muted">{t(detail)}</span>
        </span>
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-pro-muted group-hover:text-pro-primary"
        />
      </Link>
    </li>
  );
}

function DateChip({ value, locale }: { value: string; locale: string }) {
  const date = new Date(value);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone: "Asia/Dhaka",
    }).format(date);
  return (
    <span className="grid w-14 shrink-0 justify-items-center rounded-field bg-pro-surface py-1.5 text-pro-primary">
      <span className="font-display text-xl font-semibold leading-none">
        {part({ day: "numeric" })}
      </span>
      <span className="text-xs font-semibold">{part({ month: "short" })}</span>
    </span>
  );
}

/** Original decorative illustration (theme tokens only): hills, sun and two sprouts. */
function WellbeingArt() {
  return (
    <svg
      viewBox="0 0 320 120"
      aria-hidden="true"
      className="h-auto w-full overflow-hidden rounded-field"
    >
      <rect width="320" height="120" fill="var(--pro-surface)" />
      <circle cx="262" cy="22" r="34" fill="var(--pro-accent)" opacity="0.28" />
      <path
        d="M0 92 C70 62 130 70 190 86 S290 98 320 80 V120 H0 Z"
        fill="var(--pro-primary)"
        opacity="0.16"
      />
      <path
        d="M0 104 C80 86 170 92 240 104 S300 110 320 104 V120 H0 Z"
        fill="var(--pro-primary)"
        opacity="0.24"
      />
      <g
        fill="none"
        stroke="var(--pro-primary)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M70 100 C70 82 66 70 58 58" />
        <path d="M66 74 C54 66 46 54 50 42 C62 46 68 58 66 74 Z" />
        <path d="M68 66 C78 54 92 50 100 54 C96 66 82 70 68 66 Z" />
        <path d="M266 104 C266 90 270 80 276 72" />
        <path d="M268 88 C256 84 248 74 250 64 C262 66 268 76 268 88 Z" />
        <path d="M272 78 C280 66 292 62 300 64 C298 76 286 82 272 78 Z" />
      </g>
    </svg>
  );
}
