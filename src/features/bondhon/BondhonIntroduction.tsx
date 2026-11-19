"use client";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";
export function BondhonIntroduction() {
  const { t, language } = useLanguage();
  return <section className={`pro-shell py-10 ${styles.workspace}`} lang={language}>
    <h1 className={styles.heading}>{t(words("Bondhon · Share on your terms", "বন্ধন · আপনার সিদ্ধান্তে শেয়ার"))}</h1>
    <p>{t(words("Review the recipient, purpose, exact information and expiry before sending a routine care-coordination request.", "সাধারণ সেবার অনুরোধ পাঠানোর আগে প্রাপক, উদ্দেশ্য, নির্দিষ্ট তথ্য ও মেয়াদ দেখুন।"))}</p>
    <div className={styles.notice}>{t(words("This hackathon uses simulated provider accounts and synthetic records. It offers no emergency monitoring or real clinical response.", "এই হ্যাকাথনে সিমুলেটেড সেবাদাতার অ্যাকাউন্ট ও নমুনা রেকর্ড ব্যবহৃত হয়। এখানে জরুরি পর্যবেক্ষণ বা প্রকৃত চিকিৎসকের উত্তর দেওয়া হয় না।"))}</div>
    <div className={styles.actions}>
      <Link className="pro-btn pro-btn-primary" href="/app/bondhon">{t(words("Open my requests and permissions", "আমার অনুরোধ ও অনুমতি খুলুন"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href="/provider/bondhon">{t(words("Open simulated provider queue", "সিমুলেটেড সেবাদাতার তালিকা খুলুন"))}</Link>
      <Link className="pro-btn pro-btn-secondary" href="/poth">{t(words("Find a healthcare facility", "স্বাস্থ্যসেবা প্রতিষ্ঠান খুঁজুন"))}</Link>
      </div>
    <section className={styles.panel}>
      <h2>{t(words("How sharing works", "শেয়ারের পদ্ধতি"))}</h2>
      <ol className="list-decimal ps-6 space-y-3">
      <li>{t(words("Choose a named approved simulated provider and a routine purpose.", "নামসহ অনুমোদিত সিমুলেটেড সেবাদাতা ও সাধারণ উদ্দেশ্য বাছুন।"))}</li>
      <li>{t(words("Write your message and optionally select individual record fields and accommodations.", "বার্তা লিখুন এবং চাইলে রেকর্ডের নির্দিষ্ট তথ্য ও সুবিধার অনুরোধ বাছুন।"))}</li>
      <li>{t(words("Review exactly what will be sent, permitted replies and when access ends. Explicitly approve to send.", "কী যাবে, উত্তরের অনুমতি ও কখন প্রবেশ শেষ হবে দেখুন। স্পষ্ট সম্মতি দিয়ে পাঠান।"))}</li>
      <li>{t(words("Track the simulated queue, review replies and revoke future access whenever you choose.", "সিমুলেটেড তালিকার অবস্থা ও উত্তর দেখুন এবং চাইলে ভবিষ্যতের অনুমতি প্রত্যাহার করুন।"))}</li>
    </ol>
      <p>{t(words("Diary entries, AI conversations and raw attachments are excluded. Previously seen or copied information cannot be recalled. A support person gains no automatic access.", "ডায়েরি, এআই কথোপকথন ও মূল সংযুক্তি বাদ থাকে। আগে দেখা বা কপি করা তথ্য ফিরিয়ে নেওয়া যায় না। সহায়ক স্বয়ংক্রিয় প্রবেশাধিকার পান না।"))}</p>
      </section>
  </section>;
}
