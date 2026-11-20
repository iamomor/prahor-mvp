import type { BartaAnswer, BartaFollowUp, BartaRequest } from "@/lib/contracts/barta";
import { getBartaStageReply, normalizeBartaText } from "./barta-understanding";
import type { EducationTopic } from "./education-topics";

type Language = BartaRequest["language"];

const stageOptions = {
  en: ["During pregnancy", "After birth", "Something else"],
  bn: ["গর্ভাবস্থায়", "প্রসবের পরে", "অন্য কিছু"],
};

const headacheReport = /^(?:(?:i (?:have|have got|got) )?(?:a )?headache|my head hurts|(?:amar )?matha ?(?:betha|byatha|bytha)(?: (?:hocche|hochhe|korche))?|(?:আমার )?মাথা ?ব্যথা(?: করছে| হচ্ছে)?)$/u;
const durationOnly = /^(?:(?:since )?(?:yesterday|this morning|last night|today)|just now|for \d{1,2} (?:hours?|days?)|(?:aj|aaj|kal|sokal) theke|(?:আজ|কাল|গতকাল|সকাল) থেকে|এইমাত্র)$/u;

export function getBartaSymptomContext(question: string, isSymptomReport: boolean): BartaFollowUp | undefined {
  if (headacheReport.test(normalizeBartaText(question))) return "headache_stage";
  // AAC compositions: "I have a headache. I feel dizzy." still gets the stage question (ported from the M2 kit patch).
  const parts = question.split(/[.!?।\n]+/u).map(part => normalizeBartaText(part)).filter(Boolean);
  if (parts.length > 1 && parts.some(part => headacheReport.test(part))) return "headache_stage";
  if (isSymptomReport) return "symptom_stage";
}

export function askBartaSymptomStage(context: BartaFollowUp, language: Language): BartaAnswer {
  const headache = context === "headache_stage";
  return {
    status: "clarification", answer: null, citations: [], followUpContext: context,
    suggestions: stageOptions[language],
    message: language === "bn"
      ? (headache ? "মাথাব্যথাটি কি গর্ভাবস্থায় হচ্ছে, প্রসবের পরে হচ্ছে, নাকি অন্য সময়ে?"
        : "এই লক্ষণটি কি গর্ভাবস্থায় হচ্ছে, প্রসবের পরে হচ্ছে, নাকি অন্য সময়ে?")
      : (headache ? "Is the headache happening during pregnancy, after giving birth, or at another time?"
        : "Is this happening during pregnancy, after giving birth, or at another time?"),
  };
}

export function continueBartaSymptom(
  context: BartaFollowUp, question: string, language: Language,
): { answer: BartaAnswer; topics?: EducationTopic[] } | undefined {
  const stage = getBartaStageReply(question)?.id;
  if (durationOnly.test(normalizeBartaText(question))) {
    return { answer: askBartaSymptomStage(context, language) };
  }

  const after = stage === "stage_after" || stage === "new_baby";
  const pregnant = stage === "stage_pregnancy" || stage === "is_pregnant";
  if (!after && !pregnant && stage !== "stage_other") return undefined;

  const headache = context === "headache_stage";
  const topics: EducationTopic[] = after ? ["postnatalVisits", "postnatal"]
    : pregnant && headache ? ["warningSigns", "bloodPressureCheck"]
      : pregnant ? ["warningSigns", "ancVisits"] : [];
  const stageName = after ? { en: "after giving birth", bn: "প্রসবের পরে" } : { en: "during pregnancy", bn: "গর্ভাবস্থায়" };
  const symptom = headache ? { en: "headache", bn: "মাথাব্যথা" } : { en: "symptom", bn: "লক্ষণ" };
  const message = stage === "stage_other"
    ? (language === "bn" ? "আপনার লক্ষণটি নিয়ে স্বাস্থ্যকর্মীর সঙ্গে কথা বলতে পারেন। সাধারণ তথ্য জানতে কী জানতে চান, কয়েকটি শব্দে লিখুন।"
      : "You can discuss the symptom with a healthcare professional. If you’d like general information, tell me what you want to know in a few words.")
    : (language === "bn"
      ? stageName.bn + " এই " + symptom.bn + " হচ্ছে বুঝলাম। কী করবেন জানতে আপনার সেবাদানকারী দলের সঙ্গে কথা বলুন।"
      : "I understand the " + symptom.en + " is happening " + stageName.en + ". Contact your care team to discuss what to do.");
  const warning = headache && (after || pregnant)
    ? (language === "bn"
      ? " মাথাব্যথা খুব তীব্র হলে, না কমলে বা সঙ্গে চোখে ঝাপসা দেখলে এখনই চিকিৎসা নিন।"
      : " Get medical help now if the headache is severe, won’t go away, or comes with blurred vision.")
    : "";
  return { answer: { status: "clarification", answer: null, citations: [], suggestions: [], message: message + warning }, topics };
}
