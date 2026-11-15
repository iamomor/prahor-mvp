import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { homepageAssetRecovery } from "../src/components/marketing/asset-recovery";

test("homepage styles survive reload and returning to the page", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && /hydration|hydrating/i.test(message.text())) failures.push(message.text());
  });
  page.on("response", response => {
    if (response.url().includes("/_next/") && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.setViewportSize({ width: 1440, height: 1000 });

  async function checkStyles() {
    await expect(page.locator(".story-hero-grid")).toHaveCSS("display", "grid");
    await expect(page.locator(".hero-card-heading").first()).toHaveCSS("display", "flex");
    await expect(page.locator(".hero-barta-card")).toHaveCSS("border-radius", "20px");
    await expect(page.locator(".story-hero h1")).toHaveCount(1);
    const marks = await page.locator('svg[viewBox="0 0 48 48"]').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
    expect(marks.length).toBeGreaterThan(1);
    expect(marks.every(width => width > 0 && width <= 64)).toBe(true);
  }

  await page.goto("/");
  await checkStyles();
  await page.reload();
  await checkStyles();
  await page.goto("/about");
  await page.goBack();
  await checkStyles();
  expect(failures).toEqual([]);
});

test("an old worker cannot keep serving stale development CSS after upgrade", async ({ browser }) => {
  const currentWorker = await readFile("public/sw.js", "utf8");
  // Reproduce the previous cache-first policy with an intentionally stale bundle.
  const legacyWorker = `
    const CACHE = 'prohor-public-shell-v1';
    self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
    self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
    self.addEventListener('fetch', event => {
      if (new URL(event.request.url).pathname.startsWith('/_next/static/')) {
        event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
      }
    });
  `;
  let upgraded = false;
  let padding = 32;
  const server = createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (request.url === "/sw.js") {
      response.setHeader("Content-Type", "application/javascript");
      response.end(upgraded ? currentWorker : legacyWorker);
    } else if (request.url === "/_next/static/development.css") {
      response.setHeader("Content-Type", "text/css");
      response.end(`main { padding: ${padding}px; }`);
    } else if (request.url === "/") {
      response.setHeader("Content-Type", "text/html");
      response.end(`<!doctype html><html lang="en"><head><title>Public asset regression</title><link rel="stylesheet" href="/_next/static/development.css"></head><body><main>Public asset fixture</main>${upgraded ? `<script>${homepageAssetRecovery}</script>` : ""}</body></html>`);
    } else {
      response.end("Public offline fixture");
    }
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(origin);
    await page.evaluate(async () => {
      await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.evaluate(async () => {
      const stale = await caches.open("prohor-public-shell-v1");
      await stale.put("/_next/static/development.css", new Response("main { padding: 0px; }", { headers: { "Content-Type": "text/css" } }));
      const unrelated = await caches.open("unrelated-public-fixture");
      await unrelated.put("/unrelated-marker", new Response("keep"));
    });
    await page.reload();
    await expect(page.locator("main")).toHaveCSS("padding-top", "0px");

    upgraded = true;
    await page.reload();
    await expect(page.locator("main")).toHaveCSS("padding-top", "32px", { timeout: 15000 });
    await expect.poll(() => page.evaluate(() => caches.keys())).not.toContain("prohor-public-shell-v1");
    expect(await page.evaluate(() => caches.keys())).toContain("unrelated-public-fixture");

    // Reusing the same bundle URL must now load its new response every time.
    padding = 64;
    await page.reload();
    await expect(page.locator("main")).toHaveCSS("padding-top", "64px");
    expect(await page.evaluate(async () => (await caches.match("/_next/static/development.css")) !== undefined)).toBe(false);
  } finally {
    await context.close();
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
