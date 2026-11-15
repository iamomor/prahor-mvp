import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Users, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About PROHOR — Our Mission for Maternal Healthcare Equity in Bangladesh",
  description:
    "Learn about PROHOR's mission to bridge the maternal health divide in Bangladesh through universal accessibility, evidence-grounded AI, and mother-controlled care coordination.",
};

const PILLARS = [
  {
    title: "Universal Dignity",
    desc: "Every mother deserves the same high-quality maternal journey without being sorted into separate 'disabled' or 'standard' tiers.",
  },
  {
    title: "Clinical Grounding",
    desc: "AI must never guess or hallucinate when lives are at stake. All educational responses cite accredited WHO and DGHS Bangladesh protocols.",
  },
  {
    title: "Mother-Governed Privacy",
    desc: "The mother owns her health data. Being pregnant or having an access need never automatically authorizes family members or caregivers to view private records.",
  },
  {
    title: "Real Human Connection",
    desc: "Technology is a supportive bridge. It prepares mothers and midwives for more effective, empathetic in-person clinical consultations.",
  },
];

const TEAM = [
  {
    name: "Omor",
    role: "Product Lead & Shared Architecture",
    focus: "Maternal data privacy, security architecture, and system integration.",
  },
  {
    name: "Iftee",
    role: "Frontend Systems & Adapt Engine",
    focus: "Universal accessibility, design tokens, and multi-modal interaction.",
  },
  {
    name: "Ifty",
    role: "AI Architecture & Provenance",
    focus: "Barta RAG citation pipelines, Bujhi OCR verification, and clinical guardrails.",
  },
  {
    name: "Apubo",
    role: "Jibonrekha Clinical Records & UI",
    focus: "Maternal and infant longitudinal records and verification workflows.",
  },
  {
    name: "Samin",
    role: "Care Workflows & End-to-End QA",
    focus: "Shusthota wellness, Poth clinic directory, and Bondhon care coordination.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <Heart size={14} className="text-pro-primary" />
            <span>Our Origin & Purpose</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            Reimagining maternal healthcare access across Bangladesh
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            PROHOR (প্রহর) was conceived with a singular north star: to ensure that every mother in Bangladesh—regardless of literacy level, geographical location, or physical and sensory abilities—can navigate pregnancy, birth, and early childhood with autonomy, dignity, and clinical clarity.
          </p>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-8">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">The Reality in Bangladesh</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Why maternal healthcare requires systemic reimagining
            </h2>
          </div>

          <div className="pro-note space-y-3 text-sm text-pro-text leading-relaxed">
            <p>
              In Bangladesh, over <strong>one-third of all births</strong> still take place outside institutional facilities without skilled emergency obstetric backup. Even among those who seek care, only <strong>41% complete the minimum four recommended antenatal check-ups</strong>.
            </p>
            <p className="text-pro-muted">
              For mothers with disabilities—whether visual, hearing, mobility, or neurodivergent—the barrier is compounded exponentially. Clinics frequently lack physical wheelchair ramps, medical staff lack training in sign or alternative communication, and digital health tools routinely exclude assistive technology users.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-pro-primary">41%</span>
              <h3 className="font-bold text-base text-pro-text">The Antenatal Care Drop-off</h3>
              <p className="text-xs text-pro-muted leading-relaxed">
                Many mothers attend a first visit to confirm pregnancy, but drop out due to confusing medical jargon, long travel distances, or lack of support.
              </p>
            </div>

            <div className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs space-y-2">
              <span className="text-2xl font-extrabold text-pro-danger">Excluded</span>
              <h3 className="font-bold text-base text-pro-text">Mothers with Disabilities</h3>
              <p className="text-xs text-pro-muted leading-relaxed">
                Existing apps treat accessibility as an afterthought, creating stripped-down &ldquo;special modes&rdquo; that patronize users and compromise privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The PROHOR Philosophy */}
      <section className="border-b border-pro-border bg-pro-surface/20 py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-8">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">Our Principles</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Universal design: When you solve for constraints, everyone benefits
            </h2>
            <p className="text-sm text-pro-muted leading-relaxed">
              When we design for a mother holding a phone with one hand while soothing a crying newborn, we help the mother with motor tremors. When we design high-contrast text for low vision, we help the mother checking records under glaring sun at a rural bus stop.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2 text-pro-primary font-bold text-base">
                  <CheckCircle2 size={18} />
                  <span>{pillar.title}</span>
                </div>
                <p className="text-xs text-pro-muted leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Accountability */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pro-primary">
              <Users size={15} />
              <span>Engineering & Clinical Architecture</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              The team behind PROHOR
            </h2>
            <p className="text-sm text-pro-muted leading-relaxed">
              Built as an accountable, transparent collective combining medical provenance, accessible frontend engineering, and ethical AI design.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-pro-border bg-pro-elevated p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pro-surface text-pro-primary font-bold">
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-pro-text">{member.name}</h3>
                    <span className="text-[0.7rem] text-pro-primary font-semibold block">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-pro-muted leading-relaxed pt-1">
                  {member.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Call to Action */}
      <section className="bg-pro-surface/30 py-16 text-center">
        <div className="pro-shell max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-pro-text">See How It Works in Practice</h2>
          <p className="text-sm text-pro-muted">
            Explore the mother journey step-by-step, from your first visit to postpartum recovery.
          </p>
          <div className="pt-2">
            <Link href="/how-it-works" className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm">
              <span>Explore How It Works</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
