"use client";
import { useId } from "react";
import { AppDialog } from "@/components/ui/AppDialog";
import type { SyncState } from "../lib/account-controller";
import { accountKeys } from "../lib/account-mapping";

const labels: Record<string, string> = {
  theme: "Appearance", highContrast: "Higher contrast", textScale: "Text size",
  spaciousLayout: "Spacious layout", reducedMotion: "Reduced motion",
  simplifiedContent: "Simplified reviewed text", communication: "Communication",
  language: "Language", textSpacing: "Text spacing", readAloud: "Read aloud",
};
function display(value: unknown) {
  if (typeof value === "boolean") return value ? "On" : "Off";
  const names: Record<string, string> = { "quiet-garden": "Quiet Garden", "original-rose": "Original Rose",
    "morning-mist": "Morning Mist", default: "Default", large: "Large", "extra-large": "Extra large",
    increased: "Relaxed", text: "Text", aac: "Picture and text (AAC)", bn: "বাংলা", en: "English" };
  return names[String(value)] ?? String(value);
}

export function PreferenceConflictDialog({ state, onClose, onSave, onUseAccount }: {
  state: SyncState; onClose(): void; onSave(): void; onUseAccount(): void;
}) {
  const id = useId();
  const pending = state.phase === "saving" || state.phase === "loading";
  const keys = accountKeys.filter(key => state.patch[key] !== undefined);
  return <AppDialog open onClose={onClose} labelledBy={id}>
    <div className="grid gap-4 p-5">
      <h2 id={id} className="text-xl font-semibold">Review account and device choices · পছন্দ মিলিয়ে নিন</h2>
      <p>Choose which supported settings to use. Device-only compact layout, focus, font and system-following contrast stay on this device.</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-base">
        <caption className="sr-only">Every differing supported preference</caption>
        <thead><tr><th scope="col">Setting</th><th scope="col">Device</th><th scope="col">Account</th></tr></thead>
        <tbody>{keys.map(key => <tr key={key} className="border-t border-pro-border">
          <th scope="row" className="break-words py-2">{labels[key]}</th>
          <td>{display(state.patch[key])}</td><td>{display(state.account?.[key])}</td>
        </tr>)}</tbody>
      </table></div>
      <p role={state.phase === "error" ? "alert" : "status"} lang="en">{state.message}</p>
      <button type="button" className="pro-btn pro-btn-primary" disabled={pending || !state.etag} onClick={onSave}>Save reviewed device choices · অ্যাকাউন্টে রাখুন</button>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={pending || !state.etag || state.phase === "error"} onClick={onUseAccount}>Use account choices · অ্যাকাউন্টের পছন্দ ব্যবহার করুন</button>
      <button type="button" className="pro-btn pro-btn-secondary" onClick={onClose}>Cancel · বাতিল</button>
    </div>
  </AppDialog>;
}
