import type { Language } from "./barta-education-copy";

export async function fetchBartaAudio({ text, language, ticket, clipUrl, help }: {
  text: string;
  language: Language;
  ticket?: string;
  clipUrl?: string;
  help?: boolean;
}, signal: AbortSignal) {
  const response = clipUrl ? await fetch(clipUrl, { signal }) : await fetch("/api/ai/barta-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(help ? { help: true, language } : { text, language, ticket }),
    signal,
  });
  if (!response.ok || !/^audio\/(?:wav|x-wav|wave|mpeg)(?:;|$)/iu.test(response.headers.get("content-type") ?? "")) {
    throw new Error("Audio unavailable");
  }
  return response.blob();
}
