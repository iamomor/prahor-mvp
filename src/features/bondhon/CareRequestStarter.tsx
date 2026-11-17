"use client";

/**
 * CareRequestStarter — accessible care coordination request form (Bondhon module).
 *
 * Integrates with Adapt preferences & AAC communication:
 *   - Text scaling / contrast / layout → inherited via CSS data attributes on <html>.
 *   - AAC preference & method          → AAC symbol board available inline or toggled.
 *   - AAC insert contract              → inserts composed phrases cleanly via mergeAacText;
 *                                        never sends or submits automatically.
 *   - Screen reader                    → labelled controls, role="status" announcements.
 *   - Keyboard                         → all controls keyboard reachable, focus-visible.
 *
 * Owner: Samin + Omor (Bondhon). Accessibility integration: Apurbo.
 * Status: Consent Architecture — no real care worker is connected.
 */

import { useState, useId, useRef, useEffect, useSyncExternalStore } from "react";
import { MessageSquareDot, Sparkles, AlertCircle } from "lucide-react";
import { useAdaptPreferences, AACComposer, AAC_INSERT_EVENT, mergeAacText, getStoredAacDraft, clearStoredAacDraft } from "@/features/adapt";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";

const COMMUNICATION_OPTIONS = [
  { value: "text", label: "Text message" },
  { value: "aac", label: "Picture-and-text / AAC" },
  { value: "call", label: "Phone call (only if desired)" },
] as const;

type CommunicationMethod = (typeof COMMUNICATION_OPTIONS)[number]["value"];

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

export function CareRequestStarter() {
  const { prefs } = useAdaptPreferences();

  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<CommunicationMethod>(() =>
    prefs.communication === "aac" ? "aac" : "text",
  );
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Stored draft from /app/adapt
  const storedDraft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getServerDraftSnapshot);
  const [dismissedDraft, setDismissedDraft] = useState<string | null>(null);
  const pendingDraft = storedDraft && storedDraft !== dismissedDraft ? storedDraft : null;

  // Show composer if method is AAC or user toggles it
  const [userAacToggle, setUserAacToggle] = useState<boolean | null>(null);
  const showAacComposer = userAacToggle ?? (prefs.communication === "aac" || method === "aac");

  const selectId = useId();
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── AAC insert listener ─────────────────────────────────────────── */
  useEffect(() => {
    function handleAACInsert(event: Event) {
      const e = event as CustomEvent<{ text: string }>;
      if (!e.detail?.text) return;
      const textToInsert = e.detail.text;
      setMessage((prev) => mergeAacText(prev, textToInsert));
      setAnnouncement("AAC message inserted into your care request. You can review and edit below.");
      textareaRef.current?.focus();
    }
    window.addEventListener(AAC_INSERT_EVENT, handleAACInsert);
    return () => window.removeEventListener(AAC_INSERT_EVENT, handleAACInsert);
  }, []);

  function handleDirectAacInsert(text: string) {
    setMessage((prev) => mergeAacText(prev, text));
    setAnnouncement("AAC message inserted into your care request. You can review and edit below.");
    clearStoredAacDraft();
    setDismissedDraft(text);
    textareaRef.current?.focus();
  }

  function handleConsumeDraft() {
    if (!pendingDraft) return;
    setMessage((prev) => mergeAacText(prev, pendingDraft));
    const consumed = pendingDraft;
    clearStoredAacDraft();
    setDismissedDraft(consumed);
    setAnnouncement("Saved AAC draft inserted into your care request.");
    textareaRef.current?.focus();
  }

  function handleDismissDraft() {
    const dismissed = pendingDraft;
    clearStoredAacDraft();
    if (dismissed) setDismissedDraft(dismissed);
    setAnnouncement("Saved draft dismissed.");
  }

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
          "Your request was not sent. The care request system is not yet connected.",
      );
    } catch {
      setErrorMsg(
        "Connection failed. Your request was not sent. Please try again when connectivity is restored.",
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
              Insert into message field
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
          onChange={(e) => {
            const nextMethod = e.target.value as CommunicationMethod;
            setMethod(nextMethod);
            if (nextMethod === "aac") {
              setUserAacToggle(true);
            }
          }}
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
              : "Use AAC Symbol Board / ছবি ও প্রতীক দিয়ে অনুরোধ তৈরি করুন"}
          </span>
        </button>

        {method === "aac" && (
          <span className="text-xs text-pro-muted">
            AAC symbol method selected
          </span>
        )}
      </div>

      {/* Inline AAC Composer */}
      {showAacComposer && (
        <div className="pt-1">
          <AACComposer
            targetLabel="Insert into care request / অনুরোধে যুক্ত করুন"
            onInsert={handleDirectAacInsert}
          />
        </div>
      )}

      {/* Message textarea */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-pro-text"
        >
          Your message
        </label>
        <p id={`${textareaId}-hint`} className="text-xs text-pro-muted">
          Describe the support you want, or use the AAC symbol board above.
          You can edit the message anytime before sending.
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
          <AlertCircle size={14} aria-hidden="true" className="shrink-0" />
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

      {/* Screen reader announcement for insertion events */}
      <InlineLiveRegion message={announcement} />
    </form>
  );
}
