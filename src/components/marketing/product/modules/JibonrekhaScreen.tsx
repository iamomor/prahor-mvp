"use client";

import { CalendarDays, ChevronRight, FileText } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";
import { MotherBabyTimeline } from "../MotherBabyTimeline";

export function JibonrekhaScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<CalendarDays size={24} />} small="Jibonrekha · জীবনরেখা" title={t(copy("Your story stays together.", "যত্নের গল্প একসঙ্গে।"))} /><MotherBabyTimeline /><div className="story-document-row"><FileText size={26} aria-hidden="true" /><div><strong>{t(copy("Visit notes", "সাক্ষাতের নোট"))}</strong><span>{t(copy("Recorded by you", "আপনার লেখা"))}</span></div><ChevronRight size={20} aria-hidden="true" /></div></>;
}
