"use client";

import { Mic, Square, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { browserSpeechProvider, type SpeechSession } from "@/features/bujhi/speech-service";
import { useHydrated } from "@/lib/use-hydrated";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";

type Props = {
  /** Current field text and its hard limit. Words that do not fit are held, never cut off. */
  value: string;
  maxLength: number;
  /** Receives the field text with the recognised words appended. The mother can still edit it; nothing is submitted. */
  onChange: (next: string) => void;
  language?: "bn" | "en";
  hideLanguageSelect?: boolean;
  disabled?: boolean;
  onListeningChange?: (listening: boolean) => void;
  focusTargetRef?: RefObject<HTMLElement | null>;
  className?: string;
};

const copy = {
  en: { start: "Speak instead of typing", stop: "Stop", cancel: "Cancel", listening: "Microphone is on. Speak now, then press Stop.", done: "Added to the box above. Check and edit it before you send anything.", empty: "Nothing was heard. Try again or type.", remote: "Also allow my browser's own speech service if on-device recognition is not installed (the browser may send audio to its provider).", fallback: "Voice input is optional. You can always type." },
  bn: { start: "লেখার বদলে বলুন", stop: "থামান", cancel: "বাতিল", listening: "মাইক্রোফোন চালু। এখন বলুন, তারপর থামান চাপুন।", done: "ওপরের ঘরে যোগ হয়েছে। কিছু পাঠানোর আগে দেখে নিয়ে বদলে নিন।", empty: "কিছু শোনা যায়নি। আবার চেষ্টা করুন বা লিখুন।", remote: "ডিভাইসে ভাষা প্যাক না থাকলে আমার ব্রাউজারের নিজস্ব স্পিচ সেবাও ব্যবহার করুন (ব্রাউজার অডিও তার সরবরাহকারীকে পাঠাতে পারে)।", fallback: "কণ্ঠে বলা ঐচ্ছিক। আপনি সবসময় লিখতে পারেন।" },
} as const;

/** One shared, user-started microphone control. Never listens on its own; never stores audio; never submits. */
export function VoiceDictationButton({ value, maxLength, onChange, language, hideLanguageSelect = false, disabled = false, onListeningChange, focusTargetRef, className = "" }: Props) {
  const { prefs } = useAdaptPreferences();
  const hydrated = useHydrated();
  const [selectedLanguage, setLang] = useState<"bn" | "en">(() => language ?? (prefs.language === "en" ? "en" : "bn"));
  const lang = hideLanguageSelect ? language ?? selectedLanguage : selectedLanguage;
  const c = copy[lang];
  const [state, setState] = useState<"idle" | "starting" | "listening">("idle");
  const [message, setMessage] = useState("");
  const [allowRemote, setAllowRemote] = useState(false);
  const [held, setHeld] = useState("");
  const [interim, setInterim] = useState("");
  const startValue = useRef("");
  const startHeld = useRef("");
  const cancelled = useRef(false);
  const supported = hydrated && Boolean((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition);
  const latest = useRef({ value, maxLength, onChange });
  useEffect(() => { latest.current = { value, maxLength, onChange }; }, [value, maxLength, onChange]);
  const session = useRef<SpeechSession | null>(null);
  const heard = useRef(false);
  const failed = useRef(false);

  useEffect(() => () => session.current?.cancel(), []);

  // Never truncates: words that would pass the limit are kept visible below until there is room.
  function add(words: string) {
    const { value: current, maxLength: max, onChange: change } = latest.current;
    const next = `${current}${current && !/\s$/.test(current) ? " " : ""}${words}`;
    if (next.length <= max) { change(next); setHeld(""); return; }
    setHeld(previous => previous ? `${previous} ${words}` : words);
    setMessage(lang === "bn" ? `সীমা ${max} অক্ষর। এই কথাগুলো যোগ হয়নি; নিচে রাখা আছে। লেখা ছোট করে "রাখা কথা যোগ করুন" চাপুন।` : `The limit is ${max} characters. These words were not added and are kept below. Shorten your text, then press “Add held words”.`);
  }

  async function start() {
    if (state !== "idle") return;
    heard.current = false; failed.current = false; cancelled.current = false;
    startValue.current = latest.current.value; startHeld.current = held;
    setMessage(""); setInterim(""); setState("starting");
    let endedBeforeStartCompleted = false;
    try {
      const opened = await browserSpeechProvider.transcribe({
        language: lang === "bn" ? "bn-BD" : "en-US", allowRemote,
        onText: text => { if (text.trim()) { heard.current = true; add(text.trim()); setInterim(""); } },
        onInterim: text => setInterim(text),
        onError: text => { failed.current = true; setState("idle"); session.current = null; onListeningChange?.(false); setMessage(text); },
        onEnd: () => {
          endedBeforeStartCompleted = true;
          setState("idle"); session.current = null; onListeningChange?.(false); setInterim("");
          if (focusTargetRef?.current) window.requestAnimationFrame(() => focusTargetRef.current?.focus());
          if (cancelled.current) {
            latest.current.onChange(startValue.current); setHeld(startHeld.current); setInterim(""); setMessage(lang === "bn" ? "কথা বাতিল করা হয়েছে। আগের লেখা রাখা আছে।" : "Dictation cancelled. Your earlier text is unchanged.");
          } else if (!failed.current) setMessage(heard.current ? c.done : c.empty);
        },
      });
      if (endedBeforeStartCompleted) return;
      session.current = opened;
      setState("listening"); onListeningChange?.(true); setMessage(c.listening);
    } catch (error) { setState("idle"); onListeningChange?.(false); setMessage(error instanceof Error ? error.message : c.empty); }
  }

  return (
    <div className={`grid gap-2 ${className}`} lang={lang}>
      {!hideLanguageSelect && <label className="grid max-w-xs gap-1 text-sm font-medium">
        {lang === "bn" ? "কথার ভাষা" : "Spoken language"}
        <select className="min-h-11 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base" value={lang} disabled={disabled || state !== "idle"} onChange={event => setLang(event.currentTarget.value === "en" ? "en" : "bn")}>
          <option value="bn">বাংলা</option>
          <option value="en">English</option>
        </select>
      </label>}
      <div className="flex flex-wrap items-center gap-2">
        {state === "listening"
          ? <>
              <AppButton variant="primary" size="sm" onClick={() => session.current?.stop()}><Square size={15} aria-hidden="true" />{c.stop}</AppButton>
              <AppButton variant="ghost" size="sm" onClick={() => { cancelled.current = true; session.current?.cancel(); }}><X size={15} aria-hidden="true" />{c.cancel}</AppButton>
              <span aria-hidden="true" className="font-semibold text-pro-danger">● {lang === "bn" ? "রেকর্ড চলছে" : "Recording"}</span>
            </>
          : <AppButton variant="ghost" size="sm" disabled={disabled || state === "starting" || !supported} onClick={() => void start()}><Mic size={15} aria-hidden="true" />{c.start}</AppButton>}
      </div>
      {supported && state === "idle" && (
        <label className="flex min-h-11 items-start gap-2 text-sm"><input type="checkbox" className="mt-1 size-5" disabled={disabled} checked={allowRemote} onChange={event => setAllowRemote(event.currentTarget.checked)} />{c.remote}</label>
      )}
      {!supported && <p className="text-sm text-pro-muted">{lang === "bn" ? "এই ব্রাউজারে কণ্ঠে লেখা সমর্থিত নয়। অনুগ্রহ করে লিখুন।" : "Voice input is not supported in this browser. Please type."}</p>}
      {held && (
        <div className="grid gap-2 rounded-field border border-pro-warning p-3">
          <p lang={lang}>{held}</p>
          <AppButton variant="secondary" size="sm" disabled={value.length + held.length + 1 > maxLength} onClick={() => add(held)}>{lang === "bn" ? "রাখা কথা যোগ করুন" : "Add held words"}</AppButton>
        </div>
      )}
      {interim && <div role="region" aria-label={lang === "bn" ? "লাইভ ট্রান্সক্রিপ্ট" : "Live transcript"} lang={lang}>
        <p className="text-sm text-pro-muted"><span className="font-semibold">{lang === "bn" ? "শোনা যাচ্ছে:" : "Heard so far:"}</span> <mark>{interim}</mark></p>
      </div>}
      <p className="text-sm text-pro-muted" aria-hidden="true">{lang === "bn" ? `বাকি ${Math.max(0, maxLength - value.length)} অক্ষর (সর্বোচ্চ ${maxLength})` : `${Math.max(0, maxLength - value.length)} characters left (maximum ${maxLength})`}</p>
      {message
        ? <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-pro-muted">{message}</p>
        : <p className="text-sm text-pro-muted">{supported ? c.fallback : lang === "bn" ? "এই ব্রাউজারে কণ্ঠে লেখা সমর্থিত নয়। অনুগ্রহ করে লিখুন।" : "Voice input is not supported in this browser. Please type."}</p>}
    </div>
  );
}
