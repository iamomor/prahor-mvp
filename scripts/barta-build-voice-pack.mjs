import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bartaAsk, bartaBase, canonicalQuestions, conversations } from "./barta-check.mjs";

const espeak = process.env.BARTA_ESPEAK_PATH || "espeak-ng";
const ffmpeg = process.env.BARTA_FFMPEG_PATH || "ffmpeg";
const out = "public/barta-voice";

function run(executable, args, input) {
  const result = spawnSync(executable, args, { input, encoding: "utf8", windowsHide: true, timeout: 30_000 });
  if (result.error || result.status !== 0) throw new Error(`${executable}: ${result.error?.message || result.stderr || "failed"}`);
}

function spoken(text, language) {
  const abbreviations = language === "bn"
    ? { ANC: "এ এন সি", PNC: "পি এন সি", WHO: "বিশ্ব স্বাস্থ্য সংস্থা", DGHS: "স্বাস্থ্য অধিদপ্তর" }
    : { ANC: "A N C", PNC: "P N C", WHO: "W H O", DGHS: "D G H S" };
  return text.replace(/\b(?:ANC|PNC|WHO|DGHS)\b/gu, (value) => abbreviations[value])
    .replace(/[。।]/gu, ". ").replace(/([^.!?\s])\n+/gu, "$1.\n\n");
}

run(espeak, ["--version"]);
run(ffmpeg, ["-version"]);
await mkdir(out, { recursive: true });
const dir = await mkdtemp(join(tmpdir(), "barta-voice-"));
const wave = join(dir, "voice.wav");
let count = 0;
const errors = [];
async function encode(id, render) {
  const target = join(out, id + ".mp3");
  const existing = await stat(target).catch(() => undefined);
  if (existing?.size >= 512 && existing.size <= 4_000_000) return;
  await render();
  const pending = target + ".tmp";
  try {
    run(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", wave, "-af", "loudnorm=I=-17:TP=-1.5:LRA=7", "-ac", "1", "-ar", "24000", "-b:a", "48k", "-f", "mp3", pending]);
    await rename(pending, target);
    count++;
  } finally {
    await rm(pending, { force: true });
  }
}
try {
  const targets = [
    ...(await canonicalQuestions()).map((item) => ({ ...item, expected: "grounded" })),
    ...conversations.map(([question, language]) => ({ question, language, expected: "conversation" })),
  ];
  if (process.argv.includes("--materials")) {
    const fixtures = JSON.parse(await readFile("tests/fixtures/barta-material-audit.json", "utf8"));
    targets.push(...fixtures.map(({ question, style }) => ({
      question, language: style === "bangla" || style === "banglish" ? "bn" : "en",
    })));
  }
  console.log(`Preparing ${targets.length} Barta voice prompts and two guides.`);
  let completed = 0;
  for (const { question, language, expected } of targets) {
    completed++;
    if (completed === 1 || completed % 10 === 0) console.log(`Voice prompt ${completed}/${targets.length} (${count} new clips so far).`);
    try {
      const reply = await bartaAsk(question, language);
      if (expected && (reply.status !== expected || typeof reply.audioText !== "string" || !reply.audioText)) {
        throw new Error(`expected spoken ${expected}, got ${reply.status}`);
      }
      if (typeof reply.audioText !== "string" || !reply.audioText) continue;
      const id = createHash("sha256").update(language + "\n" + reply.audioText).digest("hex");
      await encode(id, () => run(espeak, ["-b", "1", "-v", language === "bn" ? "bn" : "en-gb", "-s", language === "bn" ? "132" : "148", "-g", "3", "-w", wave, "--stdin"], spoken(reply.audioText, language)));
    } catch (error) {
      errors.push(`${language} ${question} — ${error.message}`);
    }
  }
  for (const language of ["bn", "en"]) {
    try {
      const response = await fetch(bartaBase() + "/api/ai/barta-audio", {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(25_000),
        headers: { "Content-Type": "application/json", "X-Barta-Voice-Build": "1" }, body: JSON.stringify({ help: true, language }),
      });
      const id = response.headers.get("X-Barta-Audio-Id");
      if (!response.ok || !/^[a-f0-9]{64}$/u.test(id || "")) throw new Error(`guide returned HTTP ${response.status}; configure local eSpeak and the signing key`);
      if (response.headers.get("Content-Type") === "audio/mpeg") continue;
      await encode(id, async () => writeFile(wave, new Uint8Array(await response.arrayBuffer())));
    } catch (error) {
      errors.push(`${language} guide — ${error.message}`);
    }
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
console.log(`Created ${count} new audio clips in ${out}.`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
