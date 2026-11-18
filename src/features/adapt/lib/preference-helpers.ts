/**
 * Preference helpers — apply preferences to the DOM and dispatch a change event
 * so all subscribers (useAdaptPreferences, useLanguage) stay in sync.
 *
 * Keep this file server-safe: guard all DOM access with `typeof document`.
 */
import {
  applyPreferences,
  readLocalPreferences,
  type ProhorAccessPreferences,
} from "@/lib/access-preferences";
import {
  DEFAULT_READING_PREFERENCES,
  type ReadingPreferences,
  READING_PREFS_KEY,
} from "../types/adapt.types";

/** Applies access preferences AND reading preferences to the HTML root element. */
export function applyAllPreferences(
  prefs: ProhorAccessPreferences,
  reading?: ReadingPreferences,
): void {
  applyPreferences(prefs);
  if (reading && typeof document !== "undefined") {
    const html = document.documentElement;
    html.dataset.font = reading.font;
    html.dataset.textSpacing = reading.textSpacing;
    // Layout density is canonically stored with the shared access preferences.
    html.dataset.layout = prefs.layoutDensity;
  }
}

/** Dispatch a custom event so all useSyncExternalStore consumers re-read prefs. */
export function dispatchPreferenceChange(prefs: ProhorAccessPreferences): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("prohor-preferences-change", { detail: prefs }),
  );
}

/**
 * Dispatch a custom event so ReadingPreferences useSyncExternalStore consumers
 * re-read without waking the access-prefs store.
 * FIX (Phase 0): Previously, updateReading only dispatched "prohor-preferences-change",
 * which woke the access-prefs snapshot even when only reading prefs changed.
 */
export function dispatchReadingChange(reading: ReadingPreferences): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("prohor-reading-change", { detail: reading }),
  );
}

/** Read typography/spacing from the reading store and density from Adapt. */
export function readReadingPreferences(): ReadingPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_READING_PREFERENCES;
  }
  if (transientReading) {
    const density = readLocalPreferences().layoutDensity;
    if (transientReading.density !== density) transientReading = { ...transientReading, density };
    return transientReading;
  }
  try {
    const storedValue = localStorage.getItem(READING_PREFS_KEY);
    const layoutDensity = readLocalPreferences().layoutDensity;
    const snapshotKey = `${storedValue ?? "<unset>"}\u0000${layoutDensity}`;
    if (snapshotKey === lastReadingSnapshotKey) return lastReadingSnapshot;

    const value = JSON.parse(storedValue ?? "null");
    lastReadingSnapshotKey = snapshotKey;
    lastReadingSnapshot = {
      font: ["default", "rubik", "noto-serif", "roboto-slab"].includes(value?.font)
        ? value.font
        : "default",
      textSpacing:
        value?.textSpacing === "relaxed" ? "relaxed" : "standard",
      density: layoutDensity,
    };
    return lastReadingSnapshot;
  } catch {
    lastReadingSnapshotKey = undefined;
    lastReadingSnapshot = DEFAULT_READING_PREFERENCES;
    return lastReadingSnapshot;
  }
}

let lastReadingSnapshotKey: string | null | undefined;
let lastReadingSnapshot: ReadingPreferences = DEFAULT_READING_PREFERENCES;
let transientReading: ReadingPreferences | null = null;
export const readingPreferencesAreDurable = () => transientReading === null;

/** Save reading preferences to localStorage. */
export function saveReadingPreferences(reading: ReadingPreferences): void {
  if (typeof window === "undefined") return;
  try {
    // density is compatibility data now owned by the access preference store.
    const storedValue = JSON.stringify({ font: reading.font, textSpacing: reading.textSpacing });
    localStorage.setItem(READING_PREFS_KEY, storedValue);
    transientReading = null;
    const layoutDensity = readLocalPreferences().layoutDensity;
    lastReadingSnapshotKey = `${storedValue}\u0000${layoutDensity}`;
    lastReadingSnapshot = { ...reading, density: layoutDensity };
  } catch {
    transientReading = { ...reading };
    lastReadingSnapshot = transientReading;
  }
}
