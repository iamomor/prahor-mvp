"use client";

/**
 * SimplifiedText — renders reviewed simplified content when the
 * "Simplified wording" preference is enabled, with an escape hatch
 * to view the original text at any time.
 *
 * Rules (AGENTS.md + AI_MEDICAL_CONTENT.md):
 * - Only approved, human-reviewed simplified text is shown.
 * - Safety-critical medical content is NEVER removed.
 * - The original wording is always accessible via "Show original".
 * - LLM-generated rewrites of clinical text are NOT used here.
 * - Simplified text is clearly distinguished from original.
 * - Medical meaning must be preserved; simplification is presentation only.
 *
 * Usage:
 *   <SimplifiedText
 *     original={<p>Placenta praevia is an obstetric complication...</p>}
 *     simplified={<p>আপনার গর্ভফুল নিচে আছে। এটি রক্তপাতের কারণ হতে পারে।</p>}
 *   />
 *
 * When no simplified content is available, renders original content only
 * regardless of the preference setting.
 *
 * Status: Working — preference wiring functional.
 * Simplified content itself requires manual human review per AI_MEDICAL_CONTENT.md.
 */

import { useState } from "react";
import { useAdaptPreferences } from "@/features/adapt/hooks/useAdaptPreferences";
import type { ReactNode } from "react";

type SimplifiedTextProps = {
  /** The original clinical/standard text. Always accessible. */
  original: ReactNode;
  /**
   * The reviewed, human-approved simplified alternative.
   * If undefined, original is always shown regardless of preference.
   * NEVER pass LLM-generated text here without human review.
   */
  simplified?: ReactNode;
  /** Label for the toggle button (e.g. the section title). */
  label?: string;
  className?: string;
};

export function SimplifiedText({
  original,
  simplified,
  label = "content",
  className = "",
}: SimplifiedTextProps) {
  const { prefs } = useAdaptPreferences();
  // User can override in either direction within this component.
  const [showSimplified, setShowSimplified] = useState<boolean | null>(null);

  // Effective state: null = follow preference; true/false = user override
  const effectiveSimplified =
    showSimplified !== null ? showSimplified : prefs.simplifiedContent;

  // If no simplified content exists, always show original.
  if (!simplified) {
    return <div className={className}>{original}</div>;
  }

  const isShowingSimplified = effectiveSimplified;

  return (
    <div className={className}>
      {/* Simplified/Original toggle notice — only shown when pref is active */}
      {prefs.simplifiedContent && (
        <div className="mb-2 flex items-center gap-2 rounded-pill border border-pro-info-soft bg-pro-info-soft px-3 py-1 text-xs text-pro-info">
          <span aria-hidden="true">📖</span>
          <span>
            {isShowingSimplified
              ? "Reviewed simpler wording — "
              : "Original wording — "}
          </span>
          <button
            type="button"
            onClick={() => setShowSimplified(!isShowingSimplified)}
            className="font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-pro-focus"
            aria-label={
              isShowingSimplified
                ? `Show original ${label}`
                : `Show simplified ${label}`
            }
          >
            {isShowingSimplified ? "Show original" : "Show simplified"}
          </button>
        </div>
      )}

      {/* Content — simplified or original */}
      <div
        aria-label={
          isShowingSimplified
            ? `Simplified version of ${label}`
            : undefined
        }
      >
        {isShowingSimplified ? simplified : original}
      </div>

      {/* When showing simplified, always provide access to original */}
      {isShowingSimplified && !prefs.simplifiedContent && (
        <button
          type="button"
          onClick={() => setShowSimplified(false)}
          className="mt-2 text-xs text-pro-primary underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-pro-focus"
        >
          Show original wording
        </button>
      )}
    </div>
  );
}
