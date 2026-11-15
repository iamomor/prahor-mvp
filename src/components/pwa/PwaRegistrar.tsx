"use client";
import { useEffect } from "react";
export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register without forcing app installation or taking over sensitive APIs.
    navigator.serviceWorker.register("/sw.js").catch(() => { /* PWA is optional. */ });
  }, []);
  return null;
}
