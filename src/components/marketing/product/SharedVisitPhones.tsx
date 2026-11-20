"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight, CalendarDays, Check, Contrast, FileText, Hand, LockKeyhole, MessageCircle, Plus, SlidersHorizontal } from "lucide-react";
import { useHome } from "../HomeContext";
import { copy } from "../home-content";
import { sampleQuestion } from "./content";
import { PhoneFrame, ScreenTitle } from "./ScreenFrame";

const subscribeToClient = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

const modes = [
  { id: "touch", icon: MessageCircle, label: copy("Touch & text", "স্পর্শ ও লেখা"), who: copy("The default. Any mother, any phone.", "মূল ধরন। যেকোনো মা, যেকোনো ফোন।") },
  { id: "larger", icon: Contrast, label: copy("Large text + high contrast", "বড় লেখা ও বেশি কনট্রাস্ট"), who: copy("For low vision, tired eyes or bright sunlight.", "চোখে কম দেখা, ক্লান্ত চোখ বা কড়া রোদের জন্য।") },
  { id: "picture", icon: Hand, label: copy("Picture cards (AAC)", "ছবির কার্ড (এএসি)"), who: copy("For Deaf mothers, speech differences or less reading.", "শ্রবণপ্রতিবন্ধী মা, কথা বলায় ভিন্নতা বা কম পড়ার জন্য।") },
] as const;
type Mode = (typeof modes)[number]["id"];

const phrases = [
  { icon: CalendarDays, text: copy("About my visit", "আমার সাক্ষাৎ নিয়ে"), question: sampleQuestion, gloss: "How can I prepare for my next visit?" },
  { icon: FileText, text: copy("About my records", "আমার রেকর্ড নিয়ে"), question: "আমার রিপোর্টগুলো কীভাবে গুছিয়ে রাখব?", gloss: "How can I keep my reports together?" },
];

const isBangla = (value: string) => /[ঀ-৿]/.test(value);

/** One live phone; the presentation changes, the mother's words do not. */
export function SharedVisitPhones({ intro }: { intro: ReactNode }) {
  const { t, locale, openPreferences } = useHome();
  // Preserve the initial value until React has attached input handlers.
  const inputsReady = useSyncExternalStore(subscribeToClient, clientReady, serverReady);
  const [mode, setMode] = useState<Mode>("touch");
  const [question, setQuestion] = useState(sampleQuestion);
  const [gloss, setGloss] = useState("How can I prepare for my next visit?");
  const [reviewed, setReviewed] = useState(false);
  const active = modes.find(item => item.id === mode) ?? modes[0];
  function change(value: string, english = "") { setQuestion(value); setGloss(english); setReviewed(false); }

  return <div className="adapt-layout">
    <div className="adapt-copy">
      {intro}
      <fieldset className="adapt-modes">
        <legend>{t(copy("Choose a presentation", "উপস্থাপনা বেছে নিন"))}</legend>
        {modes.map(({ id, icon: Icon, label, who }) => <label key={id} className="adapt-mode">
          <input type="radio" name="visit-presentation" value={id} checked={mode === id} onChange={() => setMode(id)} />
          <span className="adapt-mode-icon" aria-hidden="true"><Icon size={20} /></span>
          <span><strong>{t(label)}</strong><span>{t(who)}</span></span>
          <Check className="adapt-mode-check" size={20} aria-hidden="true" />
        </label>)}
      </fieldset>
      <button className="home-button adapt-adjust" onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={20} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}</button>
      <p className="adapt-note">{t(copy("Change the presentation. Your words, choices and place stay the same.", "উপস্থাপনা বদলান। আপনার কথা, পছন্দ ও অবস্থান একই থাকবে।"))}</p>
    </div>
    <PhoneFrame title={t(active.label)} className={`adapt-phone story-visit-${mode}`}>
      <ScreenTitle icon={<active.icon size={24} />} small={t(copy("Your next visit", "আপনার পরের সাক্ষাৎ"))} title={t(copy("A question, in your words.", "আপনার ভাষায় একটি প্রশ্ন।"))} />
      {mode === "picture" && <div className="story-phrase-picker" role="group" aria-label={t(copy("Picture-and-text sample phrases", "ছবি ও লেখার নমুনা বাক্যাংশ"))}>{phrases.map(({ icon: PhraseIcon, text, question: phraseQuestion, gloss: phraseGloss }) => <button key={text.en} onClick={() => change(phraseQuestion, phraseGloss)}><PhraseIcon size={23} aria-hidden="true" /><span>{t(text)}</span><Plus size={17} aria-hidden="true" /></button>)}</div>}
      <label className="story-question-label" htmlFor="visit-question">{t(copy("What would you like to ask?", "আপনি কী জানতে চান?"))}</label>
      <textarea id="visit-question" lang={isBangla(question) ? "bn" : locale} value={question} rows={3} readOnly={!inputsReady} aria-busy={!inputsReady} onChange={event => change(event.target.value)} />
      {gloss && <p className="story-question-gloss" lang="en">{gloss}</p>}
      <button className="home-button story-screen-action" onClick={() => setReviewed(true)}>{t(copy("Review my question", "আমার প্রশ্ন দেখুন"))}<ArrowRight size={19} aria-hidden="true" /></button>
      <p className="story-screen-lock"><LockKeyhole size={17} aria-hidden="true" />{t(copy("Your words. Your choice.", "আপনার কথা। আপনার পছন্দ।"))}</p>
      {reviewed && <div className="story-question-review"><Check size={19} aria-hidden="true" /><p lang={isBangla(question) ? "bn" : locale}>{question.trim() || t(copy("Write a question to review it here.", "এখানে দেখতে একটি প্রশ্ন লিখুন।"))}</p></div>}
    </PhoneFrame>
    <p className="home-sr-only" role="status">{reviewed ? t(copy(question.trim() ? "Your question is shown for review. Nothing was sent." : "Write a question to review it here.", question.trim() ? "আপনার প্রশ্ন দেখানো হচ্ছে। কিছু পাঠানো হয়নি।" : "এখানে দেখতে একটি প্রশ্ন লিখুন।")) : ""}</p>
  </div>;
}
