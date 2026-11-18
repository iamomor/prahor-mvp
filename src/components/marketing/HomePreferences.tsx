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

  return (
    <dialog ref={dialog} className="home-preferences" aria-labelledby="home-preferences-title" onCancel={event => { event.preventDefault(); onClose(); }}>
      <div className="home-preferences-header"><Accessibility aria-hidden="true" /><button onClick={onClose} aria-label={t(copy("Close preferences", "পছন্দের প্যানেল বন্ধ করুন"))}><X aria-hidden="true" /></button></div>
      <h2 id="home-preferences-title">{t(copy("Adjust how you use PROHOR", "প্রহর আপনার মতো"))}</h2>
      <p>{t(copy("Choose what works for you. Your care, privacy and place in the journey stay the same.", "আপনার উপযোগী পছন্দ বেছে নিন। আপনার যত্ন, গোপনীয়তা ও সেবার অধিকার একই থাকবে।"))}</p>
      <fieldset><legend>{t(copy("Appearance", "রং ও চেহারা"))}</legend><div className="home-theme-options">
        {([ ["quiet-garden", "Quiet Garden"], ["original-rose", "Original Rose"], ["morning-mist", "Morning Mist"] ] as const).map(([id, label]) => (
          <label key={id}><input type="radio" name="home-theme" value={id} checked={prefs.theme === id} onChange={() => update("theme", id)} /><span lang="en">{label}</span></label>
        ))}
      </div></fieldset>
      <ContrastPreferenceControl value={prefs.highContrast} onChange={value => update("highContrast", value)} compact />
      <fieldset><legend>{t(copy("Reading & layout", "পড়া ও বিন্যাস"))}</legend>
        <div className="home-select-label"><label htmlFor="home-text-size">{t(copy("Text size", "লেখার আকার"))}</label><select id="home-text-size" value={prefs.textScale} onChange={e => update("textScale", e.target.value as ProhorAccessPreferences["textScale"])}>
          <option value="default">{t(copy("Default", "সাধারণ"))}</option><option value="large">{t(copy("Large", "বড়"))}</option><option value="extra-large">{t(copy("Extra large", "আরও বড়"))}</option>
        </select></div>
        <div className="home-select-label"><label htmlFor="home-typeface">{t(copy("Typeface", "অক্ষরের ধরন"))}</label><select id="home-typeface" value={reading.font} onChange={e => updateReading("font", e.target.value as ReadingPreferences["font"])}>
          <option value="default">{t(copy("Default editorial", "মূল সম্পাদকীয় ধরন"))}</option><option value="rubik">Rubik</option><option value="noto-serif">Noto Serif</option><option value="roboto-slab">Roboto Slab</option>
        </select></div>
        <div className="home-select-label"><label htmlFor="home-layout">{t(copy("Layout", "বিন্যাস"))}</label><select id="home-layout" value={reading.density} onChange={e => updateReading("density", e.target.value as ReadingPreferences["density"])}>
          <option value="comfortable">{t(copy("Comfortable", "স্বচ্ছন্দ"))}</option><option value="compact">{t(copy("Compact", "সংক্ষিপ্ত"))}</option><option value="spacious">{t(copy("Spacious", "খোলামেলা"))}</option>
        </select></div>
        <label className="home-check"><input type="checkbox" checked={reading.textSpacing === "relaxed"} onChange={e => updateReading("textSpacing", e.target.checked ? "relaxed" : "standard")} />{t(copy("Relaxed text spacing", "লেখার মাঝে বেশি ফাঁক"))}</label>
        <label className="home-check"><input type="checkbox" checked={prefs.reducedMotion} onChange={e => update("reducedMotion", e.target.checked)} />{t(copy("Reduce motion", "নড়াচড়া কমান"))}</label>
      </fieldset>
      <div className="home-select-label"><label htmlFor="home-language">{t(copy("Homepage language", "প্রথম পাতার ভাষা"))}</label><select id="home-language" value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="en">English</option><option value="bn">বাংলা</option></select></div>
      <div className="home-preferences-note"><strong>{t(copy("Keyboard access is always on.", "কিবোর্ড দিয়ে ব্যবহার সব সময় চালু।"))}</strong><p>{t(copy("Picture-and-text AAC, read-aloud and reviewed simpler wording are planned. The communication preview on this page is illustrative, not an active care tool.", "ছবি ও লেখা দিয়ে যোগাযোগ, পড়ে শোনানো ও পর্যালোচিত সহজ ভাষা ভবিষ্যৎ পরিকল্পনায় আছে। এই পাতার যোগাযোগের নমুনা সক্রিয় চিকিৎসাসেবার উপকরণ নয়।"))}</p></div>
      <p role="status" className="home-small">{storageMessage}</p>
      <button className="home-text-link" onClick={restoreDefaults}>{t(copy("Restore default appearance", "মূল চেহারা ফিরিয়ে আনুন"))}</button>
      <CloudSyncSection />
      <button className="home-button" onClick={onClose}><Check size={18} aria-hidden="true" />{t(copy("Done, keep exploring", "হয়েছে, আরও দেখুন"))}</button>
    </dialog>
  );
}
