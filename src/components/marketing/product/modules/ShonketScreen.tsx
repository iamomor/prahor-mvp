"use client";

import { ArrowUpRight, BookOpen, HeartHandshake, Phone, ShieldCheck } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";
import { POLICE_SOURCE } from "../content";

export function ShonketScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<ShieldCheck size={26} />} small="Shonket · সংকেত" title={t(copy("Help has a direct path.", "সহায়তার সরাসরি পথ।"))} />
    <div className="story-help-art" aria-hidden="true"><span><HeartHandshake size={54} strokeWidth={1.4} /></span></div>
    <a className="home-button story-screen-action" href="tel:999"><Phone size={21} aria-hidden="true" />{t(copy("Emergency · call 999", "জরুরি সেবা · কল ৯৯৯"))}</a>
    <a className="story-screen-link" href={POLICE_SOURCE} target="_blank" rel="noreferrer">{t(copy("Bangladesh Police helpline directory", "বাংলাদেশ পুলিশের হেল্পলাইন তালিকা"))}<ArrowUpRight size={17} aria-hidden="true" /><span className="home-sr-only">Opens in a new tab</span></a>
    <div className="story-soft-row"><BookOpen size={20} aria-hidden="true" /><span>{t(copy("Reach people without asking AI first.", "এআইকে আগে জিজ্ঞেস না করেই মানুষের কাছে পৌঁছান।"))}</span></div></>;
}
