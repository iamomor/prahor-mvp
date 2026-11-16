"use client";

/**
 * ModuleAccessBanner — cross-module accessibility integration component.
 *
 * Reads the same preference store (useAdaptPreferences) that AdaptSettingsPanel
 * writes. Displays which accessibility preferences are currently active and
 * provides a one-tap link to Adapt settings.
 *
 * Ownership: Apurbo (Adapt / accessibility engine).
 * Usage: Import into any PROHOR module page. Does NOT own module business logic.
 *
 * AGENTS.md requirements met:
 * - Uses only --pro-* tokens (never hex).
 * - 44px minimum touch targets (min-h-11).
 * - Semantic HTML: <section>, <ul>, <li>.
 * - Screen-reader: aria-label on section, aria-live on preference list.
 * - No colour-only status.
 * - Preference changes never erase form content (banner is display-only).
 */

import Link from "next/link";
import { Settings2, Eye, Type, Maximize2, Wind, Focus, Languages } from "lucide-react";
import { useAdaptPreferences } from "@/features/adapt";

type ActivePref = {
  id: string;
  icon: React.ReactNode;
  label: string;
};

function useActivePrefLabels(): ActivePref[] {
  const { prefs } = useAdaptPreferences();
  const active: ActivePref[] = [];

  if (prefs.theme && prefs.theme !== "quiet-garden") {
    const themes: Record<string, string> = {
      "original-rose": "Original Rose theme",
      "morning-mist": "Morning Mist theme",
    };
    active.push({
      id: "theme",
      icon: <Eye size={14} aria-hidden="true" className="prohor-decorative" />,
      label: themes[prefs.theme] ?? prefs.theme,
    });
  }

  if (prefs.highContrast) {
    active.push({
      id: "contrast",
      icon: <Eye size={14} aria-hidden="true" className="prohor-decorative" />,
      label: "Higher contrast",
    });
  }

  if (prefs.textScale && prefs.textScale !== "default") {
    const labels: Record<string, string> = {
      large: "Larger text",
      "extra-large": "Extra large text",
    };
    active.push({
      id: "text-scale",
      icon: <Type size={14} aria-hidden="true" className="prohor-decorative" />,
      label: labels[prefs.textScale] ?? prefs.textScale,
    });
  }

  if (prefs.spaciousLayout) {
    active.push({
      id: "layout",
      icon: <Maximize2 size={14} aria-hidden="true" className="prohor-decorative" />,
      label: "Spacious layout",
    });
  }

  if (prefs.reducedMotion) {
    active.push({
      id: "motion",
      icon: <Wind size={14} aria-hidden="true" className="prohor-decorative" />,
      label: "Reduced motion",
    });
  }

  if (prefs.focusedView) {
    active.push({
      id: "focused",
      icon: <Focus size={14} aria-hidden="true" className="prohor-decorative" />,
      label: "Focused view",
    });
  }

  if (prefs.language && prefs.language !== "bn") {
    active.push({
      id: "language",
      icon: <Languages size={14} aria-hidden="true" className="prohor-decorative" />,
      label: `Language: ${prefs.language.toUpperCase()}`,
    });
  }

  if (prefs.simplifiedContent) {
    active.push({
      id: "simple",
      icon: <Languages size={14} aria-hidden="true" className="prohor-decorative" />,
      label: "Simple Bangla",
    });
  }

  if (prefs.communication === "aac") {
    active.push({
      id: "aac",
      icon: <Languages size={14} aria-hidden="true" />,
      label: "AAC communication",
    });
  }

  return active;
}

type Props = {
  /** Module name shown in screen-reader description */
  moduleName: string;
  /** Optionally hide when no prefs are active (default: show always) */
  hideWhenDefault?: boolean;
};

export function ModuleAccessBanner({ moduleName, hideWhenDefault = false }: Props) {
  const active = useActivePrefLabels();

  if (hideWhenDefault && active.length === 0) return null;

  return (
    <section
      aria-label={`Accessibility preferences active in ${moduleName}`}
      className="prohor-secondary-panel rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-pro-text flex items-center gap-1.5">
            <Settings2 size={15} aria-hidden="true" className="prohor-decorative shrink-0 text-pro-primary" />
            Accessibility preferences
          </p>

          {active.length > 0 ? (
            <ul
              aria-live="polite"
              aria-label="Currently active preferences"
              className="mt-2 flex flex-wrap gap-2"
            >
              {active.map((pref) => (
                <li
                  key={pref.id}
                  className="inline-flex items-center gap-1 rounded-pill bg-pro-surface px-2.5 py-1 text-xs text-pro-muted"
                >
                  {pref.icon}
                  {pref.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-pro-muted" aria-live="polite">
              Default preferences active.
            </p>
          )}

          <p className="mt-2 text-xs text-pro-muted">
            Your access preferences apply throughout{" "}
            <span lang="bn">প্রহর</span>. Changing them here never erases your
            form data.
          </p>
        </div>

        <Link
          href="/app/adapt"
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-pro-border",
            "bg-pro-elevated px-3 text-xs font-semibold text-pro-primary",
            "min-h-11 hover:bg-pro-surface hover:border-pro-control-border",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            "transition-colors",
          ].join(" ")}
        >
          <Settings2 size={14} aria-hidden="true" className="prohor-decorative" />
          Adjust access
        </Link>
      </div>
    </section>
  );
}
