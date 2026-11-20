import type { ExtractedReportField } from "./types";
import { isHemoglobinLabel, parseNumeric } from "./validation";

export type UnderstandingLanguage = "bn" | "en";
type Copy = { bn: string; en: string };
export type LearningSource = { title: string; url: string };
type Topic = { matches: (field: ExtractedReportField) => boolean; meaning: Copy; context: Copy; question: Copy; source: LearningSource };
const generalSource = { title: "MedlinePlus · Understanding lab results", url: "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/" };
const topics: Topic[] = [
  {
    matches: (field) => /^(?:white blood cell(?:s)?(?: count)?|wbc|total leukocyte count|tlc)$/i.test(field.label.trim()),
    meaning: { bn: "শ্বেত রক্তকণিকা শরীরকে সংক্রমণের বিরুদ্ধে লড়তে সাহায্য করে। এই পরীক্ষা রক্তে সেগুলোর সংখ্যা মাপে।", en: "White blood cells help your body fight infection. This test measures their number in your blood." },
    context: { bn: "চিকিৎসক রক্তের অন্য ফল ও আপনার স্বাস্থ্যতথ্যের সঙ্গে এটি মিলিয়ে দেখেন। শুধু এই ফল দিয়ে রোগ বা চিকিৎসা নির্ধারণ করা হচ্ছে না।", en: "Your clinician interprets this alongside your other blood results and health history. This result alone is not being used to determine a diagnosis or treatment." },
    question: { bn: "অন্য রক্তপরীক্ষার সঙ্গে এই ফল কী বোঝায়? ফলোআপ দরকার কি?", en: "What does this result mean alongside my other blood tests? Is follow-up needed?" },
    source: { title: "MedlinePlus · Complete blood count", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/" },
  },
  {
    matches: (field) => /^(?:red blood cell(?:s)?(?: count)?|rbc)$/i.test(field.label.trim()),
    meaning: { bn: "লোহিত রক্তকণিকা শরীরে অক্সিজেন বহন করে। এই পরীক্ষা রক্তে সেগুলোর সংখ্যা মাপে।", en: "Red blood cells carry oxygen around your body. This test measures their number in your blood." },
    context: { bn: "চিকিৎসক রক্তের অন্য ফল ও আপনার স্বাস্থ্যতথ্যের সঙ্গে এটি মিলিয়ে দেখেন। শুধু এই ফল দিয়ে রোগ বা চিকিৎসা নির্ধারণ করা হচ্ছে না।", en: "Your clinician interprets this alongside your other blood results and health history. This result alone is not being used to determine a diagnosis or treatment." },
    question: { bn: "অন্য রক্তপরীক্ষার সঙ্গে এই ফল কী বোঝায়? ফলোআপ দরকার কি?", en: "What does this result mean alongside my other blood tests? Is follow-up needed?" },
    source: { title: "MedlinePlus · Complete blood count", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/" },
  },
  {
    matches: (field) => /^(?:hematocrit|haematocrit|hct|pcv)$/i.test(field.label.trim()),
    meaning: { bn: "হেমাটোক্রিট বলে রক্তের কতটা অংশ লোহিত রক্তকণিকা দিয়ে তৈরি।", en: "Hematocrit measures how much of your blood is made up of red blood cells." },
    context: { bn: "চিকিৎসক রক্তের অন্য ফল ও আপনার স্বাস্থ্যতথ্যের সঙ্গে এটি মিলিয়ে দেখেন। শুধু এই ফল দিয়ে রোগ বা চিকিৎসা নির্ধারণ করা হচ্ছে না।", en: "Your clinician interprets this alongside your other blood results and health history. This result alone is not being used to determine a diagnosis or treatment." },
    question: { bn: "অন্য রক্তপরীক্ষার সঙ্গে এই ফল কী বোঝায়? ফলোআপ দরকার কি?", en: "What does this result mean alongside my other blood tests? Is follow-up needed?" },
    source: { title: "MedlinePlus · Complete blood count", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/" },
  },
  {
    matches: (field) => /^(?:mean corpuscular volume|mcv)$/i.test(field.label.trim()),
    meaning: { bn: "MCV লোহিত রক্তকণিকার গড় আকার বোঝায়।", en: "MCV describes the average size of your red blood cells." },
    context: { bn: "চিকিৎসক রক্তের অন্য ফল ও আপনার স্বাস্থ্যতথ্যের সঙ্গে এটি মিলিয়ে দেখেন। শুধু এই ফল দিয়ে রোগ বা চিকিৎসা নির্ধারণ করা হচ্ছে না।", en: "Your clinician interprets this alongside your other blood results and health history. This result alone is not being used to determine a diagnosis or treatment." },
    question: { bn: "অন্য রক্তপরীক্ষার সঙ্গে এই ফল কী বোঝায়? ফলোআপ দরকার কি?", en: "What does this result mean alongside my other blood tests? Is follow-up needed?" },
    source: { title: "MedlinePlus · Complete blood count", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/" },
  },
  {
    matches: (field) => isHemoglobinLabel(field.label),
    meaning: { bn: "হিমোগ্লোবিন লোহিত রক্তকণিকার একটি প্রোটিন, যা শরীরে অক্সিজেন বহন করে।", en: "Hemoglobin is a protein in red blood cells that carries oxygen around your body." },
    context: { bn: "গর্ভাবস্থা ও অন্য স্বাস্থ্যতথ্য বিবেচনা করে চিকিৎসক এই ফল ব্যাখ্যা করেন। শুধু এই মান থেকে রক্তস্বল্পতার কারণ বা ওষুধের প্রয়োজন নির্ধারণ করা যায় না।", en: "Pregnancy and your other health information matter when interpreting this result. This number alone cannot establish the cause of anemia or which treatment you need." },
    question: { bn: "আমার গর্ভকালে এই হিমোগ্লোবিনের ফল কী বোঝায়? অন্য কোনো পরীক্ষা দরকার কি?", en: "What does this hemoglobin result mean at my stage of pregnancy? Do I need any other tests?" },
    source: { title: "MedlinePlus · Hemoglobin test", url: "https://medlineplus.gov/lab-tests/hemoglobin-test/" },
  },
  {
    matches: (field) => /^(?:(?:fasting|random|blood|plasma)\s+)?glucose$/i.test(field.label.trim()),
    meaning: { bn: "এই পরীক্ষা রক্তে গ্লুকোজ বা শর্করার পরিমাণ মাপে।", en: "This test measures the amount of glucose, a type of sugar, in your blood." },
    context: { bn: "খালি পেটে, খাবারের পরে বা গ্লুকোজ পান করার পরে পরীক্ষা হয়েছে কি না জানা জরুরি। এসব পরীক্ষার ফল একভাবে ব্যাখ্যা করা যায় না। এই একটি ফল থেকে গর্ভকালীন ডায়াবেটিস নির্ণয় করা হচ্ছে না।", en: "The testing conditions matter: fasting, after a meal, and after a glucose drink are different tests. This result alone is not being used to diagnose gestational diabetes." },
    question: { bn: "এটি কোন ধরনের শর্করার পরীক্ষা? আমার গর্ভকালের জন্য ফলটি কী বোঝায়?", en: "Which type of glucose test was this, and what does the result mean for my pregnancy?" },
    source: { title: "MedlinePlus · Blood glucose test", url: "https://medlineplus.gov/lab-tests/blood-glucose-test/" },
  },
  {
    matches: (field) => /^(?:platelet(?:s)?(?: count)?|plt)$/i.test(field.label.trim()),
    meaning: { bn: "প্লেটলেট রক্ত জমাট বাঁধতে সাহায্য করে। এই পরীক্ষা রক্তে প্লেটলেটের সংখ্যা মাপে।", en: "Platelets help blood clot. This test measures how many platelets are in your blood." },
    context: { bn: "চিকিৎসক অন্য রক্তপরীক্ষা ও আপনার স্বাস্থ্যতথ্যের সঙ্গে এই ফল মিলিয়ে দেখেন। শুধু এই সংখ্যা দিয়ে রক্তপাতের ঝুঁকি বা রোগ নির্ধারণ করা হচ্ছে না।", en: "Your clinician considers this alongside other blood tests and your health information. This number is not being used on its own to determine a diagnosis or bleeding risk." },
    question: { bn: "অন্য রক্তপরীক্ষার সঙ্গে এই প্লেটলেটের ফল কী বোঝায়? আবার পরীক্ষা দরকার কি?", en: "What does this platelet result mean alongside my other blood tests? Does it need repeating?" },
    source: { title: "MedlinePlus · Complete blood count", url: "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/" },
  },
];
export type RangeComparison = { position: "below" | "inside" | "above"; lower: string; upper: string; unit: string };
const normalizedUnit = (unit: string) => unit.trim().replace(/\s/g, "").replace(/µ/g, "μ").toLowerCase();

/** Compare only an explicit, same-unit printed interval; never supply population/trimester cutoffs. */
export function comparePrintedRange(field: ExtractedReportField): RangeComparison | null {
  if (field.reviewStatus !== "verified" || field.ultrasound || field.unitUnavailable || !field.unit.trim()) return null;
  const range = field.referenceRange?.trim().match(/^(?:(?:ref(?:erence)?(?: range)?|range)\s*[:=]?\s*)?([0-9০-৯]+(?:\.[0-9০-৯]+)?)\s*(?:[-–—]|to)\s*([0-9০-৯]+(?:\.[0-9০-৯]+)?)\s*(.*)$/i);
  if (!range) return null;
  const unit = range[3].trim() || field.laboratory?.referenceIntervalUnit || "";
  if (!unit || normalizedUnit(unit) !== normalizedUnit(field.unit)) return null;
  const parsed = [field.value, range[1], range[2]].map((value) => parseNumeric(value));
  if (parsed.some((value) => value.kind !== "number")) return null;
  const [value, lower, upper] = parsed.map((item) => Number(item.normalized));
  if (![value, lower, upper].every(Number.isFinite) || lower >= upper || value < 0) return null;
  return { position: value < lower ? "below" : value > upper ? "above" : "inside", lower: range[1], upper: range[2], unit };
}

export function explainCheckedField(field: ExtractedReportField, language: UnderstandingLanguage) {
  if (field.reviewStatus !== "verified") return null;
  const topic = topics.find((item) => item.matches(field));
  const scan = Boolean(field.ultrasound);
  const fallback: Topic = {
    matches: () => true,
    meaning: {
      bn: scan ? "এটি আপনার স্ক্যান রিপোর্টে লেখা তথ্য। মূল শব্দ ও মান এখানে রাখা হয়েছে।" : "এটি মূল রিপোর্টের সঙ্গে মিলিয়ে দেখা আপনার তথ্য। এই পরীক্ষার নির্দিষ্ট ব্যাখ্যা এখনো যোগ করা হয়নি।",
      en: scan ? "This is a finding or measurement documented in your scan. Its original wording and value are preserved here." : "This is information you checked against the original report. A test-specific explanation is not available yet.",
    },
    context: { bn: "পুরো রিপোর্ট, গর্ভকাল ও স্বাস্থ্যতথ্য মিলিয়ে চিকিৎসক এর অর্থ ব্যাখ্যা করবেন। অনুপস্থিত তথ্য বা শিশুর সুস্থতা অনুমান করা হচ্ছে না।", en: "A clinician needs the full report, pregnancy context and health history to interpret this. Missing information and your baby's health are not being inferred." },
    question: { bn: "এই রিপোর্টে লেখা ফলটির অর্থ কী? পরের পদক্ষেপ বা ফলোআপ কী হবে?", en: "What does this documented finding mean, and what follow-up is needed?" },
    source: generalSource,
  };
  const selected = topic ?? fallback;
  return { meaning: selected.meaning[language], context: selected.context[language], question: selected.question[language], source: selected.source, comparison: comparePrintedRange(field), supported: Boolean(topic) };
}

export function understandingSummary(fields: ExtractedReportField[]) {
  const checked = fields.filter((field) => field.reviewStatus === "verified");
  const comparisons = checked.map(comparePrintedRange);
  return {
    checked: checked.length,
    pending: fields.filter((field) => field.reviewStatus === "pending").length,
    excluded: fields.filter((field) => field.reviewStatus === "rejected").length,
    outsidePrinted: comparisons.filter((item) => item && item.position !== "inside").length,
    noComparison: comparisons.filter((item) => !item).length,
  };
}
