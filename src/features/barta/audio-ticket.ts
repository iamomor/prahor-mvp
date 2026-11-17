import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { maxSpeechText } from "./barta-spoken-text";
import type { BartaRequest } from "@/lib/contracts/barta";

type Language = BartaRequest["language"];
const ticketLifetime = 6 * 60 * 60 * 1000;

export function getSpeechConfig() {
  const executable = process.env.BARTA_ESPEAK_PATH?.trim();
  const signingKey = process.env.BARTA_AUDIO_SIGNING_KEY?.trim();
  if (executable && signingKey && signingKey.length >= 32) {
    return { provider: "local", executable, key: signingKey } as const;
  }

  const key = process.env.BARTA_AZURE_SPEECH_KEY?.trim();
  const region = process.env.BARTA_AZURE_SPEECH_REGION?.trim();
  return key && region && /^[a-z][a-z0-9-]{1,29}$/u.test(region) ? { provider: "azure", key, region } as const : signingKey && signingKey.length >= 32
    ? { provider: "bundled", key: signingKey } as const
    : undefined;
}

function sign(secret: string, text: string, language: Language, expires: number) {
  return createHmac("sha256", secret).update(JSON.stringify(["barta-audio-v1", expires, language, text])).digest("hex");
}

export function issueAudioTicket(text: string, language: Language, now = Date.now()) {
  const config = getSpeechConfig();
  if (!config || !text || text.length > maxSpeechText) return undefined;
  const expires = now + ticketLifetime;
  return `${expires}.${sign(config.key, text, language, expires)}`;
}

export function verifyAudioTicket(secret: string, ticket: string, text: string, language: Language, now = Date.now()) {
  const match = /^(\d{13})\.([a-f0-9]{64})$/u.exec(ticket);
  if (!match || !text || text.length > maxSpeechText) return false;
  const expires = Number(match[1]);
  if (expires < now || expires > now + ticketLifetime) return false;
  return timingSafeEqual(Buffer.from(match[2], "hex"), Buffer.from(sign(secret, text, language, expires), "hex"));
}
