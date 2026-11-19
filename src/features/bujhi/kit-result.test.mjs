import { stripTypeScriptTypes } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const src = stripTypeScriptTypes(readFileSync(new URL("./kit-result.ts", import.meta.url), "utf8"));
const { explainKit, retestWindow } = await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"));
const outcome = (pick, timing = "after", window = "in", urgentSymptoms) => explainKit({ pick, timing, window, urgentSymptoms });
assert.equal(outcome("two").key, "positive"); assert.equal(outcome("two").retest, null);
assert.equal(outcome("dpos").key, "positive");
assert.equal(outcome("faint").key, "faint"); assert.deepEqual(outcome("faint").retest.afterHours, [48, 72]);
assert.equal(outcome("one", "before").caution, "too_early"); assert.equal(outcome("one", "irreg").caution, "irregular");
assert.equal(outcome("none").key, "invalid"); assert.ok(outcome("none").retest);
assert.equal(outcome("two", "after", "late").caution, "late_read"); assert.ok(outcome("two", "after", "late").retest);
assert.equal(outcome("two", "after", "na").caution, "no_window");
assert.equal(outcome("one", "after", "late").caution, "late_read");
assert.equal(outcome("dneg", "after", "na").caution, "no_window");
assert.equal(outcome("unsure").key, "unclear");
for (const pick of ["two", "one", "none", "dneg"]) { const result = outcome(pick, "after", "in", true); assert.equal(result.urgentFirst, true); assert.equal(result.key, null); }
const window = retestWindow(new Date("2026-11-19T00:00:00Z"), [48, 72]);
assert.equal(window.earliest.toISOString(), "2026-11-21T00:00:00.000Z"); assert.equal(window.latest.toISOString(), "2026-11-22T00:00:00.000Z");
assert.ok(!JSON.stringify(outcome("two")).match(/diagnos|pregnant"/i));
for (const pick of ["two", "faint", "one", "none", "dpos", "dneg", "unsure"]) {
  for (const timing of ["after", "before", "irreg"]) {
    for (const reading of ["in", "late", "na"]) {
      const result = outcome(pick, timing, reading, false);
      assert.equal(result.urgentFirst, false);
      assert.ok(result.key);
      assert.equal(outcome(pick, timing, reading, true).urgentFirst, true);
    }
  }
}
console.log("kit-result: all passed");
