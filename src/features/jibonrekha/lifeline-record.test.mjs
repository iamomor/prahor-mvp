import test from "node:test";
import assert from "node:assert/strict";
import { currentAndHistory, correction, newPack, canPrepare, packItems, needsCheck } from "./lifeline-record.ts";

const first = { id: "a", kind: "weight", label: "Weight", value: "64.2", unit: "kg", observedAt: "2026-11-14", provenance: "self", subject: "mother", createdAt: "2026-11-14T10:00Z" };
test("corrections add a self-reported row and preserve both earlier values", () => {
  const second = correction(first, "62.4", "b", "2026-11-15T09:00Z");
  const third = correction(second, "62.6", "c", "2026-11-16T09:00Z");
  assert.equal(first.value, "64.2");
  assert.equal(second.supersedes, "a");
  const rows = currentAndHistory([first, second, third]);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].earlier.map(item => item.value), ["62.4", "64.2"]);
});
test("pack starts private and excludes superseded and diary rows", () => {
  const second = correction(first, "62.4", "b", "2026-11-15T09:00Z");
  const diary = { ...first, id: "diary", kind: "diary_entry" };
  const pack = newPack();
  assert.deepEqual(pack, { selectedIds: [], includeIdentity: false, includeBarta: false });
  assert.equal(canPrepare(pack), false);
  assert.deepEqual(packItems([first, second, diary], { ...pack, selectedIds: ["a", "b", "diary"] }).map(item => item.id), ["b"]);
  assert.equal(needsCheck({ ...first, provenance: "extracted" }), true);
});
