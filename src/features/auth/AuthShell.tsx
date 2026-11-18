"use client";
import { useEffect } from "react";
import { Brand } from "@/components/ui/Brand";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";
import { useLanguage } from "@/i18n/use-language";
import { applyPreferences, readLocalPreferences } from "@/lib/access-preferences";
import { SlidersHorizontal, Globe2 } from "lucide-react";
import "./auth.css";

export function AuthShell({ children, entry = false }: { children: React.ReactNode; entry?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  useEffect(() => { applyPreferences(readLocalPreferences()); }, []);
  if (entry) return <div className="auth-entry" lang={language}>
    <a href="#auth-main" className="auth-skip">{t({ en: "Skip to form", bn: "ফর্মে যান" })}</a>
    <header className="auth-entry-header"><Brand compact />
      <div className="auth-header-actions">
        <button type="button" className="auth-header-button" onClick={() => setLanguage(language === "bn" ? "en" : "bn")}><Globe2 size={17} aria-hidden="true" />{language === "bn" ? "English" : "বাংলা"}</button>
        <details className="auth-access"><summary><SlidersHorizontal size={17} aria-hidden="true" />{t({ en: "Adjust how you use PROHOR", bn: "আপনার মতো করে প্রহর ব্যবহার করুন" })}</summary>
          <div className="auth-access-panel" lang="en"><AccessPreferencesPanel /></div>
        </details>
      </div>
    </header>
    <main id="auth-main" tabIndex={-1} className="auth-entry-main">{children}</main>
  </div>;
  return <div lang={language} className="min-h-dvh bg-pro-bg text-pro-text">
    <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">{t({ en: "Skip to content", bn: "মূল বিষয়বস্তুতে যান" })}</a>
    <header className="pro-shell flex flex-wrap items-center justify-between gap-4 py-6">
      <Brand />
      <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setLanguage(language === "bn" ? "en" : "bn")}>{language === "bn" ? "English" : "বাংলা"}</button>
    </header>
    <main id="auth-main" tabIndex={-1} className="pro-shell max-w-2xl space-y-6 py-8">
      <details>
        <summary className="cursor-pointer py-3 font-semibold">{t({ en: "Adjust how you use PROHOR", bn: "আপনার মতো করে প্রহর ব্যবহার করুন" })}</summary>
        <div lang="en"><AccessPreferencesPanel /></div>
      </details>
      {children}
    </main>
  </div>;
}
