"use client";

/**
 * ReadAloudButton — P1 prototype for text-to-speech read-aloud.
 *
 * Status: PROTOTYPE — uses browser Web Speech API if available.
 * Explicitly labels limitations when TTS is unavailable or language not supported.
 *
 * Rules:
 * - User must explicitly start reading (no autoplay).
 * - Stop/pause control always visible while reading.
 * - Respects the current language preference.
 * - Does not interfere with screen reader speech (uses SpeechSynthesis only).
 * - Honestly discloses when TTS or the selected language is not supported.
 */
import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";

type ReadAloudButtonProps = {
  /** The text content to read aloud. */
  text: string;
  /** Label for the button (e.g. "Read this section aloud"). */
  label?: string;
  className?: string;
};

type TtsState = "idle" | "reading" | "paused" | "unsupported" | "unavailable";

export function ReadAloudButton({
  text,
  label = "Read aloud",
  className = "",
}: ReadAloudButtonProps) {
  const { prefs } = useAdaptPreferences();
  // Lazy initialiser avoids a synchronous setState inside a useEffect
  const [state, setState] = useState<TtsState>(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) return "unsupported";
    return "idle";
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Stop reading when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startReading = useCallback(() => {
    if (state === "unsupported") return;
    if (!("speechSynthesis" in window)) {
      setState("unsupported");
      return;
    }

    window.speechSynthesis.cancel(); // Clear any queued speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = prefs.language === "bn" ? "bn-BD" : "en-US";

    // Check if any voices are available for the selected language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.startsWith(prefs.language === "bn" ? "bn" : "en") ||
        v.lang.startsWith(prefs.language === "bn" ? "BN" : "EN"),
    );

    if (!matchingVoice && voices.length > 0 && prefs.language === "bn") {
      setErrorMsg(
        "Bangla text-to-speech is not available in this browser. English speech may be used instead.",
      );
    } else {
      setErrorMsg("");
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setState("reading");
    utterance.onend = () => setState("idle");
    utterance.onerror = (e) => {
      setState("idle");
      if (e.error !== "interrupted") {
        setErrorMsg("Speech could not be started. Please try again.");
      }
    };

    window.speechSynthesis.speak(utterance);
    setState("reading");
  }, [text, prefs.language, state]);

  const stopReading = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  }, []);

  if (state === "unsupported") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-pro-muted ${className}`}>
        <VolumeX size={14} aria-hidden="true" />
        <span>Read-aloud not available in this browser</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="inline-flex gap-2">
        {state !== "reading" ? (
          <AppButton variant="ghost" size="sm" onClick={startReading}>
            <Volume2 size={15} aria-hidden="true" />
            {label}
          </AppButton>
        ) : (
          <AppButton variant="ghost" size="sm" onClick={stopReading}>
            <Square size={15} aria-hidden="true" />
            Stop reading
          </AppButton>
        )}
      </div>
      {errorMsg && (
        <p className="text-xs text-pro-warning" role="status">
          {errorMsg}
        </p>
      )}
      <p className="text-xs text-pro-muted">
        🔵 Prototype — Read-aloud uses browser speech synthesis.
      </p>
    </div>
  );
}
