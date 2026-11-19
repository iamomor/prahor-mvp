import { bdDistricts, type Division } from "./bdDistricts";
import { categoryFromTags, insideBangladesh, type CareCategory, type OsmEntry } from "./nearbyCore";

export type AccessFeature = "wheelchair" | "accessibleToilet" | "hearingLoop";
export type ReportedAccess = "reported_available" | "reported_limited" | "reported_unavailable" | "unknown";
export type DirectoryPlace = {
  id: string; name: string; nameBn: string | null; kind: CareCategory;
  source: "registry" | "community"; sourceUrl: string; reviewedOn: string | null;
  division: string | null; district: string | null; area: string | null;
  phone: string | null; email: string | null; website: string | null; hours: string | null;
  lat: number | null; lon: number | null;
  accessibility: Record<AccessFeature, ReportedAccess>;
};
export type RegistryEntry = {
  id: number; code: string; name: string; nameBn: string; division: string; district: string;
  area: string | null; phone: string | null; email: string | null; reviewedOn: string;
};
export type DirectoryQuery = { q: string; division: string; district: string; kind: string; source: string; access: string; page: number };
export type DirectoryResult = { places: DirectoryPlace[]; total: number; page: number; pageSize: number; pages: number; registryCount: number; communityCount: number; unmappedDistrictCount: number };
export const PAGE_SIZE = 20;
export const accessKeys: AccessFeature[] = ["wheelchair", "accessibleToilet", "hearingLoop"];
export const directoryKinds = ["hospital", "clinic", "maternity", "midwife", "doctor", "pharmacy"] as const;
export function text(value: unknown, limit = 300): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return cleaned ? cleaned.slice(0, limit) : null;
}
export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\u200b-\u200d\ufeff]/g, "").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}
export function safeWebsite(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.hostname.includes(".") ? url.href : null; } catch { return null; }
}
export function safePhone(value: unknown): string | null {
  const first = text(value, 80)?.split(/[;,]/)[0].trim();
  return first && /^\+?[0-9][0-9 ()-]{5,20}$/.test(first) ? first : null;
}
function access(value: unknown): ReportedAccess {
  return value === "yes" || value === "designated" ? "reported_available" : value === "limited" ? "reported_limited" : value === "no" ? "reported_unavailable" : "unknown";
}
const unknownAccess = (): DirectoryPlace["accessibility"] => ({ wheelchair: "unknown", accessibleToilet: "unknown", hearingLoop: "unknown" });
const aliases: Record<string, string> = { chittagong: "Chattogram", comilla: "Cumilla", barisal: "Barishal", bogra: "Bogura", jessore: "Jashore", nawabganj: "Chapainawabganj", "cox’s bazar": "Cox's Bazar" };
const districts = Object.values(bdDistricts).flatMap(values => [...values]);
function districtFromTag(value: unknown): string | null {
  const name = text(value, 100); if (!name) return null;
  const n = normalizeSearch(name).replace(/ district$/u, "");
  return districts.find(d => normalizeSearch(d) === n) ?? aliases[n] ?? null;
}
function divisionFor(district: string | null): Division | null {
  return (Object.keys(bdDistricts) as Division[]).find(d => (bdDistricts[d] as readonly string[]).includes(district ?? "")) ?? null;
}
export function buildDirectory(registry: readonly RegistryEntry[], entries: readonly OsmEntry[]): DirectoryPlace[] {
  const places: DirectoryPlace[] = registry.filter(r => districts.includes(r.district as typeof districts[number]) && divisionFor(r.district) === r.division)
    .map(r => ({ id: `dghs/${r.id}`, name: r.name, nameBn: r.nameBn, kind: "hospital", source: "registry", sourceUrl: `https://hrm.dghs.gov.bd/public/facility-registry/facilities/${r.id}/profile`, reviewedOn: r.reviewedOn,
      division: r.division, district: r.district, area: r.area, phone: safePhone(r.phone), email: r.email, website: null, hours: null, lat: null, lon: null, accessibility: unknownAccess() }));
  const seen = new Set(places.map(p => p.id));
  for (const e of entries) {
    if (!e || !["node", "way", "relation"].includes(e.type ?? "") || !Number.isSafeInteger(e.id) || (e.id ?? 0) <= 0 || !e.tags || typeof e.tags !== "object") continue;
    const tags = Object.fromEntries(Object.entries(e.tags).filter((pair): pair is [string, string] => typeof pair[1] === "string"));
    if (["yes", "true", "1"].includes(tags.disused) || ["yes", "true", "1"].includes(tags.abandoned) || tags.access === "private") continue;
    const kind = categoryFromTags(tags); if (!kind) continue;
    const lat = e.type === "node" ? e.lat : e.center?.lat;
    const lon = e.type === "node" ? e.lon : e.center?.lon;
    if (typeof lat !== "number" || typeof lon !== "number" || !insideBangladesh({ lat, lon })) continue;
    const id = `${e.type}/${e.id}`; if (seen.has(id)) continue; seen.add(id);
    const district = districtFromTag(tags["addr:district"] || tags["is_in:district"]);
    const area = text(tags["addr:full"] || [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", "));
    places.push({ id, name: text(tags["name:en"] || tags.name, 300) ?? "Unnamed community-mapped place", nameBn: text(tags["name:bn"], 300), kind, source: "community", sourceUrl: `https://www.openstreetmap.org/${id}`, reviewedOn: null,
      division: divisionFor(district), district, area, phone: safePhone(tags["contact:phone"] || tags.phone), email: null, website: safeWebsite(tags["contact:website"] || tags.website), hours: text(tags.opening_hours, 160), lat, lon,
      accessibility: { wheelchair: access(tags.wheelchair), accessibleToilet: access(tags["toilets:wheelchair"]), hearingLoop: access(tags.hearing_loop) } });
  }
  return places.sort((a, b) => (a.source === b.source ? 0 : a.source === "registry" ? -1 : 1) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function parseDirectoryQuery(params: URLSearchParams): DirectoryQuery | null {
  const allowed = ["q", "division", "district", "kind", "source", "access", "page"];
  for (const key of params.keys()) if (!allowed.includes(key) || params.getAll(key).length !== 1) return null;
  const q = (params.get("q") ?? "").trim(), division = params.get("division") ?? "", district = params.get("district") ?? "";
  const kind = params.get("kind") ?? "", source = params.get("source") ?? "", accessibility = params.get("access") ?? "";
  const rawPage = params.get("page") ?? "1";
  if (q.length > 120 || (division && !Object.keys(bdDistricts).includes(division)) || (district && !districts.includes(district as typeof districts[number])) ||
    (division && district && divisionFor(district) !== division) || (kind && !(directoryKinds as readonly string[]).includes(kind)) ||
    (source && !["registry", "community"].includes(source)) || (accessibility && !accessKeys.includes(accessibility as AccessFeature)) || !/^[1-9]\d{0,5}$/.test(rawPage)) return null;
  return { q, division, district, kind, source, access: accessibility, page: Number(rawPage) };
}
export function searchDirectory(places: readonly DirectoryPlace[], query: DirectoryQuery): DirectoryResult {
  const needles = normalizeSearch(query.q).split(" ").filter(Boolean);
  const matches = places.filter(p => (!query.division || p.division === query.division) && (!query.district || p.district === query.district) && (!query.kind || p.kind === query.kind) && (!query.source || p.source === query.source) &&
    (!query.access || p.accessibility[query.access as AccessFeature] === "reported_available") && needles.every(n => normalizeSearch(`${p.name} ${p.nameBn ?? ""} ${p.area ?? ""} ${p.district ?? ""} ${p.division ?? ""}`).includes(n)));
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  return { places: matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: matches.length, page, pageSize: PAGE_SIZE, pages,
    registryCount: places.filter(p => p.source === "registry").length, communityCount: places.filter(p => p.source === "community").length, unmappedDistrictCount: places.filter(p => !p.district).length };
}
