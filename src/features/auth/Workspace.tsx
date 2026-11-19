"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";

export function Workspace({ profile, children }: { profile: OwnProfile; children?: React.ReactNode }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signOut() {
    setBusy(true); setFailed(false);
    try {
      // Server returns JSON + Set-Cookie (not a redirect) so the browser applies
      // the cookie-clearing headers before we navigate away.
      const response = await fetch("/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Accept": "application/json" },
      });
      if (!response.ok && response.status !== 503) {
        // Non-fatal: session may already be gone — still navigate away.
      }
    } catch {
      // Network error — still navigate so user is not stuck on a protected page.
    } finally {
      window.location.assign("/sign-in?status=signed-out");
    }
  }
  return <div className="grid gap-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <p className="pro-eyebrow text-pro-primary">{profile.role === "mother" ? "PROHOR" : t({ en: "Simulated provider", bn: "সিমুলেটেড সেবাদাতা" })}</p>
        <h1 className="pro-editorial text-3xl font-semibold sm:text-4xl">{profile.role === "mother" ? t({ en: "Your PROHOR dashboard", bn: "আপনার প্রহর ড্যাশবোর্ড" }) : t({ en: "Care request queue", bn: "সহায়তা অনুরোধের তালিকা" })}</h1>
        {profile.display_name && <p className="text-lg text-pro-muted">{t({ en: "Signed in as", bn: "সাইন ইন করেছেন" })} {profile.display_name}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/account" className="inline-flex min-h-11 items-center text-pro-primary underline underline-offset-2">{t({ en: "Account and roles", bn: "অ্যাকাউন্ট ও পরিচয়" })}</Link>
        <button type="button" className="pro-btn pro-btn-secondary" onClick={() => void signOut()} disabled={busy}>{busy ? t({ en: "Signing out…", bn: "সাইন আউট হচ্ছে…" }) : t({ en: "Sign out", bn: "সাইন আউট" })}</button>
      </div>
    </header>
    {failed && <p role="alert">{t({ en: "Sign-out could not be confirmed. Check your connection and try again.", bn: "সাইন আউট নিশ্চিত হয়নি। সংযোগ দেখে আবার চেষ্টা করুন।" })}</p>}
    {children}
  </div>;
}
