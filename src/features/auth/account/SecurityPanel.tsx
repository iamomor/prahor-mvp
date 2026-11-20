"use client";
import { useLanguage } from "@/i18n/use-language";
import type { AccountAccess } from "@/lib/contracts/account";
import { Check, Copy, Fingerprint, KeyRound, LogOut, Mail, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { SignOutButton } from "../SignOutButton";
import { accountMessage } from "./account-copy";
import type { Act } from "./types";

type Status = { ok: boolean; code: string } | null;

export function SecurityPanel({ account, email, pendingEmail, act, busy }: {
  account: AccountAccess; email: string; pendingEmail: string | null; act: Act; busy: boolean;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState<"email" | "password" | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [copied, setCopied] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const emailButton = useRef<HTMLButtonElement>(null);
  const passwordButton = useRef<HTMLButtonElement>(null);
  function close(which: "email" | "password") {
    setOpen(null);
    setStatus(null);
    requestAnimationFrame(() => (which === "email" ? emailButton : passwordButton).current?.focus());
  }
  // Failure keeps the form (and what was typed) open; the alert above announces why.
  function done(ok: boolean, code: string) {
    setStatus({ ok, code: code });
    if (!ok) return;
    setOpen(null);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return (
    <section className="acct-card" aria-labelledby="acct-security-title">
      <div className="grid gap-1">
        <h2 id="acct-security-title" className="acct-h2">{t({ en: "Sign-in and security", bn: "সাইন ইন ও নিরাপত্তা" })}</h2>
        <p className="acct-hint">{t({ en: "How you sign in to PROHOR on this and other devices.", bn: "এই ও অন্যান্য ডিভাইসে আপনি কীভাবে প্রহরে সাইন ইন করেন।" })}</p>
      </div>
      <p ref={statusRef} tabIndex={-1} role={status && !status.ok ? "alert" : "status"} className="acct-status" data-tone={status ? (status.ok ? "ok" : "error") : undefined}>{status && accountMessage(status.code, t)}</p>

      <ul className="acct-settings">
        <li className="acct-setting">
          <span className="acct-fact-icon" aria-hidden="true"><Mail size={18} strokeWidth={1.75} /></span>
          <div className="acct-setting-body">
            <p className="acct-setting-label">{t({ en: "Email", bn: "ইমেইল" })}</p>
            <p className="acct-setting-value" lang="en" dir="ltr">{email || "—"}</p>
            {pendingEmail && <p className="acct-pill" data-tone="wait">{t({ en: `Waiting for confirmation: ${pendingEmail}`, bn: `নিশ্চিতকরণের অপেক্ষায়: ${pendingEmail}` })}</p>}
          </div>
          {open !== "email" && (
            <button ref={emailButton} type="button" className="acct-btn acct-btn-sm" onClick={() => { setStatus(null); setOpen("email"); }}>
              {t({ en: "Change email", bn: "ইমেইল বদলান" })}
            </button>
          )}
          {open === "email" && <EmailForm busy={busy} act={act} onCancel={() => close("email")} onDone={done} />}
        </li>

        <li className="acct-setting">
          <span className="acct-fact-icon" aria-hidden="true"><KeyRound size={18} strokeWidth={1.75} /></span>
          <div className="acct-setting-body">
            <p className="acct-setting-label">{t({ en: "Password", bn: "পাসওয়ার্ড" })}</p>
            <p className="acct-setting-value" aria-hidden="true">••••••••••••</p>
            <p className="sr-only">{t({ en: "Hidden", bn: "লুকানো" })}</p>
          </div>
          {open !== "password" && (
            <button ref={passwordButton} type="button" className="acct-btn acct-btn-sm" onClick={() => { setStatus(null); setOpen("password"); }}>
              {t({ en: "Change password", bn: "পাসওয়ার্ড বদলান" })}
            </button>
          )}
          {open === "password" && <PasswordForm busy={busy} act={act} onCancel={() => close("password")} onDone={done} />}
        </li>

        <li className="acct-setting">
          <span className="acct-fact-icon" aria-hidden="true"><Fingerprint size={18} strokeWidth={1.75} /></span>
          <div className="acct-setting-body">
            <p className="acct-setting-label">{t({ en: "Account ID", bn: "অ্যাকাউন্ট আইডি" })}</p>
            <p className="acct-setting-value"><code lang="en" dir="ltr">{account.userId}</code></p>
            <p className="acct-hint">{t({ en: "Needed only when connecting a supporter. It is not a password.", bn: "শুধু সহায়তাকারী যুক্ত করার সময় লাগে। এটি পাসওয়ার্ড নয়।" })}</p>
          </div>
          <button type="button" className="acct-btn acct-btn-sm" onClick={() => void navigator.clipboard.writeText(account.userId).then(() => setCopied(true), () => undefined)}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : t({ en: "Copy ID", bn: "আইডি কপি করুন" })}
          </button>
        </li>

        <li className="acct-setting">
          <span className="acct-fact-icon" aria-hidden="true"><LogOut size={18} strokeWidth={1.75} /></span>
          <div className="acct-setting-body">
            <p className="acct-setting-label">{t({ en: "Sign out", bn: "সাইন আউট" })}</p>
            <p className="acct-hint">{t({ en: "Use this on a shared phone. Your saved records stay in your account.", bn: "অন্যের সঙ্গে ভাগ করা ফোনে এটি ব্যবহার করুন। আপনার সংরক্ষিত তথ্য অ্যাকাউন্টেই থাকবে।" })}</p>
          </div>
          <SignOutButton className="acct-btn acct-btn-sm acct-btn-danger" />
        </li>
      </ul>
    </section>
  );
}

function EmailForm({ act, busy, onCancel, onDone }: { act: Act; busy: boolean; onCancel: () => void; onDone: (ok: boolean, code: string) => void }) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await act({ action: "email", email: value });
    onDone(result.ok, result.code);
  }
  return (
    <form className="acct-inline-form" onSubmit={submit}>
      <label className="acct-field">
        <span>{t({ en: "New email address", bn: "নতুন ইমেইল ঠিকানা" })}</span>
        <input className="acct-input" type="email" required autoFocus autoComplete="email" maxLength={254} lang="en" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} />
        <small>{t({ en: "We send a link to the new address. Nothing changes until you open it.", bn: "নতুন ঠিকানায় একটি লিংক যাবে। সেটি না খোলা পর্যন্ত কিছু বদলাবে না।" })}</small>
      </label>
      <div className="acct-actions">
        <button className="acct-btn acct-btn-primary" disabled={busy || !value.includes("@")}><Mail size={16} aria-hidden="true" />{t({ en: "Send confirmation link", bn: "নিশ্চিতকরণ লিংক পাঠান" })}</button>
        <button type="button" className="acct-btn" onClick={onCancel} disabled={busy}><X size={16} aria-hidden="true" />{t({ en: "Cancel", bn: "বাতিল" })}</button>
      </div>
    </form>
  );
}

function PasswordForm({ act, busy, onCancel, onDone }: { act: Act; busy: boolean; onCancel: () => void; onDone: (ok: boolean, code: string) => void }) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const tooShort = next.length < 12;
  const mismatch = next !== repeat;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!current || tooShort || mismatch) return;
    const result = await act({ action: "password", currentPassword: current, newPassword: next });
    if (result.ok) { setCurrent(""); setNext(""); setRepeat(""); }
    onDone(result.ok, result.code);
  }
  const type = show ? "text" : "password";
  return (
    <form className="acct-inline-form" onSubmit={submit} noValidate>
      <label className="acct-field">
        <span>{t({ en: "Current password", bn: "বর্তমান পাসওয়ার্ড" })}</span>
        <input className="acct-input" type={type} autoFocus autoComplete="current-password" maxLength={128} value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={touched && !current} />
      </label>
      <label className="acct-field">
        <span>{t({ en: "New password", bn: "নতুন পাসওয়ার্ড" })}</span>
        <input className="acct-input" type={type} autoComplete="new-password" maxLength={128} value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={touched && tooShort} aria-describedby="new-password-hint" />
        <small id="new-password-hint" data-error={touched && tooShort || undefined}>{t({ en: "At least 12 characters. A short sentence is easy to remember.", bn: "অন্তত ১২ অক্ষর। ছোট একটি বাক্য মনে রাখা সহজ।" })}</small>
      </label>
      <label className="acct-field">
        <span>{t({ en: "Type the new password again", bn: "নতুন পাসওয়ার্ড আবার লিখুন" })}</span>
        <input className="acct-input" type={type} autoComplete="new-password" maxLength={128} value={repeat} onChange={(e) => setRepeat(e.target.value)} aria-invalid={touched && mismatch} />
        {touched && mismatch && <small data-error>{t({ en: "The two new passwords do not match.", bn: "দুটি নতুন পাসওয়ার্ড মিলছে না।" })}</small>}
      </label>
      <label className="acct-check">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        {t({ en: "Show passwords", bn: "পাসওয়ার্ড দেখান" })}
      </label>
      <div className="acct-actions">
        <button className="acct-btn acct-btn-primary" disabled={busy}><KeyRound size={16} aria-hidden="true" />{busy ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }) : t({ en: "Change password", bn: "পাসওয়ার্ড বদলান" })}</button>
        <button type="button" className="acct-btn" onClick={onCancel} disabled={busy}><X size={16} aria-hidden="true" />{t({ en: "Cancel", bn: "বাতিল" })}</button>
      </div>
    </form>
  );
}
