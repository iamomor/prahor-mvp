import test from "node:test";
import assert from "node:assert/strict";
import { careForWeek, careGuideItems, careGuideSources } from "./care-guide-data.ts";

test("all weeks from the source guide through post-date planning resolve to content", () => {
  for (let week = 1; week <= 41; week++) {
    const items = careForWeek(week);
    assert.ok(Array.isArray(items));
    for (const item of items) {
      assert.ok(item.title && item.why && item.detail);
      assert.ok(careGuideSources[item.source]?.url.startsWith("https://"));
    }
  }
  assert.ok(careForWeek(24).some(item => item.id === "glucose"));
  assert.ok(careForWeek(38).some(item => item.id === "birth"));
  assert.ok(careForWeek(40).some(item => item.id === "late"));
  assert.throws(() => careForWeek(42), RangeError);
  assert.equal(new Set(careGuideItems.map(item => item.id)).size, careGuideItems.length);
});
