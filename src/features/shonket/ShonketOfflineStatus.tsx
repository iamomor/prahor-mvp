"use client";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";
import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

export function ShonketOfflineStatus() {
  const { t } = useLanguage();
  return <NetworkStatus message={t(translations.shonket.offline.safety)} />;
}
