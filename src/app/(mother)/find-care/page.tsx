import type { Metadata } from "next";
import { MapPinned, Phone, ExternalLink } from "lucide-react";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";

export const metadata: Metadata = {
  title: "Find Care — পথ | PROHOR",
  description:
    "Text-searchable directory of verified accessible maternal health facilities.",
};

/**
 * /find-care — Poth care directory module.
 *
 * Owner: Samin. Accessibility integration: Apurbo.
 * Status: Limited — facility data and map integration by Samin.
 *
 * Adapt integration:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes.
 *   - No map-only navigation: all facility information available as text.
 *   - Text-searchable: <input type="search"> with label.
 *   - Keyboard: all interactions keyboard reachable.
 *   - ModuleAccessBanner: active preference summary + link to Adapt.
 *
 * AGENTS.md: No map-only navigation. All facility info available as text.
 */

/** Synthetic demo facility data — clearly marked, not real listings. */
const DEMO_FACILITIES = [
  {
    id: "f1",
    name: "Dhaka Maternal Health Centre",
    nameBn: "ঢাকা মাতৃস্বাস্থ্য কেন্দ্র",
    type: "Government hospital",
    address: "Mirpur Road, Dhaka",
    phone: "02-123-4567",
    accessible: ["Wheelchair ramp", "Ground floor unit"],
    status: "Open",
  },
  {
    id: "f2",
    name: "Shishu O Matri Swasthya Kendra",
    nameBn: "শিশু ও মাতৃস্বাস্থ্য কেন্দ্র",
    type: "NGO clinic",
    address: "Mohammadpur, Dhaka",
    phone: "02-987-6543",
    accessible: ["Lift access", "Bangla-speaking staff"],
    status: "Open",
  },
  {
    id: "f3",
    name: "Rural Maternal Aid Post",
    nameBn: "গ্রামীণ মাতৃস্বাস্থ্য কেন্দ্র",
    type: "Community health post",
    address: "Narsingdi Sadar, Narsingdi",
    phone: "0167-000-0000",
    accessible: ["Ground floor"],
    status: "Call to confirm hours",
  },
] as const;

export default function FindCarePage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Poth" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Poth · পথ</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Find Care
            <span className="ml-2 text-lg font-normal text-pro-muted" lang="bn">
              স্বাস্থ্যকেন্দ্র খুঁজুন
            </span>
          </h1>
          <p className="mt-2 text-pro-muted">
            Verified accessible maternal health facilities. All information
            available as text — no map required.
          </p>
        </div>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: Limited.</strong> Synthetic demo data shown.
            Real facility directory and map integration by Samin. Accessibility
            integration (text search, no map-only navigation) delivered by
            Apurbo.
          </p>
        </div>

        {/* Text search — accessible, no JS required for basic display */}
        <div
          className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]"
          aria-labelledby="search-heading"
        >
          <h2 id="search-heading" className="mb-3 text-base font-semibold text-pro-text">
            Search facilities
          </h2>
          {/* Static label — search filtering to be implemented by Samin */}
          <label htmlFor="facility-search" className="sr-only">
            Search by facility name or location
          </label>
          <input
            type="search"
            id="facility-search"
            name="q"
            placeholder="Search by name or location…"
            aria-label="Search by facility name or location (feature coming soon)"
            disabled
            className={[
              "w-full min-h-[var(--pro-control-h)] rounded-field border border-pro-control-border",
              "bg-pro-surface px-3 text-pro-muted opacity-60 cursor-not-allowed",
            ].join(" ")}
          />
          <p className="mt-1.5 text-xs text-pro-muted">
            Text search will be enabled when Samin&rsquo;s facility data
            integration is complete.
          </p>
        </div>

        {/* Facility list — text-first, no map dependency */}
        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="mb-4 text-base font-semibold text-pro-text">
            Demo facilities
            <span className="ml-2 text-sm font-normal text-pro-muted">
              (synthetic data — not real listings)
            </span>
          </h2>

          <ul className="space-y-4" role="list">
            {DEMO_FACILITIES.map((facility) => (
              <li key={facility.id}>
                <article
                  aria-labelledby={`facility-${facility.id}-name`}
                  className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3
                        id={`facility-${facility.id}-name`}
                        className="font-semibold text-pro-text"
                      >
                        {facility.name}
                      </h3>
                      <p className="text-sm text-pro-muted" lang="bn">
                        {facility.nameBn}
                      </p>
                    </div>
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
                        facility.status === "Open"
                          ? "bg-pro-success-soft text-pro-success"
                          : "bg-pro-warning-soft text-pro-warning",
                      ].join(" ")}
                    >
                      {/* Icon + text — never colour alone */}
                      <span aria-hidden="true">
                        {facility.status === "Open" ? "●" : "◐"}
                      </span>
                      {facility.status}
                    </span>
                  </div>

                  <dl className="grid gap-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="font-medium text-pro-muted w-20 shrink-0">Type</dt>
                      <dd className="text-pro-text">{facility.type}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-pro-muted w-20 shrink-0">Address</dt>
                      <dd className="text-pro-text">{facility.address}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-pro-muted w-20 shrink-0">Access</dt>
                      <dd className="text-pro-text">
                        {facility.accessible.join(" · ")}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`tel:${facility.phone}`}
                      className={[
                        "inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-pro-border",
                        "px-3 text-sm font-semibold text-pro-primary bg-pro-elevated",
                        "hover:bg-pro-surface hover:border-pro-control-border",
                        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                        "transition-colors",
                      ].join(" ")}
                    >
                      <Phone size={15} aria-hidden="true" />
                      {facility.phone}
                    </a>
                    <span
                      aria-label="Map view not available — address provided as text above"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-pro-border px-3 text-sm text-pro-muted opacity-50 cursor-not-allowed"
                    >
                      <MapPinned size={15} aria-hidden="true" />
                      Map (coming soon)
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* No map-only navigation note */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3"
        >
          <p className="text-sm text-pro-muted">
            <strong>Note:</strong> All facility information is available as
            text. A map view will be an optional enhancement — never the only
            way to reach this information.
          </p>
          <a
            href="https://dghs.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-pro-border px-3 text-sm font-semibold text-pro-primary hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus transition-colors"
          >
            <ExternalLink size={14} aria-hidden="true" />
            DGHS official directory (opens in new tab)
          </a>
        </div>

        <a
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-pro-border bg-pro-elevated px-4 text-sm font-semibold text-pro-text hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus transition-colors"
        >
          ← Back to dashboard
        </a>
      </div>
    </div>
  );
}
