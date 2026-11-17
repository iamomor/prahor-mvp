import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { educationCopy, type Language } from "./barta-education-copy";
import styles from "./barta-education.module.css";

export function BartaAudioFile({ text, language, ticket, guideLabel, disabled, browserReading, onBrowserRead }: {
  text: string;
  language: Language;
  ticket?: string;
  guideLabel?: string;
  disabled: boolean;
  browserReading: boolean;
  onBrowserRead: () => void;
}) {
  const copy = educationCopy[language];
  const [audioUrl, setAudioUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const request = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | undefined>(undefined);
  const player = useRef<HTMLAudioElement>(null);
  const firstPlay = useRef<string | undefined>(undefined);
  const ready = Boolean(audioUrl && !failed);

  useEffect(() => () => {
    request.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  async function load() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setFailed(false);
    setAudioUrl(undefined);
    setPlaying(false);
    setLoading(true);
    const timer = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const isAudio = (value?: Response) => value?.ok && /^(?:audio\/(?:wav|x-wav|wave|mpeg))(?:;|$)/iu
        .test(value.headers.get("content-type") ?? "");
      const response = await fetch("/api/ai/barta-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideLabel ? { help: true, language } : { text, language, ticket }),
        signal: controller.signal,
      });
      if (!isAudio(response)) throw new Error("Audio unavailable");
      const content = await response.blob();
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(content);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = url;
      setAudioUrl(url);
    } catch {
      setFailed(true);
    } finally {
      window.clearTimeout(timer);
      request.current = null;
      setLoading(false);
    }
  }

  function activate() {
    if (disabled || loading) return;
    const media = player.current;
    if (!ready || !media) {
      void load();
      return;
    }
    if (media.paused) void media.play().catch(() => {});
    else media.pause();
  }

  const label = loading ? copy.preparingAudio : failed ? copy.retryAudio
    : ready ? (playing ? copy.pauseAudio : copy.playAudio) : (guideLabel ?? copy.readAloud);

  return (
    <div className={styles.audioFile} lang={language}>
      <button type="button" className={styles.read} disabled={disabled} aria-disabled={loading || undefined} onClick={activate}>
        {ready ? (playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />)
          : <Volume2 size={16} aria-hidden="true" />} {label}
      </button>
      {ready && (
        <>
          <p role="status">{playing ? copy.audioPlaying : copy.audioReady}</p>
          <audio ref={player} controls preload="auto" data-barta-audio src={audioUrl} aria-label={guideLabel ?? copy.readAloud}
            onCanPlay={(event) => {
              if (!audioUrl || firstPlay.current === audioUrl) return;
              firstPlay.current = audioUrl;
              void event.currentTarget.play().catch(() => {});
            }}
            onPlay={(event) => {
              const current = event.currentTarget;
              document.querySelectorAll<HTMLAudioElement>("audio[data-barta-audio]").forEach((audio) => {
                if (audio !== current && !audio.paused) audio.pause();
              });
            }}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)} />
        </>
      )}
      {failed && (
        <>
          <p role="status">{copy.generatedAudioFailed}</p>
          <button type="button" className={styles.read} disabled={disabled} onClick={onBrowserRead}>
            {browserReading ? copy.stopReading : copy.useBrowserVoice}
          </button>
        </>
      )}
    </div>
  );
}
