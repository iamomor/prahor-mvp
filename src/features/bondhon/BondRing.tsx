"use client";
import { useId } from "react";
import { useLanguage } from "@/i18n/use-language";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

export function BondRing({ active, recordCount, provider, recipientLabel }: {
  active: boolean; recordCount: number; provider: boolean; recipientLabel: string;
}) {
  const { t } = useLanguage();
  const id = useId();
  return <section className={styles.panel} aria-labelledby={`${id}-sharing`}>
    <h3 id={`${id}-sharing`}>{t(words("Sharing for this request", "এই অনুরোধে তথ্য শেয়ার"))}</h3>
    <div className={styles.bondRing}>
      <p className={styles.motherNode}>{t(words("Mother’s decision", "মায়ের সিদ্ধান্ত"))}</p>
      <div className={styles.recipientNode}><strong>{recipientLabel}</strong>
        <p>{t(active ? words("Permission window active", "অনুমতির সময়সীমা কার্যকর") : words("No current permission confirmed", "বর্তমান অনুমতি নিশ্চিত নয়"))}</p>
        <p>{t(words("Health records in this request", "এই অনুরোধের স্বাস্থ্য রেকর্ড"))}: {recordCount}</p>
      </div>
      <div className={styles.privateNode}><strong>{t(words("Excluded from this sharing tool", "এই শেয়ার ব্যবস্থার বাইরে"))}</strong>
        <p>{t(words("Private diary · AI conversations · raw files", "ব্যক্তিগত ডায়েরি · এআই কথোপকথন · মূল ফাইল"))}</p>
      </div>
    </div>
    <p>{t(provider ? words("Only server-authorized fields are displayed below. This overview grants no additional access.", "নিচে শুধু সার্ভার অনুমোদিত তথ্য দেখানো হয়। এই সারাংশ বাড়তি প্রবেশাধিকার দেয় না।") : words("This overview applies only to this request. Review its exact fields and expiry below. Naming a support person does not grant their account access.", "এই সারাংশ শুধু এই অনুরোধের জন্য। নিচে নির্দিষ্ট তথ্য ও মেয়াদ দেখুন। সহায়কের নাম উল্লেখ করলে তাঁর অ্যাকাউন্টে অনুমতি দেওয়া হয় না।"))}</p>
  </section>;
}
