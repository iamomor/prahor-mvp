export type ArcInput = { weeks: number; days: number; beadWeeks?: number[]; upcomingWeeks?: number[]; size?: number };
const TOTAL_WEEKS = 40;
export const weeksToFloat = (weeks: number, days: number) => weeks + days / 7;
export function arcGeometry({ weeks, days, beadWeeks = [], upcomingWeeks = [], size = 318 }: ArcInput) {
  if (!Number.isInteger(weeks) || weeks < 0 || !Number.isInteger(days) || days < 0 || days > 6 || !Number.isFinite(size) || size < 80) throw new RangeError("Invalid pregnancy line input");
  const r = size / 2 - 26, cx = size / 2, cy = r + 16, height = cy + 14;
  const clamp = (value: number) => Math.min(Math.max(value, 0), TOTAL_WEEKS);
  const pt = (value: number, radius = r) => { const angle = clamp(value) / TOTAL_WEEKS * Math.PI; return { x: cx - radius * Math.cos(angle), y: cy - radius * Math.sin(angle) }; };
  const path = (to: number) => { const start = pt(0), end = pt(to); return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r} ${r} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`; };
  const currentWeek = weeksToFloat(weeks, days), trimester = currentWeek < 14 ? 1 : currentWeek < 28 ? 2 : 3;
  return { r, cx, cy, height, size, trimester, current: pt(currentWeek), full: path(TOTAL_WEEKS), done: path(currentWeek),
    ticks: [13, 27].map(value => ({ a: pt(value, r - 12), b: pt(value, r + 12) })),
    beads: beadWeeks.filter(Number.isFinite).map(value => pt(value, r - 22)), upcoming: upcomingWeeks.filter(Number.isFinite).map(value => pt(value, r - 22)) };
}
export function arcLabel(weeks: number, days: number, trimester: 1 | 2 | 3, lang: "bn" | "en") {
  if (lang === "en") return `Pregnancy line: ${weeks} weeks ${days} days, trimester ${trimester} of 3`;
  const digits = (value: number) => String(value).replace(/\d/g, character => "০১২৩৪৫৬৭৮৯"[Number(character)]);
  return `গর্ভকালের রেখা: ${digits(weeks)} সপ্তাহ ${digits(days)} দিন, ${["প্রথম", "দ্বিতীয়", "তৃতীয়"][trimester - 1]} ত্রৈমাসিক`;
}
