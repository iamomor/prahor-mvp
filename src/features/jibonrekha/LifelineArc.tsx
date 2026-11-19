import { arcGeometry, arcLabel, type ArcInput } from "./lifeline-arc";

export function LifelineArc({ lang = "bn", ...input }: ArcInput & { lang?: "bn" | "en" }) {
  const geometry = arcGeometry(input);
  return <svg viewBox={`0 0 ${geometry.size} ${Math.round(geometry.height)}`} role="img" aria-label={arcLabel(input.weeks, input.days, geometry.trimester as 1 | 2 | 3, lang)} className="mx-auto block w-full max-w-xs">
    <path d={geometry.full} fill="none" stroke="var(--pro-on-primary-muted)" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 9" />
    <path d={geometry.done} fill="none" stroke="var(--pro-accent)" strokeWidth="8" strokeLinecap="round" />
    {geometry.ticks.map((tick, index) => <line key={index} x1={tick.a.x} y1={tick.a.y} x2={tick.b.x} y2={tick.b.y} stroke="var(--pro-on-primary)" strokeWidth="2.5" />)}
    {geometry.beads.map((bead, index) => <circle key={`b${index}`} cx={bead.x} cy={bead.y} r="4" fill="var(--pro-on-primary)" />)}
    {geometry.upcoming.map((bead, index) => <circle key={`u${index}`} cx={bead.x} cy={bead.y} r="4" fill="none" stroke="var(--pro-on-primary)" strokeWidth="2" />)}
    <circle cx={geometry.current.x} cy={geometry.current.y} r="16" fill="var(--pro-accent)" fillOpacity="0.35" />
    <circle cx={geometry.current.x} cy={geometry.current.y} r="11" fill="var(--pro-accent)" stroke="var(--pro-on-primary)" strokeWidth="3" />
  </svg>;
}
