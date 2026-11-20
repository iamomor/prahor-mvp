"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/use-language";

type Channel = { channel: "sms" | "push"; optedIn: boolean };

// Opt-in is stored, but no SMS/push provider exists: nothing is ever sent or "delivered". In-app messages stay the source of truth.
export function NotificationPreferences() {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => (language === "bn" ? bn : en);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signin" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const status = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/notifications/preferences", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (response.status === 401 || response.status === 403) return setState("signin");
        if (!response.ok) throw new Error("unavailable");
        setChannels(((await response.json()) as { channels: Channel[] }).channels); setState("ready");
      }).catch(() => { if (!controller.signal.aborted) setState("error"); });
    return () => controller.abort();
  }, []);

  async function toggle(channel: Channel["channel"], optedIn: boolean) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/notifications/preferences", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel, optedIn }) });
      if (!response.ok) throw new Error("unavailable");
      setChannels(previous => previous?.map(item => item.channel === channel ? { ...item, optedIn } : item) ?? previous);
      setMessage(optedIn ? t("Preference saved. No notification service is connected yet, so nothing will be sent.", "পছন্দ সংরক্ষিত হয়েছে। এখনো কোনো বিজ্ঞপ্তি সেবা যুক্ত নেই, তাই কিছুই পাঠানো হবে না।")
        : t("Preference saved: this channel is off.", "পছন্দ সংরক্ষিত হয়েছে: এই মাধ্যম বন্ধ।"));
    } catch { setMessage(t("Your choice could not be saved. It was not changed. Try again.", "আপনার পছন্দ সংরক্ষণ হয়নি। বদলায়নি। আবার চেষ্টা করুন।")); }
    finally { setBusy(false); requestAnimationFrame(() => status.current?.focus()); }
  }

  const names = { sms: t("Text message (SMS)", "টেক্সট বার্তা (এসএমএস)"), push: t("Phone notification (push)", "ফোন বিজ্ঞপ্তি (পুশ)") };
  return (
    <section aria-labelledby="notify-title" className="pro-card grid gap-3">
      <h2 id="notify-title" className="text-xl font-semibold">{t("Notifications", "বিজ্ঞপ্তি")}</h2>
      <p>{t("Everything important stays in Bondhon messages inside PROHOR. Notifications are off unless you turn them on, and could only ever say “You have a new message in PROHOR” — never health details.", "গুরুত্বপূর্ণ সবকিছু প্রহরের ভেতরে বন্ধন বার্তায় থাকে। আপনি চালু না করলে বিজ্ঞপ্তি বন্ধ থাকে, এবং তাতে শুধু “প্রহরে আপনার একটি নতুন বার্তা আছে” লেখা থাকতে পারবে — স্বাস্থ্যের কোনো তথ্য নয়।")}</p>
      <p className="font-semibold">{t("Status: no SMS or push service is connected. Turning a channel on records your choice only; nothing is sent and nothing can be marked delivered.", "অবস্থা: কোনো এসএমএস বা পুশ সেবা যুক্ত নেই। চালু করলে শুধু আপনার পছন্দ রাখা হয়; কিছু পাঠানো হয় না এবং “পৌঁছেছে” দেখানো যায় না।")}</p>
      {state === "loading" && <p role="status">{t("Loading…", "লোড হচ্ছে…")}</p>}
      {state === "signin" && <p role="status">{t("Sign in to manage notification choices.", "বিজ্ঞপ্তির পছন্দ ঠিক করতে সাইন ইন করুন।")}</p>}
      {state === "error" && <p role="alert">{t("Notification choices could not be loaded. Nothing has changed.", "বিজ্ঞপ্তির পছন্দ লোড করা যায়নি। কিছু বদলায়নি।")}</p>}
      {state === "ready" && channels?.map(item => (
        <label key={item.channel} className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="size-5" checked={item.optedIn} disabled={busy} onChange={event => void toggle(item.channel, event.currentTarget.checked)} />
          <span>{names[item.channel]}</span>
        </label>
      ))}
      <p ref={status} tabIndex={-1} role="status" aria-atomic="true">{message}</p>
    </section>
  );
}
