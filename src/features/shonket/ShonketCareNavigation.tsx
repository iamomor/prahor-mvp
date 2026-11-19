"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import { ShonketFocusHeading } from "./ShonketFocusHeading";
import styles from "./shonket.module.css";

export function ShonketCareNavigation({ current }: { current: "form" | "review" | "status" }) {
  const { t } = useLanguage();
  const c = translations.shonket.nav;
  const labels = { form: c.careStepForm, review: c.careStepReview, status: c.careStepStatus };
  return <nav className={styles.careNavigation} aria-label={t(c.breadcrumb)}>
    <ShonketFocusHeading />
    <Link href="/safety">{t(c.shonketHome)}</Link><span aria-hidden="true">/</span>
    <Link href="/app/care">{t(c.humanHelp)}</Link><span aria-hidden="true">/</span>
    <span aria-current="page">{t(labels[current])}</span>
  </nav>;
}
