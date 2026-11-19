"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { getActivityPreferences, ShusthotaApiError, saveActivityPreferences } from "./api";

const options = [
  ["walking", { en: "Walking", bn: "হাঁটা" }],
  ["assisted", { en: "Assisted activity", bn: "সহায়তায় কাজকর্ম" }],
  ["seated", { en: "Seated or wheelchair-friendly activity", bn: "বসে বা হুইলচেয়ারে করা যায় এমন কাজকর্ম" }],
  ["gentle_movement", { en: "Gentle movement", bn: "হালকা নড়াচড়া" }],
  ["resting", { en: "Resting", bn: "বিশ্রাম" }],
  ["other", { en: "Other", bn: "অন্য কিছু" }],
  ["none", { en: "No preference", bn: "কোনো পছন্দ নেই" }],
] as const;

export function ActivityPreferences({ onSaved }: { onSaved?: () => void } = {}) {
  const { language, t } = useLanguage();
  const id = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await getActivityPreferences();
      setSelected(entries[0]?.preferences ?? []);
      setLoaded(true);
      setError("");
    } catch {
      setLoaded(false);
      setError(t({ en: "Activity preferences are unavailable right now.", bn: "কাজকর্মের পছন্দ এখন পাওয়া যাচ্ছে না।" }));
    } finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);
  function toggle(value: string) {
    setSelected(current => value === "none" ? (current.includes("none") ? [] : ["none"]) :
      current.includes(value) ? current.filter(item => item !== value) : [...current.filter(item => item !== "none"), value]);
    setMessage("");
  }
  async function save() {
    if (busy || loading || !loaded || submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      const saved = await saveActivityPreferences(selected as Parameters<typeof saveActivityPreferences>[0]);
      setMessage(t({ en: "The server confirmed this synthetic preference record.", bn: "সার্ভার এই কৃত্রিম পছন্দের রেকর্ড নিশ্চিত করেছে।" }));
      onSaved?.();
      try {
        const latest = await getActivityPreferences();
        if (!latest.some(entry => entry.id === saved.id)) setError(t({ en: "The save was confirmed, but the updated history was not returned.", bn: "সংরক্ষণ নিশ্চিত হয়েছে, তবে হালনাগাদ ইতিহাস ফেরত আসেনি।" }));
      } catch {
        setError(t({ en: "The save was confirmed, but history could not be refreshed.", bn: "সংরক্ষণ নিশ্চিত হয়েছে, তবে ইতিহাস নতুন করে আনা যায়নি।" }));
      }
    } catch (cause) {
      setError(t(cause instanceof ShusthotaApiError && cause.status === 403
        ? { en: "This feature is available to confirmed mother accounts.", bn: "এই সুবিধাটি যাচাইকৃত মায়ের অ্যাকাউন্টের জন্য।" }
        : { en: "The server did not confirm this change. Try again.", bn: "সার্ভার পরিবর্তনটি নিশ্চিত করেনি। আবার চেষ্টা করুন।" }));
    } finally { submitting.current = false; setBusy(false); }
  }
  return <section lang={language} aria-labelledby={`${id}-title`} className="grid gap-4 border-t border-pro-border pt-7">
    <header className="grid gap-1"><p className="pro-eyebrow tracking-normal">{t({ en: "Optional · personal choice", bn: "ঐচ্ছিক · ব্যক্তিগত পছন্দ" })}</p><h2 id={`${id}-title`} className="pro-display text-2xl">{t({ en: "Activity preferences", bn: "কাজকর্মের পছন্দ" })}</h2><p className="pro-muted max-w-prose leading-relaxed">{t({ en: "Choose what you may want to see. These choices do not indicate ability or disability and do not affect care access. Each option is equally valid.", bn: "আপনি যেসব বিকল্প দেখতে চান তা বেছে নিন। এই পছন্দ থেকে সক্ষমতা বা প্রতিবন্ধিতা অনুমান করা হয় না এবং সেবার সুযোগেও প্রভাব পড়ে না। প্রতিটি বিকল্পই সমানভাবে গ্রহণযোগ্য।" })}</p></header>
    <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="mb-2 font-semibold">{t({ en: "Select any that suit you", bn: "আপনার পছন্দমতো বেছে নিন" })}</legend>{options.map(([value, label]) => <label key={value} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-control border border-pro-control-border bg-pro-elevated p-3 leading-relaxed focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"><input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} className="mt-1 size-5 shrink-0 accent-pro-primary"/><span>{t(label)}</span></label>)}</fieldset>
    <p className="pro-muted text-sm">{t({ en: "No exercise instructions or recommendations are provided here.", bn: "এখানে কোনো ব্যায়ামের নির্দেশনা বা পরামর্শ দেওয়া হয় না।" })}</p>
    <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center"><AppButton type="button" disabled={busy||loading||!loaded} onClick={() => void save()}>{busy?t({en:"Saving…",bn:"সংরক্ষণ হচ্ছে…"}):t({en:"Save preferences",bn:"পছন্দ সংরক্ষণ করুন"})}</AppButton>{!loaded&&!loading&&<AppButton type="button" variant="secondary" onClick={()=>void load()}>{t({en:"Try loading again",bn:"আবার চেষ্টা করুন"})}</AppButton>}{message&&<p role="status" className="text-pro-success">{message}</p>}{error&&<p role="alert" className="text-pro-danger">{error}</p>}</div>
  </section>;
}
