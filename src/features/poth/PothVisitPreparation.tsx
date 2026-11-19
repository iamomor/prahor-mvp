"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import { PothSavedVisitQuestions } from "./PothSavedVisitQuestions";
import type { DirectoryPlace } from "./directoryCore";
import styles from "./poth.module.css";
export type VisitFacility = Pick<DirectoryPlace, "id" | "name" | "nameBn" | "area" | "sourceUrl" | "phone">;
const steps = [
  ["Confirm the service you need and whether a referral is required.", "প্রয়োজনীয় সেবা ও রেফারেল লাগবে কি না নিশ্চিত করুন।"],
  ["Confirm visiting hours, any fees and the exact entrance directly.", "সময়, সম্ভাব্য খরচ ও সঠিক প্রবেশপথ সরাসরি নিশ্চিত করুন।"],
  ["Ask about step-free entry, lifts, toilets and accessible examination equipment.", "সিঁড়িবিহীন প্রবেশ, লিফট, টয়লেট ও পরীক্ষার সরঞ্জামের সুবিধা জেনে নিন।"],
  ["Request your preferred communication: writing, plain language, an interpreter or extra time.", "পছন্দের যোগাযোগ চান: লিখিত তথ্য, সহজ ভাষা, দোভাষী বা বাড়তি সময়।"],
  ["Ask about transfer or positioning assistance you choose to receive.", "আপনি চাইলে স্থানান্তর বা উপযুক্ত অবস্থানে থাকতে সহায়তা সম্পর্কে জিজ্ঞাসা করুন।"],
  ["Collect existing reports, prescriptions and questions you want to ask.", "আগের রিপোর্ট, প্রেসক্রিপশন ও জানতে চাওয়া প্রশ্ন গুছিয়ে নিন।"],
  ["Plan transport and an optional support person of your choice.", "যাতায়াত এবং চাইলে নিজের পছন্দের সহায়তাকারীর পরিকল্পনা করুন।"],
  ["Decide what you want to discuss privately and which records you choose to share.", "কী একান্তে আলোচনা করবেন এবং কোন রেকর্ড শেয়ার করবেন তা ঠিক করুন।"],
] as const;
export function PothVisitPreparation({ facility, onClearFacility }: { facility?: VisitFacility | null; onClearFacility?: () => void } = {}) {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => language === "bn" ? bn : en;
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLElement>(null);
  const printCleanup = useRef<(() => void) | null>(null);
  useEffect(() => { const current = printCleanup; return () => current.current?.(); }, []);
  useEffect(() => {
    if (!facility) return;
    const timer = window.setTimeout(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); }, 0);
    return () => window.clearTimeout(timer);
  }, [facility]);
  function print() {
    if (!content.current) return;
    printCleanup.current?.();
    const root = document.createElement("div"); root.className = styles.printVisitRoot; root.lang = language;
    const clone = content.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("button").forEach(button => button.remove());
    clone.querySelectorAll('input[type="checkbox"]').forEach(input => {
      const mark = document.createElement("span"); mark.textContent = (input as HTMLInputElement).checked ? "☑ " : "☐ "; input.replaceWith(mark);
    });
    root.appendChild(clone); document.body.appendChild(root);
    const cleanup = () => { root.remove(); window.removeEventListener("afterprint", cleanup); printCleanup.current = null; };
    printCleanup.current = cleanup; window.addEventListener("afterprint", cleanup, { once: true });
    try { window.print(); } catch { cleanup(); setStatus(t("Print unavailable. You can read the checklist here.", "প্রিন্ট করা যাচ্ছে না। এখানেই তালিকা পড়তে পারবেন।")); }
  }
  return <section ref={content} id="poth-visit-preparation" className={`${styles.panel} ${styles.stack}`} aria-labelledby="poth-preparation-title">
    <h2 id="poth-preparation-title" ref={heading} tabIndex={-1}>{t("Prepare for your visit", "আপনার সাক্ষাতের প্রস্তুতি")}</h2>
    <p>{t("Your choices stay in this page until you leave or reload. Nothing here books a visit, contacts a facility or shares records.", "এই পাতা ছাড়া বা রিলোড করা পর্যন্ত আপনার পছন্দ থাকবে। এখানে কিছু করলে সাক্ষাৎ বুক হয় না, প্রতিষ্ঠানে যোগাযোগ হয় না বা রেকর্ড শেয়ার হয় না।")}</p>
    {facility ? <div className={styles.notice}>
      <h3>{t("Chosen place · confirm before travelling", "বাছাই করা স্থান · যাওয়ার আগে নিশ্চিত করুন")}</h3>
      <p>{language === "bn" ? facility.nameBn ?? facility.name : facility.name}</p>
      <p>{facility.area ?? t("Address not supplied", "ঠিকানা দেওয়া নেই")}</p>
      <div className={styles.actions}><a className={styles.button} href={facility.sourceUrl} target="_blank" rel="noopener noreferrer">{t("View source ↗", "উৎস দেখুন ↗")}</a>{facility.phone && <a className={styles.button} href={`tel:${facility.phone.replace(/[^+0-9]/g, "")}`}>{t("Call published number", "উৎসে দেওয়া নম্বরে কল")}</a>}<button className={styles.button} onClick={onClearFacility}>{t("Clear chosen place", "বাছাই করা স্থান সরান")}</button></div>
    </div> : <p className={styles.notice}>{t("You can prepare without selecting a facility. Use “Prepare a visit here” on a directory card to add its published details.", "প্রতিষ্ঠান না বেছেও প্রস্তুতি নিতে পারবেন। তালিকার কার্ডে ‘এখানে সাক্ষাতের প্রস্তুতি’ চাপলে প্রকাশিত তথ্য যোগ হবে।")}</p>}
    <PothSavedVisitQuestions />
    <fieldset className={styles.stack}><legend>{t("Optional preparation checklist", "ঐচ্ছিক প্রস্তুতির তালিকা")}</legend>
      {steps.map(([en, bn], index) => <label key={en} className={styles.check}>
        <input type="checkbox" checked={checked[index]} onChange={event => { const next = event.target.checked; setChecked(previous => previous.map((value, i) => i === index ? next : value)); }} />
        <span>{t(en, bn)}</span>
      </label>)}
    </fieldset>
    <p role="status">{t(`${checked.filter(Boolean).length} of ${steps.length} preparation items checked`, `${checked.filter(Boolean).length.toLocaleString("bn-BD")}/${steps.length.toLocaleString("bn-BD")}টি প্রস্তুতিতে টিক দেওয়া আছে`)}</p>
    <div className={styles.actions}><button className={styles.button} onClick={print}>{t("Print / save visit checklist", "প্রস্তুতির তালিকা প্রিন্ট / সংরক্ষণ")}</button><button className={styles.button} onClick={() => setChecked(steps.map(() => false))}>{t("Clear check marks", "টিক চিহ্ন মুছুন")}</button></div>
    {status && <p role="status">{status}</p>}
  </section>;
}
