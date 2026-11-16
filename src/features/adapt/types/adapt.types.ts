/**
 * Adapt module types.
 * Re-exports from the shared lib so the rest of the app imports from one place.
 * Do NOT import directly from src/lib/access-preferences in feature components —
 * use this file or the index barrel instead.
 */
import { READING_PREFERENCES_KEY } from "@/lib/access-preferences";

export {
  themeIds,
  DEFAULT_PROHOR_PREFERENCES,
  sanitizePreferences,
  readLocalPreferences,
  saveLocalPreferences,
  applyPreferences,
  READING_PREFERENCES_KEY,
} from "@/lib/access-preferences";

export type {
  ProhorTheme,
  ProhorTextScale,
  ProhorCommunication,
  ProhorLanguage,
  ProhorLayoutDensity,
  ProhorAccessPreferences,
} from "@/lib/access-preferences";

/** Reading sub-preferences (font, text spacing, layout density).
 *  Stored separately so they can be applied before auth. */
export type ReadingPreferences = {
  font: "default" | "rubik" | "noto-serif" | "roboto-slab";
  textSpacing: "standard" | "relaxed";
  density: "comfortable" | "compact" | "spacious";
};

export const READING_PREFS_KEY = READING_PREFERENCES_KEY;

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  font: "default",
  textSpacing: "standard",
  density: "comfortable",
};
