import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { educationTopics } from "../../src/features/barta/education-topics";
import { bartaFollowUpQuestion, getBartaKnowledgeAnswer, prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";

const now = new Date("2026-11-17T00:00:00Z");
const knowledge = prepareBartaKnowledge(bartaEducationCorpus, now);
const ancVisitChunk = "5fb06b54-29aa-424c-968f-bcea163c636a";

test("each educational topic returns the correct translation and source metadata", () => {
  for (const query of Object.values(educationTopics).filter((topic) => topic !== educationTopics.anc)) {
    for (const language of ["bn", "en"] as const) {
      const result = getBartaKnowledgeAnswer(knowledge, query[language === "bn" ? "en" : "bn"], language);
      expect(result.status).toBe("grounded");
      if (result.status !== "grounded") continue;
      const expected = bartaEducationCorpus.passages.find((passage) => passage.language === language && passage.questions.includes(query[language]));
      const source = bartaEducationCorpus.sources.find((entry) => entry.id === expected?.sourceId);
      expect(expected).toBeDefined();
      expect(source).toBeDefined();
      expect(result.answer).toBe(expected?.text);
      expect(result.claims?.map((claim) => claim.text).join(" ")).toBe(expected?.text);
      expect(result.claims?.every((claim) => claim.chunkId === result.citations[0].chunkId)).toBe(true);
      expect(result).toMatchObject({
        confidence: "source_supported",
        actionLevel: "education",
        citations: [{ chunkId: expected?.chunkId, publisher: source?.publisher }],
      });
      if (query === educationTopics.nutrition) expect(result.citations[0].page).toBe(3);
    }
  }
});

test("known Banglish and topic-scoped follow-ups retrieve the linked education", () => {
  expect(getBartaKnowledgeAnswer(knowledge, "anc visit e ki hoy?", "bn")).toMatchObject({ status: "grounded" });
  expect(bartaFollowUpQuestion(knowledge, "What about food?", "en", ancVisitChunk)).toBe(educationTopics.nutrition.en);
  expect(bartaFollowUpQuestion(knowledge, "khabar niye ki?", "bn", ancVisitChunk)).toBe(educationTopics.nutrition.bn);
  expect(bartaFollowUpQuestion(knowledge, "What about food?", "en")).toBe("What about food?");
  const mixed = "What about food? I have heavy bleeding.";
  expect(bartaFollowUpQuestion(knowledge, mixed, "en", ancVisitChunk)).toBe(mixed);
});

test("new question variants resolve to the existing cited passages", () => {
  const cases = [
    ["What tests do they do at a pregnancy checkup?", "en", educationTopics.ancVisits.en],
    ["গর্ভাবস্থায় চেকআপে কী কী পরীক্ষা করা হয়?", "bn", educationTopics.ancVisits.bn],
    ["pregnancy checkup e ki ki test kore?", "bn", educationTopics.ancVisits.bn],
    ["জন্মের পরপর শিশুর প্রাথমিক যত্নে কী করা হয়?", "bn", educationTopics.newborn.bn],
    ["nabhi porar age kivabe jotno nebo?", "bn", educationTopics.cordCare.bn],
  ] as const;
  for (const [question, language, canonical] of cases) {
    const expected = getBartaKnowledgeAnswer(knowledge, canonical, language);
    expect(expected.status).toBe("grounded");
    expect(getBartaKnowledgeAnswer(knowledge, question, language)).toEqual(expected);
  }
});

test("expired or off-allowlist sources cannot supply answers or follow-ups", () => {
  const expired = prepareBartaKnowledge(bartaEducationCorpus, new Date("2027-05-16T00:00:00Z"));
  expect(expired?.available).toBe(false);
  expect(bartaFollowUpQuestion(expired, "What about food?", "en", ancVisitChunk)).toBe("What about food?");
  const spoofed = prepareBartaKnowledge({
    ...bartaEducationCorpus,
    sources: bartaEducationCorpus.sources.map((source) => ({ ...source, url: "https://www.who.int.example.org/fake" })),
  }, now);
  expect(spoofed?.available).toBe(false);
});

test("keyword retrieval prioritizes relevant candidates and rejects invented selections", async () => {
  const result = await resolveBartaKnowledgeAnswer(knowledge, "Explain what exclusive breastfeeding is", "en", async (_, options) => {
    expect(options[0]?.example).toBe("what does exclusive breastfeeding mean");
    return "not-a-retrieved-id";
  });
  expect(result).toMatchObject({ status: "abstained", citations: [] });
});
