"use client";
import { HeartHandshake, BookOpen, Sprout, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/use-language";

export function AuthStory({ signup }: { signup: boolean }) {
  const { t } = useLanguage();
  return <aside className="auth-story" aria-label={t({ en: "Care with PROHOR", bn: "প্রহরের সাথে যত্ন" })}>
    <div className="auth-story-top"><span className="auth-story-mark"><Sprout size={18} aria-hidden="true" />{t({ en: "YOUR CARE. YOUR WAY.", bn: "আপনার যত্ন, আপনার মতো।" })}</span>
      <h2>{signup ? t({ en: "A little care.\nA stronger circle.", bn: "একটু যত্ন।\nআরও দৃঢ় বন্ধন।" }) : t({ en: "A familiar place.\nFor every new step.", bn: "পরিচিত আশ্রয়।\nপ্রতিটি নতুন পদক্ষেপে।" })}</h2>
      <p>{t({ en: "For mothers, the people beside them, and the professionals who care. Welcome to your circle of support.", bn: "মা, তাঁর পাশে থাকা মানুষ এবং যত্নে যুক্ত পেশাজীবীদের জন্য। আপনার সহায়তার বন্ধনে স্বাগতম।" })}</p>
    </div>
    <div className="auth-garden" aria-hidden="true">
      <svg viewBox="0 0 420 300" fill="none"><circle cx="210" cy="148" r="123" className="auth-garden-orbit" /><circle cx="210" cy="148" r="98" className="auth-garden-orbit" />
        <path d="M205 256C210 206 206 152 207 91M207 194C174 159 144 157 121 133M207 171C238 134 260 125 294 104M208 137C182 114 171 91 169 65M209 221C244 197 263 181 276 158" className="auth-garden-stem" />
        <path d="M123 135C87 132 74 105 82 85C115 81 138 104 123 135Z" className="auth-garden-leaf" />
        <path d="M169 68C139 55 139 28 151 13C180 25 189 48 169 68Z" className="auth-garden-leaf" />
        <path d="M294 105C324 107 344 86 339 62C311 59 287 78 294 105Z" className="auth-garden-leaf" />
        <path d="M276 160C308 164 326 143 322 122C293 119 273 137 276 160Z" className="auth-garden-leaf" />
        <path d="M206 94C183 78 187 48 207 33C230 51 229 78 206 94Z" className="auth-garden-accent" />
        <circle cx="105" cy="213" r="7" className="auth-garden-accent" /><circle cx="320" cy="192" r="4" className="auth-garden-leaf" />
        <path d="M143 269C177 258 237 258 274 269" className="auth-garden-stem" />
      </svg>
      <span className="auth-garden-caption">{t({ en: "Growing together, at your pace.", bn: "একসাথে বেড়ে উঠি, আপনার গতিতে।" })}</span>
    </div>
    <div className="auth-story-promises">
      <span><HeartHandshake size={19} aria-hidden="true" />{t({ en: "One account. Your different roles.", bn: "এক অ্যাকাউন্ট। আপনার বিভিন্ন পরিচয়।" })}</span>
      <span><BookOpen size={19} aria-hidden="true" />{t({ en: "Bangla and English, side by side.", bn: "বাংলা ও ইংরেজি, পাশাপাশি।" })}</span>
      <span><ShieldCheck size={19} aria-hidden="true" />{t({ en: "You choose what you share.", bn: "কী শেয়ার করবেন, সিদ্ধান্ত আপনার।" })}</span>
    </div>
    <Link className="auth-story-link" href="/how-it-works">{t({ en: "Get to know PROHOR", bn: "প্রহরকে জানুন" })}<ArrowUpRight size={17} aria-hidden="true" /></Link>
  </aside>;
}
