"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  claimSpeech,
  ownsSpeech,
  preferredVoice,
  releaseSpeech,
  voicesForLanguage,
  type SpeechLanguage,
} from "../lib/speech-engine";

export type { SpeechLanguage } from "../lib/speech-engine";

export type SpeechStatus =
  | "loading"
  | "ready"
  | "starting"
  | "playing"
  | "paused"
  | "completed"
  | "voice-unavailable"
  | "unsupported"
  | "failed";

const VOICE_DISCOVERY_TIMEOUT_MS = 1800;
const subscribeSpeechSupport = () => () => {};
const getSpeechSupport = () => typeof window !== "undefined"
  && Boolean(window.speechSynthesis)
  && typeof SpeechSynthesisUtterance !== "undefined";
const getServerSpeechSupport = () => true;

export function useSpeechSynthesis(text: string, language: SpeechLanguage) {
  const pathname = usePathname();
  const supported = useSyncExternalStore(subscribeSpeechSupport, getSpeechSupport, getServerSpeechSupport);
  const [status, setStatus] = useState<SpeechStatus>("loading");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ownerId = useRef(Symbol("prohor-speech-owner"));
  const requestId = useRef(0);
  const stopSpeechRef = useRef<(announce?: boolean) => void>(() => {});
  const previousPathname = useRef(pathname);

  const matchingVoices = useMemo(
    () => voicesForLanguage(voices, language),
    [voices, language],
  );
  const selectedVoice = matchingVoices.find((voice) => voice.voiceURI === selectedVoiceURI)
    ?? preferredVoice(matchingVoices, language);
  const voicesAreLoaded = !supported || voicesLoaded;
  const visibleStatus: SpeechStatus = !supported
    ? "unsupported"
    : voicesAreLoaded && matchingVoices.length === 0 && ["ready", "voice-unavailable", "completed", "failed"].includes(status)
      ? "voice-unavailable"
      : status === "voice-unavailable" && matchingVoices.length > 0
        ? "ready"
        : status;

  useEffect(() => {
    if (!supported) return;

    const synthesis = window.speechSynthesis;
    // The server snapshot intentionally assumes support for hydration. A browser
    // without the API can briefly run this effect before the client snapshot
    // updates, so guard the actual API independently of that snapshot.
    if (!synthesis || typeof synthesis.getVoices !== "function") return;
    synthesisRef.current = synthesis;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const refreshVoices = () => {
      const nextVoices = synthesis.getVoices();
      setVoices(nextVoices);
      if (nextVoices.length > 0) {
        setVoicesLoaded(true);
        setStatus((current) => current === "loading" ? "ready" : current);
        if (timeoutId) clearTimeout(timeoutId);
      } else {
        setStatus((current) => current === "loading" ? "loading" : "ready");
      }
    };

    refreshVoices();
    if (synthesis.getVoices().length === 0) {
      timeoutId = setTimeout(() => {
        setVoices(synthesis.getVoices());
        setVoicesLoaded(true);
        setStatus((current) => current === "loading" ? "ready" : current);
      }, VOICE_DISCOVERY_TIMEOUT_MS);
    }

    synthesis.addEventListener("voiceschanged", refreshVoices);
    return () => {
      synthesis.removeEventListener("voiceschanged", refreshVoices);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [supported]);

  const stopOwnedSpeech = useCallback((announce = true) => {
    const synthesis = synthesisRef.current;
    const utterance = utteranceRef.current;
    requestId.current += 1;
    utteranceRef.current = null;

    if (synthesis && utterance && ownsSpeech(ownerId.current)) {
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      synthesis.cancel();
      releaseSpeech(ownerId.current);
    }

    if (announce) {
      setStatus(voicesForLanguage(voices, language).length > 0 ? "ready" : "voice-unavailable");
    }
  }, [language, voices]);

  useEffect(() => {
    stopSpeechRef.current = stopOwnedSpeech;
  }, [stopOwnedSpeech]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      stopSpeechRef.current(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handlePageHide = () => stopSpeechRef.current(false);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      stopSpeechRef.current(false);
    };
  }, []);

  const start = useCallback(() => {
    const synthesis = synthesisRef.current;
    if (!synthesis || !voicesLoaded || !matchingVoices.length || !text.trim()) {
      if (voicesLoaded && matchingVoices.length === 0) setStatus("voice-unavailable");
      return;
    }

    stopOwnedSpeech(false);
    const voice = matchingVoices.find((candidate) => candidate.voiceURI === selectedVoice?.voiceURI)
      ?? preferredVoice(matchingVoices, language);
    if (!voice) {
      setStatus("voice-unavailable");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const thisRequest = requestId.current;
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.onstart = () => {
      if (requestId.current === thisRequest) setStatus("playing");
    };
    utterance.onend = () => {
      if (requestId.current !== thisRequest) return;
      utteranceRef.current = null;
      releaseSpeech(ownerId.current);
      setStatus("completed");
    };
    utterance.onerror = (event) => {
      if (requestId.current !== thisRequest) return;
      utteranceRef.current = null;
      releaseSpeech(ownerId.current);
      setStatus(event.error === "interrupted" || event.error === "canceled" ? "ready" : "failed");
    };

    utteranceRef.current = utterance;
    claimSpeech({
      id: ownerId.current,
      stop: () => stopOwnedSpeech(true),
    });
    try {
      synthesis.speak(utterance);
      setStatus(synthesis.speaking ? "playing" : "starting");
    } catch {
      utteranceRef.current = null;
      releaseSpeech(ownerId.current);
      setStatus("failed");
    }
  }, [language, matchingVoices, rate, selectedVoice, stopOwnedSpeech, text, voicesLoaded]);

  const pause = useCallback(() => {
    const synthesis = synthesisRef.current;
    if (synthesis && ownsSpeech(ownerId.current) && synthesis.speaking && !synthesis.paused) {
      synthesis.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback(() => {
    const synthesis = synthesisRef.current;
    if (synthesis && ownsSpeech(ownerId.current) && synthesis.paused) {
      synthesis.resume();
      setStatus("playing");
    }
  }, []);

  const stop = useCallback(() => stopOwnedSpeech(true), [stopOwnedSpeech]);

  useEffect(() => () => stopSpeechRef.current(false), [text, language, pathname]);

  return {
    status: visibleStatus,
    voicesLoaded: voicesAreLoaded,
    matchingVoices,
    selectedVoice,
    selectedVoiceURI,
    setSelectedVoiceURI,
    rate,
    setRate,
    start,
    pause,
    resume,
    stop,
  };
}
