"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import { safeAuthReturnPath } from "@/lib/routes";
import { onboardingSchema } from "@/lib/contracts/account";
import { RoleProfileFields, emptyRoleProfile } from "./RoleProfileFields";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Sprout, Check } from "lucide-react";
import { AuthStory } from "./AuthStory";

export function EmailSignIn({ mode = "sign-in", next = "/app", notice = "" }: {
  mode?: "sign-in" | "sign-up"; next?: string; notice?: string;
}) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(emptyRoleProfile);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(notice);
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [passwordUsed, setPasswordUsed] = useState(true);
  const safeNext = safeAuthReturnPath(next);
  const messages: Record<string, { en: string; bn: string }> = {
    "choose-role": { en: "Choose at least one role to continue.", bn: "এগোনোর জন্য অন্তত একটি পরিচয় বেছে নিন।" },
    "password-mismatch": { en: "The passwords do not match. Please check both fields.", bn: "পাসওয়ার্ড দুটি মেলেনি। দুটি ঘরই যাচাই করুন।" },
    "invalid-profile": { en: "Enter your name, select at least one role and complete the professional fields if shown.", bn: "আপনার নাম দিন, অন্তত একটি পরিচয় বেছে নিন এবং পেশাগত ঘরগুলো দেখালে পূরণ করুন।" },
    "roles-unavailable": { en: "Account role setup is not available yet. Your account has not been created. Please try again after setup is complete.", bn: "অ্যাকাউন্টের পরিচয় সেটআপ এখনও প্রস্তুত নয়। আপনার অ্যাকাউন্ট তৈরি হয়নি। সেটআপ শেষে আবার চেষ্টা করুন।" },
    "profile-pending": { en: "Your account was created, but your profile could not be saved. Your inputs are still here. Select Finish account setup to retry without creating another account.", bn: "আপনার অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু পরিচয় সংরক্ষণ হয়নি। আপনার লেখা তথ্য রয়ে গেছে। নতুন অ্যাকাউন্ট তৈরি না করে আবার চেষ্টা করতে অ্যাকাউন্ট সেটআপ সম্পূর্ণ করুন বেছে নিন।" },
    "unavailable": { en: "Authentication is unavailable. Check your connection and try again; no success has been confirmed.", bn: "সাইন ইন সেবা পাওয়া যাচ্ছে না। সংযোগ দেখে আবার চেষ্টা করুন; সফল হওয়া নিশ্চিত হয়নি।" },
    "check-email": { en: "If this address can continue, check your email for a secure link. Already registered? Sign in instead.", bn: "এই ঠিকানায় এগোনো সম্ভব হলে ইমেইলে নিরাপদ লিংক পাবেন। আগে নিবন্ধন করলে সাইন ইন করুন।" },
    "email-rate-limited": { en: "Email sending is temporarily limited. Wait before requesting one new confirmation email; repeated attempts will not speed it up.", bn: "ইমেইল পাঠানো সাময়িকভাবে সীমিত। কিছুক্ষণ অপেক্ষা করে একটি নতুন নিশ্চিতকরণ ইমেইল চান; বারবার চেষ্টা করলে দ্রুত হবে না।" },
    "confirmation-required": { en: "This account still needs confirmation from the earlier setup. For this MVP, create a fresh test account with another email address you control.", bn: "আগের সেটআপের এই অ্যাকাউন্টে এখনও নিশ্চিতকরণ দরকার। এই এমভিপির জন্য আপনার নিয়ন্ত্রণে থাকা অন্য ইমেইল দিয়ে নতুন পরীক্ষামূলক অ্যাকাউন্ট তৈরি করুন।" },
    "account-already-exists": { en: "This address already has an account. Try signing in or use another email address you control.", bn: "এই ঠিকানায় আগে থেকেই অ্যাকাউন্ট আছে। সাইন ইন করুন অথবা আপনার নিয়ন্ত্রণে থাকা অন্য ইমেইল ব্যবহার করুন।" },
    "registration-pending": { en: "An account may have been created, but sign-in was not confirmed. Try signing in; do not submit sign-up again.", bn: "অ্যাকাউন্ট তৈরি হয়ে থাকতে পারে, কিন্তু সাইন ইন নিশ্চিত হয়নি। সাইন ইন চেষ্টা করুন; আবার সাইন আপ জমা দেবেন না।" },
    // Query parameters are navigational hints, never evidence of session termination.
    "signed-out": { en: "Sign in to access your account.", bn: "অ্যাকাউন্টে প্রবেশ করতে সাইন ইন করুন।" },
    "session-required": { en: "Sign in to continue. Your previous session may have expired.", bn: "এগোতে সাইন ইন করুন। আগের সেশনের মেয়াদ শেষ হয়ে থাকতে পারে।" },
    "link-expired": { en: "This link is invalid or expired. Request a new sign-in link below.", bn: "লিংকটি ভুল বা মেয়াদ শেষ। নিচে নতুন সাইন ইন লিংক চান।" },
    "profile-unavailable": { en: "Your account profile is unavailable. Please retry or contact support.", bn: "অ্যাকাউন্টের প্রোফাইল পাওয়া যাচ্ছে না। আবার চেষ্টা করুন বা সহায়তা নিন।" },
    "invalid-input": { en: "Enter a valid email and password. New passwords need 12–128 characters.", bn: "সঠিক ইমেইল ও পাসওয়ার্ড দিন। নতুন পাসওয়ার্ডে ১২–১২৮টি অক্ষর দরকার।" },
  };
  const fallback = { en: "We could not complete this request. Check your details and try again. Your inputs are still here.", bn: "অনুরোধটি সম্পন্ন হয়নি। তথ্য যাচাই করে আবার চেষ্টা করুন। আপনার লেখা তথ্য রয়ে গেছে।" };
  const fieldInvalid = invalid && ["invalid-input", "authentication-failed"].includes(message);
  const inputClass = "auth-input";

  async function submit(action: "sign-in" | "sign-up" | "email-link") {
    if (busy) return;
    if (action === "sign-up" && !createdAccountId && password !== confirmPassword) {
      setMessage("password-mismatch"); setInvalid(true);
      requestAnimationFrame(() => status.current?.focus()); return;
    }
    if (action === "sign-up" && !onboardingSchema.safeParse(profile).success) {
      setMessage("invalid-profile"); setInvalid(true);
      requestAnimationFrame(() => status.current?.focus()); return;
    }
    const emailOnly = action === "email-link";
    if (emailOnly && !emailInput.current?.reportValidity()) return;
    setPasswordUsed(!emailOnly);
    setMessage("");
    setInvalid(false);
    setBusy(true);
    try {
      const finishProfile = action === "sign-up" && createdAccountId !== null;
      const response = await fetch(finishProfile ? "/auth/account" : `/auth/${action}`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json",
          ...(finishProfile ? { "X-Prohor-Account": createdAccountId! } : {}) },
        body: JSON.stringify(finishProfile ? { action: "onboard", profile } : { email,
          ...(emailOnly ? {} : { password }), next: safeNext, ...(action === "sign-up" ? { profile } : {}) }),
      });
      const data = await response.json();
      if (response.ok && typeof data.redirectTo === "string") {
        window.location.assign(safeAuthReturnPath(data.redirectTo));
      } else {
        if (data.code === "profile-pending" && z.uuid().safeParse(data.accountId).success) setCreatedAccountId(data.accountId);
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
  function moveStep(nextStep: number) {
    setStep(nextStep); setMessage(""); setInvalid(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "sign-up" && step < 2) {
      if ((step === 0 && !profile.purposes.length) || (step === 1 && !onboardingSchema.safeParse(profile).success)) {
        setMessage(step === 0 ? "choose-role" : "invalid-profile"); setInvalid(true);
        requestAnimationFrame(() => status.current?.focus()); return;
      }
      moveStep(step + 1); return;
    }
    void submit(mode);
  }
  const signup = mode === "sign-up";
  const stepLabels = [{ en: "Your role", bn: "আপনার পরিচয়" }, { en: "Your details", bn: "আপনার তথ্য" }, { en: "Your account", bn: "আপনার অ্যাকাউন্ট" }];
  const roleNames = { mother: { en: "Mother", bn: "মা" }, supporter: { en: "Supporter", bn: "সহায়তাকারী" }, doctor: { en: "Doctor", bn: "চিকিৎসক" }, chw: { en: "Community health worker", bn: "কমিউনিটি স্বাস্থ্যকর্মী" } };

  return (
    <div className="auth-experience">
      <AuthStory signup={signup} />
      <section className="auth-panel" aria-label={t({ en: signup ? "Create an account" : "Sign in to your account", bn: signup ? "অ্যাকাউন্ট তৈরি করুন" : "আপনার অ্যাকাউন্টে সাইন ইন করুন" })}>
      <div className="auth-panel-top"><Link href="/"><ArrowLeft size={16} aria-hidden="true" />{t({ en: "Back to home", bn: "মূল পাতায় ফিরুন" })}</Link>
        <span>{signup ? t({ en: "A place for every role", bn: "সবার জন্য একটি জায়গা" }) : t({ en: "Your care continues here", bn: "আপনার যত্নের যাত্রা এখানেই" })}</span></div>
      <form onSubmit={onSubmit} aria-busy={busy} lang={language}>
      <div className="auth-form-heading"><span className="auth-form-eyebrow"><Sprout size={15} aria-hidden="true" />{t({ en: signup ? "JOIN YOUR CIRCLE OF CARE" : "GOOD TO SEE YOU AGAIN", bn: signup ? "যত্নের বন্ধনে যোগ দিন" : "আবার আপনাকে স্বাগতম" })}</span>
        <h1 ref={heading} tabIndex={-1}>{signup ? t({ en: "Create your account", bn: "অ্যাকাউন্ট তৈরি করুন" }) : t({ en: "Welcome back.", bn: "আবার স্বাগতম।" })}</h1>
        <p>{signup ? step === 0 ? t({ en: "Start with your role. We’ll shape the next step around you.", bn: "আপনার পরিচয় দিয়ে শুরু করুন। পরের ধাপ আপনার জন্য সাজানো হবে।" }) : step === 1 ? t({ en: "A little about you, and the care you’re here for.", bn: "আপনার পরিচয় এবং যে যত্নের জন্য এসেছেন, সে সম্পর্কে কিছু তথ্য।" }) : t({ en: "Set up your sign-in details. Your circle starts here.", bn: "সাইন ইনের তথ্য ঠিক করুন। এখান থেকেই শুরু আপনার বন্ধন।" }) : t({ en: "Sign in to your account and pick up where you left off.", bn: "অ্যাকাউন্টে সাইন ইন করে আপনার যাত্রা চালিয়ে যান।" })}</p>
      </div>
      {signup && <ol className="auth-stepper" aria-label={t({ en: "Registration progress", bn: "নিবন্ধনের ধাপ" })}>{stepLabels.map((label, index) => <li key={index} data-current={step === index} data-complete={step > index} aria-current={step === index ? "step" : undefined}>
        {step > index ? <Check size={14} aria-hidden="true" /> : <span aria-hidden="true">0{index + 1}</span>}{t(label)}</li>)}</ol>}
      {signup && step < 2 && <RoleProfileFields value={profile} onChange={setProfile} disabled={busy} section={step === 0 ? "roles" : "details"} />}
      {signup && step === 2 && <div className="auth-review"><p><strong>{profile.displayName}</strong></p><p>{profile.purposes.map(role => t(roleNames[role])).join(" · ")}</p></div>}
      {(!signup || step === 2) && <>
      <div className="auth-field">
        <label htmlFor="email" className="font-semibold">{t({ en: "Email address", bn: "ইমেইল ঠিকানা" })}</label>
        <input ref={emailInput} className={inputClass} id="email" type="email" autoComplete="email" required disabled={createdAccountId !== null} maxLength={254} aria-describedby="auth-status" aria-invalid={fieldInvalid || undefined}
          value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
      </div>
      <div className="auth-field">
        <label htmlFor="password" className="font-semibold">{t({ en: "Password", bn: "পাসওয়ার্ড" })}</label>
        <div className="auth-password-control"><input className={inputClass} id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required disabled={createdAccountId !== null} minLength={mode === "sign-up" ? 12 : 1} maxLength={128} value={password}
          onChange={event => setPassword(event.target.value)} aria-describedby="password-hint auth-status" aria-invalid={((fieldInvalid && passwordUsed) || message === "password-mismatch") || undefined} />
          <button type="button" className="auth-password-toggle" aria-label={showPassword ? t({ en: "Hide password", bn: "পাসওয়ার্ড আড়াল করুন" }) : t({ en: "Show password", bn: "পাসওয়ার্ড দেখুন" })} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>
        <p id="password-hint" className="auth-field-hint">{signup ? t({ en: "At least 12 characters. Password managers and pasting are welcome.", bn: "অন্তত ১২টি অক্ষর। পাসওয়ার্ড ম্যানেজার ও পেস্ট ব্যবহার করতে পারেন।" }) : t({ en: "Use the password you created for your PROHOR account.", bn: "প্রহর অ্যাকাউন্টের জন্য তৈরি করা পাসওয়ার্ড ব্যবহার করুন।" })}</p>
      </div>
      {signup && <div className="auth-field"><label htmlFor="confirm-password">{t({ en: "Confirm password", bn: "পাসওয়ার্ড নিশ্চিত করুন" })}</label>
        <input id="confirm-password" className="auth-input" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={createdAccountId !== null} value={confirmPassword} maxLength={128} onChange={e => setConfirmPassword(e.target.value)} aria-invalid={message === "password-mismatch" || undefined} aria-describedby="auth-status" /></div>}
      </>}
      <p id="auth-status" className="auth-message" ref={status} tabIndex={-1} role={invalid ? "alert" : "status"}>{message ? t(messages[message] ?? fallback) : ""}</p>
      <div className="auth-form-actions">
        {signup && step > 0 && !createdAccountId && <button type="button" className="auth-back" disabled={busy} onClick={() => moveStep(step - 1)}><ArrowLeft size={16} aria-hidden="true" />{t({ en: "Back", bn: "পেছনে" })}</button>}
        <button type="submit" disabled={busy} className="auth-submit">
          {busy ? t({ en: "Please wait…", bn: "অপেক্ষা করুন…" }) : signup && step < 2 ? t({ en: "Continue", bn: "এগিয়ে যান" }) : createdAccountId ? t({ en: "Finish account setup", bn: "অ্যাকাউন্ট সেটআপ সম্পূর্ণ করুন" }) : signup ? t({ en: "Create my account", bn: "আমার অ্যাকাউন্ট তৈরি করুন" }) : t({ en: "Sign in", bn: "সাইন ইন" })}<ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="auth-account-prompt">{signup ? t({ en: "Already part of PROHOR? ", bn: "আগেই প্রহরে যোগ দিয়েছেন? " }) : t({ en: "New to PROHOR? ", bn: "প্রহরে নতুন? " })}<Link href={`${signup ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(safeNext)}`}>{signup ? t({ en: "Sign in", bn: "সাইন ইন করুন" }) : t({ en: "Create an account", bn: "অ্যাকাউন্ট তৈরি করুন" })}</Link></p>
      <p className="auth-privacy-note"><LockKeyhole size={14} aria-hidden="true" />{t({ en: "Your role is checked securely. You decide what to share.", bn: "আপনার পরিচয়ের অনুমতি নিরাপদে যাচাই হয়। কী শেয়ার করবেন, সিদ্ধান্ত আপনার।" })}</p>
      </form>
      <footer className="auth-panel-footer"><Link href="/" className="auth-visitor-link">{t({ en: "Explore as a visitor", bn: "অতিথি হিসেবে ঘুরে দেখুন" })}<ArrowUpRightIcon /></Link><span aria-hidden="true">·</span><Link href="/trust">{t({ en: "Privacy & trust", bn: "গোপনীয়তা ও আস্থা" })}</Link></footer>
      </section>
    </div>
  );
}
function ArrowUpRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>; }
