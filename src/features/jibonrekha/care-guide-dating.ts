type RecordedDates = { lmp: string | null; due: string | null };

function calendarTime(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value ? null : time;
}

export function recordedPregnancyWeek(dates: RecordedDates, asOf: string) {
  const current = calendarTime(asOf);
  const period = calendarTime(dates.lmp);
  const due = calendarTime(dates.due);
  if (current === null || (period === null && due === null)) return null;
  const basis = period !== null ? "period" : "due";
  const elapsed = Math.floor((current - (period ?? (due! - 280 * 86400000))) / 86400000);
  if (elapsed < 0 || elapsed > 294) return null;
  return { weeks: Math.floor(elapsed / 7), days: elapsed % 7, basis } as const;
}
