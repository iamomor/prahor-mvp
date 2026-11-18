"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Search, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";
import { bdDistricts, divisionNames, type Division } from "./bdDistricts";
import { PothFacilityExplorer } from "./PothFacilityExplorer";
import { PothNearbyMap } from "./PothNearbyMap";
import { PothEmergencySOS } from "./PothEmergencySOS";
import { PothCareCoverage } from "./PothCareCoverage";
import { PothVisitPreparation } from "./PothVisitPreparation";

type Language = "bn" | "en";
type Example = {
  name: string;
  bangla: string;
  district: string;
  href: string;
};

// Examples inherited from the PROHOR marketing preview. Verify registry IDs,
// district and clinical services before publishing as real service recommendations.
const examples: Example[] = [
  {
    name: "Dhaka Medical College Hospital",
    bangla: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    district: "Dhaka",
    href: "https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile",
  },
  {
    name: "Sir Salimullah Medical College Mitford Hospital",
    bangla: "স্যার সলিমুল্লাহ মেডিকেল কলেজ মিটফোর্ড হাসপাতাল",
    district: "Dhaka",
    href: "https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile",
  },
];

const registryUrl = "https://hrm.dghs.gov.bd/public/facility-registry";

export function PothDirectoryMvp() {
  const [language, setLanguage] = useState<Language>("bn");
  const [division, setDivision] = useState<Division | "">("");
  const [district, setDistrict] = useState("");
  const [search, setSearch] = useState("");
  const bn = language === "bn";
  const label = (en: string, bangla: string) => (bn ? bangla : en);

  const districtOptions = useMemo(
    () => division ? [...bdDistricts[division]] : divisionNames.flatMap((key) => [...bdDistricts[key]]),
    [division],
  );
  const results = examples.filter((entry) => {
    if (district && entry.district !== district) return false;
    if (division && !(bdDistricts[division] as readonly string[]).includes(entry.district)) return false;
    const q = search.trim().toLocaleLowerCase();
    return `${entry.name} ${entry.bangla} ${entry.district} ঢাকা`.toLocaleLowerCase().includes(q);
  });

  return (
    <main lang={language} className="min-h-screen px-4 py-7 sm:px-8 sm:py-10" style={{ background: "var(--pro-bg)", color: "var(--pro-text)" }}>
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="rounded-lg font-bold underline focus-visible:outline-2 focus-visible:outline-offset-4">
            PROHOR | প্রহর
          </Link>
          <div className="flex gap-2" role="group" aria-label="Language / ভাষা">
            <button type="button" aria-pressed={bn} onClick={() => setLanguage("bn")}
              className="min-h-11 rounded-lg border px-4 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: bn ? "var(--pro-primary)" : "var(--pro-elevated)", color: bn ? "var(--pro-on-primary)" : "var(--pro-text)", borderColor: "var(--pro-control-border)" }}>বাংলা</button>
            <button type="button" aria-pressed={!bn} onClick={() => setLanguage("en")}
              className="min-h-11 rounded-lg border px-4 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: !bn ? "var(--pro-primary)" : "var(--pro-elevated)", color: !bn ? "var(--pro-on-primary)" : "var(--pro-text)", borderColor: "var(--pro-control-border)" }}>EN</button>
          </div>
        </header>

        <section className="mb-8" aria-labelledby="poth-title">
          <p className="mb-3 font-semibold" style={{ color: "var(--pro-primary)" }}>PROHOR POTH · প্রহর পথ</p>
          <h1 id="poth-title" className="mb-4 text-3xl font-bold leading-tight sm:text-5xl">
            {label("Finding care in Bangladesh", "বাংলাদেশে স্বাস্থ্যসেবা খুঁজুন")}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed sm:text-lg">
            {label(
              "Browse all 8 divisions and 64 districts. Facility records are currently limited examples, not a nationwide verified hospital directory.",
              "৮টি বিভাগ ও ৬৪টি জেলার তালিকা থেকে খুঁজুন। প্রতিষ্ঠানগুলোর তথ্য এখনো সীমিত উদাহরণ; এটি সারাদেশের যাচাইকৃত হাসপাতাল তালিকা নয়।",
            )}
          </p>
        </section>

        <nav aria-label="Poth care navigation" className="mb-7 flex flex-wrap gap-2">
          <a href="#poth-sos" className="min-h-11 rounded-lg border px-4 py-3 font-semibold underline" style={{ borderColor: "var(--pro-control-border)" }}>Emergency 999 · জরুরি</a>
          <a href="#poth-nearby-map" className="min-h-11 rounded-lg border px-4 py-3 underline" style={{ borderColor: "var(--pro-control-border)" }}>Nearby care map · কাছের সেবা</a>
          <a href="#poth-reviewed-directory" className="min-h-11 rounded-lg border px-4 py-3 underline" style={{ borderColor: "var(--pro-control-border)" }}>Source-linked directory</a>
          <a href="#poth-visit-preparation" className="min-h-11 rounded-lg border px-4 py-3 underline" style={{ borderColor: "var(--pro-control-border)" }}>Visit preparation · প্রস্তুতি</a>
        </nav>

        <section aria-labelledby="poth-filters" className="mb-8 rounded-2xl border p-5 sm:p-7" style={{ borderColor: "var(--pro-border)", background: "var(--pro-elevated)" }}>
          <h2 id="poth-filters" className="mb-5 text-xl font-bold">{label("Search and location", "খোঁজ ও অবস্থান")}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="poth-division" className="mb-2 block font-semibold">{label("Division", "বিভাগ")}</label>
              <select id="poth-division" value={division} onChange={(e) => { setDivision(e.target.value as Division | ""); setDistrict(""); }}
                className="min-h-12 w-full rounded-lg border px-3" style={{ background: "var(--pro-bg)", color: "var(--pro-text)", borderColor: "var(--pro-control-border)" }}>
                <option value="">{label("All divisions", "সব বিভাগ")}</option>
                {divisionNames.map((v) => <option value={v} key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="poth-district" className="mb-2 block font-semibold">{label("District", "জেলা")}</label>
              <select id="poth-district" value={district} onChange={(e) => setDistrict(e.target.value)}
                className="min-h-12 w-full rounded-lg border px-3" style={{ background: "var(--pro-bg)", color: "var(--pro-text)", borderColor: "var(--pro-control-border)" }}>
                <option value="">{label("All districts", "সব জেলা")}</option>
                {districtOptions.map((v) => <option value={v} key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <label htmlFor="poth-search" className="mb-2 mt-5 block font-semibold">{label("Facility name", "প্রতিষ্ঠানের নাম")}</label>
          <div className="relative">
            <Search aria-hidden="true" size={20} className="absolute left-4 top-4" />
            <input id="poth-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={label("Search current examples", "বর্তমান উদাহরণে খুঁজুন")}
              className="min-h-12 w-full rounded-lg border py-2 pl-12 pr-3" style={{ background: "var(--pro-bg)", color: "var(--pro-text)", borderColor: "var(--pro-control-border)" }} />
          </div>
          <button type="button" onClick={() => { setDivision(""); setDistrict(""); setSearch(""); }}
            className="mt-5 min-h-11 rounded-lg border px-4 font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--pro-control-border)" }}>{label("Clear filters", "ফিল্টার মুছুন")}</button>
        </section>

        <section aria-labelledby="poth-results">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 id="poth-results" className="text-2xl font-bold">{label("Current example listings", "বর্তমান উদাহরণ তালিকা")}</h2>
            <p role="status" aria-live="polite">{label(`${results.length} listings`, `${results.length}টি তালিকা`)}</p>
          </div>
          <div className="grid gap-4">
            {results.map((item) => (
              <article key={item.href} className="rounded-2xl border p-5 sm:p-6" style={{ background: "var(--pro-elevated)", borderColor: "var(--pro-border)" }}>
                <div className="flex items-start gap-4">
                  <Building2 aria-hidden="true" size={28} className="shrink-0" style={{ color: "var(--pro-primary)" }} />
                  <div className="min-w-0">
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">{bn ? item.bangla : item.name}</h3>
                    <p className="mb-3 flex items-center gap-2"><MapPin aria-hidden="true" size={16}/>{bn ? "ঢাকা" : item.district}</p>
                    <p className="mb-4 flex items-start gap-2 text-sm" style={{ color: "var(--pro-warning)" }}>
                      <ShieldAlert aria-hidden="true" size={18} className="shrink-0" />
                      {label("Not verified: maternity services, hours, access features and contacts", "যাচাই করা হয়নি: মাতৃসেবা, সময়, প্রবেশগম্যতা ও যোগাযোগ")}
                    </p>
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 font-semibold underline focus-visible:outline-2"
                      style={{ borderColor: "var(--pro-control-border)" }}>
                      {label("Check DGHS listing (new tab)", "DGHS তালিকা দেখুন (নতুন ট্যাব)")}
                      <ArrowUpRight aria-hidden="true" size={17}/>
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {results.length === 0 && (
              <div className="rounded-2xl border p-6" style={{ background: "var(--pro-elevated)", borderColor: "var(--pro-border)" }}>
                <p className="mb-2 text-lg font-bold">{label("No reviewed listings in this prototype selection", "এই নির্বাচনে কোনো তালিকা এখনো যুক্ত হয়নি")}</p>
                <p>{label("This does not mean the district has no healthcare facilities. Please consult the official DGHS registry.", "এর মানে এই নয় যে জেলায় স্বাস্থ্যসেবা প্রতিষ্ঠান নেই। সরকারি DGHS রেজিস্ট্রি দেখুন।")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border p-5" style={{ borderColor: "var(--pro-border)", background: "var(--pro-surface)" }}>
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><CheckCircle2 aria-hidden="true" size={20}/>{label("Official source for further searching", "আরও খোঁজার সরকারি উৎস")}</h2>
          <p className="mb-3">{label("DGHS provides an official facility registry; this prototype does not automatically synchronize with it.", "DGHS-এর সরকারি প্রতিষ্ঠান রেজিস্ট্রি রয়েছে; এই প্রোটোটাইপে সেই তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হয় না।")}</p>
          <a href={registryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold underline focus-visible:outline-2">
            {label("Open the DGHS Facility Registry (new tab)", "DGHS প্রতিষ্ঠান রেজিস্ট্রি খুলুন (নতুন ট্যাব)")}
            <ArrowUpRight aria-hidden="true" size={17}/>
          </a>
        </section>

        <PothEmergencySOS />
        <PothCareCoverage />
        <PothNearbyMap />
        <PothFacilityExplorer />
        <PothVisitPreparation />
        <footer className="mt-8 border-t py-6 text-sm leading-relaxed" style={{ borderColor: "var(--pro-border)" }}>
          {label(
            "No appointment booking, emergency dispatch or individual medical recommendations are offered here. In an emergency, seek urgent medical assistance rather than relying on this directory.",
            "এখানে অ্যাপয়েন্টমেন্ট বুকিং, জরুরি সেবা পাঠানো বা ব্যক্তিগত চিকিৎসা পরামর্শ দেওয়া হয় না। জরুরি পরিস্থিতিতে এই ডিরেক্টরির ওপর নির্ভর না করে দ্রুত চিকিৎসা সহায়তা নিন।",
          )}
        </footer>
      </div>
    </main>
  );
}
