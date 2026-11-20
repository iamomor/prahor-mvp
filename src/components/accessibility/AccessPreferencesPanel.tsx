"use client";

import type { ProhorAccessPreferences, ProhorTheme } from "../../lib/access-preferences";
import { useAdaptPreferences } from "@/features/adapt/hooks/useAdaptPreferences";
import { CloudSyncSection } from "@/features/adapt/components/CloudSyncSection";
import { ContrastPreferenceControl } from "./ContrastPreferenceControl";
import { hasApprovedEasyRead } from "@/features/adapt/lib/easy-read";

const THEME_LABELS: Record<ProhorTheme, string> = {
  "quiet-garden": "Quiet Garden",
  "original-rose": "Original Rose",
  "morning-mist": "Morning Mist",
};

/**
 * Usable reference for an OPTIONAL access panel, not a replacement for baseline accessibility.
 * Hydrates preferences after mount; production apps should also apply saved theme before first paint
 * using a safe server-rendered preference or a minimal pre-paint script to avoid a flash.
 */
export function AccessPreferencesPanel({ titleId = "access-title" }: { titleId?: string }) {
  const { prefs, updatePref, resetAll } = useAdaptPreferences();

  function update<K extends keyof ProhorAccessPreferences>(
    key: K,
    value: ProhorAccessPreferences[K],
  ) {
    updatePref(key, value);
  }

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-6 rounded-2xl border border-pro-border bg-pro-elevated p-5 text-pro-text sm:p-7"
    >
      <div className="space-y-2">
        <h2 id={titleId} className="text-2xl font-semibold">
          Adjust how you use PROHOR
        </h2>
        <p className="max-w-prose text-pro-muted">
          Choose what helps you. All care features stay available, and you can
          change these settings anytime.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-semibold">Appearance</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.entries(THEME_LABELS) as [ProhorTheme, string][]).map(
            ([id, label]) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-pro-control-border p-3 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"
              >
                <input
                  type="radio"
                  name="prohor-theme"
                  checked={prefs.theme === id}
                  onChange={() => update("theme", id)}
                />
                <span>{label}</span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      <ContrastPreferenceControl value={prefs.highContrast} onChange={value => update("highContrast", value)} compact />
      <fieldset className="space-y-3">
        <legend className="font-semibold">Reading and layout</legend>
        <label className="flex flex-wrap items-center justify-between gap-3">
          <span>Text size</span>
          <select
            className="rounded-lg border border-pro-control-border bg-pro-elevated p-2 text-pro-text"
            value={prefs.textScale}
            onChange={(e) =>
              update(
                "textScale",
                e.target.value as ProhorAccessPreferences["textScale"],
              )
            }
          >
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra large</option>
          </select>
        </label>
        {(
          [
            ["spaciousLayout", "More space between controls"],
            ["reducedMotion", "Reduce animation"],
            ["readAloud", "Show Listen buttons (audio plays only when pressed)"],
            // Easy Read appears only when a human-approved entry exists (features/adapt/lib/easy-read.ts).
            ...(hasApprovedEasyRead() ? [["simplifiedContent", "Easy Read where a reviewed version exists"] as const] : []),
          ] as const
        ).map(([id, label]) => (
          <label
            key={id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2"
          >
            <input
              type="checkbox"
              checked={prefs[id] === true}
              onChange={(e) => update(id, e.target.checked)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-semibold">Communication</legend>
        <p className="text-pro-muted">
          Typing works throughout PROHOR. Picture communication is offered only
          in supported tasks.
        </p>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="communication"
            checked={prefs.communication === "text"}
            onChange={() => update("communication", "text")}
          />{" "}
          Text
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="communication"
            checked={prefs.communication === "aac"}
            onChange={() => update("communication", "aac")}
          />{" "}
          Picture-and-text (AAC)
        </label>
      </fieldset>

      <label className="flex flex-wrap items-center justify-between gap-3 font-semibold">
        Language
        <select
          className="rounded-lg border border-pro-control-border bg-pro-elevated p-2 text-pro-text"
          value={prefs.language}
          onChange={(e) =>
            update(
              "language",
              e.target.value as ProhorAccessPreferences["language"],
            )
          }
        >
          <option value="bn">বাংলা</option>
          <option value="en">English</option>
        </select>
      </label>
      <p className="text-sm text-pro-muted">
        Language selection requires a complete translation layer in production.
        This example stores the preference but does not translate page copy.
      </p>
      <button
        type="button"
        onClick={() => {
          resetAll();
        }}
        className="min-h-12 rounded-xl border border-pro-control-border px-4 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus"
      >
        Restore default preferences
      </button>
      <CloudSyncSection />
    </section>
  );
}
