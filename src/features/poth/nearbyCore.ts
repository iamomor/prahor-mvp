export type GeoPoint = { lat: number; lon: number };
export type CareCategory = "hospital" | "clinic" | "maternity" | "midwife" | "doctor" | "pharmacy";
export type OsmEntry = {
  type?: "node" | "way" | "relation";
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};
export type CarePlace = GeoPoint & {
  id: string;
  name: string;
  kind: CareCategory;
  distanceKm: number;
  osmUrl: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  emergencyTagged: boolean;
  locationPrecision: "mapped-point" | "feature-center";
};
export const BD_BOUNDS = { minLat: 20.5, maxLat: 26.8, minLon: 88.0, maxLon: 92.8 } as const;
export const ALLOWED_RADII = [1000, 2000, 3000, 5000, 10000, 15000, 20000] as const;
export function insideBangladesh(p: GeoPoint): boolean {
  return Number.isFinite(p.lat) && Number.isFinite(p.lon) && p.lat >= BD_BOUNDS.minLat &&
    p.lat <= BD_BOUNDS.maxLat && p.lon >= BD_BOUNDS.minLon && p.lon <= BD_BOUNDS.maxLon;
}
export function distanceInKm(a: GeoPoint, b: GeoPoint): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.atan2(Math.sqrt(Math.max(0, x)), Math.sqrt(Math.max(0, 1 - x)));
}
export function categoryFromTags(tags: Record<string, string>): CareCategory | null {
  const healthcare = (tags.healthcare || "").toLowerCase();
  const amenity = (tags.amenity || "").toLowerCase();
  if (healthcare === "birthing_centre" || healthcare === "maternity" || amenity === "maternity" ||
      (tags["healthcare:speciality"] || "").toLowerCase().split(/[;,]/).some(s => s.trim() === "obstetrics")) return "maternity";
  if (healthcare === "midwife") return "midwife";
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (healthcare === "clinic" || amenity === "clinic") return "clinic";
  if (healthcare === "doctor" || healthcare === "doctors" || amenity === "doctors") return "doctor";
  if (healthcare === "pharmacy" || amenity === "pharmacy") return "pharmacy";
  // Facility names alone are never evidence of a maternity service.
  return null;
}
function safeText(value: string | undefined, limit: number): string | null {
  if (typeof value !== "string") return null;
  const s = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return s ? s.slice(0, limit) : null;
}
function validatedPhone(value: string | undefined): string | null {
  const s = safeText(value, 60);
  if (!s) return null;
  const first = s.split(/[;,]/)[0].trim();
  return /^\+?[0-9][0-9 ()-]{5,20}$/.test(first) ? first : null;
}
function validatedWebsite(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch { return null; }
}
function addressFromTags(tags: Record<string, string>): string | null {
  const full = safeText(tags["addr:full"], 300);
  if (full) return full;
  const road = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  return safeText([road, tags["addr:suburb"], tags["addr:city"], tags["addr:district"]].filter(Boolean).join(", "), 300);
}
export function normalizeOsm(elements: OsmEntry[], origin: GeoPoint, radiusMetres: number): CarePlace[] {
  const seen = new Set<string>();
  const places: CarePlace[] = [];
  for (const e of elements) {
    if (!e || !e.tags || !e.type || !["node", "way", "relation"].includes(e.type) ||
        !Number.isSafeInteger(e.id) || typeof e.id !== "number" || e.id <= 0) continue;
    const lat = e.type === "node" ? e.lat : e.center?.lat;
    const lon = e.type === "node" ? e.lon : e.center?.lon;
    if (typeof lat !== "number" || typeof lon !== "number" || !insideBangladesh({ lat, lon })) continue;
    const tags = Object.fromEntries(Object.entries(e.tags).filter((pair): pair is [string, string] => typeof pair[1] === "string"));
    if (["yes", "true", "1"].includes(tags.disused) || ["yes", "true", "1"].includes(tags.abandoned) || tags.access === "private") continue;
    const kind = categoryFromTags(tags);
    if (!kind) continue;
    const distanceKm = distanceInKm(origin, { lat, lon });
    if (distanceKm * 1000 > radiusMetres) continue;
    const id = `${e.type}/${e.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    places.push({ id, lat, lon, kind, distanceKm: Math.round(distanceKm * 100) / 100,
      name: safeText(tags["name:bn"] || tags.name, 160) || "Unnamed community-mapped healthcare place",
      address: addressFromTags(tags), phone: validatedPhone(tags["contact:phone"] || tags.phone),
      website: validatedWebsite(tags["contact:website"] || tags.website),
      hours: safeText(tags.opening_hours, 120),
      emergencyTagged: tags.emergency === "yes",
      osmUrl: `https://www.openstreetmap.org/${id}`,
      locationPrecision: e.type === "node" ? "mapped-point" : "feature-center",
    });
  }
  return places.sort((a, b) => a.distanceKm - b.distanceKm || a.id.localeCompare(b.id)).slice(0, 300);
}
