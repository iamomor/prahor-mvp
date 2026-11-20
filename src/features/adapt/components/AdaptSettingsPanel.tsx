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
 *   9. Read aloud (shows Listen buttons; never autoplays)
 *  10. Focused view (P1)
 * Easy Read (simplifiedContent) appears only when at least one human-approved entry exists (lib/easy-read.ts).
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
  Volume2,
} from "lucide-react";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { AccessPresets } from "./AccessPresets";
import { EasyRead } from "./EasyRead";
import { hasApprovedEasyRead } from "../lib/easy-read";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { ContrastPreferenceControl } from "@/components/accessibility/ContrastPreferenceControl";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import type { ProhorTheme } from "../types/adapt.types";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

const THEME_OPTIONS: { id: ProhorTheme; label: string; labelBn: string; swatch: string }[] = [
  { id: "quiet-garden", label: "Quiet Garden", labelBn: "শান্ত বাগান", swatch: "var(--pro-primary)" },
  { id: "original-rose", label: "Original Rose", labelBn: "প্রারম্ভিক গোলাপ", swatch: "var(--pro-primary)" },
  { id: "morning-mist", label: "Morning Mist", labelBn: "সকালের কুয়াশা", swatch: "var(--pro-primary)" },
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

  const deviceOnly = (
    <p className="mt-2 text-xs text-pro-muted" lang={language}>
      {language === "bn" ? "শুধু এই ডিভাইসে সংরক্ষিত।" : "Saved on this device only."}
    </p>
  );

  return (
    <div className="space-y-[var(--pro-gap-group)]">
      {/* Page intro */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-pro-text" lang={language}>
          {t(translations.adapt.title)}
        </h1>
        <EasyRead id="adapt-settings-intro">
          <p className="max-w-prose text-pro-muted" lang={language}>
            {t(translations.adapt.intro)}
          </p>
        </EasyRead>
        <p role="note" className="text-sm text-pro-muted" lang={language}>
          {t(translations.adapt.translationStatus)}
        </p>
      </div>

      <InlineLiveRegion message={announcement} />

      <AccessPresets />

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
          <p className="text-xs text-pro-muted" lang={language}>
            {language === "bn"
              ? "ডিভাইস অনুসরণ করার পছন্দ শুধু এই ডিভাইসে থাকে; বেশি বা সাধারণ কনট্রাস্ট অ্যাকাউন্টে রাখা যায়।"
              : "Following your device is saved on this device only. More or standard contrast can be saved to your account."}
          </p>
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
            <p className="mt-2 text-xs text-pro-muted" lang={language}>
              {language === "bn" ? "ঘন বিন্যাস শুধু এই ডিভাইসে সংরক্ষিত।" : "Compact is saved on this device only."}
            </p>
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
          {deviceOnly}
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

      {/* Easy Read: shown only when an approved, human-reviewed entry exists, so the toggle never promises nothing. */}
      {hasApprovedEasyRead() && (
        <SettingsSection id={`${uid}-simple`} icon={<Type size={18} />} titleEn="Easy Read" titleBn="সহজ পাঠ">
          <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
            <input
              type="checkbox"
              checked={prefs.simplifiedContent}
              onChange={(e) => handleUpdate("simplifiedContent", e.target.checked,
                language === "bn"
                  ? (e.target.checked ? "পর্যালোচিত সহজ পাঠ যেখানে আছে সেখানে দেখানো হবে।" : "মূল লেখা দেখানো হবে।")
                  : (e.target.checked ? "Easy Read shown where a reviewed version exists." : "Original text shown."))}
              className="mt-0.5 accent-pro-primary"
            />
            <div>
              <span className="font-semibold text-pro-text" lang={language}>{language === "bn" ? "সহজ পাঠ দেখান" : "Show Easy Read"}</span>
              <p className="mt-0.5 text-sm text-pro-muted" lang={language}>
                {language === "bn"
                  ? "মানুষের লেখা ও পর্যালোচিত সহজ পাঠ যেখানে আছে শুধু সেখানে দেখায়। মূল লেখা সবসময় দেখা যায়। স্বাস্থ্য ও জরুরি তথ্য বদলানো হয় না।"
                  : "Shows human-written, reviewed Easy Read only where it exists. The original is always available. Health and emergency information is never changed."}
              </p>
            </div>
          </label>
        </SettingsSection>
      )}

      {/* 9. Read aloud */}
      <SettingsSection
        id={`${uid}-read-aloud`}
        icon={<Volume2 size={18} />}
        titleEn="Read aloud"
        titleBn="পড়ে শোনানো"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-field border border-pro-control-border p-4 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
          <input
            type="checkbox"
            checked={prefs.readAloud === true}
            onChange={(e) =>
              handleUpdate(
                "readAloud",
                e.target.checked,
                language === "bn"
                  ? (e.target.checked ? "শোনার বোতাম দেখানো হবে।" : "শোনার বোতাম আর আগে থেকে দেখানো হবে না।")
                  : (e.target.checked ? "Listen buttons will be shown." : "Listen buttons are no longer shown by default."),
              )
            }
            className="mt-0.5 accent-pro-primary"
          />
          <div>
            <span className="font-semibold text-pro-text" lang={language}>
              {language === "bn" ? "শোনার বোতাম দেখান" : "Show Listen buttons"}
            </span>
            <p className="mt-0.5 text-sm text-pro-muted" lang={language}>
              {language === "bn"
                ? "উত্তরের পাশে শোনার বোতাম দেখাবে। আপনি না চাপলে কোনো শব্দ বাজবে না।"
                : "Shows a Listen button next to answers. Audio only plays when you press Listen."}
            </p>
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
        {deviceOnly}
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
