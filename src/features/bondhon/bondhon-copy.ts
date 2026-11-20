import type { Accommodation } from "@/lib/contracts/coordination";
import type { ShareableRecord } from "@/lib/contracts/sharing";
export const words = (en: string, bn: string) => ({ en, bn });
export const accommodations: Record<Accommodation, { en: string; bn: string }> = {
  written: words("Written communication", "লিখিত যোগাযোগ"),
  interpreter: words("Interpreter requested", "দোভাষীর অনুরোধ"),
  step_free: words("Step-free access requested", "সিঁড়িবিহীন প্রবেশের অনুরোধ"),
  quiet: words("Quiet appointment space requested", "শান্ত সাক্ষাতের জায়গার অনুরোধ"),
  easy_read: words("Plain-language explanations", "সহজ ভাষায় ব্যাখ্যা"),
  support_person: words("Bring my chosen support person", "আমার বাছাই করা সহায়ককে সঙ্গে নেওয়া"),
};
export const recordNames: Record<ShareableRecord["type"], { en: string; bn: string }> = {
  pregnancy_record: words("Pregnancy record", "গর্ভাবস্থার রেকর্ড"), maternal_condition: words("Recorded condition", "লিপিবদ্ধ অবস্থার তথ্য"),
  maternal_observation: words("Mother’s observation", "মায়ের পর্যবেক্ষণ"), maternal_symptom_note: words("Symptom note", "উপসর্গের নোট"),
  baby_record: words("Baby’s record", "শিশুর রেকর্ড"), baby_observation: words("Baby’s observation", "শিশুর পর্যবেক্ষণ"),
  wellness_entry: words("Optional wellbeing entry", "ঐচ্ছিক ভালো থাকার নোট"),
};
export const fieldNames: Record<string, { en: string; bn: string }> = {
  label: words("Label", "নাম"), estimatedDueDate: words("Estimated due date", "সম্ভাব্য প্রসবের তারিখ"),
  lastMenstrualPeriodDate: words("Last menstrual period date", "শেষ মাসিকের তারিখ"), documentedAt: words("Recorded date", "নথিভুক্তির তারিখ"),
  measurement: words("Recorded measurement or note", "লিপিবদ্ধ পরিমাপ বা নোট"), observedAt: words("Observation date", "পর্যবেক্ষণের তারিখ"),
  provenance: words("Source and verification", "উৎস ও যাচাই"), note: words("Note", "নোট"), occurredAt: words("Entry date", "নোটের তারিখ"),
  birthDate: words("Birth date", "জন্মতারিখ"), mood: words("Mood", "মনের অবস্থা"), energy: words("Energy", "কর্মশক্তি"),
  activityNote: words("Activity note", "কাজের নোট"), restNote: words("Rest note", "বিশ্রামের নোট"),
};
export const statusNames = {
  submitted: words("Submitted", "জমা হয়েছে"), delivered: words("Delivered to simulated queue", "সিমুলেটেড তালিকায় পৌঁছেছে"),
  acknowledged: words("Acknowledged by simulated provider", "সিমুলেটেড সেবাদাতা গ্রহণ করেছেন"),
  responded: words("Simulated response recorded", "সিমুলেটেড উত্তর লিপিবদ্ধ হয়েছে"), closed: words("Closed", "বন্ধ"),
};
export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "object") return String(value).replaceAll("_", " ");
  return Object.entries(value).filter(([, item]) => item !== null && item !== undefined)
    .map(([key, item]) => `${key.replace(/([A-Z])/g, " $1")}: ${displayValue(item)}`).join(" · ");
}
export function permissionState(expiresAt: string, revokedAt: string | null, now = Date.now()) {
  if (revokedAt) return "revoked";
  return Date.parse(expiresAt) <= now ? "expired" : "active";
}
