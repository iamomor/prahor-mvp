"use client";

import { useState } from "react";
import { HeartHandshake, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";

export function ConsentToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="story-consent-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={onChange} /><span className="story-toggle-track" aria-hidden="true"><span /></span></label>;
}

export function ConsentScreen({ compact = false }: { compact?: boolean }) {
  const { t } = useHome();
  const [visits, setVisits] = useState(true);
  const [reports, setReports] = useState(false);
  return <div className={compact ? "story-consent-compact" : ""}>{!compact && <ScreenTitle icon={<HeartHandshake size={25} />} small="Bondhon · বন্ধন" title={t(copy("You choose what connects.", "সংযোগের সিদ্ধান্ত আপনার।"))} />}
    <div className="story-recipient"><span className="story-avatar"><UserRound size={26} aria-hidden="true" /></span><div><span>{t(copy("Chosen recipient", "আপনার বাছাই করা প্রাপক"))}</span><strong>{t(copy("My care supporter", "আমার যত্নের সহায়ক"))}</strong></div></div>
    <ConsentToggle label={t(copy("Visit questions", "সাক্ষাতের প্রশ্ন"))} checked={visits} onChange={() => setVisits(!visits)} />
    <ConsentToggle label={t(copy("Selected reports", "বাছাই করা রিপোর্ট"))} checked={reports} onChange={() => setReports(!reports)} />
    <div className="story-private-row"><LockKeyhole size={19} aria-hidden="true" /><span>{t(copy("Diary & AI conversations", "ডায়েরি ও এআই কথোপকথন"))}</span><span>{t(copy("Private", "ব্যক্তিগত"))}</span></div>
    <div className="story-consent-summary"><ShieldCheck size={22} aria-hidden="true" /><span>{t(copy("Your review comes before sharing.", "তথ্য দেওয়ার আগে আপনার পর্যালোচনা।"))}</span></div>
  </div>;
}
