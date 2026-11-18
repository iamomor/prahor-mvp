"use client";

import { useId, useSyncExternalStore } from "react";
import type { ProhorAccessPreferences } from "@/lib/access-preferences";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

type ContrastValue = ProhorAccessPreferences["highContrast"];

const MEDIA_QUERY = "(prefers-contrast: more)";

function subscribeToContrast(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemContrast() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(MEDIA_QUERY).matches
    : false;
}

export function useSystemContrastPreference() {
  return useSyncExternalStore(subscribeToContrast, getSystemContrast, () => false);
}

const options: { value: ContrastValue; label: { en: string; bn: string } }[] = [
  { value: null, label: translations.adapt.followDevice },
  { value: false, label: translations.adapt.standardContrast },
  { value: true, label: translations.adapt.higherContrast },
];

export function ContrastPreferenceControl({
  value,
  onChange,
  compact = false,
}: {
  value: ContrastValue;
  onChange: (value: ContrastValue) => void;
  compact?: boolean;
}) {
  const id = useId();
  const systemMore = useSystemContrastPreference();
  const { language, t } = useLanguage();

  return (
    <fieldset className={compact ? "space-y-2" : "space-y-3"}>
      <legend className="font-semibold text-pro-text">
        <span lang={language}>{t(translations.adapt.contrast)}</span>
      </legend>
      <div className={compact ? "grid gap-2 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-3"}>
        {options.map(option => (
          <label
            key={String(option.value)}
            className="flex cursor-pointer items-start gap-2 rounded-field border border-pro-control-border p-3 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus"
          >
            <input
              type="radio"
              name={`${id}-contrast`}
              value={option.value === null ? "system" : option.value ? "more" : "standard"}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 accent-pro-primary"
            />
            <span className="text-sm font-medium text-pro-text" lang={language}>{t(option.label)}</span>
          </label>
        ))}
      </div>
      {value === null && (
        <p role="status" aria-live="polite" className="text-xs text-pro-muted" lang="en">
          {t(systemMore ? translations.adapt.systemMore : translations.adapt.systemStandard)}
        </p>
      )}
    </fieldset>
  );
}
