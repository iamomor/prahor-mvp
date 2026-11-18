import { expect, test, type Page } from "@playwright/test";
import { AAC_CATALOG, generateNaturalPhrase } from "../src/features/adapt/lib/aac-phrases";

const aacItems = AAC_CATALOG.flatMap((category) => category.items);
const aacItem = (id: string) => {
  const item = aacItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing AAC catalog item: ${id}`);
  return item;
};

test("all 24 AAC items generate their selected meaning in both languages", () => {
  expect(aacItems).toHaveLength(24);
  expect(generateNaturalPhrase([], "en")).toBe("");
  expect(generateNaturalPhrase([], "bn")).toBe("");

  for (const item of aacItems) {
    const english = generateNaturalPhrase([item], "en");
    const bengali = generateNaturalPhrase([item], "bn");
    expect(english, `${item.id} English`).not.toBe("");
    expect(bengali, `${item.id} Bengali`).not.toBe("");

    if (item.category === "body-areas") {
      expect(english, `${item.id} English`).toContain(item.enLocative?.replace(/^in /, "") ?? item.labelEn);
      expect(bengali, `${item.id} Bengali`).toContain(item.labelBn);
      expect(english, `${item.id} must not invent discomfort`).not.toContain("discomfort");
      expect(bengali, `${item.id} must not invent discomfort`).not.toContain("অস্বস্তি");
    } else {
      const englishExpected = item.enFragment?.endsWith(".") ? item.enFragment : `${item.enFragment}.`;
      const bengaliExpected = item.bnFragment?.endsWith("।") ? item.bnFragment : `${item.bnFragment}।`;
      expect(english, `${item.id} English`).toBe(englishExpected);
      expect(bengali, `${item.id} Bengali`).toBe(bengaliExpected);
    }
  }

  expect(generateNaturalPhrase([aacItem("pain"), aacItem("belly")], "en"))
    .toBe("I have pain in my abdomen.");
  expect(generateNaturalPhrase([aacItem("pain"), aacItem("belly")], "bn"))
    .toBe("আমার পেটে ব্যথা হচ্ছে।");
  expect(generateNaturalPhrase([aacItem("dizzy"), aacItem("nausea"), aacItem("head")], "en"))
    .toBe("I feel dizzy. I feel nauseous. I want to mention my head too.");
  expect(generateNaturalPhrase([aacItem("dizzy"), aacItem("nausea"), aacItem("head")], "bn"))
    .toBe("আমার মাথা ঘুরছে। আমার বমি বমি ভাব হচ্ছে। আমি মাথা নিয়েও বলতে চাই।");
  expect(generateNaturalPhrase([aacItem("doctor"), aacItem("water"), aacItem("question")], "en"))
    .toBe("I need to see a doctor or midwife. Please bring me some water. I have a question.");
  expect(generateNaturalPhrase([aacItem("doctor"), aacItem("water"), aacItem("question")], "bn"))
    .toBe("আমার একজন ডাক্তার বা ধাত্রীর সঙ্গে দেখা করা দরকার। আমাকে একটু পানি দিন। আমার একটি প্রশ্ন আছে।");
});

type MockVoice = { name: string; lang: string; voiceURI: string; default?: boolean };

async function installSpeechMock(
  page: Page,
  options: { voices?: MockVoice[]; unsupported?: boolean; language?: "bn" | "en" } = {},
) {
  await page.addInitScript(
    ({ initialVoices, unsupported, language }) => {
      if (language) {
        localStorage.setItem(
          "prohor-access-preferences-v1",
          JSON.stringify({ language, communication: "aac" }),
        );
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
        constructor(text: string) {
          this.text = text;
        }
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
          state.speaking = false;
          state.paused = false;
        },
        pause: () => {
          state.paused = true;
        },
        resume: () => {
          state.paused = false;
        },
        addEventListener: (_type: string, listener: () => void) =>
          state.listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) =>
          state.listeners.delete(listener),
        get speaking() {
          return state.speaking;
        },
        get paused() {
          return state.paused;
        },
      };

      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        value: MockSpeechSynthesisUtterance,
      });

      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        value: unsupported ? undefined : synthesis,
      });

      (window as unknown as { __speechMock: unknown }).__speechMock = {
        setVoices(voices: MockVoice[]) {
          state.voices = voices.map((voice) => ({ default: false, ...voice }));
          state.listeners.forEach((listener) => listener());
        },
        snapshot() {
          const utterance = state.current;
          return {
            speakCount: state.speakCount,
            cancelCount: state.cancelCount,
            utterance: utterance
              ? {
                  text: utterance.text,
                  lang: utterance.lang,
                  voiceURI: utterance.voice?.voiceURI,
                  rate: utterance.rate,
                }
              : undefined,
          };
        },
      };
    },
    {
      initialVoices: options.voices ?? [],
      unsupported: options.unsupported ?? false,
      language: options.language ?? "en",
    },
  );
}

async function openAacComposerOnAdapt(page: Page) {
  const aacSection = page.getByRole("region", {
    name: /AAC Phrase Builder|ছবি ও প্রতীক দিয়ে বার্তা তৈরি/i,
  });
  const accordionBtn = page.getByRole("button", {
    name: /Picture-and-text communication|ছবি ও পাঠ্য যোগাযোগ/i,
  });

  await expect(accordionBtn).toBeVisible();

  if (await aacSection.isVisible()) {
    return;
  }

  try {
    await expect(aacSection).toBeVisible({ timeout: 2000 });
    return;
  } catch {
    // Not yet visible after hydration; toggle accordion
  }

  const isExpanded = await accordionBtn.getAttribute("aria-expanded");
  if (isExpanded !== "true") {
    await accordionBtn.click();
  }

  const tryBtn = page.getByRole("button", {
    name: /Try the AAC composer here/i,
  });
  try {
    await tryBtn.waitFor({ state: "visible", timeout: 1500 });
    await tryBtn.click();
  } catch {
    // tryBtn may not be present if AAC is already enabled in preferences
  }

  await expect(aacSection).toBeVisible();
}

async function openAacComposerOnStarter(page: Page) {
  const aacComposer = page.getByRole("region", {
    name: /AAC Phrase Builder|ছবি ও প্রতীক দিয়ে বার্তা তৈরি/i,
  });
  const toggleAacBtn = page.getByRole("button", {
    name: /Use AAC Symbol Board|Hide AAC Symbol Board/i,
  });

  await expect(toggleAacBtn).toBeVisible();

  if (!(await aacComposer.isVisible())) {
    await toggleAacBtn.click();
  }

  await expect(aacComposer).toBeVisible();
}

test.describe("PROHOR Adapt — AAC Communication Experience", () => {
  test("allows selecting multiple items, shows selection indicators, and generates natural phrases", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);

    // AAC section is open when communication === "aac"
    const aacSection = page.getByRole("region", {
      name: /AAC Phrase Builder|ছবি ও প্রতীক দিয়ে বার্তা তৈরি/i,
    });
    await expect(aacSection).toBeVisible();

    // 1. Select Pain from Symptoms
    const grid = aacSection.getByRole("tabpanel");
    const painTile = grid.getByRole("button", {
      name: /Pain \(ব্যথা\)/i,
    });
    await expect(painTile).toHaveAttribute("aria-pressed", "false");
    await painTile.click();
    await expect(painTile).toHaveAttribute("aria-pressed", "true");

    // 2. Switch to Body areas tab and select Abdomen
    const bodyTab = aacSection.getByRole("tab", { name: /Body areas/i });
    await bodyTab.click();

    const abdomenTile = grid.getByRole("button", {
      name: /Abdomen \(পেট\)/i,
    });
    await abdomenTile.click();
    await expect(abdomenTile).toHaveAttribute("aria-pressed", "true");

    // 3. Switch to Requests tab and select Doctor
    const requestsTab = aacSection.getByRole("tab", { name: /Requests/i });
    await requestsTab.click();

    const doctorTile = grid.getByRole("button", {
      name: /See doctor \/ midwife/i,
    });
    await doctorTile.click();
    await expect(doctorTile).toHaveAttribute("aria-pressed", "true");

    // Verify 3 items are listed in the tray
    const itemsTray = aacSection.getByRole("list", {
      name: /Ordered list of selected symbols/i,
    });
    await expect(itemsTray.getByRole("listitem")).toHaveCount(3);

    // Verify natural English sentence is generated
    const previewTextarea = aacSection.getByRole("textbox", {
      name: /Composed message/i,
    });
    await expect(previewTextarea).toHaveValue(
      "I have pain in my abdomen. I need to see a doctor or midwife.",
    );

    // Switch output language to Bengali
    const bnToggle = aacSection.getByRole("button", { name: "বাংলা" });
    await bnToggle.click();
    await expect(previewTextarea).toHaveValue(
      "আমার পেটে ব্যথা হচ্ছে। আমার একজন ডাক্তার বা ধাত্রীর সঙ্গে দেখা করা দরকার।",
    );
  });

  test("supports removing, reordering items, undo, and clear with live announcements", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);
    const aacSection = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    // Select Headache and Dizziness
    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Headache/i }).click();
    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Dizziness/i }).click();

    const list = aacSection.getByRole("list", {
      name: /Ordered list of selected symbols/i,
    });
    await expect(list.getByRole("listitem")).toHaveCount(2);

    // Reorder: Move Dizziness earlier
    const moveEarlierBtn = aacSection.getByRole("button", {
      name: /Move Dizziness earlier/i,
    });
    await moveEarlierBtn.click();

    // Verify Dizziness is now first
    const firstItem = list.getByRole("listitem").first();
    await expect(firstItem).toContainText("Dizziness");

    // Remove Headache
    const removeHeadacheBtn = aacSection.getByRole("button", {
      name: /Remove Headache/i,
    });
    await removeHeadacheBtn.click();
    await expect(list.getByRole("listitem")).toHaveCount(1);

    // Undo removal
    const undoBtn = aacSection.getByRole("button", {
      name: /Undo last selection change/i,
    });
    await undoBtn.click();
    await expect(list.getByRole("listitem")).toHaveCount(2);

    // Clear all
    const clearBtn = aacSection.getByRole("button", {
      name: /Clear all selected items/i,
    });
    await clearBtn.click();
    await expect(list.getByRole("listitem")).toHaveCount(0);

    // Undo clear all
    await undoBtn.click();
    await expect(list.getByRole("listitem")).toHaveCount(2);
  });

  test("allows manual editing of the generated message with reset capability", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);
    const aacSection = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Fever/i }).click();
    const textarea = aacSection.getByRole("textbox", {
      name: /Composed message/i,
    });
    await expect(textarea).toHaveValue("I have a fever.");

    // User types additional words manually
    await textarea.fill("I have a fever since yesterday night.");
    await expect(textarea).toHaveValue("I have a fever since yesterday night.");

    // "Reset to tile phrasing" button appears
    const resetBtn = aacSection.getByRole("button", {
      name: /Reset to tile phrasing/i,
    });
    await expect(resetBtn).toBeVisible();

    await resetBtn.click();
    await expect(textarea).toHaveValue("I have a fever.");
    await expect(resetBtn).not.toBeVisible();
  });

  test("integrates with Barta question field: insertion, append preservation, and no auto-submit", async ({
    page,
  }) => {
    const apiRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/")) apiRequests.push(request.url());
    });
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
    });

    await page.goto("/ask", { waitUntil: "networkidle" });

    const questionInput = page.getByRole("textbox", { name: /Your question/i });
    await expect(questionInput).toBeVisible();

    // Type some initial text in the question input
    await questionInput.fill("I am 28 weeks pregnant. ");

    // Open/verify AAC Composer is available
    await openAacComposerOnStarter(page);
    const aacComposer = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    // Select Headache
    await aacComposer.getByRole("tabpanel").getByRole("button", { name: /Headache/i }).click();

    // Insert by keyboard to exercise the same path without a pointer.
    const insertBtn = aacComposer.getByRole("button", {
      name: /Insert into question/i,
    });
    await insertBtn.focus();
    await page.keyboard.press("Enter");

    // Check that question textarea preserved existing text and appended the phrase cleanly
    await expect(questionInput).toHaveValue(
      "I am 28 weeks pregnant. \n\nI have a headache.",
    );

    // Verify the question field is focused
    await expect(questionInput).toBeFocused();
    await expect(page.getByRole("status").filter({ hasText: /AAC message inserted into your question field/ })).toBeVisible();

    // Direct insertion is consumed by this form and must not leave a stale recovery draft.
    expect(await page.evaluate(() => sessionStorage.getItem("prohor-aac-draft-v1"))).toBeNull();

    // The inserted text remains a normal editable draft.
    await questionInput.fill("I am 28 weeks pregnant.");
    await expect(questionInput).toHaveValue("I am 28 weeks pregnant.");

    // Verify form was NOT submitted automatically (Ask button still says "Ask PROHOR", no checking state)
    await expect(
      page.getByRole("button", { name: "Ask PROHOR" }),
    ).toBeEnabled();
    expect(apiRequests).toEqual([]);
  });

  test("integrates with Bondhon care-request field: insertion and no auto-send", async ({
    page,
  }) => {
    const apiRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/")) apiRequests.push(request.url());
    });
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
    });

    await page.goto("/app/bondhon", { waitUntil: "networkidle" });

    const messageInput = page.getByRole("textbox", { name: /Your message/i });
    await messageInput.fill("I need support.");

    // Open AAC board in Care Request Starter
    await openAacComposerOnStarter(page);
    const aacComposer = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    // Select Water request
    const requestsTab = aacComposer.getByRole("tab", { name: /Requests/i });
    await requestsTab.click();
    await aacComposer.getByRole("tabpanel").getByRole("button", { name: /Need water/i }).click();

    // Click "Insert into care request"
    const insertBtn = aacComposer.getByRole("button", {
      name: /Insert into care request/i,
    });
    await insertBtn.click();

    // Check message textarea in CareRequestStarter
    await expect(messageInput).toHaveValue("I need support.\n\nPlease bring me some water.");
    await expect(messageInput).toBeFocused();
    expect(await page.evaluate(() => sessionStorage.getItem("prohor-aac-draft-v1"))).toBeNull();

    // Verify request was NOT automatically sent
    await expect(
      page.getByRole("button", { name: /Review request availability/i }),
    ).toBeEnabled();
    expect(apiRequests).toEqual([]);
  });

  test("recovers pending draft from Adapt page in Barta", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "prohor-access-preferences-v1",
        JSON.stringify({ language: "en", communication: "aac" }),
      );
      sessionStorage.setItem(
        "prohor-aac-draft-v1",
        "I have swelling in my legs or feet.",
      );
    });

    await page.goto("/ask", { waitUntil: "networkidle" });

    // Notice banner for pending draft should appear
    const draftNotice = page.getByRole("region", {
      name: /Pending AAC draft notice/i,
    });
    await expect(draftNotice).toBeVisible();
    await expect(draftNotice).toContainText(
      "I have swelling in my legs or feet.",
    );

    // Insert draft
    const questionInput = page.getByRole("textbox", { name: /Your question/i });
    await expect(questionInput).toHaveValue("");
    const insertDraftBtn = draftNotice.getByRole("button", {
      name: /Insert into question field/i,
    });
    await insertDraftBtn.click();

    await expect(questionInput).toHaveValue(
      "I have swelling in my legs or feet.",
    );
    await expect(draftNotice).not.toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("prohor-aac-draft-v1"))).toBeNull();
  });

  test("Read-Aloud integration plays phrase and respects speech voice availability", async ({
    page,
  }) => {
    await installSpeechMock(page, {
      voices: [
        { name: "English US", lang: "en-US", voiceURI: "voice-en" },
        { name: "Bangla BD", lang: "bn-BD", voiceURI: "voice-bn" },
      ],
      language: "en",
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);
    const aacSection = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    // Select Dizziness
    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Dizziness/i }).click();

    // Read Aloud button should be available
    let readAloudBtn = aacSection.getByRole("button", {
      name: /Listen aloud|Read aloud/i,
    });
    await expect(readAloudBtn).toBeVisible();
    await expect(readAloudBtn).toBeEnabled();

    expect(await page.evaluate(() => (window as unknown as { __speechMock: { snapshot: () => { speakCount: number } } }).__speechMock.snapshot().speakCount)).toBe(0);

    // Explicit English playback requests an English voice.
    await readAloudBtn.click();

    const snapshot = await page.evaluate(() =>
      (
        window as unknown as {
          __speechMock: {
            snapshot: () => {
              speakCount: number;
              utterance?: { text: string; lang: string; voiceURI?: string };
            };
          };
        }
      ).__speechMock.snapshot(),
    );

    expect(snapshot.speakCount).toBe(1);
    expect(snapshot.utterance?.text).toBe("I feel dizzy.");
    expect(snapshot.utterance?.lang).toBe("en-US");
    expect(snapshot.utterance?.voiceURI).toBe("voice-en");

    await aacSection.getByRole("button", { name: /Pause reading/ }).click();
    await expect(aacSection.getByRole("button", { name: /Resume reading/ })).toBeVisible();
    await aacSection.getByRole("button", { name: /Resume reading/ }).click();
    await aacSection.getByRole("button", { name: /Stop reading/ }).click();
    expect(await page.evaluate(() => (window as unknown as { __speechMock: { snapshot: () => { cancelCount: number } } }).__speechMock.snapshot().cancelCount)).toBe(1);

    await aacSection.getByRole("button", { name: "বাংলা" }).click();
    readAloudBtn = aacSection.getByRole("button", { name: "পড়ে শুনুন" });
    await readAloudBtn.click();
    const bengaliSnapshot = await page.evaluate(() =>
      (window as unknown as { __speechMock: { snapshot: () => { speakCount: number; utterance?: { text: string; lang: string; voiceURI?: string } } } }).__speechMock.snapshot(),
    );
    expect(bengaliSnapshot.speakCount).toBe(2);
    expect(bengaliSnapshot.utterance?.text).toBe("আমার মাথা ঘুরছে।");
    expect(bengaliSnapshot.utterance?.lang).toBe("bn-BD");
    expect(bengaliSnapshot.utterance?.voiceURI).toBe("voice-bn");

    // Closing the AAC section unmounts the button and cancels its owned utterance.
    await page.getByRole("button", { name: /Picture-and-text communication/i }).click();
    expect(await page.evaluate(() => (window as unknown as { __speechMock: { snapshot: () => { cancelCount: number } } }).__speechMock.snapshot().cancelCount)).toBe(2);
  });

  test("handles missing speech voices without crash and announces limitation", async ({
    page,
  }) => {
    // Install speech mock with NO voices
    await installSpeechMock(page, {
      voices: [],
      language: "en",
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);
    const aacSection = page.getByRole("region", {
      name: /AAC Phrase Builder/i,
    });

    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Pain/i }).click();

    // Read Aloud button should be disabled when voice is unavailable
    const readAloudBtn = aacSection.getByRole("button", {
      name: /Listen aloud|Read aloud/i,
    });
    await expect(readAloudBtn).toBeDisabled();

    // Status message displays limitation gracefully
    await expect(
      aacSection.getByRole("status").filter({ hasText: /unavailable/i }),
    ).toBeVisible();
  });

  test("AAC Bengali text does not fall back to an English-only device voice", async ({ page }) => {
    await installSpeechMock(page, {
      voices: [{ name: "English US", lang: "en-US", voiceURI: "voice-en" }],
      language: "bn",
    });

    await page.goto("/app/adapt", { waitUntil: "networkidle" });
    await openAacComposerOnAdapt(page);
    const aacSection = page.getByRole("region", { name: /AAC Phrase Builder/i });
    await aacSection.getByRole("tabpanel").getByRole("button", { name: /Dizziness/i }).click();
    await expect(aacSection.getByRole("button", { name: "পড়ে শুনুন" })).toBeDisabled();
    await expect(aacSection.getByRole("status").filter({ hasText: /মেলার মতো কণ্ঠ নেই/ })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __speechMock: { snapshot: () => { speakCount: number } } }).__speechMock.snapshot().speakCount)).toBe(0);
  });
});
