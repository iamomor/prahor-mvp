"use client";

import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, FileCheck2, Heart, HeartHandshake, LockKeyhole, MapPin, MessageCircle, MonitorSmartphone, ShieldCheck, SlidersHorizontal, Sun } from "lucide-react";
import { InclusiveJourney } from "./InclusiveJourney";
import { SectionEyebrow } from "./SectionEyebrow";
import { TeamCarousel } from "./TeamCarousel";
import { useHome } from "./HomeContext";
import { copy, type Copy } from "./home-content";
import { ModuleScreen, MotherWindow, ProviderWindow, type ModuleName } from "./ProductScreens";

const MATERNAL_SOURCE = "https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef";
const BMMS_SOURCE = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/";
const NSPD_SOURCE = "https://www.tbsnews.net/bangladesh/28-total-population-have-disabilities-bbs-558590";
const UN_WOMEN_SOURCE = "https://www.unwomen.org/en/news/stories/2015/12/empowering-and-including-women-and-girls-with-disabilities";
const WHO_DISABILITY_SOURCE = "https://www.who.int/news/item/02-12-2022-health-inequities-lead-to-early-death-in-many-persons-with-disabilities";

type Stat = { value: Copy; label: Copy; source: string; href: string };
const statGroups: { id: string; title: Copy; stats: Stat[] }[] = [
  { id: "every", title: copy("Every mother in Bangladesh", "বাংলাদেশের প্রতিটি মা"), stats: [
    { value: copy("≈4,000", "≈৪,০০০"), label: copy("mothers died from pregnancy or childbirth causes in 2023", "মা ২০২৩ সালে গর্ভধারণ বা প্রসবজনিত কারণে মারা গেছেন"), source: "WHO · UNICEF · UNFPA · 2025", href: MATERNAL_SOURCE },
    { value: copy("1 in 3", "৩ জনে ১"), label: copy("women who died of maternal causes had sought care at three or more places", "মাতৃমৃত্যুর শিকার নারী তিন বা তার বেশি জায়গায় সেবা চেয়েছিলেন"), source: "BMMS 2016 · J Glob Health 2023", href: BMMS_SOURCE },
  ] },
  { id: "disability", title: copy("Mothers with disabilities", "প্রতিবন্ধিতা আছে এমন মা"), stats: [
    { value: copy("19.3 lakh", "১৯.৩ লাখ"), label: copy("women and girls in Bangladesh live with a disability", "নারী ও কিশোরী বাংলাদেশে প্রতিবন্ধিতা নিয়ে বাস করেন"), source: "BBS · NSPD 2021", href: NSPD_SOURCE },
    { value: copy("1 in 5", "৫ জনে ১"), label: copy("women worldwide live with a disability", "নারী বিশ্বজুড়ে প্রতিবন্ধিতা নিয়ে বাস করেন"), source: "UN Women · WHO", href: UN_WOMEN_SOURCE },
  ] },
];

function SourceLink({ href, children }: { href: string; children: string }) {
  return <a className="impact-source font-tag" href={href} target="_blank" rel="noreferrer" lang="en">{children}<ArrowUpRight size={14} aria-hidden="true" /><span className="home-sr-only"> (opens in a new tab)</span></a>;
}

export function ProductStrip() {
  const { t } = useHome();
  return <section className="impact-stats story-section" aria-labelledby="impact-title"><div className="home-container">
    <div className="impact-heading"><div><SectionEyebrow>{t(copy("Why this matters", "কেন এটি জরুরি"))}</SectionEyebrow><h2 id="impact-title">{t(copy("Every mother counts. ", "প্রতিটি মা গুরুত্বপূর্ণ। "))}<em>{t(copy("Including the ones care often misses.", "যাঁরা প্রায়ই যত্নের বাইরে থেকে যান, তাঁরাও।"))}</em></h2></div><p>{t(copy("PROHOR is built for mothers with disabilities and mothers without. One platform, the same care, no separate version.", "প্রহর তৈরি প্রতিবন্ধিতা আছে এবং নেই—দুই ধরনের মায়ের জন্যই। এক প্ল্যাটফর্ম, একই যত্ন, আলাদা কোনো সংস্করণ নেই।"))}</p></div>
    <div className="impact-groups">{statGroups.map(group => <article key={group.id} className={`impact-group impact-group-${group.id}`} aria-labelledby={`impact-${group.id}`}><h3 id={`impact-${group.id}`} className="font-tag">{t(group.title)}</h3><ul>{group.stats.map(stat => <li key={stat.source}><p className="impact-number">{t(stat.value)}</p><p className="impact-label">{t(stat.label)}</p><SourceLink href={stat.href}>{stat.source}</SourceLink></li>)}</ul></article>)}</div>
    <p className="impact-bridge"><HeartHandshake size={22} aria-hidden="true" /><span>{t(copy("One platform for both: no disability form, no separate sign-up, the same right to care.", "দুজনের জন্য এক প্ল্যাটফর্ম: প্রতিবন্ধিতার ফর্ম নেই, আলাদা নিবন্ধন নেই, যত্নের অধিকার একই।"))}</span></p>
  </div></section>;
}

export function MaternalFacts() {
  const { t } = useHome();
  return <div className="upgrade-maternal-facts"><p>{t(copy("Bangladesh cut its maternal mortality ratio by 79% since 2000, to 115 deaths per 100,000 live births in 2023.", "২০০০ সালের পর বাংলাদেশে মাতৃমৃত্যুর অনুপাত ৭৯% কমে ২০২৩ সালে প্রতি লাখ জীবিত জন্মে ১১৫-এ নেমেছে।"))} <SourceLink href={MATERNAL_SOURCE}>WHO · UNICEF · UNFPA · 2025</SourceLink></p><p>{t(copy("Persons with disabilities can die up to 20 years earlier, largely because of avoidable health inequities.", "প্রতিবন্ধী ব্যক্তিরা ২০ বছর পর্যন্ত আগে মারা যেতে পারেন, মূলত এড়ানো যায় এমন স্বাস্থ্যবৈষম্যের কারণে।"))} <SourceLink href={WHO_DISABILITY_SOURCE}>WHO · 2022</SourceLink></p></div>;
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
  return <section id="features" tabIndex={-1} className="upgrade-journey story-section" aria-labelledby="journey-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("Eight modules, one shared foundation", "আট মডিউল, একই ভিত্তি"))}</SectionEyebrow><h2 id="journey-title">{t(copy("One app for ", "এক অ্যাপ, "))}<em>{t(copy("the whole journey.", "পুরো যাত্রার জন্য।"))}</em></h2></div><p>{t(copy("From a first question to the chapters after birth. Your preferences and permissions stay part of the same experience.", "প্রথম প্রশ্ন থেকে জন্মের পরের অধ্যায়। আপনার পছন্দ ও অনুমতি থাকুক একই অভিজ্ঞতার অংশ।"))}</p></div><div className="upgrade-browser-banner"><MonitorSmartphone size={35} aria-hidden="true" /><div><strong>{t(copy("One web app. Works in your browser on any phone.", "একটি ওয়েব অ্যাপ। ফোনের ব্রাউজারেই ব্যবহার করুন।"))}</strong><p>{t(copy("Add to your home screen from your browser’s menu.", "ব্রাউজারের মেনু থেকে হোম স্ক্রিনে যোগ করুন।"))}</p></div><ArrowUpRight size={25} aria-hidden="true" /></div><nav className="upgrade-module-grid" aria-label={t(copy("The eight PROHOR modules", "প্রহরের আটটি মডিউল"))}>{moduleTiles.map(({ name, bn, icon: Icon }) => <a key={name} href={name === "Poth" ? "/poth" : `#module-${name.toLowerCase()}`}><span className="story-screen-icon"><Icon size={25} aria-hidden="true" /></span><span><strong lang="en">{name}</strong><span lang="bn">{bn}</span></span><ArrowUpRight size={17} aria-hidden="true" /></a>)}</nav><div className="upgrade-provider-pills" aria-label={t(copy("Provider workspace concepts", "সেবাদাতার কর্মক্ষেত্রের ধারণা"))}>{[copy("Request queue", "অনুরোধের তালিকা"), copy("Consented records", "সম্মতিসহ রেকর্ড"), copy("Preferred contact", "পছন্দের যোগাযোগ"), copy("Audit trail", "কার্যকলাপের ইতিহাস")].map(text => <span key={text.en}><Check size={17} aria-hidden="true" />{t(text)}</span>)}</div><div className="upgrade-showcase-phones" role="region" aria-labelledby="journey-title" tabIndex={0}>{phones.map(({ name, caption, bn }) => <article key={name} id={`module-${name.toLowerCase()}`} tabIndex={-1}><ModuleScreen name={name} /><p className="upgrade-phone-caption" lang="en"><em>{caption}</em></p><p className="upgrade-phone-bangla" lang="bn">{bn}</p></article>)}</div></div></section>;
}


export function TeamStory() {
  const { t } = useHome();
  return <section className="upgrade-team story-section" aria-labelledby="team-title"><div className="home-container"><div className="story-section-heading"><div><SectionEyebrow>{t(copy("The people behind PROHOR", "প্রহরের পেছনের মানুষ"))}</SectionEyebrow><h2 id="team-title">{t(copy("Built with care. ", "যত্ন নিয়ে গড়া। "))}<em>{t(copy("By people who care.", "যত্নশীল মানুষের হাতে।"))}</em></h2></div><p>{t(copy("Engineers, a designer and a clinician, building inclusive tools for pregnancy, birth and early motherhood in Bangladesh.", "প্রকৌশলী, ডিজাইনার ও একজন চিকিৎসক—বাংলাদেশে গর্ভকাল, প্রসব ও মাতৃত্বের শুরুর জন্য সবার উপযোগী টুল তৈরি করছেন।"))}</p></div><TeamCarousel /></div></section>;
}

export function FinalCTA() {
  const { t, openPreferences } = useHome();
  return <section className="upgrade-final story-section" aria-labelledby="final-title"><div className="home-container"><div className="upgrade-final-card"><InclusiveJourney /><div><SectionEyebrow>{t(copy("Your care. Your way.", "আপনার যত্ন। আপনার মতো।"))}</SectionEyebrow><h2 id="final-title">{t(copy("One care journey. ", "এক যত্নের যাত্রা। "))}<em>{t(copy("Every mother’s way.", "প্রতিটি মায়ের মতো।"))}</em></h2><p>{t(copy("A more connected future starts by making room for every mother.", "আরও সংযুক্ত ভবিষ্যতের শুরু প্রতিটি মায়ের জন্য জায়গা করে দিয়ে।"))}</p><div className="story-actions"><button className="home-button" onClick={openPreferences} aria-haspopup="dialog">{t(copy("Make PROHOR yours", "প্রহরকে আপনার মতো করুন"))}<ArrowUpRight size={21} aria-hidden="true" /></button><a className="home-button home-button-secondary" href="#features">{t(copy("Explore the journey", "যাত্রাটি ঘুরে দেখুন"))}<ArrowRight size={21} aria-hidden="true" /></a></div><p className="upgrade-final-disclaimer">{t(copy("An educational product prototype; clinical services and provider delivery are not connected.", "শিক্ষামূলক পণ্যের প্রোটোটাইপ; চিকিৎসাসেবা ও সেবাদাতার কাছে তথ্য পাঠানোর সংযোগ নেই।"))}</p></div></div></div></section>;
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
