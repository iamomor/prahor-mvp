"use client";
import { useEffect } from "react";
import { accountPreferences } from "../lib/account-runtime";
import { applyAllPreferences, readReadingPreferences } from "../lib/preference-helpers";
import { ACCESS_PREFERENCES_KEY, READING_PREFERENCES_KEY, readLocalPreferences } from "@/lib/access-preferences";

/** One account lifecycle for all settings views; no browser-readable auth token. Mounted once in the layout. */
export function PreferenceRuntime() {
  useEffect(() => {
    applyAllPreferences(readLocalPreferences(), readReadingPreferences());
    void accountPreferences.refresh();
    const refresh = () => { void accountPreferences.refresh(); };
    const changed = () => accountPreferences.deviceChanged();
    // Another tab changed settings: show them here too, but only mark the account as different — never auto-save.
    const storage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== ACCESS_PREFERENCES_KEY && event.key !== READING_PREFERENCES_KEY) return;
      applyAllPreferences(readLocalPreferences(), readReadingPreferences());
      changed();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("prohor-preferences-change", changed);
    window.addEventListener("prohor-reading-change", changed);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("prohor-preferences-change", changed);
      window.removeEventListener("prohor-reading-change", changed);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return null;
}
