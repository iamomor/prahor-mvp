export type SpeechLanguage = "bn" | "en";

type SpeechOwner = {
  id: symbol;
  stop: () => void;
};

let activeSpeech: SpeechOwner | null = null;

function voiceLanguage(voice: SpeechSynthesisVoice): string {
  return voice.lang.trim().replaceAll("_", "-").split("-")[0]?.toLowerCase() ?? "";
}

export function voicesForLanguage(
  voices: readonly SpeechSynthesisVoice[],
  language: SpeechLanguage,
): SpeechSynthesisVoice[] {
  const tag = language === "bn" ? "bn" : "en";
  return voices.filter((voice) => voiceLanguage(voice) === tag);
}

export function preferredVoice(
  voices: readonly SpeechSynthesisVoice[],
  language: SpeechLanguage,
): SpeechSynthesisVoice | undefined {
  const candidates = voicesForLanguage(voices, language);
  const preferredTag = language === "bn" ? "bn-BD" : "en-US";
  return candidates.find((voice) => voice.lang.toLowerCase() === preferredTag.toLowerCase()) ?? candidates[0];
}

/** Coordinate only PROHOR-owned utterances; never cancel unrelated speech when idle. */
export function claimSpeech(owner: SpeechOwner): void {
  if (activeSpeech && activeSpeech.id !== owner.id) {
    const previous = activeSpeech;
    previous.stop();
  }
  activeSpeech = owner;
}

export function ownsSpeech(id: symbol): boolean {
  return activeSpeech?.id === id;
}

export function releaseSpeech(id: symbol): void {
  if (activeSpeech?.id === id) activeSpeech = null;
}
