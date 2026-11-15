/* Public offline shell only. Never cache health, auth, API or Next.js bundles. */
const CACHE_PREFIX = "prohor-public-shell-";
const CACHE = `${CACHE_PREFIX}v2`;
const INSTALL_ASSETS = ["/offline", "/icon-192.png", "/icon-512.png"];
const PUBLIC_NAVIGATIONS = new Set(["/", "/accessibility", "/offline"]);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(INSTALL_ASSETS))
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
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }),
  );
});
