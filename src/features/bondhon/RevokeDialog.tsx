"use client";
import { useEffect, useId, useRef } from "react";
import { useLanguage } from "@/i18n/use-language";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

export function RevokeDialog({ action, busy, onConfirm, onCancel }: {
  action: "revoke" | "close"; busy: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const { t } = useLanguage();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    if (element && !element.open) element.showModal();
    keep.current?.focus();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return <dialog ref={dialog} className={styles.confirmDialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-consequence`}
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <h3 id={`${id}-title`}>{t(action === "revoke" ? words("Stop future sharing?", "ভবিষ্যতের শেয়ার বন্ধ করবেন?") : words("Close this request?", "এই অনুরোধ বন্ধ করবেন?"))}</h3>
    <p id={`${id}-consequence`}>{t(action === "revoke" ? words("This stops future provider access and messages for this request. Previously seen information and the consent history remain.", "এতে এই অনুরোধে সেবাদাতার ভবিষ্যতের প্রবেশ ও বার্তা বন্ধ হবে। আগে দেখা তথ্য ও সম্মতির ইতিহাস থাকবে।") : words("Closing ends this request and its provider access. A new request needs a new sharing review.", "বন্ধ করলে এই অনুরোধ ও সেবাদাতার প্রবেশ শেষ হবে। নতুন অনুরোধে নতুন শেয়ার পর্যালোচনা লাগবে।"))}</p>
    <div className={styles.actions}>
      <button ref={keep} type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={onCancel}>{t(words("Keep current settings", "বর্তমান সিদ্ধান্ত রাখুন"))}</button>
      <button type="button" className="pro-btn pro-btn-primary" disabled={busy} onClick={onConfirm}>{t(busy ? words("Confirming…", "নিশ্চিত হচ্ছে…") : action === "revoke" ? words("Revoke future access", "ভবিষ্যতের অনুমতি প্রত্যাহার করুন") : words("Close request", "অনুরোধ বন্ধ করুন"))}</button>
    </div>
  </dialog>;
}
