"use client";

import { useLanguage } from "@/i18n/use-language";
import { translations } from "@/i18n/translations";

export function AskBartaNotice() {
  const { language, t } = useLanguage();
  if (language !== "bn") return null;

  return (
    <p role="note" lang="bn" className="py-2 text-sm text-pro-muted">
      {t(translations.adapt.englishFallbackNotice)}
    </p>
  );
}
