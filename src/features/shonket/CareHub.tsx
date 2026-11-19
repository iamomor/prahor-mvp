"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileClock, HandHeart, MapPin, PhoneCall, ShieldCheck, Sprout, Users, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

type Text = { en: string; bn: string };
const card = "rounded-card border border-pro-border bg-pro-elevated shadow-pro-1";

const rows: { href: string; icon: LucideIcon; title: Text; detail: Text }[] = [
  { href: "/app/care/new", icon: HandHeart, title: { en: "Request a care worker", bn: "সেবাকর্মীর অনুরোধ" }, detail: { en: "Choose how you want to communicate", bn: "কীভাবে কথা বলতে চান বেছে নিন" } },
  { href: "/app/care/requests", icon: FileClock, title: { en: "My requests", bn: "আমার অনুরোধ" }, detail: { en: "See your saved requests and verified status", bn: "সংরক্ষিত অনুরোধ ও যাচাই করা অবস্থা দেখুন" } },
  { href: "/app/bondhon", icon: Users, title: { en: "My care circle", bn: "আমার কেয়ার সার্কেল" }, detail: { en: "Manage trusted people and permissions", bn: "বিশ্বস্ত মানুষ ও অনুমতি নিয়ন্ত্রণ" } },
  { href: "/app/poth", icon: MapPin, title: { en: "Nearby facilities", bn: "কাছের সেবাকেন্দ্র" }, detail: { en: "Browse the directory and prepare a visit", bn: "তালিকা দেখুন ও চেকআপের প্রস্তুতি নিন" } },
  { href: "/safety", icon: ShieldCheck, title: { en: "Important safety information", bn: "জরুরি নিরাপত্তা তথ্য" }, detail: { en: "Know when to seek immediate human care", bn: "কখন এখনই সেবা নিতে হবে জানুন" } },
];

/** Shonket hub: every way to reach a person, each reachable without AI, voice or a phone call. */
export function CareHub() {
  const { t } = useLanguage();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
      <div className="grid min-w-0 gap-6">
        <header className="module-hero">
          <p lang="en">A caring hand, when you need it</p>
          <h1>{t({ en: "Care & support", bn: "সেবা ও সহায়তা" })}</h1>
          <p>{t({ en: "Everything you need to reach the people you trust. Nothing is sent until you review it and press Send.", bn: "বিশ্বস্ত মানুষের কাছে পৌঁছানোর সবকিছু এক জায়গায়। পর্যালোচনা করে পাঠান না চাপা পর্যন্ত কিছু যায় না।" })}</p>
        </header>

        <section aria-labelledby="care-ways" className={`${card} px-5 pb-2 pt-4`}>
          <h2 id="care-ways" className="font-semibold text-pro-text">{t({ en: "Ways to get help", bn: "সাহায্য পাওয়ার উপায়" })}</h2>
          <ul className="mt-1 divide-y divide-pro-border">
            {rows.map(({ href, icon: Icon, title, detail }) => (
              <li key={href}>
                <Link href={href} className="group -mx-2 flex min-h-16 items-center gap-3 rounded-field px-2 py-2.5 hover:bg-pro-surface/50 focus-visible:outline-3 focus-visible:outline-pro-focus">
                  <span className="grid size-10 shrink-0 place-items-center rounded-field bg-pro-surface text-pro-primary">
                    <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="grid min-w-0 flex-1">
                    <span className="font-semibold text-pro-text">{t(title)}</span>
                    <span className="text-sm text-pro-muted">{t(detail)}</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-pro-muted group-hover:text-pro-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="care-more" className="grid gap-3">
          <h2 id="care-more" className="text-lg font-semibold text-pro-text">{t({ en: "Something for you", bn: "আপনার জন্য" })}</h2>
          <Link href="/app/wellbeing" className={`${card} group flex items-center gap-4 p-4 hover:border-pro-primary/50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus`}>
            <span className="grid size-14 shrink-0 place-items-center rounded-field bg-pro-surface text-pro-primary">
              <Sprout size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="grid flex-1">
              <span className="font-semibold text-pro-text">{t({ en: "Wellbeing & diary", bn: "সুস্থতা ও ডায়েরি" })}</span>
              <span className="text-sm text-pro-muted">{t({ en: "Rest, gentle check-ins and a private diary.", bn: "বিশ্রাম, শান্ত চেক-ইন ও ব্যক্তিগত ডায়েরি।" })}</span>
            </span>
            <ArrowRight size={17} aria-hidden="true" className="text-pro-muted group-hover:text-pro-primary" />
          </Link>
        </section>
      </div>

      <div className="grid min-w-0 gap-5">
        <section aria-labelledby="care-urgent" className="grid gap-3 rounded-card border border-pro-danger/40 bg-pro-elevated p-5">
          <h2 id="care-urgent" className="font-semibold text-pro-text">{t({ en: "Need care right now?", bn: "এখনই সেবা দরকার?" })}</h2>
          <p className="text-sm text-pro-muted">{t({ en: "Don't wait for a reply. Call 999 or go to a hospital or maternity facility.", bn: "উত্তরের অপেক্ষা করবেন না। ৯৯৯-এ কল করুন বা হাসপাতালে যান।" })}</p>
          <a href="tel:999" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-field bg-pro-danger px-4 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
            <PhoneCall size={16} aria-hidden="true" />{t({ en: "Call 999", bn: "৯৯৯-এ কল করুন" })}
          </a>
        </section>
        <section aria-labelledby="care-prefs" className={`${card} grid gap-3 p-5`}>
          <h2 id="care-prefs" className="font-semibold text-pro-text">{t({ en: "Your support preferences", bn: "আপনার সহায়তার পছন্দ" })}</h2>
          <p className="text-sm text-pro-muted">{t({ en: "No one should have to call, speak, or hear audio to get help. Text always works.", bn: "সাহায্য পেতে কাউকে কল করতে, কথা বলতে বা অডিও শুনতে হবে না। লেখা সবসময় চলে।" })}</p>
          <Link href="/app/accessibility" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-field border border-pro-border bg-pro-elevated font-semibold text-pro-text hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
            {t({ en: "Adjust how I connect", bn: "যোগাযোগের ধরন বদলান" })}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <p className="rounded-field bg-pro-surface/70 px-4 py-3 text-sm leading-relaxed text-pro-muted">
          {t({ en: "Providers in this demo are simulated. A request is only “delivered” when PROHOR shows that status.", bn: "এই ডেমোর সেবাদাতারা সিমুলেটেড। PROHOR যখন দেখায় তখনই কেবল অনুরোধ “পৌঁছেছে” ধরা হয়।" })}
        </p>
      </div>
    </div>
  );
}
