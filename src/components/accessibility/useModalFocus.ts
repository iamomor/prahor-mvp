"use client";
import { useEffect, useRef } from "react";

/**
 * For hand-built role="dialog" overlays: moves focus in on open, keeps Tab inside, closes on Escape,
 * and returns focus to whatever opened it. Attach the returned ref to the dialog's outer element.
 */
export function useModalFocus<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const opener = document.activeElement as HTMLElement | null;
    const initialFocus = node.querySelector<HTMLElement>("h2,h3") ?? node;
    const focusable = () => Array.from(node.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'));
    initialFocus.setAttribute("tabindex", "-1");
    initialFocus.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.stopPropagation(); close.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === initialFocus)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    node.addEventListener("keydown", onKey);
    return () => { node.removeEventListener("keydown", onKey); opener?.focus?.(); };
  }, [open]);
  return ref;
}
