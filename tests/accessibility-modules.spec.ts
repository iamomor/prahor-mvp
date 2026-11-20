import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * One representative PUBLIC route per module that can be reached without signing in.
 * Shusthota and the private Bondhon/Jibonrekha/Bujhi/Shonket-request workspaces sit behind server-side auth;
 * they are intentionally not faked here (see STEP 03 report).
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

const READING = { textSpacing: "relaxed" };
const VARIANTS = {
  default: { access: { language: "en" }, reading: {} },
  // Every presentation preference at once, at the narrowest supported width.
  "large-contrast-spacious-calm": {
    access: { language: "en", textScale: "extra-large", highContrast: true, layoutDensity: "spacious", reducedMotion: true, focusedView: true },
    reading: READING,
  },
  compact: { access: { language: "bn", layoutDensity: "compact", highContrast: false }, reading: {} },
} as const;

async function seed(page: Page, variant: (typeof VARIANTS)[keyof typeof VARIANTS]) {
  await page.addInitScript(({ access, reading }) => {
    localStorage.setItem("prohor-access-preferences-v1", JSON.stringify({ _schemaVersion: 4, ...access }));
    localStorage.setItem("prohor-home-reading-v1", JSON.stringify(reading));
  }, variant);
}

test.describe.configure({ timeout: 60_000 });

for (const [name, variant] of Object.entries(VARIANTS)) {
  for (const route of ROUTES) {
    test(`${route.module} ${route.path} [${name}] at 320px: no serious axe violations, no page-level sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await seed(page, variant);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1").first()).toBeVisible();

      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")}`),
        "axe serious/critical violations",
      ).toEqual([]);

      const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(overflow.scroll, "page-level horizontal scroll").toBeLessThanOrEqual(overflow.client + 1);
    });
  }
}
