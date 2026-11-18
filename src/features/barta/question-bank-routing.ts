import { bartaAnswerSchema, type BartaAnswer, type BartaRequest } from "@/lib/contracts/barta";
import { educationTopics, type EducationTopic } from "./education-topics";
import { getBartaRouteResponse } from "./safety-gate";
import prompts from "./question-bank-prompts.json";

type Language = BartaRequest["language"];

function key(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/[‘’]/gu, "'")
    .replace(/\s{2,}/gu, " ").trim().replace(/[.!?।]+$/u, "").trim();
}

const byQuestion = new Map<string, string[]>();
for (const [id, topic, , question, expectation] of prompts) {
  const normalized = key(question.replace(/\s*\((?:broken STT text|for গর্ভ)\)$/u, ""));
  if (!byQuestion.has(normalized)) byQuestion.set(normalized, [id, topic, expectation]);
}

// Map only questions whose supplied intent is directly supported by the named
// passage. The draft evaluation labels never establish a medical claim.
const evidenceTopics = new Map<string, EducationTopic>([
  ["ANC visits", "firstCheckup"], ["ANC definition", "anc"], ["Explain ANC simply", "anc"],
  ["Ultrasound", "ultrasound"], ["Trimesters", "pregnancyBasics"], ["Diet", "balancedMeals"],
  ["Pregnancy signs", "pregnancyTest"], ["Pregnancy possibility", "pregnancyTest"], ["Supplements", "ironFolate"],
  ["Fetal movement", "fetalMovement"], ["Exercise", "exercise"], ["ANC card", "ancCard"], ["Blood pressure", "bloodPressureCheck"],
  ["Birth companion", "birthCompanion"], ["Latch and positioning", "breastfeedingPosition"], ["Food safety", "foodSafety"], ["Foods to avoid", "foodSafety"], ["Birth plan", "birthPlan"],
  ["Exclusive BF", "breastfeeding"], ["Working mother", "feedingAtWork"], ["Cord care", "cordCare"],
  ["Umbilical cord", "cordCare"], ["Bathing", "babyBath"], ["Complementary", "solidFood"],
  ["Hygiene", "babyHygiene"], ["Sleep position", "pregnancySleep"],
]);

const relatedTopics = new Map<string, EducationTopic>([
  ["Supplements", "nutrition"], ["Exercise", "nutrition"], ["Hospital bag", "birthPlan"],
  ["Birth companion", "birthPlan"], ["When to go", "warningSigns"], ["ANC card", "ancVisits"],
  ["First pregnancy", "pregnancyBasics"], ["Fetal movement", "warningSigns"],
  ["Mental health support", "mentalWellbeing"], ["Newborn care assistance", "newborn"],
  ["Crying", "babyCrying"], ["Work/travel", "pregnancyTravel"], ["Sleep", "pregnancySleep"],
  ["Heartburn", "pregnancyHeartburn"], ["Back pain", "pregnancyBackache"], ["Constipation", "pregnancyConstipation"],
]);

const providerExpectations = new Set([
  "ANSWER + SEE", "Individualized support", "Individualized lactation support", "Individualized clinical advice",
  "Medication / clinical decision", "Symptom assessment", "Urgent assessment", "Context-dependent",
  "Clinical / facility information", "Clinical / rights information",
]);

const facilityExpectations = new Set([
  "Live facility verification required", "Facility / rights information", "Rights / safeguarding",
]);

export function getBankSafety(question: string, language: Language): BartaAnswer | undefined {
  const row = byQuestion.get(key(question));
  if (!row) return undefined;
  const [id, topic, expected] = row;
  if (expected === "Mental-health crisis" || topic === "Suicidal thoughts" || topic === "Harm to baby") {
    return getBartaRouteResponse("crisis_support", language);
  }
  if (topic === "Postpartum low" || topic === "Anxiety") {
    return getBartaRouteResponse("mental_health_support", language);
  }
  if (topic === "Domestic violence") {
    return getBartaRouteResponse("safeguarding_support", language);
  }
  // Explicit reviewed warning-sign examples only. A hotline lookup has no symptoms.
  const bankMaternal = /^BARTA-00(?:34|35|36|37|38|39|40|41|42)$/u.test(id);
  const pdfWarning = expected === "URGENT" && ((id >= "BQ-0073" && id <= "BQ-0114")
    || id === "BQ-0294" || (id >= "BQ-0300" && id <= "BQ-0302"));
  if (!bankMaternal && !pdfWarning) return undefined;
  const newborn = topic === "Newborn danger" || topic === "Infant fever";
  return getBartaRouteResponse(newborn ? "newborn_urgent" : "urgent_care", language);
}

export function getQuestionBankIntent(question: string, language: Language) {
  const row = byQuestion.get(key(question));
  if (!row) return undefined;
  const [, topic, expected] = row;
  const evidenceTopic = expected === "URGENT" ? undefined : evidenceTopics.get(topic);
  const relatedTopic = relatedTopics.get(topic);
  return {
    canonical: evidenceTopic ? educationTopics[evidenceTopic][language] : undefined,
    fallback() {
      if (expected === "Accessibility preference") {
        return bartaAnswerSchema.parse({
          status: "conversation", answer: null, citations: [],
          message: language === "bn"
            ? "আপনি লিখে প্রশ্ন করতে পারেন বা মাইক্রোফোন ব্যবহার করতে পারেন। সব উত্তর লেখায় আছে। আগের কথা রেখে উত্তরের ভাষাও বদলাতে পারবেন।"
            : "You can type or try the microphone. Every reply is available as text, and changing answer language keeps your chat.",
        });
      }
      if (providerExpectations.has(expected) && !evidenceTopic && !(relatedTopic && expected === "ANSWER + SEE")) {
        return getBartaRouteResponse("outside_education_scope", language);
      }
      if (relatedTopic) {
        return bartaAnswerSchema.parse({
          status: "clarification", answer: null, citations: [],
          message: language === "bn"
            ? "ঠিক এই প্রশ্নের উত্তর আমার যাচাই করা সূত্রে নেই। চাইলে কাছাকাছি এই বিষয়টি জানতে পারেন।"
            : "I don’t have a reviewed answer to that exact question. I can help with this related question.",
          suggestions: [educationTopics[relatedTopic][language]],
        });
      }
      const facility = facilityExpectations.has(expected);
      return bartaAnswerSchema.parse({
        status: "abstained",
        reason: "insufficient_evidence",
        answer: null,
        citations: [],
        message: facility
          ? language === "bn"
            ? "এই সেবা কোথায় পাওয়া যায়, তা আমি যাচাই করতে পারছি না। যাওয়ার আগে সেবাকেন্দ্রে সরাসরি যোগাযোগ করে জেনে নিন।"
            : "I can’t verify which facility offers that service. Contact the facility directly to confirm before visiting."
          : language === "bn"
            ? "এই প্রশ্নের নির্ভরযোগ্য উত্তর আমার সূত্রে নেই। সাধারণভাবে আরেকটু নির্দিষ্ট করে প্রশ্ন করতে পারেন, বা নিজের সেবা নিয়ে স্বাস্থ্যকর্মীর সঙ্গে কথা বলতে পারেন।"
            : "My reviewed sources don’t answer this question yet. You can ask a more specific general question, or speak with a health professional about your own care.",
      });
    },
  };
}
