import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

const ayeshaPassword = process.env.PROHOR_RLS_AYESHA_PASSWORD;
const nusratPassword = process.env.PROHOR_RLS_NUSRAT_PASSWORD;
test.skip(!ayeshaPassword || !nusratPassword, "NOT RUN: dedicated local synthetic account passwords are missing.");
const origin = process.env.PROHOR_AUTH_TEST_URL ?? "http://localhost:3000";

test("saved account preferences survive refresh, sign-out/sign-in and isolate Nusrat", async ({ page, playwright }) => {
  const provider = await playwright.request.newContext({ baseURL: origin });
  let original: Record<string,unknown> | undefined;
  try {
    await signIn(page.request, "ayesha-rls@example.invalid", ayeshaPassword!);
    await signIn(provider, "nusrat-rls@example.invalid", nusratPassword!);
    const ownId = (await (await page.request.get("/api/me")).json()).data.id;
    const initial = await page.request.get("/api/preferences");
    expect(initial.status()).toBe(200);
    original = (await initial.json()).data;
    const providerBefore = (await (await provider.get("/api/preferences")).json()).data;
    const patched = await page.request.patch("/api/preferences", {
      headers: { origin, "if-match": initial.headers().etag }, data: { textScale: "large" },
    });
    expect(patched.status()).toBe(200);
    expect((await patched.json()).data).toEqual({ ...original, textScale: "large" });
    const stale = await page.request.patch("/api/preferences", {
      headers: { origin, "if-match": initial.headers().etag }, data: { textScale: "extra-large" },
    });
    expect(stale.status()).toBe(409);
    await page.goto("/app");
    await page.reload();
    expect((await (await page.request.get("/api/preferences")).json()).data.textScale).toBe("large");
    await page.request.post("/auth/sign-out", { headers: { origin }, maxRedirects: 0 });
    expect((await page.request.get("/api/preferences")).status()).toBe(401);
    await signIn(page.request, "ayesha-rls@example.invalid", ayeshaPassword!);
    expect((await (await page.request.get("/api/preferences")).json()).data.textScale).toBe("large");
    expect((await (await provider.get(`/api/preferences?userId=${ownId}`)).json()).data).toEqual(providerBefore);
    expect((await provider.patch("/api/preferences", { headers: { origin }, data: { userId: ownId, textScale: "extra-large" } })).status()).toBe(400);
    const concurrent = await Promise.all([
      page.request.patch("/api/preferences", { headers: { origin }, data: { highContrast: true } }),
      page.request.patch("/api/preferences", { headers: { origin }, data: { reducedMotion: true } }),
    ]);
    expect(concurrent.map(response => response.status())).toEqual([200,200]);
    const result = (await (await page.request.get("/api/preferences")).json()).data;
    expect(result).toMatchObject({ textScale: "large", highContrast: true, reducedMotion: true });
  } finally {
    try {
      if (original) {
        await signIn(page.request, "ayesha-rls@example.invalid", ayeshaPassword!);
        const current = await page.request.get("/api/preferences");
        const restored = await page.request.patch("/api/preferences", { headers: { origin, "if-match": current.headers().etag },
          data: { textScale: original.textScale, highContrast: original.highContrast, reducedMotion: original.reducedMotion } });
        expect(restored.status(), "Restore synthetic preference fields").toBe(200);
      }
    } finally {
      await provider.post("/auth/sign-out", { headers: { origin }, maxRedirects: 0 }).catch(() => {});
      await provider.dispose();
    }
  }
});

test("GET /api/me uses real sessions, returns trusted roles and ignores target-user input", async ({ playwright }) => {
  const guest = await playwright.request.newContext({ baseURL: origin });
  const mother = await playwright.request.newContext({ baseURL: origin });
  const provider = await playwright.request.newContext({ baseURL: origin });
  try {
    expect((await guest.get("/api/me")).status()).toBe(401);
    await signIn(mother, "ayesha-rls@example.invalid", ayeshaPassword!);
    await signIn(provider, "nusrat-rls@example.invalid", nusratPassword!);
    const ownResponse = await mother.get("/api/me");
    const providerResponse = await provider.get("/api/me");
    expect(ownResponse.status()).toBe(200);
    expect(providerResponse.status()).toBe(200);
    const own = (await ownResponse.json()).data;
    const other = (await providerResponse.json()).data;
    expect(own.role).toBe("mother");
    expect(other.role).toBe("provider");
    expect(own.id).not.toBe(other.id);
    expect(Object.keys(own).sort()).toEqual(["displayName", "id", "role"]);
    const injected = await mother.get(`/api/me?userId=${other.id}&user_id=${other.id}&role=provider`);
    expect((await injected.json()).data).toEqual(own);
    expect(ownResponse.headers()["cache-control"]).toBe("private, no-store");
  } finally {
    await mother.post("/auth/sign-out", { headers: { origin }, maxRedirects: 0 }).catch(() => {});
    await provider.post("/auth/sign-out", { headers: { origin }, maxRedirects: 0 }).catch(() => {});
    await Promise.all([guest.dispose(), mother.dispose(), provider.dispose()]);
  }
});

async function signIn(request: import("@playwright/test").APIRequestContext, email: string, password: string) {
  const response = await request.post("/auth/sign-in", { headers: { origin }, data: { email, password, next: "/app" } });
  expect(response.status()).toBe(200);
  return response.json();
}

test("registration accepts a synthetic mother signup and requires email confirmation", async ({ request }) => {
  const response = await request.post("/auth/sign-up", { headers: { origin }, data: {
    email: `ayesha-signup-${randomUUID()}@example.invalid`, password: "Synthetic-passphrase-123!", next: "/app",
  } });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ code: "check-email" });
  expect((await request.get("/api/auth/me")).status()).toBe(401);
  // Actual email confirmation/profile creation is a separate manual local-mail check.
});

test("mother sign-in persists across page refresh and sign-out removes access", async ({ page }) => {
  expect((await signIn(page.request, "ayesha-rls@example.invalid", ayeshaPassword!)).redirectTo).toBe("/app");
  await page.goto("/app");
  const before = await page.request.get("/api/auth/me");
  expect(before.status()).toBe(200);
  expect((await before.json()).profile.role).toBe("mother");
  await page.reload();
  expect((await page.request.get("/api/auth/me")).status()).toBe(200);
  const cookies = (await page.context().cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
  expect(cookies.length).toBeGreaterThan(0);
  expect(cookies.every((cookie) => cookie.httpOnly && cookie.sameSite === "Lax")).toBe(true);
  const out = await page.request.post("/auth/sign-out", { headers: { origin }, maxRedirects: 0 });
  expect(out.status()).toBe(200);
  expect((await page.request.get("/api/auth/me")).status()).toBe(401);
});

test("direct server authorization denies guests and mothers in provider routes", async ({ request }) => {
  const guest = await request.get("/app?task=visit", { maxRedirects: 0 });
  expect(guest.status()).toBe(307);
  expect(guest.headers().location).toContain("next=%2Fapp%3Ftask%3Dvisit");
  await signIn(request, "ayesha-rls@example.invalid", ayeshaPassword!);
  const own = await (await request.get("/api/auth/me")).json();
  const injected = await (await request.get("/api/auth/me?user_id=someone-else&role=provider")).json();
  expect(injected).toEqual(own);
  expect((await request.get("/provider", { maxRedirects: 0 })).status()).toBe(403);
  expect((await request.get("/api/auth/provider")).status()).toBe(403);
});

test("a trusted simulated provider can use only the provider workspace", async ({ request }) => {
  await signIn(request, "nusrat-rls@example.invalid", nusratPassword!);
  expect((await request.get("/provider")).status()).toBe(200);
  expect((await request.get("/api/auth/provider")).status()).toBe(200);
  expect((await request.get("/app", { maxRedirects: 0 })).status()).toBe(403);
});

test("invalid credentials, tampered sessions and unsafe next URLs are rejected", async ({ context }) => {
  const request = context.request;
  const invalid = await request.post("/auth/sign-in", { headers: { origin }, data: {
    email: "ayesha-rls@example.invalid", password: "Incorrect-synthetic-password",
  } });
  expect(invalid.status()).toBe(400);
  const result = await request.post("/auth/sign-in", { headers: { origin }, data: {
    email: "ayesha-rls@example.invalid", password: ayeshaPassword, next: "//external.invalid",
  } });
  expect((await result.json()).redirectTo).toBe("/app");
  expect((await request.get("/api/auth/me")).status()).toBe(200);
  const authCookies = (await context.cookies()).filter((cookie) => /-auth-token(?:\.\d+)?$/.test(cookie.name));
  expect(authCookies.length).toBeGreaterThan(0);
  await context.clearCookies();
  await context.addCookies(authCookies.map((cookie) => ({ ...cookie, value: "invalid-session-cookie" })));
  expect((await context.request.get("/api/auth/me")).status()).toBe(401);
});
