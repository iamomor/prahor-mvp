"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { BookOpen, CalendarDays, Check, CircleDashed, Clock3, FileCheck2, HeartHandshake, Layers3, MapPin, MessageCircle, MonitorPlay, ShieldCheck, SlidersHorizontal, Sun, type LucideIcon } from "lucide-react";
import { capabilityGroups, copy, statusLabels, type Copy } from "./home-content";
import { useHome } from "./HomeContext";
import { SectionEyebrow } from "./SectionEyebrow";
import { preferredModuleIndex } from "./roadmap-selection";

type Status = keyof typeof statusLabels;
type Filter = Status | "All";
const statuses: Status[] = ["Working", "Limited", "Simulated", "Future"];
const statusIcons: Record<Filter, LucideIcon> = { All: Layers3, Working: Check, Limited: CircleDashed, Simulated: MonitorPlay, Future: Clock3 };
const moduleIcons: LucideIcon[] = [SlidersHorizontal, MessageCircle, ShieldCheck, CalendarDays, FileCheck2, Sun, MapPin, HeartHandshake];
const featureNotes: Record<number, Copy> = {
  1: copy("Local appearance and reading preferences.", "এই ব্রাউজারে চেহারা ও পড়ার পছন্দ।"),
  2: copy("Questions through your preferred input.", "আপনার পছন্দের মাধ্যমে প্রশ্ন।"),
  3: copy("Bangla education with visible sources.", "দৃশ্যমান সূত্রসহ বাংলায় স্বাস্থ্যশিক্ষা।"),
  4: copy("Reviewed information and a path to people.", "পর্যালোচিত তথ্য ও মানুষের কাছে যাওয়ার পথ।"),
  5: copy("A pregnancy journey with room for your notes.", "আপনার নোটসহ গর্ভকালীন যাত্রা।"),
  6: copy("Record observations without AI diagnosis.", "এআই রোগ নির্ণয় ছাড়া পর্যবেক্ষণের নোট।"),
  7: copy("Correct extracted information before saving.", "সংরক্ষণের আগে তুলে নেওয়া তথ্য সংশোধন।"),
  8: copy("Private notes, in your own words.", "আপনার ভাষায় ব্যক্তিগত নোট।"),
  9: copy("Prepare questions for a care visit.", "সেবার সাক্ষাতের জন্য প্রশ্নের প্রস্তুতি।"),
  10: copy("Care information with verified provenance.", "যাচাইকৃত সূত্রসহ সেবার তথ্য।"),
  11: copy("A space for mother-to-mother connection.", "মায়েদের পারস্পরিক সংযোগের জায়গা।"),
  12: copy("Sharing chosen by the mother.", "মায়ের বাছাই করা তথ্য ভাগাভাগি।"),
  13: copy("A planned option for feature phones.", "সাধারণ ফোনের জন্য পরিকল্পিত বিকল্প।"),
  14: copy("Optional support for emotional well-being.", "মানসিক সুস্থতার ঐচ্ছিক সহায়তা।"),
  15: copy("Remote care with accessible interaction.", "ব্যবহারযোগ্য যোগাযোগে দূরবর্তী সেবা।"),
  16: copy("Continuity beyond birth.", "জন্মের পরেও যত্নের ধারাবাহিকতা।"),
  17: copy("A queue for authorized follow-up requests.", "অনুমতিভিত্তিক ফলোআপ অনুরোধের তালিকা।"),
  18: copy("Separate mother and baby histories.", "মা ও শিশুর আলাদা ইতিহাস।"),
  19: copy("Work only with authorized group information.", "শুধু অনুমোদিত গোষ্ঠীর তথ্য নিয়ে কাজ।"),
  20: copy("Keep protocols and evidence beside explanations.", "ব্যাখ্যার পাশে প্রোটোকল ও প্রমাণ।"),
  21: copy("Aggregate insight with privacy safeguards.", "গোপনীয়তা বজায় রেখে সমষ্টিগত ধারণা।"),
  22: copy("Provider notes that require human review.", "মানুষের পর্যালোচনাসাপেক্ষ সেবাদাতার নোট।"),
  23: copy("Clinical validation required before any use.", "যেকোনো ব্যবহারের আগে চিকিৎসাগত যাচাই প্রয়োজন।"),
  24: copy("Review access and continuity across care.", "যত্নজুড়ে প্রবেশাধিকার ও ধারাবাহিকতার পর্যালোচনা।"),
};
const features = capabilityGroups.flatMap(group => group.features);
const counts = Object.fromEntries(statuses.map(status => [status, features.filter(feature => feature.status === status).length])) as Record<Status, number>;
const horizontalLayout = () => matchMedia("(max-width: 767px)").matches || document.documentElement.clientWidth <= parseFloat(getComputedStyle(document.documentElement).fontSize) * 45;
const subscribeOrientation = (callback: () => void) => {
  const observer = new ResizeObserver(callback);
  observer.observe(document.documentElement);
  window.addEventListener("resize", callback);
  return () => { observer.disconnect(); window.removeEventListener("resize", callback); };
};

export function RoadmapExplorer() {
  const { t } = useHome();
  const [selected, setSelected] = useState(() => preferredModuleIndex(capabilityGroups));
  const [filter, setFilter] = useState<Filter>("All");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const horizontal = useSyncExternalStore(subscribeOrientation, horizontalLayout, () => false);
  function selectModule(index: number) {
    setSelected(index);
    if (filter !== "All" && !capabilityGroups[index].features.some(feature => feature.status === filter)) setFilter("All");
  }
  function selectFilter(next: Filter) {
    if (next !== "All" && counts[next] === 0) return;
    setFilter(next);
    if (next !== "All" && !capabilityGroups[selected].features.some(feature => feature.status === next)) setSelected(preferredModuleIndex(capabilityGroups, [next]));
  }
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = capabilityGroups.length - 1;
    else if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % capabilityGroups.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index + capabilityGroups.length - 1) % capabilityGroups.length;
    else return;
    event.preventDefault(); selectModule(next); tabs.current[next]?.focus({ preventScroll: true });
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }
  return <section id="roadmap" tabIndex={-1} className="story-roadmap story-section refined-roadmap" aria-labelledby="roadmap-title"><div className="home-container">
    <div className="story-section-heading"><div><SectionEyebrow>{t(copy("An ambitious vision. An honest view.", "বড় স্বপ্ন। স্পষ্ট বাস্তবতা।"))}</SectionEyebrow><h2 id="roadmap-title"><em>{t(copy("What’s taking shape.", "যা গড়ে উঠছে।"))}</em></h2></div><p>{t(copy("Local appearance controls are connected. Explore the full care vision and where each capability stands.", "এই ব্রাউজারের ব্যবহার-পছন্দের নিয়ন্ত্রণ কাজ করে। যত্নের পূর্ণ পরিকল্পনা এবং প্রতিটি সুবিধার অবস্থান দেখুন।"))}</p></div>
    <div className="roadmap-filters" role="group" aria-label={t(copy("Filter capabilities by status", "অবস্থান অনুযায়ী সুবিধা বাছাই"))}>{(["All", ...statuses] as Filter[]).map(status => { const Icon = statusIcons[status]; return <button key={status} aria-pressed={filter === status} aria-disabled={status !== "All" && counts[status] === 0 ? true : undefined} onClick={() => selectFilter(status)}><Icon size={17} aria-hidden="true" /><span>{status === "All" ? t(copy("All", "সব")) : t(statusLabels[status])}</span><span className="roadmap-count">{status === "All" ? features.length : counts[status]}</span></button>; })}</div>
    <p className="home-sr-only" id="roadmap-available-note">{t(copy("Includes Working or Limited capabilities", "চলমান বা সীমিত সুবিধা আছে"))}</p><div className="roadmap-explorer"><div className="roadmap-tabs" role="tablist" aria-label={t(copy("Roadmap modules", "পরিকল্পনার মডিউল"))} aria-orientation={horizontal ? "horizontal" : "vertical"}>{capabilityGroups.map((group, index) => { const name = group.name === "Shonket + Bondhon" ? "Shonket" : group.name; const Icon = moduleIcons[index]; const hasCurrent = group.features.some(feature => (["Working", "Limited"] as readonly string[]).includes(feature.status)); return <button key={group.name} role="tab" id={`roadmap-tab-${index}`} aria-controls={`roadmap-panel-${index}`} aria-selected={selected === index} aria-describedby={hasCurrent ? "roadmap-available-note" : undefined} tabIndex={selected === index ? 0 : -1} ref={element => { tabs.current[index] = element; }} onKeyDown={event => moveTab(event, index)} onClick={() => selectModule(index)}><Icon size={19} aria-hidden="true" /><span lang="en">{name}</span>{hasCurrent && <span className="roadmap-available-dot" aria-hidden="true" />}<span className="roadmap-count">{group.features.length}</span></button>; })}</div>
      <div className="roadmap-panels">{capabilityGroups.map((group, index) => { const visible = group.features.filter(feature => filter === "All" || feature.status === filter); return <div key={group.name} id={`roadmap-panel-${index}`} className="roadmap-panel" role="tabpanel" aria-labelledby={`roadmap-tab-${index}`} hidden={selected !== index} tabIndex={0}><div className="roadmap-panel-heading"><span><BookOpen size={18} aria-hidden="true" /><strong lang="en">{group.name}</strong></span><span>{visible.length} / {group.features.length}</span></div><ul>{visible.map(feature => { const Icon = statusIcons[feature.status]; return <li key={feature.id}><span className="story-capability-number" aria-label={t(copy(`Capability ${feature.id}`, `সুবিধা ${feature.id}`))}>{String(feature.id).padStart(2,"0")}</span><div><h3>{t(feature.title)}</h3><p>{t(featureNotes[feature.id])}</p></div><span className={`story-status font-tag story-status-${feature.status.toLowerCase()}`}><Icon size={15} aria-hidden="true" />{t(statusLabels[feature.status])}</span></li>; })}</ul>{!visible.length && <div className="roadmap-empty"><CircleDashed size={28} aria-hidden="true" /><p>{t(copy("No capabilities in this module match this filter.", "এই বাছাই অনুযায়ী এই মডিউলে কোনো সুবিধা নেই।"))}</p><button onClick={() => setFilter("All")}>{t(copy("Show all statuses", "সব অবস্থান দেখুন"))}</button></div>}</div>; })}</div>
    </div><p className="home-sr-only" role="status">{t(copy(`${capabilityGroups[selected].name}: ${capabilityGroups[selected].features.filter(feature => filter === "All" || feature.status === filter).length} matching capabilities.`, `${capabilityGroups[selected].name}: ${capabilityGroups[selected].features.filter(feature => filter === "All" || feature.status === filter).length}টি মিল থাকা সুবিধা।`))}</p>
  </div></section>;
}
