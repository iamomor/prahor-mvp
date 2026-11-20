"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import type { SourceLocation } from "./report-schema";

export function SourcePreview({ source, location, onReturn, expanded = false }: { source: File; location?: SourceLocation; onReturn?: () => void; expanded?: boolean }) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [zoom, setZoom] = useState(100);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const next = URL.createObjectURL(source);
    void Promise.resolve().then(() => setUrl(next));
    return () => URL.revokeObjectURL(next);
  }, [source]);

  const imageViewport = useRef<HTMLDivElement>(null);
  const box = location?.box;
  useEffect(() => {
    const viewport = imageViewport.current;
    if (!viewport || !box || !size.width || !size.height) return;
    viewport.scrollLeft = (box.x0 + box.x1) / (2 * size.width) * viewport.scrollWidth - viewport.clientWidth / 2;
    viewport.scrollTop = (box.y0 + box.y1) / (2 * size.height) * viewport.scrollHeight - viewport.clientHeight / 2;
  }, [box, size, zoom]);
  return <details open={expanded || undefined} className="min-w-0 rounded-card border border-pro-border bg-pro-surface p-4 sm:p-5">
    <summary className="min-h-12 cursor-pointer font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">{t({ en: "Your report photo", bn: "আপনার রিপোর্টের ছবি" })}</summary>
    <p className="mb-3 text-sm text-pro-muted [overflow-wrap:anywhere]">{source.name}</p>
    <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label={t({ en: "Photo size", bn: "ছবির আকার" })}>
      <button type="button" className="min-h-12 rounded-control border border-pro-control-border px-3" disabled={zoom === 100} onClick={() => setZoom(zoom - 50)}>{t({ en: "Smaller", bn: "ছোট করুন" })}</button>
      <output>{zoom}%</output>
      <button type="button" className="min-h-12 rounded-control border border-pro-control-border px-3" disabled={zoom === 250} onClick={() => setZoom(zoom + 50)}>{t({ en: "Bigger", bn: "বড় করুন" })}</button>
    </div>
    {onReturn && <button type="button" onClick={onReturn} className="mb-3 min-h-12 rounded-control border border-pro-control-border px-3">{t({ en: "Back to the value", bn: "মানের ঘরে ফিরে যান" })}</button>}
    <div ref={imageViewport} className="max-h-[70vh] overflow-auto rounded-field border border-pro-border bg-pro-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus" tabIndex={0} role="region" aria-label={t({ en: "Report photo, scroll to see all of it", bn: "রিপোর্টের ছবি, পুরোটা দেখতে স্ক্রল করুন" })}>
      <div className="relative" style={{ width: zoom + "%" }}>
        {/* Local object URLs are displayed directly to keep the source in the browser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt={t({ en: "Your uploaded report photo", bn: "আপনার আপলোড করা রিপোর্টের ছবি" })} className="block h-auto w-full" onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />}
        {box && size.width > 0 && size.height > 0 && <span aria-hidden="true" className="pointer-events-none absolute border-2 border-pro-primary outline-2 outline-pro-bg" style={{
          left: box.x0 / size.width * 100 + "%", top: box.y0 / size.height * 100 + "%",
          width: (box.x1 - box.x0) / size.width * 100 + "%", height: (box.y1 - box.y0) / size.height * 100 + "%",
        }} />}
      </div>
    </div>
    {box && <p className="mt-2 text-pro-muted">{t({ en: `Line ${location?.line} is highlighted on the photo.`, bn: `ছবিতে ${location?.line} নম্বর লাইন চিহ্নিত করা আছে।` })}</p>}
  </details>;
}
