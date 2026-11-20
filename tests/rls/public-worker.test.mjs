import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../../public/sw.js", import.meta.url), "utf8");
function worker(fetchImpl = async () => new Response("Synthetic public asset")) {
  const listeners = {};
  const writes = [], deletes = [], fetches = [];
  const records = new Map();
  const cache = { match: async request => records.get(typeof request === "string" ? request : new URL(request.url).pathname), put: async (request, response) => { writes.push({ request, response }); records.set(typeof request === "string" ? request : request, response); } };
  const self = { location: { origin: "https://prohor.example.invalid" }, addEventListener: (name, callback) => { listeners[name] = callback; },
    skipWaiting: async () => {}, clients: { claim: async () => {} } };
  runInNewContext(source, { self, URL, Response, caches: {
    open: async () => cache, keys: async () => ["prohor-public-shell-v1", "prohor-public-shell-v2", "unrelated-user-cache"],
    delete: async key => { deletes.push(key); return true; }, match: async () => new Response("Synthetic public offline shell"),
  }, fetch: async (request, init) => { fetches.push({ request, init }); return fetchImpl(request, init); } });
  return { writes, deletes, fetches, records, async lifecycle(name) {
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

test("offline fallback is public-only and non-safety public navigation HTML is never cached", async () => {
  const offline = worker(async () => { throw new Error("Synthetic offline"); });
  const fallback = await offline.request("/", { mode: "navigate" });
  assert.equal(await fallback.response.text(), "Synthetic public offline shell");
  assert.equal(offline.writes.length, 0);
  const online = worker();
  assert.equal((await online.request("/accessibility", { mode: "navigate" })).intercepted, true);
  assert.equal(online.writes.length, 0);
});

test("safety routes cache only successful anonymous HTML and remain available offline", async () => {
  const html = () => new Response('<main>Cached warning detail <a href="tel:999">Call 999</a></main>', { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0" } });
  const online = worker(async () => html());
  for (const path of ["/safety", "/safety/information", "/safety/information/pregnancy", "/safety/information/labour-and-childbirth", "/safety/information/postpartum", "/safety/information/perinatal-mental-health"]) {
    assert.equal((await online.request(path, { mode: "navigate" })).intercepted, true, path);
  }
  assert.equal(online.writes.length, 6);
  const state = worker(async () => { throw new Error("Synthetic offline"); });
  for (const [path, response] of online.records) state.records.set(path, response);
  for (const path of ["/safety", "/safety/information", "/safety/information/pregnancy", "/safety/information/labour-and-childbirth", "/safety/information/postpartum", "/safety/information/perinatal-mental-health"]) {
    const response = await state.request(path, { mode: "navigate" });
    assert.equal(response.intercepted, true, path);
    const body = await response.response.text();
    assert.match(body, /Cached warning detail/);
    assert.match(body, /tel:999/);
  }
});

test("safety HTML with private headers, cookies, query strings or failures is not cached", async () => {
  for (const headers of [
    { "Content-Type": "text/html", "Cache-Control": "private, max-age=30" },
    { "Content-Type": "text/html", "Cache-Control": "no-store" },
    { "Content-Type": "text/html", "Cache-Control": "public, max-age=30", "Set-Cookie": "session=synthetic" },
    { "Content-Type": "text/html", "Cache-Control": "public, max-age=30", Vary: "Cookie" },
  ]) {
    const state = worker(async () => new Response("Synthetic safety page", { headers }));
    await state.request("/safety/information/pregnancy", { mode: "navigate" });
    assert.equal(state.writes.length, 0);
  }
  const query = worker(async () => new Response("Synthetic query page", { headers: { "Content-Type": "text/html", "Cache-Control": "public" } }));
  await query.request("/safety?next=%2Fapp", { mode: "navigate" });
  assert.equal(query.writes.length, 0);
  const failed = worker(async () => new Response("Synthetic server error", { status: 503, headers: { "Content-Type": "text/html", "Cache-Control": "public" } }));
  await failed.request("/safety", { mode: "navigate" });
  assert.equal(failed.writes.length, 0);
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
