"use client";

import { Baby, Heart, UserRound } from "lucide-react";
import { useHome } from "../HomeContext";
import { copy } from "../home-content";

export function MotherBabyTimeline({ compact = false }: { compact?: boolean }) {
  const { t } = useHome();
  return <div className={`story-care-timeline ${compact ? "story-timeline-compact" : ""}`}>
    <div className="story-timeline-entry"><span className="story-timeline-icon"><UserRound size={20} aria-hidden="true" /></span><div><span>{t(copy("Mother", "মা"))}</span><strong>{t(copy("Week 24 · Nila’s journey", "২৪তম সপ্তাহ · নীলার যাত্রা"))}</strong><p>{t(copy("Questions for the next visit", "পরের সাক্ষাতের প্রশ্ন"))}</p></div></div>
    <div className="story-timeline-entry"><span className="story-timeline-icon"><Baby size={20} aria-hidden="true" /></span><div><span>{t(copy("Baby", "শিশু"))}</span><strong>{t(copy("A story of their own", "তার নিজের গল্প"))}</strong><p>{t(copy("A separate record, from the start", "শুরু থেকেই আলাদা রেকর্ড"))}</p></div></div>
    {!compact && <div className="story-timeline-note"><Heart size={18} aria-hidden="true" />{t(copy("Two records. One connected journey.", "দুটি রেকর্ড। এক ধারাবাহিক যাত্রা।"))}</div>}
  </div>;
}
