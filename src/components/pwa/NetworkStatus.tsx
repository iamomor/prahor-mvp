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
  return <p className="my-3 rounded-field border border-pro-control-border bg-pro-warning-soft px-4 py-3 text-pro-text" role="status">{message}</p>;
}
