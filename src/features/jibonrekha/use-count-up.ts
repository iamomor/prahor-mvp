"use client";
import { useEffect, useRef, useState } from "react";

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";

/** Counts the shown number toward `target` (ease-out, ~600ms). Instant when the user prefers reduced motion. Display only. */
export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    if (reduced()) { from.current = target; requestAnimationFrame(() => setValue(target)); return; }
    let frame = 0;
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - began) / duration);
      const next = Math.round(start + (target - start) * (1 - (1 - t) ** 3));
      from.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
