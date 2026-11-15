import type { Metadata } from "next";
import Link from "next/link";
import {
  SlidersHorizontal,
  Sparkles,
  FileCheck2,
  Users2,
  Baby,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How PROHOR Works — The Complete Mother Care Journey",
  description:
    "Discover how PROHOR guides expectant mothers from first curiosity to postpartum infant care through multi-modal interaction, grounded AI, and consent-driven human support.",
};

const PHASES = [
  {
    phase: "Step 1",
    title: "Arrive, Set Comfort & Explore Public Guidance",
    tag: "Instant Access &bull; No Login Required",
    icon: SlidersHorizontal,
    desc: "Open PROHOR on any smartphone, tablet, or browser. Before signing up or disclosing personal details, adjust your reading comfort.",
    points: [
      "Switch between বাংলা and English with natural typographic line heights.",
      "Select Quiet Garden, Original Rose, or Morning Mist themes, or turn on High Contrast.",
      "Enable large typography, spacious touch targets, or picture-assisted AAC communication.",
      "Explore public maternal health topics and danger signs without creating an account.",
    ],
  },
  {
    phase: "Step 2",
    title: "Ask Questions & Learn with Grounded AI",
    tag: "Barta RAG &bull; Medical Provenance",
    icon: Sparkles,
    desc: "Pregnancy brings hundreds of questions about diet, physical symptoms, medications, and baby development. Barta provides calm, verified answers.",
    points: [
      "Ask in everyday conversational Bangla (e.g., 'ডাবের পানি কি প্রেগন্যান্সিতে খাওয়া ভালো?') or English.",
      "Responses cite authorized clinical protocols from WHO and Bangladesh DGHS.",
      "Clear uncertainty notifications: when questions require physical exam, Barta directs you to a doctor.",
      "Red-flag detection immediately surfaces 16263 and 999 emergency hotlines.",
    ],
  },
  {
    phase: "Step 3",
    title: "Digitize Reports & Maintain Connected Records",
    tag: "Bujhi OCR &bull; Jibonrekha Timeline",
    icon: FileCheck2,
    desc: "When you attend clinic visits, take photos of physical prescriptions, ultrasound scans, and blood reports.",
    points: [
      "Bujhi performs optical character recognition (OCR) and highlights key indicators (Hb, BP, Blood Sugar).",
      "Mandatory human-in-the-loop review: you verify extracted numbers before saving.",
      "Records are filed into your Jibonrekha maternal passport with clear provenance tags.",
      "Differentiates self-entered observations from clinician-confirmed test results.",
    ],
  },
  {
    phase: "Step 4",
    title: "Coordinate with Family & Accredited Care Providers",
    tag: "Bondhon Circle &bull; Poth Directory",
    icon: Users2,
    desc: "Healthcare is a collaborative human endeavor. Coordinate visits with trusted supporters while preserving full privacy.",
    points: [
      "Authorize family companions to see clinic dates and ultrasound images while keeping your private diary hidden.",
      "Find clinics in Poth with verified wheelchair ramp, accessible washroom, and female doctor availability.",
      "Generate clean, doctor-ready visit summaries to hand directly to your midwife or obstetrician.",
      "One-click revocation: instantly revoke a companion's access whenever you choose.",
    ],
  },
  {
    phase: "Step 5",
    title: "Seamless Transition to Postpartum & Infant Care",
    tag: "Dual Passports &bull; EPI Vaccine Tracker",
    icon: Baby,
    desc: "Childbirth is not the end of the journey. PROHOR continues supporting the mother's healing and the baby's growth.",
    points: [
      "Maternal mental wellness check-ins, pelvic healing tracking, and lactation guidance.",
      "Separate baby health passport tracking Bangladesh National EPI vaccination schedules.",
      "WHO growth percentile tracking (weight, height, head circumference).",
      "Complete lifetime medical export in accessible PDF format.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <SlidersHorizontal size={14} className="text-pro-primary" />
            <span>End-to-End Walkthrough</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            How PROHOR guides your maternal care journey
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            From the moment you first explore public health guidance to postpartum recovery with your newborn, here is exactly how PROHOR adapts to your life, protects your privacy, and coordinates with real healthcare providers.
          </p>
        </div>
      </section>

      {/* 5-Step Deep-Dive Journey */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-12">
          {PHASES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.phase}
                className="relative rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs md:p-8 space-y-6"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pro-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pro-surface text-pro-primary font-bold">
                      <Icon size={22} />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-pro-primary font-mono">
                        {item.phase}
                      </span>
                      <h2 className="text-xl font-bold text-pro-text sm:text-2xl">{item.title}</h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-pro-surface px-3 py-1 text-xs font-semibold text-pro-primary">
                    {item.tag}
                  </span>
                </div>

                <p className="text-sm text-pro-muted leading-relaxed">{item.desc}</p>

                {/* Bullet details */}
                <div className="rounded-xl border border-pro-border bg-pro-surface/30 p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-pro-text block">
                    Key Platform Mechanics:
                  </span>
                  <div className="space-y-2">
                    {item.points.map((pt) => (
                      <div key={pt} className="flex items-start gap-2.5 text-xs text-pro-muted leading-relaxed">
                        <CheckCircle2 size={16} className="shrink-0 text-pro-primary mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clinical Provenance & Safeguard Banner */}
      <section className="border-b border-pro-border bg-pro-surface/30 py-16">
        <div className="pro-shell max-w-4xl">
          <div className="rounded-2xl border border-pro-border bg-pro-elevated p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-pro-primary font-bold text-sm">
                <ShieldCheck size={18} />
                <span>Our AI Safety Standard</span>
              </div>
              <h3 className="text-lg font-bold text-pro-text">Curious about our clinical AI guardrails?</h3>
              <p className="text-xs text-pro-muted leading-relaxed">
                Learn how Barta grounds its advice in WHO and DGHS medical protocols, and how Bujhi requires mother confirmation before archiving any lab values.
              </p>
            </div>
            <Link href="/trust" className="pro-btn pro-btn-primary shrink-0 text-xs font-bold !min-h-11">
              <span>Read Trust & AI Charter</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Next Step Callout */}
      <section className="bg-pro-bg py-16 text-center">
        <div className="pro-shell max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-pro-text">Ready to Explore the Eight Modules?</h2>
          <p className="text-sm text-pro-muted">
            See how Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, and Bondhon work together.
          </p>
          <div className="pt-2">
            <Link href="/features" className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm">
              <span>Explore Features</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
