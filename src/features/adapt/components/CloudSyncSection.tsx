"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  WifiOff,
  ShieldCheck,
  Trash2,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePreferenceSync } from "../hooks/usePreferenceSync";
import { PreferenceConflictDialog } from "./PreferenceConflictDialog";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

const emptySubscribe = () => () => {};

export function CloudSyncSection() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const {
    user,
    isAuthenticated,
    isAuthLoading,
    consent,
    status,
    lastSynced,
    conflict,
    errorMessage,
    toggleConsent,
    resolveConflict,
    syncNow,
    revokeCloudSync,
  } = usePreferenceSync();

  const { language } = useLanguage();
  const tSync = translations.adapt.cloudSync;

  const [announcement, setAnnouncement] = useState("");
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleToggleConsent = async (checked: boolean) => {
    setAnnouncement(
      checked
        ? language === "bn"
          ? "অ্যাকাউন্ট সিঙ্ক চালু করা হচ্ছে…"
          : "Enabling account preference sync…"
        : language === "bn"
          ? "অ্যাকাউন্ট সিঙ্ক বন্ধ করা হয়েছে।"
          : "Account preference sync turned off.",
    );
    await toggleConsent(checked);
  };

  const handleSyncNow = async () => {
    setAnnouncement(
      language === "bn" ? "পছন্দ সিঙ্ক করা হচ্ছে…" : "Syncing preferences…",
    );
    await syncNow();
    setAnnouncement(
      language === "bn"
        ? "পছন্দ সিঙ্ক সফল হয়েছে।"
        : "Preferences synced successfully.",
    );
  };

  const handleRevokeConfirm = async () => {
    setIsRevoking(true);
    setAnnouncement(
      language === "bn"
        ? "ক্লাউড থেকে পছন্দ মুছে ফেলা হচ্ছে…"
        : "Deleting cloud preferences…",
    );
    await revokeCloudSync();
    setIsRevoking(false);
    setShowRevokeConfirm(false);
    setAnnouncement(
      language === "bn"
        ? "ক্লাউড পছন্দ সম্পূর্ণ মুছে ফেলা হয়েছে।"
        : "Cloud preferences deleted successfully.",
    );
  };

  return (
    <section
      aria-labelledby="cloud-sync-heading"
      className="pro-card space-y-5 rounded-2xl border border-pro-border bg-pro-surface p-6 shadow-sm"
    >
      <InlineLiveRegion message={announcement} />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pro-primary/10 text-pro-primary">
            <Cloud size={20} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="cloud-sync-heading"
              className="text-base font-bold text-pro-heading sm:text-lg"
            >
              {tSync.title[language]}
            </h2>
            <p className="text-xs text-pro-muted sm:text-sm">
              {tSync.subtitle[language]}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {status === "syncing" && (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
              <span>{tSync.statusSyncing[language]}</span>
            </span>
          )}

          {status === "idle" && consent && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>{tSync.statusSynced[language]}</span>
            </span>
          )}

          {status === "conflict" && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>{tSync.statusConflict[language]}</span>
            </span>
          )}

          {status === "offline" && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <WifiOff size={14} aria-hidden="true" />
              <span>{tSync.statusOffline[language]}</span>
            </span>
          )}

          {status === "error" && (
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertTriangle size={14} aria-hidden="true" />
              <span>{tSync.statusError[language]}</span>
            </span>
          )}

          {(!consent || status === "disabled") && (
            <span className="flex items-center gap-1.5 rounded-full bg-pro-muted/10 px-3 py-1 text-xs font-medium text-pro-muted">
              <span>{tSync.statusDisabled[language]}</span>
            </span>
          )}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <p>{tSync.privacyGuarantee[language]}</p>
      </div>

      {/* Unauthenticated State */}
      {isClient && !isAuthLoading && !isAuthenticated && (
        <div className="rounded-xl border border-pro-border bg-pro-elevated p-4 text-center space-y-3">
          <p className="text-sm text-pro-muted">
            {tSync.signInPrompt[language]}
          </p>
          <Link
            href="/sign-in"
            className="pro-btn pro-btn-primary inline-flex items-center gap-2 !min-h-11 !px-4 text-sm font-medium"
          >
            <LogIn size={16} aria-hidden="true" />
            <span>{translations.nav.signIn[language]}</span>
          </Link>
        </div>
      )}

      {/* Authenticated State */}
      {isClient && !isAuthLoading && isAuthenticated && (
        <div className="space-y-4 pt-2">
          {/* Explicit Consent Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-pro-border bg-pro-elevated p-4">
            <div className="space-y-0.5 pr-4">
              <label
                htmlFor="preference-sync-toggle"
                className="text-sm font-semibold text-pro-heading cursor-pointer"
              >
                {tSync.consentToggle[language]}
              </label>
              <p className="text-xs text-pro-muted">
                {language === "bn"
                  ? `সংযুক্ত অ্যাকাউন্ট: ${user?.email ?? "সক্রিয় ব্যবহারকারী"}`
                  : `Signed in as: ${user?.email ?? "Active user"}`}
              </p>
            </div>
            <input
              id="preference-sync-toggle"
              type="checkbox"
              checked={consent}
              onChange={(e) => handleToggleConsent(e.target.checked)}
              className="h-6 w-6 cursor-pointer rounded border-pro-border text-pro-primary focus:ring-2 focus:ring-pro-primary"
            />
          </div>

          {/* Sync Metadata & Actions (when consent is active) */}
          {consent && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-pro-muted">
                {lastSynced ? (
                  <span>
                    {tSync.lastSyncedAt[language]}:{" "}
                    <time dateTime={lastSynced}>
                      {new Date(lastSynced).toLocaleTimeString(
                        language === "bn" ? "bn-BD" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </time>
                  </span>
                ) : (
                  <span>{language === "bn" ? "এখনো সিঙ্ক হয়নি" : "Not synced yet"}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={status === "syncing" || !navigator.onLine}
                  className="pro-btn pro-btn-secondary !min-h-11 !px-3 text-xs font-medium"
                >
                  <RefreshCw
                    size={14}
                    className={status === "syncing" ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                  <span>{tSync.syncNow[language]}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRevokeConfirm(true)}
                  className="pro-btn pro-btn-ghost !min-h-11 !px-3 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                  aria-label={tSync.revokeSync[language]}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">{tSync.revokeSync[language]}</span>
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Preference Conflict Resolution Modal */}
      {conflict && (
        <PreferenceConflictDialog
          conflict={conflict}
          onResolve={resolveConflict}
          onCancel={() => {}}
        />
      )}

      {/* Confirm Revoke / Delete Cloud Record Modal */}
      {showRevokeConfirm && (
        <dialog
          open
          className="pro-dialog fixed inset-0 z-50 m-auto max-w-md rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-2xl backdrop:bg-black/50"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-desc"
        >
          <div className="space-y-4">
            <h3 id="confirm-delete-title" className="text-lg font-bold text-pro-heading">
              {tSync.confirmDeleteTitle[language]}
            </h3>
            <p id="confirm-delete-desc" className="text-sm text-pro-muted">
              {tSync.confirmDeleteDesc[language]}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="pro-btn pro-btn-secondary !min-h-11 !px-4 text-sm"
              >
                {tSync.cancelBtn[language]}
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeConfirm}
                className="pro-btn !min-h-11 !px-4 bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium"
              >
                {isRevoking ? "…" : tSync.confirmDeleteBtn[language]}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
