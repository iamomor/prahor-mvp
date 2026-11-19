export const visitChecklistKey = "prohor-poth-visit-checklist-v1";
export const visitChecklistLength = 8;
/** Only eight checkbox values are stored. No facility, location, questions or health text. */
export function parseVisitChecklist(raw: string | null): boolean[] | null {
  if (!raw || raw.length > 256) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (Object.keys(record).sort().join(",") !== "checked,version" || record.version !== 1 || !Array.isArray(record.checked) ||
      record.checked.length !== visitChecklistLength || !record.checked.every(item => typeof item === "boolean")) return null;
    return [...record.checked] as boolean[];
  } catch { return null; }
}
export function serializeVisitChecklist(checked: readonly boolean[]): string {
  if (checked.length !== visitChecklistLength || !checked.every(value => typeof value === "boolean")) throw new Error("Invalid checklist");
  return JSON.stringify({ version: 1, checked });
}
