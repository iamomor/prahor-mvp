import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { Homepage } from "@/components/marketing/Homepage";
import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";
import { homepageAssetRecovery } from "@/components/marketing/asset-recovery";
import "@/components/marketing/homepage.css";
import "@/components/marketing/homepage-story.css";
import "@/components/marketing/homepage-upgrade.css";
import "@/components/marketing/homepage-refinement.css";
import "@/components/marketing/homepage-polish.css";
import "@/components/marketing/homepage-hero.css";
import "@/components/marketing/homepage-navigation.css";
import "@/components/marketing/homepage-care.css";

/*
 * Phase 0 font fix: Manrope, Noto Sans Bengali, Noto Serif Bengali, Noto Serif,
 * Rubik, and Roboto Slab are now loaded at root layout level (src/app/layout.tsx)
 * with canonical variable names matching prohor-tokens.css section 4:
 *   --font-manrope, --font-noto-sans-bengali, --font-noto-serif,
 *   --font-noto-serif-bengali, --font-rubik, --font-roboto-slab.
 *
 * This page previously re-loaded Manrope, Noto Sans Bengali and Noto Serif Bengali
 * under mismatched names (--font-prohor-manrope, --font-prohor-bangla-sans,
 * --font-prohor-bangla-serif) that prohor-tokens.css could NOT resolve, leaving
 * the Default preset body/heading/bangla roles unresolved.
 *
 * Marketing-only fonts (Fraunces for hero display; JetBrains Mono for tag accents)
 * remain here as page-local extras under their own prefixed variable names.
 * They are not referenced by prohor-tokens.css and are only used in marketing CSS.
 *
 * OPEN CONFLICT (requires product-owner decision — see Phase 0 report):
 * Fraunces is used as the marketing hero display font but is not listed in
 * design.md's five typeface presets. The standard display role in the Default
 * preset uses Noto Serif. JetBrains Mono is likewise marketing-only. These are
 * acceptable as marketing extras as long as they do not appear inside the
 * mother-app routes or the AccessPreferencesPanel.
 */
const displayFont = Fraunces({
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-prohor-fraunces",
});
const tagFont = JetBrains_Mono({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-prohor-jetbrains",
});

export const metadata: Metadata = {
  title: "PROHOR | Maternal care, designed around every mother",
  description:
    "Your Care. Your Way. Discover PROHOR's vision for connected, inclusive maternal and child care in Bangladesh, with mother-controlled access and responsible AI.",
};

export default function HomePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
      <script dangerouslySetInnerHTML={{ __html: homepageAssetRecovery }} />
      <Homepage
        imageAvailable={existsSync(join(process.cwd(), "public/images/hero-mother.jpg"))}
        fontVariables={`${displayFont.variable} ${tagFont.variable}`}
        teamImages={Object.fromEntries(
          ["omor", "iftee", "ifty", "apubo", "samin"].map((name) => [
            name,
            existsSync(join(process.cwd(), `public/team/${name}.jpg`)),
          ]),
        )}
      />
    </>
  );
}
