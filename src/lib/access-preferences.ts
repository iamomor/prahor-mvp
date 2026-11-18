/** Optional presentation preferences. NOT diagnostic, clinical, or consent data. */
export const themeIds = ["quiet-garden", "original-rose", "morning-mist"] as const;
export type ProhorTheme = (typeof themeIds)[number];
export type ProhorTextScale = "default" | "large" | "extra-large";
export type ProhorCommunication = "text" | "aac";
export type ProhorLanguage = "bn" | "en";
export type ProhorLayoutDensity = "comfortable" | "compact" | "spacious";

export type ProhorAccessPreferences = {
  theme: ProhorTheme;
  /** true = more, false = explicit standard, null = follow the OS. */
  highContrast: boolean | null;
  textScale: ProhorTextScale;
  layoutDensity: ProhorLayoutDensity;
  /** @deprecated Compatibility alias derived from layoutDensity. */
  spaciousLayout: boolean;
  reducedMotion: boolean;
  simplifiedContent: boolean;
  communication: ProhorCommunication;
  language: ProhorLanguage;
  /** P1: Focused/reduced-distraction view — hides non-essential decorative elements. */
  focusedView: boolean;
};

export const DEFAULT_PROHOR_PREFERENCES: ProhorAccessPreferences = {
  theme: "quiet-garden",
  highContrast: null,
  textScale: "default",
  layoutDensity: "comfortable",
  spaciousLayout: false,
  reducedMotion: false,
  simplifiedContent: false,
  communication: "text",
  language: "bn",
  focusedView: false,
};

export const ACCESS_PREFERENCES_KEY = "prohor-access-preferences-v1";
export const READING_PREFERENCES_KEY = "prohor-home-reading-v1";
const KEY = ACCESS_PREFERENCES_KEY;
const PREFERENCES_SCHEMA_VERSION = 3;
let lastSnapshotKey: string | null | undefined;
let lastSnapshot = DEFAULT_PROHOR_PREFERENCES;
// Browser-only fallback when storage is blocked or a write exceeds quota.
// Server reads always return defaults; account preferences never live here.
let transientPreferences: ProhorAccessPreferences | null = null;
const isTheme = (v: unknown): v is ProhorTheme => themeIds.includes(v as ProhorTheme);
const isTextScale = (v: unknown): v is ProhorTextScale =>
  v === "default" || v === "large" || v === "extra-large";
const isLayoutDensity = (v: unknown): v is ProhorLayoutDensity =>
  v === "comfortable" || v === "compact" || v === "spacious";

/** Validate local data rather than trusting arbitrary JSON as settings. */
export function sanitizePreferences(value: unknown): ProhorAccessPreferences {
  const v = typeof value === "object" && value !== null
    ? value as Partial<ProhorAccessPreferences> & { _schemaVersion?: number }
    : {};
  // Version 1 stored false as the default, so it cannot prove that a person
  // explicitly chose standard contrast. Preserve an explicit legacy `true`;
  // migrate legacy `false` to system-following until the person chooses again.
  const highContrast = typeof v._schemaVersion === "number" && v._schemaVersion >= 2
    ? (typeof v.highContrast === "boolean" ? v.highContrast : null)
    : (v.highContrast === true ? true : null);
  const layoutDensity = isLayoutDensity(v.layoutDensity)
    ? v.layoutDensity
    : v.spaciousLayout === true
      ? "spacious"
      : "comfortable";
  return {
    theme: isTheme(v.theme) ? v.theme : DEFAULT_PROHOR_PREFERENCES.theme,
    highContrast,
    textScale: isTextScale(v.textScale) ? v.textScale : "default",
    layoutDensity,
    spaciousLayout: layoutDensity === "spacious",
    reducedMotion: typeof v.reducedMotion === "boolean" ? v.reducedMotion : false,
    simplifiedContent: typeof v.simplifiedContent === "boolean" ? v.simplifiedContent : false,
    communication: v.communication === "aac" ? "aac" : "text",
    language: v.language === "en" ? "en" : "bn",
    focusedView: typeof v.focusedView === "boolean" ? v.focusedView : false,
  };
}

export function readLocalPreferences(): ProhorAccessPreferences {
  if (typeof window === "undefined") return DEFAULT_PROHOR_PREFERENCES;
  if (transientPreferences) return { ...transientPreferences };
  try {
    const storedValue = localStorage.getItem(KEY);
    let legacyReadingDensity: ProhorLayoutDensity | null = null;
    try {
      const legacyReadingValue = JSON.parse(localStorage.getItem(READING_PREFERENCES_KEY) ?? "null");
      if (isLayoutDensity(legacyReadingValue?.density)) {
        legacyReadingDensity = legacyReadingValue.density;
      }
    } catch {
      // Invalid legacy reading data is ignored and the access value/default is used.
    }
    const snapshotKey = `${storedValue ?? "<unset>"}\u0000${legacyReadingDensity ?? "<unset>"}`;
    if (snapshotKey === lastSnapshotKey) return lastSnapshot;

    const storedPreferences = JSON.parse(storedValue ?? "null") as
      | (Partial<ProhorAccessPreferences> & { _schemaVersion?: number })
      | null;
    lastSnapshotKey = snapshotKey;
    lastSnapshot = sanitizePreferences(storedPreferences);
    // Migrate legacy density from the reading store when the access store has
    // not yet recorded a canonical layoutDensity. New writes use only the
    // access store, while this read path preserves existing saved choices.
    if (!isLayoutDensity(storedPreferences?.layoutDensity) && legacyReadingDensity) {
      lastSnapshot = {
        ...lastSnapshot,
        layoutDensity: legacyReadingDensity,
        spaciousLayout: legacyReadingDensity === "spacious",
      };
    }
    return lastSnapshot;
  } catch {
    if (transientPreferences) return { ...transientPreferences };
    // Keep the fallback referentially stable for useSyncExternalStore.
    lastSnapshotKey = undefined;
    lastSnapshot = DEFAULT_PROHOR_PREFERENCES;
    return lastSnapshot;
  }
}

/** Do not call this from server rendering or an effect that would override an SSR data-bound form. */
export function applyPreferences(preferences: ProhorAccessPreferences): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = preferences.theme;
  if (preferences.highContrast === true) {
    html.dataset.contrast = "more";
  } else if (preferences.highContrast === false) {
    // Explicit standard must override the OS's prefers-contrast: more signal.
    html.dataset.contrast = "standard";
  } else if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-contrast: more)").matches) {
    html.dataset.contrast = "more";
  } else {
    delete html.dataset.contrast;
  }
  if (preferences.textScale && preferences.textScale !== "default") {
    html.dataset.textScale = preferences.textScale;
  } else {
    delete html.dataset.textScale;
  }
  html.dataset.layout = preferences.layoutDensity;
  if (preferences.reducedMotion) {
    html.dataset.motion = "reduce";
  } else {
    delete html.dataset.motion;
  }
  // P1: Focused view — reduces decorative elements and non-essential distractions.
  if (preferences.focusedView) {
    html.dataset.focused = "true";
  } else {
    delete html.dataset.focused;
  }
  // IMPORTANT: Do not flip html.lang until the actual page copy is translated by i18n.
  // Communication choices belong to component interaction, not global automatic text rewrites.
}

export function saveLocalPreferences(preferences: ProhorAccessPreferences): void {
  if (typeof window === "undefined") return;
  const sanitized = {
    ...sanitizePreferences(preferences),
    // This is a current typed in-memory value, not an unversioned legacy
    // record. In particular, preserve `false` as explicit standard contrast.
    highContrast: preferences.highContrast,
  };
  const canonicalPreferences: Partial<ProhorAccessPreferences> = { ...sanitized };
  delete canonicalPreferences.spaciousLayout;
  const storedValue = JSON.stringify({
    ...canonicalPreferences,
    _schemaVersion: PREFERENCES_SCHEMA_VERSION,
  });
  try {
    localStorage.setItem(KEY, storedValue);
    transientPreferences = null;
    lastSnapshotKey = `${storedValue}\u0000<unset>`;
    lastSnapshot = sanitized;
  } catch {
    // Storage may be unavailable, blocked, or quota-exceeded; continue with in-memory transient preferences.
    transientPreferences = sanitized;
    lastSnapshot = sanitized;
  }
}
