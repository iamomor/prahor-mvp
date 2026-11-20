"use client";

import { useId, useState, type FormEvent } from "react";
import { demoMother, saveDemoObservation, type HealthObservation } from "./demo-health";
import { dhakaToday, type BabyRecord } from "./records-model";
import { button, card, control } from "./records-ui";

const templates = [
  { id: "weight", label: "ওজন · Weight", unit: "kg", category: "vital_signs" },
  { id: "pressure", label: "রক্তচাপ · Blood pressure", unit: "mmHg", category: "vital_signs" },
  { id: "temperature", label: "তাপমাত্রা · Temperature", unit: "°C", category: "vital_signs" },
  { id: "note", label: "নিজের নোট · Note", unit: "", category: "general_notes" },
] as const;

export function QuickAdd({ pregnancyId, baby, onSaved }: { pregnancyId: string; baby?: BabyRecord; onSaved: (records: HealthObservation[]) => void }) {
  const id = useId();
  const [subject, setSubject] = useState<"mother" | "baby">("mother");
  const [kind, setKind] = useState<(typeof templates)[number]["id"]>("weight");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(dhakaToday);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const choice = templates.find(item => item.id === kind)!;

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > dhakaToday() || (subject === "baby" && !baby)) {
      setError("তথ্য, তারিখ ও কার নথিতে যাবে তা যাচাই করুন।");
      return;
    }
    setError(""); setMessage(""); setReview(true);
  }
  function save() {
    if (subject === "baby" && !baby) { setError("আগে শিশুর নথি বেছে নিন।"); return; }
    try {
      const records = saveDemoObservation({
        id: crypto.randomUUID(), pregnancyId, recordType: subject, recordId: subject === "mother" ? demoMother.id : baby!.id,
        category: choice.category, label: choice.label, value: value.trim(), rawValue: value.trim(), unit: choice.unit,
        observedAt: date, source: "self_reported",
      });
      onSaved(records); setValue(""); setReview(false); setError("");
      setMessage("এই ডিভাইসে সংরক্ষিত। কোথাও পাঠানো হয়নি। তথ্যটি আপনার দেওয়া, চিকিৎসক যাচাই করেননি।");
    } catch {
      setError("সংরক্ষণ হয়নি। আপনার লেখা এখানেই আছে; জায়গা ও ব্রাউজার স্টোরেজ দেখে আবার চেষ্টা করুন।");
    }
  }

  return <section className={`${card} grid gap-4`} aria-labelledby={`${id}-title`}>
    <div><p className="font-semibold text-pro-primary">দ্রুত যোগ করুন · Quick add</p><h2 id={`${id}-title`} className="text-2xl font-semibold">একটি তথ্য লিখুন</h2><p className="text-pro-muted">শুধু কাল্পনিক ডেমো তথ্য দিন। সংরক্ষণের আগে নথি ও মান যাচাই করুন।</p></div>
    <form onSubmit={prepare} className="grid gap-4" hidden={review} aria-label="Quick add observation">
      <fieldset className="grid gap-2"><legend className="font-semibold">কার নথিতে?</legend><div className="flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="radio" name={`${id}-subject`} checked={subject === "mother"} onChange={() => setSubject("mother")} /> মা</label><label className="flex items-center gap-2"><input type="radio" name={`${id}-subject`} checked={subject === "baby"} onChange={() => setSubject("baby")} disabled={!baby} /> শিশু{!baby ? " (নথি নেই)" : ""}</label></div></fieldset>
      <label className="grid gap-2 font-semibold">কী যোগ করবেন?<select value={kind} onChange={event => setKind(event.target.value as typeof kind)} className={control}>{templates.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="grid gap-2 font-semibold">{choice.label} · মান বা লেখা<input value={value} onChange={event => setValue(event.target.value)} required maxLength={500} className={control} /></label>
      <label className="grid gap-2 font-semibold">তারিখ<input type="date" value={date} onChange={event => setDate(event.target.value)} max={dhakaToday()} required className={control} /></label>
      <button type="submit" className={`${button} w-fit bg-pro-primary text-pro-on-primary`}>তথ্য যাচাই করুন</button>
    </form>
    {review && <div className="grid gap-3 rounded-field border border-pro-border bg-pro-surface p-4" aria-label="Review observation before saving"><h3 className="text-xl font-semibold">সংরক্ষণের আগে দেখুন</h3><p>{subject === "mother" ? "মায়ের নথি" : `শিশুর নথি: ${baby?.label}`} · {choice.label}: {value.trim()} {choice.unit} · {date}</p><p>উৎস: আপনার দেওয়া তথ্য। চিকিৎসক যাচাই করেননি।</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setReview(false)} className={button}>সংশোধন করুন</button><button type="button" onClick={save} className={`${button} bg-pro-primary text-pro-on-primary`}>এই ডিভাইসে সংরক্ষণ</button></div></div>}
    {error && <p role="alert" className="text-pro-danger">{error}</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
