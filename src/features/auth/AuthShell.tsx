"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProhorSymbol } from "@/components/marketing/HomeBrand";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";
import { useLanguage } from "@/i18n/use-language";
import { applyPreferences, readLocalPreferences } from "@/lib/access-preferences";
import { SlidersHorizontal, ArrowUpRight } from "lucide-react";
import "./auth.css";

export function AuthShell({ children, entry = false }: { children: React.ReactNode; entry?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const accessDetails = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    applyPreferences(readLocalPreferences());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && accessDetails.current?.open) {
        accessDetails.current.removeAttribute("open");
      }
    }
    function handleClickOutside(event: MouseEvent) {
      if (accessDetails.current?.open && !accessDetails.current.contains(event.target as Node)) {
        accessDetails.current.removeAttribute("open");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (entry) {
    return (
      <div className="auth-entry" lang={language}>
        <a href="#auth-main" className="auth-skip">
          {t({ en: "Skip to form", bn: "ফর্মে যান" })}
        </a>

        <header className="auth-header">
          <div className="auth-header-inner">
            <Link
              href="/"
              className="auth-brand"
              aria-label={t({ en: "PROHOR home", bn: "প্রহর প্রথম পাতা" })}
            >
              <ProhorSymbol />
              <span lang="en">PROHOR</span>
              <span className="auth-brand-divider" aria-hidden="true">|</span>
              <span className="auth-brand-bn" lang="bn">প্রহর</span>
            </Link>

            <div className="auth-header-actions">
              {/* Language switcher matching homepage nav-language */}
              <div className="auth-lang-group" role="group" aria-label={t({ en: "Language", bn: "ভাষা" })}>
                <button
                  type="button"
                  className="auth-lang-btn"
                  lang="bn"
                  aria-label="বাংলা"
                  aria-pressed={language === "bn"}
                  onClick={() => setLanguage("bn")}
                >
                  বাং
                </button>
                <span className="auth-lang-sep" aria-hidden="true">|</span>
                <button
                  type="button"
                  className="auth-lang-btn"
                  lang="en"
                  aria-label="English"
                  aria-pressed={language === "en"}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </button>
              </div>

              {/* Access preferences using native details/summary for a11y & tests */}
              <details className="auth-access" ref={accessDetails}>
                <summary
                  className="auth-access-btn"
                  aria-label={t({ en: "Adjust how you use PROHOR", bn: "প্রহর ব্যবহারের ধরন বদলান" })}
                >
                  <SlidersHorizontal size={18} aria-hidden="true" />
                </summary>
                <div className="auth-access-panel" lang="en">
                  <div className="auth-access-panel-header">
                    <h3 className="text-base font-semibold text-pro-text">
                      {t({ en: "Access & Appearance", bn: "ব্যবহারের ধরন ও রঙ" })}
                    </h3>
                    <p className="text-xs text-pro-muted mt-0.5">
                      {t({
                        en: "Customize theme, contrast, text size, and layout density.",
                        bn: "আপনার চোখের আরাম ও সুবিধা অনুযায়ী প্রহর সাজান।",
                      })}
                    </p>
                  </div>
                  <AccessPreferencesPanel />
                </div>
              </details>

              {/* Action pill matching homepage sign-in pill button */}
              <Link href="/" className="auth-home-btn">
                <span>{t({ en: "Home", bn: "প্রথম পাতা" })}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <main id="auth-main" tabIndex={-1} className="auth-main">
          {children}
        </main>
      </div>
    );
  }

  // Non-entry shell (e.g. account management)
  return (
    <div lang={language} className="min-h-dvh bg-pro-bg text-pro-text">
      <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">
        {t({ en: "Skip to content", bn: "মূল বিষয়বস্তুতে যান" })}
      </a>
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link
            href="/"
            className="auth-brand"
            aria-label={t({ en: "PROHOR home", bn: "প্রহর প্রথম পাতা" })}
          >
            <ProhorSymbol />
            <span lang="en">PROHOR</span>
            <span className="auth-brand-divider" aria-hidden="true">|</span>
            <span className="auth-brand-bn" lang="bn">প্রহর</span>
          </Link>
          <div className="auth-header-actions">
            <div className="auth-lang-group" role="group" aria-label={t({ en: "Language", bn: "ভাষা" })}>
              <button
                type="button"
                className="auth-lang-btn"
                lang="bn"
                aria-label="বাংলা"
                aria-pressed={language === "bn"}
                onClick={() => setLanguage("bn")}
              >
                বাং
              </button>
              <span className="auth-lang-sep" aria-hidden="true">|</span>
              <button
                type="button"
                className="auth-lang-btn"
                lang="en"
                aria-label="English"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>
      <main id="auth-main" tabIndex={-1} className="pro-shell max-w-2xl space-y-6 py-8">
        {children}
      </main>
    </div>
  );
}
