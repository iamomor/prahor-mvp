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
const validation = load("./validation.ts");
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
const ultrasound = load("./ultrasound.ts");
const parser = load("./ocr-parser.ts", { "./validation": validation, "./ultrasound": ultrasound, "./report-normalization": normalization });
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

test("early and later scans preserve source dates, biometry, narratives and unknown terms", () => {
  const early = parser.parseOcrText([
    "Early pregnancy ultrasound", "Scan date: 2026-10-12", "CRL: 6.20 cm",
    "LMP EDD: 2027-04-14", "USG EDD: 2027-04-19", "Cardiac activity: present",
    "Cervical length: 3.70 cm", "Uterine position: anteverted", "Unknown parameter: 1.50 cm",
    "Impression: Single viable fetus as reported.",
    "Limitations: Some views were not assessable.",
    "Recommendations: Follow-up documented in the source.",
  ].join("\n"), "synthetic-early");
  assert.equal(early.scanSubtype, "early");
  assert.equal(early.scanDate, "2026-10-12");
  assert.equal(early.fields.find((field) => field.label === "CRL").value, "6.20");
  assert.equal(early.fields.find((field) => field.label === "Cervical length").unit, "cm");
  assert.equal(early.fields.find((field) => field.label === "Impression").rawValue, "Single viable fetus as reported.");
  assert.ok(early.unrecognizedText.includes("Unknown parameter: 1.50 cm"));
  assert.ok(quality.reportFindings(early).some((issue) => /different due dates/.test(issue.message)));

  const later = parser.parseOcrText([
    "Pregnancy profile ultrasound", "Scan date: 2026-11-18", "EDD: 2027-04-20",
    "BPD: 47.0 mm", "FL: 3.20 cm", "AC: 14.00 cm", "EFW: 2,745.39 g",
    "Placenta: Posterior, upper, Grade II", "Amniotic fluid: borderline", "AFI: 10.20 cm",
    "FHR: 144 bpm", "Nuchal cord: Documented source wording", "Fetal movement: present",
  ].join("\n"), "synthetic-later");
  assert.equal(later.scanSubtype, "profile");
  for (const [label, value] of [["FL", "3.20"], ["AC", "14.00"], ["EFW", "2,745.39"], ["Placenta", "Posterior, upper, Grade II"], ["Amniotic fluid", "borderline"], ["FHR", "144"], ["Nuchal cord", "Documented source wording"]]) {
    assert.equal(later.fields.find((field) => field.label === label).value, value);
  }
  assert.notEqual(early.id, later.id);
  assert.equal(later.fields.find((field) => field.label === "EDD").value, "2027-04-20");
});

test("anomaly and multiple-fetus observations retain source wording and have no inferred destination", () => {
  const scan = parser.parseOcrText([
    "Anomaly scan", "Fetus A", "BPD: 47.30 mm", "Cranium: identified", "Fetus B",
    "BPD: 49.30 mm", "Heart and cardiac views: not fully visible", "FL: 3.O9 cm",
    "Findings: The text starts here", "and continues on the next line.",
  ].join("\n"), "synthetic-twins");
  assert.equal(scan.scanSubtype, "anomaly");
  assert.deepEqual(Array.from(scan.fields.filter((field) => field.label === "BPD"), (field) => field.ultrasound.fetus), ["Fetus A", "Fetus B"]);
  assert.ok(scan.fields.every((field) => field.destination === "" && field.reviewStatus === "pending"));
  assert.equal(scan.fields.find((field) => field.label === "Heart and cardiac views").value, "not fully visible");
  assert.equal(scan.fields.find((field) => field.label === "FL").value, "");
  assert.equal(scan.fields.find((field) => field.label === "Findings").value, "The text starts here\nand continues on the next line.");
});

test("Doppler uses header order and preserves adjacent rows, units, and OCR boxes", () => {
  const rows = [
    "Obstetric Doppler", "Vessel | PI | PSV (cm/s) | RI | S/D",
    "Umbilical artery | 1.04 | 41.50 | 0.60 | 2.50",
    "Right uterine artery | 0.90 | 37.20 | 0.52 | 2.08",
    "Left uterine artery | 0.77 | unreadable | 0.51 | 2.03",
  ];
  const layout = rows.map((text, index) => ({ text, location: { page: 1, line: index + 1, box: { x0: 20, x1: 920, y0: index * 30, y1: (index + 1) * 30 } } }));
  const scan = parser.parseOcrText(rows.join("\n"), "synthetic-doppler", 90, layout);
  assert.equal(scan.scanSubtype, "doppler");
  const psv = scan.fields.find((field) => field.ultrasound?.vessel === "Right uterine artery" && field.ultrasound.metric === "PSV");
  assert.equal(psv.value, "37.20");
  assert.equal(psv.unit, "cm/s");
  assert.equal(psv.sourceLocation.box.y0, 90);
  assert.equal(scan.fields.find((field) => field.ultrasound?.vessel === "Umbilical artery" && field.ultrasound.metric === "RI").value, "0.60");
  assert.equal(scan.fields.length, 8);
  assert.ok(scan.unrecognizedText.includes(rows[4]));
});

test("conflicting scan dates keep observations unlinked and mixed sections are retained", () => {
  const scan = parser.parseOcrText("ANC report\nUltrasound\nScan date: 2026-11-01\nBPD: 47 mm\nScan date: 2026-11-17\nHemoglobin 11.20 g/dL", "mixed");
  assert.equal(scan.documentType, "anc");
  assert.equal(scan.scanDate, "");
  assert.ok(scan.sections.ultrasound.fieldIds.length);
  assert.ok(scan.sections.laboratory.fieldIds.length);
  assert.ok(quality.reportFindings(scan).some((issue) => /Different scan dates/.test(issue.message)));
});

test("speech drafts separate explicit measurements and preserve ambiguous clauses", () => {
  const speech = load("./speech-parser.ts");
  const fields = speech.parseSpokenFields("BPD 4.70 cm and FL ৩.২০ cm; movement as spoken");
  assert.equal(fields.length, 3);
  assert.equal(fields[0].value, "4.70");
  assert.equal(fields[1].value, "৩.২০");
  assert.equal(fields[1].destination, "");
  assert.equal(fields[2].sourceText, "movement as spoken");
});

test("screen-photo layouts keep explicit biometry, source dating, and questionable AFI units", () => {
  const report = parser.parseOcrText([
    "Ultrasound for Pregnancy profile", "Findings:", "No. of foetus : Single",
    "Foetal cardiac pulsation & foetal movements : Present. FHR-138bpm, regular.",
    "BPD (cm) : 8.20cm", "FL (cm): 6.42", "AC (cm): 29.60 mm",
    "Placental site & Grading : Posterior, Upper, Grade II", "Amniotic fluid : Borderline (AFI-7.10m)",
    "Estimated foetal weight (Kg) : 2.360Kg", "Umbilical artery flow: Recorded as normal in waveform.",
    "EDD (according to USG) : 19.12.2026", "*** Length of cervix: 4.20cm.",
    "IMPRESSION:", "• Source impression example.", "Dr. Fictional",
  ].join("\n"), "synthetic-photo");
  const field = (label) => report.fields.find((item) => item.label === label);
  assert.equal(field("BPD (cm)").value, "8.20");
  assert.equal(field("FL (cm)").unit, "cm");
  assert.equal(field("AC (cm)").unit, "");
  assert.equal(field("FHR").value, "138");
  assert.equal(field("AFI").value, "7.10");
  assert.equal(field("AFI").unit, "");
  assert.equal(field("AFI").parsingReliability, "uncertain");
  assert.equal(field("EDD (according to USG)").value, "19.12.2026");
  assert.equal(field("Length of cervix").value, "4.20");
  assert.equal(field("IMPRESSION").value, "• Source impression example.");
});

test("anomaly scan keeps its subtype, Doppler columns, anatomy and limitations", () => {
  const report = parser.parseOcrText([
    "USG OF PREGNANCY PROFILE (ANOMALY SCAN)", "EFW : 324gm",
    "Obstetric Doppler examination", "PSV (cm/sec)  S/D ratio  RI  PI",
    "Umbilical artery  40.30  3.40  0.71  1.20", "Rt. uterine artery  28.50  2.95  0.65  1.13",
    "The following normal foetal structures were identified-", "Cranium, Cerebellum, Cord insertion.",
    "Heart - 4 chamber view, Kidneys, UB, Spine, Stomach.", "No obvious foetal anomaly was detected.",
    "[Entire foetal anatomy is not necessarily well visualized", "in every examination.]",
  ].join("\n"), "synthetic-anomaly");
  assert.equal(report.scanSubtype, "anomaly");
  const psv = report.fields.find((item) => item.ultrasound?.vessel === "Rt. uterine artery" && item.ultrasound.metric === "PSV");
  assert.equal(psv.value, "28.50");
  assert.equal(psv.unit, "cm/sec");
  assert.ok(report.fields.some((field) => field.ultrasound?.group === "anatomy" && /Cord insertion/.test(field.value)));
  assert.match(report.fields.find((field) => field.label === "Limitations").value, /every examination/);
});

test("early scan narrative separates CRL, reported gestational age and findings", () => {
  const report = parser.parseOcrText([
    "Findings-", "Uterus is gravid, and anteverted in position.", "Foetus is single.",
    "Foetal cardiac pulsation is present. FHR-166 bpm", "Amniotic fluid is adequate.",
    "CRL (2.40cm) consistent with 9+ wks. of gestation.",
    "EDD is 22.06.2027(according to USG scan)", "***Length of cervix- 4.10cm.",
    "Both Adnexal regions are normal.", "No collection of fluid is seen in the cul-de-sac.",
  ].join("\n"), "synthetic-early-narrative");
  assert.equal(report.scanSubtype, "early");
  assert.equal(report.fields.find((field) => field.label === "CRL").value, "2.40");
  assert.match(report.fields.find((field) => field.label === "Gestational age (as reported)").value, /^9\+/);
  assert.equal(report.fields.find((field) => field.label === "FHR").value, "166");
  assert.ok(report.fields.some((field) => /adnexal/.test(field.label.toLowerCase())));
});
