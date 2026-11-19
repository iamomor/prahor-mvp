"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, MapPin, Navigation, Phone, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import styles from "./poth.module.css";
import { useLanguage } from "@/i18n/use-language";
import { nearbyResponseSchema } from "@/lib/contracts/poth-current";
import { ALLOWED_RADII, type CareCategory, type CarePlace, type GeoPoint } from "./nearbyCore";

type Point = GeoPoint;
const cities = [
  { name: "Dhaka", lat: 23.8103, lon: 90.4125 }, { name: "Chattogram", lat: 22.3569, lon: 91.7832 },
  { name: "Rajshahi", lat: 24.3745, lon: 88.6042 }, { name: "Khulna", lat: 22.8456, lon: 89.5403 },
  { name: "Barishal", lat: 22.7010, lon: 90.3535 }, { name: "Sylhet", lat: 24.8949, lon: 91.8687 },
  { name: "Rangpur", lat: 25.7439, lon: 89.2752 }, { name: "Mymensingh", lat: 24.7471, lon: 90.4203 },
] as const;
const kinds: { key: "all" | CareCategory; label: string }[] = [
  { key: "all", label: "All healthcare" }, { key: "hospital", label: "Hospitals" },
  { key: "clinic", label: "Clinics" }, { key: "maternity", label: "Maternity-tagged" },
  { key: "midwife", label: "Midwives" }, { key: "doctor", label: "Doctors" },
  { key: "pharmacy", label: "Pharmacies" },
];
const MAX_PAGE = 6;
function directions(point: Point) { return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(`${point.lat},${point.lon}`); }
function websiteLink(value: string) { return value; }
function phoneLink(value: string) { return "tel:" + value.replace(/[^+0-9]/g, ""); }
function clamp(n: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, n)); }
function mercator(p: Point, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const lat = clamp(p.lat, -85.0511, 85.0511) * Math.PI / 180;
  return { x: (p.lon + 180) / 360 * scale, y: (1 - Math.log(Math.tan(Math.PI / 4 + lat / 2)) / Math.PI) / 2 * scale };
}
function mapZoom(radiusMetres: number) { return radiusMetres <= 2000 ? 13 : radiusMetres <= 5000 ? 12 : radiusMetres <= 10000 ? 11 : 10; }
function TileMap({ center, places, selected, onSelect, radius }: {
  center: Point; places: CarePlace[]; selected: CarePlace | null;
  onSelect: (p: CarePlace) => void; radius: number;
}) {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => language === "bn" ? bn : en;
  const [zoomOffset, setZoomOffset] = useState(0);
  const [pan, setPan] = useState(() => {
    if (!selected) return { x: 0, y: 0 };
    const target = mercator(selected, mapZoom(radius));
    const origin = mercator(center, mapZoom(radius));
    return { x: target.x - origin.x, y: target.y - origin.y };
  });
  const zoom = clamp(mapZoom(radius) + zoomOffset, 8, 16);
  const origin = mercator(center, zoom);
  const mapCenter = { x: origin.x + pan.x, y: origin.y + pan.y };
  const tiles = [];
  const startX = Math.floor((mapCenter.x - 450) / 256);
  const endX = Math.floor((mapCenter.x + 450) / 256);
  const startY = Math.floor((mapCenter.y - 300) / 256);
  const endY = Math.floor((mapCenter.y + 300) / 256);
  for (let x = startX; x <= endX; x++) for (let y = startY; y <= endY; y++) {
    if (y < 0 || y >= 2 ** zoom) continue;
    tiles.push({ key: `${zoom}/${x}/${y}`, src: `https://tile.openstreetmap.org/${zoom}/${((x % (2 ** zoom)) + 2 ** zoom) % (2 ** zoom)}/${y}.png`, left: x * 256 - mapCenter.x + 450, top: y * 256 - mapCenter.y + 300 });
  }
  const metresPerPixel = 156543.03392 * Math.cos(center.lat * Math.PI / 180) / (2 ** zoom);
  const radiusPixels = radius / metresPerPixel;
  const pins = places.map((place) => {
    const p = mercator(place, zoom);
    return { place, x: p.x - mapCenter.x + 450, y: p.y - mapCenter.y + 300 };
  }).filter(p => p.x >= -20 && p.x <= 920 && p.y >= -20 && p.y <= 620);
  return (
    <div className={`relative w-full overflow-hidden rounded-xl border ${styles.mapCanvas}`} style={{ borderColor: "var(--pro-border)" }}>
      <div role="group" aria-label="Healthcare map with selectable place markers" className="relative h-[360px] w-full overflow-hidden sm:h-[430px]">
        <div className="absolute left-1/2 top-1/2" style={{ width: 900, height: 600, transform: "translate(-50%, -50%)" }}>
          {tiles.map(tile => <div key={tile.key} aria-hidden="true" className={`absolute h-64 w-64 ${styles.mapCanvas}`} style={{ left: tile.left, top: tile.top, backgroundImage: `url(${tile.src})`, backgroundSize: "256px 256px" }} />)}
          <div aria-hidden="true" className={`pointer-events-none absolute rounded-full ${styles.mapRadius}`} style={{ left: 450 - pan.x - radiusPixels, top: 300 - pan.y - radiusPixels, width: radiusPixels * 2, height: radiusPixels * 2 }} />
          <div aria-hidden="true" className={`pointer-events-none absolute h-3 w-3 rounded-full ${styles.mapCenter}`} style={{ left: 444 - pan.x, top: 294 - pan.y }} />
          {pins.map(({ place, x, y }) => <button type="button" key={place.id} title={`${place.name} — ${place.distanceKm.toFixed(1)} km, unverified`} aria-label={`Select ${place.name} on map`}
            onClick={() => onSelect(place)} className={`absolute flex h-11 w-11 items-center justify-center rounded-full font-bold ${styles.mapMarker} ${selected?.id === place.id ? styles.mapSelected : ""}`}
            style={{ left: x - 22, top: y - 22 }}>+</button>)}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1" aria-label="Map controls">
          <button type="button" onClick={() => setZoomOffset(z => clamp(z + 1, -3, 3))} aria-label="Zoom in" className={`h-11 w-11 rounded-lg font-bold ${styles.mapControl}`}>+</button>
          <button type="button" onClick={() => setZoomOffset(z => clamp(z - 1, -3, 3))} aria-label="Zoom out" className={`h-11 w-11 rounded-lg font-bold ${styles.mapControl}`}>−</button>
          <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoomOffset(0); }} aria-label="Reset map position" className={`min-h-11 rounded-lg px-2 font-bold ${styles.mapControl}`}>{t("Reset", "রিসেট")}</button>
        </div>
        <div className={`absolute bottom-2 right-2 grid grid-cols-3 gap-1 rounded-lg p-1 ${styles.mapControl}`} aria-label="Pan map">
          <span/><button type="button" onClick={() => setPan(p => ({ ...p, y: p.y - 170 }))} aria-label="Move map north" className={`h-11 w-11 rounded border ${styles.mapControl}`}>↑</button><span/>
          <button type="button" onClick={() => setPan(p => ({ ...p, x: p.x - 170 }))} aria-label="Move map west" className={`h-11 w-11 rounded border ${styles.mapControl}`}>←</button>
          <button type="button" onClick={() => setPan({ x: 0, y: 0 })} aria-label="Recenter map" className={`h-11 w-11 rounded border ${styles.mapControl}`}>◎</button>
          <button type="button" onClick={() => setPan(p => ({ ...p, x: p.x + 170 }))} aria-label="Move map east" className={`h-11 w-11 rounded border ${styles.mapControl}`}>→</button>
          <span/><button type="button" onClick={() => setPan(p => ({ ...p, y: p.y + 170 }))} aria-label="Move map south" className={`h-11 w-11 rounded border ${styles.mapControl}`}>↓</button><span/>
        </div>
      </div>
      <p className="px-3 py-2 text-sm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors · ODbL</a> · Pins show community-map positions or feature centres, not verified entrances. Map tiles require internet.</p>
      <p className="sr-only">Map has {places.length} selectable markers. All locations are also available in the accessible results list.</p>
    </div>
  );
}
export function PothNearbyMap() {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => language === "bn" ? bn : en;
  const [mapOpen, setMapOpen] = useState(false);
  const [dataMode, setDataMode] = useState<"saved-snapshot" | "live-plus-snapshot" | null>(null);
  const [center, setCenter] = useState<Point>(cities[0]);
  const [city, setCity] = useState("Dhaka city centre (approximate)");
  const [cityChoice, setCityChoice] = useState("0");
  const [radius, setRadius] = useState(5000);
  const [places, setPlaces] = useState<CarePlace[]>([]);
  const [selected, setSelected] = useState<CarePlace | null>(null);
  const [filter, setFilter] = useState<"all" | CareCategory>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "name">("nearest");
  const [showCount, setShowCount] = useState(MAX_PAGE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Choose a Bangladesh area and search. Community-mapped facilities are not clinically verified.");
  const [gps, setGps] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [truncated, setTruncated] = useState(false);
  const searchController = useRef<AbortController | null>(null);
  const searchRevision = useRef(0);
  const locationRevision = useRef(0);
  useEffect(() => {
    const searches = searchRevision;
    const locations = locationRevision;
    const controller = searchController;
    return () => { searches.current += 1; locations.current += 1; controller.current?.abort(); };
  }, []);
  function invalidateSearch() {
    searchRevision.current += 1;
    searchController.current?.abort();
    searchController.current = null;
    setBusy(false);
    setPlaces([]);
    setSelected(null);
    setTruncated(false);
    setDataMode(null);
    setShowCount(MAX_PAGE);
  }
  const matched = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return places.filter(p => (filter === "all" || p.kind === filter) &&
      (!q || `${p.name} ${p.address || ""}`.toLocaleLowerCase().includes(q)))
      .sort((a, b) => sort === "nearest" ? a.distanceKm - b.distanceKm : a.name.localeCompare(b.name));
  }, [places, filter, query, sort]);
  const shown = matched.slice(0, showCount);
  function selectCity(index: number) {
    const next = cities[index]; if (!next) return;
    setCityChoice(String(index));
    locationRevision.current += 1;
    setCenter({ lat: next.lat, lon: next.lon }); setCity(`${next.name} city centre (approximate)`);
    invalidateSearch(); setGps(false);
    setMessage(`Location changed to ${next.name}. Select Search to fetch new results.`);
  }
  function applyManualPoint() {
    const lat = Number(manualLat.trim()), lon = Number(manualLon.trim());
    if (!manualLat.trim() || !manualLon.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < 20.5 || lat > 26.8 || lon < 88 || lon > 92.8) {
      setMessage("Enter valid Bangladesh coordinates (latitude 20.5–26.8, longitude 88–92.8)."); return;
    }
    locationRevision.current += 1;
    setCenter({ lat, lon }); setCityChoice(""); setCity("Manually selected coordinates (not a verified facility)");
    setGps(false); invalidateSearch();
    setMessage("Manual location set. Select Search to discover surrounding community-mapped facilities.");
  }
  function locate() {
    if (!navigator.geolocation) { setMessage("GPS unavailable. Select a division city."); return; }
    setMessage("Waiting for GPS consent...");
    const revision = ++locationRevision.current;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (revision !== locationRevision.current) return;
      const p = { lat: coords.latitude, lon: coords.longitude };
      if (p.lat < 20.5 || p.lat > 26.8 || p.lon < 88 || p.lon > 92.8) {
        setMessage("GPS point appears outside Bangladesh; select a city."); return;
      }
      setCenter(p); setCityChoice(""); setCity(`Approximate GPS location (accuracy ±${Math.round(coords.accuracy)} m)`);
      setGps(true); invalidateSearch();
      setMessage("GPS set. Select Search to request nearby community map records.");
    }, () => { if (revision === locationRevision.current) setMessage("GPS denied or unavailable. Choose a city instead."); },
    { maximumAge: 60000, timeout: 12000, enableHighAccuracy: false });
  }
  async function search(live = false) {
    invalidateSearch();
    const revision = searchRevision.current;
    const controller = new AbortController();
    searchController.current = controller;
    setBusy(true);
    setMessage(live ? "Requesting live map data. Saved results are used if the provider is unavailable." : "Searching the saved community-map snapshot…");
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const params = new URLSearchParams({ lat: String(center.lat), lon: String(center.lon), radius: String(radius), mode: live ? "live" : "snapshot" });
      const response = await fetch("/api/poth/nearby?" + params.toString(), { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Nearby search unavailable. Try saved results or another area.");
      const data = nearbyResponseSchema.parse(await response.json());
      if (controller.signal.aborted || searchRevision.current !== revision) return;
      setPlaces(data.places);
      setDataMode(data.dataMode ?? "saved-snapshot");
      setTruncated(Boolean(data.truncated));
      setMessage(`${data.places.length} mapped entries returned within ${radius / 1000} km. These are NOT independently verified care facilities.${data.truncated ? " Results are capped; search coverage is incomplete. Try a smaller radius." : " No results is not evidence that no facilities exist."}`);
    } catch (error) {
      if (searchRevision.current !== revision) return;
      setMessage(controller.signal.aborted ? "Search timed out. Try a smaller radius or use the external map." :
        error instanceof Error ? error.message : "Nearby search failed. Try again or visit the external map.");
    } finally {
      window.clearTimeout(timeout);
      if (searchRevision.current === revision) { setBusy(false); searchController.current = null; }
    }
  }
  const external = "https://www.openstreetmap.org/#map=12/" + center.lat + "/" + center.lon;
  const coverage = kinds.map(k => ({ ...k, count: k.key === "all" ? places.length : places.filter(p => p.kind === k.key).length }));
  return (
    <section id="poth-nearby-map" aria-labelledby="poth-nearby-heading" className="mt-10 rounded-2xl border p-4 sm:p-7" style={{ background: "var(--pro-elevated)", borderColor: "var(--pro-border)" }}>
      <h2 id="poth-nearby-heading" className="text-2xl font-bold">{t("Nearby healthcare discovery", "কাছের স্বাস্থ্যসেবা খুঁজুন")}</h2>
      <p className="mt-3 leading-relaxed">Search hospitals, clinics, maternity-tagged locations, midwives, doctors and pharmacies throughout Bangladesh. <strong>These are community OpenStreetMap entries, not verified clinical listings.</strong> Check addresses, telephone numbers, care availability and accessible entrances directly before travelling.</p>
      <p lang="bn" className="mt-2 text-sm">জরুরি চিকিৎসার জন্য শুধু মানচিত্রের তথ্যের উপর নির্ভর করবেন না। জাতীয় জরুরি সহায়তা: ৯৯৯।</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="font-semibold">Search centre · এলাকা
          <select value={cityChoice} onChange={e => selectCity(Number(e.target.value))} className="mt-2 min-h-12 w-full rounded-lg border bg-transparent px-3" style={{ borderColor: "var(--pro-control-border)" }}>
            <option value="" disabled>{t("GPS / custom point selected", "GPS / নিজের দেওয়া স্থান বাছা আছে")}</option>
            {cities.map((c, i) => <option key={c.name} value={i} className="text-black">{c.name}</option>)}
          </select>
        </label>
        <label className="font-semibold">Exact radius · ব্যাসার্ধ
          <select value={radius} onChange={e => { invalidateSearch(); setRadius(Number(e.target.value)); setMessage("Radius changed. Search again for current results."); }} className="mt-2 min-h-12 w-full rounded-lg border bg-transparent px-3" style={{ borderColor: "var(--pro-control-border)" }}>
            {ALLOWED_RADII.map(r => <option key={r} value={r} className="text-black">{r / 1000} km</option>)}
          </select>
        </label>
        <button type="button" onClick={locate} className="min-h-12 self-end rounded-lg border px-3 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}><Navigation size={17} aria-hidden="true" className="mr-1 inline"/>{t("Use my location (GPS)", "আমার অবস্থান ব্যবহার করুন (GPS)")}</button>
      </div>
      <details className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--pro-border)" }}>
        <summary className="pro-btn pro-btn-secondary">{t("Optional: choose an exact point with coordinates", "ঐচ্ছিক: অক্ষাংশ–দ্রাঘিমাংশ দিয়ে নির্দিষ্ট স্থান বাছুন")}</summary>
        <p className="mt-2">{t("You can skip this. Choose a city or use GPS above. Only a custom point needs both latitude and longitude; no coordinates are required for ordinary search.", "এই অংশ বাদ দিতে পারেন। ওপরে এলাকা বাছুন বা GPS ব্যবহার করুন। শুধু নিজে নির্দিষ্ট স্থান দিতে চাইলে অক্ষাংশ ও দ্রাঘিমাংশ দুটোই লাগবে; সাধারণ খোঁজে এগুলো প্রয়োজন নেই।")}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">{t("Latitude (optional advanced input)", "অক্ষাংশ (ঐচ্ছিক উন্নত ইনপুট)")}
          <input inputMode="decimal" type="text" value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="23.8103" className="mt-1 block min-h-11 w-32 rounded-lg border bg-transparent px-2" style={{ borderColor: "var(--pro-control-border)" }}/>
        </label>
        <label className="text-sm font-semibold">{t("Longitude (optional advanced input)", "দ্রাঘিমাংশ (ঐচ্ছিক উন্নত ইনপুট)")}
          <input inputMode="decimal" type="text" value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="90.4125" className="mt-1 block min-h-11 w-32 rounded-lg border bg-transparent px-2" style={{ borderColor: "var(--pro-control-border)" }}/>
        </label>
        <button type="button" onClick={applyManualPoint} disabled={!manualLat.trim() || !manualLon.trim()} className="min-h-11 rounded-lg border px-3 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>{t("Set custom location", "লেখা অবস্থান ব্যবহার করুন")}</button>
      </div>
      </details>
      <p className="mt-3 text-sm">Centre: {city}{gps ? " · GPS enabled by consent" : ""}. The radius is straight-line distance, not road distance or travel time.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => { void search(); }} disabled={busy} className="min-h-12 rounded-lg border px-5 font-semibold disabled:opacity-50" style={{ borderColor: "var(--pro-control-border)" }}><Search size={17} aria-hidden="true" className="mr-2 inline"/>{busy ? t("Searching…", "খোঁজা হচ্ছে…") : t("Search saved nearby records", "রাখা কাছের তথ্য খুঁজুন")}</button>
        <button type="button" onClick={() => { void search(true); }} disabled={busy} className="min-h-12 rounded-lg border px-5 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>{t("Check live map data", "সরাসরি মানচিত্রের তথ্য দেখুন")}</button>
        <a href={external} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center underline">{t("Open external area map ↗", "বাইরের মানচিত্র খুলুন ↗")}</a>
      </div>
      <p className="mt-2 text-xs">Saved search sends coordinates to this server. Live lookup also sends them to the external map-data provider and may keep a temporary server cache (results reused for 8 minutes). Hosting/provider request logs may also contain coordinates. Opening the map loads external tiles for this area. Nothing is shared with a care provider.</p>
      {dataMode && <p className="mt-3 font-semibold">{dataMode === "saved-snapshot" ? t("Saved snapshot only · collection date unknown · current operation unverified", "শুধু রাখা তথ্য · সংগ্রহের তারিখ অজানা · বর্তমানে চালু কি না যাচাই হয়নি") : t("Live lookup combined with saved records · individual entries remain unverified", "সরাসরি খোঁজ ও রাখা তথ্য একসঙ্গে · প্রতিটি তথ্য এখনও যাচাইহীন")}</p>}
      <p role="status" aria-live="polite" className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--pro-border)" }}>{message}</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Mapped coverage by category">
        {coverage.map(c => <button key={c.key} type="button" onClick={() => { setFilter(c.key); setShowCount(MAX_PAGE); }} aria-pressed={filter === c.key}
          className="min-h-11 rounded-full border px-3 text-sm font-semibold" style={{ borderColor: "var(--pro-control-border)", background: filter === c.key ? "var(--pro-border)" : "transparent" }}>{c.label} ({c.count})</button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="font-semibold">Search within results
          <input value={query} onChange={e => { setQuery(e.target.value); setShowCount(MAX_PAGE); }} placeholder="Name, street, neighbourhood" className="mt-1 min-h-12 w-full rounded-lg border bg-transparent px-3" style={{ borderColor: "var(--pro-control-border)" }}/>
        </label>
        <label className="font-semibold"><SlidersHorizontal size={15} className="mr-1 inline" aria-hidden="true"/>Sort facilities
          <select value={sort} onChange={e => setSort(e.target.value as "nearest" | "name")} className="mt-1 min-h-12 w-full rounded-lg border bg-transparent px-3" style={{ borderColor: "var(--pro-control-border)" }}>
            <option value="nearest" className="text-black">{t("Nearest first", "কাছেরটি আগে")}</option><option value="name" className="text-black">{t("Name A–Z", "নামের ক্রমে")}</option>
          </select>
        </label>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">{t("Optional area map", "এলাকার ঐচ্ছিক মানচিত্র")}</h3>
          <details id="poth-optional-map" open={mapOpen} onToggle={event => setMapOpen(event.currentTarget.open)}>
            <summary className="pro-btn pro-btn-secondary">{t("Show / hide optional map", "ঐচ্ছিক মানচিত্র দেখুন / বন্ধ করুন")}</summary>
            <p>{t("Opening this map requests external tiles for the selected area. All results remain available in the list.", "মানচিত্র খুললে নির্বাচিত এলাকার জন্য বাইরের সার্ভার থেকে ছবি আসবে। সব ফলাফল তালিকাতেও থাকবে।")}</p>
            {mapOpen && <TileMap key={`${center.lat}:${center.lon}:${radius}:${selected?.id ?? ""}`} center={center} radius={radius} places={matched} selected={selected} onSelect={setSelected}/>}
          </details>
          <p className="mt-2 text-xs">Blue circle indicates approximate straight-line search radius; pin positions may be building/area centres, not facility entrances. Directions open another app and can differ from straight-line distances.</p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold">Matching locations ({matched.length})</h3>
          <div className="space-y-3" aria-label="Healthcare results list">
            {matched.length === 0 && <p className="rounded-lg border p-4" style={{ borderColor: "var(--pro-border)" }}>{t("No matching community results yet. This does not mean care is unavailable. Try another area or clear your filters.", "মিল আছে এমন কমিউনিটি তথ্য নেই। এর অর্থ সেবা নেই নয়। অন্য এলাকা বা ফিল্টার মুছে খুঁজুন।")}</p>}
            {shown.map(p => <article key={p.id} className="rounded-xl border p-4" style={{ borderColor: selected?.id === p.id ? "var(--pro-control-border)" : "var(--pro-border)" }}>
              <h4 className="text-base font-bold">{p.name}</h4>
              <p className="mt-1 text-sm">{p.kind.replace("_", " ")} · {p.distanceKm.toFixed(2)} km straight-line</p>
              <p className="mt-1 text-sm"><strong>Address:</strong> {p.address || "Not supplied by the community map"}</p>
              <p className="mt-1 text-sm"><strong>Telephone:</strong> {p.phone || "Not supplied / not confirmed"}</p>
              <p className="mt-1 text-sm"><strong>Opening hours:</strong> {p.hours || "Unknown"}</p>
              <p className="mt-1 text-xs">{p.locationPrecision === "feature-center" ? "Approximate facility feature centre" : "Mapped point"} · {p.emergencyTagged ? "Tagged emergency=yes (unverified)" : "Emergency services not confirmed"} · Maternity services and accessibility unverified</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <button type="button" aria-controls="poth-optional-map" onClick={() => { setSelected(p); setMapOpen(true); window.setTimeout(() => { const summary = document.querySelector<HTMLElement>("#poth-optional-map > summary"); summary?.focus(); summary?.scrollIntoView({ block: "center" }); }, 0); }} className="min-h-11 rounded-lg border px-3 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}><MapPin size={15} aria-hidden="true" className="mr-1 inline"/>{t("Pin", "পিন")}</button>
                <a href={directions(p)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t("Directions ↗", "যাওয়ার পথ ↗")}</a>
                {p.phone && <a href={phoneLink(p.phone)} className="inline-flex min-h-11 items-center underline"><Phone size={14} aria-hidden="true" className="mr-1 inline"/>{t("Call (unverified)", "কল করুন (যাচাই হয়নি)")}</a>}
                {p.website && <a href={websiteLink(p.website)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t("Website ↗", "ওয়েবসাইট ↗")}</a>}
                <a href={p.osmUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t("OSM source ↗", "OSM উৎস ↗")}</a>
              </div>
            </article>)}
          </div>
          {showCount > MAX_PAGE && <button type="button" onClick={() => setShowCount(MAX_PAGE)} className="mt-3 min-h-12 rounded-lg border px-4 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>{t("Show fewer results", "কম ফলাফল দেখুন")}</button>}
          {matched.length > shown.length && <button type="button" onClick={() => setShowCount(c => c + MAX_PAGE)} className="mt-3 min-h-12 rounded-lg border px-4 font-semibold" style={{ borderColor: "var(--pro-control-border)" }}>Show more ({matched.length - shown.length} remaining)</button>}
        </div>
      </div>
      {truncated && <p className="mt-3 font-semibold">Result limit reached at the data provider. Try a smaller radius to improve local completeness.</p>}
      <p className="mt-4 flex gap-2 text-sm"><ShieldAlert aria-hidden="true" size={18} className="shrink-0"/>A map listing is not proof of clinical services, qualified staff, opening hours, wheelchair access or emergency obstetric capability. For urgent maternal symptoms, use emergency services and verified local care.</p>
      <p className="mt-2 text-sm"><Compass size={15} className="mr-1 inline" aria-hidden="true"/>For official registry-listed facilities, use the separate reviewed PROHOR directory. This live map is a supplementary discovery source.</p>
    </section>
  );
}
