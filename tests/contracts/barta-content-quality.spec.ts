import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";

test("educational passages do not repeat identical sentences in text or read aloud", () => {
  for (const passage of bartaEducationCorpus.passages) {
    const segmenter = new Intl.Segmenter(passage.language, { granularity: "sentence" });
    const sentences = Array.from(segmenter.segment(passage.text), ({ segment }) => segment.trim()).filter(Boolean);
    expect(new Set(sentences).size, `${passage.topic} / ${passage.language}`).toBe(sentences.length);
  }
});
