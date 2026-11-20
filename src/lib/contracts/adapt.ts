import { z } from "zod";
import {
  DEFAULT_PROHOR_PREFERENCES, themeIds, type ProhorAccessPreferences,
} from "../access-preferences";
import { contractVersion, timestampSchema } from "./common";

/** Existing settings are reused; new controls are proposed, not rendered by this change. */
export const accessPreferencesSchema = z.strictObject({
  theme: z.enum(themeIds),
  highContrast: z.boolean(),
  textScale: z.enum(["default", "large", "extra-large"]),
  spaciousLayout: z.boolean(),
  reducedMotion: z.boolean(),
  simplifiedContent: z.boolean(),
  communication: z.enum(["text", "aac"]),
  language: z.enum(["bn", "en"]),
  textSpacing: z.enum(["default", "increased"]),
  readAloud: z.boolean(),
});

export type AccessPreferences = z.infer<typeof accessPreferencesSchema>;
export const patchAccessPreferencesSchema = accessPreferencesSchema.partial()
  .refine(value => Object.values(value).some(item => item !== undefined), "Provide at least one preference.");
export type PatchAccessPreferences = z.infer<typeof patchAccessPreferencesSchema>;
export const preferencesResponseSchema = z.strictObject({
  data: accessPreferencesSchema,
  schemaVersion: z.literal(2),
  updatedAt: timestampSchema.nullable(),
  requestId: z.uuid(),
  contractVersion: z.literal(contractVersion),
});
export type PreferencesResponse = z.infer<typeof preferencesResponseSchema>;
export const DEFAULT_ACCESS_PREFERENCES = {
  theme: DEFAULT_PROHOR_PREFERENCES.theme,
  highContrast: false,
  textScale: "default", spaciousLayout: false, reducedMotion: false,
  simplifiedContent: false, communication: "text", language: "bn",
  textSpacing: "default",
  readAloud: false,
} satisfies AccessPreferences;

/** Full, explicitly confirmed settings replacement; server derives user_id. */
export const saveAccessPreferencesRequestSchema = z.strictObject({
  schemaVersion: z.literal(2),
  settings: accessPreferencesSchema,
  expectedUpdatedAt: timestampSchema.nullable(),
});

export function fromLocalPreferences(settings: ProhorAccessPreferences): AccessPreferences {
  return accessPreferencesSchema.parse({
    ...DEFAULT_ACCESS_PREFERENCES, theme: settings.theme,
    highContrast: settings.highContrast ?? DEFAULT_ACCESS_PREFERENCES.highContrast,
    textScale: settings.textScale, spaciousLayout: settings.spaciousLayout,
    reducedMotion: settings.reducedMotion, simplifiedContent: settings.simplifiedContent,
    communication: settings.communication, language: settings.language,
    readAloud: settings.readAloud ?? DEFAULT_ACCESS_PREFERENCES.readAloud,
  });
}

export type SaveAccessPreferencesRequest = z.infer<typeof saveAccessPreferencesRequestSchema>;
