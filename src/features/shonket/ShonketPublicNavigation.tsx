"use client";
import { BookOpenText, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";
import styles from "./shonket.module.css";

export function ShonketPublicNavigation() {
  const { t } = useLanguage();
  const copy = translations.shonket;
  return <nav className={styles.publicNav} aria-label={t(copy.nav.information)}>
    <Link href="/safety/information"><BookOpenText size={16} aria-hidden="true" /> {t(copy.nav.information)}</Link>
    <Link href="/app/care"><HeartHandshake size={16} aria-hidden="true" /> {t(copy.nav.humanHelp)}</Link>
    <AccessPreferencesControl compact />
  </nav>;
}

export function ShonketSkipLink() {
  const { t } = useLanguage();
  return <a href="#shonket-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">{t(translations.shonket.nav.skip)}</a>;
}
