import type { Metadata } from "next";
import Link from "next/link";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";
import { HealthMetricsChart } from "@/components/accessibility/HealthMetricsChart";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Jibonrekha — Health Records | PROHOR" };

/**
 * /app/jibonrekha — Mother & Baby Health Records module.
 *
 * Owner: Ifty (core feature logic).
 * Accessibility integration: Apurbo.
 * Status: Limited — Ifty implements core feature logic.
 *
 * Adapt integration delivered by Apurbo:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes (CSS cascade).
 *   - HealthMetricsChart: bar chart + "View as table" toggle (Phase 1).
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 *   - StatusBadge: icon + text + colour (never colour alone).
 *   - Semantic HTML: headings, dl for metrics, article for records.
 *   - Screen reader: aria-labels, landmarks, accessible table alternative.
 *   - Keyboard: all interactive controls reachable, focus-visible.
 *
 * Form validation, real data storage, and clinical record logic: Ifty.
 *
 * Required contract for Ifty (module owner):
 *   - Import useAdaptPreferences from "@/features/adapt" if reading prefs.
 *   - Use AppInput / AppSelect for form fields (accessible labels, errors).
 *   - Use StatusBadge for record status (never colour alone).
 *   - Use HealthMetricsChart for any chart display.
 *   - Never hardcode hex — only --pro-* tokens or Tailwind aliases.
 *   - 44px minimum touch targets (min-h-11 / min-h-12).
 */

const DEMO_RECORDS = [
  {
    id: "r1",
    date: "2026-11-01",
    type: "Antenatal visit",
    source: "Self-entered",
    note: "28-week checkup. Blood pressure normal. Weight recorded.",
    status: "prototype" as const,
  },
  {
    id: "r2",
    date: "2026-10-15",
    type: "Lab result",
    source: "Bujhi extraction",
    note: "Haemoglobin 10.4 g/dL — extracted from uploaded report. Not yet clinician-confirmed.",
    status: "prototype" as const,
  },
];

export default function JibonrekhaPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Jibonrekha" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Jibonrekha · জীবনরেখা</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Mother &amp; Baby Health Records
          </h1>
          <p className="mt-2 text-pro-muted">
            Connected maternal and infant health timeline. Self-entered notes
            are always distinguished from clinician-confirmed observations.
          </p>
        </div>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: Limited.</strong> Core implementation by
            Ifty (Jibonrekha owner). Accessibility integration (accessible
            forms, text alternatives for charts) delivered by Apurbo.{" "}
            <strong>Demo data shown — no real health data stored.</strong>
          </p>
        </div>

        {/* Health metrics chart — text table alternative built in */}
        <section aria-labelledby="metrics-heading" className="space-y-4">
          <h2 id="metrics-heading" className="text-lg font-semibold text-pro-text">
            Key measurements
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              (কাল্পনিক তথ্য)
            </span>
          </h2>
          <HealthMetricsChart />
        </section>

        {/* Health record timeline */}
        <section aria-labelledby="records-heading" className="space-y-4">
          <h2 id="records-heading" className="text-lg font-semibold text-pro-text">
            Record timeline
          </h2>

          <ul role="list" className="space-y-3">
            {DEMO_RECORDS.map((record) => (
              <li key={record.id}>
                <article
                  aria-labelledby={`record-${record.id}-type`}
                  className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3
                        id={`record-${record.id}-type`}
                        className="font-semibold text-pro-text"
                      >
                        {record.type}
                      </h3>
                      <p className="text-xs text-pro-muted">
                        <time dateTime={record.date}>{record.date}</time>
                        {" · "}
                        <span>{record.source}</span>
                      </p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <p className="text-sm text-pro-muted leading-[var(--pro-leading-body)]">
                    {record.note}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* Accessibility contract note for module owner */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3 space-y-1"
        >
          <p className="text-sm font-semibold text-pro-text">
            For Ifty — required accessibility contract
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-pro-muted list-disc list-inside">
            <li>Use AppInput / AppSelect for all form fields</li>
            <li>Use HealthMetricsChart for any chart (table toggle built in)</li>
            <li>Use StatusBadge for record status (never colour alone)</li>
            <li>Import useAdaptPreferences from &ldquo;@/features/adapt&rdquo; if reading prefs</li>
            <li>44px minimum touch targets (min-h-11 or min-h-12)</li>
            <li>Never hardcode hex — only --pro-* tokens</li>
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
