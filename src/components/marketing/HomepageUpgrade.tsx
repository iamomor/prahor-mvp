"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, FileCheck2, Heart, HeartHandshake, LockKeyhole, MapPin, MessageCircle, MonitorSmartphone, ShieldCheck, SlidersHorizontal, Sun } from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";
import { ModuleScreen, MotherWindow, ProviderWindow, type ModuleName } from "./ProductScreens";

const MATERNAL_SOURCE = "https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef";
const BMMS_SOURCE = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/";

export function ProductStrip() {
  const { t } = useHome();
  const items = [
    { value: "8", label: copy("connected modules", "সংযুক্ত মডিউল"), caption: copy("Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, Bondhon", "অ্যাডাপ্ট, বার্তা, সংকেত, জীবনরেখা, বুঝি, সুস্থতা, পথ, বন্ধন") },
    { value: "24", label: copy("planned capabilities", "পরিকল্পিত সুবিধা"), caption: copy("One roadmap, honest status on each", "এক পরিকল্পনায় প্রতিটির স্পষ্ট অবস্থান"), href: "#roadmap" },
    { value: "0", label: copy("disability categories to choose", "বেছে নেওয়ার অক্ষমতার শ্রেণি"), caption: copy("Same care for every mother; preferences, not labels", "প্রতিটি মায়ের জন্য একই যত্ন; পরিচয়ের শ্রেণি নয়, নিজের পছন্দ") },
    { value: "2", label: copy("records, 1 journey", "রেকর্ড, ১ যাত্রা"), caption: copy("Mother and baby records stay separate on one timeline", "এক সময়রেখায় মা ও শিশুর রেকর্ড থাকে আলাদা") },
  ];
  return <section className="upgrade-product-strip story-section" aria-label={t(copy("The PROHOR product at a glance", "এক নজরে প্রহর"))}><div className="home-container upgrade-product-grid">{items.map(item => <div key={item.value}><strong className="upgrade-product-number" lang="en">{item.value}</strong><h2>{t(item.label)}</h2>{item.href ? <a href={item.href}>{t(item.caption)}<ArrowUpRight size={16} aria-hidden="true" /></a> : <p>{t(item.caption)}</p>}</div>)}</div></section>;
}

export function MaternalFacts() {
  const { t } = useHome();
  return <div className="upgrade-maternal-facts"><p>{t(copy("About 4,000 maternal deaths in Bangladesh in 2023; the maternal mortality ratio was 79% lower than in 2000.", "২০২৩ সালে বাংলাদেশে আনুমানিক ৪,০০০ মাতৃমৃত্যু; ২০০০ সালের তুলনায় মাতৃমৃত্যুর অনুপাত ৭৯% কম।"))} <a href={MATERNAL_SOURCE} target="_blank" rel="noreferrer">{t(copy("UN estimates · WHO, UNICEF, UNFPA · 2025", "জাতিসংঘের হিসাব · বিশ্ব স্বাস্থ্য সংস্থা, ইউনিসেফ, ইউএনএফপিএ · ২০২৫"))}<span className="home-sr-only"> (opens in a new tab)</span></a></p><p>{t(copy("1 in 3 women who died of maternal causes had sought care at three or more places.", "মাতৃমৃত্যুর শিকার প্রতি ৩ জন নারীর ১ জন তিন বা তার বেশি স্থানে সেবা চেয়েছিলেন।"))} <a href={BMMS_SOURCE} target="_blank" rel="noreferrer" lang="en">BMMS 2016 · Journal of Global Health, 2023<span className="home-sr-only"> (opens in a new tab)</span></a></p></div>;
}

export { CompanionStory, SupportStory } from "./HomepageCare";

const moduleTiles: { name: ModuleName; bn: string; icon: typeof Heart }[] = [
  { name: "Adapt", bn: "অ্যাডাপ্ট", icon: SlidersHorizontal }, { name: "Barta", bn: "বার্তা", icon: MessageCircle },
  { name: "Shonket", bn: "সংকেত", icon: ShieldCheck }, { name: "Jibonrekha", bn: "জীবনরেখা", icon: CalendarDays },
  { name: "Bujhi", bn: "বুঝি", icon: FileCheck2 }, { name: "Shusthota", bn: "সুস্থতা", icon: Sun },
  { name: "Poth", bn: "পথ", icon: MapPin }, { name: "Bondhon", bn: "বন্ধন", icon: HeartHandshake },
];

export function JourneyStory() {
  const { t } = useHome();
  const phones: { name: ModuleName; caption: string; bn: string }[] = [
    { name: "Jibonrekha", caption: "Two stories, held together.", bn: "দুটি গল্প, একসঙ্গে।" }, { name: "Bujhi", caption: "A little more understanding.", bn: "আরও একটু বোঝাপড়া।" },
    { name: "Shusthota", caption: "Room for the person, too.", bn: "মানুষটির জন্যও জায়গা।" }, { name: "Poth", caption: "A clearer way forward.", bn: "সামনের পথ আরও পরিষ্কার।" },
  ];
  return <section id="features" tabIndex={-1} className="upgrade-journey story-section" aria-labelledby="journey-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("Eight modules, one shared foundation", "আট মডিউল, একই ভিত্তি"))}</SectionEyebrow><h2 id="journey-title">{t(copy("One app for ", "এক অ্যাপ, "))}<em>{t(copy("the whole journey.", "পুরো যাত্রার জন্য।"))}</em></h2></div><p>{t(copy("From a first question to the chapters after birth. Your preferences and permissions stay part of the same experience.", "প্রথম প্রশ্ন থেকে জন্মের পরের অধ্যায়। আপনার পছন্দ ও অনুমতি থাকুক একই অভিজ্ঞতার অংশ।"))}</p></div><div className="upgrade-browser-banner"><MonitorSmartphone size={35} aria-hidden="true" /><div><strong>{t(copy("One web app. Works in your browser on any phone.", "একটি ওয়েব অ্যাপ। ফোনের ব্রাউজারেই ব্যবহার করুন।"))}</strong><p>{t(copy("Add to your home screen from your browser’s menu.", "ব্রাউজারের মেনু থেকে হোম স্ক্রিনে যোগ করুন।"))}</p></div><ArrowUpRight size={25} aria-hidden="true" /></div><nav className="upgrade-module-grid" aria-label={t(copy("The eight PROHOR modules", "প্রহরের আটটি মডিউল"))}>{moduleTiles.map(({ name, bn, icon: Icon }) => <a key={name} href={`#module-${name.toLowerCase()}`}><span className="story-screen-icon"><Icon size={25} aria-hidden="true" /></span><span><strong lang="en">{name}</strong><span lang="bn">{bn}</span></span><ArrowUpRight size={17} aria-hidden="true" /></a>)}</nav><div className="upgrade-provider-pills" aria-label={t(copy("Provider workspace concepts", "সেবাদাতার কর্মক্ষেত্রের ধারণা"))}>{[copy("Request queue", "অনুরোধের তালিকা"), copy("Consented records", "সম্মতিসহ রেকর্ড"), copy("Preferred contact", "পছন্দের যোগাযোগ"), copy("Audit trail", "কার্যকলাপের ইতিহাস")].map(text => <span key={text.en}><Check size={17} aria-hidden="true" />{t(text)}</span>)}</div><div className="upgrade-showcase-phones" role="region" aria-labelledby="journey-title" tabIndex={0}>{phones.map(({ name, caption, bn }) => <article key={name} id={`module-${name.toLowerCase()}`} tabIndex={-1}><ModuleScreen name={name} /><p className="upgrade-phone-caption" lang="en"><em>{caption}</em></p><p className="upgrade-phone-bangla" lang="bn">{bn}</p></article>)}</div></div></section>;
}


export function TeamStory({ images }: { images: Record<string, boolean> }) {
  const { t } = useHome();
  const people = [
    { name: "Omor", role: copy("Project lead and platform", "প্রকল্প পরিচালনা ও প্ল্যাটফর্ম") }, { name: "Iftee", role: copy("Inclusive UI and accessibility", "সবার জন্য ইউআই ও প্রবেশগম্যতা") },
    { name: "Ifty", role: copy("AI and retrieval", "এআই ও তথ্য অনুসন্ধান") }, { name: "Apubo", role: copy("Mother and baby records", "মা ও শিশুর রেকর্ড") },
    { name: "Samin", role: copy("Wellness and care navigation", "ভালো থাকা ও সেবার পথনির্দেশ") },
  ];
  return <section className="upgrade-team story-section" aria-labelledby="team-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("The people behind PROHOR", "প্রহরের পেছনের মানুষ"))}</SectionEyebrow><h2 id="team-title">{t(copy("Built with care. ", "যত্ন নিয়ে গড়া। "))}<em>{t(copy("By people who care.", "যত্নশীল মানুষের হাতে।"))}</em></h2></div><p>{t(copy("A shared effort across inclusive design, technology and the everyday details of maternal care.", "সবার জন্য নকশা, প্রযুক্তি ও মাতৃযত্নের দৈনন্দিন খুঁটিনাটি নিয়ে একটি সম্মিলিত প্রচেষ্টা।"))}</p></div><div className="upgrade-team-grid">{people.map(({ name, role }) => <article key={name}><div className="upgrade-team-avatar">{images[name.toLowerCase()] ? <Image src={`/team/${name.toLowerCase()}.jpg`} alt={name} fill sizes="(min-width: 1024px) 180px, 40vw" /> : <span aria-hidden="true" lang="en">{name[0]}</span>}</div><h3 lang="en">{name}</h3><p>{t(role)}</p></article>)}</div></div></section>;
}

export function FinalCTA() {
  const { t, openPreferences } = useHome();
  return <section className="upgrade-final story-section" aria-labelledby="final-title"><div className="home-container"><div className="upgrade-final-card"><div className="upgrade-final-circles" aria-hidden="true"><span /><span /></div><div><SectionEyebrow>{t(copy("Your care. Your way.", "আপনার যত্ন। আপনার মতো।"))}</SectionEyebrow><h2 id="final-title">{t(copy("One care journey. ", "এক যত্নের যাত্রা। "))}<em>{t(copy("Every mother’s way.", "প্রতিটি মায়ের মতো।"))}</em></h2><p>{t(copy("A more connected future starts by making room for every mother.", "আরও সংযুক্ত ভবিষ্যতের শুরু প্রতিটি মায়ের জন্য জায়গা করে দিয়ে।"))}</p><div className="story-actions"><button className="home-button" onClick={openPreferences} aria-haspopup="dialog">{t(copy("Make PROHOR yours", "প্রহরকে আপনার মতো করুন"))}<ArrowUpRight size={21} aria-hidden="true" /></button><a className="home-button home-button-secondary" href="#features">{t(copy("Explore the journey", "যাত্রাটি ঘুরে দেখুন"))}<ArrowRight size={21} aria-hidden="true" /></a></div><p className="upgrade-final-disclaimer">{t(copy("An educational product prototype; clinical services and provider delivery are not connected.", "শিক্ষামূলক পণ্যের প্রোটোটাইপ; চিকিৎসাসেবা ও সেবাদাতার কাছে তথ্য পাঠানোর সংযোগ নেই।"))}</p></div></div></div></section>;
}

export function AudiencePanels() {
  const { t } = useHome();
  const audiences = [
    { id: "mothers", label: copy("For mothers", "মায়েদের জন্য"), title: copy("A little more understood.", "আরও একটু বোঝাপড়া।"), body: copy("Your questions, records and preferences, with you at the centre.", "আপনার প্রশ্ন, রেকর্ড ও পছন্দের কেন্দ্রে থাকুন আপনি।"), points: [copy("Explore in Bangla or English", "বাংলা বা ইংরেজিতে ঘুরে দেখুন"), copy("Keep mother and baby records distinct", "মা ও শিশুর রেকর্ড আলাদা রাখুন"), copy("Choose the people you bring in", "কাকে যুক্ত করবেন, নিজে বেছে নিন")], href: "#your-way", cta: copy("Explore your experience", "আপনার অভিজ্ঞতা দেখুন"), window: <MotherWindow /> },
    { id: "providers", label: copy("For care providers", "সেবাদাতাদের জন্য"), title: copy("A little more context.", "আরও একটু প্রাসঙ্গিক তথ্য।"), body: copy("The story a mother chooses to share, with its source and her permission.", "মায়ের বাছাই করা গল্প, তার সূত্র ও তাঁর অনুমতি।"), points: [copy("See the question in her own words", "তাঁর নিজের ভাষায় প্রশ্নটি দেখুন"), copy("Keep source and permission together", "সূত্র ও অনুমতি একসঙ্গে রাখুন"), copy("Prepare for a human conversation", "মানুষের সঙ্গে কথোপকথনের প্রস্তুতি নিন")], href: "#module-bondhon", cta: copy("Explore the care connection", "যত্নের সংযোগ দেখুন"), window: <ProviderWindow /> },
  ];
  return <section className="upgrade-audiences story-section" id="for-you" aria-labelledby="audiences-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("Two windows, the same care story", "দুটি জানালা, একই যত্নের গল্প"))}</SectionEyebrow><h2 id="audiences-title">{t(copy("For the mother. ", "মায়ের জন্য। "))}<em>{t(copy("For the people beside her.", "তাঁর পাশে থাকা মানুষের জন্য।"))}</em></h2></div><p>{t(copy("One shared foundation, with a different view for the person asking and the people preparing to support her.", "একই ভিত্তিতে প্রশ্ন করা মানুষ ও তাঁর সহায়তার প্রস্তুতি নেওয়া মানুষের জন্য আলাদা উপস্থাপনা।"))}</p></div><div className="upgrade-audience-panels">{audiences.map(({ id, label, title, body, points, href, cta, window }) => <article className={`upgrade-audience-${id}`} key={id}><span className="upgrade-audience-pill">{t(label)}</span><h3>{t(title)}</h3><p>{t(body)}</p><ul>{points.map(point => <li key={point.en}><Check size={19} aria-hidden="true" />{t(point)}</li>)}</ul>{window}<a className="home-button" href={href}>{t(cta)}<ArrowUpRight size={20} aria-hidden="true" /></a></article>)}</div></div></section>;
}

export function ResponsibleCards() {
  const { t } = useHome();
  const cards = [
    { icon: BookOpen, title: copy("Evidence you can open.", "খুলে পড়ার মতো প্রমাণ।"), body: copy("Keep sources beside explanations. Say when the information does not cover the question.", "ব্যাখ্যার পাশে সূত্র থাকুক। উত্তর দেওয়ার মতো তথ্য না থাকলে সেটিও স্পষ্ট হোক।") },
    { icon: HeartHandshake, title: copy("People keep the judgment.", "বিচারবোধ থাকুক মানুষের।"), body: copy("AI helps explain information. Clinical decisions and real care belong with qualified people.", "এআই তথ্য বুঝতে সাহায্য করে। চিকিৎসার সিদ্ধান্ত ও প্রকৃত যত্ন যোগ্য মানুষের কাজ।") },
    { icon: LockKeyhole, title: copy("Permission stays with you.", "অনুমতি থাকুক আপনারই।"), body: copy("Choose the person, purpose and records. Diary and AI conversations stay outside default sharing.", "প্রাপক, উদ্দেশ্য ও রেকর্ড বেছে নিন। ডায়েরি ও এআই কথোপকথন স্বাভাবিকভাবে শেয়ার হবে না।") },
  ];
  return <section id="responsible-ai" tabIndex={-1} className="upgrade-responsible story-section" aria-labelledby="responsible-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("Thoughtful technology", "বিবেচনাপূর্ণ প্রযুক্তি"))}</SectionEyebrow><h2 id="responsible-title">{t(copy("AI helps explain. ", "এআই বুঝতে সাহায্য করে। "))}<em>{t(copy("People provide care.", "মানুষই যত্ন দেন।"))}</em></h2></div><p>{t(copy("Useful technology starts with clear boundaries. Keep evidence, human oversight and your permission in the picture.", "উপকারী প্রযুক্তির শুরু স্পষ্ট সীমায়। সঙ্গে থাকুক প্রমাণ, মানুষের তত্ত্বাবধান ও আপনার অনুমতি।"))}</p></div><div className="upgrade-responsible-cards">{cards.map(({ icon: Icon, title, body }) => <article key={title.en}><span className="story-screen-icon"><Icon size={31} aria-hidden="true" /></span><h3>{t(title)}</h3><p>{t(body)}</p><div className="upgrade-principle-chips">{[copy("Evidence", "প্রমাণ"), copy("Human review", "মানুষের পর্যালোচনা"), copy("No diagnosis", "রোগ নির্ণয় নয়")].map(text => <span key={text.en}>{t(text)}</span>)}</div></article>)}</div></div></section>;
}
