"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
export function CareRequestStarter() {
  const { t } = useLanguage();
  return <Link href="/bondhon" className="pro-btn pro-btn-primary">{t({ en: "Review a Bondhon care request", bn: "বন্ধনের সেবার অনুরোধ পর্যালোচনা করুন" })}</Link>;
}
