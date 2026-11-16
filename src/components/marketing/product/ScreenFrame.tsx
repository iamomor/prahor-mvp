"use client";

import { type ReactNode } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { ProhorSymbol } from "../HomeBrand";
import { useHome } from "../HomeContext";
import { copy } from "../home-content";
import { WHO_SOURCE } from "./content";

export function SampleTag() {
  return <span className="story-sample font-tag" lang="en">Sample data</span>;
}

export function PhoneFrame({ title, children, className = "", titleLang }: { title: string; children: ReactNode; className?: string; titleLang?: "en" | "bn" }) {
  const { t } = useHome();
  return <div className={`story-device ${className}`} role="group" aria-label={title}>
    <div className="story-device-label"><span lang={titleLang}>{title}</span><SampleTag /></div>
    <div className="story-phone">
      <div className="story-phone-hardware" aria-hidden="true"><span /></div>
      <div className="story-phone-top"><ProhorSymbol /><span lang="en">PROHOR</span><span className="story-phone-menu" aria-hidden="true"><i /><i /></span></div>
      <div className="story-phone-body" tabIndex={0} role="region" aria-label={t(copy(`${title} screen`, `${title} পর্দা`))}>{children}</div>
      <div className="story-phone-bottom" aria-hidden="true"><span /></div>
    </div>
  </div>;
}

export function SourceChip({ compact = false }: { compact?: boolean }) {
  return <a className="story-source" href={WHO_SOURCE} target="_blank" rel="noreferrer" lang="en"><BookOpen size={17} aria-hidden="true" /><span>{compact ? "WHO · Antenatal care" : "WHO · Antenatal care, 2016"}</span><ArrowUpRight size={16} aria-hidden="true" /><span className="home-sr-only">Opens in a new tab</span></a>;
}

export function ScreenTitle({ icon, small, title }: { icon: ReactNode; small: string; title: string }) {
  return <div className="story-screen-title"><span className="story-screen-icon" aria-hidden="true">{icon}</span><p>{small}</p><h3 lang={/[\u0980-\u09ff]/.test(title) ? "bn" : undefined}>{title}</h3></div>;
}
