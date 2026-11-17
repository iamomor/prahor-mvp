"use client";

import { useSyncExternalStore } from "react";
import {
  readLocalPreferences,
  saveLocalPreferences,
  type ProhorLanguage,
} from "@/lib/access-preferences";
import { translations, type Language } from "./translations";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== "prohor-access-preferences-v1") return;
    document.documentElement.lang = readLocalPreferences().language;
    callback();
  };
  window.addEventListener("prohor-preferences-change", callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("prohor-preferences-change", callback);
    window.removeEventListener("storage", handleStorage);
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

  function t<T extends { [K in Language]: string }>(textObj: T): string {
    return textObj[language] ?? textObj.bn ?? "";
  }

  return {
    language,
    setLanguage,
    t,
    translations,
  };
}
