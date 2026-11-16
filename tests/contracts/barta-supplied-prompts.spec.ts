import { expect, test } from "@playwright/test";
import prompts from "../../src/features/barta/question-bank-prompts.json";
import { getBankSafety, getQuestionBankIntent } from "../../src/features/barta/question-bank-routing";
import { getBartaGreeting } from "../../src/features/barta/conversation";

test("each supplied prompt can be recognized by the runtime catalog", () => {
  expect(prompts.filter(([id]) => id.startsWith("BQ-"))).toHaveLength(311);
  expect(prompts.filter(([id]) => id.startsWith("BARTA-"))).toHaveLength(497);
  for (const [id, , locale, question] of prompts) {
    const input = question.replace(/\s*\((?:broken STT text|for গর্ভ)\)$/u, "");
    expect(getQuestionBankIntent(input, locale === "English" ? "en" : "bn"), id).toBeDefined();
  }
});

test("specific bank questions are safely routed or answered by a verified topic", () => {
  expect(getBankSafety("Newborn won't feed and is limp.", "en")).toMatchObject({
    status: "abstained", reason: "urgent_care", message: expect.stringContaining("newborn"),
  });
  expect(getBankSafety("I don't want to live.", "en")).toMatchObject({ reason: "crisis_support" });
  expect(getBankSafety("Where do I call in an emergency?", "en")).toBeUndefined();
  expect(getQuestionBankIntent("How many antenatal check-ups should I have?", "en")?.canonical)
    .toBe("When do antenatal check-ups usually start?");
  expect(getQuestionBankIntent("How much will delivery cost?", "en")?.fallback())
    .toMatchObject({ reason: "insufficient_evidence" });
  expect(getBartaGreeting("PROHOR, I love you!", "en"))
    .toMatchObject({ status: "conversation", message: expect.stringContaining("That’s kind") });
});
