"use client";

import { useState, useSyncExternalStore } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Baby, BookOpen, Check,
  ChevronDown, FileCheck2, Heart, HeartHandshake,
  Keyboard, LockKeyhole, MessageCircle, MousePointer2,
  ShieldCheck, SlidersHorizontal, Sun, Type, UserRound,
} from "lucide-react";
import {
  DEFAULT_PROHOR_PREFERENCES, applyPreferences, readLocalPreferences,
  saveLocalPreferences, type ProhorAccessPreferences,
} from "@/lib/access-preferences";
import { applyReadingPreferences, readReadingPreferences } from "./HomePreferences";
import { useHome } from "./HomeContext";
import { ProhorSymbol } from "./HomeBrand";
import { capabilityGroups, copy, statusLabels } from "./home-content";
import { CareWorkspace, ConsentExhibit, DemoLabel, EducationExhibit, EverydayExhibit, MobileExhibit, RecordExhibit } from "./ProductExhibits";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="home-eyebrow">{children}</p>;
}

function Status({ status }: { status: keyof typeof statusLabels }) {
  const { t } = useHome();
  return <span className={`home-status home-status-${status.toLowerCase()}`}>{t(statusLabels[status])}</span>;
}

function ModuleName({ name, bn, status = "Future" }: { name: string; bn: string; status?: keyof typeof statusLabels }) {
  return <div className="home-module-label"><span lang="en">{name}</span><span lang="bn">{bn}</span><Status status={status} /></div>;
}

export function Hero() {
  const { t, openPreferences } = useHome();
  return (
    <section className="home-hero home-container" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <Eyebrow><span className="home-small-sun"><Sun size={17} aria-hidden="true" /></span>{t(copy("Maternal & child care. Connected.", "মা ও শিশুর যত্ন। একসঙ্গে।"))}</Eyebrow>
        <h1 id="home-title"><span className="home-hero-opening">{t(copy("Care that meets you", "যত্ন হোক"))}</span><span>{t(copy("where you are.", "আপনার মতো করে।"))}</span></h1>
        <p className="home-hero-description">{t(copy("Connected maternal and child care. Understand your health, keep records and find human support—in the way that works for you.", "মা ও শিশুর সংযুক্ত যত্ন। স্বাস্থ্য বুঝুন, রেকর্ড রাখুন ও মানুষের সহায়তা খুঁজুন—আপনার উপযোগী পথে।"))}</p>
        <p className="home-official-tagline"><span lang="en">Your Care. Your Way.</span><span lang="bn">আপনার যত্ন, আপনার মতো।</span></p>
        <div className="home-actions"><a className="home-button" href="#why-prohor">{t(copy("Explore how PROHOR works", "প্রহর কীভাবে কাজ করে দেখুন"))}<ArrowUpRight size={20} aria-hidden="true" /></a><a className="home-text-link" href="#features">{t(copy("See our care ecosystem", "আমাদের সেবার পরিসর দেখুন"))}<ArrowRight size={18} aria-hidden="true" /></a></div>
        <button className="home-inline-access" onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={18} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}</button>
      </div>
      <CareWorkspace />
      <div className="home-hero-foundation"><p><LockKeyhole size={18} aria-hidden="true" />{t(copy("Explore without an account.", "অ্যাকাউন্ট ছাড়াই ঘুরে দেখুন।"))}</p><p>{t(copy("Pregnancy", "গর্ভকাল"))}<span aria-hidden="true">/</span>{t(copy("Postpartum", "প্রসব-পরবর্তী সময়"))}<span aria-hidden="true">/</span>{t(copy("Early motherhood", "মাতৃত্বের শুরু"))}</p><a href="#roadmap">{t(copy("A vision, honestly labelled", "পরিকল্পনা ও প্রস্তুতির সৎ চিত্র"))}<ArrowDown size={17} aria-hidden="true" /></a></div>
    </section>
  );
}

export function Problem() {
  const { t } = useHome();
  const concerns = [
    { number: "01", title: copy("Continuity", "ধারাবাহিকতা"), text: copy("A report here. A visit there. One mother holding the pieces together.", "রিপোর্ট এক জায়গায়। সাক্ষাৎ অন্যখানে। সব মিলিয়ে রাখার দায় মায়ের ওপর।") },
    { number: "02", title: copy("Understanding", "বোঝাপড়া"), text: copy("More information doesn’t always mean a clearer next step.", "বেশি তথ্য মানেই পরের পদক্ষেপ আরও স্পষ্ট হওয়া নয়।") },
    { number: "03", title: copy("Access", "ব্যবহারের সুযোগ"), text: copy("Small text and voice-only tasks can put the same care out of reach.", "ছোট লেখা ও শুধু কণ্ঠনির্ভর কাজ একই যত্ন পাওয়ার পথে বাধা হতে পারে।") },
  ];
  return (
    <section id="why-prohor" className="home-section home-container home-why" aria-labelledby="why-title">
      <div className="home-why-heading"><Eyebrow>{t(copy("Why PROHOR exists", "কেন প্রহর"))}</Eyebrow><h2 id="why-title">{t(copy("Care is a journey.", "যত্ন একটি যাত্রা।"))}<br /><span>{t(copy("It shouldn’t feel like a puzzle.", "খণ্ড খণ্ড তথ্যের ধাঁধা নয়।"))}</span></h2><p>{t(copy("We’re bringing the pieces together for mothers in Bangladesh—and making the way in a choice, not a barrier.", "বাংলাদেশের মায়েদের জন্য আমরা তথ্য ও সহায়তা একসঙ্গে আনার পরিকল্পনা করছি—ব্যবহারের পথ হবে পছন্দ, বাধা নয়।"))}</p></div>
      <div className="home-concerns">{concerns.map(item => <article key={item.number}><span>{item.number}</span><h3>{t(item.title)}</h3><p>{t(item.text)}</p></article>)}</div>
    </section>
  );
}

function subscribePreferences(callback: () => void) {
  window.addEventListener("prohor-preferences-change", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("prohor-preferences-change", callback); window.removeEventListener("storage", callback); };
}
const preferenceSnapshot = () => JSON.stringify(readLocalPreferences());
const serverPreferenceSnapshot = () => JSON.stringify(DEFAULT_PROHOR_PREFERENCES);

function QuickPreferences() {
  const { t } = useHome();
  const raw = useSyncExternalStore(subscribePreferences, preferenceSnapshot, serverPreferenceSnapshot);
  const prefs: ProhorAccessPreferences = JSON.parse(raw);
  function update<K extends keyof ProhorAccessPreferences>(key: K, value: ProhorAccessPreferences[K]) {
    const next = { ...readLocalPreferences(), [key]: value };
    applyPreferences(next);
    applyReadingPreferences(readReadingPreferences());
    saveLocalPreferences(next);
    window.dispatchEvent(new CustomEvent("prohor-preferences-change"));
  }
  return (
    <fieldset className="home-quick-preferences">
      <legend className="sr-only">{t(copy("Working page appearance controls", "পাতার কার্যকর চেহারার নিয়ন্ত্রণ"))}</legend>
      <div><label htmlFor="preview-theme">{t(copy("Theme", "থিম"))}</label><select id="preview-theme" value={prefs.theme} onChange={e => update("theme", e.target.value as ProhorAccessPreferences["theme"])}><option value="quiet-garden">Quiet Garden</option><option value="original-rose">Original Rose</option><option value="morning-mist">Morning Mist</option></select></div>
      <div><label htmlFor="preview-text-size">{t(copy("Text size", "লেখার আকার"))}</label><select id="preview-text-size" value={prefs.textScale} onChange={e => update("textScale", e.target.value as ProhorAccessPreferences["textScale"])}><option value="default">{t(copy("Default", "সাধারণ"))}</option><option value="large">{t(copy("Large", "বড়"))}</option><option value="extra-large">{t(copy("Extra large", "আরও বড়"))}</option></select></div>
      <label className="home-quick-contrast"><input type="checkbox" checked={prefs.highContrast === true} onChange={e => update("highContrast", e.target.checked)} />{t(copy("Higher contrast", "বেশি কনট্রাস্ট"))}</label>
    </fieldset>
  );
}

export function AdaptivePreview() {
  const { t } = useHome();
  const [mode, setMode] = useState<"text" | "reading" | "communication">("text");
  const [message, setMessage] = useState("");
  const modes = [
    { value: "text", Icon: MousePointer2, label: copy("Touch & text", "স্পর্শ ও লেখা") },
    { value: "reading", Icon: Type, label: copy("Reading", "পড়ার সুবিধা") },
    { value: "communication", Icon: Keyboard, label: copy("Communication", "যোগাযোগ") },
  ] as const;
  return (
    <section id="accessibility" className="home-section home-container home-experience" aria-labelledby="experience-title">
      <div className="home-section-heading"><div><Eyebrow>{t(copy("Our defining idea", "আমাদের মূল ভাবনা"))}</Eyebrow><h2 id="experience-title">{t(copy("One care journey.", "যত্নের এক যাত্রা।"))}<br /><span>{t(copy("Many ways to use it.", "ব্যবহারের অনেক পথ।"))}</span></h2></div><p>{t(copy("Change the presentation. Keep the same task, information and rights. No disability category. No separate care tier.", "উপস্থাপনা বদলান। কাজ, তথ্য ও অধিকার থাকুক একই। সক্ষমতার শ্রেণি বা আলাদা সেবার স্তর নয়।"))}</p></div>
      <div className="home-adaptive-exhibit">
        <div className="home-experience-toolbar"><p><SlidersHorizontal size={20} aria-hidden="true" />{t(copy("Make this page yours", "পাতাটি আপনার মতো করুন"))}</p><span className="home-working-label">{t(copy("Working controls", "কার্যকর নিয়ন্ত্রণ"))}</span><QuickPreferences /></div>
        <div className="home-adaptive-stage"><div className="home-task-intro"><span className="home-step-marker">01 <span>/ 03</span></span><h3>{t(copy("Prepare a question.", "একটি প্রশ্ন তৈরি করুন।"))}</h3><p>{t(copy("One small task. Your preferred way to complete it.", "ছোট্ট একটি কাজ। করার পথ আপনার পছন্দের।"))}</p><div className="home-access-principle"><Keyboard size={21} aria-hidden="true" /><span>{t(copy("Keyboard & semantic structure are always available.", "কিবোর্ড ও অর্থপূর্ণ কাঠামো সব সময় থাকে।"))}</span></div><p className="home-task-privacy"><LockKeyhole size={17} aria-hidden="true" />{t(copy("Practice only. Nothing is sent or stored as a health record.", "শুধু অনুশীলন। কিছু পাঠানো বা স্বাস্থ্য রেকর্ড হিসেবে রাখা হয় না।"))}</p></div>
          <div className={`home-task-preview ${mode === "reading" ? "home-task-reading" : ""}`}>
            <div className="home-exhibit-bar"><span>{t(copy("Your visit preparation", "আপনার সাক্ষাতের প্রস্তুতি"))}</span><DemoLabel /></div>
            <fieldset className="home-mode-picker"><legend className="sr-only">{t(copy("Illustrative interaction method", "নমুনা ব্যবহারের ধরন"))}</legend>{modes.map(({ value, Icon, label }) => <label key={value} className={mode === value ? "is-selected" : ""}><input type="radio" name="home-preview-mode" checked={mode === value} onChange={() => setMode(value)} /><Icon size={18} aria-hidden="true" /><span>{t(label)}</span></label>)}</fieldset>
            <label className="home-question-label" htmlFor="home-visit-question">{t(copy("What would you like to ask?", "আপনি কী জানতে চান?"))}</label><textarea id="home-visit-question" value={message} onChange={e => setMessage(e.target.value)} placeholder={t(copy("What should I bring to my visit?", "সাক্ষাতে কী সঙ্গে নিয়ে যাব?"))} maxLength={500} rows={3} />
            {mode === "communication" && <div className="home-phrase-examples"><span><MessageCircle size={19} aria-hidden="true" />{t(copy("I have a question", "আমার একটি প্রশ্ন আছে"))}</span><span><FileCheck2 size={19} aria-hidden="true" />{t(copy("My report", "আমার রিপোর্ট"))}</span><p>{t(copy("Picture-and-text concepts only; AAC composition is not connected.", "ছবি ও লেখার যোগাযোগের ধারণামাত্র; এএসি বার্তা তৈরির সংযোগ নেই।"))}</p></div>}
            <p className="home-draft-note" role="status">{t(mode === "reading" ? copy("Larger preview. Your practice text stays in place.", "বড় লেখার নমুনা। আপনার অনুশীলনের লেখা থাকবে।") : copy("Practice text stays in memory and clears on reload.", "অনুশীলনের লেখা চলতি পাতায় থাকে, রিলোডে মুছে যায়।"))}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ConnectedJourney() {
  const { t } = useHome();
  const steps = [
    { Icon: SlidersHorizontal, title: copy("Start your way", "শুরু আপনার মতো"), detail: copy("Choose how you use PROHOR.", "ব্যবহারের পছন্দ বেছে নিন।") },
    { Icon: Baby, title: copy("Keep your story", "আপনার তথ্য রাখুন"), detail: copy("Mother and baby, distinct records.", "মা ও শিশুর আলাদা রেকর্ড।") },
    { Icon: BookOpen, title: copy("Understand", "বুঝুন"), detail: copy("Sources, explanations and review.", "সূত্র, ব্যাখ্যা ও যাচাই।") },
    { Icon: Heart, title: copy("Notice your day", "নিজের খোঁজ নিন"), detail: copy("Well-being at your own pace.", "নিজের গতিতে ভালো থাকার খোঁজ।") },
    { Icon: HeartHandshake, title: copy("Connect to people", "মানুষের সঙ্গে যুক্ত হোন"), detail: copy("Human support, with your consent.", "আপনার সম্মতিতে মানুষের সহায়তা।") },
  ];
  return (
    <section id="how-it-works" className="home-section home-container home-journey-section" aria-labelledby="journey-title">
      <div className="home-journey-heading"><h2 id="journey-title">{t(copy("A thread through it all.", "সবকিছুর মধ্যে একটি যোগসূত্র।"))}</h2><p>{t(copy("The proposed path, from pregnancy into early motherhood.", "গর্ভকাল থেকে মাতৃত্বের শুরু পর্যন্ত পরিকল্পিত পথ।"))}</p></div>
      <ol className="home-journey">{steps.map(({ Icon, title, detail }, i) => <li key={title.en}><span className="home-journey-icon"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span><span className="home-journey-index">0{i + 1}</span><h3>{t(title)}</h3><p>{t(detail)}</p></li>)}</ol>
    </section>
  );
}

function Roadmap() {
  const { t } = useHome();
  return (
    <details id="roadmap" className="home-roadmap">
      <summary><span><span className="home-roadmap-number">24</span>{t(copy("Explore the 24-capability roadmap", "২৪টি সক্ষমতার পরিকল্পনা দেখুন"))}</span><ChevronDown size={24} aria-hidden="true" /></summary>
      <div className="home-roadmap-body"><p>{t(copy("This homepage works. Adapt has limited local preferences. Care exhibits are simulated; the remaining capabilities are future work. The ambition is not a claim of a finished clinical product.", "এই প্রথম পাতা কার্যকর। অ্যাডাপ্টে সীমিত স্থানীয় পছন্দ আছে। যত্নের পর্দাগুলো নমুনা; বাকি সক্ষমতা ভবিষ্যৎ কাজ। পরিকল্পনা মানেই সম্পূর্ণ চিকিৎসাপণ্য নয়।"))}</p><div className="home-status-legend">{(["Working", "Limited", "Simulated", "Future"] as const).map(status => <Status key={status} status={status} />)}</div>
        <div className="home-capabilities">{capabilityGroups.map(group => <details key={group.name}><summary><span lang="en">{group.name}</span><span>{group.features.length}</span><ChevronDown size={20} aria-hidden="true" /></summary><div className="home-capability-body"><p>{t(group.description)}</p><ul>{group.features.map(feature => <li key={feature.id}><span className="home-capability-number">{String(feature.id).padStart(2, "0")}</span><span>{t(feature.title)}</span><Status status={feature.status} /></li>)}</ul></div></details>)}</div>
      </div>
    </details>
  );
}

export function Modules() {
  const { t } = useHome();
  return (
    <section id="features" className="home-section home-container home-modules" aria-labelledby="modules-title">
      <div className="home-section-heading"><div><Eyebrow>{t(copy("Eight modules. One shared foundation.", "আট মডিউল। এক অভিন্ন ভিত্তি।"))}</Eyebrow><h2 id="modules-title">{t(copy("Care, connected.", "যত্ন, একসঙ্গে।"))}</h2></div><p>{t(copy("Four chapters of the same story. The interfaces are illustrative demos; care services are not connected yet.", "একই গল্পের চারটি অধ্যায়। পর্দাগুলো নমুনা; যত্নের সেবা এখনো সংযুক্ত নয়।"))}</p></div>
      <article className="home-chapter home-chapter-understand" aria-labelledby="chapter-understand">
        <div className="home-chapter-copy"><Eyebrow>{t(copy("01 / Make room for understanding", "০১ / বোঝাপড়ার জায়গা"))}</Eyebrow><h3 id="chapter-understand">{t(copy("Information that meets you halfway.", "আপনার উপযোগী করে তথ্য।"))}</h3><div className="home-module-pair"><ModuleName name="Adapt" bn="অ্যাডাপ্ট" status="Limited" /><ModuleName name="Barta" bn="বার্তা" /></div><p>{t(copy("Your interaction preferences, alongside source-grounded Bangla education. Read in your way; see the evidence behind an explanation.", "আপনার ব্যবহারের পছন্দ ও সূত্রভিত্তিক বাংলা স্বাস্থ্যশিক্ষা। নিজের মতো পড়ুন; ব্যাখ্যার পেছনের প্রমাণ দেখুন।"))}</p></div><EducationExhibit />
      </article>
      <article className="home-chapter home-chapter-records" aria-labelledby="chapter-records">
        <div className="home-chapter-copy"><Eyebrow>{t(copy("02 / Keep the whole story", "০২ / পুরো গল্পটি রাখুন"))}</Eyebrow><h3 id="chapter-records">{t(copy("Your records. With context.", "আপনার রেকর্ড। সঠিক প্রসঙ্গে।"))}</h3><div className="home-module-pair"><ModuleName name="Jibonrekha" bn="জীবনরেখা" /><ModuleName name="Bujhi" bn="বুঝি" /></div></div><p className="home-chapter-aside">{t(copy("Distinct mother and baby histories. Supported report extraction that you can correct and verify before saving. No silent change to clinical facts.", "মা ও শিশুর আলাদা ইতিহাস। সমর্থিত রিপোর্ট থেকে নেওয়া তথ্য সংরক্ষণের আগে সংশোধন ও যাচাই করুন। চিকিৎসাগত তথ্য নীরবে বদলাবে না।"))}</p><RecordExhibit />
      </article>
      <article className="home-chapter home-chapter-everyday" aria-labelledby="chapter-everyday">
        <div className="home-chapter-copy"><Eyebrow>{t(copy("03 / Find your everyday rhythm", "০৩ / নিজের দিনের ছন্দ"))}</Eyebrow><h3 id="chapter-everyday">{t(copy("Your day. Your pace.", "আপনার দিন। আপনার গতি।"))}</h3><div className="home-module-pair"><ModuleName name="Shusthota" bn="সুস্থতা" /><ModuleName name="Poth" bn="পথ" /></div><p>{t(copy("Optional rest, mood and activity notes for different movement abilities. Care navigation that helps you prepare—without invented facilities, access details or bookings.", "বিভিন্ন চলাফেরার সক্ষমতার জন্য বিশ্রাম, মন ও কাজের ঐচ্ছিক নোট। সাক্ষাতের প্রস্তুতিতে সেবার পথ খোঁজা—কাল্পনিক প্রতিষ্ঠান, সুবিধা বা বুকিং ছাড়া।"))}</p></div><EverydayExhibit />
      </article>
      <article className="home-chapter home-chapter-support" aria-labelledby="chapter-support">
        <div className="home-chapter-copy"><Eyebrow>{t(copy("04 / Keep people in the picture", "০৪ / যত্নে থাকুন মানুষের সঙ্গে"))}</Eyebrow><h3 id="chapter-support">{t(copy("Human support. On your terms.", "মানুষের সহায়তা। আপনার শর্তে।"))}</h3><div className="home-module-pair"><ModuleName name="Shonket" bn="সংকেত" /><ModuleName name="Bondhon" bn="বন্ধন" /></div><p>{t(copy("Reviewed safety information and a consent-controlled path to people. Choose the records, recipient and purpose. Assistive technology never gives a supporter automatic access.", "পর্যালোচিত সুরক্ষার তথ্য ও সম্মতিভিত্তিক মানবিক সহায়তার পথ। রেকর্ড, প্রাপক ও কারণ নিজে বেছে নিন। সহায়ক প্রযুক্তি কাউকে স্বয়ংক্রিয় অনুমতি দেয় না।"))}</p></div><ConsentExhibit />
      </article>
      <Roadmap />
    </section>
  );
}

export function HumanAI() {
  const { t } = useHome();
  const flow = [
    { Icon: UserRound, title: copy("Your question", "আপনার প্রশ্ন"), detail: copy("Your words, your preferred input", "আপনার কথা, পছন্দের মাধ্যম") },
    { Icon: BookOpen, title: copy("Visible evidence", "দৃশ্যমান প্রমাণ"), detail: copy("Barta explains; Bujhi asks you to verify", "বার্তা ব্যাখ্যা করে; বুঝি যাচাই চায়") },
    { Icon: ShieldCheck, title: copy("Your review", "আপনার পর্যালোচনা"), detail: copy("Choose what can be shared", "কী শেয়ার হবে, বেছে নিন") },
    { Icon: HeartHandshake, title: copy("Authorized people", "অনুমোদিত মানুষ"), detail: copy("Only when a real connection exists", "প্রকৃত সংযোগ থাকলেই") },
  ];
  return (
    <section id="trust" className="home-section home-container home-trust" aria-labelledby="trust-title">
      <div id="responsible-ai" className="home-section-heading"><div><Eyebrow>{t(copy("A thoughtful role for technology", "প্রযুক্তির দায়িত্বশীল ভূমিকা"))}</Eyebrow><h2 id="trust-title">{t(copy("AI helps explain.", "এআই বুঝতে সাহায্য করে।"))}<br /><span>{t(copy("People provide care.", "যত্ন দেন মানুষ।"))}</span></h2></div><p>{t(copy("Evidence, verification and your permission come before a handoff. The proposed flow is shown here; no AI or provider service is connected.", "প্রমাণ, যাচাই ও আপনার অনুমতি আগে, তারপর মানুষের সহায়তা। এটি পরিকল্পিত পথ; এআই বা সেবাদাতা সংযুক্ত নয়।"))}</p></div>
      <ol className="home-human-flow">{flow.map(({ Icon, title, detail }) => <li key={title.en}><Icon size={29} strokeWidth={1.5} aria-hidden="true" /><h3>{t(title)}</h3><p>{t(detail)}</p></li>)}</ol>
      <div className="home-trust-bottom"><div><span className="home-provenance"><FileCheck2 size={18} aria-hidden="true" />{t(copy("Extracted from report · please check", "রিপোর্ট থেকে নেওয়া · যাচাই করুন"))}</span><p>{t(copy("A source label is part of the information, never a claim that AI has validated it.", "উৎসের পরিচয় তথ্যেরই অংশ; এআই তথ্য অনুমোদন করেছে, এমন দাবি নয়।"))}</p></div><p><strong>{t(copy("Reliable software handles the essentials.", "মূল কাজ নির্ভরযোগ্য সফটওয়্যারের।"))}</strong> {t(copy("Records, preferences, permissions and request status. No autonomous diagnosis, prescribing or triage. Shonket’s reviewed safety path must stay available without AI.", "রেকর্ড, পছন্দ, অনুমতি ও অনুরোধের অবস্থা। স্বয়ংক্রিয় রোগ নির্ণয়, ওষুধ বা জরুরিতা নির্ধারণ নয়। সংকেতের পর্যালোচিত সুরক্ষার পথ এআই ছাড়াই পাওয়া যাবে।"))}</p></div>
      <details className="home-safety-details"><summary>{t(copy("Important safety & prototype limits", "সুরক্ষা ও প্রোটোটাইপের গুরুত্বপূর্ণ সীমা"))}<ChevronDown size={20} aria-hidden="true" /></summary><p>{t(copy("This page does not assess symptoms or dispatch help. For immediate medical care, contact an appropriate local emergency service or healthcare facility directly. No request is described as delivered without verified delivery. Clinical review, secure implementation and testing are still required.", "এই পাতা উপসর্গ মূল্যায়ন বা সহায়তা পাঠায় না। এখনই চিকিৎসা প্রয়োজন হলে উপযুক্ত স্থানীয় জরুরি সেবা বা স্বাস্থ্য প্রতিষ্ঠানের সঙ্গে সরাসরি যোগাযোগ করুন। পৌঁছানোর প্রমাণ ছাড়া অনুরোধ পৌঁছেছে বলা হবে না। চিকিৎসাগত পর্যালোচনা, নিরাপদ বাস্তবায়ন ও পরীক্ষা এখনো প্রয়োজন।"))}</p></details>
    </section>
  );
}

export function Everyday() {
  const { t } = useHome();
  return (
    <section className="home-section home-container home-everyday-section" aria-labelledby="everyday-title">
      <MobileExhibit />
      <div className="home-everyday-copy"><Eyebrow>{t(copy("Made for real everyday life", "দৈনন্দিন জীবনের জন্য"))}</Eyebrow><h2 id="everyday-title">{t(copy("Your language.", "আপনার ভাষা।"))}<br /><span>{t(copy("Your everyday.", "আপনার প্রতিদিন।"))}</span></h2><p>{t(copy("Bangla and English. A readable page on a small screen. Preferences you can combine, without changing your care rights.", "বাংলা ও ইংরেজি। ছোট পর্দাতেও পাঠযোগ্য পাতা। যত্নের অধিকার একই রেখে একসঙ্গে ব্যবহারযোগ্য পছন্দ।"))}</p><ul className="home-simple-list"><li><Check size={19} aria-hidden="true" />{t(copy("Responsive homepage · working", "বিভিন্ন পর্দার প্রথম পাতা · কার্যকর"))}</li><li><Check size={19} aria-hidden="true" />{t(copy("Appearance & reading controls · working", "চেহারা ও পড়ার নিয়ন্ত্রণ · কার্যকর"))}</li><li><LockKeyhole size={19} aria-hidden="true" />{t(copy("Sharing must be specific and revocable", "শেয়ার হবে নির্দিষ্ট ও প্রত্যাহারযোগ্য"))}</li></ul><p className="home-everyday-transparency">{t(copy("The direction is an installable PWA. Full offline medical syncing, SMS, telemedicine and verified provider partnerships remain future work.", "ইনস্টলযোগ্য পিডব্লিউএ ভবিষ্যৎ দিকনির্দেশনা। পুরো অফলাইন স্বাস্থ্যতথ্য সিঙ্ক, এসএমএস, টেলিমেডিসিন ও যাচাইকৃত সেবাদাতা অংশীদারিত্ব ভবিষ্যৎ কাজ।"))}</p><p className="home-private-promise"><LockKeyhole size={20} aria-hidden="true" />{t(copy("Private diary and AI conversations are excluded from default sharing by design. The mother stays in control.", "নকশায় ডায়েরি ও এআই কথোপকথন সাধারণ শেয়ারের বাইরে। নিয়ন্ত্রণ মায়ের হাতেই।"))}</p></div>
    </section>
  );
}

export function Closing() {
  const { t } = useHome();
  return (
    <section className="home-closing on-primary" aria-labelledby="closing-title"><div className="home-container home-closing-layout"><div><ProhorSymbol /><Eyebrow>{t(copy("Your Care. Your Way.", "আপনার যত্ন, আপনার মতো।"))}</Eyebrow><h2 id="closing-title">{t(copy("One care journey.", "যত্নের এক যাত্রা।"))}<br />{t(copy("Every mother’s way.", "প্রতিটি মায়ের নিজের পথে।"))}</h2></div><div><p>{t(copy("Connected care starts with putting the mother at the centre.", "সংযুক্ত যত্নের শুরু, মাকে কেন্দ্রে রেখে।"))}</p><a className="home-button home-button-inverse" href="#accessibility">{t(copy("Experience your way", "নিজের মতো ব্যবহার করে দেখুন"))}<ArrowUpRight size={20} aria-hidden="true" /></a></div></div></section>
  );
}
