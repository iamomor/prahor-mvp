import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function startScene(page: Page) {
  await page.locator(".hero-product-scene").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero-showcase")).toHaveAttribute("data-started", "true");
  await page.mouse.move(0, 0);
}
async function seekScene(page: Page, time: number) {
  await page.locator(".hero-showcase").evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime = time;
    }
  }, time);
}

test("hero copy, pill buttons and decorative sample semantics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".story-hero-description")).toHaveText("PROHOR is one connected place for mothers in Bangladesh: keep mother and baby records, get Bangla answers with sources, understand your reports, notice your well-being, find care and reach real people, in the way that works for you.");
  await expect(page.locator(".hero-capabilities li")).toHaveText(["Mother & baby records", "Bangla answers with sources", "Reports explained", "Well-being", "Human support"]);
  await expect(page.locator(".hero-no-account")).toHaveText("Explore without an account.");
  const scene = page.getByRole("img", { name: "Illustration of the PROHOR app with sample answers, records and sharing controls" });
  await expect(scene).toBeVisible();
  await expect(scene.locator(':scope > [aria-hidden="true"]')).toHaveCount(1);
  await expect(scene.locator("button,a,input,[tabindex]")).toHaveCount(0);
  for (const button of await page.locator(".story-hero .home-button").all()) {
    await expect(button).toHaveCSS("border-radius", "999px");
    await expect(button).toHaveCSS("height", "48px");
    await expect(button).toHaveCSS("font-weight", "600");
    await expect(button).toHaveCSS("padding-left", "24px");
  }
  const lines = await page.locator("h1").evaluate(element => element.clientHeight / parseFloat(getComputedStyle(element).lineHeight));
  expect(lines).toBeLessThan(3.1);
  await page.getByRole("link", { name: "Ask Barta", exact: true }).first().click();
  await expect(page).toHaveURL(/\/ask$/);
  await expect(page.getByRole("heading", { name: "Ask Barta", exact: true })).toBeVisible();
  await page.goto("/");
  await page.locator("main").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".story-hero .home-button").first()).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#how-it-works$/);
});

test("stagger, screen cycle and matching accent rings use one pausable CSS timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await startScene(page);
  await seekScene(page, 1000);
  await expect(page.locator(".hero-phone-entrance")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-records-position")).toHaveCSS("opacity", "0");
  await seekScene(page, 2500);
  for (const card of await page.locator(".hero-card-position").all()) await expect(card).toHaveCSS("opacity", "1");
  await seekScene(page, 5000);
  await expect(page.locator(".hero-screen-ask")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-accent-barta")).toHaveCSS("opacity", "1");
  await seekScene(page, 9500);
  await expect(page.locator(".hero-screen-health")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-accent-records")).toHaveCSS("opacity", "1");
  await seekScene(page, 14000);
  await expect(page.locator(".hero-screen-home")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-accent-adapt")).toHaveCSS("opacity", "1");
});

test("pause works with the keyboard, persists through preferences, and hover pauses", async ({ page }) => {
  await page.goto("/");
  await startScene(page);
  const pause = page.locator(".hero-motion-button");
  await pause.focus();
  await expect(pause).toHaveCSS("outline-style", "solid");
  await expect(page.locator(".hero-float-barta")).toHaveCSS("animation-play-state", "paused");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Resume animation" })).toHaveAttribute("aria-pressed", "true");
  await pause.evaluate(element => element.blur());
  await page.mouse.move(0, 0);
  await expect(page.locator(".hero-float-barta")).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => { document.documentElement.dataset.theme = "original-rose"; });
  await expect(page.locator(".hero-showcase")).toHaveAttribute("data-paused", "true");
  await pause.focus();
  await page.keyboard.press("Space");
  await pause.evaluate(element => element.blur());
  await expect(page.locator(".hero-float-barta")).toHaveCSS("animation-play-state", "running");
  await page.locator(".hero-product-scene").hover();
  await expect(page.locator(".hero-float-barta")).toHaveCSS("animation-play-state", "paused");
  await page.mouse.move(0, 0);
  await expect(page.locator(".hero-float-barta")).toHaveCSS("animation-play-state", "running");
});

test("OS and site reduced motion show all cards and a static Home screen", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const selectors = ".hero-entrance,.hero-float,.hero-screen,.hero-card-accent";
  const noAnimations = async () => expect(await page.locator(selectors).evaluateAll(elements => elements.every(element => getComputedStyle(element).animationName === "none"))).toBe(true);
  await noAnimations();
  await expect(page.locator(".hero-screen-home")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-screen-ask")).toHaveCSS("opacity", "0");
  await expect(page.locator(".hero-motion-button")).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => { document.documentElement.dataset.motion = "reduce"; });
  await noAnimations();
  for (const card of await page.locator(".hero-card-position").all()) await expect(card).toHaveCSS("opacity", "1");
  await page.locator(".story-hero .home-button").first().hover();
  await expect(page.locator(".story-hero .home-button").first()).toHaveCSS("transform", "none");
});

test("responsive scene and text reflow from 320px through desktop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 360, 390, 430, 640, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px reflow`).toBe(true);
    if (width < 640) {
      await expect(page.locator(".hero-consent-position")).toBeHidden();
      await expect(page.locator(".hero-adapt-position")).toBeHidden();
    }
    const layout = await page.locator(".hero-showcase").evaluate(element => {
      const phone = element.querySelector(".hero-product-phone")!.getBoundingClientRect();
      const button = element.querySelector("button")!.getBoundingClientRect();
      return { phoneBottom: phone.bottom, buttonTop: button.top };
    });
    expect(layout.phoneBottom).toBeLessThanOrEqual(layout.buttonTop);
  }
  await page.setViewportSize({ width: 320, height: 950 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; });
  expect(await page.locator(".story-hero").evaluate(element => element.scrollWidth <= innerWidth), "Hero at 200% text size").toBe(true);
  await page.getByRole("button", { name: "Switch homepage language to Bangla", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const time of [0, 1000, 1500, 2500]) {
    await seekScene(page, time);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Animated Bangla at 200%, ${time}ms`).toBe(true);
  }
});

test("hero axe and text contrast pass each theme with independent higher contrast", async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) {
    await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
    const report = await new AxeBuilder({ page }).include(".story-hero").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(report.violations, `${theme} ${contrast}`).toEqual([]);
  }
});
