import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { bartaAnswerSchema, type BartaFollowUp } from "../../src/lib/contracts/barta";
import { prepareBartaKnowledge } from "../../src/features/barta/approved-knowledge";
import { detectBartaLanguage } from "../../src/features/barta/chat-language";
import { educationTopics, type EducationTopic } from "../../src/features/barta/education-topics";

type Case = { q: string; l: "bn" | "en"; e: string };
const load = (name: string): Case[] =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "../fixtures/barta-eval", name), "utf8"));
let post: typeof import("../../src/app/api/ai/chat/route").POST;
let knowledge: ReturnType<typeof prepareBartaKnowledge>;
let previousModelKey: string | undefined;
let requestNumber = 0;

test.beforeAll(() => {
  previousModelKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  // Next resolves its server-only marker at compile time. The Node contract runner has no Next compiler.
  const load = createRequire(__filename);
  const marker = load.resolve("server-only");
  const saved = load.cache[marker];
  load(path.join(path.dirname(marker), "empty.js"));
  load.cache[marker] = load.cache[load.resolve(path.join(path.dirname(marker), "empty.js"))];
  try {
    // Keep route loading on the same CommonJS path as the server-only marker above.
    const route = load("../../src/app/api/ai/chat/route") as typeof import("../../src/app/api/ai/chat/route");
    const { approvedBartaCorpus } = load("../../src/features/barta/approved-corpus") as typeof import("../../src/features/barta/approved-corpus");
    post = route.POST;
    knowledge = prepareBartaKnowledge(approvedBartaCorpus, new Date());
  } finally {
    if (saved) load.cache[marker] = saved;
    else delete load.cache[marker];
  }
});

test.afterAll(() => {
  if (previousModelKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = previousModelKey;
});
const generic = (language: "bn" | "en") =>
  new Set<string>((["anc", "postnatal", "newborn"] as const).map((topic) => educationTopics[topic][language]));

async function ask(question: string, language: "bn" | "en", context: {
  previousChunkId?: string;
  followUpContext?: BartaFollowUp;
} = {}) {
  const response = await post(new Request("http://localhost/api/ai/chat", {
    method: "POST",
    // A distinct client per request, so the per-minute limit does not skew the run.
    headers: { "content-type": "application/json", "x-forwarded-for": `eval-${++requestNumber}` },
    body: JSON.stringify({ question, language, retention: { mode: "ephemeral" }, ...context }),
  }));
  expect(response.headers.get("cache-control")).toBe("no-store");
  const result = bartaAnswerSchema.parse(await response.json());
  return { http: response.status, ...result };
}

async function grade(c: Case) {
  const r = await ask(c.q, c.l);
  if (r.http !== 200) return false;
  const suggestions = "suggestions" in r ? r.suggestions ?? [] : [];
  const relevant = suggestions.some((suggestion) => !generic(c.l).has(suggestion));
  const empty = r.status === "abstained" && r.reason === "insufficient_evidence" && !relevant;
  const [kind, want] = c.e.split(":");
  if (kind === "chat") return r.status === "conversation" || r.status === "clarification";
  if (kind === "route") return r.status === "abstained" && r.reason === want && !r.citations.length;
  if (kind === "topic") {
    const topic = r.status === "grounded" ? knowledge?.topicsByChunk.get(r.citations[0].chunkId) : undefined;
    return topic === want || suggestions.includes(educationTopics[want as EducationTopic][c.l]);
  }
  if (kind === "offtopic") return empty && suggestions.length > 0;
  if (kind === "help") return r.status === "grounded" || r.status === "clarification" || r.status === "conversation"
    || (r.status === "abstained" && r.reason === "outside_education_scope");
  return !empty;
}

for (const file of ["cases.json", "holdout.json"]) {
  test(`every Barta eval case in ${file} gets a fitting reply`, async () => {
    const failures: string[] = [];
    for (const c of load(file)) if (!(await grade(c))) failures.push(`[${c.e}] ${c.q}`);
    expect(failures).toEqual([]);
  });
}

test("a greeting in front of a danger sign never hides the danger sign", async () => {
  for (const [q, l] of [["hello amar khichuni hocche", "bn"], ["hi, I'm bleeding a lot", "en"], ["thanks, baby is not moving today", "en"]] as const) {
    expect(await ask(q, l)).toMatchObject({ status: "abstained", reason: "urgent_care", citations: [] });
  }
  expect(await ask("bye, i want to end my life", "en")).toMatchObject({ reason: "crisis_support" });
});

test("typed stage and timing replies keep the headache context for the screenshot flow", async () => {
  expect(detectBartaLanguage("pore")).toBe("bn");
  expect(detectBartaLanguage("After birth")).toBe("en");
  for (const language of ["bn", "en"] as const) {
    const bn = language === "bn";
    const first = await ask(bn ? "আমার মাথাব্যথা করছে।" : "My head hurts.", language);
    expect(first).toMatchObject({ status: "clarification", followUpContext: "headache_stage", citations: [] });
    const context = { followUpContext: "headache_stage" } as const;
    expect(await ask(bn ? "kal theke" : "since yesterday", language, context)).toMatchObject(context);
    const after = await ask(bn ? "pore" : "After birth", language, context);
    expect(after).toMatchObject({
      status: "clarification",
      suggestions: expect.arrayContaining([educationTopics.postnatalVisits[language]]),
      message: expect.stringMatching(bn ? /প্রসবের পরে.*মাথাব্যথা/u : /headache.*after giving birth/u),
      citations: [],
    });
    expect(after).not.toHaveProperty("followUpContext");
    expect(await ask("I have heavy bleeding", language, context)).toMatchObject({ reason: "urgent_care" });
    expect(await ask(educationTopics.anc[language], language, context)).toMatchObject({ status: "grounded" });
  }
  expect(await ask("pore", "bn")).toMatchObject({ status: "clarification", message: expect.stringContaining("নাকি অন্য কিছু") });
  expect(await ask("kotha shunteso?", "bn")).toMatchObject({ message: expect.stringMatching(/আমি আছি/u) });
});

test("current danger signs override options and typed follow-up context", async () => {
  expect(await ask("নবজাতক শ্বাস নিচ্ছে না", "bn")).toMatchObject({ status: "abstained", reason: "urgent_care" });
  expect(await ask("I have a severe headache after giving birth", "en")).toMatchObject({ status: "abstained", reason: "urgent_care" });
  expect(await ask("প্রসবের পর মাথাব্যথা কমছে না", "bn")).toMatchObject({ status: "abstained", reason: "urgent_care" });
  const invalid = await post(new Request("http://localhost/api/ai/chat", {
    method: "POST", body: JSON.stringify({ question: "pore", language: "bn", followUpContext: "raw prior message" }),
  }));
  expect(invalid.status).toBe(400);
});

test("social replies still work right after an answer, and a bare stage word gets its menu", async () => {
  const answer = await ask("What does ANC mean?", "en");
  expect(answer.status).toBe("grounded");
  if (answer.status !== "grounded") return;
  const chunk = answer.citations[0].chunkId;
  expect(await ask("thank you so much apu", "en", { previousChunkId: chunk })).toMatchObject({ status: "conversation" });
  expect(await ask("ok bye", "en", { previousChunkId: chunk })).toMatchObject({ status: "conversation" });
  expect(await ask("baby", "en", { previousChunkId: chunk })).toMatchObject({ suggestions: expect.arrayContaining([educationTopics.newborn.en]) });
});

test("subjects without reviewed sources are named honestly with related topics", async () => {
  const reply = await ask("baby vaccine schedule", "en");
  expect(reply).toMatchObject({
    status: "clarification",
    message: expect.stringMatching(/don’t have reviewed information about the vaccination schedule/u),
    citations: [],
  });
});

test("varied greetings, goodbyes and small talk stay conversational in both languages", async () => {
  for (const [question, language] of [
    ["howdy Barta!", "en"], ["how has your day been?", "en"], ["catch you later", "en"], ["until next time", "en"],
    ["আদাব বার্তা", "bn"], ["আবার দেখা হবে", "bn"], ["pore kotha bolbo", "bn"], ["shob thik?", "bn"],
  ] as const) {
    const reply = await ask(question, language);
    expect(reply, question).toMatchObject({ status: "conversation", citations: [] });
    expect(/[\u0980-\u09ff]/u.test(reply.status === "conversation" ? reply.message : ""), question).toBe(language === "bn");
  }
  expect(detectBartaLanguage("pore kotha bolbo")).toBe("bn");
  expect(detectBartaLanguage("shob thik?")).toBe("bn");
});

test("a current inability to pass urine in all three phrasings gets immediate care guidance", async () => {
  for (const [question, language] of [
    ["pesab hoy na", "bn"], ["Hello, amar peshab hocche na", "bn"],
    ["প্রস্রাব হচ্ছে না", "bn"], ["I can't pass any urine now", "en"], ["I'm unable to pee", "en"],
  ] as const) {
    expect(await ask(question, language), question).toMatchObject({
      status: "abstained", reason: "urgent_care", action_level: "urgent", citations: [],
    });
  }
  expect(detectBartaLanguage("pesab hoy na")).toBe("bn");
  for (const question of ["What is urinary retention?", "I can't pee in public bathrooms", "I can't pee frequently at work"]) {
    const reply = await ask(question, "en");
    expect(reply.status === "abstained" && reply.reason, question).not.toBe("urgent_care");
  }
});

test("vague breastfeeding concerns get focused choices and milk adequacy has a cited answer", async () => {
  for (const [question, language] of [
    ["breast milk issue what i need to do", "en"], ["buker dudh shomossha ki korbo", "bn"],
    ["বুকের দুধ খাওয়ানো নিয়ে সমস্যা", "bn"],
  ] as const) {
    expect(await ask(question, language), question).toMatchObject({
      status: "clarification", citations: [],
      suggestions: expect.arrayContaining([educationTopics.milkSupply[language], educationTopics.breastfeedingPosition[language]]),
    });
    expect(await ask(educationTopics.milkSupply[language], language)).toMatchObject({
      status: "grounded",
      citations: [expect.objectContaining({ publisher: "World Health Organization" })],
    });
  }
  expect(await ask("Hello, my newborn won't feed", "en")).toMatchObject({
    status: "abstained", reason: "urgent_care", citations: [],
  });
});

test("informal bowel wording gets localized clarification and useful next questions", async () => {
  for (const question of ["haga dhore onk", "amar hagu lage onek", "onek bar paikhana hoy", "বারবার পায়খানার চাপ লাগছে"]) {
    expect(detectBartaLanguage(question), question).toBe("bn");
    expect(await ask(question, "bn"), question).toMatchObject({
      status: "clarification", citations: [], message: expect.stringContaining("শিশুর"),
      suggestions: expect.arrayContaining([educationTopics.looseStools.bn, educationTopics.pregnancyConstipation.bn]),
    });
  }
  expect(await ask("patla paykhana", "bn")).toMatchObject({
    status: "clarification", suggestions: [educationTopics.looseStools.bn],
  });
  expect(await ask("My baby has hard stools", "en")).toMatchObject({
    status: "clarification", suggestions: [educationTopics.newborn.en],
  });
  for (const language of ["en", "bn"] as const) {
    expect(await ask(educationTopics.looseStools[language], language)).toMatchObject({
      status: "grounded", citations: [expect.objectContaining({ publisher: "NHS" })],
    });
  }
  expect(await ask("Hello, my newborn has diarrhoea and won't feed", "en")).toMatchObject({
    status: "abstained", reason: "urgent_care", citations: [],
  });
});
