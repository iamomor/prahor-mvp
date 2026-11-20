"use client";
import { useEffect, useRef } from "react";
/** Hide before a page can be frozen; restored private pages must pass the route's auth gate again.
 * This supplements server no-store/auth checks; it is not an authorization mechanism. */
export function useBondhonPageGuard() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function hide() { if (root.current) { root.current.hidden = true; root.current.inert = true; } }
    function restored(event: PageTransitionEvent) {
      if (event.persisted) { hide(); window.location.reload(); }
    }
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", restored);
    return () => { window.removeEventListener("pagehide", hide); window.removeEventListener("pageshow", restored); };
  }, []);
  return root;
}
