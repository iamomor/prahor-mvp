"use client";

import { useEffect, useRef } from "react";
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
    <h2 id="sign-in-title">{t(copy("Sign in is coming.", "সাইন ইন শিগগিরই আসছে।"))}</h2>
    <p>{t(copy("Account access isn’t connected in this homepage preview. You can explore PROHOR and try the visit-question demo without an account.", "এই নমুনায় অ্যাকাউন্টে প্রবেশের সুবিধা যুক্ত হয়নি। অ্যাকাউন্ট ছাড়াই প্রহর ঘুরে দেখুন এবং সাক্ষাতের প্রশ্নের অনুশীলন করুন।"))}</p>
    <button className="home-button" onClick={onClose}>{t(copy("Keep exploring", "ঘুরে দেখুন"))}<ArrowRight size={20} aria-hidden="true" /></button>
  </dialog>;
}
