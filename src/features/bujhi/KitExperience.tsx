"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { demoUser, getDemoWorkspace, saveDemoObservation } from "@/features/jibonrekha/demo-health";
import { calendarDate, dhakaToday } from "@/features/jibonrekha/records-model";
import { explainKit, retestWindow, type KitPick, type Timing, type Window } from "./kit-result";

type Step = "start" | "context" | "reading" | "mark" | "result" | "guide" | "states" | "text" | "note" | "saved";
type KitType = "strip" | "digital";
const primary = "inline-flex min-h-12 items-center justify-center rounded-field bg-pro-primary px-5 py-3 text-center font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-55";
const secondary = "inline-flex min-h-12 items-center justify-center rounded-field border border-pro-control-border bg-pro-elevated px-5 py-3 text-center font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";
const card = "rounded-card border border-pro-border bg-pro-elevated p-5";
const field = "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const sourceTest = "https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/";
const sourceUrgent = "https://www.nhs.uk/conditions/ectopic-pregnancy/symptoms/";
const sourceRepeat = "https://www.gloshospitals.nhs.uk/our-services/services-we-offer/pathology/tests-and-investigations/pregnancy-test-beta-hcg/";

const stripChoices: { id: KitPick; title: string; detail: string }[] = [
  { id: "two", title: "C ও T—দুটি রেখা", detail: "নির্দেশনার সময়ের মধ্যে দুটি রেখা দেখেছি" },
  { id: "faint", title: "C ও ফিকে T রেখা", detail: "T রেখাটি হালকা বা অস্পষ্ট" },
  { id: "one", title: "শুধু C রেখা", detail: "T রেখা দেখিনি" },
  { id: "none", title: "C রেখা নেই", detail: "T থাকুক বা না থাকুক, C নেই" },
  { id: "unsure", title: "নিশ্চিত নই", detail: "রেখা বা অক্ষর স্পষ্ট বোঝা যাচ্ছে না" },
];
const digitalChoices: { id: KitPick; title: string; detail: string }[] = [
  { id: "dpos", title: "Pregnant লেখা", detail: "ডিজিটাল পর্দায় এভাবেই লেখা আছে" },
  { id: "dneg", title: "Not pregnant লেখা", detail: "ডিজিটাল পর্দায় এভাবেই লেখা আছে" },
  { id: "unsure", title: "নিশ্চিত নই", detail: "লেখা দেখা যাচ্ছে না বা বুঝতে পারছি না" },
];
const pickText: Record<KitPick, string> = {
  two: "C ও T—দুটি রেখা", faint: "C ও ফিকে T রেখা", one: "শুধু C রেখা", none: "C রেখা নেই",
  dpos: "ডিজিটালে Pregnant লেখা", dneg: "ডিজিটালে Not pregnant লেখা", unsure: "চিহ্ন স্পষ্ট নয়",
};

function KitSketch({ pick }: { pick: KitPick }) {
  if (pick === "dpos" || pick === "dneg") return <div role="img" aria-label={pickText[pick]} className="flex min-h-20 items-center justify-center rounded-field border-2 border-pro-control-border bg-pro-bg px-4 font-semibold" lang="en">{pick === "dpos" ? "Pregnant" : "Not pregnant"}</div>;
  return <div role="img" aria-label={pickText[pick]} className="flex min-h-20 max-w-48 items-center justify-center gap-8 rounded-field border-2 border-pro-control-border bg-pro-bg px-4 text-pro-primary">
    <span className="grid justify-items-center gap-1"><span className={`h-9 w-1 border-l-4 ${pick === "none" || pick === "unsure" ? "border-dashed opacity-35" : "border-solid"}`} /><span className="text-xs font-semibold">C</span></span>
    <span className="grid justify-items-center gap-1"><span className={`h-9 w-1 border-l-4 ${pick === "faint" ? "border-dashed" : "border-solid"} ${pick === "two" || pick === "faint" ? "" : "opacity-20"}`} /><span className="text-xs font-semibold">T</span></span>
  </div>;
}

function UrgentHelp({ prominent = false }: { prominent?: boolean }) {
  return <aside aria-label="জরুরি লক্ষণ ও সাহায্য" className={`grid gap-3 rounded-card border p-5 ${prominent ? "border-pro-danger bg-pro-danger-soft" : "border-pro-control-border bg-pro-surface"}`}>
    <h2 className="text-xl font-semibold">জরুরি লক্ষণ থাকলে অপেক্ষা করবেন না</h2>
    <p>এক পাশে তীব্র তলপেট ব্যথা, বেশি রক্তপাত, অজ্ঞান লাগা বা অজ্ঞান হওয়া, অথবা কাঁধের আগায় ব্যথা থাকলে কিটের ফল যা-ই দেখাক, দ্রুত জরুরি চিকিৎসা নিন।</p>
    <div className="flex flex-wrap gap-2"><a href="tel:999" className={primary}>বাংলাদেশে জরুরি সেবা ৯৯৯</a><Link href="/safety" className={secondary}>সহায়তার তথ্য</Link></div>
    <p className="text-sm">বাংলাদেশের বাইরে থাকলে স্থানীয় জরুরি নম্বরে কল করুন।</p>
    <a href={sourceUrgent} target="_blank" rel="noreferrer" className="w-fit font-semibold text-pro-primary underline">উৎস: NHS, ectopic pregnancy symptoms ↗</a>
  </aside>;
}

function Progress({ step }: { step: Step }) {
  const index = step === "context" ? 0 : step === "reading" ? 1 : step === "mark" ? 2 : step === "result" || step === "note" || step === "saved" ? 3 : -1;
  if (index < 0) return null;
  return <ol aria-label="কিট বোঝার ধাপ" className="grid grid-cols-4 gap-2 text-sm font-semibold">
    {["কিট", "সময় ও লক্ষণ", "যা দেখেছেন", "পরের কাজ"].map((name, at) => <li key={name} aria-current={index === at ? "step" : undefined} className={`border-t-4 pt-2 ${at <= index ? "border-pro-primary text-pro-text" : "border-pro-control-border text-pro-muted"}`}>{name}</li>)}
  </ol>;
}

export function KitExperience({ mode = "demo" }: { mode?: "demo" | "account" }) {
  const [step, setStep] = useState<Step>("start");
  const [kitType, setKitType] = useState<KitType | "">("");
  const [timing, setTiming] = useState<Timing | "">("");
  const [window, setWindow] = useState<Window | "">("");
  const [urgent, setUrgent] = useState<boolean | null>(null);
  const [pick, setPick] = useState<KitPick | "">("");
  const [testDate, setTestDate] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [workspace, setWorkspace] = useState<ReturnType<typeof getDemoWorkspace> | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    globalThis.addEventListener("online", update); globalThis.addEventListener("offline", update);
    const initial = globalThis.setTimeout(() => { update(); if (mode === "demo") { try { setWorkspace(getDemoWorkspace()); } catch { setError("ডেমো রেকর্ড পড়া যায়নি। আগের তথ্য বদলানো হয়নি।"); } } }, 0);
    return () => { globalThis.clearTimeout(initial); globalThis.removeEventListener("online", update); globalThis.removeEventListener("offline", update); };
  }, [mode]);

  function go(next: Step) { setError(""); setNotice(""); setStep(next); requestAnimationFrame(() => heading.current?.focus()); }
  function restart() { setKitType(""); setTiming(""); setWindow(""); setUrgent(null); setPick(""); setTestDate(""); setEpisodeId(""); setAgreed(false); go("start"); }
  const result = kitType && timing && window && (pick || urgent) ? explainKit({ pick: pick || "unsure", timing, window, urgentSymptoms: urgent === true }) : null;
  const showPlan = result && !result.urgentFirst && result.retest && result.key !== "invalid" && result.key !== "unclear";
  const plan = showPlan && calendarDate(testDate) ? retestWindow(new Date(`${testDate}T12:00:00`), result.retest!.afterHours) : null;
  const format = (date: Date) => new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(date);

  function saveNote() {
    if (mode !== "demo" || !workspace || !result || result.urgentFirst || !pick || !agreed || !episodeId || !calendarDate(testDate) || testDate > dhakaToday()) {
      setError("তারিখ, গর্ভকাল ও সম্মতি মিলিয়ে দেখুন। ভবিষ্যতের তারিখ বা অসম্পূর্ণ তথ্য সংরক্ষণ হবে না।"); return;
    }
    if (!workspace.episodes.some(item => item.id === episodeId)) { setError("গর্ভকালটি পাওয়া যায়নি। আবার বেছে নিন।"); return; }
    try {
      saveDemoObservation({ id: crypto.randomUUID(), pregnancyId: episodeId, recordType: "mother", recordId: workspace.profile.id,
        label: "ঘরে করা pregnancy kit — নিজের নোট", value: `কিটে দেখা: ${pickText[pick]}; ${window === "in" ? "নির্দেশনার সময়ের মধ্যে পড়া" : window === "late" ? "নির্দেশনার সময়ের পরে পড়া" : "পড়ার সময় নিশ্চিত নয়"}.`, unit: "", observedAt: testDate,
        source: "self_reported", category: "general_notes", notes: "নিজের বলা তথ্য; ছবি বা চিকিৎসকের নিশ্চিতকরণ নয়।", enteredBy: demoUser.id });
      go("saved"); setNotice("এই ডিভাইসের বিস্তারিত জীবনরেখা ডেমোতে নিজের নোট হিসেবে সংরক্ষিত। সার্ভারে বা কাউকে পাঠানো হয়নি।");
    } catch { setError("সংরক্ষণ নিশ্চিত হয়নি। আপনার বাছাইগুলো এই পাতায় আছে; আবার চেষ্টা করুন।"); }
  }

  const title: Record<Step, string> = { start: "কিটের ফল বুঝি", context: "কোন কিট, কখন পরীক্ষা?", reading: "কখন পড়েছেন, কোনো জরুরি লক্ষণ আছে?", mark: "কিটে কী দেখেছেন?", result: "আপনি যা দেখেছেন", guide: "কিট বোঝার ছোট গাইড", states: "সব অবস্থার ব্যাখ্যা", text: "লেখায় কিটের চিহ্ন", note: "নিজের নোট রাখবেন?", saved: "নোট রাখার ফল" };
  return <div lang="bn" className="min-h-dvh bg-pro-bg text-pro-text">
    <header className="border-b border-pro-border px-4 py-3"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 font-semibold"><Link href="/" className="text-lg text-pro-primary">প্রহর</Link><span className="border-l border-pro-border pl-2">বুঝি · কিট</span></div><div className="flex flex-wrap items-center gap-2"><AccessPreferencesControl compact /><Link href="/safety" className={`${secondary} text-sm`}>জরুরি সহায়তা</Link></div></div></header>
    {mode === "demo" && <p className="border-b border-pro-info bg-pro-info-soft px-4 py-2 text-center text-sm font-semibold text-pro-info">কাল্পনিক ডেমো · এখানে আসল রোগীর তথ্য লিখবেন না</p>}
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 pb-20 sm:px-6">
      <nav aria-label="বুঝি-তে ফিরে যান" className="flex flex-wrap gap-4"><Link href={mode === "demo" ? "/demo/bujhi" : "/app/bujhi"} className="inline-flex min-h-11 items-center font-semibold text-pro-primary underline">← রিপোর্ট বুঝি</Link>{step !== "start" && <button type="button" onClick={restart} className="min-h-11 font-semibold text-pro-primary underline">আবার শুরু</button>}</nav>
      <div className="mx-auto grid w-full max-w-2xl gap-5">
        <Progress step={step} />
        <div><p className="font-semibold text-pro-primary">বুঝি · ঘরে করা pregnancy kit</p><h1 ref={heading} tabIndex={-1} className="mt-1 text-3xl font-semibold leading-tight">{title[step]}</h1></div>
        {!online && <p role="status" className="rounded-field border border-pro-warning bg-pro-warning-soft p-4 text-pro-warning">ইন্টারনেট নেই। নির্দেশনা পড়া যায়; ডেমো নোট শুধু এই ডিভাইসে রাখা যায়। কোনো reminder পাঠানো হবে না।</p>}
        {error && <p role="alert" className="rounded-field border border-pro-danger bg-pro-danger-soft p-4 text-pro-danger">{error}</p>}
        {notice && <p role="status" className="rounded-field border border-pro-success bg-pro-success-soft p-4 text-pro-success">{notice}</p>}

        {step === "start" && <><p className="max-w-[60ch] text-lg">আপনার কিটে যা দেখছেন, কয়েকটি ছোট প্রশ্নে মিলিয়ে নিন। এখানে ছবি লাগে না; কোনো ফল নিজে থেকে রেকর্ডে যাবে না।</p><section className="rounded-card bg-pro-surface p-5"><h2 className="text-xl font-semibold">তিন ধাপে</h2><ol className="mt-3 list-decimal space-y-2 pl-6"><li>কিট ও পরীক্ষার সময় বলুন</li><li>কখন ফল পড়েছেন এবং জরুরি লক্ষণ আছে কি না বলুন</li><li>চিহ্ন বেছে নিয়ে পরের কাজ দেখুন</li></ol></section><button type="button" onClick={() => go("context")} className={primary}>শুরু করি</button><div className="grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => go("guide")} className={secondary}>কিট বোঝার গাইড</button><button type="button" onClick={() => go("text")} className={secondary}>সব চিহ্ন লেখায়</button><button type="button" onClick={() => go("states")} className={secondary}>সব অবস্থা</button></div><UrgentHelp /></>}

        {step === "context" && <><fieldset className={`${card} grid gap-3`}><legend className="px-1 text-lg font-semibold">কিটের ধরন</legend>{([{ id: "strip", label: "রেখা দেখা যায় (C / T)" }, { id: "digital", label: "পর্দায় লেখা দেখা যায়" }] as const).map(option => <label key={option.id} className="flex min-h-14 items-center gap-3 rounded-field border border-pro-control-border p-3"><input type="radio" name="kit-type" checked={kitType === option.id} onChange={() => { setKitType(option.id); setPick(""); }} className="size-5 shrink-0" /><span>{option.label}</span></label>)}</fieldset><fieldset className={`${card} grid gap-3`}><legend className="px-1 text-lg font-semibold">মাসিকের তুলনায় কখন পরীক্ষা করেছেন?</legend>{([{ id: "after", label: "মাসিকের নির্ধারিত দিন পেরিয়েছে" }, { id: "before", label: "নির্ধারিত দিনের আগে" }, { id: "irreg", label: "তারিখ জানা নেই বা মাসিক অনিয়মিত" }] as const).map(option => <label key={option.id} className="flex min-h-14 items-center gap-3 rounded-field border border-pro-control-border p-3"><input type="radio" name="kit-timing" checked={timing === option.id} onChange={() => setTiming(option.id)} className="size-5 shrink-0" /><span>{option.label}</span></label>)}</fieldset><div className="flex flex-wrap gap-2"><button type="button" onClick={() => kitType && timing ? go("reading") : setError("কিটের ধরন ও সময়—দুটিই বেছে নিন।")} className={primary}>পরের ধাপ</button><button type="button" onClick={() => go("start")} className={secondary}>পেছনে</button></div></>}

        {step === "reading" && <><fieldset className={`${card} grid gap-3`}><legend className="px-1 text-lg font-semibold">নির্দেশনায় যে সময় লেখা আছে, তার মধ্যে ফল পড়েছেন?</legend>{([{ id: "in", label: "হ্যাঁ, নির্দিষ্ট সময়ের মধ্যে" }, { id: "late", label: "না, সময় পেরোনোর পরে" }, { id: "na", label: "নিশ্চিত নই" }] as const).map(option => <label key={option.id} className="flex min-h-14 items-center gap-3 rounded-field border border-pro-control-border p-3"><input type="radio" name="read-window" checked={window === option.id} onChange={() => setWindow(option.id)} className="size-5 shrink-0" /><span>{option.label}</span></label>)}</fieldset><fieldset className={`${card} grid gap-3`}><legend className="px-1 text-lg font-semibold">এখন কি জরুরি লক্ষণ আছে?</legend><p>এক পাশে তীব্র তলপেট ব্যথা, বেশি রক্তপাত, অজ্ঞান লাগা বা কাঁধের আগায় ব্যথা।</p>{[{ value: true, label: "হ্যাঁ, এর একটি আছে" }, { value: false, label: "না, এখন নেই" }].map(option => <label key={String(option.value)} className="flex min-h-14 items-center gap-3 rounded-field border border-pro-control-border p-3"><input type="radio" name="urgent" checked={urgent === option.value} onChange={() => setUrgent(option.value)} className="size-5 shrink-0" /><span>{option.label}</span></label>)}</fieldset><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window && urgent !== null ? go(urgent ? "result" : "mark") : setError("পড়ার সময় ও জরুরি লক্ষণের প্রশ্ন—দুটির উত্তর দিন।")} className={primary}>পরের ধাপ</button><button type="button" onClick={() => go("context")} className={secondary}>পেছনে</button></div><UrgentHelp /></>}

        {step === "mark" && <><p>ছবির রং বা গাঢ়ত্ব দেখে অ্যাপ সিদ্ধান্ত নেয় না। আপনার কিটের নির্দেশনার সঙ্গে মিলিয়ে বেছে নিন।</p><fieldset className={`${card} grid gap-3`}><legend className="px-1 text-lg font-semibold">আপনি যা দেখেছেন</legend>{(kitType === "digital" ? digitalChoices : stripChoices).map(option => <label key={option.id} className={`grid min-h-16 gap-1 rounded-field border p-3 ${pick === option.id ? "border-pro-primary bg-pro-surface" : "border-pro-control-border"}`}><span className="flex items-start gap-3"><input type="radio" name="kit-pick" checked={pick === option.id} onChange={() => setPick(option.id)} className="mt-1 size-5 shrink-0" /><strong>{option.title}</strong></span><span className="pl-8 text-sm text-pro-muted">{option.detail}</span></label>)}</fieldset><div className="flex flex-wrap gap-2"><button type="button" onClick={() => pick ? go("result") : setError("কিটে যা দেখেছেন সেটি বেছে নিন।")} className={primary}>পরের কাজ দেখুন</button><button type="button" onClick={() => go("reading")} className={secondary}>পেছনে</button></div><UrgentHelp /></>}

        {step === "result" && result && <>{result.urgentFirst ? <><p role="status" className="rounded-field border border-pro-danger bg-pro-danger-soft p-4 font-semibold text-pro-danger">জরুরি লক্ষণের কথা বলেছেন। কিটের চিহ্নের জন্য অপেক্ষা করবেন না।</p><UrgentHelp prominent /><button type="button" onClick={() => go("reading")} className={secondary}>উত্তর বদলাব</button></> : <><div className={`${card} grid gap-4`}><p className="font-semibold text-pro-primary">আপনার বলা তথ্য · চিকিৎসকের নিশ্চিতকরণ নয়</p>{pick && <KitSketch pick={pick} />}<h2 className="text-2xl font-semibold">কিটে দেখা: {pick && pickText[pick]}</h2>{result.key === "invalid" ? <p>C রেখা না থাকলে স্ট্রিপের ফল ব্যবহার করবেন না। নতুন কিট নিয়ে তার নির্দেশনা মেনে আবার পরীক্ষা করুন।</p> : result.key === "unclear" ? <p>চিহ্ন পরিষ্কার না হলে অনুমান করবেন না। নতুন কিটের নির্দেশনা মেনে আবার দেখুন, অথবা স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।</p> : result.key === "positive" || result.key === "faint" ? <p>নির্দেশনার সময়ের মধ্যে এই চিহ্ন দেখা গেলে স্বাস্থ্যকর্মীর সঙ্গে নিশ্চিত করুন। শুধু এই পর্দা থেকে গর্ভাবস্থা বা তার অবস্থান নির্ণয় করা যায় না।</p> : <p>শুধু C রেখা বা “Not pregnant” দেখা গেছে। খুব আগে পরীক্ষা করলে এই ফল দিয়ে সম্ভাবনা পুরোপুরি বাদ দেওয়া যায় না।</p>}{result.caution === "late_read" && <p className="rounded-field border border-pro-warning bg-pro-warning-soft p-3 font-semibold">সময় পার হওয়ার পরে দেখা চিহ্ন ধরে সিদ্ধান্ত নেবেন না। নতুন কিটের নির্দেশনা মেনে আবার পরীক্ষা করুন।</p>}{result.caution === "no_window" && <p className="rounded-field border border-pro-warning bg-pro-warning-soft p-3 font-semibold">কখন পড়েছেন নিশ্চিত না হলে চিহ্নের অর্থ নিশ্চিত নয়। নতুন কিট ব্যবহার করুন।</p>}{result.caution === "too_early" && <p>নির্ধারিত দিনের আগে পরীক্ষা করেছেন; কয়েক দিন পর আবার দেখার কথা ভাবুন।</p>}{result.caution === "irregular" && <p>মাসিক অনিয়মিত হলে সময় ধরে বোঝা কঠিন। শেষ অনিরাপদ সহবাসের অন্তত ২১ দিন পর পরীক্ষার সময় সম্পর্কে NHS-এর নির্দেশনা দেখুন।</p>}</div><section className={`${card} grid gap-3`}><h2 className="text-xl font-semibold">এখন কী করতে পারেন</h2><ol className="list-decimal space-y-2 pl-5"><li>কিটের নিজস্ব নির্দেশনায় পড়ার সময় ও চিহ্ন মিলিয়ে নিন।</li><li>{result.key === "invalid" || result.key === "unclear" || result.caution === "late_read" || result.caution === "no_window" ? "নতুন কিটে আবার পরীক্ষা করুন; চিহ্ন অস্পষ্ট থাকলে স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।" : result.key === "negative" || result.key === "faint" ? "প্রয়োজনে কয়েক দিন পরে নতুন কিটে আবার পরীক্ষা করুন।" : "ফল নিয়ে স্বাস্থ্যকর্মীর সঙ্গে নিশ্চিত করুন।"}</li><li>ব্যথা, রক্তপাত বা অজ্ঞান লাগলে ফলের অপেক্ষা না করে সাহায্য নিন।</li></ol>{showPlan && <div className="rounded-field bg-pro-surface p-4"><h3 className="font-semibold">আবার পরীক্ষার সময় ভাবুন</h3><p className="text-sm">৪৮–৭২ ঘণ্টা একটি তথ্যভিত্তিক উদাহরণ; কিটের নির্দেশনা ও স্বাস্থ্যকর্মীর পরামর্শ আগে মানুন। কোনো reminder সেট হবে না।</p><label className="mt-3 grid gap-2 font-semibold">কিট ব্যবহারের তারিখ<input type="date" value={testDate} max={dhakaToday()} onChange={event => setTestDate(event.target.value)} className={field} /></label>{plan && <p role="status" className="mt-2">সম্ভাব্য সময়: {format(plan.earliest)} থেকে {format(plan.latest)}। এটি শুধু এই পাতায় দেখানো হচ্ছে।</p>}</div>}<a href={sourceTest} target="_blank" rel="noreferrer" className="w-fit font-semibold text-pro-primary underline">উৎস: NHS, Doing a pregnancy test ↗</a>{showPlan && <a href={sourceRepeat} target="_blank" rel="noreferrer" className="w-fit font-semibold text-pro-primary underline">উৎস: NHS Gloucestershire, pregnancy test ↗</a>}</section><div className="flex flex-wrap gap-2">{mode === "demo" && <button type="button" onClick={() => go("note")} className={primary}>ইচ্ছে হলে নিজের নোট রাখি</button>}<button type="button" onClick={() => go("mark")} className={secondary}>চিহ্ন বদলাই</button><button type="button" onClick={() => go("guide")} className={secondary}>কিটের গাইড</button></div>{mode === "account" && <div className={card}><p>এই পথ অ্যাকাউন্টে কিটের ফল সংরক্ষণ করে না। ইচ্ছে হলে নিজের রেকর্ডে আলাদা নোট লিখতে পারেন।</p><Link href="/app/jibonrekha" className={`${secondary} mt-3`}>জীবনরেখায় যান</Link></div>}<UrgentHelp /></>}</>}

        {step === "note" && <><p>এটি বাধ্যতামূলক নয়। শুধু আপনার বাছা চিহ্নের একটি <strong>নিজের বলা নোট</strong> ডেমো রেকর্ডে যাবে; কোনো ছবি, diagnosis বা reminder যাবে না।</p><div className={`${card} grid gap-3`}><h2 className="text-xl font-semibold">ঠিক যা রাখা হবে</h2><p>কিটে দেখা: {pick && pickText[pick]}; {window === "in" ? "নির্দেশনার সময়ের মধ্যে পড়া" : window === "late" ? "নির্দেশনার সময়ের পরে পড়া" : "পড়ার সময় নিশ্চিত নয়"}।</p><p>উৎস: নিজের বলা তথ্য · চিকিৎসক নিশ্চিত করেননি · শুধু এই ডিভাইসে।</p></div><label className="grid gap-2 font-semibold">কিট ব্যবহারের সঠিক তারিখ<input type="date" value={testDate} max={dhakaToday()} onChange={event => setTestDate(event.target.value)} className={field} /></label><label className="grid gap-2 font-semibold">কোন গর্ভকালের সঙ্গে নোট রাখবেন?<select value={episodeId} onChange={event => setEpisodeId(event.target.value)} className={field}><option value="">বেছে নিন</option>{workspace?.episodes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p className="text-sm text-pro-muted">এই ডেমো রেকর্ডে বর্তমান বা অতীত গর্ভকাল থাকতে পারে; সঠিকটি নিজে বেছে নিন। নতুন গর্ভাবস্থা এখানে তৈরি হচ্ছে না।</p><label className={`${card} flex items-start gap-3 font-semibold`}><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} className="mt-1 size-6 shrink-0" />আমি দেখেছি। এই কাল্পনিক তথ্য শুধু এই ডিভাইসের ডেমো রেকর্ডে রাখতে চাই।</label><div className="flex flex-wrap gap-2"><button type="button" onClick={saveNote} disabled={!agreed} className={primary}>নিজের নোট রাখুন</button><button type="button" onClick={() => go("result")} className={secondary}>নোট রাখব না</button></div></>}

        {step === "saved" && <><p role="status" className="rounded-field border border-pro-success bg-pro-success-soft p-5 font-semibold text-pro-success">{notice || "এই ডিভাইসে নিজের নোট সংরক্ষিত। কাউকে পাঠানো হয়নি।"}</p><Link href="/demo/jibonrekha/records" className={primary}>জীবনরেখার বিস্তারিত নথিতে দেখুন</Link><button type="button" onClick={restart} className={secondary}>আরেকটি কিটের চিহ্ন বুঝি</button></>}

        {step === "guide" && <><p>এই গাইড তথ্য বোঝার জন্য। নিজের কিটের প্যাকেটের নির্দেশনাই চিহ্ন ও পড়ার সময় ঠিক করে।</p><section className={`${card} grid gap-4`}><h2 className="text-xl font-semibold">রেখাযুক্ত স্ট্রিপ</h2><div className="grid gap-3 sm:grid-cols-2">{stripChoices.map(option => <div key={option.id} className="rounded-field bg-pro-surface p-3"><KitSketch pick={option.id} /><h3 className="mt-2 font-semibold">{option.title}</h3><p>{option.detail}</p></div>)}</div></section><section className={`${card} grid gap-3`}><h2 className="text-xl font-semibold">ডিজিটাল কিট</h2><p>পর্দায় লেখা হুবহু পড়ুন। লেখা পরিষ্কার না হলে অনুমান করবেন না।</p><div className="grid gap-3 sm:grid-cols-2"><KitSketch pick="dpos" /><KitSketch pick="dneg" /></div></section><section className={`${card} grid gap-2`}><h2 className="text-xl font-semibold">কেন বিভ্রান্তি হতে পারে?</h2><p>খুব আগে পরীক্ষা করলে বা কিটের নির্দেশনার সময় না মেনে পড়লে ফল বোঝা কঠিন হতে পারে। C রেখা না থাকলে নতুন কিট নিন।</p><a href={sourceTest} target="_blank" rel="noreferrer" className="font-semibold text-pro-primary underline">উৎস: NHS, Doing a pregnancy test ↗</a></section><button type="button" onClick={() => go(kitType ? "context" : "start")} className={primary}>কিট মিলিয়ে দেখি</button><UrgentHelp /></>}

        {step === "text" && <><p>চিত্র ছাড়াই সব চিহ্ন ও করণীয় এখানে লেখা আছে। ফল বোঝার জন্য ছবি দেখা বা রং আলাদা করতে হবে না।</p><dl className={`${card} grid gap-3`}>{[...stripChoices, ...digitalChoices.filter(item => item.id !== "unsure")].map(option => <div key={option.id} className="border-b border-pro-border pb-3"><dt className="font-semibold">{option.title}</dt><dd>{option.detail}</dd></div>)}</dl><button type="button" onClick={() => go("context")} className={primary}>প্রশ্ন শুরু করি</button><UrgentHelp /></>}

        {step === "states" && <><p>প্রতিটি সম্ভাব্য অবস্থায় কী হবে, সংক্ষেপে দেখুন। এগুলো আপনার ফলের দাবি নয়।</p>{[["সময় পেরিয়ে পড়া", "পরের চিহ্নকে নিশ্চিত ধরা হবে না; নতুন কিটে আবার দেখুন।"], ["C রেখা নেই", "স্ট্রিপের ফল ব্যবহার করবেন না; নতুন কিট নিন।"], ["চিহ্ন অস্পষ্ট", "অনুমান না করে নতুন কিট বা স্বাস্থ্যকর্মীর সাহায্য নিন।"], ["জরুরি লক্ষণ", "কিটের ফল যাই হোক, জরুরি চিকিৎসার পথ আগে দেখানো হবে।"], ["ইন্টারনেট নেই", "এই গাইড দেখা যাবে; কোনো সার্ভার sync বা reminder-এর দাবি নেই।"], ["নোট রাখা যায়নি", "বাছাই পাতায় থাকবে; আগের রেকর্ড বদলাবে না।"], ["অ্যাকাউন্টে সংরক্ষণ", "এই নতুন পথ এখন অ্যাকাউন্টে কিটের নোট সংরক্ষণ করে না।"]].map(([name, detail]) => <section key={name} className={card}><h2 className="font-semibold">{name}</h2><p className="mt-1">{detail}</p></section>)}<button type="button" onClick={() => go("context")} className={primary}>প্রশ্ন শুরু করি</button><UrgentHelp /></>}
        {(step === "context" || step === "note" || step === "saved") && <UrgentHelp />}
        <p className="border-t border-pro-border pt-4 text-sm text-pro-muted">এটি তথ্যভিত্তিক সহায়তা; কিটের ছবি পড়া, গর্ভাবস্থা নির্ণয়, চিকিৎসক নিশ্চিতকরণ বা স্বয়ংক্রিয় reminder নয়।</p>
      </div>
    </main>
  </div>;
}
