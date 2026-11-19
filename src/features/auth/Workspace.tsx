"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import type { OwnProfile } from "@/lib/auth/access";
import { SignOutButton } from "./SignOutButton";

export function Workspace({ profile, children }: { profile: OwnProfile; children?: React.ReactNode }) {
  const { t } = useLanguage();

  // Mother workspace: the AuthShell sidebar owns account + sign-out; MotherDashboard owns the page header.
  if (profile.role === "mother") return <div className="w-full">{children}</div>;

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-pro-border pb-4">
        <div className="grid gap-1">
          <p className="w-fit rounded-pill border border-pro-border bg-pro-surface px-2.5 py-0.5 text-sm font-semibold text-pro-primary">
            {t({ en: "Simulated provider portal", bn: "সিমুলেটেড সেবাদাতা পোর্টাল" })}
          </p>
          <h1 className="pro-editorial text-2xl font-bold text-pro-text sm:text-3xl">
            {t({ en: "Care request queue", bn: "সহায়তা অনুরোধের তালিকা" })}
          </h1>
          {profile.display_name && (
            <p className="text-pro-muted">{t({ en: "Signed in as", bn: "সাইন ইন করেছেন" })} {profile.display_name}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/account" className="pro-btn pro-btn-secondary">
            <User size={16} aria-hidden="true" />
            <span>{t({ en: "Account and roles", bn: "অ্যাকাউন্ট ও পরিচয়" })}</span>
          </Link>
          <SignOutButton className="pro-btn pro-btn-secondary" />
        </div>
      </header>
      {children}
    </div>
  );
}
