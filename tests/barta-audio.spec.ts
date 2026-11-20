import { expect, test } from "@playwright/test";

test("dictation fills an editable draft and the speaker starts muted", async ({ page }) => {
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
        addEventListener: () => {}, removeEventListener: () => {},
        cancel: () => {},
        speak: (utterance: SpeechSynthesisUtterance) => {
          tracker.read = utterance.text;
          tracker.spokenLocale = utterance.lang;
        },
      },
    });
  });
  // This test targets browser speech. A configured audio service may otherwise take priority.
  const replyText = "ANC stands for antenatal care.";
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    json: { status: "conversation", answer: null, citations: [], message: replyText },
  }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await expect(page.getByLabel("Speech language")).toHaveValue("auto");
  await expect(page.getByText(/Auto uses the language of your draft/)).toBeVisible();
  await page.getByRole("button", { name: "Start microphone" }).press("Enter");
  await expect(page.getByRole("button", { name: "Ask Barta" })).toBeDisabled();
  await page.getByRole("button", { name: "Stop microphone" }).press("Enter");
  const question = page.getByRole("textbox", { name: "Your question" });
  await expect(question).toHaveValue("What does ANC mean?");
  await expect(question).toBeFocused();
  await expect(page.getByRole("switch", { name: "Speaker" })).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Ask Barta" }).click();

  await expect(page.getByText(replyText, { exact: true })).toBeVisible();
  const tracker = () => page.evaluate(() => (window as Window & {
    bartaAudioTest?: { read: string; spokenLocale: string; startedLocale: string };
  }).bartaAudioTest);
  const read = page.getByRole("switch", { name: "Speaker" }).last();
  await expect(read).toBeVisible();
  expect(await tracker()).toMatchObject({ read: "", startedLocale: "en-GB" });
  await read.press("Enter");
  await expect.poll(tracker).toMatchObject({ read: expect.stringContaining("antenatal care"), spokenLocale: "en-GB" });
  await expect(read).toHaveAttribute("aria-checked", "true");
});

test("browser speech waits for an available Bengali voice and preserves the chat", async ({ page }) => {
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
  const replyText = "আপনার সুন্দর কথার জন্য ধন্যবাদ।";
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    json: { status: "conversation", answer: null, citations: [], message: replyText },
  }));
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("bn");
  await page.getByRole("textbox", { name: "আপনার প্রশ্ন" }).fill("প্রহর, ভালোবাসি");
  await page.getByRole("button", { name: "বার্তাকে জিজ্ঞেস করুন" }).click();
  await expect(page.getByText(replyText, { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "স্পিকার" }).last().click();
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
  await page.getByRole("switch", { name: "স্পিকার" }).last().click();
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

test("blocked autoplay offers an explicit Play audio action", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      value: function (this: HTMLMediaElement) {
        if (!Reflect.get(window, "bartaTriedAutoplay")) {
          Reflect.set(window, "bartaTriedAutoplay", true);
          return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
        }
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
  await page.getByRole("switch", { name: "Speaker" }).last().press("Enter");
  const play = page.getByRole("button", { name: "Play audio" });
  await expect(play).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "bartaPlayed"))).toBeUndefined();
  await play.press("Enter");
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "bartaPlayed"))).toBe(true);
  await expect(play).toHaveCount(0);
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

test("opt-in speaks typed and AAC-drafted turns in order on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.addInitScript(() => {
    class UtteranceStub { constructor(public text: string) {} }
    const spoken: { text: string; lang: string }[] = [];
    Object.defineProperty(window, "bartaSpoken", { value: spoken });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: UtteranceStub });
    Object.defineProperty(window, "speechSynthesis", { value: Object.assign(new EventTarget(), {
      getVoices: () => [
        { default: true, localService: true, lang: "en-GB", name: "Test English", voiceURI: "test-en" },
        { default: false, localService: true, lang: "bn-BD", name: "Test Bangla", voiceURI: "test-bn" },
      ],
      cancel() {},
      speak(utterance: SpeechSynthesisUtterance) {
        spoken.push({ text: utterance.text, lang: utterance.lang });
        setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 50);
      },
    }) });
  });
  await page.route("**/api/ai/chat", (route) => {
    const data = route.request().postDataJSON();
    return route.fulfill({ json: data.language === "bn"
      ? { status: "clarification", answer: null, citations: [], message: "একটি বিষয় বেছে নিন।",
          suggestions: ["ANC বলতে কী বোঝায়?"] }
      : { status: "conversation", answer: null, citations: [], message: "Hello from Barta." } });
  });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  const speaker = page.getByRole("switch", { name: "Speaker" }).first();
  await speaker.press("Space");
  await expect(speaker).toHaveAttribute("aria-checked", "true");
  const events = () => page.evaluate(() => Reflect.get(window, "bartaSpoken"));
  expect(await events()).toEqual([]);

  const form = page.getByRole("region", { name: "Barta conversation" });
  await form.getByRole("textbox", { name: "Your question" }).fill("Hello");
  await form.getByRole("button", { name: "Ask Barta" }).press("Enter");
  await expect.poll(events).toEqual([
    { text: "Hello", lang: "en-GB" }, { text: "Hello from Barta.", lang: "en-GB" },
  ]);

  await page.getByLabel("Answer language").selectOption("bn");
  const banglaConversation = page.getByRole("region", { name: "বার্তার কথোপকথন" });
  await banglaConversation.getByRole("link", { name: "ছবি দিয়ে বলুন" }).press("Enter");

  const aac = page.locator("#barta-symbol-input");
  await aac.getByRole("button", { name: /^Pain \(ব্যথা\)/ }).press("Enter");
  const composedMessage = aac.getByRole("textbox", { name: /Your sentence/ });
  await expect(composedMessage).not.toHaveValue("");
  await composedMessage.fill("আমার একটি প্রশ্ন আছে।");
  await aac.getByRole("button", { name: "আমার প্রশ্নে যোগ করুন" }).click();

  await expect(banglaConversation.getByRole("textbox", { name: "আপনার প্রশ্ন" })).toHaveValue("আমার একটি প্রশ্ন আছে।");
  expect(await events()).toHaveLength(2);
  await banglaConversation.getByRole("button", { name: "বার্তাকে জিজ্ঞেস করুন" }).press("Enter");
  await expect.poll(events).toEqual([
    { text: "Hello", lang: "en-GB" }, { text: "Hello from Barta.", lang: "en-GB" },
    { text: "আমার একটি প্রশ্ন আছে.", lang: "bn-BD" },
    { text: expect.stringContaining("এ এন সি বলতে কী বোঝায়?"), lang: "bn-BD" },
  ]);
  await expect(page.getByText("একটি বিষয় বেছে নিন।")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("switching the speaker off cancels an in-flight reply audio request", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", { value() {
      Reflect.set(window, "bartaPlayed", true);
      return Promise.resolve();
    } });
  });
  await page.route("**/api/ai/chat", (route) => route.fulfill({
    json: { status: "conversation", answer: null, citations: [], message: "Hello from Barta.",
      audioText: "Hello from Barta.", audioTicket: "1234567890123." + "a".repeat(64) },
  }));
  let releaseAudio!: () => void;
  const pendingAudio = new Promise<void>((resolve) => { releaseAudio = resolve; });
  await page.route("**/api/ai/barta-audio", async (route) => {
    await pendingAudio;
    await route.fulfill({ contentType: "audio/wav", body: "synthetic audio" }).catch(() => {});
  });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("textbox", { name: "Your question" }).fill("Hello");
  await page.getByRole("button", { name: "Ask Barta" }).click();
  const answerSwitch = page.getByRole("switch", { name: "Speaker" }).last();
  await expect(page.getByText("Hello from Barta.")).toBeVisible();
  const request = page.waitForRequest("**/api/ai/barta-audio");
  const cancelled = page.waitForEvent("requestfailed", (event) => event.url().endsWith("/api/ai/barta-audio"));
  await answerSwitch.press("Enter");
  expect((await request).postDataJSON()).toMatchObject({ text: "Hello from Barta." });
  await answerSwitch.press("Enter");
  await cancelled;
  releaseAudio();
  await expect(answerSwitch).toHaveAttribute("aria-checked", "false");
  expect(await page.evaluate(() => Reflect.get(window, "bartaPlayed"))).toBeUndefined();
});

test("Barta language choices are independent and dictation highlights interim words before inserting finals", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.addInitScript(() => {
    localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ language: "bn", _schemaVersion: 3 }));
    type Segment = [{ transcript: string }] & { isFinal: boolean };
    class Recognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onend?: () => void;
      onresult?: (event: { results: Segment[] }) => void;
      start() { Reflect.set(window, "bartaTestRecognizer", this); }
      stop() { this.onend?.(); }
      abort() {}
    }
    Reflect.set(window, "SpeechRecognition", Recognition);
    Reflect.set(window, "bartaTestDictate", (parts: [string, boolean][]) => {
      const recognizer = Reflect.get(window, "bartaTestRecognizer") as Recognition;
      recognizer.onresult?.({ results: parts.map(([transcript, isFinal]) => Object.assign(
        [{ transcript }] as [{ transcript: string }], { isFinal },
      )) });
    });
  });
  let sent = 0;
  await page.route("**/api/ai/chat", (route) => {
    sent += 1;
    expect(route.request().postDataJSON().language).toBe("en");
    return route.fulfill({ json: { status: "conversation", answer: null, citations: [], message: "Hello from Barta." } });
  });
  await page.goto("/ask");
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  const answerLanguage = page.getByLabel(/Answer language|উত্তরের ভাষা/);
  await expect(answerLanguage).toHaveValue("auto");
  await answerLanguage.selectOption("en");
  const microphone = page.getByLabel("Speech language");
  await expect(microphone).toHaveValue("auto");
  await microphone.selectOption("bn");
  await expect(answerLanguage).toHaveValue("en");
  const question = page.getByRole("textbox", { name: "Your question" });
  await question.fill("Existing draft");
  await page.getByRole("button", { name: "Start microphone" }).press("Enter");
  const settings = await page.evaluate(() => {
    const { lang, continuous, interimResults } = Reflect.get(window, "bartaTestRecognizer");
    return { lang, continuous, interimResults };
  });
  expect(settings).toEqual({ lang: "bn-BD", continuous: true, interimResults: true });

  const preview = page.getByRole("region", { name: "Live transcript" });
  const speak = (parts: [string, boolean][]) => page.evaluate((items) => Reflect.get(window, "bartaTestDictate")(items), parts);
  await speak([["আমার", false]]);
  await expect(preview.locator("mark")).toHaveText("আমার");
  await expect(question).toHaveValue("Existing draft");
  await speak([["আমার প্রশ্ন", true], ["আছে", false]]);
  await expect(preview).toContainText("আমার প্রশ্ন");
  await expect(preview.locator("mark")).toHaveText("আছে");
  await speak([["আমার প্রশ্ন", true], ["আছে।", true], ["অস্থায়ী", false]]);
  await expect(preview.locator("mark")).toHaveText("অস্থায়ী");
  await page.getByRole("button", { name: "Stop microphone" }).press("Enter");
  await expect(preview).toHaveCount(0);
  await expect(question).toHaveValue("Existing draft\n\nআমার প্রশ্ন আছে।");
  await expect(question).toBeEditable();
  expect(sent).toBe(0);
  await page.getByRole("button", { name: "Ask Barta" }).press("Enter");
  await expect(page.getByText("Hello from Barta.", { exact: true })).toBeVisible();
});

test("Barta guide uses an installed voice directly and exposes the transcript", async ({ page }) => {
  await page.addInitScript(() => {
    class UtteranceStub { constructor(public text: string) {} }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: UtteranceStub });
    Object.defineProperty(window, "speechSynthesis", { value: {
      getVoices: () => [{ lang: "en-GB", localService: true }],
      speak(utterance: SpeechSynthesisUtterance) {
        Reflect.set(window, "bartaGuideSpeech", utterance.text);
        queueMicrotask(() => utterance.onstart?.(new Event("start") as SpeechSynthesisEvent));
      },
      cancel() {},
    } });
  });
  await page.goto("/ask");
  await page.getByLabel(/Answer language|উত্তরের ভাষা/).selectOption("en");
  await page.getByRole("button", { name: "Listen to the Barta guide" }).click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "bartaGuideSpeech"))).toContain("Welcome");
  await page.getByRole("button", { name: "Stop reading" }).click();
  await page.getByText("Read the guide transcript", { exact: true }).click();
  await expect(page.getByText(/Check the transcript before sending/)).toBeVisible();
});
