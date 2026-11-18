"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, ExternalLink, ShieldAlert } from "lucide-react";
import type { Facility } from "@/lib/contracts/poth";

type ApiResponse = {
  facilities: Facility[];
  sourceType: string;
  bookingAvailable: false;
};

export function PothFacilityExplorer() {
  const [query, setQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const id = window.setTimeout(() => {
      setStatus("loading");
      fetch(`/api/poth/facilities?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Directory request failed");
          return response.json() as Promise<ApiResponse>;
        })
        .then((result) => {
          if (controller.signal.aborted) return;
          setFacilities(result.facilities);
          setStatus("ready");
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("error");
        });
    }, 200);
    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  return (
    <section aria-labelledby="poth-reviewed-heading" className="mt-10 rounded-2xl border p-5 sm:p-7"
      style={{ background: "var(--pro-elevated)", borderColor: "var(--pro-border)" }}>
      <h2 id="poth-reviewed-heading" className="mb-2 text-2xl font-bold">Source-linked facility records · উৎস-সংযুক্ত তথ্য</h2>
      <p className="mb-5 max-w-2xl leading-relaxed">
        Imported directory entries appear here after format checks and your team&#39;s source review.
        Listing presence is not proof of maternal services, accessibility or appointment availability.
      </p>
      <label htmlFor="poth-reviewed-search" className="mb-2 block font-semibold">
        Search imported records · আমদানি করা তথ্য খুঁজুন
      </label>
      <div className="relative">
        <Search aria-hidden="true" size={19} className="pointer-events-none absolute left-4 top-4" />
        <input id="poth-reviewed-search" type="search" value={query}
          onChange={(event) => setQuery(event.target.value)} maxLength={120}
          className="min-h-12 w-full rounded-xl border py-2 pl-12 pr-3"
          style={{ color: "var(--pro-text)", background: "var(--pro-bg)", borderColor: "var(--pro-control-border)" }}
          placeholder="Facility name / প্রতিষ্ঠানের নাম" />
      </div>
      <div aria-live="polite" aria-atomic="true" className="mt-5">
        {status === "loading" && <p role="status">Loading directory · তথ্য লোড হচ্ছে…</p>}
        {status === "error" && <p role="alert">Directory unavailable. Please retry later. · তথ্য পাওয়া যাচ্ছে না।</p>}
        {status === "ready" && facilities.length === 0 && (
          <p role="status" className="rounded-xl border p-4" style={{ borderColor: "var(--pro-border)" }}>
            No imported records match this search yet. This does NOT mean care is unavailable.
            · এই তালিকায় তথ্য না থাকার অর্থ স্বাস্থ্যসেবা নেই, এমন নয়।
          </p>
        )}
      </div>
      {status === "ready" && <div className="mt-4 grid gap-3">
        {facilities.map((facility) => (
          <article key={facility.id} className="rounded-xl border p-4"
            style={{ borderColor: "var(--pro-border)", background: "var(--pro-bg)" }}>
            <h3 className="text-lg font-bold">{facility.name}</h3>
            <p className="mt-1 flex items-start gap-2 text-sm">
              <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0" />
              {facility.address} · {facility.district}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm">
              <ShieldAlert size={16} aria-hidden="true" className="mt-1 shrink-0" />
              Maternal services and accessibility not independently confirmed.
            </p>
            <a href={facility.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 font-semibold underline"
              style={{ borderColor: "var(--pro-control-border)" }}>
              View recorded source (new tab) <ExternalLink size={16} aria-hidden="true"/>
            </a>
          </article>
        ))}
      </div>}
      <p className="mt-5 text-sm">
        Never assume a booked appointment. Confirm contact methods and services directly with the facility.
      </p>
    </section>
  );
}
