"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, X } from "lucide-react";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export function SignInNotice({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { t } = useHome();
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    const overflow = document.body.style.overflow;
    modal?.showModal();
    document.body.style.overflow = "hidden";
    return () => { modal?.close(); document.body.style.overflow = overflow; trigger?.focus(); };
  }, []);
  return <dialog ref={dialog} className="home-preferences pass-sign-in" aria-labelledby="sign-in-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="home-preferences-header"><LockKeyhole aria-hidden="true" /><button onClick={onClose} aria-label={t(copy("Close sign in", "সাইন ইন বন্ধ করুন"))}><X aria-hidden="true" /></button></div>
    <h2 id="sign-in-title">{t(copy("Sign in to PROHOR", "প্রহরে সাইন ইন করুন"))}</h2>
    <p>{t(copy("Sign in for your private account, or keep exploring public information without an account.", "নিজের অ্যাকাউন্টে সাইন ইন করুন, অথবা অ্যাকাউন্ট ছাড়াই সাধারণ তথ্য দেখুন।"))}</p>
    <Link href="/sign-in" className="home-button">{t(copy("Continue to sign in", "সাইন ইন করতে এগিয়ে যান"))}<ArrowRight size={20} aria-hidden="true" /></Link>
    <button className="home-button" onClick={onClose}>{t(copy("Keep exploring", "ঘুরে দেখুন"))}<ArrowRight size={20} aria-hidden="true" /></button>
  </dialog>;
}
