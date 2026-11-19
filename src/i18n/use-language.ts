"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readLocalPreferences,
  saveLocalPreferences,
  type ProhorLanguage,
} from "@/lib/access-preferences";
import { translations, type Language } from "./translations";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("prohor-preferences-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("prohor-preferences-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ProhorLanguage {
  return readLocalPreferences().language;
}

function getServerSnapshot(): ProhorLanguage {
  return "bn";
}

export function useLanguage() {
  const language: Language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setLanguage(next: ProhorLanguage) {
    const prefs = readLocalPreferences();
    const updated = { ...prefs, language: next };
    saveLocalPreferences(updated);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
    window.dispatchEvent(new CustomEvent("prohor-preferences-change", { detail: updated }));
  }

  // Stable per language: components list `t` in effect/callback deps (e.g. Shusthota's load),
  // so a new identity every render caused an endless refetch loop.
  const t = useCallback(
    <T extends { [K in Language]: string }>(textObj: T): string => textObj[language] ?? textObj.bn ?? "",
    [language],
  );

  return {
    language,
    setLanguage,
    t,
    translations,
  };
}
