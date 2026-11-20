"use client";

import { useEffect, useRef, useState } from "react";
import { Accessibility, Check, X } from "lucide-react";
import { readLocalPreferences, type ProhorAccessPreferences } from "@/lib/access-preferences";
import { useAdaptPreferences } from "@/features/adapt/hooks/useAdaptPreferences";
import { readReadingPreferences, applyAllPreferences } from "@/features/adapt/lib/preference-helpers";
import { DEFAULT_READING_PREFERENCES, type ReadingPreferences } from "@/features/adapt/types/adapt.types";
import { ContrastPreferenceControl } from "@/components/accessibility/ContrastPreferenceControl";
import { CloudSyncSection } from "@/features/adapt/components/CloudSyncSection";
import { copy, type Locale } from "./home-content";
import { useHome } from "./HomeContext";

export type { ReadingPreferences } from "@/features/adapt/types/adapt.types";
export { readReadingPreferences };

export const readingKey = "prohor-home-reading-v1";
export const defaultReading = DEFAULT_READING_PREFERENCES;

export function applyReadingPreferences(value: ReadingPreferences) {
  applyAllPreferences(readLocalPreferences(), value);
}

export function HomePreferences({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const { locale, setLocale, t } = useHome();
  const { prefs, reading, updatePref, updateReading: storeReading, resetAll } = useAdaptPreferences();
  const [storageMessage, setStorageMessage] = useState("");

  useEffect(() => {
    if (!open || !dialog.current) return;
    const modal = dialog.current;
    trigger.current = document.activeElement as HTMLElement;
    modal.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      modal.close();
      trigger.current?.focus();
    };
  }, [open]);

  function update<K extends keyof ProhorAccessPreferences>(key: K, value: ProhorAccessPreferences[K]) {
    updatePref(key, value);
    setStorageMessage(t(copy("Applied. These preferences stay on this browser when storage is available.", "প্রয়োগ হয়েছে। সংরক্ষণের সুযোগ থাকলে পছন্দগুলো এই ব্রাউজারে থাকবে।")));
  }

  function updateReading<K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) {
    storeReading(key, value);
    setStorageMessage(t(copy("Applied to this page. Storage availability determines whether it is remembered.", "এই পাতায় প্রয়োগ হয়েছে। সংরক্ষণের সুযোগ অনুযায়ী পরেরবার মনে থাকবে।")));
  }

  function restoreDefaults() {
    resetAll(); updatePref("language", locale);
    setStorageMessage(t(copy("Default appearance restored. Your language and practice text are unchanged.", "মূল চেহারা ফিরেছে। আপনার ভাষা ও অনুশীলনের লেখা একই আছে।")));
  }

  const themes = [
    { id: "quiet-garden", label: "Quiet Garden", note: copy("Calm greens", "শান্ত সবুজ") },
    { id: "original-rose", label: "Original Rose", note: copy("Warm rose", "উষ্ণ গোলাপি") },
    { id: "morning-mist", label: "Morning Mist", note: copy("Soft blue", "হালকা নীল") },
  ] as const;

  return (
    <dialog ref={dialog} className="home-preferences adapt-sheet" aria-labelledby="home-preferences-title" aria-describedby="home-preferences-intro" onCancel={event => { event.preventDefault(); onClose(); }}>
      <div className="adapt-sheet-head">
        <span className="adapt-sheet-badge" aria-hidden="true"><Accessibility size={22} /></span>
        <div><h2 id="home-preferences-title">{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}</h2>
        <p id="home-preferences-intro">{t(copy("Choose what works for you. Your care, privacy and place in the journey stay the same.", "আপনার উপযোগী পছন্দ বেছে নিন। আপনার যত্ন, গোপনীয়তা ও সেবার অধিকার একই থাকবে।"))}</p></div>
        <button className="adapt-sheet-close" onClick={onClose} aria-label={t(copy("Close preferences", "পছন্দের প্যানেল বন্ধ করুন"))}><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="adapt-sheet-body">
        <fieldset className="adapt-card"><legend>{t(copy("Appearance", "রং ও চেহারা"))}</legend>
          <div className="adapt-themes">{themes.map(({ id, label, note }) => <label key={id} className="adapt-theme">
            <input type="radio" name="home-theme" value={id} checked={prefs.theme === id} onChange={() => update("theme", id)} />
            <span className="adapt-theme-preview" data-prohor-preview="" data-theme={id} aria-hidden="true"><i /><i /><i /></span>
            <span className="adapt-theme-text"><strong lang="en">{label}</strong><span>{t(note)}</span></span>
            <Check className="adapt-theme-check" size={18} aria-hidden="true" />
          </label>)}</div>
        </fieldset>
        <div className="adapt-card adapt-contrast"><ContrastPreferenceControl value={prefs.highContrast} onChange={value => update("highContrast", value)} compact /></div>
        <div className="adapt-card"><h3>{t(copy("Reading & layout", "পড়া ও বিন্যাস"))}</h3>
          <Segmented legend={t(copy("Text size", "লেখার আকার"))} name="home-text-size" value={prefs.textScale} onChange={value => update("textScale", value)} options={[
            { value: "default", label: t(copy("Default", "সাধারণ")), sample: "Aa" }, { value: "large", label: t(copy("Large", "বড়")), sample: "Aa" }, { value: "extra-large", label: t(copy("Extra large", "আরও বড়")), sample: "Aa" },
          ]} />
          <Segmented legend={t(copy("Layout", "বিন্যাস"))} name="home-layout" value={reading.density} onChange={value => updateReading("density", value)} options={[
            { value: "compact", label: t(copy("Compact", "সংক্ষিপ্ত")) }, { value: "comfortable", label: t(copy("Comfortable", "স্বচ্ছন্দ")) }, { value: "spacious", label: t(copy("Spacious", "খোলামেলা")) },
          ]} />
          <div className="adapt-field"><label htmlFor="home-typeface">{t(copy("Typeface", "অক্ষরের ধরন"))}</label><select id="home-typeface" value={reading.font} onChange={e => updateReading("font", e.target.value as ReadingPreferences["font"])}>
            <option value="default">{t(copy("Default editorial", "মূল সম্পাদকীয় ধরন"))}</option><option value="rubik">Rubik</option><option value="noto-serif">Noto Serif</option><option value="roboto-slab">Roboto Slab</option>
          </select></div>
          <label className="adapt-switch"><span>{t(copy("Relaxed text spacing", "লেখার মাঝে বেশি ফাঁক"))}</span><input type="checkbox" role="switch" checked={reading.textSpacing === "relaxed"} onChange={e => updateReading("textSpacing", e.target.checked ? "relaxed" : "standard")} /><i aria-hidden="true" /></label>
          <label className="adapt-switch"><span>{t(copy("Reduce motion", "নড়াচড়া কমান"))}</span><input type="checkbox" role="switch" checked={prefs.reducedMotion} onChange={e => update("reducedMotion", e.target.checked)} /><i aria-hidden="true" /></label>
        </div>
        <div className="adapt-card"><Segmented legend={t(copy("Homepage language", "প্রথম পাতার ভাষা"))} name="home-language" value={locale} onChange={value => setLocale(value)} options={[
          { value: "en", label: "English", lang: "en" }, { value: "bn", label: "বাংলা", lang: "bn" },
        ]} /></div>
        <div className="home-preferences-note"><strong>{t(copy("Keyboard access is always on.", "কিবোর্ড দিয়ে ব্যবহার সব সময় চালু।"))}</strong><p>{t(copy("Picture-and-text AAC, read-aloud and reviewed simpler wording are planned. The communication preview on this page is illustrative, not an active care tool.", "ছবি ও লেখা দিয়ে যোগাযোগ, পড়ে শোনানো ও পর্যালোচিত সহজ ভাষা ভবিষ্যৎ পরিকল্পনায় আছে। এই পাতার যোগাযোগের নমুনা সক্রিয় চিকিৎসাসেবার উপকরণ নয়।"))}</p></div>
        <p role="status" className="home-small adapt-status">{storageMessage}</p>
        <button className="home-text-link" onClick={restoreDefaults}>{t(copy("Restore default appearance", "মূল চেহারা ফিরিয়ে আনুন"))}</button>
        <CloudSyncSection />
      </div>
      <div className="adapt-sheet-foot"><button className="home-button" onClick={onClose}><Check size={18} aria-hidden="true" />{t(copy("Done, keep exploring", "হয়েছে, আরও দেখুন"))}</button></div>
    </dialog>
  );
}

type SegmentOption<T extends string> = { value: T; label: string; sample?: string; lang?: Locale };

function Segmented<T extends string>({ legend, name, value, options, onChange }: { legend: string; name: string; value: T; options: SegmentOption<T>[]; onChange: (value: T) => void }) {
  return <fieldset className="adapt-segmented"><legend>{legend}</legend><div className="adapt-segmented-track">{options.map((option, index) => <label key={option.value} lang={option.lang}>
    <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
    <span>{option.sample && <b aria-hidden="true" style={{ fontSize: `${0.875 + index * 0.1875}rem` }}>{option.sample}</b>}{option.label}</span>
  </label>)}</div></fieldset>;
}
