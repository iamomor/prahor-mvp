"use client";

/**
 * BartaChatStarter — accessible Barta AI question-and-response panel.
 *
 * Integrates with Adapt preferences:
 *   - Text scaling / contrast / layout  → inherited via CSS data attributes on <html>
 *   - Read-aloud                        → ReadAloudButton rendered on AI response
 *   - AAC insert                        → AACComposer can populate the textarea via
 *                                         the shared "prohor-aac-insert" CustomEvent
 *   - Simple text                       → not applicable (Barta is user input, not static content)
 *   - Keyboard                          → all controls keyboard reachable, focus-visible
 *   - Screen reader                     → role="status" live region for AI response,
 *                                         fieldset/legend, labelled textarea, error role="alert"
 *
 * Owner: Iftee (Barta AI logic). Accessibility integration: Apurbo.
 * Status: Prototype — no real AI is connected. Returns a demo response.
 *
 * AGENTS.md requirements:
 *   - 44px minimum controls (min-h-11).
 *   - Semantic HTML only (no click-only divs).
 *   - No colour-only status.
 *   - No automatic audio playback.
 *   - Medical disclaimer present and honest.
 *   - No hardcoded hex — only --pro-* tokens.
 */

import { useState, useId, useRef, useEffect } from "react";
import { ReadAloudButton } from "@/features/adapt/components/ReadAloudButton";
import { useAdaptPreferences } from "@/features/adapt";

/** AAC insert event contract — matches AACComposer's dispatchInsert call. */
const AAC_INSERT_EVENT = "prohor-aac-insert";

export function BartaChatStarter() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const textareaId = useId();
  const errorId = useId();
  const responseId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { prefs } = useAdaptPreferences();

  /* ── AAC insert listener ─────────────────────────────────────────── */
  useEffect(() => {
    function handleAACInsert(event: Event) {
      const e = event as CustomEvent<{ text: string }>;
      if (!e.detail?.text) return;
      setQuestion((prev) =>
        prev ? `${prev.trimEnd()} ${e.detail.text}` : e.detail.text
      );
      // Return focus to the textarea so the user can review and edit.
      textareaRef.current?.focus();
    }

    window.addEventListener(AAC_INSERT_EVENT, handleAACInsert);
    return () => window.removeEventListener(AAC_INSERT_EVENT, handleAACInsert);
  }, []);

  /* ── Form submit ─────────────────────────────────────────────────── */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setErrorMsg("");
    setResponse("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as { message?: string };
      setResponse(
        data.message ??
          "The AI service did not return a response. Please try again."
      );
    } catch {
      setErrorMsg(
        "Connection failed. No AI answer was generated. Please check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const hasError = Boolean(errorMsg);
  const charCount = question.length;
  const maxChars = 1200;
  const nearLimit = charCount > maxChars * 0.9;

  return (
    <section aria-labelledby="barta-heading" className="max-w-3xl space-y-6">
      {/* Heading */}
      <div>
        <h1 id="barta-heading" className="text-2xl font-semibold text-pro-text">
          Ask Barta
          <span className="ml-2 text-base font-normal text-pro-muted" lang="bn">
            বার্তাকে জিজ্ঞেস করুন
          </span>
        </h1>
        <p className="mt-1 text-sm text-pro-muted">
          Evidence-grounded maternal guidance in Bangla and English.
        </p>
      </div>

      {/* Prototype notice */}
      <div
        role="note"
        className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3"
      >
        <p className="text-sm text-pro-info">
          <strong>Prototype:</strong> Barta AI is not connected in this MVP.
          This form demonstrates the integration contract, not a working medical
          assistant. Never rely on AI responses for medical decisions.
        </p>
      </div>

      {/* AAC hint when AAC preference is active */}
      {prefs.communication === "aac" && (
        <p className="text-sm text-pro-muted" role="note">
          <strong>AAC active:</strong> Compose a message in the AAC panel and
          insert it into the question field below before submitting.
        </p>
      )}

      {/* Question form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset className="space-y-3 border-0 p-0 m-0">
          <legend className="sr-only">Ask a maternal health question</legend>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={textareaId}
              className="text-sm font-semibold text-pro-text"
            >
              Your question
              <span className="ml-1 font-normal text-pro-muted" lang="bn">
                (বাংলা বা ইংরেজি)
              </span>
            </label>
            <p id={`${textareaId}-hint`} className="text-xs text-pro-muted">
              Type or paste your question. If you use the AAC board, your
              composed message will appear here for review before you send it.
            </p>
            <textarea
              id={textareaId}
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={maxChars}
              placeholder="Type your question here… / আপনার প্রশ্ন এখানে লিখুন…"
              required
              rows={5}
              aria-describedby={`${textareaId}-hint${hasError ? ` ${errorId}` : ""}`}
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
            <p
              className={[
                "text-right text-xs",
                nearLimit ? "text-pro-warning font-semibold" : "text-pro-muted",
              ].join(" ")}
              aria-live="polite"
              aria-label={`Character count: ${charCount} of ${maxChars}`}
            >
              {charCount}/{maxChars}
            </p>
          </div>

          {/* Error */}
          {hasError && (
            <p
              id={errorId}
              role="alert"
              className="inline-flex items-center gap-1.5 rounded-field border border-pro-danger-soft bg-pro-danger-soft px-3 py-2 text-sm font-medium text-pro-danger"
            >
              {/* Icon + text — never colour alone */}
              <span aria-hidden="true">⚠</span>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !question.trim()}
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
              "Ask PROHOR"
            )}
          </button>
        </fieldset>
      </form>

      {/* AI response — live region for screen readers */}
      {response && (
        <div
          className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3"
          aria-labelledby={`${responseId}-label`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id={`${responseId}-label`}
              className="text-sm font-semibold text-pro-text"
            >
              Barta&rsquo;s response
              <span className="ml-2 font-normal text-pro-muted" lang="bn">
                বার্তার উত্তর
              </span>
            </h2>
            {/* ReadAloud integration — only renders if TTS available */}
            <ReadAloudButton
              text={response}
              label="Read response aloud"
            />
          </div>

          {/* role="status" announces update to screen readers without interrupting */}
          <p
            role="status"
            id={responseId}
            className="text-sm text-pro-text leading-[var(--pro-leading-body)]"
          >
            {response}
          </p>

          <p className="text-xs text-pro-muted border-t border-pro-border pt-3">
            <strong>Important:</strong> AI responses are not verified medical
            advice. Always consult a qualified health worker for medical
            decisions.
          </p>
        </div>
      )}
    </section>
  );
}
