import { z } from "zod";
import {
  bartaAnswerSchema,
  citationSchema,
  knowledgeSourceSchema,
  type BartaAnswer,
} from "@/lib/contracts/barta";
import { isMinorBartaTypo } from "./question-matching";
import { findBartaConcepts } from "./barta-understanding";
import { educationTopicIds, educationTopics, type EducationTopic } from "./education-topics";
import { dateSchema, idSchema, languageSchema, nonEmptyText, timestampSchema } from "@/lib/contracts/common";

// The account-backed source contract remains unchanged. A public terminology
// reference instead records project selection and the time we checked it.
const selectedReferenceSchema = z.strictObject({
  ...knowledgeSourceSchema.shape,
  selection: z.enum(["project_terminology_reference", "project_education_reference"]),
  publicationYear: z.number().int().min(1900).max(2100).optional(),
  applicability: nonEmptyText(160).optional(),
  reviewDue: dateSchema.optional(),
  reviewedByUserId: z.null(),
  reviewedAt: timestampSchema,
  reviewStatus: z.literal("approved"),
});

const reviewedPassageSchema = z.strictObject({
  chunkId: idSchema,
  sourceId: idSchema,
  sourceVersion: nonEmptyText(100),
  locator: nonEmptyText(200),
  page: z.number().int().positive().optional(),
  topic: z.enum(educationTopicIds).optional(),
  stage: z.enum(["pregnancy", "after_birth"]).optional(),
  audience: z.enum(["mother", "newborn", "mother_and_newborn"]).optional(),
  reviewDue: dateSchema.optional(),
  translationGroup: idSchema.optional(),
  language: languageSchema,
  questions: z.array(nonEmptyText(1200)).min(1),
  text: nonEmptyText(12000),
  reviewStatus: z.enum(["pending", "approved", "withdrawn"]),
  reviewBasis: z.enum(["account_review", "project_reference_check"]).default("account_review"),
  reviewedByUserId: idSchema.nullable(),
  reviewedAt: timestampSchema.nullable(),
  reuseBasis: nonEmptyText(500).nullable(),
}).refine((passage) => passage.reviewStatus !== "approved"
  || Boolean(passage.reviewedAt && passage.reuseBasis && (
    passage.reviewBasis === "account_review" ? passage.reviewedByUserId : passage.reviewedByUserId === null
  )), {
  message: "Passage approval requires its review record, check time and reuse basis.",
});

const corpusSchema = z.strictObject({
  sources: z.array(z.union([knowledgeSourceSchema, selectedReferenceSchema])),
  passages: z.array(reviewedPassageSchema),
});

export type BartaCorpus = z.input<typeof corpusSchema>;
type Language = z.output<typeof languageSchema>;
type Citation = z.output<typeof citationSchema>;
type Passage = { text: string; citation: Citation; topic?: EducationTopic };
type IndexedPassage = Passage & { language: Language; questions: string[] };
type BartaKnowledge = {
  available: boolean;
  index: Map<string, Passage | null>;
  topicsByChunk: Map<string, EducationTopic>;
};

export type BartaIntentOption = { id: string; example: string; evidence?: string };
export type BartaIntentSelector = (
  question: string,
  options: BartaIntentOption[],
) => Promise<string | null>;

const limitations = {
  en: "General information from the cited passage. For advice about your own care, speak with a qualified health professional.",
  bn: "উল্লিখিত সূত্র থেকে সাধারণ তথ্য দেওয়া হয়েছে। নিজের সেবা নিয়ে পরামর্শের জন্য যোগ্য স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।",
};

const abstentions = {
  en: {
    insufficient_evidence: "The sources I have don’t cover this question. You can try a more specific question or ask a doctor or midwife about your care.",
    conflicting_evidence: "I found conflicting material for this question. A doctor or midwife can help you work out what applies to your care.",
    sources_unavailable: "The reviewed sources are temporarily unavailable. Please try again later.",
  },
  bn: {
    insufficient_evidence: "আমার সূত্রগুলোতে এই প্রশ্নের উত্তর নেই। আরও নির্দিষ্ট করে জিজ্ঞেস করতে পারেন। নিজের সেবা নিয়ে জানতে চিকিৎসক বা ধাত্রীর সঙ্গে কথা বলুন।",
    conflicting_evidence: "এই প্রশ্নে সূত্রগুলোর তথ্য এক নয়। আপনার ক্ষেত্রে কী প্রযোজ্য, তা জানতে চিকিৎসক বা ধাত্রীর সঙ্গে কথা বলুন।",
    sources_unavailable: "যাচাই করা সূত্রগুলো আপাতত পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করতে পারেন।",
  },
};

function questionKey(language: Language, question: string): string {
  const normalized = question.normalize("NFKC").toLowerCase().trim()
    .replace(/[‘’]/gu, "'")
    .replace(/\s+/gu, " ")
    .replace(/[?.!।]+$/u, "").trim();
  return `${language}:${normalized}`;
}

const publishedHosts = new Map([
  ["World Health Organization", { host: "www.who.int", path: "/" }],
  ["NHS", { host: "www.nhs.uk", path: "/pregnancy/" }],
  ["UNICEF Bangladesh", { host: "www.unicef.org", path: "/bangladesh/" }],
  ["Directorate General of Health Services, Bangladesh", { host: "hospitaldghs.gov.bd", path: "/wp-content/uploads/" }],
]);

function isApprovedPublisher(publisher: string, address: string): boolean {
  // These accessibility references are allowed by exact, public URL.
  if (publisher === "NHS England" || publisher === "Birthrights") {
    return (publisher === "NHS England" ? [
      "https://www.england.nhs.uk/learning-disabilities/improving-health/reasonable-adjustments/",
      "https://www.england.nhs.uk/long-read/accessible-information-standard-requirements-dapb1605/",
      "https://www.england.nhs.uk/accessible-information-standard/why-its-important/",
    ] : ["https://birthrights.org.uk/factsheets/disability-and-long-term-health-conditions-and-maternity-care/"]).includes(address);
  }
  const rule = publishedHosts.get(publisher);
  if (!rule) return false;
  try {
    const url = new URL(address);
    const approvedPath = url.pathname.startsWith(rule.path)
      || (publisher === "NHS" && [
        "/symptoms/period-pain/", "/symptoms/diarrhoea-and-vomiting/", "/conditions/gestational-diabetes/",
        "/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/",
        "/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/",
        "/baby/caring-for-a-newborn/soothing-a-crying-baby/",
      ].includes(url.pathname));
    return url.origin === `https://${rule.host}` && !url.username && !url.password && approvedPath;
  } catch {
    return false;
  }
}

export function prepareBartaKnowledge(input: unknown, now = new Date()): BartaKnowledge | null {
  const parsed = corpusSchema.safeParse(input);
  if (!parsed.success) return null;

  const { sources, passages } = parsed.data;
  const today = now.toISOString().slice(0, 10);
  const currentSources = new Map(sources.map((source) => [source.id, source]));
  if (currentSources.size !== sources.length) return null;
  if (new Set(passages.map((passage) => passage.chunkId)).size !== passages.length) return null;

  const groups = new Map<string, IndexedPassage[]>();
  for (const passage of passages) {
    const source = currentSources.get(passage.sourceId);
    if (passage.reviewStatus !== "approved" || !passage.reviewedAt
      || source?.reviewStatus !== "approved" || source.version !== passage.sourceVersion) {
      continue;
    }

    if (("selection" in source) !== (passage.reviewBasis === "project_reference_check")
      || (passage.reviewDue && passage.reviewDue <= today)) {
      continue;
    }

    if ("selection" in source && source.selection === "project_education_reference"
      && (!source.reviewDue || source.reviewDue <= today || !isApprovedPublisher(source.publisher, source.url))) {
      continue;
    }

    const publicationYear = source.publishedOn ? Number(source.publishedOn.slice(0, 4))
      : "publicationYear" in source ? source.publicationYear : undefined;
    const entry: IndexedPassage = {
      topic: passage.topic,
      language: passage.language,
      questions: passage.questions,
      text: passage.text,
      citation: citationSchema.parse({
        sourceId: source.id,
        chunkId: passage.chunkId,
        sourceVersion: source.version,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        locator: passage.locator,
        reviewedAt: passage.reviewedAt,
        ...(publicationYear && { publicationYear }),
        ...(passage.page && { page: passage.page }),
      }),
    };

    // Connect only reviewed translations of the same precisely located evidence.
    const groupKey = passage.translationGroup
      ? JSON.stringify([passage.translationGroup, source.id, source.version, passage.locator, passage.page, passage.topic, passage.stage, passage.audience])
      : passage.chunkId;
    const group = groups.get(groupKey);
    if (group) group.push(entry);
    else groups.set(groupKey, [entry]);
  }

  const index: BartaKnowledge["index"] = new Map();
  for (const group of groups.values()) {
    const paired = group.length === 2 && group[0].language !== group[1].language;
    for (const entry of group) {
      const questions = paired ? [...group[0].questions, ...group[1].questions] : entry.questions;
      for (const question of questions) {
        const key = questionKey(entry.language, question);
        if (key === `${entry.language}:`) continue;
        const previous = index.get(key);
        if (previous === undefined) index.set(key, entry);
        else if (previous?.citation.chunkId !== entry.citation.chunkId) index.set(key, null);
      }
    }
  }

  const topicsByChunk = new Map<string, EducationTopic>();
  for (const passage of index.values()) {
    if (passage?.topic) topicsByChunk.set(passage.citation.chunkId, passage.topic);
  }
  return { available: [...index.values()].some((passage) => passage !== null), index, topicsByChunk };
}

export function getBartaKnowledgeAnswer(
  knowledge: BartaKnowledge | null,
  question: string,
  language: Language,
): BartaAnswer {
  const passage = knowledge?.index.get(questionKey(language, question));
  if (!passage) {
    const reason = knowledge ? "insufficient_evidence" : "sources_unavailable";
    return bartaAnswerSchema.parse({
      status: "abstained",
      reason,
      answer: null,
      citations: [],
      message: abstentions[language][passage === null ? "conflicting_evidence" : reason],
    });
  }

  return groundedAnswer(knowledge, passage, language);
}

const relatedTopic: Partial<Record<EducationTopic, EducationTopic>> = {
  anc: "ancVisits",
  ancVisits: "nutrition",
  postnatal: "postnatalVisits",
  newborn: "babyHygiene",
  breastfeeding: "solidFood",
  babyHygiene: "babyBath",
  babyBath: "cordCare",
  cordCare: "diaper",
  diaper: "babySleep",
  feedingAtWork: "breastfeedingPosition",
  babyWater: "breastfeeding",
  babySleep: "homeSafety",
  babyCrying: "babySleep",
  nutrition: "balancedMeals",
  balancedMeals: "foodSafety",
  firstCheckup: "ultrasound",
  pregnancyBasics: "anc",
  maternalHealth: "warningSigns",
  birthPlan: "postnatal",
};

export function bartaFollowUpQuestion(
  knowledge: BartaKnowledge | null,
  question: string,
  language: Language,
  previousChunkId?: string,
): string {
  if (!previousChunkId || !knowledge) return question;
  const context = knowledge.topicsByChunk.get(previousChunkId);
  const normalized = questionKey(language, question).slice(3);
  const repeat = /^(?:explain it in simple language|explain it simply|say that again|সহজ ভাষায় বুঝিয়ে বলুন|আবার বলুন|easy kore bujhiye bolen)$/u;
  if (context && repeat.test(normalized)) {
    const prompt = educationTopics[context][language];
    if (knowledge.index.get(questionKey(language, prompt))) return prompt;
  }
  const followUps = {
    anc: { topic: "ancVisits", phrases: ["what happens there", "what happens at those visits", "সেখানে কী হয়", "sekhane ki hoy"] },
    ancVisits: { topic: "nutrition", phrases: ["what about nutrition", "what about food", "খাবার নিয়ে কী", "khabar niye ki"] },
    postnatal: { topic: "newborn", phrases: ["what about the newborn", "what about the baby", "নবজাতকের যত্ন কী", "bacchar jotno ki"] },
  } satisfies Partial<Record<EducationTopic, { topic: EducationTopic; phrases: string[] }>>;
  const followUp = context && context in followUps ? followUps[context as keyof typeof followUps] : undefined;
  const topic = followUp?.phrases.some((phrase) => normalized === phrase || isMinorBartaTypo(normalized, phrase))
    ? followUp.topic : undefined;
  if (!topic) return question;
  const prompt = educationTopics[topic][language];
  return knowledge.index.get(questionKey(language, prompt)) ? prompt : question;
}

const vagueQuestions = /^(?:pregnent|pregnancy|prégnency|gorvo|garbho|গর্ব|গর্ভ|ব্যথা|ami bhoy pachchi|what should i do|is it safe|is it normal|is that normal|what about (?:it|that|this)|what do you mean|what do i do|how (?:often|long|much|many)|when|help me|এটা কি স্বাভাবিক|কী করব|এ বিষয়ে বলুন|কতবার|কখন|ki korbo|koto bar|kokhon)$/u;
const topicFragments: Partial<Record<EducationTopic, readonly string[]>> = {
  anc: ["anc", "antenatal care", "prenatal care", "গর্ভকালীন সেবা", "gorbhokalin sheba"],
  ancVisits: ["anc visits", "checkup", "checkups", "pregnancy checkup", "চেকআপ", "গর্ভকালীন চেকআপ"],
  nutrition: ["nutrition", "food", "pregnancy food", "pregnancy diet", "খাবার", "khabar", "পুষ্টি", "গর্ভাবস্থায় খাবার"],
  breastfeeding: ["breastfeeding", "breast feeding", "বুকের দুধ", "buker dudh"],
  postnatal: ["postnatal", "postnatal care", "postpartum care", "care after birth", "প্রসবের পরের সেবা", "deliveryr porer care"],
  newborn: ["newborn", "newborn care", "baby care", "নবজাতক", "শিশুর যত্ন", "baccha", "bacchar jotno"],
  pregnancyBasics: ["trimester", "trimesters", "ট্রাইমেস্টার"],
  balancedMeals: ["pregnancy meals", "গর্ভাবস্থার খাবার"],
  warningSigns: ["warning signs", "বিপদের লক্ষণ"],
  maternalHealth: ["pre-eclampsia", "preeclampsia", "প্রি-এক্ল্যাম্পসিয়া"],
  mentalWellbeing: ["mental health", "মানসিক স্বাস্থ্য"],
  birthPlan: ["birth plan", "প্রসব পরিকল্পনা"],
};

const infantWords = /(?:\b(?:baby|infant|newborn|baccha|bacha|bacca|bachcha|bacchar|bachchar|nobojatok)\b|বাচ্চা|শিশু|নবজাতক)/u;
const pregnancyWords = /(?:\b(?:pregnant|pregnancy|gorboboti|gorbhoboti|gorbhobosthay)\b|গর্ভাবস্থা|গর্ভবতী)/u;
const dailyCareWords = /(?:\b(?:care|manage|look after|handle|jotno|samla\p{L}*)\b|যত্ন|সামলা|দেখাশোনা)/u;
const specificConcerns = /(?:\b(?:fever|rash|bleed\p{L}*|vomit\p{L}*|dehydrat\p{L}*|pain|injur\p{L}*|fit|fits|seizure|breath\p{L}*|faint\p{L}*|medicin\p{L}*|dose|swelling|jaundice|jor|bomi|betha|byatha|oshudh|rokto)\b|জ্বর|রক্ত|বমি|ব্যথা|শ্বাস|ওষুধ|আঘাত|খিঁচুনি|জন্ডিস)/u;

const genericMatchWords = new Set([
  "baby", "pregnancy", "pregnant", "newborn", "mother", "child", "infant",
  "for", "with", "when", "about", "should", "during", "my", "your", "help", "safe", "care",
  "korbo", "kivabe", "kemon", "amar", "baccha", "nobojatok", "শিশু", "নবজাতক", "বাচ্চা",
]);

function similarQuestionTopics(knowledge: BartaKnowledge, question: string, language: Language): EducationTopic[] {
  const informativeTerms = (text: string) => new Set(searchTerms(text)
    .filter((term) => Array.from(term).length >= 3 && !genericMatchWords.has(term)));
  const query = informativeTerms(question);
  if (query.size < 2) return [];
  const scores = new Map<EducationTopic, number>();
  for (const [key, passage] of knowledge.index) {
    if (!key.startsWith(`${language}:`) || !passage?.topic) continue;
    const terms = informativeTerms(key.slice(3));
    const overlap = [...query].filter((term) => terms.has(term)).length;
    const score = overlap / Math.max(query.size, terms.size);
    if (overlap >= 2 && score >= 0.5) {
      scores.set(passage.topic, Math.max(score, scores.get(passage.topic) ?? 0));
    }
  }
  return [...scores.entries()].sort((first, second) => second[1] - first[1]).slice(0, 3).map(([topic]) => topic);
}

function nearbyCare(knowledge: BartaKnowledge, question: string, language: Language, includeLexical: boolean): BartaAnswer | undefined {
  if (specificConcerns.test(question) || /[?।!]/u.test(question.replace(/[?।!]+$/u, ""))) return undefined;
  const baby = infantWords.test(question);
  const pregnant = pregnancyWords.test(question);
  const topics: EducationTopic[] = [];
  if (baby) {
    if (/(?:\b(?:sleep\p{L}*|ghum|cot|pillow)\b|ঘুম|বালিশ)/u.test(question)) topics.push("babySleep");
    if (/(?:\b(?:bath\p{L}*|gosol|gosh?ol)\b|গোসল|স্নান)/u.test(question)) topics.push("babyBath");
    if (/(?:\b(?:cord|nabhi\p{L}*)\b|নাভি)/u.test(question)) topics.push("cordCare");
    if (/(?:\b(?:diaper|diapers|nappy|nappies|dayapar)\b|ডায়াপার|ডায়াপার)/u.test(question)) topics.push("diaper");
    if (/(?:\b(?:food|solids?|khabar|complementary)\b|বাড়তি খাবার|শক্ত খাবার)/u.test(question)) topics.push("solidFood");
    if (/(?:\b(?:cry\p{L}*|kande|kandle|kanna)\b|কাঁদ|কান্না)/u.test(question)) topics.push("babyCrying");
    if (/(?:\b(?:smoke|smoking|dhoya|dhua)\b|ধোঁয়া|ধূমপান)/u.test(question)) topics.push("homeSafety");
    if (/(?:\b(?:play|khela|khelbo)\b|খেলাধুলা|খেলব)/u.test(question)) topics.push("babyPlay");
  }
  if (pregnant && /(?:\b(?:travel\p{L}*|journey|seat ?belt|bhromon)\b|ভ্রমণ|সিটবেল্ট)/u.test(question)) topics.push("pregnancyTravel");
  if (pregnant && /(?:\b(?:sleep\p{L}*|ghum|kaj|chores)\b|ঘুম|বিশ্রাম|দৈনন্দিন কাজ)/u.test(question)) topics.push("pregnancySleep", "everydayWellbeing");

  // A recognised subject ("belly button", "bath") beats the generic baby-care menu, but never pre-empts the model selector.
  const concept = !topics.length && includeLexical ? findBartaConcepts(question) : undefined;
  // Uncovered subjects (vaccines, jaundice) fall through to the fallback that says so plainly.
  if (concept && !concept.missing) topics.push(...concept.topics);
  const broadCare = baby && !topics.length && dailyCareWords.test(question);
  if (broadCare) topics.push("newborn", "babySleep", "solidFood");
  if (!topics.length && includeLexical) topics.push(...similarQuestionTopics(knowledge, question, language));
  if (!topics.length) return undefined;

  const reply = clarify(knowledge, language, topics);
  if (reply.status !== "clarification" || !reply.suggestions.length) return undefined;
  return {
    ...reply,
    message: broadCare
      ? language === "bn"
        ? "বাচ্চার বয়স কত? খাওয়ানো, ঘুম নাকি প্রতিদিনের যত্ন নিয়ে জানতে চান? নিচের যেকোনো প্রশ্ন বেছে নিতে পারেন।"
        : "How old is your baby? Are you asking about feeding, sleep, or everyday care? You can choose a question below."
      : language === "bn"
        ? "আপনার প্রশ্নের কাছাকাছি এই বিষয়গুলো নিয়ে আমার যাচাই করা তথ্য আছে। কোনটি জানতে চান?"
        : "I have reviewed information on these related questions. Which one fits what you meant?",
  };
}

function approvedSuggestions(knowledge: BartaKnowledge, language: Language, topics: EducationTopic[]): string[] {
  return [...new Set(topics)].map((topic) => educationTopics[topic][language])
    .filter((prompt) => knowledge.index.get(questionKey(language, prompt))).slice(0, 3);
}

export function bartaTopicSuggestions(knowledge: BartaKnowledge | null, language: Language, topics: EducationTopic[]): string[] {
  return knowledge ? approvedSuggestions(knowledge, language, topics) : [];
}

/** Topics whose reviewed question wordings share rare words with the question (word-overlap, not semantic). */
function lexicalTopics(knowledge: BartaKnowledge, question: string, language: Language): EducationTopic[] {
  const terms = (text: string) => new Set(searchTerms(text).filter((term) => Array.from(term).length >= 3 && !genericMatchWords.has(term)));
  const query = terms(question);
  if (!query.size) return [];
  const aliases: { topic: EducationTopic; terms: Set<string> }[] = [];
  for (const [key, passage] of knowledge.index) {
    if (passage?.topic && key.startsWith(`${language}:`)) aliases.push({ topic: passage.topic, terms: terms(key.slice(3)) });
  }
  const scores = new Map<EducationTopic, number>();
  let matched = 0;
  for (const term of query) {
    const holders = new Set(aliases.filter((alias) => alias.terms.has(term)).map((alias) => alias.topic));
    // A word found under many topics says little about which one is meant.
    if (!holders.size || holders.size > 4) continue;
    matched++;
    for (const topic of holders) scores.set(topic, (scores.get(topic) ?? 0) + 1 / holders.size);
  }
  // One shared word is enough only when it is the whole question ("weather today" must not match "hot weather").
  if (matched < Math.min(2, query.size)) return [];
  return [...scores.entries()].filter(([, score]) => score >= 0.5)
    .sort((first, second) => second[1] - first[1]).slice(0, 3).map(([topic]) => topic);
}

const fallbackCopy = {
  related: {
    en: "I have reviewed information close to your question. Which of these do you mean? Choose one to put it in the question box.",
    bn: "আপনার প্রশ্নের কাছাকাছি যাচাই করা তথ্য আছে। এর কোনটি জানতে চান? প্রশ্নের ঘরে নিতে একটি বেছে নিন।",
  },
  missing: {
    en: (subject: string) => `I don’t have reviewed information about ${subject} yet, so please ask a doctor, midwife or health worker about your own situation. These related topics may still help:`,
    bn: (subject: string) => `${subject} নিয়ে আমার কাছে এখনো যাচাই করা তথ্য নেই। নিজের ক্ষেত্রে ডাক্তার, মিডওয়াইফ বা স্বাস্থ্যকর্মীকে জিজ্ঞেস করুন। এর কাছাকাছি এই বিষয়গুলো কাজে আসতে পারে:`,
  },
  general: {
    en: "I can only answer from reviewed sources about pregnancy, birth, recovery and baby care, and I don’t have an answer for this one. Try a few different words, or start with one of these:",
    bn: "আমি শুধু গর্ভাবস্থা, প্রসব, প্রসবের পর সুস্থ হওয়া ও শিশুর যত্ন নিয়ে যাচাই করা সূত্র থেকে উত্তর দিই, এই প্রশ্নের উত্তর আমার কাছে নেই। অন্য কয়েকটি শব্দে লিখুন, অথবা এগুলোর একটি দিয়ে শুরু করুন:",
  },
};

export function addBartaFallbackSuggestions(
  knowledge: BartaKnowledge | null, answer: BartaAnswer, language: Language, question = "",
): BartaAnswer {
  if (!knowledge?.available || answer.status !== "abstained" || answer.reason !== "insufficient_evidence") return answer;

  const shopping = /^(?:(?:best|cheap) (?:phone|mobile|laptop)|(?:buy|price of) (?:a |an )?(?:phone|mobile|laptop))(?:\b|$)/iu.test(question);
  const concept = shopping ? undefined : findBartaConcepts(question);
  const inferred = shopping ? [] : concept?.topics ?? lexicalTopics(knowledge, question, language);
  const related = approvedSuggestions(knowledge, language, inferred);
  if (related.length) {
    const subject = concept?.missing?.[language];
    return bartaAnswerSchema.parse({
      status: "clarification", answer: null, citations: [], suggestions: related,
      message: subject ? fallbackCopy.missing[language](subject) : fallbackCopy.related[language],
    });
  }
  const suggestions = approvedSuggestions(knowledge, language, ["anc", "postnatal", "newborn"]);
  return suggestions.length ? { ...answer, message: fallbackCopy.general[language], suggestions } : answer;
}

function clarify(knowledge: BartaKnowledge, language: Language, topics: EducationTopic[]): BartaAnswer {
  const suggestions = approvedSuggestions(knowledge, language, topics);
  return bartaAnswerSchema.parse({
    status: "clarification",
    answer: null,
    citations: [],
    suggestions,
    message: language === "bn"
      ? (suggestions.length ? "কোন বিষয়ে জানতে চান, একটু বলবেন? নিচের একটি প্রশ্নও বেছে নিতে পারেন।" : "কোন বিষয়ে জানতে চান, একটু বলবেন?")
      : (suggestions.length ? "What would you like to know? Add a detail or choose a question below." : "What would you like to know? Could you add a little more detail?"),
  });
}

function typoMatches(knowledge: BartaKnowledge, question: string, language: Language) {
  const matches = new Map<string, Passage>();
  let includesConflict = false;
  for (const [key, passage] of knowledge.index) {
    if (!key.startsWith(`${language}:`) || !isMinorBartaTypo(question, key.slice(3))) continue;
    if (passage === null) includesConflict = true;
    else if (passage.topic) matches.set(passage.citation.chunkId, passage);
  }
  return { passages: [...matches.values()], includesConflict };
}

function groundedAnswer(knowledge: BartaKnowledge | null, passage: Passage, language: Language): BartaAnswer {
  const next = passage.topic && relatedTopic[passage.topic];
  const prompt = next ? educationTopics[next][language] : undefined;
  const followUp = prompt && knowledge?.index.get(questionKey(language, prompt)) ? prompt : undefined;
  const claims = [...new Intl.Segmenter(language, { granularity: "sentence" }).segment(passage.text)]
    .map(({ segment }) => ({ text: segment.trim(), chunkId: passage.citation.chunkId }));
  // Display only claims reconstructed from the selected passage in the requested language.
  const claimText = claims.map((claim) => claim.text).join(" ");
  const normalizeSpace = (value: string) => value.replace(/\s+/gu, " ").trim();
  if (normalizeSpace(passage.text) !== normalizeSpace(claimText)
    || claims.some((claim) => claim.chunkId !== passage.citation.chunkId)) {
    return bartaAnswerSchema.parse({
      status: "abstained", reason: "insufficient_evidence", answer: null, citations: [],
      message: abstentions[language].insufficient_evidence,
    });
  }
  return bartaAnswerSchema.parse({
    status: "grounded",
    answer: passage.text,
    citations: [passage.citation],
    limitations: [limitations[language]],
    ...(passage.topic && { claims, confidence: "source_supported", actionLevel: "education" }),
    ...(followUp && { followUp }),
  });
}

function combineReviewedAnswers(question: string, knowledge: BartaKnowledge, language: Language): BartaAnswer | undefined {
  const parts = question.normalize("NFKC").trim().replace(/[?.!।]+$/u, "").split(/\s*\?\s*/u);
  if (parts.length !== 2) return undefined;
  const passages = parts.map((part) => knowledge.index.get(questionKey(language, part)));
  const [first, second] = passages;
  if (!first?.topic || !second?.topic || first.citation.chunkId === second.citation.chunkId) return undefined;

  const left = groundedAnswer(knowledge, first, language);
  const right = groundedAnswer(knowledge, second, language);
  if (left.status !== "grounded" || right.status !== "grounded" || !left.claims || !right.claims) return undefined;

  const parsed = bartaAnswerSchema.safeParse({
    status: "grounded",
    answer: `${left.answer}\n\n${right.answer}`,
    citations: [...left.citations, ...right.citations],
    claims: [...left.claims, ...right.claims],
    limitations: [limitations[language]],
    confidence: "source_supported",
    actionLevel: "education",
  });
  return parsed.success ? parsed.data : undefined;
}

const searchStopwords = new Set(["what", "is", "are", "can", "how", "the", "a", "i", "do", "does", "at", "about", "কি", "কী"]);

function searchTerms(text: string): string[] {
  return (text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{M}]+/gu) ?? [])
    .filter((term) => !searchStopwords.has(term));
}

function characterTerms(text: string): Set<string> {
  const terms = new Set<string>();
  for (const word of searchTerms(text)) {
    const letters = Array.from(word);
    for (let i = 0; i + 2 < letters.length; i++) terms.add(letters.slice(i, i + 3).join(""));
  }
  return terms;
}

function vectorSimilarity(query: Set<string>, alias: string): number {
  const vector = characterTerms(alias);
  if (!vector.size || !query.size) return 0;
  const overlap = [...query].filter((term) => vector.has(term)).length;
  return overlap / Math.sqrt(query.size * vector.size);
}

function rankIntentCandidates<T extends { aliases: string[] }>(question: string, candidates: T[]): T[] {
  const queryTerms = new Set(searchTerms(question));
  const queryVector = characterTerms(question);
  const documents = candidates.map((candidate) => searchTerms(candidate.aliases.join(" ")));
  const averageLength = (documents.reduce((sum, terms) => sum + terms.length, 0) / documents.length) || 1;
  const documentCounts = new Map([...queryTerms].map((term) => [
    term, documents.filter((terms) => terms.includes(term)).length,
  ]));
  return candidates.map((candidate, index) => {
    const terms = documents[index];
    let score = 0;
    for (const [term, count] of documentCounts) {
      const frequency = terms.filter((word) => word === term).length;
      if (!frequency) continue;
      const weight = Math.log1p((documents.length - count + 0.5) / (count + 0.5));
      score += weight * (frequency * 2.2) /
        (frequency + 1.2 * (0.25 + 0.75 * terms.length / averageLength));
    }
    const similarity = Math.max(0, ...candidate.aliases.map((alias) => vectorSimilarity(queryVector, alias)));
    return { candidate, score: score + similarity };
  }).sort((first, second) => second.score - first.score)
    .slice(0, 6).map(({ candidate }) => candidate);
}

export async function resolveBartaKnowledgeAnswer(
  knowledge: BartaKnowledge | null,
  question: string,
  language: Language,
  select?: BartaIntentSelector,
): Promise<BartaAnswer> {
  const answer = getBartaKnowledgeAnswer(knowledge, question, language);
  const key = questionKey(language, question);
  if (!knowledge || knowledge.index.has(key)) return answer;
  const combined = combineReviewedAnswers(question, knowledge, language);
  if (combined) return combined;
  const normalized = key.slice(3);
  if (findBartaConcepts(normalized)?.missing) return answer;
  const fragments = educationTopicIds.filter((topic) => topicFragments[topic]?.includes(normalized));
  if (fragments.length || vagueQuestions.test(normalized)) {
    const topics: EducationTopic[] = fragments.length ? [...fragments] : ["anc", "postnatal", "newborn"];
    if (fragments.includes("anc")) topics.push("ancVisits");
    return clarify(knowledge, language, topics);
  }

  const typo = typoMatches(knowledge, normalized, language);
  if (typo.includesConflict) return answer;
  if (typo.passages.length === 1) return groundedAnswer(knowledge, typo.passages[0], language);
  if (typo.passages.length > 1) {
    return clarify(knowledge, language, typo.passages.flatMap((passage) => passage.topic ? [passage.topic] : []));
  }

  const nearby = nearbyCare(knowledge, normalized, language, !select);
  if (nearby || !select) return nearby ?? answer;

  const prefix = `${language}:`;
  const candidates = new Map<string, { option: BartaIntentOption; passage: Passage; aliases: string[] }>();
  for (const [key, passage] of knowledge.index) {
    if (!passage || !key.startsWith(prefix)) continue;
    const id = passage.citation.chunkId;
    const alias = key.slice(prefix.length);
    const candidate = candidates.get(id);
    if (candidate) candidate.aliases.push(alias);
    else candidates.set(id, { option: { id, example: alias, ...(passage.topic && { evidence: passage.text }) }, passage, aliases: [alias] });
  }
  if (candidates.size === 0) return answer;
  const shortlist = rankIntentCandidates(question, [...candidates.values()]);

  try {
    const selected = await select(question, shortlist.map(({ option }) => option));
    if (!selected) return nearbyCare(knowledge, normalized, language, true) ?? answer;
    const match = shortlist.find(({ option }) => option.id === selected);
    if (!match) return answer;
    // A suggested match from the preview model gets user confirmation.
    return match.passage.topic
      ? clarify(knowledge, language, [match.passage.topic])
      : groundedAnswer(knowledge, match.passage, language);
  } catch {
    return nearbyCare(knowledge, normalized, language, true) ?? answer;
  }
}
