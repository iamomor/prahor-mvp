import { expect, test } from "@playwright/test";
import {
  starterCareRequestSchema,
  starterCareResponseSchema,
} from "../../src/lib/contracts/current-api";

const sentResponse = {
  message: "Not sent. Human-care delivery is not configured in this starter.",
  status: "not_sent",
} as const;

const invalidResponse = {
  message: "Check the request fields. No message was sent.",
  status: "not_sent",
} as const;

for (const method of ["text", "aac", "call"] as const) {
  test(`care-request starter accepts ${method} payload and truthfully reports not sent`, async ({ request }) => {
    const payload = starterCareRequestSchema.parse({
      message: "Synthetic care request",
      method,
    });

    const response = await request.post("/api/care-requests", { data: payload });
    expect(response.status()).toBe(501);

    const body: unknown = await response.json();
    expect(starterCareResponseSchema.safeParse(body).success).toBe(true);
    expect(body).toEqual(sentResponse);
  });
}

const invalidRequests: Array<{ name: string; payload: unknown }> = [
  { name: "empty message", payload: { message: "", method: "text" } },
  { name: "message over 1000 characters", payload: { message: "x".repeat(1001), method: "text" } },
  { name: "invalid method", payload: { message: "Synthetic care request", method: "email" } },
];

for (const { name, payload } of invalidRequests) {
  test(`care-request starter rejects ${name}`, async ({ request }) => {
    expect(starterCareRequestSchema.safeParse(payload).success).toBe(false);

    const response = await request.post("/api/care-requests", { data: payload });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual(invalidResponse);
  });
}
