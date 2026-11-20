"use client";

/**
 * AACComposer — "Say it with pictures": a picture-and-text sentence builder.
 *
 * Designed for mothers communicating symptoms, body-related sensations,
 * requests, and emotional urgency when speaking or typing is difficult.
 *
 * Core Principles & Accessibility (AGENTS.md + WCAG 2.2 AA):
 * - Natural language generation (idiomatic Bengali & English sentence templates).
 * - Multi-select, clear selected states (distinct border, checkmark, aria-pressed).
 * - Full selection management: remove, reorder (earlier/later), undo, clear all.
 * - Editable output: user can fine-tune text before inserting.
 * - Integrated Read-Aloud: uses shared Speech Engine to preview phrase aloud.
 * - Screen-reader live region: announces all additions, removals, reorders, and undo.
 * - Touch-friendly: minimum 44px (min-h-11) touch targets.
 * - Privacy: 100% client-side; no remote transmission or storage.
 * - Safety: NEVER automatically submits forms or sends requests.
 */

import { useState, useId, useMemo, type KeyboardEvent } from "react";
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Trash2,
  RotateCcw,
  Languages,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { ReadAloudButton } from "./ReadAloudButton";
import {
  AAC_CATALOG,
  generateNaturalPhrase,
  type AACPhraseItem,
  type AACCategory,
} from "../lib/aac-phrases";
import { dispatchAacInsert } from "../lib/aac-events";

export type AACComposerProps = {
  /** Custom label for the insert action button */
  targetLabel?: string;
  /** Callback invoked when the user confirms inserting their composed message */
  onInsert?: (composedText: string) => void;
  /** Explicit initial language override ("bn" | "en") */
  initialLanguage?: "bn" | "en";
  /** Optional container class name */
  className?: string;
  /** Drop the outer card frame when a parent already frames the builder. */
  bare?: boolean;
};

export function AACComposer({
  targetLabel,
  onInsert,
  initialLanguage,
  className = "",
  bare = false,
}: AACComposerProps) {
  const { prefs } = useAdaptPreferences();

  // Selection & history
  const [selected, setSelected] = useState<AACPhraseItem[]>([]);
  const [undoStack, setUndoStack] = useState<AACPhraseItem[][]>([]);
  const [activeCategory, setActiveCategory] = useState<AACCategory>("symptoms");
  const [userLanguageOverride, setUserLanguageOverride] = useState<"bn" | "en" | null>(null);

  // Effective language: user manual toggle > explicit initial prop > user preferences
  const language: "bn" | "en" = userLanguageOverride ?? initialLanguage ?? (prefs.language === "en" ? "en" : "bn");

  // Manual editing
  const [isCustomEdited, setIsCustomEdited] = useState(false);
  const [customText, setCustomText] = useState("");

  // Live region announcement
  const [announcement, setAnnouncement] = useState("");

  // Stable IDs for ARIA attributes
  const composerId = useId();
  const textareaId = useId();

  // Selected item ID set for O(1) membership check
  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  // Natural generated phrase based on current selections
  const generatedPhrase = useMemo(
    () => generateNaturalPhrase(selected, language),
    [selected, language],
  );

  // The active message text (either generated or manually tweaked)
  const currentMessageText = isCustomEdited ? customText : generatedPhrase;

  /* ── Selection actions with Undo tracking ─────────────────────── */

  function pushHistory() {
    setUndoStack((prev) => [...prev.slice(-15), selected]);
  }

  function toggleItem(item: AACPhraseItem) {
    pushHistory();
    const isCurrentlySelected = selectedIds.has(item.id);

    if (isCurrentlySelected) {
      const next = selected.filter((x) => x.id !== item.id);
      setSelected(next);
      if (!isCustomEdited) {
        setIsCustomEdited(false);
      }
      setAnnouncement(
        language === "bn"
          ? `${item.labelBn} বাদ দেওয়া হয়েছে। বাকি ${next.length}টি।`
          : `Removed ${item.labelEn}. ${next.length} items remaining.`,
      );
    } else {
      const next = [...selected, item];
      setSelected(next);
      if (!isCustomEdited) {
        setIsCustomEdited(false);
      }
      setAnnouncement(
        language === "bn"
          ? `${item.labelBn} যুক্ত হয়েছে। মোট ${next.length}টি প্রতীক।`
          : `Added ${item.labelEn}. ${next.length} items in message.`,
      );
    }
  }

  function removeItem(index: number) {
    if (index < 0 || index >= selected.length) return;
    const removedItem = selected[index];
    pushHistory();

    const next = selected.filter((_, i) => i !== index);
    setSelected(next);
    if (!isCustomEdited) {
      setIsCustomEdited(false);
    }
    setAnnouncement(
      language === "bn"
        ? `${removedItem.labelBn} বাদ দেওয়া হয়েছে। বাকি ${next.length}টি।`
        : `Removed ${removedItem.labelEn}. ${next.length} items remaining.`,
    );
  }

  function moveItem(index: number, direction: "earlier" | "later") {
    const targetIndex = direction === "earlier" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selected.length) return;

    pushHistory();
    const item = selected[index];
    const next = [...selected];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    setSelected(next);
    if (!isCustomEdited) {
      setIsCustomEdited(false);
    }
    setAnnouncement(
      language === "bn"
        ? `${item.labelBn} ${direction === "earlier" ? "আগে" : "পরে"} স্থানান্তর করা হয়েছে (অবস্থান ${targetIndex + 1})।`
        : `Moved ${item.labelEn} ${direction} to position ${targetIndex + 1}.`,
    );
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setSelected(previous);
    setIsCustomEdited(false);
    setAnnouncement(
      language === "bn"
        ? `পূর্বাবস্থায় ফিরিয়ে আনা হয়েছে। মোট ${previous.length}টি প্রতীক।`
        : `Undo applied. ${previous.length} items restored.`,
    );
  }

  function handleClearAll() {
    if (selected.length === 0) return;
    pushHistory();
    setSelected([]);
    setIsCustomEdited(false);
    setCustomText("");
    setAnnouncement(
      language === "bn"
        ? "সব প্রতীক মুছে ফেলা হয়েছে। ফিরিয়ে আনতে Undo চাপুন।"
        : "All selected items cleared. Press Undo to restore.",
    );
  }

  function handleResetToPhrase() {
    setIsCustomEdited(false);
    setCustomText("");
    setAnnouncement(
      language === "bn"
        ? "প্রতীকের মূল বাক্য ফিরিয়ে আনা হয়েছে।"
        : "Reset to natural generated sentence.",
    );
  }

  function handleInsert() {
    const finalText = currentMessageText.trim();
    if (!finalText) return;

    if (onInsert) {
      // Save before invoking the target callback. Barta/Bondhon consume this
      // draft during insertion; Adapt's callback deliberately leaves it for
      // the next route to recover.
      try {
        sessionStorage.setItem("prohor-aac-draft-v1", finalText);
      } catch {
        // Ignore storage errors in restricted contexts
      }
      onInsert(finalText);
    } else {
      dispatchAacInsert(finalText);
    }

    // Screen-reader feedback
    setAnnouncement(
      language === "bn"
        ? "বার্তা যুক্ত করা হয়েছে। পাঠানোর আগে পর্যালোচনা ও পরিবর্তন করতে পারেন।"
        : "Message inserted. Review and edit before sending.",
    );
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = AAC_CATALOG.findIndex((cat) => cat.id === activeCategory);
    const last = AAC_CATALOG.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? (index + 1) % AAC_CATALOG.length
            : (index - 1 + AAC_CATALOG.length) % AAC_CATALOG.length;
    setActiveCategory(AAC_CATALOG[next].id);
    document.getElementById(`${composerId}-tab-${AAC_CATALOG[next].id}`)?.focus();
  }

  const activeCatalog = AAC_CATALOG.find((cat) => cat.id === activeCategory) ?? AAC_CATALOG[0];

  const selectedOrder = new Map(selected.map((item, index) => [item.id, index + 1]));
  const hasSentence = selected.length > 0 || isCustomEdited;
  const link = "inline-flex min-h-11 items-center gap-1.5 rounded-control px-2.5 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] ease-pro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:cursor-not-allowed disabled:opacity-50";
  const iconButton = "grid size-10 shrink-0 place-items-center rounded-control transition-colors duration-[var(--pro-duration-fast)] ease-pro focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-pro-focus disabled:cursor-not-allowed disabled:opacity-35";
  const bn = language === "bn";

  return (
    <section
      aria-label="Say it with pictures / ছবি দিয়ে বলুন"
      className={[
        "grid grid-cols-1 gap-4",
        bare ? "" : "rounded-card border border-pro-border bg-pro-bg p-3 sm:p-4",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={bare ? "sr-only" : "text-lg font-semibold leading-snug text-pro-text"}>
            Say it with pictures{" "}
            <span className="font-normal text-pro-muted" lang="bn">· ছবি দিয়ে বলুন</span>
          </h2>
          <p className="mt-0.5 text-sm text-pro-muted">
            {bn
              ? "ছবিতে চাপ দিন, আমরা একটি বাক্য বানিয়ে দেব। আপনি না চাইলে কিছুই পাঠানো হবে না।"
              : "Tap the pictures that fit and we will write the sentence for you. Nothing is sent until you choose."}
          </p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Sentence language / বাক্যের ভাষা">
          <Languages size={16} className="text-pro-muted" aria-hidden="true" />
          <div className="inline-flex rounded-pill border border-pro-control-border bg-pro-elevated p-0.5">
            {(["bn", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                lang={code}
                onClick={() => setUserLanguageOverride(code)}
                aria-pressed={language === code}
                className={[
                  "min-h-10 rounded-pill px-3.5 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] ease-pro",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  language === code ? "bg-pro-primary text-pro-on-primary" : "text-pro-text hover:bg-pro-surface",
                ].join(" ")}
              >
                {code === "bn" ? "বাংলা" : "English"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="sr-only" id={`${composerId}-tabs-label`}>Picture groups</p>
        <div
          role="tablist"
          aria-labelledby={`${composerId}-tabs-label`}
          onKeyDown={onTabKeyDown}
          className="flex gap-1.5 overflow-x-auto rounded-pill bg-pro-surface p-1 [scrollbar-width:thin] sm:flex-wrap sm:rounded-card"
        >
          {AAC_CATALOG.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                id={`${composerId}-tab-${cat.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                aria-controls={`${composerId}-panel-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={[
                  "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border px-4 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] ease-pro",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  isActive
                    ? "border-pro-primary bg-pro-primary text-pro-on-primary shadow-pro-1"
                    : "border-transparent bg-transparent text-pro-text hover:bg-pro-elevated",
                ].join(" ")}
              >
                <span lang="en">{cat.labelEn}</span>
                <span lang="bn" className={isActive ? "font-normal text-pro-on-primary-muted" : "font-normal text-pro-muted"}>{cat.labelBn}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-pro-muted">
          {bn ? activeCatalog.descriptionBn : activeCatalog.descriptionEn}
        </p>
      </div>

      {/* Picture tiles */}
      <div
        role="tabpanel"
        id={`${composerId}-panel-${activeCategory}`}
        aria-labelledby={`${composerId}-tab-${activeCategory}`}
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,5.6rem),1fr))] gap-2.5 sm:gap-3"
      >
        {activeCatalog.items.map((item) => {
          const order = selectedOrder.get(item.id);
          const isSelected = order !== undefined;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={`${composerId}-phrase-help`}
              onClick={() => toggleItem(item)}
              className={[
                "group relative flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-[1.25rem] p-3 text-center",
                "transition-[background-color,border-color,transform,box-shadow] duration-[var(--pro-duration-fast)] ease-pro motion-safe:active:scale-[0.97]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                isSelected
                  ? "border-2 border-pro-primary bg-pro-surface-2 text-pro-text shadow-pro-1"
                  : "border-2 border-transparent bg-pro-surface text-pro-text hover:border-pro-control-border hover:bg-pro-elevated hover:shadow-pro-1",
              ].join(" ")}
            >
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute end-1.5 top-1.5 inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-pill bg-pro-primary px-1.5 text-xs font-bold text-pro-on-primary tabular-nums"
                >
                  <Check size={12} strokeWidth={3} />
                  {order}
                </span>
              )}
              <span
                className="grid size-14 place-items-center rounded-full bg-pro-elevated text-[2rem] shadow-pro-1 transition-transform duration-[var(--pro-duration-normal)] ease-pro motion-safe:group-hover:scale-105"
                aria-hidden="true"
              >
                {item.emoji}
              </span>
              <span className="text-sm font-semibold leading-tight">{item.labelEn}</span>
              <span className="text-xs leading-snug text-pro-muted" lang="bn">{item.labelBn}</span>
            </button>
          );
        })}
      </div>
      <p id={`${composerId}-phrase-help`} className="sr-only" lang={language}>
        {language === "bn" ? "বাক্যে যোগ করতে বাছুন। আবার বাছলে বাক্য থেকে বাদ যাবে।" : "Select to add this phrase. Select it again to remove it from the sentence."}
      </p>

      {/* Sentence: a quiet hint until something is picked, then the full editor */}
      {!hasSentence ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-dashed border-pro-control-border bg-pro-elevated px-4 py-3">
          <p className="text-sm text-pro-text">
            {bn ? "একটি ছবিতে চাপ দিয়ে শুরু করুন।" : "Tap a picture to start your sentence."}
          </p>
          {undoStack.length > 0 && (
            <button type="button" onClick={handleUndo} aria-label="Undo last selection change" className={`${link} text-pro-primary hover:bg-pro-surface-2`}>
              <Undo2 size={16} aria-hidden="true" />
              Undo
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 rounded-card border-2 border-pro-primary bg-pro-elevated p-3 shadow-[0_0.75rem_2rem_-0.75rem_rgb(var(--pro-shadow-rgb)/0.4)] sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold text-pro-text">
              <span>Picked <span className="font-normal text-pro-muted" lang="bn">· বাছাই করা ছবি</span></span>
              <span className="inline-grid min-w-6 place-items-center rounded-pill bg-pro-primary px-1.5 text-xs font-bold leading-6 text-pro-on-primary tabular-nums">
                {selected.length}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleUndo} disabled={undoStack.length === 0} aria-label="Undo last selection change" className={`${link} text-pro-primary hover:bg-pro-surface`}>
                <Undo2 size={16} aria-hidden="true" />
                Undo
              </button>
              <button type="button" onClick={handleClearAll} disabled={selected.length === 0} aria-label="Clear all selected items" className={`${link} text-pro-danger hover:bg-pro-danger-soft`}>
                <Trash2 size={16} aria-hidden="true" />
                Clear all
              </button>
            </div>
          </div>

          {selected.length > 0 && (
            <ol aria-label="Picked pictures, in order" className="flex flex-wrap gap-2">
              {selected.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="flex min-w-0 max-w-full items-center gap-1 rounded-pill border border-pro-border bg-pro-surface py-0.5 ps-3 pe-0.5 text-pro-text"
                >
                  <span className="text-sm font-bold text-pro-primary tabular-nums" aria-hidden="true">{index + 1}</span>
                  <span aria-hidden="true" className="text-lg">{item.emoji}</span>
                  <span className="min-w-0 px-1 text-sm font-semibold leading-tight">
                    {item.labelEn} <span className="font-normal text-pro-muted" lang="bn">{item.labelBn}</span>
                  </span>
                  <button type="button" onClick={() => moveItem(index, "earlier")} disabled={index === 0}
                    aria-label={`Move ${item.labelEn} earlier`} className={`${iconButton} rounded-full text-pro-text hover:bg-pro-surface-2`}>
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => moveItem(index, "later")} disabled={index === selected.length - 1}
                    aria-label={`Move ${item.labelEn} later`} className={`${iconButton} rounded-full text-pro-text hover:bg-pro-surface-2`}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => removeItem(index)}
                    aria-label={`Remove ${item.labelEn}`} className={`${iconButton} rounded-full text-pro-danger hover:bg-pro-danger-soft`}>
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          )}

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={textareaId} className="font-semibold text-pro-text">
                Your sentence <span className="text-sm font-normal text-pro-muted" lang="bn">· আপনার বাক্য</span>
              </label>
              {isCustomEdited && (
                <button type="button" onClick={handleResetToPhrase} className={`${link} text-pro-primary underline underline-offset-2 hover:bg-pro-surface`}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Use the picture wording again
                </button>
              )}
            </div>
            <textarea
              id={textareaId}
              rows={2}
              value={currentMessageText}
              aria-describedby={`${textareaId}-hint`}
              onChange={(e) => {
                setIsCustomEdited(true);
                setCustomText(e.target.value);
              }}
              className={[
                "w-full rounded-field border bg-pro-bg px-3.5 py-3 text-base text-pro-text",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                "leading-[var(--pro-leading-body)]",
                isCustomEdited ? "border-pro-primary" : "border-pro-control-border",
              ].join(" ")}
            />
            {selected.some((item) => item.dangerSign) && (
              <p role="note" className="rounded-field border border-pro-border bg-pro-surface p-3 text-sm text-pro-text">
                {bn
                  ? "এটি জরুরি লক্ষণ হতে পারে। এখনই ৯৯৯ নম্বরে কল করুন বা কাছের জরুরি সেবায় যান। প্রশ্ন পাঠানোর জন্য অপেক্ষা করবেন না। (এই শব্দচয়ন চিকিৎসক-পর্যালোচনার অপেক্ষায়।)"
                  : "This may be an urgent sign. Call 999 or go to the nearest emergency care now; do not wait for an answer here. (This wording is pending clinician review.)"}
              </p>
            )}
            <p id={`${textareaId}-hint`} className="text-sm text-pro-muted">
              {isCustomEdited
                ? "You changed this sentence. It will be added exactly as written."
                : "You can change the words before adding them."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AppButton
              variant="primary"
              size="lg"
              onClick={handleInsert}
              disabled={!currentMessageText.trim()}
              aria-disabled={!currentMessageText.trim()}
              className="max-sm:w-full"
            >
              <Check size={18} aria-hidden="true" />
              {targetLabel ?? (bn ? "বার্তায় যুক্ত করুন" : "Insert into message")}
            </AppButton>
            {currentMessageText && (
              <ReadAloudButton text={currentMessageText} language={language} label={bn ? "পড়ে শুনুন" : "Listen aloud"} />
            )}
          </div>
        </div>
      )}

      {/* Screen Reader Live Region */}

      <InlineLiveRegion message={announcement} className="text-sm text-pro-muted" />
    </section>
  );
}
