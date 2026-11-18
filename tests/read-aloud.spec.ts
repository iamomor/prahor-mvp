import { expect, test, type Page } from "@playwright/test";
import { claimSpeech, ownsSpeech, releaseSpeech } from "../src/features/adapt/lib/speech-engine";

type MockVoice = { name: string; lang: string; voiceURI: string; default?: boolean };

declare global {
  interface Window {
    __speechMock?: {
      setVoices: (voices: MockVoice[]) => void;
      start: () => void;
      finish: () => void;
      fail: (error?: string) => void;
      snapshot: () => { speakCount: number; cancelCount: number; utterance?: { text: string; lang: string; voiceURI?: string; rate: number } };
    };
  }
}

async function installSpeechMock(
  page: Page,
  options: { voices?: MockVoice[]; unsupported?: boolean; language?: "bn" | "en" } = {},
) {
  await page.addInitScript(({ initialVoices, unsupported, language }) => {
    if (language) {
      localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ language }));
    }

    type MockUtterance = {
      text: string;
      lang: string;
      voice: MockVoice | null;
      rate: number;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: ((event: { error: string }) => void) | null;
    };
    const state = {
      voices: initialVoices.map((voice) => ({ default: false, ...voice })),
      listeners: new Set<() => void>(),
      current: null as MockUtterance | null,
      speaking: false,
      paused: false,
      speakCount: 0,
      cancelCount: 0,
    };
    class MockSpeechSynthesisUtterance implements MockUtterance {
      text: string;
      lang = "";
      voice: MockVoice | null = null;
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      constructor(text: string) { this.text = text; }
    }
    const synthesis = {
      getVoices: () => state.voices,
      speak: (utterance: MockUtterance) => {
        state.current = utterance;
        state.speaking = true;
        state.paused = false;
        state.speakCount += 1;
        queueMicrotask(() => utterance.onstart?.());
      },
      cancel: () => {
        state.cancelCount += 1;
        localStorage.setItem("__speechCancelCount", String(state.cancelCount));
        state.speaking = false;
        state.paused = false;
      },
      pause: () => { state.paused = true; },
      resume: () => { state.paused = false; },
      addEventListener: (_type: string, listener: () => void) => state.listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => state.listeners.delete(listener),
      get speaking() { return state.speaking; },
      get paused() { return state.paused; },
    };

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: unsupported ? undefined : synthesis,
    });
    window.__speechMock = {
      setVoices(voices) {
        state.voices = voices.map((voice) => ({ default: false, ...voice }));
        state.listeners.forEach((listener) => listener());
      },
      start() { state.current?.onstart?.(); },
      finish() {
        state.speaking = false;
        state.paused = false;
        state.current?.onend?.();
      },
      fail(error = "network") {
        state.speaking = false;
        state.paused = false;
        state.current?.onerror?.({ error });
      },
      snapshot() {
        const utterance = state.current;
        return {
          speakCount: state.speakCount,
          cancelCount: state.cancelCount,
          utterance: utterance ? {
            text: utterance.text,
            lang: utterance.lang,
            voiceURI: utterance.voice?.voiceURI,
            rate: utterance.rate,
          } : undefined,
        };
      },
    };
  }, {
    initialVoices: options.voices ?? [],
    unsupported: options.unsupported ?? false,
    language: options.language ?? "en",
  });
}

async function openAdaptReadAloud(page: Page) {
  await page.goto("/app/adapt", { waitUntil: "networkidle" });
  const sectionBtn = page.getByRole("button", { name: /Read-aloud|পড়ে শোনানো/i });
  await expect(sectionBtn).toBeVisible();
  await expect(async () => {
    const isExpanded = await sectionBtn.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await sectionBtn.click();
    }
    expect(await sectionBtn.getAttribute("aria-expanded")).toBe("true");
  }).toPass({ timeout: 5000 });
}

const bengaliVoice: MockVoice = { name: "Bangla Device Voice", lang: "bn-BD", voiceURI: "bn-bd" };
const englishVoice: MockVoice = { name: "English Device Voice", lang: "en-US", voiceURI: "en-us" };

test("unsupported speech synthesis keeps text available and announces the limitation", async ({ page }) => {
  await installSpeechMock(page, { unsupported: true });
  await openAdaptReadAloud(page);
  await expect(page.getByRole("status").filter({ hasText: "Speech synthesis is not supported" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read the text above" })).toBeDisabled();
});

test("empty initial voice list waits for delayed voiceschanged before enabling read", async ({ page }) => {
  await installSpeechMock(page);
  await openAdaptReadAloud(page);
  await expect(page.getByRole("status").filter({ hasText: "Loading available voices" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read the text above" })).toBeDisabled();
  await page.evaluate((voice) => window.__speechMock?.setVoices([voice]), englishVoice);
  await expect(page.getByRole("status").filter({ hasText: "Ready." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read the text above" })).toBeEnabled();
});

test("voice list changes recalculate matching-language availability", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice] });
  await openAdaptReadAloud(page);
  await expect(page.getByRole("status").filter({ hasText: "Ready." })).toBeVisible();
  await page.evaluate((voice) => window.__speechMock?.setVoices([voice]), bengaliVoice);
  await expect(page.getByRole("status").filter({ hasText: "A matching voice is unavailable" })).toBeVisible();
  await page.evaluate((voice) => window.__speechMock?.setVoices([voice]), englishVoice);
  await expect(page.getByRole("status").filter({ hasText: "Ready." })).toBeVisible();
});

test("the shared controller stops only the previous PROHOR utterance owner", () => {
  const first = Symbol("first test utterance");
  const second = Symbol("second test utterance");
  let firstStopped = 0;
  claimSpeech({ id: first, stop: () => { firstStopped += 1; releaseSpeech(first); } });
  expect(ownsSpeech(first)).toBe(true);
  claimSpeech({ id: second, stop: () => releaseSpeech(second) });
  expect(firstStopped).toBe(1);
  expect(ownsSpeech(first)).toBe(false);
  expect(ownsSpeech(second)).toBe(true);
  releaseSpeech(second);
});

test("Bangla voice is matched by BCP-47 tag and is used for the original text", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice, bengaliVoice], language: "bn" });
  await openAdaptReadAloud(page);
  await page.getByRole("button", { name: "Read the text above" }).click();
  await expect(page.getByRole("status").filter({ hasText: "পড়ে শোনানো হচ্ছে" })).toBeVisible();
  const utterance = await page.evaluate(() => window.__speechMock?.snapshot().utterance);
  expect(utterance?.lang).toBe("bn-BD");
  expect(utterance?.voiceURI).toBe("bn-bd");
  expect(utterance?.text).toContain("Your preferences are saved privately");
});

test("missing Bangla voice is announced and an English voice is never used as fallback", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice], language: "bn" });
  await openAdaptReadAloud(page);
  await expect(page.getByRole("status").filter({ hasText: "এই ব্রাউজার বা ডিভাইসে মেলার মতো কণ্ঠ নেই" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Read the text above" })).toBeDisabled();
  expect(await page.evaluate(() => window.__speechMock?.snapshot().speakCount)).toBe(0);
});

test("English content uses a matching English voice rather than an available Bangla voice", async ({ page }) => {
  await installSpeechMock(page, { voices: [bengaliVoice, englishVoice], language: "en" });
  await openAdaptReadAloud(page);
  await page.getByRole("button", { name: "Read the text above" }).click();
  const utterance = await page.evaluate(() => window.__speechMock?.snapshot().utterance);
  expect(utterance?.lang).toBe("en-US");
  expect(utterance?.voiceURI).toBe("en-us");
});

test("available voices can be selected and speech rate is applied", async ({ page }) => {
  await installSpeechMock(page, {
    voices: [
      bengaliVoice,
      { name: "Bangla India Voice", lang: "bn-IN", voiceURI: "bn-in" },
    ],
    language: "bn",
  });
  await openAdaptReadAloud(page);
  await page.getByLabel(/Speech voice|পড়ার কণ্ঠ/).selectOption("bn-in");
  const rate = page.getByLabel(/Speech rate|পড়ার গতি/);
  await rate.focus();
  await rate.press("ArrowRight");
  await page.getByRole("button", { name: "Read the text above" }).click();
  const utterance = await page.evaluate(() => window.__speechMock?.snapshot().utterance);
  expect(utterance?.voiceURI).toBe("bn-in");
  expect(utterance?.rate).toBe(1.25);
});

test("read, pause, resume, stop, and repeated read requests do not queue duplicates", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice] });
  await openAdaptReadAloud(page);
  await page.getByRole("button", { name: "Read the text above" }).click();
  await expect(page.getByRole("button", { name: "Pause reading" })).toBeVisible();
  await page.getByRole("button", { name: "Pause reading" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Paused." })).toBeVisible();
  await page.getByRole("button", { name: "Resume reading" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Playing aloud." })).toBeVisible();
  await page.getByRole("button", { name: "Stop reading" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Ready." })).toBeVisible();
  await page.getByRole("button", { name: "Read the text above" }).click();
  expect(await page.evaluate(() => window.__speechMock?.snapshot().speakCount)).toBe(2);
});

test("completion and speech errors are announced accessibly", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice] });
  await openAdaptReadAloud(page);
  await page.getByRole("button", { name: "Read the text above" }).click();
  await page.evaluate(() => window.__speechMock?.finish());
  await expect(page.getByRole("status").filter({ hasText: "Finished reading." })).toBeVisible();
  await page.getByRole("button", { name: "Read the text above" }).click();
  await page.evaluate(() => window.__speechMock?.fail("network"));
  await expect(page.getByRole("status").filter({ hasText: "Speech could not be played" })).toBeVisible();
});

test("Barta response read-aloud remains connected and route navigation stops owned speech", async ({ page }) => {
  await installSpeechMock(page, { voices: [englishVoice], language: "en" });
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    status: 501,
    contentType: "application/json",
    body: JSON.stringify({ message: "Synthetic Barta response", status: "not_connected" }),
  }));
  await page.goto("/ask", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: /Your question/ }).fill("Synthetic question for a UI test");
  await page.getByRole("button", { name: "Ask PROHOR" }).click();
  await expect(page.getByText("Synthetic Barta response")).toBeVisible();
  await page.getByRole("button", { name: "Read response aloud" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Playing aloud." })).toBeVisible();
  expect(await page.evaluate(() => window.__speechMock?.snapshot().speakCount)).toBe(1);
  await page.getByRole("link", { name: /Adjust how you use PROHOR/ }).click();
  await expect(page).toHaveURL(/\/app\/adapt$/);
  await expect.poll(() => page.evaluate(() => Number(localStorage.getItem("__speechCancelCount") ?? 0))).toBe(1);
});

test("marketing sample speech uses the shared engine and reports missing Bangla voice", async ({ page }) => {
  await installSpeechMock(page, { voices: [bengaliVoice] });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".care-read-button").click();
  await expect(page.locator(".care-speech-status")).toContainText("matching voice is unavailable");
  expect(await page.evaluate(() => window.__speechMock?.snapshot().speakCount)).toBe(0);
});
