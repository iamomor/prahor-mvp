/**
 * Account Preference Sync Coordinator & Isolation Engine.
 *
 * Guarantees:
 * 1. Local-first default: No cloud sync without explicit consent.
 * 2. Strict isolation: User A's preferences are never leaked to User B.
 * 3. Anonymous preservation: Backs up anonymous device preferences before sync;
 *    restores them on logout.
 * 4. Optimistic concurrency & atomic conflicts.
 * 5. Strictly no healthcare data, pregnancy records, or diary entries.
 */
import {
  type AccessPreferences,
  type SaveAccessPreferencesRequest,
  fromLocalPreferences,
  toLocalPreferences,
} from "@/lib/contracts/adapt";
import {
  readLocalPreferences,
  saveLocalPreferences,
  DEFAULT_PROHOR_PREFERENCES,
} from "@/lib/access-preferences";
import {
  readReadingPreferences,
  saveReadingPreferences,
  applyAllPreferences,
  dispatchPreferenceChange,
  dispatchReadingChange,
} from "./preference-helpers";
import { DEFAULT_READING_PREFERENCES } from "../types/adapt.types";

export const SYNC_CONSENT_KEY = "prohor-sync-consent-v1";
export const ANONYMOUS_BACKUP_KEY = "prohor-anonymous-prefs-backup-v1";
export const LAST_SYNCED_KEY = "prohor-last-synced-at-v1";
export const SYNC_USER_KEY = "prohor-sync-user-id-v1";
export const SERVER_UPDATED_AT_KEY = "prohor-server-updated-at-v1";

export type SyncStatus =
  | "disabled"
  | "idle"
  | "syncing"
  | "conflict"
  | "error"
  | "offline";

export type CloudSyncResult = {
  success: boolean;
  settings?: AccessPreferences;
  updatedAt?: string | null;
  conflict?: boolean;
  status?: number;
  error?: string;
};

export const PROHOR_SYNC_CHANGE_EVENT = "prohor-sync-change";

export function dispatchSyncChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PROHOR_SYNC_CHANGE_EVENT));
}

export function isSyncConsentGiven(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SYNC_CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSyncConsent(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) {
      localStorage.setItem(SYNC_CONSENT_KEY, "true");
    } else {
      localStorage.removeItem(SYNC_CONSENT_KEY);
      localStorage.removeItem(LAST_SYNCED_KEY);
      localStorage.removeItem(SERVER_UPDATED_AT_KEY);
      localStorage.removeItem(SYNC_USER_KEY);
    }
    dispatchSyncChange();
  } catch {
    /* Storage unavailable */
  }
}

export function getLastSyncedTime(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_SYNCED_KEY);
  } catch {
    return null;
  }
}

export function setLastSyncedTime(time: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (time) {
      localStorage.setItem(LAST_SYNCED_KEY, time);
    } else {
      localStorage.removeItem(LAST_SYNCED_KEY);
    }
    dispatchSyncChange();
  } catch {
    /* Storage unavailable */
  }
}

export function getServerUpdatedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SERVER_UPDATED_AT_KEY);
  } catch {
    return null;
  }
}

export function setServerUpdatedAt(updatedAt: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (updatedAt) {
      localStorage.setItem(SERVER_UPDATED_AT_KEY, updatedAt);
    } else {
      localStorage.removeItem(SERVER_UPDATED_AT_KEY);
    }
  } catch {
    /* Storage unavailable */
  }
}

export function getSyncUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SYNC_USER_KEY);
  } catch {
    return null;
  }
}

export function setSyncUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      localStorage.setItem(SYNC_USER_KEY, userId);
    } else {
      localStorage.removeItem(SYNC_USER_KEY);
    }
  } catch {
    /* Storage unavailable */
  }
}

/** Backup anonymous device preferences prior to linking with an account. */
export function backupAnonymousPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    // Only backup if no backup exists yet
    if (!localStorage.getItem(ANONYMOUS_BACKUP_KEY)) {
      const access = readLocalPreferences();
      const reading = readReadingPreferences();
      localStorage.setItem(
        ANONYMOUS_BACKUP_KEY,
        JSON.stringify({ access, reading }),
      );
    }
  } catch {
    /* Storage unavailable */
  }
}

/** Restore previously stored anonymous preferences when an account signs out. */
export function restoreAnonymousPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ANONYMOUS_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.access) {
        saveLocalPreferences(parsed.access);
      }
      if (parsed.reading) {
        saveReadingPreferences(parsed.reading);
      }
      applyAllPreferences(readLocalPreferences(), readReadingPreferences());
      dispatchPreferenceChange(readLocalPreferences());
      dispatchReadingChange(readReadingPreferences());
      localStorage.removeItem(ANONYMOUS_BACKUP_KEY);
    } else {
      // Revert to clean defaults if no anonymous backup was recorded
      saveLocalPreferences(DEFAULT_PROHOR_PREFERENCES);
      saveReadingPreferences(DEFAULT_READING_PREFERENCES);
      applyAllPreferences(DEFAULT_PROHOR_PREFERENCES, DEFAULT_READING_PREFERENCES);
      dispatchPreferenceChange(DEFAULT_PROHOR_PREFERENCES);
      dispatchReadingChange(DEFAULT_READING_PREFERENCES);
    }
  } catch {
    /* Storage unavailable */
  }
}

/**
 * Handle account switching or sign-out to prevent preference leakage between accounts.
 */
export function handleAccountSwitch(currentUserId: string | null): void {
  if (typeof window === "undefined") return;
  const previousUserId = getSyncUserId();

  if (!currentUserId) {
    // Only perform sign-out teardown if an authenticated account was previously active
    if (previousUserId) {
      setSyncConsent(false);
      setSyncUserId(null);
      restoreAnonymousPreferences();
    }
    return;
  }

  if (previousUserId && previousUserId !== currentUserId) {
    // User switched to another account: clear previous user's sync state and backup
    setSyncConsent(false);
    setSyncUserId(currentUserId);
    restoreAnonymousPreferences();
    backupAnonymousPreferences();
    return;
  }

  // Initial sign-in of user: backup current anonymous preferences
  if (!previousUserId) {
    backupAnonymousPreferences();
  }
  setSyncUserId(currentUserId);
}

/** Compare whether two preference DTOs have identical settings. */
export function arePreferencesEqual(a: AccessPreferences, b: AccessPreferences): boolean {
  return (
    a.theme === b.theme &&
    a.highContrast === b.highContrast &&
    a.textScale === b.textScale &&
    a.layoutDensity === b.layoutDensity &&
    a.reducedMotion === b.reducedMotion &&
    a.simplifiedContent === b.simplifiedContent &&
    a.communication === b.communication &&
    a.language === b.language &&
    a.focusedView === b.focusedView &&
    a.textSpacing === b.textSpacing
  );
}

/** Apply cloud preferences to local device stores safely. */
export function applyCloudPreferencesToDevice(settings: AccessPreferences): void {
  const { access, reading } = toLocalPreferences(settings);
  // Preserve existing local font
  const currentReading = readReadingPreferences();
  const nextReading = { ...currentReading, textSpacing: reading.textSpacing };

  saveLocalPreferences(access);
  saveReadingPreferences(nextReading);
  applyAllPreferences(access, nextReading);
  dispatchPreferenceChange(access);
  dispatchReadingChange(nextReading);
}

/** Fetch authenticated user's preferences from the cloud API. */
export async function fetchCloudPreferences(): Promise<CloudSyncResult> {
  try {
    const res = await fetch("/api/access-preferences", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: `Server responded with ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      settings: data.settings,
      updatedAt: data.updatedAt,
      status: 200,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** Push device preferences to the cloud with atomic optimistic concurrency. */
export async function pushCloudPreferences(
  settings: AccessPreferences,
  expectedUpdatedAt: string | null,
): Promise<CloudSyncResult> {
  const payload: SaveAccessPreferencesRequest = {
    schemaVersion: 2,
    settings,
    expectedUpdatedAt,
  };

  try {
    const res = await fetch("/api/access-preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (res.status === 409) {
      return {
        success: false,
        status: 409,
        conflict: true,
        updatedAt: data?.currentUpdatedAt,
        error: data?.message ?? "Preferences conflict on server",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: data?.message ?? `Server responded with ${res.status}`,
      };
    }

    return {
      success: true,
      status: 200,
      settings: data.settings,
      updatedAt: data.updatedAt,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** Delete cloud preferences record when revoking sync consent. */
export async function deleteCloudPreferences(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/access-preferences", {
      method: "DELETE",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        success: false,
        error: data?.message ?? `Failed to delete with status ${res.status}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** Get the current local settings mapped into the API DTO format. */
export function getCurrentDevicePreferencesDto(): AccessPreferences {
  const local = readLocalPreferences();
  const reading = readReadingPreferences();
  return fromLocalPreferences(local, reading);
}
