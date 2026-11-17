import { expect, test } from "@playwright/test";
import { getBartaKnowledgeAnswer, prepareBartaKnowledge, type BartaCorpus } from "../../src/features/barta/approved-knowledge";

const sourceId = "bb3a7560-a49e-4d49-83bb-dd5897352eed";
const reviewer = "1bcf7ddd-9b33-441a-8a66-37fe02114382";
const reviewedAt = "2026-11-16T00:00:00.000Z";
const corpus: BartaCorpus = {
  sources: [{
    id: sourceId,
    version: "2",
    title: "Synthetic review fixture",
    publisher: "PROHOR tests",
    url: "https://example.invalid/barta-review-test",
    language: "en",
    publishedOn: null,
    reviewedAt,
    reviewedByUserId: reviewer,
    reviewStatus: "approved",
  }],
  passages: [{
    chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
    sourceId,
    sourceVersion: "2",
    locator: "Printed heading, page 1",
    language: "en",
    questions: ["What heading is on the test form?"],
    text: "The synthetic test form is labelled Visit preparation.",
    reviewStatus: "approved",
    reviewedByUserId: reviewer,
    reviewedAt,
    reuseBasis: "Fictional test text authored for PROHOR.",
  }],
};

test("retrieves a reviewed passage with metadata from its current source version", () => {
  const knowledge = prepareBartaKnowledge(corpus);
  expect(knowledge?.available).toBe(true);
  expect(getBartaKnowledgeAnswer(knowledge, "  WHAT HEADING IS ON THE TEST FORM? ", "en")).toMatchObject({
    status: "grounded",
    answer: corpus.passages[0].text,
    citations: [{ sourceId, sourceVersion: "2", chunkId: corpus.passages[0].chunkId, url: corpus.sources[0].url }],
  });
});

test("withholds pending, withdrawn and stale source versions", () => {
  for (const override of [{ reviewStatus: "pending" }, { reviewStatus: "withdrawn" }, { version: "3" }] as const) {
    const knowledge = prepareBartaKnowledge({ ...corpus, sources: [{ ...corpus.sources[0], ...override }] });
    expect(knowledge?.available).toBe(false);
    expect(getBartaKnowledgeAnswer(knowledge, corpus.passages[0].questions[0], "en")).toMatchObject({
      status: "abstained", answer: null, citations: [],
    });
  }
});

test("never guesses in the wrong language, across mixed requests, or on conflicting matches", () => {
  const knowledge = prepareBartaKnowledge(corpus);
  const ambiguous = prepareBartaKnowledge({
    ...corpus,
    passages: [...corpus.passages, { ...corpus.passages[0], chunkId: "5e70f6e8-476d-45ce-b3d4-3f332a1d98d5" }],
  });
  const abstained = { status: "abstained", reason: "insufficient_evidence", answer: null, citations: [] };
  const question = corpus.passages[0].questions[0];
  expect(getBartaKnowledgeAnswer(knowledge, question, "bn")).toMatchObject(abstained);
  expect(getBartaKnowledgeAnswer(knowledge, `${question} What dose should I take?`, "en")).toMatchObject(abstained);
  expect(getBartaKnowledgeAnswer(ambiguous, question, "en")).toMatchObject(abstained);
});

test("rejects invalid review metadata and treats an invalid corpus as unavailable", () => {
  const knowledge = prepareBartaKnowledge({
    ...corpus,
    sources: [{ ...corpus.sources[0], reviewedByUserId: null }],
  });
  expect(knowledge).toBeNull();
  expect(getBartaKnowledgeAnswer(knowledge, corpus.passages[0].questions[0], "en")).toMatchObject({
    status: "abstained", reason: "sources_unavailable", answer: null, citations: [],
  });
});

test("a pending or withdrawn passage stays excluded even if its source is approved", () => {
  for (const reviewStatus of ["pending", "withdrawn"] as const) {
    const knowledge = prepareBartaKnowledge({
      ...corpus,
      passages: [{ ...corpus.passages[0], reviewStatus }],
    });
    expect(knowledge?.available).toBe(false);
    expect(getBartaKnowledgeAnswer(knowledge, corpus.passages[0].questions[0], "en")).toMatchObject({
      status: "abstained", answer: null, citations: [],
    });
  }
});

test("a passage cannot be activated by a status change alone", () => {
  for (const missing of [{ reviewedAt: null }, { reviewedByUserId: null }, { reuseBasis: null }]) {
    const knowledge = prepareBartaKnowledge({
      ...corpus,
      passages: [{ ...corpus.passages[0], ...missing }],
    });
    expect(knowledge).toBeNull();
  }
});

const translationGroup = "616de971-1b33-44eb-bf9f-e0de6678f3ae";
const bilingualEnglish = { ...corpus.passages[0], translationGroup };
const bilingualBangla: BartaCorpus["passages"][number] = {
  ...bilingualEnglish,
  chunkId: "0169635b-ccba-4eba-b34f-1a1a50509f89",
  language: "bn",
  questions: ["নমুনা ফর্মের শিরোনাম কী?", "nomuna form er shironam ki?"],
  text: "নমুনা ফর্মের শিরোনাম সাক্ষাতের প্রস্তুতি।",
};

test("approved translations answer the same question in either selected language", () => {
  const knowledge = prepareBartaKnowledge({ ...corpus, passages: [bilingualEnglish, bilingualBangla] });
  expect(getBartaKnowledgeAnswer(knowledge, bilingualEnglish.questions[0], "bn")).toMatchObject({
    status: "grounded",
    answer: bilingualBangla.text,
    citations: [{ sourceId, chunkId: bilingualBangla.chunkId }],
  });
  for (const question of bilingualBangla.questions) {
    expect(getBartaKnowledgeAnswer(knowledge, question, "en")).toMatchObject({
      status: "grounded",
      answer: bilingualEnglish.text,
      citations: [{ sourceId, chunkId: bilingualEnglish.chunkId }],
    });
  }
});

test("translation pairing excludes pending translations and different source sections", () => {
  for (const variant of [
    { ...bilingualBangla, reviewStatus: "pending" },
    { ...bilingualBangla, locator: "Different section" },
  ] as const) {
    const knowledge = prepareBartaKnowledge({ ...corpus, passages: [bilingualEnglish, variant] });
    expect(getBartaKnowledgeAnswer(knowledge, bilingualEnglish.questions[0], "bn")).toMatchObject({
      status: "abstained", answer: null, citations: [],
    });
  }
});

test("project-selected terminology does not need a fabricated account review", () => {
  const selectedSource = {
    ...corpus.sources[0],
    selection: "project_terminology_reference",
    reviewStatus: "approved",
    reviewedByUserId: null,
  } as const;
  const selectedPassage = {
    ...corpus.passages[0],
    reviewBasis: "project_reference_check",
    reviewedByUserId: null,
  } as const;
  const knowledge = prepareBartaKnowledge({ sources: [selectedSource], passages: [selectedPassage] });
  expect(getBartaKnowledgeAnswer(knowledge, selectedPassage.questions[0], "en")).toMatchObject({
    status: "grounded",
    citations: [{ sourceId }],
  });

  const wrongBasis = prepareBartaKnowledge({ ...corpus, passages: [selectedPassage] });
  expect(getBartaKnowledgeAnswer(wrongBasis, selectedPassage.questions[0], "en")).toMatchObject({
    status: "abstained", answer: null, citations: [],
  });
});
