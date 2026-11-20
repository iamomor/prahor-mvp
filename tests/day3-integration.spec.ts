import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DEFAULT_ACCESS_PREFERENCES, type AccessPreferences } from "../src/lib/contracts/adapt";

const idA = "10000000-0000-4000-8000-000000000001";
const idB = "10000000-0000-4000-8000-000000000002";
const requestId = "10000000-0000-4000-8000-000000000009";
async function accounts(page: Page) {
  let active: string | null = idA;
  let failure = false;
  let conflict = false;
  let revision = 1;
  const saved: Record<string, AccessPreferences> = { [idA]: { ...DEFAULT_ACCESS_PREFERENCES, readAloud: true }, [idB]: { ...DEFAULT_ACCESS_PREFERENCES } };
  const writes: { id: string; patch: object; etag?: string }[] = [];
  await page.route("**/api/me", route => route.fulfill({ status: active ? 200 : 401, json: active
    ? { data: { id: active, displayName: active === idA ? "Synthetic A" : "Synthetic B", role: "mother" }, requestId, contractVersion: "1" }
    : { error: { code: "unauthenticated", message: "Authentication required." }, requestId } }));
  await page.route("**/api/preferences", async route => {
    const request = route.request();
    if (!active || request.headers()["x-prohor-account"] !== active) {
      await route.fulfill({ status: 409, json: { error: { code: "conflict", message: "Account changed." }, requestId } }); return;
    }
    if (request.method() === "PATCH") {
      writes.push({ id: active, patch: request.postDataJSON(), etag: request.headers()["if-match"] });
      if (failure) { await route.abort(); return; }
      if (conflict) { conflict = false; revision++; saved[active].reducedMotion = true;
        await route.fulfill({ status: 409, json: { error: { code: "conflict", message: "Changed elsewhere." }, requestId } }); return; }
      saved[active] = { ...saved[active], ...request.postDataJSON() }; revision++;
    }
    const updatedAt = `2026-11-18T00:00:00.00000${revision}+00:00`;
    await route.fulfill({ headers: { etag: JSON.stringify(updatedAt) }, json: { data: saved[active], schemaVersion: 2, updatedAt, requestId, contractVersion: "1" } });
  });
  return { writes, saved, setActive(value: string | null) { active = value; }, fail(value: boolean) { failure = value; }, conflict() { conflict = true; } };
}

test("compact panel saves through server identity, preserves readAloud and survives refresh", async ({ page }) => {
  const f = await accounts(page); await page.goto("/ask");
  const trigger = page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true });
  await trigger.press("Enter"); const settings = page.getByRole("dialog").filter({ hasText: "Close settings" });
  await expect(settings.getByText("Active account: Synthetic A")).toBeVisible();
  await settings.getByLabel(/Text size/).selectOption("large");
  await settings.getByRole("button", { name: "Review account differences" }).press("Enter");
  const review = page.getByRole("dialog", { name: /Review account and device choices/ });
  await expect(review.getByRole("rowheader", { name: "Text size", exact: true })).toBeVisible();
  await review.getByRole("button", { name: /Save reviewed device choices/ }).press("Enter");
  await expect(review).not.toBeVisible(); expect(f.writes).toHaveLength(1);
  expect(f.writes[0]).toEqual({ id: idA, patch: { textScale: "large" }, etag: JSON.stringify("2026-11-18T00:00:00.000001+00:00") });
  expect(f.saved[idA].readAloud).toBe(true);
  await settings.getByRole("button", { name: "Close settings" }).click(); await expect(trigger).toBeFocused();
  await page.reload(); await trigger.click(); await expect(settings.getByLabel(/Text size/)).toHaveValue("large");
  await expect(settings.getByRole("button", { name: "Review account differences" })).toBeDisabled();
});

test("Cancel/Escape, repeated conflicts and failed saves preserve choices and report honestly", async ({ page }) => {
  const f = await accounts(page); await page.goto("/ask");
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).click();
  const settings = page.getByRole("dialog").filter({ hasText: "Close settings" });
  await expect(settings.getByText("Active account: Synthetic A")).toBeVisible();
  await settings.getByLabel(/Text size/).selectOption("extra-large");
  const open = settings.getByRole("button", { name: "Review account differences" });
  await open.click(); await page.keyboard.press("Escape"); await expect(open).toBeFocused(); expect(f.writes).toHaveLength(0);
  await open.click(); const review = page.getByRole("dialog", { name: /Review account and device choices/ });
  await review.getByRole("button", { name: /Cancel/ }).click(); expect(f.writes).toHaveLength(0);
  await open.click();
  for (let n = 1; n <= 2; n++) {
    f.conflict(); await review.getByRole("button", { name: /Save reviewed device choices/ }).click();
    await expect(review.getByRole("status")).toContainText("changed elsewhere"); expect(f.writes).toHaveLength(n);
    await expect(review.getByRole("button", { name: /Save reviewed device choices/ })).toBeEnabled();
  }
  f.fail(true); await review.getByRole("button", { name: /Save reviewed device choices/ }).click();
  await expect(review.getByRole("alert")).toContainText("not confirmed");
  await review.getByRole("button", { name: /Cancel/ }).click();
  await expect(settings.getByLabel(/Text size/)).toHaveValue("extra-large");
  expect(f.saved[idA].textScale).toBe("default");
});

test("sync-off then sign-out/sign-in restores anonymous choices for separate accounts", async ({ page }) => {
  const f = await accounts(page); f.saved[idA].language = "en";
  await page.goto("/ask"); await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).click();
  const settings = page.getByRole("dialog").filter({ hasText: "Close settings" });
  await settings.getByRole("button", { name: "Review account differences" }).click();
  await page.getByRole("dialog", { name: /Review account and device choices/ }).getByRole("button", { name: /Use account choices/ }).click();
  await settings.getByLabel(/Text size/).selectOption("large");
  await settings.getByRole("button", { name: "Review account differences" }).click();
  await page.getByRole("dialog", { name: /Review account and device choices/ }).getByRole("button", { name: /Save reviewed device choices/ }).click();
  await settings.getByRole("button", { name: "Turn off account sync on this device" }).click();
  f.setActive(null); await settings.getByRole("button", { name: "Reload account settings" }).click();
  await expect(settings.getByLabel(/Text size/)).toHaveValue("default");
  f.setActive(idB); await settings.getByRole("button", { name: "Reload account settings" }).click();
  await expect(settings.getByText("Active account: Synthetic B")).toBeVisible();
  await expect(settings.getByRole("button", { name: "Review account differences" })).toBeDisabled();
  expect(f.writes.every(write => write.id === idA)).toBe(true);
});

test("settings preserve Barta drafts, explicit standard contrast and keyboard focus", async ({ page }) => {
  const f = await accounts(page); f.setActive(null); await page.goto("/ask");
  await page.locator("#barta-question").fill("My unsent question");
  const trigger = page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }); await trigger.press("Enter");
  const settings = page.getByRole("dialog");
  await settings.locator('input[type="radio"][value="more"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "more");
  await settings.locator('input[type="radio"][value="standard"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "standard");
  await page.keyboard.press("Escape"); await expect(trigger).toBeFocused();
  await expect(page.locator("#barta-question")).toHaveValue("My unsent question");
});

test("denied browser storage keeps settings functional without React update loops", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("denied"); }; Storage.prototype.setItem = () => { throw new Error("denied"); }; });
  const f = await accounts(page); f.setActive(null); await page.goto("/ask");
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).click();
  await page.getByRole("dialog").getByLabel(/Text size/).selectOption("large");
  await expect(page.getByRole("dialog").getByLabel(/Text size/)).toHaveValue("large");
  await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");
  await expect(page.getByRole("dialog").getByText(/Browser storage is unavailable/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("AAC inserts once without sending; over-limit incoming text remains available", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ language: "en", _schemaVersion: 4 })));
  const f = await accounts(page); f.setActive(null); let sent = 0;
  page.on("request", request => { if (request.url().endsWith("/api/ai/chat")) sent++; });
  await page.goto("/ask"); await page.locator("#barta-question").fill("Existing question");
  await page.locator('button[aria-controls="barta-symbol-input"]').click();
  await expect(page.locator("#barta-symbol-input")).toBeFocused();
  const aac = page.getByRole("region", { name: /Say it with pictures/ });
  await aac.getByRole("tabpanel").getByRole("button", { name: /Pain/ }).click();
  const output = aac.locator("textarea"); await output.fill("Synthetic AAC message");
  await aac.getByRole("button", { name: /Add to my question/ }).click();
  await expect(page.locator("#barta-question")).toHaveValue("Existing question\n\nSynthetic AAC message"); expect(sent).toBe(0);
  await page.locator("#barta-question").fill("q".repeat(1198)); await output.fill("Preserved incoming text");
  await aac.getByRole("button", { name: /Add to my question/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Preserved incoming text" })).toContainText("characters too many");
  await expect(page.locator("#barta-question")).toHaveValue("q".repeat(1198)); expect(sent).toBe(0);
});

test("public record/report modules mount at 320px and settings preserve an unfinished entry", async ({ page }) => {
  const f = await accounts(page); f.setActive(null); await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/demo/jibonrekha"); await expect(page.getByText(/ডেমো তথ্য — এটি কাল্পনিক/)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "জীবনরেখা" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.goto("/demo/bujhi");
  await expect(page.getByRole("heading", { level: 1, name: "রিপোর্ট বুঝি" })).toBeVisible();
  await page.getByRole("button", { name: "নিজে লিখি" }).click();
  const editable = page.getByLabel(/Test or observation name \(required\)/).first(); await editable.fill("Synthetic unsaved entry");
  await page.getByRole("button", { name: "Adjust how you use PROHOR", exact: true }).first().press("Enter");
  await page.keyboard.press("Escape"); await expect(editable).toHaveValue("Synthetic unsaved entry");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});

test("AAC speech and Barta microphone/read-aloud stop the previous owner; dictation inserts once", async ({ page }) => {
  const f = await accounts(page); f.setActive(null);
  await page.addInitScript(() => {
    localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ language: "en", _schemaVersion: 3 }));
    const tracker = { cancelled: 0, aborted: 0, spoken: [] as string[] };
    Reflect.set(window, "day3Audio", tracker);
    class Utterance {
      onstart?: () => void; constructor(public text: string) {}
    }
    class Recognition {
      onresult?: (event: { results: { transcript: string }[][] }) => void;
      onend?: () => void;
      start() {}
      stop() { this.onresult?.({ results: [[{ transcript: "One dictated phrase" }]] }); this.onend?.(); }
      abort() { tracker.aborted++; this.onend?.(); }
    }
    const synthesis = new EventTarget();
    Object.assign(synthesis, { speaking: true, paused: false,
      getVoices: () => [{ lang: "en-GB", localService: true, name: "Synthetic", voiceURI: "synthetic" }],
      speak: (utterance: Utterance) => { tracker.spoken.push(utterance.text); utterance.onstart?.(); },
      cancel: () => { tracker.cancelled++; }, pause() {}, resume() {},
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance });
    Object.defineProperty(window, "SpeechRecognition", { value: Recognition });
    Object.defineProperty(window, "speechSynthesis", { value: synthesis });
  });
  await page.route("**/api/ai/chat", route => route.fulfill({ json: { status: "conversation", answer: null, citations: [], message: "Synthetic educational greeting." } }));
  await page.goto("/ask"); await page.getByLabel(/Answer language/).selectOption("en");
  const barta = page.getByRole("region", { name: "Barta conversation" });
  const input = page.locator("#barta-question"); await input.fill("Existing draft");
  await barta.getByRole("button", { name: "Start microphone" }).press("Enter");
  await barta.getByRole("button", { name: "Stop microphone" }).press("Enter");
  await expect(input).toHaveValue("Existing draft\n\nOne dictated phrase");
  await barta.getByRole("button", { name: "Ask Barta", exact: true }).click();
  await expect(barta.getByText("Synthetic educational greeting.")).toBeVisible();
  await page.locator('button[aria-controls="barta-symbol-input"]').click();
  await expect(page.locator("#barta-symbol-input")).toBeFocused();
  const aac = page.getByRole("region", { name: /Say it with pictures/ }); await aac.getByRole("tabpanel").getByRole("button", { name: /Pain/ }).click(); await aac.locator("textarea").fill("Synthetic AAC preview");
  await aac.getByRole("button", { name: "Listen aloud", exact: true }).click();
  await expect(aac.getByRole("button", { name: "Stop reading", exact: true })).toBeVisible();
  await barta.getByRole("button", { name: "Start microphone" }).click();
  await expect(aac.getByRole("button", { name: "Stop reading", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "day3Audio").cancelled)).toBe(1);
  await aac.getByRole("button", { name: "Listen aloud", exact: true }).click();
  await expect(barta.getByRole("button", { name: "Start microphone" })).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "day3Audio").aborted)).toBe(1);
  await barta.getByRole("switch", { name: "Speaker", exact: true }).last().click();
  await expect(aac.getByRole("button", { name: "Stop reading", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "day3Audio").cancelled)).toBe(2);
  await barta.getByRole("button", { name: "Clear conversation" }).click();
  expect(await page.evaluate(() => Reflect.get(window, "day3Audio").cancelled)).toBe(3);
});

test("Barta dictation inserts once and Adapt read-aloud stops microphone ownership", async ({ page }) => {
  const f = await accounts(page); f.setActive(null);
  await page.addInitScript(() => {
    localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 3, language: "en" }));
    const tracker = { aborted: 0, cancelled: 0, spoken: 0 };
    Reflect.set(window, "audioOwnershipTest", tracker);
    class Utterance { onstart?: () => void; constructor(public text: string) {} }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance });
    const speech = new EventTarget();
    Object.assign(speech, { getVoices: () => [{ lang: "en-GB", name: "Synthetic voice", voiceURI: "synthetic", localService: true }],
      cancel() { tracker.cancelled++; }, speak(utterance: Utterance) { tracker.spoken++; utterance.onstart?.(); }, resume() {}, pause() {} });
    Object.defineProperty(window, "speechSynthesis", { value: speech });
    class Recognition {
      onresult?: (event: { results: { transcript: string }[][] }) => void; onend?: () => void;
      start() {} stop() { this.onresult?.({ results: [[{ transcript: "Synthetic transcript" }]] }); this.onend?.(); }
      abort() { tracker.aborted++; this.onend?.(); }
    }
    Object.defineProperty(window, "SpeechRecognition", { value: Recognition });
  });
  await page.goto("/ask"); const question = page.locator("#barta-question"); await question.fill("Existing question");
  await page.getByRole("button", { name: "Start microphone", exact: true }).click();
  await page.getByRole("button", { name: "Stop microphone", exact: true }).click();
  await expect(question).toHaveValue("Existing question\n\nSynthetic transcript");
  await page.locator('button[aria-controls="barta-symbol-input"]').click();
  await expect(page.locator("#barta-symbol-input")).toBeFocused();
  const aac = page.getByRole("region", { name: /Say it with pictures/ }); await aac.getByRole("tabpanel").getByRole("button", { name: /Pain/ }).click(); await aac.locator("textarea").fill("Synthetic AAC preview");
  await page.getByRole("button", { name: "Start microphone", exact: true }).click();
  await aac.getByRole("button", { name: "Listen aloud", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start microphone", exact: true })).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "audioOwnershipTest"))).toMatchObject({ aborted: 1, spoken: 1 });
  await page.getByRole("button", { name: "Start microphone", exact: true }).click();
  expect(await page.evaluate(() => Reflect.get(window, "audioOwnershipTest"))).toMatchObject({ cancelled: 1 });
  await expect(question).toHaveValue("Existing question\n\nSynthetic transcript");
});
