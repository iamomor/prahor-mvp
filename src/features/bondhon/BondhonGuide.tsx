"use client";
import { useLanguage } from "@/i18n/use-language";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";
export function BondhonGuide() {
  const { t } = useLanguage();
  return <ol className={styles.journeyGuide} aria-label={t(words("Your sharing journey", "আপনার শেয়ারের পথ"))}>
    {[
      [words("Choose", "বাছুন"), words("Who, what and how long", "কার সঙ্গে, কী ও কতক্ষণ")],
      [words("Review", "পর্যালোচনা করুন"), words("Nothing goes without approval", "অনুমতি ছাড়া কিছুই যাবে না")],
      [words("Stay in control", "নিয়ন্ত্রণ রাখুন"), words("Follow replies or stop sharing", "উত্তর দেখুন বা শেয়ার বন্ধ করুন")],
    ].map(([title, hint], index) => <li key={title.en}><span aria-hidden="true" className={styles.guideNumber}>{index + 1}</span><span><strong>{t(title)}</strong><span>{t(hint)}</span></span></li>)}
  </ol>;
}
