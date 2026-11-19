import assert from "node:assert/strict";
import { test } from "node:test";
import { accountJourney } from "./account-journey.ts";

test("account dating uses the entered EDD and keeps the synthetic runbook's 29-week example exact", () => {
  const result = accountJourney({ estimated_due_date: "2027-02-05", last_menstrual_period_date: "2026-05-01" }, "2026-11-20");
  assert.deepEqual(result, { weeks: 29, days: 0, dueDate: "2027-02-05", source: "নথিতে লেখা সম্ভাব্য তারিখ" });
});

test("unknown, invalid and past-due dates do not invent a current week", () => {
  assert.equal(accountJourney({ estimated_due_date: null, last_menstrual_period_date: null }, "2026-11-20"), null);
  assert.equal(accountJourney({ estimated_due_date: "2026-02-30", last_menstrual_period_date: null }, "2026-11-20"), null);
  assert.equal(accountJourney({ estimated_due_date: "2026-11-19", last_menstrual_period_date: null }, "2026-11-20"), null);
});
