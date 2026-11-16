"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, FileText, Heart, LockKeyhole, MessageCircle, Plus, SlidersHorizontal } from "lucide-react";
import { useHome } from "../HomeContext";
import { copy } from "../home-content";
import { sampleQuestion } from "./content";
import { PhoneFrame, ScreenTitle } from "./ScreenFrame";

export function SharedVisitPhones() {
  const { t, locale, openPreferences } = useHome();
  const [inputsReady, setInputsReady] = useState(false);
  const [question, setQuestion] = useState(sampleQuestion);
  const [gloss, setGloss] = useState("How can I prepare for my next visit?");
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setInputsReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const modes = [
    { id: "touch", label: copy("Touch & text", "স্পর্শ ও লেখা"), icon: MessageCircle },
    { id: "larger", label: copy("Large text + high contrast", "বড় লেখা ও বেশি কনট্রাস্ট"), icon: SlidersHorizontal },
    { id: "picture", label: copy("Picture-and-text", "ছবি ও লেখা"), icon: Heart },
  ];
  function change(value: string, english = "") { setQuestion(value); setGloss(english); setReviewed(false); }
  return <><div className="story-visit-phones" role="region" aria-label={t(copy("Visit question presentations", "সাক্ষাতের প্রশ্নের উপস্থাপনা"))} tabIndex={0}>{modes.map(({ id, label, icon: Icon }) => <PhoneFrame key={id} title={t(label)} className={`story-visit-${id}`}>
    <ScreenTitle icon={<Icon size={24} />} small={t(copy("Your next visit", "আপনার পরের সাক্ষাৎ"))} title={t(copy("A question, in your words.", "আপনার ভাষায় একটি প্রশ্ন।"))} />
    <label className="story-question-label" htmlFor={`visit-question-${id}`}>{t(copy("What would you like to ask?", "আপনি কী জানতে চান?"))}</label>
    {id === "picture" && <div className="story-phrase-picker" role="group" aria-label={t(copy("Picture-and-text sample phrases", "ছবি ও লেখার নমুনা বাক্যাংশ"))}>{[
      { icon: CalendarDays, text: copy("About my visit", "আমার সাক্ষাৎ নিয়ে"), question: sampleQuestion, gloss: "How can I prepare for my next visit?" },
      { icon: FileText, text: copy("About my records", "আমার রেকর্ড নিয়ে"), question: "আমার রিপোর্টগুলো কীভাবে গুছিয়ে রাখব?", gloss: "How can I keep my reports together?" },
    ].map(({ icon: PhraseIcon, text, question: phraseQuestion, gloss: phraseGloss }) => <button key={text.en} onClick={() => change(phraseQuestion, phraseGloss)}><PhraseIcon size={23} aria-hidden="true" /><span>{t(text)}</span><Plus size={17} aria-hidden="true" /></button>)}</div>}
    <textarea id={`visit-question-${id}`} lang={/[\u0980-\u09ff]/.test(question) ? "bn" : locale} value={question} rows={3} readOnly={!inputsReady} aria-busy={!inputsReady} onChange={event => change(event.target.value)} />
    {gloss && <p className="story-question-gloss" lang="en">{gloss}</p>}
    <button className="home-button story-screen-action" onClick={() => setReviewed(true)}>{t(copy("Review my question", "আমার প্রশ্ন দেখুন"))}<ArrowRight size={19} aria-hidden="true" /></button>
    <p className="story-screen-lock"><LockKeyhole size={17} aria-hidden="true" />{t(copy("Your words. Your choice.", "আপনার কথা। আপনার পছন্দ।"))}</p>
    {reviewed && <div className="story-question-review"><Check size={19} aria-hidden="true" /><p lang={/[\u0980-\u09ff]/.test(question) ? "bn" : locale}>{question.trim() || t(copy("Write a question to review it here.", "এখানে দেখতে একটি প্রশ্ন লিখুন।"))}</p></div>}
  </PhoneFrame>)}</div>
  <div className="story-adapt-bottom"><p>{t(copy("Change the presentation. Keep your words, your choices and your place.", "উপস্থাপনা বদলান। আপনার কথা, পছন্দ ও অবস্থান থাকুক একই।"))}</p><button onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={20} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}<ArrowUpRight size={20} aria-hidden="true" /></button></div>
  <p className="home-sr-only" role="status">{reviewed ? t(copy(question.trim() ? "Your question is shown in all three samples. Nothing was sent." : "Write a question to review it here.", question.trim() ? "আপনার প্রশ্ন তিনটি নমুনাতেই দেখা যাচ্ছে। কিছু পাঠানো হয়নি।" : "এখানে দেখতে একটি প্রশ্ন লিখুন।")) : ""}</p></>;
}
