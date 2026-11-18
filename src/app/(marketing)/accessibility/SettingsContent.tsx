"use client";
import { AACComposer, AdaptSettingsPanel, CloudSyncSection, dispatchAacInsert } from "@/features/adapt";
export function SettingsContent() {
  return <><AdaptSettingsPanel /><CloudSyncSection />
    <section className="pro-card" aria-label="Picture and text communication">
      <h2 className="text-xl font-semibold">Compose a draft with AAC · ছবি ও লেখা</h2>
      <p>This stays in this browser tab for you to insert and review in Barta. It is never sent automatically.</p>
      <AACComposer onInsert={dispatchAacInsert} targetLabel="Keep draft for Barta" />
    </section></>;
}
