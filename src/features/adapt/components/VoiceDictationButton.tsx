"use client";

import { AppButton } from "@/components/ui/AppButton";
import {
  browserSpeechProvider,
  type SpeechSession,
} from "@/features/bujhi/speech-service";
import { useHydrated } from "@/lib/use-hydrated";
import {
  builtInSpeechIsBlocked,
  canRecordAudio,
  startRecordedDictation,
} from "../lib/recorded-dictation";

/** The mother's yes to server transcription lasts for this browser tab only. */
const SERVER_CONSENT_KEY = "prohor-dictation-server-consent";
function readServerConsent() {
  try {
    return sessionStorage.getItem(SERVER_CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}
import { Info, Mic, Square, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";

type Props = {
  /** Current field text and its hard limit. Words that do not fit are held, never cut off. */
  value: string;
  maxLength: number;
  /** Receives the field text with the recognised words appended. The mother can still edit it; nothing is submitted. */
  onChange: (next: string) => void;
  /** Language the microphone listens in. */
  language?: "bn" | "en";
  /** Language of the labels and hints around the microphone. Defaults to the listening language. */
  uiLanguage?: "bn" | "en";
  /** Hide the "characters left" line when the host field already shows its own counter. */
  hideCounter?: boolean;
  /**
   * Quiet layout: only the microphone control and a short help label show.
   * Everything else (steps, consent option, notes) opens in a popup on hover, focus or tap.
   */
  compact?: boolean;
  helpLabel?: string;
  helpContent?: ReactNode;
  hideLanguageSelect?: boolean;
  disabled?: boolean;
  onListeningChange?: (listening: boolean) => void;
  focusTargetRef?: RefObject<HTMLElement | null>;
  className?: string;
};

/** Hover has to rest on the help label this long before the popup opens. */
const HOVER_DELAY_MS = 1000;

const copy = {
  en: {
    start: "Speak instead of typing",
    stop: "Stop",
    cancel: "Cancel",
    listening:
      "Microphone is on. Speak now; your words appear when you pause. Press Stop when you finish.",
    done: "Added to the box above. Check and edit it before you send anything.",
    empty: "Nothing was heard. Try again or type.",
    remote:
      "Also allow my browser's own speech service if on-device recognition is not installed (the browser may send audio to its provider).",
    fallback: "Voice input is optional. You can always type.",
    needsRemote:
      "On-device speech recognition is not installed for this language, so nothing was recorded. You can type instead, or choose your browser's speech service. It may send your voice to the browser's provider while you speak. PROHOR does not store audio.",
    useRemote: "Use browser speech service",
    offerRecorder:
      "Your browser's built-in speech service is not working here. You can record your voice instead: it works in any browser that lets this site use the microphone. When you press Stop, the recording is sent once to PROHOR's server and a speech-to-text service (Google Gemini) to turn it into text. PROHOR does not store the audio. You can always type.",
    useRecorder: "Record and turn my voice into text",
    transcribing: "Turning your voice into text…",
  },
  bn: {
    start: "লেখার বদলে বলুন",
    stop: "থামান",
    cancel: "বাতিল",
    listening:
      "মাইক্রোফোন চালু। এখন বলুন; থামলেই কথাগুলো লেখা হয়ে যাবে। শেষ হলে থামান চাপুন।",
    done: "ওপরের ঘরে যোগ হয়েছে। কিছু পাঠানোর আগে দেখে নিয়ে বদলে নিন।",
    empty: "কিছু শোনা যায়নি। আবার চেষ্টা করুন বা লিখুন।",
    remote:
      "ডিভাইসে ভাষা প্যাক না থাকলে আমার ব্রাউজারের নিজস্ব স্পিচ সেবাও ব্যবহার করুন (ব্রাউজার অডিও তার সরবরাহকারীকে পাঠাতে পারে)।",
    fallback: "কণ্ঠে বলা ঐচ্ছিক। আপনি সবসময় লিখতে পারেন।",
    needsRemote:
      "এই ভাষার জন্য ডিভাইসে স্পিচ প্যাক নেই, তাই কিছু রেকর্ড হয়নি। আপনি লিখতে পারেন, অথবা ব্রাউজারের স্পিচ সেবা বেছে নিতে পারেন। কথা বলার সময় ব্রাউজার আপনার কণ্ঠ তার সরবরাহকারীর কাছে পাঠাতে পারে। প্রহর অডিও জমা রাখে না।",
    useRemote: "ব্রাউজারের স্পিচ সেবা ব্যবহার করুন",
    offerRecorder:
      "এখানে ব্রাউজারের নিজস্ব স্পিচ সেবা কাজ করছে না। তার বদলে আপনার কণ্ঠ রেকর্ড করতে পারেন; মাইক্রোফোনের অনুমতি দিলে যেকোনো ব্রাউজারে এটি চলে। থামান চাপলে রেকর্ডিং একবার প্রহরের সার্ভার ও একটি স্পিচ-টু-টেক্সট সেবায় (Google Gemini) গিয়ে লেখায় রূপ নেয়। প্রহর অডিও জমা রাখে না। আপনি সবসময় লিখতে পারেন।",
    useRecorder: "রেকর্ড করে কণ্ঠকে লেখায় বদলান",
    transcribing: "কণ্ঠকে লেখায় বদলানো হচ্ছে…",
  },
} as const;

/** Turns the engine's short error codes into a plain explanation with a next step. */
function friendlyError(text: string, ui: "bn" | "en") {
  const code = /\(([a-z-]+)\)/.exec(text)?.[1];
  const bn = ui === "bn";
  switch (code) {
    case "network":
      return bn
        ? "ব্রাউজারের স্পিচ সেবায় পৌঁছানো যায়নি। ইন্টারনেট দেখুন, অথবা Chrome ব্যবহার করুন (কিছু ব্রাউজারে এই সেবা বন্ধ থাকে)। এখনকার জন্য আপনি লিখতে পারেন।"
        : "Could not reach your browser's speech service. Check your internet connection or try Google Chrome (some browsers block this service). You can type your question for now.";
    case "no-speech":
      return bn
        ? "কোনো কথা শোনা যায়নি। মাইক্রোফোনের কাছে একটু জোরে বলুন, তারপর থামান চাপুন। অথবা লিখুন।"
        : "No speech was heard. Speak a little louder near the microphone, then press Stop. Or type instead.";
    case "not-allowed":
      return bn
        ? "মাইক্রোফোনের অনুমতি বন্ধ আছে। ঠিকানা-বারের তালা/মাইক আইকনে চাপ দিয়ে এই সাইটের জন্য মাইক্রোফোন চালু করুন, তারপর আবার চেষ্টা করুন।"
        : "Microphone access is blocked. Click the lock or microphone icon in the address bar, allow the microphone for this site, then try again.";
    case "server-busy":
      return bn
        ? "লেখায় বদলানোর সেবা এখন ব্যস্ত। কয়েক সেকেন্ড পরে আবার চেষ্টা করুন, অথবা লিখুন।"
        : "The voice-to-text service is busy right now. Try again in a few seconds, or type.";
    case "server-unconfigured":
      return bn
        ? "এই সাইটে সার্ভারে কণ্ঠ থেকে লেখা চালু করা নেই। অনুগ্রহ করে লিখুন।"
        : "Voice-to-text is not set up on this site's server. Please type.";
    case "server-unreachable":
      return bn
        ? "প্রহরের সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন, অথবা লিখুন।"
        : "Could not reach PROHOR's server. Check your connection and try again, or type.";
    case "server-failed":
      return bn
        ? "কণ্ঠকে লেখায় বদলানো যায়নি। আবার চেষ্টা করুন, অথবা লিখুন।"
        : "Your voice could not be turned into text. Try again, or type.";
    case "too-long":
      return bn
        ? "রেকর্ডিং অনেক লম্বা। এক মিনিটের কম সময় বলুন।"
        : "The recording is too long. Please speak for less than a minute.";
    case "audio-capture":
      return bn ? "মাইক্রোফোন পাওয়া যায়নি। ডিভাইস দেখুন বা লিখুন।" : "No microphone was found. Check your device or type instead.";
    case "service-not-allowed":
    case "language-not-supported":
      return bn ? "এই ব্রাউজারে এই ভাষায় কণ্ঠে লেখা চলছে না। অনুগ্রহ করে লিখুন।" : "Voice input is not available for this language in this browser. Please type.";
    default:
      return text;
  }
}

/** One shared, user-started microphone control. Never listens on its own; never stores audio; never submits. */
export function VoiceDictationButton({
  value,
  maxLength,
  onChange,
  language,
  uiLanguage,
  hideCounter = false,
  compact = false,
  helpLabel,
  helpContent,
  hideLanguageSelect = false,
  disabled = false,
  onListeningChange,
  focusTargetRef,
  className = "",
}: Props) {
  const { prefs } = useAdaptPreferences();
  const hydrated = useHydrated();
  const [selectedLanguage, setLang] = useState<"bn" | "en">(
    () => language ?? (prefs.language === "en" ? "en" : "bn"),
  );
  const lang = hideLanguageSelect
    ? (language ?? selectedLanguage)
    : selectedLanguage;
  const ui = uiLanguage ?? lang;
  const c = copy[ui];
  const [state, setState] = useState<"idle" | "starting" | "listening">("idle");
  const [message, setMessage] = useState("");
  const [allowRemote, setAllowRemote] = useState(false);
  const [needsRemote, setNeedsRemote] = useState(false);
  const [offerRecorder, setOfferRecorder] = useState(false);
  const [useServer, setUseServer] = useState(readServerConsent);
  const [helpOpen, setHelpOpen] = useState(false);
  const [popupPlace, setPopupPlace] = useState<CSSProperties>();
  const helpId = useId();
  const helpButton = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const pinned = useRef(false);

  function closeHelp() {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
    pinned.current = false;
    setHelpOpen(false);
  }

  /** Opens beside the help label (to its right) so it never covers the conversation; falls back to above it on narrow screens. */
  function openHelp(byClick: boolean) {
    const button = helpButton.current;
    if (!button) return;
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
    const box = button.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 16);
    pinned.current = byClick;
    setPopupPlace(
      box.right + 12 + width <= window.innerWidth - 8
        ? {
            left: box.right + 12,
            bottom: Math.max(8, window.innerHeight - box.bottom),
          }
        : {
            right: Math.max(8, window.innerWidth - box.right),
            bottom: window.innerHeight - box.top + 8,
          },
    );
    setHelpOpen(true);
  }

  useEffect(() => {
    if (!helpOpen) return;
    const close = () => closeHelp();
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [helpOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );
  const [held, setHeld] = useState("");
  const [interim, setInterim] = useState("");
  const startValue = useRef("");
  const startHeld = useRef("");
  const cancelled = useRef(false);
  const supported =
    hydrated &&
    Boolean(
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition,
    );
  const latest = useRef({ value, maxLength, onChange });
  useEffect(() => {
    latest.current = { value, maxLength, onChange };
  }, [value, maxLength, onChange]);
  const session = useRef<SpeechSession | null>(null);
  const heard = useRef(false);
  const failed = useRef(false);

  useEffect(() => () => session.current?.cancel(), []);

  // Never truncates: words that would pass the limit are kept visible below until there is room.
  function add(words: string) {
    const { value: current, maxLength: max, onChange: change } = latest.current;
    const next = `${current}${current && !/\s$/.test(current) ? " " : ""}${words}`;
    if (next.length <= max) {
      change(next);
      setHeld("");
      return;
    }
    setHeld((previous) => (previous ? `${previous} ${words}` : words));
    setMessage(
      ui === "bn"
        ? `সীমা ${max} অক্ষর। এই কথাগুলো যোগ হয়নি; নিচে রাখা আছে। লেখা ছোট করে "রাখা কথা যোগ করুন" চাপুন।`
        : `The limit is ${max} characters. These words were not added and are kept below. Shorten your text, then press “Add held words”.`,
    );
  }

  async function start(remoteOverride = false, server = useServer) {
    if (state !== "idle") return;
    // Never record anything before the mother has agreed to the server notice.
    if (
      !server &&
      canRecordAudio() &&
      (!supported || builtInSpeechIsBlocked())
    ) {
      setOfferRecorder(true);
      return;
    }
    if (server && !useServer) {
      setUseServer(true);
      try {
        sessionStorage.setItem(SERVER_CONSENT_KEY, "yes");
      } catch {
        // Consent then lasts until this page closes.
      }
    }
    if (remoteOverride) setAllowRemote(true);
    setNeedsRemote(false);
    setOfferRecorder(false);
    heard.current = false;
    failed.current = false;
    cancelled.current = false;
    startValue.current = latest.current.value;
    startHeld.current = held;
    setMessage("");
    setInterim("");
    setState("starting");
    let endedBeforeStartCompleted = false;
    try {
      const handlers = {
        onText: (text: string) => {
          if (text.trim()) {
            heard.current = true;
            add(text.trim());
            setInterim("");
          }
        },
        onInterim: (text: string) => setInterim(text),
        onError: (text: string) => {
          failed.current = true;
          setState("idle");
          session.current = null;
          onListeningChange?.(false);
          setMessage(friendlyError(text, ui));
          if (
            !server &&
            canRecordAudio() &&
            /\((network|service-not-allowed|language-not-supported)\)/.test(text)
          )
            setOfferRecorder(true);
        },
        onEnd: () => {
          endedBeforeStartCompleted = true;
          setState("idle");
          session.current = null;
          onListeningChange?.(false);
          setInterim("");
          if (focusTargetRef?.current)
            window.requestAnimationFrame(() => focusTargetRef.current?.focus());
          if (cancelled.current) {
            latest.current.onChange(startValue.current);
            setHeld(startHeld.current);
            setInterim("");
            setMessage(
              ui === "bn"
                ? "কথা বাতিল করা হয়েছে। আগের লেখা রাখা আছে।"
                : "Dictation cancelled. Your earlier text is unchanged.",
            );
          } else if (!failed.current)
            setMessage(heard.current ? c.done : c.empty);
        },
      };
      const opened = server
        ? await startRecordedDictation({
            language: lang,
            onTranscribing: () => {
              setState("starting");
              setMessage(c.transcribing);
            },
            ...handlers,
          })
        : await browserSpeechProvider.transcribe({
            language: lang === "bn" ? "bn-BD" : "en-US",
            allowRemote: allowRemote || remoteOverride,
            ...handlers,
          });
      if (endedBeforeStartCompleted) return;
      session.current = opened;
      setState("listening");
      onListeningChange?.(true);
      setMessage(c.listening);
    } catch (error) {
      setState("idle");
      onListeningChange?.(false);
      if (
        error instanceof Error &&
        /on-device language pack is unavailable/i.test(error.message)
      ) {
        setNeedsRemote(true);
        setOfferRecorder(canRecordAudio());
        setMessage("");
        return;
      }
      setMessage(error instanceof Error ? friendlyError(error.message, ui) : c.empty);
    }
  }

  const canRecord = hydrated && canRecordAudio();
  const remotePrompt = needsRemote || offerRecorder ? (
    <div
      role="alert"
      className="grid gap-2 rounded-field border border-pro-warning bg-pro-warning-soft p-3 text-sm leading-relaxed text-pro-text"
    >
      {needsRemote && <p>{c.needsRemote}</p>}
      {offerRecorder && <p>{c.offerRecorder}</p>}
      <div className="flex flex-wrap gap-2">
        {needsRemote && (
          <AppButton
            variant="secondary"
            size="sm"
            disabled={disabled || state !== "idle"}
            onClick={() => void start(true)}
          >
            <Mic size={15} aria-hidden="true" />
            {c.useRemote}
          </AppButton>
        )}
        {canRecord && (
          <AppButton
            variant="secondary"
            size="sm"
            disabled={disabled || state !== "idle"}
            onClick={() => void start(false, true)}
          >
            <Mic size={15} aria-hidden="true" />
            {c.useRecorder}
          </AppButton>
        )}
      </div>
    </div>
  ) : null;

  const controls =
    state === "listening" ? (
      <>
        <AppButton
          variant="primary"
          size="sm"
          onClick={() => session.current?.stop()}
        >
          <Square size={15} aria-hidden="true" />
          {c.stop}
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          onClick={() => {
            cancelled.current = true;
            session.current?.cancel();
          }}
        >
          <X size={15} aria-hidden="true" />
          {c.cancel}
        </AppButton>
        <span aria-hidden="true" className="font-semibold text-pro-danger">
          ● {ui === "bn" ? "রেকর্ড চলছে" : "Recording"}
        </span>
      </>
    ) : (
      <AppButton
        variant="ghost"
        size="sm"
        disabled={disabled || state === "starting" || (!supported && !canRecord)}
        onClick={() => void start()}
      >
        <Mic size={15} aria-hidden="true" />
        {c.start}
      </AppButton>
    );

  if (compact) {
    const unsupported =
      ui === "bn"
        ? "এই ব্রাউজারে কণ্ঠে লেখা সমর্থিত নয়। অনুগ্রহ করে লিখুন।"
        : "Voice input is not supported in this browser. Please type.";
    const helpTitle =
      helpLabel ?? (ui === "bn" ? "ভয়েস সহায়তা" : "Voice help");
    return (
      <div
        className={`relative grid gap-2 ${className}`}
        lang={ui}
        onKeyDown={(event) => {
          if (event.key === "Escape" && helpOpen) {
            closeHelp();
            helpButton.current?.focus();
          }
        }}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (
            helpOpen &&
            !event.currentTarget.contains(next) &&
            !(next instanceof Node && popup.current?.contains(next))
          )
            closeHelp();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">{controls}</div>
          <button
            ref={helpButton}
            type="button"
            aria-expanded={helpOpen}
            aria-controls={helpOpen ? helpId : undefined}
            onClick={() => {
              if (helpOpen && pinned.current) closeHelp();
              else openHelp(true);
            }}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse" || helpOpen) {
                window.clearTimeout(closeTimer.current);
                return;
              }
              hoverTimer.current = window.setTimeout(
                () => openHelp(false),
                HOVER_DELAY_MS,
              );
            }}
            onPointerLeave={() => {
              window.clearTimeout(hoverTimer.current);
              if (helpOpen && !pinned.current)
                closeTimer.current = window.setTimeout(closeHelp, 250);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-2 text-sm font-semibold text-pro-primary transition-colors duration-[var(--pro-duration-fast)] hover:bg-pro-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          >
            <Info size={16} aria-hidden="true" />
            {helpTitle}
          </button>
        </div>
        {remotePrompt}
        {held && (
          <div className="grid gap-2 rounded-field border border-pro-warning p-3">
            <p lang={lang}>{held}</p>
            <AppButton
              variant="secondary"
              size="sm"
              disabled={value.length + held.length + 1 > maxLength}
              onClick={() => add(held)}
            >
              {ui === "bn" ? "রাখা কথা যোগ করুন" : "Add held words"}
            </AppButton>
          </div>
        )}
        {interim && (
          <div
            role="region"
            aria-label={ui === "bn" ? "লাইভ ট্রান্সক্রিপ্ট" : "Live transcript"}
            lang={lang}
          >
            <p className="text-sm text-pro-muted">
              <span className="font-semibold">
                {ui === "bn" ? "শোনা যাচ্ছে:" : "Heard so far:"}
              </span>{" "}
              <mark>{interim}</mark>
            </p>
          </div>
        )}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-pro-muted empty:hidden"
        >
          {message || (!supported && !canRecord ? unsupported : "")}
        </p>
        {helpOpen &&
          popupPlace &&
          createPortal(
            <div
              ref={popup}
              id={helpId}
              role="group"
              aria-label={helpTitle}
              lang={ui}
              style={popupPlace}
              onPointerEnter={() => window.clearTimeout(closeTimer.current)}
              onPointerLeave={() => {
                if (!pinned.current)
                  closeTimer.current = window.setTimeout(closeHelp, 250);
              }}
              className="fixed z-50 w-[min(22rem,calc(100vw-1rem))] max-h-[calc(100svh-1rem)] overflow-y-auto rounded-card border border-pro-control-border bg-pro-elevated p-4 text-sm leading-relaxed text-pro-text shadow-[0_1rem_2.5rem_-1rem_rgb(var(--pro-shadow-rgb)/0.45)] transition duration-[var(--pro-duration-normal)] ease-pro starting:-translate-x-1 starting:opacity-0 motion-reduce:transition-none"
            >
              <div className="grid gap-2.5">
                {helpContent}
                {supported && state === "idle" && (
                  <label className="flex min-h-11 items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5 shrink-0"
                      disabled={disabled}
                      checked={allowRemote}
                      onChange={(event) =>
                        setAllowRemote(event.currentTarget.checked)
                      }
                    />
                    {c.remote}
                  </label>
                )}
                <p className="text-pro-muted">
                  {supported || canRecord ? c.fallback : unsupported}
                </p>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${className}`} lang={ui}>
      {!hideLanguageSelect && (
        <label className="grid max-w-xs gap-1 text-sm font-medium">
          {ui === "bn" ? "কথার ভাষা" : "Spoken language"}
          <select
            className="min-h-11 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base"
            value={lang}
            disabled={disabled || state !== "idle"}
            onChange={(event) =>
              setLang(event.currentTarget.value === "en" ? "en" : "bn")
            }
          >
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {state === "listening" ? (
          <>
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => session.current?.stop()}
            >
              <Square size={15} aria-hidden="true" />
              {c.stop}
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => {
                cancelled.current = true;
                session.current?.cancel();
              }}
            >
              <X size={15} aria-hidden="true" />
              {c.cancel}
            </AppButton>
            <span aria-hidden="true" className="font-semibold text-pro-danger">
              ● {ui === "bn" ? "রেকর্ড চলছে" : "Recording"}
            </span>
          </>
        ) : (
          <AppButton
            variant="ghost"
            size="sm"
            disabled={disabled || state === "starting" || (!supported && !canRecord)}
            onClick={() => void start()}
          >
            <Mic size={15} aria-hidden="true" />
            {c.start}
          </AppButton>
        )}
      </div>
      {supported && state === "idle" && (
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-5"
            disabled={disabled}
            checked={allowRemote}
            onChange={(event) => setAllowRemote(event.currentTarget.checked)}
          />
          {c.remote}
        </label>
      )}
      {!supported && !canRecord && (
        <p className="text-sm text-pro-muted">
          {ui === "bn"
            ? "এই ব্রাউজারে কণ্ঠে লেখা সমর্থিত নয়। অনুগ্রহ করে লিখুন।"
            : "Voice input is not supported in this browser. Please type."}
        </p>
      )}
      {remotePrompt}
      {held && (
        <div className="grid gap-2 rounded-field border border-pro-warning p-3">
          <p lang={lang}>{held}</p>
          <AppButton
            variant="secondary"
            size="sm"
            disabled={value.length + held.length + 1 > maxLength}
            onClick={() => add(held)}
          >
            {ui === "bn" ? "রাখা কথা যোগ করুন" : "Add held words"}
          </AppButton>
        </div>
      )}
      {interim && (
        <div
          role="region"
          aria-label={ui === "bn" ? "লাইভ ট্রান্সক্রিপ্ট" : "Live transcript"}
          lang={lang}
        >
          <p className="text-sm text-pro-muted">
            <span className="font-semibold">
              {ui === "bn" ? "শোনা যাচ্ছে:" : "Heard so far:"}
            </span>{" "}
            <mark>{interim}</mark>
          </p>
        </div>
      )}
      {!hideCounter && (
        <p className="text-sm text-pro-muted" aria-hidden="true">
          {ui === "bn"
            ? `বাকি ${Math.max(0, maxLength - value.length)} অক্ষর (সর্বোচ্চ ${maxLength})`
            : `${Math.max(0, maxLength - value.length)} characters left (maximum ${maxLength})`}
        </p>
      )}
      {message ? (
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-pro-muted"
        >
          {message}
        </p>
      ) : (
        <p className="text-sm text-pro-muted">
          {supported
            ? c.fallback
            : ui === "bn"
              ? "এই ব্রাউজারে কণ্ঠে লেখা সমর্থিত নয়। অনুগ্রহ করে লিখুন।"
              : "Voice input is not supported in this browser. Please type."}
        </p>
      )}
    </div>
  );
}
