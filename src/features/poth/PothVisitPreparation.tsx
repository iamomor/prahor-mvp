"use client";
import { useEffect, useRef, useState } from "react";
import { Building2, ClipboardCheck, ExternalLink, Info, Phone, Printer, RotateCcw, Save, X } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { PothSavedVisitQuestions } from "./PothSavedVisitQuestions";
import type { DirectoryPlace } from "./directoryCore";
import { parseVisitChecklist, serializeVisitChecklist, visitChecklistKey } from "./visitChecklist";
import styles from "./poth.module.css";
export type VisitFacility = Pick<DirectoryPlace, "id" | "name" | "nameBn" | "area" | "sourceUrl" | "phone">;
const steps = [
  ["Confirm the service and any referral needed.", "প্রয়োজনীয় সেবা ও রেফারেল নিশ্চিত করুন।"],
  ["Check hours, fees and the exact entrance.", "সময়, খরচ ও সঠিক প্রবেশপথ জানুন।"],
  ["Ask about step-free entry, toilets and examination access.", "সিঁড়িবিহীন প্রবেশ, টয়লেট ও পরীক্ষার সুবিধা জানুন।"],
  ["Request writing, plain language, an interpreter or extra time.", "লিখিত তথ্য, সহজ ভাষা, দোভাষী বা বাড়তি সময় চান।"],
  ["Ask for transfer or positioning help if you choose.", "চাইলে স্থানান্তর বা উপযুক্ত অবস্থানে সহায়তা চান।"],
  ["Bring your reports, prescriptions and questions.", "রিপোর্ট, প্রেসক্রিপশন ও প্রশ্ন গুছিয়ে নিন।"],
  ["Plan transport and your optional support person.", "যাতায়াত ও চাইলে সহায়তাকারীর পরিকল্পনা করুন।"],
  ["Decide what to discuss privately and what to share.", "কী একান্তে বলবেন ও কী শেয়ার করবেন ঠিক করুন।"],
] as const;
const groups = [
  { en: "Confirm the visit", bn: "সাক্ষাৎ নিশ্চিত করুন", indices: [0, 1] },
  { en: "Access & communication", bn: "প্রবেশ ও যোগাযোগ", indices: [2, 3, 4] },
  { en: "Bring & plan", bn: "গুছিয়ে নিন", indices: [5, 6, 7] },
];
export function PothVisitPreparation({ facility, onClearFacility }: { facility?: VisitFacility | null; onClearFacility?: () => void } = {}) {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => language === "bn" ? bn : en;
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  const [status, setStatus] = useState<{ en: string; bn: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const edited = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLElement>(null);
  const printCleanup = useRef<(() => void) | null>(null);
  useEffect(() => { const current = printCleanup; return () => current.current?.(); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (edited.current) return;
      try {
        const value = parseVisitChecklist(window.sessionStorage.getItem(visitChecklistKey));
        if (value) { setChecked(value); setSaved(true); }
      } catch { /* Optional storage never blocks the checklist. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!facility) return;
    const timer = window.setTimeout(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); }, 0);
    return () => window.clearTimeout(timer);
  }, [facility]);
  function save() {
    edited.current = true;
    try {
      window.sessionStorage.setItem(visitChecklistKey, serializeVisitChecklist(checked));
      setSaved(true); setStatus({ en: "Check marks saved in this tab. No request was sent.", bn: "টিক চিহ্ন এই ট্যাবে রাখা হয়েছে। কোনো অনুরোধ পাঠানো হয়নি।" });
    } catch { setSaved(false); setStatus({ en: "This browser could not save the checklist. You can still print it.", bn: "এই ব্রাউজারে তালিকা রাখা যায়নি। প্রিন্ট করতে পারবেন।" }); }
  }
  function clear() {
    edited.current = true; setChecked(steps.map(() => false)); setSaved(false);
    try { window.sessionStorage.removeItem(visitChecklistKey); setStatus({ en: "Check marks cleared.", bn: "টিক চিহ্ন মুছে গেছে।" }); }
    catch { setStatus({ en: "Cleared on this page; the saved copy could not be removed.", bn: "এই পাতার চিহ্ন মুছেছে; রাখা কপি সরানো যায়নি।" }); }
  }
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
    try { window.print(); } catch { cleanup(); setStatus({ en: "Print unavailable. Your checklist is still here.", bn: "প্রিন্ট করা যাচ্ছে না। তালিকা এখানেই আছে।" }); }
  }
  return <section ref={content} id="poth-visit-preparation" className={`${styles.panel} ${styles.stack}`} aria-labelledby="poth-preparation-title">
    <div className={styles.sectionHead}><span className={styles.iconTile} aria-hidden="true"><ClipboardCheck size={22} /></span><div><span className={styles.step}>{t("Step 3", "ধাপ ৩")}</span><h2 id="poth-preparation-title" ref={heading} tabIndex={-1}>{t("Prepare a visit", "সাক্ষাতের প্রস্তুতি")}</h2><p className={styles.meta}>{t("A personal checklist, not a booking or shared care record.", "নিজের প্রস্তুতির তালিকা; বুকিং বা শেয়ার করা রেকর্ড নয়।")}</p></div></div>
    {facility ? <div className={styles.chosenPlace}>
      <p className={styles.meta}>{t("Your chosen place · confirm before travelling", "আপনার বাছাই করা স্থান · যাওয়ার আগে নিশ্চিত করুন")}</p>
      <h3>{language === "bn" ? facility.nameBn ?? facility.name : facility.name}</h3>
      {facility.area && <p>{facility.area}</p>}
      <div className={styles.actions}>{facility.phone && <a className={styles.button} href={`tel:${facility.phone.replace(/[^+0-9]/g, "")}`}><Phone size={17} aria-hidden="true" />{t("Call", "কল করুন")}</a>}<a className={styles.textButton} href={facility.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Source", "উৎস")}<ExternalLink size={14} aria-hidden="true" /></a>{onClearFacility && <button type="button" className={styles.textButton} onClick={() => { onClearFacility?.(); window.requestAnimationFrame(() => heading.current?.focus()); }}><X size={16} aria-hidden="true" />{t("Remove place", "স্থান সরান")}</button>}</div>
    </div> : <div className={styles.emptyPlace}><Building2 size={22} aria-hidden="true" /><p className={styles.meta}>{t("No place chosen yet. Press “Prepare a visit” on any listing above, or use this checklist on its own.", "এখনো স্থান বাছা হয়নি। ওপরের কোনো তালিকায় ‘সাক্ষাতের প্রস্তুতি’ চাপুন, বা শুধু এই তালিকা ব্যবহার করুন।")}</p></div>}
    <PothSavedVisitQuestions />
    <div className={styles.planGroups}>{groups.map(group => <fieldset className={styles.planGroup} key={group.en}><legend>{t(group.en, group.bn)}</legend>
      {group.indices.map(index => <label key={index} className={styles.check}>
        <input type="checkbox" checked={checked[index]} onChange={event => { edited.current = true; const next = event.target.checked; setChecked(previous => previous.map((value, i) => i === index ? next : value)); setSaved(false); setStatus(null); }} />
        <span>{t(steps[index][0], steps[index][1])}</span>
      </label>)}
    </fieldset>)}</div>
    <div className={styles.progress}>
      <div className={styles.resultBar}><p className={styles.count}>{t(`${checked.filter(Boolean).length} of ${steps.length} checked`, `${checked.filter(Boolean).length.toLocaleString("bn-BD")}/${steps.length.toLocaleString("bn-BD")}টি চিহ্নিত`)}</p><p className={`${styles.meta} ${styles.small}`}>{saved ? t("Saved in this tab", "এই ট্যাবে রাখা আছে") : t("Not saved yet — save to keep check marks after reload", "এখনো রাখা হয়নি — রিলোডের পর রাখতে সংরক্ষণ করুন")}</p></div>
      <progress value={checked.filter(Boolean).length} max={steps.length} aria-label={t("Checklist progress", "চেকলিস্টের অগ্রগতি")} />
    </div>
    <div className={styles.actionBar}><button type="button" className={`${styles.button} ${styles.primary}`} onClick={save}><Save size={18} aria-hidden="true" />{t("Save in this tab", "এই ট্যাবে রাখুন")}</button><button type="button" className={styles.button} onClick={print}><Printer size={18} aria-hidden="true" />{t("Print checklist", "তালিকা প্রিন্ট করুন")}</button><button type="button" className={styles.textButton} onClick={clear}><RotateCcw size={16} aria-hidden="true" />{t("Clear", "মুছুন")}</button></div>
    {status && <p role="status" className={styles.statusLine}><Info size={18} aria-hidden="true" /><span>{language === "bn" ? status.bn : status.en}</span></p>}
    <details className={styles.disclosure}><summary>{t("What is saved?", "কী রাখা হয়?")}</summary><p>{t("Only these check marks are saved in this tab until it closes. Facility selection is not saved; Barta questions use their existing tab storage. Nothing is sent to a care provider.", "ট্যাব বন্ধ হওয়া পর্যন্ত শুধু এই টিক চিহ্ন রাখা হয়। প্রতিষ্ঠান বাছাই রাখা হয় না; বার্তার প্রশ্ন আগের মতো ট্যাবে থাকে। সেবাদাতাকে কিছু পাঠানো হয় না।")}</p></details>
  </section>;
}
