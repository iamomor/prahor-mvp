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
export { AACComposer } from "./components/AACComposer";
export {
  AAC_INSERT_EVENT,
  AAC_DRAFT_STORAGE_KEY,
  dispatchAacInsert,
  getStoredAacDraft,
  clearStoredAacDraft,
  mergeAacText,
} from "./lib/aac-events";
export { generateNaturalPhrase, AAC_CATALOG } from "./lib/aac-phrases";
export { CloudSyncSection } from "./components/CloudSyncSection";
export { PreferenceConflictDialog } from "./components/PreferenceConflictDialog";
export { usePreferenceSync } from "./hooks/usePreferenceSync";
export {
  isSyncConsentGiven,
  setSyncConsent,
  getLastSyncedTime,
  setLastSyncedTime,
  handleAccountSwitch,
  backupAnonymousPreferences,
  restoreAnonymousPreferences,
} from "./lib/preference-sync";
