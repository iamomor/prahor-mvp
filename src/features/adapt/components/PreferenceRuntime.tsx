"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { accountPreferences } from "../lib/account-runtime";
import { applyAllPreferences, readReadingPreferences } from "../lib/preference-helpers";
import { readLocalPreferences } from "@/lib/access-preferences";

/** One account lifecycle for all settings views; no browser-readable auth token. */
export function PreferenceRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    applyAllPreferences(readLocalPreferences(), readReadingPreferences());
    void accountPreferences.refresh();
    const refresh = () => { void accountPreferences.refresh(); };
    const changed = () => accountPreferences.deviceChanged();
    window.addEventListener("focus", refresh);
    window.addEventListener("prohor-preferences-change", changed);
    window.addEventListener("prohor-reading-change", changed);
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("prohor-preferences-change", changed);
      window.removeEventListener("prohor-reading-change", changed);
      window.removeEventListener("storage", changed);
    };
  }, [pathname]);
  return null;
}
