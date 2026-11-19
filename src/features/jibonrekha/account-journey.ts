export type PregnancyDateRecord = {
  estimated_due_date: string | null;
  last_menstrual_period_date: string | null;
};

const dayMs = 86_400_000;
function calendarDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value ? parsed : null;
}

/** Uses the entered EDD first, then a 280-day LMP estimate. Neither is clinical confirmation. */
export function accountJourney(pregnancy: PregnancyDateRecord, currentDay: string) {
  const due = pregnancy.estimated_due_date ? calendarDay(pregnancy.estimated_due_date) : null;
  const lmp = pregnancy.last_menstrual_period_date ? calendarDay(pregnancy.last_menstrual_period_date) : null;
  const date = due ?? (lmp === null ? null : lmp + 280 * dayMs);
  const todayDate = calendarDay(currentDay);
  if (date === null || todayDate === null) return null;
  const elapsed = 280 - Math.round((date - todayDate) / dayMs);
  if (elapsed < 0 || elapsed > 280) return null;
  return { weeks: Math.floor(elapsed / 7), days: elapsed % 7, dueDate: new Date(date).toISOString().slice(0, 10), source: due !== null ? "নথিতে লেখা সম্ভাব্য তারিখ" : "শেষ মাসিকের তারিখ থেকে হিসাব" };
}
