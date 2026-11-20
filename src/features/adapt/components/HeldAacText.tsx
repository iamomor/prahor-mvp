"use client";

import { AppButton } from "@/components/ui/AppButton";
import { mergeAacText } from "../lib/aac-events";

type Props = {
  /** The picture sentence that did not fit. It is kept exactly as composed, never cut. */
  text: string;
  value: string;
  maxLength: number;
  onAdd: (next: string) => void;
  onDismiss: () => void;
  lang: "bn" | "en";
};

/** Shown when an AAC sentence would pass a field limit. Nothing is dropped; she can shorten the field and add it, or discard it. */
export function HeldAacText({ text, value, maxLength, onAdd, onDismiss, lang }: Props) {
  const merged = mergeAacText(value, text);
  const fits = merged.length <= maxLength;
  const need = Math.max(0, merged.length - maxLength);
  const bn = lang === "bn";
  return (
    <div role="alert" lang={lang} className="grid gap-2 rounded-field border border-pro-warning bg-pro-warning-soft p-3">
      <p className="font-semibold">{bn
        ? `এই ছবির বাক্যটি ঘরে ধরছে না (সর্বোচ্চ ${maxLength} অক্ষর)। আপনার লেখা বদলায়নি এবং বাক্যটি নিচে রাখা আছে।`
        : `This picture sentence does not fit (limit ${maxLength} characters). Your text is unchanged and the sentence is kept below.`}</p>
      <p className="whitespace-pre-wrap">{text}</p>
      <p>{fits
        ? (bn ? "এখন জায়গা আছে। যোগ করতে পারেন।" : "There is room now. You can add it.")
        : (bn ? `${need} অক্ষর বেশি। ঘরের লেখা ছোট করলে যোগ করা যাবে।` : `${need} characters too many. Shorten the text in the box, then add it.`)}</p>
      <div className="flex flex-wrap gap-2">
        <AppButton size="sm" variant="secondary" disabled={!fits} onClick={() => onAdd(merged)}>{bn ? "এখন যোগ করুন" : "Add it now"}</AppButton>
        <AppButton size="sm" variant="ghost" onClick={onDismiss}>{bn ? "বাক্যটি বাদ দিন" : "Discard this sentence"}</AppButton>
      </div>
    </div>
  );
}
