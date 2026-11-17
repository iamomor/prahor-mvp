import { mkdir, readFile, writeFile } from "node:fs/promises";
import { bartaAsk, canonicalQuestions, conversations } from "./barta-check.mjs";

const canonical = await canonicalQuestions();
const bank = process.argv.includes("--materials")
  ? JSON.parse(await readFile("tests/fixtures/barta-material-audit.json", "utf8"))
  : [];
const tests = [
  ...canonical.map((item) => ({ ...item, expected: "grounded", enforce: true })),
  ...conversations.map(([question, language]) => ({ id: "small-talk", question, language, expected: "conversation", enforce: true })),
  { id: "mixed-urgent", question: "Hello, my newborn has a fever", language: "en", expected: "urgent_care", enforce: true },
  { id: "baby-nearby", question: "amar baby kemne manage korbo?", language: "bn", expected: "clarification", enforce: true },
  ...bank.map((item) => ({ ...item, language: item.style === "bangla" || item.style === "banglish" ? "bn" : "en" })),
];

const suggestions = new Map();
const results = [];
const failures = [];
for (const item of tests) {
  try {
    const reply = await bartaAsk(item.question, item.language);
    const outcome = reply.reason || reply.status;
    results.push({ ...item, outcome, ...((reply.citations || []).length && { citationTitle: reply.citations[0].title }) });
    if (item.enforce && item.expected !== outcome) failures.push(`${item.id}/${item.language} — expected ${item.expected}, got ${outcome}`);
    if (reply.status === "grounded" && !(reply.citations || []).length) failures.push(`${item.id}/${item.language} — missing citation`);
    if (item.id === "postnatal" && typeof reply.answer === "string") {
      const sentences = reply.answer.split(/(?<=[.!?।])\s+/u).map((line) => line.trim()).filter(Boolean);
      if (new Set(sentences).size !== sentences.length) failures.push(`${item.id}/${item.language} — repeated sentence`);
    }
    const offers = reply.status === "clarification" ? reply.suggestions : [reply.followUp];
    for (const question of offers || []) {
      if (typeof question !== "string" || !question) continue;
      const key = item.language + "\n" + question;
      const mustGround = reply.status === "grounded" || (suggestions.get(key)?.mustGround ?? false);
      suggestions.set(key, { question, language: item.language, mustGround });
    }
  } catch (error) {
    results.push({ ...item, outcome: "request_error", error: error.message });
    failures.push(`${item.id}/${item.language} — ${error.message}`);
  }
}
for (const { question, language, mustGround } of suggestions.values()) {
  try {
    const reply = await bartaAsk(question, language);
    const cited = reply.status === "grounded" && (reply.citations || []).length;
    const safety = reply.status === "abstained" && [
      "urgent_care", "crisis_support", "outside_education_scope",
    ].includes(reply.reason);
    if (!cited && (mustGround || !safety)) {
      failures.push(`Suggested question ${language} "${question}" — got ${reply.reason || reply.status}`);
    }
  } catch (error) {
    failures.push(`Suggested question ${language} "${question}" — ${error.message}`);
  }
}
const counts = {};
for (const { outcome } of results) counts[outcome] = (counts[outcome] || 0) + 1;
const materialGaps = results.filter((r) => (/^ANSWER$|^Educational$/u.test(r.expected)) && r.outcome !== "grounded");
await mkdir("test-results", { recursive: true });
await writeFile("test-results/barta-material-audit.json", JSON.stringify({ counts, results, failures, materialGaps }, null, 2) + "\n");
console.log(`Checked ${tests.length} replies and ${suggestions.size} selectable questions.`);
console.log(counts);
console.log(`${materialGaps.length} candidate material gaps need review. Report: test-results/barta-material-audit.json.`);
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
}
