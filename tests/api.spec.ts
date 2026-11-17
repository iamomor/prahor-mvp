import { expect, test } from "@playwright/test";

test("API validation and unavailable responses never permit caching", async ({ request }) => {
  for (const [url, data] of [
    ["/api/ai/chat", {}],
    ["/api/ai/chat", { question: "Synthetic integration question" }],
    ["/api/care-requests", {}],
    ["/api/care-requests", { message: "Synthetic integration check", method: "aac" }],
  ] as const) {
    const response = await request.post(url, { data });
    expect([400, 501]).toContain(response.status());
    expect(response.headers()["cache-control"], `${url} ${response.status()}`).toBe("no-store");
  }
  const health = await request.get("/api/health");
  expect([401, 503]).toContain(health.status());
  expect(health.headers()["cache-control"]).toBe("no-store");
});

test("starter APIs reject unknown fields instead of silently discarding them", async ({ request }) => {
  const answer = await request.post("/api/ai/chat", {
    data: { question: "Synthetic integration question", diaryText: "Synthetic forbidden context" },
  });
  expect(answer.status()).toBe(400);
  const care = await request.post("/api/care-requests", {
    data: { message: "Synthetic integration check", method: "text", status: "delivered" },
  });
  expect(care.status()).toBe(400);
});

test("malformed JSON keeps care explicitly not sent", async ({ request }) => {
  const response = await request.post("/api/care-requests", {
    headers: { "Content-Type": "application/json" }, data: "{",
  });
  expect(response.status()).toBe(400);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toMatchObject({ status: "not_sent" });
});

test("missing auth callback code fails closed or redirects to sign-in without caching", async ({ request }) => {
  const response = await request.get("/auth/callback", { maxRedirects: 0 });
  expect([307, 503]).toContain(response.status());
  expect(response.headers()["cache-control"].split(/,\s*/)).toContain("no-store");
  if (response.status() === 503) {
    expect(await response.json()).toEqual({ code: "unavailable" });
    expect(response.headers().location).toBeUndefined();
    return;
  }
  const location = new URL(response.headers().location);
  expect(location.pathname).toBe("/sign-in");
  expect(location.searchParams.get("error")).toBe("link-expired");
});
