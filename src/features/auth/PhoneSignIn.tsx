"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/i18n/use-language";

type Step = "phone" | "code";
const copy = {
  "invalid-input": { en: "Enter a Bangladesh mobile number such as 01712345678, and a 6–8 digit code.", bn: "০১৭১২৩৪৫৬৭৮-এর মতো বাংলাদেশি মোবাইল নম্বর এবং ৬–৮ সংখ্যার কোড দিন।" },
  "auth-unconfigured": { en: "Phone sign-up is not set up on this server. No code was sent. Use email instead.", bn: "এই সার্ভারে ফোন নম্বরে সাইন-আপ চালু নেই। কোনো কোড পাঠানো হয়নি। ইমেইল ব্যবহার করুন।" },
  "otp-unavailable": { en: "We could not send a code. No code was sent. Try again later or use email.", bn: "কোড পাঠানো যায়নি। পরে আবার চেষ্টা করুন বা ইমেইল ব্যবহার করুন।" },
  "rate-limited": { en: "Too many requests. Wait a few minutes before asking for another code.", bn: "অনেকবার অনুরোধ হয়েছে। নতুন কোড চাওয়ার আগে কয়েক মিনিট অপেক্ষা করুন।" },
  "verification-failed": { en: "The code is wrong or has expired. Check the code, or ask for a new one.", bn: "কোডটি ভুল বা মেয়াদোত্তীর্ণ। কোডটি দেখে নিন, বা নতুন কোড চান।" },
  "request-denied": { en: "This request was refused. Reload the page and try again.", bn: "অনুরোধটি গ্রহণ করা হয়নি। পাতাটি রিলোড করে আবার চেষ্টা করুন।" },
  unavailable: { en: "Could not reach PROHOR. Check your connection. Nothing was sent.", bn: "প্রহরে পৌঁছানো যায়নি। সংযোগ দেখুন। কিছুই পাঠানো হয়নি।" },
} as const;

/** Local number → E.164 the server expects (+8801XXXXXXXXX). Returns "" when it cannot be that shape. */
function toE164(raw: string) {
  const digits = raw.replace(/[\s\-()]/g, "");
  const local = digits.startsWith("+880") ? digits.slice(4) : digits.startsWith("880") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^1[3-9][0-9]{8}$/.test(local) ? `+880${local}` : "";
}

export function PhoneSignIn({ next = "/app" }: { next?: string }) {
  const { language } = useLanguage();
  const t = (en: string, bn: string) => (language === "bn" ? bn : en);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);

  async function call(body: object) {
    setBusy(true); setCode(""); setError(false);
    try {
      const response = await fetch("/api/auth/phone", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await response.json().catch(() => ({}))) as { code?: string };
      return { ok: response.ok, code: data.code ?? "unavailable" };
    } catch { return { ok: false, code: "unavailable" }; }
    finally { setBusy(false); requestAnimationFrame(() => status.current?.focus()); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const e164 = toE164(phone);
    if (!e164) { setCode("invalid-input"); setError(true); requestAnimationFrame(() => status.current?.focus()); return; }
    if (step === "phone") {
      const result = await call({ action: "request", phone: e164 });
      if (result.ok) { setStep("code"); setCode("otp-requested"); } else { setCode(result.code); setError(true); }
      return;
    }
    const result = await call({ action: "verify", phone: e164, token: token.trim() });
    if (result.ok) window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/app");
    else { setCode(result.code); setError(true); }
  }

  const message = code === "otp-requested"
    // The server reports delivered:false; only say a code was requested, never that it arrived.
    ? t("A code was requested. It may take a minute and is not guaranteed to arrive. Enter it below; it expires after a short time.", "কোড চাওয়া হয়েছে। আসতে এক মিনিট লাগতে পারে, আসবেই এমন নিশ্চয়তা নেই। নিচে লিখুন; কিছুক্ষণ পরে মেয়াদ শেষ হয়।")
    : code ? t(copy[code as keyof typeof copy]?.en ?? copy.unavailable.en, copy[code as keyof typeof copy]?.bn ?? copy.unavailable.bn) : "";

  return (
    <div className="pro-shell pro-section max-w-xl">
      <h1 className="pro-editorial text-3xl">{t("Continue with your phone number", "ফোন নম্বর দিয়ে এগোন")}</h1>
      <p className="pro-muted mt-3">{t("You create and own this account. Nobody who helps you gets access to your records unless you choose to share them later.", "এই অ্যাকাউন্ট আপনার, আপনিই এটির মালিক। সাহায্যকারী কেউ আপনার রেকর্ড দেখতে পাবেন না, যতক্ষণ না আপনি নিজে পরে ভাগ করতে চান।")}</p>
      <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
        <div className="grid gap-1">
          <label htmlFor="phone-number" className="font-semibold">{t("Mobile number", "মোবাইল নম্বর")}</label>
          <input id="phone-number" name="phone" type="tel" inputMode="tel" autoComplete="tel" required readOnly={step === "code"}
            value={phone} onChange={event => setPhone(event.currentTarget.value)} aria-describedby="phone-hint" aria-invalid={error && !toE164(phone) ? true : undefined}
            className="min-h-12 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base" />
          <p id="phone-hint" className="text-sm text-pro-muted">{t("Bangladesh mobile, for example 01712345678.", "বাংলাদেশি মোবাইল নম্বর, যেমন ০১৭১২৩৪৫৬৭৮।")}</p>
        </div>
        {step === "code" && (
          <div className="grid gap-1">
            <label htmlFor="phone-code" className="font-semibold">{t("Code from the SMS", "এসএমএসের কোড")}</label>
            <input id="phone-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required autoFocus
              value={token} onChange={event => setToken(event.currentTarget.value.replace(/\D/g, ""))} aria-describedby="phone-code-hint" aria-invalid={error ? true : undefined}
              className="min-h-12 rounded-field border border-pro-control-border bg-pro-bg px-3 text-base tracking-widest" />
            <p id="phone-code-hint" className="text-sm text-pro-muted">{t("6 to 8 digits. You can paste it.", "৬ থেকে ৮ সংখ্যা। পেস্ট করতে পারেন।")}</p>
          </div>
        )}
        <p ref={status} tabIndex={-1} role={error ? "alert" : "status"} className="min-h-6 font-semibold">{message}</p>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="pro-btn pro-btn-primary">
            {busy ? t("Please wait…", "অপেক্ষা করুন…") : step === "phone" ? t("Send code", "কোড পাঠান") : t("Verify and continue", "যাচাই করে এগোন")}
          </button>
          {step === "code" && <>
            <button type="button" disabled={busy} className="pro-btn pro-btn-secondary" onClick={async () => { const r = await call({ action: "request", phone: toE164(phone) }); if (r.ok) setCode("otp-requested"); else { setCode(r.code); setError(true); } }}>{t("Ask for a new code", "নতুন কোড চান")}</button>
            <button type="button" className="pro-btn pro-btn-secondary" onClick={() => { setStep("phone"); setToken(""); setCode(""); }}>{t("Change number", "নম্বর বদলান")}</button>
          </>}
        </div>
      </form>
      <section aria-labelledby="assisted-title" className="mt-8 rounded-card border border-pro-border p-4" lang={language}>
        <h2 id="assisted-title" className="text-lg font-bold">{t("Is a care worker helping you?", "কোনো সেবাকর্মী কি আপনাকে সাহায্য করছেন?")}</h2>
        <p className="mt-2">{t("They can explain the steps, but you enter your own number and your own code, so the account stays yours. Helper-started registration is not available yet. Being a helper never gives access to your health records; you decide about sharing later in Bondhon.", "তিনি ধাপগুলো বুঝিয়ে দিতে পারেন, কিন্তু নম্বর ও কোড আপনি নিজেই দেবেন, যাতে অ্যাকাউন্ট আপনারই থাকে। সাহায্যকারীর শুরু করা নিবন্ধন এখনো চালু নেই। সাহায্যকারী হলেই আপনার স্বাস্থ্য রেকর্ডে প্রবেশাধিকার মেলে না; ভাগ করার সিদ্ধান্ত আপনি পরে বন্ধনে নেবেন।")}</p>
      </section>
      <p className="mt-6"><Link className="font-semibold underline" href="/sign-in">{t("Use email instead", "বরং ইমেইল ব্যবহার করুন")}</Link></p>
    </div>
  );
}
