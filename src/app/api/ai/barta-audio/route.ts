import { getSpeechConfig, verifyAudioTicket } from "@/features/barta/audio-ticket";
import { getBartaSpokenGuide } from "@/features/barta/barta-spoken-text";
import { synthesizeLocalSpeech } from "@/features/barta/local-speech";
import { jsonNoStore } from "@/lib/api-response";
import { boundedJson } from "@/lib/auth/validation";
import { bartaAudioRequestSchema } from "@/lib/contracts/barta";
import { fishAudioMode, getBartaFishSpeech, getBartaFishVoice } from "@/features/barta/fish-speech";
import { bundledSpeechId, readBundledSpeech } from "@/features/barta/bundled-speech";
import { boundedResponseBytes } from "@/lib/bounded-response";

export const runtime = "nodejs";

const voices = {
  bn: { locale: "bn-BD", name: "bn-BD-NabanitaNeural" },
  en: { locale: "en-GB", name: "en-GB-SoniaNeural" },
};

const maxRequestsPerMinute = 12;
const maxAudioBytes = 4_000_000;
let windowStart = 0;
let requestCount = 0;

function escapeXml(text: string) {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}

export async function POST(request: Request) {
  const config = getSpeechConfig();
  if (!config) return jsonNoStore({ message: "Generated audio is not configured." }, 503);
  let body: unknown;
  try {
    body = await boundedJson(request, 16_000);
  } catch {
    return jsonNoStore({ message: "Invalid audio request." }, 400);
  }
  const parsed = bartaAudioRequestSchema.safeParse(body);
  if (!parsed.success) return jsonNoStore({ message: "Invalid audio request." }, 400);

  const { language } = parsed.data;
  const text = "help" in parsed.data ? getBartaSpokenGuide(language) : parsed.data.text;
  if ("ticket" in parsed.data && !verifyAudioTicket(config.key, parsed.data.ticket, text, language)) {
    return jsonNoStore({ message: "This audio request is not authorized." }, 403);
  }

  const now = Date.now();
  if (now - windowStart >= 60_000) {
    windowStart = now;
    requestCount = 0;
  }
  if (requestCount >= maxRequestsPerMinute) {
    const response = jsonNoStore({ message: "Try audio again in a minute." }, 429);
    response.headers.set("Retry-After", "60"); return response;
  }
  requestCount++;

  const id = bundledSpeechId(text, language);
  const mp3 = (bytes: Uint8Array<ArrayBuffer>, source: string) => new Response(bytes, { headers: {
    "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Barta-Audio-Id": id, "X-Barta-Audio-Source": source,
  } });
  const mode = fishAudioMode();
  const voice = mode ? getBartaFishVoice(language) : undefined;
  if (voice) {
    const bytes = await readBundledSpeech(text, language, voice);
    if (bytes) return mp3(bytes, "fish-bundled");
  }
  if (mode === "prefer") {
    const bytes = await getBartaFishSpeech(text, language);
    if (bytes) return mp3(bytes, "fish");
  }
  const bundled = await readBundledSpeech(text, language);
  if (bundled) return mp3(bundled, "bundled");
  if (mode === "fallback") {
    const bytes = await getBartaFishSpeech(text, language);
    if (bytes) return mp3(bytes, "fish");
  }
  if (config.provider === "bundled") return jsonNoStore({ message: "No hosted recording is available for this reply." }, 404);

  if (config.provider === "local") {
    try {
      const wav = await synthesizeLocalSpeech(config.executable, text, language, request.signal);
      if (wav.byteLength > maxAudioBytes) throw new Error("audio_too_large");
      return new Response(wav, { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
    } catch {
      return jsonNoStore({ message: "The local speech engine could not create audio." }, 502);
    }
  }

  const azureVoice = voices[language];
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${azureVoice.locale}"><voice name="${azureVoice.name}"><prosody rate="-10%">${escapeXml(text)}</prosody></voice></speak>`;
  try {
    const result = await fetch(`https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": config.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
        "User-Agent": "PROHOR-Barta",
      },
      body: ssml,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!result.ok) return jsonNoStore({ message: "The speech service could not load the audio." }, 502);
    const bytes = await boundedResponseBytes(result, maxAudioBytes);
    return new Response(bytes, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch {
    return jsonNoStore({ message: "The speech service could not load the audio." }, 502);
  }
}
