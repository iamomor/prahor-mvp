"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AACComposer } from "@/features/adapt";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import { shonketConcernTypes, shonketOnsetValues, shonketRequestSchema, type ShonketRequest } from "@/lib/contracts/shonket-requests";
import styles from "./shonket.module.css";

export function ConcernForm() {
  const { language, t } = useLanguage();
  const copy = translations.shonket;
  const [step, setStep] = useState<"compose" | "review" | "submitted">("compose");
  const [concerns, setConcerns] = useState<Array<(typeof shonketConcernTypes)[number]>>([]);
  const [onset, setOnset] = useState<(typeof shonketOnsetValues)[number] | null>(null);
  const [method, setMethod] = useState<"text" | "aac" | "call" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<"not-sent" | "unconfirmed" | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<ShonketRequest | null>(null);
  const retryKey = useRef<string | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => { if (previousStep.current !== step) { previousStep.current = step; headingRef.current?.focus(); } }, [step]);

  function toggleConcern(value: (typeof shonketConcernTypes)[number]) {
    setConcerns(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  }
  function insertAac(text: string) {
    const next = `${message}${message ? " " : ""}${text}`;
    if (next.length > 1000) { setError(t(copy.form.aacLimitError)); messageRef.current?.focus(); return; }
    setMessage(next); setError("");
  }
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setErrorKind(null);
    if (!method) { setError(t(copy.form.chooseMethodError)); return; }
    if (!message.trim() || message.trim().length > 1000) { setError(t(copy.form.messageLengthError)); messageRef.current?.focus(); return; }
    setMessage(message.trim()); setStep("review");
  }
  async function submit() {
    if (busy || !method) return;
    retryKey.current ??= crypto.randomUUID();
    setBusy(true); setError(""); setErrorKind(null);
    try {
      const response = await fetch("/api/care-requests", {
        method: "POST", cache: "no-store",
        headers: { "Content-Type": "application/json", "Idempotency-Key": retryKey.current },
        body: JSON.stringify({ message, method, concernTypes: concerns, onset, language, reviewConfirmed: true }),
      });
      const body = await response.json().catch(() => null) as { data?: unknown; error?: { message?: string } } | null;
      const parsed = shonketRequestSchema.safeParse(body?.data);
      if (!response.ok || !parsed.success) {
        const uncertain = response.status >= 500 || response.status === 409 || response.ok;
        setErrorKind(uncertain ? "unconfirmed" : "not-sent");
        setError(uncertain ? t(copy.form.unconfirmed) : t(copy.form.notSent));
        return;
      }
      setSaved(parsed.data); retryKey.current = null; setStep("submitted");
    } catch {
      setErrorKind("unconfirmed");
      setError(t(copy.form.unconfirmed));
    } finally { setBusy(false); }
  }

  return <div className={styles.experience} lang={language}>
    <NetworkStatus message={t(copy.offline.care)} />
    <header className={styles.pageHeader}>
      <p className={styles.eyebrow}>{t(copy.form.eyebrow)}</p>
      <h1 ref={headingRef} id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{step === "submitted" ? t(copy.form.statusTitle) : step === "review" ? t(copy.form.reviewTitle) : t(copy.form.title)}</h1>
      <p className={styles.lead}>{t(copy.form.lead)}</p>
    </header>
    <aside className={styles.warningNotice} aria-label="Emergency help">
      <strong>{t(copy.form.urgentTitle)}</strong><span>{t(copy.form.urgentText)} <Link href="/safety">{t(copy.nav.safetyInformation)}</Link>.</span>
    </aside>
    {error && <p role={errorKind === "unconfirmed" ? "status" : "alert"} className="rounded-field border border-pro-warning bg-pro-warning-soft p-4">{error}</p>}
    {step === "compose" && <form className="grid max-w-3xl gap-6" onSubmit={review} noValidate>
      <fieldset className="grid gap-3 rounded-card border border-pro-border p-4">
        <legend className="px-1 font-semibold">{t(copy.form.concerns)} <span className="font-normal text-pro-muted">{t(copy.form.optionalNotDiagnosis)}</span></legend>
        <div className="grid gap-2 sm:grid-cols-2">{shonketConcernTypes.map(value => <label key={value} className="flex min-h-12 items-center gap-3 rounded-field border border-pro-border p-3">
          <input type="checkbox" value={value} checked={concerns.includes(value)} onChange={() => toggleConcern(value)} disabled={!concerns.includes(value) && concerns.length >= 9} className="size-5 accent-pro-primary" />
          <span>{t(copy.values.concerns[value])}</span>
        </label>)}</div><p className="text-sm text-pro-muted">{t(copy.form.selected)} {concerns.length} {t(copy.form.of)} 9.</p>
      </fieldset>
      <fieldset className="grid gap-3 rounded-card border border-pro-border p-4">
        <legend className="px-1 font-semibold">{t(copy.form.sinceWhen)} <span className="font-normal text-pro-muted">{t(copy.form.optionalNoTriage)}</span></legend>
        {shonketOnsetValues.map(value => <label key={value} className="flex min-h-11 items-center gap-3"><input type="radio" name="onset" checked={onset === value} onChange={() => setOnset(value)} className="size-5 accent-pro-primary" />{t(copy.values.onset[value])}</label>)}
        {onset && <button type="button" className="w-fit min-h-11 underline" onClick={() => setOnset(null)}>{t(copy.form.clearOnset)}</button>}
      </fieldset>
      <fieldset className="grid gap-3 rounded-card border border-pro-border p-4">
        <legend className="px-1 font-semibold">{t(copy.form.contactMethod)} <span aria-hidden="true">*</span><span className="sr-only"> {t(copy.form.required)}</span></legend>
        {(["text", "aac", "call"] as const).map(value => <label key={value} className="flex min-h-11 items-center gap-3"><input type="radio" name="contact-method" value={value} checked={method === value} onChange={() => { setMethod(value); setError(""); }} className="size-5 accent-pro-primary" />{t(copy.values.method[value])}</label>)}
      </fieldset>
      {method === "aac" && <AACComposer onInsert={insertAac} targetLabel={t({ en: "Insert into message", bn: "বার্তায় যুক্ত করুন" })} />}
      <section className="grid gap-2" aria-labelledby="concern-message-heading">
        <h2 id="concern-message-heading" className="text-lg font-semibold">{t(copy.form.message)} <span aria-hidden="true">*</span><span className="sr-only"> {t(copy.form.required)}</span></h2>
        <label htmlFor="concern-message">{t(copy.form.messageHint)}</label>
        <textarea ref={messageRef} id="concern-message" value={message} onChange={event => { setMessage(event.currentTarget.value); setError(""); }} maxLength={1000} required aria-invalid={Boolean(error && !message.trim())} aria-describedby="concern-message-count" className="min-h-36 rounded-field border border-pro-control-border bg-pro-bg p-3 focus-visible:outline-3 focus-visible:outline-pro-focus" />
        <p id="concern-message-count" className="text-sm text-pro-muted">{new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-BD").format(message.length)}/1,000 {t(copy.form.chars)}</p>
      </section>
      <p className="text-sm text-pro-muted">{t(copy.form.legalPending)}</p>
      <button type="submit" className="pro-btn pro-btn-primary w-fit">{t(copy.form.reviewButton)}</button>
    </form>}
    {step === "review" && <section className="grid max-w-3xl gap-5" aria-labelledby="review-title">
      <h2 id="review-title" className="text-xl font-semibold">{t(copy.form.reviewDetails)}</h2>
      <dl className="grid gap-3 rounded-card border border-pro-border p-4">
        <div><dt className="font-semibold">{t(copy.form.concerns)}</dt><dd>{concerns.length ? concerns.map(value => t(copy.values.concerns[value])).join(", ") : t(copy.form.noneSelected)}</dd></div>
        <div><dt className="font-semibold">{t(copy.form.sinceWhen)}</dt><dd>{onset ? t(copy.values.onset[onset]) : t(copy.form.notSelected)}</dd></div>
        <div><dt className="font-semibold">{t(copy.form.message)}</dt><dd className="whitespace-pre-wrap">{message}</dd></div>
        <div><dt className="font-semibold">{t(copy.form.contactMethod)}</dt><dd>{method ? t(copy.values.method[method]) : t(copy.form.notSelected)}</dd></div>
      </dl>
      <ul className="list-disc space-y-2 pl-5">
        <li>{t(copy.form.privacy1)}</li><li>{t(copy.form.privacy2)}</li><li>{t(copy.form.privacy3)}</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setStep("compose")} disabled={busy || errorKind === "unconfirmed"}>{t(copy.form.edit)}</button>
        <button type="button" className="pro-btn pro-btn-primary" onClick={() => void submit()} disabled={busy}>{busy ? t(copy.form.sending) : errorKind === "unconfirmed" ? t(copy.form.retry) : t(copy.form.send)}</button>
      </div>
    </section>}
    {step === "submitted" && saved && <section className="grid max-w-3xl gap-4 rounded-card border border-pro-border p-5" aria-labelledby="saved-request-title">
      <h2 id="saved-request-title" className="text-xl font-semibold">{t(copy.form.submitted)}</h2>
      <p role="status">{t(copy.form.saved)}</p>
      <p className="break-all font-mono text-sm">{t(copy.form.requestId)}: {saved.id}</p>
      <div className="flex flex-wrap gap-3"><Link href="/app/care/requests" className="pro-btn pro-btn-primary">{t(copy.form.viewRequests)}</Link><Link href="/safety" className="pro-btn pro-btn-secondary">{t(copy.form.safetyHelp)}</Link></div>
    </section>}
  </div>;
}
