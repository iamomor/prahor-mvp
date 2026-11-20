"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Eye, Lock, ShieldCheck, UserCheck, XCircle } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useLanguage } from "@/i18n/use-language";
import { consentGrantSchema, revokeConsentResponseSchema } from "@/lib/contracts/bondhon";
import { apiSuccessSchema } from "@/lib/contracts/transport";
import { loadWellnessEntries, type WellnessHistoryEntry } from "./api";

type CareRecipient = {
  userId: string;
  role: "provider" | "supporter";
  displayName: string;
  relationshipStatus: "active" | "pending" | "revoked";
};

type ShareableField = "mood" | "energy" | "activityNote" | "restNote" | "occurredAt";

const shareableFieldLabels: Record<ShareableField, { en: string; bn: string }> = {
  mood: { en: "Mood check-in", bn: "মনের অবস্থা" },
  energy: { en: "Energy level", bn: "শক্তির মাত্রা" },
  activityNote: { en: "Activity note", bn: "কাজকর্মের নোট" },
  restNote: { en: "Rest & sleep note", bn: "বিশ্রামের নোট" },
  occurredAt: { en: "Timestamp of record", bn: "রেকর্ডের সময়কাল" },
};

const copy = {
  eyebrow: { en: "PHASE 05 · PROVIDER SHARING", bn: "ধাপ ০৫ · সেবাদাতাকে তথ্য শেয়ার" },
  title: { en: "Consent-controlled wellness sharing", bn: "সম্মতি-নিয়ন্ত্রিত সুস্থতার তথ্য শেয়ার" },
  lead: {
    en: "You decide if and when to share individual wellness entries with verified healthcare providers. You control the exact fields, inspect a live preview, and can revoke access anytime.",
    bn: "যাচাইকৃত স্বাস্থ্যসেবাদাতার সাথে আপনার সুস্থতার এন্ট্রি শেয়ার করবেন কি না তা সম্পূর্ণ আপনার সিদ্ধান্ত। কোন তথ্য শেয়ার হবে তা বেছে নিতে পারবেন, লাইভ প্রিভিউ দেখতে পারবেন এবং যেকোনো সময় সম্মতি প্রত্যাহার করতে পারবেন।",
  },
  diaryExcluded: {
    en: "Your private diary is strictly excluded and cannot be shared with any provider or AI under any circumstance.",
    bn: "আপনার ব্যক্তিগত ডায়েরি কঠোরভাবে সুরক্ষিত এবং কোনো অবস্থাতেই কোনো সেবাদাতা বা এআই-এর কাছে শেয়ার করা যাবে না।",
  },
  selectRecord: { en: "1. Select a wellness check-in record", bn: "১. একটি সুস্থতার রেকর্ড বেছে নিন" },
  selectFields: { en: "2. Choose specific fields to disclose", bn: "২. প্রকাশের জন্য সুনির্দিষ্ট তথ্য নির্বাচন করুন" },
  selectRecipient: { en: "3. Choose a verified provider", bn: "৩. যাচাইকৃত সেবাদাতা নির্বাচন করুন" },
  previewTitle: { en: "Exact provider preview", bn: "সেবাদাতা যেভাবে দেখবেন (হুবহু প্রিভিউ)" },
  consentCheckbox: {
    en: "I explicitly authorize my verified provider to view only the exact fields selected above for clinical care coordination.",
    bn: "চিকিৎসাগত সমন্বয়ের জন্য উপরে নির্বাচিত সুনির্দিষ্ট তথ্যগুলো আমার যাচাইকৃত সেবাদাতাকে দেখতে আমি স্পষ্ট সম্মতি দিচ্ছি।",
  },
  shareBtn: { en: "Confirm & Share with Provider", bn: "নিশ্চিত করুন ও সেবাদাতাকে শেয়ার করুন" },
  sharing: { en: "Processing consent…", bn: "সম্মতি প্রক্রিয়াধীন…" },
  sharedSuccess: { en: "Consent grant created successfully.", bn: "সম্মতি সফলভাবে তৈরি হয়েছে।" },
  revokeBtn: { en: "Revoke Access Immediately", bn: "তাৎক্ষণিক সম্মতি প্রত্যাহার করুন" },
  revoking: { en: "Revoking…", bn: "প্রত্যাহার হচ্ছে…" },
  revokedSuccess: { en: "Consent successfully revoked. Provider access terminated.", bn: "সম্মতি সফলভাবে প্রত্যাহার করা হয়েছে। সেবাদাতার প্রবেশাধিকার বাতিল।" },
  noVerifiedProvider: {
    en: "No verified provider is currently connected. Provider sharing is kept safely disabled until an approved provider relationship is established in Bondhon.",
    bn: "বর্তমানে কোনো যাচাইকৃত সেবাদাতা সংযুক্ত নেই। বন্ধনে অনুমোদিত সেবাদাতার সম্পর্ক যুক্ত না হওয়া পর্যন্ত শেয়ারিং নিরাপদে নিষ্ক্রিয় রাখা হয়েছে।",
  },
  noWellnessRecords: {
    en: "No wellness check-ins recorded yet. Record a gentle check-in above first.",
    bn: "এখনো কোনো সুস্থতার তথ্য নথিভুক্ত নেই। উপরে একটি খোঁজখবর যোগ করুন।",
  },
  goToBondhon: { en: "Manage providers in Bondhon", bn: "বন্ধনে সেবাদাতা পরিচালনা করুন" },
} as const;

export function ProviderWellnessSharing() {
  const { language, t } = useLanguage();
  const id = useId();

  const [records, setRecords] = useState<WellnessHistoryEntry[]>([]);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<ShareableField[]>(["mood", "energy", "occurredAt"]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [activeGrantId, setActiveGrantId] = useState<string | null>(null);
  const shareRetryKey = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [wellness, careResponse] = await Promise.all([
        loadWellnessEntries().catch(() => []),
        fetch("/api/care-recipients", { credentials: "same-origin", cache: "no-store" })
          .then(res => res.ok ? res.json() : { data: [] })
          .catch(() => ({ data: [] })),
      ]);

      setRecords(wellness);
      if (wellness.length > 0 && !selectedRecordId) {
        setSelectedRecordId(wellness[0].id);
      }

      const verifiedProviders = (careResponse.data || careResponse || []).filter(
        (r: CareRecipient) => r.role === "provider" && r.relationshipStatus === "active",
      );
      setRecipients(verifiedProviders);
      if (verifiedProviders.length > 0) {
        setSelectedRecipientId(verifiedProviders[0].userId);
      }
    } catch {
      setErrorMessage(t({ en: "Could not load sharing information.", bn: "শেয়ারিং তথ্য আনা যায়নি।" }));
    } finally {
      setLoading(false);
    }
  }, [selectedRecordId, t]);

  useEffect(() => {
    void Promise.resolve().then(() => loadData());
  }, [loadData]);

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  // Toggle field selection
  const toggleField = (field: ShareableField) => {
    if (field === "occurredAt") return; // timestamp always included for provenance
    setSelectedFields(current =>
      current.includes(field)
        ? current.filter(f => f !== field)
        : [...current, field],
    );
  };

  // Generate exact projection preview
  const projectionPreview = selectedRecord ? {
    recordType: "wellness_entry",
    recordId: selectedRecord.id,
    disclosedFields: {
      ...(selectedFields.includes("occurredAt") ? { occurredAt: selectedRecord.occurred_at } : {}),
      ...(selectedFields.includes("mood") && selectedRecord.mood ? { mood: selectedRecord.mood } : {}),
      ...(selectedFields.includes("energy") && selectedRecord.energy ? { energy: selectedRecord.energy } : {}),
      ...(selectedFields.includes("activityNote") && selectedRecord.activity_note ? { activityNote: selectedRecord.activity_note } : {}),
      ...(selectedFields.includes("restNote") && selectedRecord.rest_note ? { restNote: selectedRecord.rest_note } : {}),
    },
    privacyGuarantee: "Private diary text is excluded from all sharing contracts.",
  } : null;

  // Handle consent grant submission
  const handleShare = async () => {
    if (!selectedRecord || !selectedRecipientId || !explicitConsent || submitting) return;

    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const now = new Date();
      const expires = new Date(now.getTime() + 14 * 86_400_000); // 14 days default grant

      const payload = {
        granteeUserId: selectedRecipientId,
        record: {
          type: "wellness_entry",
          id: selectedRecord.id,
          fields: selectedFields,
        },
        purpose: "Maternal wellness review and care coordination",
        startsAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        reviewConfirmed: true,
      };

      const response = await fetch("/api/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Idempotency-Key": shareRetryKey.current ?? (shareRetryKey.current = crypto.randomUUID()) },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Consent creation failed");
      }

      const result = apiSuccessSchema(consentGrantSchema).safeParse(await response.json());
      if (!result.success) throw new Error("The server response did not confirm the consent grant.");
      setActiveGrantId(result.data.data.id);
      shareRetryKey.current = null;
      setStatusMessage(t(copy.sharedSuccess));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t({ en: "Sharing failed. Verify connection.", bn: "শেয়ার করা সম্ভব হয়নি।" }));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle immediate revocation
  const handleRevoke = async () => {
    if (!activeGrantId || revoking) return;

    setRevoking(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/consents/${encodeURIComponent(activeGrantId)}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error("Revocation failed");
      const result = apiSuccessSchema(revokeConsentResponseSchema).safeParse(await response.json());
      if (!result.success || result.data.data.id !== activeGrantId) throw new Error("The server response did not confirm revocation.");

      setActiveGrantId(null);
      setExplicitConsent(false);
      setStatusMessage(t(copy.revokedSuccess));
    } catch {
      setErrorMessage(t({ en: "Failed to revoke consent. Please retry or contact provider.", bn: "সম্মতি প্রত্যাহার করা যায়নি।" }));
    } finally {
      setRevoking(false);
    }
  };

  const hasVerifiedProvider = recipients.length > 0;

  return (
    <section id="provider-sharing" aria-labelledby={`${id}-title`} lang={language} className="grid gap-6 border-t border-pro-border pt-7 sm:pt-9">
      <header className="grid gap-2">
        <p className="pro-eyebrow tracking-normal">{t(copy.eyebrow)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="pro-display text-2xl sm:text-3xl flex items-center gap-2">
            <ShieldCheck size={26} className="text-pro-primary" aria-hidden="true" />
            {t(copy.title)}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-pro-border bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-muted">
            <Lock size={14} className="text-pro-primary" aria-hidden="true" />
            {t({ en: "Diary never shared", bn: "ডায়েরি কখনো শেয়ার হয় না" })}
          </span>
        </div>
        <p className="pro-muted max-w-prose leading-relaxed">{t(copy.lead)}</p>
        <p className="text-xs font-medium text-pro-primary">{t(copy.diaryExcluded)}</p>
      </header>

      {/* Main sharing interface */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-5 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-7">
          {/* Step 1: Record Selection */}
          <div className="grid gap-2">
            <label htmlFor={`${id}-record-select`} className="font-semibold text-sm">
              {t(copy.selectRecord)}
            </label>
            {records.length > 0 ? (
              <select
                id={`${id}-record-select`}
                value={selectedRecordId}
                onChange={e => setSelectedRecordId(e.target.value)}
                className="min-h-12 rounded-field border border-pro-control-border bg-pro-elevated px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
              >
                {records.map(rec => (
                  <option key={rec.id} value={rec.id}>
                    {new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
                      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
                    }).format(new Date(rec.occurred_at))}
                    {rec.mood ? ` · ${rec.mood}` : ""}
                    {rec.energy ? ` · ${rec.energy}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-pro-muted italic">{t(copy.noWellnessRecords)}</p>
            )}
          </div>

          {/* Step 2: Field Selection */}
          <fieldset className="grid gap-2 border-t border-pro-border/70 pt-4">
            <legend className="font-semibold text-sm mb-1">{t(copy.selectFields)}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["mood", "energy", "activityNote", "restNote"] as ShareableField[]).map(field => (
                <label
                  key={field}
                  className="flex items-center gap-2.5 rounded-control border border-pro-control-border bg-pro-elevated p-2.5 text-xs font-medium cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="size-4 rounded accent-pro-primary"
                  />
                  <span>{t(shareableFieldLabels[field])}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Step 3: Recipient Selection */}
          <div className="grid gap-2 border-t border-pro-border/70 pt-4">
            <label htmlFor={`${id}-recipient-select`} className="font-semibold text-sm">
              {t(copy.selectRecipient)}
            </label>
            {hasVerifiedProvider ? (
              <select
                id={`${id}-recipient-select`}
                value={selectedRecipientId}
                onChange={e => setSelectedRecipientId(e.target.value)}
                className="min-h-12 rounded-field border border-pro-control-border bg-pro-elevated px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
              >
                {recipients.map(provider => (
                  <option key={provider.userId} value={provider.userId}>
                    {provider.displayName} ({provider.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-control border border-pro-warning bg-pro-warning-soft p-3 text-xs text-pro-text leading-relaxed">
                <p className="flex items-center gap-1.5 font-semibold text-pro-warning mb-1">
                  <UserCheck size={16} aria-hidden="true" />
                  {t({ en: "Provider verification required", bn: "সেবাদাতা যাচাই প্রয়োজন" })}
                </p>
                {t(copy.noVerifiedProvider)}
                <div className="mt-2">
                  <Link
                    href="/app/bondhon"
                    className="inline-flex items-center gap-1 font-semibold text-pro-primary underline"
                  >
                    {t(copy.goToBondhon)}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="border-t border-pro-border/70 pt-4">
            <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-pro-text">
              <input
                type="checkbox"
                checked={explicitConsent}
                disabled={!hasVerifiedProvider || records.length === 0 || !!activeGrantId}
                onChange={e => setExplicitConsent(e.target.checked)}
                className="mt-0.5 size-4 rounded accent-pro-primary shrink-0"
              />
              <span>{t(copy.consentCheckbox)}</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!activeGrantId ? (
              <AppButton
                type="button"
                disabled={!hasVerifiedProvider || !explicitConsent || records.length === 0 || submitting || loading}
                onClick={() => void handleShare()}
                className="min-h-11"
              >
                {submitting ? t(copy.sharing) : t(copy.shareBtn)}
              </AppButton>
            ) : (
              <AppButton
                type="button"
                variant="secondary"
                disabled={revoking}
                onClick={() => void handleRevoke()}
                className="min-h-11 border-pro-danger text-pro-danger hover:bg-pro-danger-soft"
              >
                <XCircle size={16} className="me-1.5" aria-hidden="true" />
                {revoking ? t(copy.revoking) : t(copy.revokeBtn)}
              </AppButton>
            )}
          </div>

          {statusMessage && <p role="status" className="text-xs font-semibold text-pro-success flex items-center gap-1"><Check size={14} />{statusMessage}</p>}
          {errorMessage && <p role="alert" className="text-xs font-semibold text-pro-danger">{errorMessage}</p>}
        </div>

        {/* Live Preview Panel */}
        <div className="grid content-start gap-4 rounded-hero border border-pro-border bg-pro-elevated p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-pro-border/70 pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-pro-primary">
              <Eye size={18} aria-hidden="true" />
              {t(copy.previewTitle)}
            </h3>
            <span className="text-xs text-pro-muted">
              {activeGrantId ? t({ en: "Active grant", bn: "সক্রিয় অনুমতি" }) : t({ en: "Draft preview", bn: "খসড়া প্রিভিউ" })}
            </span>
          </div>

          <p className="text-xs text-pro-muted leading-relaxed">
            {t({
              en: "This is the sanitized data projection generated for your provider. Only the fields you checked are transmitted. Diary entries and AI analysis are strictly absent.",
              bn: "এটি আপনার সেবাদাতার জন্য প্রস্তুতকৃত তথ্য প্রজেকশন। আপনি যেসব তথ্য টিক দিয়েছেন কেবল সেগুলোই প্রেরিত হবে। ডায়েরির লেখা ও এআই বিশ্লেষণ এখানে সম্পূর্ণরূপে অনুপস্থিত।",
            })}
          </p>

          <pre className="overflow-x-auto rounded-field bg-pro-bg p-4 text-xs font-mono text-pro-text border border-pro-border leading-relaxed">
            {projectionPreview ? JSON.stringify(projectionPreview, null, 2) : "// No record selected"}
          </pre>

          <div className="rounded-control bg-pro-surface p-3 text-xs text-pro-muted border border-pro-border">
            <p className="font-medium text-pro-text">{t({ en: "Server-side Audit Enforcement", bn: "সার্ভার-সাইড অডিট ব্যবস্থা" })}</p>
            <p className="mt-1">
              {t({
                en: "Every sharing event and revocation writes an immutable audit record to the security log. Access expires automatically after 14 days unless renewed.",
                bn: "প্রতিটি শেয়ারিং এবং প্রত্যাহারের ঘটনা অপরিবর্তনীয় অডিট লগে সংরক্ষিত হয়। পুনরায় বৃদ্ধি না করলে ১৪ দিন পর অনুমতি নিজে থেকেই মেয়াদোত্তীর্ণ হবে।",
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
