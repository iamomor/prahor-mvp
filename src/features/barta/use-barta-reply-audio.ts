import { useCallback, useEffect, useRef, useState } from "react";
import { claimAudioSession, releaseAudioSession } from "@/lib/audio-session";
import { fetchBartaAudio } from "./barta-audio-file";
import type { Language } from "./barta-education-copy";

type Playback = { stop: () => void; retry?: () => void };

export function useBartaReplyAudio() {
  const current = useRef<Playback | null>(null);
  const owner = useRef(Symbol("barta-reply-audio"));
  const [blocked, setBlocked] = useState<Language>();

  const stop = useCallback(() => {
    current.current?.stop();
    current.current = null;
    setBlocked(undefined);
  }, []);

  useEffect(() => () => current.current?.stop(), []);

  const start = useCallback((input: {
    text: string; language: Language; ticket?: string; clipUrl?: string;
  }, fallback: () => void) => {
    stop();
    const controller = new AbortController();
    const player = new Audio();
    let url: string | undefined;
    const id = owner.current;


    const timeout = window.setTimeout(handleFallback, 15_000);


    const playback: Playback = {
      stop() {
        window.clearTimeout(timeout);
        controller.abort();
        player.onended = null;
        player.onerror = null;
        player.pause();
        player.removeAttribute("src");
        if (url) URL.revokeObjectURL(url);
        releaseAudioSession(id);
      },
    };



    function handleFallback() {


      if (current.current !== playback) return;
      stop();
      fallback();
    }

    async function play() {
      if (current.current !== playback) return;
      setBlocked(undefined);
      try {
        await player.play();
        window.clearTimeout(timeout);
      } catch (error) {
        if (current.current !== playback) return;
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          window.clearTimeout(timeout);
          playback.retry = () => { void play(); };
          setBlocked(input.language);
        } else {


          handleFallback();


        }
      }
    }

    current.current = playback;
    claimAudioSession({ id, stop });
    player.onended = stop;


    player.onerror = handleFallback;


    void fetchBartaAudio(input, controller.signal).then((blob) => {
      if (current.current !== playback) return;
      url = URL.createObjectURL(blob);
      player.src = url;
      return play();


    }).catch(handleFallback);

  }, [stop]);

  return { start, stop, blocked, retry: () => current.current?.retry?.() };
}
