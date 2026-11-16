import type { Metadata } from "next";
import Link from "next/link";
import { CareRequestStarter } from "@/features/bondhon/CareRequestStarter";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Bondhon — Care Circle | PROHOR" };

/**
 * /app/bondhon — Consent-Controlled Care Coordination.
 *
 * Owner: Samin + Omor. Accessibility integration: Apurbo.
 * Status: Consent Architecture.
 *
 * Adapt integration delivered by Apurbo:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes.
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 *   - CareRequestStarter: fully accessible form with AAC insert, labelled select.
 *   - Consent summaries: text descriptions, screen-reader accessible.
 *   - StatusBadge: icon + text + colour for provider status.
 *   - Keyboard: all interactive controls reachable, focus-visible.
 *
 * Required contract for Samin + Omor:
 *   - Use CareRequestStarter (accessible) for care request forms.
 *   - Display consent controls with explicit labels and descriptions.
 *   - Revocation confirmation: use AppDialog with focus management.
 *   - Provider status: use StatusBadge (never colour alone).
 *   - Import useAdaptPreferences if reading prefs.
 *   - Never share private diary or AI conversation contents by default.
 *   - Disability status never automatically authorizes caregivers.
 */

/** Synthetic demo supporters — clearly marked. */
const DEMO_SUPPORTERS = [
  {
    id: "s1",
    name: "Fatema Begum",
    relationship: "Mother-in-law",
    access: ["Health records (read)", "Jibonrekha measurements"],
    status: "working" as const,
    lastActivity: "2026-11-15",
  },
  {
    id: "s2",
    name: "Dr. Rahman",
    relationship: "GP",
    access: ["Lab results (read)", "Visit notes (read)"],
    status: "prototype" as const,
    lastActivity: "2026-11-10",
  },
] as const;

export default function BondhonPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Bondhon" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Bondhon · বন্ধন</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Care Circle
          </h1>
          <p className="mt-2 text-pro-muted">
            Consent-controlled sharing with supporters and care providers.
            Explicit granular consent; one-tap revocation.
          </p>
        </div>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: Consent Architecture.</strong> Core
            implementation by Samin and Omor. Accessibility integration
            (accessible consent controls, provider status, AAC-ready request
            form) delivered by Apurbo.
          </p>
        </div>

        {/* Current supporters — demo */}
        <section aria-labelledby="supporters-heading" className="space-y-4">
          <h2 id="supporters-heading" className="text-lg font-semibold text-pro-text">
            Your care circle
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              (কাল্পনিক তথ্য)
            </span>
          </h2>

          <ul role="list" className="space-y-3">
            {DEMO_SUPPORTERS.map((supporter) => (
              <li key={supporter.id}>
                <article
                  aria-labelledby={`supporter-${supporter.id}-name`}
                  className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3
                        id={`supporter-${supporter.id}-name`}
                        className="font-semibold text-pro-text"
                      >
                        {supporter.name}
                      </h3>
                      <p className="text-xs text-pro-muted">
                        {supporter.relationship} · Last activity:{" "}
                        <time dateTime={supporter.lastActivity}>
                          {supporter.lastActivity}
                        </time>
                      </p>
                    </div>
                    <StatusBadge status={supporter.status} />
                  </div>

                  {/* Access summary — text, never colour alone */}
                  <div>
                    <p className="text-xs font-semibold text-pro-muted uppercase tracking-wide mb-1.5">
                      Consented access
                    </p>
                    <ul className="space-y-1">
                      {supporter.access.map((item) => (
                        <li
                          key={item}
                          className="inline-flex items-center gap-1.5 mr-2 mb-1 rounded-pill bg-pro-surface px-2.5 py-1 text-xs text-pro-muted"
                        >
                          <span aria-hidden="true">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Revocation — demo disabled */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      aria-label={`Manage access for ${supporter.name} (feature coming soon)`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-pro-border bg-pro-elevated px-3 text-xs font-semibold text-pro-muted opacity-50 cursor-not-allowed"
                    >
                      Manage access
                    </button>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      aria-label={`Remove ${supporter.name} from care circle (feature coming soon)`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-pro-danger-soft bg-pro-danger-soft px-3 text-xs font-semibold text-pro-danger opacity-50 cursor-not-allowed"
                    >
                      Remove access
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* Care request form — accessible */}
        <section aria-labelledby="request-heading" className="space-y-4">
          <h2 id="request-heading" className="text-lg font-semibold text-pro-text">
            Request care coordination
          </h2>
          <CareRequestStarter />
        </section>

        {/* Accessibility contract for Samin + Omor */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3 space-y-1"
        >
          <p className="text-sm font-semibold text-pro-text">
            For Samin + Omor — required accessibility contract
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-pro-muted list-disc list-inside">
            <li>Use AppDialog with focus management for revocation confirmation</li>
            <li>Use StatusBadge for provider status (never colour alone)</li>
            <li>Disability status never automatically authorizes caregivers</li>
            <li>Never share diary or AI conversation by default</li>
            <li>Consent summaries in plain text with screen-reader description</li>
            <li>44px minimum touch targets; keyboard-reachable revocation</li>
          </ul>
        </div>

        <Link
          href="/app"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-pro-border bg-pro-elevated px-4 text-sm font-semibold text-pro-text hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
