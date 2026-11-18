import { expect, test } from "@playwright/test";
import type { BartaAnswer } from "../../src/lib/contracts/barta";
import { buildBartaSpeechText, getBartaSpokenGuide, maxSpeechText, prepareSpeechText } from "../../src/features/barta/barta-spoken-text";
import { educationTopicIds, educationTopics } from "../../src/features/barta/education-topics";

test("spoken replies include source details, a follow-up and clarification choices", () => {
  const answer: BartaAnswer = {
    status: "grounded",
    answer: "পুরো উত্তর।",
    limitations: ["সাধারণ তথ্য"],
    followUp: "পরের প্রশ্ন কী?",
    citations: [{
      sourceId: "example", chunkId: "example-1", sourceVersion: "1",
      title: "Example source", publisher: "Example publisher", url: "https://example.org/",
      locator: "Overview", reviewedAt: "2026-11-16T00:00:00Z", publicationYear: 2025, page: 8,
    }],
  };
  const text = buildBartaSpeechText(answer, "bn");
  expect(text).toContain(answer.answer);
  expect(text).toContain("Example publisher. Example source. 2025. Overview. পৃষ্ঠা 8");
  expect(text).toContain("পরের প্রশ্ন কী?");

  const spokenChoices = buildBartaSpeechText({
    status: "clarification", answer: null, citations: [],
    message: "Which topic?", suggestions: ["Pregnancy", "Newborn care"],
  }, "en");
  expect(spokenChoices).toContain("Which topic?");
  expect(spokenChoices).toContain("Pregnancy\nNewborn care");
});

test("the spoken guide includes every suggested topic in both languages", () => {
  for (const language of ["bn", "en"] as const) {
    const guide = getBartaSpokenGuide(language);
    expect(guide.length).toBeLessThanOrEqual(maxSpeechText);
    for (const topic of educationTopicIds) {
      expect(guide).toContain(educationTopics[topic][language]);
    }
  }
});

test("speech-only formatting opens space between phrases and preserves numeric facts", () => {
  const text = prepareSpeechText("ANC কী।\nপৃষ্ঠা 8", "bn");
  expect(text).toMatch(/^এ এন সি কী\./u);
  expect(text).toContain("পৃষ্ঠা 8");
  expect(prepareSpeechText("Ask about ANC\nCheck your draft", "en")).toBe("Ask about A N C.\n\nCheck your draft");
});
