import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { educationTopics } from "../../src/features/barta/education-topics";
import { bartaFollowUpQuestion, prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";
import { getBartaSafetyResponse } from "../../src/features/barta/safety-gate";

const knowledge = prepareBartaKnowledge(bartaEducationCorpus, new Date("2026-11-17T00:00:00Z"));

test("minor typos in complete education questions are recovered in three input styles", async () => {
  for (const [question, language, chunkId] of [
    ["What is postnatal crae?", "en", "07e4ddd7-06b5-4f5b-8bb3-ab2edbb049bb"],
    ["গর্ভকালীন স্বাস্থ্য পরিক্ষায় কী হয়?", "bn", "b1452c85-a9ee-4409-9f63-af1517f03e4f"],
    ["exclusive brestfeeding mane ki?", "bn", "b1c0ab8d-03ad-4adf-959f-1ab5e777c529"],
  ] as const) {
    expect(await resolveBartaKnowledgeAnswer(knowledge, question, language), question).toMatchObject({
      status: "grounded", citations: [{ chunkId }],
    });
  }
});

test("incomplete questions prompt for detail and suggestions are currently supported", async () => {
  expect(await resolveBartaKnowledgeAnswer(knowledge, "Breastfeeding", "en")).toMatchObject({
    status: "clarification", answer: null, citations: [], suggestions: [educationTopics.breastfeeding.en],
  });
  expect(await resolveBartaKnowledgeAnswer(knowledge, "এটা কি স্বাভাবিক?", "bn")).toMatchObject({
    status: "clarification", answer: null, citations: [],
  });
  expect(await resolveBartaKnowledgeAnswer(knowledge, "Is dehydration common in newborns?", "en")).toMatchObject({
    status: "abstained", answer: null, citations: [],
  });
});

test("context helps with a typo but is not used for compound messages", () => {
  const chunk = "5fb06b54-29aa-424c-968f-bcea163c636a";
  expect(bartaFollowUpQuestion(knowledge, "What about fod?", "en", chunk)).toBe(educationTopics.nutrition.en);
  const compound = "What about food? I'm bleedig heavliy.";
  expect(bartaFollowUpQuestion(knowledge, compound, "en", chunk)).toBe(compound);
  expect(getBartaSafetyResponse(compound, "en")).toMatchObject({
    status: "abstained", reason: "urgent_care", citations: [],
  });
});

test("a preview model match suggests a question for confirmation", async () => {
  const result = await resolveBartaKnowledgeAnswer(knowledge, "What is postpartum follow-up care?", "en",
    async () => "07e4ddd7-06b5-4f5b-8bb3-ab2edbb049bb");
  expect(result).toMatchObject({
    status: "clarification", answer: null, citations: [], suggestions: [educationTopics.postnatal.en],
  });
});
