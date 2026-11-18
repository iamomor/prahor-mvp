"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";

export function AuthStory({ signup }: { signup: boolean }) {
  const { t } = useLanguage();

  return (
    <aside className="auth-story" aria-label={t({ en: "Care with PROHOR", bn: "প্রহরের সাথে যত্ন" })}>
      {/* Top eyebrow pill — clean, no icon clutter */}
      <div className="auth-story-top">
        <span className="auth-story-mark">
          {t({ en: "YOUR CARE. YOUR WAY.", bn: "আপনার যত্ন, আপনার মতো।" })}
        </span>

        <h2>
          {signup
            ? t({ en: "A little care.\nA stronger circle.", bn: "একটু যত্ন।\nআরও দৃঢ় বন্ধন।" })
            : t({ en: "A familiar place.\nFor every new step.", bn: "পরিচিত আশ্রয়।\nপ্রতিটি নতুন পদক্ষেপে।" })}
        </h2>

        <p className="auth-story-desc">
          {t({
            en: "For mothers, the people beside them, and the professionals who care. Welcome to your circle of support.",
            bn: "মা, তাঁর পাশে থাকা মানুষ এবং যত্নে যুক্ত পেশাজীবীদের জন্য। আপনার সহায়তার বন্ধনে স্বাগতম।",
          })}
        </p>
      </div>

      {/* Maternal Garden Art Vignette with Concentric Orbits & Clean Badges */}
      <div className="auth-garden" aria-hidden="true">
        <div className="auth-garden-art">
          <svg viewBox="0 0 420 270" fill="none" className="auth-garden-svg">
            {/* Concentric orbital rings */}
            <circle cx="210" cy="135" r="120" className="auth-garden-orbit auth-garden-orbit-outer" />
            <circle cx="210" cy="135" r="88" className="auth-garden-orbit auth-garden-orbit-mid" />
            <circle cx="210" cy="135" r="56" className="auth-garden-orbit auth-garden-orbit-inner" />

            {/* Protective cradle & sprout stem */}
            <path
              d="M135 172 C165 204, 255 204, 285 172"
              className="auth-garden-cradle"
              strokeLinecap="round"
            />
            <path
              d="M210 188 C210 150, 210 112, 210 74"
              className="auth-garden-stem"
              strokeLinecap="round"
            />
            <path
              d="M210 130 C175 116, 155 96, 150 72 C180 74, 202 96, 210 130 Z"
              className="auth-garden-leaf"
            />
            <path
              d="M210 106 C240 92, 260 72, 265 50 C238 52, 218 74, 210 106 Z"
              className="auth-garden-leaf"
            />
            <circle cx="210" cy="62" r="8.5" className="auth-garden-sun" />
            <circle cx="120" cy="102" r="3.5" className="auth-garden-dot" />
            <circle cx="300" cy="112" r="3" className="auth-garden-dot" />
            <circle cx="165" cy="218" r="3" className="auth-garden-dot" />
          </svg>

          {/* Clean Floating Badges (text-first, no heavy icon overload) */}
          <span className="auth-garden-badge auth-badge-top-right">
            {t({ en: "DGHS & WHO Grounded", bn: "যাচাইকৃত স্বাস্থ্য তথ্য" })}
          </span>
          <span className="auth-garden-badge auth-badge-bottom-left">
            {t({ en: "Mother & Baby Journey", bn: "মা ও শিশুর যত্নের ধারা" })}
          </span>
          <span className="auth-garden-badge auth-badge-bottom-right">
            {t({ en: "Mother-Controlled", bn: "মায়ের সম্পূর্ণ নিয়ন্ত্রণ" })}
          </span>
        </div>

        <span className="auth-garden-caption">
          {t({ en: "Growing together, at your own pace.", bn: "একসাথে বেড়ে উঠি, আপনার নিজের গতিতে।" })}
        </span>
      </div>

      {/* 3 Core Care Promises — clean typographic presentation */}
      <div className="auth-story-promises">
        <div className="auth-promise-row">
          <span className="auth-promise-bullet" aria-hidden="true" />
          <div>
            <strong>{t({ en: "One account. Your different roles.", bn: "এক অ্যাকাউন্ট। আপনার বিভিন্ন পরিচয়।" })}</strong>
            <p>{t({ en: "Mother, family supporter, or doctor — all connected seamlessly.", bn: "মা, পরিবার বা সেবাদাতা — সবাই একটি নিরাপদ প্ল্যাটফর্মে।" })}</p>
          </div>
        </div>

        <div className="auth-promise-row">
          <span className="auth-promise-bullet" aria-hidden="true" />
          <div>
            <strong>{t({ en: "Bangla and English, side by side.", bn: "বাংলা ও ইংরেজি, পাশাপাশি।" })}</strong>
            <p>{t({ en: "Calm, verified maternal guidance tailored to your language.", bn: "সহজ ভাষায় নির্ভরযোগ্য পরামর্শ, আপনার সুবিধামতো।" })}</p>
          </div>
        </div>

        <div className="auth-promise-row">
          <span className="auth-promise-bullet" aria-hidden="true" />
          <div>
            <strong>{t({ en: "You choose what you share.", bn: "কী শেয়ার করবেন, সিদ্ধান্ত আপনার।" })}</strong>
            <p>{t({ en: "Private notes and records stay yours until you grant consent.", bn: "আপনার সম্মতি ছাড়া কোনো তথ্য কারও সাথে প্রকাশ হয় না।" })}</p>
          </div>
        </div>
      </div>

      {/* Emergency Escapement Note — quiet and clear */}
      <div className="auth-story-emergency">
        <span className="auth-emergency-head">
          {t({ en: "Emergency helpline 16263", bn: "জরুরি স্বাস্থ্য বাতায়ন ১৬২৬৩" })}
        </span>
        <p>
          {t({
            en: "Urgent medical help is always reachable without logging in.",
            bn: "জরুরি সেবা বা পরামর্শ অ্যাকাউন্ট ছাড়াই যেকোনো সময় ব্যবহার করা যায়।",
          })}
        </p>
      </div>

      <Link className="auth-story-link" href="/how-it-works">
        <span>{t({ en: "Explore how PROHOR works", bn: "প্রহর কীভাবে কাজ করে জানুন" })}</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
