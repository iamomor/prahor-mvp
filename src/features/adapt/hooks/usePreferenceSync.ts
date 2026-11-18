"use client";
import { useSyncExternalStore } from "react";
import { accountPreferences } from "../lib/account-runtime";
export function usePreferenceSync() {
  const state = useSyncExternalStore(accountPreferences.subscribe,
    accountPreferences.getSnapshot, accountPreferences.getServerSnapshot);
  return { state, refresh: accountPreferences.refresh, save: accountPreferences.save,
    applySaved: accountPreferences.useAccount, disable: accountPreferences.disable };
}
