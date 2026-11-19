"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

/** Server-confirmed sign-out, then always leave the protected page (a lost response must not trap the user). */
export function SignOutButton({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      // Server returns JSON + Set-Cookie (not a redirect) so the cookie clears before we navigate.
      await fetch("/auth/sign-out", { method: "POST", credentials: "same-origin", headers: { Accept: "application/json" } });
    } catch {
      // Network error: still navigate; the protected layout re-checks the session server-side.
    } finally {
      // Full navigation on purpose: drops all client state from the signed-in session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/sign-in?status=signed-out");
    }
  }

  return (
    <button type="button" className={className} onClick={() => void signOut()} disabled={busy}>
      <LogOut size={16} aria-hidden="true" />
      <span>{busy ? t({ en: "Signing out…", bn: "সাইন আউট হচ্ছে…" }) : t({ en: "Sign out", bn: "সাইন আউট" })}</span>
    </button>
  );
}
