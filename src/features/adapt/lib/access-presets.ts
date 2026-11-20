// Type-only import: this file must run without runtime imports (see access-presets.test.mjs).
import type { ProhorAccessPreferences } from "@/lib/access-preferences";

/**
 * Presets are bundles of existing settings, named by what they change — never by who they are for.
 * They never touch language or theme, and every one can be undone by restoring the previous object.
 */
export const accessPresetIds = ["large-clear", "calm-simple", "pictures-text"] as const;
export type AccessPresetId = (typeof accessPresetIds)[number];
type PresetPatch = Partial<Omit<ProhorAccessPreferences, "language" | "theme" | "spaciousLayout">>;
export type AccessPreset = {
  id: AccessPresetId;
  patch: PresetPatch;
  en: { name: string; hint: string };
  bn: { name: string; hint: string };
};

export const ACCESS_PRESETS: AccessPreset[] = [
  {
    id: "large-clear",
    patch: { textScale: "extra-large", highContrast: true, layoutDensity: "spacious" },
    en: { name: "Large and clear", hint: "Bigger text, stronger contrast and more space." },
    bn: { name: "বড় ও স্পষ্ট", hint: "বড় লেখা, বেশি কনট্রাস্ট ও বেশি ফাঁকা জায়গা।" },
  },
  {
    id: "calm-simple",
    patch: { reducedMotion: true, focusedView: true },
    en: { name: "Calm and simple", hint: "Less movement and fewer decorations." },
    bn: { name: "শান্ত ও সহজ", hint: "কম নড়াচড়া, কম সাজসজ্জা।" },
  },
  {
    id: "pictures-text",
    patch: { communication: "aac", readAloud: true },
    en: { name: "Pictures and listening", hint: "Picture symbols to ask, and Listen buttons on answers." },
    bn: { name: "ছবি ও শোনা", hint: "ছবি-চিহ্ন দিয়ে প্রশ্ন, উত্তরে শোনার বোতাম।" },
  },
];

function presetById(id: string): AccessPreset {
  const preset = ACCESS_PRESETS.find(item => item.id === id);
  if (!preset) throw new Error(`Unknown access preset: ${id}`);
  return preset;
}

/** Setting keys this preset would change, in the preset's order. Empty means it is already in use. */
export function presetChanges(prefs: ProhorAccessPreferences, id: string): (keyof ProhorAccessPreferences)[] {
  const { patch } = presetById(id);
  return (Object.keys(patch) as (keyof PresetPatch)[]).filter(key => prefs[key] !== patch[key]);
}

/** Returns a new object; the input is untouched so Undo can restore it. */
export function applyAccessPreset(prefs: ProhorAccessPreferences, id: string): ProhorAccessPreferences {
  const next = { ...prefs, ...presetById(id).patch };
  return { ...next, spaciousLayout: next.layoutDensity === "spacious" };
}

export function activeAccessPresets(prefs: ProhorAccessPreferences): AccessPresetId[] {
  return accessPresetIds.filter(id => presetChanges(prefs, id).length === 0);
}
