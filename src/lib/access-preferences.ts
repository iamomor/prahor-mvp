/** Optional presentation preferences. NOT diagnostic, clinical, or consent data. */
export const themeIds = ["quiet-garden", "original-rose", "morning-mist"] as const;
export type ProhorTheme = (typeof themeIds)[number];
export type ProhorTextScale = "default" | "large" | "extra-large";
export type ProhorCommunication = "text" | "aac";
export type ProhorLanguage = "bn" | "en";

export type ProhorAccessPreferences = {
  theme: ProhorTheme;
  highContrast: boolean;
  textScale: ProhorTextScale;
  spaciousLayout: boolean;
  reducedMotion: boolean;
  simplifiedContent: boolean;
  communication: ProhorCommunication;
  language: ProhorLanguage;
};

export const DEFAULT_PROHOR_PREFERENCES: ProhorAccessPreferences = {
  theme: "quiet-garden",
  highContrast: false,
  textScale: "default",
  spaciousLayout: false,
  reducedMotion: false,
  simplifiedContent: false,
  communication: "text",
  language: "bn",
};

const KEY = "prohor-access-preferences-v1";
const isTheme = (v: unknown): v is ProhorTheme => themeIds.includes(v as ProhorTheme);
const isTextScale = (v: unknown): v is ProhorTextScale =>
  v === "default" || v === "large" || v === "extra-large";

/** Validate local data rather than trusting arbitrary JSON as settings. */
export function sanitizePreferences(value: unknown): ProhorAccessPreferences {
  const v = typeof value === "object" && value !== null ? value as Partial<ProhorAccessPreferences> : {};
  return {
    theme: isTheme(v.theme) ? v.theme : DEFAULT_PROHOR_PREFERENCES.theme,
    highContrast: typeof v.highContrast === "boolean" ? v.highContrast : false,
    textScale: isTextScale(v.textScale) ? v.textScale : "default",
    spaciousLayout: typeof v.spaciousLayout === "boolean" ? v.spaciousLayout : false,
    reducedMotion: typeof v.reducedMotion === "boolean" ? v.reducedMotion : false,
    simplifiedContent: typeof v.simplifiedContent === "boolean" ? v.simplifiedContent : false,
    communication: v.communication === "aac" ? "aac" : "text",
    language: v.language === "en" ? "en" : "bn",
  };
}

export function readLocalPreferences(): ProhorAccessPreferences {
  if (typeof window === "undefined") return DEFAULT_PROHOR_PREFERENCES;
  try { return sanitizePreferences(JSON.parse(localStorage.getItem(KEY) ?? "null")); }
  catch { return DEFAULT_PROHOR_PREFERENCES; }
}

/** Do not call this from server rendering or an effect that would override an SSR data-bound form. */
export function applyPreferences(preferences: ProhorAccessPreferences): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = preferences.theme;
  html.dataset.contrast = preferences.highContrast ? "more" : "normal";
  html.dataset.textScale = preferences.textScale;
  html.dataset.layout = preferences.spaciousLayout ? "spacious" : "comfortable";
  html.dataset.motion = preferences.reducedMotion ? "reduce" : "system";
  // IMPORTANT: Do not flip html.lang until the actual page copy is translated by i18n.
  // Communication choices belong to component interaction, not global automatic text rewrites.
}

export function saveLocalPreferences(preferences: ProhorAccessPreferences): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(sanitizePreferences(preferences))); }
  catch { /* Storage may be unavailable; continue with in-memory preferences. */ }
}
