"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { claimAudioSession, ownsAudioSession, releaseAudioSession } from "@/lib/audio-session";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";

export function useSampleSpeech(text: string) {
  const { t, locale } = useHome();
  const [speechStatus, setSpeechStatus] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const owner = useRef(Symbol("homepage-sample"));
  const stop = useCallback(() => {
      if (utterance.current) {
        utterance.current.onend = null;
        utterance.current.onerror = null;
        if (ownsAudioSession(owner.current)) window.speechSynthesis?.cancel();
        utterance.current = null;
      }
      releaseAudioSession(owner.current);
  }, []);
  useEffect(() => () => stop(), [stop]);

  function readAloud() {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechStatus(
        t(
          copy(
            "Read aloud is unavailable in this browser. The text is here to read.",
            "এই ব্রাউজারে পড়ে শোনানো যায় না। লেখাটি এখানেই পড়তে পারবেন।",
          ),
        ),
      );
      return;
    }
    stop();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = locale === "bn" ? "bn-BD" : "en-GB";
    if (
      locale === "bn" &&
      !window.speechSynthesis
        .getVoices()
        .some((voice) => voice.lang.startsWith("bn"))
    ) {
      setSpeechStatus("বাংলা কণ্ঠ পাওয়া যায়নি। লেখাটি এখানেই পড়তে পারবেন।");
      return;
    }
    speech.onend = () => {
      utterance.current = null;
      releaseAudioSession(owner.current);
      setSpeechStatus(
        t(
          copy(
            "Finished reading. Nothing was sent.",
            "পড়া শেষ। কিছু পাঠানো হয়নি।",
          ),
        ),
      );
    };
    speech.onerror = () => {
      utterance.current = null;
      releaseAudioSession(owner.current);
      setSpeechStatus(
        t(
          copy(
            "Read aloud could not finish. The text is here to read.",
            "পড়ে শোনানো শেষ হয়নি। লেখাটি এখানেই পড়তে পারবেন।",
          ),
        ),
      );
    };
    claimAudioSession({ id: owner.current, stop: () => { stop(); setSpeechStatus("Playback stopped. The text remains available."); } });
    utterance.current = speech;
    setSpeechStatus(
      t(
        copy(
          "Reading this sample aloud. Nothing is sent.",
          "নমুনাটি পড়ে শোনানো হচ্ছে। কিছু পাঠানো হচ্ছে না।",
        ),
      ),
    );
    window.speechSynthesis.speak(speech);
  }

  return { speechStatus, setSpeechStatus, readAloud };
}
