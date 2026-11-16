"use client";

import { BookOpen, CalendarDays, ChevronRight, FileText, Heart, HeartHandshake, LockKeyhole, MessageCircle, SlidersHorizontal } from "lucide-react";
import { HomeBrand } from "../HomeBrand";
import { useHome } from "../HomeContext";
import { copy } from "../home-content";
import { sampleQuestion } from "./content";
import { SampleTag } from "./ScreenFrame";

export function MotherWindow() {
  const { t } = useHome();
  return <div className="story-browser"><div className="story-browser-bar"><span aria-hidden="true">● ● ●</span><span lang="en">PROHOR / My care</span><SampleTag /></div><div className="story-mother-window"><HomeBrand /><h3 lang="bn">আজ একটু নিজের খোঁজ নিন।</h3><p>{t(copy("Your care, in one place.", "আপনার যত্ন, এক জায়গায়।"))}</p><div className="story-window-tasks">{[
    { href: "#module-jibonrekha", icon: CalendarDays, label: copy("My care story", "আমার যত্নের গল্প") }, { href: "#module-barta", icon: MessageCircle, label: copy("My questions", "আমার প্রশ্ন") }, { href: "#module-adapt", icon: SlidersHorizontal, label: copy("My preferences", "আমার পছন্দ") },
  ].map(({ href, icon: Icon, label }) => <a key={href} href={href}><Icon size={23} aria-hidden="true" /><span>{t(label)}</span><ChevronRight size={19} aria-hidden="true" /></a>)}</div><div className="story-window-note"><Heart size={26} aria-hidden="true" /><span>{t(copy("Motherhood is part of your story. You are at the centre.", "মাতৃত্ব আপনার গল্পের অংশ। কেন্দ্রে আছেন আপনি।"))}</span></div></div></div>;
}

export function ProviderWindow() {
  const { t } = useHome();
  return <div className="story-browser"><div className="story-browser-bar"><span aria-hidden="true">● ● ●</span><span lang="en">PROHOR / Care workspace</span><SampleTag /></div><div className="story-provider-window"><div className="story-provider-title"><span className="story-avatar"><HeartHandshake size={27} aria-hidden="true" /></span><div><span>{t(copy("Mother-led context", "মায়ের বাছাই করা তথ্য"))}</span><h3>{t(copy("Prepare to listen.", "শোনার প্রস্তুতি নিন।"))}</h3></div></div><div className="story-provider-tabs"><span>{t(copy("Questions", "প্রশ্ন"))}</span><span>{t(copy("Chosen records", "বাছাই করা রেকর্ড"))}</span><span>{t(copy("Permissions", "অনুমতি"))}</span></div><div className="story-provider-question"><MessageCircle size={25} aria-hidden="true" /><div><strong>{t(copy("Nila’s visit question", "নীলার সাক্ষাতের প্রশ্ন"))}</strong><p lang="bn">{sampleQuestion}</p></div></div><ul className="story-provider-checklist"><li><FileText size={21} aria-hidden="true" />{t(copy("Context from selected records", "বাছাই করা রেকর্ডের তথ্য"))}</li><li><BookOpen size={21} aria-hidden="true" />{t(copy("Visible source for each note", "প্রতিটি নোটের দৃশ্যমান সূত্র"))}</li><li><LockKeyhole size={21} aria-hidden="true" />{t(copy("Access defined by the mother", "মায়ের নির্ধারিত প্রবেশাধিকার"))}</li></ul></div></div>;
}
