import { bartaAnswerSchema, type BartaAnswer, type BartaRequest } from "@/lib/contracts/barta";
import { educationTopics } from "./education-topics";
import { getBartaRouteResponse } from "./safety-gate";

const pregnancyStatement = {
  en: "I may be pregnant and I am bleeding",
  bn: "গর্ভধারণের সম্ভাবনা আছে এবং রক্তপাত হচ্ছে",
};

const afterBirthStatement = {
  en: "I have bleeding after giving birth",
  bn: "প্রসবের পর রক্তপাত হচ্ছে",
};

const period = /(?:\b(?:periods?|menstruat\w*|masik|mashik|piriyod|piriot)\b|মাসিক|ঋতুস্রাব|পিরি(?:য়|ও|অ)ড)/u;
const pregnancyRisk = /(?:\b(?:i(?:'m| am) pregnant|i may be pregnant|might be pregnant|possible pregnancy|pregnancy test (?:is |was )?positive)\b|আমি গর্ভবতী|গর্ভধারণের সম্ভাবনা|গর্ভাবস্থায়)/u;
const afterBirth = /(?:\b(?:after (?:giving birth|childbirth|delivery)|postpartum|delivery(?:r| er) por)\b|প্রসবের পর|সন্তান জন্মের পর)/u;
const ordinaryPeriod = /(?:\busual period|ordinary period|normal period|স্বাভাবিক সময়ের মাসিক|নিয়মিত মাসিক)/u;
const plainBleedingReport = /^(?:i am experiencing bleeding|আমার রক্তপাত হচ্ছে)[.!।]?$/u;
const currentBleeding = /(?:\b(?:bleeding|spotting)\b|রক্তপাত|রক্ত যাচ্ছে)/u;

export function getBartaBleedingClarification(question: string, language: BartaRequest["language"]): BartaAnswer | undefined {
  const text = question.normalize("NFKC").toLowerCase().replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim();
  if (!period.test(text) && !currentBleeding.test(text)) return undefined;

  // Pregnancy/postpartum statements take priority over the word "period."
  const happening = /(?:চল|হচ্ছে|শুরু হয়েছে|চলছে|\b(?:started|on my period|right now)\b)/u;
  if (pregnancyRisk.test(text) && (currentBleeding.test(text) || happening.test(text))) {
    return getBartaRouteResponse("urgent_care", language);
  }
  if (afterBirth.test(text) && (currentBleeding.test(text) || /(?:চল|হচ্ছে|\b(?:on my period|started my period)\b)/u.test(text))) {
    return bartaAnswerSchema.parse({
      status: "abstained", reason: "outside_education_scope", answer: null, citations: [],
      message: language === "bn"
        ? "প্রসবের পর রক্তপাতকে মাসিক ধরে নেবেন না। রক্তপাত বাড়লে, জ্বর হলে বা দুর্গন্ধ হলে মাতৃসেবা দলের সঙ্গে যোগাযোগ করুন। হঠাৎ খুব বেশি রক্তপাত হলে বা অজ্ঞান লাগলে এখনই জরুরি চিকিৎসা নিন।"
        : "Bleeding after birth can have different causes. Contact your maternity team if it gets heavier or comes with a fever or unusual smell. If bleeding is suddenly very heavy or you feel faint, seek emergency care now.",
    });
  }

  const latePeriod = /(?:\b(?:late|missed) period|period (?:is late|has not started)|মাসিক(?:ের)? (?:দেরি|হচ্ছে না|বন্ধ))/u;
  if ((!period.test(text) && !plainBleedingReport.test(text)) || latePeriod.test(text) || ordinaryPeriod.test(text) || text === educationTopics.periodCare[language].toLowerCase().normalize("NFKC")) return undefined;

  return bartaAnswerSchema.parse({
    status: "clarification", answer: null, citations: [],
    message: language === "bn"
      ? "এটা কি আপনার স্বাভাবিক সময়ের মাসিক, গর্ভধারণের সম্ভাবনা আছে, নাকি সম্প্রতি সন্তান জন্ম দিয়েছেন? রক্তপাত খুব বেশি হলে, তীব্র ব্যথা হলে বা অজ্ঞান লাগলে এখনই জরুরি চিকিৎসা নিন।"
      : "Is this your usual period, could you be pregnant, or have you recently given birth? If bleeding is very heavy, you have severe pain, or you feel faint, seek emergency care now.",
    suggestions: [educationTopics.periodCare[language], pregnancyStatement[language], afterBirthStatement[language]],
  });
}


export function getUsualPeriodQuestion(question: string, language: BartaRequest["language"]): string | undefined {
  const text = question.normalize("NFKC").toLowerCase().trim();
  if (ordinaryPeriod.test(text)
    && /(?:\b(?:cramps?|ease|what should i do|what can i do)\b|ব্যথা|ক[িী] কর)/u.test(text)
    && !/(?:\b(?:heavy|heavier|late|missed|faint|severe|longer|worse)\b|বেশি রক্ত|তীব্র|অনেক দিন|দেরি|অজ্ঞান)/u.test(text)) {
    return educationTopics.periodCare[language];
  }
}
