import { expect, test } from "@playwright/test";
import {
  loadDiaryEntries,
  loadWellnessEntries,
  saveDiaryEntry,
  saveWellnessEntry,
  ShusthotaApiError,
  shusthotaErrorCopy,
} from "./api";

const id = "10000000-0000-4000-8000-000000000001";
const stamp = "2026-11-19T05:40:12.123Z";

function withFetch(handler: typeof fetch): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  return () => { globalThis.fetch = original; };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("wellness GET validates the snake_case registry response and uses same-origin no-store credentials", async () => {
  const captured: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const restore = withFetch(async (input, init) => {
    captured.push({ input, init });
    return jsonResponse({ entries: [{
      id, occurred_at: stamp, created_at: stamp, mood: "mixed", energy: "low",
      activity_note: "Synthetic activity note", rest_note: null,
    }] });
  });

  try {
    const entries = await loadWellnessEntries();
    expect(entries[0]).toMatchObject({ mood: "mixed", energy: "low", activity_note: "Synthetic activity note" });
    expect(captured).toHaveLength(1);
    expect(captured[0].input).toBe("/api/wellness");
    expect(captured[0].init).toMatchObject({ method: "GET", credentials: "same-origin", cache: "no-store" });
  } finally { restore(); }
});

test("wellness POST sends only its camelCase contract fields and validates the saved id", async () => {
  const captured: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const restore = withFetch(async (input, init) => {
    captured.push({ input, init });
    return jsonResponse({ saved: true, id }, 201);
  });

  try {
    const result = await saveWellnessEntry({ mood: "mixed" });
    expect(result).toEqual({ saved: true, id });
    expect(captured).toHaveLength(1);
    expect(captured[0].input).toBe("/api/wellness");
    expect(captured[0].init).toMatchObject({ method: "POST", credentials: "same-origin", cache: "no-store" });
    const body = JSON.parse(String(captured[0].init?.body)) as Record<string, unknown>;
    expect(body).toMatchObject({ mood: "mixed", energy: null, activityNote: null, restNote: null });
    expect(typeof body.occurredAt).toBe("string");
    expect(body).not.toHaveProperty("text");
  } finally { restore(); }
});

test("diary GET retains created_at, and diary POST uses the separate camelCase body", async () => {
  const restore = withFetch(async (input, init) => {
    if (input === "/api/diary" && init?.method === "GET") {
      return jsonResponse({ entries: [{ id, text: "Synthetic diary fixture", privacy: "owner_only", occurred_at: stamp, created_at: stamp }] });
    }
    return jsonResponse({ saved: true, id }, 201);
  });

  try {
    const entries = await loadDiaryEntries();
    expect(entries[0]).toMatchObject({ text: "Synthetic diary fixture", privacy: "owner_only", created_at: stamp });
    const saved = await saveDiaryEntry("Synthetic diary fixture", stamp);
    expect(saved).toEqual({ saved: true, id });
  } finally { restore(); }
});

test("malformed success responses are not treated as confirmed saves", async () => {
  const restore = withFetch(async () => jsonResponse({ saved: true }, 201));
  try {
    await expect(saveDiaryEntry("Synthetic diary fixture", stamp)).rejects.toMatchObject({
      name: "ShusthotaApiError", kind: "invalid-response", status: 201,
    });
  } finally { restore(); }
});

test("HTTP and network failures preserve status-aware, bilingual handling", async () => {
  for (const status of [400, 401, 403, 503]) {
    const restore = withFetch(async () => jsonResponse({ message: "Synthetic failure" }, status));
    try {
      await expect(loadWellnessEntries()).rejects.toMatchObject({
        name: "ShusthotaApiError", kind: "http", status, serverMessage: "Synthetic failure",
      });
    } finally { restore(); }
  }

  const restore = withFetch(async () => { throw new TypeError("Synthetic network failure"); });
  try {
    const error = await loadDiaryEntries().catch(cause => cause);
    expect(error).toBeInstanceOf(ShusthotaApiError);
    expect(shusthotaErrorCopy(error, "save").en).toContain("could not confirm");
    expect(shusthotaErrorCopy(error, "load").bn).toContain("সংযোগ");
  } finally { restore(); }
});
