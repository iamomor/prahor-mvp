// Shared-device isolation and contract mapping for Adapt account sync, with fake identity/storage/server.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

class PreferencesApiError extends Error { constructor(status) { super("x"); this.status = status; } }
function load(file, modules = {}) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("exports", "require", js)(exports, name => modules[name] ?? {});
  return exports;
}
const prefs = load("../../../lib/access-preferences.ts");
const mapping = load("./account-mapping.ts");
const { PreferenceSyncController } = load("./account-controller.ts", { "./account-mapping": mapping, "../api/client": { PreferencesApiError } });

const reading = { font: "default", textSpacing: "standard", density: "comfortable" };
const guest = { access: { ...prefs.DEFAULT_PROHOR_PREFERENCES, theme: "original-rose", textScale: "large", focusedView: true }, reading };
const accountOf = overrides => ({
  theme: "morning-mist", highContrast: false, textScale: "default", spaciousLayout: false, reducedMotion: false,
  simplifiedContent: false, communication: "text", language: "bn", textSpacing: "default", readAloud: false, ...overrides,
});
const ACCOUNTS = {
  a: accountOf({ theme: "quiet-garden", textScale: "extra-large", readAloud: true, highContrast: true, communication: "aac" }),
  b: accountOf({ language: "en" }),
};

function harness() {
  let device = structuredClone(guest), session = null, who = null;
  const saves = [];
  const deps = {
    identity: async () => (who ? { id: who } : null),
    load: async (_signal, id) => ({ preferences: structuredClone(ACCOUNTS[id]), etag: `${id}-1`, updatedAt: null }),
    save: async (patch, etag, _signal, id) => { saves.push({ patch, etag, id }); return deps.saveResult(patch, id); },
    saveResult: (patch, id) => ({ preferences: { ...ACCOUNTS[id], ...patch }, etag: `${id}-2`, updatedAt: null }),
    readDevice: () => structuredClone(device), writeDevice: value => { device = structuredClone(value); },
    readSession: () => session, writeSession: value => { session = value && structuredClone(value); },
  };
  const controller = new PreferenceSyncController(deps);
  return { controller, deps, saves, device: () => device, session: () => session, signIn: id => { who = id; } };
}

test("mapping: OS-following contrast is never synced or overwritten; explicit choices are", () => {
  const followOs = { access: { ...prefs.DEFAULT_PROHOR_PREFERENCES, highContrast: null }, reading };
  assert.equal("highContrast" in mapping.accountPatch(followOs, accountOf({ highContrast: true })), false);
  assert.equal(mapping.applyAccount(accountOf({ highContrast: true }), followOs).access.highContrast, null);
  const explicit = { access: { ...prefs.DEFAULT_PROHOR_PREFERENCES, highContrast: false }, reading };
  assert.deepEqual(mapping.accountPatch(explicit, accountOf({ highContrast: true })), { highContrast: false, theme: "quiet-garden" });
  assert.equal(mapping.applyAccount(accountOf({ highContrast: true }), explicit).access.highContrast, true);
});

test("mapping: readAloud round-trips; compact and focusedView stay on the device", () => {
  const device = { access: { ...prefs.DEFAULT_PROHOR_PREFERENCES, theme: "morning-mist", readAloud: true, layoutDensity: "compact", focusedView: true }, reading };
  assert.deepEqual(mapping.accountPatch(device, accountOf()), { readAloud: true });
  const applied = mapping.applyAccount(accountOf({ readAloud: true }), { ...device, access: { ...device.access, readAloud: false } });
  assert.equal(applied.access.readAloud, true);
  assert.equal(applied.access.layoutDensity, "compact");
  assert.equal(applied.access.focusedView, true);
  assert.equal(prefs.sanitizePreferences({ _schemaVersion: 3 }).readAloud, null, "legacy records: not chosen on this device");
  // A device that never chose readAloud must not switch off her account's choice, and adopts it when applied.
  const fresh = { access: { ...prefs.DEFAULT_PROHOR_PREFERENCES, theme: "morning-mist", textScale: "large" }, reading };
  assert.deepEqual(mapping.accountPatch(fresh, accountOf({ readAloud: true })), { textScale: "large" });
  assert.equal(mapping.applyAccount(accountOf({ readAloud: true }), fresh).access.readAloud, true);
});

test("A: guest → mother A → sign out restores the guest's own device settings", async () => {
  const h = harness();
  h.signIn("a"); await h.controller.refresh();
  assert.equal(h.session().userId, "a");
  assert.equal(h.controller.useAccount().status, "applied");
  assert.equal(h.device().access.textScale, "extra-large");
  assert.equal(h.device().access.readAloud, true);
  h.signIn(null); await h.controller.refresh();
  assert.deepEqual(h.device(), guest);
  assert.equal(h.session(), null);
});

test("B: mother A's settings never reach mother B on the same device", async () => {
  const h = harness();
  h.signIn("a"); await h.controller.refresh(); h.controller.useAccount();
  h.signIn(null); await h.controller.refresh();
  h.signIn("b"); await h.controller.refresh();
  assert.deepEqual(h.device(), guest, "B starts from the guest device state, not A's");
  assert.deepEqual(h.session().backup, guest);
  assert.equal(h.controller.getSnapshot().account.language, "en");
  // Direct account switch without a sign-out in between is isolated too.
  h.signIn("a"); await h.controller.refresh(); h.controller.useAccount();
  h.signIn("b"); await h.controller.refresh();
  assert.deepEqual(h.device(), guest);
  assert.equal(h.session().userId, "b");
});

test("C: a 409 conflict keeps the device draft and asks for review instead of overwriting", async () => {
  const h = harness();
  h.signIn("a"); await h.controller.refresh();
  const draft = h.device();
  h.deps.saveResult = () => { throw new PreferencesApiError(409); };
  ACCOUNTS.a = { ...ACCOUNTS.a, textScale: "large" };
  const result = await h.controller.save();
  assert.equal(result.status, "conflict");
  assert.deepEqual(h.device(), draft);
  assert.equal(h.controller.getSnapshot().phase, "review");
  assert.equal(h.controller.getSnapshot().account.textScale, "large");
});
