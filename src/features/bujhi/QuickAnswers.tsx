"use client";

import { useEffect, useState } from "react";
import { BookOpen, Volume2, VolumeX } from "lucide-react";
import { abbreviationHelp } from "./ultrasound";
import type { ExtractedReportField } from "./types";
import { isHemoglobinLabel, parseNumeric } from "./validation";

export type AnswerLanguage = "auto" | "bn" | "en";
type Language = Exclude<AnswerLanguage, "auto">;
export const words = (language: Language, bangla: string, english: string) => language === "bn" ? bangla : english;

export function autoAnswerLanguage(locale: string): Language {
  return /^en(?:-|$)/i.test(locale) ? "en" : "bn";
}

function printedComparison(field: ExtractedReportField) {
  if (field.reviewStatus !== "verified" || !isHemoglobinLabel(field.label) ||
      field.unit.replace(/\s/g, "").toLowerCase() !== "g/dl") return null;
  const range = field.referenceRange?.trim().match(/^(?:(?:ref(?:erence)?(?: range)?|range)\s*[:=]?\s*)?([0-9০-৯]+(?:\.[0-9০-৯]+)?)\s*(?:[-–—]|to)\s*([0-9০-৯]+(?:\.[0-9০-৯]+)?)\s*(g\s*\/\s*dL)?$/i);
  const unit = range?.[3] ?? field.laboratory?.referenceIntervalUnit ?? "";
  if (!range || unit.replace(/\s/g, "").toLowerCase() !== "g/dl") return null;
  const parsed = [field.value, range[1], range[2]].map((value) => parseNumeric(value).normalized);
  if (parsed.some((value) => !value || !/^\d{1,3}(?:\.\d{1,6})?$/.test(value))) return null;
  const [value, lower, upper] = parsed.map(Number);
  if (lower >= upper) return null;
  const span = Math.max(value, upper) - Math.min(value, lower);
  const scale = (point: number) => 8 + (point - Math.min(value, lower)) / span * 84;
  return { start: scale(lower), end: scale(upper), marker: scale(value), range: range[1] + " – " + range[2] + " g/dL", position: value < lower ? "below" : value > upper ? "above" : "inside" };
}

export function QuickAnswers({ fields, language }: { fields: ExtractedReportField[]; language: Language }) {
  const [fieldId, setFieldId] = useState("");
  const [question, setQuestion] = useState<"what" | "meaning" | "next">("meaning");
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const w = (bn: string, en: string) => words(language, bn, en);
  const field = fields.find((item) => item.id === fieldId) ?? fields[0];
  const comparison = field && printedComparison(field);
  const isHb = isHemoglobinLabel(field?.label ?? "");
  const verdict = comparison?.position === "below" ? w("মুদ্রিত সীমার নিচে", "Below the printed range")
    : comparison?.position === "above" ? w("মুদ্রিত সীমার ওপরে", "Above the printed range")
    : comparison ? w("মুদ্রিত সীমার মধ্যে", "Within the printed range") : w("রিপোর্টে যাচাই করা ফল", "Your checked result");
  const abbreviation = field?.ultrasound && abbreviationHelp.find(([code]) => (field.ultrasound?.metric ?? field.label).trim().toUpperCase().startsWith(code + " ") || (field.ultrasound?.metric ?? field.label).trim().toUpperCase() === code);
  const answers = {
    what: abbreviation ? w(abbreviation[2], abbreviation[1]) : isHb ? w("হিমোগ্লোবিন লোহিত রক্তকণিকার একটি প্রোটিন। এটি শরীরে অক্সিজেন বহন করে।", "Hemoglobin is a protein in red blood cells that carries oxygen.")
      : w("এটি আপনার যাচাই করা রিপোর্টের তথ্য। পরীক্ষার নাম, ফল ও একক মূল রিপোর্টের সঙ্গে মিলিয়ে দেখুন।", "This is the information you checked. Compare the test name, result and unit with your original report."),
    meaning: comparison
      ? w("এই তুলনাটি শুধু আপনার রিপোর্টে মুদ্রিত সীমার সঙ্গে। ফলটি আপনার জন্য কী বোঝায়, তা চিকিৎসকের সঙ্গে আলোচনা করুন।", "This comparison uses the range printed on your report. Ask your clinician what this result means for you.")
      : field?.ultrasound ? w("এটি স্ক্যান রিপোর্টে লেখা তথ্য। এই একটি ফল থেকে শিশুর অবস্থা নির্ধারণ করা যায় না। পুরো রিপোর্টটি চিকিৎসকের সঙ্গে আলোচনা করুন।", "This is a finding or measurement from the scan report. A clinician can interpret it together with the rest of the report.")
      : w("এই ফলের জন্য একই এককে যাচাই করা সীমা পাওয়া যায়নি। মূল রিপোর্টটি চিকিৎসককে দেখান।", "A comparable printed range could not be confirmed. Bring the original report to your clinician."),
    next: w("পরের সাক্ষাতে মূল রিপোর্টটি নিয়ে যান। যে ফলটি বুঝতে চান, সেটি চিহ্নিত করে রাখুন।", "Bring the original report to your next visit and point out the result you would like explained."),
  };
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const speech = window.speechSynthesis;
    const match = () => setVoice(speech.getVoices().find((item) => item.localService && item.lang.toLowerCase().split(/[-_]/)[0] === language) ?? null);
    match();
    void Promise.resolve().then(() => { setSpeaking(false); setAudioError(false); });
    speech.addEventListener("voiceschanged", match);
    return () => { speech.removeEventListener("voiceschanged", match); speech.cancel(); };
  }, [language]);
  function stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setAudioError(false);
  }
  function listen() {
    if (speaking) { stop(); return; }
    if (!voice || !field) return;
    const utterance = new SpeechSynthesisUtterance([field.label, field.value, field.unit, verdict, answers[question]].filter(Boolean).join(". "));
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => { setSpeaking(false); if (event.error !== "canceled" && event.error !== "interrupted") setAudioError(true); };
    setAudioError(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  if (!field) return null;
  return <section className="min-w-0 overflow-hidden rounded-card border border-pro-border bg-pro-elevated" aria-label={w("দ্রুত উত্তর", "Quick Answers")}>
    <div className="grid gap-2 bg-pro-surface p-5 sm:p-7">
      <h2 className="flex items-center gap-2 text-2xl font-semibold"><BookOpen className="size-5 shrink-0 text-pro-primary" aria-hidden="true" />{w("দ্রুত উত্তর", "Quick Answers")}</h2>
      {fields.length > 1 && <label className="grid gap-2 font-semibold">{w("যে ফলটি বুঝতে চান", "Choose a checked result")}<select value={field.id} onChange={(event) => { stop(); setFieldId(event.target.value); }} className="min-h-12 min-w-0 rounded-control border border-pro-control-border bg-pro-bg p-2">{fields.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.value} {item.unit}</option>)}</select></label>}
      <p className="!m-0 text-pro-muted">{field.ultrasound?.fetus ? field.ultrasound.fetus + " · " : ""}{field.label}</p>
      <p className="!m-0 whitespace-pre-wrap text-3xl font-semibold tabular-nums">{field.value} <span className="text-xl">{field.unit}</span></p>
      <p className="!m-0 font-semibold">{field.ultrasound ? w("স্ক্যান রিপোর্টে লেখা", "As stated in the scan report") : verdict}</p>
      {comparison && <p className="!m-0 text-pro-muted">{w("রিপোর্টে মুদ্রিত সীমা", "Range printed on the report")} · {comparison.range}</p>}
      {comparison && <div className="mt-1 flex min-h-8 items-center" aria-hidden="true">
        <div className="relative h-2 w-full rounded-control bg-pro-bg outline-1 outline-pro-border">
          <span className="absolute top-0 h-full rounded-control bg-pro-primary" style={{ left: comparison.start + "%", width: comparison.end - comparison.start + "%" }} />
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-pro-primary bg-pro-elevated" style={{ left: comparison.marker + "%" }} />
        </div>
      </div>}
    </div>
    <div className="grid gap-4 p-5 sm:p-7">
      <div className="flex flex-wrap gap-2" role="group" aria-label={w("প্রশ্ন বেছে নিন", "Choose a question")}>
        {([["what", w("এটি কী?", "What is it?")], ["meaning", w("ফলটি কী বোঝায়?", "What does it mean?")], ["next", w("এরপর কী করব?", "What should I do next?")]] as const).map(([key, label]) =>
          <button key={key} type="button" aria-pressed={question === key} onClick={() => { stop(); setQuestion(key); }} className={question === key ? "min-h-12 rounded-control bg-pro-primary px-3 font-semibold text-pro-on-primary" : "min-h-12 rounded-control border border-pro-control-border px-3 font-semibold text-pro-primary"}>{label}</button>)}
      </div>
      <p className="!m-0 max-w-[65ch]" aria-live="polite">{answers[question]}</p>
      {isHb && question === "what" && <a className="w-fit text-pro-primary underline" href="https://medlineplus.gov/lab-tests/hemoglobin-test/">{w("তথ্যের উৎস", "Source")} · MedlinePlus</a>}
      <div className="flex flex-wrap items-center gap-2">
        {voice ? <button type="button" onClick={listen} className="inline-flex min-h-12 items-center gap-2 rounded-control border border-pro-control-border px-3 text-pro-primary">
          {speaking ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
          {speaking ? w("বন্ধ করুন", "Stop listening") : w("শুনুন", "Listen")}
        </button> : <p className="!m-0 text-pro-muted">{w("এই ভাষায় ডিভাইসে পড়ে শোনানোর সুবিধা নেই।", "This device has no local voice for this language.")}</p>}
        {audioError && <p role="status">{w("শোনানো যায়নি। উত্তরটি উপরে পড়তে পারেন।", "Audio could not play. The answer is available above.")}</p>}
      </div>
    </div>
  </section>;
}
