import "server-only";
import { createHash } from "node:crypto";
import { prepareSpeechText } from "./barta-spoken-text";

type Language = "bn" | "en";
type AudioBytes = Uint8Array<ArrayBuffer>;

const model = "fish-audio/s2.1-pro-free:free";
const defaultVoice = {
  bn: "119724370a4a4ad18e28bac07cfa7fa8",
  en: "9a9cf47702da476aa4629e2506d4a857",
};
const maxClipBytes = 4_000_000;
const maxCacheBytes = 12_000_000;
const timeoutMs = 12_000;
const cache = new Map<string, { bytes: AudioBytes; expires: number }>();
const pending = new Map<string, Promise<AudioBytes | undefined>>();
let cacheBytes = 0;
let backoffUntil = 0;

export function fishAudioMode(): "prefer" | "fallback" | undefined {
  const mode = process.env.BARTA_FISH_AUDIO?.trim();
  return mode === "prefer" || mode === "fallback" ? mode : undefined;
}

function putClip(id: string, bytes: AudioBytes) {
  while (cacheBytes + bytes.length > maxCacheBytes || cache.size >= 32) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cacheBytes -= cache.get(oldest)!.bytes.length;
    cache.delete(oldest);
  }
  cache.set(id, { bytes, expires: Date.now() + 30 * 60_000 });
  cacheBytes += bytes.length;
}

function backoff(response?: Response) {
  const value = response?.headers.get("retry-after");
  const wait = value ? (/^\d+$/u.test(value) ? Number(value) * 1000 : Date.parse(value) - Date.now()) : NaN;
  const standard = response && [401, 402, 403, 404].includes(response.status) ? 300_000 : 30_000;
  const delay = Number.isFinite(wait) && wait > 0 ? Math.min(600_000, Math.max(wait, standard)) : standard;
  backoffUntil = Math.max(backoffUntil, Date.now() + delay);
}

async function readMp3(response: Response): Promise<AudioBytes | undefined> {
  const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (type !== "audio/mpeg" && type !== "audio/mp3") return undefined;
  const size = Number(response.headers.get("content-length") ?? 0);
  if (size > maxClipBytes || !response.body) return undefined;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxClipBytes) {
        void reader.cancel().catch(() => {});
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (total < 128) return undefined;
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const id3 = bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51;
  const frame = bytes[0] === 255 && (bytes[1] & 224) === 224;
  return id3 || frame ? bytes : undefined;
}

async function synthesize(key: string, voice: string, input: string, language: Language): Promise<AudioBytes | undefined> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, voice, input, response_format: "mp3",
        instructions: language === "bn"
          ? "Speak clear Bangladeshi Bangla at a steady, conversational pace. Pause naturally between sentences. Read only the supplied text."
          : "Speak clearly at a steady conversational pace. Pause naturally between sentences. Read only the supplied text.",
      }),
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      // A 400 can be specific to a voice or an input. Let the next clip try.
      if (response.status !== 400) backoff(response);
      return undefined;
    }
    const bytes = await readMp3(response);
    if (!bytes) {
      if (!response.bodyUsed) void response.body?.cancel().catch(() => {});
      backoff();
    }
    return bytes;
  } catch {
    backoff();
    return undefined;
  }
}

export function getBartaFishVoice(language: Language) {
  const setting = language === "bn" ? process.env.BARTA_FISH_VOICE_BN : process.env.BARTA_FISH_VOICE_EN;
  const voice = setting?.trim() || defaultVoice[language];
  return /^[a-f0-9]{32}$/iu.test(voice) ? voice : undefined;
}

export async function getBartaFishSpeech(text: string, language: Language): Promise<AudioBytes | undefined> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key || !fishAudioMode()) return undefined;
  const voice = getBartaFishVoice(language);
  if (!voice) return undefined;

  const prepared = prepareSpeechText(text, language);
  const input = language === "bn" ? prepared.replace(/([\u0980-\u09ff])\.(?=\s|$)/gu, "$1।") : prepared;
  const id = createHash("sha256").update(JSON.stringify([model, voice, language, input])).digest("hex");
  const cached = cache.get(id);
  if (cached) {
    cache.delete(id);
    if (cached.expires > Date.now()) {
      cache.set(id, cached);
      return cached.bytes;
    }
    cacheBytes -= cached.bytes.length;
  }
  const existing = pending.get(id);
  if (existing) return existing;
  if (Date.now() < backoffUntil || pending.size >= 2) return undefined;

  const request = synthesize(key, voice, input, language).then((bytes) => {
    if (bytes) putClip(id, bytes);
    return bytes;
  }).finally(() => pending.delete(id));
  pending.set(id, request);
  return request;
}
