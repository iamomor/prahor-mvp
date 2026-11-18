import { z } from "zod";
import {
  DEFAULT_PROHOR_PREFERENCES, themeIds, type ProhorAccessPreferences,
} from "../access-preferences";
import { contractVersion, timestampSchema } from "./common";

/** Existing settings are reused; new controls are proposed, not rendered by this change. */
export const rawAccessPreferencesSchema = z.strictObject({
  theme: z.enum(themeIds),
  highContrast: z.boolean().nullable(),
  textScale: z.enum(["default", "large", "extra-large"]),
  spaciousLayout: z.boolean(),
  /** Canonical layout value; spaciousLayout remains for v2 API compatibility. */
  layoutDensity: z.enum(["comfortable", "compact", "spacious"]).optional(),
  reducedMotion: z.boolean(),
  simplifiedContent: z.boolean(),
  communication: z.enum(["text", "aac"]),
  language: z.enum(["bn", "en"]),
  /** P1 focus preference, defaulted when parsing existing v2 API payloads. */
  focusedView: z.boolean().optional(),
  textSpacing: z.enum(["default", "increased"]),
  readAloud: z.boolean(),
});

export const patchAccessPreferencesSchema = rawAccessPreferencesSchema.partial()
  .refine((value: Record<string, unknown>) => Object.values(value).some(item => item !== undefined), "Provide at least one preference.");
export type PatchAccessPreferences = z.infer<typeof patchAccessPreferencesSchema>;

export const accessPreferencesSchema = rawAccessPreferencesSchema.superRefine((settings, context) => {
  if (
    settings.layoutDensity !== undefined &&
    settings.spaciousLayout !== (settings.layoutDensity === "spacious")
  ) {
    context.addIssue({
      code: "custom",
      path: ["spaciousLayout"],
      message: "spaciousLayout must match the canonical layoutDensity value.",
    });
  }
}).transform(({ layoutDensity, focusedView, ...settings }) => ({
  ...settings,
  layoutDensity: layoutDensity ?? (settings.spaciousLayout ? "spacious" : "comfortable"),
  focusedView: focusedView ?? false,
}));

export type AccessPreferences = z.infer<typeof accessPreferencesSchema>;
export const preferencesResponseSchema = z.strictObject({
  data: accessPreferencesSchema,
  schemaVersion: z.literal(2),
  updatedAt: timestampSchema.nullable(),
  requestId: z.uuid(),
  contractVersion: z.literal(contractVersion),
});
export type PreferencesResponse = z.infer<typeof preferencesResponseSchema>;
export const DEFAULT_ACCESS_PREFERENCES = {
  ...DEFAULT_PROHOR_PREFERENCES,
  textSpacing: "default",
  readAloud: false,
} satisfies AccessPreferences;

/** Full, explicitly confirmed settings replacement; server derives user_id. */
export const saveAccessPreferencesRequestSchema = z.strictObject({
  schemaVersion: z.literal(2),
  settings: accessPreferencesSchema,
  expectedUpdatedAt: timestampSchema.nullable(),
});

type LocalReadingPreferences = { textSpacing: "standard" | "relaxed" };

/** Convert the canonical local stores into the API DTO without merging their storage models. */
export function fromLocalPreferences(
  settings: ProhorAccessPreferences,
  reading?: LocalReadingPreferences,
): AccessPreferences {
  return accessPreferencesSchema.parse({
    ...DEFAULT_ACCESS_PREFERENCES,
    theme: settings.theme,
    highContrast: settings.highContrast,
    textScale: settings.textScale,
    layoutDensity: settings.layoutDensity,
    spaciousLayout: settings.layoutDensity === "spacious",
    reducedMotion: settings.reducedMotion,
    simplifiedContent: settings.simplifiedContent,
    communication: settings.communication,
    language: settings.language,
    focusedView: settings.focusedView,
    // Typography remains in its own local store; map only its API DTO field.
    textSpacing: reading?.textSpacing === "relaxed" ? "increased" : "default",
    // readAloud is retained in the existing API DTO, but is not a local preference.
    readAloud: DEFAULT_ACCESS_PREFERENCES.readAloud,
  });
}

export type SaveAccessPreferencesRequest = z.infer<typeof saveAccessPreferencesRequestSchema>;

export type ConvertedLocalPreferences = {
  access: ProhorAccessPreferences;
  reading: { textSpacing: "standard" | "relaxed" };
};

/**
 * Convert validated API preferences back into canonical local stores.
 * - Preserves system-following highContrast (null).
 * - Maps textSpacing: "increased" -> "relaxed", "default" -> "standard".
 * - Ignores readAloud (interaction state, not a persistent local preference).
 * - Leaves local font selection intact (device-local).
 */
export function toLocalPreferences(settings: AccessPreferences): ConvertedLocalPreferences {
  const parsed = accessPreferencesSchema.parse(settings);
  const layoutDensity = parsed.layoutDensity ?? (parsed.spaciousLayout ? "spacious" : "comfortable");
  return {
    access: {
      theme: parsed.theme,
      highContrast: parsed.highContrast,
      textScale: parsed.textScale,
      layoutDensity,
      spaciousLayout: layoutDensity === "spacious",
      reducedMotion: parsed.reducedMotion,
      simplifiedContent: parsed.simplifiedContent,
      communication: parsed.communication,
      language: parsed.language,
      focusedView: parsed.focusedView ?? false,
    },
    reading: {
      textSpacing: parsed.textSpacing === "increased" ? "relaxed" : "standard",
    },
  };
}
