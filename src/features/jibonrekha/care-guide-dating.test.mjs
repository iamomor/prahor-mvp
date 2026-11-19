import test from "node:test";
import assert from "node:assert/strict";
import { recordedPregnancyWeek } from "./care-guide-dating.ts";

test("recorded LMP and entered due date give the same documented week", () => {
  const lmp = recordedPregnancyWeek({ lmp: "2026-05-29", due: null }, "2026-11-19");
  const due = recordedPregnancyWeek({ lmp: null, due: "2027-03-05" }, "2026-11-19");
  assert.deepEqual({ weeks: lmp?.weeks, days: lmp?.days }, { weeks: 24, days: 6 });
  assert.deepEqual({ weeks: due?.weeks, days: due?.days }, { weeks: 24, days: 6 });
  assert.equal(lmp?.basis, "period");
  assert.equal(due?.basis, "due");
});

test("unknown, impossible and out-of-range dates do not create a gestational week", () => {
  assert.equal(recordedPregnancyWeek({ lmp: null, due: null }, "2026-11-19"), null);
  assert.equal(recordedPregnancyWeek({ lmp: "2026-02-30", due: null }, "2026-11-19"), null);
  assert.equal(recordedPregnancyWeek({ lmp: "2027-01-01", due: null }, "2026-11-19"), null);
  assert.equal(recordedPregnancyWeek({ lmp: "2025-01-01", due: null }, "2026-11-19"), null);
});
