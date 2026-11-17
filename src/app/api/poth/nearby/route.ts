import { NextResponse } from "next/server";
import { z } from "zod";
import { ALLOWED_RADII, insideBangladesh, normalizeOsm, type OsmEntry, type CarePlace } from "@/features/poth/nearbyCore";

export const dynamic = "force-dynamic";
const paramsSchema = z.object({
  lat: z.coerce.number().finite(),
  lon: z.coerce.number().finite(),
  radius: z.coerce.number().int().refine(r => ALLOWED_RADII.some(allowed => allowed === r)),
});
const endpoint = "https://overpass-api.de/api/interpreter";
const cache = new Map<string, { until: number; places: CarePlace[]; truncated: boolean }>();
const inFlight = new Map<string, Promise<{ places: CarePlace[]; truncated: boolean }>>();
let previousRequest = 0;
const COOLDOWN_MS = 1200;

async function queryOverpass(lat: number, lon: number, radius: number) {
  const q = `[out:json][timeout:16];(nwr(around:${radius},${lat},${lon})["amenity"~"^(hospital|clinic|doctors|pharmacy|maternity)$"];nwr(around:${radius},${lat},${lon})["healthcare"~"^(hospital|clinic|doctors|doctor|pharmacy|birthing_centre|midwife|maternity)$"];);out center 1200;`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 19000);
  try {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: new URLSearchParams({ data: q }).toString(), signal: controller.signal, cache: "no-store",
    });
    if (!response.ok) throw new Error(`Map data provider unavailable (${response.status})`);
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("elements" in body) || !Array.isArray(body.elements))
      throw new Error("Unexpected map provider response");
    const elements = body.elements as OsmEntry[];
    return { places: normalizeOsm(elements, { lat, lon }, radius), truncated: elements.length >= 1200 };
  } finally { clearTimeout(timer); }
}
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.has("lat") || !url.searchParams.has("lon"))
    return NextResponse.json({ error: "Choose a location first." }, { status: 400 });
  const result = paramsSchema.safeParse({ lat: url.searchParams.get("lat"), lon: url.searchParams.get("lon"), radius: url.searchParams.get("radius") || "5000" });
  if (!result.success || !insideBangladesh(result.data))
    return NextResponse.json({ error: "Choose a Bangladesh location and radius from 1–20 km." }, { status: 400 });
  const { lat, lon, radius } = result.data;
  const key = `${lat.toFixed(3)}:${lon.toFixed(3)}:${radius}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.until > now) return NextResponse.json({ ...hit, source: "openstreetmap-unverified", cached: true }, { headers: { "Cache-Control": "no-store" } });
  if (!inFlight.has(key) && (now - previousRequest < COOLDOWN_MS || inFlight.size >= 2))
    return NextResponse.json({ error: "Map service is busy. Try again shortly." }, { status: 429, headers: { "Retry-After": "3", "Cache-Control": "no-store" } });
  try {
    let pending = inFlight.get(key);
    if (!pending) {
      previousRequest = now;
      pending = queryOverpass(lat, lon, radius);
      inFlight.set(key, pending);
      void pending.finally(() => inFlight.delete(key)).catch(() => {});
    }
    const found = await pending;
    cache.set(key, { ...found, until: Date.now() + 8 * 60_000 });
    if (cache.size > 80) cache.delete(cache.keys().next().value!);
    return NextResponse.json({ ...found, source: "openstreetmap-unverified", cached: false }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Community map service is unavailable; the official reviewed directory remains separate. Retry or open external map." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
