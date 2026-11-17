import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { bartaAsk, canonicalQuestions } from "./barta-check.mjs";

const args = process.argv.slice(2);
const defaults = { en: "9a9cf47702da476aa4629e2506d4a857", bn: "119724370a4a4ad18e28bac07cfa7fa8" };
const voiceFor = language => process.env[`BARTA_FISH_VOICE_${language.toUpperCase()}`]?.trim() || defaults[language];

async function generate() {
  for (const language of ["bn", "en"]) {
    const options = args.includes("--batch") ? [] : ["--all"];
    if (language === "bn") options.push("--bn");
    console.log(`Rendering ${language.toUpperCase()} Fish audio.`);
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["scripts/barta-build-fish-pack.mjs", ...options], { stdio: "inherit" });
      child.once("error", reject);
      child.once("close", code => {
        if (code !== 0) {
          console.error(`Some ${language} clips are pending. Existing clips are kept.`);
          process.exitCode = 1;
        }
        resolve();
      });
    });
  }
}

async function report() {
  const missing = [];
  const unavailable = [];
  const covered = { en: 0, bn: 0 };
  const totals = { en: 0, bn: 0 };
  for (const { id, question, language } of await canonicalQuestions()) {
    totals[language]++;
    const reply = await bartaAsk(question, language);
    if (reply.status !== "grounded" || !reply.audioText || !reply.citations?.length) {
      unavailable.push(`${language}/${id}: ${reply.status || "missing reviewed reply"}`);
      continue;
    }
    const idHash = createHash("sha256").update(language + "\n" + reply.audioText).digest("hex");
    const clip = await stat(join("public", "barta-voice", `${idHash}.fish-${voiceFor(language)}.mp3`)).catch(() => undefined);
    if (clip?.isFile() && clip.size >= 512 && clip.size <= 4_000_000) covered[language]++;
    else missing.push(`${language}/${id}`);
  }
  for (const language of ["en", "bn"]) console.log(`${language}: ${covered[language]}/${totals[language]} catalog replies have saved Fish audio.`);
  if (missing.length) console.log("Missing clips:", missing.join(", "));
  if (unavailable.length) console.error("Reviewed reply checks:", unavailable.join(", "));
  const access = (await canonicalQuestions()).filter(item => item.id.startsWith("access"));
  if (access.length !== 24) throw new Error(`Expected 24 accessibility prompts, found ${access.length}.`);
  if (unavailable.length || missing.length) process.exitCode = 1;
}

async function smoke(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && (parsed.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname))) {
    throw new Error("Use an HTTPS deployment or a local HTTP URL.");
  }
  const origin = parsed.origin;
  const request = (path, data) => fetch(origin + path, {
    redirect: "error", signal: AbortSignal.timeout(30_000),
    ...(data && { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  });
  const page = await request("/ask");
  if (!page.ok || !(page.headers.get("content-type") || "").includes("text/html")) throw new Error(`Barta page failed with HTTP ${page.status}.`);
  await page.body?.cancel();
  console.log("Barta page loads.");
  const samples = (await canonicalQuestions()).filter(item => item.id === "accessVisit" || item.id === "accessCommunication");
  if (samples.length !== 4) throw new Error("The local checkout lacks the four release test prompts.");
  for (const { id, question, language } of samples) {
    const chat = await request("/api/ai/chat", { question, language });
    if (!chat.ok) throw new Error(`${language}/${id} chat HTTP ${chat.status}.`);
    const reply = await chat.json();
    if (reply.status !== "grounded" || !reply.citations?.length || !reply.audioText || !reply.audioTicket) {
      throw new Error(`${language}/${id} expected a cited, signed answer; got ${reply.status || "unknown"}.`);
    }
    const start = performance.now();
    const audio = await request("/api/ai/barta-audio", { language, text: reply.audioText, ticket: reply.audioTicket });
    const type = audio.headers.get("content-type") || "";
    if (!audio.ok || !type.startsWith("audio/")) throw new Error(`${language}/${id} audio HTTP ${audio.status}.`);
    const source = audio.headers.get("x-barta-audio-source") || "unlabeled";
    const audioBytes = (await audio.arrayBuffer()).byteLength;
    if (audioBytes < 512) throw new Error(`${language}/${id} returned incomplete audio.`);
    console.log(`${language}/${id}: ${source} in ${Math.round(performance.now() - start)} ms.`);
    if (source !== "fish-bundled") process.exitCode = 1;
  }
  if (process.exitCode) console.error("Playback succeeded, but at least one sample did not use its saved Fish clip.");
}

const url = args.find(arg => arg.startsWith("--url="))?.slice(6);
try {
  if (args.includes("--generate")) {
    try {
      await generate();
    } finally {
      await report();
    }
  } else if (url) {
    await smoke(url);
  } else {
    await report();
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
