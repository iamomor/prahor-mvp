import { nav, emergencyBar, finalCta, footer } from "./translations/navigation";
import { hero, taskStrip, context } from "./translations/introduction";
import { adaptability, persona } from "./translations/accessibility";
import { journey, modulesGrid, dualTimeline } from "./translations/modules";
import { shusthota, bondhon, poth } from "./translations/care";
import { aiIntegrity, trust, faq } from "./translations/trust";

export type Language = "bn" | "en";

export const translations = {
  nav,
  emergencyBar,
  hero,
  taskStrip,
  context,
  adaptability,
  journey,
  modulesGrid,
  dualTimeline,
  aiIntegrity,
  persona,
  shusthota,
  bondhon,
  poth,
  trust,
  faq,
  finalCta,
  footer,
} as const;
