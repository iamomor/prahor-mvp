/* Run: node --test src/features/jibonrekha/demo-health.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const modelSource = fs.readFileSync(new URL("./records-model.ts", import.meta.url), "utf8");
const modelContext = { exports: {}, require, Intl, Date };
vm.runInNewContext(ts.transpileModule(modelSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, modelContext);

const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "demo-health.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture() {
  let raw = null;
  const metadata = new Map();
  let writes = 0;
  let fail = false;
  const storage = {
    getItem: (key) => key === "prohor-demo-health-v1" ? raw : metadata.get(key) ?? null,
    setItem: (_key, value) => {
      if (fail) throw new Error("Simulated storage unavailable");
      if (_key === "prohor-demo-health-v1") raw = value; else metadata.set(_key, value);
      writes++;
    },
  };
  function reload() {
    const context = { exports: {}, require: (name) => name === "./records-model" ? modelContext.exports : require(name), crypto: globalThis.crypto, window: { localStorage: storage } };
    vm.runInNewContext(compiled, context);
    return context.exports;
  }
  return {
    service: reload(), reload,
    raw: () => raw, writes: () => writes,
    corrupt: () => { raw = "{broken"; },
    fail: (value) => { fail = value; },
  };
}
const maternal = {
  id: "fictional-mother-note", recordType: "mother", recordId: "demo-mother-001",
  label: "Fictional maternal note", value: "Demo only", unit: "", observedAt: "2026-11-16", source: "self_reported",
};
const baby = { ...maternal, id: "fictional-baby-note", recordType: "baby", recordId: "demo-baby-001" };
const extracted = {
  ...maternal, id: "fictional-report-mother", source: "document_extracted",
  sourceReportId: "demo-report-001", sourceFieldId: "hemoglobin",
  reviewedAt: "2026-11-16T08:00:00.000Z", reviewedBy: "demo-user-001", reviewStatus: "verified",
  observedAt: "2026-11-16T06:00:00.000Z",
};
const extractedBaby = { ...extracted, id: "fictional-report-baby", recordType: "baby", recordId: "demo-baby-001", sourceFieldId: "fetal-heart-rate" };
const plain = (value) => JSON.parse(JSON.stringify(value));

test("legacy maternal/baby records and extracted audit metadata survive module reload", () => {
  const f = fixture();
  f.service.saveDemoObservation(maternal);
  f.service.saveDemoObservation(baby);
  f.service.saveDemoObservations([extracted, extractedBaby]);
  const records = plain(f.reload().getDemoObservations());
  for (const [index, original] of [maternal, baby, extracted, extractedBaby].entries()) {
    for (const [key, value] of Object.entries(original)) assert.deepEqual(records[index][key], value);
    assert.equal(records[index].pregnancyId, "demo-pregnancy-001");
    assert.equal(records[index].enteredBy, "demo-user-001");
    assert.ok(Number.isFinite(Date.parse(records[index].enteredAt)));
  }
  assert.equal(f.service.demoBaby.motherId, f.service.demoMother.id);
  assert.equal(records.filter((item) => item.recordType === "mother" && item.recordId === f.service.demoMother.id).length, 2);
  assert.equal(records.filter((item) => item.recordType === "baby" && item.recordId === f.service.demoBaby.id).length, 2);
});

test("report batches use one write; retries with new observation IDs do not duplicate fields", () => {
  const f = fixture();
  f.service.saveDemoObservations([extracted, extractedBaby]);
  assert.equal(f.writes(), 1);
  f.reload().saveDemoObservations([{ ...extracted, id: "retry-m" }, { ...extractedBaby, id: "retry-b" }]);
  assert.equal(f.writes(), 1);
  assert.equal(f.service.getDemoObservations().length, 2);
});

test("failed batch preserves existing data and supports a safe retry", () => {
  const f = fixture();
  f.service.saveDemoObservation(maternal);
  const before = f.raw();
  f.fail(true);
  assert.throws(() => f.service.saveDemoObservations([extracted, extractedBaby]));
  assert.equal(f.raw(), before);
  f.fail(false);
  f.service.saveDemoObservations([extracted, extractedBaby]);
  assert.equal(f.service.getDemoObservations().length, 3);
});

test("invalid destinations or unreviewed extractions reject the entire batch", () => {
  const f = fixture();
  for (const invalid of [
    { ...extractedBaby, recordId: "demo-mother-001" },
    { ...extracted, reviewStatus: undefined },
    { ...extracted, reviewedAt: "invalid" },
    { ...extracted, value: " " },
  ]) {
    assert.throws(() => f.service.saveDemoObservations([extractedBaby, invalid]));
    assert.equal(f.raw(), null);
  }
});

test("corrupt existing storage is never overwritten by a save", () => {
  const f = fixture();
  f.corrupt();
  assert.throws(() => f.service.saveDemoObservation(maternal));
  assert.equal(f.raw(), "{broken");
});


test("self-reported writes enforce destination and reviewed input-method provenance", () => {
  const f = fixture();
  for (const invalid of [
    { ...maternal, recordId: "demo-baby-001" },
    { ...baby, recordId: "demo-mother-001" },
    { ...maternal, inputMethod: "manual" },
    { ...maternal, observedAt: "invalid" },
    { ...maternal, value: " " },
  ]) assert.throws(() => f.service.saveDemoObservation(invalid));
  assert.equal(f.raw(), null);
  f.service.saveDemoObservation({ ...extracted, source: "self_reported", inputMethod: "voice" });
  assert.equal(f.service.getDemoObservations()[0].reviewStatus, "verified");
});
