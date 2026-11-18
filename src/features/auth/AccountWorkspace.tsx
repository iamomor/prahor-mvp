"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { useLanguage } from "@/i18n/use-language";
import { accountAccessSchema, supporterConnectionSchema, type AccountAccess, type SupporterConnection,
  type WorkspaceRole, type SignupPurpose } from "@/lib/contracts/account";
import { emptyRoleProfile, RoleProfileFields } from "./RoleProfileFields";

const snapshotSchema = z.strictObject({ account: accountAccessSchema, connections: z.array(supporterConnectionSchema) });
const inputClass = "min-h-12 w-full rounded-xl border border-pro-border bg-pro-elevated px-4 py-3 text-base text-pro-text";
function invitationExpiry(days: number) { return new Date(Date.now() + days * 86400000).toISOString(); }
export function AccountWorkspace({ supporter = false }: { supporter?: boolean }) {
  const { t } = useLanguage();
  const [account, setAccount] = useState<AccountAccess | null>(null);
  const [connections, setConnections] = useState<SupporterConnection[]>([]);
  const [profile, setProfile] = useState(emptyRoleProfile);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [supporterId, setSupporterId] = useState("");
  const [visit, setVisit] = useState(false);
  const [care, setCare] = useState(false);
  const [days, setDays] = useState(7);
  const [reviewed, setReviewed] = useState(false);
  const [code, setCode] = useState("");
  const [invitation, setInvitation] = useState("");
  const status = useRef<HTMLParagraphElement>(null);
  const accountId = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const errorText = (code: string) => {
    if (code === "roles-unavailable") return t({ en: "Role setup is not available yet. Your existing account is safe; retry after account setup is enabled.", bn: "পরিচয় সেটআপ এখনও প্রস্তুত নয়। আপনার বর্তমান অ্যাকাউন্ট নিরাপদ আছে; সেটআপ চালু হলে আবার চেষ্টা করুন।" });
    if (code === "access-denied" || code === "not-found") return t({ en: "That role, recipient or invitation is not available to your account. Check the details and permissions.", bn: "এই পরিচয়, প্রাপক বা আমন্ত্রণ আপনার অ্যাকাউন্টে উপলব্ধ নয়। তথ্য ও অনুমতি যাচাই করুন।" });
    if (code === "invalid-input") return t({ en: "Check the name, selected roles, professional details, recipient ID, permissions and expiry.", bn: "নাম, পরিচয়, পেশাগত তথ্য, প্রাপকের আইডি, অনুমতি ও মেয়াদ যাচাই করুন।" });
    if (code === "account-changed") return t({ en: "The signed-in account changed. Reload before continuing.", bn: "সাইন ইন করা অ্যাকাউন্ট বদলেছে। এগোনোর আগে পৃষ্ঠা আবার খুলুন।" });
    return t({ en: "The result could not be confirmed. Your inputs remain here. Reload the account status before retrying an invitation.", bn: "ফলাফল নিশ্চিত হয়নি। আপনার লেখা তথ্য রয়ে গেছে। আমন্ত্রণ আবার পাঠানোর আগে অ্যাকাউন্টের অবস্থা আবার দেখুন।" });
  };
  async function load(signal?: AbortSignal) {
    const response = await fetch("/auth/account", { cache: "no-store", credentials: "same-origin", signal });
    const body = await response.json();
    if (!response.ok) throw new Error(typeof body.code === "string" ? body.code : "unconfirmed");
    const snapshot = snapshotSchema.parse(body);
    if (signal?.aborted) return;
    if (accountId.current && accountId.current !== snapshot.account.userId) throw new Error("account-changed");
    accountId.current = snapshot.account.userId;
    setAccount(snapshot.account); setConnections(snapshot.connections);
    if (!snapshot.account.onboarded) {
      const purposes: SignupPurpose[] = snapshot.account.roles.filter(r => r.status === "approved" && r.role !== "provider")
        .map(r => r.role as "mother" | "supporter");
      if (snapshot.account.provider) purposes.push(...snapshot.account.provider.kinds);
      setProfile(previous => previous.displayName || previous.purposes.length ? previous : {
        displayName: snapshot.account.displayName, purposes: purposes.slice(0, 1),
        organization: snapshot.account.provider?.organization ?? "", registrationNumber: snapshot.account.provider?.registrationNumber ?? "",
        details: snapshot.account.details,
      });
    }
  }
  useEffect(() => {
    const controller = new AbortController(); request.current = controller;
    void Promise.resolve().then(() => load(controller.signal)).catch(error => {
      if (!controller.signal.aborted) { setMessage(error instanceof Error ? error.message : "unconfirmed"); setFailed(true); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); request.current?.abort(); };
    // Profile drafts must survive preference and language changes.
  }, []);
  async function act(body: unknown) {
    if (busy || !account) return;
    setBusy(true); setMessage(""); setFailed(false);
    const controller = new AbortController(); request.current = controller;
    try {
      const response = await fetch("/auth/account", { method: "POST", credentials: "same-origin", signal: controller.signal,
        headers: { "Content-Type": "application/json", "X-Prohor-Account": account.userId }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.code === "string" ? result.code : "unconfirmed");
      if (typeof result.redirectTo === "string" && ["/app", "/provider", "/supporter", "/account"].includes(result.redirectTo)) {
        window.location.assign(result.redirectTo); return;
      }
      if (result.invitation) {
        const invite = z.strictObject({ id: z.uuid(), code: z.string().regex(/^[a-f0-9]{64}$/) }).parse(result.invitation);
        setInvitation(invite.code); setReviewed(false);
      }
      await load(controller.signal);
      setCode(""); setMessage("saved");
    } catch (error) {
      if (!controller.signal.aborted) { setMessage(error instanceof Error ? error.message : "unconfirmed"); setFailed(true); }
    } finally { if (!controller.signal.aborted) { setBusy(false); requestAnimationFrame(() => status.current?.focus()); } }
  }
  async function refresh() {
    if (busy) return;
    setLoading(true); setFailed(false); setMessage("");
    try { await load(); } catch (error) { setMessage(error instanceof Error ? error.message : "unconfirmed"); setFailed(true); }
    finally { setLoading(false); }
  }
  const roleLabel = (role: string) => role === "mother" ? t({ en: "Mother", bn: "মা" }) : role === "provider"
    ? t({ en: "Provider", bn: "সেবাদাতা" }) : role === "supporter" ? t({ en: "Supporter", bn: "সহায়তাকারী" }) : t({ en: "Account", bn: "অ্যাকাউন্ট" });
  const statusLabel = (value: string) => ({ approved: t({ en: "Approved", bn: "অনুমোদিত" }),
    pending: t({ en: "Pending", bn: "অপেক্ষমাণ" }), revoked: t({ en: "Revoked", bn: "প্রত্যাহৃত" }),
    active: t({ en: "Active", bn: "সক্রিয়" }), expired: t({ en: "Expired", bn: "মেয়াদ শেষ" }) }[value] ?? value);
  const canMother = account?.activeRole === "mother";
  const canSupport = account?.activeRole === "supporter";
  function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    void act({ action: "invite", supporterId, scopes: [...(visit ? ["visit_preparation"] : []), ...(care ? ["care_coordination"] : [])],
      expiresAt: invitationExpiry(days), reviewConfirmed: reviewed });
  }
  return <div className="min-w-0 space-y-6" aria-busy={busy || loading}>
    <header className="space-y-3"><h1 className="text-3xl font-semibold">{supporter ? t({ en: "Your supporter workspace", bn: "আপনার সহায়তাকারীর কর্মক্ষেত্র" }) : t({ en: "Your account and roles", bn: "আপনার অ্যাকাউন্ট ও পরিচয়" })}</h1>
      <p>{t({ en: "Use one account for each of your roles. The active workspace determines which actions you can take.", bn: "আপনার সব পরিচয়ে একটি অ্যাকাউন্ট ব্যবহার করুন। সক্রিয় কর্মক্ষেত্র অনুযায়ী কাজ করতে পারবেন।" })}</p></header>
    {loading && <p role="status">{t({ en: "Loading account…", bn: "অ্যাকাউন্ট খোলা হচ্ছে…" })}</p>}
    <p ref={status} tabIndex={-1} role={failed ? "alert" : "status"}>{message === "saved" ? t({ en: "Your action was saved. Account status is up to date.", bn: "আপনার কাজ সংরক্ষিত হয়েছে। অ্যাকাউন্টের অবস্থা হালনাগাদ।" }) : message ? errorText(message) : ""}</p>
    <button type="button" className="pro-btn pro-btn-secondary" disabled={busy || loading} onClick={() => void refresh()}>{t({ en: "Reload account status", bn: "অ্যাকাউন্টের অবস্থা আবার দেখুন" })}</button>
    {account && <>
      <section className="pro-card space-y-4">
        <h2 className="text-xl font-semibold">{account.displayName || t({ en: "Your profile", bn: "আপনার পরিচয়" })}</h2>
        <p>{t({ en: "Account ID", bn: "অ্যাকাউন্ট আইডি" })}: <span className="break-all select-all">{account.userId}</span></p>
        <p>{t({ en: "Current workspace", bn: "বর্তমান কর্মক্ষেত্র" })}: {roleLabel(account.activeRole)}</p>
        <ul className="space-y-3">{account.roles.map(membership => <li key={membership.role} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pro-border p-3">
          <span>{roleLabel(membership.role)} — {statusLabel(membership.status)}</span>
          {membership.status === "approved" && <button type="button" className="pro-btn pro-btn-secondary" disabled={busy}
            onClick={() => void act({ action: "switch", role: membership.role as WorkspaceRole })}>{t({ en: "Open workspace", bn: "কর্মক্ষেত্র খুলুন" })}</button>}
        </li>)}</ul>
        {account.provider && <div className="space-y-2">
          <h3 className="font-semibold">{t({ en: "Simulated provider application", bn: "সিমুলেটেড সেবাদাতার আবেদন" })}</h3>
          <p>{account.provider.kinds.map(k => k === "doctor" ? t({ en: "Doctor", bn: "চিকিৎসক" }) : t({ en: "Community health worker", bn: "কমিউনিটি স্বাস্থ্যকর্মী" })).join(" / ")} — {statusLabel(account.provider.status)}</p>
          <p>{account.provider.organization}</p>
          {account.provider.status === "pending" && <p>{t({ en: "Your application is saved for the project operator to review. Reload this page after approval. No patient information is available while approval is pending.", bn: "প্রকল্প পরিচালকের পর্যালোচনার জন্য আবেদন সংরক্ষিত। অনুমোদনের পর পৃষ্ঠা আবার খুলুন। অপেক্ষমাণ অবস্থায় রোগীর তথ্য দেখা যায় না।" })}</p>}
        </div>}
      </section>
      {!account.onboarded && <form className="pro-card space-y-5" onSubmit={e => { e.preventDefault(); void act({ action: "onboard", profile }); }}>
        <h2 className="text-xl font-semibold">{t({ en: "Complete your account", bn: "অ্যাকাউন্ট সম্পূর্ণ করুন" })}</h2>
        <RoleProfileFields value={profile} onChange={setProfile} disabled={busy} />
        <button className="pro-btn pro-btn-primary" disabled={busy}>{t({ en: "Save my roles", bn: "আমার পরিচয় সংরক্ষণ করুন" })}</button>
      </form>}
      {canMother && <form className="pro-card space-y-4" onSubmit={handleInviteSubmit}>
        <h2 className="text-xl font-semibold">{t({ en: "Invite a supporter", bn: "সহায়তাকারীকে আমন্ত্রণ জানান" })}</h2>
        <p>{t({ en: "Ask your supporter for their account ID. Choose permissions and an expiry, then give the one-time invitation code to that person privately.", bn: "সহায়তাকারীর অ্যাকাউন্ট আইডি নিন। অনুমতি ও মেয়াদ বেছে নিয়ে শুধু তাঁকে ব্যক্তিগতভাবে একবার ব্যবহারযোগ্য আমন্ত্রণ কোড দিন।" })}</p>
        <div className="pro-field"><label htmlFor="supporter-id">{t({ en: "Supporter's account ID", bn: "সহায়তাকারীর অ্যাকাউন্ট আইডি" })}</label>
          <input id="supporter-id" className={inputClass} required value={supporterId} maxLength={36} onChange={e => setSupporterId(e.target.value.trim())} /></div>
        <fieldset className="space-y-2"><legend className="font-semibold">{t({ en: "Allow support with", bn: "যে কাজে সহায়তা করতে পারবেন" })}</legend>
          <label className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={visit} onChange={e => setVisit(e.target.checked)} />{t({ en: "Visit preparation", bn: "সাক্ষাতের প্রস্তুতি" })}</label>
          <label className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={care} onChange={e => setCare(e.target.checked)} />{t({ en: "Care coordination", bn: "যত্নের সমন্বয়" })}</label>
        </fieldset>
        <p>{t({ en: "These permissions establish your support relationship. Health records, reports, diary and AI conversations are not shared. Appointment and care-request delegation are not connected yet.", bn: "এই অনুমতিগুলো সহায়তার সম্পর্ক স্থাপন করে। স্বাস্থ্যতথ্য, রিপোর্ট, ডায়েরি বা এআই কথোপকথন শেয়ার হয় না। অ্যাপয়েন্টমেন্ট ও যত্নের অনুরোধের প্রতিনিধিত্ব এখনও যুক্ত হয়নি।" })}</p>
        <div className="pro-field"><label htmlFor="expiry-days">{t({ en: "Expires after", bn: "মেয়াদ শেষ হবে" })}</label>
          <select id="expiry-days" className={inputClass} value={days} onChange={e => setDays(Number(e.target.value))}>
            {[1, 7, 14, 30].map(d => <option key={d} value={d}>{d} {t({ en: "days", bn: "দিন পরে" })}</option>)}
          </select></div>
        <label className="flex min-h-12 items-start gap-3"><input type="checkbox" required className="mt-1" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />
          <span>{t({ en: "I reviewed the recipient, permissions and expiry. I can revoke access at any time.", bn: "প্রাপক, অনুমতি ও মেয়াদ যাচাই করেছি। যেকোনো সময় অনুমতি প্রত্যাহার করতে পারব।" })}</span></label>
        <button className="pro-btn pro-btn-primary" disabled={busy || (!visit && !care)}>{t({ en: "Create invitation", bn: "আমন্ত্রণ তৈরি করুন" })}</button>
        {invitation && <div className="space-y-2"><label htmlFor="invitation-code">{t({ en: "Invitation code — shown only here", bn: "আমন্ত্রণ কোড — শুধু এখানে দেখানো হচ্ছে" })}</label>
          <textarea id="invitation-code" className={inputClass} readOnly value={invitation} rows={3} />
          <p>{t({ en: "Share this privately with the intended supporter. If lost, revoke the pending invitation and create another.", bn: "নির্দিষ্ট সহায়তাকারীকে ব্যক্তিগতভাবে দিন। হারিয়ে গেলে অপেক্ষমাণ আমন্ত্রণ প্রত্যাহার করে নতুনটি তৈরি করুন।" })}</p></div>}
      </form>}
      {canSupport && <form className="pro-card space-y-4" onSubmit={e => { e.preventDefault(); void act({ action: "accept", code: code.trim() }); }}>
        <h2 className="text-xl font-semibold">{t({ en: "Accept a mother's invitation", bn: "মায়ের আমন্ত্রণ গ্রহণ করুন" })}</h2>
        <p>{t({ en: "Give your account ID above to the mother. She chooses permissions and sends you an invitation code. Accepting never grants automatic access to her private records.", bn: "উপরের অ্যাকাউন্ট আইডি মাকে দিন। তিনি অনুমতি বেছে আমন্ত্রণ কোড পাঠাবেন। গ্রহণ করলে স্বয়ংক্রিয়ভাবে তাঁর ব্যক্তিগত তথ্য দেখা যাবে না।" })}</p>
        <div className="pro-field"><label htmlFor="accept-code">{t({ en: "Invitation code", bn: "আমন্ত্রণ কোড" })}</label>
          <textarea id="accept-code" className={inputClass} required maxLength={64} value={code} onChange={e => setCode(e.target.value.trim())} rows={3} /></div>
        <button className="pro-btn pro-btn-primary" disabled={busy}>{t({ en: "Accept invitation", bn: "আমন্ত্রণ গ্রহণ করুন" })}</button>
      </form>}
      {(canMother || canSupport) && <section className="pro-card space-y-4">
        <h2 className="text-xl font-semibold">{t({ en: "Support relationships", bn: "সহায়তার সম্পর্ক" })}</h2>
        {!connections.length && <p>{t({ en: "No invitations or support relationships yet.", bn: "এখনও কোনো আমন্ত্রণ বা সহায়তার সম্পর্ক নেই।" })}</p>}
        <ul className="space-y-4">{connections.map(c => <li key={c.id} className="space-y-3 rounded-xl border border-pro-border p-4">
          <p>{c.motherId === account.userId ? c.supporterName || c.supporterId : c.motherName || c.motherId} — {statusLabel(c.status)}</p>
          <p>{c.scopes.map(s => s === "visit_preparation" ? t({ en: "Visit preparation", bn: "সাক্ষাতের প্রস্তুতি" }) : t({ en: "Care coordination", bn: "যত্নের সমন্বয়" })).join("; ")}</p>
          <p>{t({ en: "Expiry", bn: "মেয়াদ" })}: {new Date(c.expiresAt).toLocaleString()}</p>
          {(c.status === "active" || c.status === "pending") && <button type="button" className="pro-btn pro-btn-secondary" disabled={busy}
            onClick={() => { if (window.confirm(t({ en: "Revoke this invitation or relationship? Further access will be blocked.", bn: "এই আমন্ত্রণ বা সম্পর্ক প্রত্যাহার করবেন? পরবর্তী প্রবেশ বন্ধ হবে।" }))) void act({ action: "revoke", connectionId: c.id }); }}>{t({ en: "Revoke access", bn: "অনুমতি প্রত্যাহার করুন" })}</button>}
        </li>)}</ul>
      </section>}
    </>}
    <nav aria-label={t({ en: "Account links", bn: "অ্যাকাউন্টের লিংক" })} className="flex flex-wrap gap-4">
      {supporter && <Link href="/account" className="underline">{t({ en: "Account and roles", bn: "অ্যাকাউন্ট ও পরিচয়" })}</Link>}
      <Link href="/" className="underline">{t({ en: "Public home", bn: "সবার জন্য মূল পৃষ্ঠা" })}</Link>
      <button
        type="button"
        className="underline cursor-pointer"
        onClick={async () => {
          try {
            // Server returns JSON + Set-Cookie — await so cookies clear before navigate.
            await fetch("/auth/sign-out", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Accept": "application/json" },
            });
          } catch {
            // Network error — still navigate away.
          } finally {
            window.location.assign("/sign-in?status=signed-out");
          }
        }}
      >
        {t({ en: "Sign out", bn: "সাইন আউট" })}
      </button>
    </nav>
  </div>;
}
