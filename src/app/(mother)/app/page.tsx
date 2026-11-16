import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  HeartPulse,
  FileText,
  MapPinned,
  Activity,
  Users,
  ShieldAlert,
  Settings2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "My Care | PROHOR",
  description:
    "Your connected maternal and child care dashboard. Access health records, Barta AI, safety guides, and your care circle.",
};

type ModuleCard = {
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  href: string;
  icon: React.ReactNode;
  status: "working" | "prototype" | "limited" | "future";
};

const PRIMARY_MODULES: ModuleCard[] = [
  {
    name: "Ask Barta",
    nameBn: "বার্তাকে জিজ্ঞেস করুন",
    description: "Evidence-grounded maternal guidance in Bangla and English.",
    descriptionBn: "বাংলা ও ইংরেজিতে নির্ভরযোগ্য মাতৃত্ব বিষয়ক পরামর্শ।",
    href: "/ask",
    icon: <MessageCircle size={22} aria-hidden="true" />,
    status: "prototype",
  },
  {
    name: "Health Records",
    nameBn: "স্বাস্থ্য রেকর্ড (জীবনরেখা)",
    description: "Your maternal and baby health timeline in one place.",
    descriptionBn: "মা ও শিশুর স্বাস্থ্যতথ্য এক জায়গায়।",
    href: "/app/jibonrekha",
    icon: <HeartPulse size={22} aria-hidden="true" />,
    status: "limited",
  },
  {
    name: "Understand Reports",
    nameBn: "রিপোর্ট বুঝুন (বুঝি)",
    description: "Scan lab reports and understand results in plain language.",
    descriptionBn: "রিপোর্টের ছবি তুলুন, সহজ ভাষায় বুঝুন।",
    href: "/app/bujhi",
    icon: <FileText size={22} aria-hidden="true" />,
    status: "prototype",
  },
  {
    name: "Safety & Help",
    nameBn: "নিরাপত্তা ও সহায়তা (সংকেত)",
    description: "Reviewed danger signs and direct human care access.",
    descriptionBn: "বিপদ সংকেত ও সরাসরি স্বাস্থ্যকর্মীর সহায়তা।",
    href: "/app/shonket",
    icon: <ShieldAlert size={22} aria-hidden="true" />,
    status: "limited",
  },
];

const SECONDARY_MODULES: ModuleCard[] = [
  {
    name: "Wellness",
    nameBn: "সুস্থতা",
    description: "Optional activity, rest and private emotional diary.",
    descriptionBn: "ঐচ্ছিক কার্যক্রম, বিশ্রাম ও ব্যক্তিগত ডায়েরি।",
    href: "/app/shusthota",
    icon: <Activity size={22} aria-hidden="true" />,
    status: "prototype",
  },
  {
    name: "Find Care",
    nameBn: "স্বাস্থ্যকেন্দ্র খুঁজুন (পথ)",
    description: "Verified accessible clinic and facility directory.",
    descriptionBn: "যাচাইকৃত সুবিধাসম্পন্ন স্বাস্থ্যকেন্দ্রের তালিকা।",
    href: "/find-care",
    icon: <MapPinned size={22} aria-hidden="true" />,
    status: "limited",
  },
  {
    name: "Care Circle",
    nameBn: "সহায়তা বৃত্ত (বন্ধন)",
    description: "Consent-controlled sharing with supporters and providers.",
    descriptionBn: "আপনার সম্মতিতে পরিবার ও স্বাস্থ্যকর্মীর সাথে তথ্য ভাগ।",
    href: "/app/bondhon",
    icon: <Users size={22} aria-hidden="true" />,
    status: "limited",
  },
  {
    name: "Access Settings",
    nameBn: "ব্যবহার সুবিধা (অভিযোজন)",
    description: "Theme, text size, contrast, motion and communication preferences.",
    descriptionBn: "থিম, লেখার আকার, কনট্রাস্ট ও যোগাযোগের পছন্দ।",
    href: "/app/adapt",
    icon: <Settings2 size={22} aria-hidden="true" />,
    status: "working",
  },
];

function ModuleCard({ mod }: { mod: ModuleCard }) {
  return (
    <Link
      href={mod.href}
      aria-label={`${mod.name} — ${mod.nameBn} — Status: ${mod.status}`}
      className={[
        "group flex flex-col gap-3 rounded-card border border-pro-border bg-pro-elevated",
        "p-[var(--pro-pad-card)] transition-all hover:border-pro-primary hover:bg-pro-surface",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-pro-surface text-pro-primary group-hover:bg-pro-primary group-hover:text-pro-on-primary transition-colors">
          {mod.icon}
        </div>
        <StatusBadge status={mod.status} />
      </div>
      <div>
        {/* <a> has transparent content model (HTML5 §4.5.1) so <h2> inside
            <Link> (which renders as <a>) is valid. Module names as h3 headings
            give screen readers a navigable document outline within the
            section <h2> landmarks above. */}
        <h3 className="font-semibold text-pro-text">
          <span lang="en">{mod.name}</span>
        </h3>
        <p className="mt-0.5 text-xs text-pro-muted" lang="bn">
          {mod.nameBn}
        </p>
        <p className="mt-1.5 text-sm text-pro-muted leading-relaxed">{mod.description}</p>
      </div>
    </Link>
  );
}

export default function MotherDashboard() {
  return (
    <div className="pro-shell space-y-10 py-8 sm:py-12">
      {/* Page header */}
      <div className="space-y-1">
        <p className="pro-eyebrow">Your care dashboard</p>
        <h1 className="text-3xl font-semibold text-pro-text">
          Welcome to PROHOR
          <span className="ml-2 text-xl font-normal text-pro-muted" lang="bn">প্রহরে স্বাগত</span>
        </h1>
        <p className="max-w-prose text-pro-muted">
          All eight modules are accessible below. Status badges show which features are working, in prototype, or coming soon.
        </p>
      </div>

      {/* Primary care tasks */}
      <section aria-labelledby="primary-heading">
        <h2 id="primary-heading" className="mb-4 text-lg font-semibold text-pro-text">
          Care tasks
          <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">স্বাস্থ্যসেবার কাজ</span>
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2" role="list">
          {PRIMARY_MODULES.map((mod) => (
            <li key={mod.href}>
              <ModuleCard mod={mod} />
            </li>
          ))}
        </ul>
      </section>

      {/* Secondary modules */}
      <section aria-labelledby="secondary-heading">
        <h2 id="secondary-heading" className="mb-4 text-lg font-semibold text-pro-text">
          Wellness, navigation & settings
          <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">সুস্থতা, নেভিগেশন ও পছন্দ</span>
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {SECONDARY_MODULES.map((mod) => (
            <li key={mod.href}>
              <ModuleCard mod={mod} />
            </li>
          ))}
        </ul>
      </section>

      {/* Demo notice */}
      <div className="rounded-card border border-pro-info-soft bg-pro-info-soft px-4 py-3">
        <p className="text-sm text-pro-info">
          <strong>Hackathon MVP:</strong> All demo data is synthetic. Status badges indicate working vs prototype functionality accurately.
          No real health data is stored.
          <span className="ml-1" lang="bn">সব ডেমো তথ্য কাল্পনিক। আসল স্বাস্থ্যতথ্য সংরক্ষিত হচ্ছে না।</span>
        </p>
      </div>
    </div>
  );
}
