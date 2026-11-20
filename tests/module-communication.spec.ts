import { expect, test } from "@playwright/test";

test("public modules expose bilingual communication tools by keyboard", async ({ page }) => {
  for (const path of ["/accessibility", "/ask", "/safety", "/poth", "/bondhon", "/demo/bujhi", "/demo/jibonrekha"]) {
    await test.step(path, async () => {
      await page.goto(path);
      const panel = page.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ });
      const open = panel.getByRole("button", { name: /Open communication tools|যোগাযোগের সহায়ক টুল খুলুন/ });
      await expect(open).toBeEnabled();
      await open.press("Enter");
      await expect(open).toHaveAttribute("aria-expanded", "true");
      await expect(panel.getByRole("textbox", { name: /Editable text|সম্পাদনাযোগ্য লেখা/ })).toBeVisible();
      await panel.locator("summary").filter({ hasText: /Braille and screen readers|ব্রেইল ও স্ক্রিন রিডার/ }).press("Enter");
      await expect(panel.getByRole("region", { name: /English Braille practice|ইংরেজি ব্রেইল অনুশীলন/ })).toBeVisible();
      await panel.locator("summary").filter({ hasText: /Sign language and written communication|ইশারা ভাষা ও লিখিত যোগাযোগ/ }).press("Enter");
      await expect(panel.getByText("I use Bangla Sign Language. Please arrange an interpreter.")).toBeVisible();
    });
  }
});

test("communication tools dictate into a draft and read through an installed voice", async ({ page }) => {
  await page.addInitScript(() => {
    class Recognition {
      lang = "";
      onresult?: (event: unknown) => void;
      onend?: () => void;
      start() {
        Reflect.set(window, "moduleMicLocale", this.lang);
        this.onresult?.({ results: [Object.assign([{ transcript: "বাংলা খসড়া" }], { isFinal: true })] });
      }
      stop() { this.onend?.(); }
      abort() {}
    }
    Object.defineProperty(window, "SpeechRecognition", { value: Recognition });
    class Utterance { constructor(public text: string) {} }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance });
    Object.defineProperty(window, "speechSynthesis", { value: {
      getVoices: () => [{ lang: "bn-BD", localService: true }, { lang: "en-GB", localService: false }, { lang: "en-US", localService: true }],
      speak: (utterance: SpeechSynthesisUtterance) => Reflect.set(window, "moduleRead", { text: utterance.text, lang: utterance.lang }),
      cancel() {},
    } });
  });
  await page.goto("/poth");
  const panel = page.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ });
  const open = panel.getByRole("button", { name: /Open communication tools|যোগাযোগের সহায়ক টুল খুলুন/ });
  await expect(open).toBeEnabled();
  await open.press("Enter");
  await expect(open).toHaveAttribute("aria-expanded", "true");
  const language = panel.getByRole("combobox", { name: /Speech language|কথার ভাষা/ });
  await language.selectOption("bn");
  await panel.getByRole("button", { name: /Start microphone|মাইক্রোফোন চালু করুন/ }).press("Enter");
  await panel.getByRole("button", { name: /Stop microphone|মাইক্রোফোন বন্ধ করুন/ }).press("Enter");
  const draft = panel.getByRole("textbox", { name: /Editable text|সম্পাদনাযোগ্য লেখা/ });
  await expect(draft).toHaveValue("বাংলা খসড়া");
  expect(await page.evaluate(() => Reflect.get(window, "moduleMicLocale"))).toBe("bn-BD");
  await panel.getByRole("button", { name: /Read text aloud|লেখা পড়ে শোনান/ }).press("Enter");
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "moduleRead"))).toEqual({ text: "বাংলা খসড়া", lang: "bn-BD" });
  await language.selectOption("en");
  await draft.fill("English draft");
  await panel.getByRole("button", { name: /Read text aloud|লেখা পড়ে শোনান/ }).press("Enter");
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "moduleRead"))).toEqual({ text: "English draft", lang: "en-US" });
});

test("Braille shortcut opens module phrases and builds a draft on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/poth");
  const tools = page.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ });
  const shortcut = tools.getByRole("button", { name: /^(Braille input and reading|ব্রেইল লেখা ও পড়া)$/ });
  await expect(shortcut).toBeEnabled();
  await shortcut.press("Enter");
  await expect(shortcut).toHaveAttribute("aria-expanded", "true");
  const practice = tools.getByRole("region", { name: /English Braille practice|ইংরেজি ব্রেইল অনুশীলন/ });
  await expect(practice.getByText("find care", { exact: true }).last()).toBeVisible();
  const phrase = practice.getByRole("combobox", { name: /Choose a phrase|একটি বাক্য বাছাই করুন/ });
  await phrase.selectOption("1");
  await expect(practice.getByText("browse facilities", { exact: true }).last()).toBeVisible();
  await practice.getByRole("button", { name: /^(Dot|বিন্দু) 1$/ }).press("Enter");
  await practice.getByRole("button", { name: /^(Dot|বিন্দু) 2$/ }).press("Enter");
  await practice.getByRole("button", { name: /Add cell|ঘর যোগ করুন/ }).press("Enter");
  await expect(practice.getByRole("status")).toContainText(/\bb\b/);
  await practice.getByRole("button", { name: /Add English text to communication draft|যোগাযোগের খসড়ায় ইংরেজি লেখা যোগ করুন/ }).press("Enter");
  await expect(tools.getByRole("textbox", { name: /Editable text|সম্পাদনাযোগ্য লেখা/ })).toHaveValue("b");
  await expect(page).toHaveURL(/\/poth(?:[?#].*)?$/);
});

test("accessibility shortcuts and custom Braille reading work on a non-module page", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/about");
  const tools = page.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ });
  const shortcut = tools.getByRole("button", { name: /^(Braille input and reading|ব্রেইল লেখা ও পড়া)$/ });
  await expect(shortcut).toBeEnabled();
  await shortcut.press("Enter");
  await expect(shortcut).toHaveAttribute("aria-expanded", "true");

  const practice = tools.getByRole("region", { name: /English Braille practice|ইংরেজি ব্রেইল অনুশীলন/ });
  const readingExample = practice.getByRole("region", { name: /Read a module phrase|এই বিভাগের একটি বাক্য পড়ুন/ });
  const reader = readingExample.getByRole("textbox", { name: /Your own English text|আপনার নিজের ইংরেজি লেখা/ });
  await expect(reader).toBeVisible();
  await reader.fill("Visit 12.");
  await expect(readingExample.locator('span[lang="en"]')).toHaveText("Visit 12.");
  await expect(readingExample.locator("p[aria-hidden=true]").filter({ hasText: "⠼⠁⠃⠲" })).toBeVisible();
  await reader.fill("বাংলা");
  await expect(reader).toHaveAttribute("aria-invalid", "true");

  const sign = tools.getByRole("button", { name: /Sign and written support|ইশারা ও লিখিত সহায়তা/ });
  await expect(sign).toBeEnabled();
  await sign.press("Enter");
  await expect(sign).toHaveAttribute("aria-expanded", "true");
  await expect(tools.getByText("I use Bangla Sign Language. Please arrange an interpreter.")).toBeVisible();
  await expect(tools.getByRole("combobox", { name: /Read-aloud language|পড়ে শোনানোর ভাষা/ })).toHaveValue("auto");
});


test("Barta accessibility shortcuts stay inside the main page below navigation", async ({ page }) => {
  await page.goto("/ask");
  const main = page.locator("#barta-main");
  const tools = main.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ });
  await expect(tools).toBeVisible();
  await expect(page.getByRole("region", { name: /Communication and access|যোগাযোগ ও প্রবেশগম্যতা/ })).toHaveCount(1);
  await expect(page.getByText("Not sure where to start? Try one", { exact: true })).toHaveCount(0);
  await expect(main.getByRole("heading", { name: /Explore topics|বিষয় বেছে নিন/ })).toBeVisible();
});

test("tapping the backdrop closes scrolled Barta preferences and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 640 });
  await page.goto("/ask");
  const trigger = page.getByRole("button", { name: "Adjust how you use PROHOR" });
  await trigger.click();
  const settings = page.getByRole("dialog");
  await expect(settings).toBeVisible();
  await settings.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(settings.getByRole("button", { name: "Close settings" })).toBeInViewport();
  await page.mouse.click(3, 320);
  await expect(settings).toBeHidden();
  await expect(trigger).toBeFocused();
});
