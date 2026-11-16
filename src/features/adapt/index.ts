/**
 * Adapt module — public barrel export.
 * Import from "@/features/adapt" in other modules.
 */
export type {
  ProhorAccessPreferences,
  ProhorTheme,
  ProhorTextScale,
  ProhorCommunication,
  ProhorLanguage,
} from "./types/adapt.types";
export {
  DEFAULT_PROHOR_PREFERENCES,
  themeIds,
} from "./types/adapt.types";
export { useAdaptPreferences } from "./hooks/useAdaptPreferences";
export { applyAllPreferences, dispatchPreferenceChange } from "./lib/preference-helpers";
export { AdaptSettingsPanel } from "./components/AdaptSettingsPanel";
