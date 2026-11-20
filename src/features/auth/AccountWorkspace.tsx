"use client";
import { useLanguage } from "@/i18n/use-language";
import {
  accountAccessSchema,
  supporterConnectionSchema,
  type AccountAccess,
  type SignupPurpose,
  type SupporterConnection,
} from "@/lib/contracts/account";
import { CircleCheck, Clock, Mail, ShieldCheck, TriangleAlert, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { z } from "zod";
import { accountMessage, roleName } from "./account/account-copy";
import { ProfilePanel } from "./account/ProfilePanel";
import { SecurityPanel } from "./account/SecurityPanel";
import { SupportersPanel } from "./account/SupportersPanel";
import type { Act } from "./account/types";
import { emptyRoleProfile, RoleProfileFields } from "./RoleProfileFields";
import "./account.css";

// Not strict: the API may add fields (e.g. `activity`); a strict parse rejected every load.
const snapshotSchema = z.object({
  account: accountAccessSchema,
  email: z.string().default(""),
  pendingEmail: z.string().nullable().default(null),
  connections: z.array(supporterConnectionSchema),
});
type Tab = "profile" | "supporters" | "security";

export function AccountWorkspace({ supporter = false }: { supporter?: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [account, setAccount] = useState<AccountAccess | null>(null);
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [connections, setConnections] = useState<SupporterConnection[]>([]);
  const [onboarding, setOnboarding] = useState(emptyRoleProfile);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [setupError, setSetupError] = useState("");
  const [tab, setTab] = useState<Tab>(supporter ? "supporters" : "profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const accountId = useRef<string | null>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ profile: null, supporters: null, security: null });

  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/auth/account", { cache: "no-store", credentials: "same-origin", signal });
    const body = await response.json();
    if (!response.ok) throw new Error(typeof body.code === "string" ? body.code : "unconfirmed");
    const snapshot = snapshotSchema.parse(body);
    if (signal?.aborted) return;
    if (accountId.current && accountId.current !== snapshot.account.userId) throw new Error("account-changed");
    accountId.current = snapshot.account.userId;
    setAccount(snapshot.account);
    setEmail(snapshot.email);
    setPendingEmail(snapshot.pendingEmail);
    setConnections(snapshot.connections);
    if (!snapshot.account.onboarded) {
      const purposes: SignupPurpose[] = snapshot.account.roles
        .filter((r) => r.status === "approved" && r.role !== "provider").map((r) => r.role as "mother" | "supporter");
      if (snapshot.account.provider) purposes.push(...snapshot.account.provider.kinds);
      // Signup accepts only the original detail keys.
      const { phone, district, careStage, supporterType, qualification, specialty, serviceArea } = snapshot.account.details;
      setOnboarding((previous) => previous.displayName || previous.purposes.length ? previous : {
        displayName: snapshot.account.displayName, purposes: purposes.slice(0, 1),
        organization: snapshot.account.provider?.organization ?? "", registrationNumber: snapshot.account.provider?.registrationNumber ?? "",
        details: { phone, district, careStage, supporterType, qualification, specialty, serviceArea },
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => load(controller.signal))
      .then(() => {
        // Deep links: /app/account#supporters or #security open that tab.
        const fromHash = window.location.hash.slice(1);
        if (fromHash === "profile" || fromHash === "supporters" || fromHash === "security") setTab(fromHash);
      })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "unconfirmed"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [load]);

  const act: Act = useCallback(async (body) => {
    if (!account) return { ok: false, code: "unconfirmed" };
    setBusy(true);
    try {
      const response = await fetch("/auth/account", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Prohor-Account": account.userId },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return { ok: false, code: typeof result.code === "string" ? result.code : "unconfirmed" };
      if (typeof result.redirectTo === "string" && ["/app", "/provider", "/supporter", "/account"].includes(result.redirectTo)) {
        router.push(result.redirectTo);
        return { ok: true, code: "saved", data: result };
      }
      await load().catch(() => undefined);
      return { ok: true, code: typeof result.code === "string" ? result.code : "saved", data: result };
    } catch {
      return { ok: false, code: "unconfirmed" };
    } finally {
      setBusy(false);
    }
  }, [account, load, router]);

  const isMother = account?.activeRole === "mother";
  const isSupporter = account?.activeRole === "supporter";
  const tabs: { id: Tab; label: string }[] = account?.onboarded ? [
    { id: "profile", label: t({ en: "Profile", bn: "প্রোফাইল" }) },
    ...(isMother || isSupporter ? [{ id: "supporters" as const, label: isMother ? t({ en: "Supporters", bn: "সহায়তাকারী" }) : t({ en: "Mothers you support", bn: "যে মায়েদের সহায়তা করছেন" }) }] : []),
    { id: "security", label: t({ en: "Security", bn: "নিরাপত্তা" }) },
  ] : [];
  const shown = tabs.some((item) => item.id === tab) ? tab : "profile";
  function choose(next: Tab, focus = false) {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
    if (focus) tabRefs.current[next]?.focus();
  }
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const index = tabs.findIndex((item) => item.id === shown);
    const target = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (target === null) return;
    event.preventDefault();
    choose(tabs[(target + tabs.length) % tabs.length].id, true);
  }

  // Profile completeness counts only fields that matter for this account's role.
  const d = account?.details;
  const checklist = !account || !d ? [] : [
    Boolean(account.displayName.trim()), Boolean(d.phone), Boolean(d.district),
    ...(isMother ? [Boolean(d.dateOfBirth), Boolean(d.bloodGroup), Boolean(d.careStage), Boolean(d.emergencyName && d.emergencyPhone)] : []),
    ...(isSupporter ? [Boolean(d.supporterType)] : []),
    ...(account.provider ? [Boolean(d.qualification), Boolean(d.serviceArea)] : []),
  ];
  const filled = checklist.filter(Boolean).length;
  const percent = checklist.length ? Math.round((filled / checklist.length) * 100) : 0;
  const number = (value: number) => t({ en: String(value), bn: new Intl.NumberFormat("bn-BD").format(value) });

  if (loading && !account) return (
    <div className="grid gap-6" aria-busy="true">
      <p role="status" className="sr-only">{t({ en: "Loading your account…", bn: "আপনার অ্যাকাউন্ট খোলা হচ্ছে…" })}</p>
      <div className="acct-skel acct-skel-hero" aria-hidden="true" />
      <div className="acct-skel" aria-hidden="true" />
    </div>
  );
  if (!account) return (
    <div className="acct-card" role="alert">
      <h1 className="acct-h2 flex items-center gap-2"><TriangleAlert size={20} aria-hidden="true" className="text-pro-danger" />{t({ en: "Your account could not be opened", bn: "আপনার অ্যাকাউন্ট খোলা যায়নি" })}</h1>
      <p className="acct-lead">{accountMessage(loadError, t)}</p>
      <button type="button" className="acct-btn acct-btn-primary w-fit" onClick={() => window.location.reload()}>{t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}</button>
    </div>
  );

  const approvedRoles = account.roles.filter((r) => r.status === "approved");
  return (
    <div className="grid min-w-0 gap-6" aria-busy={busy}>
      <header className="acct-hero">
        <span className="acct-hero-avatar" aria-hidden="true">{account.displayName.trim().charAt(0).toUpperCase() || <UserRound size={30} />}</span>
        <div className="acct-hero-text">
          <p className="acct-hero-kicker">{supporter ? t({ en: "Supporter account", bn: "সহায়তাকারীর অ্যাকাউন্ট" }) : t({ en: "My account", bn: "আমার অ্যাকাউন্ট" })}</p>
          <h1 className="acct-hero-name">{account.displayName.trim() || t({ en: "Your account", bn: "আপনার অ্যাকাউন্ট" })}</h1>
          <div className="acct-hero-meta">
            {email && <span className="acct-hero-email"><Mail size={15} aria-hidden="true" /><span lang="en" dir="ltr">{email}</span></span>}
            {approvedRoles.map((r) => (
              <span key={r.role} className="acct-pill" data-tone="ok">
                {r.role === "supporter" ? <Users size={14} aria-hidden="true" /> : <ShieldCheck size={14} aria-hidden="true" />}{roleName(r.role, t)}
              </span>
            ))}
            {account.roles.filter((r) => r.status === "pending").map((r) => (
              <span key={r.role} className="acct-pill" data-tone="wait"><Clock size={14} aria-hidden="true" />{roleName(r.role, t)} · {t({ en: "waiting for approval", bn: "অনুমোদনের অপেক্ষায়" })}</span>
            ))}
          </div>
        </div>
        {account.onboarded && checklist.length > 0 && (
          <div className="acct-progress">
            <p className="acct-progress-label">
              {percent === 100 ? <CircleCheck size={16} aria-hidden="true" /> : null}
              {percent === 100 ? t({ en: "Profile complete", bn: "প্রোফাইল সম্পূর্ণ" })
                : t({ en: `Profile ${filled} of ${checklist.length} filled`, bn: `প্রোফাইলের ${number(checklist.length)}টির মধ্যে ${number(filled)}টি পূরণ হয়েছে` })}
            </p>
            <span className="acct-progress-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
            {percent < 100 && !editingProfile && (
              <button type="button" className="acct-btn acct-btn-primary acct-btn-sm" onClick={() => { choose("profile"); setEditingProfile(true); }}>
                {t({ en: "Complete your profile", bn: "প্রোফাইল পূরণ করুন" })}
              </button>
            )}
          </div>
        )}
      </header>

      {!account.onboarded ? (
        <form className="acct-card" onSubmit={async (e) => {
          e.preventDefault();
          setSetupError("");
          const result = await act({ action: "onboard", profile: onboarding });
          if (!result.ok) setSetupError(accountMessage(result.code, t));
        }}>
          <div className="grid gap-1">
            <h2 className="acct-h2">{t({ en: "Finish setting up your account", bn: "অ্যাকাউন্ট সেটআপ শেষ করুন" })}</h2>
            <p className="acct-hint">{t({ en: "Tell us your name and how you will use PROHOR. You can add more details afterwards.", bn: "আপনার নাম ও কীভাবে প্রহর ব্যবহার করবেন তা জানান। বাকি তথ্য পরে যোগ করতে পারবেন।" })}</p>
          </div>
          {setupError && <p role="alert" className="acct-status" data-tone="error">{setupError}</p>}
          <RoleProfileFields value={onboarding} onChange={setOnboarding} disabled={busy} />
          <button className="acct-btn acct-btn-primary w-fit" disabled={busy}>{t({ en: "Save and continue", bn: "সংরক্ষণ করে এগিয়ে যান" })}</button>
        </form>
      ) : (
        <>
          <div role="tablist" aria-label={t({ en: "Account sections", bn: "অ্যাকাউন্টের অংশ" })} className="acct-tabs">
            {tabs.map((item) => (
              <button key={item.id} ref={(node) => { tabRefs.current[item.id] = node; }} type="button" role="tab" id={`acct-tab-${item.id}`}
                aria-selected={shown === item.id} aria-controls={`acct-panel-${item.id}`} tabIndex={shown === item.id ? 0 : -1}
                onClick={() => choose(item.id)} onKeyDown={onTabKey}>
                {item.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`acct-panel-${shown}`} aria-labelledby={`acct-tab-${shown}`} className="acct-panel">
            {shown === "profile" && <ProfilePanel account={account} act={act} busy={busy} editing={editingProfile} setEditing={setEditingProfile} />}
            {shown === "supporters" && <SupportersPanel account={account} connections={connections} act={act} busy={busy} />}
            {shown === "security" && <SecurityPanel account={account} email={email} pendingEmail={pendingEmail} act={act} busy={busy} />}
          </div>
        </>
      )}
    </div>
  );
}
