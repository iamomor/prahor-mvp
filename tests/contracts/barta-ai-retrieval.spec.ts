import { expect, test } from "@playwright/test";
import { prepareBartaKnowledge, resolveBartaKnowledgeAnswer, type BartaCorpus } from "../../src/features/barta/approved-knowledge";

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

const translationGroup = "616de971-1b33-44eb-bf9f-e0de6678f3ae";
const bilingualEnglish = { ...corpus.passages[0], translationGroup };
const bilingualBangla: BartaCorpus["passages"][number] = {
  ...bilingualEnglish,
  chunkId: "0169635b-ccba-4eba-b34f-1a1a50509f89",
  language: "bn",
  questions: ["নমুনা ফর্মের শিরোনাম কী?", "nomuna form er shironam ki?"],
  text: "নমুনা ফর্মের শিরোনাম সাক্ষাতের প্রস্তুতি।",
};

test("new phrasing can select an approved passage without model-written text or citations", async () => {
  const knowledge = prepareBartaKnowledge({ ...corpus, passages: [bilingualEnglish, bilingualBangla] });
  const result = await resolveBartaKnowledgeAnswer(knowledge, "Where is the heading printed?", "bn", async (question, options) => {
    expect(question).toBe("Where is the heading printed?");
    expect(options).toHaveLength(1);
    expect(options[0].id).toBe(bilingualBangla.chunkId);
    return options[0].id;
  });
  expect(result).toMatchObject({
    status: "grounded", answer: bilingualBangla.text, citations: [{ chunkId: bilingualBangla.chunkId }],
  });
});

test("exact and conflicting matches bypass the model; invalid selections and failures abstain", async () => {
  const knowledge = prepareBartaKnowledge(corpus);
  const question = corpus.passages[0].questions[0];
  let calls = 0;
  const invalidSelection = async () => { calls++; return "unknown-id"; };
  expect(await resolveBartaKnowledgeAnswer(knowledge, question, "en", invalidSelection)).toMatchObject({ status: "grounded" });
  const conflicting = prepareBartaKnowledge({
    ...corpus,
    passages: [...corpus.passages, { ...corpus.passages[0], chunkId: "5e70f6e8-476d-45ce-b3d4-3f332a1d98d5" }],
  });
  expect(await resolveBartaKnowledgeAnswer(conflicting, question, "en", invalidSelection)).toMatchObject({ status: "abstained" });
  expect(calls).toBe(0);
  expect(await resolveBartaKnowledgeAnswer(knowledge, "Unknown phrasing", "en", invalidSelection)).toMatchObject({ status: "abstained", citations: [] });
  expect(calls).toBe(1);
  expect(await resolveBartaKnowledgeAnswer(knowledge, "Unknown phrasing", "en", async () => { throw new Error("synthetic timeout"); })).toMatchObject({ status: "abstained", citations: [] });
});
