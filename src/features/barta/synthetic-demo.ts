import { bartaAnswerSchema, type BartaAnswer } from "@/lib/contracts/barta";

const sampleCitation = {
  sourceId: "bb3a7560-a49e-4d49-83bb-dd5897352eed",
  chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
  sourceVersion: "1",
  title: "PROHOR synthetic visit-preparation form",
  publisher: "PROHOR local demo fixture",
  url: "https://example.invalid/prohor-barta-demo",
  locator: "Questions section",
  reviewedAt: "2026-11-16T00:00:00.000Z",
};

const samples = {
  en: {
    question: "What is on the sample visit form?",
    passage: "The sample form has a section for questions to ask at a visit.",
    limitation: "Synthetic demo only. The citation is a placeholder.",
  },
  bn: {
    question: "নমুনা ফর্মে কী আছে?",
    passage: "নমুনা ফর্মে সাক্ষাতের সময় জিজ্ঞেস করার প্রশ্ন লেখার একটি জায়গা আছে।",
    limitation: "এটি পরীক্ষার জন্য তৈরি নমুনা। সূত্রের লিংকটি প্রতীকী।",
  },
};

export function getSyntheticBartaAnswer(question: string): BartaAnswer {
  const normalized = question.normalize("NFC").trim().toLowerCase();
  const sample = Object.values(samples).find(
    (item) => item.question.normalize("NFC").toLowerCase() === normalized,
  );

  if (!sample) {
    return bartaAnswerSchema.parse({
      status: "abstained",
      answer: null,
      citations: [],
      reason: "insufficient_evidence",
      message: "নমুনায় যথেষ্ট তথ্য নেই। The synthetic demo has no supporting passage.",
    });
  }

  return bartaAnswerSchema.parse({
    status: "grounded",
    answer: sample.passage,
    citations: [sampleCitation],
    limitations: [sample.limitation],
  });
}
