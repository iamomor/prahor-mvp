import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const base = new URL(process.env.PROHOR_PROFILE_URL ?? "http://127.0.0.1:3012");
if (!["localhost", "127.0.0.1"].includes(base.hostname)) throw new Error("Use a local review server.");
const label = process.argv[2] ?? "local";
if (!/^[a-z0-9-]+$/u.test(label)) throw new Error("Use a simple output label.");
const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * fraction))];
const report = { label, url: base.origin, measuredAt: new Date().toISOString(), api: {}, browser: {} };

for (const [name, question] of Object.entries({
  exact: "What does ANC mean?",
  typo: "What does antenatal caare mean?",
  unsupported: "How does a fictional astronomy telescope work?",
})) {
  const timings = [];
  const statuses = new Set();
  for (let index = 0; index < 25; index++) {
    const start = performance.now();
    const response = await fetch(new URL("/api/ai/chat", base), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, language: "en", retention: { mode: "ephemeral" } }),
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(`Unexpected ${response.status} in ${name}`);
    statuses.add(body.status);
    timings.push(performance.now() - start);
  }
  report.api[name] = { firstMs: timings[0], medianMs: percentile(timings.slice(1), 0.5), p95Ms: percentile(timings.slice(1), 0.95), statuses: [...statuses] };
}
console.log(JSON.stringify({ label, api: report.api }));

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(new URL("/ask", base).href);
  await page.locator("form select").nth(1).selectOption("en");
  report.browser.navigation = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const scripts = performance.getEntriesByType("resource").filter(entry => entry.name.includes("/_next/") && new URL(entry.name).pathname.endsWith(".js"));
    return { ttfbMs: navigation.responseStart, domContentLoadedMs: navigation.domContentLoadedEventEnd,
      nextJsBytes: scripts.reduce((sum, entry) => sum + entry.encodedBodySize, 0), scriptCount: scripts.length };
  });
  const client = await context.newCDPSession(page);
  await client.send("Performance.enable");
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const metrics = async () => Object.fromEntries((await client.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]));
  const text = "Synthetic paragraph for interaction profiling. ".repeat(20);
  await page.route("**/api/ai/chat", route => route.fulfill({ json: {
    status: "grounded", answer: text,
    citations: [{ sourceId: "bb3a7560-a49e-4d49-83bb-dd5897352eed", chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559",
      sourceVersion: "1", title: "Synthetic profiling source", publisher: "PROHOR tests", url: "https://example.invalid/profiling",
      locator: "Synthetic section", reviewedAt: "2026-11-16T00:00:00.000Z" }],
    claims: [{ text, chunkId: "3d9f44f9-a23e-4aaf-8a42-a60cf39a3559" }], limitations: ["Synthetic profiling response."],
  } }));
  const draft = page.locator("#barta-question");
  const submit = page.getByRole("button", { name: "Ask Barta", exact: true });
  for (let turn = 1; turn <= 40; turn++) {
    await draft.fill(`Synthetic question ${turn}`);
    await submit.click();
    await draft.waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("#barta-question").value === "");
    if (![1, 40].includes(turn)) continue;
    const samples = [];
    for (let sample = 0; sample < 3; sample++) {
      const before = await metrics();
      await draft.pressSequentially("Typing a synthetic follow up question for this performance check");
      const after = await metrics();
      samples.push({ scriptMs: (after.ScriptDuration - before.ScriptDuration) * 1000, taskMs: (after.TaskDuration - before.TaskDuration) * 1000 });
      await draft.fill("");
    }
    report.browser[`typingAt${turn}Turns`] = { cpuSlowdown: 4, samples,
      medianScriptMs: percentile(samples.map(sample => sample.scriptMs), 0.5), medianTaskMs: percentile(samples.map(sample => sample.taskMs), 0.5) };
    console.log(JSON.stringify({ label, turns: turn, timing: report.browser[`typingAt${turn}Turns`] }));
  }
} finally { await browser.close(); }

await mkdir("docs/qa/barta-performance", { recursive: true });
await writeFile(`docs/qa/barta-performance/${label}.json`, `${JSON.stringify(report, null, 2)}\n`);
