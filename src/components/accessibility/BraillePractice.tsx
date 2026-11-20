"use client";

import { useState } from "react";
import { brailleCell, decodeBrailleLetters, encodeBrailleLetters } from "./braille-demo";

type Language = "bn" | "en";

const home = ["welcome to prohor", "choose how to communicate", "ask for support"];
const adapt = ["change text size", "choose a language", "set up your access card"];
const barta = ["ask a question", "read the sources", "prepare for your visit"];
const poth = ["find care", "browse facilities", "check access information"];
const wellbeing = ["check in today", "record how you feel", "review your wellbeing notes"];
const bondhon = ["request written communication", "choose what to share", "ask for an interpreter"];

const samples: Readonly<Record<string, readonly string[]>> = {
  "/": home, "/app": home, "/adapt": adapt, "/accessibility": adapt,
  "/ask": barta, "/barta-demo": barta, "/poth": poth, "/find-care": poth,
  "/safety": ["find urgent help", "open safety information", "find a care facility"],
  "/jibonrekha": ["review health records", "check the recorded date", "open the health summary"],
  "/bujhi": ["review a report", "check the extracted text", "review before saving"],
  "/shusthota": wellbeing, "/wellbeing": wellbeing,
  "/bondhon": bondhon, "/care": bondhon, "/provider": bondhon, "/supporter": bondhon,
};

const copy = {
  en: {
    legend: "English Braille practice", dots: "Build a six-dot cell", dot: "Dot", selectedCell: "Selected cell",
    scope: "Enter English letters, numbers, spaces, and common punctuation. Bangla Braille and contractions are outside this practice tool.",
    add: "Add cell", space: "Add space", back: "Delete last cell", clear: "Clear cells", choose: "Choose a phrase", practice: "Load phrase into input",
    cells: "Braille cells to edit or paste", decoded: "Plain English preview",
    unsupported: "This sequence has an unsupported cell. Edit it before adding the text to your draft.",
    insert: "Add English text to communication draft",
    sample: "Read a module phrase", phrase: "English phrase", pattern: "Braille cells",
    display: "For tactile reading, use your device’s screen reader with a paired Braille display. Select the English Braille table on that device.",
    keys: "Press Tab to reach a dot and Space to toggle it. Choose Add cell to enter the selected dots.",
    custom: "Your own English text", readingError: "Use English letters, numbers, spaces, or these punctuation marks: , ; : . ! ? ' -",
    visualDisplay: "On-screen Braille cells",
  },
  bn: {
    legend: "ইংরেজি ব্রেইল অনুশীলন", dots: "ছয় বিন্দুর ঘর তৈরি করুন", dot: "বিন্দু", selectedCell: "বাছাই করা ঘর",
    scope: "ইংরেজি অক্ষর, সংখ্যা, ফাঁকা স্থান ও সাধারণ যতিচিহ্ন দিয়ে অনুশীলন করুন। এখানে বাংলা ব্রেইল ও সংক্ষিপ্ত রূপ নেই।",
    add: "ঘর যোগ করুন", space: "ফাঁকা স্থান যোগ করুন", back: "শেষ ঘর মুছুন", clear: "সব ঘর মুছুন", choose: "একটি বাক্য বাছাই করুন", practice: "বাক্যটি ইনপুটে আনুন",
    cells: "সম্পাদনা বা পেস্ট করার ব্রেইল ঘর", decoded: "ইংরেজি লেখার প্রিভিউ",
    unsupported: "এই লেখায় অসমর্থিত ব্রেইল ঘর আছে। খসড়ায় যোগ করার আগে তা ঠিক করুন।",
    insert: "যোগাযোগের খসড়ায় ইংরেজি লেখা যোগ করুন",
    sample: "এই বিভাগের একটি বাক্য পড়ুন", phrase: "ইংরেজি বাক্য", pattern: "ব্রেইল ঘর",
    display: "স্পর্শে পড়তে ডিভাইসের স্ক্রিন রিডার ও সংযুক্ত ব্রেইল ডিসপ্লে ব্যবহার করুন। ডিভাইসে ইংরেজি ব্রেইল টেবিল বাছাই করুন।",
    keys: "Tab চেপে বিন্দুতে যান এবং Space চেপে সেটি চালু বা বন্ধ করুন। এরপর ঘর যোগ করুন।",
    custom: "আপনার নিজের ইংরেজি লেখা", readingError: "ইংরেজি অক্ষর, সংখ্যা, ফাঁকা স্থান বা এই যতিচিহ্নগুলো ব্যবহার করুন: , ; : . ! ? ' -",
    visualDisplay: "পর্দায় ব্রেইল ঘর",
  },
} as const;

const maxCells = 120;

export function BraillePractice({ language, modulePath, buttonClass, onInsert, disabled }: {
  language: Language;
  modulePath: string;
  buttonClass: string;
  onInsert: (text: string) => void;
  disabled: boolean;
}) {
  const [mask, setMask] = useState(0);
  const [cells, setCells] = useState("");
  const labels = copy[language];
  const text = decodeBrailleLetters(cells);
  const phrases = samples[modulePath] ?? home;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const sample = phrases[phraseIndex] ?? home[0] ?? "";
  const [readingText, setReadingText] = useState("");
  const reading = readingText || sample;
  const sampleCells = encodeBrailleLetters(reading);

  function appendCell(nextMask: number) {
    setCells(current => (current + brailleCell(nextMask)).slice(0, maxCells));
    setMask(0);
  }

  return (
    <section className="mb-4 grid min-w-0 gap-4" aria-label={labels.legend}>
      <p className="max-w-prose text-pro-muted">{labels.scope}</p>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-3 rounded-xl border border-pro-control-border bg-pro-elevated p-3 sm:p-4">
          <fieldset className="grid min-w-0 gap-2">
            <legend>{labels.dots}</legend>
            <p className="text-pro-muted">{labels.keys}</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid w-fit grid-cols-2 gap-2 rounded-xl border border-pro-control-border bg-pro-surface p-2">
              {[1, 4, 2, 5, 3, 6].map(dot => {
                const bit = 1 << (dot - 1);
                const pressed = (mask & bit) !== 0;
                return (
                  <button type="button" key={dot} aria-pressed={pressed}
                    className={buttonClass + " min-w-16 justify-center tabular-nums " + (pressed ? "bg-pro-primary! text-pro-on-primary!" : "bg-pro-elevated")}
                    onClick={() => setMask(current => current ^ bit)}>
                    {labels.dot} {dot}
                  </button>
                );
              })}
              </div>
              <div className="grid gap-1 text-pro-muted">
              <span>{labels.selectedCell}</span>
              <span aria-hidden="true" className="text-4xl leading-none text-pro-primary">{mask ? brailleCell(mask) : "—"}</span>
              </div>
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} disabled={!mask || cells.length >= maxCells} onClick={() => appendCell(mask)}>{labels.add}</button>
            <button type="button" className={buttonClass} disabled={cells.length >= maxCells} onClick={() => appendCell(0)}>{labels.space}</button>
            <button type="button" className={buttonClass} disabled={!cells} onClick={() => setCells(current => Array.from(current).slice(0, -1).join(""))}>{labels.back}</button>
            <button type="button" className={buttonClass} disabled={!cells && !mask} onClick={() => { setCells(""); setMask(0); }}>{labels.clear}</button>
          </div>
          <label className="grid min-w-0 gap-1">
            {labels.cells}
            <textarea lang="en" rows={2} maxLength={maxCells} value={cells} aria-invalid={text === null}
              className="w-full min-w-0 rounded-lg border border-pro-control-border bg-pro-bg p-2 text-xl"
              onChange={event => setCells(event.currentTarget.value)} />
          </label>
          <div role="status" aria-atomic="true" className="min-w-0 rounded-lg bg-pro-surface p-3 [white-space:pre-wrap]">
            {text === null ? labels.unsupported : <>{labels.decoded} <span lang="en">{text || "—"}</span></>}
          </div>
          <button type="button" className="pro-btn pro-btn-primary min-h-11 text-start disabled:opacity-60" disabled={disabled || !text?.trim()}
            onClick={() => { if (text?.trim()) onInsert(text.trim()); }}>
            {labels.insert}
          </button>
        </div>
        <section className="grid min-w-0 content-start gap-3 rounded-xl border border-pro-control-border bg-pro-elevated p-3 sm:p-4" aria-label={labels.sample}>
        <h3 className="font-semibold">{labels.sample}</h3>
        <label className="grid min-w-0 gap-1">
          {labels.choose}
          <select className="min-h-11 w-full min-w-0 rounded-lg border border-pro-control-border bg-pro-bg p-2" lang="en"
            value={phraseIndex} onChange={event => {
              setPhraseIndex(Number(event.currentTarget.value));
              setReadingText("");
            }}>
            {phrases.map((phrase, index) => <option key={phrase} value={index}>{phrase}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 gap-1">
          {labels.custom}
          <textarea lang="en" rows={2} maxLength={120} value={readingText}
            aria-invalid={sampleCells === null}
            className="w-full min-w-0 rounded-lg border border-pro-control-border bg-pro-bg p-2"
            onChange={event => setReadingText(event.currentTarget.value)} />
        </label>
        {sampleCells === null ? (
          <p role="status">{labels.readingError}</p>
        ) : (
          <div className="grid gap-2 rounded-xl bg-pro-primary p-4 text-pro-on-primary">
            <p className="font-semibold">{labels.visualDisplay}</p>
            <p aria-hidden="true" className="text-3xl tracking-widest [overflow-wrap:anywhere] [white-space:pre-wrap]">{sampleCells}</p>
            <p>{labels.phrase} <span lang="en">{reading}</span></p>
          </div>
        )}
        <button type="button" className={buttonClass} disabled={!!cells || !!mask || !sampleCells || sampleCells.length > maxCells}
          onClick={() => setCells(sampleCells ?? "")}>{labels.practice}</button>
        <p className="text-pro-muted">{labels.display}</p>
        </section>
      </div>
    </section>
  );
}
