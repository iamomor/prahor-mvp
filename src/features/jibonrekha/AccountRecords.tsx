"use client";

import Link from "next/link";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Baby, CalendarDays, CalendarPlus, ChevronRight, FileSearch, History, Info, PenLine, Plus, Printer, ShieldCheck } from "lucide-react";

import { LifelineArc } from "./LifelineArc";
import { CareGuide } from "./CareGuide";
import { AccountVisitPack } from "./AccountVisitPack";
import { accountJourney } from "./account-journey";
import { filterAccountHistory } from "./account-history";
import { selectAccountPregnancy, type GuideSelection } from "./account-records-model";

import { accountSourceLabel } from "./account-provenance";
import { ActionTile, Segmented, SubviewHeader, ViewSwitch, ui } from "./jibonrekha-ui";


type Pregnancy = {
  id: string;
  label: string;
  estimated_due_date: string | null;
  last_menstrual_period_date: string | null;
};
type Baby = {
  id: string;
  pregnancy_id: string | null;
  label: string;
  birth_date: string | null;
};
type Observation = {
  id: string;
  subject: "mother" | "baby";
  pregnancy_id?: string | null;
  baby_id?: string;
  kind: string;
  value: string;
  unit: string | null;
  observed_at: string;
  source: string;
  verification: string;
  source_note?: string | null;
};
type Condition = {
  id: string;
  pregnancy_id: string | null;
  label: string;
  documented_at: string;
  source_note: string | null;
};
type SymptomNote = {
  id: string;
  pregnancy_id: string | null;
  note: string;
  occurred_at: string;
};
type Visit = {
  id: string;
  subject: "mother" | "baby";
  pregnancy_id: string | null;
  baby_id: string | null;
  occurred_at: string;
  place_note: string | null;
  note: string | null;
};
type Correction = {
  id: string;
  subject: "mother" | "baby";
  old_observation_id: string;
  new_observation_id: string;
  reason: string;
  corrected_at: string;
};
type Records = {
  pregnancies: Pregnancy[];
  babies: Baby[];
  observations: Observation[];
  conditions: Condition[];
  symptomNotes: SymptomNote[];
  visits: Visit[];
  corrections: Correction[];
};

const labels: Record<string, string> = {
  weight: "ওজন",
  temperature: "তাপমাত্রা",
  systolic_blood_pressure: "উপরের রক্তচাপ",
  diastolic_blood_pressure: "নিচের রক্তচাপ",
  hemoglobin: "হিমোগ্লোবিন",
  glucose: "রক্তে গ্লুকোজ",
  fetal_heart_rate: "ভ্রূণের হৃদস্পন্দন",
  note: "নোট",
};
const choices = {
  mother: [
    ["weight", "kg"],
    ["temperature", "Cel"],
    ["systolic_blood_pressure", "mm[Hg]"],
    ["diastolic_blood_pressure", "mm[Hg]"],
    ["hemoglobin", "g/dL"],
    ["glucose", "mmol/L"],
    ["note", ""],
  ],
  baby: [
    ["weight", "kg"],
    ["temperature", "Cel"],
    ["fetal_heart_rate", "/min"],
    ["note", ""],
  ],
} as const;

const unitOptions: Record<string, string[]> = {
  weight: ["kg", "g"],
  temperature: ["Cel", "[degF]"],
  glucose: ["mmol/L", "mg/dL"],
};

type Task = "home" | "guide" | "share" | "observation" | "pregnancy" | "baby" | "note" | "visit" | "records";

type RecordsTab = "measures" | "notes" | "visits" | "profiles";
const taskCopy: Record<Exclude<Task, "home" | "guide" | "share">, { title: string; description: string }> = {
  observation: { title: "মাপ বা নোট যোগ করুন", description: "কার নথি বেছে নিন, মান লিখুন, তারপর দেখে সংরক্ষণ করুন। প্রতিটি মানের তারিখ ও উৎস থাকে।" },
  records: { title: "ইতিহাস", description: "মা ও শিশুর নথি আলাদা থাকে। প্রতিটি মানের উৎস দেখা যায়; সংশোধন করলে আগের মানও রাখা থাকে।" },
  pregnancy: { title: "গর্ভকালের নথি যোগ করুন", description: "আপনার জানা তারিখ লিখুন। সম্ভাব্য প্রসবের তারিখ চিকিৎসকের নথির সঙ্গে মিলিয়ে নিন।" },
  baby: { title: "শিশুর নথি যোগ করুন", description: "প্রতিটি শিশুর নথি আলাদা। একই গর্ভকালের সঙ্গে একাধিক শিশু যুক্ত করা যায়।" },
  note: { title: "স্বাস্থ্য নোট লিখুন", description: "এটি আপনার নিজের লেখা। কোনো রোগনির্ণয় তৈরি হয় না।" },
  visit: { title: "ভিজিট লিখুন", description: "যে ভিজিট হয়ে গেছে তার কথা রাখুন। এটি অ্যাপয়েন্টমেন্ট বুক করে না, সেবাদাতাকে কিছু পাঠায় না।" },
};
const subjectOptions = [{ value: "mother" as const, label: "মা" }, { value: "baby" as const, label: "শিশু" }];
const pageSize = 10;


function today() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function formatBnDate(value: string) {
  return new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(value));
}
function formatBnDay(value: string) {
  return new Intl.DateTimeFormat("bn-BD", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

const bengaliNumber = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
const subjectMark = (subject: "mother" | "baby") => subject === "mother"
  ? <span className="inline-block size-3 shrink-0 rounded-full bg-pro-primary" aria-hidden="true" />
  : <span className="inline-block size-3 shrink-0 border-2 border-pro-primary" aria-hidden="true" />;
function provenanceClass(item: Observation) {
  if (item.source === "document_extracted" && item.verification !== "user_verified") return `${ui.tag} border-[1.5px] border-dashed border-pro-warning bg-pro-warning-soft text-pro-warning`;
  if (item.source === "document_extracted") return `${ui.tag} border-[1.5px] border-dashed border-pro-control-border`;
  if (item.verification === "clinician_confirmed") return `${ui.tag} bg-pro-success-soft text-pro-success`;
  return ui.tag;
}

export function AccountRecords() {
  const [records, setRecords] = useState<Records | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState<"mother" | "baby">("mother");
  const [kind, setKind] = useState("weight");
  const [unit, setUnit] = useState("kg");
  const [pregnancyId, setPregnancyId] = useState("");
  const [babyId, setBabyId] = useState("");
  const [historySubject, setHistorySubject] = useState<"both" | "mother" | "baby">("both");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyKind, setHistoryKind] = useState("all");
  const [historyLimit, setHistoryLimit] = useState(pageSize);
  const [recordsTab, setRecordsTab] = useState<RecordsTab>("measures");
  const [noteKind, setNoteKind] = useState<"symptom" | "condition">("symptom");
  const [task, setTask] = useState<Task>("home");
  const taskHeading = useRef<HTMLHeadingElement>(null);
  const homeHeading = useRef<HTMLHeadingElement>(null);
  const statusFocus = useRef<HTMLParagraphElement>(null);
  const errorFocus = useRef<HTMLDivElement>(null);
  const pendingRequests = useRef(new Map<string, string>());
  const savingRequest = useRef(false);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [pendingObservation, setPendingObservation] = useState<{ payload: unknown; form: HTMLFormElement; summary: string } | null>(null);
  const [guideSelections, setGuideSelections] = useState<Record<string, GuideSelection | null>>({});
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  function openTask(next: Task, tab?: RecordsTab) {
    setTask(next);
    if (tab) setRecordsTab(tab);
    const heading = next === "home" ? homeHeading : taskHeading;
    requestAnimationFrame(() => heading.current?.focus());
  }
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/jibonrekha", { cache: "no-store" });
      if (!response.ok)

        throw new Error("নথি আনা যায়নি। আবার চেষ্টা করুন।");
      const next = (await response.json()) as Records;

      setRecords(next);
      setBabyId((previous) => next.babies.some((baby) => baby.id === previous) ? previous : "");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message

          : "নথি আনা যায়নি।",

      );
      requestAnimationFrame(() => errorFocus.current?.focus());
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function save(payload: unknown, form: HTMLFormElement, label: string, afterTab: RecordsTab) {
    if (savingRequest.current) return false;
    savingRequest.current = true;

    setBusy(true);
    setError("");
    setMessage("");
    const body = JSON.stringify(payload);
    const key = pendingRequests.current.get(body) ?? crypto.randomUUID();
    pendingRequests.current.set(body, key);
    try {
      const response = await fetch("/api/jibonrekha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body,
      });
      const result = (await response.json().catch(() => null)) as {
        saved?: boolean;
        id?: string;
        message?: string;

      };
      if (!response.ok || !result.saved || !result.id)
        throw new Error(
          result.message ||
            "কিছু সংরক্ষণ হয়নি। ঘরগুলো দেখে আবার চেষ্টা করুন।",
        );
      pendingRequests.current.delete(body);
      setMessage(`${label} আপনার অ্যাকাউন্টে সংরক্ষিত হয়েছে। কাউকে পাঠানো হয়নি।`);

      form.reset();
      setCorrectingId(null);
      await load();
      openTask("records", afterTab);
      requestAnimationFrame(() => statusFocus.current?.focus());
      return true;
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? "সংরক্ষণ নিশ্চিত হয়নি। সংযোগ দেখে একই তথ্য আবার চেষ্টা করুন।"
          : cause instanceof Error
          ? cause.message

          : "কিছু সংরক্ষণ হয়নি। সংযোগ দেখে আবার চেষ্টা করুন।",

      );
      requestAnimationFrame(() => errorFocus.current?.focus());
      return false;
    } finally {
      savingRequest.current = false;
      setBusy(false);
    }
  }
  function selectSubject(next: "mother" | "baby") {
    setSubject(next);
    setKind("weight");
    setUnit("kg");
  }

  const visibleBabies =
    records?.babies.filter(
      (baby) => !pregnancyId || baby.pregnancy_id === pregnancyId,
    ) ?? [];
  const selectedBabyId = visibleBabies.some((baby) => baby.id === babyId)
    ? babyId
    : "";
  const superseded = new Set(
    records?.corrections.map((item) => item.old_observation_id) ?? [],
  );
  const activeObservations =
    records?.observations.filter((item) => !superseded.has(item.id)) ?? [];
  const visible = filterAccountHistory(activeObservations, records?.babies ?? [], { subject: historySubject, pregnancyId, babyId: selectedBabyId, kind: historyKind, query: historyQuery }, labels);
  const shown = visible.slice(0, historyLimit);
  function historyFor(id: string) {
    const history: { record: Observation; reason: string }[] = [];
    let current = id;
    while (records && history.length < 20) {
      const correction = records.corrections.find(
        (item) => item.new_observation_id === current,
      );
      if (!correction) break;
      const previous = records.observations.find(
        (item) => item.id === correction.old_observation_id,
      );
      if (!previous) break;
      history.push({ record: previous, reason: correction.reason });
      current = previous.id;
    }
    return history;
  }
  const selectedPregnancy = records ? selectAccountPregnancy(records.pregnancies, pregnancyId) : undefined;
  const journey = selectedPregnancy ? accountJourney(selectedPregnancy, today()) : null;
  const guideKey = selectedPregnancy?.id ?? "no-pregnancy";
  const guideSelection = guideSelections[guideKey] ?? null;
  const shownJourney = journey && guideSelection ? { weeks: guideSelection.week, days: guideSelection.day } : journey;
  const previewing = journey !== null && guideSelection !== null;

  const recent = [...activeObservations].sort((a, b) => b.observed_at.localeCompare(a.observed_at));
  const currentBabyIds = new Set(records?.babies.filter((item) => !selectedPregnancy || item.pregnancy_id === selectedPregnancy.id).map((item) => item.id) ?? []);

  const sortedVisits = [...(records?.visits ?? [])].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  const recentVisit = sortedVisits[0] ?? null;
  const notesCount = (records?.conditions.length ?? 0) + (records?.symptomNotes.length ?? 0);
  const pregnancySelect = (name: string) => <select name={name} className={ui.input}>
    <option value="">কোনো গর্ভকাল বেছে নেওয়া নেই</option>
    {records?.pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
  </select>;
  const babySelect = <label className={ui.field}>কোন শিশুর নথি
    <select value={selectedBabyId} disabled={pendingObservation !== null} onChange={(event) => setBabyId(event.target.value)} className={ui.input}>
      <option value="">শিশুর নথি বেছে নিন</option>
      {visibleBabies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    {!visibleBabies.length && <span className={ui.hint}>এখনও শিশুর নথি নেই। <button type="button" onClick={() => openTask("baby")} className="font-semibold text-pro-primary underline underline-offset-4">আগে শিশুর নথি খুলুন</button></span>}
  </label>;
  const dateField = (label: string) => <label className={ui.field}>{label}
    <input name="date" type="date" defaultValue={today()} max={today()} required className={ui.input} />
  </label>;
  const formActions = (saveLabel: string, disabled = false) => <div className="flex flex-wrap items-center gap-3 border-t border-pro-border pt-4">
    <button type="submit" disabled={busy || disabled} className={`${ui.primary} max-sm:w-full`}>{busy ? "সংরক্ষণ হচ্ছে…" : saveLabel}</button>
    <button type="button" onClick={() => openTask("home")} className={`${ui.secondary} max-sm:w-full`}>বাতিল</button>
    <span className={ui.tag}>অ্যাকাউন্টে থাকবে · কাউকে পাঠানো হবে না</span>
  </div>;
  const formCard = `${ui.card} grid max-w-2xl gap-5`;

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-6 text-pro-text sm:px-6" lang="bn">
      {task === "home" ? <header className="grid gap-1">
        <p className="font-semibold text-pro-primary">প্রহর · জীবনরেখা</p>
        <h1 ref={homeHeading} tabIndex={-1} className="text-4xl font-semibold leading-tight focus-visible:outline-3 focus-visible:outline-pro-focus">জীবনরেখা</h1>
        <p className="text-pro-muted">আপনার ও শিশুর যাত্রা, এক রেখায়।</p>

      </header>
        : task !== "guide" && task !== "share" && <SubviewHeader title={taskCopy[task].title} description={taskCopy[task].description} onBack={() => openTask("home")} headingRef={taskHeading} />}
      {message && <p ref={statusFocus} tabIndex={-1} role="status" className="rounded-field border border-pro-success bg-pro-success-soft p-4 focus-visible:outline-3 focus-visible:outline-pro-focus">{message}</p>}
      {error && (
        <div ref={errorFocus} tabIndex={-1} className="grid gap-3 rounded-field border border-pro-danger bg-pro-danger-soft p-4 focus-visible:outline-3 focus-visible:outline-pro-focus">
          <p role="alert" className="font-semibold text-pro-danger">{error}</p>
          {!records && !loading && (

            <button type="button" onClick={() => void load()} className={`${ui.primary} w-fit`}>
              আবার চেষ্টা করুন

            </button>
          )}
        </div>
      )}
      {loading ? (

        <p role="status" className="text-pro-muted">নথি আনা হচ্ছে…</p>
      ) : (
        records && (
          <>
            {task === "home" && <>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(17rem,1fr)]">
                <section className="grid min-w-0 content-start gap-4 rounded-hero bg-pro-primary p-5 text-pro-on-primary sm:p-6" aria-label="গর্ভকালের রেখা">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    {records.pregnancies.length > 1
                      ? <label className="grid min-w-0 gap-1 text-sm font-semibold text-pro-on-primary-muted">কোন গর্ভকাল দেখছেন
                        <select value={selectedPregnancy?.id ?? ""} onChange={(event) => setPregnancyId(event.target.value)} className="min-h-11 w-full min-w-0 max-w-full rounded-field border-0 bg-pro-elevated px-3 text-base font-semibold text-pro-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-on-primary">{records.pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
                      </label>
                      : <p className="font-semibold [overflow-wrap:anywhere]">{selectedPregnancy?.label ?? "আমার গর্ভকাল"}</p>}
                    <p className="text-sm text-pro-on-primary-muted">আজ {formatBnDate(today())}</p>
                  </div>
                  {journey ? <>
                    <div className="relative mx-auto w-full max-w-xs pb-8 max-[360px]:pb-10">
                      <LifelineArc weeks={shownJourney!.weeks} days={shownJourney!.days} />
                      <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] text-center min-[360px]:top-[6.75rem]" aria-hidden="true">
                        <p className="text-[clamp(1.125rem,5vw,1.5rem)] font-semibold leading-tight">{bengaliNumber(shownJourney!.weeks)} সপ্তাহ {bengaliNumber(shownJourney!.days)} দিন</p>
                        <p className="mt-1 text-sm leading-tight text-pro-on-primary-muted">{["প্রথম", "দ্বিতীয়", "তৃতীয়"][shownJourney!.weeks < 14 ? 0 : shownJourney!.weeks < 28 ? 1 : 2]} ত্রৈমাসিক</p>
                      </div>
                    </div>
                    <ol className="grid grid-cols-3 gap-1.5 text-center text-sm font-semibold" aria-label="ত্রৈমাসিক">
                      {["১ম", "২য়", "৩য়"].map((name, index) => {
                        const current = index === (shownJourney!.weeks < 14 ? 0 : shownJourney!.weeks < 28 ? 1 : 2);
                        const done = index < (shownJourney!.weeks < 14 ? 0 : shownJourney!.weeks < 28 ? 1 : 2);
                        return <li key={name} className={`border-t-[3px] pt-1 ${done || current ? "border-pro-accent" : "border-dashed border-pro-on-primary-muted"}`} aria-current={current ? "step" : undefined}>{name} ত্রৈমাসিক{current ? " · এখন" : ""}</li>;
                      })}
                    </ol>
                    {previewing && <p className="text-sm font-semibold text-pro-on-primary">গাইডে বাছা সপ্তাহের প্রিভিউ · নথির তারিখ বদলায়নি</p>}
                    <div className="border-t border-pro-on-primary-muted/50 pt-4"><p className="text-lg font-semibold">প্রসবের আনুমানিক তারিখ: {formatBnDate(journey.dueDate)}</p><p className="mt-1 text-sm text-pro-on-primary-muted">সূত্র: {journey.source} · হিসাবটি চিকিৎসকের নিশ্চিতকরণ নয়</p></div>
                  </> : <div className="grid gap-3 py-6"><p className="text-xl font-semibold">গর্ভকালের তারিখ এখনও দেখানো যাচ্ছে না</p><p className="text-pro-on-primary-muted">তারিখ না থাকলে বা সম্ভাব্য তারিখ পেরিয়ে গেলে সপ্তাহ অনুমান করে দেখানো হয় না।</p><button type="button" onClick={() => openTask("pregnancy")} className="inline-flex min-h-12 w-fit items-center gap-2 rounded-pill bg-pro-elevated px-5 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-on-primary"><Plus className="size-5" aria-hidden="true" />গর্ভকালের তারিখ যোগ করুন</button></div>}
                </section>
                <div className="grid min-w-0 content-start gap-4">
                  <button type="button" onClick={() => openTask("guide")} className="group flex min-h-[4.75rem] w-full items-center gap-3.5 rounded-card border-[1.5px] border-pro-primary bg-pro-surface p-3.5 text-left transition-colors duration-150 hover:bg-pro-surface-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
                    <span className="grid size-11 shrink-0 place-items-center rounded-field bg-pro-accent text-base font-semibold text-pro-on-accent" aria-hidden="true">{journey ? bengaliNumber(journey.weeks) : "১–৪১"}</span>
                    <span className="grid min-w-0 flex-1"><span className="text-lg font-semibold leading-snug">এই সপ্তাহের যত্ন</span><span className="text-sm text-pro-muted">পরীক্ষা, প্রশ্ন ও দৈনিক নোট · উৎসসহ</span></span>
                    <ChevronRight className="size-5 shrink-0 text-pro-primary transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                  </button>
                  <section className={`${ui.card} grid gap-3`} aria-labelledby="recent-visit-title">
                    <h2 id="recent-visit-title" className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="size-5 text-pro-primary" aria-hidden="true" />সাম্প্রতিক ভিজিট</h2>
                    {recentVisit ? <>
                      <p>{formatBnDate(recentVisit.occurred_at)} · {recentVisit.place_note || "স্থান লেখা নেই"}</p>
                      <span className={ui.tag}>আপনার লেখা · বুকিং নয়</span>
                    </> : <p className="text-pro-muted">এই অ্যাকাউন্টে এখনও কোনো ভিজিট লেখা নেই।</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <button type="button" onClick={() => openTask("visit")} className={`${ui.secondary} ${ui.small}`}><CalendarPlus className="size-4" aria-hidden="true" />ভিজিট লিখুন</button>
                      {recentVisit && <button type="button" onClick={() => openTask("records", "visits")} className={ui.link}>সব ভিজিট</button>}
                    </div>
                  </section>
                  <p className="flex gap-2.5 rounded-field bg-pro-info-soft p-4 text-pro-info"><ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />এই তথ্য শুধু আপনার অ্যাকাউন্টে আছে। কাউকে পাঠানো হয়নি।</p>
                </div>
              </div>

              <nav aria-labelledby="todo-title" className="grid gap-3">
                <h2 id="todo-title" className="text-2xl font-semibold">কী করতে চান?</h2>
                <ActionTile emphasis onClick={() => openTask("observation")} icon={<Plus className="size-6" />} title="নতুন মাপ বা নোট যোগ করুন" hint="ওজন, রক্তচাপ, হিমোগ্লোবিন, শিশুর হৃদস্পন্দন…" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ActionTile onClick={() => openTask("records", "measures")} icon={<History className="size-5" />} title="ইতিহাস" hint="সব মাপ, নোট ও সংশোধন" />
                  <ActionTile onClick={() => openTask("visit")} icon={<CalendarPlus className="size-5" />} title="ভিজিট লিখুন" hint="যে ভিজিট হয়ে গেছে" />
                  <ActionTile onClick={() => openTask("note")} icon={<PenLine className="size-5" />} title="স্বাস্থ্য নোট" hint="উপসর্গ বা নিজের লক্ষ্য করা অবস্থা" />
                  <ActionTile onClick={() => openTask("share")} icon={<Printer className="size-5" />} title="ভিজিটের প্যাকেট" hint="বেছে নিয়ে প্রিন্ট বা PDF" />
                  <ActionTile href="/app/bujhi" external icon={<FileSearch className="size-5" />} title="রিপোর্ট বুঝি" hint="বুঝি মডিউল খুলবে" />
                  <ActionTile onClick={() => openTask("records", "profiles")} icon={<Baby className="size-5" />} title="গর্ভকাল ও শিশুর নথি" hint="দেখুন বা নতুন নথি খুলুন" />
                </div>
              </nav>

              <section className="grid gap-4" aria-labelledby="lanes-title">
                <h2 id="lanes-title" className="text-2xl font-semibold">সাম্প্রতিক তথ্য: মা ও শিশু</h2>
                <div className="grid gap-5 md:grid-cols-2">{(["mother", "baby"] as const).map((lane) => {
                  const items = recent.filter((item) => item.subject === lane && (!selectedPregnancy || (lane === "mother" ? item.pregnancy_id === selectedPregnancy.id : currentBabyIds.has(item.baby_id ?? "")))).slice(0, 3);
                  const name = lane === "mother" ? "মা" : "শিশু";
                  return <section key={lane} className="grid content-start gap-3" aria-labelledby={`lane-${lane}`}>
                    <h3 id={`lane-${lane}`} className="flex items-center gap-2 border-b-2 border-pro-primary pb-2 text-lg font-semibold">{subjectMark(lane)}{name}</h3>
                    {items.length ? items.map((item) => <article key={item.id} className={`${ui.card} grid gap-2 sm:p-5`}>
                      <p className="text-sm text-pro-muted"><time dateTime={item.observed_at}>{formatBnDate(item.observed_at)}</time></p>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3"><h4 className="text-lg font-semibold">{labels[item.kind] ?? item.kind}</h4><p className="text-2xl font-semibold [overflow-wrap:anywhere]">{item.value} {item.unit && <span className="text-base font-normal">{item.unit}</span>}</p></div>
                      <p className={provenanceClass(item)}>{accountSourceLabel(item)}</p>
                      <button type="button" onClick={() => { setHistorySubject(lane); setHistoryKind(item.kind); openTask("records", "measures"); }} className={`${ui.link} w-fit`}>ইতিহাসে দেখুন</button>
                    </article>) : <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-pro-control-border bg-pro-elevated p-5">
                      <p className="text-pro-muted">এই গর্ভকালে এখনও {lane === "mother" ? "মায়ের" : "শিশুর"} কোনো তথ্য নেই।</p>
                      <button type="button" onClick={() => { selectSubject(lane); openTask(lane === "baby" && !records.babies.length ? "baby" : "observation"); }} className={`${ui.secondary} ${ui.small}`}><Plus className="size-4" aria-hidden="true" />{lane === "mother" ? "মায়ের তথ্য যোগ করুন" : "শিশুর তথ্য যোগ করুন"}</button>
                    </div>}
                  </section>;
                })}</div>
              </section>

              <section className="grid gap-3 rounded-card bg-pro-surface p-5 sm:p-6" aria-labelledby="after-birth-title">
                <div className="flex flex-wrap items-center gap-2"><h2 id="after-birth-title" className="text-xl font-semibold">সন্তান হওয়ার পর</h2><span className={ui.limitedTag}>সীমিত</span></div>
                <p>শিশুর আলাদা নথি ও মায়ের নিজের নোট রাখতে পারেন। পূর্ণ প্রসবোত্তর, টিকা ও শিশুর বৃদ্ধির নথি এখনও তৈরি হয়নি।</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => openTask("baby")} className={`${ui.secondary} ${ui.small}`}>শিশুর নথি খুলুন</button>
                  <button type="button" onClick={() => openTask("note")} className={`${ui.secondary} ${ui.small}`}>মায়ের নোট লিখুন</button>
                  <Link href="/app/shusthota" className={`${ui.secondary} ${ui.small}`}>সুস্থতা খুলুন</Link>
                </div>
              </section>
            </>}

            {task === "guide" && <CareGuide currentWeek={journey?.weeks ?? null} currentDay={journey?.days ?? 0} selection={guideSelection} onSelectionChange={(next) => setGuideSelections((previous) => ({ ...previous, [guideKey]: next }))} headingRef={taskHeading} onBack={() => openTask("home")} onAddNote={() => openTask("note")} bujhiHref="/app/bujhi" />}
            {task === "share" && <AccountVisitPack headingRef={taskHeading} rows={recent.map((item) => ({ id: item.id, subject: item.subject, label: labels[item.kind] ?? item.kind, value: item.value, unit: item.unit, observedAt: formatBnDate(item.observed_at), source: accountSourceLabel(item) }))} onBack={() => openTask("home")} />}

            {task === "pregnancy" && <form
              className={formCard}
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void save({ type: "pregnancy", record: { label: data.get("label"), estimatedDueDate: data.get("due") || null, lastMenstrualPeriodDate: data.get("period") || null } }, form, "গর্ভকালের নথি", "profiles");
              }}
            >
              <label className={ui.field}>গর্ভকালটি কী নামে রাখবেন?<span className={ui.hint}>যেমন: প্রথম গর্ভকাল</span>
                <input name="label" maxLength={100} required className={ui.input} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={ui.field}>প্রসবের সম্ভাব্য তারিখ<span className={ui.hint}>ঐচ্ছিক · রিপোর্ট বা চিকিৎসকের দেওয়া</span><input name="due" type="date" className={ui.input} /></label>
                <label className={ui.field}>শেষ মাসিকের প্রথম দিন<span className={ui.hint}>ঐচ্ছিক</span><input name="period" type="date" className={ui.input} /></label>
              </div>
              {formActions("নথি সংরক্ষণ করুন")}
            </form>}

            {task === "baby" && <form
              className={formCard}
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void save({ type: "baby", record: { label: data.get("label"), pregnancyId: data.get("pregnancy") || null, birthDate: data.get("birth") || null } }, form, "শিশুর নথি", "profiles");
              }}
            >
              <label className={ui.field}>শিশুর নথির নাম<span className={ui.hint}>যেমন: শিশু ক</span>
                <input name="label" maxLength={100} required className={ui.input} />
              </label>
              <label className={ui.field}>কোন গর্ভকালের সঙ্গে<span className={ui.hint}>ঐচ্ছিক</span>{pregnancySelect("pregnancy")}</label>
              <label className={ui.field}>জন্মের তারিখ<span className={ui.hint}>ঐচ্ছিক</span><input name="birth" type="date" max={today()} className={ui.input} /></label>
              {formActions("শিশুর নথি সংরক্ষণ করুন")}
            </form>}

            {task === "observation" && <section className={formCard} aria-label="মাপ বা নোট">
              <Segmented legend="কার নথি?" name="observation-subject" value={subject} options={subjectOptions} onChange={selectSubject} disabled={pendingObservation !== null} />
              {subject === "mother"
                ? <label className={ui.field}>গর্ভকাল<span className={ui.hint}>ঐচ্ছিক</span><select value={pregnancyId} disabled={pendingObservation !== null} onChange={(event) => setPregnancyId(event.target.value)} className={ui.input}><option value="">কোনো গর্ভকাল বেছে নেওয়া নেই</option>{records.pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                : babySelect}
              <form
                className="grid gap-5"
                hidden={pendingObservation !== null}

                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  const date = String(data.get("date"));
                  const payload = {
                    type: "observation",
                    record: {
                      destination: subject === "mother" ? { subject, pregnancyId: pregnancyId || null } : { subject, babyId: selectedBabyId },
                      measurement: { kind, value: data.get("value"), unit: kind === "note" ? null : unit },
                      observedAt: `${date}T00:00:00+06:00`,
                      sourceNote: null,
                    },
                  };
                  setPendingObservation({ payload, form, summary: `${subject === "mother" ? "মায়ের নথি" : `শিশুর নথি: ${visibleBabies.find((item) => item.id === selectedBabyId)?.label ?? ""}`} · ${labels[kind]}: ${String(data.get("value") ?? "")} ${kind === "note" ? "" : unit} · ${date}` });
                  requestAnimationFrame(() => reviewHeading.current?.focus());
                }}
              >

                <label className={ui.field}>কী লিখবেন
                  <select value={kind} onChange={(event) => { const selected = choices[subject].find((choice) => choice[0] === event.target.value); setKind(selected?.[0] ?? "weight"); setUnit(selected?.[1] ?? "kg"); }} className={ui.input}>
                    {choices[subject].map(([value]) => <option key={value} value={value}>{labels[value]}</option>)}
                  </select>
                </label>
                <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <label className={ui.field}>{kind === "note" ? "নোট" : `${labels[kind]}-এর মান`}
                    {kind === "note"
                      ? <textarea name="value" required maxLength={2000} className={`${ui.input} min-h-28`} />
                      : <input name="value" required inputMode="decimal" pattern="-?[0-9]{1,9}(\.[0-9]{1,6})?" className={ui.input} />}
                  </label>
                  {kind !== "note" && (unitOptions[kind]
                    ? <label className={ui.field}>একক<select value={unit} onChange={(event) => setUnit(event.target.value)} className={ui.input}>{unitOptions[kind].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                    : <p className={ui.field}>একক<span className="flex min-h-12 items-center font-normal">{unit}</span></p>)}
                </div>
                {dateField("কবে মাপা হয়েছে")}
                <p className="flex gap-2 text-sm text-pro-muted"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />রক্তচাপের উপরের ও নিচের সংখ্যা আলাদা করে রাখা হয়। যেমন লেখা আছে তেমনই লিখুন; কোনো রোগনির্ণয় বা ব্যাখ্যা দেওয়া হয় না।</p>
                <div className="flex flex-wrap gap-3 border-t border-pro-border pt-4">
                  <button type="submit" disabled={busy || (subject === "baby" && !selectedBabyId)} className={`${ui.primary} max-sm:w-full`}>দেখে নিন →</button>
                  <button type="button" onClick={() => openTask("home")} className={`${ui.secondary} max-sm:w-full`}>বাতিল</button>
                </div>
              </form>
              {pendingObservation && <section className="grid gap-3 rounded-field border-[1.5px] border-pro-primary bg-pro-surface p-4" aria-labelledby="observation-review-title">
                <h2 id="observation-review-title" ref={reviewHeading} tabIndex={-1} className="text-xl font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">সংরক্ষণের আগে দেখুন</h2>
                <p className="text-lg [overflow-wrap:anywhere]">{pendingObservation.summary}</p><p className={ui.tag}>উৎস: আপনার লেখা · চিকিৎসক যাচাই করেননি</p>
                <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { void save(pendingObservation.payload, pendingObservation.form, "তথ্যটি", "measures").then((saved) => { if (saved) setPendingObservation(null); }); }} className={`${ui.primary} max-sm:w-full`}>{busy ? "সংরক্ষণ হচ্ছে…" : "অ্যাকাউন্টে সংরক্ষণ করুন"}</button><button type="button" disabled={busy} onClick={() => setPendingObservation(null)} className={`${ui.secondary} max-sm:w-full`}>বদলাতে ফিরে যান</button></div>

              </section>}
            </section>}

            {task === "note" && <div className="grid max-w-2xl gap-5">
              <Segmented legend="কী লিখবেন?" name="note-kind" value={noteKind} options={[{ value: "symptom", label: "উপসর্গ বা অনুভূতি" }, { value: "condition", label: "নিজের লক্ষ্য করা অবস্থা" }]} onChange={setNoteKind} />
              {noteKind === "symptom" ? <form
                key="symptom"
                className={formCard}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save({ type: "symptom_note", record: { pregnancyId: data.get("pregnancy") || null, note: data.get("note"), occurredAt: `${data.get("date")}T00:00:00+06:00` } }, form, "উপসর্গের নোট", "notes");
                }}
              >
                <label className={ui.field}>আপনার নোট<span className={ui.hint}>চিকিৎসকের সঙ্গে পরের আলাপের জন্য নিজের ভাষায় লিখুন</span>
                  <textarea name="note" maxLength={2000} required className={`${ui.input} min-h-32`} />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  {dateField("তারিখ")}
                  <label className={ui.field}>গর্ভকাল<span className={ui.hint}>ঐচ্ছিক</span>{pregnancySelect("pregnancy")}</label>
                </div>
                {formActions("নোট সংরক্ষণ করুন")}
              </form> : <form
                key="condition"
                className={formCard}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save({ type: "condition", record: { pregnancyId: data.get("pregnancy") || null, label: data.get("label"), documentedAt: `${data.get("date")}T00:00:00+06:00`, sourceNote: data.get("sourceNote") || null } }, form, "আপনার লেখা অবস্থা", "notes");
                }}
              >
                <p className={ui.limitedTag}>আপনার নিজের নোট · রোগনির্ণয় নয়</p>
                <label className={ui.field}>কী লিখে রাখতে চান?<span className={ui.hint}>যেমন: আগে থেকে থাইরয়েডের সমস্যা আছে</span>
                  <input name="label" maxLength={300} required className={ui.input} />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  {dateField("কবে লক্ষ্য করেছেন")}
                  <label className={ui.field}>গর্ভকাল<span className={ui.hint}>ঐচ্ছিক</span>{pregnancySelect("pregnancy")}</label>
                </div>
                <label className={ui.field}>তথ্যটি কোথা থেকে জেনেছেন?<span className={ui.hint}>ঐচ্ছিক · যেমন: ২০২৫ সালের প্রেসক্রিপশন</span>
                  <input name="sourceNote" maxLength={500} className={ui.input} />
                </label>
                {formActions("নোট সংরক্ষণ করুন")}
              </form>}
            </div>}

            {task === "visit" && <form
              className={formCard}
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void save({ type: "visit", record: { subject, parentId: subject === "mother" ? pregnancyId || null : selectedBabyId || null, occurredAt: `${data.get("date")}T00:00:00+06:00`, placeNote: data.get("place") || null, note: data.get("note") || null } }, form, "ভিজিট", "visits");
              }}
            >
              <Segmented legend="কার ভিজিট?" name="visit-subject" value={subject} options={subjectOptions} onChange={selectSubject} />
              {subject === "mother"
                ? <label className={ui.field}>গর্ভকাল<span className={ui.hint}>ঐচ্ছিক</span><select value={pregnancyId} onChange={(event) => setPregnancyId(event.target.value)} className={ui.input}><option value="">কোনো গর্ভকাল বেছে নেওয়া নেই</option>{records.pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                : babySelect}
              {dateField("ভিজিটের তারিখ")}
              <label className={ui.field}>কোথায়<span className={ui.hint}>ঐচ্ছিক · যেমন: উপজেলা স্বাস্থ্য কমপ্লেক্স</span><input name="place" maxLength={300} className={ui.input} /></label>
              <label className={ui.field}>কী মনে রাখতে চান?<span className={ui.hint}>ঐচ্ছিক</span><textarea name="note" maxLength={2000} className={`${ui.input} min-h-28`} /></label>
              {formActions("ভিজিট সংরক্ষণ করুন", subject === "baby" && !selectedBabyId)}
            </form>}

            {task === "records" && <div className="grid gap-5">
              <ViewSwitch label="ইতিহাসের কোন অংশ দেখবেন" value={recordsTab} onChange={setRecordsTab} options={[
                { value: "measures", label: `মাপ (${bengaliNumber(activeObservations.length)})` },
                { value: "notes", label: `নোট (${bengaliNumber(notesCount)})` },
                { value: "visits", label: `ভিজিট (${bengaliNumber(records.visits.length)})` },
                { value: "profiles", label: "গর্ভকাল ও শিশু" },
              ]} />

              {recordsTab === "measures" && <section className="grid gap-4" aria-label="মাপের ইতিহাস">
                <div className="grid gap-3 rounded-card bg-pro-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className={ui.field}>খুঁজুন<input type="search" value={historyQuery} onChange={(event) => { setHistoryQuery(event.target.value); setHistoryLimit(pageSize); }} placeholder="যেমন: ওজন" className={ui.input} /></label>
                  <label className={ui.field}>কার তথ্য
                    <select value={historySubject} onChange={(event) => { setHistorySubject(event.target.value as typeof historySubject); setHistoryLimit(pageSize); }} className={ui.input}><option value="both">মা ও শিশু</option><option value="mother">শুধু মা</option><option value="baby">শুধু শিশু</option></select>
                  </label>
                  <label className={ui.field}>ধরন
                    <select value={historyKind} onChange={(event) => { setHistoryKind(event.target.value); setHistoryLimit(pageSize); }} className={ui.input}><option value="all">সব ধরন</option>{[...new Set(activeObservations.map((item) => item.kind))].map((value) => <option key={value} value={value}>{labels[value] ?? value}</option>)}</select>
                  </label>
                  <label className={ui.field}>গর্ভকাল
                    <select value={pregnancyId} onChange={(event) => { setPregnancyId(event.target.value); setHistoryLimit(pageSize); }} className={ui.input}><option value="">সব গর্ভকাল</option>{records.pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
                  </label>
                  {historySubject === "baby" && <label className={ui.field}>কোন শিশু
                    <select value={selectedBabyId} onChange={(event) => setBabyId(event.target.value)} className={ui.input}><option value="">শিশুর নথি বেছে নিন</option>{visibleBabies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
                  </label>}
                </div>
                <p role="status" className="font-semibold">{visible.length ? `${bengaliNumber(visible.length)}টির মধ্যে ${bengaliNumber(shown.length)}টি দেখানো হচ্ছে · নতুন আগে` : "এই বাছাইয়ে কোনো তথ্য নেই।"}</p>
                {visible.length === 0 && <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-pro-control-border bg-pro-elevated p-5">
                  <p className="text-pro-muted">অন্য গর্ভকাল, ধরন বা লেখা দিয়ে খুঁজে দেখুন।</p>
                  <button type="button" onClick={() => { setHistoryQuery(""); setHistoryKind("all"); setHistorySubject("both"); setPregnancyId(""); }} className={`${ui.secondary} ${ui.small}`}>বাছাই মুছুন</button>
                </div>}
                <ul className="grid gap-2">
                  {shown.map((item, index) => {
                    const day = formatBnDay(item.observed_at);
                    const newDay = index === 0 || formatBnDay(shown[index - 1].observed_at) !== day;
                    const previous = historyFor(item.id);
                    return <Fragment key={item.id}>
                      {newDay && <li className="mt-3 text-sm font-semibold text-pro-muted first:mt-0" aria-hidden="true">{day}</li>}
                      <li className="grid gap-3 rounded-card border border-pro-border bg-pro-elevated px-4 py-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          {subjectMark(item.subject)}
                          <p className="min-w-[10rem] flex-1"><strong>{labels[item.kind] ?? item.kind}</strong> · {item.subject === "mother" ? "মা" : "শিশু"}<span className="sr-only"> · {day}</span></p>
                          <p className="text-xl font-semibold [overflow-wrap:anywhere]">{item.value}{item.unit && <span className="text-sm font-normal"> {item.unit}</span>}</p>
                          <p className={provenanceClass(item)}>{accountSourceLabel(item)}{previous.length > 0 && " · সংশোধিত"}</p>
                          <button type="button" aria-expanded={item.id === correctingId} onClick={() => setCorrectingId(item.id === correctingId ? null : item.id)} className={`${ui.secondary} ${ui.small}`}>
                            {item.id === correctingId ? "সংশোধন বন্ধ করুন" : "সংশোধন"}
                          </button>
                        </div>
                        {item.id === correctingId && <form
                          className="grid gap-4 border-t border-pro-border pt-4 sm:grid-cols-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = event.currentTarget;
                            const data = new FormData(form);
                            void save({ type: "correction", record: { subject: item.subject, observationId: item.id, value: data.get("value"), unit: item.kind === "note" ? null : data.get("unit"), reason: data.get("reason") } }, form, "সংশোধন", "measures");
                          }}
                        >
                          <label className={ui.field}>নতুন মান<input name="value" defaultValue={item.value} required maxLength={2000} className={ui.input} /></label>
                          {item.kind !== "note" && <label className={ui.field}>একক<select name="unit" defaultValue={item.unit ?? ""} className={ui.input}>{(unitOptions[item.kind] ?? [item.unit ?? ""]).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>}
                          <label className={`${ui.field} sm:col-span-2`}>সংশোধনের কারণ<span className={ui.hint}>যেমন: ভুল সংখ্যা লিখেছিলাম</span><input name="reason" required maxLength={500} className={ui.input} /></label>
                          <p className="text-sm text-pro-muted sm:col-span-2">আগের মান ইতিহাসে থাকবে, মুছে যাবে না। রিপোর্টের মান সংশোধন করলে নতুন মান আপনার নিজের লেখা হিসেবে থাকবে।</p>
                          <button type="submit" disabled={busy} className={`${ui.primary} w-fit max-sm:w-full`}>{busy ? "সংরক্ষণ হচ্ছে…" : "সংশোধন সংরক্ষণ করুন"}</button>
                        </form>}
                        {previous.length > 0 && <details className="text-sm">
                          <summary className="min-h-11 cursor-pointer content-center font-semibold text-pro-primary">আগের {bengaliNumber(previous.length)}টি মান দেখুন</summary>
                          <ul className="grid gap-2 pb-1">
                            {previous.map((entry) => <li key={entry.record.id} className="border-t border-pro-border pt-2">
                              আগের মান: {entry.record.value}{entry.record.unit ? ` ${entry.record.unit}` : ""} · {formatBnDate(entry.record.observed_at)}<br />কারণ: {entry.reason}
                            </li>)}
                          </ul>
                        </details>}
                      </li>
                    </Fragment>;
                  })}
                </ul>
                <div className="flex flex-wrap justify-center gap-3">
                  {visible.length > shown.length && <button type="button" onClick={() => setHistoryLimit((value) => value + pageSize)} className={ui.secondary}>আরও {bengaliNumber(Math.min(pageSize, visible.length - shown.length))}টি দেখুন</button>}
                  <Link href="/app/bujhi" className={ui.secondary}>বুঝিতে রিপোর্ট যাচাই করুন</Link>
                </div>
              </section>}

              {recordsTab === "notes" && <section className="grid gap-5" aria-label="নোটের ইতিহাস">
                <div className="flex flex-wrap gap-3"><button type="button" onClick={() => openTask("note")} className={`${ui.secondary} ${ui.small}`}><PenLine className="size-4" aria-hidden="true" />নতুন নোট লিখুন</button></div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="grid content-start gap-2" aria-labelledby="symptom-list-title">
                    <h2 id="symptom-list-title" className="text-lg font-semibold">উপসর্গের নোট</h2>
                    {records.symptomNotes.length ? <ul className="grid gap-2">{[...records.symptomNotes].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).map((item) => <li key={item.id} className="grid gap-1 rounded-card border border-pro-border bg-pro-elevated px-4 py-3">
                      <p className="[overflow-wrap:anywhere]">{item.note}</p>
                      <p className="text-sm text-pro-muted">{formatBnDate(item.occurred_at)} · আপনার লেখা</p>
                    </li>)}</ul> : <p className="rounded-card border border-dashed border-pro-control-border p-4 text-pro-muted">এখনও উপসর্গের নোট নেই।</p>}
                  </section>
                  <section className="grid content-start gap-2" aria-labelledby="condition-list-title">
                    <h2 id="condition-list-title" className="text-lg font-semibold">নিজের লেখা অবস্থা</h2>
                    {records.conditions.length ? <ul className="grid gap-2">{[...records.conditions].sort((a, b) => b.documented_at.localeCompare(a.documented_at)).map((item) => <li key={item.id} className="grid gap-1 rounded-card border border-pro-border bg-pro-elevated px-4 py-3">
                      <p className="font-semibold [overflow-wrap:anywhere]">{item.label}</p>
                      <p className="text-sm text-pro-muted">{formatBnDate(item.documented_at)} · আপনার লেখা · নিশ্চিত রোগনির্ণয় নয়</p>
                      {item.source_note && <p className="text-sm [overflow-wrap:anywhere]">উৎসের নোট: {item.source_note}</p>}
                    </li>)}</ul> : <p className="rounded-card border border-dashed border-pro-control-border p-4 text-pro-muted">এখনও কিছু লেখা নেই।</p>}
                  </section>
                </div>
              </section>}

              {recordsTab === "visits" && <section className="grid gap-4" aria-label="ভিজিটের ইতিহাস">
                <div className="flex flex-wrap gap-3"><button type="button" onClick={() => openTask("visit")} className={`${ui.secondary} ${ui.small}`}><CalendarPlus className="size-4" aria-hidden="true" />নতুন ভিজিট লিখুন</button></div>
                {sortedVisits.length ? <ul className="grid gap-2">{sortedVisits.map((item) => <li key={item.id} className="grid gap-1 rounded-card border border-pro-border bg-pro-elevated px-4 py-3">
                  <p className="flex flex-wrap items-center gap-2"><strong>{formatBnDate(item.occurred_at)}</strong> · {item.subject === "baby" ? "শিশু" : "মা"}{item.place_note && <> · <span className="[overflow-wrap:anywhere]">{item.place_note}</span></>}</p>
                  {item.note && <p className="[overflow-wrap:anywhere]">{item.note}</p>}
                  <p className={ui.tag}>আপনার লেখা · বুকিং বা সেবাদাতার উত্তর নিশ্চিত নয়</p>
                </li>)}</ul> : <p className="rounded-card border border-dashed border-pro-control-border p-4 text-pro-muted">এই অ্যাকাউন্টে এখনও ভিজিট লেখা নেই।</p>}
              </section>}

              {recordsTab === "profiles" && <section className="grid gap-5 sm:grid-cols-2" aria-label="গর্ভকাল ও শিশুর নথি">
                <div className="grid content-start gap-2">
                  <h2 className="text-lg font-semibold">গর্ভকাল</h2>
                  {records.pregnancies.length ? <ul className="grid gap-2">{records.pregnancies.map((item) => <li key={item.id} className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3"><p className="font-semibold [overflow-wrap:anywhere]">{item.label}</p>{item.estimated_due_date && <p className="text-sm text-pro-muted">লেখা সম্ভাব্য তারিখ: {formatBnDate(item.estimated_due_date)}</p>}</li>)}</ul> : <p className="text-pro-muted">এখনও কোনো গর্ভকালের নথি নেই।</p>}
                  <button type="button" onClick={() => openTask("pregnancy")} className={`${ui.secondary} ${ui.small} w-fit`}><Plus className="size-4" aria-hidden="true" />গর্ভকাল যোগ করুন</button>
                </div>
                <div className="grid content-start gap-2">
                  <h2 className="text-lg font-semibold">শিশু</h2>
                  {records.babies.length ? <ul className="grid gap-2">{records.babies.map((item) => <li key={item.id} className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3"><p className="font-semibold [overflow-wrap:anywhere]">{item.label}</p>{item.birth_date && <p className="text-sm text-pro-muted">জন্ম: {formatBnDate(item.birth_date)}</p>}</li>)}</ul> : <p className="text-pro-muted">এখনও কোনো শিশুর নথি নেই।</p>}
                  <button type="button" onClick={() => openTask("baby")} className={`${ui.secondary} ${ui.small} w-fit`}><Plus className="size-4" aria-hidden="true" />শিশুর নথি যোগ করুন</button>
                </div>
              </section>}
            </div>}
          </>
        )
      )}

      <p className="flex flex-wrap items-start gap-2 border-t border-pro-border pt-4 text-sm text-pro-muted"><span className={ui.limitedTag}>পরীক্ষামূলক</span><span className="min-w-0 flex-1">এই সংস্করণে শুধু নমুনা তথ্য লিখুন। এখানে লেখা তথ্য আপনার অ্যাকাউন্টে থাকে; ডেমোতে লেখা তথ্য এখানে আসে না।</span></p>

    </div>
  );
}
