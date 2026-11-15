import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("navigation reflows in both languages and all themes without crowded links", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  for (const locale of ["en", "bn"]) {
    if (locale === "bn") {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.getByRole("button", { name: "Read this homepage in Bangla", exact: true }).click();
    }
    for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const measurements = await page.locator(".clean-nav").evaluate(header => ({
        width: header.getBoundingClientRect().width,
        overflow: header.scrollWidth > header.clientWidth,
        targets: Array.from(header.querySelectorAll<HTMLElement>('.home-nav a,.home-nav button')).filter(element => element.getClientRects().length > 0).map(element => ({ label: element.getAttribute("aria-label") ?? element.textContent, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })),
      }));
      expect(measurements.width).toBe(width); expect(measurements.overflow, `${locale} at ${width}`).toBe(false);
      for (const target of measurements.targets) {
        expect(target.width, `${target.label} width at ${width} ${locale}`).toBeGreaterThanOrEqual(44);
        expect(target.height, `${target.label} height at ${width} ${locale}`).toBeGreaterThanOrEqual(44);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const theme of ["quiet-garden", "original-rose", "morning-mist"]) for (const contrast of ["normal", "more"]) {
      await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast });
      expect((await new AxeBuilder({ page }).include(".clean-nav").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations, `${locale} ${theme} ${contrast}`).toEqual([]);
    }
  }
});
