"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { demoUser, getDemoObservations, getDemoWorkspace, saveDemoObservations, type HealthObservation } from "@/features/jibonrekha/demo-health";
import { WorkflowProgress } from "./WorkflowProgress";
import { MedicalEntry } from "./MedicalEntry";
import { buildReview, canAccept, reviewOrder, type Field } from "./bujhi-review";

type View = "home" | "upload" | "reading" | "review" | "understand" | "confirm" | "done" | "states" | "alternative";
type ReviewChoice = { kind: "accept" | "correct" | "reject"; measurement?: NonNullable<Field["parsedMeasurement"]> };
const SAMPLE_URL = "/bujhi/prohor-synthetic-lab-v1.pdf";
const SAMPLE_SHA = "a5191290916d06f8da6dc6cf041a479deed5a16495e820d641816daad60868ca";
const REPORT_ID = "prohor-synthetic-lab-v1-a5191290";
const MAX_PDF = 5 * 1024 * 1024;
const sampleFields: Field[] = [
  { id: "glucose", rawLabel: "Fasting glucose", rawValue: "92", rawUnit: null, parsedMeasurement: { kind: "glucose", value: "92", unit: null }, confidence: 0.78, uncertainty: ["unknown_unit"] },
  { id: "hemoglobin", rawLabel: "Hemoglobin", rawValue: "11.2", rawUnit: "g/dL", parsedMeasurement: { kind: "hemoglobin", value: "11.2", unit: "g/dL" }, confidence: 0.96, uncertainty: [] },
];
const fields = reviewOrder(sampleFields);
const primary = "min-h-12 rounded-field bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-55";
const secondary = "min-h-12 rounded-field border border-pro-control-border bg-pro-elevated px-5 py-3 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-55";
const card = "rounded-card border border-pro-border bg-pro-elevated p-5";
const input = "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const bn = (number: number) => new Intl.NumberFormat("bn-BD").format(number);

function ReportPaper({ active, onFocus }: { active?: string; onFocus?: (id: string) => void }) {
  const rows = [
    { id: "hemoglobin", label: "Hemoglobin", value: "11.2 g/dL" },
    { id: "glucose", label: "Fasting glucose", value: "92" },
    { id: "date", label: "Report date", value: "1?-11-2026" },
    { id: "interval", label: "Printed interval", value: "11.0–14.0 g/dL" },
  ];
  return <div className="rounded-field border-2 border-pro-control-border bg-pro-elevated p-4 text-pro-text">
    <p className="font-semibold" lang="en">PROHOR DEMO LAB · SYNTHETIC</p><p className="text-sm" lang="en">Fictional report. Not a real patient.</p>
    <div className="mt-4 border-t border-pro-border pt-2">{rows.map(row => <div key={row.id} className={`flex flex-wrap justify-between gap-2 border-b border-pro-border px-1 py-3 ${active === row.id ? "rounded-field border-2 border-dashed border-pro-warning bg-pro-warning-soft" : ""}`}>
      {onFocus && (row.id === "hemoglobin" || row.id === "glucose") ? <button type="button" onClick={() => onFocus(row.id)} className="font-semibold text-pro-primary underline">{row.label}</button> : <span className="font-semibold">{row.label}</span>}
      <strong>{row.value}</strong>
    </div>)}</div><p className="mt-3 text-right text-sm text-pro-muted">page 1 / 1</p>
  </div>;
}

function StepBar({ view }: { view: View }) {
  const current = view === "upload" || view === "reading" ? "add" : view === "review" ? "check" : view === "understand" ? "learn" : view === "done" ? "done" : "save";
  return <WorkflowProgress current={current} language="bn" />;
}

export function BujhiExperience() {
  const [view, setView] = useState<View>("home");
  const [file, setFile] = useState<File | null>(null), [synthetic, setSynthetic] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState(""), [online, setOnline] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, ReviewChoice>>({});
  const [editing, setEditing] = useState(""), [editValue, setEditValue] = useState(""), [editUnit, setEditUnit] = useState(""), [unitConfirmed, setUnitConfirmed] = useState(false);
  const [date, setDate] = useState(""), [target, setTarget] = useState<"mother" | "baby" | "">("");
  const [episodeId, setEpisodeId] = useState(""), [babyId, setBabyId] = useState("");
  const [textOnly, setTextOnly] = useState(false), [activeLine, setActiveLine] = useState("glucose"), [english, setEnglish] = useState(false);
  const [confirmed, setConfirmed] = useState(false), [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  const [existingSaved, setExistingSaved] = useState(false);
  const [workspace, setWorkspace] = useState<ReturnType<typeof getDemoWorkspace> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null), fileInput = useRef<HTMLInputElement>(null), dateInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    const initialLoad = window.setTimeout(() => {
      update();
      try { setWorkspace(getDemoWorkspace()); setExistingSaved(getDemoObservations().some(item => item.sourceReportId === REPORT_ID)); }
      catch { setError("ডেমো নথি পড়া যায়নি। পুরোনো তথ্য বদলানো হয়নি।"); }
    }, 0);
    return () => { window.clearTimeout(initialLoad); window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  function go(next: View) { setError(""); setMessage(""); setView(next); requestAnimationFrame(() => heading.current?.focus()); }
  function choose(fileToCheck: File | null) { setFile(fileToCheck); setSynthetic(false); setError(""); }
  async function chooseSample() {
    try { const response = await fetch(SAMPLE_URL); if (!response.ok) throw new Error(); choose(new File([await response.blob()], "prohor-synthetic-lab-v1.pdf", { type: "application/pdf" })); }
    catch { setError("নমুনা PDF খোলা যায়নি। পাতা আবার খুলে চেষ্টা করুন।"); }
  }
  async function read() {
    if (!file) { setError("আগে নমুনা PDF বাছুন।"); return; }
    if (!synthetic) { setError("কাল্পনিক নমুনা রিপোর্ট বলে নিশ্চিত করুন। আসল রোগীর রিপোর্ট দেবেন না।"); return; }
    if (file.size === 0 || file.size > MAX_PDF) { setError("ফাইলটি খালি অথবা ৫ MB-এর বেশি। ছোট নমুনা PDF দিন।"); return; }
    if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) { setError("শুধু PDF ফাইল বাছুন।"); return; }
    go("reading");
    try {
      const bytes = await file.arrayBuffer();
      const signature = new TextDecoder().decode(bytes.slice(0, 5));
      if (signature !== "%PDF-") { setError("ফাইলটির ভেতরের ধরন PDF নয়। কিছু সংরক্ষণ হয়নি।"); return; }
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
      if (hash !== SAMPLE_SHA) { setError("এই ডেমোতে শুধু দেওয়া কাল্পনিক নমুনা PDF পড়া যায়। অন্য ফাইলের কোনো লেখা নেওয়া হয়নি।"); return; }
      setDecisions({}); setDate(""); setTarget(""); setEpisodeId(""); setBabyId(""); setConfirmed(false); setSaved(false); go("review");
    } catch { setError("ফাইল পড়া যায়নি। কিছু সংরক্ষণ হয়নি। আবার চেষ্টা করুন বা নিজে টাইপ করুন।"); }
  }
  function decide(id: string, choice: ReviewChoice) { setDecisions(current => ({ ...current, [id]: choice })); setConfirmed(false); setError(""); setActiveLine(id); setEditing(""); }
  function startCorrection(field: Field) { setEditing(field.id); setEditValue(field.parsedMeasurement?.value ?? ""); setEditUnit(field.rawUnit ?? ""); setUnitConfirmed(false); setActiveLine(field.id); setError(""); }
  function acceptCorrection(field: Field) {
    if (!/^-?\d{1,9}(\.\d{1,6})?$/.test(editValue.trim()) || !editUnit.trim() || (field.rawUnit === null && !unitConfirmed)) { setError("সঠিক সংখ্যা ও একক লিখুন। রিপোর্টে একক না থাকলে ল্যাব বা চিকিৎসকের কাছ থেকে নিশ্চিত না করে রাখবেন না।"); return; }
    decide(field.id, { kind: "correct", measurement: { kind: field.parsedMeasurement?.kind ?? "other", value: editValue.trim(), unit: editUnit.trim() } });
  }
  const reviewed = Object.keys(decisions).length;
  const kept = fields.filter(field => decisions[field.id]?.kind !== "reject" && decisions[field.id] !== undefined);
  const rejected = fields.filter(field => decisions[field.id]?.kind === "reject");
  function reviewNext() {
    if (reviewed !== fields.length) { setError("প্রতিটি লাইনে ঠিক আছে, ঠিক করি অথবা বাদ—একটি সিদ্ধান্ত দিন।"); return; }
    if (!kept.length) { setSaved(false); go("done"); setMessage("সব লাইন বাদ দিয়েছেন। কিছু সংরক্ষণ হবে না।"); return; }
    const destination = target === "baby" ? { subject: "baby" as const, babyId } : { subject: "mother" as const, pregnancyId: episodeId || null };
    const built = buildReview({ fields, decisions, observedAt: date, destination, expectedExtractionRevision: 0 });
    if (!built.ok && built.reason === "need_date") { setError("রাখা তথ্যের সঠিক তারিখ লিখুন। অস্পষ্ট তারিখ অনুমান করবেন না।"); dateInput.current?.focus(); return; }
    if (!built.ok) { setError("সিদ্ধান্ত ও সংশোধিত মানগুলো আবার দেখুন।"); return; }
    if (!target || !episodeId || (target === "baby" && !babyId)) { setError("কার রেকর্ডে যাবে এবং কোন গর্ভকালের সঙ্গে যুক্ত হবে বেছে নিন।"); return; }
    go("understand");
  }
  function speak(text: string) {
    if (!("speechSynthesis" in window)) { setMessage("এই ব্রাউজারে পড়ে শোনানো যায় না। লেখা এখানে আছে।"); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = english ? "en-US" : "bn-BD"; window.speechSynthesis.speak(utterance);
  }
  function save() {
    if (saving || saved || !confirmed || !workspace || !episodeId || !target || (target === "baby" && !babyId)) { setError("আগে গন্তব্য ও তথ্য দেখে সংরক্ষণের সম্মতি দিন।"); return; }
    setSaving(true); setError("");
    try {
      const reviewedAt = new Date().toISOString();
      const observations: HealthObservation[] = kept.map(field => {
        const measurement = decisions[field.id].kind === "correct" ? decisions[field.id].measurement! : field.parsedMeasurement!;
        return { id: crypto.randomUUID(), pregnancyId: episodeId, recordType: target, recordId: target === "mother" ? workspace.profile.id : babyId,
          label: field.rawLabel, value: measurement.value, unit: measurement.unit ?? "", observedAt: date,
          source: "document_extracted", sourceReportId: REPORT_ID, sourceFieldId: field.id, sourceFileId: SAMPLE_SHA,
          rawValue: field.rawValue, originalUnit: field.rawUnit ?? "", referenceRange: field.id === "hemoglobin" ? "11.0–14.0 g/dL" : undefined,
          documentType: "laboratory", category: "laboratory_tests", reviewedAt, reviewedBy: demoUser.id, reviewStatus: "verified" };
      });
      const before = getDemoObservations().length;
      const after = saveDemoObservations(observations).length;
      setSaved(true); setExistingSaved(true); go("done"); setMessage(after === before ? "এই নমুনার তথ্য আগে থেকেই এই ডিভাইসে আছে। নতুন কপি তৈরি হয়নি।" : "যাচাই করা তথ্য এই ডিভাইসে সংরক্ষিত। জীবনরেখার বিস্তারিত ডেমোতে দেখুন; সার্ভারে পাঠানো হয়নি।");
    } catch { setError("সংরক্ষণ নিশ্চিত হয়নি। আপনার যাচাই করা তথ্য এই পাতায় আছে; আবার চেষ্টা করুন।"); }
    finally { setSaving(false); }
  }

  if (view === "alternative") return <div className="bg-pro-bg text-pro-text"><div className="mx-auto max-w-5xl px-4 pt-4"><button type="button" onClick={() => go("home")} className="min-h-11 font-semibold text-pro-primary underline">← নতুন বুঝি ডিজাইনে ফিরুন</button></div><MedicalEntry /></div>;
  return <div lang="bn" className="min-h-dvh bg-pro-bg text-pro-text">
    <header className="border-b border-pro-border px-4 py-3"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 font-semibold"><Link href="/" className="text-lg text-pro-primary">প্রহর</Link><span className="border-l border-pro-border pl-2">বুঝি</span></div><div className="flex items-center gap-2"><AccessPreferencesControl compact /><Link href="/faq" className="inline-flex min-h-11 items-center rounded-field border border-pro-danger px-3 text-sm font-semibold text-pro-danger">জরুরি সহায়তা</Link></div></div></header>
    <p className="border-b border-pro-info bg-pro-info-soft px-4 py-2 text-center text-sm font-semibold text-pro-info">♧ ডেমো তথ্য — এটি কাল্পনিক। কোনো প্রকৃত চিকিৎসক এটি দেখবেন না।</p>
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 sm:px-6 lg:pb-10">
      {view !== "home" && <button type="button" onClick={() => go("home")} className="w-fit min-h-11 font-semibold text-pro-primary underline">← বুঝি-তে ফিরুন</button>}
      {view !== "home" && view !== "states" && <StepBar view={view} />}
      {!online && <p role="status" className="rounded-field border border-pro-warning bg-pro-warning-soft p-4 text-pro-warning">ইন্টারনেট নেই। এই নমুনা ডিভাইসেই যাচাই হয়; স্থানীয় সংরক্ষণ চলতে পারে। অ্যাকাউন্টে কিছু পাঠানো হয়নি।</p>}
      {error && <p role="alert" className="rounded-field border border-pro-danger bg-pro-danger-soft p-4 text-pro-danger">{error}</p>}
      {message && <p role="status" className="rounded-field border border-pro-info bg-pro-info-soft p-4 text-pro-info">{message}</p>}

      {view === "home" && <div className="mx-auto grid w-full max-w-2xl gap-6">
        <div><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">রিপোর্ট বুঝি</h1><p className="mt-2 max-w-[60ch]">রিপোর্টের লেখা আপনার চোখের সামনে রেখে, আপনি মিলিয়ে, তবেই সংরক্ষণ।</p></div>
        <section className="grid gap-3 rounded-card border border-pro-border bg-pro-surface p-5"><p className="font-semibold text-pro-primary">নতুন · ছবি ছাড়াই</p><h2 className="text-xl font-semibold">ঘরে করা কিটের ফল বুঝি</h2><p>কিটে কী দেখেছেন, তিনটি ছোট ধাপে বলুন। ফল রেকর্ডে নিজে থেকে যাবে না।</p><Link href="/demo/bujhi/kit" className={`${primary} inline-flex items-center justify-center`}>কিটের ফল বুঝি →</Link></section>
        <div className="rounded-field border border-pro-info bg-pro-info-soft p-4 font-semibold text-pro-info">এখন একটি কাল্পনিক নমুনা রিপোর্টের ধরন (prohor-synthetic-lab-v1) পড়া যায়। আসল রিপোর্ট এখানে দেবেন না।</div>
        <section className="grid gap-4 rounded-card bg-pro-surface p-5"><h2 className="text-xl font-semibold">চারটি ধাপ, আপনার হাতে</h2><StepBar view="upload" /><ol className="list-decimal space-y-1 pl-5"><li>রিপোর্ট দিন</li><li>প্রতিটি লাইন আপনি মিলিয়ে নিন</li><li>সহজ ভাষায় বুঝে নিন</li><li>নিশ্চিত করে সংরক্ষণ করুন</li></ol></section>
        <button type="button" onClick={() => go("upload")} className={primary}>⇧ রিপোর্ট দিন</button>
        <section className="grid gap-2"><h2 className="text-xl font-semibold">অন্যভাবেও যোগ করা যায়</h2><button type="button" onClick={() => go("alternative")} className={secondary}>নিজে টাইপ করে</button><button type="button" onClick={() => go("alternative")} className={secondary}>বলে লিখি</button><p className="text-pro-muted">রিপোর্ট না পড়া গেলেও আপনি হাতে লিখে সংরক্ষণ করতে পারবেন।</p></section>
        <section className="grid gap-3"><h2 className="text-xl font-semibold">আমার রিপোর্ট</h2>{existingSaved ? <Link href="/demo/jibonrekha/records" className={`${card} font-semibold text-pro-primary`}>এই ডিভাইসে সংরক্ষিত নমুনা রিপোর্টের তথ্য →</Link> : <p className={card}>এই ডিভাইসে এই নমুনা রিপোর্টের তথ্য এখনো সংরক্ষিত নেই।</p>}</section>
        <section className={card}><h2 className="text-lg font-semibold">আমরা কী করি না</h2><ul className="mt-2 list-disc space-y-1 pl-5"><li>কোনো মানকে “ভালো” বা “খারাপ” বলি না</li><li>যাচাই ছাড়া কিছু সংরক্ষণ করি না</li><li>অনুমান করে একক বা তারিখ বসাই না</li></ul></section>
        <button type="button" onClick={() => go("states")} className="w-fit min-h-11 font-semibold text-pro-primary underline">সব অবস্থার ব্যাখ্যা দেখুন</button>
      </div>}

      {view === "upload" && <div className="mx-auto grid w-full max-w-xl gap-5"><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">রিপোর্ট দিন</h1><section className="grid gap-4 rounded-card bg-pro-surface p-5"><h2 className="text-xl font-semibold">যে ধরন পড়া যায়</h2><ReportPaper /><p>কাল্পনিক নমুনা ল্যাব রিপোর্ট, PDF, সর্বোচ্চ ৫ MB, এক পাতা।</p></section>
        <label className={`${card} flex items-start gap-3 font-semibold`}><input type="checkbox" checked={synthetic} onChange={event => setSynthetic(event.target.checked)} className="mt-1 size-6 shrink-0" />এটি একটি কাল্পনিক (synthetic) নমুনা রিপোর্ট, আসল রোগীর নয়।</label>
        <label className="grid gap-2 font-semibold">ফাইল বাছুন<input ref={fileInput} type="file" accept=".pdf,application/pdf" onChange={event => choose(event.target.files?.[0] ?? null)} className={input} /></label>
        <button type="button" onClick={() => void chooseSample()} className={secondary}>নমুনা PDF বাছুন (demo)</button>
        {file && <p role="status">বাছা ফাইল: {file.name} · {bn(file.size)} bytes</p>}
        <button type="button" onClick={() => void read()} className={primary}>পড়া শুরু করুন</button><p className="text-sm text-pro-muted">ফাইল এই ব্রাউজারেই মিলিয়ে দেখা হয়; সার্ভারে পাঠানো হয় না। আসল রিপোর্ট এই ডেমোতে দেবেন না।</p>
      </div>}

      {view === "reading" && <div className="mx-auto grid w-full max-w-xl gap-4"><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">পড়ার অবস্থা</h1><p role="status" className={card}>নমুনা PDF-এর ধরন মিলিয়ে দেখা হচ্ছে… কোনো তথ্য এখনও সংরক্ষিত হয়নি।</p><button type="button" onClick={() => go("upload")} className={secondary}>বাতিল করুন</button>{error && <button type="button" onClick={() => go("upload")} className={secondary}>অন্য ফাইল বাছুন</button>}<button type="button" onClick={() => go("alternative")} className="w-fit min-h-11 font-semibold text-pro-primary underline">নিজে টাইপ করে যোগ করুন</button></div>}

      {view === "review" && <div className="grid min-w-0 gap-6"><div><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">প্রতিটি লাইন আপনি মিলিয়ে নিন</h1><p className="mt-2 text-pro-muted">যে লাইনগুলো কম পরিষ্কার, আগে সেগুলো। কিছুই এখনও সংরক্ষণ হয়নি।</p></div><div className="grid gap-5 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]">
        <section className="grid min-w-0 content-start gap-3 rounded-card bg-pro-surface p-4 lg:sticky lg:top-4 lg:self-start"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">আপনার রিপোর্ট</h2><button type="button" onClick={() => setTextOnly(value => !value)} className="min-h-11 font-semibold text-pro-primary underline">{textOnly ? "ছবি-সহ দৃশ্য" : "রিপোর্ট লেখায়"}</button></div>{textOnly ? <dl className="grid gap-2">{[["Hemoglobin", "11.2 g/dL"], ["Fasting glucose", "92 · একক নেই"], ["Report date", "1?-11-2026 · অস্পষ্ট"], ["Printed interval", "11.0–14.0 g/dL · ল্যাবের ছাপা"]].map(([label, value], index) => <div key={label} className="border-b border-pro-border py-2"><dt className="font-semibold">লাইন {bn(index + 1)} · {label}</dt><dd>{value}</dd></div>)}</dl> : <ReportPaper active={activeLine} onFocus={id => { setActiveLine(id); document.getElementById(`bujhi-${id}`)?.focus(); }} />}<p className="text-sm text-pro-muted">কাল্পনিক নমুনা। ঘেরা অংশে আপনি যে লাইন মিলিয়ে দেখছেন সেটি দেখানো হয়।</p></section>
        <div className="grid min-w-0 content-start gap-4"><p role="status" className="rounded-field bg-pro-surface p-4 font-semibold">দেখা হয়েছে {bn(reviewed)} / {bn(fields.length)} · কম পরিষ্কার লাইন আগে</p>{fields.map(field => { const choice = decisions[field.id]; return <article key={field.id} id={`bujhi-${field.id}`} tabIndex={-1} onFocus={() => setActiveLine(field.id)} className={`${card} grid gap-3`}><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="text-xl font-semibold">{field.rawLabel}</h2><span className="rounded-pill border border-pro-warning px-3 py-1 text-sm font-semibold text-pro-warning">{choice ? choice.kind === "reject" ? "বাদ দেওয়া" : "আপনি মিলিয়েছেন" : field.rawUnit ? "যাচাই বাকি" : "আগে মিলিয়ে দেখুন"}</span></div>{!field.rawUnit && <p className="font-semibold text-pro-warning">একক নেই বা চেনা যায়নি</p>}<div className="grid gap-3 sm:grid-cols-2"><div className="rounded-field bg-pro-surface p-3"><h3 className="text-sm font-semibold">রিপোর্টে যা লেখা</h3><p className="mt-1">{field.rawLabel} {field.rawValue} {field.rawUnit}</p><p className="text-sm text-pro-muted">পাতা ১ · {field.id === "glucose" ? "২য়" : "১ম"} লাইন</p></div><div className="rounded-field bg-pro-surface p-3"><h3 className="text-sm font-semibold">আমরা যা পড়লাম</h3><p className="mt-1">{field.parsedMeasurement?.value} · {field.rawUnit ?? "একক অজানা"}</p></div></div><div className="grid grid-cols-3 gap-2"><button type="button" disabled={!canAccept(field)} title={!canAccept(field) ? "একক নেই বা লেখা অস্পষ্ট; ঠিক করুন বা বাদ দিন" : undefined} onClick={() => decide(field.id, { kind: "accept" })} className={choice?.kind === "accept" ? primary : secondary}>ঠিক আছে</button><button type="button" onClick={() => startCorrection(field)} className={choice?.kind === "correct" ? primary : secondary}>ঠিক করি</button><button type="button" onClick={() => decide(field.id, { kind: "reject" })} className={choice?.kind === "reject" ? primary : secondary}>বাদ</button></div>{!canAccept(field) && <p className="text-sm text-pro-muted">“ঠিক আছে” বন্ধ: রিপোর্টে একক নেই। নিশ্চিত না হলে বাদ দিন।</p>}{editing === field.id && <div className="grid gap-3 border-t border-pro-border pt-3"><label className="grid gap-1 font-semibold">সংশোধিত সংখ্যা<input value={editValue} onChange={event => setEditValue(event.target.value)} inputMode="decimal" className={input} /></label><label className="grid gap-1 font-semibold">রিপোর্টে নিশ্চিত করা একক<input value={editUnit} onChange={event => setEditUnit(event.target.value)} className={input} /></label>{!field.rawUnit && <label className="flex items-start gap-2"><input type="checkbox" checked={unitConfirmed} onChange={event => setUnitConfirmed(event.target.checked)} className="mt-1 size-5" />আমি ল্যাব বা চিকিৎসকের কাছ থেকে একক নিশ্চিত করেছি।</label>}<button type="button" onClick={() => acceptCorrection(field)} className={primary}>সংশোধন রাখুন</button></div>}</article>; })}
          <section className={`${card} grid gap-3`}><h2 className="text-lg font-semibold">রিপোর্টের তারিখ ও রেকর্ড</h2><p>ছাপা তারিখ “1?-11-2026” অস্পষ্ট। নিশ্চিত না হলে তথ্য বাদ দিন।</p><label className="grid gap-1 font-semibold">যাচাই করা তারিখ<input ref={dateInput} type="date" value={date} onChange={event => setDate(event.target.value)} className={input} /></label><fieldset className="grid gap-2"><legend className="font-semibold">কার রেকর্ডে যাবে?</legend><label className="flex min-h-11 items-center gap-2"><input type="radio" name="bujhi-target" checked={target === "mother"} onChange={() => { setTarget("mother"); setBabyId(""); }} />● মা</label><label className="flex min-h-11 items-center gap-2"><input type="radio" name="bujhi-target" checked={target === "baby"} onChange={() => setTarget("baby")} />□ শিশু</label></fieldset><label className="grid gap-1 font-semibold">কোন গর্ভকাল<select value={episodeId} onChange={event => { setEpisodeId(event.target.value); setBabyId(""); }} className={input}><option value="">বেছে নিন</option>{workspace?.episodes.map(episode => <option key={episode.id} value={episode.id}>{episode.label}</option>)}</select></label>{target === "baby" && <label className="grid gap-1 font-semibold">কোন শিশু<select value={babyId} onChange={event => setBabyId(event.target.value)} className={input}><option value="">বেছে নিন</option>{workspace?.babies.filter(baby => baby.pregnancyId === episodeId).map(baby => <option key={baby.id} value={baby.id}>{baby.label}</option>)}</select></label>}</section>
          <button type="button" onClick={reviewNext} className={primary}>বুঝতে যান</button></div>
      </div></div>}

      {view === "understand" && <div className="mx-auto grid w-full max-w-2xl gap-5"><div><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">সহজ ভাষায় বুঝি</h1><p className="mt-2">শুধু আপনার মিলিয়ে নেওয়া তথ্যের জন্য।</p></div><div className="rounded-field border border-pro-info bg-pro-info-soft p-4 text-pro-info">এখানে “স্বাভাবিক”, “কম”, “বেশি” বা “ঝুঁকি” বলা হয় না। সিদ্ধান্ত চিকিৎসকের সঙ্গে।</div>{kept.map(field => { const measurement = decisions[field.id].kind === "correct" ? decisions[field.id].measurement! : field.parsedMeasurement!; const hemoglobin = field.id === "hemoglobin"; const explanation = hemoglobin ? "হিমোগ্লোবিন লোহিত রক্তকণিকার একটি উপাদান, যা শরীরে অক্সিজেন বহন করে।" : "গ্লুকোজ রক্তে থাকা এক ধরনের চিনি, যা শরীরের শক্তির উৎস।"; return <article key={field.id} className={`${card} grid gap-3`}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold">{field.rawLabel}</h2><span className="rounded-pill border border-pro-control-border px-3 py-1 text-sm">আপনি যাচাই করেছেন</span></div><p className="text-3xl font-semibold">{measurement.value} <span className="text-base font-normal">{measurement.unit}</span></p><h3 className="font-semibold">এটা কী</h3><p>{english ? hemoglobin ? "Hemoglobin is a protein in red blood cells that carries oxygen through the body." : "Glucose is a sugar in blood and a source of energy for the body." : explanation}</p>{hemoglobin && <div className="rounded-field bg-pro-surface p-4"><h3 className="font-semibold">আপনার রিপোর্টে ছাপা আছে</h3><p className="mt-2 font-semibold">11.0–14.0 g/dL</p><p className="text-sm">এটি ল্যাবের ছাপা সীমা। এর মানে কী, তা এই অ্যাপ বলে না।</p></div>}<h3 className="font-semibold">চিকিৎসককে জিজ্ঞেস করতে পারেন</h3><ul className="list-disc pl-5"><li>আমার এই মান ভিজিটের জন্য কী বোঝায়?</li><li>আবার কবে পরীক্ষা করব?</li></ul><div className="flex flex-wrap gap-2"><button type="button" onClick={() => speak(english ? "Ask your clinician what this result means for your visit." : explanation)} className={secondary}>শুনুন</button><button type="button" onClick={() => setEnglish(value => !value)} className={secondary}>{english ? "বাংলা" : "English"}</button><Link href="/ask" className={`${secondary} inline-flex items-center`}>বার্তাকে জিজ্ঞেস করুন</Link></div><a href={hemoglobin ? "https://medlineplus.gov/lab-tests/hemoglobin-test/" : "https://medlineplus.gov/lab-tests/blood-glucose-test/"} target="_blank" rel="noreferrer" className="w-fit font-semibold text-pro-primary underline">উৎস: MedlinePlus Medical Test ↗</a></article>; })}{rejected.map(field => <p key={field.id} className={card}>{field.rawLabel} (বাদ দিয়েছেন) — সংরক্ষণে যাবে না।</p>)}<button type="button" onClick={() => go("confirm")} className={primary}>সংরক্ষণে যান</button></div>}

      {view === "confirm" && <div className="mx-auto grid w-full max-w-2xl gap-5"><div><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">নিশ্চিত করে সংরক্ষণ</h1><p className="mt-2">নিচেরটুকুই যাবে। এর বেশি কিছু নয়।</p></div><section className={`${card} grid gap-4`}><h2 className="text-xl font-semibold">জীবনরেখার বিস্তারিত ডেমোতে যোগ হবে · {bn(kept.length)}টি তথ্য</h2>{kept.map(field => { const measurement = decisions[field.id].kind === "correct" ? decisions[field.id].measurement! : field.parsedMeasurement!; return <div key={field.id} className="rounded-field bg-pro-surface p-4"><p className="font-semibold">{target === "mother" ? "● মা" : "□ শিশু"} · {field.rawLabel}</p><p className="mt-2 text-2xl font-semibold">{measurement.value} {measurement.unit}</p><p>তারিখ: {date}</p><p className="text-sm">রিপোর্ট থেকে নেওয়া · আপনি মিলিয়েছেন · চিকিৎসক নিশ্চিত করেননি</p></div>; })}<p>বাদ দেওয়া: {rejected.length ? rejected.map(field => field.rawLabel).join(", ") : "কিছু নেই"}</p><p>মূল ফাইল: এই সংরক্ষণে ফাইল যাবে না, শুধু যাচাই করা মান।</p></section><label className={`${card} flex items-start gap-3 font-semibold`}><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 size-6 shrink-0" />আমি দেখেছি। এই তথ্য এই ডিভাইসের ডেমো রেকর্ডে সংরক্ষণ হবে।</label><button type="button" disabled={!confirmed || saving} onClick={save} className={primary}>{saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}</button><button type="button" onClick={() => go("review")} className={secondary}>আবার যাচাই করি</button></div>}

      {view === "done" && <div className="mx-auto grid w-full max-w-2xl gap-5"><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">সংরক্ষণের ফল</h1><p role="status" className={`rounded-field border p-5 ${saved ? "border-pro-success bg-pro-success-soft text-pro-success" : "border-pro-info bg-pro-info-soft text-pro-info"}`}>{saved ? message || "এই ডিভাইসে সংরক্ষিত। সার্ভারে পাঠানো হয়নি।" : "সব লাইন বাদ দিয়েছেন। কিছু সংরক্ষণ হয়নি।"}</p>{saved && <Link href="/demo/jibonrekha/records" className={`${primary} inline-flex items-center justify-center`}>জীবনরেখায় দেখুন</Link>}<button type="button" onClick={() => go("home")} className={secondary}>বুঝি-তে ফিরুন</button></div>}

      {view === "states" && <div className="mx-auto grid w-full max-w-2xl gap-4"><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold">সব অবস্থার ব্যাখ্যা</h1><p>এগুলো এই ডেমোর সম্ভাব্য অবস্থা ও কাজের পথের উদাহরণ; আপনার ফাইলে সব ঘটেছে এমন দাবি নয়।</p>{[["প্রথমবার, কোনো রিপোর্ট নেই", "নমুনা PDF দিয়ে শুরু করুন, অথবা নিজে লিখুন।"], ["ভুল ফাইলের ধরন বা ফাইল অনেক বড়", "শুধু ৫ MB পর্যন্ত PDF; অন্য ফাইল বাছুন।"], ["আংশিক বা কিছুই পড়া যায়নি", "এই ডেমো এক নমুনার সঙ্গে ফাইল মিলিয়ে দেখে। নিজে টাইপ করার পথ আছে।"], ["অফলাইন", "নমুনা আগে থেকে ডিভাইসে থাকলে স্থানীয় যাচাই ও সংরক্ষণ চলতে পারে।"], ["সব লাইন বাদ", "কিছু সংরক্ষণ হবে না।"], ["অ্যাকাউন্ট সেশন বা সংস্করণ বদলেছে", "অ্যাকাউন্টে সংরক্ষণ আলাদা সীমিত পথ; এই স্থানীয় ডেমোতে সার্ভার নিশ্চিতকরণ দেখানো হয় না।"]].map(([title, detail]) => <section key={title} className={card}><h2 className="font-semibold">{title}</h2><p className="mt-2">{detail}</p></section>)}<button type="button" onClick={() => go("upload")} className={primary}>রিপোর্ট দিন</button></div>}
      <p className="mx-auto w-full max-w-3xl border-t border-pro-border pt-4 text-sm text-pro-muted">এটি শিক্ষামূলক ডেমো তথ্য, চিকিৎসকের পরামর্শের বিকল্প নয়। রোগ নির্ণয় বা চিকিৎসার সিদ্ধান্ত এখান থেকে নেবেন না।</p>
    </main>
  </div>;
}
