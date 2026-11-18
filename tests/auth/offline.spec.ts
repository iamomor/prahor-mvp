import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { currentApiContracts } from "../../src/lib/contracts/current-api";
import type { z } from "zod";

test("all current API wire responses match their centralized schemas", async ({ request }) => {
  // Eight distinct route modules may compile on first use in the isolated dev server.
  test.setTimeout(90_000);
  for (const [operation, contract] of Object.entries(currentApiContracts)) {
    const [method, template] = operation.split(" ");
    const path = template.replace(":id", "e3000000-0000-4000-8000-000000000010");
    const data = path === "/api/ai/chat" ? { question: "Synthetic contract check" } : path === "/api/care-requests"
      ? { message: "Synthetic not-sent contract check", method: "text" } : { textScale: "large" };
    const response = await request.fetch(path, { method, headers: { origin: "http://127.0.0.1:3007" },
      ...(method === "GET" ? {} : { data }) });
    const variants: Readonly<Record<number,z.ZodType>> = contract.responses;
    expect(variants[response.status()], `${operation}: unexpected ${response.status()}`).toBeDefined();
    expect(variants[response.status()].safeParse(await response.json()).success, operation).toBe(true);
    expect(response.headers()["cache-control"], operation).toContain("no-store");
  }
  for (const [path, data] of [["/api/ai/chat", { question: "Synthetic question", diaryText: "Rejected context" }],
    ["/api/care-requests", { message: "Synthetic request", method: "text", status: "delivered" }]] as const) {
    const response = await request.post(path, { data, headers: { origin: "http://127.0.0.1:3007" } });
    expect(response.status()).toBe(400);
    const schema = path === "/api/ai/chat" ? currentApiContracts["POST /api/ai/chat"].responses[400] : currentApiContracts["POST /api/care-requests"].responses[400];
    expect(schema.safeParse(await response.json()).success).toBe(true);
  }
});

test("care routes fail closed without storage and never turn the legacy form into a sent request", async ({ request }) => {
  const id = "e3000000-0000-4000-8000-000000000010";
  const headers = { origin: "http://127.0.0.1:3007", "Idempotency-Key": id, "X-Prohor-Account": id };
  for (const path of ["/api/care-recipients", `/api/care-requests/${id}`, `/api/care-requests/${id}/events`, "/api/provider/requests"]) {
    const response = await request.get(path, { headers });
    expect(response.status(), path).toBe(503);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    const body = await response.json();
    expect(body.error.code).toBe("unavailable");
    expect(body.data).toBeUndefined();
  }
  const response = await request.post("/api/care-requests", { headers, data: {
    recipientUserId: id, message: "Synthetic reviewed message", method: "aac", purpose: "Synthetic support",
    consentGrantIds: [], reviewConfirmed: true,
  } });
  expect(response.status()).toBe(503);
  expect((await response.json()).error.message).toContain("could not be confirmed");
  const legacy = await request.post("/api/care-requests", { headers: { origin: headers.origin }, data: { message: "Synthetic draft", method: "text" } });
  expect(legacy.status()).toBe(400);
  expect((await legacy.json()).data).toBeUndefined();
  const denied = await request.post("/api/care-requests", { headers: { ...headers, origin: "https://foreign.invalid" }, data: {} });
  expect(denied.status()).toBe(403);
});

test("preferences route returns safe non-cacheable errors when account storage is unconfigured", async ({ request }) => {
  for (const method of ["GET", "PATCH"]) {
    const response = await request.fetch("/api/preferences", { method,
      headers: { origin: "http://127.0.0.1:3007" }, ...(method === "PATCH" ? { data: { textScale: "large" } } : {}) });
    expect(response.status()).toBe(500);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    expect((await response.json()).error.code).toBe("unavailable");
  }
});

test("GET /api/me returns a safe non-cacheable server error without Supabase config", async ({ request }) => {
  const response = await request.get("/api/me?userId=another-user&role=provider");
  expect(response.status()).toBe(500);
  expect(response.headers()["cache-control"]).toBe("private, no-store");
  const body = await response.json();
  expect(body.error).toEqual({ code: "unavailable", message: "Unable to retrieve your profile." });
  expect(body.data).toBeUndefined();
  expect((await request.post("/api/me")).status()).toBe(405);
});

test("unconfigured private routes and direct identity endpoints fail closed", async ({ request }) => {
  for (const path of ["/app", "/app/private", "/provider", "/provider/private", "/api/auth/me", "/api/auth/provider"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(503);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.text()).not.toContain("Your PROHOR dashboard");
  }
});

test("cross-origin POST and GET sign-out cannot change sessions", async ({ request }) => {
  const denied = await request.post("/auth/sign-out", { headers: { origin: "https://external.invalid" } });
  expect(denied.status()).toBe(403);
  expect((await request.get("/auth/sign-out")).status()).toBe(405);
});

test("invalid or expired callback stays local and reports a recoverable error", async ({ request }) => {
  const response = await request.get("/auth/callback?code=synthetic-expired&next=https://external.invalid", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("http://127.0.0.1:3007/sign-in?error=link-expired&next=%2F");
});

test("auth form works with keyboard, retains input across preferences, and announces failure", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "English", exact: true }).click();
  const email = page.getByLabel("Email address", { exact: true });
  await email.focus();
  await page.keyboard.type("ayesha-rls@example.invalid");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await page.keyboard.type("Synthetic-passphrase-123!");
  await page.getByText("Adjust how you use PROHOR", { exact: true }).first().click();
  await expect(email).toHaveValue("ayesha-rls@example.invalid");
  await page.getByLabel("Password", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#auth-status[role='alert']")).toContainText("Authentication is unavailable");
  await expect(page.locator("#auth-status")).toBeFocused();
  await expect(email).toHaveValue("ayesha-rls@example.invalid");
});

test("auth screens reflow at 320px and pass automated accessibility checks", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ["/sign-in", "/sign-up"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
  await page.screenshot({ path: "test-results/auth/sign-up-320.png", fullPage: true, caret: "initial" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/sign-in");
  await page.screenshot({ path: "test-results/auth/sign-in-1280.png", fullPage: true, caret: "initial" });
});

test("existing homepage dialog links to the real sign-in screen", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Sign in", exact: true }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Sign in to PROHOR", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Continue to sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.locator("#email")).toBeVisible();
});

test("changing appearance preserves the language selected outside the access panel", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.locator("summary").click();
  await page.getByRole("radio", { name: "Original Rose", exact: true }).check();
  await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("prohor-access-preferences-v1")!).language)).toBe("en");
  await page.getByRole("button", { name: "Restore default preferences", exact: true }).click();
  await expect(page.getByRole("heading", { name: "সাইন ইন", exact: true })).toBeVisible();
});

test("MVP sign-in does not offer an email-only action that requires SMTP", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("button", { name: "Email me a sign-in link instead" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Resend confirmation email" })).toHaveCount(0);
});

for (const mode of ["blocked", "quota-exceeded"] as const) {
  test(`language and preferences work in memory when storage is ${mode}`, async ({ page }) => {
    await page.addInitScript((storageMode) => {
      if (storageMode === "blocked") Object.defineProperty(window, "localStorage", {
        get() { throw new DOMException("Synthetic blocked storage", "SecurityError"); },
      });
      else Storage.prototype.setItem = () => { throw new DOMException("Synthetic quota", "QuotaExceededError"); };
    }, mode);
    await page.goto("/sign-in");
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await page.locator("#email").fill("ayesha-rls@example.invalid");
    await page.locator("summary").click();
    await page.getByRole("radio", { name: "Original Rose", exact: true }).check();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "original-rose");
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.locator("#email")).toHaveValue("ayesha-rls@example.invalid");
  });
}

test("a query parameter cannot claim sign-out without session evidence", async ({ page }) => {
  await page.goto("/sign-in?status=signed-out");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#auth-status")).not.toContainText("You have signed out");
  await expect(page.locator("#auth-status")).toContainText("Sign in to access your account");
});

test("large-text, contrast and theme combinations preserve the auth form at 320px", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.locator("#email").fill("ayesha-rls@example.invalid");
  await page.locator("summary").click();
  await page.getByRole("combobox", { name: /^Text size/ }).selectOption("extra-large");
  await page.getByLabel("More space between controls", { exact: true }).check();
  await page.getByLabel("Reduce animation", { exact: true }).check();
  for (const theme of ["Quiet Garden", "Original Rose", "Morning Mist"]) {
    await page.getByRole("radio", { name: theme, exact: true }).check();
    for (const contrast of [false, true]) {
      await page.getByRole("radio", { name: contrast ? "Higher contrast" : "Standard contrast", exact: true }).check();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}, contrast=${contrast}`).toBe(true);
      await expect(page.locator("#email")).toHaveValue("ayesha-rls@example.invalid");
      expect((await new AxeBuilder({ page }).analyze()).violations, `${theme}, contrast=${contrast}`).toEqual([]);
    }
  }
});
