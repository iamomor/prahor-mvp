import assert from "node:assert/strict";
import { test } from "node:test";
import { filterAccountHistory } from "./account-history.ts";

const rows = [
  { id: "mother-1", subject: "mother", pregnancy_id: "pregnancy-1", kind: "weight", value: "57.6", unit: "kg", observed_at: "2026-09-10" },
  { id: "baby-1", subject: "baby", baby_id: "baby-a", kind: "fetal_heart_rate", value: "142", unit: "/min", observed_at: "2026-11-14" },
  { id: "mother-2", subject: "mother", pregnancy_id: "pregnancy-2", kind: "weight", value: "60", unit: "kg", observed_at: "2026-11-15" },
];
const babies = [{ id: "baby-a", pregnancy_id: "pregnancy-1" }];
const base = { subject: "both", pregnancyId: "pregnancy-1", babyId: "", kind: "all", query: "" };

test("mother history never contains baby or another pregnancy's measurement", () => {
  assert.deepEqual(filterAccountHistory(rows, babies, { ...base, subject: "mother" }, {}).map((row) => row.id), ["mother-1"]);
});

test("combined timeline retains distinct mother and baby rows in date order", () => {
  assert.deepEqual(filterAccountHistory(rows, babies, base, {}).map((row) => row.id), ["baby-1", "mother-1"]);
  assert.deepEqual(filterAccountHistory(rows, babies, { ...base, kind: "weight", query: "57.6" }, {}).map((row) => row.id), ["mother-1"]);
});
