"use client";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { BondhonGuide } from "./BondhonGuide";
import { SharingRing } from "./SharingRing";
import { words } from "./bondhon-copy";
import styles from "./bondhon.module.css";
export function BondhonIntroduction() {
  const { t, language } = useLanguage();
  return <main className={`pro-shell py-10 ${styles.workspace} ${styles.bondhonPage}`} lang={language}>
    <header className={styles.introduction}>
      <div className={styles.introCopy}>
        <p className={styles.eyebrow}>{t(words("PROHOR / Bondhon", "প্রহর / বন্ধন"))}</p>
        <h1 className={styles.heading}>{t(words("A little support. On your terms.", "একটু সহায়তা। আপনার সিদ্ধান্তে।"))}</h1>
        <p>{t(words("You know what you need. Bondhon helps you explain it, choose what to share and keep track of the reply. Every sharing decision stays yours.", "আপনার প্রয়োজন আপনি জানেন। বন্ধনে তা জানাতে, কী শেয়ার করবেন বাছতে ও উত্তর দেখতে পারবেন। শেয়ারের প্রতিটি সিদ্ধান্ত আপনার।"))}</p>
        <Link className="pro-btn pro-btn-primary" href="/app/bondhon">{t(words("Open my Bondhon", "আমার বন্ধন খুলুন"))}<ArrowUpRight size={20} aria-hidden="true" /></Link>
        <p className={styles.meta}>{t(words("Sign in to manage private requests. No records are shared just by opening this page.", "ব্যক্তিগত অনুরোধের জন্য সাইন ইন করুন। এই পাতা খুললেই কোনো রেকর্ড শেয়ার হয় না।"))}</p>
      </div>
      <div className={styles.introIllustration}>
        <SharingRing nodes={[]} label={t(words("Illustration: you at the centre of your sharing decisions", "চিত্র: শেয়ারের সিদ্ধান্তের কেন্দ্রে আপনি"))} />
        <p><ShieldCheck size={22} aria-hidden="true" />{t(words("Your information. Your permission.", "আপনার তথ্য। আপনার অনুমতি।"))}</p>
      </div>
    </header>
    <BondhonGuide />
    <aside className={styles.simulationNote}>
      <strong>{t(words("A working hackathon simulation", "হ্যাকাথনের কার্যকর সিমুলেশন"))}</strong>
      <p>{t(words("Demo provider accounts and synthetic records only. This is not a staffed medical or emergency service; a reply is not guaranteed.", "শুধু ডেমো সেবাদাতার অ্যাকাউন্ট ও নমুনা রেকর্ড। এটি কর্মরত চিকিৎসা বা জরুরি সেবা নয়; উত্তরের নিশ্চয়তা নেই।"))}</p>
      <Link href="/poth#poth-sos">{t(words("Emergency and care information", "জরুরি ও সেবার তথ্য"))}</Link>
    </aside>
    <div className={styles.introColumns}>
      <section className={styles.panel} aria-labelledby="bondhon-choices">
        <p className={styles.eyebrow}>{t(words("Your choices", "আপনার বাছাই"))}</p>
        <h2 id="bondhon-choices">{t(words("Share only what helps", "যা কাজে লাগে শুধু তা শেয়ার করুন"))}</h2>
        <ul className={styles.plainList}>
          <li>{t(words("Choose a named, approved simulated recipient.", "নামসহ অনুমোদিত সিমুলেটেড প্রাপক বাছুন।"))}</li>
          <li>{t(words("Send a message on its own, or select exact record fields.", "শুধু বার্তা পাঠান, অথবা রেকর্ডের নির্দিষ্ট তথ্য বাছুন।"))}</li>
          <li>{t(words("Choose an end time and whether to allow replies.", "শেষ সময় ও উত্তরের অনুমতি বাছুন।"))}</li>
          <li>{t(words("Review everything before sending; stop future access whenever you choose.", "পাঠানোর আগে সব দেখুন; চাইলে ভবিষ্যতের প্রবেশ বন্ধ করুন।"))}</li>
        </ul>
      </section>
      <section className={styles.panel} aria-labelledby="bondhon-private">
        <LockKeyhole size={24} aria-hidden="true" />
        <h2 id="bondhon-private">{t(words("Some things stay outside sharing", "কিছু তথ্য শেয়ারের বাইরেই থাকে"))}</h2>
        <p>{t(words("Diary entries, AI conversations and raw files cannot be shared through Bondhon. A family member or support person gets no automatic access.", "ডায়েরি, এআই কথোপকথন ও মূল ফাইল বন্ধনের মাধ্যমে শেয়ার করা যায় না। পরিবারের সদস্য বা সহায়ক স্বয়ংক্রিয় প্রবেশ পান না।"))}</p>
        <p className={styles.meta}>{t(words("Stopping prevents future access through the request. It cannot recall information already seen or copied, and the consent history remains.", "বন্ধ করলে অনুরোধের মাধ্যমে ভবিষ্যতের প্রবেশ বন্ধ হয়। আগে দেখা বা কপি করা তথ্য ফিরিয়ে নেওয়া যায় না, সম্মতির ইতিহাসও থাকে।"))}</p>
      </section>
    </div>
    <details className={`${styles.panel} ${styles.softDetails}`}>
      <summary>{t(words("Helping with the demo?", "ডেমোতে সহায়তা করছেন?"))}</summary>
      <p>{t(words("The mother and provider use separate approved accounts. The provider sees only authorized requests and selected information.", "মা ও সেবাদাতা আলাদা অনুমোদিত অ্যাকাউন্ট ব্যবহার করেন। সেবাদাতা শুধু অনুমোদিত অনুরোধ ও বাছা তথ্য দেখেন।"))}</p>
      <div className={styles.actions}><Link className="pro-btn pro-btn-secondary" href="/provider/bondhon">{t(words("Open simulated provider queue", "সিমুলেটেড সেবাদাতার তালিকা খুলুন"))}</Link><Link className="pro-btn pro-btn-secondary" href="/poth">{t(words("Find care and prepare a visit", "সেবা খুঁজুন ও সাক্ষাতের প্রস্তুতি নিন"))}</Link></div>
    </details>
  </main>;
}
