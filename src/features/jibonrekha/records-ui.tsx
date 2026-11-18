"use client";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
export const card = "grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]";
export const control = "min-h-12 w-full min-w-0 max-w-full rounded-field border border-pro-control-border bg-pro-bg px-3 py-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
export const button = "min-h-12 whitespace-normal rounded-control border border-pro-primary px-4 py-3 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus disabled:opacity-60";
export const primary = `${button.replace("text-pro-primary", "text-pro-on-primary")} bg-pro-primary`;
export function Field({ name, label, value = "", type = "text", required = false, hint }: { name: string; label: string; value?: string; type?: string; required?: boolean; hint?: string }) {
  const id = useId();
  return <div className="grid min-w-0 gap-2"><label htmlFor={id} className="font-semibold">{label}{required ? " (required)" : " (optional)"}</label><input id={id} name={name} type={type} defaultValue={value} required={required} className={control} aria-describedby={hint ? `${id}-hint` : undefined} />{hint && <p id={`${id}-hint`} className="text-pro-muted">{hint}</p>}</div>;
}
export function Choice({ name, label, value, options }: { name: string; label: string; value: string; options: Record<string, string> }) {
  const id = useId();
  return <div className="grid min-w-0 gap-2"><label htmlFor={id} className="font-semibold">{label}</label><select id={id} name={name} defaultValue={value} className={control}>{Object.entries(options).map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></div>;
}
export function RecordForm({ title, children, onSave, reset = false, saveLabel = "সংরক্ষণ করুন · Save on this device" }: { title: string; children: ReactNode; onSave: (data: FormData) => void; reset?: boolean; saveLabel?: string }) {
  const id = useId(), errorRef = useRef<HTMLParagraphElement>(null);
  const [feedback, setFeedback] = useState({ error: false, text: "" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    try { onSave(new FormData(form)); setFeedback({ error: false, text: "Saved on this device — not sent. Fictional demo only." }); if (reset) form.reset(); }
    catch (error) { setFeedback({ error: true, text: error instanceof z.ZodError ? error.issues.map(issue => `${issue.path.join(" ")}: ${issue.message}`).join(" ") : error instanceof Error ? error.message : "Not saved. Check your entries and try again." }); requestAnimationFrame(() => errorRef.current?.focus()); }
  }
  return <form onSubmit={submit} noValidate aria-labelledby={id} className={card}><h2 id={id} className="text-2xl font-semibold">{title}</h2>{children}<button type="submit" className={primary}>{saveLabel}</button><p ref={errorRef} tabIndex={-1} role={feedback.error ? "alert" : "status"} className={feedback.error ? "text-pro-danger" : "text-pro-text"}>{feedback.text}</p></form>;
}
export const read = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
