import "server-only";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export function bundledSpeechId(text: string, language: "bn" | "en") {
  return createHash("sha256").update(language + "\n" + text).digest("hex");
}

async function findBundledSpeech(text: string, language: "bn" | "en", fishVoice?: string) {
  if (fishVoice && !/^[a-f0-9]{32}$/iu.test(fishVoice)) return undefined;
  const id = bundledSpeechId(text, language);
  const name = id + (fishVoice ? `.fish-${fishVoice}.mp3` : ".mp3");
  const file = join(process.cwd(), "public", "barta-voice", name);
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size < 512 || info.size > 4_000_000) return undefined;
    return { file, name };
  } catch {
    return undefined;
  }
}

export async function getBundledSpeechUrl(text: string, language: "bn" | "en") {
  const clip = await findBundledSpeech(text, language);
  return clip && `/barta-voice/${clip.name}`;
}

export async function readBundledSpeech(text: string, language: "bn" | "en", fishVoice?: string) {
  const clip = await findBundledSpeech(text, language, fishVoice);
  if (!clip) return undefined;
  try {
    const bytes = await readFile(clip.file);
    if (bytes.length < 512 || bytes.length > 4_000_000) return undefined;
    return Uint8Array.from(bytes);
  } catch {
    return undefined;
  }
}
