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

  return (
    <section
      aria-label="AAC Phrase Builder / ছবি ও প্রতীক দিয়ে বার্তা তৈরি"
      className={[
        "rounded-card border border-pro-border bg-pro-elevated shadow-sm",
        className,
      ].join(" ")}
    >
      {/* Header banner */}
      <div className="border-b border-pro-border bg-pro-surface px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-pro-text flex items-center gap-2">
              <span aria-hidden="true">💬</span>
              <span>AAC Phrase Builder</span>
              <span className="text-sm font-normal text-pro-muted" lang="bn">
                (ছবি ও প্রতীক দিয়ে বার্তা)
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-pro-muted">
              Select tiles to compose natural sentences. Nothing is sent automatically.
            </p>
          </div>

          {/* Output Language Toggle */}
          <div className="flex items-center gap-1 text-xs">
            <Languages size={14} className="text-pro-muted" aria-hidden="true" />
            <span className="sr-only">Output language:</span>
            <div className="inline-flex rounded-pill border border-pro-control-border bg-pro-elevated p-0.5">
              <button
                type="button"
                onClick={() => setUserLanguageOverride("bn")}
                aria-pressed={language === "bn"}
                className={[
                  "min-h-8 rounded-pill px-2.5 py-0.5 text-xs font-semibold transition-colors",
                  language === "bn"
                    ? "bg-pro-primary text-pro-on-primary"
                    : "text-pro-text hover:bg-pro-surface",
                ].join(" ")}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setUserLanguageOverride("en")}
                aria-pressed={language === "en"}
                className={[
                  "min-h-8 rounded-pill px-2.5 py-0.5 text-xs font-semibold transition-colors",
                  language === "en"
                    ? "bg-pro-primary text-pro-on-primary"
                    : "text-pro-text hover:bg-pro-surface",
                ].join(" ")}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Category Tabs */}
        <div>
          <p className="sr-only" id={`${composerId}-tabs-label`}>
            AAC symbol categories
          </p>
          <div
            role="tablist"
            aria-labelledby={`${composerId}-tabs-label`}
            className="flex flex-wrap gap-2"
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
                    "min-h-11 rounded-pill px-4 py-2 text-sm font-semibold transition-all",
                    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                    isActive
                      ? "bg-pro-primary text-pro-on-primary shadow-sm"
                      : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface",
                  ].join(" ")}
                >
                  <span lang="en">{cat.labelEn}</span>
                  <span className="ml-1 text-xs opacity-80" lang="bn">
                    ({cat.labelBn})
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-pro-muted">
            {language === "bn" ? activeCatalog.descriptionBn : activeCatalog.descriptionEn}
          </p>
        </div>

        {/* Symbol Tile Grid */}
        <div
          role="tabpanel"
          id={`${composerId}-panel-${activeCategory}`}
          aria-labelledby={`${composerId}-tab-${activeCategory}`}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {activeCatalog.items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleItem(item)}
                className={[
                  "relative flex min-h-22 flex-col items-center justify-center gap-1.5 rounded-card p-3 text-center transition-all",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  isSelected
                    ? "border-2 border-pro-primary bg-pro-surface text-pro-text shadow-sm"
                    : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface active:scale-95",
                ].join(" ")}
                aria-label={`${item.labelEn} (${item.labelBn}) — ${isSelected ? "Selected. Click to remove." : "Click to add."}`}
              >
                {/* Visual selected checkmark badge (WCAG 1.4.1 non-color indicator) */}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pro-primary text-pro-on-primary text-[10px]"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <span className="text-3xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {item.labelEn}
                </span>
                <span className="text-xs text-pro-muted leading-tight" lang="bn">
                  {item.labelBn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Items Tray */}
        <div className="space-y-2 rounded-card border border-pro-border bg-pro-surface p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-pro-text">
              Selected items / <span lang="bn">নির্বাচিত প্রতীক</span>
              <span className="ml-2 inline-flex items-center rounded-pill bg-pro-elevated px-2 py-0.5 text-xs font-semibold text-pro-primary border border-pro-border">
                {selected.length}
              </span>
            </p>

            {/* Tray controls: Undo and Clear all */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                aria-label="Undo last selection change"
                className={[
                  "inline-flex min-h-9 items-center gap-1 rounded-pill border border-pro-control-border px-2.5 py-1 text-xs font-semibold transition-colors",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  undoStack.length === 0
                    ? "opacity-40 cursor-not-allowed bg-pro-elevated text-pro-muted"
                    : "bg-pro-elevated text-pro-text hover:bg-pro-surface",
                ].join(" ")}
              >
                <Undo2 size={13} aria-hidden="true" />
                Undo
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={selected.length === 0}
                aria-label="Clear all selected items"
                className={[
                  "inline-flex min-h-9 items-center gap-1 rounded-pill border border-pro-control-border px-2.5 py-1 text-xs font-semibold transition-colors",
                  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                  selected.length === 0
                    ? "opacity-40 cursor-not-allowed bg-pro-elevated text-pro-muted"
                    : "bg-pro-elevated text-pro-danger hover:bg-pro-danger-soft",
                ].join(" ")}
              >
                <Trash2 size={13} aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="rounded-field border border-dashed border-pro-border bg-pro-elevated px-4 py-6 text-center text-sm text-pro-muted">
              <p>No symbols selected yet.</p>
              <p className="mt-1 text-xs">
                Tap symbols above to build symptoms, body areas, or requests.
              </p>
            </div>
          ) : (
            <ul
              role="list"
              aria-label="Ordered list of selected symbols"
              className="flex flex-wrap gap-2 pt-1"
            >
              {selected.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="inline-flex items-center gap-1 rounded-pill border border-pro-control-border bg-pro-elevated px-2.5 py-1 text-xs font-medium text-pro-text shadow-xs"
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  <span>{item.labelEn}</span>
                  <span className="text-pro-muted" lang="bn">
                    ({item.labelBn})
                  </span>

                  {/* Reorder earlier */}
                  <button
                    type="button"
                    onClick={() => moveItem(index, "earlier")}
                    disabled={index === 0}
                    aria-label={`Move ${item.labelEn} earlier`}
                    className={[
                      "ml-1 rounded-full p-1 hover:bg-pro-surface focus-visible:outline-2 focus-visible:outline-pro-focus",
                      index === 0 ? "opacity-30 cursor-not-allowed" : "text-pro-muted",
                    ].join(" ")}
                  >
                    <ChevronLeft size={13} aria-hidden="true" />
                  </button>

                  {/* Reorder later */}
                  <button
                    type="button"
                    onClick={() => moveItem(index, "later")}
                    disabled={index === selected.length - 1}
                    aria-label={`Move ${item.labelEn} later`}
                    className={[
                      "rounded-full p-1 hover:bg-pro-surface focus-visible:outline-2 focus-visible:outline-pro-focus",
                      index === selected.length - 1 ? "opacity-30 cursor-not-allowed" : "text-pro-muted",
                    ].join(" ")}
                  >
                    <ChevronRight size={13} aria-hidden="true" />
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove ${item.labelEn}`}
                    className="ml-0.5 rounded-full p-1 text-pro-danger hover:bg-pro-danger-soft focus-visible:outline-2 focus-visible:outline-pro-focus"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message Preview & Editor */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor={textareaId}
              className="text-sm font-semibold text-pro-text flex items-center gap-2"
            >
              <span>Composed message</span>
              <span className="text-xs font-normal text-pro-muted" lang="bn">
                (তৈরি হওয়া বাক্য)
              </span>
            </label>

            <div className="flex items-center gap-2">
              {isCustomEdited && (
                <button
                  type="button"
                  onClick={handleResetToPhrase}
                  className="inline-flex items-center gap-1 text-xs text-pro-primary underline hover:text-pro-primary-hover focus-visible:outline-2 focus-visible:outline-pro-focus"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Reset to tile phrasing
                </button>
              )}

              {/* Read Aloud Button integration */}
              {currentMessageText && (
                <ReadAloudButton
                  text={currentMessageText}
                  language={language}
                  label={language === "bn" ? "পড়ে শুনুন" : "Listen aloud"}
                />
              )}
            </div>
          </div>

          <textarea
            id={textareaId}
            rows={3}
            value={currentMessageText}
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
              "w-full rounded-field border bg-pro-elevated px-3 py-2.5 text-sm text-pro-text",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
              "leading-[var(--pro-leading-body)]",
              isCustomEdited ? "border-pro-primary" : "border-pro-control-border",
            ].join(" ")}
          />

          <p className="text-xs text-pro-muted">
            {isCustomEdited
              ? "You have edited this text. It will be inserted exactly as typed."
              : "This sentence is generated automatically from your selected tiles. You can edit it anytime."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <AppButton
            variant="primary"
            size="md"
            onClick={handleInsert}
            data-testid="aac-insert-draft"
            disabled={!currentMessageText.trim()}
            aria-disabled={!currentMessageText.trim()}
          >
            <Check size={16} aria-hidden="true" />
            {targetLabel ?? (language === "bn" ? "বার্তায় যুক্ত করুন" : "Insert into message")}
          </AppButton>

          <p className="text-xs text-pro-muted">
            Inserting places this draft into your target form so you can review and submit when ready.
          </p>
        </div>

        {/* Screen Reader Live Region */}
        <InlineLiveRegion message={announcement} />
      </div>
    </section>
  );
}
