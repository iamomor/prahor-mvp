import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/poth");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#poth-reviewed-directory article")).toHaveCount(6);
});
test("six listings expand and collapse with keyboard and source details start closed", async ({ page }) => {
  const directory = page.locator("#poth-reviewed-directory");
  await expect(directory.locator("details").filter({ has: page.locator("summary", { hasText: "Sources & coverage" }) })).not.toHaveAttribute("open", "");
  await directory.getByRole("button", { name: "Show more facilities", exact: true }).press("Enter");
  await expect(directory.locator("article")).toHaveCount(20);
  await directory.getByRole("button", { name: "Show only six facilities", exact: true }).press("Enter");
  await expect(directory.locator("article")).toHaveCount(6);
  await expect(directory.getByRole("heading", { name: "Find a place" })).toBeFocused();
});
test("supplied maternal tags are discoverable without treating names as service verification", async ({ page }) => {
  const directory = page.locator("#poth-reviewed-directory");
  await directory.getByRole("button", { name: "Women’s / maternity care", exact: true }).click();
  await expect(directory.getByRole("status")).toContainText("25 matching listings");
  await expect(directory.locator("article")).toHaveCount(6);
  await expect(directory.locator("article").first()).toContainText("unverified");
});
test("city search works with coordinates closed and no automatic external map requests", async ({ page }) => {
  const tiles: string[] = [];
  page.on("request", request => { if (request.url().includes("tile.openstreetmap.org")) tiles.push(request.url()); });
  const nearby = page.locator("#poth-nearby-map");
  await expect(nearby.getByLabel("Latitude", { exact: true })).toBeHidden();
  await nearby.getByRole("button", { name: "Search this area", exact: true }).press("Enter");
  await expect(nearby.getByRole("status")).toContainText("map records within");
  await expect(nearby.locator("article")).toHaveCount(6);
  expect(tiles).toHaveLength(0);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: {
      getCurrentPosition: (_success: unknown, error: (value: unknown) => void) => error({ code: 1, message: "Permission denied in test" }),
    } });
  });
  await nearby.getByRole("button", { name: "Use my location", exact: true }).click();
  await expect(nearby.getByRole("status")).toContainText(/GPS denied|GPS unavailable/);
  await expect(nearby.getByLabel("Area", { exact: true })).toBeEnabled();
});
test("nearby request failure is honest and leaves the directory usable", async ({ page }) => {
  await page.route("**/api/poth/nearby?**", route => route.abort());
  const nearby = page.locator("#poth-nearby-map");
  await nearby.getByRole("button", { name: "Search this area", exact: true }).click();
  await expect(nearby.getByRole("status")).toContainText("could not load");
  await expect(nearby.getByRole("button", { name: "Search this area", exact: true })).toBeEnabled();
  await expect(page.locator("#poth-reviewed-directory article")).toHaveCount(6);
});
test("visit check marks save after reload without saving the selected facility", async ({ page }) => {
  await page.locator("#poth-reviewed-directory").getByRole("button", { name: "Prepare a visit", exact: true }).first().click();
  const plan = page.locator("#poth-visit-preparation");
  await expect(plan.getByRole("heading", { name: "Prepare a visit", exact: true })).toBeFocused();
  await plan.getByRole("checkbox").first().check();
  await plan.getByRole("button", { name: "Save in this tab", exact: true }).click();
  await page.reload();
  await expect(plan.getByRole("checkbox").first()).toBeChecked();
  await expect(plan.getByRole("button", { name: "Remove place", exact: true })).toHaveCount(0);
  await plan.getByRole("button", { name: "Clear", exact: true }).click();
  await page.reload();
  await expect(plan.getByRole("checkbox").first()).not.toBeChecked();
});
test("optional SOS input remains editable until explicit save", async ({ page }) => {
  const sos = page.locator("#poth-sos");
  await sos.locator("summary").filter({ hasText: "my emergency contact" }).click();
  const name = sos.getByLabel("Trusted contact name", { exact: true });
  await name.fill("Synthetic test contact");
  await expect(name).toBeVisible();
  await sos.getByLabel("Trusted contact telephone", { exact: true }).fill("01000000000");
  await sos.getByRole("button", { name: "Save on this device", exact: true }).click();
  await expect(sos.getByRole("status")).toContainText("saved on this device");
  await sos.getByRole("button", { name: "Edit SOS details", exact: true }).click();
  await expect(name).toHaveValue("Synthetic test contact");
  await sos.getByRole("button", { name: "Clear saved info", exact: true }).click();
  await expect(name).toBeVisible(); await expect(name).toHaveValue("");
});
test("task layout reflows at required widths and enlarged text", async ({ page }) => {
  for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
