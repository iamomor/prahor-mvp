// Pure selection logic. User-facing language and safety advice live in the UI.
export type KitPick = "two" | "faint" | "one" | "none" | "dpos" | "dneg" | "unsure";
export type Timing = "after" | "before" | "irreg";
export type Window = "in" | "late" | "na";
export type KitInput = { pick: KitPick; timing: Timing; window: Window; urgentSymptoms?: boolean };
export type KitKey = "positive" | "faint" | "negative" | "invalid" | "unclear";
export type KitCaution = "late_read" | "no_window" | "too_early" | "irregular" | null;
export type KitOutcome =
  | { urgentFirst: true; key: null; caution: null; retest: null }
  | { urgentFirst: false; key: KitKey; caution: KitCaution; retest: { afterHours: [number, number] } | null };

const KEY: Record<KitPick, KitKey> = { two: "positive", dpos: "positive", faint: "faint", one: "negative", dneg: "negative", none: "invalid", unsure: "unclear" };

export function explainKit(input: KitInput): KitOutcome {
  if (input.urgentSymptoms) return { urgentFirst: true, key: null, caution: null, retest: null };
  const key = KEY[input.pick];
  let caution: KitCaution = null;
  if (input.window === "late") caution = "late_read";
  else if (input.window === "na") caution = "no_window";
  else if (key === "negative" && input.timing === "before") caution = "too_early";
  else if (key === "negative" && input.timing === "irreg") caution = "irregular";
  const retest = key === "faint" || key === "negative" || key === "invalid" || key === "unclear" || caution === "late_read" || caution === "no_window"
    ? { afterHours: [48, 72] as [number, number] } : null;
  return { urgentFirst: false, key, caution, retest };
}

export function retestWindow(from: Date, [lo, hi]: [number, number]): { earliest: Date; latest: Date } {
  const hour = 3600_000;
  return { earliest: new Date(from.getTime() + lo * hour), latest: new Date(from.getTime() + hi * hour) };
}
