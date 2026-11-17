import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { bartaAsk, canonicalQuestions } from "./barta-check.mjs";

const language = process.argv.includes("--bn") ? "bn" : "en";
const key = process.env.OPENROUTER_API_KEY?.trim();
const voiceVariable = language === "bn" ? "BARTA_FISH_VOICE_BN" : "BARTA_FISH_VOICE_EN";
const voice = process.env[voiceVariable]?.trim()
  || (language === "bn" ? "119724370a4a4ad18e28bac07cfa7fa8" : "9a9cf47702da476aa4629e2506d4a857");
const limit = process.argv.includes("--all") ? Infinity : 12;
const output = join("public", "barta-voice");

const selected = [
  "accessVisit", "accessCommunication", "anc", "breastfeeding", "nutrition", "newborn", "babySleep", "postnatal", "ancVisits", "firstCheckup",
  "babyBath", "solidFood", "babyCrying", "cordCare",
];
const order = new Map(selected.map((id, index) => [id, index]));
const instructions = language === "bn"
  ? "Speak clear Bangladeshi Bangla at a steady, conversational pace. Pause naturally between sentences. Read only the supplied text."
  : "Read in calm, clear conversational English. Pause briefly between sentences. Read only the supplied text.";

function speechInput(text) {
  const acronyms = language === "bn"
    ? { ANC: "এ এন সি", PNC: "পি এন সি", WHO: "বিশ্ব স্বাস্থ্য সংস্থা", DGHS: "স্বাস্থ্য অধিদপ্তর" }
    : { ANC: "A N C", PNC: "P N C", WHO: "W H O", DGHS: "D G H S" };
  return text.replace(/\b(?:ANC|PNC|WHO|DGHS)\b/gu, word => acronyms[word]);
}

async function run() {
  if (!key) throw new Error("Add OPENROUTER_API_KEY to .env.local.");
  if (!/^[a-f0-9]{32}$/iu.test(voice)) throw new Error("Invalid Fish voice ID.");
  const targets = (await canonicalQuestions()).filter(item => item.language === language)
    .sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
  const clips = [{ id: "greeting", question: language === "bn" ? "আসসালামু আলাইকুম" : "Hello", greeting: true }, ...targets];
  await mkdir(output, { recursive: true });
  let created = 0;
  const failures = [];
  const retried = new Set();
  for (const { question, id, greeting } of clips) {
    if (created >= limit) break;
    const reply = await bartaAsk(question, language);
    if (reply.status !== (greeting ? "conversation" : "grounded") || !reply.audioText) continue;
    const hash = createHash("sha256").update(language + "\n" + reply.audioText).digest("hex");
    const target = join(output, `${hash}.fish-${voice}.mp3`);
    if ((await stat(target).catch(() => undefined))?.size >= 512) continue;
    let response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(65_000),
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "fish-audio/s2.1-pro-free:free", voice, input: speechInput(reply.audioText), instructions, response_format: "mp3" }),
      });
      if (!response.ok) {
        void response.body?.cancel().catch(() => {});
        if ([400, 401, 402, 403, 404, 429].includes(response.status)) throw new Error(`Fish HTTP ${response.status}; stopped after ${created} clips. Existing clips are kept.`);
        failures.push(`${id}: HTTP ${response.status}`);
        continue;
      }
      const type = response.headers.get("content-type")?.split(";")[0]?.trim();
      if (!["audio/mpeg", "audio/mp3"].includes(type)) throw new Error(`Expected MP3 for ${id}, got ${type || "no content type"}.`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const mp3 = (bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51) || (bytes[0] === 255 && (bytes[1] & 224) === 224);
      if (!mp3 || bytes.length < 512 || bytes.length > 4_000_000) throw new Error(`Invalid MP3 for ${id}.`);
      const temporary = `${target}.${process.pid}.tmp`;
      try {
        await writeFile(temporary, bytes, { flag: "wx" });
        await rename(temporary, target);
      } finally {
        await rm(temporary, { force: true });
      }
      console.log(`Saved ${language}/${id} (${++created} new clips).`);
    } catch (error) {
      const transient = ["TimeoutError", "AbortError"].includes(error.name)
        || (error instanceof TypeError && /^(terminated|fetch failed)$/iu.test(error.message));
      if (transient) {
        if (!retried.has(id)) {
          retried.add(id);
          clips.push({ question, id, greeting });
          console.log(`Will retry ${language}/${id} after the other clips: ${error.message}`);
        } else {
          failures.push(`${language}/${id}: ${error.message}`);
        }
      } else {
        throw error;
      }
    }
  }
  console.log(`Created ${created} new Fish clips.`);
  if (failures.length) throw new Error(failures.join("\n"));
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
