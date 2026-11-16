"use client";

/**
 * AccessPreferencesPanel — compact preference panel for the public /accessibility page.
 *
 * Phase 1 P0 fix: This component previously used local useState + useEffect to read/write
 * preferences, creating a desync with the authoritative useAdaptPreferences store. Any update
 * made here would not be reflected in AdaptSettingsPanel and vice-versa until a page reload.
 *
 * Now uses useAdaptPreferences (useSyncExternalStore) so all preference changes are
 * immediately reflected everywhere — including the AppChrome header, the full settings
 * panel at /app/adapt, and this embedded panel.
 *
 * This panel is a compact summary version — the full panel lives in AdaptSettingsPanel.
 * It is intentionally simpler: theme, contrast, text scale, and motion only.
 */
import { useId } from "react";
import { Check } from "lucide-react";
import { useAdaptPreferences } from "@/features/adapt/hooks/useAdaptPreferences";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { ContrastPreferenceControl } from "@/components/accessibility/ContrastPreferenceControl";
import { AppButton } from "@/components/ui/AppButton";
import { useState } from "react";
import type { ProhorTheme } from "@/features/adapt/types/adapt.types";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

const THEME_LABELS: { id: ProhorTheme; label: { en: string; bn: string } }[] = [
  { id: "quiet-garden", label: translations.adapt.defaultTheme },
  { id: "original-rose", label: translations.adapt.originalRose },
  { id: "morning-mist", label: translations.adapt.morningMist },
];

export function AccessPreferencesPanel() {
  const { prefs, updatePref, resetAll } = useAdaptPreferences();
  const uid = useId();
  const [announcement, setAnnouncement] = useState("");
  const { language, t } = useLanguage();

  function announce(msg: string) {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(msg), 20);
  }

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="space-y-6 rounded-2xl border border-pro-border bg-pro-elevated p-5 text-pro-text sm:p-7"
    >
      <div className="space-y-2">
        <h2 id={`${uid}-title`} className="text-2xl font-semibold">
          <span lang={language}>{t(translations.adapt.title)}</span>
        </h2>
        <p className="max-w-prose text-pro-muted">
          <span lang={language}>{t(translations.adapt.intro)}</span>
        </p>
      </div>

      <InlineLiveRegion message={announcement} />

      {/* Theme */}
      <fieldset className="space-y-3">
        <legend className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.appearance)}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {THEME_LABELS.map(({ id, label }) => (
            <label
              key={id}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.theme === id
                  ? "border-pro-primary bg-pro-surface"
                  : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`${uid}-theme`}
                value={id}
                checked={prefs.theme === id}
                onChange={() => {
                  updatePref("theme", id);
                  announce(`Theme changed to ${t(label)}.`);
                }}
                className="accent-pro-primary"
              />
              <span className="text-sm font-medium" lang={language}>{t(label)}</span>
              {prefs.theme === id && (
                <Check size={14} className="ml-auto shrink-0 text-pro-primary" aria-hidden="true" />
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <ContrastPreferenceControl
        compact
        value={prefs.highContrast}
        onChange={value => {
          updatePref("highContrast", value);
          announce(value === null ? "Contrast now follows your device." : value ? "Higher contrast enabled." : "Standard contrast selected.");
        }}
      />

      {/* Reading / access toggles */}
      <fieldset className="space-y-3">
        <legend className="font-semibold text-pro-text" lang={language}>Reading and access</legend>
        <div className="space-y-2">
          {(
            [
              { key: "reducedMotion", label: translations.adapt.reducedMotion },
              { key: "simplifiedContent", label: translations.adapt.simplifiedContent },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-pro-control-border p-3 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"
            >
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => {
                  updatePref(key, e.target.checked);
                  announce(`${t(label)} ${e.target.checked ? "enabled" : "disabled"}.`);
                }}
                className="accent-pro-primary"
              />
              <span className="text-sm font-medium text-pro-text" lang={language}>{t(label)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Text scale */}
      <fieldset className="space-y-3">
        <legend className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.textSize)}</legend>
        <div className="flex gap-2">
          {(
            [
              { value: "default", label: translations.adapt.default },
              { value: "large", label: translations.adapt.large },
              { value: "extra-large", label: translations.adapt.extraLarge },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={[
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg border p-2 text-sm font-medium",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.textScale === value
                  ? "border-pro-primary bg-pro-surface text-pro-primary"
                  : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`${uid}-textscale`}
                value={value}
                checked={prefs.textScale === value}
                onChange={() => {
                  updatePref("textScale", value);
                  announce(`Text size set to ${t(label)}.`);
                }}
                className="sr-only"
              />
              <span lang={language}>{t(label)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <AppButton
          href="/app/adapt"
          variant="primary"
          size="sm"
        >
          <span lang={language}>{t(translations.adapt.fullSettings)}</span>
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => {
            resetAll();
            announce(language === "bn" ? "সব পছন্দ মূল অবস্থায় ফিরেছে।" : "All preferences restored to defaults.");
          }}
        >
          <span lang={language}>{t(translations.adapt.restoreDefaults)}</span>
        </AppButton>
      </div>

      <p className="text-xs text-pro-muted">
        <span lang={language}>{t(translations.adapt.savedInBrowser)}</span>
      </p>
    </section>
  );
}
