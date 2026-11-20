"use client";
import { useRef, useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { useLanguage } from "@/i18n/use-language";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { ACCESS_PRESETS, activeAccessPresets, applyAccessPreset, presetChanges, type AccessPresetId } from "../lib/access-presets";
import type { ProhorAccessPreferences } from "../types/adapt.types";

type Copy = { en: string; bn: string };
const SETTING_NAMES: Partial<Record<keyof ProhorAccessPreferences, Copy>> = {
  textScale: { en: "Text size", bn: "লেখার আকার" },
  highContrast: { en: "Contrast", bn: "কনট্রাস্ট" },
  layoutDensity: { en: "Layout", bn: "বিন্যাস" },
  reducedMotion: { en: "Reduce motion", bn: "নড়াচড়া কমানো" },
  focusedView: { en: "Focused view", bn: "মনোযোগী দৃশ্য" },
  communication: { en: "Communication", bn: "যোগাযোগ" },
  readAloud: { en: "Listen buttons", bn: "শোনার বোতাম" },
};
const VALUE_NAMES: Record<string, Copy> = {
  default: { en: "Default", bn: "সাধারণ" }, large: { en: "Large", bn: "বড়" }, "extra-large": { en: "Extra large", bn: "আরও বড়" },
  comfortable: { en: "Comfortable", bn: "আরামদায়ক" }, compact: { en: "Compact", bn: "ঘন" }, spacious: { en: "Spacious", bn: "প্রশস্ত" },
  text: { en: "Text", bn: "লেখা" }, aac: { en: "Pictures and text", bn: "ছবি ও লেখা" },
  true: { en: "On", bn: "চালু" }, false: { en: "Off", bn: "বন্ধ" }, null: { en: "Follow my device", bn: "ডিভাইস অনুসরণ" },
};
const btn = "pro-btn pro-btn-secondary max-w-full whitespace-normal!";
const contrastValue: Record<string, Copy> = { true: { en: "More", bn: "বেশি" }, false: { en: "Standard", bn: "সাধারণ" } };

/** Preview → Apply → Undo for setting bundles. Saves through the same path as every other setting. */
export function AccessPresets() {
  const { prefs, setPrefs } = useAdaptPreferences();
  const { language } = useLanguage();
  const pick = (copy: Copy) => copy[language];
  const [previewing, setPreviewing] = useState<AccessPresetId | null>(null);
  const [undo, setUndo] = useState<{ id: AccessPresetId; before: ProhorAccessPreferences } | null>(null);
  const [message, setMessage] = useState("");
  const buttons = useRef<Partial<Record<AccessPresetId, HTMLButtonElement | null>>>({});
  const active = activeAccessPresets(prefs);
  const undoName = undo ? ACCESS_PRESETS.find(item => item.id === undo.id)![language].name : "";
  const valueName = (key: keyof ProhorAccessPreferences, value: unknown) =>
    pick((key === "highContrast" && contrastValue[String(value)]) || VALUE_NAMES[key === "readAloud" ? String(value === true) : String(value)] || { en: String(value), bn: String(value) });

  function apply(id: AccessPresetId, name: string) {
    setUndo({ id, before: prefs });
    setPrefs(applyAccessPreset(prefs, id));
    setPreviewing(null);
    setMessage(language === "bn" ? `${name} চালু হয়েছে। চাইলে আগের অবস্থায় ফেরাতে পারেন।` : `${name} applied. You can undo it.`);
  }
  function restore() {
    if (!undo) return;
    setPrefs(undo.before);
    setMessage(language === "bn" ? "আগের সেটিংস ফিরিয়ে আনা হয়েছে।" : "Your previous settings are back.");
    buttons.current[undo.id]?.focus();
    setUndo(null);
  }

  return (
    <AppCard as="section" aria-labelledby="access-presets-title">
      <h2 id="access-presets-title" className="text-base font-semibold text-pro-text" lang={language}>
        {language === "bn" ? "একসঙ্গে কয়েকটি পরিবর্তন" : "Quick setting bundles"}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-pro-muted" lang={language}>
        {language === "bn"
          ? "প্রতিটি বান্ডেল কয়েকটি সেটিং একসঙ্গে বদলায়। আগে দেখে নিন, তারপর চালু করুন। ভাষা ও থিম বদলায় না।"
          : "Each bundle changes a few settings together. Preview first, then apply. Your language and theme stay the same."}
      </p>
      <InlineLiveRegion message={message} />
      {undo && (
        <button type="button" className={`${btn} mt-2`} onClick={restore}>
          <span lang={language}>{language === "bn" ? `${undoName} বাতিল করে আগের অবস্থায় ফেরান` : `Undo ${undoName}`}</span>
        </button>
      )}
      <ul className="mt-4 grid gap-3">
        {ACCESS_PRESETS.map(preset => {
          const copy = preset[language];
          const changes = presetChanges(prefs, preset.id);
          const open = previewing === preset.id;
          const panelId = `access-preset-${preset.id}`;
          return (
            <li key={preset.id} className="rounded-field border border-pro-control-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-pro-text" lang={language}>{copy.name}</h3>
                  <p className="text-sm text-pro-muted" lang={language}>{copy.hint}</p>
                  {active.includes(preset.id) && (
                    <p className="mt-1 text-sm font-semibold text-pro-primary" lang={language}>{language === "bn" ? "✓ এখন চালু" : "✓ In use now"}</p>
                  )}
                </div>
                <button
                  ref={node => { buttons.current[preset.id] = node; }}
                  type="button" className={btn} aria-expanded={open} aria-controls={panelId}
                  onClick={() => setPreviewing(open ? null : preset.id)}
                >
                  <span lang={language}>{language === "bn" ? `${copy.name}: দেখুন কী বদলাবে` : `Preview ${copy.name}`}</span>
                </button>
              </div>
              {open && (
                <div id={panelId} className="mt-3 border-t border-pro-border pt-3">
                  {changes.length ? (
                    <>
                      <p className="text-sm font-semibold text-pro-text" lang={language}>{language === "bn" ? "যা বদলাবে:" : "What will change:"}</p>
                      <ul className="mt-1 list-disc ps-5 text-sm text-pro-text">
                        {changes.map(key => (
                          <li key={key} lang={language}>
                            {pick(SETTING_NAMES[key] ?? { en: key, bn: key })}: {valueName(key, prefs[key])} → {valueName(key, preset.patch[key as keyof typeof preset.patch])}
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="pro-btn pro-btn-primary mt-3 max-w-full whitespace-normal!" onClick={() => apply(preset.id, copy.name)}>
                        <span lang={language}>{language === "bn" ? `${copy.name} চালু করুন` : `Apply ${copy.name}`}</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-pro-muted" lang={language}>{language === "bn" ? "এই সেটিংসগুলো আগেই চালু আছে।" : "These settings are already in use."}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </AppCard>
  );
}
