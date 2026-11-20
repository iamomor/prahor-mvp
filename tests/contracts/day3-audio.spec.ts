import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createHmac, timingSafeEqual } from "node:crypto";
import ts from "typescript";
import { bartaAudioRequestSchema } from "../../src/lib/contracts/barta";
import { boundedJson } from "../../src/lib/auth/validation";
import { boundedResponseBytes } from "../../src/lib/bounded-response";
import { maxSpeechText } from "../../src/features/barta/barta-spoken-text";

// Execute the real server modules with only external services/configuration replaced.
function load(file: string, imports: Record<string, unknown>, environment: Record<string, string> = {}) {
  const exports: Record<string, (...args: never[]) => unknown> = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require: (name: string) => {
    if (name === "server-only") return {};
    if (!(name in imports)) throw new Error(`Unexpected dependency ${name}`);
    return imports[name];
  }, process: { env: environment }, Buffer, Response, Request, AbortSignal, Date, Uint8Array, fetch: async () => new Response(new Uint8Array(4_000_001)) });
  return exports;
}
const secret = "synthetic-day3-audio-signing-key-for-tests";
const ticketModule = load("src/features/barta/audio-ticket.ts", { "node:crypto": { createHmac, timingSafeEqual }, "./barta-spoken-text": { maxSpeechText } }, { BARTA_AUDIO_SIGNING_KEY: secret });
const issue = ticketModule.issueAudioTicket as unknown as (text: string, language: "en" | "bn", now?: number) => string;
const verify = ticketModule.verifyAudioTicket as unknown as (secret: string, ticket: string, text: string, language: string, now?: number) => boolean;
function fixture(options: { mode?: string; fish?: Uint8Array; bundled?: Uint8Array; provider?: string; local?: Uint8Array; unconfigured?: boolean } = {}) {
  const calls: string[] = [];
  const route = load("src/app/api/ai/barta-audio/route.ts", {
    "@/features/barta/audio-ticket": { getSpeechConfig: () => options.unconfigured ? undefined : ({ key: secret, provider: options.provider ?? "bundled", region: "synthetic" }), verifyAudioTicket: verify },
    "@/features/barta/barta-spoken-text": { getBartaSpokenGuide: () => "Synthetic guide" },
    "@/features/barta/local-speech": { synthesizeLocalSpeech: async () => options.local ?? new Uint8Array(128) },
    "@/lib/api-response": { jsonNoStore: (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } }) },
    "@/lib/auth/validation": { boundedJson }, "@/lib/contracts/barta": { bartaAudioRequestSchema },
    "@/features/barta/fish-speech": { fishAudioMode: () => options.mode, getBartaFishVoice: () => undefined,
      getBartaFishSpeech: async () => { calls.push("fish"); return options.fish; } },
    "@/features/barta/bundled-speech": { bundledSpeechId: () => "synthetic-id", readBundledSpeech: async () => { calls.push("bundled"); return options.bundled; } },
    "@/lib/bounded-response": { boundedResponseBytes },
  });
  const post = route.POST as unknown as (request: Request) => Promise<Response>;
  return { calls, send: (body: unknown) => post(new Request("http://localhost/api/ai/barta-audio", { method: "POST", body: JSON.stringify(body) })) };
}

test("signed audio tickets bind exact text, language and expiry", () => {
  const now = Date.now(), ticket = issue("Synthetic text", "en", now);
  expect(verify(secret, ticket, "Synthetic text", "en", now)).toBe(true);
  expect(verify(secret, ticket, "Changed text", "en", now)).toBe(false);
  expect(verify(secret, ticket, "Synthetic text", "bn", now)).toBe(false);
  expect(verify(secret, ticket, "Synthetic text", "en", now + 7 * 60 * 60_000)).toBe(false);
});
test("invalid language, oversized input and forged audio ticket never call a provider", async () => {
  const f = fixture();
  expect((await f.send({ help: true, language: "fr" })).status).toBe(400);
  expect((await f.send({ text: "x".repeat(17000), ticket: "a".repeat(78), language: "en" })).status).toBe(400);
  expect((await f.send({ text: "Synthetic", ticket: "a".repeat(78), language: "en" })).status).toBe(403);
  expect(f.calls).toEqual([]);
});
test("Fish failure falls back to bundled recordings; missing recording is an honest 404", async () => {
  const f = fixture({ mode: "prefer", bundled: new Uint8Array(512) });
  const response = await f.send({ help: true, language: "en" });
  expect(response.status).toBe(200); expect(f.calls).toEqual(["fish", "bundled"]);
  expect(response.headers.get("x-barta-audio-source")).toBe("bundled");
  expect((await fixture().send({ help: true, language: "bn" })).status).toBe(404);
});
test("throttling includes bundled clips and returns Retry-After", async () => {
  const f = fixture({ bundled: new Uint8Array(512) });
  for (let n = 0; n < 12; n++) expect((await f.send({ help: true, language: "en" })).status).toBe(200);
  const limited = await f.send({ help: true, language: "en" });
  expect(limited.status).toBe(429); expect(limited.headers.get("retry-after")).toBe("60"); expect(f.calls).toHaveLength(12);
});
test("oversized local and Azure audio responses fail without emitting bytes", async () => {
  for (const f of [fixture({ provider: "local", local: new Uint8Array(4_000_001) }), fixture({ provider: "azure" })]) {
    expect((await f.send({ help: true, language: "en" })).status).toBe(502);
  }
});


test("a public bundled guide plays with no speech keys while custom reply requests stay locked", async () => {
  const f = fixture({ unconfigured: true, bundled: new Uint8Array(512) });
  const guide = await f.send({ help: true, language: "en" });
  expect(guide.status).toBe(200);
  expect(guide.headers.get("x-barta-audio-source")).toBe("bundled");
  expect((await f.send({ language: "en", text: "Synthetic", ticket: "a".repeat(78) })).status).toBe(503);
  expect(f.calls).toEqual(["bundled"]);
});
