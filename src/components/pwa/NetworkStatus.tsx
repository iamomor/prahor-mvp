"use client";

import { useEffect, useState } from "react";

export function NetworkStatus({ message }: { message: string }) {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="my-3 rounded-field border border-pro-control-border bg-pro-warning-soft px-4 py-3 text-pro-text" role="status">
      <p>{message}</p>
      {/* Static, approved emergency numbers only (same as /offline). Not live or personalised advice. */}
      <p className="mt-2">
        <span lang="en">Static emergency information, not advice for your situation:</span>{" "}
        <span lang="bn">স্থির জরুরি তথ্য, আপনার অবস্থার জন্য পরামর্শ নয়:</span>{" "}
        <a className="font-semibold underline" href="tel:999">999</a>{" · "}
        <a className="font-semibold underline" href="tel:16263">16263</a>{" · "}
        <a className="font-semibold underline" href="/offline"><span lang="en">Offline help page</span> / <span lang="bn">অফলাইন সাহায্য পাতা</span></a>
      </p>
    </div>
  );
}
