"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Phone, Search } from "lucide-react";
import { geoLabel } from "./geoLabels";
import type { VisitFacility } from "./PothVisitPreparation";
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
      <div role="group" aria-label={t("Healthcare map with selectable place markers", "বাছাই করা যায় এমন স্থানসহ স্বাস্থ্যসেবার মানচিত্র")} className="relative h-[360px] w-full overflow-hidden sm:h-[430px]">
        <div className="absolute left-1/2 top-1/2" style={{ width: 900, height: 600, transform: "translate(-50%, -50%)" }}>
          {tiles.map(tile => <div key={tile.key} aria-hidden="true" className={`absolute h-64 w-64 ${styles.mapCanvas}`} style={{ left: tile.left, top: tile.top, backgroundImage: `url(${tile.src})`, backgroundSize: "256px 256px" }} />)}
          <div aria-hidden="true" className={`pointer-events-none absolute rounded-full ${styles.mapRadius}`} style={{ left: 450 - pan.x - radiusPixels, top: 300 - pan.y - radiusPixels, width: radiusPixels * 2, height: radiusPixels * 2 }} />
          <div aria-hidden="true" className={`pointer-events-none absolute h-3 w-3 rounded-full ${styles.mapCenter}`} style={{ left: 444 - pan.x, top: 294 - pan.y }} />
          {pins.map(({ place, x, y }) => <button type="button" key={place.id} title={`${place.name} — ${place.distanceKm.toFixed(1)} km, unverified`} aria-label={`Select ${place.name} on map`}
            onClick={() => onSelect(place)} className={`absolute flex h-11 w-11 items-center justify-center rounded-full font-bold ${styles.mapMarker} ${selected?.id === place.id ? styles.mapSelected : ""}`}
            style={{ left: x - 22, top: y - 22 }}>+</button>)}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1" aria-label={t("Map controls", "মানচিত্রের নিয়ন্ত্রণ")}>
          <button type="button" onClick={() => setZoomOffset(z => clamp(z + 1, -3, 3))} aria-label={t("Zoom in", "জুম বাড়ান")} className={`h-11 w-11 rounded-lg font-bold ${styles.mapControl}`}>+</button>
          <button type="button" onClick={() => setZoomOffset(z => clamp(z - 1, -3, 3))} aria-label={t("Zoom out", "জুম কমান")} className={`h-11 w-11 rounded-lg font-bold ${styles.mapControl}`}>−</button>
          <button type="button" onClick={() => { setPan({ x: 0, y: 0 }); setZoomOffset(0); }} aria-label={t("Reset map position", "মানচিত্র আবার কেন্দ্রে আনুন")} className={`min-h-11 rounded-lg px-2 font-bold ${styles.mapControl}`}>{t("Reset", "রিসেট")}</button>
        </div>
        <div className={`absolute bottom-2 right-2 grid grid-cols-3 gap-1 rounded-lg p-1 ${styles.mapControl}`} aria-label={t("Pan map", "মানচিত্র সরান")}>
          <span/><button type="button" onClick={() => setPan(p => ({ ...p, y: p.y - 170 }))} aria-label={t("Move map north", "মানচিত্র উত্তরে সরান")} className={`h-11 w-11 rounded border ${styles.mapControl}`}>↑</button><span/>
          <button type="button" onClick={() => setPan(p => ({ ...p, x: p.x - 170 }))} aria-label={t("Move map west", "মানচিত্র পশ্চিমে সরান")} className={`h-11 w-11 rounded border ${styles.mapControl}`}>←</button>
          <button type="button" onClick={() => setPan({ x: 0, y: 0 })} aria-label={t("Recenter map", "মানচিত্র কেন্দ্রে আনুন")} className={`h-11 w-11 rounded border ${styles.mapControl}`}>◎</button>
          <button type="button" onClick={() => setPan(p => ({ ...p, x: p.x + 170 }))} aria-label={t("Move map east", "মানচিত্র পূর্বে সরান")} className={`h-11 w-11 rounded border ${styles.mapControl}`}>→</button>
          <span/><button type="button" onClick={() => setPan(p => ({ ...p, y: p.y + 170 }))} aria-label={t("Move map south", "মানচিত্র দক্ষিণে সরান")} className={`h-11 w-11 rounded border ${styles.mapControl}`}>↓</button><span/>
        </div>
      </div>
      <p className="px-3 py-2 text-sm">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors · ODbL</a> · Pins show community-map positions or feature centres, not verified entrances. Map tiles require internet.</p>
      <p className="sr-only">Map has {places.length} selectable markers. All locations are also available in the accessible results list.</p>
    </div>
  );
}
export function PothNearbyMap({ onPrepare }: { onPrepare?: (place: VisitFacility) => void } = {}) {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => language === "bn" ? bn : en;
  const [mapOpen, setMapOpen] = useState(false);
  const [dataMode, setDataMode] = useState<"saved-snapshot" | "live-plus-snapshot" | null>(null);
  const [center, setCenter] = useState<Point>(cities[0]);
  const [cityChoice, setCityChoice] = useState("0");
  const [radius, setRadius] = useState(5000);
  const [places, setPlaces] = useState<CarePlace[]>([]);
  const [selected, setSelected] = useState<CarePlace | null>(null);
  const [filter, setFilter] = useState<"all" | CareCategory>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "name">("nearest");
  const [showCount, setShowCount] = useState(MAX_PAGE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ en: string; bn: string }>({ en: "Choose an area, then search.", bn: "এলাকা বেছে খুঁজুন।" });
  const [gps, setGps] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
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
    setCenter({ lat: next.lat, lon: next.lon }); setAccuracy(null);
    invalidateSearch(); setGps(false);
    setMessage({ en: `Area set to ${next.name}. Search again.`, bn: `${geoLabel(next.name, "bn")} এলাকা বাছা হয়েছে। আবার খুঁজুন।` });
  }
  function applyManualPoint() {
    const lat = Number(manualLat.trim()), lon = Number(manualLon.trim());
    if (!manualLat.trim() || !manualLon.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < 20.5 || lat > 26.8 || lon < 88 || lon > 92.8) {
      setMessage({ en: "Enter valid Bangladesh coordinates (latitude 20.5–26.8, longitude 88–92.8).", bn: "অক্ষাংশ ২০.৫–২৬.৮ এবং দ্রাঘিমাংশ ৮৮–৯২.৮-এর মধ্যে লিখুন।" }); return;
    }
    locationRevision.current += 1;
    setCenter({ lat, lon }); setCityChoice(""); setAccuracy(null);
    setGps(false); invalidateSearch();
    setMessage({ en: "Manual location set. Select Search to discover surrounding community-mapped facilities.", bn: "নিজের দেওয়া স্থান বাছা হয়েছে। এবার কাছের তথ্য খুঁজুন।" });
  }
  function locate() {
    if (!navigator.geolocation) { setMessage({ en: "GPS unavailable. Select a division city.", bn: "GPS নেই। তালিকা থেকে এলাকা বাছুন।" }); return; }
    setMessage({ en: "Waiting for GPS consent...", bn: "অবস্থানের অনুমতির জন্য অপেক্ষা হচ্ছে…" });
    const revision = ++locationRevision.current;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (revision !== locationRevision.current) return;
      const p = { lat: coords.latitude, lon: coords.longitude };
      if (p.lat < 20.5 || p.lat > 26.8 || p.lon < 88 || p.lon > 92.8) {
        setMessage({ en: "GPS point is outside the supported search area; select a city.", bn: "অবস্থানটি সমর্থিত এলাকার বাইরে। তালিকা থেকে এলাকা বাছুন।" }); return;
      }
      setCenter(p); setCityChoice(""); setAccuracy(Math.round(coords.accuracy));
      setGps(true); invalidateSearch();
      setMessage({ en: "GPS set. Select Search to request nearby community map records.", bn: "অবস্থান পাওয়া গেছে। এবার কাছের তথ্য খুঁজুন।" });
    }, () => { if (revision === locationRevision.current) setMessage({ en: "GPS denied or unavailable. Choose a city instead.", bn: "অবস্থানের অনুমতি নেই বা অবস্থান পাওয়া যায়নি। তালিকা থেকে এলাকা বাছুন।" }); },
    { maximumAge: 60000, timeout: 12000, enableHighAccuracy: false });
  }
  async function search(live = false) {
    invalidateSearch();
    const revision = searchRevision.current;
    const controller = new AbortController();
    searchController.current = controller;
    setBusy(true);
    setMessage(live ? { en: "Checking live map data…", bn: "সরাসরি মানচিত্রের তথ্য খোঁজা হচ্ছে…" } : { en: "Searching saved nearby records…", bn: "রাখা কাছের তথ্য খোঁজা হচ্ছে…" });
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
      setMessage({ en: `${data.places.length} map records within ${radius / 1000} km.`, bn: `${(radius / 1000).toLocaleString("bn-BD")} কিমির মধ্যে ${data.places.length.toLocaleString("bn-BD")}টি মানচিত্রের তথ্য।` });
    } catch {
      if (searchRevision.current !== revision) return;
      setMessage(controller.signal.aborted ? { en: "Search timed out. Try again or reduce the radius.", bn: "খোঁজার সময় শেষ হয়েছে। আবার চেষ্টা করুন বা ব্যাসার্ধ কমান।" } : { en: "Nearby search could not load. Try again or use the directory above.", bn: "কাছের তথ্য আনা যায়নি। আবার চেষ্টা করুন বা ওপরের তালিকায় খুঁজুন।" });
    } finally {
      window.clearTimeout(timeout);
      if (searchRevision.current === revision) { setBusy(false); searchController.current = null; }
    }
  }
  const external = "https://www.openstreetmap.org/#map=12/" + center.lat + "/" + center.lon;
  const coverage = kinds.map(k => ({ ...k, count: k.key === "all" ? places.length : places.filter(p => p.kind === k.key).length }));
  const kindNames: Record<"all" | CareCategory, string> = {
    all: t("All types", "সব ধরন"), hospital: t("Hospitals", "হাসপাতাল"), clinic: t("Clinics", "ক্লিনিক"),
    maternity: t("Women’s / maternity care (tagged)", "নারী ও মাতৃসেবা (ট্যাগ)"), midwife: t("Midwives", "ধাত্রী"), doctor: t("Doctors", "চিকিৎসক"), pharmacy: t("Pharmacies", "ফার্মেসি"),
  };
  const area = cityChoice ? geoLabel(cities[Number(cityChoice)].name, language) : gps ? t("Your GPS area", "আপনার GPS এলাকা") : t("Your chosen point", "আপনার দেওয়া স্থান");
  function pin(place: CarePlace) {
    setSelected(place); setMapOpen(true);
    window.setTimeout(() => { const summary = document.querySelector<HTMLElement>("#poth-optional-map > summary"); summary?.focus(); summary?.scrollIntoView({ block: "center" }); }, 0);
  }
  return <section id="poth-nearby-map" className={`${styles.panel} ${styles.stack}`} aria-labelledby="poth-nearby-heading">
    <div className={styles.sectionHead}><span className={styles.stepMark} aria-hidden="true">02</span><div><h2 id="poth-nearby-heading" tabIndex={-1}>{t("Look nearby", "কাছের সেবা খুঁজুন")}</h2><p className={styles.meta}>{t("Choose an area or use your location. GPS is optional.", "এলাকা বাছুন বা নিজের অবস্থান ব্যবহার করুন। GPS ঐচ্ছিক।")}</p></div></div>
    <div className={styles.filters}>
      <div className={styles.field}><label id="poth-nearby-area-label" htmlFor="poth-nearby-area">{t("Area", "এলাকা")}</label><select id="poth-nearby-area" aria-labelledby="poth-nearby-area-label" value={cityChoice} onChange={e => selectCity(Number(e.target.value))}>
        <option value="" disabled>{t("GPS / custom point", "GPS / নিজের দেওয়া স্থান")}</option>
        {cities.map((c, i) => <option key={c.name} value={i}>{geoLabel(c.name, language)}</option>)}
      </select></div>
      <label className={styles.field}>{t("Within", "ব্যাসার্ধ")}<select value={radius} onChange={e => { invalidateSearch(); setRadius(Number(e.target.value)); setMessage({ en: "Radius changed. Search again.", bn: "ব্যাসার্ধ বদলেছে। আবার খুঁজুন।" }); }}>
        {ALLOWED_RADII.map(r => <option key={r} value={r}>{(r / 1000).toLocaleString(language === "bn" ? "bn-BD" : "en")} {t("km", "কিমি")}</option>)}
      </select></label>
    </div>
    <div className={styles.actions}>
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy} onClick={() => void search()}><Search size={18} aria-hidden="true" />{busy ? t("Searching…", "খোঁজা হচ্ছে…") : t("Search this area", "এই এলাকায় খুঁজুন")}</button>
      <button type="button" className={styles.button} onClick={locate}><Navigation size={18} aria-hidden="true" />{t("Use my location", "আমার অবস্থান ব্যবহার করুন")}</button>
    </div>
    <p className={styles.meta}>{area}{accuracy !== null && gps ? ` · ±${accuracy.toLocaleString(language === "bn" ? "bn-BD" : "en")} m` : ""} · {t("Approximate search centre", "খোঁজার আনুমানিক কেন্দ্র")}</p>
    <details className={styles.disclosure}>
      <summary>{t("Location options & privacy", "অবস্থানের বিকল্প ও গোপনীয়তা")}</summary>
      <p>{t("Search sends the chosen point to our server. Live lookup also sends it to a map-data provider. Temporary caches and hosting/provider logs may contain coordinates; nothing is sent to a care provider.", "খুঁজলে বাছাই করা স্থান আমাদের সার্ভারে যায়। সরাসরি খোঁজে মানচিত্র-তথ্য সরবরাহকারীর কাছেও যায়। অস্থায়ী ক্যাশ ও সার্ভারের লগে স্থান থাকতে পারে; সেবাদাতাকে কিছু পাঠানো হয় না।")}</p>
      <button type="button" className={styles.textButton} disabled={busy} onClick={() => void search(true)}>{t("Refresh using live map data", "সরাসরি মানচিত্রের তথ্য দিয়ে আবার খুঁজুন")}</button>
      <details className={styles.disclosure}>
        <summary>{t("Optional: enter coordinates", "ঐচ্ছিক: অক্ষাংশ–দ্রাঘিমাংশ লিখুন")}</summary>
        <p>{t("Skip this for city or GPS search. Both values are needed only to set a custom point.", "এলাকা বা GPS দিয়ে খুঁজলে এটি লাগবে না। শুধু নিজের দেওয়া স্থান বসাতে দুটি মানই লাগে।")}</p>
        <div className={styles.filters}>
          <label className={styles.field}>{t("Latitude", "অক্ষাংশ")}<input inputMode="decimal" value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="23.8103" /></label>
          <label className={styles.field}>{t("Longitude", "দ্রাঘিমাংশ")}<input inputMode="decimal" value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="90.4125" /></label>
        </div>
        <button type="button" className={styles.button} disabled={!manualLat.trim() || !manualLon.trim()} onClick={applyManualPoint}>{t("Use this point", "এই স্থান ব্যবহার করুন")}</button>
      </details>
    </details>
    <p role="status" aria-live="polite">{language === "bn" ? message.bn : message.en}</p>
    {dataMode && <>
      <p className={styles.meta}>{dataMode === "saved-snapshot" ? t("Saved map data · not verified", "রাখা মানচিত্রের তথ্য · যাচাই হয়নি") : t("Live + saved map data · not verified", "সরাসরি ও রাখা তথ্য · যাচাই হয়নি")} · {t("Distances are straight-line, not travel time.", "দূরত্ব সরলরেখায়, যাতায়াতের সময় নয়।")}</p>
      <details className={styles.disclosure}>
        <summary>{t("Filter nearby results", "কাছের ফলাফলে ফিল্টার")}{filter !== "all" || query ? t(" · active", " · চালু") : ""}</summary>
        <div className={styles.filters}>
          <label className={styles.field}>{t("Name or street", "নাম বা রাস্তা")}<input type="search" value={query} maxLength={120} onChange={e => { setQuery(e.target.value); setShowCount(MAX_PAGE); }} /></label>
          <label className={styles.field}>{t("Type", "ধরন")}<select value={filter} onChange={e => { setFilter(e.target.value as "all" | CareCategory); setShowCount(MAX_PAGE); }}>{coverage.map(k => <option key={k.key} value={k.key}>{kindNames[k.key]} ({k.count})</option>)}</select></label>
          <label className={styles.field}>{t("Sort", "সাজান")}<select value={sort} onChange={e => setSort(e.target.value as "nearest" | "name")}><option value="nearest">{t("Nearest first", "কাছেরটি আগে")}</option><option value="name">{t("Name", "নামের ক্রমে")}</option></select></label>
        </div>
        <button type="button" className={styles.textButton} onClick={() => { setQuery(""); setFilter("all"); setSort("nearest"); setShowCount(MAX_PAGE); }}>{t("Clear result filters", "ফলাফলের ফিল্টার মুছুন")}</button>
      </details>
      {matched.length === 0 && <p className={styles.notice}>{t("No matching saved map record. This does not mean care is unavailable. Try another area or the directory above.", "রাখা মানচিত্রে মিল নেই। এর অর্থ সেবা নেই নয়। অন্য এলাকা বা ওপরের তালিকায় খুঁজুন।")}</p>}
      <div className={styles.cards}>{shown.map(p => <article key={p.id} className={styles.card}>
        <span className={styles.meta}>{kindNames[p.kind]} · {p.distanceKm.toLocaleString(language === "bn" ? "bn-BD" : "en", { maximumFractionDigits: 2 })} {t("km", "কিমি")}</span>
        <h3 tabIndex={-1}>{p.name}</h3><p>{p.address ?? t("Address not supplied", "ঠিকানা দেওয়া নেই")}</p>
        <div className={styles.actions}>
          {onPrepare && <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onPrepare({ id: p.id, name: p.name, nameBn: /[\u0980-\u09ff]/u.test(p.name) ? p.name : null, area: p.address, phone: p.phone, sourceUrl: p.osmUrl })}>{t("Prepare a visit", "সাক্ষাতের প্রস্তুতি")}</button>}
          {p.phone && <a className={styles.textButton} href={phoneLink(p.phone)}><Phone size={16} aria-hidden="true" />{t("Call", "কল করুন")}</a>}
          <a className={styles.textButton} href={directions(p)} target="_blank" rel="noopener noreferrer">{t("Directions ↗", "যাওয়ার পথ ↗")}</a>
        </div>
        <details className={styles.details}><summary>{t("Details & source", "বিস্তারিত ও উৎস")}</summary>
          <p>{t("Phone", "ফোন")}: {p.phone ?? t("Not supplied", "দেওয়া নেই")}</p><p>{t("Opening hours", "খোলার সময়")}: {p.hours ?? t("Unknown", "অজানা")}</p>
          <p>{t("Services and access are not independently verified. The map point may be a building centre, not an entrance.", "সেবা ও প্রবেশের সুবিধা স্বাধীনভাবে যাচাই হয়নি। মানচিত্রের স্থান ভবনের কেন্দ্র হতে পারে, দরজা নয়।")}</p>
          <div className={styles.actions}><button type="button" className={styles.textButton} aria-controls="poth-optional-map" onClick={() => pin(p)}><MapPin size={16} aria-hidden="true" />{t("Show on map", "মানচিত্রে দেখুন")}</button><a className={styles.textButton} href={p.osmUrl} target="_blank" rel="noopener noreferrer">{t("View source ↗", "উৎস দেখুন ↗")}</a>{p.website && <a className={styles.textButton} href={websiteLink(p.website)} target="_blank" rel="noopener noreferrer">{t("Website ↗", "ওয়েবসাইট ↗")}</a>}</div>
        </details>
      </article>)}</div>
      <div className={styles.actions}>
        {matched.length > shown.length && <button type="button" className={styles.button} onClick={() => { const firstNew = showCount; setShowCount(c => c + MAX_PAGE); window.requestAnimationFrame(() => document.querySelectorAll<HTMLElement>("#poth-nearby-map article h3")[firstNew]?.focus()); }}>{t("Show more", "আরও দেখুন")}</button>}
        {showCount > MAX_PAGE && <button type="button" className={styles.textButton} onClick={() => { setShowCount(MAX_PAGE); document.getElementById("poth-nearby-heading")?.focus(); }}>{t("Show only six", "শুধু ছয়টি দেখুন")}</button>}
      </div>
      {truncated && <p className={styles.meta}>{t("Results are limited. A smaller radius may show more local detail.", "ফলাফলের সীমা আছে। কম ব্যাসার্ধে খুঁজলে স্থানীয় আরও তথ্য পেতে পারেন।")}</p>}
    </>}
    <details id="poth-optional-map" className={styles.disclosure} open={mapOpen} onToggle={event => setMapOpen(event.currentTarget.open)}>
      <summary>{t("Show / hide map", "মানচিত্র দেখুন / বন্ধ করুন")}</summary>
      <p>{t("Opening the map loads external tiles. All returned records remain in the list.", "মানচিত্র খুললে বাইরের সার্ভার থেকে ছবি আসে। আনা সব তথ্য তালিকাতেও থাকে।")}</p>
      {mapOpen && <TileMap key={`${center.lat}:${center.lon}:${radius}:${selected?.id ?? ""}`} center={center} radius={radius} places={matched} selected={selected} onSelect={setSelected} />}
      <a className={styles.textButton} href={external} target="_blank" rel="noopener noreferrer">{t("Open external map ↗", "বাইরের মানচিত্র খুলুন ↗")}</a>
    </details>
  </section>;
}
