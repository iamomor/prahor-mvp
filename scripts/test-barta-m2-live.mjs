import { readFile } from "node:fs/promises";

const base = process.argv[2];
if (!base) {
  console.error("Usage: node scripts/test-barta-m2-live.mjs <deployment-base-url>");
  process.exit(1);
}

const url = new URL("/api/ai/chat", base);
const cases = JSON.parse(await readFile(new URL("../tests/fixtures/barta-eval/m2-danger-signs.json", import.meta.url), "utf8"));
let failures = 0;

for (const { language, question, expected } of cases) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, question, retention: { mode: "ephemeral" } }),
      redirect: "error",
      signal: AbortSignal.timeout(25_000),
    });
    if (response.status !== 200) throw new Error("HTTP " + response.status);
    if (!response.headers.get("cache-control")?.includes("no-store")) throw new Error("Missing no-store");
    const body = await response.json();
    const actual = body.status === "abstained" ? body.reason : body.status;
    if (expected === "normal answer") {
      if (!["grounded", "clarification", "conversation", "insufficient_evidence"].includes(actual)) throw new Error("Got " + actual);
      if (actual === "grounded" && !body.citations?.length) throw new Error("Missing citations");
    } else {
      if (actual !== expected) throw new Error("Expected " + expected + ", got " + actual);
      if (body.answer !== null || !Array.isArray(body.citations) || body.citations.length) throw new Error("Safety reply contains an answer or citations");
    }
  } catch (error) {
    failures++;
    console.error(language + " | " + question + " | " + error.message);
    if (failures === 1 && /HTTP (?:401|403|404|429)|redirect/u.test(error.message)) break;
  }
}

if (failures) {
  console.error("M2 checks failed.");
  process.exitCode = 1;
} else {
  console.log("M2 checks passed: " + cases.length + "/" + cases.length);
}
