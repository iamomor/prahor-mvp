import { z } from "zod";
import { getSpeechConfig, verifyAudioTicket } from "@/features/barta/audio-ticket";
import { getBartaSpokenGuide, maxSpeechText } from "@/features/barta/barta-spoken-text";
import { synthesizeLocalSpeech } from "@/features/barta/local-speech";
import { jsonNoStore } from "@/lib/api-response";

export const runtime = "nodejs";

const signedRequest = z.strictObject({
  text: z.string().min(1).max(maxSpeechText),
  language: z.enum(["bn", "en"]),
  ticket: z.string().length(78),
});
const guideRequest = z.strictObject({ language: z.enum(["bn", "en"]), help: z.literal(true) });
const requestSchema = z.union([signedRequest, guideRequest]);
const voices = {
  bn: { locale: "bn-BD", name: "bn-BD-NabanitaNeural" },
  en: { locale: "en-GB", name: "en-GB-SoniaNeural" },
};

const maxRequestsPerMinute = 12;
const maxAudioBytes = 2_000_000;
let windowStart = 0;
let requestCount = 0;

function escapeXml(text: string) {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
}

export async function POST(request: Request) {
  const config = getSpeechConfig();
  if (!config) return jsonNoStore({ message: "Generated audio is not configured." }, 503);
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > 12_000) return jsonNoStore({ message: "Invalid audio request." }, 400);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonNoStore({ message: "Invalid audio request." }, 400);
  }
  const parsed = requestSchema.safeParse(body);
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
  if (requestCount >= maxRequestsPerMinute) return jsonNoStore({ message: "Try audio again in a minute." }, 429);
  requestCount++;

  if (config.provider === "local") {
    try {
      const wav = await synthesizeLocalSpeech(config.executable, text, language, request.signal);
      return new Response(wav, { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
    } catch {
      return jsonNoStore({ message: "The local speech engine could not create audio." }, 502);
    }
  }

  const voice = voices[language];
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.locale}"><voice name="${voice.name}"><prosody rate="-10%">${escapeXml(text)}</prosody></voice></speak>`;
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
    const bytes = await result.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > maxAudioBytes) {
      return jsonNoStore({ message: "The speech service returned invalid audio." }, 502);
    }
    return new Response(bytes, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch {
    return jsonNoStore({ message: "The speech service could not load the audio." }, 502);
  }
}
