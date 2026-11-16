import { bartaAnswerSchema, type BartaAnswer } from "@/lib/contracts/barta";
import { bartaDemoQuestions, getBartaDemoLanguage } from "./demo-questions";

const source = {
  sourceId: "bb3a7560-a49e-4d49-83bb-dd5897352eed",
  sourceVersion: "1",
  title: "PROHOR synthetic visit-preparation form",
  publisher: "PROHOR local demo fixture",
  url: "https://example.invalid/prohor-barta-demo",
  reviewedAt: "2026-11-16T00:00:00.000Z",
};

const passages = [
  {
    key: "form",
    chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
    locator: "Questions section",
    en: {
      variants: [
        "What is in the sample visit form?", "What can I write on the sample visit form?",
        "Where do I write my questions?", "What's on the sample visit form?",
        "Where can I list my questions?", "Where should I write my questions?",
        "Is there a section for questions?", "What is on the sample form?",
      ],
      text: "The sample form has a section for questions to ask at a visit.",
    },
    bn: {
      variants: [
        "নমুনা ফর্মে কি আছে", "নমুনা ফর্মে কী লেখা যায়", "আমি আমার প্রশ্নগুলো কোথায় লিখব",
        "প্রশ্নগুলো কোথায় লিখব", "প্রশ্ন লেখার জায়গা আছে কি", "স্যাম্পল ফর্মে কী আছে",
        "ফরমে কী আছে", "nomuna form e ki ache", "sample form e ki ache",
        "amar proshno kothay likhbo",
      ],
      text: "নমুনা ফর্মে সাক্ষাতের সময় জিজ্ঞেস করার প্রশ্ন লেখার একটি জায়গা আছে।",
    },
  },
  {
    key: "notes",
    chunkId: "5e70f6e8-476d-45ce-b3d4-3f332a1d98d5",
    locator: "Notes section",
    en: {
      variants: [
        "Is there a notes section?", "Where can I write notes on the sample form?",
        "Is there room for notes?", "Where do I put my notes?",
        "Can I add notes?", "Does the form have a space for notes?",
      ],
      text: "The sample form has a Notes section for things you want to remember to bring up.",
    },
    bn: {
      variants: [
        "ফর্মে নোট কোথায় লিখব", "নোট লেখার জায়গা আছে কি", "নোট কোথায় লিখব",
        "ফরমে নোট লেখা যাবে কি", "ফর্মে নোটের জায়গা আছে", "note kothay likhbo",
        "form e note lekhar jayga ache ki",
      ],
      text: "যেসব বিষয় সাক্ষাতে মনে করে বলতে চান, সেগুলো নমুনা ফর্মের নোট অংশে লিখতে পারেন।",
    },
  },
  {
    key: "access",
    chunkId: "36d60bd7-37ad-4cd2-8b01-e7358def7bcb",
    locator: "Access needs section",
    en: {
      variants: [
        "Can I write down my access needs?", "Is there a section for accessibility needs?",
        "Where do I list my accessibility needs?", "Can I ask about wheelchair access on the form?",
        "Where can I write down what help I need?", "Where do I note required accommodations?",
      ],
      text: "The sample form has an Access needs section where you can write down any help or accommodations you would like to ask about.",
    },
    bn: {
      variants: [
        "সহায়তার প্রয়োজন কোথায় লিখব", "সহায়তার জন্য ফর্মে কি আলাদা জায়গা আছে",
        "আমার কী সহায়তা দরকার সেটা কোথায় লিখব", "হুইলচেয়ার ব্যবহারের কথা ফর্মে কোথায় লিখব",
        "কী সাহায্য দরকার সেটা কোথায় লিখব", "shohayota kothay likhbo",
        "wheelchair access er kotha kothay likhbo",
      ],
      text: "নমুনা ফর্মের সহায়তা অংশে, সাক্ষাতের সময় কী ধরনের সহায়তা বা ব্যবস্থা নিয়ে কথা বলতে চান, তা লিখতে পারেন।",
    },
  },
] as const;

const copy = {
  en: {
    abstention: "This demo form doesn’t cover that question. You can try one of the sample questions above.",
    limitation: "This answer comes from a fictional visit form.",
  },
  bn: {
    abstention: "এই প্রশ্নের উত্তর নমুনা ফর্মে নেই। চাইলে উপরের উদাহরণ থেকে একটি প্রশ্ন বেছে নিতে পারেন।",
    limitation: "এই উত্তরটি একটি কাল্পনিক সাক্ষাতের ফর্ম থেকে নেওয়া হয়েছে।",
  },
};

function normalizeQuestion(text: string) {
  return text.normalize("NFKC").toLowerCase().trim()
    .replace(/[‘’]/gu, "'")
    .replace(/\s+/gu, " ")
    .replace(/[?.!।]+$/u, "").trim()
    .replace(/^(?:please|দয়া করে|দয়া করে|অনুগ্রহ করে) +/u, "")
    .replace(/,? please$/u, "").trim();
}

export function getSyntheticBartaAnswer(question: string): BartaAnswer {
  const normalized = normalizeQuestion(question);
  for (const language of ["en", "bn"] as const) {
    const passage = passages.find((candidate) => {
      const prompts = [bartaDemoQuestions[candidate.key][language], ...candidate[language].variants];
      return prompts.some((prompt) => normalizeQuestion(prompt) === normalized);
    });

    if (passage) {
      return bartaAnswerSchema.parse({
        status: "grounded",
        answer: passage[language].text,
        citations: [{ ...source, chunkId: passage.chunkId, locator: passage.locator }],
        limitations: [copy[language].limitation],
      });
    }
  }

  return bartaAnswerSchema.parse({
    status: "abstained",
    answer: null,
    citations: [],
    reason: "insufficient_evidence",
    message: copy[getBartaDemoLanguage(question)].abstention,
  });
}
