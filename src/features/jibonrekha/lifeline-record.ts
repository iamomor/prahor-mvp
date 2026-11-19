export type Provenance = "self" | "extracted" | "clinician_entered" | "clinician_confirmed" | "demo";
export type LifelineRecord = {
  id: string;
  kind: string;
  label: string;
  value: string;
  unit: string | null;
  observedAt: string;
  provenance: Provenance;
  subject: "mother" | "baby";
  supersedes?: string | null;
  createdAt: string;
  note?: string;
};

export function currentAndHistory(rows: LifelineRecord[]): { current: LifelineRecord; earlier: LifelineRecord[] }[] {
  const byId = new Map(rows.map(row => [row.id, row]));
  const replaced = new Set(rows.map(row => row.supersedes).filter(Boolean) as string[]);
  return rows.filter(row => !replaced.has(row.id)).map(current => {
    const earlier: LifelineRecord[] = [];
    const seen = new Set([current.id]);
    let previous = current.supersedes ? byId.get(current.supersedes) : undefined;
    while (previous && !seen.has(previous.id)) {
      earlier.push(previous);
      seen.add(previous.id);
      previous = previous.supersedes ? byId.get(previous.supersedes) : undefined;
    }
    return { current, earlier };
  });
}

export function correction(old: LifelineRecord, value: string, id: string, now: string, reason = ""): LifelineRecord {
  return { ...old, id, value, provenance: "self", supersedes: old.id, createdAt: now, note: reason || old.note };
}

export type Pack = { selectedIds: string[]; includeIdentity: boolean; includeBarta: boolean };
export const newPack = (): Pack => ({ selectedIds: [], includeIdentity: false, includeBarta: false });
export const canPrepare = (pack: Pack) => pack.selectedIds.length > 0;
export function packItems(rows: LifelineRecord[], pack: Pack): LifelineRecord[] {
  const selected = new Set(pack.selectedIds);
  return currentAndHistory(rows).map(item => item.current).filter(row => selected.has(row.id) && !row.kind.startsWith("diary"));
}
export const needsCheck = (row: LifelineRecord) => row.provenance === "extracted";
