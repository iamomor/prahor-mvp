"use client";
import { useLanguage } from "@/i18n/use-language";
import { bloodGroups, type AccountAccess, type ProfileDetails } from "@/lib/contracts/account";
import { accountJourney } from "@/features/jibonrekha/account-journey";
import { selectAccountPregnancy } from "@/features/jibonrekha/account-records-model";
import {
  Baby, CalendarDays, Check, Droplet, HeartPulse, MapPin, Pencil, Phone, Plus, Siren, Stethoscope, UserRound, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { accountMessage, careStages, roleName, supporterTypes } from "./account-copy";
import type { Act } from "./types";

type Family = {
  pregnancies: { id: string; label: string; estimated_due_date: string | null; last_menstrual_period_date: string | null }[];
  babies: { id: string; label: string; birth_date: string | null }[];
};
const dhakaToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

export function ProfilePanel({ account, act, busy, editing, setEditing }: {
  account: AccountAccess; act: Act; busy: boolean; editing: boolean; setEditing: (value: boolean) => void;
}) {
  const { t, language } = useLanguage();
  const bn = language === "bn";
  const isMother = account.roles.some((r) => r.role === "mother" && r.status === "approved");
  const isSupporter = account.roles.some((r) => r.role === "supporter");
  const [status, setStatus] = useState<{ ok: boolean; code: string } | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  const number = (value: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en-GB").format(value);
  const date = (value: string) => new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
  const age = (dob: string) => {
    const [y, m, d] = dob.split("-").map(Number);
    const [ty, tm, td] = dhakaToday().split("-").map(Number);
    return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
  };
  const notAdded = <span className="acct-empty-value">{t({ en: "Not added", bn: "যোগ করা হয়নি" })}</span>;

  // On failure the form stays open with what was typed; the status line says why.
  async function save(name: string, details: ProfileDetails) {
    setStatus(null);
    const result = await act({ action: "profile", displayName: name, details });
    setStatus({ ok: result.ok, code: result.code });
    if (result.ok) setEditing(false);
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  function cancel() {
    setEditing(false);
    setStatus(null);
    requestAnimationFrame(() => editButton.current?.focus());
  }

  const d = account.details;
  const fact = (Icon: LucideIcon, label: string, value: React.ReactNode, wide = false) => (
    <div className={`acct-fact${wide ? " acct-fact-wide" : ""}`}>
      <span className="acct-fact-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <div className="min-w-0">
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  );
  const careStage = careStages.find((s) => s.value === d.careStage);
  const supporterType = supporterTypes.find((s) => s.value === d.supporterType);

  return (
    <div className="grid gap-6">
      <section className="acct-card" aria-labelledby="acct-details-title">
        <div className="acct-card-head">
          <div className="grid gap-1">
            <h2 id="acct-details-title" className="acct-h2">{t({ en: "Personal details", bn: "ব্যক্তিগত তথ্য" })}</h2>
            <p className="acct-hint">{t({ en: "Only you can see these. Supporters see your name only.", bn: "এগুলো শুধু আপনি দেখতে পান। সহায়তাকারীরা শুধু আপনার নাম দেখেন।" })}</p>
          </div>
          {!editing && (
            <button ref={editButton} type="button" className="acct-btn acct-btn-sm" onClick={() => { setStatus(null); setEditing(true); }}>
              <Pencil size={15} aria-hidden="true" />{t({ en: "Edit details", bn: "তথ্য বদলান" })}
            </button>
          )}
        </div>
        <p ref={statusRef} tabIndex={-1} role={status && !status.ok ? "alert" : "status"} className="acct-status" data-tone={status ? (status.ok ? "ok" : "error") : undefined}>
          {status && accountMessage(status.code, t)}
        </p>

        {!editing ? (
          <div className="grid gap-5">
            <dl className="acct-facts">
              {fact(UserRound, t({ en: "Full name", bn: "পুরো নাম" }), account.displayName || notAdded)}
              {fact(Phone, t({ en: "Mobile number", bn: "মোবাইল নম্বর" }), d.phone ? <span lang="en" dir="ltr">{d.phone}</span> : notAdded)}
              {fact(MapPin, t({ en: "District and area", bn: "জেলা ও এলাকা" }), [d.district, d.area].filter(Boolean).join(", ") || notAdded)}
              {isMother && fact(CalendarDays, t({ en: "Date of birth", bn: "জন্ম তারিখ" }), d.dateOfBirth
                ? `${date(d.dateOfBirth)} · ${t({ en: `${age(d.dateOfBirth)} years`, bn: `${number(age(d.dateOfBirth))} বছর` })}` : notAdded)}
              {isMother && fact(Droplet, t({ en: "Blood group", bn: "রক্তের গ্রুপ" }), d.bloodGroup ? <span lang="en">{d.bloodGroup}</span> : notAdded)}
              {isMother && fact(HeartPulse, t({ en: "Where you are now", bn: "এখন আপনি কোন পর্যায়ে" }), careStage ? t(careStage.label) : notAdded)}
              {isSupporter && fact(UserRound, t({ en: "How you support", bn: "আপনি কীভাবে সহায়তা করেন" }), supporterType ? t(supporterType.label) : notAdded)}
              {account.provider && fact(Stethoscope, t({ en: "Qualification and specialty", bn: "যোগ্যতা ও বিশেষত্ব" }), [d.qualification, d.specialty].filter(Boolean).join(" · ") || notAdded)}
              {account.provider && fact(MapPin, t({ en: "Service area", bn: "সেবার এলাকা" }), d.serviceArea || notAdded)}
            </dl>
            {isMother && (
              <div className="acct-subcard">
                <h3 className="acct-h3"><Siren size={17} aria-hidden="true" />{t({ en: "Emergency contact", bn: "জরুরি যোগাযোগ" })}</h3>
                {d.emergencyName || d.emergencyPhone ? (
                  <p className="acct-emergency">
                    <strong>{d.emergencyName || t({ en: "Name not added", bn: "নাম যোগ করা হয়নি" })}</strong>
                    {d.emergencyRelation && <span className="text-pro-muted"> · {d.emergencyRelation}</span>}
                    {d.emergencyPhone && <a href={`tel:${d.emergencyPhone.replace(/[^0-9+]/g, "")}`} className="acct-text-link" lang="en" dir="ltr"><Phone size={15} aria-hidden="true" />{d.emergencyPhone}</a>}
                  </p>
                ) : (
                  <p className="acct-hint">{t({ en: "Add someone PROHOR can show you quickly when you need help — for example your husband, mother or sister.", bn: "দরকারের সময় দ্রুত যাঁকে ফোন করবেন, তাঁর তথ্য দিন — যেমন স্বামী, মা বা বোন।" })}</p>
                )}
              </div>
            )}
            {account.provider && (
              <div className="acct-callout">
                <Stethoscope size={18} aria-hidden="true" />
                <span>
                  {account.provider.organization} · <span lang="en">{account.provider.registrationNumber || "—"}</span>{" — "}
                  {account.provider.status === "pending"
                    ? t({ en: "Your provider application is waiting for review. No patient information is available until it is approved.", bn: "সেবাদাতা হিসেবে আপনার আবেদন পর্যালোচনার অপেক্ষায়। অনুমোদনের আগে কোনো রোগীর তথ্য দেখা যাবে না।" })
                    : t({ en: "Organization and registration number can only be changed by the PROHOR team.", bn: "প্রতিষ্ঠান ও নিবন্ধন নম্বর শুধু প্রহর টিম বদলাতে পারে।" })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <ProfileForm account={account} busy={busy} isMother={isMother} isSupporter={isSupporter} onSave={save} onCancel={cancel} />
        )}
      </section>

      {isMother && <FamilyCard />}

      {(account.roles.length > 1 || account.roles.some((r) => r.status !== "approved")) && (
        <RolesCard account={account} act={act} busy={busy} />
      )}
    </div>
  );
}

/** Mother's pregnancy and each baby, read from Jibonrekha. Editing happens there, on the real record form. */
function FamilyCard() {
  const { t, language } = useLanguage();
  const bn = language === "bn";
  const [family, setFamily] = useState<Family | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/jibonrekha", { cache: "no-store", signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("unavailable"))))
      .then((body: Family) => setFamily({ pregnancies: body.pregnancies ?? [], babies: body.babies ?? [] }))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  const number = (value: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en-GB").format(value);
  const date = (value: string) => new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
  const pregnancy = family?.pregnancies.length ? selectAccountPregnancy(family.pregnancies as never, "") as Family["pregnancies"][number] : undefined;
  const journey = pregnancy ? accountJourney(pregnancy, dhakaToday()) : null;
  const babyAge = (birth: string) => {
    const days = Math.max(0, Math.round((Date.parse(`${dhakaToday()}T00:00:00Z`) - Date.parse(`${birth}T00:00:00Z`)) / 86_400_000));
    if (days < 60) return t({ en: `${days} days old`, bn: `${number(days)} দিন বয়স` });
    const months = Math.floor(days / 30.44);
    if (months < 24) return t({ en: `${months} months old`, bn: `${number(months)} মাস বয়স` });
    return t({ en: `${Math.floor(months / 12)} years old`, bn: `${number(Math.floor(months / 12))} বছর বয়স` });
  };
  const link = (open: string, id?: string) => `/app/jibonrekha?open=${open}${id ? `&id=${id}` : ""}`;

  return (
    <section className="acct-card" aria-labelledby="acct-family-title">
      <div className="acct-card-head">
        <div className="grid gap-1">
          <h2 id="acct-family-title" className="acct-h2">{t({ en: "Mother and baby profiles", bn: "মা ও শিশুর প্রোফাইল" })}</h2>
          <p className="acct-hint">{t({ en: "Pregnancy dates and each baby's details. Kept in Jibonrekha, your health records.", bn: "গর্ভকালের তারিখ ও প্রতিটি শিশুর তথ্য। এগুলো জীবনরেখায়, আপনার স্বাস্থ্য নথিতে থাকে।" })}</p>
        </div>
        <Link href="/app/jibonrekha" className="acct-text-link">{t({ en: "Open Jibonrekha", bn: "জীবনরেখা খুলুন" })}</Link>
      </div>
      {!family && !failed && <div className="acct-skel" aria-hidden="true" />}
      {!family && !failed && <p role="status" className="sr-only">{t({ en: "Loading profiles…", bn: "প্রোফাইল আনা হচ্ছে…" })}</p>}
      {failed && <p role="alert" className="acct-status" data-tone="error">{t({ en: "Profiles could not be loaded. Open Jibonrekha to see them.", bn: "প্রোফাইল আনা যায়নি। জীবনরেখা খুলে দেখুন।" })}</p>}
      {family && (
        <ul className="acct-family">
          <li className="acct-person acct-person-mother">
            <span className="acct-person-avatar" aria-hidden="true"><UserRound size={22} /></span>
            <div className="acct-person-body">
              <p className="acct-person-name">{t({ en: "You (mother)", bn: "আপনি (মা)" })}{pregnancy && <span className="text-pro-muted font-normal"> · {pregnancy.label}</span>}</p>
              {journey ? (
                <p className="acct-person-meta">
                  <span className="acct-chip acct-chip-strong">{t({ en: `Week ${journey.weeks}, day ${journey.days}`, bn: `${number(journey.weeks)} সপ্তাহ ${number(journey.days)} দিন` })}</span>
                  <span>{t({ en: "Estimated due date", bn: "প্রসবের আনুমানিক তারিখ" })}: {date(journey.dueDate)}</span>
                </p>
              ) : (
                <p className="acct-person-meta">{pregnancy
                  ? t({ en: "Add your due date or last period date to see your week.", bn: "সপ্তাহ দেখতে প্রসবের সম্ভাব্য তারিখ বা শেষ মাসিকের তারিখ দিন।" })
                  : t({ en: "No pregnancy record yet.", bn: "এখনও গর্ভকালের কোনো নথি নেই।" })}</p>
              )}
            </div>
            <Link className="acct-btn acct-btn-sm" href={pregnancy ? link("edit-pregnancy", pregnancy.id) : link("new-pregnancy")}>
              {pregnancy ? <Pencil size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              {pregnancy ? t({ en: "Edit dates", bn: "তারিখ বদলান" }) : t({ en: "Add pregnancy dates", bn: "গর্ভকালের তারিখ দিন" })}
            </Link>
          </li>
          {family.babies.map((baby) => (
            <li key={baby.id} className="acct-person acct-person-child">
              <span className="acct-person-avatar" aria-hidden="true"><Baby size={22} /></span>
              <div className="acct-person-body">
                <p className="acct-person-name">{baby.label}</p>
                <p className="acct-person-meta">{baby.birth_date
                  ? <><span>{t({ en: "Born", bn: "জন্ম" })}: {date(baby.birth_date)}</span><span className="acct-chip">{babyAge(baby.birth_date)}</span></>
                  : t({ en: "Birth date not added", bn: "জন্মের তারিখ যোগ করা হয়নি" })}</p>
              </div>
              <Link className="acct-btn acct-btn-sm" href={link("edit-baby", baby.id)}>
                <Pencil size={15} aria-hidden="true" />{t({ en: "Edit", bn: "বদলান" })}<span className="sr-only"> · {baby.label}</span>
              </Link>
            </li>
          ))}
          <li className="acct-person-child">
            <Link className="acct-add" href={link("new-baby")}>
              <span className="acct-person-avatar" aria-hidden="true"><Plus size={20} /></span>
              <span className="grid">
                <span className="font-semibold">{t({ en: "Add a baby's profile", bn: "শিশুর প্রোফাইল যোগ করুন" })}</span>
                <span className="acct-hint">{t({ en: "After birth — one for each baby, including twins", bn: "জন্মের পর — প্রতিটি শিশুর জন্য আলাদা, যমজ হলেও" })}</span>
              </span>
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}

/** Only shown when an account really has a choice: more than one role, or one waiting for approval. */
function RolesCard({ account, act, busy }: { account: AccountAccess; act: Act; busy: boolean }) {
  const { t } = useLanguage();
  return (
    <section className="acct-card" aria-labelledby="acct-roles-title">
      <div className="grid gap-1">
        <h2 id="acct-roles-title" className="acct-h2">{t({ en: "Your roles", bn: "আপনার ভূমিকা" })}</h2>
        <p className="acct-hint">{t({ en: "One account can be used in more than one way. Switch to see that role's pages.", bn: "একটি অ্যাকাউন্ট একাধিক ভূমিকায় ব্যবহার করা যায়। বদলালে সেই ভূমিকার পাতা খুলবে।" })}</p>
      </div>
      <ul className="grid gap-3">
        {account.roles.map((membership) => {
          const current = membership.role === account.activeRole;
          return (
            <li key={membership.role} className="acct-role" data-current={current || undefined}>
              <span className="font-semibold">{roleName(membership.role, t)}</span>
              {current ? (
                <span className="acct-pill" data-tone="ok"><Check size={14} aria-hidden="true" />{t({ en: "Using now", bn: "এখন ব্যবহার করছেন" })}</span>
              ) : membership.status === "approved" ? (
                <button type="button" className="acct-btn acct-btn-sm" disabled={busy} onClick={() => void act({ action: "switch", role: membership.role })}>
                  {t({ en: `Use as ${roleName(membership.role, t).toLowerCase()}`, bn: `${roleName(membership.role, t)} হিসেবে ব্যবহার করুন` })}
                </button>
              ) : (
                <span className="acct-pill" data-tone={membership.status === "pending" ? "wait" : "off"}>
                  {membership.status === "pending" ? t({ en: "Waiting for approval", bn: "অনুমোদনের অপেক্ষায়" }) : t({ en: "Not active", bn: "চালু নেই" })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Mounted only while editing, so it always starts from the saved values; typing survives language/theme changes. */
function ProfileForm({ account, busy, isMother, isSupporter, onSave, onCancel }: {
  account: AccountAccess; busy: boolean; isMother: boolean; isSupporter: boolean;
  onSave: (name: string, details: ProfileDetails) => void; onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(account.displayName);
  const [details, setDetails] = useState<ProfileDetails>(account.details);
  const firstField = useRef<HTMLInputElement>(null);
  useEffect(() => { firstField.current?.focus(); }, []);
  const set = (key: keyof ProfileDetails) => (value: string) => setDetails((prev) => ({ ...prev, [key]: value }));
  const cancel = onCancel;
  return (
    <form className="grid gap-6" onSubmit={(event: FormEvent) => { event.preventDefault(); onSave(name, details); }}>
      <fieldset className="acct-fieldset" disabled={busy}>
        <legend className="acct-h3">{t({ en: "About you", bn: "আপনার সম্পর্কে" })}</legend>
        <div className="acct-form-grid">
          <label className="acct-field acct-field-wide">
            <span>{t({ en: "Full name", bn: "পুরো নাম" })} <span className="acct-req">{t({ en: "(required)", bn: "(আবশ্যক)" })}</span></span>
            <input ref={firstField} className="acct-input" required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="acct-field">
            <span>{t({ en: "Mobile number", bn: "মোবাইল নম্বর" })}</span>
            <input className="acct-input" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} pattern="[0-9+() \-]*" placeholder="01XXXXXXXXX" lang="en" dir="ltr" value={details.phone} onChange={(e) => set("phone")(e.target.value)} />
            <small>{t({ en: "Digits, +, spaces or dashes only.", bn: "শুধু সংখ্যা, +, ফাঁকা বা ড্যাশ।" })}</small>
          </label>
          <label className="acct-field">
            <span>{t({ en: "District", bn: "জেলা" })}</span>
            <input className="acct-input" maxLength={100} autoComplete="address-level2" value={details.district} onChange={(e) => set("district")(e.target.value)} />
          </label>
          <label className="acct-field acct-field-wide">
            <span>{t({ en: "Area, upazila or village", bn: "এলাকা, উপজেলা বা গ্রাম" })}</span>
            <input className="acct-input" maxLength={120} autoComplete="address-level3" value={details.area} onChange={(e) => set("area")(e.target.value)} />
          </label>
          {isMother && <>
            <label className="acct-field">
              <span>{t({ en: "Date of birth", bn: "জন্ম তারিখ" })}</span>
              <input className="acct-input" type="date" min="1900-01-01" max={dhakaToday()} autoComplete="bday" value={details.dateOfBirth} onChange={(e) => set("dateOfBirth")(e.target.value)} />
            </label>
            <label className="acct-field">
              <span>{t({ en: "Blood group", bn: "রক্তের গ্রুপ" })}</span>
              <select className="acct-input" value={details.bloodGroup} onChange={(e) => set("bloodGroup")(e.target.value)}>
                <option value="">{t({ en: "I don't know / not added", bn: "জানি না / যোগ করা হয়নি" })}</option>
                {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
              <small>{t({ en: "As written on a test report. Not checked by PROHOR.", bn: "পরীক্ষার রিপোর্টে যেমন লেখা। প্রহর এটি যাচাই করে না।" })}</small>
            </label>
            <label className="acct-field acct-field-wide">
              <span>{t({ en: "Where you are now", bn: "এখন আপনি কোন পর্যায়ে" })}</span>
              <select className="acct-input" value={details.careStage} onChange={(e) => set("careStage")(e.target.value)}>
                <option value="">{t({ en: "Not added", bn: "যোগ করা হয়নি" })}</option>
                {careStages.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
              </select>
            </label>
          </>}
          {isSupporter && (
            <label className="acct-field acct-field-wide">
              <span>{t({ en: "How you support", bn: "আপনি কীভাবে সহায়তা করেন" })}</span>
              <select className="acct-input" value={details.supporterType} onChange={(e) => set("supporterType")(e.target.value)}>
                <option value="">{t({ en: "Not added", bn: "যোগ করা হয়নি" })}</option>
                {supporterTypes.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
              </select>
            </label>
          )}
          {account.provider && <>
            <label className="acct-field">
              <span>{t({ en: "Qualification", bn: "যোগ্যতা" })}</span>
              <input className="acct-input" maxLength={120} value={details.qualification} onChange={(e) => set("qualification")(e.target.value)} />
            </label>
            <label className="acct-field">
              <span>{t({ en: "Specialty", bn: "বিশেষত্ব" })}</span>
              <input className="acct-input" maxLength={120} value={details.specialty} onChange={(e) => set("specialty")(e.target.value)} />
            </label>
            <label className="acct-field acct-field-wide">
              <span>{t({ en: "Service area", bn: "সেবার এলাকা" })}</span>
              <input className="acct-input" maxLength={120} value={details.serviceArea} onChange={(e) => set("serviceArea")(e.target.value)} />
            </label>
          </>}
        </div>
      </fieldset>
      {isMother && (
        <fieldset className="acct-fieldset" disabled={busy}>
          <legend className="acct-h3"><Siren size={17} aria-hidden="true" />{t({ en: "Emergency contact", bn: "জরুরি যোগাযোগ" })}</legend>
          <div className="acct-form-grid">
            <label className="acct-field">
              <span>{t({ en: "Name", bn: "নাম" })}</span>
              <input className="acct-input" maxLength={120} value={details.emergencyName} onChange={(e) => set("emergencyName")(e.target.value)} />
            </label>
            <label className="acct-field">
              <span>{t({ en: "Relationship to you", bn: "আপনার সঙ্গে সম্পর্ক" })}</span>
              <input className="acct-input" maxLength={60} placeholder={t({ en: "e.g. husband, mother", bn: "যেমন স্বামী, মা" })} value={details.emergencyRelation} onChange={(e) => set("emergencyRelation")(e.target.value)} />
            </label>
            <label className="acct-field acct-field-wide">
              <span>{t({ en: "Their mobile number", bn: "তাঁর মোবাইল নম্বর" })}</span>
              <input className="acct-input" type="tel" inputMode="tel" maxLength={32} pattern="[0-9+() \-]*" placeholder="01XXXXXXXXX" lang="en" dir="ltr" value={details.emergencyPhone} onChange={(e) => set("emergencyPhone")(e.target.value)} />
            </label>
          </div>
        </fieldset>
      )}
      <div className="acct-actions">
        <button className="acct-btn acct-btn-primary" disabled={busy || !name.trim()}>
          <Check size={16} aria-hidden="true" />{busy ? t({ en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" }) : t({ en: "Save changes", bn: "পরিবর্তন সংরক্ষণ করুন" })}
        </button>
        <button type="button" className="acct-btn" onClick={cancel} disabled={busy}>
          <X size={16} aria-hidden="true" />{t({ en: "Cancel", bn: "বাতিল" })}
        </button>
      </div>
    </form>
  );
}
