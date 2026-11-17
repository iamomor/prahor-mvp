"use client";

import { useState } from "react";
import { useSpeechSynthesis } from "@/features/adapt/hooks/useSpeechSynthesis";
import type { SpeechLanguage } from "@/features/adapt/hooks/useSpeechSynthesis";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";

export function useSampleSpeech(text: string) {
  const { t, locale } = useHome();
  const speech = useSpeechSynthesis(text, locale as SpeechLanguage);
  const [notice, setNotice] = useState("");

  const messages = {
    loading: copy("Loading available voices…", "উপলভ্য কণ্ঠ খোঁজা হচ্ছে…"),
    ready: copy("Ready. The sample text remains visible.", "প্রস্তুত। নমুনার লেখাটি দেখার জন্য এখানেই আছে।"),
    starting: copy("Starting playback…", "পড়া শুরু হচ্ছে…"),
    playing: copy("Reading this sample aloud. Nothing is sent.", "নমুনাটি পড়ে শোনানো হচ্ছে। কিছু পাঠানো হচ্ছে না।"),
    paused: copy("Reading paused. Nothing is sent.", "পড়া থামানো হয়েছে। কিছু পাঠানো হয়নি।"),
    completed: copy("Finished reading. Nothing was sent.", "পড়া শেষ। কিছু পাঠানো হয়নি।"),
    "voice-unavailable": copy("A matching voice is unavailable on this device. The text remains visible.", "এই ডিভাইসে মেলার মতো কণ্ঠ নেই। লেখাটি দেখার জন্য এখানেই আছে।"),
    unsupported: copy("Read aloud is unavailable in this browser. The text is here to read.", "এই ব্রাউজারে পড়ে শোনানো যায় না। লেখাটি এখানেই পড়তে পারবেন।"),
    failed: copy("Read aloud could not finish. The text is here to read.", "পড়ে শোনানো শেষ হয়নি। লেখাটি এখানেই পড়তে পারবেন।"),
  } as const;

  function readAloud() {
    setNotice("");
    speech.start();
  }

  function setSpeechStatus(message: string) {
    setNotice(message);
  }

  return {
    speechStatus: notice || t(messages[speech.status]),
    setSpeechStatus,
    readAloud,
    pause: speech.pause,
    resume: speech.resume,
    stop: speech.stop,
    status: speech.status,
  };
}
