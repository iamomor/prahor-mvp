"use client";

/**
 * AdaptSettingsPanel — the full in-app settings panel for PROHOR Adapt.
 *
 * This is NOT the marketing homepage dialog (HomePreferences.tsx stays separate).
 * This panel renders in /app/adapt and can be embedded in any module.
 *
 * All preference groups (Phase 2 P1 complete):
 *   1. Appearance (theme)
 *   2. Contrast (independent, with OS-signal hint)
 *   3. Text scale
 *   4. Layout density + text spacing
 *   5. Motion
 *   6. Typeface preset
 *   7. Language
 *   8. Communication preference
 *   9. Simplified content
 *  10. Focused view (P1) ← NEW
 *
 * Design rules:
 * - Only semantic form elements (fieldset/legend, label/input, label/select).
 * - Visible focus rings on every interactive control.
 * - Changing any control applies immediately (live preview).
 * - Announcement via InlineLiveRegion.
 * - No preference resets another preference.
 * - No preference reduces healthcare access.
 * - Every status uses icon + text, never colour alone.
 */
import { useState, useId } from "react";
import {
  Check,
  RotateCcw,
  Palette,
  Eye,
  Type,
  Layout,
  Zap,
  Languages,
  MessageSquare,
  TextCursor,
  Focus,
} from "lucide-react";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { ContrastPreferenceControl } from "@/components/accessibility/ContrastPreferenceControl";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import type { ProhorTheme } from "../types/adapt.types";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

const THEME_OPTIONS: { id: ProhorTheme; label: string; labelBn: string; swatch: string }[] = [
  { id: "quiet-garden", label: "Quiet Garden", labelBn: "শান্ত বাগান", swatch: "#2f6b54" },
  { id: "original-rose", label: "Original Rose", labelBn: "প্রারম্ভিক গোলাপ", swatch: "#70445a" },
  // Note: Morning Mist swatch reflects the actual CSS token (#893c2c) which differs from
  // design.md spec (#075b67). This requires product-owner resolution (see Phase 0 report).
  { id: "morning-mist", label: "Morning Mist", labelBn: "সকালের কুয়াশা", swatch: "#893c2c" },
];

/**
 * Typeface presets available in P0.
 * design.md §5.1: Default (Noto Serif + Manrope + Roboto Slab), Rubik, Noto Serif, Roboto Slab.
 * Google Sans is P1 pending licence verification.
 * Fonts are loaded at root layout level with canonical variable names.
 */
const FONT_OPTIONS: { id: "default" | "rubik" | "noto-serif" | "roboto-slab"; label: string; labelBn: string; preview: string }[] = [
  {
    id: "default",
    label: "Default",
    labelBn: "সাধারণ",
    preview: "Aa — আ",
  },
  {
    id: "rubik",
    label: "Rubik",
    labelBn: "রুবিক",
    preview: "Aa — আ",
  },
  {
    id: "noto-serif",
    label: "Noto Serif",
    labelBn: "নোটো সেরিফ",
    preview: "Aa — আ",
  },
  {
    id: "roboto-slab",
    label: "Roboto Slab",
    labelBn: "রোবোটো স্ল্যাব",
    preview: "Aa — আ",
  },
];

type SectionProps = {
  icon: React.ReactNode;
  titleEn: string;
  titleBn: string;
  children: React.ReactNode;
  id: string;
};

function SettingsSection({ icon, titleEn, titleBn, children, id }: SectionProps) {
  const { language } = useLanguage();
  return (
    <AppCard as="section" aria-labelledby={id}>
      <div className="mb-4 flex items-center gap-3">
        <span className="prohor-decorative flex h-9 w-9 items-center justify-center rounded-control bg-pro-surface text-pro-primary" aria-hidden="true">
          {icon}
        </span>
        <h2 id={id} className="text-base font-semibold text-pro-text">
          <span lang={language}>{language === "bn" ? titleBn : titleEn}</span>
        </h2>
      </div>
      {children}
    </AppCard>
  );
}

export function AdaptSettingsPanel() {
  const { prefs, reading, updatePref, updateReading, resetAll } = useAdaptPreferences();
  const { language, setLanguage, t } = useLanguage();
  const [announcement, setAnnouncement] = useState("");
  const uid = useId();

  function announce(msg: string) {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(msg), 20);
  }

  function handleUpdate<K extends keyof typeof prefs>(key: K, value: typeof prefs[K], label: string) {
    updatePref(key, value);
    announce(label);
  }

  function handleReset() {
    resetAll();
    announce(language === "bn" ? "সব পছন্দ মূল অবস্থায় ফিরেছে।" : "All preferences restored to defaults.");
  }

  return (
    <div className="space-y-[var(--pro-gap-group)]">
      {/* Page intro */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-pro-text" lang={language}>
          {t(translations.adapt.title)}
        </h1>
        <p className="max-w-prose text-pro-muted" lang={language}>
          {t(translations.adapt.intro)}
        </p>
        <p role="note" className="text-sm text-pro-muted" lang={language}>
          {t(translations.adapt.translationStatus)}
        </p>
      </div>

      <InlineLiveRegion message={announcement} />

      {/* 1. Appearance / Theme */}
      <SettingsSection
        id={`${uid}-theme`}
        icon={<Palette size={18} />}
        titleEn="Appearance"
        titleBn="রং ও চেহারা"
      >
        <fieldset>
          <legend className="sr-only" lang={language}>
            {language === "bn" ? "রঙের থিম বেছে নিন" : "Choose a colour theme"}
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ id, label, labelBn, swatch }) => (
              <label
                key={id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-field border p-3 transition-colors",
                  "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                  prefs.theme === id
                    ? "border-pro-primary bg-pro-surface"
                    : "border-pro-control-border hover:bg-pro-surface",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="prohor-theme"
                  value={id}
                  checked={prefs.theme === id}
                  onChange={() => handleUpdate("theme", id, language === "bn" ? `${labelBn} থিম নির্বাচন করা হয়েছে।` : `Theme changed to ${label}.`)}
                  className="accent-pro-primary"
                />
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-pro-border"
                  style={{ background: swatch }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium" lang={language}>
                  {language === "bn" ? labelBn : label}
                </span>
                {prefs.theme === id && (
                  <Check size={16} className="ml-auto shrink-0 text-pro-primary" aria-hidden="true" />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      </SettingsSection>

      {/* 2. Contrast */}
      <SettingsSection
        id={`${uid}-contrast`}
        icon={<Eye size={18} />}
        titleEn="Contrast"
        titleBn="কনট্রাস্ট"
      >
        <div className="space-y-3">
          <ContrastPreferenceControl
            value={prefs.highContrast}
            onChange={value => handleUpdate(
              "highContrast",
              value,
              value === null ? "Contrast now follows your device." : value ? "Higher contrast enabled." : "Standard contrast selected.",
            )}
          />
          <p className="text-sm text-pro-muted" lang={language}>{t(translations.adapt.contrastHelp)}</p>
        </div>
      </SettingsSection>

      {/* 3. Text Scale */}
      <SettingsSection
        id={`${uid}-text`}
        icon={<Type size={18} />}
        titleEn="Text size"
        titleBn="লেখার আকার"
      >
        <fieldset>
          <legend className="sr-only" lang={language}>
            {language === "bn" ? "লেখার আকার বেছে নিন" : "Choose text size"}
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(
              [
                { value: "default", label: "Default", labelBn: "সাধারণ", preview: "Aa" },
                { value: "large", label: "Large", labelBn: "বড়", preview: "Aa" },
                { value: "extra-large", label: "Extra large", labelBn: "আরও বড়", preview: "Aa" },
              ] as const
            ).map(({ value, label, labelBn, preview }) => (
              <label
                key={value}
                className={[
                  "flex flex-1 cursor-pointer items-center gap-3 rounded-field border p-3",
                  "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                  prefs.textScale === value
                    ? "border-pro-primary bg-pro-surface"
                    : "border-pro-control-border hover:bg-pro-surface",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="prohor-text-scale"
                  value={value}
                  checked={prefs.textScale === value}
                  onChange={() =>
                    handleUpdate("textScale", value, `Text size set to ${label}.`)
                  }
                  className="accent-pro-primary"
                />
                <span
                  className="font-semibold text-pro-primary"
                  style={{
                    fontSize:
                      value === "default"
                        ? "1rem"
                        : value === "large"
                          ? "1.2rem"
                          : "1.4rem",
                  }}
                  aria-hidden="true"
                >
                  {preview}
                </span>
                <span className="text-sm font-medium" lang={language}>
                  {language === "bn" ? labelBn : label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </SettingsSection>

      {/* 4. Layout density + text spacing */}
      <SettingsSection
        id={`${uid}-layout`}
        icon={<Layout size={18} />}
        titleEn="Layout & spacing"
        titleBn="বিন্যাস ও ফাঁকা জায়গা"
      >
        <div className="space-y-[var(--pro-gap-field)]">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-pro-text" lang={language}>
              {t(translations.adapt.layoutDensity)}
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              {(
                [
                  { value: "compact", label: translations.adapt.compact },
                  { value: "comfortable", label: translations.adapt.comfortable },
                  { value: "spacious", label: translations.adapt.spacious },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className={[
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-field border p-3",
                    "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                    reading.density === value
                      ? "border-pro-primary bg-pro-surface"
                      : "border-pro-control-border hover:bg-pro-surface",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="prohor-layout"
                    value={value}
                    checked={reading.density === value}
                    onChange={() => {
                      updateReading("density", value);
                      announce(language === "bn" ? `বিন্যাস ${t(label)} করা হয়েছে।` : `Layout set to ${t(label)}.`);
                    }}
                    className="accent-pro-primary"
                  />
                  <span className="text-sm font-medium" lang={language}>{t(label)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
            <input
              type="checkbox"
              checked={reading.textSpacing === "relaxed"}
              onChange={(e) => {
                updateReading("textSpacing", e.target.checked ? "relaxed" : "standard");
                announce(language === "bn"
                  ? (e.target.checked ? "লেখার ফাঁক বাড়ানো হয়েছে।" : "লেখার স্বাভাবিক ফাঁক ফিরেছে।")
                  : (e.target.checked ? "Relaxed text spacing enabled." : "Standard text spacing restored."));
              }}
              className="mt-0.5 accent-pro-primary"
            />
            <div>
              <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.textSpacing)}</span>
              <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.textSpacingHelp)}</p>
            </div>
          </label>
        </div>
      </SettingsSection>

      {/* 5. Motion */}
      <SettingsSection
        id={`${uid}-motion`}
        icon={<Zap size={18} />}
        titleEn="Motion & animation"
        titleBn="নড়াচড়া ও অ্যানিমেশন"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
          <input
            type="checkbox"
            checked={prefs.reducedMotion}
            onChange={(e) =>
              handleUpdate(
                "reducedMotion",
                e.target.checked,
                language === "bn"
                  ? (e.target.checked ? "নড়াচড়া কমানো হয়েছে।" : "নড়াচড়া স্বাভাবিক করা হয়েছে।")
                  : (e.target.checked ? "Reduced motion enabled." : "Reduced motion disabled."),
              )
            }
            className="mt-0.5 accent-pro-primary"
          />
          <div>
            <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.reducedMotion)}</span>
            <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.motionHelp)}</p>
          </div>
        </label>
      </SettingsSection>

      {/* 6. Typeface preset — Phase 1 P0 (was missing, pref stored but no UI) */}
      <SettingsSection
        id={`${uid}-font`}
        icon={<TextCursor size={18} />}
        titleEn="Typeface"
        titleBn="লেখার ধরন"
      >
        <fieldset>
          <legend className="sr-only" lang={language}>
            {language === "bn" ? "অক্ষরের ধরন বেছে নিন" : "Choose a typeface"}
          </legend>
          <p className="mb-3 text-sm text-pro-muted" lang={language}>{t(translations.adapt.typefaceHelp)}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FONT_OPTIONS.map(({ id, label, labelBn, preview }) => (
              <label
                key={id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-field border p-3 transition-colors",
                  "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                  reading.font === id
                    ? "border-pro-primary bg-pro-surface"
                    : "border-pro-control-border hover:bg-pro-surface",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="prohor-font"
                  value={id}
                  checked={reading.font === id}
                  onChange={() => {
                    updateReading("font", id);
                    announce(`Typeface changed to ${label}.`);
                  }}
                  className="accent-pro-primary"
                />
                <span
                  className="shrink-0 text-lg font-semibold text-pro-primary"
                  style={{ fontFamily: id === "default" ? "var(--font-noto-serif), var(--font-manrope), serif" : id === "rubik" ? "var(--font-rubik), sans-serif" : id === "noto-serif" ? "var(--font-noto-serif), serif" : "var(--font-roboto-slab), serif" }}
                  aria-hidden="true"
                >
                  {preview}
                </span>
                <span className="text-sm font-medium" lang={language}>{language === "bn" ? labelBn : label}</span>
                {reading.font === id && (
                  <Check size={16} className="ml-auto shrink-0 text-pro-primary" aria-hidden="true" />
                )}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-pro-muted">
            {language === "bn" ? "Google Sans ব্যবহারের আগে লাইসেন্স যাচাই বাকি।" : "Google Sans is planned and pending licence verification."}
          </p>
        </fieldset>
      </SettingsSection>

      {/* 7. Language */}
      <SettingsSection
        id={`${uid}-language`}
        icon={<Languages size={18} />}
        titleEn="Language"
        titleBn="ভাষা"
      >
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-pro-text">
              <span lang={language}>{t(translations.adapt.language)}</span>
            </legend>
            <div className="flex gap-3">
              <label className={[
                "flex flex-1 cursor-pointer items-center gap-3 rounded-field border p-3",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.language === "bn" ? "border-pro-primary bg-pro-surface" : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}>
                <input
                  type="radio"
                  name="prohor-language"
                  value="bn"
                  checked={prefs.language === "bn"}
                  onChange={() => {
                    setLanguage("bn");
                    announce("ভাষা বাংলা করা হয়েছে।");
                  }}
                  className="accent-pro-primary"
                />
                <span className="text-sm font-semibold" lang="bn">বাংলা</span>
              </label>
              <label className={[
                "flex flex-1 cursor-pointer items-center gap-3 rounded-field border p-3",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.language === "en" ? "border-pro-primary bg-pro-surface" : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}>
                <input
                  type="radio"
                  name="prohor-language"
                  value="en"
                  checked={prefs.language === "en"}
                  onChange={() => {
                    setLanguage("en");
                    announce("Language set to English.");
                  }}
                  className="accent-pro-primary"
                />
                <span className="text-sm font-semibold" lang="en">English</span>
              </label>
            </div>
          </fieldset>
          <p className="rounded-field border border-pro-warning-soft bg-pro-warning-soft px-3 py-2 text-sm text-pro-warning" lang={language}>
            {t(translations.adapt.languageHelp)}
          </p>
        </div>
      </SettingsSection>

      {/* 8. Communication */}
      <SettingsSection
        id={`${uid}-communication`}
        icon={<MessageSquare size={18} />}
        titleEn="Communication"
        titleBn="যোগাযোগের ধরন"
      >
        <div className="space-y-3">
          <p className="text-sm text-pro-muted" lang={language}>{t(translations.adapt.communicationHelp)}</p>
          <fieldset>
            <legend className="sr-only" lang={language}>
              {language === "bn" ? "যোগাযোগের পছন্দ" : "Communication preference"}
            </legend>
            <div className="flex flex-col gap-2">
              <label className={[
                "flex cursor-pointer items-start gap-3 rounded-field border p-4",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.communication === "text" ? "border-pro-primary bg-pro-surface" : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}>
                <input
                  type="radio"
                  name="prohor-communication"
                  value="text"
                  checked={prefs.communication === "text"}
                  onChange={() => handleUpdate("communication", "text", "Text communication selected.")}
                  className="mt-0.5 accent-pro-primary"
                />
                <div>
                  <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.textInput)}</span>
                  <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.textInputHelp)}</p>
                </div>
              </label>
              <label className={[
                "flex cursor-pointer items-start gap-3 rounded-field border p-4",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus",
                prefs.communication === "aac" ? "border-pro-primary bg-pro-surface" : "border-pro-control-border hover:bg-pro-surface",
              ].join(" ")}>
                <input
                  type="radio"
                  name="prohor-communication"
                  value="aac"
                  checked={prefs.communication === "aac"}
                  onChange={() => handleUpdate("communication", "aac", "Picture-and-text AAC selected.")}
                  className="mt-0.5 accent-pro-primary"
                />
                <div>
                  <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.pictureAAC)}</span>
                  <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.pictureAACHelp)}</p>
                </div>
              </label>
            </div>
          </fieldset>
        </div>
      </SettingsSection>

      {/* 9. Simplified content */}
      <SettingsSection
        id={`${uid}-simple`}
        icon={<Type size={18} />}
        titleEn="Reading level"
        titleBn="পড়ার সহজতা"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
          <input
            type="checkbox"
            checked={prefs.simplifiedContent}
            onChange={(e) =>
              handleUpdate(
                "simplifiedContent",
                e.target.checked,
                e.target.checked
                  ? "Simplified wording enabled where reviewed content is available."
                  : "Standard wording restored.",
              )
            }
            className="mt-0.5 accent-pro-primary"
          />
          <div>
            <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.simplified)}</span>
            <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.simplifiedHelp)}</p>
          </div>
        </label>
      </SettingsSection>

      {/* 10. Focused view (P1) */}
      <SettingsSection
        id={`${uid}-focused`}
        icon={<Focus size={18} />}
        titleEn="Focused view"
        titleBn="মনোযোগী দৃশ্য"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
          <input
            type="checkbox"
            checked={prefs.focusedView}
            onChange={(e) =>
              handleUpdate(
                "focusedView",
                e.target.checked,
                e.target.checked
                  ? "Focused view enabled. Decorative elements are reduced."
                  : "Focused view disabled. Full interface restored.",
              )
            }
            className="mt-0.5 accent-pro-primary"
          />
          <div>
            <span className="font-semibold text-pro-text" lang={language}>{t(translations.adapt.focused)}</span>
            <p className="mt-0.5 text-sm text-pro-muted" lang={language}>{t(translations.adapt.focusedHelp)}</p>
          </div>
        </label>
      </SettingsSection>

      {/* Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-field border border-pro-border bg-pro-surface px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-pro-text" lang={language}>{t(translations.adapt.resetToDefaults)}</p>
        </div>
        <AppButton variant="secondary" size="sm" onClick={handleReset}>
          <RotateCcw size={15} aria-hidden="true" />
          <span lang={language}>{t(translations.adapt.restoreDefaults)}</span>
        </AppButton>
      </div>

      <p className="text-xs text-pro-muted" lang={language}>{t(translations.adapt.storageNote)}</p>
    </div>
  );
}
