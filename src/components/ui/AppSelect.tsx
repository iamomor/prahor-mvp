"use client";

import { useId } from "react";
import { AlertCircle } from "lucide-react";
import type { SelectHTMLAttributes, ReactNode } from "react";

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

/**
 * AppSelect — an accessible labeled select element.
 *
 * AT compatibility:
 * - Persistent <label htmlFor> — not a placeholder.
 * - aria-describedby links hint and error to the select.
 * - aria-invalid set when error is present.
 * - Error span has role="alert" and an AlertCircle icon — not colour-only (WCAG 1.4.1).
 * - Native <select> element: keyboard navigable, voice-controllable, switch-accessible.
 */
export function AppSelect({
  label,
  error,
  hint,
  id,
  wrapperClassName = "",
  className = "",
  children,
  ...props
}: AppSelectProps) {
  // useId() produces a stable, SSR-safe ID that matches between server and client.
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["flex flex-col gap-1", wrapperClassName].filter(Boolean).join(" ")}>
      <label htmlFor={fieldId} className="text-sm font-semibold text-pro-text">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-xs text-pro-muted">
          {hint}
        </span>
      )}
      <select
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={[
          "min-h-[var(--pro-control-h)] w-full rounded-field border bg-pro-elevated px-3 text-pro-text",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
          error ? "border-pro-danger" : "border-pro-control-border",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-pro-danger"
        >
          <AlertCircle size={12} aria-hidden="true" className="shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
