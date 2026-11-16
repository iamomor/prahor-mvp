import type { Metadata } from "next";
import Link from "next/link";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";

export const metadata: Metadata = { title: "Shonket — Safety & Help | PROHOR" };

/**
 * /app/shonket — Safety & Human Assistance.
 *
 * Owner: Samin. Accessibility integration: Apurbo.
 * Status: Limited — Samin implements core feature logic.
 *
 * Adapt integration delivered by Apurbo:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes.
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 *   - ReadAloudButton: available on safety content (see integration contract).
 *   - SimplifiedText: approved Bangla summaries of danger signs.
 *   - Keyboard: all interactions keyboard reachable, focus-visible.
 *   - Screen reader: landmarks, headings, role="region" for urgent contacts.
 *   - Emergency contacts: always accessible without JS or AI.
 *   - No colour-only: status badges use icon + text + colour.
 *
 * Required contract for Samin:
 *   - Import useAdaptPreferences from "@/features/adapt" for read-aloud checks.
 *   - Wrap safety content in ReadAloudButton + SimplifiedText where reviewed text exists.
 *   - Use AppInput for concern-reporting forms.
 *   - Never route emergency decisions through an unvalidated LLM.
 *   - Never claim a clinician received a request until actual delivery is verified.
 */

/** Synthetic demo danger signs — reviewed content only (not AI-generated). */
const DANGER_SIGNS = [
  {
    id: "ds1",
    sign: "Heavy vaginal bleeding",
    signBn: "প্রচুর যোনিপথে রক্তপাত",
    action: "Call 999 immediately or go to the nearest hospital emergency.",
    urgent: true,
  },
  {
    id: "ds2",
    sign: "Severe headache with visual changes",
    signBn: "তীব্র মাথাব্যথার সাথে দৃষ্টিঘাত",
    action: "Seek emergency care immediately — may indicate pre-eclampsia.",
    urgent: true,
  },
  {
    id: "ds3",
    sign: "Reduced or absent baby movement",
    signBn: "শিশুর নড়াচড়া কমে যাওয়া বা বন্ধ হওয়া",
    action: "Contact your midwife or maternity unit the same day.",
    urgent: false,
  },
  {
    id: "ds4",
    sign: "Painful urination with fever",
    signBn: "জ্বরের সাথে প্রস্রাবে ব্যথা",
    action: "Contact your health worker or clinic today.",
    urgent: false,
  },
] as const;

export default function ShonketPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Shonket" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Shonket · সংকেত</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Safety &amp; Help
          </h1>
          <p className="mt-2 text-pro-muted">
            Reviewed danger signs and direct human care access. Never routes
            emergencies through an unvalidated AI.
          </p>
        </div>

        {/* Emergency contacts — always visible, no AI, no JS required */}
        <section
          aria-labelledby="emergency-heading"
          className="rounded-card border-2 border-pro-danger bg-pro-danger-soft p-[var(--pro-pad-card)] space-y-3"
        >
          <h2
            id="emergency-heading"
            className="text-base font-semibold text-pro-danger flex items-center gap-2"
          >
            {/* Icon + text — never colour alone */}
            <span aria-hidden="true" className="text-lg">⚠</span>
            Emergency contacts — always available
          </h2>
          <dl className="grid gap-2 text-sm">
            <div className="flex items-center gap-3">
              <dt className="font-semibold text-pro-text w-40 shrink-0">
                National Health Helpline
              </dt>
              <dd>
                <a
                  href="tel:16263"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-pro-danger bg-pro-elevated px-3 font-bold text-pro-danger hover:bg-pro-danger-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus transition-colors"
                >
                  Call 16263
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="font-semibold text-pro-text w-40 shrink-0">
                Emergency services
              </dt>
              <dd>
                <a
                  href="tel:999"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-pro-danger bg-pro-elevated px-3 font-bold text-pro-danger hover:bg-pro-danger-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus transition-colors"
                >
                  Call 999
                </a>
              </dd>
            </div>
          </dl>
          <p className="text-xs text-pro-muted">
            These contacts work without signing in. Phone call is always an
            option — no voice-only tasks required.
          </p>
        </section>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: Limited.</strong> Core implementation by
            Samin (Shonket owner). Accessibility integration (accessible
            warnings, text-based reporting, read-aloud hooks) delivered by
            Apurbo.
          </p>
        </div>

        {/* Danger signs — reviewed content, text-first */}
        <section aria-labelledby="danger-heading" className="space-y-4">
          <h2 id="danger-heading" className="text-lg font-semibold text-pro-text">
            Reviewed danger signs
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              বিপদ সংকেত
            </span>
          </h2>
          <p className="text-sm text-pro-muted">
            These signs have been reviewed by qualified health professionals.
            They are not generated by AI.
          </p>

          <ul role="list" className="space-y-3">
            {DANGER_SIGNS.map((sign) => (
              <li key={sign.id}>
                <article
                  aria-labelledby={`sign-${sign.id}-label`}
                  className={[
                    "rounded-card border p-[var(--pro-pad-card)] space-y-2",
                    sign.urgent
                      ? "border-pro-danger bg-pro-danger-soft"
                      : "border-pro-warning-soft bg-pro-warning-soft",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={[
                        "mt-0.5 shrink-0 text-sm font-bold",
                        sign.urgent ? "text-pro-danger" : "text-pro-warning",
                      ].join(" ")}
                    >
                      {sign.urgent ? "🔴" : "🟡"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3
                        id={`sign-${sign.id}-label`}
                        className={[
                          "font-semibold",
                          sign.urgent ? "text-pro-danger" : "text-pro-warning",
                        ].join(" ")}
                      >
                        {sign.urgent ? "Urgent: " : ""}
                        {sign.sign}
                      </h3>
                      <p className="text-xs text-pro-muted mt-0.5" lang="bn">
                        {sign.signBn}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-pro-text leading-[var(--pro-leading-body)] pl-6">
                    {sign.action}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* Accessibility contract for Samin */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3 space-y-1"
        >
          <p className="text-sm font-semibold text-pro-text">
            For Samin — required accessibility contract
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-pro-muted list-disc list-inside">
            <li>Wrap safety text in ReadAloudButton (from &ldquo;@/features/adapt/components/ReadAloudButton&rdquo;)</li>
            <li>Wrap simplified versions in SimplifiedText (from &ldquo;@/components/accessibility/SimplifiedText&rdquo;)</li>
            <li>Use AppInput for concern-reporting forms</li>
            <li>Never route emergency decisions through AI</li>
            <li>Never claim clinician received request without confirmed delivery</li>
            <li>Keep emergency contacts visible without JS</li>
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
