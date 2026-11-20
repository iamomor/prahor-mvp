"use client";

import { useLanguage } from "@/i18n/use-language";
import {
  Accessibility,
  Activity,
  BookOpen,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock3,
  FileSearch,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useId } from "react";

type ModuleId =
  | "adapt"
  | "barta"
  | "shonket"
  | "jibonrekha"
  | "bujhi"
  | "shusthota"
  | "poth"
  | "bondhon";
type Feature = {
  en: string;
  bn: string;
  status: "available" | "coming" | "limited";
};
const modules: Record<
  ModuleId,
  { name: string; icon: typeof Accessibility; features: Feature[] }
> = {
  adapt: {
    name: "Adapt · অভিযোজন",
    icon: Accessibility,
    features: [
      {
        en: "Voice input and picture AAC",
        bn: "কণ্ঠে লেখা ও ছবি-ভিত্তিক AAC",
        status: "available",
      },
      {
        en: "Read Aloud; cloud voices require opt-in and device support",
        bn: "পড়ে শোনানো; ক্লাউড কণ্ঠে সম্মতি ও ডিভাইস সমর্থন লাগে",
        status: "limited",
      },
      {
        en: "Text size, contrast, reduced motion and keyboard access",
        bn: "লেখার আকার, কনট্রাস্ট, কম অ্যানিমেশন ও কিবোর্ড ব্যবহার",
        status: "available",
      },
      {
        en: "Semantic screen-reader navigation; Braille displays work through compatible assistive technology (not device-certified)",
        bn: "অর্থবহ স্ক্রিন-রিডার নেভিগেশন; সামঞ্জস্যপূর্ণ সহায়ক প্রযুক্তির মাধ্যমে ব্রেইল ডিসপ্লে কাজ করতে পারে (ডিভাইস-সনদপ্রাপ্ত নয়)",
        status: "limited",
      },
      {
        en: "More reviewed Easy Read and human-produced BdSL videos",
        bn: "আরও পর্যালোচিত সহজ পাঠ ও মানুষের তৈরি বাংলা ইশারা ভাষার ভিডিও",
        status: "coming",
      },
    ],
  },
  barta: {
    name: "Barta · বার্তা",
    icon: BookOpen,
    features: [
      {
        en: "Bangla and English education chat",
        bn: "বাংলা ও ইংরেজিতে স্বাস্থ্যশিক্ষার কথোপকথন",
        status: "available",
      },
      {
        en: "Voice dictation, AAC, emoji and text alternatives",
        bn: "কণ্ঠে লেখা, AAC, ইমোজি ও লেখার বিকল্প",
        status: "available",
      },
      {
        en: "Cartesia Read Aloud for configured Bangla and English voices",
        bn: "কনফিগার করা বাংলা ও ইংরেজি Cartesia কণ্ঠে পড়ে শোনানো",
        status: "limited",
      },
      {
        en: "Emergency guidance links and accessible conversation history",
        bn: "জরুরি সহায়তার লিংক ও কথোপকথনের ইতিহাস",
        status: "limited",
      },
    ],
  },
  shonket: {
    name: "Shonket · সংকেত",
    icon: ShieldCheck,
    features: [
      {
        en: "Danger-sign information and direct calls to 999 / 16263",
        bn: "বিপদের লক্ষণ সম্পর্কিত তথ্য ও ৯৯৯ / ১৬২৬৩-এ সরাসরি কল",
        status: "available",
      },
      {
        en: "AAC concern messages and Read Aloud",
        bn: "AAC-তে উদ্বেগের বার্তা ও পড়ে শোনানো",
        status: "available",
      },
      {
        en: "Some emergency information works offline; check current connection status",
        bn: "কিছু জরুরি তথ্য অফলাইনেও পাওয়া যায়; সংযোগের অবস্থা দেখে নিন",
        status: "limited",
      },
      {
        en: "Human-produced BdSL danger-sign videos and more reviewed accessible safety content",
        bn: "মানুষের তৈরি বাংলা ইশারা ভাষায় বিপদের লক্ষণের ভিডিও ও আরও পর্যালোচিত নিরাপত্তা তথ্য",
        status: "coming",
      },
    ],
  },
  jibonrekha: {
    name: "Jibonrekha · জীবনরেখা",
    icon: Activity,
    features: [
      {
        en: "Separate maternal and baby records with accessible history",
        bn: "মা ও শিশুর আলাদা নথি এবং ব্যবহারযোগ্য ইতিহাস",
        status: "available",
      },
      {
        en: "Self-entered values and supported measurement units",
        bn: "নিজে লেখা মান ও সমর্থিত পরিমাপের একক",
        status: "available",
      },
      {
        en: "Read Aloud and voice entry where the control is shown",
        bn: "যেখানে বোতাম আছে সেখানে পড়ে শোনানো ও কণ্ঠে লেখা",
        status: "limited",
      },
      {
        en: "Record status reflects its source; self-reported values are not clinically verified",
        bn: "নথির অবস্থা তার উৎস দেখায়; নিজে লেখা মান চিকিৎসাগতভাবে যাচাই করা নয়",
        status: "available",
      },
    ],
  },
  bujhi: {
    name: "Bujhi · বুঝি",
    icon: FileSearch,
    features: [
      {
        en: "Supported sample report image/PDF input and OCR",
        bn: "সমর্থিত নমুনা রিপোর্টের ছবি/PDF ও OCR",
        status: "limited",
      },
      {
        en: "Original extracted values, editable corrections and explicit review",
        bn: "মূল OCR মান, সম্পাদনাযোগ্য সংশোধন ও স্পষ্ট যাচাই",
        status: "available",
      },
      {
        en: "Verified-only saving for supported fields; unsupported fields cannot be saved",
        bn: "সমর্থিত তথ্য যাচাইয়ের পরই সংরক্ষণ; অসমর্থিত তথ্য সংরক্ষণ করা যায় না",
        status: "limited",
      },
      {
        en: "Bangla/English interface and Cartesia Read Aloud",
        bn: "বাংলা/ইংরেজি ইন্টারফেস ও Cartesia-তে পড়ে শোনানো",
        status: "limited",
      },
    ],
  },
  shusthota: {
    name: "Shusthota · সুস্থতা",
    icon: HeartHandshake,
    features: [
      {
        en: "Mood, energy, activity, rest, sleep and hydration check-ins",
        bn: "মনের অবস্থা, শক্তি, কাজ, বিশ্রাম, ঘুম ও পানি পানের খোঁজখবর",
        status: "available",
      },
      {
        en: "Private diary, voice input and Read Aloud where available",
        bn: "ব্যক্তিগত ডায়েরি, কণ্ঠে লেখা ও যেখানে আছে পড়ে শোনানো",
        status: "limited",
      },
      {
        en: "AAC symbols in supported communication flows",
        bn: "সমর্থিত যোগাযোগের পথে AAC প্রতীক",
        status: "limited",
      },
      {
        en: "History and account workflows require sign-in; not verified in this session",
        bn: "ইতিহাস ও অ্যাকাউন্টের কাজের জন্য সাইন-ইন লাগে; এই সেশনে যাচাই হয়নি",
        status: "limited",
      },
    ],
  },
  poth: {
    name: "Poth · পথ",
    icon: MapPin,
    features: [
      {
        en: "Facility search, voice-assisted query and call-ahead guidance",
        bn: "প্রতিষ্ঠান খোঁজা, কণ্ঠে অনুসন্ধান ও আগে ফোনের নির্দেশনা",
        status: "available",
      },
      {
        en: "Accessibility attributes show verified, reported or unknown status",
        bn: "প্রবেশগম্যতার তথ্য যাচাইকৃত, জানানো হয়েছে, অথবা অজানা হিসেবে দেখায়",
        status: "available",
      },
      {
        en: "Read Aloud and communication needs for care visits",
        bn: "পড়ে শোনানো ও সেবা-ভিজিটে যোগাযোগের পছন্দ",
        status: "available",
      },
      {
        en: "Unknown facility information is not a claim of access",
        bn: "প্রতিষ্ঠান সম্পর্কে অজানা তথ্যকে প্রবেশগম্যতার দাবি হিসেবে দেখানো হয় না",
        status: "available",
      },
    ],
  },
  bondhon: {
    name: "Bondhon · বন্ধন",
    icon: UsersRound,
    features: [
      {
        en: "Care requests, consent scopes, supporter access and revocation",
        bn: "সেবা-অনুরোধ, সম্মতির সীমা, সহায়তাকারীর প্রবেশাধিকার ও বাতিল",
        status: "available",
      },
      {
        en: "Voice dictation, AAC and Read Aloud in supported flows",
        bn: "সমর্থিত পথে কণ্ঠে লেখা, AAC ও পড়ে শোনানো",
        status: "available",
      },
      {
        en: "Activity history and notification preferences; delivery depends on configuration",
        bn: "কাজের ইতিহাস ও বিজ্ঞপ্তির পছন্দ; পাঠানো কনফিগারেশনের ওপর নির্ভরশীল",
        status: "limited",
      },
      {
        en: "Phone/QR invitations, SMS replies and push notifications",
        bn: "ফোন/QR আমন্ত্রণ, SMS উত্তর ও পুশ বিজ্ঞপ্তি",
        status: "coming",
      },
      {
        en: "Care-worker-assisted registration",
        bn: "সেবাকর্মীর সহায়তায় নিবন্ধন",
        status: "coming",
      },
    ],
  },
};
const statusCopy = {
  en: {
    available: "Available",
    coming: "Coming Soon",
    limited: "Limited Availability",
  },
  bn: {
    available: "বর্তমানে চালু",
    coming: "শীঘ্রই আসছে",
    limited: "সীমিত সুবিধা",
  },
};
const StatusIcon = {
  available: CircleCheck,
  coming: Clock3,
  limited: CircleAlert,
};
const statusTone = {
  available: "bg-pro-success-soft text-pro-success",
  limited: "bg-pro-warning-soft text-pro-warning",
  coming: "bg-pro-info-soft text-pro-info",
};
const chip =
  "inline-flex min-h-8 items-center gap-1.5 rounded-pill px-3 text-xs font-bold";
const countCopy = {
  en: { available: "Available", coming: "Coming Soon", limited: "Limited" },
  bn: statusCopy.bn,
};

export function ModuleFeatureOverview({
  module,
  language: languageOverride,
}: {
  module: ModuleId;
  /** Show the panel in this language instead of the site language. */
  language?: "en" | "bn";
}) {
  const { language: siteLanguage } = useLanguage();
  const language = languageOverride ?? siteLanguage;
  const id = useId();
  const item = modules[module];
  const ModuleIcon = item.icon;
  const status = statusCopy[language];
  const counts = (["available", "limited", "coming"] as const)
    .map((key) => ({
      key,
      n: item.features.filter((f) => f.status === key).length,
    }))
    .filter((c) => c.n > 0);
  return (
    <section aria-labelledby={id} className="my-2">
      <details className="group rounded-card border border-pro-border bg-pro-elevated px-4 sm:px-5">
        <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 rounded-card py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus [&::-webkit-details-marker]:hidden">
          <ModuleIcon
            className="size-5 shrink-0 text-pro-primary"
            aria-hidden="true"
          />
          <h2
            id={id}
            className="min-w-0 flex-1 basis-56 font-bold text-pro-text"
          >
            {language === "bn"
              ? `${item.name} · সুবিধা ও অবস্থা`
              : `${item.name} · Features and status`}
          </h2>
          {counts.map(({ key, n }) => {
            const Icon = StatusIcon[key];
            return (
              <span key={key} className={`${chip} ${statusTone[key]}`}>
                <Icon className="size-3.5" aria-hidden="true" />
                {n} {countCopy[language][key]}
              </span>
            );
          })}
          <ChevronDown
            className="size-5 shrink-0 text-pro-primary transition-transform duration-[var(--pro-duration-fast)] group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <ul className="m-0 grid list-none gap-0 p-0 pb-2">
          {item.features.map((feature) => {
            const Icon = StatusIcon[feature.status];
            const text = language === "bn" ? feature.bn : feature.en;
            return (
              <li
                key={feature.en}
                className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-pro-border/50 py-3"
              >
                <p className="min-w-0 flex-[1_1_16rem] text-base font-semibold leading-relaxed text-pro-text">
                  {text}
                </p>
                <span
                  className={`${chip} ${statusTone[feature.status]}`}
                  aria-label={`${status[feature.status]}: ${text}`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {status[feature.status]}
                </span>
                {feature.status === "coming" && (
                  <p className="basis-full text-xs text-pro-muted">
                    {language === "bn"
                      ? "এই সুবিধাটি ভবিষ্যতের আপডেটে যুক্ত হবে।"
                      : "This feature is planned for a future update."}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
