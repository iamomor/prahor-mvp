import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const cache = new Map();
function load(path) {
  const url = new URL(path, import.meta.url);
  if (cache.has(url.href)) return cache.get(url.href);
  const exports = {};
  cache.set(url.href, exports);
  const source = ts.transpileModule(fs.readFileSync(url, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, require: (specifier) => load(new URL(specifier + ".ts", url).href) });
  return exports;
}
const { comparePrintedRange, explainCheckedField, understandingSummary } = load("./report-understanding.ts");
const { parseOcrText } = load("./ocr-parser.ts");
const field = (patch = {}) => ({ id: "synthetic-hb", label: "Hemoglobin", value: "11.2", unit: "g/dL", referenceRange: "11.0–14.0 g/dL", reviewStatus: "verified", destination: "mother", ...patch });

test("explanations require review and never infer intervals or units", () => {
  assert.equal(explainCheckedField(field({ reviewStatus: "pending" }), "en"), null);
  assert.equal(explainCheckedField(field({ reviewStatus: "rejected" }), "bn"), null);
  for (const patch of [{ referenceRange: undefined }, { referenceRange: "11-14" }, { unit: "g/L" }, { unitUnavailable: true }, { referenceRange: "14-11 g/dL" }, { value: "11O.2" }, { referenceRange: "<14 g/dL" }, { referenceRange: "11-14 g/dL pregnancy: 10-13" }]) {
    assert.equal(comparePrintedRange(field(patch)), null, JSON.stringify(patch));
  }
});
test("same-unit comparison preserves exact boundaries and Bangla values", () => {
  assert.equal(comparePrintedRange(field()).position, "inside");
  assert.equal(comparePrintedRange(field({ label: "Platelet count", value: "250", unit: "x10^9/L", referenceRange: "150-400 x10^9/L" })).position, "inside");
  assert.equal(comparePrintedRange(field({ value: "11.0" })).position, "inside");
  assert.equal(comparePrintedRange(field({ value: "14.0" })).position, "inside");
  assert.equal(comparePrintedRange(field({ value: "10.9" })).position, "below");
  assert.equal(comparePrintedRange(field({ value: "14.1" })).position, "above");
  assert.equal(comparePrintedRange(field({ value: "১১.২", referenceRange: "১১–১৪ g/dL" })).position, "inside");
});
test("unsupported tests and scans abstain without invented explanations", () => {
  const unknown = explainCheckedField(field({ label: "Unknown test", referenceRange: undefined }), "en");
  assert.equal(unknown.supported, false);
  assert.match(unknown.meaning, /not available/);
  assert.equal(explainCheckedField(field({ label: "HbA1c" }), "en").supported, false);
  assert.equal(comparePrintedRange(field({ ultrasound: { group: "biometry" } })), null);
  assert.match(explainCheckedField(field({ label: "BPD", ultrasound: { group: "biometry" } }), "en").meaning, /scan/);
});
test("whole-report summary excludes pending and skipped values", () => {
  const result = understandingSummary([field(), field({ id: "b", value: "8.0" }), field({ id: "c", reviewStatus: "pending" }), field({ id: "d", reviewStatus: "rejected" }), field({ id: "e", referenceRange: "" })]);
  assert.equal(result.checked, 3); assert.equal(result.pending, 1); assert.equal(result.excluded, 1);
  assert.equal(result.outsidePrinted, 1); assert.equal(result.noComparison, 1);
});
test("test-specific educational copy is bilingual and has explicit primary sources", () => {
  for (const label of ["Hemoglobin", "Fasting glucose", "Blood glucose", "Platelet count", "WBC", "RBC", "HCT", "MCV"]) {
    for (const language of ["bn", "en"]) {
      const explanation = explainCheckedField(field({ label }), language);
      assert.equal(explanation.supported, true, label);
      assert.ok(explanation.meaning && explanation.context && explanation.question);
      assert.match(explanation.source.url, /^https:\/\/medlineplus.gov\/lab-tests\//);
    }
  }
});
test("OCR recognizes additional CBC labels and count units without inventing values", () => {
  const report = parseOcrText("FICTIONAL LAB\nFasting glucose 92 mg/dL\nPlatelet count 250 x10^9/L\nWBC 8.2 x10^9/L\nRBC 4.1 x10^12/L\nHematocrit 35 %\nMCV 85 fL", "synthetic-cbc");
  assert.equal(report.fields.length, 6);
  assert.equal(report.fields[0].label, "Fasting glucose"); assert.equal(report.fields[0].value, "92");
  assert.equal(report.fields[1].value, "250"); assert.equal(report.fields[1].unit, "x10^9/L");
  assert.equal(report.fields[3].unit, "x10^12/L"); assert.equal(report.fields[4].unit, "%");
  assert.ok(report.fields.every((item) => item.reviewStatus === "pending"));
  for (const label of ["WBC", "Platelet count", "Hematocrit"]) {
    const ambiguous = parseOcrText(label + " 10-15", "synthetic-range").fields[0];
    assert.equal(ambiguous.value, ""); assert.equal(ambiguous.parsingReliability, "uncertain");
  }
});
