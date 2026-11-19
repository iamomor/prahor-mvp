import {
  bartaAnswerSchema,
  type BartaAnswer,
  type BartaRequest,
} from "@/lib/contracts/barta";

type Route = "urgent_care" | "newborn_urgent" | "crisis_support" | "mental_health_support" | "outside_education_scope" | "safeguarding_support";

const fixedMessages = {
  urgent_care: {
    en: "If this is happening now during pregnancy or after birth, seek medical care immediately at the nearest emergency department or maternity facility. Please don’t wait for a chat reply.",
    bn: "গর্ভাবস্থায় বা সন্তান জন্মের পর এখন এমন কিছু ঘটলে, নিকটস্থ হাসপাতালের জরুরি বিভাগ বা মাতৃসেবা কেন্দ্রে এখনই চিকিৎসা নিন। চ্যাটের উত্তরের জন্য অপেক্ষা করবেন না।",
  },
  newborn_urgent: {
    en: "If this is happening to a newborn now, seek medical care immediately at the nearest hospital emergency department. Please don’t wait for a chat reply.",
    bn: "নবজাতকের এখন এমন সমস্যা হলে নিকটস্থ হাসপাতালের জরুরি বিভাগে এখনই চিকিৎসা নিন। চ্যাটের উত্তরের জন্য অপেক্ষা করবেন না।",
  },
  safeguarding_support: {
    en: "I’m sorry this is happening. If you’re in immediate danger, get to a safer place if you can and seek emergency help. If it’s safe to do so, tell a trusted person or a health worker privately.",
    bn: "আপনার সঙ্গে এমন হচ্ছে শুনে দুঃখিত। এখন বিপদে থাকলে সম্ভব হলে নিরাপদ জায়গায় যান এবং জরুরি সহায়তা নিন। নিরাপদ হলে বিশ্বস্ত কাউকে বা স্বাস্থ্যকর্মীকে একান্তে জানান।",
  },
  crisis_support: {
    en: "I’m sorry you’re going through this. If you might hurt yourself or your baby, seek emergency help now. If you can, ask someone you trust to stay with you and help you get to an emergency department.",
    bn: "এমন কঠিন সময়ের মধ্যে দিয়ে যাচ্ছেন শুনে দুঃখিত। নিজের বা শিশুর ক্ষতি করার আশঙ্কা থাকলে এখনই জরুরি সহায়তা নিন। সম্ভব হলে বিশ্বাস করেন এমন কাউকে পাশে থাকতে এবং জরুরি বিভাগে যেতে সাহায্য করতে বলুন।",
  },
  mental_health_support: {
    en: "A health professional can help you talk through how you’re feeling during pregnancy or after birth. If you might hurt yourself or your baby, seek emergency help now.",
    bn: "গর্ভাবস্থায় বা সন্তান জন্মের পর আপনার অনুভূতি নিয়ে একজন স্বাস্থ্যকর্মীর সঙ্গে কথা বলতে পারেন। নিজের বা শিশুর ক্ষতি করার আশঙ্কা থাকলে এখনই জরুরি সহায়তা নিন।",
  },
  outside_education_scope: {
    en: "Barta can help with general maternal-health information from its sources. For advice about your own care, please speak with a qualified health professional. You can also ask a general question here.",
    bn: "বার্তা তার সূত্র থেকে মাতৃস্বাস্থ্য বিষয়ে সাধারণ তথ্য দিতে পারে। নিজের সেবা নিয়ে পরামর্শের জন্য যোগ্য স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন। চাইলে এখানে একটি সাধারণ প্রশ্ন করতে পারেন।",
  },
};

const immediateHarm = [
  /\b(?:kill myself|end my life|hurt myself|want to die|feel suicidal|(?:don['’]t|do not) want to live|thoughts of (?:harming|hurting) myself)\b/u,
  /\b(?:want to|might|feel like|thoughts of) (?:hurt|harm)(?:ing)? my baby\b/u,
  /(?:আত্মহত্যা করতে|নিজেকে মেরে ফেল|নিজের ক্ষতি করতে|(?:বাচ্চার|শিশুর) ক্ষতি করতে চাই|মরে যেতে চাই)/u,
  /\b(?:ami more jete chai|nijeke mere felte chai|bacchar khoti korte chai)\b/u,
];

const urgent = [
  /\b(?:heavy (?:vaginal )?bleeding|bleeding heavily|convulsions?|having (?:a )?seizures?|reduced fetal movement|(?:my )?baby (?:isn['’]?t|is not|stopped) moving|baby (?:is )?moving less|baby (?:hasn't|has not) moved|my baby.s movements? (?:decrease|have decreased)|fever after (?:birth|delivery|giving birth))\b/u,
  /(?:প্রচুর রক্তপাত|অনেক রক্ত যাচ্ছে|বেশি রক্তপাত|খিঁচুনি|খিচুনি|(?:বাচ্চা|শিশু) (?:আজ |একদম )?ন(?:ড়|ড়)ছে না|(?:বাচ্চা|শিশু)র নড়াচড়া কম|শ্বাস নিতে কষ্ট|প্রসবের পর জ্বর|সন্তান জন্মের পর জ্বর)/u,
  /\b(?:beshi roktopat|prochur rokto jacche|rokto pore|kichuni hole|shash nite koshto|baby r movement kome gele|baccha (?:aj |ekdom )?norche na|bacchar norachora kom|(?:baccha|bacca|bachcha) ager moto (?:nora ?chora|norachora|narachara) (?:kore|kortese|korche|korteche) na|deliveryr por jor)\b/u,
];

const statedUrgency = /(?:^|[.!?।]\s*)(?:this is an urgent concern|আমার কাছে বিষয়টি জরুরি মনে হচ্ছে)(?=[.!?।]|$)/u;
const newbornTrouble = /(?:\b(?:newborn|newborn baby)\b.{0,55}\b(?:limp|unresponsive|has (?:a )?fever|won['’]t feed|not feeding|struggling to breathe)\b|নবজাতক.{0,24}(?:দুধ খাচ্ছে না|নিস্তেজ|জ্বর|সাড়া দিচ্ছে না|শ্বাস নিতে কষ্ট)|\b(?:newborn|nobojatok)(?:er)?\b.{0,40}\b(?:jor|dudh khay na|dudh khacche na|shash nite koshto)\b)/u;
const maternalWarning = /\b(?:chest pain|severe (?:abdominal|belly) pain|i (?:have )?fainted|(?:my )?waters? (?:has |have )?broken|umbilical cord (?:is )?(?:coming out|visible))\b/u;
const pregnancyBleeding = /(?:\b(?:bleeding|bleed|spotting)\b|রক্তপাত|রক্ত যাচ্ছে)/u;
const breathingTrouble = /\b(?:difficulty breathing|trouble breathing|can['’]t breathe)\b/u;
const cannotKeepFluids = /(?:\b(?:can['’]t|cannot|unable to) keep (?:any )?(?:water|fluids|liquids) down\b|পানি পেটে থাকছে না|pani pete thakche na)/u;
const severeHeadache = /(?:\b(?:severe|bad) headache\b|তীব্র মাথাব্যথা|খুব মাথা ব্যথা|\bkhub matha betha\b)/u;
const pregnancy = /(?:\b(?:pregnancy|pregnant|gorboboti|gorbhoboti|gorbobosthay)\b|গর্ভাবস্থা|গর্ভবতী)/u;
const intensiveHeadache = /\bmatha (?:onek|beshi) (?:betha|byatha)\b/u;
const blurredVision = /(?:\b(?:blurred|blurry) vision\b|চোখে ঝাপসা|চোখে ঝাপসা দেখি|\bchokhe jhapsha\b)/u;
const postpartumSupport = /(?:\bpostpartum depression\b|\bdepressed after (?:birth|delivery)\b|প্রসবের পর বিষণ্ন|বাচ্চা হওয়ার পর মন খারাপ|\bdeliveryr por mon kharap\b)/u;

const outsideScope = [
  /\b(?:diagnose me|is my baby (?:okay|ok|safe)|prescribe|what (?:drug|medicine) should i take|can i take (?:this|that) (?:medicine|drug|tablet)|how (?:many pills|much medicine)|what dose|self-medicate|how (?:can i|to) (?:abort|end (?:my|a) pregnancy))\b/u,
  /\b(?:amar pa (?:fulay|fule|phule) (?:jacche|geche)|(?:ami )?\d+ maser pregnant.{0,30}ki test (?:lagbe|korbo)|(?:ei|eta) (?:oshudh|osudh) (?:khabo|khete pari))\b/u,
  /(?:কোন ওষুধ খাব|কতটা ওষুধ|ওষুধের ডোজ|আমার বাচ্চা কি ঠিক আছে|রোগ নির্ণয় করে|কীভাবে গর্ভপাত করব)/u,
  /\b(?:ignore (?:all |your |the )?(?:previous )?instructions|reveal (?:your |the )?system prompt|override (?:your |the )?safety rules)\b/u,
];

function routeQuestion(question: string): Route | undefined {
  const text = question.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ")
    .replace(/\b(?:bleedig|bleeeding|bleedding)\b/gu, "bleeding")
    .replace(/\b(?:heavliy|heavly)\b/gu, "heavily")
    .replace(/\b(?:convulsons|convuslions)\b/gu, "convulsions")
    .replace(/\b(?:seziure|seziures)\b/gu, "seizure")
    .replace(/(?:রকতপাত|রক্তপত)/gu, "রক্তপাত")
    .replace(/খি\s*চু\s+নি/gu, "খিচুনি")
    .replace(/ন(ড়|ড়)\s+ছে/gu, "ন$1ছে");
  if (immediateHarm.some((pattern) => pattern.test(text))) return "crisis_support";
  const severePain = severeHeadache.test(text) || intensiveHeadache.test(text);
  if (newbornTrouble.test(text)) return "newborn_urgent";
  if (statedUrgency.test(text)
    || urgent.some((pattern) => pattern.test(text))
    || maternalWarning.test(text)
    || breathingTrouble.test(text) || cannotKeepFluids.test(text)
    || (pregnancy.test(text) && pregnancyBleeding.test(text))
    || /^(?:i am|i['’]m) bleeding(?:\b|$)/u.test(text)
    || (pregnancy.test(text) && (severePain || blurredVision.test(text)))
    || (severePain && blurredVision.test(text))) {
    return "urgent_care";
  }
  if (postpartumSupport.test(text)) return "mental_health_support";
  if (outsideScope.some((pattern) => pattern.test(text))) return "outside_education_scope";
}

export function getBartaSafetyResponse(
  question: string,
  language: BartaRequest["language"],
): BartaAnswer | undefined {
  const reason = routeQuestion(question);
  if (!reason) return undefined;

  return getBartaRouteResponse(reason, language);
}

export function getBartaRouteResponse(route: Route, language: BartaRequest["language"]): BartaAnswer {
  const reason = route === "newborn_urgent" ? "urgent_care"
    : route === "safeguarding_support" ? "outside_education_scope" : route;
  return bartaAnswerSchema.parse({
    status: "abstained",
    reason,
    answer: null,
    citations: [],
    message: fixedMessages[route][language],
  });
}
