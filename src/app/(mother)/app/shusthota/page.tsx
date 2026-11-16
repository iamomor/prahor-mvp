import type { Metadata } from "next";
import Link from "next/link";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";
import { ShusthotaCheckInForm } from "./ShusthotaCheckInForm";

export const metadata: Metadata = { title: "Shusthota — Wellness | PROHOR" };

/**
 * /app/shusthota — Wellness & Private Diary.
 *
 * Owner: Samin. Accessibility integration: Apurbo.
 * Status: Working Prototype.
 *
 * Adapt integration delivered by Apurbo:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes.
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 *   - Private diary: clearly marked private; never shared by default.
 *   - No mandatory mood disclosure: all wellness tracking optional.
 *   - Accessible forms: label + fieldset pattern for optional entries.
 *   - Keyboard: all interactive controls reachable, focus-visible.
 *   - Screen reader: landmarks, headings, role="status" for save state.
 *
 * Required contract for Samin:
 *   - Use AppInput for all wellness form fields.
 *   - Never pre-select or require mood/emotional state disclosure.
 *   - Clearly mark diary entries as private.
 *   - Use role="status" for save confirmations.
 *   - Import useAdaptPreferences if reading prefs.
 *   - 44px minimum touch targets.
 */

export default function ShusthotaPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Shusthota" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Shusthota · সুস্থতা</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Wellness &amp; Well-being
          </h1>
          <p className="mt-2 text-pro-muted">
            Optional physical, emotional and daily-life wellness. Private diary
            — never shared without your explicit consent.
          </p>
        </div>

        {/* Private notice */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3"
        >
          <p className="text-sm text-pro-muted">
            <strong>Private by default.</strong> Your diary entries, mood notes
            and wellness records are never shared with supporters, providers, or
            any AI service unless you explicitly choose to share them.
          </p>
        </div>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: Working Prototype.</strong> Core
            implementation by Samin. Accessibility integration (accessible
            optional forms, private diary presentation) delivered by Apurbo.
          </p>
        </div>

        {/* Optional wellness form — demo structure */}
        <section aria-labelledby="wellness-heading" className="space-y-4">
          <h2 id="wellness-heading" className="text-lg font-semibold text-pro-text">
            Today&rsquo;s optional check-in
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              (ঐচ্ছিক)
            </span>
          </h2>
          <p className="text-sm text-pro-muted">
            All fields are optional. You decide what to record.
          </p>

          <ShusthotaCheckInForm />
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
            <li>Use AppInput / AppSelect for all wellness form fields</li>
            <li>Never pre-select or require mood disclosure</li>
            <li>Clearly label diary as private; never share without consent</li>
            <li>Use role=&ldquo;status&rdquo; for save confirmations</li>
            <li>Import useAdaptPreferences from &ldquo;@/features/adapt&rdquo; for prefs</li>
            <li>44px minimum touch targets (min-h-11 / min-h-12)</li>
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
