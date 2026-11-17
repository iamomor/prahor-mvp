import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";
import { getQuestionBankIntent } from "../../src/features/barta/question-bank-routing";

const knowledge = prepareBartaKnowledge(bartaEducationCorpus, new Date("2026-11-17T00:00:00Z"));

test("Bengali ANC answer describes the check-up and what to ask before leaving", async () => {
  const result = await resolveBartaKnowledgeAnswer(knowledge, "গর্ভকালীন স্বাস্থ্য পরীক্ষায় কী হয়?", "bn");
  expect(result).toMatchObject({
    status: "grounded",
    answer: expect.stringContaining("রক্তচাপ"),
    citations: [{ publisher: "World Health Organization" }],
  });
  if (result.status !== "grounded") return;
  expect(result.answer).toContain("রক্ত পরীক্ষা");
  expect(result.answer).toContain("আবার কখন আসবেন");
  expect(result.claims?.length).toBeGreaterThan(3);
});

test("additional workbook intents map to the corresponding reviewed topic", async () => {
  for (const [question, phrase] of [
    ["How do I use my ANC card?", "appointments, test results"],
    ["Why is blood pressure checked?", "protein in your urine"],
    ["Is exercise or walking okay?", "drink water"],
    ["Who can be with me during delivery?", "companion you choose"],
    ["How do I breastfeed correctly?", "head and body in a straight line"],
    ["What happens in an OGTT?", "glucose drink"],
  ]) {
    const query = getQuestionBankIntent(question, "en")?.canonical ?? question;
    expect(await resolveBartaKnowledgeAnswer(knowledge, query, "en"), question).toMatchObject({
      status: "grounded",
      answer: expect.stringContaining(phrase),
    });
  }
});
