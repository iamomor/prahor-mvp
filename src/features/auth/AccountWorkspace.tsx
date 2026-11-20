"use client";
import { useLanguage } from "@/i18n/use-language";
import {
  accountAccessSchema,
  supporterConnectionSchema,
  type AccountAccess,
  type SignupPurpose,
  type SupporterConnection,
  type WorkspaceRole,
} from "@/lib/contracts/account";
import {
  Accessibility,
  ArrowRight,
  Ban,
  Check,
  HeartPulse,
  LifeBuoy,
  CircleCheck,
  CircleSlash,
  Clock,
  Copy,
  Heart,
  HeartHandshake,
  House,
  KeyRound,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { emptyRoleProfile, RoleProfileFields } from "./RoleProfileFields";
import { SignOutButton } from "./SignOutButton";
import "./account.css";

const snapshotSchema = z.strictObject({
  account: accountAccessSchema,
  connections: z.array(supporterConnectionSchema),
});
// Same card as Home and the module pages.
const card =
  "rounded-card border border-pro-border bg-pro-elevated shadow-pro-1";
function invitationExpiry(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}
export function AccountWorkspace({
  supporter = false,
}: {
  supporter?: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
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
  const [copied, setCopied] = useState<"id" | "code" | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const accountId = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const errorText = (code: string) => {
    if (code === "roles-unavailable")
      return t({
        en: "Role setup is not available yet. Your existing account is safe; retry after account setup is enabled.",
        bn: "পরিচয় সেটআপ এখনও প্রস্তুত নয়। আপনার বর্তমান অ্যাকাউন্ট নিরাপদ আছে; সেটআপ চালু হলে আবার চেষ্টা করুন।",
      });
    if (code === "access-denied" || code === "not-found")
      return t({
        en: "That role, recipient or invitation is not available to your account. Check the details and permissions.",
        bn: "এই পরিচয়, প্রাপক বা আমন্ত্রণ আপনার অ্যাকাউন্টে উপলব্ধ নয়। তথ্য ও অনুমতি যাচাই করুন।",
      });
    if (code === "invalid-input")
      return t({
        en: "Check the name, selected roles, professional details, recipient ID, permissions and expiry.",
        bn: "নাম, পরিচয়, পেশাগত তথ্য, প্রাপকের আইডি, অনুমতি ও মেয়াদ যাচাই করুন।",
      });
    if (code === "account-changed")
      return t({
        en: "The signed-in account changed. Reload before continuing.",
        bn: "সাইন ইন করা অ্যাকাউন্ট বদলেছে। এগোনোর আগে পৃষ্ঠা আবার খুলুন।",
      });
    return t({
      en: "The result could not be confirmed. Your inputs remain here. Reload the account status before retrying an invitation.",
      bn: "ফলাফল নিশ্চিত হয়নি। আপনার লেখা তথ্য রয়ে গেছে। আমন্ত্রণ আবার পাঠানোর আগে অ্যাকাউন্টের অবস্থা আবার দেখুন।",
    });
  };
  async function load(signal?: AbortSignal) {
    const response = await fetch("/auth/account", {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(
        typeof body.code === "string" ? body.code : "unconfirmed",
      );
    const snapshot = snapshotSchema.parse(body);
    if (signal?.aborted) return;
    if (accountId.current && accountId.current !== snapshot.account.userId)
      throw new Error("account-changed");
    accountId.current = snapshot.account.userId;
    setAccount(snapshot.account);
    setConnections(snapshot.connections);
    if (!snapshot.account.onboarded) {
      const purposes: SignupPurpose[] = snapshot.account.roles
        .filter((r) => r.status === "approved" && r.role !== "provider")
        .map((r) => r.role as "mother" | "supporter");
      if (snapshot.account.provider)
        purposes.push(...snapshot.account.provider.kinds);
      setProfile((previous) =>
        previous.displayName || previous.purposes.length
          ? previous
          : {
              displayName: snapshot.account.displayName,
              purposes: purposes.slice(0, 1),
              organization: snapshot.account.provider?.organization ?? "",
              registrationNumber:
                snapshot.account.provider?.registrationNumber ?? "",
              details: snapshot.account.details,
            },
      );
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    void Promise.resolve()
      .then(() => load(controller.signal))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : "unconfirmed");
          setFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      request.current?.abort();
    };
    // Profile drafts must survive preference and language changes.
  }, []);
  async function act(body: unknown) {
    if (busy || !account) return;
    setBusy(true);
    setMessage("");
    setFailed(false);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch("/auth/account", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Prohor-Account": account.userId,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.code === "string" ? result.code : "unconfirmed",
        );
      if (
        typeof result.redirectTo === "string" &&
        ["/app", "/provider", "/supporter", "/account"].includes(
          result.redirectTo,
        )
      ) {
        router.push(result.redirectTo);
        return;
      }
      if (result.invitation) {
        const invite = z
          .strictObject({
            id: z.uuid(),
            code: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .parse(result.invitation);
        setInvitation(invite.code);
        setReviewed(false);
      }
      await load(controller.signal);
      setCode("");
      setMessage("saved");
    } catch (error) {
      if (!controller.signal.aborted) {
        setMessage(error instanceof Error ? error.message : "unconfirmed");
        setFailed(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        requestAnimationFrame(() => status.current?.focus());
      }
    }
  }
  async function refresh() {
    if (busy) return;
    setLoading(true);
    setFailed(false);
    setMessage("");
    try {
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "unconfirmed");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  const roleLabel = (role: string) =>
    role === "mother"
      ? t({ en: "Mother", bn: "মা" })
      : role === "provider"
        ? t({ en: "Provider", bn: "সেবাদাতা" })
        : role === "supporter"
          ? t({ en: "Supporter", bn: "সহায়তাকারী" })
          : t({ en: "Account", bn: "অ্যাকাউন্ট" });
  const roleIcon = (role: string): LucideIcon =>
    role === "mother"
      ? Heart
      : role === "provider"
        ? Stethoscope
        : HeartHandshake;
  const statusLabel = (value: string) =>
    ({
      approved: t({ en: "Approved", bn: "অনুমোদিত" }),
      pending: t({ en: "Pending", bn: "অপেক্ষমাণ" }),
      revoked: t({ en: "Revoked", bn: "প্রত্যাহৃত" }),
      active: t({ en: "Active", bn: "সক্রিয়" }),
      expired: t({ en: "Expired", bn: "মেয়াদ শেষ" }),
    })[value] ?? value;
  // Icon + word + tint: status is never colour alone.
  const statusPill = (value: string) => {
    const tone =
      value === "approved" || value === "active"
        ? "ok"
        : value === "pending"
          ? "wait"
          : "off";
    const Icon =
      tone === "ok" ? CircleCheck : tone === "wait" ? Clock : CircleSlash;
    return (
      <span className="acct-pill" data-tone={tone}>
        <Icon size={14} aria-hidden="true" />
        {statusLabel(value)}
      </span>
    );
  };
  const scopeLabel = (s: string) =>
    s === "visit_preparation"
      ? t({ en: "Visit preparation", bn: "সাক্ষাতের প্রস্তুতি" })
      : t({ en: "Care coordination", bn: "যত্নের সমন্বয়" });
  const careStageLabel = (v: string) =>
    ({
      planning: t({ en: "Planning a pregnancy", bn: "গর্ভধারণের পরিকল্পনা" }),
      pregnant: t({ en: "Pregnant", bn: "গর্ভবতী" }),
      postpartum: t({ en: "After birth", bn: "সন্তান জন্মের পর" }),
      prefer_not_to_say: t({ en: "Prefer not to say", bn: "বলতে চাই না" }),
    })[v] ?? v;
  const supporterTypeLabel = (v: string) =>
    ({
      family: t({ en: "Family member", bn: "পরিবারের সদস্য" }),
      caregiver: t({ en: "Caregiver", bn: "যত্নদাতা" }),
      supporter: t({ en: "Supporter", bn: "সহায়তাকারী" }),
    })[v] ?? v;
  const providerKinds = (kinds: string[]) =>
    kinds
      .map((k) =>
        k === "doctor"
          ? t({ en: "Doctor", bn: "চিকিৎসক" })
          : t({ en: "Community health worker", bn: "কমিউনিটি স্বাস্থ্যকর্মী" }),
      )
      .join(" / ");
  async function copy(text: string, what: "id" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      /* the text stays selectable */
    }
  }
  const canMother = account?.activeRole === "mother";
  const canSupport = account?.activeRole === "supporter";
  function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    void act({
      action: "invite",
      supporterId,
      scopes: [
        ...(visit ? ["visit_preparation"] : []),
        ...(care ? ["care_coordination"] : []),
      ],
      expiresAt: invitationExpiry(days),
      reviewConfirmed: reviewed,
    });
  }
  const initial = account?.displayName.trim().charAt(0).toUpperCase() || "•";
  const banner =
    message === "saved"
      ? t({
          en: "Your action was saved. Account status is up to date.",
          bn: "আপনার কাজ সংরক্ষিত হয়েছে। অ্যাকাউন্টের অবস্থা হালনাগাদ।",
        })
      : message
        ? errorText(message)
        : "";
  const BannerIcon = failed ? TriangleAlert : CircleCheck;
  const notAdded = t({ en: "Not added", bn: "যোগ করা নেই" });
  // Read-only facts about this account. Only what the account actually stores; empty values say so.
  const d = account?.details;
  const facts: { label: string; value: string }[] =
    !account || !d
      ? []
      : [
          { label: t({ en: "Phone", bn: "ফোন" }), value: d.phone },
          { label: t({ en: "District", bn: "জেলা" }), value: d.district },
          ...(account.roles.some((r) => r.role === "mother")
            ? [
                {
                  label: t({ en: "Care stage", bn: "যত্নের ধাপ" }),
                  value: d.careStage ? careStageLabel(d.careStage) : "",
                },
              ]
            : []),
          ...(account.roles.some((r) => r.role === "supporter")
            ? [
                {
                  label: t({ en: "Supporter type", bn: "সহায়তাকারীর ধরন" }),
                  value: d.supporterType
                    ? supporterTypeLabel(d.supporterType)
                    : "",
                },
              ]
            : []),
          ...(account.provider
            ? [
                {
                  label: t({ en: "Provider type", bn: "সেবাদাতার ধরন" }),
                  value: providerKinds(account.provider.kinds),
                },
                {
                  label: t({ en: "Organization", bn: "প্রতিষ্ঠান" }),
                  value: account.provider.organization,
                },
                {
                  label: t({ en: "Registration number", bn: "নিবন্ধন নম্বর" }),
                  value: account.provider.registrationNumber,
                },
                {
                  label: t({ en: "Qualification", bn: "যোগ্যতা" }),
                  value: d.qualification,
                },
                {
                  label: t({ en: "Specialty", bn: "বিশেষত্ব" }),
                  value: d.specialty,
                },
                {
                  label: t({ en: "Service area", bn: "সেবার এলাকা" }),
                  value: d.serviceArea,
                },
              ]
            : []),
        ];
  const pageTitle = supporter
    ? t({ en: "Your supporter workspace", bn: "আপনার সহায়তাকারীর কর্মক্ষেত্র" })
    : t({ en: "Your account and roles", bn: "আপনার অ্যাকাউন্ট ও পরিচয়" });
  // In-page sections; only the ones this account actually shows.
  const sections = account
    ? [
        { id: "acct-go", label: t({ en: "Overview", bn: "সারসংক্ষেপ" }) },
        ...(canMother || canSupport
          ? [{ id: canMother ? "acct-invite" : "acct-accept", label: t({ en: "Supporters", bn: "সহায়তাকারী" }) }]
          : []),
        { id: "acct-roles", label: t({ en: "Roles", bn: "পরিচয়" }) },
        { id: "acct-privacy", label: t({ en: "Privacy & sign out", bn: "গোপনীয়তা ও সাইন আউট" }) },
      ]
    : [];
  const tile = (href: string, Icon: LucideIcon, label: string, module?: string) => (
    <li key={href}>
      <Link href={href} className="acct-tile-link">
        <span className="acct-row-icon">
          <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="acct-tile-text">
          <span className="acct-tile-label">{label}</span>
          {module && <span className="acct-tile-module" lang="en">{module}</span>}
        </span>
        <ArrowRight size={18} aria-hidden="true" className="acct-tile-arrow" />
      </Link>
    </li>
  );
  return (
    <div className="grid min-w-0 gap-6" aria-busy={busy || loading}>
      <header className="acct-hero">
        <span className="acct-hero-avatar" aria-hidden="true">
          {account ? initial : <UserRound size={28} />}
        </span>
        <div className="acct-hero-text">
          <p className="acct-hero-kicker">{pageTitle}</p>
          <h1 className="acct-hero-name">
            {account?.displayName.trim() ||
              t({ en: "Your account", bn: "আপনার অ্যাকাউন্ট" })}
          </h1>
          {account && (
            <div className="flex flex-wrap gap-2">
              <span className="acct-pill" data-tone="ok">
                <ShieldCheck size={14} aria-hidden="true" />
                {t({ en: "Current workspace", bn: "বর্তমান কর্মক্ষেত্র" })}:{" "}
                {roleLabel(account.activeRole)}
              </span>
              <span className="acct-pill" data-tone={account.onboarded ? "ok" : "wait"}>
                {account.onboarded ? (
                  <CircleCheck size={14} aria-hidden="true" />
                ) : (
                  <Clock size={14} aria-hidden="true" />
                )}
                {account.onboarded
                  ? t({ en: "Setup complete", bn: "সেটআপ সম্পূর্ণ" })
                  : t({ en: "Setup needs your details", bn: "সেটআপে আপনার তথ্য দরকার" })}
              </span>
            </div>
          )}
        </div>
        {account && (canMother || canSupport) && (
          <div className="acct-hero-actions">
            <a
              href={canMother ? "#acct-invite" : "#acct-accept"}
              className="acct-btn acct-btn-primary"
            >
              {canMother ? (
                <UserPlus size={17} aria-hidden="true" />
              ) : (
                <KeyRound size={17} aria-hidden="true" />
              )}
              {canMother
                ? t({ en: "Invite a supporter", bn: "সহায়তাকারীকে আমন্ত্রণ জানান" })
                : t({ en: "Accept an invitation", bn: "আমন্ত্রণ গ্রহণ করুন" })}
            </a>
            {canMother && (
              <Link href="/app/accessibility" className="acct-btn">
                <Accessibility size={17} aria-hidden="true" />
                {t({ en: "Accessibility settings", bn: "অ্যাক্সেসিবিলিটি সেটিংস" })}
              </Link>
            )}
          </div>
        )}
      </header>
      {sections.length > 0 && (
        <nav
          aria-label={t({ en: "Account sections", bn: "অ্যাকাউন্টের অংশ" })}
          className="acct-sections"
        >
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
      <div className="grid min-w-0 gap-6">
        {loading && (
          <p role="status" className="sr-only">
            {t({ en: "Loading account…", bn: "অ্যাকাউন্ট খোলা হচ্ছে…" })}
          </p>
        )}
        <p
          ref={status}
          tabIndex={-1}
          role={failed ? "alert" : "status"}
          className="acct-banner"
          data-tone={banner ? (failed ? "error" : "ok") : undefined}
        >
          {banner && (
            <>
              <BannerIcon size={18} aria-hidden="true" />
              <span>{banner}</span>
            </>
          )}
        </p>
        {loading && !account && (
          <div aria-hidden="true" className="acct-skel" />
        )}
        {account && (
          <>
            <section
              id="acct-go"
              tabIndex={-1}
              className={`${card} acct-anchor grid gap-4 p-5 sm:p-6`}
              aria-labelledby="acct-go-title"
            >
              <h2 id="acct-go-title" className="acct-h2">
                {t({ en: "Go to", bn: "যেখানে যেতে চান" })}
              </h2>
              <ul className="acct-tiles-grid">
                {canMother && (
                  <>
                    {tile("/app/jibonrekha", HeartPulse, t({ en: "My records", bn: "আমার রেকর্ড" }), "Jibonrekha")}
                    {tile("/app/bondhon", HeartHandshake, t({ en: "Sharing & care requests", bn: "শেয়ার ও যত্নের অনুরোধ" }), "Bondhon")}
                    {tile("/app/accessibility", Accessibility, t({ en: "How I use PROHOR", bn: "আমি কীভাবে প্রহর ব্যবহার করি" }), "Adapt")}
                    {tile("/app/care", LifeBuoy, t({ en: "Get help", bn: "সাহায্য নিন" }), "Shonket")}
                  </>
                )}
                {supporter && tile("/account", Users, t({ en: "Account and roles", bn: "অ্যাকাউন্ট ও পরিচয়" }))}
                {tile("/", House, t({ en: "Public home", bn: "সবার জন্য মূল পৃষ্ঠা" }))}
              </ul>
            </section>
            <section
              className={`${card} grid gap-5 p-5 sm:p-6`}
              aria-labelledby="acct-about"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="acct-about" className="acct-h2">
                  {t({ en: "Your details", bn: "আপনার তথ্য" })}
                </h2>
                <p className="acct-hint">
                  {t({ en: "Only what your account stores", bn: "শুধু আপনার অ্যাকাউন্টে যা সংরক্ষিত" })}
                </p>
              </div>
              <dl className="acct-facts">
                <div className="acct-fact acct-fact-wide">
                  <dt>{t({ en: "Account ID", bn: "অ্যাকাউন্ট আইডি" })}</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <code className="min-w-0 text-sm [overflow-wrap:anywhere]">
                      {account.userId}
                    </code>
                    <button
                      type="button"
                      className="acct-btn acct-btn-sm"
                      onClick={() => void copy(account.userId, "id")}
                    >
                      {copied === "id" ? (
                        <Check size={15} aria-hidden="true" />
                      ) : (
                        <Copy size={15} aria-hidden="true" />
                      )}
                      {copied === "id"
                        ? t({ en: "Copied", bn: "কপি হয়েছে" })
                        : t({ en: "Copy ID", bn: "আইডি কপি করুন" })}
                    </button>
                  </dd>
                </div>
                <div className="acct-fact">
                  <dt>{t({ en: "Account setup", bn: "অ্যাকাউন্ট সেটআপ" })}</dt>
                  <dd>
                    {account.onboarded
                      ? t({ en: "Complete", bn: "সম্পূর্ণ" })
                      : t({
                          en: "Needs your details below",
                          bn: "নিচে আপনার তথ্য দিন",
                        })}
                  </dd>
                </div>
                <div className="acct-fact">
                  <dt>{t({ en: "Roles", bn: "পরিচয়" })}</dt>
                  <dd>
                    {account.roles.length
                      ? account.roles
                          .map(
                            (r) =>
                              `${roleLabel(r.role)} (${statusLabel(r.status)})`,
                          )
                          .join(", ")
                      : notAdded}
                  </dd>
                </div>
                {facts.map((f) => (
                  <div key={f.label} className="acct-fact">
                    <dt>{f.label}</dt>
                    <dd>
                      {f.value || (
                        <span className="text-pro-muted">{notAdded}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {account.provider?.status === "pending" && (
                <div className="acct-callout">
                  <Stethoscope size={18} aria-hidden="true" />
                  <span>
                    {t({
                      en: "Your provider application is saved for the project operator to review. Reload this page after approval. No patient information is available while approval is pending.",
                      bn: "প্রকল্প পরিচালকের পর্যালোচনার জন্য আবেদন সংরক্ষিত। অনুমোদনের পর পৃষ্ঠা আবার খুলুন। অপেক্ষমাণ অবস্থায় রোগীর তথ্য দেখা যায় না।",
                    })}
                  </span>
                </div>
              )}
            </section>
            {!account.onboarded && (
              <form
                className={`${card} grid gap-5 p-5 sm:p-6`}
                onSubmit={(e) => {
                  e.preventDefault();
                  void act({ action: "onboard", profile });
                }}
              >
                <h2 className="text-lg font-semibold text-pro-text">
                  {t({
                    en: "Complete your account",
                    bn: "অ্যাকাউন্ট সম্পূর্ণ করুন",
                  })}
                </h2>
                <RoleProfileFields
                  value={profile}
                  onChange={setProfile}
                  disabled={busy}
                />
                <button
                  className="acct-btn acct-btn-primary acct-btn-block"
                  disabled={busy}
                >
                  {t({ en: "Save my roles", bn: "আমার পরিচয় সংরক্ষণ করুন" })}
                </button>
              </form>
            )}
            {canMother && (
              <form
                className={`${card} grid gap-5 p-5 sm:p-6`}
                onSubmit={handleInviteSubmit}
                aria-labelledby="acct-invite"
              >
                <div className="grid gap-1.5">
                  <h2
                    id="acct-invite"
                    className="flex items-center gap-2 text-lg font-semibold text-pro-text"
                  >
                    <UserPlus
                      size={19}
                      aria-hidden="true"
                      className="text-pro-primary"
                    />
                    {t({
                      en: "Invite a supporter",
                      bn: "সহায়তাকারীকে আমন্ত্রণ জানান",
                    })}
                  </h2>
                  <p className="acct-lead">
                    {t({
                      en: "Four short steps. Ask your supporter for their account ID, choose permissions and an expiry, then give the one-time invitation code to that person privately.",
                      bn: "সহায়তাকারীর অ্যাকাউন্ট আইডি নিন। অনুমতি ও মেয়াদ বেছে নিয়ে শুধু তাঁকে ব্যক্তিগতভাবে একবার ব্যবহারযোগ্য আমন্ত্রণ কোড দিন।",
                    })}
                  </p>
                </div>
                <div className="acct-step">
                  <label htmlFor="supporter-id" className="acct-step-title">
                    <span className="acct-num" aria-hidden="true">
                      1
                    </span>
                    {t({
                      en: "Supporter's account ID",
                      bn: "সহায়তাকারীর অ্যাকাউন্ট আইডি",
                    })}
                  </label>
                  <input
                    id="supporter-id"
                    className="acct-input"
                    required
                    value={supporterId}
                    maxLength={36}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    autoComplete="off"
                    onChange={(e) => setSupporterId(e.target.value.trim())}
                  />
                </div>
                <fieldset className="acct-step">
                  <legend className="acct-step-title">
                    <span className="acct-num" aria-hidden="true">
                      2
                    </span>
                    {t({
                      en: "Allow support with",
                      bn: "যে কাজে সহায়তা করতে পারবেন",
                    })}
                  </legend>
                  <div className="acct-tiles">
                    <label className="acct-tile">
                      <input
                        type="checkbox"
                        checked={visit}
                        onChange={(e) => setVisit(e.target.checked)}
                      />
                      <span className="acct-tile-box" aria-hidden="true">
                        <Check size={16} />
                      </span>
                      {t({
                        en: "Visit preparation",
                        bn: "সাক্ষাতের প্রস্তুতি",
                      })}
                    </label>
                    <label className="acct-tile">
                      <input
                        type="checkbox"
                        checked={care}
                        onChange={(e) => setCare(e.target.checked)}
                      />
                      <span className="acct-tile-box" aria-hidden="true">
                        <Check size={16} />
                      </span>
                      {t({ en: "Care coordination", bn: "যত্নের সমন্বয়" })}
                    </label>
                  </div>
                  <div className="acct-callout">
                    <Lock size={18} aria-hidden="true" />
                    <span>
                      {t({
                        en: "These permissions establish your support relationship. Health records, reports, diary and AI conversations are not shared. Appointment and care-request delegation are not connected yet.",
                        bn: "এই অনুমতিগুলো সহায়তার সম্পর্ক স্থাপন করে। স্বাস্থ্যতথ্য, রিপোর্ট, ডায়েরি বা এআই কথোপকথন শেয়ার হয় না। অ্যাপয়েন্টমেন্ট ও যত্নের অনুরোধের প্রতিনিধিত্ব এখনও যুক্ত হয়নি।",
                      })}
                    </span>
                  </div>
                </fieldset>
                <fieldset className="acct-step">
                  <legend className="acct-step-title">
                    <span className="acct-num" aria-hidden="true">
                      3
                    </span>
                    {t({ en: "Expires after", bn: "মেয়াদ শেষ হবে" })}
                  </legend>
                  <div className="acct-seg">
                    {[1, 7, 14, 30].map((n) => (
                      <label key={n}>
                        <input
                          type="radio"
                          name="expiry-days"
                          checked={days === n}
                          onChange={() => setDays(n)}
                        />
                        {n} {t({ en: n === 1 ? "day" : "days", bn: "দিন" })}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="acct-step">
                  <span className="acct-step-title">
                    <span className="acct-num" aria-hidden="true">
                      4
                    </span>
                    {t({
                      en: "Review and confirm",
                      bn: "যাচাই ও নিশ্চিত করুন",
                    })}
                  </span>
                  <label className="acct-tile">
                    <input
                      type="checkbox"
                      required
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                    />
                    <span className="acct-tile-box" aria-hidden="true">
                      <Check size={16} />
                    </span>
                    <span>
                      {t({
                        en: "I reviewed the recipient, permissions and expiry. I can revoke access at any time.",
                        bn: "প্রাপক, অনুমতি ও মেয়াদ যাচাই করেছি। যেকোনো সময় অনুমতি প্রত্যাহার করতে পারব।",
                      })}
                    </span>
                  </label>
                </div>
                <button
                  className="acct-btn acct-btn-primary acct-btn-block"
                  disabled={busy || (!visit && !care)}
                >
                  <Send size={16} aria-hidden="true" />
                  {t({ en: "Create invitation", bn: "আমন্ত্রণ তৈরি করুন" })}
                </button>
                {!visit && !care && (
                  <p className="acct-hint">
                    {t({
                      en: "Choose at least one kind of support to continue.",
                      bn: "এগোতে অন্তত একটি সহায়তার ধরন বেছে নিন।",
                    })}
                  </p>
                )}
                {invitation && (
                  <div className="acct-step">
                    <label
                      htmlFor="invitation-code"
                      className="acct-step-title"
                    >
                      <KeyRound size={18} aria-hidden="true" />
                      {t({
                        en: "Invitation code — shown only here",
                        bn: "আমন্ত্রণ কোড — শুধু এখানে দেখানো হচ্ছে",
                      })}
                    </label>
                    <textarea
                      id="invitation-code"
                      className="acct-input acct-code"
                      readOnly
                      value={invitation}
                      rows={3}
                    />
                    <button
                      type="button"
                      className="acct-btn acct-btn-sm w-fit"
                      onClick={() => void copy(invitation, "code")}
                    >
                      {copied === "code" ? (
                        <Check size={15} aria-hidden="true" />
                      ) : (
                        <Copy size={15} aria-hidden="true" />
                      )}
                      {copied === "code"
                        ? t({ en: "Copied", bn: "কপি হয়েছে" })
                        : t({ en: "Copy code", bn: "কোড কপি করুন" })}
                    </button>
                    <p className="acct-hint">
                      {t({
                        en: "Share this privately with the intended supporter. If lost, revoke the pending invitation and create another.",
                        bn: "নির্দিষ্ট সহায়তাকারীকে ব্যক্তিগতভাবে দিন। হারিয়ে গেলে অপেক্ষমাণ আমন্ত্রণ প্রত্যাহার করে নতুনটি তৈরি করুন।",
                      })}
                    </p>
                  </div>
                )}
              </form>
            )}
            {canSupport && (
              <form
                className={`${card} grid gap-5 p-5 sm:p-6`}
                onSubmit={(e) => {
                  e.preventDefault();
                  void act({ action: "accept", code: code.trim() });
                }}
              >
                <h2 id="acct-accept" className="flex items-center gap-2 text-lg font-semibold text-pro-text">
                  <KeyRound
                    size={19}
                    aria-hidden="true"
                    className="text-pro-primary"
                  />
                  {t({
                    en: "Accept a mother's invitation",
                    bn: "মায়ের আমন্ত্রণ গ্রহণ করুন",
                  })}
                </h2>
                <p className="acct-lead">
                  {t({
                    en: "Give your account ID above to the mother. She chooses permissions and sends you an invitation code. Accepting never grants automatic access to her private records.",
                    bn: "উপরের অ্যাকাউন্ট আইডি মাকে দিন। তিনি অনুমতি বেছে আমন্ত্রণ কোড পাঠাবেন। গ্রহণ করলে স্বয়ংক্রিয়ভাবে তাঁর ব্যক্তিগত তথ্য দেখা যাবে না।",
                  })}
                </p>
                <div className="acct-step">
                  <label htmlFor="accept-code" className="acct-step-title">
                    {t({ en: "Invitation code", bn: "আমন্ত্রণ কোড" })}
                  </label>
                  <textarea
                    id="accept-code"
                    className="acct-input acct-code"
                    required
                    maxLength={64}
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    rows={3}
                  />
                </div>
                <button
                  className="acct-btn acct-btn-primary acct-btn-block"
                  disabled={busy}
                >
                  <Check size={16} aria-hidden="true" />
                  {t({ en: "Accept invitation", bn: "আমন্ত্রণ গ্রহণ করুন" })}
                </button>
              </form>
            )}
            {(canMother || canSupport) && (
              <section
                className={`${card} px-5 pb-3 pt-4 sm:px-6`}
                aria-labelledby="acct-rel"
              >
                <h2
                  id="acct-rel"
                  className="text-lg font-semibold text-pro-text"
                >
                  {t({ en: "Support relationships", bn: "সহায়তার সম্পর্ক" })}
                </h2>
                {!connections.length && (
                  <p className="py-4 text-pro-muted">
                    {t({
                      en: "No invitations or support relationships yet.",
                      bn: "এখনও কোনো আমন্ত্রণ বা সহায়তার সম্পর্ক নেই।",
                    })}
                    {canMother &&
                      " " +
                        t({
                          en: "Invitations you create will appear here.",
                          bn: "আপনার তৈরি আমন্ত্রণ এখানে দেখা যাবে।",
                        })}
                  </p>
                )}
                <ul className="mt-1 divide-y divide-pro-border">
                  {connections.map((c) => {
                    const name =
                      c.motherId === account.userId
                        ? c.supporterName || c.supporterId
                        : c.motherName || c.motherId;
                    return (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center gap-3 py-3.5"
                      >
                        <span className="acct-row-icon" aria-hidden="true">
                          {name.trim().charAt(0).toUpperCase() || "•"}
                        </span>
                        <div className="grid min-w-0 flex-1 basis-56 gap-1.5 justify-items-start">
                          <strong className="[overflow-wrap:anywhere]">
                            {name}
                          </strong>
                          {statusPill(c.status)}
                          <span className="flex flex-wrap gap-1.5">
                            {c.scopes.map((s) => (
                              <span key={s} className="acct-chip">
                                {scopeLabel(s)}
                              </span>
                            ))}
                          </span>
                          <span className="acct-hint">
                            {t({ en: "Expiry", bn: "মেয়াদ" })}:{" "}
                            {new Date(c.expiresAt).toLocaleString()}
                          </span>
                        </div>
                        {(c.status === "active" || c.status === "pending") && (
                          <button
                            type="button"
                            className="acct-btn acct-btn-danger"
                            disabled={busy}
                            onClick={() => {
                              if (
                                window.confirm(
                                  t({
                                    en: "Revoke this invitation or relationship? Further access will be blocked.",
                                    bn: "এই আমন্ত্রণ বা সম্পর্ক প্রত্যাহার করবেন? পরবর্তী প্রবেশ বন্ধ হবে।",
                                  }),
                                )
                              )
                                void act({
                                  action: "revoke",
                                  connectionId: c.id,
                                });
                            }}
                          >
                            <Ban size={16} aria-hidden="true" />
                            {t({
                              en: "Revoke access",
                              bn: "অনুমতি প্রত্যাহার করুন",
                            })}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
      {account && (
        <aside className="grid min-w-0 gap-6 lg:sticky lg:top-24 lg:self-start">
          <section
            className={`${card} grid gap-3 p-5`}
            aria-labelledby="acct-roles"
          >
            <h2 id="acct-roles" className="acct-h2">
              {t({ en: "Roles & workspaces", bn: "পরিচয় ও কর্মক্ষেত্র" })}
            </h2>
            <ul className="grid gap-3">
              {account.roles.map((membership) => {
                const Icon = roleIcon(membership.role);
                const current = membership.role === account.activeRole;
                return (
                  <li key={membership.role} className="acct-role" data-current={current || undefined}>
                    <div className="flex items-center gap-3">
                      <span className="acct-row-icon">
                        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <strong className="[overflow-wrap:anywhere]">
                          {roleLabel(membership.role)}
                          {current && (
                            <span className="font-normal text-pro-muted">
                              {" "}
                              · {t({ en: "current", bn: "বর্তমান" })}
                            </span>
                          )}
                        </strong>
                        {statusPill(membership.status)}
                      </div>
                    </div>
                    {membership.status === "approved" ? (
                      <button
                        type="button"
                        className={`acct-btn w-full ${current ? "acct-btn-primary" : ""}`}
                        disabled={busy}
                        onClick={() =>
                          void act({
                            action: "switch",
                            role: membership.role as WorkspaceRole,
                          })
                        }
                      >
                        {current
                          ? t({
                              en: "Go to my workspace",
                              bn: "আমার কর্মক্ষেত্রে যান",
                            })
                          : t({
                              en: "Open workspace",
                              bn: "কর্মক্ষেত্র খুলুন",
                            })}
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ) : (
                      <p className="acct-hint">
                        {t({
                          en: "Not available until this role is approved.",
                          bn: "অনুমোদন না হওয়া পর্যন্ত এটি খোলা যাবে না।",
                        })}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <section
            className={`${card} grid gap-3 p-5`}
            aria-labelledby="acct-privacy"
          >
            <h2
              id="acct-privacy"
              className="flex items-center gap-2 text-lg font-semibold text-pro-text"
            >
              <ShieldCheck
                size={19}
                aria-hidden="true"
                className="text-pro-primary"
              />
              {t({ en: "Your privacy", bn: "আপনার গোপনীয়তা" })}
            </h2>
            <ul className="acct-checks">
              {[
                t({
                  en: "Health records, reports, diary and AI conversations are not shared through supporter invitations.",
                  bn: "সহায়তাকারীর আমন্ত্রণের মাধ্যমে স্বাস্থ্যতথ্য, রিপোর্ট, ডায়েরি বা এআই কথোপকথন শেয়ার হয় না।",
                }),
                t({ en: "You choose who can help, and for how long.", bn: "কে সহায়তা করবে এবং কতদিন, আপনিই ঠিক করেন।" }),
                t({ en: "You can revoke access at any time.", bn: "যেকোনো সময় অনুমতি প্রত্যাহার করতে পারেন।" }),
              ].map((line) => (
                <li key={line}>
                  <Check size={16} aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {canMother && (
              <Link href="/app/bondhon" className="acct-text-link">
                {t({ en: "Manage sharing in Bondhon", bn: "বন্ধনে শেয়ার পরিচালনা করুন" })}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </section>
          <section
            className={`${card} grid gap-3 p-5`}
            aria-labelledby="acct-device"
          >
            <h2 id="acct-device" className="acct-h2">
              {t({ en: "Signed in on this device", bn: "এই ডিভাইসে সাইন ইন করা" })}
            </h2>
            <button
              type="button"
              className="acct-btn acct-btn-block"
              disabled={busy || loading}
              onClick={() => void refresh()}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {t({ en: "Reload account status", bn: "অ্যাকাউন্টের অবস্থা আবার দেখুন" })}
            </button>
            <SignOutButton className="acct-btn acct-btn-danger acct-btn-block" />
          </section>
        </aside>
      )}
    </div>
    </div>
  );
}
