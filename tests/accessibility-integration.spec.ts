import { expect, test, type Page } from "@playwright/test";

/**
 * STEP 03 behaviour checks over PUBLIC routes only. Shusthota and the signed-in Bondhon/Jibonrekha/Bujhi/Shonket
 * workspaces need server-side auth, which is not faked here. Passing these is not proof of real-world accessibility.
 */
const ROUTES = [
  { module: "Adapt", path: "/accessibility" },
  { module: "Barta", path: "/ask" },
  { module: "Shonket", path: "/safety" },
  { module: "Jibonrekha", path: "/demo/jibonrekha/records" },
  { module: "Bujhi", path: "/demo/bujhi" },
  { module: "Poth", path: "/poth" },
  { module: "Bondhon", path: "/bondhon" },
] as const;

const PREF_KEY = "prohor-access-preferences-v1";
const BIG = { textScale: "extra-large", highContrast: true, layoutDensity: "spacious", reducedMotion: true, focusedView: true };
test.describe.configure({ timeout: 60_000 });

async function open(page: Page, path: string, access: object = {}, reading: object = {}) {
  await page.addInitScript(([key, a, r]) => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem(key as string, JSON.stringify({ _schemaVersion: 4, language: "en", ...(a as object) }));
      localStorage.setItem("prohor-home-reading-v1", JSON.stringify(r));
    }
  }, [PREF_KEY, access, reading] as const);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
}
const headingSize = (page: Page) => page.locator("h1").first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));

for (const route of ROUTES) {
  test(`${route.module}: text size, contrast and layout choices reach this module`, async ({ page, browser }) => {
    await open(page, route.path);
    const normal = await headingSize(page);
    const ctx = await browser.newContext();
    const big = await ctx.newPage();
    await open(big, route.path, BIG, { textSpacing: "relaxed" });
    expect(await headingSize(big), "heading grows with Text size (rem-based, not fixed px)").toBeGreaterThan(normal);
    const root = await big.evaluate(() => ({ ...document.documentElement.dataset }));
    expect(root).toMatchObject({ textScale: "extra-large", contrast: "more", layout: "spacious", motion: "reduce", textSpacing: "relaxed", focused: "true" });
    await ctx.close();
  });

  test(`${route.module}: reduced motion leaves no endless animation`, async ({ page }) => {
    await open(page, route.path, { reducedMotion: true });
    await page.waitForTimeout(800);
    const endless = await page.evaluate(() => document.getAnimations().filter(a => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity).length);
    expect(endless).toBe(0);
  });

  test(`${route.module}: keyboard focus is always visible, in every theme`, async ({ page }) => {
    for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) {
      await open(page, route.path, { theme });
      const unseen: string[] = [];
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press("Tab");
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          // nextjs-portal is the dev-server error overlay, not PROHOR UI.
          if (!el || el === document.body || el.tagName.toLowerCase() === "nextjs-portal") return null;
          const s = getComputedStyle(el);
          const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
          return { ring, label: `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}"` };
        });
        if (stop && !stop.ring) unseen.push(`${theme}: ${stop.label}`);
      }
      expect(unseen, "focused controls with no outline or ring").toEqual([]);
      await page.evaluate(() => sessionStorage.clear());
    }
  });
}

test("Shonket: focused view, reduced motion and Bangla keep the 999 and human-help actions", async ({ page }) => {
  await open(page, "/safety", { ...BIG, language: "bn" });
  await expect(page.locator('a[href="tel:999"]').first()).toBeVisible();
  await expect(page.locator('a[href="tel:999"]').first()).toContainText("৯৯৯");
  await expect(page.locator('a[href="tel:16263"]').first()).toContainText("১৬২৬৩");
  await expect(page.locator('a[href="/app/care"]').first()).toBeVisible();
});

/**
 * Drafts survive a preference change. A storage event is the same path another tab or an account refresh uses;
 * the in-page dialog path is covered for Poth in adapt-foundation.spec.ts and for Barta in day3-integration.spec.ts.
 */
async function changePreferences(page: Page) {
  await page.evaluate(key => {
    localStorage.setItem(key, JSON.stringify({ _schemaVersion: 4, language: "bn", textScale: "extra-large", highContrast: true, layoutDensity: "spacious" }));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, PREF_KEY);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.textScale)).toBe("extra-large");
}
const DRAFTS = [
  { module: "Adapt (visit card)", path: "/accessibility", field: (p: Page) => p.locator('input[name="name"]'), value: "Rina Akter" },
  { module: "Barta", path: "/ask", field: (p: Page) => p.locator("#barta-question"), value: "How much water should I drink?" },
  { module: "Jibonrekha", path: "/demo/jibonrekha/records", field: (p: Page) => p.getByLabel(/মান বা লেখা/), value: "58.5" },
  { module: "Poth", path: "/poth", field: (p: Page) => p.locator('input[type="search"]'), value: "Mohammadpur" },
] as const;
for (const d of DRAFTS) {
  test(`${d.module}: what she typed survives a preference and language change`, async ({ page }) => {
    await open(page, d.path);
    const field = d.field(page);
    await field.fill(d.value);
    await field.evaluate(el => { (el as HTMLElement & { __same?: boolean }).__same = true; });
    await changePreferences(page);
    await expect(field).toHaveValue(d.value);
    expect(await field.evaluate(el => (el as HTMLElement & { __same?: boolean }).__same), "same DOM node, not rebuilt").toBe(true);
  });
}

test("Bujhi: manual-entry fields keep a typed value across a preference change and are labelled", async ({ page }) => {
  await open(page, "/demo/bujhi");
  await page.getByRole("button", { name: "নিজে লিখি" }).click();
  const field = page.locator("input:not([type='file']):not([type='radio']):not([type='checkbox']), textarea").first();
  await expect(field).toBeVisible();
  expect(await field.evaluate(el => (el as HTMLInputElement).labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")), "has a programmatic label").toBeTruthy();
  await field.fill("11.2");
  await changePreferences(page);
  await expect(field).toHaveValue("11.2");
});

test("Shonket: Listen buttons appear only when chosen, and nothing speaks until pressed", async ({ page }) => {
  const speakCalls = () => page.evaluate(() => (window as Window & { __spoken?: string[] }).__spoken?.length ?? 0);
  // Same fake engine as day3-integration.spec.ts, so the result does not depend on the machine's voices.
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Reflect.set(window, "__spoken", spoken);
    class Utterance { onstart?: () => void; constructor(public text: string) {} }
    const synthesis = new EventTarget();
    Object.assign(synthesis, { speaking: false, paused: false,
      getVoices: () => [{ lang: "en-GB", localService: true, name: "Synthetic", voiceURI: "synthetic" }],
      speak: (u: Utterance) => { spoken.push(u.text); u.onstart?.(); }, cancel() {}, pause() {}, resume() {} });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance });
    Object.defineProperty(window, "speechSynthesis", { value: synthesis });
  });
  await open(page, "/safety");
  await expect(page.getByRole("button", { name: "Listen", exact: true })).toHaveCount(0);

  await page.evaluate(key => {
    localStorage.setItem(key, JSON.stringify({ _schemaVersion: 4, language: "en", readAloud: true }));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, PREF_KEY);
  const listen = page.getByRole("button", { name: "Listen", exact: true });
  await expect(listen).toHaveCount(2);
  await page.waitForTimeout(500);
  expect(await speakCalls(), "no speech before she presses Listen").toBe(0);
  await listen.first().focus();
  await page.keyboard.press("Enter");
  await expect.poll(speakCalls).toBeGreaterThan(0);
});

test("Poth: searching announces the result count politely without moving focus", async ({ page }) => {
  await open(page, "/poth");
  const search = page.locator('input[type="search"]');
  await search.fill("Dhaka");
  await expect(search).toBeFocused();
  const status = page.locator('#poth-reviewed-directory [role="status"][aria-live="polite"]');
  await expect(status).toContainText(/matching listings|মিল আছে/, { timeout: 15_000 });
  await expect(search).toBeFocused();
});
