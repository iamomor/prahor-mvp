"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Menu, SlidersHorizontal, X } from "lucide-react";
import { HomeBrand } from "./HomeBrand";
import { copy } from "./home-content";
import { useHome } from "./HomeContext";

// Same order as the sections on the page, so the menu always reads top to bottom.
const links = [
  ["#why-prohor", copy("Why PROHOR", "কেন প্রহর")],
  ["#your-way", copy("Your way", "আপনার মতো")],
  ["#features", copy("Features", "সুবিধাসমূহ")],
  ["#how-it-works", copy("How it works", "যেভাবে কাজ করে")],
  ["#responsible-ai", copy("Responsible AI", "দায়িত্বশীল এআই")],
] as const;

function LanguageControl() {
  const { locale, setLocale, t } = useHome();
  return <div className="nav-language" role="group" aria-label={t(copy("Homepage language", "প্রথম পাতার ভাষা"))}>
    <button lang="bn" aria-label="Read this homepage in Bangla" aria-pressed={locale === "bn"} onClick={() => setLocale("bn")}>বাং</button>
    <span aria-hidden="true">|</span>
    <button lang="en" aria-label="Read this homepage in English" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
  </div>;
}

export function PublicNav() {
  const { openPreferences, openSignIn, t } = useHome();
  const [expanded, setExpanded] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = document.querySelector(".story-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShrunk(!entry.isIntersecting && entry.boundingClientRect.bottom < 80), { rootMargin: "-80px 0px 0px", threshold: 0 });
    observer.observe(hero);
    let frame = 0;
    const update = () => {
      frame = 0;
      const lowerEdge = header.current?.getBoundingClientRect().bottom ?? 80;
      const current = links.find(([href]) => {
        const section = document.getElementById(href.slice(1));
        if (!section) return false;
        const box = section.getBoundingClientRect();
        return box.top <= innerHeight * .45 && box.bottom > lowerEdge;
      });
      setActive(current?.[0] ?? null);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);

  useEffect(() => {
    if (!expanded || !sheet.current) return;
    const dialog = sheet.current;
    const trigger = menuButton.current;
    const brand = header.current?.querySelector<HTMLAnchorElement>(".home-brand");
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    closeButton.current?.focus();
    const checkLayout = () => { if (trigger && getComputedStyle(trigger).display === "none") setExpanded(false); };
    window.addEventListener("resize", checkLayout);
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      window.removeEventListener("resize", checkLayout);
      if (trigger?.isConnected && getComputedStyle(trigger).display !== "none") trigger.focus({ preventScroll: true });
      else if (brand?.isConnected) brand.focus({ preventScroll: true });
    };
  }, [expanded]);

  function closeMenu() { setExpanded(false); }
  function trapMenuFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  function openFromMenu(action: () => void) {
    sheet.current?.close();
    menuButton.current?.focus({ preventScroll: true });
    setExpanded(false);
    action();
  }
  const adjustLabel = t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"));

  return <header className="home-header floating-nav clean-nav" ref={header} data-shrunk={shrunk ? "true" : "false"}>
    <div className="home-container home-nav">
      <HomeBrand />
      <nav className="home-desktop-nav" aria-label={t(copy("Primary", "প্রধান নেভিগেশন"))}>
        {links.map(([href, label]) => <a key={href} href={href} aria-current={active === href ? "location" : undefined} onClick={() => setActive(href)}>{t(label)}</a>)}
      </nav>
      <div className="home-nav-actions">
        <div className="nav-desktop-language"><LanguageControl /></div>
        <div className="nav-access-wrap" data-tooltip-dismissed={tooltipDismissed} onMouseEnter={() => setTooltipDismissed(false)} onFocus={() => setTooltipDismissed(false)}><button className="home-access-button" onClick={openPreferences} onKeyDown={event => { if (event.key === "Escape") setTooltipDismissed(true); }} aria-haspopup="dialog" aria-label={adjustLabel} aria-describedby="nav-adjust-tooltip"><SlidersHorizontal size={20} aria-hidden="true" /></button><span id="nav-adjust-tooltip" className="nav-adjust-tooltip" role="tooltip">{adjustLabel}</span></div>
        <button className="home-sign-in" onClick={openSignIn} aria-haspopup="dialog">{t(copy("Sign in", "সাইন ইন"))}<ArrowUpRight size={17} aria-hidden="true" /></button>
        <button className="home-menu-button" ref={menuButton} aria-expanded={expanded} aria-controls="home-mobile-menu" aria-haspopup="dialog" aria-label={t(copy("Open navigation", "নেভিগেশন খুলুন"))} onClick={() => setExpanded(true)}><Menu size={22} aria-hidden="true" /></button>
      </div>
    </div>
    <dialog ref={sheet} id="home-mobile-menu" className="nav-mobile-sheet" aria-labelledby="nav-sheet-title" onKeyDown={trapMenuFocus} onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={closeMenu}>
      <div className="nav-sheet-heading"><h2 id="nav-sheet-title">{t(copy("Explore PROHOR", "প্রহর ঘুরে দেখুন"))}</h2><button ref={closeButton} className="nav-sheet-close" aria-label={t(copy("Close navigation", "নেভিগেশন বন্ধ করুন"))} onClick={closeMenu}><X size={24} aria-hidden="true" /></button></div>
      <nav aria-label={t(copy("Mobile primary", "মোবাইল প্রধান নেভিগেশন"))}>{links.map(([href, label]) => <a key={href} href={href} aria-current={active === href ? "location" : undefined} onClick={() => { setActive(href); closeMenu(); }}>{t(label)}<ArrowUpRight size={21} aria-hidden="true" /></a>)}</nav>
      <div className="nav-sheet-language"><span>{t(copy("Language", "ভাষা"))}</span><LanguageControl /></div>
      <button className="nav-sheet-adjust" onClick={() => openFromMenu(openPreferences)} aria-haspopup="dialog"><SlidersHorizontal size={20} aria-hidden="true" />{adjustLabel}</button>
      <button className="nav-sheet-sign-in" onClick={() => openFromMenu(openSignIn)} aria-haspopup="dialog">{t(copy("Sign in", "সাইন ইন"))}<ArrowUpRight size={20} aria-hidden="true" /></button>
    </dialog>
  </header>;
}
