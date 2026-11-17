"use client";

import type { ProhorTheme } from "@/lib/access-preferences";
import { Check, HeartHandshake, MessageCircle, Pause, Play, Square, Volume2 } from "lucide-react";
import { useState } from "react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { SampleTag } from "../product/ScreenFrame";
import { useSampleSpeech } from "./use-sample-speech";

const previewThemes: { value: ProhorTheme; label: string; letter: string }[] = [
  { value: "quiet-garden", label: "Quiet Garden", letter: "Q" },
  { value: "original-rose", label: "Original Rose", letter: "R" },
  { value: "morning-mist", label: "Morning Mist", letter: "M" },
];

const phrases = [
  { icon: HeartHandshake, text: copy("I need help", "আমার সাহায্য দরকার") },
  {
    icon: MessageCircle,
    text: copy("I have a question", "আমার একটি প্রশ্ন আছে"),
  },
];

export function AdaptPreview() {
  const { t } = useHome();
  const [scale, setScale] = useState(0);
  const [theme, setTheme] = useState<ProhorTheme>("quiet-garden");
  const [contrast, setContrast] = useState(false);
  const [phrase, setPhrase] = useState<number | null>(null);
  const { speechStatus, setSpeechStatus, readAloud, pause, resume, stop, status } = useSampleSpeech(
    phrase === null ? t(copy("Your care. Your way.", "আপনার যত্ন, আপনার মতো।")) : t(phrases[phrase].text),
  );

  return (
    <div
      className="care-screen care-adapt-preview"
      data-prohor-preview
      data-theme={theme}
      data-contrast={contrast ? "more" : undefined}
      role="group"
      aria-label={t(copy("Try Adapt locally", "এখানেই অ্যাডাপ্ট চেষ্টা করুন"))}
    >
      <div className="care-screen-tag">
        <SampleTag />
      </div>
      <div className="care-control-row">
        <span className="font-tag">{t(copy("Text size", "লেখার আকার"))}</span>
        <div
          className="care-size-control"
          role="group"
          aria-label={t(copy("Sample text size", "নমুনা লেখার আকার"))}
        >
          {["A", "A+", "A++"].map((label, index) => (
            <button
              type="button"
              key={label}
              aria-label={t(
                copy(`${label} sample text size`, `${label} নমুনা লেখার আকার`),
              )}
              aria-pressed={scale === index}
              onClick={() => setScale(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="care-text-sample" data-size={scale}>
        <p lang="bn">আপনার যত্ন, আপনার মতো।</p>
        <p lang="en">Your care. Your way.</p>
      </div>
      <div className="care-control-row care-appearance-controls">
        <span className="font-tag">{t(copy("Theme", "থিম"))}</span>
        <div
          className="care-theme-control"
          role="group"
          aria-label={t(copy("Sample theme", "নমুনা থিম"))}
        >
          {previewThemes.map((item) => (
            <button
              type="button"
              key={item.value}
              className="care-theme-swatch"
              data-prohor-preview
              data-theme={item.value}
              aria-label={item.label}
              title={item.label}
              aria-pressed={theme === item.value}
              onClick={() => setTheme(item.value)}
            >
              {theme === item.value ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                item.letter
              )}
            </button>
          ))}
        </div>
      </div>
      <label className="care-contrast-switch">
        <span>{t(copy("Higher contrast", "বেশি কনট্রাস্ট"))}</span>
        <input
          type="checkbox"
          role="switch"
          checked={contrast}
          onChange={(event) => setContrast(event.target.checked)}
        />
        <span className="care-switch-track" aria-hidden="true">
          <span />
        </span>
      </label>
      <div
        className="care-aac-tiles"
        role="group"
        aria-label={t(copy("Choose a sample phrase", "নমুনা বাক্য বাছুন"))}
      >
        {phrases.map(({ icon: Icon, text }, index) => (
          <button
            type="button"
            key={text.en}
            aria-pressed={phrase === index}
            onClick={() => {
              setPhrase(index);
              setSpeechStatus(
                t(
                  copy(
                    "Sample phrase selected. Nothing was sent.",
                    "নমুনা বাক্য বাছা হয়েছে। কিছু পাঠানো হয়নি।",
                  ),
                ),
              );
            }}
          >
            <Icon size={23} aria-hidden="true" />
            <span>{t(text)}</span>
          </button>
        ))}
      </div>
      <div className="care-read-row">
        <button
          type="button"
          className="care-read-button"
          onClick={status === "playing" ? pause : status === "paused" ? resume : readAloud}
          disabled={status === "starting"}
          aria-label={t(copy(
            status === "playing" ? "Pause reading" : status === "paused" ? "Resume reading" : "Read aloud",
            status === "playing" ? "পড়া থামান" : status === "paused" ? "আবার পড়ুন" : "পড়ে শোনান",
          ))}
        >
          {status === "playing" ? <Pause size={17} aria-hidden="true" /> : status === "paused" ? <Play size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
          {t(copy(
            status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Read aloud",
            status === "playing" ? "থামান" : status === "paused" ? "আবার পড়ুন" : "পড়ে শোনান",
          ))}
        </button>
        {(status === "starting" || status === "playing" || status === "paused") && (
          <button type="button" className="care-read-button" onClick={stop}>
            <Square size={17} aria-hidden="true" />
            {t(copy("Stop", "বন্ধ করুন"))}
          </button>
        )}
        <span className="font-tag">
          {t(copy("Try it here only", "শুধু এই নমুনায়"))}
        </span>
      </div>
      <p className="care-speech-status" role="status">
        {speechStatus ||
          (phrase === null
            ? t(
                copy(
                  "Page settings stay as you chose them.",
                  "পাতার সেটিংস আপনার পছন্দমতোই থাকবে।",
                ),
              )
            : t(phrases[phrase].text))}
      </p>
    </div>
  );
}
