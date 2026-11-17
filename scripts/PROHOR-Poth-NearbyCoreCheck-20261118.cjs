#!/usr/bin/env node
"use strict";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vm = require("node:vm");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ts = require("typescript");
const code = fs.readFileSync("src/features/poth/nearbyCore.ts", "utf8");
const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, reportDiagnostics: true });
if (compiled.diagnostics?.some(d => d.category === ts.DiagnosticCategory.Error)) throw new Error("TypeScript transpile error");
const mod = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: mod, exports: mod.exports, URL, Math, Number, Set, String, Array }, { timeout: 1000 });
const x = mod.exports;
function assert(cond, msg) { if (!cond) throw new Error("NEARBY CORE FAILED: " + msg); }
const origin = { lat: 23.8103, lon: 90.4125 };
assert(x.insideBangladesh(origin), "Dhaka coordinates");
assert(!x.insideBangladesh({ lat: 51, lon: 0 }), "reject foreign coordinates");
assert(x.distanceInKm(origin, origin) < 0.00001, "zero distance");
assert(x.distanceInKm(origin, { lat: 23.9, lon: 90.4125 }) > 9, "Haversine scale");
assert(x.categoryFromTags({ name: "Maternity Hospital" }) === null, "never infer maternity care from name alone");
assert(x.categoryFromTags({ healthcare: "birthing_centre" }) === "maternity", "birthing category");
const records = [
  { type: "node", id: 100, lat: 23.812, lon: 90.412, tags: { amenity: "hospital", name: "Near Hospital", "addr:street": "Road A", "contact:phone": "+880 1234567890" } },
  { type: "node", id: 101, lat: 25, lon: 91, tags: { amenity: "hospital", name: "Far hospital" } },
  { type: "node", id: 100, lat: 23.812, lon: 90.412, tags: { amenity: "hospital", name: "duplicate" } },
  { type: "way", id: 110, center: { lat: 23.8107, lon: 90.413 }, tags: { healthcare: "birthing_centre", name: "Mapped birthing", website: "javascript:alert(1)" } },
  { type: "node", id: 111, lat: 23.811, lon: 90.412, tags: { amenity: "school", name: "Not clinical" } },
];
const actual = x.normalizeOsm(records, origin, 2000);
assert(actual.length === 2, "dedupe, distance and category filters");
assert(actual[0].distanceKm <= actual[1].distanceKm, "distance ordering");
assert(actual.find(p => p.id === "way/110").locationPrecision === "feature-center", "feature-centre disclosure");
assert(actual.find(p => p.id === "way/110").website === null, "reject javascript website");
assert(actual.every(p => p.distanceKm <= 2), "strict radius");
console.log("NEARBY CORE CHECK PASSED: distance, categories, deduplication, URL safety, coordinate bounds and strict radius.");
