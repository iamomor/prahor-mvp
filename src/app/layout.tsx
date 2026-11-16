import type { Metadata, Viewport } from "next";
import {
  Manrope,
  Noto_Sans_Bengali,
  Noto_Serif,
  Noto_Serif_Bengali,
  Roboto_Slab,
  Rubik,
} from "next/font/google";
import "./globals.css";
import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";

/**
 * PROHOR canonical font loader (Phase 0 fix).
 *
 * All six fonts used by prohor-tokens.css typeface presets are loaded here
 * at root layout level so they are available on every route — marketing and
 * mother-app alike. Variable names MUST match the CSS custom property names
 * referenced in prohor-tokens.css section 4 (--font-manrope, etc.).
 *
 * AGENTS.md / SKILL.md mandate: "two families maximum" per-preset, per-screen.
 * That rule is satisfied at the CSS layer: only the active data-font preset's
 * families are applied. All six families are declared here so switching presets
 * does not require a page load; only the active preset's fonts are downloaded
 * by the browser (the others remain declared but unreferenced until chosen).
 *
 * "Do not ship font files to users" (AGENTS.md) → next/font/google self-hosts
 * via build-time download, served from _next/static/. Users receive only the
 * active subset.
 *
 * Build-time network requirement: next/font/google contacts fonts.googleapis.com
 * once at build time per font. In offline / sandboxed CI environments this will
 * fail. The workaround is to run the production build with network access, or to
 * use next/font/local pointing to pre-downloaded font files. See Phase 0 report.
 */

// Default & record preset: Manrope body/heading, Noto Serif display/record
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-bengali",
});
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif",
});
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif-bengali",
});

// Rubik preset
const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

// Roboto Slab preset (record role in Default; full preset otherwise)
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-roboto-slab",
});

// Collect all CSS variable class names to inject on <body>
const fontVariables = [
  manrope.variable,
  notoSansBengali.variable,
  notoSerif.variable,
  notoSerifBengali.variable,
  rubik.variable,
  robotoSlab.variable,
].join(" ");

export const metadata: Metadata = {
  title: { default: "PROHOR | Your care, your way", template: "%s | PROHOR" },
  description:
    "Universal Adaptive AI Maternal & Child Care Ecosystem for Bangladesh.",
  applicationName: "PROHOR",
  appleWebApp: { capable: true, title: "PROHOR", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFCF5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="quiet-garden" suppressHydrationWarning>
      <body className={fontVariables}>
        {/*
          Apply saved preferences before the first paint to avoid FOUC.
          This runs synchronously as an inline script — it is safe (no user data
          is interpolated) and tiny (< 400 bytes). The script is defined in
          src/components/marketing/preference-bootstrap.ts and validates all
          values before writing any dataset attributes.
        */}
        <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
        {children}
      </body>
    </html>
  );
}
