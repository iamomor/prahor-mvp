"use client";

import { useId } from "react";
import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Must be provided — either a string or a React node label. */
  label: ReactNode;
  /** Error message, if any. When set, the input is marked aria-invalid. */
  error?: string;
  /** Helper text shown below the label. */
  hint?: string;
  /** Wrapper className. */
  wrapperClassName?: string;
};

/**
 * AppInput — an accessible labeled text input.
 * Always includes a visible label, error association, and hint text.
 */
export function AppInput({
  label,
  error,
  hint,
  id,
  wrapperClassName = "",
  className = "",
  ...props
}: AppInputProps) {
  // useId() produces a stable, SSR-safe ID that matches between server and client.
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["flex flex-col gap-1", wrapperClassName].filter(Boolean).join(" ")}>
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-pro-text"
      >
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-xs text-pro-muted">
          {hint}
        </span>
      )}
      <input
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={[
          "min-h-[var(--pro-control-h)] w-full rounded-field border bg-pro-elevated px-3 text-pro-text",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
          error
            ? "border-pro-danger"
            : "border-pro-control-border",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
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
