// AAC catalog growth must never weaken Barta safety. Runs offline: no install, no server, no AI.
// Fixtures: barta-safety-65.tsv is the M2 kit's 65-phrase run; barta-bank-escalations.tsv is the gate's
// routing of the 808-question bank recorded BEFORE the STEP 04 change (every other row routes to "answer").
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const load = (source) => import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`);
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const aac = await load(read("../../src/features/adapt/lib/aac-phrases.ts"));
const gate = await load(read("../../src/features/barta/safety-gate.ts")
  .replace(/import \{[^}]*\} from "@\/lib\/contracts\/barta";/u, "const bartaAnswerSchema = { parse: (value) => value };"));
const route = (q, lang) => gate.getBartaSafetyResponse(q, lang)?.reason ?? "answer";
const phrase = (ids, lang) => aac.generateNaturalPhrase(ids.map(id => aac.AAC_ITEMS_BY_ID.get(id)), lang);

const ORIGINAL_IDS = ["pain", "headache", "dizzy", "fever", "nausea", "bleed", "swelling", "weakness", "baby_movement",
  "belly", "head", "back", "feet", "chest", "pelvis", "help", "doctor", "water", "rest", "question", "call_family",
  "anxious", "uncomfortable", "urgent"];
const NEW_IDS = ["please_wait", "say_again", "speak_slowly", "write_it", "show_me", "explain", "not_understand",
  "understand", "pause_talk", "my_way", "privacy", "interpreter"];

test("catalog grows by exactly 12 unique Talking-with-me items; the original 24 are untouched", async () => {
  const ids = aac.AAC_CATALOG.flatMap(category => category.items.map(item => item.id));
  assert.equal(new Set(ids).size, ids.length, "ids are unique");
  assert.equal(ids.length, 36);
  assert.deepEqual(ids, [...ORIGINAL_IDS, ...NEW_IDS], "existing order kept, new items appended");
  assert.deepEqual(aac.AAC_CATALOG.map(c => `${c.id}:${c.items.length}`), ["symptoms:9", "body-areas:6", "requests:6", "feelings:3", "talking:12"]);
  // Field-for-field comparison against the committed HEAD catalog.
  const head = await load(execFileSync("git", ["show", "HEAD:src/features/adapt/lib/aac-phrases.ts"], { encoding: "utf8" }));
  for (const before of head.AAC_CATALOG.flatMap(category => category.items)) {
    assert.deepEqual(aac.AAC_ITEMS_BY_ID.get(before.id), before, before.id);
  }
});

test("every new item has words in both languages, never an emoji alone", () => {
  for (const id of NEW_IDS) {
    const item = aac.AAC_ITEMS_BY_ID.get(id);
    for (const text of [item.labelEn, item.labelBn, item.enFragment, item.bnFragment]) {
      assert.match(text, /[A-Za-zঀ-৿]{2}/u, `${id}: "${text}"`);
    }
    assert.match(item.labelBn + item.bnFragment, /[ঀ-৿]/u, `${id} has Bangla`);
    assert.equal(phrase([id], "en"), item.enFragment);
    assert.equal(phrase([id], "bn"), item.bnFragment);
  }
});

test("new items alone are ordinary messages; they never trigger or hide urgent routing", () => {
  for (const lang of ["en", "bn"]) {
    for (const id of NEW_IDS) {
      assert.equal(route(phrase([id], lang), lang), "answer", `${lang} ${id} alone`);
      assert.equal(route(phrase(["fever", "weakness", id], lang), lang), "urgent_care", `${lang} fever+weakness+${id}`);
      assert.equal(route(phrase([id, "baby_movement"], lang), lang), "urgent_care", `${lang} ${id}+baby_movement`);
    }
  }
});

test("AAC symbol combinations keep their safety step (M2 kit table), composed by the real generator", () => {
  const cases = [
    [["fever", "weakness"], "urgent_care"], [["swelling", "headache"], "urgent_care"],
    [["bleed", "urgent"], "urgent_care"], [["pain", "belly", "urgent"], "urgent_care"],
    [["baby_movement"], "urgent_care"], [["anxious"], "answer"], [["help", "doctor"], "answer"],
  ];
  for (const lang of ["en", "bn"]) for (const [ids, want] of cases) assert.equal(route(phrase(ids, lang), lang), want, `${lang} ${ids.join("+")}`);
});

test("the 65-phrase safety run is unchanged (gate stage)", () => {
  const rows = read("../fixtures/barta-safety-65.tsv").trim().split("\n").map(line => line.split("\t"));
  assert.equal(rows.length, 65);
  for (const [lang, q, want] of rows) {
    // "clarification" is decided by the later bleeding-clarification stage; the gate must leave it alone.
    assert.equal(route(q, lang), want === "clarification" ? "answer" : want, `${lang} ${q}`);
  }
});

test("the 808-question bank routes exactly as before", () => {
  const bank = JSON.parse(read("../../src/features/barta/question-bank-prompts.json"));
  assert.equal(bank.length, 808);
  // Keyed by row position: bank ids are not unique.
  const escalated = new Map(read("../fixtures/barta-bank-escalations.tsv").trim().split("\n")
    .map(line => line.split("\t")).map(([row, id, reason]) => [Number(row), { id, reason }]));
  assert.equal(escalated.size, 47);
  bank.forEach(([id, , language, question], row) => {
    const want = escalated.get(row);
    if (want) assert.equal(want.id, id, `fixture row ${row} still points at ${id}`);
    assert.equal(route(question, language === "Bangla" ? "bn" : "en"), want?.reason ?? "answer", `${row} ${id}`);
  });
});
