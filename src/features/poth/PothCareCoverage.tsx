"use client";

import { Building2, ExternalLink, HeartPulse, MapPinned, ShieldAlert } from "lucide-react";
import styles from "./poth.module.css";

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
    <section aria-labelledby="poth-care-heading" className={styles.stack}>
      <h2 id="poth-care-heading" className={styles.line} style={{ fontSize: "1.35rem" }}><HeartPulse size={22} aria-hidden="true" /><span>Care types and maternal facilities · হাসপাতাল ও মাতৃসেবা</span></h2>
      <p>These are search categories, <strong>not claims that a particular hospital provides the service</strong>. Use them to start a search, then confirm with the facility.</p>
      <div className={styles.typeGrid}>
        {careTypes.map(type => (
          <article key={type.label} className={styles.typeCard}>
            <h3><span className={styles.iconTile} style={{ width: "2.4rem", height: "2.4rem" }}><Building2 size={18} aria-hidden="true" /></span>{type.label}</h3>
            <p className={styles.small}>{type.detail}</p>
            <a href={"https://www.openstreetmap.org/search?query=" + encodeURIComponent(type.query)} target="_blank" rel="noopener noreferrer" className={styles.textButton} style={{ justifySelf: "start" }}><MapPinned size={17} aria-hidden="true" />Search on external map<ExternalLink size={14} aria-hidden="true" /></a>
          </article>
        ))}
      </div>
      <h3>Before choosing maternity care</h3>
      <ul className={`${styles.checklist} ${styles.small}`}>
        <li>Confirm whether the facility currently accepts pregnant patients and handles the needed level of care.</li>
        <li>For an emergency, ask about ambulance access, obstetric emergency coverage and referral arrangements.</li>
        <li>For disability access, ask about step-free entry, accessible toilets, transfer assistance, examination equipment and communication needs.</li>
        <li>Confirm the precise entrance, phone number, operating hours and transport arrangements.</li>
      </ul>
      <p className={styles.notice}><ShieldAlert size={18} aria-hidden="true" />Community maps, search names and registry facility types are insufficient evidence of safe delivery, available beds, or accessibility.</p>
    </section>
  );
}
