"use client";

import { useId, useRef, useState, type MouseEvent } from "react";
import { MessageSquareText, Phone, Send, Speech } from "lucide-react";
import Link from "next/link";
import { useCareRequestDraft, updateCareRequestDraft, type CareRequestMethod } from "./care-request-draft";
import styles from "./shonket.module.css";

const methods: { value: CareRequestMethod; label: string; description: string; Icon: typeof MessageSquareText }[] = [
  { value: "text", label: "Text message", description: "Communicate using written text.", Icon: MessageSquareText },
  { value: "aac", label: "AAC-friendly", description: "Use text and communication shortcuts.", Icon: Speech },
  { value: "call", label: "Phone call", description: "A visual choice only in this demo. No call will be placed.", Icon: Phone },
];

const shortcuts = ["I need help.", "I cannot speak right now.", "Please contact me."];

export function AskForHelp() {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draft = useCareRequestDraft();
  const [error, setError] = useState("");
  const methodId = `${id}-method`;
  const messageId = `${id}-message`;
  const errorId = `${id}-error`;

  function insertShortcut(phrase: string) {
    const trimmed = draft.message.trimEnd();
    const next = trimmed ? `${trimmed} ${phrase}` : phrase;
    if (next.length <= 1000) {
      updateCareRequestDraft({ message: next });
      setError("");
      textareaRef.current?.focus();
    } else {
      setError("This shortcut would exceed the 1,000 character limit. Shorten your message first.");
    }
  }

  function continueToReview(event: MouseEvent<HTMLAnchorElement>) {
    if (!draft.message.trim()) {
      event.preventDefault();
      setError("Enter a message before continuing.");
      textareaRef.current?.focus();
      return;
    }
    if (draft.message.length > 1000) {
      event.preventDefault();
      setError("Keep your message to 1,000 characters or fewer.");
      textareaRef.current?.focus();
      return;
    }
    setError("");
  }

  const describedBy = [`${id}-message-help`, error ? errorId : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.experience}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/safety">Shonket home</Link><span aria-hidden="true">/</span><span aria-current="page">Human help</span>
      </nav>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>HUMAN HELP · PREVIEW</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Prepare a message</h1>
        <p className={styles.lead}>Choose how you would prefer to communicate, then write a message to review. This page does not send it.</p>
      </header>
      <ol className={styles.formProgress} aria-label="Care request progress">
        <li aria-current="step"><span className={styles.stepNumber}>1</span><span>Prepare</span></li>
        <li><span className={styles.stepNumber}>2</span><span>Review</span></li>
        <li><span className={styles.stepNumber}>3</span><span>Status</span></li>
      </ol>
      <div className={styles.helpLayout}>
        <form className={styles.helpMain} noValidate onSubmit={event => event.preventDefault()}>
          <fieldset className={styles.methodFieldset}>
            <legend className={styles.fieldLegend}>How would you prefer to communicate?</legend>
            <p className={styles.fieldHint}>Choose one. You can change it before reviewing your message.</p>
            <div className={styles.methodGrid}>
              {methods.map(({ value, label, description, Icon }) => (
                <label key={value} className={`${styles.methodOption} ${draft.method === value ? styles.methodSelected : ""}`}>
                  <input className={styles.radio} id={`${methodId}-${value}`} type="radio" name={methodId} value={value} checked={draft.method === value} onChange={() => updateCareRequestDraft({ method: value })} />
                  <span className={styles.methodIcon}><Icon size={20} aria-hidden="true" /></span>
                  <span className={styles.methodText}><span className={styles.methodTitle}>{label}</span><span className={styles.methodDescription}>{description}</span></span>
                  <span className={styles.radioMark} aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>

          {draft.method === "aac" && (
            <section className={styles.shortcutSection} aria-labelledby={`${id}-shortcuts-title`}>
              <h2 id={`${id}-shortcuts-title`} className={styles.subheading}>Communication shortcuts</h2>
              <p className={styles.fieldHint}>Add a phrase, then edit it in your message if you wish.</p>
              <div className={styles.shortcutList}>
                {shortcuts.map(phrase => <button key={phrase} type="button" className={styles.shortcutButton} onClick={() => insertShortcut(phrase)}>{phrase}</button>)}
              </div>
            </section>
          )}

          <section className={styles.messageComposer} aria-labelledby={`${id}-message-title`}>
            <div className={styles.composerHeading}><div><p className={styles.eyebrow}>YOUR WORDS</p><h2 id={`${id}-message-title`} className={styles.subheading}>What would you like to say?</h2></div><span className={styles.privateMark}>Local draft</span></div>
            <label className={styles.fieldLabel} htmlFor={messageId}>Your message</label>
            <p className={styles.fieldHint} id={`${id}-message-help`}>Write only what you want included in this review. Avoid details you do not want displayed on this screen.</p>
            <textarea ref={textareaRef} id={messageId} className={styles.textarea} value={draft.message} onChange={event => { updateCareRequestDraft({ message: event.target.value }); if (error) setError(""); }} maxLength={1000} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
            <div className={styles.fieldFooter}><span className={styles.fieldHint}>Up to 1,000 characters</span><span className={styles.characterCount}>{draft.message.length}/1,000</span></div>
            {error && <p className={styles.fieldError} id={errorId} role="alert">{error}</p>}
          </section>
          <div className={styles.formFooter}>
            <p className={styles.demoNotice}>Demo only: your draft stays in memory while you navigate. It is not saved after leaving the app.</p>
            <Link href="/app/care/review" onClick={continueToReview} className={`pro-btn pro-btn-primary ${styles.continueButton}`}>Review message <Send size={17} aria-hidden="true" /></Link>
          </div>
        </form>
        <aside className={styles.helpAside} aria-label="About this preview">
          <span className={styles.asideIcon}><HeartHandshakeIcon /></span>
          <p className={styles.eyebrow}>A NOTE ABOUT THIS PREVIEW</p>
          <p>This message is not sent to a care worker. The phone-call choice is visual only.</p>
          <Link href="/safety">Return to Shonket</Link>
        </aside>
      </div>
    </div>
  );
}

function HeartHandshakeIcon() {
  return <MessageSquareText size={21} aria-hidden="true" />;
}
