import { sanitizePreferences, readLocalPreferences, saveLocalPreferences } from "@/lib/access-preferences";
import { readReadingPreferences, saveReadingPreferences, applyAllPreferences,
  dispatchPreferenceChange, dispatchReadingChange } from "./preference-helpers";
import { PreferenceSyncController, accountTransport, type StoredSession } from "./account-controller";
const sessionKey = "prohor-account-preferences-session-v1";
let memorySession: StoredSession | null = null;

export const accountPreferences = new PreferenceSyncController({
  ...accountTransport(),
  readDevice: () => ({ access: readLocalPreferences(), reading: readReadingPreferences() }),
  writeDevice: ({ access, reading }) => {
    saveLocalPreferences(access); saveReadingPreferences(reading);
    applyAllPreferences(access, reading);
    dispatchPreferenceChange(access); dispatchReadingChange(reading);
  },
  readSession: () => {
    if (memorySession) return memorySession;
    if (typeof window === "undefined") return null;
    try {
      const raw = JSON.parse(localStorage.getItem(sessionKey) ?? "null");
      if (!raw || typeof raw.userId !== "string" || raw.userId.length > 100 || !raw.backup?.access || !raw.backup?.reading) return null;
      const reading = raw.backup.reading;
      const access = sanitizePreferences({ ...raw.backup.access, _schemaVersion: 3 });
      memorySession = { userId: raw.userId, enabled: raw.enabled === true,
        backup: { access, reading: {
          font: ["default", "rubik", "noto-serif", "roboto-slab"].includes(reading.font) ? reading.font : "default",
          textSpacing: reading.textSpacing === "relaxed" ? "relaxed" : "standard", density: access.layoutDensity,
        } } };
      return memorySession;
    } catch { return null; }
  },
  writeSession: value => {
    memorySession = value;
    try {
      if (value) localStorage.setItem(sessionKey, JSON.stringify(value));
      else localStorage.removeItem(sessionKey);
    } catch { /* Memory state still isolates accounts in this page session. */ }
  },
});
