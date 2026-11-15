"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Baby, BookOpen, CalendarDays, Check, ChevronRight, FileCheck2, FileText, Heart, HeartHandshake, LockKeyhole, MapPin, MessageCircle, Phone, Plus, Search, ShieldCheck, SlidersHorizontal, Sun, Upload, UserRound } from "lucide-react";
import { HomeBrand, ProhorSymbol } from "./HomeBrand";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export type ModuleName = "Adapt" | "Barta" | "Shonket" | "Jibonrekha" | "Bujhi" | "Shusthota" | "Poth" | "Bondhon";
export const WHO_SOURCE = "https://www.who.int/publications/i/item/9789241549912";
export const POLICE_SOURCE = "https://www.police.gov.bd/en/hot_line_number";
export const sampleQuestion = "আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?";

export function SampleTag() {
  return <span className="story-sample font-tag" lang="en">Sample data</span>;
}

export function PhoneFrame({ title, children, className = "", titleLang }: { title: string; children: ReactNode; className?: string; titleLang?: "en" | "bn" }) {
  const { t } = useHome();
  return <div className={`story-device ${className}`} role="group" aria-label={title}>
    <div className="story-device-label"><span lang={titleLang}>{title}</span><SampleTag /></div>
    <div className="story-phone">
      <div className="story-phone-hardware" aria-hidden="true"><span /></div>
      <div className="story-phone-top"><ProhorSymbol /><span lang="en">PROHOR</span><span className="story-phone-menu" aria-hidden="true"><i /><i /></span></div>
      <div className="story-phone-body" tabIndex={0} role="region" aria-label={t(copy(`${title} screen`, `${title} পর্দা`))}>{children}</div>
      <div className="story-phone-bottom" aria-hidden="true"><span /></div>
    </div>
  </div>;
}

export function SourceChip({ compact = false }: { compact?: boolean }) {
  return <a className="story-source" href={WHO_SOURCE} target="_blank" rel="noreferrer" lang="en"><BookOpen size={17} aria-hidden="true" /><span>{compact ? "WHO · Antenatal care" : "WHO · Antenatal care, 2016"}</span><ArrowUpRight size={16} aria-hidden="true" /><span className="home-sr-only">Opens in a new tab</span></a>;
}

function ScreenTitle({ icon, small, title }: { icon: ReactNode; small: string; title: string }) {
  return <div className="story-screen-title"><span className="story-screen-icon" aria-hidden="true">{icon}</span><p>{small}</p><h3 lang={/[\u0980-\u09ff]/.test(title) ? "bn" : undefined}>{title}</h3></div>;
}

export function MotherBabyTimeline({ compact = false }: { compact?: boolean }) {
  const { t } = useHome();
  return <div className={`story-care-timeline ${compact ? "story-timeline-compact" : ""}`}>
    <div className="story-timeline-entry"><span className="story-timeline-icon"><UserRound size={20} aria-hidden="true" /></span><div><span>{t(copy("Mother", "মা"))}</span><strong>{t(copy("Week 24 · Nila’s journey", "২৪তম সপ্তাহ · নীলার যাত্রা"))}</strong><p>{t(copy("Questions for the next visit", "পরের সাক্ষাতের প্রশ্ন"))}</p></div></div>
    <div className="story-timeline-entry"><span className="story-timeline-icon"><Baby size={20} aria-hidden="true" /></span><div><span>{t(copy("Baby", "শিশু"))}</span><strong>{t(copy("A story of their own", "তার নিজের গল্প"))}</strong><p>{t(copy("A separate record, from the start", "শুরু থেকেই আলাদা রেকর্ড"))}</p></div></div>
    {!compact && <div className="story-timeline-note"><Heart size={18} aria-hidden="true" />{t(copy("Two records. One connected journey.", "দুটি রেকর্ড। এক ধারাবাহিক যাত্রা।"))}</div>}
  </div>;
}

function AdaptScreen() {
  const { t, openPreferences } = useHome();
  return <><div className="story-type-art" aria-hidden="true"><span>Aa</span><span lang="bn">অ আ</span></div><ScreenTitle icon={<SlidersHorizontal size={24} />} small={t(copy("Adapt", "অ্যাডাপ্ট"))} title={t(copy("Make room for you.", "আপনার মতো করে নিন।"))} />
    <div className="story-settings-list">{[
      [copy("Language", "ভাষা"), copy("বাংলা + English", "বাংলা + English")],
      [copy("Text size", "লেখার আকার"), copy("Your choice", "আপনার পছন্দ")],
      [copy("Appearance", "চেহারা"), copy("Three themes", "তিনটি থিম")],
    ].map(([label, value]) => <div key={label.en}><span>{t(label)}</span><strong>{t(value)}</strong></div>)}</div><button className="home-button story-screen-action" onClick={openPreferences}>{t(copy("Adjust my view", "আমার পছন্দ বদলাই"))}<SlidersHorizontal size={18} aria-hidden="true" /></button></>;
}

function BartaScreen() {
  return <><ScreenTitle icon={<MessageCircle size={24} />} small="Barta · বার্তা" title="কথা হোক, আপনার ভাষায়।" />
    <div className="story-chat-bubble story-chat-question" lang="bn">আমার যত্নে আমার অভিজ্ঞতাও কি গুরুত্বপূর্ণ?</div>
    <div className="story-chat-bubble" lang="bn"><BookOpen size={21} aria-hidden="true" /><p>গর্ভকালীন যত্নে আপনার শারীরিক ও মানসিক সুস্থতা এবং আপনার অভিজ্ঞতাও গুরুত্বপূর্ণ।</p><SourceChip compact /></div>
    <a className="story-chat-compose" href={WHO_SOURCE} target="_blank" rel="noreferrer"><span lang="bn">উত্তরের সূত্রটি পড়ুন</span><ArrowUpRight size={20} aria-hidden="true" /><span className="home-sr-only" lang="en">Opens WHO in a new tab</span></a></>;
}

function ShonketScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<ShieldCheck size={26} />} small="Shonket · সংকেত" title={t(copy("Help has a direct path.", "সহায়তার সরাসরি পথ।"))} />
    <div className="story-help-art" aria-hidden="true"><span><HeartHandshake size={54} strokeWidth={1.4} /></span></div>
    <a className="home-button story-screen-action" href="tel:999"><Phone size={21} aria-hidden="true" />{t(copy("Emergency · call 999", "জরুরি সেবা · কল ৯৯৯"))}</a>
    <a className="story-screen-link" href={POLICE_SOURCE} target="_blank" rel="noreferrer">{t(copy("Bangladesh Police helpline directory", "বাংলাদেশ পুলিশের হেল্পলাইন তালিকা"))}<ArrowUpRight size={17} aria-hidden="true" /><span className="home-sr-only">Opens in a new tab</span></a>
    <div className="story-soft-row"><BookOpen size={20} aria-hidden="true" /><span>{t(copy("Reach people without asking AI first.", "এআইকে আগে জিজ্ঞেস না করেই মানুষের কাছে পৌঁছান।"))}</span></div></>;
}

function JibonrekhaScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<CalendarDays size={24} />} small="Jibonrekha · জীবনরেখা" title={t(copy("Your story stays together.", "যত্নের গল্প একসঙ্গে।"))} /><MotherBabyTimeline /><div className="story-document-row"><FileText size={26} aria-hidden="true" /><div><strong>{t(copy("Visit notes", "সাক্ষাতের নোট"))}</strong><span>{t(copy("Recorded by you", "আপনার লেখা"))}</span></div><ChevronRight size={20} aria-hidden="true" /></div></>;
}

function BujhiScreen() {
  const { t } = useHome();
  return <><ScreenTitle icon={<FileCheck2 size={24} />} small="Bujhi · বুঝি" title={t(copy("Read. Review. Understand.", "পড়ুন। যাচাই করুন। বুঝুন।"))} />
    <div className="story-upload-art"><Upload size={31} aria-hidden="true" /><strong>{t(copy("A report to understand", "বোঝার জন্য একটি রিপোর্ট"))}</strong><span lang="en">visit-report.pdf</span></div>
    <div className="story-extract-row"><span>{t(copy("Document type", "নথির ধরন"))}</span><strong>{t(copy("Visit report", "সাক্ষাতের রিপোর্ট"))}</strong></div>
    <div className="story-extract-row"><span>{t(copy("Record belongs to", "রেকর্ডটি যাঁর"))}</span><strong>{t(copy("Mother · review first", "মা · আগে যাচাই করুন"))}</strong></div>
    <ol className="story-mini-steps"><li><FileText size={18} aria-hidden="true" />{t(copy("Upload", "আপলোড"))}</li><li><Search size={18} aria-hidden="true" />{t(copy("Review", "যাচাই"))}</li><li><Check size={18} aria-hidden="true" />{t(copy("Confirm", "নিশ্চিত"))}</li></ol></>;
}

function ShusthotaScreen() {
  const { t } = useHome();
  const [mood, setMood] = useState("quiet");
  return <><ScreenTitle icon={<Sun size={25} />} small="Shusthota · সুস্থতা" title={t(copy("How are you, today?", "আজ আপনি কেমন আছেন?"))} />
    <fieldset className="story-mood-picker"><legend>{t(copy("A moment for yourself", "নিজের জন্য একটু সময়"))}</legend><div>{[
      ["quiet", copy("Quiet", "শান্ত"), Sun], ["tired", copy("Tired", "ক্লান্ত"), Heart], ["unsure", copy("Unsure", "অনিশ্চিত"), MessageCircle],
    ].map(([value, label, Icon]) => { const MoodIcon = Icon as typeof Sun; const moodLabel = label as ReturnType<typeof copy>; return <label key={value as string}><input type="radio" name="sample-mood" aria-label={t(moodLabel)} value={value as string} checked={mood === value} onChange={() => setMood(value as string)} /><MoodIcon size={26} aria-hidden="true" /><span>{t(moodLabel)}</span></label>; })}</div></fieldset>
    <div className="story-rest-note"><Heart size={27} aria-hidden="true" /><h4>{t(copy("A little room to rest.", "বিশ্রামের জন্য একটু জায়গা।"))}</h4><p>{t(copy("Your pace. No score to keep.", "আপনার গতি। কোনো স্কোরের চাপ নেই।"))}</p></div>
    <p className="story-screen-lock"><LockKeyhole size={18} aria-hidden="true" />{t(copy("Your diary is yours.", "আপনার ডায়েরি আপনারই।"))}</p></>;
}

function PothScreen() {
  const { t } = useHome();
  const [query, setQuery] = useState("");
  const facilities = [
    { name: "Dhaka Medical College Hospital", bn: "ঢাকা মেডিকেল কলেজ হাসপাতাল", place: "Shahbag, Dhaka", id: 31 },
    { name: "Sir Salimullah Medical College Mitford Hospital", bn: "স্যার সলিমুল্লাহ মেডিকেল কলেজ মিটফোর্ড হাসপাতাল", place: "Kotwali, Dhaka", id: 52 },
  ];
  const filtered = facilities.filter(item => `${item.name} ${item.bn} ${item.place}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <><ScreenTitle icon={<MapPin size={25} />} small="Poth · পথ" title={t(copy("A next step, closer.", "পরের ধাপের খোঁজ।"))} />
    <label className="story-search-label" htmlFor="sample-facility-search">{t(copy("Find a facility", "প্রতিষ্ঠান খুঁজুন"))}</label><div className="story-search-field"><Search size={19} aria-hidden="true" /><input id="sample-facility-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t(copy("Search these examples", "এই উদাহরণগুলো খুঁজুন"))} /></div>
    <div className="story-facility-list">{filtered.map(item => <a key={item.id} href={`https://hrm.dghs.gov.bd/public/facility-registry/facilities/${item.id}/profile`} target="_blank" rel="noreferrer"><span className="story-facility-icon"><MapPin size={22} aria-hidden="true" /></span><div><strong>{t(copy(item.name, item.bn))}</strong><span lang="en">{item.place}</span></div><ArrowUpRight size={17} aria-hidden="true" /><span className="home-sr-only">Opens DGHS in a new tab</span></a>)}</div>
    {!filtered.length && <p role="status">{t(copy("No match in these examples. Try Dhaka or Mitford.", "এই উদাহরণগুলোর মধ্যে পাওয়া যায়নি। ঢাকা বা মিটফোর্ড লিখুন।"))}</p>}
    <p className="story-screen-lock"><BookOpen size={18} aria-hidden="true" />{t(copy("Source: DGHS facility registry", "সূত্র: স্বাস্থ্য অধিদপ্তরের তালিকা"))}</p></>;
}

function ConsentToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="story-consent-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={onChange} /><span className="story-toggle-track" aria-hidden="true"><span /></span></label>;
}

export function ConsentScreen({ compact = false }: { compact?: boolean }) {
  const { t } = useHome();
  const [visits, setVisits] = useState(true);
  const [reports, setReports] = useState(false);
  return <div className={compact ? "story-consent-compact" : ""}>{!compact && <ScreenTitle icon={<HeartHandshake size={25} />} small="Bondhon · বন্ধন" title={t(copy("You choose what connects.", "সংযোগের সিদ্ধান্ত আপনার।"))} />}
    <div className="story-recipient"><span className="story-avatar"><UserRound size={26} aria-hidden="true" /></span><div><span>{t(copy("Chosen recipient", "আপনার বাছাই করা প্রাপক"))}</span><strong>{t(copy("My care supporter", "আমার যত্নের সহায়ক"))}</strong></div></div>
    <ConsentToggle label={t(copy("Visit questions", "সাক্ষাতের প্রশ্ন"))} checked={visits} onChange={() => setVisits(!visits)} />
    <ConsentToggle label={t(copy("Selected reports", "বাছাই করা রিপোর্ট"))} checked={reports} onChange={() => setReports(!reports)} />
    <div className="story-private-row"><LockKeyhole size={19} aria-hidden="true" /><span>{t(copy("Diary & AI conversations", "ডায়েরি ও এআই কথোপকথন"))}</span><span>{t(copy("Private", "ব্যক্তিগত"))}</span></div>
    <div className="story-consent-summary"><ShieldCheck size={22} aria-hidden="true" /><span>{t(copy("Your review comes before sharing.", "তথ্য দেওয়ার আগে আপনার পর্যালোচনা।"))}</span></div>
  </div>;
}

export function ModuleScreen({ name }: { name: ModuleName }) {
  const screens: Record<ModuleName, ReactNode> = { Adapt: <AdaptScreen />, Barta: <BartaScreen />, Shonket: <ShonketScreen />, Jibonrekha: <JibonrekhaScreen />, Bujhi: <BujhiScreen />, Shusthota: <ShusthotaScreen />, Poth: <PothScreen />, Bondhon: <ConsentScreen /> };
  return <PhoneFrame title={name} titleLang="en">{screens[name]}</PhoneFrame>;
}

export function SharedVisitPhones() {
  const { t, locale, openPreferences } = useHome();
  const [question, setQuestion] = useState(sampleQuestion);
  const [gloss, setGloss] = useState("How can I prepare for my next visit?");
  const [reviewed, setReviewed] = useState(false);
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
    <textarea id={`visit-question-${id}`} lang={/[\u0980-\u09ff]/.test(question) ? "bn" : locale} value={question} rows={3} onChange={event => change(event.target.value)} />
    {gloss && <p className="story-question-gloss" lang="en">{gloss}</p>}
    <button className="home-button story-screen-action" onClick={() => setReviewed(true)}>{t(copy("Review my question", "আমার প্রশ্ন দেখুন"))}<ArrowRight size={19} aria-hidden="true" /></button>
    <p className="story-screen-lock"><LockKeyhole size={17} aria-hidden="true" />{t(copy("Your words. Your choice.", "আপনার কথা। আপনার পছন্দ।"))}</p>
    {reviewed && <div className="story-question-review"><Check size={19} aria-hidden="true" /><p lang={/[\u0980-\u09ff]/.test(question) ? "bn" : locale}>{question.trim() || t(copy("Write a question to review it here.", "এখানে দেখতে একটি প্রশ্ন লিখুন।"))}</p></div>}
  </PhoneFrame>)}</div>
  <div className="story-adapt-bottom"><p>{t(copy("Change the presentation. Keep your words, your choices and your place.", "উপস্থাপনা বদলান। আপনার কথা, পছন্দ ও অবস্থান থাকুক একই।"))}</p><button onClick={openPreferences} aria-haspopup="dialog"><SlidersHorizontal size={20} aria-hidden="true" />{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}<ArrowUpRight size={20} aria-hidden="true" /></button></div>
  <p className="home-sr-only" role="status">{reviewed ? t(copy(question.trim() ? "Your question is shown in all three samples. Nothing was sent." : "Write a question to review it here.", question.trim() ? "আপনার প্রশ্ন তিনটি নমুনাতেই দেখা যাচ্ছে। কিছু পাঠানো হয়নি।" : "এখানে দেখতে একটি প্রশ্ন লিখুন।")) : ""}</p></>;
}

export function MotherWindow() {
  const { t } = useHome();
  return <div className="story-browser"><div className="story-browser-bar"><span aria-hidden="true">● ● ●</span><span lang="en">PROHOR / My care</span><SampleTag /></div><div className="story-mother-window"><HomeBrand /><h3 lang="bn">আজ একটু নিজের খোঁজ নিন।</h3><p>{t(copy("Your care, in one place.", "আপনার যত্ন, এক জায়গায়।"))}</p><div className="story-window-tasks">{[
    { href: "#module-jibonrekha", icon: CalendarDays, label: copy("My care story", "আমার যত্নের গল্প") }, { href: "#module-barta", icon: MessageCircle, label: copy("My questions", "আমার প্রশ্ন") }, { href: "#module-adapt", icon: SlidersHorizontal, label: copy("My preferences", "আমার পছন্দ") },
  ].map(({ href, icon: Icon, label }) => <a key={href} href={href}><Icon size={23} aria-hidden="true" /><span>{t(label)}</span><ChevronRight size={19} aria-hidden="true" /></a>)}</div><div className="story-window-note"><Heart size={26} aria-hidden="true" /><span>{t(copy("Motherhood is part of your story. You are at the centre.", "মাতৃত্ব আপনার গল্পের অংশ। কেন্দ্রে আছেন আপনি।"))}</span></div></div></div>;
}

export function ProviderWindow() {
  const { t } = useHome();
  return <div className="story-browser"><div className="story-browser-bar"><span aria-hidden="true">● ● ●</span><span lang="en">PROHOR / Care workspace</span><SampleTag /></div><div className="story-provider-window"><div className="story-provider-title"><span className="story-avatar"><HeartHandshake size={27} aria-hidden="true" /></span><div><span>{t(copy("Mother-led context", "মায়ের বাছাই করা তথ্য"))}</span><h3>{t(copy("Prepare to listen.", "শোনার প্রস্তুতি নিন।"))}</h3></div></div><div className="story-provider-tabs"><span>{t(copy("Questions", "প্রশ্ন"))}</span><span>{t(copy("Chosen records", "বাছাই করা রেকর্ড"))}</span><span>{t(copy("Permissions", "অনুমতি"))}</span></div><div className="story-provider-question"><MessageCircle size={25} aria-hidden="true" /><div><strong>{t(copy("Nila’s visit question", "নীলার সাক্ষাতের প্রশ্ন"))}</strong><p lang="bn">{sampleQuestion}</p></div></div><ul className="story-provider-checklist"><li><FileText size={21} aria-hidden="true" />{t(copy("Context from selected records", "বাছাই করা রেকর্ডের তথ্য"))}</li><li><BookOpen size={21} aria-hidden="true" />{t(copy("Visible source for each note", "প্রতিটি নোটের দৃশ্যমান সূত্র"))}</li><li><LockKeyhole size={21} aria-hidden="true" />{t(copy("Access defined by the mother", "মায়ের নির্ধারিত প্রবেশাধিকার"))}</li></ul></div></div>;
}
