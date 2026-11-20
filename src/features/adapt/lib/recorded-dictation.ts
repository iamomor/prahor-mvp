/**
 * Voice input that works in any browser that lets the page use the microphone
 * (the same access Discord or WhatsApp Web use). It does not depend on the
 * browser's built-in speech service, which Brave blocks and Firefox lacks.
 *
 * The microphone is captured with the Web Audio API and saved as 16 kHz mono
 * WAV, so every browser sends the same format. When the mother presses Stop the
 * audio is sent once to PROHOR's /api/ai/transcribe route. Nothing is stored.
 * The caller must show the consent notice before calling this.
 *
 * Errors carry a short code in brackets, e.g. "(server-busy)", so the UI can
 * explain them in Bangla or English.
 */
export type RecordedDictation = {
  language: "bn" | "en";
  onText: (text: string) => void;
  onError: (message: string) => void;
  /** Recording stopped and the audio is being turned into text. */
  onTranscribing: () => void;
  onEnd: () => void;
};

const maxSeconds = 180;
const targetRate = 16_000;

type AudioContextConstructor = typeof AudioContext;

function audioContextClass(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
  );
}

export function canRecordAudio() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    Boolean(audioContextClass())
  );
}

/** Brave ships Chrome's speech API but blocks Google's service behind it, so it always fails with "network". */
export function builtInSpeechIsBlocked() {
  return typeof navigator !== "undefined" && "brave" in navigator;
}

function downsample(input: Float32Array, fromRate: number) {
  if (fromRate === targetRate) return input;
  const ratio = fromRate / targetRate;
  const output = new Float32Array(Math.floor(input.length / ratio));
  for (let index = 0; index < output.length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(input.length, Math.floor((index + 1) * ratio));
    let sum = 0;
    for (let cursor = start; cursor < end; cursor += 1) sum += input[cursor];
    output[index] = sum / Math.max(1, end - start);
  }
  return output;
}

/**
 * Laptop and phone microphones often record speech very quietly, and quiet
 * audio makes the speech-to-text model guess or repeat words. Trim the silent
 * edges and raise the level so the loudest speech sits near full scale.
 */
export function prepareSpeech(samples: Float32Array) {
  const block = Math.round(targetRate * 0.02); // 20 ms blocks
  const levels: number[] = [];
  for (let start = 0; start < samples.length; start += block) {
    let sum = 0;
    const end = Math.min(samples.length, start + block);
    for (let index = start; index < end; index += 1) sum += samples[index] * samples[index];
    levels.push(Math.sqrt(sum / Math.max(1, end - start)));
  }
  const sorted = [...levels].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
  const loud = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const threshold = Math.max(noiseFloor * 2.5, loud * 0.12, 0.002);
  const first = levels.findIndex((level) => level > threshold);
  const last = levels.length - 1 - [...levels].reverse().findIndex((level) => level > threshold);
  if (first < 0) return { samples, speechSeconds: 0 };
  const margin = Math.round(targetRate * 0.3);
  const trimmed = samples.slice(Math.max(0, first * block - margin), Math.min(samples.length, (last + 1) * block + margin));
  let peak = 0;
  for (let index = 0; index < trimmed.length; index += 1) peak = Math.max(peak, Math.abs(trimmed[index]));
  const gain = peak > 0 ? Math.min(0.9 / peak, 30) : 1;
  for (let index = 0; index < trimmed.length; index += 1) trimmed[index] *= gain;
  return { samples: trimmed, speechSeconds: ((last - first + 1) * block) / targetRate };
}

function encodeWav(samples: Float32Array) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function startRecordedDictation(options: RecordedDictation) {
  const Context = audioContextClass();
  if (!Context || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Speech could not complete (audio-capture).");
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    throw new Error(
      name === "NotAllowedError" || name === "SecurityError"
        ? "Speech could not complete (not-allowed)."
        : "Speech could not complete (audio-capture).",
    );
  }

  // Use the device's own sample rate (Firefox refuses to mix rates) and downsample later.
  const context = new Context();
  await context.resume().catch(() => undefined);
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const rate = context.sampleRate;

  /*
   * Live segmenting: whenever the mother pauses after a few seconds of speech,
   * that part is sent in the background. Text appears while she is still
   * talking, and pressing Stop only leaves the last few words to convert.
   */
  let segment: Float32Array[] = [];
  let segmentSamples = 0;
  let segmentHasSpeech = false;
  let silentSamples = 0;
  let noiseFloor = 0.01;
  const pauseSamples = rate * 0.7;
  const minSegmentSamples = rate * 1.5;
  const maxSegmentSamples = rate * 20;

  type Result = { text?: string; error?: string };
  const results: (Result | undefined)[] = [];
  const requests: Promise<void>[] = [];
  let delivered = 0;
  let firstError: string | undefined;

  let cancelledSession = false;
  function deliver() {
    if (cancelledSession) return;
    while (delivered < results.length && results[delivered]) {
      const result = results[delivered]!;
      if (result.text) options.onText(result.text);
      else if (result.error && !firstError) firstError = result.error;
      delivered += 1;
    }
  }

  async function transcribe(index: number, samples: Float32Array) {
    try {
      const response = await fetch(`/api/ai/transcribe?lang=${options.language}`, {
        method: "POST",
        headers: { "Content-Type": "audio/wav" },
        body: encodeWav(samples),
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as { text?: string; code?: string };
      results[index] = response.ok
        ? { text: data.text?.trim() || undefined }
        : { error: data.code ?? "server-failed" };
    } catch {
      results[index] = { error: "server-unreachable" };
    }
    deliver();
  }

  function flushSegment() {
    const pieces = segment;
    const length = segmentSamples;
    const hadSpeech = segmentHasSpeech;
    segment = [];
    segmentSamples = 0;
    segmentHasSpeech = false;
    silentSamples = 0;
    if (!hadSpeech || length === 0) return;
    const merged = new Float32Array(length);
    let offset = 0;
    for (const piece of pieces) {
      merged.set(piece, offset);
      offset += piece.length;
    }
    const speech = prepareSpeech(downsample(merged, rate));
    if (speech.speechSeconds < 0.25) return;
    const index = results.length;
    results.push(undefined);
    requests.push(transcribe(index, speech.samples));
  }

  processor.onaudioprocess = (event) => {
    const channel = new Float32Array(event.inputBuffer.getChannelData(0));
    let sum = 0;
    for (let index = 0; index < channel.length; index += 1) sum += channel[index] * channel[index];
    const level = Math.sqrt(sum / channel.length);
    // Track the room's background level slowly, so a quiet microphone still counts as speech.
    noiseFloor = level < noiseFloor ? level : noiseFloor * 0.995 + level * 0.005;
    const speaking = level > Math.max(noiseFloor * 2.5, 0.0015);
    segment.push(channel);
    segmentSamples += channel.length;
    if (speaking) {
      segmentHasSpeech = true;
      silentSamples = 0;
    } else {
      silentSamples += channel.length;
    }
    const pausedAfterSpeech =
      segmentHasSpeech && silentSamples >= pauseSamples && segmentSamples >= minSegmentSamples;
    if (pausedAfterSpeech || segmentSamples >= maxSegmentSamples) flushSegment();
    // Drop long leading silence so a segment never starts with seconds of nothing.
    if (!segmentHasSpeech && segmentSamples > rate * 1.5) {
      const dropped = segment.shift();
      segmentSamples -= dropped?.length ?? 0;
    }
  };
  source.connect(processor);
  processor.connect(context.destination); // required for onaudioprocess in Chromium; the output stays silent

  let finished = false;
  const release = () => {
    window.clearTimeout(timer);
    processor.onaudioprocess = null;
    source.disconnect();
    processor.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    void context.close().catch(() => undefined);
  };

  async function finish(cancelled: boolean) {
    if (finished) return;
    finished = true;
    release();
    if (cancelled) {
      cancelledSession = true;
      options.onEnd();
      return;
    }
    flushSegment();
    if (requests.length === 0) {
      options.onError(`Speech could not complete (no-speech).`);
      options.onEnd();
      return;
    }
    if (delivered < results.length) options.onTranscribing();
    await Promise.all(requests);
    deliver();
    const heardText = results.some((result) => result?.text);
    if (!heardText) options.onError(`Speech could not complete (${firstError ?? "no-speech"}).`);
    else if (firstError) options.onError(`Speech could not complete (${firstError}).`);
    options.onEnd();
  }

  const timer = window.setTimeout(() => void finish(false), maxSeconds * 1000);
  return {
    stop: () => void finish(false),
    cancel: () => void finish(true),
  };
}
