import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const path = new URL("../../src/features/barta/chat-rate-limit.ts", import.meta.url);
const source = stripTypeScriptTypes(readFileSync(path, "utf8").replace('import "server-only";', ""));
const { getBartaChatRetryAfter } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

test("shared counters use an expiring atomic command and report the remaining wait", async (t) => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  process.env.BARTA_RATE_LIMIT_REDIS_URL = "https://redis.example.test";
  process.env.BARTA_RATE_LIMIT_REDIS_TOKEN = "fake-private-token";
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = "preview";
  const ip = "192.0.2.10";
  const forwarded = { "x-vercel-forwarded-for": ip, "x-forwarded-for": "203.0.113.99" };
  const request = new Request("https://barta.example.test", { headers: forwarded });
  const send = t.mock.method(globalThis, "fetch", async (_url, init) => {
    const [command, lua, numberOfKeys, key, window] = JSON.parse(init.body);
    assert.equal(command, "EVAL");
    assert.match(lua, /PEXPIRE/u);
    assert.equal(numberOfKeys, 1);
    assert.match(key, /^barta:chat:preview:[a-f0-9]{64}$/u);
    assert.ok(!key.includes(ip));
    assert.equal(window, 60_000);
    return Response.json({ result: [21, 7400] });
  });
  assert.equal(await getBartaChatRetryAfter(request), 8);
  assert.equal(send.mock.callCount(), 1);
  assert.equal(send.mock.calls[0].error, undefined);
});

test("local fallback stays bounded and resets when the window expires", async (t) => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  delete process.env.VERCEL;
  process.env.BARTA_RATE_LIMIT_REDIS_URL = "https://redis.example.test";
  process.env.BARTA_RATE_LIMIT_REDIS_TOKEN = "fake-private-token";
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }));
  const request = new Request("https://barta.example.test", { headers: { "x-forwarded-for": "192.0.2.11" } });
  for (let index = 0; index < 20; index++) assert.equal(await getBartaChatRetryAfter(request, 0), 0);
  assert.equal(await getBartaChatRetryAfter(request, 15_000), 45);
  assert.equal(await getBartaChatRetryAfter(request, 60_000), 0);
});
