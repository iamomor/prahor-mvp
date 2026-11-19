"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProhorSymbol } from "@/components/marketing/HomeBrand";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";
import { useLanguage } from "@/i18n/use-language";
import { applyPreferences, readLocalPreferences } from "@/lib/access-preferences";
import { SlidersHorizontal, ArrowUpRight, LifeBuoy } from "lucide-react";
import "./auth.css";

const motherNav = [
  { href: "/app", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { href: "/app/jibonrekha", en: "Records", bn: "রেকর্ড" },
  { href: "/app/bujhi", en: "Reports", bn: "রিপোর্ট" },
  { href: "/app/wellbeing", en: "Wellbeing", bn: "সুস্থতা" },
  { href: "/ask", en: "Ask PROHOR", bn: "প্রশ্ন করুন" },
  { href: "/poth", en: "Find care", bn: "সেবা খুঁজুন" },
  { href: "/app/care", en: "Human help", bn: "মানুষের সাহায্য" },
  { href: "/app/bondhon", en: "Bondhon", bn: "বন্ধন" },
] as const;

export function AuthShell({ children, entry = false, nav }: { children: React.ReactNode; entry?: boolean; nav?: "mother" }) {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
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

  const header = (
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
          {!entry && (
            // Urgent help: same place on every signed-in screen, works without AI (design.md §8.3).
            <Link href="/safety" className="inline-flex min-h-11 items-center gap-1.5 rounded-control border-2 border-pro-danger px-3 font-semibold text-pro-danger focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
              <LifeBuoy size={17} aria-hidden="true" />{t({ en: "Urgent help", bn: "জরুরি সাহায্য" })}
            </Link>
          )}
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
                    bn: "আপনার চোখের আরাম ও সুবিধা অনুযায়ী প্রহর সাজান।",
                  })}
                </p>
              </div>
              <AccessPreferencesPanel />
            </div>
          </details>

          {entry && (
            /* Action pill matching homepage sign-in pill button */
            <Link href="/" className="auth-home-btn">
              <span>{t({ en: "Home", bn: "প্রথম পাতা" })}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );

  if (entry) {
    return (
      <div className="auth-entry" lang={language}>
        <a href="#auth-main" className="auth-skip">
          {t({ en: "Skip to form", bn: "ফর্মে যান" })}
        </a>
        {header}
        <main id="auth-main" tabIndex={-1} className="auth-main">
          {children}
        </main>
      </div>
    );
  }

  // Signed-in shell (mother app, provider, account)
  return (
    <div lang={language} className="min-h-dvh bg-pro-bg text-pro-text">
      <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">
        {t({ en: "Skip to content", bn: "মূল বিষয়বস্তুতে যান" })}
      </a>
      {header}
      {nav === "mother" && (
        <nav aria-label={t({ en: "Your PROHOR", bn: "আপনার প্রহর" })} className="border-b border-pro-border bg-pro-surface">
          {/* Wraps instead of scrolling so long Bangla labels and 200% text never hide a destination. */}
          <ul className="pro-shell flex flex-wrap gap-x-1 gap-y-1 py-2">
            {motherNav.map(item => {
              const current = item.href === "/app" ? pathname === "/app" : pathname?.startsWith(item.href);
              return <li key={item.href}>
                <Link href={item.href} aria-current={current ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-control px-3 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus ${current ? "bg-pro-elevated text-pro-primary underline decoration-2 underline-offset-4" : "text-pro-text hover:bg-pro-elevated"}`}>
                  {t({ en: item.en, bn: item.bn })}
                </Link>
              </li>;
            })}
          </ul>
        </nav>
      )}
      <main id="auth-main" tabIndex={-1} className="pro-shell max-w-5xl space-y-6 py-8">
        {children}
      </main>
    </div>
  );
}
