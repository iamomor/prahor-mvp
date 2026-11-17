import { useEffect, useRef, useState } from "react";
import { prepareSpeechText } from "./barta-spoken-text";
import type { Language } from "./barta-education-copy";

interface Recognition {
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type AudioNotice = {
  kind: "noVoice" | "playError" | "noDictation" | "dictationError" | "micBlocked" | "micUnavailable" | "speechNetwork" | "noSpeech";
  language: Language;
  replyId?: string;
};

const speechLocale = { en: "en-GB", bn: "bn-BD" };

export function useBartaAudio() {
  const [speaking, setSpeaking] = useState<string>();
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<AudioNotice>();
  const activeSpeech = useRef<SpeechSynthesisUtterance | null>(null);
  const activeRecognition = useRef<Recognition | null>(null);
  const cancelVoiceWait = useRef<(() => void) | null>(null);
  const voiceStartupTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  useEffect(() => () => {
    cancelVoiceWait.current?.();
    window.clearTimeout(voiceStartupTimer.current);
    const speech = activeSpeech.current;
    const recognition = activeRecognition.current;
    activeSpeech.current = null;
    activeRecognition.current = null;
    if (speech) window.speechSynthesis.cancel();
    recognition?.abort();
  }, []);

  function stopSpeaking() {
    cancelVoiceWait.current?.();
    window.clearTimeout(voiceStartupTimer.current);
    if (activeSpeech.current) {
      activeSpeech.current = null;
      window.speechSynthesis.cancel();
    }
    setSpeaking(undefined);
  }

  function play(id: string, text: string, language: Language) {
    setNotice(undefined);
    const wasSpeaking = speaking === id;
    stopSpeaking();
    if (wasSpeaking) return;

    const synthesis = window.speechSynthesis;
    if (!synthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setNotice({ kind: "noVoice", language, replyId: id });
      return;
    }

    function speak(voice: SpeechSynthesisVoice) {
      const utterance = new SpeechSynthesisUtterance(prepareSpeechText(text, language));
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = language === "bn" ? 0.84 : 0.9;
      utterance.volume = 1;
      utterance.onstart = () => {
        if (activeSpeech.current === utterance) window.clearTimeout(voiceStartupTimer.current);
      };
      utterance.onend = () => {
        if (activeSpeech.current !== utterance) return;
        activeSpeech.current = null;
        window.clearTimeout(voiceStartupTimer.current);
        setSpeaking(undefined);
      };
      utterance.onerror = () => {
        if (activeSpeech.current !== utterance) return;
        activeSpeech.current = null;
        window.clearTimeout(voiceStartupTimer.current);
        setSpeaking(undefined);
        setNotice({ kind: "playError", language, replyId: id });
      };
      activeSpeech.current = utterance;
      setSpeaking(id);
      voiceStartupTimer.current = window.setTimeout(() => {
        if (activeSpeech.current !== utterance) return;
        stopSpeaking();
        setNotice({ kind: "playError", language, replyId: id });
      }, 3500);
      try {
        synthesis.speak(utterance);
      } catch {
        window.clearTimeout(voiceStartupTimer.current);
        activeSpeech.current = null;
        setSpeaking(undefined);
        setNotice({ kind: "playError", language, replyId: id });
      }
    }

    function findVoice() {
      const voices = synthesis.getVoices().filter((voice) => voice.lang.toLowerCase().split(/[-_]/u)[0] === language);
      return voices.find((voice) => voice.localService && voice.lang === speechLocale[language])
        ?? voices.find((voice) => voice.localService)
        ?? voices.find((voice) => voice.lang === speechLocale[language])
        ?? voices[0];
    }

    const voice = findVoice();
    if (voice) {
      speak(voice);
      return;
    }
    setSpeaking(id);
    const checkVoices = () => {
      const available = findVoice();
      if (!available) return;
      cancelVoiceWait.current?.();
      speak(available);
    };
    const timer = window.setTimeout(() => {
      cancelVoiceWait.current?.();
      setSpeaking(undefined);
      setNotice({ kind: "noVoice", language, replyId: id });
    }, 2000);
    cancelVoiceWait.current = () => {
      synthesis.removeEventListener("voiceschanged", checkVoices);
      window.clearTimeout(timer);
      cancelVoiceWait.current = null;
    };
    synthesis.addEventListener("voiceschanged", checkVoices);
    checkVoices();
  }

  function dictate(language: Language, noticeLanguage: Language, onText: (text: string) => void) {
    if (activeRecognition.current) {
      try {
        activeRecognition.current.stop();
      } catch {
        activeRecognition.current.onerror?.({ error: "unknown" });
      }
      return;
    }
    stopSpeaking();
    setNotice(undefined);
    const browser = window as Window & {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Recognizer = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognizer) {
      setNotice({ kind: "noDictation", language: noticeLanguage });
      return;
    }

    let recognition: Recognition;
    try {
      recognition = new Recognizer();
      recognition.lang = speechLocale[language];
    } catch {
      setNotice({ kind: "dictationError", language: noticeLanguage });
      return;
    }
    let receivedTranscript = false;
    recognition.onresult = (event) => {
      if (activeRecognition.current !== recognition || receivedTranscript) return;
      const transcript = Array.from(event.results)
        .filter((result) => result.isFinal !== false)
        .map((result) => result[0]?.transcript.trim())
        .filter(Boolean).join(" ");
      if (transcript) {
        receivedTranscript = true;
        onText(transcript);
      }
    };
    recognition.onend = () => {
      if (activeRecognition.current !== recognition) return;
      activeRecognition.current = null;
      setListening(false);
      if (!receivedTranscript) setNotice({ kind: "noSpeech", language: noticeLanguage });
    };
    recognition.onerror = (event) => {
      if (activeRecognition.current !== recognition) return;
      activeRecognition.current = null;
      setListening(false);
      const kind = event.error === "not-allowed" || event.error === "service-not-allowed" ? "micBlocked"
        : event.error === "audio-capture" ? "micUnavailable"
          : event.error === "network" ? "speechNetwork"
            : event.error === "no-speech" ? "noSpeech" : "dictationError";
      setNotice({ kind, language: noticeLanguage });
    };
    activeRecognition.current = recognition;
    try {
      setListening(true);
      recognition.start();
    } catch {
      recognition.onerror({ error: "unknown" });
    }
  }

  function resetAudio() {
    const recognition = activeRecognition.current;
    activeRecognition.current = null;
    recognition?.abort();
    setListening(false);
    stopSpeaking();
    setNotice(undefined);
  }

  return { speaking, listening, notice, play, dictate, stopSpeaking, resetAudio };
}
