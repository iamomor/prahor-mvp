import "server-only";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export function bundledSpeechId(text: string, language: "bn" | "en") {
  return createHash("sha256").update(language + "\n" + text).digest("hex");
}

export async function readBundledSpeech(text: string, language: "bn" | "en", fishVoice?: string) {
  if (fishVoice && !/^[a-f0-9]{32}$/iu.test(fishVoice)) return undefined;
  const id = bundledSpeechId(text, language);
  try {
    const file = join(process.cwd(), "public", "barta-voice", id + (fishVoice ? `.fish-${fishVoice}.mp3` : ".mp3"));
    const info = await stat(file);
    if (!info.isFile() || info.size < 512 || info.size > 4_000_000) return undefined;
    const bytes = await readFile(file);
    if (bytes.length < 512 || bytes.length > 4_000_000) return undefined;
    return Uint8Array.from(bytes);
  } catch {
    return undefined;
  }
}
