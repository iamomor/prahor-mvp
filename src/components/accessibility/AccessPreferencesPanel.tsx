"use client";

import { useEffect, useState, useId } from "react";
import {
  DEFAULT_PROHOR_PREFERENCES,
  applyPreferences,
  readLocalPreferences,
  saveLocalPreferences,
  sanitizePreferences,
  type ProhorAccessPreferences,
  type ProhorTheme,
} from "../../lib/access-preferences";
import { ContrastPreferenceControl } from "./ContrastPreferenceControl";

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
export function AccessPreferencesPanel() {
  const [prefs, setPrefs] = useState<ProhorAccessPreferences>(
    DEFAULT_PROHOR_PREFERENCES,
  );
  const [ready, setReady] = useState(false);
  const uid = useId();

  useEffect(() => {
    const saved = readLocalPreferences();
    applyPreferences(saved);
    const timer = setTimeout(() => {
      setPrefs(readLocalPreferences());
      setReady(true);
    }, 0);
    function syncPreferences(event: Event) {
      const next = event instanceof CustomEvent && event.detail
        ? sanitizePreferences(event.detail) : readLocalPreferences();
      setPrefs(next);
      applyPreferences(next);
    }
    window.addEventListener("prohor-preferences-change", syncPreferences);
    window.addEventListener("storage", syncPreferences);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("prohor-preferences-change", syncPreferences);
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  function update<K extends keyof ProhorAccessPreferences>(
    key: K,
    value: ProhorAccessPreferences[K],
  ) {
    if (key === "spaciousLayout") {
      const layoutDensity = value ? "spacious" : "comfortable";
      commit({ ...prefs, spaciousLayout: Boolean(value), layoutDensity });
      return;
    }
    commit({ ...prefs, [key]: value });
  }

  function commit(next: ProhorAccessPreferences) {
    setPrefs(next);
    applyPreferences(next);
    saveLocalPreferences(next);
    window.dispatchEvent(new CustomEvent("prohor-preferences-change", { detail: next }));
  }

  if (!ready)
    return (
      <div role="status" className="rounded-xl border border-pro-border p-5">
        Loading your preferences…
      </div>
    );

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="space-y-6 rounded-2xl border border-pro-border bg-pro-elevated p-5 text-pro-text sm:p-7"
    >
      <div className="space-y-2">
        <h2 id={`${uid}-title`} className="text-2xl font-semibold">
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
                  name={`${uid}-theme`}
                  value={id}
                  checked={prefs.theme === id}
                  onChange={() => update("theme", id)}
                />
                <span>{label}</span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      <ContrastPreferenceControl
        compact
        value={prefs.highContrast}
        onChange={(val) => update("highContrast", val)}
      />

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
        <div className="flex gap-2">
          {(
            [
              { value: "default", label: "Default size" },
              { value: "large", label: "Large size" },
              { value: "extra-large", label: "Extra large size" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={[
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg border p-2 text-xs font-medium",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.textScale === value
                  ? "border-pro-primary bg-pro-surface text-pro-primary"
                  : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`${uid}-text-scale-radio`}
                value={value}
                checked={prefs.textScale === value}
                onChange={() => update("textScale", value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {(
          [
            ["highContrast", "Stronger contrast"],
            ["spaciousLayout", "More space between controls"],
            ["reducedMotion", "Reduce animation"],
            ["simplifiedContent", "Reviewed simpler wording where available"],
          ] as const
        ).map(([id, label]) => (
          <label
            key={id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2"
          >
            <input
              type="checkbox"
              checked={id === "highContrast" ? prefs.highContrast === true : Boolean(prefs[id])}
              onChange={(e) => update(id, id === "highContrast" ? (e.target.checked ? true : false) : e.target.checked)}
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
            name={`${uid}-communication`}
            checked={prefs.communication === "text"}
            onChange={() => update("communication", "text")}
          />{" "}
          Text
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`${uid}-communication`}
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
          commit(DEFAULT_PROHOR_PREFERENCES);
        }}
        className="min-h-12 rounded-xl border border-pro-control-border px-4 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus"
      >
        Restore default preferences
      </button>
    </section>
  );
}
