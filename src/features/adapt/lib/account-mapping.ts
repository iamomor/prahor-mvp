import type { AccessPreferences, PatchAccessPreferences } from "@/lib/contracts/adapt";
import type { ProhorAccessPreferences } from "@/lib/access-preferences";
import type { ReadingPreferences } from "../types/adapt.types";

export type DevicePreferences = { access: ProhorAccessPreferences; reading: ReadingPreferences };
export const accountKeys = ["theme", "highContrast", "textScale", "spaciousLayout", "reducedMotion",
  "simplifiedContent", "communication", "language", "textSpacing", "readAloud"] as const;
export type AccountKey = typeof accountKeys[number];

/** Only supported, deliberate differences; device-only fields (focusedView, font, compact, OS-following contrast) never sync. */
export function accountPatch(device: DevicePreferences, account: AccessPreferences): PatchAccessPreferences {
  const proposed: AccessPreferences = {
    ...account, theme: device.access.theme,
    highContrast: device.access.highContrast ?? account.highContrast,
    textScale: device.access.textScale, spaciousLayout: device.access.layoutDensity === "spacious",
    reducedMotion: device.access.reducedMotion, simplifiedContent: device.access.simplifiedContent,
    communication: device.access.communication, language: device.access.language,
    readAloud: device.access.readAloud ?? account.readAloud,
    textSpacing: device.reading.textSpacing === "relaxed" ? "increased" : "default",
  };
  return Object.fromEntries(accountKeys.filter(key => proposed[key] !== account[key])
    .map(key => [key, proposed[key]])) as PatchAccessPreferences;
}

export function applyAccount(account: AccessPreferences, device: DevicePreferences): DevicePreferences {
  const density = account.spaciousLayout ? "spacious" : device.access.layoutDensity === "compact" ? "compact" : "comfortable";
  return {
    access: { ...device.access, theme: account.theme, textScale: account.textScale,
      highContrast: device.access.highContrast === null ? null : account.highContrast,
      spaciousLayout: account.spaciousLayout, layoutDensity: density,
      reducedMotion: account.reducedMotion, simplifiedContent: account.simplifiedContent,
      communication: account.communication, language: account.language,
      readAloud: account.readAloud },
    reading: { ...device.reading, density, textSpacing: account.textSpacing === "increased" ? "relaxed" : "standard" },
  };
}
