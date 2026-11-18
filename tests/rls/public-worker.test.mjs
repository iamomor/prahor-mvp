import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../../public/sw.js", import.meta.url), "utf8");
function worker(fetchImpl = async () => new Response("Synthetic public asset")) {
  const listeners = {};
  const writes = [], deletes = [], fetches = [];
  const cache = { match: async () => undefined, put: async (request, response) => writes.push({ request, response }) };
  const self = { location: { origin: "https://prohor.example.invalid" }, addEventListener: (name, callback) => { listeners[name] = callback; },
    skipWaiting: async () => {}, clients: { claim: async () => {} } };
  runInNewContext(source, { self, URL, Response, caches: {
    open: async () => cache, keys: async () => ["prohor-public-shell-v1", "prohor-public-shell-v2", "unrelated-user-cache"],
    delete: async key => { deletes.push(key); return true; }, match: async () => new Response("Synthetic public offline shell"),
  }, fetch: async (request, init) => { fetches.push({ request, init }); return fetchImpl(request, init); } });
  return { writes, deletes, fetches, async lifecycle(name) {
    let pending;
    listeners[name]({ waitUntil(value) { pending = value; } });
    await pending;
  }, async request(path, { method = "GET", mode = "cors", origin = self.location.origin } = {}) {
    let pending;
    listeners.fetch({ request: { url: origin + path, method, mode }, respondWith(value) { pending = value; } });
    return pending === undefined ? { intercepted: false } : { intercepted: true, response: await pending };
  } };
}

test("service worker never intercepts private/API/auth/report/provider requests, including navigation", async () => {
  const state = worker();
  for (const path of ["/api/me", "/api/preferences", "/api/health", "/api/diary", "/api/wellness", "/api/care-requests", "/api/provider/requests",
    "/api/consents", "/api/reports/commit", "/app", "/app/jibonrekha", "/app/bujhi", "/provider", "/auth/callback", "/sign-in", "/sign-up"]) {
    for (const mode of ["cors", "navigate"]) assert.equal((await state.request(path, { mode })).intercepted, false, path);
  }
  assert.equal(state.writes.length, 0);
  assert.equal(state.fetches.length, 0);
});

test("mutations, external origins and Next bundles are never served from worker caches", async () => {
  const state = worker();
  assert.equal((await state.request("/offline", { method: "POST" })).intercepted, false);
  assert.equal((await state.request("/offline", { origin: "https://external.invalid" })).intercepted, false);
  assert.equal((await state.request("/_next/static/synthetic.js")).intercepted, false);
  assert.equal(state.writes.length, 0);
});

test("offline fallback is public-only and successful public navigation HTML is never cached", async () => {
  const offline = worker(async () => { throw new Error("Synthetic offline"); });
  const fallback = await offline.request("/", { mode: "navigate" });
  assert.equal(await fallback.response.text(), "Synthetic public offline shell");
  assert.equal(offline.writes.length, 0);
  const online = worker();
  assert.equal((await online.request("/accessibility", { mode: "navigate" })).intercepted, true);
  assert.equal(online.writes.length, 0);
});

test("even allowlisted assets with private/no-store/no-cache responses are not cached", async () => {
  for (const value of ["private, no-store", "no-store", "Private, max-age=60", "no-cache"]) {
    const state = worker(async () => new Response("PRIVATE_RESPONSE_SENTINEL", { headers: { "cache-control": value } }));
    assert.equal((await state.request("/offline")).intercepted, true);
    assert.equal(state.writes.length, 0, value);
  }
  const publicState = worker();
  await publicState.request("/icon-192.png");
  assert.equal(publicState.writes.length, 1);
});

test("install/upgrade uses only public shell assets and deletes only owned old shell caches", async () => {
  const state = worker();
  await state.lifecycle("install");
  assert.deepEqual(state.writes.map(row => row.request), ["/offline", "/icon-192.png", "/icon-512.png"]);
  assert(state.fetches.every(row => row.init.credentials === "omit" && row.init.cache === "no-store"));
  await state.lifecycle("activate");
  assert.equal(state.deletes.includes("unrelated-user-cache"), false);
  assert(state.deletes.every(key => key.startsWith("prohor-public-shell-")));
});

test("install refuses a private or uncacheable response rather than persisting it", async () => {
  const state = worker(async () => new Response("PRIVATE_INSTALL_SENTINEL", { headers: { "cache-control": "private, no-store" } }));
  await assert.rejects(state.lifecycle("install"), /Public offline shell unavailable/);
  assert.equal(state.writes.length, 0);
});
