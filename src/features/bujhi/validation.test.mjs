import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(name, imports = {}) {
  const source = fs.readFileSync(new URL(name, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: (name) => imports[name], Intl, Date };
  vm.runInNewContext(js, context); return context.exports;
}
const validation = load("./validation.ts"), parser = load("./ocr-parser.ts", { "./validation": validation });
test("decimal and grouped thousands normalization is exact and never rounded", () => {
  for (const [raw, candidate] of [["30,000", "30000"], ["3,000", "3000"], ["2745.39", "2745.39"], ["2,745.39", "2745.39"], ["−1.20", "-1.20"], ["২,৭৪৫.৩৯", "2745.39"]]) {
    assert.equal(validation.parseNumeric(raw).normalized, candidate);
  }
  for (const raw of ["2,7", "2.745,39", "1..2", "12O.4", ""]) assert.equal(validation.parseNumeric(raw).kind, "ambiguous");
});
test("notes remain valid without numeric values; dates and missing units are checked", () => {
  const field = { id: "test", label: "General note", value: "Fictional note", unit: "", destination: "baby", observedAt: "2026-11-16", reviewStatus: "pending" };
  assert.equal(validation.fieldIssues(field, "").errors.length, 0);
  assert.ok(validation.fieldIssues({ ...field, value: "11.2" }, "").errors.some((error) => error.includes("measurement unit")));
  assert.equal(validation.fieldIssues({ ...field, value: "11.2", unitUnavailable: true }, "").errors.length, 0);
  assert.equal(validation.validDate("2026-02-30"), false);
});
test("OCR parser preserves numerical strings, unicode units, source snippets and real confidence", () => {
  const report = parser.parseOcrText("FICTIONAL LAB\nPatient: Synthetic Only\nReport date: 2026-11-16\nBeta-hCG 2,745.39 mIU/mL 0-5\nHemoglobin 11.2 g/dL 12-16\nUnknown test 30,000 IU/L", "synthetic-report", 88.5);
  assert.equal(report.fields.length, 2); assert.equal(report.fields[0].value, "2,745.39");
  assert.equal(report.fields[0].unit, "mIU/mL"); assert.equal(report.fields[0].referenceRange, "0-5");
  assert.equal(report.fields[0].ocrConfidence, 88.5); assert.equal(report.fields[0].reviewStatus, "pending");
  assert.equal(report.fields[0].destination, ""); assert.equal(report.fields[0].observedAt, "");
  assert.ok(report.unrecognizedText.includes("Patient: Synthetic Only"));
  const unicode = parser.parseOcrText("β-hCG 30,000 μIU/mL", "u");
  assert.equal(unicode.fields[0].rawValue, "30,000"); assert.equal(unicode.fields[0].unit, "μIU/mL");
});

test("OCR never promotes a reference-only range to a patient result", () => {
  for (const line of ["Hemoglobin 12-16 g/dL", "Hemoglobin 12 to 16 g/dL", "Hemoglobin Reference 12-16 g/dL", "Beta-hCG <5 mIU/mL"]) {
    const field = parser.parseOcrText(line, "synthetic-range").fields[0];
    assert.equal(field.value, ""); assert.equal(field.parsingReliability, "uncertain");
    assert.ok(field.referenceRange); assert.equal(field.reviewStatus, "pending");
  }
  const field = parser.parseOcrText("Hemoglobin 11.2 g/dL 12-16", "synthetic-result").fields[0];
  assert.equal(field.value, "11.2"); assert.equal(field.referenceRange, "12-16");
});

const schema = load("./report-schema.ts");
const normalization = load("./report-normalization.ts", { "./validation": validation });
const quality = load("./report-quality.ts", { "./validation": validation, "./report-schema": schema });
test("A-J context is optional for simple reports and incomplete ANC is identified", () => {
  assert.equal(Object.keys(schema.sectionLabels).length, 10);
  const report = normalization.normalizeReport({ id: "fictional-schema", name: "Synthetic lab", source: "self_reported", inputMethod: "manual", status: "needs_review", observedAt: "2026-11-18", fields: [{ id:"lab", label:"Hemoglobin", value:"11.20", unit:"g/dL", destination:"mother", reviewStatus:"pending", category:"laboratory_tests", observedAt:"2026-11-18" }] });
  assert.equal(report.documentType, "laboratory"); assert.equal(report.fields[0].value, "11.20");
  assert.equal(quality.reportFindings(report).length, 0);
  const anc = normalization.normalizeReport({ ...report, documentType:"anc", fields:[], sections:{} });
  assert.equal(quality.reportFindings(anc).length, 10);
  const conflict = { ...anc, sections:{ dating:{ lmp:schema.datum("2026-11-18"), edd:schema.datum("2026-01-01") } } };
  assert.ok(quality.reportFindings(conflict).some(item => item.status === "needs_correction"));
  assert.equal(conflict.sections.dating.edd.value,"2026-01-01");
});
