"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Baby, BookOpen, CalendarDays, Check, FileCheck2, FileText, Heart, HeartHandshake, LockKeyhole, MapPin, MessageCircle, ShieldCheck, SlidersHorizontal, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProductScene } from "./HeroProductScene";
import { InclusivePhoto } from "./InclusiveJourney";
import { MaternalFacts } from "./HomepageUpgrade";
import { SectionEyebrow } from "./SectionEyebrow";
import { useHome } from "./HomeContext";
import { copy, type Copy } from "./home-content";
import { HomepageFooter } from "./HomepageFooter";
import { RoadmapExplorer } from "./RoadmapExplorer";
import { ModuleScreen, MotherWindow, ProviderWindow, SharedVisitPhones, type ModuleName } from "./ProductScreens";

type ModuleStory = { name: ModuleName; bn: string; icon: typeof Heart; heading: Copy; body: Copy; points: Copy[]; note: Copy };
const modules: ModuleStory[] = [
  { name: "Adapt", bn: "অ্যাডাপ্ট", icon: SlidersHorizontal, heading: copy("The experience bends to you.", "অভিজ্ঞতা বদলাবে আপনার মতো।"), body: copy("Your language, your text size, your way of interacting. Make the space comfortable without changing the care you can access.", "ভাষা, লেখার আকার ও ব্যবহারের ধরন বেছে নিন। যত্নের অধিকার একই রেখে অভিজ্ঞতা হোক আপনার উপযোগী।"), points: [copy("Preferences that combine", "একসঙ্গে ব্যবহারযোগ্য পছন্দ"), copy("Keyboard access from the start", "শুরু থেকেই কিবোর্ডে ব্যবহার"), copy("Your words stay in place", "আপনার লেখা অক্ষত থাকে")], note: copy("Your way is the starting point.", "শুরু হোক আপনার মতো।") },
  { name: "Barta", bn: "বার্তা", icon: MessageCircle, heading: copy("A clearer answer. In your language.", "সহজ উত্তর। আপনার ভাষায়।"), body: copy("Make room for questions, big or small. Bangla education with the evidence beside it, so understanding has something to stand on.", "ছোট-বড় সব প্রশ্নের জায়গা থাকুক। বাংলায় স্বাস্থ্যশিক্ষার পাশে থাকুক সূত্র, যেন বোঝার একটি ভিত্তি থাকে।"), points: [copy("Bangla and English", "বাংলা ও ইংরেজি"), copy("Sources you can open", "খুলে পড়ার মতো সূত্র"), copy("Clear limits and uncertainty", "সীমা ও অনিশ্চয়তা স্পষ্ট")], note: copy("Understanding starts with a question.", "বোঝার শুরু একটি প্রশ্নে।") },
  { name: "Shonket", bn: "সংকেত", icon: ShieldCheck, heading: copy("A direct way to reach help.", "সহায়তার সরাসরি পথ।"), body: copy("Some moments need a person. Keep safety information and routes to human help within reach, without making AI the gatekeeper.", "কিছু মুহূর্তে একজন মানুষের সহায়তা প্রয়োজন। এআইয়ের বাধ্যতামূলক ধাপ ছাড়াই কাছে থাকুক সুরক্ষার তথ্য ও সহায়তার পথ।"), points: [copy("Help without an AI conversation", "এআই কথোপকথন ছাড়াই সহায়তা"), copy("Clearly sourced public contacts", "সূত্রসহ জনসেবার যোগাযোগ"), copy("Human care stays central", "কেন্দ্রে থাকুক মানুষের যত্ন")], note: copy("People, when people matter most.", "প্রয়োজনে মানুষের কাছে।") },
  { name: "Jibonrekha", bn: "জীবনরেখা", icon: CalendarDays, heading: copy("One journey. Two distinct stories.", "এক যাত্রা। দুটি আলাদা গল্প।"), body: copy("Keep the mother’s record and the baby’s record connected, with a clear place for each. Carry the context from one chapter into the next.", "মা ও শিশুর রেকর্ড যুক্ত থাকুক, প্রত্যেকের জন্য থাকুক আলাদা জায়গা। যত্নের তথ্য এগিয়ে যাক এক অধ্যায় থেকে পরের অধ্যায়ে।"), points: [copy("Separate mother and baby records", "মা ও শিশুর পৃথক রেকর্ড"), copy("A timeline with context", "প্রাসঙ্গিক তথ্যসহ সময়রেখা"), copy("Beyond pregnancy and birth", "গর্ভকাল ও জন্মের পরেও")], note: copy("Continuity, without losing the details.", "খুঁটিনাটি রেখেই ধারাবাহিকতা।") },
  { name: "Bujhi", bn: "বুঝি", icon: FileCheck2, heading: copy("A report you can make sense of.", "রিপোর্টের কথা বুঝে নিন।"), body: copy("Bring a document into focus. Review what was extracted, correct the details, and choose the right record before anything is saved.", "নথির তথ্য দেখুন পরিষ্কারভাবে। তুলে নেওয়া তথ্য যাচাই ও সংশোধন করে সংরক্ষণের আগে সঠিক রেকর্ড বেছে নিন।"), points: [copy("Keep the source document visible", "মূল নথি সামনে রাখুন"), copy("Review and correct first", "আগে যাচাই ও সংশোধন"), copy("Confirm the record yourself", "সঠিক রেকর্ড নিজে নিশ্চিত করুন")], note: copy("Understanding begins with checking.", "বোঝার শুরু যাচাইয়ে।") },
  { name: "Shusthota", bn: "সুস্থতা", icon: Sun, heading: copy("A little room for you, too.", "আপনার জন্যও একটু জায়গা।"), body: copy("Notice how the day feels. Make space for mood, rest and private reflections, with no universal targets or pressure to keep up.", "দিনটি কেমন লাগছে, একটু খেয়াল করুন। একই লক্ষ্যের চাপ ছাড়াই মনের অবস্থা, বিশ্রাম ও নিজের কথার জন্য থাকুক জায়গা।"), points: [copy("Optional daily check-ins", "ইচ্ছেমতো দিনের খোঁজ"), copy("Rest at your own pace", "আপনার মতো বিশ্রাম"), copy("A diary that stays private", "ব্যক্তিগত ডায়েরি")], note: copy("You are more than a care checklist.", "যত্নের তালিকার বাইরেও আছেন আপনি।") },
  { name: "Poth", bn: "পথ", icon: MapPin, heading: copy("Know where to go next.", "পরের গন্তব্যের খোঁজ নিন।"), body: copy("Find care information you can check, then prepare for the conversation. Make your questions and access needs part of the plan.", "যাচাই করার মতো সেবার তথ্য খুঁজে সাক্ষাতের প্রস্তুতি নিন। আপনার প্রশ্ন ও ব্যবহারগত চাহিদা থাকুক পরিকল্পনার অংশ।"), points: [copy("Sourced facility information", "সূত্রসহ প্রতিষ্ঠানের তথ্য"), copy("Questions to take with you", "সঙ্গে নেওয়ার মতো প্রশ্ন"), copy("Access details to check", "প্রবেশগম্যতার তথ্য যাচাই")], note: copy("A clearer next step.", "পরের ধাপ হোক পরিষ্কার।") },
  { name: "Bondhon", bn: "বন্ধন", icon: HeartHandshake, heading: copy("Your circle. Your permission.", "আপনার মানুষ। আপনার অনুমতি।"), body: copy("Bring people into the picture on your terms. Choose the person, the information and the purpose, then review before sharing.", "আপনার শর্তে মানুষকে যুক্ত করুন। প্রাপক, তথ্য ও উদ্দেশ্য বেছে নিয়ে শেয়ার করার আগে নিজে পর্যালোচনা করুন।"), points: [copy("Specific, revocable choices", "নির্দিষ্ট ও প্রত্যাহারযোগ্য পছন্দ"), copy("Review before sharing", "শেয়ারের আগে পর্যালোচনা"), copy("Private spaces stay private", "ব্যক্তিগত অংশ ব্যক্তিগতই থাকে")], note: copy("Support, with you in control.", "সহায়তা থাকুক আপনার নিয়ন্ত্রণে।") },
];

export function HeroStory() {
  const { t, locale } = useHome();
  const capabilities = [
    { icon: Baby, label: copy("Mother & baby records", "মা ও শিশুর রেকর্ড") },
    { icon: MessageCircle, label: copy("Bangla answers with sources", "সূত্রসহ বাংলায় উত্তর") },
    { icon: FileCheck2, label: copy("Reports explained", "রিপোর্টের ব্যাখ্যা") },
    { icon: Sun, label: copy("Well-being", "ভালো থাকা") },
    { icon: HeartHandshake, label: copy("Human support", "মানুষের সহায়তা") },
  ];
  return <section className="story-hero story-section" aria-labelledby="hero-title">
    <div className="home-container story-hero-grid">
      <div className="story-hero-copy">
        <SectionEyebrow>{t(copy("Connected care. A more human experience.", "সংযুক্ত যত্ন। আরও মানবিক অভিজ্ঞতা।"))}</SectionEyebrow>
        <h1 id="hero-title">{locale === "en" ? <><span className="story-headline-line">Maternal care, </span><span className="story-headline-line">designed around </span><em className="story-headline-line">every mother.</em></> : <>{t(copy("Maternal care, designed around ", "মাতৃত্বের যত্ন, "))}<em>{t(copy("every mother.", "প্রতিটি মায়ের মতো করে।"))}</em></>}</h1>
        <p className="story-bangla-tagline" lang="bn">আপনার যত্ন, আপনার মতো।</p>
        <p className="story-hero-description">{t(copy("PROHOR is one connected place for mothers in Bangladesh: keep mother and baby records, get Bangla answers with sources, understand your reports, notice your well-being, find care and reach real people, in the way that works for you.", "বাংলাদেশের মায়েদের জন্য প্রহর একটি সংযুক্ত জায়গা: মা ও শিশুর রেকর্ড রাখুন, সূত্রসহ বাংলায় উত্তর পান, রিপোর্ট বুঝুন, নিজের ভালো থাকার খোঁজ নিন, সেবা খুঁজুন ও মানুষের সহায়তা নিন—আপনার উপযোগী উপায়ে।"))}</p>
        <div className="story-actions">
          <Button href="/ask">{t(copy("Ask Barta", "বার্তাকে জিজ্ঞেস করুন"))}<ArrowUpRight size={19} aria-hidden="true" /></Button>
          <Button href="#how-it-works" variant="secondary">{t(copy("See how it works", "কীভাবে কাজ করে দেখুন"))}<ArrowDown size={18} aria-hidden="true" /></Button>
        </div>
        <ul className="hero-capabilities" aria-label={t(copy("What you can do with PROHOR", "প্রহরে কী করতে পারবেন"))}>{capabilities.map(({ icon: Icon, label }) => <li key={label.en}><Icon size={15} aria-hidden="true" /><span>{t(label)}</span></li>)}</ul>
        <p className="hero-inclusive"><HeartHandshake size={18} aria-hidden="true" /><span><strong>{t(copy("For every mother, with or without a disability.", "প্রতিবন্ধিতা থাকুক বা না থাকুক, প্রতিটি মায়ের জন্য।"))}</strong> {t(copy("One platform, no separate version. Explore without an account.", "এক প্ল্যাটফর্ম, আলাদা সংস্করণ নেই। অ্যাকাউন্ট ছাড়াই ঘুরে দেখুন।"))}</span></p>
      </div>
      <HeroProductScene />
    </div>
  </section>;
}

export function ValueStory() {
  const { t } = useHome();
  return <section className="story-values story-section" aria-label={t(copy("The PROHOR promise", "প্রহরের প্রতিশ্রুতি"))}><ul className="home-container story-value-grid">{[
    { icon: BookOpen, big: copy("One story.", "এক গল্প।"), text: copy("Your care, connected.", "আপনার যত্ন, একসঙ্গে।") },
    { icon: LockKeyhole, big: copy("Your choice.", "আপনার পছন্দ।"), text: copy("You control what you share.", "তথ্য ভাগ করার সিদ্ধান্ত আপনার।") },
    { icon: SlidersHorizontal, big: copy("Every way.", "আপনার মতো।"), text: copy("An experience that adapts to you.", "অভিজ্ঞতা বদলাবে আপনার মতো।") },
  ].map(({ icon: Icon, big, text }) => <li key={big.en}><Icon size={38} strokeWidth={1.5} aria-hidden="true" /><strong>{t(big)}</strong><p>{t(text)}</p></li>)}</ul></section>;
}

export function ProblemStory() {
  const { t } = useHome();
  return <section id="why-prohor" tabIndex={-1} className="story-problem story-section" aria-labelledby="problem-title"><div className="home-container story-problem-grid"><div className="story-problem-copy"><SectionEyebrow>{t(copy("Why PROHOR", "কেন প্রহর"))}</SectionEyebrow><h2 id="problem-title">{t(copy("Motherhood is a journey. ", "মাতৃত্ব একটি যাত্রা। "))}<em>{t(copy("Care shouldn’t feel like a puzzle.", "যত্ন যেন ধাঁধা না হয়।"))}</em></h2><ul className="story-problem-points">{[
    { icon: FileText, title: copy("Less scattered. More connected.", "ছড়ানো কমুক। সংযোগ বাড়ুক।"), body: copy("Keep records, questions and visits in the same story.", "রেকর্ড, প্রশ্ন ও সাক্ষাৎ থাকুক একই গল্পে।") },
    { icon: SlidersHorizontal, title: copy("Fewer barriers. More ways in.", "বাধা কমুক। পথ বাড়ুক।"), body: copy("Language, small text and voice-only tasks shouldn’t stand between you and care.", "ভাষা, ছোট লেখা ও শুধু কণ্ঠের কাজ যেন যত্নের পথে বাধা না হয়।") },
    { icon: Baby, title: copy("Beyond birth. Still about you.", "জন্মের পরেও। আপনার জন্যও।"), body: copy("A baby’s beginning is another chapter in the mother’s care.", "শিশুর শুরু মায়ের যত্নেরও আরেক অধ্যায়।") },
  ].map(({ icon: Icon, title, body }) => <li key={title.en}><span><Icon size={25} aria-hidden="true" /></span><div><h3>{t(title)}</h3><p>{t(body)}</p></div></li>)}</ul><MaternalFacts /></div><div className="story-problem-visual"><InclusivePhoto /></div></div></section>;
}

export function AdaptStory() {
  const { t } = useHome();
  return <section id="your-way" tabIndex={-1} className="story-adapt story-section" aria-labelledby="adapt-title"><div className="home-container"><SharedVisitPhones intro={<><SectionEyebrow>{t(copy("Designed around difference", "ভিন্নতার কথা ভেবে তৈরি"))}</SectionEyebrow><h2 id="adapt-title">{t(copy("One care. ", "একই যত্ন। "))}<em>{t(copy("Your way.", "আপনার মতো।"))}</em></h2><p className="adapt-lede">{t(copy("The same visit question, three ways to see and answer it. Type a question, then switch: your words stay put.", "সাক্ষাতের একই প্রশ্ন, দেখার ও উত্তর দেওয়ার তিনটি উপায়। প্রশ্ন লিখে উপস্থাপনা বদলান: আপনার লেখা থাকবে।"))}</p></>} /></div></section>;
}

export function ModulesStory() {
  const { t } = useHome();
  return <section className="story-modules" id="features" tabIndex={-1} aria-labelledby="modules-title"><div className="home-container story-modules-intro"><SectionEyebrow>{t(copy("Eight modules. One shared foundation.", "আট মডিউল। একই ভিত্তি।"))}</SectionEyebrow><h2 id="modules-title">{t(copy("Care, connected. ", "যত্ন, সংযুক্ত। "))}<em>{t(copy("Life, considered.", "জীবনের কথা ভেবে।"))}</em></h2><p>{t(copy("From the first question to the next chapter. A place for every part of the journey.", "প্রথম প্রশ্ন থেকে পরের অধ্যায়। যাত্রার প্রতিটি অংশের জন্য একটি জায়গা।"))}</p><nav className="story-module-links" aria-label={t(copy("Explore the eight modules", "আটটি মডিউল ঘুরে দেখুন"))}>{modules.map(({ name, icon: Icon }) => <a key={name} href={name === "Poth" ? "/poth" : `#module-${name.toLowerCase()}`}><Icon size={18} aria-hidden="true" /><span lang="en">{name}</span></a>)}</nav></div>{modules.map(({ name, bn, icon: Icon, heading, body, points, note }, index) => <article key={name} id={`module-${name.toLowerCase()}`} tabIndex={-1} className={`story-module-row ${index % 2 ? "story-module-reverse" : ""}`} aria-labelledby={`module-title-${name}`}><div className="home-container story-module-grid"><div className="story-module-copy"><SectionEyebrow><Icon size={22} aria-hidden="true" /><span lang="en">{name}</span><span lang="bn">{bn}</span></SectionEyebrow><h3 id={`module-title-${name}`}>{t(heading)}</h3><p>{t(body)}</p><ul>{points.map(point => <li key={point.en}><Check size={19} aria-hidden="true" />{t(point)}</li>)}</ul><a className="story-text-link" href={name === "Poth" ? "/poth" : "#roadmap"}>{name === "Poth" ? t(copy("Open Poth", "পথ ব্যবহার করুন")) : t(copy("See what’s taking shape", "পরিকল্পনা দেখুন"))}<ArrowUpRight size={19} aria-hidden="true" /></a></div><div className={`story-module-stage story-stage-${name.toLowerCase()}`}><div className="story-stage-orbit" aria-hidden="true" /><ModuleScreen name={name} /><div className="story-stage-note"><Icon size={25} aria-hidden="true" /><span>{t(note)}</span></div></div></div></article>)}</section>;
}

export function WalkthroughStory() {
  const { t } = useHome();
  const steps = [
    { icon: MessageCircle, title: copy("Start with your question.", "শুরু হোক আপনার প্রশ্নে।"), body: copy("Use words, pictures or your preferred input. The question is yours.", "লেখা, ছবি বা পছন্দের মাধ্যমে বলুন। প্রশ্নটি আপনার।") },
    { icon: BookOpen, title: copy("Find the evidence behind it.", "উত্তরের পেছনের সূত্র দেখুন।"), body: copy("Open the source. Understand the context. Keep uncertainty visible.", "সূত্র খুলুন। প্রাসঙ্গিক তথ্য বুঝুন। অনিশ্চয়তা স্পষ্ট থাকুক।") },
    { icon: LockKeyhole, title: copy("Share only what you choose.", "শুধু নিজের বাছাই করা তথ্য দিন।"), body: copy("Choose the person and the information. Your review comes first.", "প্রাপক ও তথ্য বেছে নিন। আগে আপনার পর্যালোচনা।") },
  ];
  return <section id="how-it-works" tabIndex={-1} className="story-walkthrough story-section" aria-labelledby="walkthrough-title"><div className="home-container"><div className="story-centered-heading"><SectionEyebrow>{t(copy("A simpler way through", "সহজ একটি পথ"))}</SectionEyebrow><h2 id="walkthrough-title">{t(copy("A question. A little clarity. ", "একটি প্রশ্ন। একটু স্পষ্টতা। "))}<em>{t(copy("A choice that’s yours.", "আপনার নিজের সিদ্ধান্ত।"))}</em></h2></div><ol className="story-steps">{steps.map(({ icon: Icon, title, body }, index) => <li key={title.en}><div className="story-step-visual"><span className="story-step-number" aria-hidden="true">0{index + 1}</span><span className="story-step-icon"><Icon size={40} strokeWidth={1.4} aria-hidden="true" /></span>{index === 0 ? <div className="story-step-bubble" lang="bn">আমার একটি প্রশ্ন আছে…</div> : index === 1 ? <div className="story-step-source"><BookOpen size={21} aria-hidden="true" /><span lang="en">WHO · Source ↗</span></div> : <div className="story-step-consent"><Check size={22} aria-hidden="true" /><span>{t(copy("Only the notes I choose", "শুধু আমার বাছাই করা নোট"))}</span><LockKeyhole size={20} aria-hidden="true" /></div>}</div><h3>{t(title)}</h3><p>{t(body)}</p></li>)}</ol></div></section>;
}

export function AudiencesStory() {
  const { t } = useHome();
  return <section className="story-audiences story-section" id="for-you" aria-labelledby="audiences-title"><div className="home-container"><div className="story-centered-heading"><SectionEyebrow>{t(copy("Two windows. The same care story.", "দুটি জানালা। একই যত্নের গল্প।"))}</SectionEyebrow><h2 id="audiences-title">{t(copy("For the mother. ", "মায়ের জন্য। "))}<em>{t(copy("For the people beside her.", "তাঁর পাশে থাকা মানুষের জন্য।"))}</em></h2></div><div className="story-audience-grid"><article><p className="story-audience-label"><Heart size={23} aria-hidden="true" />{t(copy("For mothers", "মায়েদের জন্য"))}</p><h3>{t(copy("A little more understood.", "আরও একটু বোঝাপড়া।"))}</h3><p>{t(copy("Your questions, your records and your preferences, with you at the centre.", "আপনার প্রশ্ন, রেকর্ড ও পছন্দের কেন্দ্রে থাকুন আপনি।"))}</p><MotherWindow /><a className="story-text-link" href="#your-way">{t(copy("Explore your experience", "আপনার অভিজ্ঞতা দেখুন"))}<ArrowUpRight size={19} aria-hidden="true" /></a></article><article><p className="story-audience-label"><HeartHandshake size={23} aria-hidden="true" />{t(copy("For care providers", "সেবাদাতাদের জন্য"))}</p><h3>{t(copy("A little more context.", "আরও একটু প্রাসঙ্গিক তথ্য।"))}</h3><p>{t(copy("The information a mother chooses to share, with its source and her permission.", "মায়ের বাছাই করা তথ্য, তার সূত্র এবং তাঁর অনুমতি।"))}</p><ProviderWindow /><a className="story-text-link" href="#module-bondhon">{t(copy("Explore the care connection", "যত্নের সংযোগ দেখুন"))}<ArrowUpRight size={19} aria-hidden="true" /></a></article></div></div></section>;
}

export function ResponsibleStory() {
  const { t } = useHome();
  return <section id="responsible-ai" tabIndex={-1} className="story-responsible story-section" aria-labelledby="responsible-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("Thoughtful technology", "বিবেচনাপূর্ণ প্রযুক্তি"))}</SectionEyebrow><h2 id="responsible-title">{t(copy("AI helps explain. ", "এআই বুঝতে সাহায্য করে। "))}<em>{t(copy("People provide care.", "মানুষই যত্ন দেন।"))}</em></h2></div><p>{t(copy("Useful technology starts with clear boundaries. Evidence, human judgment and your permission belong in the picture.", "উপকারী প্রযুক্তির শুরু স্পষ্ট সীমায়। সঙ্গে থাকুক প্রমাণ, মানুষের বিচারবোধ ও আপনার অনুমতি।"))}</p></div><div className="story-responsible-grid"><article><div className="story-principle-art story-evidence-art" aria-hidden="true"><div><FileText size={36} /><span>WHO</span></div><BookOpen size={56} strokeWidth={1.3} /><span><Check size={25} /></span></div><h3>{t(copy("Evidence you can open.", "খুলে পড়ার মতো প্রমাণ।"))}</h3><p>{t(copy("Keep sources beside explanations. Say when the information doesn’t cover the question.", "ব্যাখ্যার পাশে সূত্র থাকুক। প্রশ্নের উত্তর দেওয়ার মতো তথ্য না থাকলে সেটিও স্পষ্ট হোক।"))}</p></article><article><div className="story-principle-art story-people-art" aria-hidden="true"><span><UserRound size={31} /></span><span><ArrowRight size={25} /></span><span><HeartHandshake size={47} strokeWidth={1.4} /></span></div><h3>{t(copy("Human judgment stays human.", "বিচারবোধ থাকুক মানুষের।"))}</h3><p>{t(copy("AI explains information. Clinical decisions and real care belong with qualified people.", "এআই তথ্য বুঝতে সাহায্য করে। চিকিৎসার সিদ্ধান্ত ও প্রকৃত যত্ন যোগ্য মানুষের কাজ।"))}</p></article><article><div className="story-principle-art story-permission-art" aria-hidden="true"><LockKeyhole size={52} strokeWidth={1.4} /><div><span><Check size={17} />{t(copy("Selected notes", "বাছাই করা নোট"))}</span><span><LockKeyhole size={17} />{t(copy("Private diary", "ব্যক্তিগত ডায়েরি"))}</span></div></div><h3>{t(copy("Consent that stays yours.", "সম্মতি থাকুক আপনারই।"))}</h3><p>{t(copy("Choose the person, purpose and records. Private diary and AI conversations stay outside default sharing.", "প্রাপক, উদ্দেশ্য ও রেকর্ড বেছে নিন। ডায়েরি ও এআই কথোপকথন স্বাভাবিকভাবে শেয়ার হবে না।"))}</p></article></div></div></section>;
}

export function RoadmapStory() {
  return <RoadmapExplorer />;
}

export function ClosingStory() {
  const { t, openPreferences } = useHome();
  return <section className="story-closing story-section" aria-labelledby="closing-title"><div className="home-container story-closing-grid"><div><SectionEyebrow>{t(copy("Your care. Your way.", "আপনার যত্ন। আপনার মতো।"))}</SectionEyebrow><h2 id="closing-title">{t(copy("One care journey. ", "এক যত্নের যাত্রা। "))}<em>{t(copy("Every mother’s way.", "প্রতিটি মায়ের মতো।"))}</em></h2><p>{t(copy("A more connected future starts by making room for every mother.", "আরও সংযুক্ত ভবিষ্যতের শুরু প্রতিটি মায়ের জন্য জায়গা করে দিয়ে।"))}</p><button className="home-button story-closing-button" onClick={openPreferences} aria-haspopup="dialog">{t(copy("Make PROHOR yours", "প্রহরকে আপনার মতো করুন"))}<ArrowUpRight size={22} aria-hidden="true" /></button></div><div className="story-closing-visual" role="img" aria-label={t(copy("The mother at the centre of records, understanding and human support.", "রেকর্ড, বোঝাপড়া ও মানুষের সহায়তার কেন্দ্রে মা।"))}><div className="story-closing-ring" /><span className="story-closing-centre"><UserRound size={78} strokeWidth={1.2} aria-hidden="true" /><Heart size={29} aria-hidden="true" /></span><span className="story-closing-node story-node-record"><BookOpen size={34} aria-hidden="true" /></span><span className="story-closing-node story-node-care"><HeartHandshake size={38} aria-hidden="true" /></span><span className="story-closing-node story-node-understand"><MessageCircle size={35} aria-hidden="true" /></span></div></div></section>;
}

export function StoryFooter() {
  return <HomepageFooter />;
}
