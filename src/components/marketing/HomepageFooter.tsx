"use client";

import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { HomeBrand } from "./HomeBrand";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

const moduleNames = ["Adapt", "Barta", "Shonket", "Jibonrekha", "Bujhi", "Shusthota", "Poth", "Bondhon"];

export function HomepageFooter() {
  const { t, locale, setLocale, openPreferences, openSignIn } = useHome();
  return <footer className="story-footer refined-footer"><div className="home-container">
    <div className="refined-footer-columns">
      <div className="refined-footer-brand"><HomeBrand /><p lang="en">Your Care. Your Way.</p><p lang="bn">আপনার যত্ন, আপনার মতো।</p><button className="refined-footer-adjust" onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={19} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}</button></div>
      <nav aria-labelledby="footer-modules-title"><h2 id="footer-modules-title">{t(copy("Modules", "মডিউল"))}</h2><ul className="refined-footer-modules">{moduleNames.map(name => <li key={name}><a lang="en" href={`#module-${name.toLowerCase()}`}>{name}</a></li>)}</ul></nav>
      <nav aria-labelledby="footer-explore-title"><h2 id="footer-explore-title">{t(copy("Explore", "ঘুরে দেখুন"))}</h2><ul>{[
        ["#why-prohor", copy("Why PROHOR", "কেন প্রহর")], ["#how-it-works", copy("How it works", "কীভাবে কাজ করে")], ["#responsible-ai", copy("Responsible AI", "দায়িত্বশীল এআই")], ["#roadmap", copy("Roadmap", "পরিকল্পনা")],
      ].map(([href, label]) => <li key={href as string}><a href={href as string}>{t(label as ReturnType<typeof copy>)}</a></li>)}</ul></nav>
      <nav aria-labelledby="footer-start-title"><h2 id="footer-start-title">{t(copy("Get started", "শুরু করুন"))}</h2><ul><li><a href="#features">{t(copy("Explore PROHOR", "প্রহর ঘুরে দেখুন"))}<ArrowUpRight size={16} aria-hidden="true" /></a></li><li><button onClick={openSignIn} aria-haspopup="dialog">{t(copy("Sign in", "সাইন ইন"))}<ArrowUpRight size={16} aria-hidden="true" /></button></li></ul></nav>
    </div>
    <div className="refined-footer-bottom"><span lang="en">© 2026 PROHOR</span><p>{t(copy("Prototype with sample data. Not a medical or emergency service. In an emergency, call 999.", "নমুনা তথ্যসহ প্রোটোটাইপ। চিকিৎসা বা জরুরি সেবা নয়। জরুরি অবস্থায় ৯৯৯-এ কল করুন।"))}</p><button className="refined-footer-language" onClick={() => setLocale(locale === "en" ? "bn" : "en")} aria-label={t(copy("Switch homepage language to Bangla", "প্রথম পাতার ভাষা ইংরেজি করুন"))}><span lang="bn">বাংলা</span><span aria-hidden="true">/</span><span lang="en">EN</span></button></div>
  </div></footer>;
}
