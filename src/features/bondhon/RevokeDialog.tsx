"use client";
import { useEffect, useId, useRef } from "react";
import { useLanguage } from "@/i18n/use-language";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

export type DialogAction = "revoke" | "close" | "discard" | "revoke_all";
const copy = {
  revoke: { title: words("Stop future sharing?", "ভবিষ্যতের শেয়ার বন্ধ করবেন?"), body: words("This stops future provider access and messages for this request. Previously seen information and the consent history remain.", "এতে এই অনুরোধে সেবাদাতার ভবিষ্যতের প্রবেশ ও বার্তা বন্ধ হবে। আগে দেখা তথ্য ও সম্মতির ইতিহাস থাকবে।"),
    keep: words("Keep current settings", "বর্তমান সিদ্ধান্ত রাখুন"), go: words("Stop sharing", "শেয়ার বন্ধ করুন") },
  revoke_all: { title: words("Stop sharing for the listed requests?", "দেখানো অনুরোধগুলোর শেয়ার বন্ধ করবেন?"), body: words("This stops future provider access and messages for each listed request. Previously seen information and the consent history remain.", "এতে দেখানো প্রতিটি অনুরোধে সেবাদাতার ভবিষ্যতের প্রবেশ ও বার্তা বন্ধ হবে। আগে দেখা তথ্য ও সম্মতির ইতিহাস থাকবে।"),
    keep: words("Keep sharing", "শেয়ার চালু রাখুন"), go: words("Stop listed sharing", "দেখানো শেয়ার বন্ধ করুন") },
  close: { title: words("Close this request?", "এই অনুরোধ বন্ধ করবেন?"), body: words("Closing ends this request and its provider access. A new request needs a new sharing review.", "বন্ধ করলে এই অনুরোধ ও সেবাদাতার প্রবেশ শেষ হবে। নতুন অনুরোধে নতুন শেয়ার পর্যালোচনা লাগবে।"),
    keep: words("Keep current settings", "বর্তমান সিদ্ধান্ত রাখুন"), go: words("Close request", "অনুরোধ বন্ধ করুন") },
  discard: { title: words("Leave this draft?", "খসড়া ছাড়বেন?"), body: words("Text in this tab will be discarded. If a submission was unconfirmed, check request history before sending a replacement.", "এই ট্যাবের লেখা বাদ যাবে। জমা দেওয়া নিশ্চিত না হলে নতুন অনুরোধ পাঠানোর আগে ইতিহাস দেখুন।"),
    keep: words("Keep editing", "লেখা চালিয়ে যান"), go: words("Discard draft", "খসড়া বাদ দিন") },
} as const;
export function RevokeDialog({ action, busy, onConfirm, onCancel }: {
  action: DialogAction; busy: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const c = copy[action];
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
    <h3 id={`${id}-title`}>{t(c.title)}</h3>
    <p id={`${id}-consequence`}>{t(c.body)}</p>
    <div className={styles.actions}>
      <button ref={keep} type="button" className="pro-btn pro-btn-secondary" disabled={busy} onClick={onCancel}>{t(c.keep)}</button>
      <button type="button" className={`pro-btn pro-btn-primary ${action === "close" ? "" : styles.danger}`} disabled={busy} onClick={onConfirm}>{t(busy ? words("Confirming…", "নিশ্চিত হচ্ছে…") : c.go)}</button>
    </div>
  </dialog>;
}
