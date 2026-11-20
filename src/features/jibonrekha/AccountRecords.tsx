"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Plus, ShieldCheck } from "lucide-react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { LifelineArc } from "./LifelineArc";
import { CareGuide } from "./CareGuide";
import { AccountVisitPack } from "./AccountVisitPack";
import { accountJourney } from "./account-journey";
import { filterAccountHistory } from "./account-history";
import { accountRecordsSchema, belongsToPregnancy, selectAccountPregnancy, type GuideSelection } from "./account-records-model";


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
const box = "rounded-card border border-pro-border bg-pro-surface p-5 sm:p-8";
const input =
  "min-h-11 w-full rounded-field border border-pro-border bg-pro-bg px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const action =
  "min-h-11 rounded-field bg-pro-primary px-4 py-2 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-pro-focus disabled:opacity-60";
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
const tasks: { id: Exclude<Task, "home">; label: string; hint: string }[] = [
  { id: "guide", label: "সপ্তাহভিত্তিক যত্ন", hint: "১–৪১ সপ্তাহের তথ্য ও উৎস" },
  { id: "share", label: "ভিজিটের প্যাকেট", hint: "বেছে দেখে তারপর প্রিন্ট" },
  { id: "observation", label: "নতুন স্বাস্থ্যতথ্য", hint: "মা বা শিশুর মাপ ও নোট" },
  { id: "records", label: "নথির ইতিহাস", hint: "লেখা তথ্য ও সংশোধন" },
  { id: "pregnancy", label: "গর্ভকালের নথি যোগ", hint: "আপনার লেখা তারিখ রাখুন" },
  { id: "baby", label: "শিশুর নথি যোগ", hint: "প্রতিটি শিশুর আলাদা নথি" },
  { id: "note", label: "স্বাস্থ্য নোট লিখুন", hint: "আপনার দেখা উপসর্গ বা অবস্থা" },
  { id: "visit", label: "ভিজিট লিখুন", hint: "হয়ে যাওয়া ভিজিটের তথ্য" },

];

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
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}
function formatBnDate(value: string) {
  return new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

const bengaliNumber = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
function sourceLabel(item: Observation) {
  if (item.source === "self_reported") return "আপনি লিখেছেন";
  if (item.source === "document_extracted") return item.verification === "user_verified" ? "রিপোর্ট থেকে · আপনি যাচাই করেছেন" : "রিপোর্ট থেকে · যাচাই বাকি";
  if (item.source === "clinician_confirmed" && item.verification === "clinician_confirmed") return "চিকিৎসক নিশ্চিত করেছেন";
  if (item.source === "clinician_entered") return "চিকিৎসক লিখেছেন · নিশ্চিতকরণ বাকি";
  return "উৎস যাচাই করুন";
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
  const [task, setTask] = useState<Task>("home");
  const taskHeading = useRef<HTMLHeadingElement>(null);
  const homeHeading = useRef<HTMLHeadingElement>(null);
  const guideHeading = useRef<HTMLHeadingElement>(null);
  const statusFocus = useRef<HTMLParagraphElement>(null);
  const errorFocus = useRef<HTMLDivElement>(null);
  const pendingRequests = useRef(new Map<string, string>());
  const savingRequest = useRef(false);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [pendingObservation, setPendingObservation] = useState<{ payload: unknown; form: HTMLFormElement; summary: string } | null>(null);
  const [observationStep, setObservationStep] = useState<1 | 2 | 3>(1);
  const [guideSelections, setGuideSelections] = useState<Record<string, GuideSelection | null>>({});
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  function openTask(next: Task) {
    setTask(next);

    const heading = next === "home" ? homeHeading : next === "guide" ? guideHeading : taskHeading;
    requestAnimationFrame(() => heading.current?.focus());

  }
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/jibonrekha", { cache: "no-store" });
      if (!response.ok)
        throw new Error("নথি আনা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।");
      const next = accountRecordsSchema.parse(await response.json()) as Records;
      setRecords(next);
      setBabyId((previous) => next.babies.some((baby) => baby.id === previous) ? previous : "");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "নথি আনা যায়নি। আবার চেষ্টা করুন।",
      );
      requestAnimationFrame(() => errorFocus.current?.focus());
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function save(payload: unknown, form: HTMLFormElement, label: string) {
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
      } | null;
      if (!response.ok || result?.saved !== true || !result.id) {
        if (response.status >= 400 && response.status < 500) pendingRequests.current.delete(body);
        throw new Error(result?.message || "সংরক্ষণ নিশ্চিত হয়নি। একই তথ্য আবার চেষ্টা করুন।");
      }
      pendingRequests.current.delete(body);
      setMessage(`${label} অ্যাকাউন্টে সংরক্ষিত হয়েছে। এই MVP-তে শুধু কাল্পনিক তথ্য ব্যবহার করুন।`);
      form.reset();
      setCorrectingId(null);
      await load();
      openTask("records");
      requestAnimationFrame(() => statusFocus.current?.focus());
      return true;
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? "সংরক্ষণ নিশ্চিত হয়নি। সংযোগ দেখে একই তথ্য আবার চেষ্টা করুন।"
          : cause instanceof Error
          ? cause.message
          : "সংরক্ষণ নিশ্চিত হয়নি। সংযোগ দেখে একই তথ্য আবার চেষ্টা করুন।",
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
  const shownJourney = guideSelection ? { weeks: guideSelection.week, days: guideSelection.day } : journey;
  const previewing = guideSelection !== null;
  const recent = [...activeObservations].sort((a, b) => b.observed_at.localeCompare(a.observed_at));
  const currentBabyIds = new Set(records?.babies.filter((item) => !selectedPregnancy || item.pregnancy_id === selectedPregnancy.id).map((item) => item.id) ?? []);
  const scopedVisits = records?.visits.filter((item) => belongsToPregnancy(item, selectedPregnancy?.id, records.babies)) ?? [];
  const recentVisit = scopedVisits.length
    ? [...scopedVisits].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))[0]
    : null;


  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 text-pro-text [overflow-wrap:anywhere] sm:px-6 lg:gap-10 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-pro-primary">প্রহর · জীবনরেখা</p>
          <h1 ref={homeHeading} tabIndex={-1} className="mt-1 text-4xl font-semibold">জীবনরেখা</h1>
          <p className="mt-2">আপনার ও শিশুর যাত্রা, এক রেখায়।</p>
        </div>
        <div className="flex flex-wrap gap-2"><AccessPreferencesControl compact /><Link href="/safety" className="inline-flex min-h-11 items-center rounded-field border border-pro-danger px-4 font-semibold text-pro-danger focus-visible:outline-3 focus-visible:outline-pro-focus">জরুরি সহায়তা</Link></div>
      </header>
      {message && <p ref={statusFocus} tabIndex={-1} role="status" className="rounded-field border border-pro-success bg-pro-success-soft p-4 focus-visible:outline-3 focus-visible:outline-pro-focus">{message}</p>}
      {error && (
        <div ref={errorFocus} tabIndex={-1} className={box}>
          <p role="alert" className="text-pro-danger">{error}</p>
          {!records && !loading && (
            <button type="button" onClick={() => void load()} className={action}>
              নথি আবার আনুন
            </button>
          )}

        </div>
      )}
      {loading ? (
        <p role="status">নথি আনা হচ্ছে…</p>
      ) : (
        records && (
          <>
            {task === "home" && (
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,1fr)]">
                <section className="grid min-w-0 content-start gap-6 rounded-hero bg-pro-primary p-5 text-pro-on-primary sm:p-8" aria-label="গর্ভকালের রেখা">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><h2 className="min-w-0 text-xl font-semibold">{selectedPregnancy?.label ?? "আমার গর্ভকাল"}</h2><span className="text-sm">{formatBnDate(today())} পর্যন্ত</span></div>
                  {records.pregnancies.length > 1 && <label className="grid min-w-0 gap-2 font-semibold">কোন গর্ভকালের নথি দেখবেন
                    <select value={selectedPregnancy?.id ?? ""} onChange={(event) => setPregnancyId(event.target.value)} className="min-h-12 w-full min-w-0 max-w-full rounded-field border border-pro-on-primary bg-pro-primary px-3 text-pro-on-primary focus-visible:outline-3 focus-visible:outline-pro-focus">{records.pregnancies.map((item) => <option key={item.id} value={item.id} className="bg-pro-bg text-pro-text">{item.label}</option>)}</select>
                  </label>}
                  {shownJourney ? <>
                    <div className="mx-auto w-full max-w-sm" aria-hidden="true"><LifelineArc weeks={shownJourney.weeks} days={shownJourney.days} /></div>
                    <div className="grid gap-2 text-center" role="status"><p className="text-sm font-semibold">{previewing ? "গাইডে বেছে নেওয়া সপ্তাহ · প্রিভিউ" : "নথির তারিখ অনুযায়ী আজ"}</p><p className="text-[clamp(1.5rem,5vw,2rem)] font-semibold leading-snug">{bengaliNumber(shownJourney.weeks)} সপ্তাহ {bengaliNumber(shownJourney.days)} দিন</p><p>{["প্রথম", "দ্বিতীয়", "তৃতীয়"][shownJourney.weeks < 14 ? 0 : shownJourney.weeks < 28 ? 1 : 2]} ত্রৈমাসিক</p></div>
                    {previewing && <div className="grid gap-3 rounded-field border border-pro-on-primary p-4"><p>এই সপ্তাহটি শুধু গাইড দেখার জন্য। আপনার নথির তারিখ বদলায়নি।</p><button type="button" onClick={() => setGuideSelections((previous) => ({ ...previous, [guideKey]: null }))} className="min-h-11 justify-self-start rounded-field border border-pro-on-primary px-4 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">নথির বর্তমান সপ্তাহ দেখুন</button></div>}
                    <div className="grid gap-2 border-t border-pro-on-primary pt-5">{journey ? <><p className="font-semibold">নথি অনুযায়ী সম্ভাব্য প্রসবের তারিখ: {formatBnDate(journey.dueDate)}</p><p className="text-sm">সূত্র: {journey.source} · হিসাবটি চিকিৎসকের নিশ্চিতকরণ নয়</p></> : <p>নথির তারিখ থেকে বর্তমান সপ্তাহ হিসাব করা যাচ্ছে না।</p>}</div>
                  </> : <div className="grid gap-4 py-4"><p className="text-xl font-semibold">গর্ভকালের তারিখ এখনও দেখানো যাচ্ছে না</p><p>তারিখ না থাকলে বা সম্ভাব্য তারিখ পেরিয়ে গেলে সপ্তাহ অনুমান করে দেখানো হয় না। গাইডে সপ্তাহ বেছে নিয়ে বিষয়গুলো দেখতে পারেন।</p><button type="button" onClick={() => openTask("pregnancy")} className="w-fit min-h-11 rounded-field border border-pro-on-primary px-4 py-2 font-semibold">গর্ভকালের তথ্য যোগ করুন</button></div>}
                  <button type="button" onClick={() => openTask("guide")} className="min-h-12 w-fit rounded-field border border-pro-on-primary px-5 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">সপ্তাহভিত্তিক যত্ন দেখুন →</button>
                </section>
                <div className="grid content-start gap-4">
                  <section className="rounded-card border border-pro-border bg-pro-elevated p-5">
                    <div className="flex items-center gap-2"><CalendarDays className="size-5 text-pro-primary" aria-hidden="true" /><h2 className="text-xl font-semibold">সাম্প্রতিক ভিজিট</h2></div>
                    {recentVisit ? <p className="mt-3">{formatBnDate(recentVisit.occurred_at)} · {recentVisit.place_note || "স্থান লেখা নেই"}</p> : <p className="mt-3 text-pro-muted">এই নথিতে এখনও কোনো ভিজিট লেখা নেই।</p>}
                    <button type="button" onClick={() => openTask("visit")} className="mt-4 min-h-11 font-semibold text-pro-primary underline">ভিজিট লিখুন বা দেখুন</button>
                  </section>
                  <p className="rounded-field border border-pro-info bg-pro-info-soft p-4 text-pro-info"><ShieldCheck className="mr-2 inline size-4" aria-hidden="true" />এই তথ্য আপনার অ্যাকাউন্টের নথি থেকে দেখানো হচ্ছে। কাউকে পাঠানো হয়নি।</p>
                  <section className="grid gap-4 rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-6" aria-labelledby="journey-next-heading">
                    <h2 id="journey-next-heading" className="text-xl font-semibold">আজকের সহজ পথ</h2>
                    <ol className="grid gap-4">
                      <li className="flex gap-3"><span aria-hidden="true" className="font-semibold text-pro-primary">১</span><span><strong className="block">সপ্তাহের যত্ন দেখুন</strong><span className="text-pro-muted">প্রশ্ন ও পরীক্ষার তথ্য উৎসসহ পড়ুন।</span></span></li>
                      <li className="flex gap-3"><span aria-hidden="true" className="font-semibold text-pro-primary">২</span><span><strong className="block">মা বা শিশুর তথ্য লিখুন</strong><span className="text-pro-muted">সঠিক নথি বেছে, মান মিলিয়ে সংরক্ষণ করুন।</span></span></li>
                      <li className="flex gap-3"><span aria-hidden="true" className="font-semibold text-pro-primary">৩</span><span><strong className="block">ইতিহাস দেখে রাখুন</strong><span className="text-pro-muted">ভিজিটের আগে দরকারি তথ্য নিজে বেছে নিন।</span></span></li>
                    </ol>
                  </section>
                </div>
              </div>
            )}
            {task === "guide" && <CareGuide currentWeek={journey?.weeks ?? null} currentDay={journey?.days ?? 0} selection={guideSelection} onSelectionChange={(next) => setGuideSelections((previous) => ({ ...previous, [guideKey]: next }))} headingRef={guideHeading} onBack={() => openTask("home")} onAddNote={() => openTask("note")} bujhiHref="/app/bujhi" />}
            {task === "share" && <AccountVisitPack key={guideKey} rows={recent.filter((item) => belongsToPregnancy(item, selectedPregnancy?.id, records.babies)).map((item) => ({ id: item.id, subject: item.subject, label: labels[item.kind] ?? item.kind, value: item.value, unit: item.unit, observedAt: formatDate(item.observed_at), source: sourceLabel(item) }))} onBack={() => openTask("home")} />}
            <nav
              aria-label="Jibonrekha quick actions"
              className="grid gap-3"
            >
              {task !== "home" && task !== "guide" && task !== "share" && (
                <button
                  type="button"
                  onClick={() => openTask("home")}
                  className="min-h-12 rounded-field border border-pro-border bg-pro-bg px-4 py-2 text-left font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus sm:col-span-2"
                >
                  ← জীবনরেখায় ফিরুন
                </button>
              )}
              {task !== "home" && task !== "guide" && task !== "share" && (
                <label className="grid gap-1 sm:col-span-2">
                  অন্য কাজ বেছে নিন
                  <select
                    value={task}
                    onChange={(event) => openTask(event.target.value as Task)}
                    className={input}
                  >
                    {tasks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {task === "home" && (
                <div className="grid gap-3">
                    <button type="button" onClick={() => openTask("observation")} className={`${action} flex items-center justify-center gap-2 text-center`}><Plus className="size-5" aria-hidden="true" />মা বা শিশুর তথ্য যোগ করুন</button>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openTask("records")} className="min-h-11 rounded-pill border border-pro-control-border px-4 font-semibold text-pro-primary">ইতিহাস</button>
                    <button type="button" onClick={() => openTask("visit")} className="min-h-11 rounded-pill border border-pro-control-border px-4 font-semibold text-pro-primary">ভিজিট</button>
                    <button type="button" onClick={() => openTask("share")} className="min-h-11 rounded-pill border border-pro-control-border px-4 font-semibold text-pro-primary">শেয়ার</button>
                    <Link href="/app/bujhi" className="inline-flex min-h-11 items-center rounded-pill border border-pro-control-border px-4 font-semibold text-pro-primary">রিপোর্ট বুঝি</Link>
                  </div>
                  <details className="rounded-field border border-pro-border bg-pro-elevated p-4"><summary className="min-h-11 cursor-pointer font-semibold text-pro-primary">আরও তথ্য যোগ করুন</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{tasks.filter((item) => !["observation", "records", "visit"].includes(item.id)).map((item) => <button key={item.id} type="button" onClick={() => openTask(item.id)} className="min-h-12 rounded-field border border-pro-control-border px-4 py-2 text-left font-semibold text-pro-primary">{item.label} →</button>)}</div></details>
                </div>
              )}
            </nav>
            <section
              hidden={task !== "home"}
              className="grid gap-4"
              aria-label="Recent account activity"
            >
              <h2 className="text-2xl font-semibold">একই তারিখের রেখায় মা ও শিশু</h2>
              <div className="grid gap-5 md:grid-cols-2">{(["mother", "baby"] as const).map((lane) => {
                const items = recent.filter((item) => item.subject === lane && (!selectedPregnancy || (lane === "mother" ? item.pregnancy_id === selectedPregnancy.id : currentBabyIds.has(item.baby_id ?? "")))).slice(0, 3);
                return <section key={lane} className="grid content-start gap-3" aria-label={lane === "mother" ? "মায়ের সাম্প্রতিক তথ্য" : "শিশুর সাম্প্রতিক তথ্য"}>
                  <h3 className="border-b-2 border-pro-primary pb-2 text-lg font-semibold">{lane === "mother" ? "● মা" : "□ শিশু"}</h3>
                  {items.length ? items.map((item) => <article key={item.id} className="rounded-card bg-pro-surface p-5">
                    <p className="text-sm font-semibold text-pro-primary">{lane === "mother" ? "● মা" : "□ শিশু"} · {formatBnDate(item.observed_at)}</p>
                    <h4 className="mt-2 text-lg font-semibold">{labels[item.kind] ?? item.kind}</h4>
                    <p className="mt-2 text-2xl font-semibold">{item.value} {item.unit && <span className="text-base font-normal">{item.unit}</span>}</p>
                    <p className={`mt-3 inline-flex max-w-full rounded-pill border px-3 py-1 text-sm font-semibold [overflow-wrap:anywhere] ${item.source === "document_extracted" && item.verification !== "user_verified" ? "border-dashed border-pro-warning bg-pro-warning-soft text-pro-warning" : item.verification === "clinician_confirmed" ? "border-pro-success bg-pro-success-soft text-pro-success" : "border-pro-control-border bg-pro-elevated text-pro-text"}`}>♙ {sourceLabel(item)}</p>
                    <button type="button" onClick={() => openTask("records")} className="mt-3 min-h-11 font-semibold text-pro-primary underline">বিস্তারিত ও ইতিহাস দেখুন</button>
                  </article>) : <p className="rounded-card border border-pro-border bg-pro-elevated p-5 text-pro-muted">এই নথিতে এখনও {lane === "mother" ? "মায়ের" : "শিশুর"} তথ্য নেই।</p>}
                </section>;
              })}</div>
            </section>
            {task === "home" && <details className="rounded-card border border-pro-border bg-pro-elevated p-5"><summary className="min-h-11 cursor-pointer text-lg font-semibold">সন্তান হওয়ার পর</summary><p className="mt-2">শিশুর আলাদা নথি ও মায়ের নিজের নোট এখানে রাখতে পারেন। পূর্ণ প্রসবোত্তর, টিকা ও শিশুর বৃদ্ধির নথি এখনও সীমিত।</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => openTask("baby")} className="min-h-11 font-semibold text-pro-primary underline">শিশুর নথি</button><button type="button" onClick={() => openTask("note")} className="min-h-11 font-semibold text-pro-primary underline">মায়ের নোট</button><Link href="/app/shusthota" className="inline-flex min-h-11 items-center font-semibold text-pro-primary underline">সুস্থতা</Link></div></details>}
            <h2
              ref={taskHeading}
              tabIndex={-1}
              className="text-2xl font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus"
              hidden={task === "home" || task === "guide" || task === "share"}
            >
              {task === "guide" ? "" : tasks.find((item) => item.id === task)?.label}
            </h2>
            <section
              hidden={task !== "pregnancy"}
              aria-label="Create a pregnancy record"
            >
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "pregnancy",
                      record: {
                        label: data.get("label"),
                        estimatedDueDate: data.get("due") || null,
                        lastMenstrualPeriodDate: data.get("period") || null,
                      },
                    },
                    form,
                    "Pregnancy",
                  );
                }}
              >
                <h3 className="text-xl font-semibold">গর্ভকালের নথি</h3>
                <label className="grid gap-1">
                  নথির নাম
                  <input
                    name="label"
                    maxLength={100}
                    required
                    className={input}
                    placeholder="যেমন: প্রথম গর্ভকাল"
                  />
                </label>
                <label className="grid gap-1">
                  সম্ভাব্য প্রসবের তারিখ (ঐচ্ছিক)
                  <input name="due" type="date" className={input} />
                </label>
                <label className="grid gap-1">
                  শেষ মাসিকের প্রথম দিন (ঐচ্ছিক)
                  <input name="period" type="date" className={input} />
                </label>
                <p className="text-pro-muted">
                  তারিখ আপনার লেখা অনুযায়ী রাখা হবে। জীবনরেখার হিসাব চিকিৎসকের নিশ্চিত করা তারিখ নয়।
                </p>
                <button disabled={busy} className={action}>
                  গর্ভকালের নথি সংরক্ষণ করুন
                </button>
              </form>
            </section>
            <section hidden={task !== "baby"} aria-label="Create a baby record">
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "baby",
                      record: {
                        label: data.get("label"),
                        pregnancyId: data.get("pregnancy") || null,
                        birthDate: data.get("birth") || null,
                      },
                    },
                    form,
                    "Baby record",
                  );
                }}
              >
                <h3 className="text-xl font-semibold">শিশুর নথি</h3>
                <label className="grid gap-1">
                  শিশুর নথির নাম
                  <input
                    name="label"
                    maxLength={100}
                    required
                    className={input}
                    placeholder="যেমন: আমার শিশু"
                  />
                </label>
                <label className="grid gap-1">
                  সম্পর্কিত গর্ভকাল (ঐচ্ছিক)
                  <select name="pregnancy" className={input}>
                    <option value="">গর্ভকাল বাছা হয়নি</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  জন্মতারিখ (ঐচ্ছিক)
                  <input
                    name="birth"
                    type="date"
                    max={today()}
                    className={input}
                  />
                </label>
                <p className="text-pro-muted">
                  প্রতিটি শিশুর আলাদা নথি। একই গর্ভকালের সঙ্গে একাধিক শিশুর নথি যুক্ত করা যায়।
                </p>
                <button disabled={busy} className={action}>
                  শিশুর নথি সংরক্ষণ করুন
                </button>
              </form>
            </section>
            <section
              hidden={task !== "observation"}
              className={`${box} grid max-w-3xl gap-6`}
              aria-label="Record a measurement or note"
            >
              <div className="grid gap-2"><p className="font-semibold text-pro-primary">ধাপ {bengaliNumber(observationStep)} / ৩</p><h3 className="text-xl font-semibold">{observationStep === 1 ? "কার নথিতে লিখবেন?" : observationStep === 2 ? "তথ্য লিখুন" : "সংরক্ষণের আগে মিলিয়ে নিন"}</h3><p className="text-pro-muted">মা ও শিশুর নথি আলাদা থাকবে। আপনার লেখা তথ্য চিকিৎসক নিশ্চিত করেছেন বলে দেখানো হবে না।</p></div>
              <div hidden={observationStep !== 1} className="grid gap-5">
                <label className="grid gap-1">
                  কার নথি?
                  <select
                    value={subject}
                    disabled={pendingObservation !== null}
                    onChange={(event) =>
                      selectSubject(event.target.value as "mother" | "baby")
                    }
                    className={input}
                  >
                    <option value="mother">মা</option>
                    <option value="baby">শিশু</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  কোন গর্ভকালের নথি? (ঐচ্ছিক)
                  <select
                    value={pregnancyId}
                    disabled={pendingObservation !== null}
                    onChange={(event) => setPregnancyId(event.target.value)}
                    className={input}
                  >
                    <option value="">গর্ভকাল বাছা হয়নি</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {subject === "baby" && (
                <label hidden={observationStep !== 1} className="grid gap-1">
                  কোন শিশুর নথি?
                  <select
                    value={selectedBabyId}
                    disabled={pendingObservation !== null}
                    onChange={(event) => setBabyId(event.target.value)}
                    className={input}
                  >
                    <option value="">শিশু বেছে নিন</option>
                    {visibleBabies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {observationStep === 1 && <div className="grid gap-3"><button type="button" disabled={subject === "baby" && !selectedBabyId} onClick={() => setObservationStep(2)} className={action}>তথ্য লেখার ধাপে যান →</button>{subject === "baby" && !selectedBabyId && <p className="text-pro-muted">{visibleBabies.length ? "আগে কোন শিশুর নথি বেছে নিন।" : "আগে শিশুর নথি যোগ করুন।"} {!visibleBabies.length && <button type="button" onClick={() => openTask("baby")} className="font-semibold text-pro-primary underline">শিশুর নথি যোগ করুন</button>}</p>}</div>}
              <form
                className="grid gap-5"
                hidden={observationStep !== 2}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  const date = String(data.get("date"));
                  const payload = {
                      type: "observation",
                      record: {
                        destination:
                          subject === "mother"
                            ? { subject, pregnancyId: pregnancyId || null }
                            : { subject, babyId: selectedBabyId },
                        measurement: {
                          kind,
                          value: data.get("value"),
                          unit: kind === "note" ? null : unit,
                        },
                        observedAt: `${date}T00:00:00+06:00`,
                        sourceNote: null,
                      },
                    };
                  setPendingObservation({ payload, form, summary: `${subject === "mother" ? "মায়ের নথি" : `শিশুর নথি: ${visibleBabies.find((item) => item.id === selectedBabyId)?.label ?? ""}`} · ${labels[kind]}: ${String(data.get("value") ?? "")} ${kind === "note" ? "" : unit} · ${date}` });
                   setObservationStep(3);
                  requestAnimationFrame(() => reviewHeading.current?.focus());
                }}
              >
                <label className="grid gap-1">
                  কী তথ্য লিখবেন?
                  <select
                    value={kind}
                    onChange={(event) => {
                      const selected = choices[subject].find(
                        (choice) => choice[0] === event.target.value,
                      );
                      setKind(selected?.[0] ?? "weight");
                      setUnit(selected?.[1] ?? "kg");
                    }}
                    className={input}
                  >
                    {choices[subject].map(([value]) => (
                      <option key={value} value={value}>
                        {labels[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  {kind === "note" ? "নোট" : `${labels[kind]}-এর মান`}
                  {kind === "note" ? (
                    <textarea
                      name="value"
                      required
                      maxLength={2000}
                      className={input}
                    />
                  ) : (
                    <input
                      name="value"
                      required
                      inputMode="decimal"
                      pattern="-?[0-9]{1,9}(\.[0-9]{1,6})?"
                      className={input}
                    />
                  )}
                </label>
                {kind !== "note" &&
                  (unitOptions[kind] ? (
                    <label className="grid gap-1">
                      একক
                      <select
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        className={input}
                      >
                        {unitOptions[kind].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p>একক: {unit}</p>
                  ))}
                <label className="grid gap-1">
                  কবে লেখা বা মাপা হয়েছে?
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <p className="text-pro-muted">
                  রক্তচাপের দুটি সংখ্যা আলাদা করে লিখুন। নিজের মাপা মান লিখুন; এখানে রোগ নির্ণয় হয় না।
                </p>
                <button type="button" onClick={() => setObservationStep(1)} className="min-h-11 w-fit font-semibold text-pro-primary underline">← কার নথি, বদলান</button>
                <button
                  type="submit"
                  disabled={busy || (subject === "baby" && !selectedBabyId)}
                  className={action}
                >
                  সংরক্ষণের আগে দেখুন →
                </button>
              </form>
              {pendingObservation && observationStep === 3 && <section className="grid gap-5 rounded-field border border-pro-border bg-pro-elevated p-5" aria-labelledby="observation-review-title">
                <h3 id="observation-review-title" ref={reviewHeading} tabIndex={-1} className="text-xl font-semibold">সংরক্ষণের আগে দেখুন</h3>
                <p>{pendingObservation.summary}</p><p>উৎস: আপনার লেখা। চিকিৎসক যাচাই করেননি।</p>
                <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { setPendingObservation(null); setObservationStep(2); }} className="min-h-11 rounded-field border border-pro-control-border px-4 font-semibold text-pro-primary">সংশোধন করুন</button><button type="button" disabled={busy} onClick={() => { void save(pendingObservation.payload, pendingObservation.form, "তথ্য").then((saved) => { if (saved) { setPendingObservation(null); setObservationStep(1); } }); }} className={action}>আমার অ্যাকাউন্টে সংরক্ষণ করুন</button></div>
              </section>}
            </section>
            <section
              hidden={task !== "note"}
              className="grid gap-4 sm:grid-cols-2"
              aria-label="Write a health note"
            >
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "condition",
                      record: {
                        pregnancyId: data.get("pregnancy") || null,
                        label: data.get("label"),
                        documentedAt: `${data.get("date")}T00:00:00+06:00`,
                        sourceNote: data.get("sourceNote") || null,
                      },
                    },
                    form,
                    "Self-noted condition",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Condition you noted</h2>
                <p>
                  This is your own note. It does not create a clinical
                  diagnosis.
                </p>
                <label className="grid gap-1">
                  What would you like to record?
                  <input
                    name="label"
                    maxLength={300}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Pregnancy (optional)
                  <select name="pregnancy" className={input}>
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Date noted
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Where did this information come from? (optional)
                  <input name="sourceNote" maxLength={500} className={input} />
                </label>
                <button disabled={busy} className={action}>
                  Save your note
                </button>
              </form>
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "symptom_note",
                      record: {
                        pregnancyId: data.get("pregnancy") || null,
                        note: data.get("note"),
                        occurredAt: `${data.get("date")}T00:00:00+06:00`,
                      },
                    },
                    form,
                    "Symptom note",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Symptom note</h2>
                <p>
                  Keep words for a future conversation with a care professional.
                </p>
                <label className="grid gap-1">
                  Your note
                  <textarea
                    name="note"
                    maxLength={2000}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Pregnancy (optional)
                  <select name="pregnancy" className={input}>
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <button disabled={busy} className={action}>
                  Save symptom note
                </button>
              </form>
            </section>
            <section
              hidden={task !== "visit"}
              className={`${box} grid gap-3`}
              aria-label="Record a visit"
            >
              <p>
                Keep a record of a visit that happened. This does not book an
                appointment or confirm a provider response.
              </p>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "visit",
                      record: {
                        subject,
                        parentId:
                          subject === "mother"
                            ? pregnancyId || null
                            : selectedBabyId || null,
                        occurredAt: `${data.get("date")}T00:00:00+06:00`,
                        placeNote: data.get("place") || null,
                        note: data.get("note") || null,
                      },
                    },
                    form,
                    "Visit",
                  );
                }}
              >
                <label className="grid gap-1">
                  Whose visit?
                  <select
                    value={subject}
                    onChange={(event) =>
                      selectSubject(event.target.value as "mother" | "baby")
                    }
                    className={input}
                  >
                    <option value="mother">Mother</option>
                    <option value="baby">Baby</option>
                  </select>
                </label>
                {subject === "mother" ? (
                  <label className="grid gap-1">
                    Pregnancy (optional)
                    <select
                      value={pregnancyId}
                      onChange={(event) => setPregnancyId(event.target.value)}
                      className={input}
                    >
                      <option value="">No pregnancy selected</option>
                      {records.pregnancies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="grid gap-1">
                    Baby
                    <select
                      value={selectedBabyId}
                      onChange={(event) => setBabyId(event.target.value)}
                      className={input}
                    >
                      <option value="">Choose a baby</option>
                      {visibleBabies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="grid gap-1">
                  Visit date
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Place (optional)
                  <input name="place" maxLength={300} className={input} />
                </label>
                <label className="grid gap-1">
                  What would you like to remember? (optional)
                  <textarea name="note" maxLength={2000} className={input} />
                </label>
                <button
                  disabled={busy || (subject === "baby" && !selectedBabyId)}
                  className={action}
                >
                  Save visit
                </button>
              </form>
            </section>
            <section
              hidden={task !== "records"}
              className={`${box} grid gap-4`}
              aria-label="Saved account records"
            >
              <div><h3 className="text-xl font-semibold">তারিখ অনুযায়ী ইতিহাস</h3><p className="text-pro-muted">মা ও শিশুর নথি আলাদা থাকে। উৎস ও সংশোধনের আগের মান দেখুন।</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  কার তথ্য দেখবেন?
                  <select
                    value={historySubject}
                    onChange={(event) => setHistorySubject(event.target.value as typeof historySubject)}
                    className={input}
                  >
                    <option value="both">মা ও শিশু</option>
                    <option value="mother">শুধু মা</option>
                    <option value="baby">শুধু শিশু</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  গর্ভকাল
                  <select
                    value={pregnancyId}
                    onChange={(event) => setPregnancyId(event.target.value)}
                    className={input}
                  >
                    <option value="">সব গর্ভকাল</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {historySubject === "baby" && (
                  <label className="grid gap-1">
                    কোন শিশুর নথি?
                    <select
                      value={selectedBabyId}
                      onChange={(event) => setBabyId(event.target.value)}
                      className={input}
                    >
                      <option value="">শিশুর নথি বেছে নিন</option>
                      {visibleBabies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="grid gap-1">তথ্য খুঁজুন
                  <input type="search" value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="যেমন: ওজন" className={input} />
                </label>
                <label className="grid gap-1">ধরন
                  <select value={historyKind} onChange={(event) => setHistoryKind(event.target.value)} className={input}><option value="all">সব ধরন</option>{[...new Set(activeObservations.map((item) => item.kind))].map((value) => <option key={value} value={value}>{labels[value] ?? value}</option>)}</select>
                </label>
              </div>
              <h3 className="font-semibold">
                {historySubject === "both" ? "মা ও শিশুর" : historySubject === "mother" ? "মায়ের" : "শিশুর"} তথ্য · {bengaliNumber(visible.length)}টি
              </h3>
              {visible.length ? (
                <ul className="grid gap-2">
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      className="grid gap-2 rounded-field border border-pro-border p-3"
                    >
                      <strong>
                        {labels[item.kind] ?? item.kind}: {item.value}
                        {item.unit ? ` ${item.unit}` : ""}
                      </strong>
                      <p>
                        <span>{item.subject === "mother" ? "● মা" : "□ শিশু"}</span> · <time dateTime={item.observed_at}>{formatBnDate(item.observed_at)}</time>{" "}
                        ·{" "}
                        {sourceLabel(item)}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectingId(
                            item.id === correctingId ? null : item.id,
                          )
                        }
                        className="w-fit min-h-11 rounded-field border border-pro-border px-3 py-2 font-semibold text-pro-primary"
                      >
                        {item.id === correctingId
                          ? "সংশোধন বাদ দিন"
                          : "মান সংশোধন করুন"}
                      </button>
                      {item.id === correctingId && (
                        <form
                          className="grid gap-3 border-t border-pro-border pt-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = event.currentTarget;
                            const data = new FormData(form);
                            void save(
                              {
                                type: "correction",
                                record: {
                                  subject: item.subject,
                                  observationId: item.id,
                                  value: data.get("value"),
                                  unit:
                                    item.kind === "note"
                                      ? null
                                      : data.get("unit"),
                                  reason: data.get("reason"),
                                },
                              },
                              form,
                              "Correction",
                            );
                          }}
                        >
                          <p>
                            আগের মান ইতিহাসে থাকবে। রিপোর্টের মান সংশোধন করলে নতুন মান আপনার নিজের লেখা হিসেবে থাকবে।
                          </p>
                          <label className="grid gap-1">
                            নতুন মান
                            <input
                              name="value"
                              defaultValue={item.value}
                              required
                              maxLength={2000}
                              className={input}
                            />
                          </label>
                          {item.kind !== "note" && (
                            <label className="grid gap-1">
                              একক
                              <select
                                name="unit"
                                defaultValue={item.unit ?? ""}
                                className={input}
                              >
                                {(
                                  unitOptions[item.kind] ?? [item.unit ?? ""]
                                ).map((value) => (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <label className="grid gap-1">
                            সংশোধনের কারণ
                            <input
                              name="reason"
                              required
                              maxLength={500}
                              className={input}
                            />
                          </label>
                          <button disabled={busy} className={action}>
                            সংশোধন সংরক্ষণ করুন
                          </button>
                        </form>
                      )}
                      {historyFor(item.id).length > 0 && (
                        <details>
                          <summary className="cursor-pointer font-semibold">
                            সংশোধনের ইতিহাস ({bengaliNumber(historyFor(item.id).length)})
                          </summary>
                          <ul className="grid gap-2 pt-2">
                            {historyFor(item.id).map((previous) => (
                              <li
                                key={previous.record.id}
                                className="border-t border-pro-border pt-2"
                              >
                                আগের মান: {previous.record.value}
                                {previous.record.unit
                                  ? ` ${previous.record.unit}`
                                  : ""}{" "}
                                · {formatBnDate(previous.record.observed_at)}
                                <br />
                                কারণ: {previous.reason}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>এই বাছাইয়ে কোনো তথ্য নেই। অন্য গর্ভকাল বা ধরন বেছে দেখুন।</p>
              )}
              <details className="border-t border-pro-border pt-3">
                <summary className="cursor-pointer font-semibold">
                  গর্ভকাল ও শিশুর নথি
                </summary>
                <div className="grid gap-4 pt-3 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold">গর্ভকাল</h4>
                    {records.pregnancies.length ? (
                      <ul className="list-disc pl-5">
                        {records.pregnancies.map((item) => (
                          <li key={item.id}>
                            {item.label}
                            {item.estimated_due_date
                              ? ` · লেখা সম্ভাব্য তারিখ: ${formatBnDate(item.estimated_due_date)}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>এখনও কোনো গর্ভকালের নথি নেই।</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">শিশু</h4>
                    {records.babies.length ? (
                      <ul className="list-disc pl-5">
                        {records.babies.map((item) => (
                          <li key={item.id}>
                            {item.label}
                            {item.birth_date
                              ? ` · জন্ম: ${formatBnDate(item.birth_date)}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>এখনও কোনো শিশুর নথি নেই।</p>
                    )}
                  </div>
                </div>
              </details>
              <Link
                href="/app/bujhi"
                className="font-semibold text-pro-primary underline"
              >
                বুঝিতে রিপোর্ট যাচাই করুন
              </Link>
            </section>
          </>
        )
      )}
      {records && (
        <section
          hidden={task !== "records"}
          className={`${box} grid gap-4`}
          aria-label="Self-noted history"
        >
          <h3 className="font-semibold">আপনার নিজের লেখা ইতিহাস</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">আপনার লেখা শারীরিক অবস্থার কথা</h4>
              {records.conditions.some((item) => !pregnancyId || item.pregnancy_id === pregnancyId) ? (
                <ul className="grid gap-2">
                  {records.conditions.filter((item) => !pregnancyId || item.pregnancy_id === pregnancyId).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-field border border-pro-border p-3"
                    >
                      <strong>{item.label}</strong>
                      <p>
                        {formatBnDate(item.documented_at)} · আপনার লেখা · নিশ্চিত রোগনির্ণয় নয়
                      </p>
                      {item.source_note && (
                        <p>উৎসের নোট: {item.source_note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>এখনও কিছু লেখা নেই।</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold">উপসর্গের নোট</h4>
              {records.symptomNotes.some((item) => !pregnancyId || item.pregnancy_id === pregnancyId) ? (
                <ul className="grid gap-2">
                  {records.symptomNotes.filter((item) => !pregnancyId || item.pregnancy_id === pregnancyId).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-field border border-pro-border p-3"
                    >
                      <p>{item.note}</p>
                      <p>{formatBnDate(item.occurred_at)} · আপনার লেখা</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>এখনও উপসর্গের নোট নেই।</p>
              )}
            </div>
          </div>
          <h3 className="font-semibold">আপনার লেখা ভিজিট</h3>
          {records.visits.some((item) => belongsToPregnancy(item, pregnancyId || undefined, records.babies)) ? (
            <ul className="grid gap-2">
              {records.visits.filter((item) => belongsToPregnancy(item, pregnancyId || undefined, records.babies)).map((item) => (
                <li
                  key={item.id}
                  className="rounded-field border border-pro-border p-3"
                >
                  <strong>
                    {item.subject === "baby" ? "শিশু" : "মা"} ·{" "}
                    {formatBnDate(item.occurred_at)}
                  </strong>
                  <p>
                    আপনার লেখা · বুকিং বা সেবাদাতার উত্তর নিশ্চিত নয়
                  </p>
                  {item.place_note && <p>স্থান: {item.place_note}</p>}
                  {item.note && <p>{item.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>এই অ্যাকাউন্টে এখনও ভিজিট লেখা নেই।</p>
          )}
        </section>
      )}
      <details className="rounded-field border border-pro-border px-4 py-3">
        <summary className="cursor-pointer font-semibold">
          এই অংশ সম্পর্কে
        </summary>
        <p className="pt-2">
          এই MVP অ্যাকাউন্টে কাল্পনিক পরীক্ষার তথ্য ব্যবহার করুন। এখানকার নথি
          অ্যাকাউন্টে সংরক্ষিত হয়; আগের ব্রাউজার-শুধু নমুনার সঙ্গে মেশে না।
        </p>
      </details>
    </div>
  );
}
