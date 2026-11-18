import { expect, test } from "@playwright/test";
import { detectBartaLanguage } from "../../src/features/barta/chat-language";
import { getBartaGreeting } from "../../src/features/barta/conversation";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";
import { educationTopics } from "../../src/features/barta/education-topics";
import { getBartaSafetyResponse } from "../../src/features/barta/safety-gate";
import { getQuestionBankIntent } from "../../src/features/barta/question-bank-routing";

const knowledge = prepareBartaKnowledge(bartaEducationCorpus, new Date("2026-11-17T00:00:00Z"));

test("typed Auto recognizes chatty Banglish and switches back to English", () => {
  for (const question of ["tumi kemon aso", "tumi kmn aso", "amar baby kemne manage korbo", "গরমে কি পানি দিতে হবে?"]) {
    expect(detectBartaLanguage(question), question).toBe("bn");
  }
  for (const question of ["Could you help me with breastfeeding?", "Thanks!", "Newborn care"]) {
    expect(detectBartaLanguage(question), question).toBe("en");
  }
  expect(detectBartaLanguage("…")).toBeUndefined();
  expect(getBartaGreeting("tumi kmn aso", "bn")).toMatchObject({ status: "conversation" });
  expect(getBartaGreeting("tumi kmn aso, my newborn has a fever", "bn")).toBeUndefined();
});

test("vague baby care asks the age and offers relevant selectable prompts", async () => {
  const answer = await resolveBartaKnowledgeAnswer(knowledge, "amar baby kemne manage korbo", "bn");
  expect(answer).toMatchObject({
    status: "clarification", citations: [],
    message: expect.stringContaining("বয়স কত"),
    suggestions: [educationTopics.newborn.bn, educationTopics.babySleep.bn, educationTopics.solidFood.bn],
  });
  for (const prompt of [educationTopics.newborn.bn, educationTopics.babySleep.bn, educationTopics.solidFood.bn]) {
    expect(await resolveBartaKnowledgeAnswer(knowledge, prompt, "bn")).toMatchObject({ status: "grounded" });
  }
});

test("nearby questions offer related reading without treating symptoms as routine care", async () => {
  expect(await resolveBartaKnowledgeAnswer(knowledge, "baby er ghum setup bhalo kemne korbo", "bn")).toMatchObject({
    status: "clarification", suggestions: [educationTopics.babySleep.bn],
  });
  expect(await resolveBartaKnowledgeAnswer(knowledge, "my newborn is vomiting after a bath", "en")).toMatchObject({
    status: "abstained", citations: [],
  });
  expect(getBartaSafetyResponse("tumi kmn aso, my newborn has a fever", "bn")).toMatchObject({
    status: "abstained", reason: "urgent_care", citations: [],
  });
});

test("verified daily-care workbook questions resolve to detailed bilingual passages", async () => {
  for (const [question, lang, topic, publisher] of [
    ["Nabhir jotno kivabe nibo?", "bn", "cordCare", "World Health Organization"],
    ["How can a working mother keep breastfeeding?", "en", "feedingAtWork", "UNICEF Bangladesh"],
    ["ছয় মাসের পর কী খাবার দেব?", "bn", "solidFood", "World Health Organization"],
    ["What sleeping positions are recommended during pregnancy?", "en", "pregnancySleep", "NHS"],
  ] as const) {
    const intent = getQuestionBankIntent(question, lang);
    expect(intent?.canonical, question).toBe(educationTopics[topic][lang]);
    const answer = await resolveBartaKnowledgeAnswer(knowledge, intent?.canonical ?? question, lang);
    expect(answer).toMatchObject({ status: "grounded", citations: [{ publisher }] });
    if (answer.status === "grounded") expect(answer.claims?.length).toBeGreaterThanOrEqual(3);
  }
});

test("exclusive breastfeeding adds day-to-day context and a cited follow-up", async () => {
  for (const lang of ["bn", "en"] as const) {
    const answer = await resolveBartaKnowledgeAnswer(knowledge, educationTopics.breastfeeding[lang], lang);
    expect(answer).toMatchObject({
      status: "grounded", followUp: educationTopics.solidFood[lang],
      citations: [{ url: "https://www.who.int/news-room/questions-and-answers/item/breastfeeding" }],
    });
    if (answer.status !== "grounded") throw new Error("Expected an approved breastfeeding passage.");
    expect(answer.claims?.length).toBeGreaterThanOrEqual(5);
    expect(answer.claims?.every((claim) => claim.chunkId === answer.citations[0].chunkId)).toBe(true);
  }
});
