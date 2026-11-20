import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(url) {
  const source = fs.readFileSync(url, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: () => ({}), Intl, Date };
  vm.runInNewContext(js, context);
  return context.exports;
}
const presets = load(new URL("./access-presets.ts", import.meta.url));
// The app's own defaults and sanitizer, so presets are checked against the real preference rules.
const prefs = load(new URL("../../../lib/access-preferences.ts", import.meta.url));
const clone = (value) => JSON.parse(JSON.stringify(value));

test("preset ids are unique and match the catalog", () => {
  assert.deepEqual(clone(presets.ACCESS_PRESETS.map((p) => p.id)), clone(presets.accessPresetIds));
  for (const preset of presets.ACCESS_PRESETS) {
    for (const lang of ["en", "bn"]) assert.ok(preset[lang].name && preset[lang].hint, `${preset.id} ${lang} copy`);
    for (const key of Object.keys(preset.patch)) assert.ok(key in prefs.DEFAULT_PROHOR_PREFERENCES, `${preset.id} sets unknown setting ${key}`);
  }
});

test("every preset survives the app's own sanitizer unchanged", () => {
  for (const id of presets.accessPresetIds) {
    const next = presets.applyAccessPreset(clone(prefs.DEFAULT_PROHOR_PREFERENCES), id);
    assert.deepEqual(clone(prefs.sanitizePreferences(next)), clone(next), id);
  }
});

test("presets never change language or theme and keep the spacious alias in step", () => {
  const start = { ...clone(prefs.DEFAULT_PROHOR_PREFERENCES), language: "en", theme: "morning-mist" };
  for (const id of presets.accessPresetIds) {
    const next = presets.applyAccessPreset(start, id);
    assert.equal(next.language, "en");
    assert.equal(next.theme, "morning-mist");
    assert.equal(next.spaciousLayout, next.layoutDensity === "spacious");
  }
});

test("changes are listed before applying, and nothing is left to change after", () => {
  const start = clone(prefs.DEFAULT_PROHOR_PREFERENCES);
  assert.deepEqual(clone(presets.presetChanges(start, "large-clear")), ["textScale", "highContrast", "layoutDensity"]);
  const next = presets.applyAccessPreset(start, "large-clear");
  assert.deepEqual(clone(presets.presetChanges(next, "large-clear")), []);
  assert.deepEqual(clone(presets.applyAccessPreset(next, "large-clear")), clone(next));
});

test("active presets reflect the current settings, including more than one", () => {
  const start = clone(prefs.DEFAULT_PROHOR_PREFERENCES);
  assert.deepEqual(clone(presets.activeAccessPresets(start)), []);
  const both = presets.applyAccessPreset(presets.applyAccessPreset(start, "large-clear"), "calm-simple");
  assert.deepEqual(clone(presets.activeAccessPresets(both)), ["large-clear", "calm-simple"]);
  const changed = { ...both, reducedMotion: false };
  assert.deepEqual(clone(presets.activeAccessPresets(changed)), ["large-clear"]);
});

test("the original preferences object is not mutated, so Undo can restore it", () => {
  const start = clone(prefs.DEFAULT_PROHOR_PREFERENCES);
  const before = clone(start);
  presets.applyAccessPreset(start, "pictures-text");
  assert.deepEqual(clone(start), before);
});

test("an unknown preset id is refused", () => {
  assert.throws(() => presets.applyAccessPreset(clone(prefs.DEFAULT_PROHOR_PREFERENCES), "deaf"), /Unknown access preset/);
});
