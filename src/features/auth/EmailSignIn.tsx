"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import { safeAuthReturnPath } from "@/lib/routes";

export function EmailSignIn({ mode = "sign-in", next = "/app", notice = "" }: {
  mode?: "sign-in" | "sign-up"; next?: string; notice?: string;
}) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(notice);
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [passwordUsed, setPasswordUsed] = useState(true);
  const safeNext = safeAuthReturnPath(next);
  const messages: Record<string, { en: string; bn: string }> = {
    "unavailable": { en: "Authentication is unavailable. Check your connection and try again; no success has been confirmed.", bn: "সাইন ইন সেবা পাওয়া যাচ্ছে না। সংযোগ দেখে আবার চেষ্টা করুন; সফল হওয়া নিশ্চিত হয়নি।" },
    "check-email": { en: "If this address can continue, check your email for a secure link. Already registered? Sign in instead.", bn: "এই ঠিকানায় এগোনো সম্ভব হলে ইমেইলে নিরাপদ লিংক পাবেন। আগে নিবন্ধন করলে সাইন ইন করুন।" },
    // Query parameters are navigational hints, never evidence of session termination.
    "signed-out": { en: "Sign in to access your account.", bn: "অ্যাকাউন্টে প্রবেশ করতে সাইন ইন করুন।" },
    "session-required": { en: "Sign in to continue. Your previous session may have expired.", bn: "এগোতে সাইন ইন করুন। আগের সেশনের মেয়াদ শেষ হয়ে থাকতে পারে।" },
    "link-expired": { en: "This link is invalid or expired. Request a new sign-in link below.", bn: "লিংকটি ভুল বা মেয়াদ শেষ। নিচে নতুন সাইন ইন লিংক চান।" },
    "profile-unavailable": { en: "Your account profile is unavailable. Please retry or contact support.", bn: "অ্যাকাউন্টের প্রোফাইল পাওয়া যাচ্ছে না। আবার চেষ্টা করুন বা সহায়তা নিন।" },
    "invalid-input": { en: "Enter a valid email and password. New passwords need 12–128 characters.", bn: "সঠিক ইমেইল ও পাসওয়ার্ড দিন। নতুন পাসওয়ার্ডে ১২–১২৮টি অক্ষর দরকার।" },
  };
  const fallback = { en: "We could not complete this request. Check your details and email confirmation, then try again.", bn: "অনুরোধটি সম্পন্ন হয়নি। তথ্য ও ইমেইল নিশ্চিতকরণ যাচাই করে আবার চেষ্টা করুন।" };
  const fieldInvalid = invalid && ["invalid-input", "authentication-failed"].includes(message);
  const inputClass = "min-h-12 w-full rounded-xl border border-pro-border bg-pro-elevated px-4 py-3 text-base text-pro-text";

  async function submit(action: "sign-in" | "sign-up" | "email-link") {
    if (busy) return;
    if (action === "email-link" && !emailInput.current?.reportValidity()) return;
    setPasswordUsed(action !== "email-link");
    setMessage("");
    setInvalid(false);
    setBusy(true);
    try {
      const response = await fetch(`/auth/${action}`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(action === "email-link" ? {} : { password }), next: safeNext }),
      });
      const data = await response.json();
      if (response.ok && typeof data.redirectTo === "string") {
        window.location.assign(safeAuthReturnPath(data.redirectTo));
      } else {
        setMessage(typeof data.code === "string" ? data.code : "unavailable");
        setInvalid(!response.ok);
      }
    } catch {
      setMessage("unavailable");
      setInvalid(true);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => status.current?.focus());
    }
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void submit(mode); }

  return (
    <form onSubmit={onSubmit} aria-busy={busy} lang={language} className="pro-card space-y-5">
      <h1 className="text-3xl font-semibold">{mode === "sign-up" ? t({ en: "Create your account", bn: "অ্যাকাউন্ট তৈরি করুন" }) : t({ en: "Sign in", bn: "সাইন ইন" })}</h1>
      <div className="pro-field">
        <label htmlFor="email" className="font-semibold">{t({ en: "Email address", bn: "ইমেইল ঠিকানা" })}</label>
        <input ref={emailInput} className={inputClass} id="email" type="email" autoComplete="email" required maxLength={254} aria-describedby="auth-status" aria-invalid={fieldInvalid || undefined}
          value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
      </div>
      <div className="pro-field">
        <label htmlFor="password" className="font-semibold">{t({ en: "Password", bn: "পাসওয়ার্ড" })}</label>
        <input className={inputClass} id="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required minLength={mode === "sign-up" ? 12 : 1} maxLength={128} value={password}
          onChange={event => setPassword(event.target.value)} aria-describedby="password-hint auth-status" aria-invalid={(fieldInvalid && passwordUsed) || undefined} />
        <p id="password-hint">{t({ en: "Use a password manager. New passwords need at least 12 characters; pasting is allowed.", bn: "পাসওয়ার্ড ম্যানেজার ব্যবহার করতে পারেন। নতুন পাসওয়ার্ডে অন্তত ১২টি অক্ষর দিন; পেস্ট করা যায়।" })}</p>
      </div>
      <button type="submit" disabled={busy} className="pro-btn pro-btn-primary w-full">
        {busy ? t({ en: "Please wait…", bn: "অপেক্ষা করুন…" }) : mode === "sign-up" ? t({ en: "Create account", bn: "অ্যাকাউন্ট তৈরি করুন" }) : t({ en: "Sign in", bn: "সাইন ইন" })}
      </button>
      {mode === "sign-in" && <button type="button" disabled={busy} className="pro-btn pro-btn-secondary w-full" onClick={() => void submit("email-link")}>{t({ en: "Email me a sign-in link instead", bn: "ইমেইলে সাইন ইন লিংক পাঠান" })}</button>}
      <p id="auth-status" ref={status} tabIndex={-1} role={invalid ? "alert" : "status"}>{message ? t(messages[message] ?? fallback) : ""}</p>
      <p>{t({ en: "Public information is available without an account. New accounts are mother accounts; provider approval is managed separately.", bn: "অ্যাকাউন্ট ছাড়াও সাধারণ তথ্য দেখতে পারেন। নতুন অ্যাকাউন্ট মায়েদের জন্য; সেবাদাতার অনুমোদন আলাদাভাবে হয়।" })}</p>
      <Link className="underline" href={`${mode === "sign-up" ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(safeNext)}`}>{mode === "sign-up" ? t({ en: "Already registered? Sign in", bn: "নিবন্ধন করা আছে? সাইন ইন করুন" }) : t({ en: "Create an account", bn: "অ্যাকাউন্ট তৈরি করুন" })}</Link>
    </form>
  );
}
