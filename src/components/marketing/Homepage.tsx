"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { applyPreferences, readLocalPreferences, saveLocalPreferences } from "@/lib/access-preferences";
import { HomeContext } from "./HomeContext";
import { HomePreferences, applyReadingPreferences, readReadingPreferences } from "./HomePreferences";
import { PublicNav } from "./PublicNav";
import { AdaptStory, HeroStory, ProblemStory, RoadmapStory, StoryFooter } from "./HomepageStory";
import { AudiencePanels, CompanionStory, FinalCTA, JourneyStory, ProductStrip, ResponsibleCards, SupportStory, TeamStory } from "./HomepageUpgrade";
import { SignInNotice } from "./SignInNotice";
import { copy, type Locale } from "./home-content";

export function Homepage({ fontVariables }: { fontVariables: string }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const initialLanguage = useRef<string | null>(null);
  const languageChosen = useRef(false);
  const previewFocusFrame = useRef<number | null>(null);

  useEffect(() => {
    initialLanguage.current = document.documentElement.lang;
    const saved = readLocalPreferences();
    applyPreferences(saved);
    applyReadingPreferences(readReadingPreferences());
    const stored = (() => { try { return localStorage.getItem("prohor-access-preferences-v1"); } catch { return null; } })();
    const chosen = stored ? saved.language : "en";
    document.documentElement.lang = chosen;
    const timer = setTimeout(() => { if (!languageChosen.current) setLocaleState(chosen); setOffline(!navigator.onLine); }, 0);
    const updateOnline = () => setOffline(!navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      clearTimeout(timer);
      if (previewFocusFrame.current !== null) cancelAnimationFrame(previewFocusFrame.current);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      if (initialLanguage.current) document.documentElement.lang = initialLanguage.current;
    };
  }, []);

  // Sections fade in as they arrive. Without JS (or with reduced motion via CSS) nothing is hidden.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pro-home");
    if (!root || !("IntersectionObserver" in window)) return;
    // Every section is covered by the hiding CSS, so the hero (and anything already on screen
    // or scrolled past on reload) is revealed immediately below; only sections ahead fade in.
    const sections = Array.from(root.querySelectorAll<HTMLElement>("main > section"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).dataset.revealed = "true";
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    sections.forEach(section => { if (section.getBoundingClientRect().top < innerHeight) section.dataset.revealed = "true"; else observer.observe(section); });
    root.dataset.reveal = "ready";
    const revealFocused = (event: globalThis.FocusEvent) => { const section = (event.target as Element).closest?.<HTMLElement>("main > section"); if (section) section.dataset.revealed = "true"; };
    root.addEventListener("focusin", revealFocused);
    return () => { observer.disconnect(); root.removeEventListener("focusin", revealFocused); };
  }, []);

  function setLocale(next: Locale) {
    languageChosen.current = true;
    setLocaleState(next);
    document.documentElement.lang = next;
    saveLocalPreferences({ ...readLocalPreferences(), language: next });
    window.dispatchEvent(new CustomEvent("prohor-preferences-change"));
  }

  function keepPreviewFocusVisible(event: FocusEvent<HTMLDivElement>) {
    const element = event.target;
    if (!element.closest("main")) return;
    if (previewFocusFrame.current !== null) cancelAnimationFrame(previewFocusFrame.current);
    // Native focus can center tall content beneath the sticky header.
    // Correct only that overlap, after the browser completes its own scroll.
    previewFocusFrame.current = requestAnimationFrame(() => {
      const header = element.closest(".pro-home")?.querySelector("header");
      if (document.activeElement !== element || !header || getComputedStyle(header).position !== "sticky") return;
      const gap = element.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
      if (gap < 8) window.scrollBy({ top: gap - 16, behavior: "instant" });
    });
  }

  return <HomeContext.Provider value={{ locale, setLocale, openPreferences: () => setPreferencesOpen(true), openSignIn: () => setSignInOpen(true) }}><div className={`pro-home ${fontVariables}`} lang={locale} onFocus={keepPreviewFocusVisible}>
    <a className="home-skip" href="#main-content">{copy("Skip to main content", "মূল বিষয়বস্তুতে যান")[locale]}</a>
    <PublicNav />
    {offline && <p className="home-offline" role="status">{copy("You’re offline. Already loaded content is available; this homepage does not send care requests.", "আপনি অফলাইনে আছেন। আগে লোড হওয়া বিষয় পড়তে পারবেন; এই পাতা থেকে সেবার অনুরোধ পাঠানো হয় না।")[locale]}</p>}
    <main id="main-content" tabIndex={-1}>
      <HeroStory />
      <ProductStrip />
      <ProblemStory />
      <AdaptStory />
      <CompanionStory />
      <JourneyStory />
      <SupportStory />
      <AudiencePanels />
      <ResponsibleCards />
      <TeamStory />
      <RoadmapStory />
      <FinalCTA />
    </main>
    <StoryFooter />
    {preferencesOpen && <HomePreferences open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />}
    {signInOpen && <SignInNotice onClose={() => setSignInOpen(false)} />}
  </div></HomeContext.Provider>;
}
