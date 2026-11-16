"use client";

/**
 * AACComposer — P1 prototype for picture-and-text assisted communication.
 *
 * Status: PROTOTYPE — visual demonstration only.
 * Messages are NEVER sent automatically. The user reviews and explicitly inserts.
 *
 * Rules:
 * - User selects picture tiles; each selection adds to a preview bar.
 * - User reviews the composed string in a text area.
 * - User explicitly clicks "Insert" to copy to a parent input.
 * - No automatic AI translation of symbols to medical terms.
 * - No automatic sending.
 */
import { useState } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";

type AACPhrase = {
  id: string;
  emoji: string;
  labelEn: string;
  labelBn: string;
};

const CATEGORIES: { label: string; labelBn: string; phrases: AACPhrase[] }[] = [
  {
    label: "Symptoms",
    labelBn: "লক্ষণ",
    phrases: [
      { id: "pain", emoji: "😣", labelEn: "Pain", labelBn: "ব্যথা" },
      { id: "headache", emoji: "🤕", labelEn: "Headache", labelBn: "মাথাব্যথা" },
      { id: "dizzy", emoji: "😵", labelEn: "Dizzy", labelBn: "মাথা ঘোরা" },
      { id: "fever", emoji: "🤒", labelEn: "Fever", labelBn: "জ্বর" },
      { id: "nausea", emoji: "🤢", labelEn: "Nausea", labelBn: "বমি বমি ভাব" },
      { id: "bleed", emoji: "🩸", labelEn: "Bleeding", labelBn: "রক্তক্ষরণ" },
    ],
  },
  {
    label: "Body areas",
    labelBn: "শরীরের অংশ",
    phrases: [
      { id: "belly", emoji: "🫃", labelEn: "Abdomen", labelBn: "পেট" },
      { id: "head", emoji: "🗣️", labelEn: "Head", labelBn: "মাথা" },
      { id: "back", emoji: "🔙", labelEn: "Back", labelBn: "পিঠ" },
      { id: "feet", emoji: "🦶", labelEn: "Feet / Legs", labelBn: "পা / পায়ের পাতা" },
    ],
  },
  {
    label: "Requests",
    labelBn: "অনুরোধ",
    phrases: [
      { id: "help", emoji: "🙏", labelEn: "Help please", labelBn: "সাহায্য করুন" },
      { id: "water", emoji: "💧", labelEn: "Water", labelBn: "পানি" },
      { id: "rest", emoji: "😴", labelEn: "Need rest", labelBn: "বিশ্রাম দরকার" },
      { id: "doctor", emoji: "👩‍⚕️", labelEn: "See doctor", labelBn: "ডাক্তার দরকার" },
      { id: "question", emoji: "❓", labelEn: "Question", labelBn: "প্রশ্ন আছে" },
    ],
  },
];

type AACComposerProps = {
  /** Called when user confirms composed text; parent inserts into message input. */
  onInsert?: (text: string) => void;
};

export function AACComposer({ onInsert }: AACComposerProps) {
  const [selected, setSelected] = useState<AACPhrase[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [category, setCategory] = useState(0);

  const composedText = selected
    .map((p) => `${p.emoji} ${p.labelBn}`)
    .join(" · ");

  function addPhrase(phrase: AACPhrase) {
    setSelected((prev) => [...prev, phrase]);
    setAnnouncement(`${phrase.labelEn} added. ${selected.length + 1} items in message.`);
  }

  function removePhrase(index: number) {
    setSelected((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setAnnouncement(
        next.length === 0
          ? "All items removed."
          : `Removed. ${next.length} items remaining.`,
      );
      return next;
    });
  }

  function clearAll() {
    setSelected([]);
    setAnnouncement("Message cleared.");
  }

  function handleInsert() {
    if (!composedText) return;
    onInsert?.(composedText);
    setAnnouncement("Message inserted. You can review and edit before sending.");
    setSelected([]);
  }

  const cat = CATEGORIES[category];

  return (
    <div className="rounded-hero border border-pro-border bg-pro-elevated">
      {/* Prototype banner */}
      <div className="rounded-t-hero border-b border-pro-border bg-pro-warning-soft px-4 py-2">
        <p className="text-xs font-semibold text-pro-warning">
          🔵 Prototype — Picture-and-text communication (AAC). Messages are never sent automatically.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Category tabs */}
        <div role="tablist" aria-label="AAC categories" className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              role="tab"
              aria-selected={i === category}
              aria-controls={`aac-panel-${i}`}
              id={`aac-tab-${i}`}
              onClick={() => setCategory(i)}
              className={[
                "rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors min-h-10",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                i === category
                  ? "bg-pro-primary text-pro-on-primary"
                  : "border border-pro-control-border text-pro-text hover:bg-pro-surface",
              ].join(" ")}
            >
              <span lang="en">{cat.label}</span>
              <span className="ml-1 text-xs opacity-75" lang="bn">({cat.labelBn})</span>
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div
          role="tabpanel"
          id={`aac-panel-${category}`}
          aria-labelledby={`aac-tab-${category}`}
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {cat.phrases.map((phrase) => (
            <button
              key={phrase.id}
              type="button"
              onClick={() => addPhrase(phrase)}
              className={[
                "flex min-h-20 flex-col items-center justify-center gap-1 rounded-card border border-pro-control-border",
                "px-2 py-3 text-center transition-colors hover:bg-pro-surface active:scale-95",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
              ].join(" ")}
              aria-label={`Add: ${phrase.labelEn} / ${phrase.labelBn}`}
            >
              <span className="text-3xl" aria-hidden="true">{phrase.emoji}</span>
              <span className="text-xs font-semibold text-pro-text leading-tight">{phrase.labelEn}</span>
              <span className="text-xs text-pro-muted leading-tight" lang="bn">{phrase.labelBn}</span>
            </button>
          ))}
        </div>

        {/* Composed message preview */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-pro-text">
            Composed message / <span lang="bn">তৈরি বার্তা</span>
            {selected.length > 0 && (
              <span className="ml-2 text-xs font-normal text-pro-muted">
                ({selected.length} item{selected.length !== 1 ? "s" : ""})
              </span>
            )}
          </p>

          {selected.length === 0 ? (
            <p className="rounded-field border border-dashed border-pro-border px-3 py-4 text-sm text-pro-muted text-center">
              Select symbols above to build your message
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-field border border-pro-border bg-pro-surface px-3 py-2 min-h-16">
              {selected.map((phrase, i) => (
                <span
                  key={`${phrase.id}-${i}`}
                  className="inline-flex items-center gap-1 rounded-pill border border-pro-control-border bg-pro-elevated px-2 py-1 text-sm"
                >
                  <span aria-hidden="true">{phrase.emoji}</span>
                  <span lang="bn">{phrase.labelBn}</span>
                  <button
                    type="button"
                    onClick={() => removePhrase(i)}
                    aria-label={`Remove ${phrase.labelEn}`}
                    className="ml-1 rounded-full p-0.5 hover:bg-pro-surface focus-visible:outline-2 focus-visible:outline-pro-focus"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Composed text preview (read-only; user can copy) */}
          {selected.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-pro-muted">Message text preview:</p>
              <p
                className="rounded-field border border-pro-border bg-pro-bg px-3 py-2 text-sm text-pro-text"
                lang="bn"
                aria-label="Composed message text"
              >
                {composedText}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <AppButton
            variant="primary"
            size="sm"
            onClick={handleInsert}
            disabled={selected.length === 0}
            aria-disabled={selected.length === 0}
          >
            <Check size={15} aria-hidden="true" />
            Insert into message
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={selected.length === 0}
          >
            <Trash2 size={15} aria-hidden="true" />
            Clear all
          </AppButton>
        </div>

        <p className="text-xs text-pro-muted">
          After inserting, review the full message before sending. AAC selection does not send anything automatically.
        </p>

        <InlineLiveRegion message={announcement} />
      </div>
    </div>
  );
}
