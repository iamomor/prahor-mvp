type HistoryItem = {
  subject: "mother" | "baby";
  pregnancy_id?: string | null;
  baby_id?: string;
  kind: string;
  value: string;
  unit: string | null;
  observed_at: string;
};
type BabyRef = { id: string; pregnancy_id: string | null };
type HistoryFilters = {
  subject: "both" | "mother" | "baby";
  pregnancyId: string;
  babyId: string;
  kind: string;
  query: string;
};

export function filterAccountHistory<T extends HistoryItem>(items: T[], babies: BabyRef[], filters: HistoryFilters, labels: Record<string, string>): T[] {
  const query = filters.query.trim().toLocaleLowerCase();
  const babyPregnancy = new Map(babies.map((baby) => [baby.id, baby.pregnancy_id]));
  return items.filter((item) => {
    if (filters.subject !== "both" && item.subject !== filters.subject) return false;
    if (filters.pregnancyId && (item.subject === "mother" ? item.pregnancy_id !== filters.pregnancyId : babyPregnancy.get(item.baby_id ?? "") !== filters.pregnancyId)) return false;
    if (filters.subject === "baby" && filters.babyId && item.baby_id !== filters.babyId) return false;
    if (filters.kind !== "all" && item.kind !== filters.kind) return false;
    return !query || `${labels[item.kind] ?? item.kind} ${item.value} ${item.unit ?? ""}`.toLocaleLowerCase().includes(query);
  }).sort((a, b) => b.observed_at.localeCompare(a.observed_at));
}
