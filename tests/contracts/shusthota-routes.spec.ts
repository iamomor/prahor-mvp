import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import nextConfig from "../../next.config";
import { authDestination, signInPath, workspaceRole } from "../../src/lib/auth/access";

test("Shusthota is canonical and wellbeing redirects only to it", async () => {
  const redirects = await nextConfig.redirects?.() ?? [];
  expect(redirects.some(rule => rule.source === "/app/shusthota")).toBe(false);

  const [canonicalPage, compatibilityPage] = await Promise.all([
    readFile("src/app/app/shusthota/page.tsx", "utf8"),
    readFile("src/app/app/wellbeing/page.tsx", "utf8"),
  ]);
  expect(canonicalPage).toContain("<ShusthotaOverview />");
  expect(compatibilityPage).toContain('redirect("/app/shusthota")');
  expect(compatibilityPage).not.toContain('redirect("/app/wellbeing")');
});

test("signed-out Shusthota visits retain their return path to sign-in", () => {
  expect(signInPath("/app/shusthota")).toBe("/sign-in?next=%2Fapp%2Fshusthota&status=session-required");
  expect(workspaceRole("/app/shusthota")).toBe("mother");
});

test("mother can return to Shusthota after authentication; providers are routed to their workspace", () => {
  expect(authDestination("/app/shusthota", "mother")).toBe("/app/shusthota");
  expect(authDestination("/app/shusthota", "provider")).toBe("/provider");
});

test("the parent workspace layout continues enforcing Mother authentication", async () => {
  const layout = await readFile("src/app/app/layout.tsx", "utf8");
  expect(layout).toContain('requireWorkspace("mother")');
});
