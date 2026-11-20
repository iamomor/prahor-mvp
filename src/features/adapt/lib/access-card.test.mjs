import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("./access-card.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {}, Intl, Date };
vm.runInNewContext(js, context);
const card = context.exports;
const now = new Date("2026-11-19T12:00:00.000Z");
const plain = (value) => JSON.parse(JSON.stringify(value));

test("catalog: unique ids, both languages filled, every group used", () => {
  const ids = card.ACCESS_NEEDS.map((need) => need.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const need of card.ACCESS_NEEDS) assert.ok(need.en.trim() && need.bn.trim(), need.id);
  for (const group of card.ACCESS_NEED_GROUPS) assert.ok(card.ACCESS_NEEDS.some((need) => need.group === group.id), group.id);
});

test("a valid card keeps catalog order, removes repeats and tidies text", () => {
  const result = card.parseAccessCard({
    needs: ["ask-me", "write-down", "step-free", "write-down"],
    name: "  Rina   Akter ", helperName: "Mitu", helperPhone: "০১৭১১-০০০ ০০০", note: "I lip-read.\nPlease  face me.",
  }, now);
  assert.equal(result.ok, true);
  assert.deepEqual(plain(result.card), {
    version: 1, needs: ["write-down", "step-free", "ask-me"], name: "Rina Akter", helperName: "Mitu",
    helperPhone: "01711000000", note: "I lip-read. Please face me.", updatedAt: "2026-11-19T12:00:00.000Z",
  });
});

test("the card holds only its fixed fields: no diagnosis or disability type", () => {
  const result = card.parseAccessCard({ needs: ["face-me"], diagnosis: "x", disabilityType: "y" }, now);
  assert.deepEqual(Object.keys(result.card).sort(), ["helperName", "helperPhone", "name", "needs", "note", "updatedAt", "version"]);
});

test("errors are reported as codes with copy in both languages", () => {
  const result = card.parseAccessCard({ needs: ["not-a-need"], name: "a".repeat(81), helperName: "b".repeat(81), helperPhone: "call me", note: "c".repeat(301) }, now);
  assert.equal(result.ok, false);
  assert.deepEqual(plain(result.errors), ["unknown_need", "no_needs", "name_too_long", "helper_name_too_long", "note_too_long", "helper_phone_invalid"]);
  for (const code of result.errors) assert.ok(card.ACCESS_CARD_ERROR_COPY[code].en && card.ACCESS_CARD_ERROR_COPY[code].bn, code);
  assert.deepEqual(plain(card.parseAccessCard(null, now).errors), ["no_needs"]);
});

test("limits are inclusive", () => {
  const result = card.parseAccessCard({ needs: ["extra-time"], name: "a".repeat(80), note: "c".repeat(300) }, now);
  assert.equal(result.ok, true);
});

test("phone numbers: Bangla digits, plus sign, separators; too short or letters refused", () => {
  assert.equal(card.normalizePhone("+880 1711-000000"), "+8801711000000");
  assert.equal(card.normalizePhone("(02) 955 0000"), "029550000");
  assert.equal(card.normalizePhone("12345"), null);
  assert.equal(card.normalizePhone("0171x000000"), null);
  assert.equal(card.normalizePhone("1".repeat(16)), null);
  assert.equal(card.normalizePhone(undefined), null);
});

test("sections show only chosen needs, groups in fixed order, empty groups dropped", () => {
  const { card: made } = card.parseAccessCard({ needs: ["time-alone", "sign-interpreter"] }, now);
  const sections = plain(card.accessCardSections(made, "en"));
  assert.deepEqual(sections.map((s) => s.id), ["talk", "decide"]);
  assert.deepEqual(sections[0].items, ["I use Bangla Sign Language. Please arrange an interpreter."]);
  assert.equal(card.accessCardSections(made, "bn")[0].title, "আমার সঙ্গে যেভাবে কথা বলবেন");
});

test("printable text: bilingual title and footer, chosen needs only, optional lines left out", () => {
  const { card: made } = card.parseAccessCard({ needs: ["step-free"], helperPhone: "01711000000" }, now);
  const both = card.accessCardText(made, "both");
  assert.match(both, /^আমার সাক্ষাৎ কার্ড \/ MY VISIT CARD/);
  assert.match(both, /I need a way in without stairs\./);
  assert.match(both, /It is not a medical record\.$/);
  assert.doesNotMatch(both, /Name|interpreter|In my words/);
  assert.match(both, /My helper: 01711000000/);
  const en = card.accessCardText(made, "en");
  assert.doesNotMatch(en, /[ঀ-৿]/u);
});

test("urgent card: always asks for 999, adds only the lines she chose", () => {
  assert.deepEqual(plain(card.urgentCardLines({}, "en")), ["I need urgent help.", "Please call 999 for me."]);
  const lines = plain(card.urgentCardLines({ stage: "pregnant", cannotHear: true, contactName: "Mitu", contactPhone: "০১৭১১০০০০০০" }, "en"));
  assert.deepEqual(lines, ["I need urgent help.", "I am pregnant.", "I cannot hear. Please write or show me.", "Please call 999 for me.", "Please also call: Mitu, 01711000000"]);
  assert.equal(card.urgentCardLines({ contactPhone: "not a number" }, "bn").length, 2);
  assert.ok(card.urgentCardLines({}, "bn").includes("অনুগ্রহ করে আমার জন্য ৯৯৯-এ কল করুন।"));
});
