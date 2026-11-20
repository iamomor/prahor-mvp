import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "voice_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  const body = payload as { text?: unknown; language?: unknown };
  if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 2500 || (body.language !== "en" && body.language !== "bn")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const language = body.language;
  const voiceId = language === "en" ? (process.env.CARTESIA_VOICE_ID_EN || "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4") : process.env.CARTESIA_VOICE_ID_BN;
  if (!voiceId) return NextResponse.json({ error: "voice_unavailable" }, { status: 422, headers: { "Cache-Control": "no-store" } });
  try {
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${apiKey}`, "Cartesia-Version": "2026-08-14", "Content-Type": "application/json" },
      body: JSON.stringify({ model_id: "sonic-3.6", transcript: body.text, voice: { mode: "id", id: voiceId }, output_format: { container: "wav", encoding: "pcm_s16le", sample_rate: 44100 } }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: response.status === 401 || response.status === 403 ? "voice_unavailable" : "provider_failed" }, { status: 502, headers: { "Cache-Control": "no-store" } });
    return new Response(await response.arrayBuffer(), { status: 200, headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "provider_failed" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
