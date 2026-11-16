import { expect, test } from "@playwright/test";
import { safeAuthReturnPath } from "../../src/lib/routes";

test("auth return paths reject external, backslash, control and normalized double-slash redirects", () => {
  for (const value of [
    null, "https://external.invalid", "//external.invalid", "/\\external.invalid",
    "/\n/external.invalid", "/a/..//external.invalid", "/%2e%2e//external.invalid",
  ]) {
    const path = safeAuthReturnPath(value);
    expect(new URL(path, "https://prohor.example").origin, String(value)).toBe("https://prohor.example");
    expect(path).toBe("/");
  }
});

test("auth return paths preserve local queries and anchors", () => {
  expect(safeAuthReturnPath("/features?language=bn#barta")).toBe("/features?language=bn#barta");
  expect(safeAuthReturnPath("/features/../accessibility")).toBe("/accessibility");
});
