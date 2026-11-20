/**
 * Plain-language overview of ANY printed maternal report, built from OCR text with a fixed glossary.
 * It only explains what words mean. It never reads values as normal/abnormal, never diagnoses,
 * and never uses a model, so the same photo always gives the same explanation.
 */
export type Copy = { en: string; bn: string };
export type OverviewTerm = { key: string; title: Copy; meaning: Copy; seen: string };
export type ReportOverview = { kind: "worker-list" | "antenatal" | "unknown"; intro: Copy; terms: OverviewTerm[]; timeMentions: string[] };

type Entry = { key: string; match: RegExp; title: Copy; meaning: Copy; group: "worker" | "antenatal" | "both" };
const entries: Entry[] = [
  { key: "referral", group: "worker", match: /\b(?:open\s+)?referrals?\b|date\s+referred/i,
    title: { en: "Referral", bn: "রেফার করা" },
    meaning: { en: "A health worker sent this woman to a clinic or hospital for a check-up or care. “Open” means that visit is not yet marked as finished.", bn: "স্বাস্থ্যকর্মী এই মাকে চেকআপ বা চিকিৎসার জন্য ক্লিনিক বা হাসপাতালে পাঠিয়েছেন। “Open” মানে সেই যাওয়া এখনো শেষ হয়েছে বলে লেখা নেই।" } },
  { key: "chw", group: "worker", match: /\bchw\b|community\s+health\s+worker/i,
    title: { en: "CHW (community health worker)", bn: "CHW (কমিউনিটি স্বাস্থ্যকর্মী)" },
    meaning: { en: "A trained health worker who visits mothers at home or in the village.", bn: "প্রশিক্ষিত স্বাস্থ্যকর্মী, যিনি গ্রামে বা বাড়িতে গিয়ে মায়েদের দেখেন।" } },
  { key: "months", group: "both", match: /months?\s+pregnant|pregnan(?:t|cy)\s+months?/i,
    title: { en: "Months pregnant", bn: "কত মাসের গর্ভবতী" },
    meaning: { en: "How many months the pregnancy has lasted so far.", bn: "গর্ভধারণের পর এখন পর্যন্ত কত মাস হয়েছে।" } },
  { key: "danger", group: "both", match: /danger\s+signs?/i,
    title: { en: "Danger signs", bn: "বিপদচিহ্ন" },
    meaning: { en: "Warning symptoms during pregnancy, such as high fever, strong headache, blurred vision or unusual stomach pain. If you have any of these, contact a health worker or clinic straight away.", bn: "গর্ভাবস্থার সতর্ক লক্ষণ, যেমন তীব্র জ্বর, প্রচণ্ড মাথাব্যথা, চোখে ঝাপসা দেখা বা অস্বাভাবিক পেটব্যথা। এগুলোর কোনোটি থাকলে এখনই স্বাস্থ্যকর্মী বা ক্লিনিকের সঙ্গে যোগাযোগ করুন।" } },
  { key: "high-risk", group: "both", match: /high[\s-]*risk(?:\s+factors?)?/i,
    title: { en: "High-risk factors", bn: "ঝুঁকির কারণ" },
    meaning: { en: "Things that mean a pregnancy needs closer care, for example being under 18 or over 35, or having had many pregnancies. It does not mean something is wrong now.", bn: "যেসব কারণে গর্ভাবস্থায় বাড়তি যত্ন দরকার, যেমন বয়স ১৮-র কম বা ৩৫-এর বেশি, বা আগে অনেকবার গর্ভধারণ। এর মানে এই নয় যে এখন কোনো সমস্যা আছে।" } },
  { key: "days-seen", group: "worker", match: /days?\s+since\s+last\s+(?:seen|visit)|last\s+(?:referral\s+)?visit/i,
    title: { en: "Days since last seen / last visit", bn: "শেষ দেখা বা শেষ ভিজিটের পর কত দিন" },
    meaning: { en: "How long ago a health worker last saw her. A large number can mean she is due for a visit.", bn: "স্বাস্থ্যকর্মী শেষবার কবে দেখেছেন। সংখ্যাটি বড় হলে নতুন ভিজিটের সময় হয়েছে বোঝাতে পারে।" } },
  { key: "checklist", group: "both", match: /(?:incomplete\s+)?checklist(?:\s+items?)?|incomplete/i,
    title: { en: "Incomplete checklist items", bn: "বাকি থাকা চেকলিস্টের কাজ" },
    meaning: { en: "Routine pregnancy care steps that are not yet recorded as done.", bn: "গর্ভাবস্থার নিয়মিত যত্নের যে ধাপগুলো এখনো করা হয়েছে বলে লেখা নেই।" } },
  { key: "followup", group: "worker", match: /follow[\s-]*up|needing\s+follow/i,
    title: { en: "Needs follow-up", bn: "ফলোআপ দরকার" },
    meaning: { en: "The health worker should check on these women again.", bn: "এই মায়েদের আবার খোঁজ নেওয়া স্বাস্থ্যকর্মীর দরকার।" } },
  { key: "tetanus", group: "antenatal", match: /tetanus|\bTT\b|\bTd\b/i,
    title: { en: "Tetanus vaccine", bn: "টিটেনাস টিকা" },
    meaning: { en: "A vaccine given in pregnancy that protects the mother and newborn from tetanus.", bn: "গর্ভাবস্থায় দেওয়া টিকা, যা মা ও নবজাতককে টিটেনাস থেকে রক্ষা করে।" } },
  { key: "bp", group: "antenatal", match: /blood\s+pressure|\bBP\b/i,
    title: { en: "Blood pressure (BP)", bn: "রক্তচাপ (BP)" },
    meaning: { en: "The force of blood in your blood vessels. It is checked at every pregnancy visit, because high blood pressure needs a clinician's attention.", bn: "রক্তনালিতে রক্তের চাপ। প্রতিটি গর্ভকালীন ভিজিটে মাপা হয়, কারণ উচ্চ রক্তচাপে চিকিৎসকের নজর লাগে।" } },
  { key: "hb", group: "antenatal", match: /haemoglobin|hemoglobin|\bHb\b|\bHGB\b/i,
    title: { en: "Hemoglobin (HB)", bn: "হিমোগ্লোবিন (HB)" },
    meaning: { en: "A blood protein that carries oxygen. A blood test checks it to look for anemia (low iron in the blood).", bn: "রক্তের যে প্রোটিন অক্সিজেন বহন করে। রক্তস্বল্পতা (রক্তে আয়রনের ঘাটতি) আছে কি না দেখতে রক্ত পরীক্ষায় মাপা হয়।" } },
  { key: "ultrasound", group: "antenatal", match: /ultrasound|sonograph|\bUSG\b/i,
    title: { en: "Ultrasound scan", bn: "আল্ট্রাসাউন্ড স্ক্যান" },
    meaning: { en: "A scan that uses sound waves to look at the baby and womb.", bn: "শব্দতরঙ্গ দিয়ে গর্ভের শিশু ও জরায়ু দেখার পরীক্ষা।" } },
  { key: "edd", group: "antenatal", match: /\bEDD\b|expected\s+date\s+of\s+delivery|due\s+date/i,
    title: { en: "Expected delivery date (EDD)", bn: "সম্ভাব্য প্রসবের তারিখ (EDD)" },
    meaning: { en: "The estimated date the baby is due. Most babies are born within a few weeks of it.", bn: "শিশুর জন্মের আনুমানিক তারিখ। বেশিরভাগ শিশু এই তারিখের কয়েক সপ্তাহের মধ্যে জন্মায়।" } },
  { key: "lmp", group: "antenatal", match: /\bLMP\b|last\s+menstrual/i,
    title: { en: "Last period (LMP)", bn: "শেষ মাসিকের তারিখ (LMP)" },
    meaning: { en: "The first day of your last period. It is used to estimate how many weeks pregnant you are.", bn: "শেষ মাসিকের প্রথম দিন। এর থেকে গর্ভের সপ্তাহ আন্দাজ করা হয়।" } },
  { key: "anc", group: "antenatal", match: /\bANC\b|antenatal|ante[\s-]natal/i,
    title: { en: "Antenatal care (ANC)", bn: "গর্ভকালীন সেবা (ANC)" },
    meaning: { en: "Regular check-ups during pregnancy to keep the mother and baby healthy.", bn: "মা ও শিশুর সুস্থতার জন্য গর্ভাবস্থায় নিয়মিত চেকআপ।" } },
  { key: "fever-etc", group: "both", match: /\bfever\b|headache|blurred\s+vision|stomach\s+pain|bleeding|swelling/i,
    title: { en: "Symptoms listed", bn: "লক্ষণের তালিকা" },
    meaning: { en: "Symptoms a health worker asked about or noted. If you have them now, contact a clinic. Do not wait for the next visit.", bn: "যেসব লক্ষণ স্বাস্থ্যকর্মী জিজ্ঞেস করেছেন বা লিখেছেন। এখন আপনার থাকলে অপেক্ষা না করে ক্লিনিকে যোগাযোগ করুন।" } },
];

export function buildReportOverview(rawText: string): ReportOverview {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const terms: OverviewTerm[] = [];
  for (const entry of entries) {
    const line = lines.find((item) => entry.match.test(item));
    if (line) terms.push({ key: entry.key, title: entry.title, meaning: entry.meaning, seen: line.slice(0, 120) });
  }
  const workerHits = terms.filter((term) => entries.find((entry) => entry.key === term.key)?.group === "worker").length;
  const antenatalHits = terms.filter((term) => entries.find((entry) => entry.key === term.key)?.group === "antenatal").length;
  const kind = workerHits >= 2 ? "worker-list" : antenatalHits >= 1 || terms.length >= 2 ? "antenatal" : "unknown";
  const intro: Copy = kind === "worker-list"
    ? { en: "This looks like a health worker's follow-up list of pregnant women: who was referred to a clinic, who is at higher risk, and which care steps are still not done. It is a list for the health worker, not a personal test result.", bn: "দেখে মনে হচ্ছে এটি স্বাস্থ্যকর্মীর গর্ভবতী মায়েদের ফলোআপ তালিকা: কাকে ক্লিনিকে পাঠানো হয়েছে, কে বেশি ঝুঁকিতে, আর কোন যত্নের ধাপ এখনো বাকি। এটি স্বাস্থ্যকর্মীর জন্য তালিকা, আপনার নিজের পরীক্ষার ফল নয়।" }
    : kind === "antenatal"
      ? { en: "This looks like a pregnancy care record. Below is what the words on it mean.", bn: "দেখে মনে হচ্ছে এটি গর্ভকালীন সেবার রেকর্ড। এতে লেখা শব্দগুলোর মানে নিচে দেওয়া হলো।" }
      : { en: "We could not tell what kind of report this is.", bn: "এটি কোন ধরনের রিপোর্ট, তা বোঝা যায়নি।" };
  // Quote how time is printed; never convert or infer a gestational age.
  const timeMentions = [...new Set(Array.from(rawText.matchAll(/(?<!\d\s*[-–]\s*)\b\d{1,2}\s*(?:weeks?|wks?|months?)\b[^\n]{0,20}/gi), (match) => match[0].trim()))].slice(0, 4);
  return { kind, intro, terms, timeMentions };
}
