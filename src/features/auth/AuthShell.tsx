"use client";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accessibility, ArrowLeft, ArrowRight, ArrowUpRight, Activity, FolderOpen, HandHeart, House, LifeBuoy,
  MapPin, Menu, MessageCircle, ShieldCheck, SlidersHorizontal, Sprout, X, type LucideIcon,
} from "lucide-react";
import { ProhorSymbol } from "@/components/marketing/HomeBrand";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";
import { useLanguage } from "@/i18n/use-language";
import { applyPreferences, readLocalPreferences } from "@/lib/access-preferences";
import { SignOutButton } from "./SignOutButton";
import "@/styles/app-module.css";
import "./auth.css";

type NavItem = { href: string; en: string; bn: string; icon: LucideIcon; module?: string };

/** Primary jobs first; everything else under Explore. One destination per item. */
const careNav: NavItem[] = [
  { href: "/app", en: "Overview", bn: "সংক্ষিপ্ত বিবরণ", icon: House },
  { href: "/app/jibonrekha", en: "My pregnancy", bn: "আমার গর্ভাবস্থা", icon: Activity, module: "Jibonrekha" },
  { href: "/app/ask", en: "Ask PROHOR", bn: "প্রহরকে জিজ্ঞাসা", icon: MessageCircle, module: "Barta" },
  { href: "/app/care", en: "Care & support", bn: "সেবা ও সহায়তা", icon: HandHeart, module: "Shonket" },
];
const exploreNav: NavItem[] = [
  { href: "/app/bondhon", en: "Sharing & supporters", bn: "শেয়ার ও সহায়ক", icon: HandHeart, module: "Bondhon" },
  { href: "/app/bujhi", en: "Reports", bn: "রিপোর্ট", icon: FolderOpen, module: "Bujhi" },
  { href: "/app/wellbeing", en: "Wellbeing & diary", bn: "সুস্থতা ও ডায়েরি", icon: Sprout, module: "Shusthota" },
  { href: "/app/poth", en: "Find care", bn: "সেবা খুঁজুন", icon: MapPin, module: "Poth" },
  // Public on purpose: warning signs must open even if the session has expired.
  { href: "/safety", en: "Warning signs", bn: "সতর্কতার লক্ষণ", icon: ShieldCheck },
  { href: "/app/accessibility", en: "Accessibility", bn: "অ্যাক্সেসিবিলিটি", icon: Accessibility, module: "Adapt" },
];
const mobileNav: NavItem[] = [
  { href: "/app", en: "Home", bn: "হোম", icon: House },
  { href: "/app/jibonrekha", en: "Journey", bn: "সফর", icon: Activity },
  { href: "/app/ask", en: "Ask", bn: "জিজ্ঞাসা", icon: MessageCircle },
  { href: "/app/care", en: "Care", bn: "সেবা", icon: HandHeart },
];
const titles: { prefix: string; en: string; bn: string }[] = [
  ...[...careNav, ...exploreNav].filter(item => item.href !== "/app").map(item => ({ prefix: item.href, en: item.en, bn: item.bn })),
  { prefix: "/app/adapt", en: "Accessibility", bn: "অ্যাক্সেসিবিলিটি" },
];

const isCurrent = (pathname: string | null, href: string) =>
  href === "/app" ? pathname === "/app" : pathname === href || Boolean(pathname?.startsWith(`${href}/`));

export function AuthShell({ children, entry = false, nav, userName }: { children: React.ReactNode; entry?: boolean; nav?: "mother"; userName?: string | null }) {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const accessDetails = useRef<HTMLDetailsElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyPreferences(readLocalPreferences());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && accessDetails.current?.open) accessDetails.current.removeAttribute("open");
    }
    function onClick(event: MouseEvent) {
      if (accessDetails.current?.open && !accessDetails.current.contains(event.target as Node)) accessDetails.current.removeAttribute("open");
    }
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Drawer is a modal dialog: focus moves in on open and back to the menu button on close.
  useEffect(() => {
    if (menuOpen) drawer.current?.querySelector<HTMLElement>("button, a")?.focus();
  }, [menuOpen]);
  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButton.current?.focus());
  }
  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") { event.stopPropagation(); closeMenu(); return; }
    if (event.key !== "Tab" || !drawer.current) return;
    const focusable = drawer.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  const accessPanel = (pill: boolean) => (
    <details className="auth-access" ref={accessDetails}>
      <summary
        className={pill
          ? "inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-pill border border-pro-border bg-pro-elevated px-3.5 text-sm font-semibold text-pro-text shadow-pro-1 hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
          : "auth-access-btn"}
        aria-label={pill ? undefined : t({ en: "Adjust how you use PROHOR", bn: "প্রহর ব্যবহারের ধরন বদলান" })}
      >
        {pill ? <Accessibility size={16} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
        {pill && <span className="sr-only sm:not-sr-only">{t({ en: "Accessibility", bn: "অ্যাক্সেসিবিলিটি" })}</span>}
      </summary>
      <div className="auth-access-panel">
        <div className="auth-access-panel-header">
          <h2 className="text-base font-semibold text-pro-text">{t({ en: "Adjust how you use PROHOR", bn: "প্রহর নিজের মতো সাজান" })}</h2>
          <p className="mt-0.5 text-sm text-pro-muted">{t({ en: "Theme, contrast, text size and spacing. Your unsaved work stays.", bn: "থিম, কনট্রাস্ট, লেখার আকার ও ফাঁকা জায়গা। না-সংরক্ষিত লেখা হারাবে না।" })}</p>
        </div>
        <AccessPreferencesPanel />
      </div>
    </details>
  );

  const languageToggle = (
    <div className="auth-lang-group" role="group" aria-label={t({ en: "Language", bn: "ভাষা" })}>
      <button type="button" className="auth-lang-btn" lang="bn" aria-label="বাংলা" aria-pressed={language === "bn"} onClick={() => setLanguage("bn")}>বাং</button>
      <span className="auth-lang-sep" aria-hidden="true">|</span>
      <button type="button" className="auth-lang-btn" lang="en" aria-label="English" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
    </div>
  );

  const brand = (href: string) => (
    <Link href={href} className="auth-brand" aria-label={t({ en: "PROHOR home", bn: "প্রহর প্রথম পাতা" })}>
      <ProhorSymbol />
      <span lang="en">PROHOR</span>
      <span className="auth-brand-divider" aria-hidden="true">|</span>
      <span className="auth-brand-bn" lang="bn">প্রহর</span>
    </Link>
  );

  if (entry) {
    return (
      <div className="auth-entry" lang={language}>
        <a href="#auth-main" className="auth-skip">{t({ en: "Skip to form", bn: "ফর্মে যান" })}</a>
        <header className="auth-header">
          <div className="auth-header-inner">
            {brand("/")}
            <div className="auth-header-actions">
              {languageToggle}
              {accessPanel(false)}
              <Link href="/" className="auth-home-btn"><span>{t({ en: "Home", bn: "প্রথম পাতা" })}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </header>
        <main id="auth-main" tabIndex={-1} className="auth-main">{children}</main>
      </div>
    );
  }

  if (nav === "mother") {
    const eyebrow = "px-3 text-xs font-semibold text-pro-muted [&:lang(en)]:uppercase [&:lang(en)]:tracking-[0.14em]";
    const navLink = (item: NavItem, onNavigate?: () => void) => {
      const current = isCurrent(pathname, item.href);
      const Icon = item.icon;
      return (
        <Link
          href={item.href}
          aria-current={current ? "page" : undefined}
          onClick={onNavigate}
          className={`flex min-h-11 items-center gap-3 rounded-field px-3 text-[0.95rem] transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus motion-reduce:transition-none ${
            current ? "bg-pro-surface font-semibold text-pro-primary" : "font-medium text-pro-text hover:bg-pro-surface/60"
          }`}
        >
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={current ? "text-pro-primary" : "text-pro-muted"} />
          <span className="grid leading-tight">
            <span>{t(item)}</span>
            {item.module && <span lang="en" className="text-[0.7rem] font-medium text-pro-muted">{item.module}</span>}
          </span>
        </Link>
      );
    };
    const sidebar = (onNavigate?: () => void) => (
      <nav aria-label={t({ en: "PROHOR sections", bn: "প্রহরের অংশসমূহ" })} className="flex flex-1 flex-col gap-7">
        <div className="grid gap-2">
          <h2 className={eyebrow}>{t({ en: "Your care, your way", bn: "আপনার যত্ন, আপনার মতো" })}</h2>
          <ul className="grid gap-0.5">{careNav.map(item => <li key={item.href}>{navLink(item, onNavigate)}</li>)}</ul>
        </div>
        <div className="grid gap-2">
          <h2 className={eyebrow}>{t({ en: "Explore", bn: "আরও দেখুন" })}</h2>
          <ul className="grid gap-0.5">{exploreNav.map(item => <li key={item.href}>{navLink(item, onNavigate)}</li>)}</ul>
        </div>
        <div className="mt-auto grid gap-2">
          <div className="grid gap-2 rounded-card border border-pro-border bg-pro-elevated p-4 shadow-pro-1">
            <span className="inline-flex w-fit items-center gap-1 rounded-pill bg-pro-surface px-2 py-0.5 text-xs font-semibold text-pro-primary">
              <ShieldCheck size={13} aria-hidden="true" />{t({ en: "Private by design", bn: "গোপনীয়তা সুরক্ষিত" })}
            </span>
            <p className="font-semibold leading-snug text-pro-text">{t({ en: "Your space, your choices.", bn: "আপনার জায়গা, আপনার সিদ্ধান্ত।" })}</p>
            <p className="text-sm leading-relaxed text-pro-muted">{t({ en: "Your diary stays private. You choose what to share.", bn: "ডায়েরি গোপন থাকে। কী শেয়ার করবেন, আপনিই ঠিক করেন।" })}</p>
            <Link href="/app/care" onClick={onNavigate} className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-pro-primary hover:underline">
              {t({ en: "Manage what you share", bn: "শেয়ার নিয়ন্ত্রণ করুন" })}<ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <SignOutButton className="flex min-h-11 items-center gap-2 rounded-field px-3 text-sm font-semibold text-pro-muted hover:bg-pro-surface/60 hover:text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus" />
        </div>
      </nav>
    );

    const current = pathname === "/app" ? { en: "Home", bn: "প্রথম পাতা" } : titles.find(item => pathname?.startsWith(item.prefix)) ?? { en: "Home", bn: "প্রথম পাতা" };
    const initial = userName?.trim().charAt(0).toUpperCase();
    // Every module page gets the same frame: back to Home + which PROHOR module you are in.
    const moduleItem = pathname === "/app" ? undefined
      : [...careNav, ...exploreNav].find(item => item.module && (isCurrent(pathname, item.href) || (item.module === "Adapt" && pathname?.startsWith("/app/adapt"))));

    return (
      <div lang={language} className="flex min-h-dvh bg-pro-bg text-pro-text">
        <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-pro-elevated focus:p-3 focus:text-pro-primary focus:shadow-pro-3">
          {t({ en: "Skip to content", bn: "মূল বিষয়বস্তুতে যান" })}
        </a>

        <div className="hidden w-64 shrink-0 border-r border-pro-border bg-pro-surface/40 lg:block">
        <aside className="sticky top-0 flex h-dvh flex-col gap-8 overflow-y-auto px-4 py-6">
          <div className="px-2">{brand("/app")}</div>
          {sidebar()}
        </aside>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-pro-text/40" onClick={closeMenu} aria-hidden="true" />
            <div ref={drawer} role="dialog" aria-modal="true" aria-label={t({ en: "Menu", bn: "মেনু" })} onKeyDown={trapFocus}
              className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-pro-bg px-4 py-4 shadow-pro-3">
              <div className="flex items-center justify-between gap-2 px-2">
                {brand("/app")}
                <button type="button" onClick={closeMenu} className="grid size-11 place-items-center rounded-control text-pro-muted hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-pro-focus" aria-label={t({ en: "Close menu", bn: "মেনু বন্ধ করুন" })}>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {/* Following a link changes the page, so only close; focus return is for the X / Escape paths. */}
              {sidebar(() => setMenuOpen(false))}
            </div>
          </div>
        )}

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-pro-border bg-pro-bg/95 px-4 py-2 backdrop-blur-sm sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button ref={menuButton} type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-label={t({ en: "Open menu", bn: "মেনু খুলুন" })}
                className="grid size-11 shrink-0 place-items-center rounded-control border border-pro-border text-pro-text hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-pro-focus lg:hidden">
                <Menu size={20} aria-hidden="true" />
              </button>
              <div className="grid min-w-0 leading-tight">
                <span className="hidden text-xs text-pro-muted sm:block"><span lang="en">PROHOR</span> / {t(current)}</span>
                <span className="truncate font-semibold text-pro-text">{t(current)}</span>
              </div>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5 sm:gap-2.5">
              <Link href="/safety" className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-pro-danger/60 px-3 text-sm font-semibold text-pro-danger hover:bg-pro-danger-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
                <LifeBuoy size={16} aria-hidden="true" />
                <span className="sr-only md:not-sr-only">{t({ en: "Urgent help", bn: "জরুরি সাহায্য" })}</span>
              </Link>
              {languageToggle}
              {accessPanel(true)}
              <Link href="/account" aria-label={t({ en: "Account", bn: "অ্যাকাউন্ট" })}
                className="hidden size-10 place-items-center rounded-full bg-pro-primary font-semibold text-pro-on-primary ring-2 ring-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus sm:grid">
                <span aria-hidden="true">{initial || "•"}</span>
              </Link>
            </div>
          </header>

          <main id="auth-main" tabIndex={-1} className="app-module mx-auto w-full max-w-[1200px] flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
            {moduleItem && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <Link href="/app" className="inline-flex min-h-11 items-center gap-1.5 rounded-field pr-2 text-sm font-semibold text-pro-primary hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
                  <ArrowLeft size={16} aria-hidden="true" />{t({ en: "Home", bn: "হোম" })}
                </Link>
                <span className="inline-flex items-center gap-2 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-sm font-semibold text-pro-primary">
                  <moduleItem.icon size={15} aria-hidden="true" />
                  <span lang="en">{moduleItem.module}</span>
                  <span className="font-normal text-pro-muted">· {t(moduleItem)}</span>
                </span>
              </div>
            )}
            {children}
          </main>

          <nav aria-label={t({ en: "Quick navigation", bn: "দ্রুত নেভিগেশন" })} className="fixed inset-x-0 bottom-0 z-40 border-t border-pro-border bg-pro-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
            <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-1.5">
              {mobileNav.map(item => {
                const active = isCurrent(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-field text-xs font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus ${active ? "bg-pro-surface text-pro-primary" : "text-pro-muted hover:text-pro-text"}`}>
                      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                      <span>{t(item)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  }

  // Provider, supporter and account shells
  return (
    <div lang={language} className="min-h-dvh bg-pro-bg text-pro-text">
      <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">{t({ en: "Skip to content", bn: "মূল বিষয়বস্তুতে যান" })}</a>
      <header className="auth-header">
        <div className="auth-header-inner">
          {brand("/")}
          <div className="auth-header-actions">
            <Link href="/safety" className="inline-flex min-h-11 items-center gap-1.5 rounded-control border-2 border-pro-danger px-3 font-semibold text-pro-danger focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
              <LifeBuoy size={17} aria-hidden="true" />{t({ en: "Urgent help", bn: "জরুরি সাহায্য" })}
            </Link>
            {languageToggle}
            {accessPanel(false)}
          </div>
        </div>
      </header>
      <main id="auth-main" tabIndex={-1} className="pro-shell-wide max-w-7xl space-y-8 py-8">{children}</main>
    </div>
  );
}
