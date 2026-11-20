"use client";

/**
 * AACComposer — Universal Picture-and-Text Assisted Communication Builder.
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

import { useState, useId, useMemo } from "react";
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
};

export function AACComposer({
  targetLabel,
  onInsert,
  initialLanguage,
  className = "",
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

  const activeCatalog = AAC_CATALOG.find((cat) => cat.id === activeCategory) ?? AAC_CATALOG[0];

  const selectedOrder = new Map(selected.map((item, index) => [item.id, index + 1]));
  const pill = "inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-semibold transition-colors duration-[var(--pro-duration-fast)] ease-pro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:cursor-not-allowed disabled:opacity-50";
  const iconButton = "grid size-10 shrink-0 place-items-center rounded-control transition-colors duration-[var(--pro-duration-fast)] ease-pro focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-pro-focus disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <section
      aria-label="AAC Phrase Builder / ছবি ও প্রতীক দিয়ে বার্তা তৈরি"
      className={["grid grid-cols-1 gap-4 rounded-card border border-pro-border bg-pro-bg p-3 sm:p-4", className].join(" ")}
    >
      {/* Header: title + sentence language */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug text-pro-text">
            Build with symbols{" "}
            <span className="font-normal text-pro-muted" lang="bn">· ছবি ও প্রতীক দিয়ে বার্তা</span>
          </h2>
          <p className="mt-0.5 text-sm text-pro-muted">Tap symbols to write a sentence. Nothing is sent automatically.</p>
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

      {/* Category tabs */}
      <div>
        <p className="sr-only" id={`${composerId}-tabs-label`}>AAC symbol categories</p>
        <div
          role="tablist"
          aria-labelledby={`${composerId}-tabs-label`}
          className="flex gap-1 overflow-x-auto border-b border-pro-border pb-2 [scrollbar-width:thin] sm:flex-wrap"
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
                aria-controls={`${composerId}-panel-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={[
                  "grid min-h-12 shrink-0 content-center rounded-control px-3.5 py-1 text-start transition-colors duration-[var(--pro-duration-fast)] ease-pro",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  isActive
                    ? "bg-pro-surface-2 text-pro-text shadow-[inset_0_-3px_0_var(--pro-primary)]"
                    : "text-pro-text hover:bg-pro-surface",
                ].join(" ")}
              >
                <span lang="en" className="text-sm font-semibold leading-tight">{cat.labelEn}</span>
                <span lang="bn" className="text-xs leading-snug text-pro-muted">{cat.labelBn}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-pro-muted">
          {language === "bn" ? activeCatalog.descriptionBn : activeCatalog.descriptionEn}
        </p>
      </div>

      {/* Symbol tiles */}
      <div
        role="tabpanel"
        id={`${composerId}-panel-${activeCategory}`}
        aria-labelledby={`${composerId}-tab-${activeCategory}`}
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,6.75rem),1fr))] gap-2"
      >
        {activeCatalog.items.map((item) => {
          const order = selectedOrder.get(item.id);
          const isSelected = order !== undefined;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleItem(item)}
              className={[
                "relative flex min-h-28 flex-col items-center justify-center gap-1 rounded-card p-2.5 text-center",
                "transition-[background-color,border-color,transform] duration-[var(--pro-duration-fast)] ease-pro motion-safe:active:scale-[0.97]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                isSelected
                  ? "border-2 border-pro-primary bg-pro-surface-2 text-pro-text"
                  : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface",
              ].join(" ")}
              aria-label={`${item.labelEn} (${item.labelBn}) — ${isSelected ? `Selected, position ${order}. Click to remove.` : "Click to add."}`}
            >
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-pro-primary text-xs font-bold text-pro-on-primary tabular-nums"
                >
                  {order}
                </span>
              )}
              <span className="grid size-11 place-items-center rounded-full bg-pro-surface text-2xl" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-sm font-semibold leading-tight">{item.labelEn}</span>
              <span className="text-xs leading-snug text-pro-muted" lang="bn">{item.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* Message tray: ordered symbols, sentence, actions */}
      <div className="grid gap-3 rounded-card border border-pro-control-border bg-pro-elevated p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold text-pro-text">
            <span>Your message <span className="font-normal text-pro-muted" lang="bn">· নির্বাচিত প্রতীক</span></span>
            <span className="inline-grid min-w-6 place-items-center rounded-pill bg-pro-primary px-1.5 text-xs font-bold leading-6 text-pro-on-primary tabular-nums">
              {selected.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              aria-label="Undo last selection change"
              className={`${pill} text-pro-primary hover:bg-pro-surface`}
            >
              <Undo2 size={16} aria-hidden="true" />
              Undo
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={selected.length === 0}
              aria-label="Clear all selected items"
              className={`${pill} text-pro-danger hover:bg-pro-danger-soft`}
            >
              <Trash2 size={16} aria-hidden="true" />
              Clear all
            </button>
          </div>
        </div>

        {selected.length === 0 ? (
          <p className="rounded-field border border-dashed border-pro-control-border px-4 py-4 text-center text-sm text-pro-muted">
            No symbols selected yet. Tap symbols above to build symptoms, body areas, or requests.
          </p>
        ) : (
          <ol aria-label="Ordered list of selected symbols" className="flex flex-wrap gap-2">
            {selected.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex min-w-0 max-w-full items-center gap-1 rounded-field border border-pro-border bg-pro-surface py-1 ps-3 pe-1 text-pro-text"
              >
                <span className="text-sm font-bold text-pro-primary tabular-nums" aria-hidden="true">{index + 1}</span>
                <span aria-hidden="true" className="text-lg">{item.emoji}</span>
                <span className="min-w-0 px-1 text-sm font-semibold leading-tight">
                  {item.labelEn} <span className="font-normal text-pro-muted" lang="bn">{item.labelBn}</span>
                </span>
                <button
                  type="button"
                  onClick={() => moveItem(index, "earlier")}
                  disabled={index === 0}
                  aria-label={`Move ${item.labelEn} earlier`}
                  className={`${iconButton} text-pro-text hover:bg-pro-surface-2`}
                >
                  <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, "later")}
                  disabled={index === selected.length - 1}
                  aria-label={`Move ${item.labelEn} later`}
                  className={`${iconButton} text-pro-text hover:bg-pro-surface-2`}
                >
                  <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${item.labelEn}`}
                  className={`${iconButton} text-pro-danger hover:bg-pro-danger-soft`}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="grid gap-2 border-t border-pro-border pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={textareaId} className="font-semibold text-pro-text">
              Composed message <span className="text-sm font-normal text-pro-muted" lang="bn">· তৈরি হওয়া বাক্য</span>
            </label>
            {isCustomEdited && (
              <button
                type="button"
                onClick={handleResetToPhrase}
                className={`${pill} text-pro-primary underline underline-offset-2 hover:bg-pro-surface`}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Reset to tile phrasing
              </button>
            )}
          </div>
          <textarea
            id={textareaId}
            rows={3}
            value={currentMessageText}
            aria-describedby={`${textareaId}-hint`}
            onChange={(e) => {
              setIsCustomEdited(true);
              setCustomText(e.target.value);
            }}
            placeholder={
              language === "bn"
                ? "উপরের প্রতীকগুলো স্পর্শ করে বাক্য তৈরি করুন, অথবা সরাসরি সম্পাদনা করুন…"
                : "Select symbols above to generate a phrase, or edit directly here…"
            }
            className={[
              "w-full rounded-field border bg-pro-bg px-3.5 py-3 text-base text-pro-text",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
              "leading-[var(--pro-leading-body)]",
              isCustomEdited ? "border-pro-primary" : "border-pro-control-border",
            ].join(" ")}
          />
          <p id={`${textareaId}-hint`} className="text-sm text-pro-muted">
            {isCustomEdited
              ? "You have edited this text. It will be inserted exactly as typed."
              : "This sentence is generated automatically from your selected tiles. You can edit it anytime."}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <AppButton
            variant="primary"
            size="md"
            onClick={handleInsert}
            disabled={!currentMessageText.trim()}
            aria-disabled={!currentMessageText.trim()}
            className="max-sm:w-full"
          >
            <Check size={18} aria-hidden="true" />
            {targetLabel ?? (language === "bn" ? "বার্তায় যুক্ত করুন" : "Insert into message")}
          </AppButton>
          {currentMessageText && (
            <ReadAloudButton
              text={currentMessageText}
              language={language}
              label={language === "bn" ? "পড়ে শুনুন" : "Listen aloud"}
            />
          )}
        </div>
        <p className="text-sm text-pro-muted">
          Inserting places this draft into your target form so you can review and submit when ready.
        </p>
      </div>

      {/* Screen Reader Live Region */}
      <InlineLiveRegion message={announcement} className="text-sm text-pro-muted" />
    </section>
  );
}
