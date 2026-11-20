import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const er = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(readFileSync(new URL("./easy-read.ts", import.meta.url), "utf8"))).toString("base64")}`);
const text = { title: "Short title", sentences: ["One idea here.", "Another idea here.", "A third idea."], nextAction: "Choose one." };
const entry = (over) => ({ id: "x", module: "adapt", route: "/accessibility", original: "test", en: text, bn: text, status: "approved", reviewedBy: "Test reviewer", reviewedAt: "2026-11-20", ...over });

test("only approved entries with a real reviewer and date are ever returned", () => {
  assert.equal(er.approvedEasyRead("x", [entry()])?.id, "x");
  for (const status of ["draft", "review", "retired"]) assert.equal(er.approvedEasyRead("x", [entry({ status })]), undefined, status);
  assert.equal(er.approvedEasyRead("x", [entry({ reviewedBy: "" })]), undefined, "approved without a reviewer");
  assert.equal(er.approvedEasyRead("x", [entry({ reviewedAt: undefined })]), undefined, "approved without a date");
  assert.equal(er.approvedEasyRead("missing", [entry()]), undefined, "missing content falls back to the original");
});

test("the runbook template is enforced even for approved entries", () => {
  assert.equal(er.approvedEasyRead("x", [entry({ en: { ...text, title: "one two three four five six" } })]), undefined);
  assert.equal(er.approvedEasyRead("x", [entry({ bn: { ...text, sentences: ["only", "two"] } })]), undefined);
  assert.equal(er.approvedEasyRead("x", [entry({ en: { ...text, sentences: [...text.sentences, "a b c d e f g h i j k l m"] } })]), undefined);
  assert.deepEqual(er.easyReadProblems(entry()), []);
});

test("the setting is offered only when something approved exists", () => {
  assert.equal(er.hasApprovedEasyRead([entry({ status: "draft" }), entry({ id: "y", status: "review" })]), false);
  assert.equal(er.hasApprovedEasyRead([entry({ status: "retired" }), entry({ id: "y" })]), true);
});

test("the shipped registry is honest: well-formed, unique, and nothing approved without a review", () => {
  const ids = er.EASY_READ_ENTRIES.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of er.EASY_READ_ENTRIES) {
    assert.deepEqual(er.easyReadProblems({ ...item, status: "draft" }), [], item.id);
    if (item.status === "approved") assert.ok(item.reviewedBy && item.reviewedAt, `${item.id} claims approval without evidence`);
  }
  // No human Easy Read review has happened yet (20 Nov 2026). Flip this only with a real, recorded review.
  assert.equal(er.hasApprovedEasyRead(), false);
});
