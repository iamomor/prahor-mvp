import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  FileText,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy, Safety & Responsible AI Charter — PROHOR",
  description:
    "Explore PROHOR's commitments to data sovereignty, medical provenance, non-diagnostic AI boundaries, human-in-the-loop verification, and shared-phone privacy protection.",
};

const PILLARS = [
  {
    icon: Lock,
    title: "1. 100% Mother-Owned Data Sovereignty",
    desc: "Your medical data belongs strictly to you. PROHOR does not sell personal health records, display commercial advertisements, or share identifying information with pharmaceutical third parties.",
    details: [
      "All medical records and diary notes are encrypted at rest and in transit.",
      "Export your full longitudinal health history anytime in accessible PDF or JSON.",
      "Permanently delete your profile and all associated data with one click.",
    ],
  },
  {
    icon: FileText,
    title: "2. Grounded Clinical AI (Zero Hallucination Tolerance)",
    desc: "Barta answers maternal questions solely through retrieval-augmented generation (RAG) mapped to clinical protocols from the World Health Organization (WHO) and Bangladesh DGHS.",
    details: [
      "Every educational answer features direct, visible source citations.",
      "When medical certainty cannot be confirmed, Barta explicitly abstains from guessing.",
      "Never generates automated diagnoses, triage classifications, or prescription dosages.",
    ],
  },
  {
    icon: UserCheck,
    title: "3. Mandatory Human-in-the-Loop Verification",
    desc: "Artificial intelligence in PROHOR never writes directly to your permanent clinical timeline. All OCR-extracted lab reports must be verified by the mother or a clinician before being saved.",
    details: [
      "Bujhi highlights low-confidence OCR text with visual review alerts.",
      "Extracted records remain in a temporary 'Pending Review' state until approved.",
      "Clear visual distinction between self-reported observations and clinician-verified facts.",
    ],
  },
  {
    icon: EyeOff,
    title: "4. Shared Phone & Household Privacy Safeguards",
    desc: "Engineered specifically for households in Bangladesh where multiple family members share a single mobile smartphone.",
    details: [
      "No health information or private diary text is ever leaked into lock-screen notification banners.",
      "Fast, prominent sign-out button on every screen for shared device environments.",
      "Disability preferences or caregiver access never grants automatic visibility into private logs.",
    ],
  },
];

export default function TrustPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <ShieldCheck size={14} className="text-pro-primary" />
            <span>Privacy & Ethical AI Constitution</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            Our uncompromised commitment to your privacy and clinical safety
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            In maternal and child healthcare, ethical boundaries are not
            optional features—they are fundamental prerequisites. Here is our
            binding constitution on data privacy, medical provenance, and
            responsible artificial intelligence.
          </p>
        </div>
      </section>

      {/* 4 Pillars of Trust */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-12">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs md:p-8 space-y-5"
              >
                <div className="flex items-center gap-3 border-b border-pro-border pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pro-surface text-pro-primary">
                    <Icon size={22} />
                  </span>
                  <h2 className="text-xl font-bold text-pro-text sm:text-2xl">
                    {pillar.title}
                  </h2>
                </div>

                <p className="text-sm text-pro-muted leading-relaxed">
                  {pillar.desc}
                </p>

                <div className="rounded-xl border border-pro-border bg-pro-surface/30 p-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-pro-primary block">
                    Enforced Protections:
                  </span>
                  <div className="space-y-1.5">
                    {pillar.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-start gap-2 text-xs text-pro-muted leading-relaxed"
                      >
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-pro-primary mt-0.5"
                        />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Medical Sources Citation & Transparency */}
      <section
        id="medical-provenance"
        className="border-b border-pro-border bg-pro-surface/20 py-16 md:py-20"
      >
        <div className="pro-shell max-w-4xl space-y-8">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">Medical Evidence Corpus</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Where Barta gets its medical knowledge
            </h2>
            <p className="text-sm text-pro-muted leading-relaxed">
              We do not train language models on unverified internet forums or
              commercial marketing blogs. Our retrieval-augmented generation
              engine maps queries strictly to these official reference
              standards:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-pro-border bg-pro-elevated p-5 space-y-2">
              <span className="font-bold text-sm text-pro-text block">
                1. WHO Antenatal Care Guidelines
              </span>
              <p className="text-pro-muted leading-relaxed">
                World Health Organization recommendations on antenatal care for
                a positive pregnancy experience, maternal nutrition, and routine
                screening protocols.
              </p>
            </div>

            <div className="rounded-xl border border-pro-border bg-pro-elevated p-5 space-y-2">
              <span className="font-bold text-sm text-pro-text block">
                2. Bangladesh DGHS Maternal Health Manuals
              </span>
              <p className="text-pro-muted leading-relaxed">
                Directorate General of Health Services (DGHS) clinical
                management guidelines for antenatal, delivery, and postpartum
                care across community clinics and upazila health complexes.
              </p>
            </div>

            <div className="rounded-xl border border-pro-border bg-pro-elevated p-5 space-y-2">
              <span className="font-bold text-sm text-pro-text block">
                3. UNICEF Maternal & Neonatal Protocols
              </span>
              <p className="text-pro-muted leading-relaxed">
                Guidelines on newborn essential care, immediate breastfeeding
                initiation, thermal protection, and infection management.
              </p>
            </div>

            <div className="rounded-xl border border-pro-border bg-pro-elevated p-5 space-y-2">
              <span className="font-bold text-sm text-pro-text block">
                4. Bangladesh National EPI Schedule
              </span>
              <p className="text-pro-muted leading-relaxed">
                Expanded Programme on Immunization (EPI) timetable for infant
                vaccinations against tuberculosis, polio, hepatitis B, measles,
                and rubella.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Diagnostic Boundary Warning */}
      <section className="bg-pro-bg py-16">
        <div className="pro-shell max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-pro-danger/10 px-4 py-1 text-xs font-bold text-pro-danger">
            <AlertTriangle size={15} />
            <span>Non-Diagnostic Boundary</span>
          </div>
          <h2 className="text-2xl font-bold text-pro-text">
            Clear Limitations Keep Mothers Safe
          </h2>
          <p className="text-xs sm:text-sm text-pro-muted max-w-2xl mx-auto leading-relaxed">
            PROHOR is an educational and organizational tool. It does not
            replace ultrasound equipment, clinical palpation, blood laboratory
            tests, or doctor consultations. Never disregard professional
            clinical advice because of something read online.
          </p>
          <div className="pt-2">
            <Link
              href="/faq"
              className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm"
            >
              <span>Read Common Questions & Answers</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
