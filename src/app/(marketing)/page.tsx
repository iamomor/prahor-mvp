import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Fraunces, JetBrains_Mono, Manrope, Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
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

const displayFont = Fraunces({ weight: ["500", "600"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", variable: "--font-prohor-fraunces" });
const bodyFont = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-prohor-manrope" });
const tagFont = JetBrains_Mono({ weight: "500", subsets: ["latin"], display: "swap", variable: "--font-prohor-jetbrains" });
const banglaSans = Noto_Sans_Bengali({ subsets: ["bengali"], display: "swap", variable: "--font-prohor-bangla-sans" });
const banglaSerif = Noto_Serif_Bengali({ subsets: ["bengali"], display: "swap", variable: "--font-prohor-bangla-serif" });

export const metadata: Metadata = {
  title: "PROHOR | Maternal care, designed around every mother",
  description:
    "Your Care. Your Way. Discover PROHOR’s vision for connected, inclusive maternal and child care in Bangladesh, with mother-controlled access and responsible AI.",
};

export default function HomePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
      <script dangerouslySetInnerHTML={{ __html: homepageAssetRecovery }} />
      <Homepage imageAvailable={existsSync(join(process.cwd(), "public/images/hero-mother.jpg"))}
        fontVariables={`${displayFont.variable} ${bodyFont.variable} ${tagFont.variable} ${banglaSans.variable} ${banglaSerif.variable}`}
        teamImages={Object.fromEntries(["omor", "iftee", "ifty", "apubo", "samin"].map(name => [name, existsSync(join(process.cwd(), `public/team/${name}.jpg`))]))} />
    </>
  );
}
