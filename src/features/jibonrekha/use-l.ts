"use client";
import { useLanguage } from "@/i18n/use-language";

/** Two-string helper for Jibonrekha's inline English/Bangla copy. Medical units and values are never passed through it. */
export function useL() {
  const { language } = useLanguage();
  return Object.assign((en: string, bn: string) => (language === "bn" ? bn : en), { bn: language === "bn" });
}

/** Display-only Bangla names for category identifiers. The identifiers themselves are stored and sent unchanged. */
const categoryBn: Record<string, string> = {
  vital_signs: "গুরুত্বপূর্ণ শারীরিক লক্ষণ", symptoms: "লক্ষণ", medical_conditions: "স্বাস্থ্য অবস্থা", general_notes: "সাধারণ নোট",
  laboratory_tests: "পরীক্ষাগারের পরীক্ষা", pregnancy_observations: "গর্ভকালের পর্যবেক্ষণ",
  fetal_movement: "গর্ভস্থ শিশুর নড়াচড়ার পর্যবেক্ষণ", clinician_documented_assessment: "চিকিৎসকের লেখা গর্ভস্থ শিশুর মূল্যায়ন",
  ultrasound_report_notes: "আল্ট্রাসাউন্ড বা রিপোর্টের নোট", general_observations: "সাধারণ পর্যবেক্ষণ", growth: "বৃদ্ধির মাপ",
  feeding: "খাওয়ানোর নোট", milestones: "বিকাশের ধাপ", newborn: "নবজাতকের পর্যবেক্ষণ",
};
export function categoryLabel(key: string, english: string, bangla: boolean) { return bangla ? categoryBn[key] ?? english : english; }

/** Display-only labels; callers keep the original stable category/kind as the stored value. */
const recordKinds: Record<string, { en: string; bn: string }> = {
  weight: { en: "Weight", bn: "ওজন" }, temperature: { en: "Temperature", bn: "তাপমাত্রা" },
  systolic_blood_pressure: { en: "Systolic blood pressure", bn: "উপরের রক্তচাপ" },
  diastolic_blood_pressure: { en: "Diastolic blood pressure", bn: "নিচের রক্তচাপ" },
  hemoglobin: { en: "Hemoglobin", bn: "হিমোগ্লোবিন" }, glucose: { en: "Blood glucose", bn: "রক্তে গ্লুকোজ" },
  fetal_heart_rate: { en: "Fetal heart rate", bn: "ভ্রূণের হৃদস্পন্দন" }, note: { en: "Note", bn: "নোট" },
  blood_pressure: { en: "Blood pressure", bn: "রক্তচাপ" }, movement_note: { en: "Baby movement note", bn: "শিশুর নড়াচড়ার নোট" },
  visit: { en: "Visit", bn: "ভিজিট" }, medicine: { en: "Medicine note", bn: "ওষুধের নোট" }, ultrasound: { en: "Ultrasound", bn: "আল্ট্রাসাউন্ড" },
};
export function recordKindLabel(kind: string, bangla: boolean) { return recordKinds[kind]?.[bangla ? "bn" : "en"] ?? kind; }

const reportTemplates: Record<string, string> = {
  "Blood pressure": "রক্তচাপ", Weight: "ওজন", Pulse: "নাড়ির গতি", Temperature: "তাপমাত্রা", "Fundal height": "জরায়ুর উচ্চতা",
  Edema: "শরীর ফোলা", "Fetal heart rate": "ভ্রূণের হৃদস্পন্দন", "Fetal movement note": "গর্ভস্থ শিশুর নড়াচড়ার নোট",
  Hemoglobin: "হিমোগ্লোবিন", "Blood group/Rh": "রক্তের গ্রুপ/Rh", "Urine protein": "প্রস্রাবে প্রোটিন", "Urine glucose": "প্রস্রাবে গ্লুকোজ",
  OGTT: "OGTT", "Blood glucose": "রক্তে গ্লুকোজ", "Infection screening": "সংক্রমণ পরীক্ষা", "Mood note": "মনের অবস্থার নোট", "Symptom note": "লক্ষণের নোট",
};
export function reportTemplateLabel(value: string, bangla: boolean) { return bangla ? reportTemplates[value] ?? value : value; }

/** Provenance line for a saved observation. Wording stays "not clinically verified" in both languages. */
export function sourceLabel(L: (en: string, bn: string) => string, item: { source: string; reviewStatus?: string; reviewedAt?: string; reviewedBy?: string }) {
  const reviewed = item.reviewStatus === "verified" && item.reviewedAt && Number.isFinite(Date.parse(item.reviewedAt)) && item.reviewedBy?.trim();
  const what = item.source === "self_reported" ? L("Self-reported", "নিজে দেওয়া তথ্য")
    : reviewed ? L("Medical report (user-reviewed)", "চিকিৎসা রিপোর্ট (আপনি দেখে নিয়েছেন)")
    : item.reviewStatus === "verified" ? L("Medical report (review status unknown)", "চিকিৎসা রিপোর্ট (দেখে নেওয়ার অবস্থা অজানা)")
    : L("Medical report (not yet reviewed)", "চিকিৎসা রিপোর্ট (এখনো দেখে নেওয়া হয়নি)");
  return `${what} · ${L("Not clinically verified", "চিকিৎসাগতভাবে যাচাই করা হয়নি")}`;
}
