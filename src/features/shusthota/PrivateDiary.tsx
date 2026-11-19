"use client";

import { LockKeyhole } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useLanguage } from "@/i18n/use-language";
import { loadDiaryEntries, saveDiaryEntry, shusthotaErrorCopy, type DiaryHistoryEntry } from "./api";

const copy = {
  title: { en: "A private space for your words", bn: "আপনার কথার জন্য ব্যক্তিগত একটি জায়গা" },
  label: { en: "Your diary note", bn: "আপনার ডায়েরির নোট" },
  hint: { en: "Write only what feels comfortable. Diary entries are owner-only in this demo.", bn: "যতটুকু স্বচ্ছন্দ বোধ করেন, ততটুকুই লিখুন। এই ডেমোতে ডায়েরির লেখা শুধু মালিক দেখতে পারেন।" },
  placeholder: { en: "Write a note…", bn: "একটি নোট লিখুন…" },
  privacy: { en: "Diary entries are never sent to Barta or AI, are never shared with providers, and cannot be selected in Bondhon.", bn: "ডায়েরির লেখা বার্তা বা এআই-তে পাঠানো হয় না, সেবাদাতার সঙ্গে শেয়ার হয় না এবং বন্ধনে বেছে নেওয়া যায় না।" },
  save: { en: "Save to my diary", bn: "ডায়েরিতে সংরক্ষণ করুন" },
  saved: { en: "The server confirmed this synthetic demo entry.", bn: "সার্ভার এই ডেমোর কৃত্রিম এন্ট্রিটি নিশ্চিত করেছে।" },
  saving: { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  retry: { en: "Try again", bn: "আবার চেষ্টা করুন" },
  history: { en: "Earlier private entries", bn: "আগের ব্যক্তিগত লেখা" },
  historyLimit: { en: "Up to the 100 newest entries are shown. Entries cannot be edited or deleted; there is no pagination.", bn: "সর্বশেষ ১০০টি পর্যন্ত লেখা দেখানো হয়। লেখা সম্পাদনা বা মুছে ফেলা যায় না; পৃষ্ঠা ভাগ করে দেখানোর সুবিধা নেই।" },
  empty: { en: "No diary entries yet.", bn: "এখনো কোনো লেখা নেই।" },
  skip: { en: "Close and return to overview", bn: "বন্ধ করে সারসংক্ষেপে ফিরুন" },
  keepText: { en: "Your text is still here. Check history before retrying if the save was not confirmed.", bn: "আপনার লেখা এখানেই আছে। সংরক্ষণ নিশ্চিত না হলে আবার চেষ্টা করার আগে ইতিহাস দেখুন।" },
} as const;

const formatDate = (value: string, language: string) => new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
}).format(new Date(value));

export function PrivateDiary({ onClose }: { onClose: () => void }) {
  const { language, t } = useLanguage();
  const textId = useId();
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
    void Promise.resolve().then(() => {
      if (active) void load();
    });
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
    <section id="shusthota-diary-preview" aria-labelledby={`${textId}-title`} lang={language}>
      <AppCard className="grid gap-5 sm:p-6">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2"><LockKeyhole size={18} aria-hidden="true" className="shrink-0 text-pro-primary" /><p className="font-semibold">{t({ en: "Private diary · owner-only demo", bn: "ব্যক্তিগত ডায়েরি · শুধু মালিকের ডেমো" })}</p></div>
          <h3 id={`${textId}-title`} className="text-xl font-semibold sm:text-2xl">{t(copy.title)}</h3>
          <p className="pro-muted leading-relaxed">{t(copy.privacy)}</p>
          {saveStatus && <p role={saveStatus.kind === "error" ? "alert" : "status"} className={saveStatus.kind === "error" ? "text-pro-danger" : "text-pro-success"}>{saveStatus.message}</p>}
        </div>

        <label htmlFor={`${textId}-note`} className="grid gap-2">
          <span className="font-medium">{t(copy.label)}</span>
          <span id={`${textId}-hint`} className="pro-muted leading-relaxed">{t(copy.hint)}</span>
          <textarea id={`${textId}-note`} value={text} onChange={event => { setText(event.target.value); if (saveStatus?.kind === "success") setSaveStatus(null); }} maxLength={10000} rows={5} aria-describedby={`${textId}-hint`} placeholder={t(copy.placeholder)} className="min-h-32 w-full resize-y rounded-field border border-pro-control-border bg-pro-elevated px-4 py-3 text-base leading-relaxed text-pro-text placeholder:text-pro-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus" />
          <span className="pro-muted text-sm">{text.length}/10000</span>
        </label>

        <div className="flex flex-col gap-3 border-t border-pro-border pt-4 sm:flex-row sm:flex-wrap">
          <AppButton disabled={!text.trim() || saving || saveStatus?.kind === "success"} onClick={() => void save()}>{saving ? t(copy.saving) : t(saveStatus?.kind === "success" ? copy.saved : copy.save)}</AppButton>
          <AppButton variant="secondary" onClick={onClose}>{t(copy.skip)}</AppButton>
        </div>

        <section aria-labelledby={`${textId}-history-title`} className="grid gap-3 border-t border-pro-border pt-5">
          <h4 id={`${textId}-history-title`} className="text-lg font-semibold">{t(copy.history)}</h4>
          <p className="pro-muted text-sm leading-relaxed">{t(copy.historyLimit)}</p>
          {loading && <p role="status" className="pro-muted">{t({ en: "Loading your private entries…", bn: "আপনার ব্যক্তিগত লেখা আনা হচ্ছে…" })}</p>}
          {!loading && historyError && <div className="grid justify-items-start gap-2"><p role="alert" className="text-pro-danger">{historyError}</p><AppButton variant="secondary" onClick={() => void load()}>{t(copy.retry)}</AppButton></div>}
          {!loading && !historyError && entries?.length === 0 && <p className="pro-muted">{t(copy.empty)}</p>}
          {!loading && !historyError && entries && entries.length > 0 && (
            <ul className="grid gap-3">
              {entries.map(entry => <li key={entry.id} className="grid gap-1 rounded-field border border-pro-border bg-pro-surface p-4"><time className="text-sm text-pro-muted" dateTime={entry.occurred_at}>{formatDate(entry.occurred_at, language)}</time><p className="whitespace-pre-wrap break-words leading-relaxed">{entry.text}</p></li>)}
            </ul>
          )}
        </section>
      </AppCard>
    </section>
  );
}
