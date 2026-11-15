import type { ReactNode } from "react";

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="story-kicker section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true" /><span>{children}</span></p>;
}
