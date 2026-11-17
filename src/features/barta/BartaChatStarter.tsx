"use client";

/**
 * BartaChatStarter — accessible Barta AI question-and-response panel.
 *
 * Integrates with Adapt preferences & AAC communication:
 *   - Text scaling / contrast / layout  → inherited via CSS data attributes on <html>
 *   - Read-aloud                        → ReadAloudButton rendered on AI response
 *   - AAC symbol composer               → AACComposer available inline or via AAC mode
 *   - AAC insert contract               → list of composed phrases inserted cleanly
 *                                         via mergeAacText; never auto-submits
 *   - Screen reader announcements       → role="status" live regions for insertion and response
 *   - Keyboard                          → all controls keyboard reachable, focus-visible
 *
 * Owner: Iftee (Barta AI logic). Accessibility integration: Apurbo.
 * Status: Prototype — no real AI is connected. Returns a demo response.
 */

import { useState, useId, useRef, useEffect, useSyncExternalStore } from "react";
import { MessageSquareDot, Sparkles, AlertCircle } from "lucide-react";
import { ReadAloudButton } from "@/features/adapt/components/ReadAloudButton";
import { useAdaptPreferences, AACComposer, AAC_INSERT_EVENT, mergeAacText, getStoredAacDraft, clearStoredAacDraft } from "@/features/adapt";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";

function subscribeDraft(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("prohor-aac-draft-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("prohor-aac-draft-change", callback);
  };
}

function getDraftSnapshot(): string | null {
  return getStoredAacDraft();
}

function getServerDraftSnapshot(): string | null {
  return null;
}

export function BartaChatStarter() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const { prefs } = useAdaptPreferences();

  // Cross-page draft subscription with zero hydration mismatch
  const storedDraft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getServerDraftSnapshot);
  const [dismissedDraft, setDismissedDraft] = useState<string | null>(null);
  const pendingDraft = storedDraft && storedDraft !== dismissedDraft ? storedDraft : null;

  // Show inline AAC composer if user prefers AAC, or toggles it open
  const [userAacToggle, setUserAacToggle] = useState<boolean | null>(null);
  const showAacComposer = userAacToggle ?? (prefs.communication === "aac");

  const textareaId = useId();
  const errorId = useId();
  const responseId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── AAC insert listener ─────────────────────────────────────────── */
  useEffect(() => {
    function handleAACInsert(event: Event) {
      const e = event as CustomEvent<{ text: string }>;
      if (!e.detail?.text) return;
      const textToInsert = e.detail.text;
      setQuestion((prev) => mergeAacText(prev, textToInsert));
      setAnnouncement("AAC message inserted into your question field. You can review and edit below.");
      // Return focus to the textarea so the user can review and edit
      textareaRef.current?.focus();
    }

    window.addEventListener(AAC_INSERT_EVENT, handleAACInsert);
    return () => window.removeEventListener(AAC_INSERT_EVENT, handleAACInsert);
  }, []);

  function handleDirectAacInsert(text: string) {
    setQuestion((prev) => mergeAacText(prev, text));
    setAnnouncement("AAC message inserted into your question field. You can review and edit below.");
    clearStoredAacDraft();
    setDismissedDraft(text);
    textareaRef.current?.focus();
  }

  function handleConsumeDraft() {
    if (!pendingDraft) return;
    setQuestion((prev) => mergeAacText(prev, pendingDraft));
    const consumed = pendingDraft;
    clearStoredAacDraft();
    setDismissedDraft(consumed);
    setAnnouncement("Saved AAC draft inserted into your question field.");
    textareaRef.current?.focus();
  }

  function handleDismissDraft() {
    const dismissed = pendingDraft;
    clearStoredAacDraft();
    if (dismissed) setDismissedDraft(dismissed);
    setAnnouncement("Saved draft dismissed.");
  }

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

      {/* Saved draft recovery banner */}
      {pendingDraft && (
        <div
          role="region"
          aria-label="Pending AAC draft notice"
          className="rounded-card border border-pro-primary bg-pro-surface p-3.5 space-y-2"
        >
          <div className="flex items-start gap-2">
            <Sparkles size={18} className="text-pro-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-pro-text">
                You composed a message using AAC symbols:
              </p>
              <p className="mt-1 text-xs text-pro-text bg-pro-elevated p-2 rounded border border-pro-border">
                &ldquo;{pendingDraft}&rdquo;
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 pl-6">
            <button
              type="button"
              onClick={handleConsumeDraft}
              className="pro-btn pro-btn-primary !min-h-9 !px-3 text-xs"
            >
              Insert into question field
            </button>
            <button
              type="button"
              onClick={handleDismissDraft}
              className="pro-btn pro-btn-secondary !min-h-9 !px-3 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* AAC Composer Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setUserAacToggle(!showAacComposer)}
          aria-expanded={showAacComposer}
          className={[
            "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-xs font-semibold transition-all",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            showAacComposer
              ? "bg-pro-primary text-pro-on-primary shadow-xs"
              : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface",
          ].join(" ")}
        >
          <MessageSquareDot size={16} aria-hidden="true" />
          <span>
            {showAacComposer
              ? "Hide AAC Symbol Board"
              : "Use AAC Symbol Board / ছবি ও প্রতীক দিয়ে লিখুন"}
          </span>
        </button>

        {prefs.communication === "aac" && (
          <span className="text-xs text-pro-muted">
            AAC communication mode active
          </span>
        )}
      </div>

      {/* Inline AAC Composer */}
      {showAacComposer && (
        <div className="pt-1">
          <AACComposer
            targetLabel="Insert into question / প্রশ্নে যুক্ত করুন"
            onInsert={handleDirectAacInsert}
          />
        </div>
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
              Type your question, or use the AAC symbol board above to compose natural phrases.
              You can freely edit the text before sending.
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
              <AlertCircle size={14} aria-hidden="true" className="shrink-0" />
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

      {/* Screen reader announcement for insertion events */}
      <InlineLiveRegion message={announcement} />

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
            <ReadAloudButton
              text={response}
              label="Read response aloud"
            />
          </div>

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
