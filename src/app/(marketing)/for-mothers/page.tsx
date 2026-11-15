import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Calendar,
  FileCheck,
  Lock,
  Baby,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Mothers & Families — PROHOR",
  description:
    "A compassionate, calm guide for expectant and postpartum mothers in Bangladesh. Understand your pregnancy, track vitals without pressure, and keep your records safe.",
};

const MOTHER_EXPERIENCE = [
  {
    icon: Calendar,
    title: "Pregnancy Tracking Without Anxiety",
    desc: "Track your 40 weeks with clear, calm milestone explanations. We never invent arbitrary risk scores or flood you with frightening worst-case medical scenarios.",
  },
  {
    icon: Sparkles,
    title: "Plain-Language Medical Clarification",
    desc: "Confused by medical abbreviations on your ultrasound or blood report? Ask Barta or scan with Bujhi to understand what 'Hemoglobin 11.2' means for your everyday energy.",
  },
  {
    icon: Lock,
    title: "A Safe, Confidential Space",
    desc: "Write your private thoughts, fears, and joys in Shusthota's personal diary. When you share a phone with family members, your private logs remain strictly hidden behind secure lock-screen controls.",
  },
  {
    icon: FileCheck,
    title: "Doctor Visits Made Simple",
    desc: "Prepare question lists with text or symbol AAC tiles before leaving home. Hand your doctor a clean, organized summary of your pregnancy history.",
  },
  {
    icon: Baby,
    title: "Postpartum Care That Remembers You",
    desc: "After delivery, conventional apps forget the mother. PROHOR continues tracking your physical recovery, mental wellness, and your baby's vaccination schedule side-by-side.",
  },
];

export default function ForMothersPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <Heart size={14} className="text-pro-primary" />
            <span>Built for Bangladeshi Mothers</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            A calm, dependable companion for your entire journey
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            Pregnancy and early motherhood are transformative, but they can also feel overwhelming, lonely, and full of conflicting advice. PROHOR is designed to give you clarity, privacy, and continuous support—on your own terms.
          </p>
        </div>
      </section>

      {/* The 5 Key Pillars for Mothers */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-10">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">What You Can Do</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Designed around your daily life, rest, and comfort
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {MOTHER_EXPERIENCE.map((exp) => {
              const Icon = exp.icon;
              return (
                <div
                  key={exp.title}
                  className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pro-surface text-pro-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-base text-pro-text">{exp.title}</h3>
                  <p className="text-xs text-pro-muted leading-relaxed">{exp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Shared Phone Promise */}
      <section className="border-b border-pro-border bg-pro-surface/20 py-16 md:py-20">
        <div className="pro-shell max-w-4xl">
          <div className="rounded-2xl border border-pro-border bg-pro-elevated p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pro-primary">
              <Lock size={16} />
              <span>Shared Device Privacy</span>
            </div>

            <h2 className="text-2xl font-bold text-pro-text">
              Sharing a phone with family? Your private records stay protected.
            </h2>

            <p className="text-sm text-pro-muted leading-relaxed">
              In many Bangladeshi households, phones are shared between spouses, in-laws, or siblings. PROHOR is built specifically with this reality in mind:
            </p>

            <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs">
              <div className="rounded-xl border border-pro-border bg-pro-surface/40 p-4 space-y-1.5">
                <span className="font-bold text-pro-text block">1. Discreet Alerts</span>
                <p className="text-pro-muted">Notification previews never disclose personal health details or diary snippets on lock screens.</p>
              </div>

              <div className="rounded-xl border border-pro-border bg-pro-surface/40 p-4 space-y-1.5">
                <span className="font-bold text-pro-text block">2. Rapid Sign-Out</span>
                <p className="text-pro-muted">One tap signs you out cleanly, ensuring nobody else can open your private logs.</p>
              </div>

              <div className="rounded-xl border border-pro-border bg-pro-surface/40 p-4 space-y-1.5">
                <span className="font-bold text-pro-text block">3. Separate Permissions</span>
                <p className="text-pro-muted">Grant family members access to clinic dates without ever opening your personal emotional diary.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Assurance Banner */}
      <section className="bg-pro-bg py-16">
        <div className="pro-shell max-w-4xl text-center space-y-6">
          <h2 className="text-2xl font-bold text-pro-text">Have Questions or Need Help Right Now?</h2>
          <p className="text-sm text-pro-muted max-w-xl mx-auto leading-relaxed">
            If you ever experience warning signs like heavy bleeding, severe abdominal pain, or convulsions, call <strong>16263</strong> (স্বাস্থ্য বাতায়ন) or <strong>999</strong> immediately.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/how-it-works" className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm">
              <span>See How the Journey Works</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/sign-in" className="pro-btn pro-btn-secondary !min-h-12 !px-7 font-bold text-sm">
              <span>Sign In to Your Records</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
