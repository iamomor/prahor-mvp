import { expect, test, type Page } from "@playwright/test";
import { coordinationTermsSchema, bondhonTermsVersion } from "../src/lib/contracts/coordination";

/** STEP 04: AAC additions, Easy Read governance, calm preset, multimodal safety, Bondhon requests, semantics. */
const KEY = "prohor-access-preferences-v1";
test.describe.configure({ timeout: 60_000 });

async function open(page: Page, path: string, access: object = {}) {
  await page.addInitScript(([key, a]) => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem(key as string, JSON.stringify({ _schemaVersion: 4, language: "en", ...(a as object) }));
    }
  }, [KEY, access] as const);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
}

/** Spies for every optional output channel. None may fire unless she asks. */
async function watchChannels(page: Page) {
  await page.addInitScript(() => {
    const calls = { vibrate: 0, play: 0, speak: 0 };
    Reflect.set(window, "__channels", calls);
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: () => { calls.vibrate++; return true; } });
    HTMLMediaElement.prototype.play = function () { calls.play++; return Promise.resolve(); };
    if (window.speechSynthesis) window.speechSynthesis.speak = () => { calls.speak++; };
  });
  return () => page.evaluate(() => Reflect.get(window, "__channels") as { vibrate: number; play: number; speak: number });
}

test("AAC: the new Talking-with-me symbols work by keyboard, compose text, and never send by themselves", async ({ page }) => {
  let sent = 0;
  page.on("request", request => { if (request.url().endsWith("/api/ai/chat")) sent++; });
  await open(page, "/ask");
  await page.locator("#barta-symbol-input > summary").focus();
  await page.keyboard.press("Enter");
  const aac = page.getByRole("region", { name: /AAC Phrase Builder/ });
  const tab = aac.getByRole("tab", { name: /Talking with me/ });
  await tab.focus();
  await page.keyboard.press("Enter");
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const panel = aac.getByRole("tabpanel");
  await expect(panel.getByRole("button", { name: /\(.+\) — Click to add\./ })).toHaveCount(12);
  const symbol = panel.getByRole("button", { name: /^Say it again \(আবার বলুন\)/ });
  await symbol.focus();
  await page.keyboard.press("Enter");
  await expect(symbol).toHaveAttribute("aria-pressed", "true");
  await expect(aac.locator("textarea")).toHaveValue("Please say that again.");
  await aac.getByRole("button", { name: /Insert into question/ }).click();
  await expect(page.locator("#barta-question")).toHaveValue("Please say that again.");
  await expect(page.locator("#barta-question")).toHaveAttribute("maxlength", "1200");
  expect(sent, "inserting never sends").toBe(0);
});

test("Easy Read: no approved entry exists, so no setting is offered and the original text is shown", async ({ page }) => {
  await open(page, "/accessibility");
  await expect(page.getByRole("heading", { name: "Easy Read" })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /Easy Read/ })).toHaveCount(0);
  const original = "Every feature stays available. These choices change how you read, see, and interact — not what care you can access.";
  await expect(page.getByText(original)).toBeVisible();

  // Even if an old stored choice says "on", a draft is never rendered and no notice she cannot dismiss appears.
  const other = await page.context().newPage();
  await other.addInitScript(key => localStorage.setItem(key, JSON.stringify({ _schemaVersion: 4, language: "en", simplifiedContent: true })), KEY);
  await other.goto("/accessibility", { waitUntil: "domcontentloaded" });
  await expect(other.getByText("No reviewed Easy Read version of this part yet. Showing the original.")).toHaveCount(0);
  await expect(other.getByText(original)).toBeVisible();
  await expect(other.locator("[data-easy-read]")).toHaveCount(0);
  await expect(other.getByText("You can make the words bigger.")).toHaveCount(0);
});

test("Calm and simple: preview → apply keeps theme, language and every safety action (undo: adapt-foundation.spec.ts)", async ({ page }) => {
  await open(page, "/accessibility", { theme: "morning-mist" });
  await page.getByRole("button", { name: "Preview Calm and simple" }).click();
  await expect(page.getByText(/Reduce motion: Off → On/)).toBeVisible();
  await expect(page.getByText(/Focused view: Off → On/)).toBeVisible();
  await page.getByRole("button", { name: "Apply Calm and simple" }).click();
  const root = () => page.evaluate(() => ({ ...document.documentElement.dataset }));
  expect(await root()).toMatchObject({ motion: "reduce", focused: "true", theme: "morning-mist" });

  await page.goto("/safety", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="tel:999"]').first()).toBeVisible();
  await expect(page.locator('a[href="/app/care"]').first()).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity).length)).toBe(0);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "{}"), KEY);
  expect(saved).toMatchObject({ language: "en", theme: "morning-mist", reducedMotion: true, focusedView: true });
});

test("Multimodal safety: an urgent reply is text-first, labelled in words, announced, and silent unless asked", async ({ page }) => {
  const channels = await watchChannels(page);
  await open(page, "/ask", { reducedMotion: true });
  await page.getByLabel(/Answer language/).selectOption("en");
  await page.locator("#barta-question").fill("My baby hasn't moved today");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  const chat = page.getByRole("region", { name: "Barta conversation" });
  await expect(chat.getByRole("alert").first()).toBeVisible();
  await expect(chat.getByText("Urgent", { exact: false }).first()).toBeVisible();
  await expect(chat.getByRole("link", { name: "Call 999 in Bangladesh" })).toHaveAttribute("href", "tel:999");
  await page.waitForTimeout(800);
  expect(await channels(), "no sound, speech or vibration without her action").toEqual({ vibrate: 0, play: 0, speak: 0 });
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
  // Nothing claims a call was made or help is on the way.
  await expect(chat).not.toContainText(/help is on the way|we have called|ambulance (?:is )?coming/i);
});

test("Bondhon: accommodations are optional requests, a closed list, and never a diagnosis field", () => {
  const base = { termsVersion: bondhonTermsVersion, expiresAt: "2026-11-21T00:00:00.000Z", allowReplies: false, language: "bn" as const };
  expect(coordinationTermsSchema.safeParse({ ...base, accommodations: [] }).success, "optional").toBe(true);
  expect(coordinationTermsSchema.safeParse({ ...base, accommodations: ["written", "interpreter"] }).success).toBe(true);
  expect(coordinationTermsSchema.safeParse({ ...base, accommodations: ["disability_type"] }).success, "closed list").toBe(false);
  expect(coordinationTermsSchema.safeParse({ ...base, accommodations: [], diagnosis: "x" }).success, "no diagnosis field").toBe(false);
  expect(coordinationTermsSchema.safeParse({ ...base, accommodations: ["written", "written"] }).success, "no repeats").toBe(false);
});

test("Switch/braille readiness: every focusable control on key routes has a name, and no drag-only control exists", async ({ page }) => {
  for (const path of ["/accessibility", "/ask", "/safety", "/poth", "/demo/jibonrekha/records", "/demo/bujhi", "/bondhon"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible();
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      const focusable = [...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex='-1'])")]
        .filter(el => el.offsetParent && !el.closest("nextjs-portal") && !(el as HTMLButtonElement).disabled);
      for (const el of focusable) {
        const labelled = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title")
          || (el as HTMLInputElement).labels?.length || (el.textContent ?? "").trim() || (el as HTMLInputElement).placeholder;
        if (!labelled && (el as HTMLInputElement).type !== "hidden") out.push(`unnamed ${el.tagName.toLowerCase()}`);
        if (el.getAttribute("draggable") === "true") out.push(`drag-only? ${el.tagName.toLowerCase()}`);
      }
      const clickDivs = [...document.querySelectorAll("div[onclick], span[onclick]")].length;
      if (clickDivs) out.push(`${clickDivs} click-only div/span`);
      return out;
    });
    expect(problems, path).toEqual([]);
  }
});
