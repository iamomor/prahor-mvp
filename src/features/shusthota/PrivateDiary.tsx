"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { loadDiaryEntries, saveDiaryEntry, shusthotaErrorCopy, type DiaryHistoryEntry } from "./api";
import styles from "./ShusthotaOverview.module.css";

const copy = {
  title: { en: "A private space for your words", bn: "আপনার কথার জন্য ব্যক্তিগত একটি জায়গা" },
  description: { en: "Write only what feels comfortable. This diary is owner-only; its entries are not sent to Barta or AI and are not shared with providers.", bn: "যতটুকু স্বচ্ছন্দ বোধ করেন, ততটুকুই লিখুন। এই ডায়েরি শুধু মালিকের জন্য; এর লেখা বার্তা বা এআই-তে পাঠানো হয় না এবং সেবাদাতার সঙ্গে শেয়ার হয় না।" },
  label: { en: "Your note", bn: "আপনার নোট" },
  hint: { en: "Up to 10,000 characters. Entries cannot be edited or deleted.", bn: "সর্বোচ্চ ১০,০০০ অক্ষর। এন্ট্রি সম্পাদনা বা মুছে ফেলা যায় না।" },
  placeholder: { en: "Write a note…", bn: "একটি নোট লিখুন…" },
  save: { en: "Save to my diary", bn: "ডায়েরিতে সংরক্ষণ করুন" },
  saved: { en: "The server confirmed your entry.", bn: "সার্ভার আপনার এন্ট্রি নিশ্চিত করেছে।" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  keepText: { en: "Your writing is still here. Check your history before retrying if the save was not confirmed.", bn: "আপনার লেখা এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
  history: { en: "Earlier entries", bn: "আগের এন্ট্রি" },
  latest100: { en: "Latest 100 entries at most; no pagination.", bn: "সর্বোচ্চ সর্বশেষ ১০০টি এন্ট্রি; পৃষ্ঠা ভাগ নেই।" },
  loading: { en: "Loading your private entries…", bn: "আপনার ব্যক্তিগত লেখা আনা হচ্ছে…" },
  retry: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  empty: { en: "Your diary is ready when you are.", bn: "আপনি প্রস্তুত হলে ডায়েরিতে লিখতে পারেন।" },
} as const;

const formatDate = (value: string, language: string) => new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
}).format(new Date(value));

export function PrivateDiary() {
  const { language, t } = useLanguage();
  const id = useId();
  const submitting = useRef(false);
  const historyRequest = useRef<AbortController | null>(null);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<DiaryHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [saveStatus, setSaveStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    historyRequest.current?.abort();
    const controller = new AbortController();
    historyRequest.current = controller;
    setLoading(true);
    setHistoryError("");
    try {
      const result = await loadDiaryEntries(controller.signal);
      if (!controller.signal.aborted) setEntries(result);
    } catch (error) {
      if (!controller.signal.aborted) {
        setEntries(null);
        setHistoryError(t(shusthotaErrorCopy(error, "load")));
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) void load(); });
    return () => {
      active = false;
      historyRequest.current?.abort();
    };
  }, [load]);

  async function save() {
    const value = text.trim();
    if (!value || saving || submitting.current || saveStatus?.kind === "success") return;
    submitting.current = true;
    setSaving(true);
    setSaveStatus(null);
    try {
      await saveDiaryEntry(value);
      setText("");
      setSaveStatus({ kind: "success", message: t(copy.saved) });
      await load();
    } catch (error) {
      setSaveStatus({ kind: "error", message: `${t(shusthotaErrorCopy(error, "save"))} ${t(copy.keepText)}` });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <div lang={language} className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
      <section aria-labelledby={`${id}-title`} className={`${styles.journal} grid content-start gap-5 rounded-hero border border-pro-border bg-pro-elevated p-5 shadow-pro-1 sm:p-7`}>
        <div className="grid gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-pro-primary"><LockKeyhole size={17} aria-hidden="true" />{t({ en: "Owner-only space", bn: "শুধু মালিকের ব্যক্তিগত জায়গা" })}</span>
          <h3 id={`${id}-title`} className="pro-display text-2xl">{t(copy.title)}</h3>
          <p className="pro-muted leading-relaxed">{t(copy.description)}</p>
        </div>
        <label htmlFor={`${id}-note`} className="grid gap-2">
          <span className="font-semibold">{t(copy.label)}</span>
          <span id={`${id}-hint`} className="pro-muted text-sm leading-relaxed">{t(copy.hint)}</span>
          <textarea id={`${id}-note`} value={text} onChange={event => { setText(event.target.value); if (saveStatus?.kind === "success") setSaveStatus(null); }} maxLength={10000} rows={7} aria-describedby={`${id}-hint ${id}-count`} placeholder={t(copy.placeholder)} className={`${styles.journalPaper} min-h-44 w-full resize-y rounded-field border border-pro-control-border px-4 py-3 text-base leading-relaxed text-pro-text placeholder:text-pro-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus`} />
          <span id={`${id}-count`} className="pro-muted text-sm tabular-nums">{text.length}/10000</span>
        </label>
        {saveStatus && <p role={saveStatus.kind === "error" ? "alert" : "status"} aria-live={saveStatus.kind === "error" ? "assertive" : "polite"} className={saveStatus.kind === "error" ? "rounded-control border border-pro-danger bg-pro-danger-soft p-3 text-pro-danger" : "rounded-control border border-pro-success bg-pro-success-soft p-3 text-pro-success"}>{saveStatus.message}</p>}
        <AppButton disabled={!text.trim() || saving || saveStatus?.kind === "success"} onClick={() => void save()} className="min-h-12 w-full whitespace-normal sm:w-fit">{saving ? t(copy.saving) : t(saveStatus?.kind === "success" ? copy.saved : copy.save)}<ArrowUpRight size={16} aria-hidden="true" className="ms-2" /></AppButton>
      </section>

      <section aria-labelledby={`${id}-history`} className="grid content-start gap-4 border-t border-pro-border pt-5 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-pro-border pb-3">
          <h3 id={`${id}-history`} className="text-xl font-semibold">{t(copy.history)}</h3>
          <p className="pro-muted text-sm">{t(copy.latest100)}</p>
        </header>
        {loading && <p role="status" className="pro-muted py-3">{t(copy.loading)}</p>}
        {!loading && historyError && <div className="grid justify-items-start gap-3 rounded-control border border-pro-danger bg-pro-danger-soft p-4"><p role="alert" className="text-pro-danger">{historyError}</p><AppButton variant="secondary" onClick={() => void load()}>{t(copy.retry)}</AppButton></div>}
        {!loading && !historyError && entries?.length === 0 && <div className="grid justify-items-center gap-3 rounded-hero border border-dashed border-pro-border bg-pro-surface p-7 text-center"><span className="grid size-11 place-items-center rounded-full border border-pro-border bg-pro-elevated text-pro-primary"><LockKeyhole size={18} aria-hidden="true" /></span><p className="pro-muted max-w-sm leading-relaxed">{t(copy.empty)}</p></div>}
        {!loading && !historyError && entries && entries.length > 0 && <ol className="grid gap-4">{entries.map(entry => <li key={entry.id} className="grid gap-2 border-b border-pro-border pb-4 last:border-0"><time dateTime={entry.occurred_at} className="text-sm font-medium text-pro-muted">{formatDate(entry.occurred_at, language)}</time><p className="whitespace-pre-wrap break-words leading-relaxed">{entry.text}</p></li>)}</ol>}
      </section>
    </div>
  );
}
