import type { Metadata } from "next";
import Link from "next/link";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";

export const metadata: Metadata = { title: "Bujhi — Report Understanding | PROHOR" };

/**
 * /app/bujhi — Medical Report Understanding.
 *
 * Owner: Iftee (OCR/extraction) + Ifty (review UI). Accessibility integration: Apurbo.
 * Status: OCR Prototype.
 *
 * Adapt integration delivered by Apurbo:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes.
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 *   - Confidence labels: text + icon (never colour alone).
 *   - Editable fields: AppInput for all extracted field review.
 *   - Screen reader: aria-describedby on uncertain fields, role="status" for save state.
 *   - Keyboard: all interactive controls reachable, focus-visible.
 *
 * Required contract for Iftee + Ifty:
 *   - Use AppInput for all extraction review fields.
 *   - Display confidence as text label + icon (never colour alone).
 *   - Mark extracted data as "Extracted — not yet verified" until confirmed.
 *   - Use role="status" for save confirmations.
 *   - Never auto-save into Jibonrekha without explicit mother confirmation.
 *   - Import useAdaptPreferences if reading prefs.
 */

/** Synthetic extraction demo — clearly marked, not real data. */
const DEMO_EXTRACTIONS = [
  {
    id: "e1",
    field: "Haemoglobin",
    fieldBn: "হিমোগ্লোবিন",
    extracted: "10.4 g/dL",
    confidence: "high" as const,
    unit: "g/dL",
    note: "Extracted from CBC report dated 2026-10-14.",
  },
  {
    id: "e2",
    field: "Blood glucose (fasting)",
    fieldBn: "উপবাসকালীন রক্তের গ্লুকোজ",
    extracted: "5.2",
    confidence: "medium" as const,
    unit: "mmol/L",
    note: "Unit not clearly visible in scan. Please verify.",
  },
  {
    id: "e3",
    field: "Platelet count",
    fieldBn: "প্লেটলেট সংখ্যা",
    extracted: "?",
    confidence: "low" as const,
    unit: "×10⁹/L",
    note: "Could not be read from scan. Please enter manually.",
  },
] as const;

const CONFIDENCE_LABELS: Record<
  "high" | "medium" | "low",
  { icon: string; label: string; classes: string }
> = {
  high: {
    icon: "✓",
    label: "High confidence",
    classes: "bg-pro-success-soft text-pro-success border-pro-success-soft",
  },
  medium: {
    icon: "~",
    label: "Medium confidence — please verify",
    classes: "bg-pro-warning-soft text-pro-warning border-pro-warning-soft",
  },
  low: {
    icon: "?",
    label: "Low confidence — manual entry required",
    classes: "bg-pro-danger-soft text-pro-danger border-pro-danger-soft",
  },
};

export default function BujhiPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Preference banner */}
        <ModuleAccessBanner moduleName="Bujhi" hideWhenDefault />

        {/* Page heading */}
        <div>
          <p className="pro-eyebrow">Bujhi · বুঝি</p>
          <h1 className="text-3xl font-semibold text-pro-text">
            Understand Your Reports
          </h1>
          <p className="mt-2 text-pro-muted">
            Scan diagnostic papers and lab reports. Bujhi assists with OCR
            extraction — you verify before saving.
          </p>
        </div>

        {/* Module status */}
        <div
          role="note"
          className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
        >
          <p className="text-sm text-pro-info">
            <strong>Module status: OCR Prototype.</strong> Core implementation
            by Iftee and Ifty. Accessibility integration (accessible review,
            confidence labels, editable fields) delivered by Apurbo.{" "}
            <strong>Demo extraction shown — no real report processed.</strong>
          </p>
        </div>

        {/* Extraction review section */}
        <section aria-labelledby="extraction-heading" className="space-y-4">
          <h2 id="extraction-heading" className="text-lg font-semibold text-pro-text">
            Extracted fields — review before saving
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              (কাল্পনিক তথ্য)
            </span>
          </h2>
          <p className="text-sm text-pro-muted">
            All fields below are extracted. They are{" "}
            <strong>not verified</strong> until you confirm and save. Corrections
            are always possible before saving to your records.
          </p>

          <ul role="list" className="space-y-4">
            {DEMO_EXTRACTIONS.map((item) => {
              const conf = CONFIDENCE_LABELS[item.confidence];
              return (
                <li key={item.id}>
                  <article
                    aria-labelledby={`extract-${item.id}-label`}
                    className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3
                          id={`extract-${item.id}-label`}
                          className="font-semibold text-pro-text"
                        >
                          {item.field}
                        </h3>
                        <p className="text-xs text-pro-muted" lang="bn">
                          {item.fieldBn}
                        </p>
                      </div>
                      {/* Confidence badge — icon + text, never colour alone */}
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-semibold",
                          conf.classes,
                        ].join(" ")}
                        aria-label={conf.label}
                      >
                        <span aria-hidden="true">{conf.icon}</span>
                        {conf.label}
                      </span>
                    </div>

                    {/* Editable review field — AppInput pattern inline for demo */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor={`field-${item.id}`}
                        className="text-sm font-semibold text-pro-text"
                      >
                        Extracted value
                        <span className="ml-1 font-normal text-pro-muted">
                          ({item.unit})
                        </span>
                      </label>
                      <p className="text-xs text-pro-muted">{item.note}</p>
                      <input
                        id={`field-${item.id}`}
                        type="text"
                        defaultValue={item.extracted === "?" ? "" : item.extracted}
                        placeholder={
                          item.extracted === "?"
                            ? "Enter value manually…"
                            : item.extracted
                        }
                        aria-describedby={`field-${item.id}-note`}
                        className={[
                          "min-h-[var(--pro-control-h)] w-full rounded-field border bg-pro-elevated px-3 text-pro-text",
                          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                          item.confidence === "low"
                            ? "border-pro-danger"
                            : "border-pro-control-border",
                        ].join(" ")}
                      />
                      <span id={`field-${item.id}-note`} className="text-xs text-pro-muted">
                        {item.confidence !== "high"
                          ? "Please verify this value before saving."
                          : "Extracted with high confidence. Still verify before saving."}
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Confirm + save — demo disabled */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-pro-primary px-6 text-sm font-semibold text-pro-on-primary opacity-50 cursor-not-allowed"
          >
            Confirm and save to records (feature coming soon)
          </button>
          <p className="text-xs text-pro-muted">
            Saving is disabled in this prototype. Ifty implements the confirmed
            save into Jibonrekha with mother&rsquo;s explicit review.
          </p>
        </section>

        {/* Accessibility contract for Iftee + Ifty */}
        <div
          role="note"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3 space-y-1"
        >
          <p className="text-sm font-semibold text-pro-text">
            For Iftee + Ifty — required accessibility contract
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-pro-muted list-disc list-inside">
            <li>Use AppInput for all extraction review fields (labels, errors, hints)</li>
            <li>Display confidence as CONFIDENCE_LABELS pattern (icon + text + colour)</li>
            <li>Mark all extracted data &ldquo;Extracted — not yet verified&rdquo;</li>
            <li>Use role=&ldquo;status&rdquo; for save confirmations</li>
            <li>Never auto-save to Jibonrekha without explicit mother confirmation</li>
            <li>Distinguish maternal vs baby record target before saving</li>
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
