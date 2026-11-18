"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { usePreferenceSync } from "../hooks/usePreferenceSync";
import { PreferenceConflictDialog } from "./PreferenceConflictDialog";
import { accessPreferencesAreDurable } from "@/lib/access-preferences";
import { readingPreferencesAreDurable } from "../lib/preference-helpers";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";

export function CloudSyncSection() {
  const id = useId();
  // Re-read durability when either device store changes, including guest edits.
  useAdaptPreferences();
  const { state, refresh, save, applySaved, disable } = usePreferenceSync();
  const [review, setReview] = useState(false);
  const busy = state.phase === "loading" || state.phase === "saving";
  const close = () => setReview(false);
  async function saveReviewed() {
    const result = await save();
    if (result.status === "saved" || result.status === "unchanged") close();
  }
  return <section aria-labelledby={id} className="grid gap-3 rounded-card border border-pro-border p-4">
    <h2 id={id} className="text-xl font-semibold">Account preferences · অ্যাকাউন্টের পছন্দ</h2>
    <p>Changes apply on this device immediately. Saving to your account is an explicit action.</p>
    {(!accessPreferencesAreDurable() || !readingPreferencesAreDurable()) && <p role="status">Browser storage is unavailable. Your choices are kept in this page; reloading may lose them. Account saves are reported separately.</p>}
    <p lang="en" role={state.phase === "error" ? "alert" : "status"}>{state.message}</p>
    {state.identity ? <p>Active account: {state.identity.displayName || "Your account"}</p>
      : state.phase === "guest" ? <Link className="pro-btn pro-btn-secondary" href="/sign-in">Sign in to use account preferences</Link> : null}
    <p>Compact density, focused view, font and following device contrast are device-only. Other supported choices can be saved. Previously saved read-aloud choices are preserved.</p>
    {state.updatedAt && <p>Account updated: <time dateTime={state.updatedAt}>{state.updatedAt}</time></p>}
    <div className="flex flex-wrap gap-3">
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={() => { void refresh(); }}>Reload account settings</button>
      {state.account && <button type="button" className="pro-btn pro-btn-primary" disabled={busy || !state.etag || !Object.keys(state.patch).length} onClick={() => setReview(true)}>Review account differences</button>}
      {state.enabled && <button type="button" className="pro-btn pro-btn-secondary" onClick={disable}>Turn off account sync on this device</button>}
    </div>
    {review && state.account && <PreferenceConflictDialog state={state} onClose={close}
      onSave={() => { void saveReviewed(); }} onUseAccount={() => { if (applySaved().status === "applied") close(); }} />}
  </section>;
}
