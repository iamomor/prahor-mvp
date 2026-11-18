import { z } from "zod";
import {
  DEFAULT_PROHOR_PREFERENCES, themeIds, type ProhorAccessPreferences,
} from "../access-preferences";
import { timestampSchema } from "./common";

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

export function fromLocalPreferences(settings: ProhorAccessPreferences): AccessPreferences {
  return accessPreferencesSchema.parse({ ...DEFAULT_ACCESS_PREFERENCES, ...settings });
}

export type SaveAccessPreferencesRequest = z.infer<typeof saveAccessPreferencesRequestSchema>;
