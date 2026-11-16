"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, MapPin, Search } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";

export function PothScreen() {
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
