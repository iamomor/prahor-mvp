"use client";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Lock, NotebookPen, Sprout } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

type CheckIn = { id: string; occurred_at: string; mood: string | null; energy: string | null; activity_note: string | null; rest_note: string | null };
type DiaryEntry = { id: string; text: string; occurred_at: string };

const box = "grid gap-4 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card,1.25rem)]";
const input = "min-h-11 w-full rounded-field border-[1.5px] border-pro-control-border bg-pro-bg px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const primary = "min-h-12 w-fit rounded-control bg-pro-primary px-5 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus aria-disabled:opacity-60";
const when = (value: string) => new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));

const moods = [["comfortable", "Comfortable", "স্বস্তিতে"], ["mixed", "Mixed", "মিশ্র"], ["difficult", "Difficult", "কঠিন"], ["prefer_not_to_say", "Prefer not to say", "বলতে চাই না"]] as const;
const energies = [["high", "High", "বেশি"], ["medium", "Medium", "মাঝারি"], ["low", "Low", "কম"], ["prefer_not_to_say", "Prefer not to say", "বলতে চাই না"]] as const;

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({})) as { saved?: boolean; message?: string };
  if (!response.ok || !result.saved) throw new Error(result.message || "Not saved. Check your connection and try again.");
}

export function Wellbeing() {
  const { t } = useLanguage();
  const id = useId();
  const [checkIns, setCheckIns] = useState<CheckIn[] | null>(null);
  const [diary, setDiary] = useState<DiaryEntry[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [diaryStatus, setDiaryStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<"checkin" | "diary" | null>(null);

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([fetch("/api/wellness", { cache: "no-store" }), fetch("/api/diary", { cache: "no-store" })]);
      if (!a.ok || !b.ok) throw new Error();
      setCheckIns((await a.json() as { entries: CheckIn[] }).entries);
      setDiary((await b.json() as { entries: DiaryEntry[] }).entries);
      setLoadError("");
    } catch { setLoadError(t({ en: "Your wellbeing history could not be loaded.", bn: "আপনার সুস্থতার ইতিহাস আনা যায়নি।" })); }
  }, [t]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim() || null;
    const body = { occurredAt: new Date().toISOString(), mood: text("mood"), energy: text("energy"), activityNote: text("activity"), restNote: text("rest") };
    if (!body.mood && !body.energy && !body.activityNote && !body.restNote) {
      setCheckInStatus({ ok: false, text: t({ en: "Answer at least one question, or skip today. Nothing was saved.", bn: "অন্তত একটি প্রশ্নের উত্তর দিন, অথবা আজ বাদ দিন। কিছু সংরক্ষিত হয়নি।" }) });
      return;
    }
    setBusy("checkin"); setCheckInStatus(null);
    try {
      await post("/api/wellness", body);
      form.reset();
      setCheckInStatus({ ok: true, text: `${t({ en: "Saved to your record at", bn: "আপনার রেকর্ডে সংরক্ষিত" })} ${when(body.occurredAt)}.` });
      await load();
    } catch (cause) { setCheckInStatus({ ok: false, text: `${cause instanceof Error ? cause.message : ""} ${t({ en: "Your answers are kept on this page.", bn: "আপনার উত্তর এই পাতায় রাখা আছে।" })}` }); }
    finally { setBusy(null); }
  }

  async function saveDiary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const text = String(new FormData(form).get("diary") ?? "").trim();
    if (!text) { setDiaryStatus({ ok: false, text: t({ en: "Write something before saving.", bn: "সংরক্ষণের আগে কিছু লিখুন।" }) }); return; }
    setBusy("diary"); setDiaryStatus(null);
    try {
      const occurredAt = new Date().toISOString();
      await post("/api/diary", { text, occurredAt });
      form.reset();
      setDiaryStatus({ ok: true, text: `${t({ en: "Saved privately at", bn: "ব্যক্তিগতভাবে সংরক্ষিত" })} ${when(occurredAt)}.` });
      await load();
    } catch (cause) { setDiaryStatus({ ok: false, text: `${cause instanceof Error ? cause.message : ""} ${t({ en: "Your words are still in the box.", bn: "আপনার লেখা এখনো বক্সে আছে।" })}` }); }
    finally { setBusy(null); }
  }

  return <div className="grid gap-6">
    <header className="grid gap-2">
      <p className="pro-eyebrow text-pro-primary">Shusthota · <span lang="bn">সুস্থতা</span></p>
      <h1 className="pro-editorial text-3xl font-semibold sm:text-4xl">{t({ en: "How are you today?", bn: "আজ কেমন আছেন?" })}</h1>
      <p className="max-w-[65ch] text-lg">{t({ en: "Every question is optional. There are no scores, streaks or targets. Any kind of activity counts, including rest.", bn: "প্রতিটি প্রশ্ন ঐচ্ছিক। কোনো স্কোর, ধারাবাহিকতা বা লক্ষ্য নেই। বিশ্রামসহ যেকোনো কাজই গণ্য।" })}</p>
    </header>
    {loadError && <div role="alert" className="flex flex-wrap items-center gap-3"><p className="text-pro-danger">{loadError}</p><button type="button" className="min-h-11 rounded-control border-[1.5px] border-pro-control-border px-4 font-semibold text-pro-primary" onClick={() => void load()}>{t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}</button></div>}

    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby={`${id}-checkin`} className="grid content-start gap-4">
        <form onSubmit={saveCheckIn} className={box} noValidate>
          <h2 id={`${id}-checkin`} className="flex items-center gap-2 text-xl font-semibold"><Sprout size={20} aria-hidden="true" className="text-pro-primary" />{t({ en: "Check-in", bn: "চেক-ইন" })}</h2>
          {([["mood", t({ en: "How is your mood?", bn: "আপনার মন কেমন?" }), moods], ["energy", t({ en: "How is your energy?", bn: "আপনার শক্তি কেমন?" }), energies]] as const).map(([name, legend, options]) =>
            <fieldset key={name} className="grid gap-2">
              <legend className="mb-1 font-semibold">{legend} <span className="font-normal text-pro-muted">({t({ en: "optional", bn: "ঐচ্ছিক" })})</span></legend>
              <div className="flex flex-wrap gap-2">{options.map(([value, en, bn]) =>
                <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-pro-control-border px-4 has-[:checked]:border-pro-primary has-[:checked]:bg-pro-surface has-[:checked]:font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pro-focus">
                  <input type="radio" name={name} value={value} className="size-4 accent-[var(--pro-primary)]" />{t({ en, bn })}
                </label>)}</div>
            </fieldset>)}
          <label className="grid gap-1"><span className="font-semibold">{t({ en: "Activity today", bn: "আজকের কাজকর্ম" })} <span className="font-normal text-pro-muted">({t({ en: "optional", bn: "ঐচ্ছিক" })})</span></span>
            <span className="text-sm text-pro-muted" id={`${id}-activity-hint`}>{t({ en: "For example: a short walk, chair exercises, assisted stretching, housework, or resting.", bn: "যেমন: একটু হাঁটা, চেয়ারে বসে ব্যায়াম, সহায়তায় স্ট্রেচিং, ঘরের কাজ বা বিশ্রাম।" })}</span>
            <textarea name="activity" maxLength={1000} rows={2} aria-describedby={`${id}-activity-hint`} className={input} /></label>
          <label className="grid gap-1"><span className="font-semibold">{t({ en: "Rest and sleep", bn: "বিশ্রাম ও ঘুম" })} <span className="font-normal text-pro-muted">({t({ en: "optional", bn: "ঐচ্ছিক" })})</span></span>
            <textarea name="rest" maxLength={1000} rows={2} className={input} /></label>
          <button className={primary} aria-disabled={busy !== null}>{busy === "checkin" ? t({ en: "Saving your check-in…", bn: "চেক-ইন সংরক্ষণ হচ্ছে…" }) : t({ en: "Save check-in", bn: "চেক-ইন সংরক্ষণ করুন" })}</button>
          {checkInStatus && <p role={checkInStatus.ok ? "status" : "alert"} className={checkInStatus.ok ? "text-pro-success" : "text-pro-danger"}>{checkInStatus.text}</p>}
        </form>
        <div className="grid gap-2">
          <h3 className="font-semibold">{t({ en: "Earlier check-ins", bn: "আগের চেক-ইন" })}</h3>
          {checkIns === null && !loadError ? <p role="status">{t({ en: "Loading…", bn: "আসছে…" })}</p>
            : checkIns?.length ? <ul className="grid gap-2">{checkIns.slice(0, 10).map(item => <li key={item.id} className="rounded-field border border-pro-border px-4 py-3">
                <span className="block text-sm text-pro-muted">{when(item.occurred_at)}</span>
                {[item.mood && `${t({ en: "Mood", bn: "মন" })}: ${item.mood.replaceAll("_", " ")}`, item.energy && `${t({ en: "Energy", bn: "শক্তি" })}: ${item.energy.replaceAll("_", " ")}`, item.activity_note, item.rest_note].filter(Boolean).join(" · ")}
              </li>)}</ul>
            : checkIns && <p className="text-pro-muted">{t({ en: "No check-ins yet.", bn: "এখনো কোনো চেক-ইন নেই।" })}</p>}
        </div>
      </section>

      <section aria-labelledby={`${id}-diary`} className="grid content-start gap-4">
        <form onSubmit={saveDiary} className={box}>
          <h2 id={`${id}-diary`} className="flex items-center gap-2 text-xl font-semibold"><NotebookPen size={20} aria-hidden="true" className="text-pro-primary" />{t({ en: "Private diary", bn: "ব্যক্তিগত ডায়েরি" })}</h2>
          <p className="flex items-start gap-2 rounded-field bg-pro-surface px-3 py-2 text-sm"><Lock size={16} aria-hidden="true" className="mt-0.5 shrink-0" />{t({ en: "Only you can read this. It is never shared with providers, supporters or AI, and cannot be selected for sharing.", bn: "শুধু আপনি পড়তে পারবেন। এটি কখনো সেবাদাতা, সহায়ক বা এআই-এর সাথে শেয়ার হয় না, এবং শেয়ারের জন্য বেছে নেওয়াও যায় না।" })}</p>
          <label className="grid gap-1"><span className="font-semibold">{t({ en: "Write anything", bn: "যা খুশি লিখুন" })}</span>
            <textarea name="diary" maxLength={10000} rows={6} required className={input} /></label>
          <button className={primary} aria-disabled={busy !== null}>{busy === "diary" ? t({ en: "Saving privately…", bn: "ব্যক্তিগতভাবে সংরক্ষণ হচ্ছে…" }) : t({ en: "Save to my diary", bn: "ডায়েরিতে সংরক্ষণ করুন" })}</button>
          {diaryStatus && <p role={diaryStatus.ok ? "status" : "alert"} className={diaryStatus.ok ? "text-pro-success" : "text-pro-danger"}>{diaryStatus.text}</p>}
        </form>
        <details className="rounded-field border border-pro-border px-4 py-3">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">{t({ en: "Read earlier entries", bn: "আগের লেখা পড়ুন" })} ({diary?.length ?? 0})</summary>
          {diary?.length ? <ul className="mt-2 grid gap-3">{diary.map(item => <li key={item.id} className="border-t border-pro-border pt-3">
              <span className="block text-sm text-pro-muted">{when(item.occurred_at)}</span>
              <p className="whitespace-pre-wrap">{item.text}</p>
            </li>)}</ul> : <p className="mt-2 text-pro-muted">{t({ en: "No diary entries yet.", bn: "এখনো কোনো লেখা নেই।" })}</p>}
        </details>
      </section>
    </div>
  </div>;
}
