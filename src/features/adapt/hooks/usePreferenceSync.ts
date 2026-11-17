"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { useAuthSession } from "@/features/auth/useAuthSession";
import {
  type SyncStatus,
  type CloudSyncResult,
  isSyncConsentGiven,
  setSyncConsent,
  getLastSyncedTime,
  setLastSyncedTime,
  getServerUpdatedAt,
  setServerUpdatedAt,
  handleAccountSwitch,
  arePreferencesEqual,
  applyCloudPreferencesToDevice,
  fetchCloudPreferences,
  pushCloudPreferences,
  deleteCloudPreferences,
  getCurrentDevicePreferencesDto,
  PROHOR_SYNC_CHANGE_EVENT,
} from "../lib/preference-sync";
import type { AccessPreferences } from "@/lib/contracts/adapt";

export type PreferenceConflictState = {
  deviceSettings: AccessPreferences;
  cloudSettings: AccessPreferences;
  cloudUpdatedAt: string | null;
};

function subscribeSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROHOR_SYNC_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PROHOR_SYNC_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function usePreferenceSync() {
  const { user, isLoading: isAuthLoading } = useAuthSession();

  const consent = useSyncExternalStore(
    subscribeSync,
    isSyncConsentGiven,
    () => false,
  );

  const lastSynced = useSyncExternalStore(
    subscribeSync,
    getLastSyncedTime,
    () => null,
  );

  const [actionStatus, setActionStatus] = useState<SyncStatus | null>(null);
  const [conflict, setConflict] = useState<PreferenceConflictState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived effective status based on consent and auth state
  const status: SyncStatus =
    actionStatus ??
    (!user || !consent ? "disabled" : "idle");

  // Handle account isolation on auth state changes
  useEffect(() => {
    if (!isAuthLoading) {
      handleAccountSwitch(user?.id ?? null);
    }
  }, [user, isAuthLoading]);

  /** Core sync routine: pushes local settings to the server or detects conflict. */
  const runSync = useCallback(
    async (
      overrideSettings?: AccessPreferences,
      expectedUpdatedAtOverride?: string | null,
    ): Promise<CloudSyncResult> => {
      if (!navigator.onLine) {
        setActionStatus("offline");
        return { success: false, error: "Offline" };
      }

      setActionStatus("syncing");
      setErrorMessage(null);

      const deviceDto = overrideSettings ?? getCurrentDevicePreferencesDto();
      const expectedAt =
        expectedUpdatedAtOverride !== undefined
          ? expectedUpdatedAtOverride
          : getServerUpdatedAt();

      const result = await pushCloudPreferences(deviceDto, expectedAt);

      if (result.conflict) {
        setActionStatus("conflict");
        // Fetch latest server settings to present accurate conflict options
        const cloudResult = await fetchCloudPreferences();
        if (cloudResult.success && cloudResult.settings) {
          setConflict({
            deviceSettings: deviceDto,
            cloudSettings: cloudResult.settings,
            cloudUpdatedAt: cloudResult.updatedAt ?? null,
          });
        }
        return result;
      }

      if (!result.success) {
        setActionStatus("error");
        setErrorMessage(result.error ?? "Could not sync preferences.");
        return result;
      }

      // Success
      const now = new Date().toISOString();
      setServerUpdatedAt(result.updatedAt ?? null);
      setLastSyncedTime(now);
      setActionStatus("idle");
      return result;
    },
    [],
  );

  /** User toggles sync consent on or off. */
  const toggleConsent = useCallback(
    async (enable: boolean) => {
      if (!enable) {
        setSyncConsent(false);
        setActionStatus("disabled");
        setConflict(null);
        setErrorMessage(null);
        return;
      }

      if (!user) {
        setErrorMessage("Please sign in first to enable account sync.");
        return;
      }

      // Enabling sync: First check if cloud preferences already exist
      setActionStatus("syncing");
      const cloudResult = await fetchCloudPreferences();

      if (!cloudResult.success) {
        // If 404 or no record, push initial preferences
        const initialPush = await pushCloudPreferences(
          getCurrentDevicePreferencesDto(),
          null,
        );
        if (initialPush.success) {
          setSyncConsent(true);
          const now = new Date().toISOString();
          setServerUpdatedAt(initialPush.updatedAt ?? null);
          setLastSyncedTime(now);
          setActionStatus("idle");
        } else {
          setActionStatus("error");
          setErrorMessage(
            initialPush.error ?? "Failed to initialize cloud preferences.",
          );
        }
        return;
      }

      const cloudSettings = cloudResult.settings;
      const deviceSettings = getCurrentDevicePreferencesDto();

      if (cloudSettings && !arePreferencesEqual(deviceSettings, cloudSettings)) {
        // First-time sync conflict: user must choose whether to use account or device settings
        setSyncConsent(true);
        setActionStatus("conflict");
        setConflict({
          deviceSettings,
          cloudSettings,
          cloudUpdatedAt: cloudResult.updatedAt ?? null,
        });
        return;
      }

      // No conflict: settings match or server returned clean initial
      setSyncConsent(true);
      const now = new Date().toISOString();
      setServerUpdatedAt(cloudResult.updatedAt ?? null);
      setLastSyncedTime(now);
      setActionStatus("idle");
    },
    [user],
  );

  /** Resolve conflict when user explicitly picks "keep_device" or "use_account". */
  const resolveConflict = useCallback(
    async (choice: "keep_device" | "use_account") => {
      if (!conflict) return;

      if (choice === "use_account") {
        // Apply cloud settings locally and update last synced timestamp
        applyCloudPreferencesToDevice(conflict.cloudSettings);
        setServerUpdatedAt(conflict.cloudUpdatedAt);
        const now = new Date().toISOString();
        setLastSyncedTime(now);
        setConflict(null);
        setActionStatus("idle");
      } else {
        // "keep_device": force push local device preferences to cloud using server's current updated_at
        setActionStatus("syncing");
        const pushResult = await pushCloudPreferences(
          conflict.deviceSettings,
          conflict.cloudUpdatedAt,
        );
        if (pushResult.success) {
          setServerUpdatedAt(pushResult.updatedAt ?? null);
          const now = new Date().toISOString();
          setLastSyncedTime(now);
          setConflict(null);
          setActionStatus("idle");
        } else {
          setActionStatus("error");
          setErrorMessage(pushResult.error ?? "Failed to resolve conflict.");
        }
      }
    },
    [conflict],
  );

  /** Manual "Sync Now" trigger. */
  const syncNow = useCallback(async () => {
    if (!consent || !user) return;
    await runSync();
  }, [consent, user, runSync]);

  /** Permanently revoke cloud sync and delete the server record. */
  const revokeCloudSync = useCallback(async () => {
    setActionStatus("syncing");
    const result = await deleteCloudPreferences();
    setSyncConsent(false);
    setConflict(null);
    setErrorMessage(null);
    setActionStatus("disabled");
    return result;
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    consent,
    status,
    lastSynced,
    conflict,
    errorMessage,
    toggleConsent,
    resolveConflict,
    syncNow,
    revokeCloudSync,
  };
}
