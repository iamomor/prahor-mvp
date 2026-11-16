"use client";

/**
 * CareRequestStarter — accessible care coordination request form (Bondhon module).
 *
 * Integrates with Adapt preferences:
 *   - Text scaling / contrast / layout → inherited via CSS data attributes on <html>.
 *   - AAC preference                   → shows AAC hint; AACComposer inserts into message
 *                                        textarea via "prohor-aac-insert" CustomEvent.
 *   - Keyboard                         → all controls keyboard reachable, focus-visible.
 *   - Screen reader                    → labelled select, labelled textarea, role="status"
 *                                        for submission result, role="alert" for errors.
 *
 * Owner: Samin + Omor (Bondhon). Accessibility integration: Apurbo.
 * Status: Consent Architecture — no real care worker is connected.
 *
 * AGENTS.md requirements:
 *   - 44px minimum controls.
 *   - Semantic HTML only.
 *   - No colour-only status.
 *   - No auto-send of AAC message — user must review and submit.
 *   - Honest: clearly states no real delivery until Omor implements the workflow.
 *   - No hardcoded hex.
 */

import { useState, useId, useRef, useEffect } from "react";
import { useAdaptPreferences } from "@/features/adapt";

const AAC_INSERT_EVENT = "prohor-aac-insert";

const COMMUNICATION_OPTIONS = [
  { value: "text", label: "Text message" },
  { value: "aac", label: "Picture-and-text / AAC" },
  { value: "call", label: "Phone call (only if desired)" },
] as const;

type CommunicationMethod = (typeof COMMUNICATION_OPTIONS)[number]["value"];

export function CareRequestStarter() {
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<CommunicationMethod>("text");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const selectId = useId();
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { prefs } = useAdaptPreferences();

  /* ── AAC insert listener ─────────────────────────────────────────── */
  useEffect(() => {
    function handleAACInsert(event: Event) {
      const e = event as CustomEvent<{ text: string }>;
      if (!e.detail?.text) return;
      setMessage((prev) =>
        prev ? `${prev.trimEnd()} ${e.detail.text}` : e.detail.text
      );
      textareaRef.current?.focus();
    }
    window.addEventListener(AAC_INSERT_EVENT, handleAACInsert);
    return () => window.removeEventListener(AAC_INSERT_EVENT, handleAACInsert);
  }, []);

  /* ── Form submit ─────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Please describe the support you need before submitting.");
      return;
    }

    setErrorMsg("");
    setStatusMsg("");
    setBusy(true);

    try {
      const result = await fetch("/api/care-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, method }),
      });
      const body = (await result.json()) as { message?: string };
      setStatusMsg(
        body.message ??
          "Your request was not sent. The care request system is not yet connected."
      );
    } catch {
      setErrorMsg(
        "Connection failed. Your request was not sent. Please try again when connectivity is restored."
      );
    } finally {
      setBusy(false);
    }
  }

  const hasError = Boolean(errorMsg);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request care coordination"
      className="space-y-5"
    >
      {/* Demo notice */}
      <div
        role="note"
        className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
      >
        <p className="text-sm text-pro-info">
          <strong>Prototype:</strong> No real care worker is connected. This
          form returns a clear &ldquo;not sent&rdquo; response until Omor
          implements the secure workflow.
        </p>
      </div>

      {/* AAC hint */}
      {prefs.communication === "aac" && (
        <p className="text-sm text-pro-muted" role="note">
          <strong>AAC active:</strong> Use the AAC board to compose your message
          and insert it below. Review before submitting.
        </p>
      )}

      {/* Communication method */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-pro-text"
        >
          Preferred communication method
        </label>
        <select
          id={selectId}
          value={method}
          onChange={(e) => setMethod(e.target.value as CommunicationMethod)}
          className={[
            "min-h-[var(--pro-control-h)] w-full rounded-field border border-pro-control-border",
            "bg-pro-elevated px-3 text-pro-text",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
          ].join(" ")}
        >
          {COMMUNICATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message textarea */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-pro-text"
        >
          Your message
        </label>
        <p id={`${textareaId}-hint`} className="text-xs text-pro-muted">
          Describe the support you want. If using AAC, your composed message
          will appear here for review.
        </p>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          maxLength={1000}
          required
          rows={5}
          placeholder="Describe the support you want… / আপনি যে সহায়তা চান তা বর্ণনা করুন…"
          aria-describedby={`${textareaId}-hint${hasError ? ` ${textareaId}-error` : ""}`}
          aria-invalid={hasError || undefined}
          className={[
            "w-full rounded-field border bg-pro-elevated px-3 py-2.5 text-pro-text",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            "resize-y leading-[var(--pro-leading-body)]",
            hasError ? "border-pro-danger" : "border-pro-control-border",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      {/* Error */}
      {hasError && (
        <p
          id={`${textareaId}-error`}
          role="alert"
          className="inline-flex items-center gap-1.5 rounded-field border border-pro-danger-soft bg-pro-danger-soft px-3 py-2 text-sm font-medium text-pro-danger"
        >
          <span aria-hidden="true">⚠</span>
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={busy}
        className={[
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-6",
          "bg-pro-primary text-pro-on-primary font-semibold",
          "hover:bg-pro-primary-hover active:scale-[0.98]",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
        ].join(" ")}
      >
        {busy ? (
          <>
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-pro-on-primary/40 border-t-pro-on-primary animate-spin"
              aria-hidden="true"
            />
            Checking…
          </>
        ) : (
          "Review request availability"
        )}
      </button>

      {/* Status — role="status" announces without interrupting */}
      {statusMsg && (
        <p
          role="status"
          className="rounded-card border border-pro-border bg-pro-elevated px-4 py-3 text-sm text-pro-text"
        >
          {statusMsg}
        </p>
      )}
    </form>
  );
}
