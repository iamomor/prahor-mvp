"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { ArrowRight, CircleCheckBig, Save } from "lucide-react";

import { useLanguage } from "@/i18n/use-language";
import { buildReportOverview } from "./report-overview";

type Pregnancy = { id: string; label: string };
const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";
const control = `min-h-12 w-full rounded-field border border-pro-control-border bg-pro-bg px-3 text-pro-text ${focus}`;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/**
 * Saves a plain-language report summary to the mother's Jibonrekha as a visit note.
 * Saved: report kind, the topics found (fixed glossary titles), the date and her own note.
 * Never saved: the photo, the raw OCR text (it can contain other people's names), or any lab value.
 */
export function SaveReportSummary({ rawText, pregnancies, onSaved }: { rawText: string; pregnancies: Pregnancy[]; onSaved?: () => void }) {
  const { t } = useLanguage();
  const id = useId();
  const overview = useMemo(() => buildReportOverview(rawText), [rawText]);
  const [pregnancyId, setPregnancyId] = useState(pregnancies.length === 1 ? pregnancies[0].id : "");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const keys = useRef(new Map<string, string>());
  const status = useRef<HTMLParagraphElement>(null);
  if (!overview.terms.length) return null;

  const summary = [
    t(overview.intro),
    t({ en: "Topics found: ", bn: "যেসব বিষয় পাওয়া গেছে: " }) + overview.terms.map((term) => t(term.title)).join("; ") + ".",
    note.trim() ? t({ en: "My note: ", bn: "আমার নোট: " }) + note.trim() : "",
    t({ en: "Checked by me against my paper report. No values were saved. Not a review by a doctor.", bn: "আমি কাগজের রিপোর্টের সঙ্গে মিলিয়েছি। কোনো মান সংরক্ষণ করা হয়নি। এটি চিকিৎসকের পর্যালোচনা নয়।" }),
  ].filter(Boolean).join("\n").slice(0, 2000);

  const problem = !pregnancyId ? t({ en: "Choose which pregnancy this report belongs to.", bn: "রিপোর্টটি কোন গর্ভকালের, তা বেছে নিন।" })
    : !date || date > today() ? t({ en: "Enter the date printed on the report. It cannot be in the future.", bn: "রিপোর্টে ছাপা তারিখ দিন। ভবিষ্যতের তারিখ হবে না।" })
    : !confirmed ? t({ en: "Tick the box to confirm you checked it.", bn: "মিলিয়ে দেখেছেন, তা নিশ্চিত করতে বাক্সে টিক দিন।" }) : "";

  async function save() {
    if (busy || saved) return;
    if (problem) { setMessage(problem); requestAnimationFrame(() => status.current?.focus()); return; }
    const body = JSON.stringify({ type: "visit", record: { subject: "mother", parentId: pregnancyId, occurredAt: `${date}T00:00:00+06:00`, placeNote: t({ en: "Bujhi report summary (checked by me)", bn: "বুঝি রিপোর্টের সারাংশ (আমি মিলিয়েছি)" }), note: summary } });
    const key = keys.current.get(body) ?? crypto.randomUUID();
    keys.current.set(body, key);
    setBusy(true); setMessage(t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }));
    try {
      const response = await fetch("/api/jibonrekha", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body });
      const result = (await response.json().catch(() => ({}))) as { saved?: boolean };
      if (response.ok && result.saved) { setSaved(true); setMessage(""); onSaved?.(); }
      else setMessage(response.status === 401 || response.status === 403
        ? t({ en: "Nothing was saved. Sign in as the account owner and try again.", bn: "কিছু সংরক্ষণ হয়নি। অ্যাকাউন্টের মালিক হিসেবে সাইন ইন করে আবার চেষ্টা করুন।" })
        : t({ en: "Nothing was saved. Check your connection and press Save again. It is safe to retry.", bn: "কিছু সংরক্ষণ হয়নি। সংযোগ দেখে আবার সংরক্ষণ চাপুন। আবার চাপলে ডুপ্লিকেট হবে না।" }));
    } catch { setMessage(t({ en: "Nothing was saved. You may be offline. Try again when connected.", bn: "কিছু সংরক্ষণ হয়নি। আপনি অফলাইনে থাকতে পারেন। সংযোগ পেলে আবার চেষ্টা করুন।" })); }
    finally { setBusy(false); requestAnimationFrame(() => status.current?.focus()); }
  }

  if (saved) return <div className="grid gap-4 rounded-card border-2 border-pro-success bg-pro-success-soft p-5">
    <p className="flex items-center gap-3 text-xl font-semibold"><CircleCheckBig aria-hidden="true" className="size-7 shrink-0 text-pro-success" />{t({ en: "Saved to your Jibonrekha", bn: "আপনার জীবনরেখায় সংরক্ষিত হয়েছে" })}</p>
    <p className="text-pro-muted">{t({ en: "You can find it under Visits. Only the summary was saved, not your photo or any lab value. Nothing was sent to anyone.", bn: "ভিজিট অংশে পাবেন। শুধু সারাংশ সংরক্ষিত হয়েছে, আপনার ছবি বা কোনো মান নয়। কাউকে কিছু পাঠানো হয়নি।" })}</p>
    <Link href="/app/jibonrekha" className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary sm:w-fit ${focus}`}>{t({ en: "See it in Jibonrekha", bn: "জীবনরেখায় দেখুন" })}<ArrowRight aria-hidden="true" className="size-4" /></Link>
  </div>;

  return <section className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-bg p-4 sm:p-6" aria-labelledby={`${id}-h`}>
    <div className="grid gap-1">
      <h3 id={`${id}-h`} className="text-lg font-semibold">{t({ en: "Keep this summary in your Jibonrekha", bn: "এই সারাংশ জীবনরেখায় রাখুন" })}</h3>
      <p className="max-w-[65ch] text-pro-muted">{t({ en: "Saves the plain-language summary above as a visit note, so you can show it at your next visit. Your photo and the raw text are not saved.", bn: "ওপরের সহজ ভাষার সারাংশ একটি ভিজিট-নোট হিসেবে রাখা হবে, যাতে পরের ভিজিটে দেখাতে পারেন। আপনার ছবি আর পড়া কাঁচা লেখা সংরক্ষণ হয় না।" })}</p>
    </div>
    <label className="grid gap-2 font-semibold">{t({ en: "Pregnancy record", bn: "গর্ভকালের রেকর্ড" })}
      <select className={control} value={pregnancyId} onChange={(event) => { setPregnancyId(event.target.value); setConfirmed(false); }}>
        <option value="">{t({ en: "Choose a record", bn: "একটি রেকর্ড বেছে নিন" })}</option>
        {pregnancies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
    <label className="grid gap-2 font-semibold">{t({ en: "Date on the report", bn: "রিপোর্টের তারিখ" })}
      <input className={control} type="date" max={today()} value={date} onChange={(event) => { setDate(event.target.value); setConfirmed(false); }} />
    </label>
    <label className="grid gap-2 font-semibold">{t({ en: "Your own note (optional)", bn: "আপনার নিজের নোট (ঐচ্ছিক)" })}
      <textarea className={`${control} min-h-24 py-3 font-normal`} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
    </label>
    <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-field bg-pro-surface p-3">
      <input className="mt-1 size-5 shrink-0 accent-pro-primary" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
      <span>{t({ en: "I checked this summary against my paper report.", bn: "কাগজের রিপোর্টের সঙ্গে এই সারাংশ আমি মিলিয়ে দেখেছি।" })}</span>
    </label>
    <button type="button" disabled={busy} onClick={() => void save()} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-pro-primary px-6 py-3 text-lg font-semibold text-pro-on-primary disabled:opacity-60 sm:w-fit ${focus}`}><Save aria-hidden="true" className="size-5" />{busy ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }) : t({ en: "Save summary", bn: "সারাংশ সংরক্ষণ করুন" })}</button>
    <p ref={status} tabIndex={-1} role="status" aria-atomic="true" className={`font-semibold empty:hidden ${focus}`}>{message}</p>
  </section>;
}
