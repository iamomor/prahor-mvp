"use client";
import { useRef, useState, type FormEvent } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { useLanguage } from "@/i18n/use-language";
import {
  ACCESS_CARD_ERROR_COPY, ACCESS_NEED_GROUPS, ACCESS_NEEDS, accessCardSections, parseAccessCard, urgentCardLines,
  type AccessCard, type AccessCardError, type UrgentCardOptions,
} from "../lib/access-card";
import styles from "./access-card.module.css";

const btn = "pro-btn pro-btn-secondary max-w-full whitespace-normal!";
const field = "mt-1 w-full rounded-field border border-pro-control-border bg-pro-elevated p-2 text-pro-text";
const FIELD_OF: Partial<Record<AccessCardError, string>> = {
  name_too_long: "name", helper_name_too_long: "helperName", helper_phone_invalid: "helperPhone", note_too_long: "note",
  no_needs: "needs", unknown_need: "needs",
};

/**
 * Her visit card: what helps her at a clinic, in her words. Kept in memory on this page only —
 * nothing is saved to the device or account, so it cannot reach another person on a shared phone.
 */
export function AccessCardBuilder() {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [needs, setNeeds] = useState<string[]>([]);
  const [text, setText] = useState({ name: "", helperName: "", helperPhone: "", note: "" });
  const [urgent, setUrgent] = useState<UrgentCardOptions>({});
  const [errors, setErrors] = useState<AccessCardError[]>([]);
  const [card, setCard] = useState<AccessCard | null>(null);
  const [message, setMessage] = useState("");
  const errorBox = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLHeadingElement>(null);

  const invalid = (name: string) => errors.some(code => FIELD_OF[code] === name);
  const describedBy = (name: string) => (invalid(name) ? "access-card-errors" : undefined);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = parseAccessCard({ needs, ...text });
    if (!result.ok) {
      setErrors(result.errors); setCard(null);
      requestAnimationFrame(() => errorBox.current?.focus());
      return;
    }
    setErrors([]); setCard(result.card);
    setMessage(bn ? "আপনার কার্ড তৈরি হয়েছে। নিচে দেখুন।" : "Your card is ready. See it below.");
    requestAnimationFrame(() => preview.current?.focus());
  }

  const textInput = (name: keyof typeof text, label: string, extra: object = {}) => (
    <label className="block text-sm font-semibold text-pro-text" lang={language}>
      {label}
      <input name={name} value={text[name]} onChange={e => setText({ ...text, [name]: e.target.value })}
        aria-invalid={invalid(name) || undefined} aria-describedby={describedBy(name)} className={field} {...extra} />
    </label>
  );
  const urgentLines = card ? { bn: urgentCardLines({ ...urgent, contactName: card.helperName, contactPhone: card.helperPhone }, "bn"),
    en: urgentCardLines({ ...urgent, contactName: card.helperName, contactPhone: card.helperPhone }, "en") } : null;

  return (
    <AppCard as="section" aria-labelledby="access-card-title">
      <h2 id="access-card-title" className="text-base font-semibold text-pro-text" lang={language}>
        {bn ? "আমার সাক্ষাৎ কার্ড" : "My visit card"}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-pro-muted" lang={language}>
        {bn
          ? "যা আপনাকে সাহায্য করে তা বেছে নিন, তারপর প্রিন্ট করে বা ফোনে দেখান। এটি কোথাও সংরক্ষণ হয় না। এটি কোনো মেডিকেল রেকর্ড নয়।"
          : "Choose what helps you, then print it or show it on your phone. It is not saved anywhere. This card is not a medical record."}
      </p>

      <form className="mt-4 grid gap-4" onSubmit={submit} noValidate>
        {errors.length > 0 && (
          <div ref={errorBox} id="access-card-errors" role="alert" tabIndex={-1}
            className="rounded-field border border-pro-danger p-3 text-sm text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus">
            <p className="font-semibold" lang={language}>{bn ? "কার্ড তৈরির আগে এগুলো ঠিক করুন:" : "Please fix these before making your card:"}</p>
            <ul className="list-disc ps-5">{errors.map(code => <li key={code} lang={language}>{ACCESS_CARD_ERROR_COPY[code][language]}</li>)}</ul>
          </div>
        )}
        {ACCESS_NEED_GROUPS.map(group => (
          <fieldset key={group.id} aria-describedby={describedBy("needs")} className="rounded-field border border-pro-control-border p-3">
            <legend className="px-1 text-sm font-semibold text-pro-text" lang={language}>{group[language]}</legend>
            <div className="grid gap-2">
              {ACCESS_NEEDS.filter(need => need.group === group.id).map(need => (
                <label key={need.id} className="flex cursor-pointer items-start gap-3 rounded-field p-2 hover:bg-pro-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pro-focus">
                  <input type="checkbox" className="mt-1 accent-pro-primary" checked={needs.includes(need.id)}
                    onChange={e => setNeeds(e.target.checked ? [...needs, need.id] : needs.filter(id => id !== need.id))} />
                  <span lang={language}>{need[language]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <p className="text-sm text-pro-muted" lang={language}>{bn ? "নিচের ঘরগুলো ঐচ্ছিক।" : "The boxes below are optional."}</p>
        {textInput("name", bn ? "আপনার নাম" : "Your name", { maxLength: 120, autoComplete: "name" })}
        {textInput("helperName", bn ? "সহায়কের নাম" : "Helper's name", { maxLength: 120 })}
        {textInput("helperPhone", bn ? "সহায়কের ফোন নম্বর" : "Helper's phone number", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
        <label className="block text-sm font-semibold text-pro-text" lang={language}>
          {bn ? "আপনার নিজের কথায় (ঐচ্ছিক, ৩০০ অক্ষর পর্যন্ত)" : "In your own words (optional, up to 300 characters)"}
          <textarea name="note" rows={3} value={text.note} onChange={e => setText({ ...text, note: e.target.value })}
            aria-invalid={invalid("note") || undefined} aria-describedby={describedBy("note")} className={field} />
        </label>
        <fieldset className="rounded-field border border-pro-control-border p-3">
          <legend className="px-1 text-sm font-semibold text-pro-text" lang={language}>{bn ? "জরুরি কার্ডে যোগ করুন (ঐচ্ছিক)" : "Add to the urgent card (optional)"}</legend>
          {([["", bn ? "কিছু না" : "Nothing"], ["pregnant", bn ? "আমি গর্ভবতী" : "I am pregnant"], ["recently-gave-birth", bn ? "আমি সম্প্রতি সন্তান জন্ম দিয়েছি" : "I gave birth recently"]] as const).map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 p-2">
              <input type="radio" name="urgent-stage" className="accent-pro-primary" checked={(urgent.stage ?? "") === value}
                onChange={() => setUrgent({ ...urgent, stage: value || undefined })} />
              <span lang={language}>{label}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 p-2">
            <input type="checkbox" className="accent-pro-primary" checked={urgent.cannotHear === true}
              onChange={e => setUrgent({ ...urgent, cannotHear: e.target.checked })} />
            <span lang={language}>{bn ? "আমি শুনতে পাই না — লিখে বা দেখিয়ে বলুন" : "I cannot hear — please write or show me"}</span>
          </label>
        </fieldset>
        <button type="submit" className="pro-btn pro-btn-primary max-w-full justify-self-start whitespace-normal!" lang={language}>
          {bn ? "আমার কার্ড তৈরি করুন" : "Make my card"}
        </button>
      </form>

      <InlineLiveRegion message={message} />
      {card && urgentLines && (
        <div className="mt-4 grid gap-4">
          <div className={`${styles.printCard} rounded-field border border-pro-border p-4`}>
            <h3 ref={preview} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">
              <span lang="bn">আমার সাক্ষাৎ কার্ড</span> / <span lang="en">MY VISIT CARD</span>
            </h3>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {(["bn", "en"] as const).map(lang => (
                <div key={lang} lang={lang} className="min-w-0">
                  {card.name && <p><strong>{lang === "bn" ? "নাম" : "Name"}:</strong> {card.name}</p>}
                  {accessCardSections(card, lang).map(section => (
                    <section key={section.id} className="mt-2">
                      <h4 className="font-semibold">{section.title}</h4>
                      <ul className="list-disc ps-5">{section.items.map(item => <li key={item}>{item}</li>)}</ul>
                    </section>
                  ))}
                  {card.note && <p className="mt-2"><strong>{lang === "bn" ? "আমার কথায়" : "In my words"}:</strong> {card.note}</p>}
                  {(card.helperName || card.helperPhone) && (
                    <p className="mt-2"><strong>{lang === "bn" ? "আমার সহায়ক" : "My helper"}:</strong> {[card.helperName, card.helperPhone].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm"><span lang="bn">এটি কোনো মেডিকেল রেকর্ড নয়।</span> <span lang="en">This card is not a medical record.</span></p>
            <section aria-labelledby="urgent-card-title" className="mt-4 rounded-field border-2 border-pro-danger p-3">
              <h4 id="urgent-card-title" className="font-semibold"><span lang="bn">জরুরি কার্ড</span> / <span lang="en">Urgent card</span></h4>
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <ul lang="bn">{urgentLines.bn.map(line => <li key={line}>{line}</li>)}</ul>
                <ul lang="en">{urgentLines.en.map(line => <li key={line}>{line}</li>)}</ul>
              </div>
            </section>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => window.print()} lang={language}>{bn ? "কার্ড প্রিন্ট করুন" : "Print card"}</button>
            <button type="button" className={btn} lang={language}
              onClick={() => { setCard(null); setMessage(bn ? "কার্ড মুছে ফেলা হয়েছে।" : "Card cleared."); }}>
              {bn ? "কার্ড মুছুন" : "Clear card"}
            </button>
          </div>
        </div>
      )}
    </AppCard>
  );
}
