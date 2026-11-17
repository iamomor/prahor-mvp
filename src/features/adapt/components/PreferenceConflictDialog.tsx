"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, ArrowRight, Laptop, Cloud } from "lucide-react";
import type { PreferenceConflictState } from "../hooks/usePreferenceSync";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

export type PreferenceConflictDialogProps = {
  conflict: PreferenceConflictState;
  onResolve: (choice: "keep_device" | "use_account") => void;
  onCancel?: () => void;
};

export function PreferenceConflictDialog({
  conflict,
  onResolve,
  onCancel,
}: PreferenceConflictDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { language } = useLanguage();
  const tSync = translations.adapt.cloudSync;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const d = conflict.deviceSettings;
  const c = conflict.cloudSettings;

  return (
    <dialog
      ref={dialogRef}
      className="pro-dialog fixed inset-0 z-50 m-auto max-w-lg rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-2xl backdrop:bg-black/50"
      aria-labelledby="conflict-dialog-title"
      aria-describedby="conflict-dialog-desc"
      onCancel={(e) => {
        e.preventDefault();
        onCancel?.();
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="conflict-dialog-title"
              className="text-lg font-bold text-pro-heading"
            >
              {tSync.conflictTitle[language]}
            </h2>
            <p
              id="conflict-dialog-desc"
              className="mt-1 text-sm text-pro-muted"
            >
              {tSync.conflictDesc[language]}
            </p>
          </div>
        </div>

        {/* Comparison Overview */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Device Settings Column */}
          <div className="rounded-xl border border-pro-border bg-pro-surface p-3 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-pro-heading">
              <Laptop size={14} aria-hidden="true" />
              <span>{language === "bn" ? "বর্তমান ডিভাইস" : "Current Device"}</span>
            </div>
            <ul className="space-y-1 text-pro-muted">
              <li><strong className="text-pro-text">{language === "bn" ? "থিম:" : "Theme:"}</strong> {d.theme}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "লেখার সাইজ:" : "Text:"}</strong> {d.textScale}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "ভাষা:" : "Language:"}</strong> {d.language}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "যোগাযোগ:" : "Mode:"}</strong> {d.communication}</li>
            </ul>
          </div>

          {/* Account Settings Column */}
          <div className="rounded-xl border border-pro-border bg-pro-surface p-3 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-pro-heading">
              <Cloud size={14} aria-hidden="true" />
              <span>{language === "bn" ? "অ্যাকাউন্টে সংরক্ষিত" : "Saved in Account"}</span>
            </div>
            <ul className="space-y-1 text-pro-muted">
              <li><strong className="text-pro-text">{language === "bn" ? "থিম:" : "Theme:"}</strong> {c.theme}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "লেখার সাইজ:" : "Text:"}</strong> {c.textScale}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "ভাষা:" : "Language:"}</strong> {c.language}</li>
              <li><strong className="text-pro-text">{language === "bn" ? "যোগাযোগ:" : "Mode:"}</strong> {c.communication}</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onResolve("keep_device")}
            className="pro-btn pro-btn-primary flex items-center justify-between !min-h-12 w-full !px-4 text-left font-medium"
          >
            <span>{tSync.keepDevice[language]}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onResolve("use_account")}
            className="pro-btn pro-btn-secondary flex items-center justify-between !min-h-12 w-full !px-4 text-left font-medium"
          >
            <span>{tSync.useAccount[language]}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="pro-btn pro-btn-ghost mt-1 !min-h-10 w-full text-center text-sm text-pro-muted hover:text-pro-text"
            >
              {tSync.cancelBtn[language]}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
