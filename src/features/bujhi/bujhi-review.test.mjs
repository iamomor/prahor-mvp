import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const m = await import("data:text/javascript," + encodeURIComponent(stripTypeScriptTypes(readFileSync(new URL("./bujhi-review.ts", import.meta.url), "utf8"))));
const hb = { id: "f1", rawLabel: "Hemoglobin", rawValue: "11.2", rawUnit: "g/dL", parsedMeasurement: { kind: "hemoglobin", value: "11.2", unit: "g/dL" }, confidence: 0.97, uncertainty: [] };
const gl = { id: "f2", rawLabel: "Fasting glucose", rawValue: "92", rawUnit: null, parsedMeasurement: { kind: "glucose", value: "92", unit: "mg/dL" }, confidence: 0.8, uncertainty: ["unknown_unit"] };
const nc = { id: "f3", rawLabel: "x", rawValue: "1", rawUnit: null, parsedMeasurement: null, confidence: null, uncertainty: [] };
assert.equal(m.band(hb), "clear"); assert.equal(m.band(gl), "check"); assert.equal(m.band(nc), "unknown"); assert.equal(m.band({ ...hb, confidence: 0.6 }), "low");
assert.deepEqual(m.reviewOrder([hb, nc, gl]).map((f) => f.id), ["f2", "f3", "f1"]);        // uncertain first
assert.equal(m.canAccept(hb), true); assert.equal(m.canAccept(gl), false); assert.equal(m.canAccept(nc), false); // unit guess blocked even if parser guessed one
assert.equal(m.canAccept({ ...hb, parsedMeasurement: { ...hb.parsedMeasurement, unit: " " } }), false);
const base = { fields: [hb, gl], observedAt: "2026-11-14", destination: { subject: "mother", pregnancyId: null }, expectedExtractionRevision: 1 };
assert.equal(m.buildReview({ ...base, decisions: { f1: { kind: "accept" } } }).reason, "undecided");
assert.equal(m.buildReview({ ...base, decisions: { f1: { kind: "accept" }, f2: { kind: "accept" } } }).reason, "cannot_accept");
assert.equal(m.buildReview({ ...base, decisions: { f1: { kind: "accept" }, f2: { kind: "correct", measurement: { kind: "glucose", value: "92", unit: null } } } }).reason, "bad_correction");
assert.equal(m.buildReview({ ...base, decisions: { f1: { kind: "accept" }, f2: { kind: "correct", measurement: { kind: "glucose", value: "9,2", unit: "mg/dL" } } } }).reason, "bad_correction");
assert.equal(m.buildReview({ ...base, observedAt: "", decisions: { f1: { kind: "accept" }, f2: { kind: "reject" } } }).reason, "need_date");
assert.equal(m.buildReview({ ...base, observedAt: "2026-02-30", decisions: { f1: { kind: "accept" }, f2: { kind: "reject" } } }).reason, "need_date");
assert.equal(m.buildReview({ ...base, decisions: { f1: { kind: "reject" }, f2: { kind: "reject" } } }).reason, "nothing_to_save");
const ok = m.buildReview({ ...base, decisions: { f1: { kind: "accept" }, f2: { kind: "correct", measurement: { kind: "glucose", value: "92", unit: "mg/dL" } } } });
assert.equal(ok.ok, true); assert.equal(ok.request.reviewedByMother, true); assert.equal(ok.request.decisions.length, 2);
assert.equal(ok.request.decisions[1].decision, "corrected");
assert.equal(m.buildReview({ ...base, observedAt: "", decisions: { f1: { kind: "reject" }, f2: { kind: "reject" } } }).reason, "nothing_to_save"); // rejects need no date
console.log("bujhi-review: all pass");
