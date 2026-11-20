import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModuleCommunication } from "@/components/accessibility/ModuleCommunication";
import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";
import { PreferenceRuntime } from "@/features/adapt/components/PreferenceRuntime";

export const metadata: Metadata = {
  title: { default: "PROHOR | Your care, your way", template: "%s | PROHOR" },
  description:
    "Universal Adaptive AI Maternal & Child Care Ecosystem for Bangladesh.",
  applicationName: "PROHOR",
  appleWebApp: { capable: true, title: "PROHOR", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body><script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} /><PreferenceRuntime />{children}<ModuleCommunication /></body>
    </html>
  );
}
