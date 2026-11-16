"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Baby, BookOpen, CalendarDays, Check, Heart, ImageIcon, LockKeyhole, MessageCircle, Plus, SlidersHorizontal, Sparkles, Type } from "lucide-react";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";
import { ProhorSymbol } from "./HomeBrand";

export type HomepageImages = { hero: boolean; problem: boolean };

function MissingImage({ kind }: { kind: "hero" | "problem" }) {
  const { t } = useHome();
  return <div className={`pass-image-placeholder pass-image-placeholder-${kind}`} role="img"
    aria-label={t(copy("Image placeholder. The supplied photograph is missing.", "ছবির স্থানধারক। নির্ধারিত ছবিটি পাওয়া যায়নি।"))}>
    {kind === "problem" && <><ImageIcon size={32} strokeWidth={1.25} aria-hidden="true" />
      <span>{t(copy("A little space for a human moment.", "মানুষের গল্পের জন্য একটু জায়গা।"))}</span>
      <span className="home-small">{t(copy("Image placeholder", "ছবির স্থানধারক"))}</span></>}
  </div>;
}

function AnswerPreview() {
  const { t } = useHome();
  return <article className="pass-answer-card" id="responsible-ai" tabIndex={-1} aria-labelledby="answer-preview-title">
    <div className="pass-card-top"><span className="pass-product-name"><BookOpen size={19} aria-hidden="true" />Barta <span lang="bn">বার্তা</span></span><span className="pass-preview" lang="en">Preview</span></div>
    <h2 id="answer-preview-title" lang="bn">আমার যত্নে আমার পছন্দ?</h2>
    <p lang="bn">গর্ভকালীন যত্নে আপনার শারীরিক ও মানসিক সুস্থতা এবং আপনার অভিজ্ঞতাও গুরুত্বপূর্ণ।</p>
    <a className="pass-source" href="https://www.who.int/publications/i/item/9789241549912" target="_blank" rel="noreferrer">
      <BookOpen size={17} aria-hidden="true" /><span lang="en">WHO · Antenatal care, 2016<span className="home-sr-only"> (opens in a new tab)</span></span><ArrowUpRight size={16} aria-hidden="true" />
    </a>
    <p className="home-small pass-sample-note">{t(copy("Sample translation · no AI answer generated", "নমুনা অনুবাদ · এআই উত্তর তৈরি করা হয়নি"))}</p>
  </article>;
}

function JourneyPreview() {
  const { t } = useHome();
  return <article className="pass-week-card" aria-labelledby="week-preview-title">
    <div className="pass-card-top"><CalendarDays size={21} aria-hidden="true" /><span className="pass-preview" lang="en">Preview</span></div>
    <p className="home-small">{t(copy("Fictional journey", "কাল্পনিক যাত্রা"))}</p>
    <h2 id="week-preview-title">{t(copy("Week 24", "২৪তম সপ্তাহ"))}<Heart size={22} aria-hidden="true" /></h2>
    <div className="pass-timeline" aria-hidden="true"><span /><span /><span /><span /><span /></div>
    <p className="home-small">{t(copy("One chapter at a time.", "একবারে একটি অধ্যায়।"))}</p>
  </article>;
}

export function HeroSection({ imageAvailable }: { imageAvailable: boolean }) {
  const { t } = useHome();
  return <section className="pass-hero home-section" aria-labelledby="hero-title">
    <div className="home-container pass-hero-grid">
      <div className="pass-hero-copy">
        <p className="pass-kicker"><span aria-hidden="true" />{t(copy("A little more connected. A little more you.", "আরও সংযোগ। আরও আপনার মতো।"))}</p>
        <h1 id="hero-title">{t(copy("Maternal care, designed around ", "মাতৃত্বের যত্ন, "))}<span>{t(copy("every mother.", "প্রতিটি মায়ের মতো করে।"))}</span></h1>
        <p className="pass-bangla" lang="bn">আপনার যত্ন, আপনার মতো।</p>
        <p className="pass-hero-description">{t(copy("Understand your health, keep your story together, and find your next step—with care that makes room for you.", "স্বাস্থ্য সম্পর্কে জানুন, যত্নের গল্প একসঙ্গে রাখুন, পরের ধাপের প্রস্তুতি নিন—আপনার উপযোগী যত্নে।"))}</p>
        <div className="pass-hero-actions">
          <a className="home-button" href="#features">{t(copy("Explore PROHOR", "প্রহর ঘুরে দেখুন"))}<ArrowUpRight size={20} aria-hidden="true" /></a>
          <a className="home-button home-button-secondary" href="#how-it-works">{t(copy("See how it works", "কীভাবে কাজ করে দেখুন"))}<ArrowDown size={19} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="pass-hero-visual">
        <div className="pass-hero-image-panel">
          {imageAvailable ? <Image src="/images/hero-mother.webp" alt={t(copy("A mother in a quiet moment.", "শান্ত মুহূর্তে একজন মা।"))} fill sizes="(min-width: 1024px) 480px, 100vw" priority /> : <MissingImage kind="hero" />}
        </div>
        <JourneyPreview />
        <div className="pass-hero-photo-gap">{!imageAvailable && <><ImageIcon size={24} aria-hidden="true" /><span>{t(copy("Image placeholder", "ছবির স্থানধারক"))}</span></>}</div>
        <AnswerPreview />
      </div>
    </div>
  </section>;
}

export function TrustStrip() {
  const { t } = useHome();
  const items = [
    { icon: BookOpen, text: copy("One connected record", "যত্নের তথ্য একসঙ্গে") },
    { icon: LockKeyhole, text: copy("You control sharing", "তথ্য ভাগ করার সিদ্ধান্ত আপনার") },
    { icon: SlidersHorizontal, text: copy("Your way of using it", "ব্যবহার করুন আপনার মতো") },
  ];
  return <section className="pass-trust home-section" aria-label={t(copy("The PROHOR promise", "প্রহরের প্রতিশ্রুতি"))}>
    <ul className="home-container pass-trust-grid">{items.map(({ icon: Icon, text }) => <li key={text.en}><Icon size={24} strokeWidth={1.6} aria-hidden="true" /><span>{t(text)}</span></li>)}</ul>
  </section>;
}

export function ProblemSection({ imageAvailable }: { imageAvailable: boolean }) {
  const { t } = useHome();
  return <section className="pass-problem home-section" id="why-prohor" tabIndex={-1} aria-labelledby="problem-title">
    <div className="home-container pass-problem-grid">
      <div className="pass-problem-image">
        {imageAvailable ? <Image src="/images/mother-baby-soft.webp" alt={t(copy("A mother and baby sharing a quiet moment.", "মা ও শিশুর শান্ত এক মুহূর্ত।"))} fill sizes="(min-width: 1024px) 480px, 100vw" /> : <MissingImage kind="problem" />}
        <span className="pass-image-caption"><Heart size={20} aria-hidden="true" />{t(copy("For the mother. And the person.", "মায়ের জন্য। মানুষটির জন্যও।"))}</span>
      </div>
      <div className="pass-problem-copy">
        <p className="pass-kicker">{t(copy("Why PROHOR", "কেন প্রহর"))}</p>
        <h2 id="problem-title">{t(copy("Motherhood has enough moving parts. ", "মাতৃত্বে অনেক কিছু সামলাতে হয়। "))}<span>{t(copy("Care should bring them together.", "যত্ন সেগুলোকে একসঙ্গে রাখুক।"))}</span></h2>
        <ul className="pass-problem-points">
          <li><BookOpen size={23} aria-hidden="true" /><div><h3>{t(copy("Your story, without the scattered pieces.", "ছড়ানো তথ্য নয়, আপনার সম্পূর্ণ গল্প।"))}</h3><p>{t(copy("Reports, questions and visits belong in one connected journey.", "রিপোর্ট, প্রশ্ন ও সাক্ষাৎ থাকুক এক ধারাবাহিক যাত্রায়।"))}</p></div></li>
          <li><SlidersHorizontal size={23} aria-hidden="true" /><div><h3>{t(copy("A way in that works for you.", "প্রবেশের পথ হোক আপনার উপযোগী।"))}</h3><p>{t(copy("Language, small text or a voice-only task should never stand in the way.", "ভাষা, ছোট লেখা বা শুধু কণ্ঠে করার কাজ যেন বাধা না হয়।"))}</p></div></li>
          <li><Baby size={23} aria-hidden="true" /><div><h3>{t(copy("Care beyond the day of birth.", "জন্মের দিনের পরেও যত্ন।"))}</h3><p>{t(copy("Because a mother’s needs don’t end when a baby’s story begins.", "শিশুর গল্প শুরু হলে মায়ের প্রয়োজনগুলো শেষ হয়ে যায় না।"))}</p></div></li>
        </ul>
      </div>
    </div>
  </section>;
}

type PhoneMode = "touch" | "larger" | "picture";
const modes: { id: PhoneMode; label: ReturnType<typeof copy>; icon: typeof Type }[] = [
  { id: "touch", label: copy("Touch & text", "স্পর্শ ও লেখা"), icon: MessageCircle },
  { id: "larger", label: copy("Larger text + high contrast", "বড় লেখা ও বেশি কনট্রাস্ট"), icon: Type },
  { id: "picture", label: copy("Picture-and-text", "ছবি ও লেখা"), icon: Sparkles },
];

function VisitPhone({ mode, question, onQuestion, reviewed, onReview }: {
  mode: typeof modes[number]; question: string; onQuestion: (value: string) => void; reviewed: boolean; onReview: () => void;
}) {
  const { t, locale } = useHome();
  const Icon = mode.icon;
  const phrases = [
    { icon: MessageCircle, label: copy("I want to ask", "জানতে চাই") },
    { icon: CalendarDays, label: copy("At my next visit", "পরের সাক্ষাতে") },
    { icon: Heart, label: copy("About my care", "আমার যত্ন নিয়ে") },
  ];
  const id = `visit-question-${mode.id}`;
  return <figure className={`pass-phone-figure pass-phone-${mode.id}`}>
    <figcaption><Icon size={21} aria-hidden="true" /><span>{t(mode.label)}</span></figcaption>
    <div className="pass-phone">
      <div className="pass-phone-hardware" aria-hidden="true"><span /></div>
      <div className="pass-phone-screen">
        <div className="pass-phone-brand"><ProhorSymbol /><span lang="en">PROHOR</span></div>
        <div className="pass-phone-intro"><span className="pass-phone-icon"><CalendarDays size={25} aria-hidden="true" /></span><p>{t(copy("A little preparation.", "একটু প্রস্তুতি।"))}</p><h3>{t(copy("Your next visit.", "আপনার পরের সাক্ষাৎ।"))}</h3></div>
        <label htmlFor={id}>{t(copy("What would you like to ask?", "আপনি কী জানতে চান?"))}</label>
        {mode.id === "picture" && <div className="pass-phrase-grid" role="group" aria-label={t(copy("Picture-and-text sample phrases", "ছবি ও লেখার নমুনা বাক্যাংশ"))}>
          {phrases.map(({ icon: PhraseIcon, label }) => <button key={label.en} type="button" onClick={() => onQuestion(question || label[locale])}><PhraseIcon size={24} aria-hidden="true" /><span>{t(label)}</span><Plus size={16} aria-hidden="true" /></button>)}
        </div>}
        <textarea id={id} rows={3} value={question} onChange={event => onQuestion(event.target.value)} placeholder={t(copy("What should I bring to my visit?", "সাক্ষাতে কী সঙ্গে আনব?"))} />
        <button className="home-button pass-review-button" onClick={onReview}>{t(copy("Review my question", "আমার প্রশ্ন দেখুন"))}<ArrowRight size={19} aria-hidden="true" /></button>
        <p className="home-small pass-phone-private"><LockKeyhole size={16} aria-hidden="true" />{t(copy("Practice only. Nothing is sent.", "শুধু অনুশীলন। কিছু পাঠানো হয় না।"))}</p>
        {reviewed && <div className="pass-question-review"><Check size={20} aria-hidden="true" /><p>{question.trim() || t(copy("Write a question to review it here.", "এখানে দেখতে আগে একটি প্রশ্ন লিখুন।"))}</p></div>}
      </div>
    </div>
  </figure>;
}

export function AdaptSection() {
  const { t, openPreferences } = useHome();
  const [question, setQuestion] = useState("");
  const [reviewed, setReviewed] = useState(false);
  function updateQuestion(value: string) { setQuestion(value); setReviewed(false); }
  return <section className="pass-adapt home-section" id="how-it-works" tabIndex={-1} aria-labelledby="adapt-title">
    <div className="home-container">
      <div className="pass-adapt-heading"><div><p className="pass-kicker">{t(copy("Adapt, to you", "অ্যাডাপ্ট, আপনার মতো"))}</p><h2 id="adapt-title">{t(copy("One care. ", "একই যত্ন। "))}<span>{t(copy("Your way.", "আপনার মতো।"))}</span></h2></div><p>{t(copy("The same visit question. A different way to make it yours. Try the previews—your words stay with you as you switch.", "সাক্ষাতের একই প্রশ্ন। আপনার উপযোগী ভিন্ন উপস্থাপনা। নমুনায় চেষ্টা করুন—উপস্থাপনা বদলালেও আপনার লেখা থাকবে।"))}</p></div>
      <div className="pass-phone-group" id="features" role="group" tabIndex={-1} aria-label={t(copy("Three presentations of the same visit question", "সাক্ষাতের একই প্রশ্নের তিনটি উপস্থাপনা"))}>
        <div className="pass-group-label"><span className="pass-preview" lang="en">Preview</span><span>{t(copy("One task. Three possibilities.", "এক কাজ। তিন উপস্থাপনা।"))}</span></div>
        <div className="pass-phones">{modes.map(mode => <VisitPhone key={mode.id} mode={mode} question={question} onQuestion={updateQuestion} reviewed={reviewed} onReview={() => setReviewed(true)} />)}</div>
      </div>
      <div className="pass-adapt-bottom"><p>{t(copy("Different preferences. The same information, choices and care.", "পছন্দ আলাদা। তথ্য, সিদ্ধান্ত ও যত্ন একই।"))}</p><button onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={21} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}<ArrowUpRight size={20} aria-hidden="true" /></button></div>
      <p className="home-sr-only" role="status">{reviewed ? t(copy(question.trim() ? "Your practice question is shown in all three previews. Nothing was sent." : "Write a question to review it here.", question.trim() ? "আপনার অনুশীলনের প্রশ্ন তিনটি নমুনাতেই দেখা যাচ্ছে। কিছু পাঠানো হয়নি।" : "এখানে দেখতে আগে একটি প্রশ্ন লিখুন।")) : ""}</p>
    </div>
  </section>;
}
