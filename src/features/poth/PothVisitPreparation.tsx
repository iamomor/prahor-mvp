"use client";

import { useState } from "react";
import { PothSavedVisitQuestions } from "./PothSavedVisitQuestions";

const steps = [
  { en: "Write down questions you want to ask the care provider.", bn: "স্বাস্থ্যকর্মীকে যা জানতে চান, তা লিখে রাখুন।" },
  { en: "Collect any existing prescriptions and medical reports.", bn: "আগের প্রেসক্রিপশন ও চিকিৎসা প্রতিবেদন গুছিয়ে নিন।" },
  { en: "Confirm visiting hours and the service you need directly.", bn: "যাওয়ার আগে সময় ও প্রয়োজনীয় সেবা নিশ্চিত করুন।" },
  { en: "Ask about entrance, toilet, transfer or communication support if needed.", bn: "প্রয়োজনে প্রবেশপথ, টয়লেট, স্থানান্তর বা যোগাযোগ সহায়তার তথ্য জেনে নিন।" },
  { en: "Plan transport and an optional trusted support person.", bn: "যাতায়াতের পরিকল্পনা করুন এবং চাইলে সহায়তাকারী ঠিক করুন।" },
] as const;

export function PothVisitPreparation() {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  return (
    <section id="poth-visit-preparation" aria-labelledby="poth-preparation-title" className="mt-8 rounded-2xl border p-5 sm:p-7"
      style={{ borderColor: "var(--pro-border)", background: "var(--pro-surface)" }}>
      <h2 id="poth-preparation-title" className="mb-2 text-2xl font-bold">Visit preparation · সাক্ষাতের প্রস্তুতি</h2>
      <p className="mb-5 max-w-2xl">
        Optional checklist. Leaving this page clears your check marks.
        {" · "}<span lang="bn">এটি ঐচ্ছিক। এই পাতা থেকে বের হলে টিক চিহ্নগুলো মুছে যাবে।</span>
      </p>
      <PothSavedVisitQuestions />
      <div className="grid gap-3">
        {steps.map((step, index) => (
          <label key={step.en} className="flex min-h-12 items-start gap-3 rounded-xl border p-3"
            style={{ borderColor: "var(--pro-border)", background: "var(--pro-elevated)" }}>
            <input type="checkbox" checked={checked[index]} onChange={(event) =>
              setChecked((previous) => previous.map((value, i) => i === index ? event.target.checked : value))}
              className="mt-1 h-5 w-5 shrink-0" />
            <span className="leading-relaxed">{step.bn}<span lang="en" className="block text-sm">{step.en}</span></span>
          </label>
        ))}
      </div>
      <button type="button" onClick={() => setChecked(steps.map(() => false))}
        className="mt-5 min-h-11 rounded-lg border px-4 font-semibold underline"
        style={{ borderColor: "var(--pro-control-border)" }}>
        Clear checklist · চিহ্ন মুছুন
      </button>
    </section>
  );
}
