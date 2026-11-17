"use client";

import { Building2, HeartPulse, MapPinned, ShieldAlert } from "lucide-react";

const careTypes = [
  { label: "Hospitals · হাসপাতাল", detail: "General emergency and inpatient care vary by facility. Call first when possible.", query: "hospital Bangladesh" },
  { label: "Maternity homes · মাতৃসদন", detail: "Search for maternity homes, but never assume delivery, caesarean or emergency obstetric care from a name.", query: "maternity hospital Bangladesh" },
  { label: "Birthing centres · প্রসবকেন্দ্র", detail: "Community-mapped birthing centres and midwives require independent clinical and licensing checks.", query: "birthing centre Bangladesh" },
  { label: "Upazila health complexes · উপজেলা স্বাস্থ্য কমপ্লেক্স", detail: "Government primary/referral facilities. Availability of services and staff must be confirmed.", query: "upazila health complex Bangladesh" },
  { label: "Maternal and child welfare · মা ও শিশু কল্যাণ", detail: "Family-planning and maternal-child facilities should be confirmed through official sources.", query: "maternal child welfare centre Bangladesh" },
  { label: "Clinics / diagnostics · ক্লিনিক", detail: "Clinic and diagnostic services are not a substitute for emergency obstetric assessment.", query: "clinic Bangladesh" },
] as const;

export function PothCareCoverage() {
  return (
    <section aria-labelledby="poth-care-heading" className="mt-10 rounded-2xl border p-4 sm:p-7"
      style={{ borderColor: "var(--pro-border)", background: "var(--pro-elevated)" }}>
      <h2 id="poth-care-heading" className="flex items-center gap-2 text-2xl font-bold"><HeartPulse aria-hidden="true"/> Care types and maternal facilities · হাসপাতাল ও মাতৃসেবা</h2>
      <p className="mt-3">Explore relevant kinds of care around Bangladesh, then use the nearby map or source-reviewed directory on this page. These are search categories, <strong>not claims that a particular hospital provides the service</strong>.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {careTypes.map(type => (
          <article key={type.label} className="rounded-xl border p-4" style={{ borderColor: "var(--pro-border)" }}>
            <h3 className="flex items-start gap-2 font-bold"><Building2 className="mt-1 shrink-0" size={18} aria-hidden="true"/>{type.label}</h3>
            <p className="mt-2 text-sm leading-relaxed">{type.detail}</p>
            <a href={"https://www.openstreetmap.org/search?query=" + encodeURIComponent(type.query)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold underline"><MapPinned size={17} aria-hidden="true"/> Search on external map</a>
          </article>
        ))}
      </div>
      <h3 className="mt-6 font-semibold">Before choosing maternity care</h3>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        <li>Confirm whether the facility currently accepts pregnant patients and handles the needed level of care.</li>
        <li>For an emergency, ask about ambulance access, obstetric emergency coverage and referral arrangements.</li>
        <li>For disability access, ask about step-free entry, accessible toilets, transfer assistance, examination equipment and communication needs.</li>
        <li>Confirm the precise entrance, phone number, operating hours and transport arrangements.</li>
      </ul>
      <p className="mt-4 flex gap-2 text-sm"><ShieldAlert size={18} aria-hidden="true" className="mt-1 shrink-0"/> Community maps, search names and registry facility types are insufficient evidence of safe delivery, available beds, or accessibility.</p>
    </section>
  );
}
