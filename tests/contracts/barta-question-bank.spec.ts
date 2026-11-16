import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { bartaFollowUpQuestion, prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";
import { getBartaSafetyResponse } from "../../src/features/barta/safety-gate";

const knowledge = prepareBartaKnowledge(bartaEducationCorpus, new Date("2026-11-17T00:00:00Z"));

test("source-backed question-bank cases work in Bangla, Banglish, and English", async () => {
  for (const [question, locale, expected] of [
    ["গর্ভাবস্থায় কতবার চেকআপ করাতে হবে?", "bn", "১২ সপ্তাহ"],
    ["How many antenatal check-ups should I have?", "en", "eight contacts"],
    ["Prothom checkup kokhon kora uchit?", "bn", "১২ সপ্তাহ"],
    ["altrasound kokhon kora hoy?", "bn", "২৪ সপ্তাহ"],
    ["Can I eat eggs during pregnancy?", "en", "undercooked eggs"],
    ["Shokale bomi bomi bhab hole ki korbo?", "bn", "অল্প অল্প করে"],
  ] as const) {
    expect(getBartaSafetyResponse(question, locale), question).toBeUndefined();
    expect(await resolveBartaKnowledgeAnswer(knowledge, question, locale), question).toMatchObject({
      status: "grounded", answer: expect.stringContaining(expected), citations: expect.any(Array),
    });
  }
});

test("noisy urgent phrases are checked first and pregnancy fragments ask for detail", async () => {
  for (const question of ["খিচু নি", "বাচ্চা নড় ছে না", "rokto pore", "I'm bleeding, but also what should I eat?"]) {
    expect(getBartaSafetyResponse(question, "bn"), question).toMatchObject({
      status: "abstained", reason: "urgent_care", citations: [],
    });
  }
  for (const question of ["pregnent", "prégnency", "gorvo", "গর্ব", "ব্যথা"]) {
    expect(await resolveBartaKnowledgeAnswer(knowledge, question, "bn"), question).toMatchObject({
      status: "clarification", answer: null,
    });
  }
});

test("a request for simpler language keeps its topic across an answer-language change", () => {
  expect(bartaFollowUpQuestion(knowledge, "Easy kore bujhiye bolen.", "bn", "d3c1cbff-9eea-4188-a4aa-4ab204ac65a5"))
    .toBe("গর্ভাবস্থায় প্রথম চেকআপ কখন করা উচিত?");
});
