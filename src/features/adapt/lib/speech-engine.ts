import { claimAudioSession, ownsAudioSession, releaseAudioSession } from "@/lib/audio-session";
export type SpeechLanguage = "bn" | "en";

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
export const claimSpeech = claimAudioSession;

export const ownsSpeech = ownsAudioSession;

export const releaseSpeech = releaseAudioSession;
