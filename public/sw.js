/* Public offline shell only. Never cache health, auth, API or Next.js bundles. */
const CACHE_PREFIX = "prohor-public-shell-";

const CACHE = `${CACHE_PREFIX}v5`; // v5: new PROHOR logo icons
const INSTALL_ASSETS = ["/offline", "/icon-192.png", "/icon-512.png"];

const PUBLIC_NAVIGATIONS = new Set(["/", "/accessibility", "/offline"]);
const SAFETY_NAVIGATION = /^\/safety(?:\/information(?:\/(?:pregnancy|labour-and-childbirth|postpartum|perinatal-mental-health))?)?\/?$/;
function mayCachePublicAsset(response) {
  return response.ok && !/\b(private|no-store|no-cache)\b/i.test(response.headers.get("Cache-Control") || "");
}
function mayCacheSafetyPage(response) {
  return response.status === 200
    && /^text\/html\b/i.test(response.headers.get("Content-Type") || "")
    && !response.headers.has("Set-Cookie")
    && !/\b(private|no-store|no-cache)\b/i.test(response.headers.get("Cache-Control") || "")
    && !/\bcookie\b/i.test(response.headers.get("Vary") || "");
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        for (const asset of INSTALL_ASSETS) {
          // Install only anonymous public assets; never carry account cookies.
          const response = await fetch(asset, { credentials: "omit", cache: "no-store" });
          if (!mayCachePublicAsset(response)) throw new Error("Public offline shell unavailable");
          await cache.put(asset, response);
        }
        // Safety HTML is an optional cache entry because deployment headers may prohibit storage.
        try {
          const safety = await fetch("/safety", { credentials: "omit", cache: "no-store" });
          if (mayCacheSafetyPage(safety)) await cache.put("/safety", safety);
        } catch { /* The standalone safety text remains cached. */ }
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Development bundle URLs are reused. Caching them mixes different versions
  // of HTML, CSS and JS and breaks both styling and hydration. Let the browser
  // and Next.js handle all bundle requests in development and production.
  if (url.pathname.startsWith("/_next/")) return;

  if (request.mode === "navigate") {
    if (SAFETY_NAVIGATION.test(url.pathname) && !url.search) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        try {
          const response = await fetch(request);
          if (mayCacheSafetyPage(response)) await cache.put(url.pathname, response.clone());
          return response;
        } catch {
          return (await cache.match(url.pathname)) || (await caches.match("/offline")) || Response.error();
        }
      })());
      return;
    }
    if (!PUBLIC_NAVIGATIONS.has(url.pathname)) return;
    event.respondWith(
      fetch(request).catch(async () => (await caches.match("/offline")) || Response.error()),
    );
    return;
  }

  // An allowlist prevents accidental caching of records, messages or APIs.
  if (!INSTALL_ASSETS.includes(url.pathname)) return;
  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (mayCachePublicAsset(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
