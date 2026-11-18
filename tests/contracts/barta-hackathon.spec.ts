import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { prepareBartaKnowledge, resolveBartaKnowledgeAnswer } from "../../src/features/barta/approved-knowledge";
import { getBartaSafetyResponse } from "../../src/features/barta/safety-gate";

const knowledge = prepareBartaKnowledge(bartaEducationCorpus, new Date("2026-11-17T00:00:00Z"));

test("demo paths find the intended publisher and apply language per request", async () => {
  for (const [question, language, publisher] of [
    ["pregnancy te ki ki khawa uchit?", "bn", "Directorate General of Health Services, Bangladesh"],
    ["গর্ভাবস্থায় কী খাব?", "en", "Directorate General of Health Services, Bangladesh"],
    ["pregnancy trimester mane ki?", "bn", "UNICEF Bangladesh"],
    ["What are pregnancy trimesters?", "en", "UNICEF Bangladesh"],
    ["deliveryr age ki prostuti nibo?", "bn", "World Health Organization"],
    ["What is preeclampsia?", "en", "World Health Organization"],
    ["গর্ভাবস্থায় মানসিক স্বাস্থ্য নিয়ে কথা বলা যায় কি?", "bn", "World Health Organization"],
    ["Which symptoms in pregnancy need urgent help?", "en", "World Health Organization"],
  ] as const) {
    expect(getBartaSafetyResponse(question, language), question).toBeUndefined();
    const answer = await resolveBartaKnowledgeAnswer(knowledge, question, language);
    expect(answer, question).toMatchObject({ status: "grounded", citations: [{ publisher }] });
    if (answer.status !== "grounded") continue;
    expect(/[\u0980-\u09ff]/u.test(answer.answer)).toBe(language === "bn");
  }
});

test("personal and urgent queries from the demo brief are routed before retrieval", () => {
  for (const [question, reason] of [
    ["Pregnancy te matha onek betha kore, ki korbo?", "urgent_care"],
    ["Baccha ager moto norachora kortese na.", "urgent_care"],
    ["What is ANC? Baccha ager moto norachora kortese na.", "urgent_care"],
    ["Amar pa fulay jacche, eta ki normal?", "outside_education_scope"],
    ["Ami 5 maser pregnant, ekhon ki test lagbe?", "outside_education_scope"],
    ["Can I take this medicine?", "outside_education_scope"],
  ] as const) {
    expect(getBartaSafetyResponse(question, "bn"), question).toMatchObject({ status: "abstained", reason, citations: [] });
  }
});

test("two explicit supported questions assemble cited claims from both sources", async () => {
  const answer = await resolveBartaKnowledgeAnswer(knowledge, "What are the stages of pregnancy? How do I prepare a birth plan?", "en");
  expect(answer.status).toBe("grounded");
  if (answer.status !== "grounded") return;
  expect(answer.citations.map((citation) => citation.publisher)).toEqual(["UNICEF Bangladesh", "World Health Organization"]);
  expect(new Set(answer.claims?.map((claim) => claim.chunkId))).toEqual(new Set(answer.citations.map((citation) => citation.chunkId)));
  const partial = await resolveBartaKnowledgeAnswer(knowledge, "What are the stages of pregnancy? How do I forecast rain?", "en");
  expect(partial).toMatchObject({ status: "abstained", citations: [] });
});

test("semantic preview can only offer options backed by the approved shortlist", async () => {
  let evidence: string | undefined;
  const result = await resolveBartaKnowledgeAnswer(knowledge, "What should be on a childbirth preparation checklist?", "en", async (_question, options) => {
    const candidate = options.find(({ example }) => example === "how do i prepare a birth plan");
    evidence = candidate?.evidence;
    return candidate?.id ?? null;
  });
  expect(evidence).toContain("where you plan to give birth");
  expect(result).toMatchObject({ status: "clarification", suggestions: ["How do I prepare a birth plan?"] });
});

test("every qualified corpus prompt works in both requested answer languages", async () => {
  for (const passage of bartaEducationCorpus.passages) {
    for (const question of passage.questions) {
      for (const language of ["bn", "en"] as const) {
        expect(getBartaSafetyResponse(question, language), question).toBeUndefined();
        const result = await resolveBartaKnowledgeAnswer(knowledge, question, language);
        expect(result, question).toMatchObject({ status: "grounded", citations: [{ sourceId: passage.sourceId }] });
      }
    }
  }
});
