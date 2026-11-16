"use client";
import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function EmailSignIn() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const client = createBrowserSupabase();
      if (!client) {
        setMessage("Authentication is not configured. This is a UI preview; no account was created.");
        return;
      }
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", "/");
      const { error } = await client.auth.signInWithOtp({
        email, options: { emailRedirectTo: redirectTo.href },
      });
      setMessage(error
        ? "Sign-in email could not be sent. Please try again."
        : "Check your email for a secure sign-in link.");
    } catch {
      setMessage("Sign-in email could not be sent. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pro-card space-y-5">
      <div className="pro-field">
        <label htmlFor="email" className="font-semibold">Email address</label>
        <input className="pro-input" id="email" type="email" autoComplete="email" required
          value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
      </div>
      <button disabled={busy} className="pro-btn pro-btn-primary w-full">
        {busy ? "Sending…" : "Continue with email"}
      </button>
      {message && <p role="status" className="pro-note text-sm">{message}</p>}
      <p className="pro-muted text-sm">
        The real application will use secure authentication before accessing private health records.
        Email verification depends on your Supabase configuration.
      </p>
    </form>
  );
}
