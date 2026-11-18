import { expect, test } from "@playwright/test";
import { DEFAULT_ACCESS_PREFERENCES as defaults, type AccessPreferences } from "../../src/lib/contracts/adapt";
import { DEFAULT_PROHOR_PREFERENCES } from "../../src/lib/access-preferences";
import { DEFAULT_READING_PREFERENCES } from "../../src/features/adapt/types/adapt.types";
import { PreferenceSyncController, type AccountIdentity, type StoredSession, type SyncDependencies } from "../../src/features/adapt/lib/account-controller";
import { accountPatch, applyAccount, type DevicePreferences } from "../../src/features/adapt/lib/account-mapping";
import { PreferencesApiError, type AccountPreferences } from "../../src/features/adapt/api/client";
import { claimAudioSession, ownsAudioSession, releaseAudioSession } from "../../src/lib/audio-session";
import { boundedResponseBytes } from "../../src/lib/bounded-response";

const identityA: AccountIdentity = { id: "10000000-0000-4000-8000-000000000001", displayName: "Synthetic A", role: "mother" };
const identityB: AccountIdentity = { ...identityA, id: "10000000-0000-4000-8000-000000000002", displayName: "Synthetic B" };
const deviceDefaults = (): DevicePreferences => ({ access: { ...DEFAULT_PROHOR_PREFERENCES }, reading: { ...DEFAULT_READING_PREFERENCES } });
function snapshot(preferences: AccessPreferences = { ...defaults }, version = "2026-11-18T00:00:00.000001+00:00"): AccountPreferences {
  return { preferences, updatedAt: version, etag: JSON.stringify(version) };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}
function fixture(overrides: Partial<SyncDependencies> = {}) {
  let device = deviceDefaults();
  let session: StoredSession | null = null;
  let identity: AccountIdentity | null = identityA;
  let server = snapshot();
  const calls: { patch: object; etag: string; id: string }[] = [];
  const dependencies: SyncDependencies = {
    identity: async () => identity,
    load: async () => server,
    save: async (patch, etag, _signal, id) => {
      calls.push({ patch, etag, id }); server = snapshot({ ...server.preferences, ...patch }); return server;
    },
    readDevice: () => device,
    writeDevice: value => { device = value; },
    readSession: () => session,
    writeSession: value => { session = value; },
    ...overrides,
  };
  const controller = new PreferenceSyncController(dependencies);
  return { controller, calls, dependencies, device: () => device, session: () => session,
    setDevice(value: DevicePreferences) { device = value; controller.deviceChanged(); },
    setIdentity(value: AccountIdentity | null) { identity = value; },
    setServer(value: AccountPreferences) { server = value; } };
}

test("account mapping preserves readAloud, font, compact density, focus and OS contrast", () => {
  const device = deviceDefaults();
  device.access.layoutDensity = "compact"; device.access.focusedView = true;
  device.reading = { font: "rubik", density: "compact", textSpacing: "standard" };
  const account = { ...defaults, readAloud: true, theme: "morning-mist" as const, highContrast: true };
  expect(accountPatch(device, account)).toEqual({ theme: "quiet-garden" });
  const applied = applyAccount(account, device);
  expect(applied.access).toMatchObject({ focusedView: true, layoutDensity: "compact", highContrast: null });
  expect(applied.reading).toEqual(device.reading);
  expect(accountPatch(applied, account)).toEqual({});
});

test("loading never writes or silently overwrites device settings; explicit save is partial and uses ETag", async () => {
  const f = fixture(); const device = deviceDefaults(); device.access.textScale = "large"; f.setDevice(device);
  f.setServer(snapshot({ ...defaults, readAloud: true }));
  await f.controller.refresh();
  expect(f.calls).toHaveLength(0); expect(f.device().access.textScale).toBe("large");
  expect(await f.controller.save()).toEqual({ status: "saved" });
  expect(f.calls).toEqual([{ patch: { textScale: "large" }, etag: JSON.stringify("2026-11-18T00:00:00.000001+00:00"), id: identityA.id }]);
  expect(f.controller.getSnapshot().account?.readAloud).toBe(true);
  await f.controller.refresh(); expect(f.controller.getSnapshot().patch).toEqual({});
});

test("failed loading never falls back to a write; failed save preserves unsaved choices", async () => {
  const f = fixture({ load: async () => { throw new Error("offline"); } });
  await f.controller.refresh(); expect((await f.controller.save()).status).toBe("failed"); expect(f.calls).toEqual([]);
  const g = fixture({ save: async () => { throw new PreferencesApiError(0); } });
  await g.controller.refresh(); const edited = deviceDefaults(); edited.access.language = "en"; g.setDevice(edited);
  expect((await g.controller.save()).status).toBe("failed");
  expect(g.device().access.language).toBe("en"); expect(g.controller.getSnapshot().etag).toBeNull();
  expect(g.controller.getSnapshot().message).toContain("not confirmed");
  g.setDevice({ ...edited, access: { ...edited.access, textScale: "large" } });
  expect(g.controller.getSnapshot().phase).toBe("error");
  expect(g.controller.getSnapshot().message).toContain("not confirmed");
  expect(g.controller.getSnapshot().patch).toEqual({ language: "en", textScale: "large" });
});

test("every 409 reloads for review, including a second conflict; no automatic retry", async () => {
  let writes = 0; let reads = 0;
  const f = fixture({ save: async () => { writes++; throw new PreferencesApiError(409); },
    load: async () => { reads++; return snapshot({ ...defaults, readAloud: true }, `2026-11-18T00:00:00.00000${reads}+00:00`); } });
  await f.controller.refresh(); const edited = deviceDefaults(); edited.access.theme = "morning-mist"; f.setDevice(edited);
  for (let count = 1; count <= 2; count++) {
    expect((await f.controller.save()).status).toBe("conflict");
    expect(writes).toBe(count); expect(reads).toBe(count + 1);
    expect(f.controller.getSnapshot().patch).toEqual({ theme: "morning-mist" });
  }
});

test("sync off followed by sign-out restores anonymous choices; another account cannot inherit A", async () => {
  const f = fixture(); const anonymous = deviceDefaults(); anonymous.access.layoutDensity = "compact"; anonymous.reading.density = "compact"; f.setDevice(anonymous);
  f.setServer(snapshot({ ...defaults, language: "en" })); await f.controller.refresh(); f.controller.useAccount();
  expect(f.device().access.language).toBe("en"); f.controller.disable();
  expect(f.session()?.userId).toBe(identityA.id);
  f.setIdentity(null); await f.controller.refresh(); expect(f.device()).toEqual(anonymous); expect(f.session()).toBeNull();
  f.setIdentity(identityB); await f.controller.refresh(); expect(f.device().access.language).toBe("bn");
  expect(f.session()?.userId).toBe(identityB.id);
});

test("switching account during load ignores the stale response", async () => {
  const pending = deferred<AccountPreferences>();
  const f = fixture({ load: (_signal, id) => id === identityA.id ? pending.promise : Promise.resolve(snapshot()) });
  const oldLoad = f.controller.refresh(); await Promise.resolve(); await Promise.resolve();
  f.setIdentity(identityB); await f.controller.refresh();
  pending.resolve(snapshot({ ...defaults, language: "en" })); await oldLoad;
  expect(f.controller.getSnapshot().identity?.id).toBe(identityB.id);
  expect(f.controller.getSnapshot().account?.language).toBe("bn");
});

test("a delayed A save cannot update B metadata or preferences", async () => {
  const pending = deferred<AccountPreferences>(); const f = fixture({ save: () => pending.promise });
  await f.controller.refresh(); const edited = deviceDefaults(); edited.access.theme = "original-rose"; f.setDevice(edited);
  const save = f.controller.save(); f.setIdentity(identityB); await f.controller.refresh();
  pending.resolve(snapshot({ ...defaults, theme: "original-rose" }));
  expect((await save).status).toBe("cancelled");
  expect(f.controller.getSnapshot().identity?.id).toBe(identityB.id); expect(f.controller.getSnapshot().enabled).toBe(false);
  expect(f.device().access.theme).toBe("quiet-garden");
});

test("edits made during a save remain unsaved after its successful completion", async () => {
  const pending = deferred<AccountPreferences>(); const f = fixture({ save: () => pending.promise });
  await f.controller.refresh(); const first = deviceDefaults(); first.access.textScale = "large"; f.setDevice(first);
  const save = f.controller.save(); f.setDevice({ ...first, access: { ...first.access, language: "en" } });
  pending.resolve(snapshot({ ...defaults, textScale: "large" })); await save;
  expect(f.controller.getSnapshot().patch).toEqual({ language: "en" }); expect(f.device().access.language).toBe("en");
});

test("disabling during a save invalidates completion without claiming cloud deletion", async () => {
  const pending = deferred<AccountPreferences>(); const f = fixture({ save: () => pending.promise });
  await f.controller.refresh(); const edited = deviceDefaults(); edited.access.textScale = "large"; f.setDevice(edited);
  const save = f.controller.save(); f.controller.disable(); pending.resolve(snapshot({ ...defaults, textScale: "large" }));
  expect((await save).status).toBe("cancelled"); expect(f.session()?.userId).toBe(identityA.id);
  expect(f.controller.getSnapshot().message).toContain("Saved account settings remain");
});

test("a new audio owner stops the old owner while it still owns browser cancellation", () => {
  const a = Symbol("adapt"), b = Symbol("barta"), c = Symbol("bujhi"); const stopped: symbol[] = [];
  claimAudioSession({ id: a, stop: () => { expect(ownsAudioSession(a)).toBe(true); stopped.push(a); releaseAudioSession(a); } });
  claimAudioSession({ id: b, stop: () => { expect(ownsAudioSession(b)).toBe(true); stopped.push(b); releaseAudioSession(b); } });
  releaseAudioSession(a); expect(ownsAudioSession(b)).toBe(true);
  claimAudioSession({ id: c, stop: () => { stopped.push(c); } });
  expect(stopped).toEqual([a, b]); releaseAudioSession(c);
});

test("provider response size limits apply to streaming bodies as well as headers", async () => {
  const response = new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(8)); controller.enqueue(new Uint8Array(8)); controller.close(); } }));
  await expect(boundedResponseBytes(response, 10)).rejects.toThrow();
  await expect(boundedResponseBytes(new Response(new Uint8Array(4)), 10)).resolves.toHaveLength(4);
});
