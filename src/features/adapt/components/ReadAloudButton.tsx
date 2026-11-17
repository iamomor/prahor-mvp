"use client";

import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import { useId } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import type { SpeechLanguage, SpeechStatus } from "../hooks/useSpeechSynthesis";

type ReadAloudButtonProps = {
  /** The original, reviewed text. It is only passed to the local browser speech engine. */
  text: string;
  /** Language of this content; defaults to the user's selected interface/content language. */
  language?: SpeechLanguage;
  /** Label for the explicit start action. */
  label?: string;
  className?: string;
};

const statusCopy: Record<SpeechLanguage, Record<SpeechStatus, string>> = {
  en: {
    loading: "Loading available voices…",
    ready: "Ready. Your text remains available to read.",
    starting: "Starting playback…",
    playing: "Playing aloud.",
    paused: "Paused.",
    completed: "Finished reading.",
    "voice-unavailable": "A matching voice is unavailable in this browser or on this device. Your original text remains available to read.",
    unsupported: "Speech synthesis is not supported in this browser. Your original text remains available to read.",
    failed: "Speech could not be played. Your original text remains available to read.",
  },
  bn: {
    loading: "উপলভ্য কণ্ঠ খোঁজা হচ্ছে…",
    ready: "প্রস্তুত। মূল লেখাটি পড়ার জন্য এখানেই আছে।",
    starting: "পড়া শুরু হচ্ছে…",
    playing: "পড়ে শোনানো হচ্ছে।",
    paused: "পড়া থামানো হয়েছে।",
    completed: "পড়া শেষ হয়েছে।",
    "voice-unavailable": "এই ব্রাউজার বা ডিভাইসে মেলার মতো কণ্ঠ নেই। মূল লেখাটি পড়ার জন্য এখানেই আছে।",
    unsupported: "এই ব্রাউজারে পড়ে শোনানোর সুবিধা নেই। মূল লেখাটি পড়ার জন্য এখানেই আছে।",
    failed: "পড়ে শোনানো যায়নি। মূল লেখাটি পড়ার জন্য এখানেই আছে।",
  },
};

const actionCopy: Record<SpeechLanguage, { pause: string; resume: string; stop: string; voice: string; rate: string }> = {
  en: { pause: "Pause reading", resume: "Resume reading", stop: "Stop reading", voice: "Speech voice", rate: "Speech rate" },
  bn: { pause: "পড়া থামান", resume: "আবার পড়ুন", stop: "পড়া বন্ধ করুন", voice: "পড়ার কণ্ঠ", rate: "পড়ার গতি" },
};

export function ReadAloudButton({
  text,
  language: contentLanguage,
  label,
  className = "",
}: ReadAloudButtonProps) {
  const { prefs } = useAdaptPreferences();
  const language = contentLanguage ?? prefs.language;
  const actions = actionCopy[language];
  const voiceId = useId();
  const rateId = useId();
  const speech = useSpeechSynthesis(text, language);
  const active = speech.status === "starting" || speech.status === "playing" || speech.status === "paused";
  const canStart = speech.voicesLoaded && speech.matchingVoices.length > 0 && Boolean(text.trim());

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <div className="inline-flex flex-wrap items-center gap-2">
        {speech.status === "playing" ? (
          <AppButton variant="ghost" size="sm" onClick={speech.pause} aria-label={actions.pause}>
            <Pause size={15} aria-hidden="true" />
            {actions.pause}
          </AppButton>
        ) : speech.status === "paused" ? (
          <AppButton variant="ghost" size="sm" onClick={speech.resume} aria-label={actions.resume}>
            <Play size={15} aria-hidden="true" />
            {actions.resume}
          </AppButton>
        ) : speech.status === "starting" ? (
          <AppButton variant="ghost" size="sm" disabled>
            <Volume2 size={15} aria-hidden="true" />
            {language === "bn" ? "শুরু হচ্ছে…" : "Starting…"}
          </AppButton>
        ) : (
          <AppButton
            variant="ghost"
            size="sm"
            onClick={speech.start}
            disabled={!canStart}
            aria-label={label ?? (language === "bn" ? "পড়ে শোনান" : "Read aloud")}
          >
            {canStart ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
            {label ?? (language === "bn" ? "পড়ে শোনান" : "Read aloud")}
          </AppButton>
        )}
        {active && (
          <AppButton variant="ghost" size="sm" onClick={speech.stop} aria-label={actions.stop}>
            <Square size={15} aria-hidden="true" />
            {actions.stop}
          </AppButton>
        )}
      </div>

      {speech.voicesLoaded && speech.matchingVoices.length > 1 && (
        <label htmlFor={voiceId} className="flex flex-wrap items-center gap-2 text-sm text-pro-text">
          <span>{actions.voice}</span>
          <select
            id={voiceId}
            value={speech.selectedVoice?.voiceURI ?? ""}
            onChange={(event) => speech.setSelectedVoiceURI(event.target.value)}
            disabled={active}
            className="min-h-11 max-w-full rounded-field border border-pro-control-border bg-pro-elevated px-2 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          >
            {speech.matchingVoices.map((voice) => (
              <option key={`${voice.voiceURI}-${voice.lang}`} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
      )}

      {speech.voicesLoaded && speech.matchingVoices.length > 0 && (
        <label htmlFor={rateId} className="flex flex-wrap items-center gap-2 text-sm text-pro-text">
          <span>{actions.rate}</span>
          <input
            id={rateId}
            type="range"
            min="0.75"
            max="1.5"
            step="0.25"
            value={speech.rate}
            onChange={(event) => speech.setRate(Number(event.target.value))}
            disabled={active}
            aria-valuetext={`${speech.rate}×`}
            className="accent-pro-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          />
          <output htmlFor={rateId}>{speech.rate}×</output>
        </label>
      )}

      <p className="text-xs text-pro-muted" role="status" aria-live="polite" aria-atomic="true" lang={language}>
        {statusCopy[language][speech.status]}
      </p>
    </div>
  );
}
