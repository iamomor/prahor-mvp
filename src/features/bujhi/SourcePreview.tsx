"use client";

import { useEffect, useRef, useState } from "react";
import type { SourceLocation } from "./report-schema";

export function SourcePreview({ source, location, onReturn }: { source: File; location?: SourceLocation; onReturn?: () => void }) {
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
  return <details open className="min-w-0 rounded-card border border-pro-border bg-pro-elevated p-4">
    <summary className="min-h-12 cursor-pointer font-semibold">মূল রিপোর্ট দেখুন · View original</summary>
    <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Original image zoom">
      <button type="button" className="min-h-12 rounded-control border border-pro-control-border px-3" disabled={zoom === 100} onClick={() => setZoom(zoom - 50)}>Zoom out</button>
      <output>{zoom}%</output>
      <button type="button" className="min-h-12 rounded-control border border-pro-control-border px-3" disabled={zoom === 250} onClick={() => setZoom(zoom + 50)}>Zoom in</button>
    </div>
    {onReturn && <button type="button" onClick={onReturn} className="mb-3 min-h-12 rounded-control border border-pro-control-border px-3">Back to the field</button>}
    <div ref={imageViewport} className="max-h-[70vh] overflow-auto" tabIndex={0} role="region" aria-label="Scrollable report image">
      <div className="relative" style={{ width: zoom + "%" }}>
        {/* Local object URLs are displayed directly to keep the source in the browser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt="Original uploaded report. The recognized text is available below." className="block h-auto w-full" onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />}
        {box && size.width > 0 && size.height > 0 && <span aria-hidden="true" className="pointer-events-none absolute border-2 border-pro-primary outline-2 outline-pro-bg" style={{
          left: box.x0 / size.width * 100 + "%", top: box.y0 / size.height * 100 + "%",
          width: (box.x1 - box.x0) / size.width * 100 + "%", height: (box.y1 - box.y0) / size.height * 100 + "%",
        }} />}
      </div>
    </div>
    {box && <p className="mt-2 text-pro-muted">Highlighted OCR line {location?.line}.</p>}
  </details>;
}
