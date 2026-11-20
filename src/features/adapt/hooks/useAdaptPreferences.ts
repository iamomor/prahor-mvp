"use client";

/**
 * useAdaptPreferences — the single authoritative preference hook.
 *
 * Uses useSyncExternalStore so every component sees the same value
 * without a React context provider. Any update (from any panel, any tab)
 * dispatches a "prohor-preferences-change" event that triggers a re-render.
 *
 * Safe to call in Server Components — returns default prefs during SSR.
 *
 * FIX (Phase 0): Separate subscribe functions for the two stores so that a
 * ReadingPreferences event does not wake the ProhorAccessPreferences snapshot
 * and vice-versa. Sharing one subscribe across two useSyncExternalStore calls
 * caused both snapshots to be re-evaluated on every event; if either returned
 * a new object reference React scheduled a follow-up render, which under
 * React Strict Mode (double-invocation) could cascade into a Max Update Depth
 * error at the /app/adapt route where both stores are written simultaneously.
 */
import { useSyncExternalStore, useCallback } from "react";
import {
  ACCESS_PREFERENCES_KEY,
  DEFAULT_PROHOR_PREFERENCES,
  readLocalPreferences,
  saveLocalPreferences,
  type ProhorAccessPreferences,
} from "@/lib/access-preferences";
import {
  applyAllPreferences,
  dispatchPreferenceChange,
  dispatchReadingChange,
  readReadingPreferences,
  saveReadingPreferences,
} from "../lib/preference-helpers";
import {
  type ReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  READING_PREFS_KEY,
} from "../types/adapt.types";

/* ── External store A: ProhorAccessPreferences ───────────────── */

/** Only wakes on "prohor-preferences-change" and cross-tab storage for ACCESS_PREFERENCES_KEY. */
function subscribeAccess(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== ACCESS_PREFERENCES_KEY && event.key !== READING_PREFS_KEY) return;
    applyAllPreferences(readLocalPreferences(), readReadingPreferences());
    callback();
  };

  window.addEventListener("prohor-preferences-change", callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("prohor-preferences-change", callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): ProhorAccessPreferences {
  return readLocalPreferences();
}

function getServerSnapshot(): ProhorAccessPreferences {
  return DEFAULT_PROHOR_PREFERENCES;
}

/* ── External store B: ReadingPreferences ────────────────────── */

/** Only wakes on "prohor-reading-change" and cross-tab storage for READING_PREFS_KEY. */
function subscribeReading(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== READING_PREFS_KEY && event.key !== ACCESS_PREFERENCES_KEY) return;
    applyAllPreferences(readLocalPreferences(), readReadingPreferences());
    callback();
  };

  window.addEventListener("prohor-reading-change", callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("prohor-reading-change", callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getReadingSnapshot(): ReadingPreferences {
  return readReadingPreferences();
}

function getReadingServerSnapshot(): ReadingPreferences {
  return DEFAULT_READING_PREFERENCES;
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useAdaptPreferences() {
  // FIX: Use separate subscribe functions for each store so a reading-prefs
  // event does not wake the access-prefs snapshot and vice-versa.
  // Previously both useSyncExternalStore calls shared one subscribe function;
  // any event woke both snapshots, and if either returned a new object
  // reference React scheduled another render — cascading into the
  // "Maximum update depth exceeded" error at /app/adapt under React Strict Mode.
  const prefs = useSyncExternalStore(
    subscribeAccess,
    getSnapshot,
    getServerSnapshot,
  );

  const reading = useSyncExternalStore(
    subscribeReading,
    getReadingSnapshot,
    getReadingServerSnapshot,
  );

  /** Update a single access preference field. */
  const updatePref = useCallback(
    <K extends keyof ProhorAccessPreferences>(
      key: K,
      value: ProhorAccessPreferences[K],
    ) => {
      const next = { ...readLocalPreferences(), [key]: value };
      if (key === "spaciousLayout") {
        const layoutDensity: ReadingPreferences["density"] = (value as boolean)
          ? "spacious"
          : "comfortable";
        const compatibleNext = {
          ...readLocalPreferences(),
          layoutDensity,
          spaciousLayout: layoutDensity === "spacious",
        };
        saveLocalPreferences(compatibleNext);
        const nextReading: ReadingPreferences = { ...readReadingPreferences(), density: layoutDensity };
        applyAllPreferences(compatibleNext, nextReading);
        dispatchPreferenceChange(compatibleNext);
        dispatchReadingChange(nextReading);
        return;
      }
      saveLocalPreferences(next);
      applyAllPreferences(next, readReadingPreferences());
      dispatchPreferenceChange(next);
    },
    [],
  );

  /** Update all access preferences at once. */
  const setPrefs = useCallback((next: ProhorAccessPreferences) => {
    saveLocalPreferences(next);
    applyAllPreferences(next, readReadingPreferences());
    dispatchPreferenceChange(next);
  }, []);

  /** Update a single reading preference field. */
  const updateReading = useCallback(
    <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => {
      const next = { ...readReadingPreferences(), [key]: value };
      const currentPrefs = readLocalPreferences();
      const nextPrefs: ProhorAccessPreferences = key === "density"
        ? {
            ...currentPrefs,
            layoutDensity: value as ReadingPreferences["density"],
            spaciousLayout: value === "spacious",
          }
        : currentPrefs;
      // Every preference write upgrades legacy records to the canonical store.
      saveLocalPreferences(nextPrefs);
      saveReadingPreferences(next);
      applyAllPreferences(nextPrefs, next);
      dispatchPreferenceChange(nextPrefs);
      dispatchReadingChange(next);
    },
    [],
  );

  /** Reset all preferences to defaults. */
  const resetAll = useCallback(() => {
    saveLocalPreferences(DEFAULT_PROHOR_PREFERENCES);
    saveReadingPreferences(DEFAULT_READING_PREFERENCES);
    applyAllPreferences(DEFAULT_PROHOR_PREFERENCES, DEFAULT_READING_PREFERENCES);
    // Wake both stores.
    dispatchPreferenceChange(DEFAULT_PROHOR_PREFERENCES);
    dispatchReadingChange(DEFAULT_READING_PREFERENCES);
  }, []);

  return {
    prefs,
    reading,
    updatePref,
    setPrefs,
    updateReading,
    resetAll,
  };
}
