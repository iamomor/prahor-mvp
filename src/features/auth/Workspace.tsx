"use client";
import { useState } from "react";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";

export function Workspace({ profile }: { profile: OwnProfile }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signOut() {
    setBusy(true); setFailed(false);
    try {
      const response = await fetch("/auth/sign-out", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Sign-out failed");
      window.location.replace("/sign-in?status=signed-out");
    } catch { setFailed(true); setBusy(false); }
  }
  return <section className="pro-card space-y-5">
    <h1 className="text-3xl font-semibold">{profile.role === "mother" ? t({ en: "Your PROHOR dashboard", bn: "আপনার প্রহর ড্যাশবোর্ড" }) : t({ en: "Simulated provider workspace", bn: "সিমুলেটেড সেবাদাতার কর্মক্ষেত্র" })}</h1>
    {profile.display_name && <p>{profile.display_name}</p>}
    <p>{profile.role === "mother" ? t({ en: "You are signed in to your own account. Health-record features are not connected yet.", bn: "আপনার নিজের অ্যাকাউন্টে সাইন ইন করা আছে। স্বাস্থ্যতথ্যের সুবিধা এখনো যুক্ত হয়নি।" }) : t({ en: "Your provider access is authorized. No maternal records are shared here; consent and assignment workflows are not connected yet.", bn: "আপনার সেবাদাতার প্রবেশাধিকার অনুমোদিত। এখানে মায়েদের তথ্য শেয়ার হয়নি; সম্মতি ও দায়িত্ব বণ্টনের ব্যবস্থা এখনো যুক্ত হয়নি।" })}</p>
    <button type="button" className="pro-btn pro-btn-secondary" onClick={() => void signOut()} disabled={busy}>{busy ? t({ en: "Signing out…", bn: "সাইন আউট হচ্ছে…" }) : t({ en: "Sign out", bn: "সাইন আউট" })}</button>
    {failed && <p role="alert">{t({ en: "Sign-out could not be confirmed. Check your connection and try again.", bn: "সাইন আউট নিশ্চিত হয়নি। সংযোগ দেখে আবার চেষ্টা করুন।" })}</p>}
  </section>;
}
