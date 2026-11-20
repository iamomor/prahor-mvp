"use client";
import { useLanguage } from "@/i18n/use-language";
import type { AccountAccess, SupporterConnection, SupporterScope } from "@/lib/contracts/account";
import {
  ArrowRight, Ban, Check, CircleCheck, CircleSlash, Clock, Copy, Eye, EyeOff, HeartHandshake, KeyRound, Lock, Send, UserPlus, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { accountMessage, helpAreaGroups, helpAreas } from "./account-copy";
import type { Act } from "./types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function SupportersPanel({ account, connections, act, busy }: {
  account: AccountAccess; connections: SupporterConnection[]; act: Act; busy: boolean;
}) {
  const { t, language } = useLanguage();
  const isMother = account.activeRole === "mother";
  const [inviting, setInviting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; code: string } | null>(null);
  const [invitation, setInvitation] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const live = connections.filter((c) => c.status === "active" || c.status === "pending");
  const ended = connections.filter((c) => c.status === "revoked" || c.status === "expired");
  const until = (iso: string) => new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(iso));

  function announce(ok: boolean, code: string) {
    setStatus({ ok, code: code });
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  async function revoke(c: SupporterConnection, name: string) {
    const question = isMother
      ? t({ en: `Stop ${name}'s access? They will no longer be connected to you.`, bn: `${name}-এর সহায়তা বন্ধ করবেন? তিনি আর আপনার সঙ্গে যুক্ত থাকবেন না।` })
      : t({ en: `Leave ${name}'s support circle?`, bn: `${name}-এর সহায়তাকারী তালিকা থেকে সরে যাবেন?` });
    if (!window.confirm(question)) return;
    const result = await act({ action: "revoke", connectionId: c.id });
    announce(result.ok, result.ok ? "saved" : result.code);
  }

  const statusPill = (value: SupporterConnection["status"]) => {
    const map = {
      active: { tone: "ok", Icon: CircleCheck, text: t({ en: "Connected", bn: "যুক্ত আছেন" }) },
      pending: { tone: "wait", Icon: Clock, text: t({ en: "Invitation not accepted yet", bn: "আমন্ত্রণ এখনও গ্রহণ করেননি" }) },
      revoked: { tone: "off", Icon: CircleSlash, text: t({ en: "Stopped", bn: "বন্ধ করা হয়েছে" }) },
      expired: { tone: "off", Icon: CircleSlash, text: t({ en: "Expired", bn: "মেয়াদ শেষ" }) },
    }[value];
    return <span className="acct-pill" data-tone={map.tone}><map.Icon size={14} aria-hidden="true" />{map.text}</span>;
  };

  const person = (c: SupporterConnection) => {
    const name = isMother ? c.supporterName || t({ en: "Supporter", bn: "সহায়তাকারী" }) : c.motherName || t({ en: "Mother", bn: "মা" });
    return (
      <li key={c.id} className="acct-person" data-ended={c.status === "revoked" || c.status === "expired" || undefined}>
        <span className="acct-person-avatar acct-person-initial" aria-hidden="true">{name.trim().charAt(0).toUpperCase() || "•"}</span>
        <div className="acct-person-body">
          <p className="acct-person-name">{name}</p>
          <div className="acct-person-meta">{statusPill(c.status)}
            {(c.status === "active" || c.status === "pending") && <span>{t({ en: "Until", bn: "মেয়াদ" })}: {until(c.expiresAt)}</span>}
          </div>
          <ul className="acct-area-chips" aria-label={isMother ? t({ en: "Helps you with", bn: "যে কাজে সহায়তা করেন" }) : t({ en: "She asked for help with", bn: "তিনি যে কাজে সাহায্য চেয়েছেন" })}>
            {c.scopes.map((s) => {
              const area = helpAreas.find((a) => a.id === s);
              return area ? <li key={s} className="acct-chip"><area.icon size={14} aria-hidden="true" />{t(area.label)}</li> : null;
            })}
          </ul>
        </div>
        {(c.status === "active" || c.status === "pending") && (
          <button type="button" className="acct-btn acct-btn-sm acct-btn-danger" disabled={busy} onClick={() => void revoke(c, name)}>
            <Ban size={15} aria-hidden="true" />
            {isMother ? (c.status === "pending" ? t({ en: "Cancel invitation", bn: "আমন্ত্রণ বাতিল করুন" }) : t({ en: "Stop access", bn: "সহায়তা বন্ধ করুন" }))
              : t({ en: "Leave", bn: "সরে যান" })}
            <span className="sr-only"> · {name}</span>
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="grid gap-6">
      <section className="acct-card" aria-labelledby="acct-supporters-title">
        <div className="acct-card-head">
          <div className="grid gap-1">
            <h2 id="acct-supporters-title" className="acct-h2">
              {isMother ? t({ en: "Your supporters", bn: "আপনার সহায়তাকারী" }) : t({ en: "Mothers you support", bn: "যে মায়েদের সহায়তা করছেন" })}
            </h2>
            <p className="acct-hint">{isMother
              ? t({ en: "Family or friends who help you during pregnancy and after birth. You decide who, with what, and for how long.", bn: "গর্ভকালে ও সন্তান জন্মের পর যাঁরা আপনাকে সাহায্য করেন — পরিবার বা বন্ধু। কে, কোন কাজে, কতদিন — সব আপনিই ঠিক করেন।" })
              : t({ en: "A mother adds you with a one-time invitation code. You only see what she asked you to help with.", bn: "একজন মা একবার ব্যবহারযোগ্য আমন্ত্রণ কোড দিয়ে আপনাকে যুক্ত করেন। তিনি যে কাজে সাহায্য চেয়েছেন, শুধু সেটুকুই দেখবেন।" })}</p>
          </div>
          {isMother && !inviting && (
            <button ref={openButton} type="button" className="acct-btn acct-btn-primary" onClick={() => { setInviting(true); setStatus(null); setInvitation(""); }}>
              <UserPlus size={17} aria-hidden="true" />{t({ en: "Add a supporter", bn: "সহায়তাকারী যোগ করুন" })}
            </button>
          )}
        </div>
        <p ref={statusRef} tabIndex={-1} role={status && !status.ok ? "alert" : "status"} className="acct-status" data-tone={status ? (status.ok ? "ok" : "error") : undefined}>{status && accountMessage(status.code, t)}</p>

        {invitation && <InvitationCode code={invitation} onDone={() => { setInvitation(""); requestAnimationFrame(() => openButton.current?.focus()); }} />}

        {isMother && inviting && (
          <InviteForm act={act} busy={busy}
            onCancel={() => { setInviting(false); requestAnimationFrame(() => openButton.current?.focus()); }}
            onCreated={(code) => { setInviting(false); setInvitation(code); }}
            onError={(code) => announce(false, code)} />
        )}
        {!isMother && <AcceptForm account={account} act={act} busy={busy} onResult={announce} />}

        {live.length > 0 ? (
          <ul className="acct-people">{live.map(person)}</ul>
        ) : !inviting && (
          <div className="acct-empty">
            <span className="acct-empty-icon" aria-hidden="true"><HeartHandshake size={26} /></span>
            <p className="font-semibold">{isMother ? t({ en: "No supporters yet", bn: "এখনও কোনো সহায়তাকারী নেই" }) : t({ en: "You are not connected to a mother yet", bn: "এখনও কোনো মায়ের সঙ্গে যুক্ত হননি" })}</p>
            <p className="acct-hint">{isMother
              ? t({ en: "Add your husband, mother, sister or a friend so they know how to help you.", bn: "স্বামী, মা, বোন বা বন্ধুকে যোগ করুন, যাতে তাঁরা জানেন কীভাবে আপনাকে সাহায্য করবেন।" })
              : t({ en: "Share your account ID with the mother, then enter the code she gives you above.", bn: "মাকে আপনার অ্যাকাউন্ট আইডি দিন, তারপর তিনি যে কোড দেবেন সেটি উপরে লিখুন।" })}</p>
          </div>
        )}
        {ended.length > 0 && (
          <details className="acct-details">
            <summary>{t({ en: `Past connections (${ended.length})`, bn: `আগের সংযোগ (${new Intl.NumberFormat("bn-BD").format(ended.length)})` })}</summary>
            <ul className="acct-people">{ended.map(person)}</ul>
          </details>
        )}
      </section>

      {isMother && (
        <section className="acct-card" aria-labelledby="acct-privacy-title">
          <h2 id="acct-privacy-title" className="acct-h2"><Lock size={19} aria-hidden="true" className="text-pro-primary" />{t({ en: "What supporters can see", bn: "সহায়তাকারীরা কী দেখতে পান" })}</h2>
          <div className="acct-see-grid">
            <div className="acct-see" data-tone="ok">
              <h3 className="acct-h3"><Eye size={17} aria-hidden="true" />{t({ en: "They can see", bn: "তাঁরা দেখতে পান" })}</h3>
              <ul>
                <li>{t({ en: "Your name", bn: "আপনার নাম" })}</li>
                <li>{t({ en: "What you asked them to help with", bn: "কোন কাজে আপনি সাহায্য চেয়েছেন" })}</li>
                <li>{t({ en: "Until when the connection lasts", bn: "সংযোগ কতদিন থাকবে" })}</li>
              </ul>
            </div>
            <div className="acct-see" data-tone="off">
              <h3 className="acct-h3"><EyeOff size={17} aria-hidden="true" />{t({ en: "They cannot see", bn: "তাঁরা দেখতে পান না" })}</h3>
              <ul>
                <li>{t({ en: "Your health records and measurements", bn: "আপনার স্বাস্থ্য নথি ও মাপ" })}</li>
                <li>{t({ en: "Reports, diary and AI conversations", bn: "রিপোর্ট, ডায়েরি ও এআই কথোপকথন" })}</li>
                <li>{t({ en: "Your phone, address or emergency contact", bn: "আপনার ফোন, ঠিকানা বা জরুরি যোগাযোগ" })}</li>
              </ul>
            </div>
          </div>
          <Link href="/app/bondhon" className="acct-text-link">
            {t({ en: "Want to share a specific record? Use Bondhon", bn: "নির্দিষ্ট কোনো তথ্য শেয়ার করতে চান? বন্ধন ব্যবহার করুন" })}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}

function InviteForm({ act, busy, onCancel, onCreated, onError }: {
  act: Act; busy: boolean; onCancel: () => void; onCreated: (code: string) => void; onError: (code: string) => void;
}) {
  const { t } = useLanguage();
  const [supporterId, setSupporterId] = useState("");
  const [areas, setAreas] = useState<SupporterScope[]>([]);
  const [days, setDays] = useState(30);
  const [reviewed, setReviewed] = useState(false);
  const [touched, setTouched] = useState(false);
  const idValid = uuid.test(supporterId);
  const toggle = (id: SupporterScope) => setAreas((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    const form = event.currentTarget as HTMLFormElement;
    if (!idValid || !areas.length || !reviewed) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>(!idValid ? "#supporter-id" : !areas.length ? ".acct-area input" : "[aria-invalid='true']")?.focus());
      return;
    }
    const result = await act({ action: "invite", supporterId, scopes: areas,
      expiresAt: new Date(Date.now() + days * 86_400_000).toISOString(), reviewConfirmed: true });
    const code = result.ok && typeof result.data.invitation === "object" && result.data.invitation
      ? (result.data.invitation as { code?: unknown }).code : null;
    if (typeof code === "string") onCreated(code);
    else onError(result.code);
  }

  return (
    <form className="acct-wizard" onSubmit={submit} aria-labelledby="acct-invite-title" noValidate>
      <div className="acct-card-head">
        <h3 id="acct-invite-title" className="acct-h3 text-lg"><UserPlus size={18} aria-hidden="true" />{t({ en: "Add a supporter", bn: "সহায়তাকারী যোগ করুন" })}</h3>
        <button type="button" className="acct-icon-btn" onClick={onCancel} aria-label={t({ en: "Close without adding", bn: "যোগ না করে বন্ধ করুন" })}><X size={18} aria-hidden="true" /></button>
      </div>

      <div className="acct-step">
        <label htmlFor="supporter-id" className="acct-step-title"><span className="acct-num" aria-hidden="true">১</span>{t({ en: "Their PROHOR account ID", bn: "তাঁর প্রহর অ্যাকাউন্ট আইডি" })}</label>
        <p id="supporter-id-hint" className="acct-hint">{t({ en: "Your supporter makes a free PROHOR account as a supporter, then copies the ID from Account → Mothers you support and sends it to you.", bn: "সহায়তাকারী প্রহরে ‘সহায়তাকারী’ হিসেবে বিনামূল্যে অ্যাকাউন্ট খুলবেন, তারপর ‘অ্যাকাউন্ট → যে মায়েদের সহায়তা করছেন’ থেকে আইডি কপি করে আপনাকে পাঠাবেন।" })}</p>
        <input id="supporter-id" className="acct-input acct-code" required autoComplete="off" spellCheck={false} maxLength={36} lang="en" dir="ltr"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={supporterId} aria-describedby="supporter-id-hint supporter-id-error"
          aria-invalid={touched && !idValid} onChange={(e) => setSupporterId(e.target.value.trim())} />
        {touched && !idValid && <p id="supporter-id-error" className="acct-field-error">{t({ en: "Paste the full ID: 36 characters with dashes.", bn: "পুরো আইডি দিন: ড্যাশসহ ৩৬ অক্ষর।" })}</p>}
      </div>

      <fieldset className="acct-step" aria-describedby={touched && !areas.length ? "areas-error" : undefined}>
        <legend className="acct-step-title"><span className="acct-num" aria-hidden="true">২</span>{t({ en: "What can they help you with?", bn: "তিনি কোন কোন কাজে সহায়তা করতে পারেন?" })}</legend>
        <p className="acct-hint">{t({ en: "Choose as many as you like. You can change this later by adding them again.", bn: "যতগুলো দরকার বেছে নিন। পরে আবার যোগ করে বদলাতে পারবেন।" })}</p>
        {helpAreaGroups.map((group) => (
          <div key={group.title.en} className="acct-area-group">
            <p className="acct-area-group-title">{t(group.title)}</p>
            <div className="acct-areas">
              {group.areas.map((area) => (
                <label key={area.id} className="acct-area">
                  <input type="checkbox" checked={areas.includes(area.id)} onChange={() => toggle(area.id)} />
                  <span className="acct-area-icon" aria-hidden="true"><area.icon size={18} strokeWidth={1.75} /></span>
                  <span className="acct-area-text"><span className="font-semibold">{t(area.label)}</span><span className="acct-hint">{t(area.hint)}</span></span>
                  <span className="acct-tile-box" aria-hidden="true"><Check size={15} /></span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {touched && !areas.length && <p id="areas-error" className="acct-field-error">{t({ en: "Choose at least one.", bn: "অন্তত একটি বেছে নিন।" })}</p>}
        <div className="acct-callout"><Lock size={18} aria-hidden="true" /><span>{t({
          en: "This tells your supporter how you would like help. It does not open your health records, reports, diary or AI conversations, and PROHOR does not send reminders or book transport by itself yet.",
          bn: "এতে সহায়তাকারী জানবেন আপনি কীভাবে সাহায্য চান। এতে আপনার স্বাস্থ্য নথি, রিপোর্ট, ডায়েরি বা এআই কথোপকথন খুলে যায় না। প্রহর এখনও নিজে থেকে রিমাইন্ডার পাঠায় না বা গাড়ি ডাকে না।",
        })}</span></div>
      </fieldset>

      <fieldset className="acct-step">
        <legend className="acct-step-title"><span className="acct-num" aria-hidden="true">৩</span>{t({ en: "For how long?", bn: "কতদিনের জন্য?" })}</legend>
        <div className="acct-seg">
          {[7, 14, 30].map((n) => (
            <label key={n}><input type="radio" name="expiry-days" checked={days === n} onChange={() => setDays(n)} />
              {t({ en: `${n} days`, bn: `${new Intl.NumberFormat("bn-BD").format(n)} দিন` })}</label>
          ))}
        </div>
        <p className="acct-hint">{t({ en: "After this the connection ends by itself. You can stop it earlier at any time.", bn: "এরপর সংযোগ নিজে থেকেই শেষ হবে। চাইলে যেকোনো সময় আগেই বন্ধ করতে পারবেন।" })}</p>
      </fieldset>

      <div className="acct-step">
        <span className="acct-step-title"><span className="acct-num" aria-hidden="true">৪</span>{t({ en: "Check and create", bn: "দেখে নিয়ে তৈরি করুন" })}</span>
        <label className="acct-tile">
          <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} aria-invalid={touched && !reviewed} />
          <span className="acct-tile-box" aria-hidden="true"><Check size={16} /></span>
          <span>{t({ en: "I checked the person, what they help with and for how long.", bn: "ব্যক্তি, কোন কাজে সহায়তা ও কতদিন — সব দেখে নিয়েছি।" })}</span>
        </label>
        {touched && !reviewed && <p className="acct-field-error">{t({ en: "Tick the box to confirm.", bn: "নিশ্চিত করতে বক্সে টিক দিন।" })}</p>}
      </div>

      <div className="acct-actions">
        <button className="acct-btn acct-btn-primary" disabled={busy}><Send size={16} aria-hidden="true" />{busy ? t({ en: "Creating…", bn: "তৈরি হচ্ছে…" }) : t({ en: "Create invitation code", bn: "আমন্ত্রণ কোড তৈরি করুন" })}</button>
        <button type="button" className="acct-btn" onClick={onCancel} disabled={busy}>{t({ en: "Cancel", bn: "বাতিল" })}</button>
      </div>
    </form>
  );
}

function InvitationCode({ code, onDone }: { code: string; onDone: () => void }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return (
    <div className="acct-invite-code" role="region" aria-labelledby="acct-code-title">
      <h3 id="acct-code-title" ref={heading} tabIndex={-1} className="acct-h3"><KeyRound size={18} aria-hidden="true" />{t({ en: "Invitation code created", bn: "আমন্ত্রণ কোড তৈরি হয়েছে" })}</h3>
      <p className="acct-hint">{t({ en: "Send this code privately to your supporter (for example by SMS or WhatsApp). It is shown only now and works once.", bn: "কোডটি গোপনে আপনার সহায়তাকারীকে পাঠান (যেমন এসএমএস বা হোয়াটসঅ্যাপে)। এটি শুধু এখনই দেখানো হচ্ছে এবং একবারই কাজ করবে।" })}</p>
      <textarea className="acct-input acct-code" readOnly rows={2} value={code} aria-label={t({ en: "Invitation code", bn: "আমন্ত্রণ কোড" })} onFocus={(e) => e.currentTarget.select()} />
      <div className="acct-actions">
        <button type="button" className="acct-btn acct-btn-primary" onClick={() => void navigator.clipboard.writeText(code).then(() => setCopied(true), () => undefined)}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : t({ en: "Copy code", bn: "কোড কপি করুন" })}
        </button>
        <button type="button" className="acct-btn" onClick={onDone}>{t({ en: "Done", bn: "হয়ে গেছে" })}</button>
      </div>
      <p className="acct-hint" role="status">{copied ? t({ en: "Code copied.", bn: "কোড কপি হয়েছে।" }) : ""}</p>
    </div>
  );
}

function AcceptForm({ account, act, busy, onResult }: { account: AccountAccess; act: Act; busy: boolean; onResult: (ok: boolean, code: string) => void }) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <div className="acct-wizard">
      <div className="acct-step">
        <span className="acct-step-title"><span className="acct-num" aria-hidden="true">১</span>{t({ en: "Give the mother your account ID", bn: "মাকে আপনার অ্যাকাউন্ট আইডি দিন" })}</span>
        <div className="acct-id-row">
          <code lang="en" dir="ltr">{account.userId}</code>
          <button type="button" className="acct-btn acct-btn-sm" onClick={() => void navigator.clipboard.writeText(account.userId).then(() => setCopied(true), () => undefined)}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}{copied ? t({ en: "Copied", bn: "কপি হয়েছে" }) : t({ en: "Copy ID", bn: "আইডি কপি করুন" })}
          </button>
        </div>
      </div>
      <form className="acct-step" onSubmit={async (e) => {
        e.preventDefault();
        const result = await act({ action: "accept", code: code.trim() });
        onResult(result.ok, result.ok ? "saved" : result.code);
        if (result.ok) setCode("");
      }}>
        <label htmlFor="accept-code" className="acct-step-title"><span className="acct-num" aria-hidden="true">২</span>{t({ en: "Enter the invitation code she sends you", bn: "তিনি যে আমন্ত্রণ কোড পাঠাবেন, সেটি লিখুন" })}</label>
        <textarea id="accept-code" className="acct-input acct-code" required maxLength={64} rows={2} lang="en" dir="ltr" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value.trim())} />
        <button className="acct-btn acct-btn-primary w-fit" disabled={busy || code.length !== 64}><Check size={16} aria-hidden="true" />{t({ en: "Accept invitation", bn: "আমন্ত্রণ গ্রহণ করুন" })}</button>
      </form>
    </div>
  );
}
