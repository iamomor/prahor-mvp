"use client";

import { SlidersHorizontal } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";

export function AdaptScreen() {
  const { t, openPreferences } = useHome();
  return <><div className="story-type-art" aria-hidden="true"><span>Aa</span><span lang="bn">অ আ</span></div><ScreenTitle icon={<SlidersHorizontal size={24} />} small={t(copy("Adapt", "অ্যাডাপ্ট"))} title={t(copy("Make room for you.", "আপনার মতো করে নিন।"))} />
    <div className="story-settings-list">{[
      [copy("Language", "ভাষা"), copy("বাংলা + English", "বাংলা + English")],
      [copy("Text size", "লেখার আকার"), copy("Your choice", "আপনার পছন্দ")],
      [copy("Appearance", "চেহারা"), copy("Three themes", "তিনটি থিম")],
    ].map(([label, value]) => <div key={label.en}><span>{t(label)}</span><strong>{t(value)}</strong></div>)}</div><button className="home-button story-screen-action" onClick={openPreferences}>{t(copy("Adjust my view", "আমার পছন্দ বদলাই"))}<SlidersHorizontal size={18} aria-hidden="true" /></button></>;
}
