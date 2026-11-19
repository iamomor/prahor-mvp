"use client";
import { useLanguage } from "@/i18n/use-language";
import type { RingNode } from "./bondhon-view";
import styles from "./bondhon.module.css";

const W = 320, H = 320, CX = W / 2, CY = 145, R = 96, ARC = 2 * Math.PI * 36;
const ANGLES: Record<number, number[]> = { 0: [], 1: [-90], 2: [-142, -38], 3: [-150, -90, -30] };
/** The bond ring: you in the middle, each person around you with a ring that drains as their access runs out, and a dashed lock for what can never be shared.
 *  Decorative: the parent must also give the same facts as text. */
export function SharingRing({ nodes, label }: { nodes: readonly RingNode[]; label: string }) {
  const { t } = useLanguage();
  const spots = nodes.slice(0, 3).map((node, i) => {
    const a = (ANGLES[Math.min(nodes.length, 3)][i] * Math.PI) / 180;
    return { node, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  });
  return <svg className={styles.ring} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} focusable="false">
    <circle className={styles.ringTrack} cx={CX} cy={CY} r={R} />
    {spots.map(({ node, x, y }) => <line key={`l${node.id}`} className={`${styles.ringLine} ${node.soon ? styles.ringLineSoon : ""}`} x1={CX} y1={CY} x2={x} y2={y} />)}
    <circle className={styles.ringMother} cx={CX} cy={CY} r={40} />
    <text className={styles.ringMotherText} x={CX} y={CY + 6} textAnchor="middle">{t({ en: "You", bn: "আপনি" })}</text>
    {spots.map(({ node, x, y }) => <g key={node.id}>
      <circle className={styles.ringBack} cx={x} cy={y} r={36} />
      <circle className={`${styles.ringArc} ${node.soon ? styles.ringArcSoon : ""}`} cx={x} cy={y} r={36} strokeDasharray={`${ARC * node.frac} ${ARC}`} transform={`rotate(-90 ${x} ${y})`} />
      <circle className={`${styles.ringNode} ${node.soon ? styles.ringNodeSoon : ""}`} cx={x} cy={y} r={29} />
      <text className={styles.ringInitial} x={x} y={y + 7} textAnchor="middle">{node.initial}</text>
      <text className={styles.ringName} x={x} y={y + 56} textAnchor="middle">{[...node.name.split(" ")[0]].slice(0, 12).join("")}{[...node.name.split(" ")[0]].length > 12 ? "…" : ""}</text>
    </g>)}
    <line className={styles.ringLockLine} x1={CX} y1={CY + 40} x2={CX} y2={CY + R - 27} />
    <circle className={styles.ringLock} cx={CX} cy={CY + R} r={27} />
    <g className={styles.ringLockIcon} transform={`translate(${CX - 11} ${CY + R - 11})`}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></g>
    <text className={styles.ringLockText} x={CX + 36} y={CY + R + 5}>{t({ en: "Always private", bn: "ব্যক্তিগত থাকে" })}</text>
  </svg>;
}
