export type SpeechLanguage = "en-US" | "bn-BD";
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean; processLocally?: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type Constructor = { new(): Recognition; available?: (options: { langs: string[]; processLocally: true }) => Promise<string> };
export type SpeechSession = { stop: () => void; cancel: () => void };
export type SpeechOptions = { signal?: AbortSignal; language: SpeechLanguage; allowRemote: boolean; onText: (text: string) => void; onError: (message: string) => void; onEnd: () => void };

/** Provider boundary. No Azure SDK, credentials, API endpoint, or saved recording. */
export async function transcribeSpeech(options: SpeechOptions): Promise<SpeechSession> {
  const browser = window as unknown as { SpeechRecognition?: Constructor; webkitSpeechRecognition?: Constructor };
  const Engine = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  if (!Engine) throw new Error("Speech recognition is unsupported in this browser. Type or paste your transcript instead.");
  const recognition = new Engine();
  let local = false;
  if (Engine.available && "processLocally" in recognition) {
    try { local = await Engine.available({ langs: [options.language], processLocally: true }) === "available"; } catch { local = false; }
  }
  if (options.signal?.aborted) throw new Error("Speech cancelled before microphone start.");
  if (!local && !options.allowRemote) throw new Error("An installed on-device language pack is unavailable. Type your transcript, or explicitly allow browser-managed external recognition.");
  // Edge's remote service is not enabled in this MVP to avoid Azure-backed processing.
  if (!local && /Edg\//.test(navigator.userAgent)) throw new Error("Remote speech in Microsoft Edge is not enabled here. Use on-device recognition or type the transcript.");
  if ("processLocally" in recognition) recognition.processLocally = local;
  recognition.lang = options.language; recognition.continuous = false; recognition.interimResults = false;
  recognition.onresult = (event) => options.onText(event.results[0]?.[0]?.transcript ?? "");
  recognition.onerror = (event) => options.onError(event.error === "not-allowed" ? "Microphone permission was denied. You can type the same information below." : `Speech could not complete (${event.error}). Retry or type your information.`);
  recognition.onend = options.onEnd;
  if (options.signal?.aborted) throw new Error("Speech cancelled before microphone start.");
  recognition.start();
  return { stop: () => recognition.stop(), cancel: () => { recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.abort(); } };
}

export type SpeechProvider = { transcribe: typeof transcribeSpeech };
export const browserSpeechProvider: SpeechProvider = { transcribe: transcribeSpeech };

