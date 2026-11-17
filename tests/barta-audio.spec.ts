import { expect, test } from "@playwright/test";

test("dictation fills an editable draft and read aloud waits for an explicit action", async ({ page }) => {
  await page.addInitScript(() => {
    class UtteranceStub { constructor(public text: string) {} }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: UtteranceStub });
    const tracker = { read: "", spokenLocale: "", startedLocale: "" };
    Object.defineProperty(window, "bartaAudioTest", { value: tracker });
    class RecognitionStub {
      lang = "";
      onresult?: (event: { results: { transcript: string }[][] }) => void;
      onend?: () => void;
      start() { tracker.startedLocale = this.lang; }
      stop() {
        this.onresult?.({ results: [[{ transcript: "What does ANC mean?" }]] });
        this.onend?.();
      }
      abort() { this.onend?.(); }
    }
    Object.defineProperty(window, "SpeechRecognition", { value: RecognitionStub });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [{ localService: true, lang: "en-GB" }],
        cancel: () => {},
        speak: (utterance: SpeechSynthesisUtterance) => {
          tracker.read = utterance.text;
          tracker.spokenLocale = utterance.lang;
        },
      },
    });
  });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await expect(page.getByLabel("Speech language")).toHaveValue("auto");
  await expect(page.getByText(/Auto uses the current chat language/)).toBeVisible();
  await page.getByRole("button", { name: "Start microphone" }).press("Enter");
  await expect(page.getByRole("button", { name: "Ask Barta" })).toBeDisabled();
  await page.getByRole("button", { name: "Stop microphone" }).press("Enter");
  const question = page.getByRole("textbox", { name: "Your question" });
  await expect(question).toHaveValue("What does ANC mean?");
  await expect(question).toBeFocused();
  await expect(page.getByRole("button", { name: "Read aloud" })).toHaveCount(0);
  await page.getByRole("button", { name: "Ask Barta" }).click();

  const tracker = () => page.evaluate(() => (window as Window & {
    bartaAudioTest?: { read: string; spokenLocale: string; startedLocale: string };
  }).bartaAudioTest);
  const read = page.getByRole("button", { name: "Read aloud" });
  await expect(read).toBeVisible();
  expect(await tracker()).toMatchObject({ read: "", startedLocale: "en-GB" });
  await read.press("Enter");
  expect(await tracker()).toMatchObject({ read: expect.stringContaining("antenatal care"), spokenLocale: "en-GB" });
  await expect(page.getByRole("button", { name: "Stop reading" })).toBeVisible();
});

test("read aloud waits for an available Bengali voice and preserves the chat", async ({ page }) => {
  await page.addInitScript(() => {
    class UtteranceStub { constructor(public text: string) {} }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: UtteranceStub });
    const tracker = { read: "", rate: 0, lang: "" };
    Object.defineProperty(window, "bartaAudioTest", { value: tracker });
    const synthesis = new EventTarget();
    let voices: { localService: boolean; lang: string }[] = [];
    Object.assign(synthesis, {
      getVoices: () => voices,
      cancel: () => {},
      speak: (utterance: SpeechSynthesisUtterance) => {
        tracker.read = utterance.text;
        tracker.rate = utterance.rate;
        tracker.lang = utterance.lang;
      },
    });
    Object.defineProperty(window, "speechSynthesis", { value: synthesis });
    Object.defineProperty(window, "loadBartaTestVoice", { value: () => {
      voices = [{ localService: false, lang: "bn-BD" }];
      synthesis.dispatchEvent(new Event("voiceschanged"));
    } });
  });
  await page.goto("/ask");
  await page.getByRole("textbox", { name: "আপনার প্রশ্ন" }).fill("প্রহর, ভালোবাসি");
  await page.getByRole("button", { name: "বার্তাকে জিজ্ঞেস করুন" }).click();
  await page.getByRole("button", { name: "পড়ে শোনান" }).click();
  const tracker = await page.evaluate(() => {
    if (!("loadBartaTestVoice" in window) || typeof window.loadBartaTestVoice !== "function") {
      throw new Error("The Bengali voice test fixture did not load.");
    }
    window.loadBartaTestVoice();
    if (!("bartaAudioTest" in window)) {
      throw new Error("The audio tracker did not load.");
    }
    return window.bartaAudioTest;
  });
  expect(tracker).toMatchObject({ read: expect.stringContaining("ধন্যবাদ"), rate: 0.84, lang: "bn-BD" });
  await page.getByRole("button", { name: "পড়া বন্ধ করুন" }).click();
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await expect(page.getByText("প্রহর, ভালোবাসি")).toBeVisible();
});

test("a narrow composer exposes explicit Bangla dictation and keeps the draft when permission fails", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.addInitScript(() => {
    class RecognitionStub {
      lang = "";
      onerror?: (event: { error: string }) => void;
      start() {
        Object.defineProperty(window, "bartaMicLocale", { value: this.lang });
        this.onerror?.({ error: "not-allowed" });
      }
    }
    Object.defineProperty(window, "SpeechRecognition", { value: RecognitionStub });
  });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const draft = page.getByRole("textbox", { name: "Your question" });
  await draft.fill("An editable draft");
  await page.getByLabel("Speech language").selectOption("bn");
  const microphone = page.getByRole("button", { name: "Start microphone" });
  await microphone.press("Enter");
  await expect(page.getByText(/Microphone access is blocked/)).toBeVisible();
  await expect(draft).toHaveValue("An editable draft");
  expect(await page.evaluate(() => Reflect.get(window, "bartaMicLocale"))).toBe("bn-BD");
  expect(await microphone.evaluate((button) => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("generated audio waits for Play and keeps its keyboard control", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      value: function (this: HTMLMediaElement) {
        Reflect.set(window, "bartaPlayed", true);
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      },
    });
  });
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    json: { status: "conversation", answer: null, citations: [],
      message: "Hello from Barta.", audioText: "Hello from Barta.", audioTicket: "1234567890123." + "a".repeat(64) },
  }));
  await page.route("**/api/ai/barta-audio", (route) => route.fulfill({
    contentType: "audio/wav",
    body: Buffer.from("UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAAA", "base64"),
  }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("Hello");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  await page.getByRole("button", { name: "Read aloud" }).press("Enter");
  const play = page.getByRole("button", { name: "Play audio" });
  await expect(play).toBeFocused();
  expect(await page.evaluate(() => Reflect.get(window, "bartaPlayed"))).toBeUndefined();
  await play.press("Enter");
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
});

test("a temporary Barta error keeps a question editable for retry", async ({ page }) => {
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    status: 501, json: { status: "not_connected", answer: null, message: "Reviewed sources are not ready." },
  }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const draft = page.getByRole("textbox", { name: "Your question" });
  await draft.fill("What does ANC mean?");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  await expect(page.getByRole("region", { name: "Barta conversation" }).getByRole("alert")).toContainText("Reviewed sources are not ready.");
  await expect(draft).toHaveValue("What does ANC mean?");
  await expect(draft).toBeEditable();
});
