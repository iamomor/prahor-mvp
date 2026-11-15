import type { Metadata } from "next";
import Link from "next/link";
import {
  Stethoscope,
  ClipboardList,
  ShieldCheck,
  UserCheck,
  Activity,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Healthcare Providers & Midwives — PROHOR",
  description:
    "How PROHOR supports doctors, certified midwives, and community health workers in Bangladesh through structured patient summaries, consent-verified handoffs, and ethical clinical boundaries.",
};

const CLINICAL_BENEFITS = [
  {
    icon: ClipboardList,
    title: "Structured Longitudinal Summaries",
    desc: "Stop spending valuable consultation minutes deciphering crumbled paper prescriptions or unorganized plastic folders. PROHOR presents a clean, chronological timeline of blood pressure, blood glucose, ultrasound dates, and lab trends.",
  },
  {
    icon: ShieldCheck,
    title: "Rigorous Clinical Provenance",
    desc: "Every data point in PROHOR is explicitly tagged: Self-Reported, Bujhi-Extracted, or Clinician-Confirmed. Clinicians know immediately whether a blood pressure value was entered by a patient at home or recorded by an accredited nurse.",
  },
  {
    icon: UserCheck,
    title: "Consent-Verified Care Requests",
    desc: "Care requests and referrals only arrive with explicit patient authorization. The mother selects exactly what information is shared with your clinic, complete with timestamped audit logs.",
  },
  {
    icon: Activity,
    title: "Zero Clinical AI Encroachment",
    desc: "PROHOR is strictly a comprehension and care-coordination ecosystem. It does not provide autonomous clinical diagnoses, symptom triage, or drug prescribing. You retain 100% of diagnostic and treatment authority.",
  },
];

export default function ForProvidersPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <Stethoscope size={14} className="text-pro-primary" />
            <span>Clinical Collaboration & Midwifery</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            Streamlined clinical handoffs that respect your diagnostic authority
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            In busy Upazila Health Complexes and urban maternity clinics across Bangladesh, healthcare workers face severe time constraints. PROHOR provides structured, patient-verified clinical histories to make every antenatal and postnatal consultation more effective.
          </p>
        </div>
      </section>

      {/* 4 Pillars for Providers */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-10">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">Clinical Workflow Integration</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Engineered to support clinical workflows, not replace them
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {CLINICAL_BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pro-surface text-pro-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-base text-pro-text">{item.title}</h3>
                  <p className="text-xs text-pro-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Midwife Spotlight */}
      <section className="border-b border-pro-border bg-pro-surface/20 py-16 md:py-20">
        <div className="pro-shell max-w-4xl space-y-8">
          <div className="space-y-3">
            <span className="pro-eyebrow text-xs">Grassroots Healthcare</span>
            <h2 className="text-2xl font-bold tracking-tight text-pro-text sm:text-3xl">
              Empowering Community Health Workers and Midwives in Rural Bangladesh
            </h2>
          </div>

          <div className="pro-note space-y-3 text-sm text-pro-text leading-relaxed">
            <p>
              Community health workers are the frontline heroes of Bangladesh maternal mortality reduction. During doorstep home visits, midwives can use PROHOR on low-cost Android smartphones to review a mother&apos;s recent vitals, verify tetanus toxoid vaccine status, and prepare structured referral notes when high-risk factors emerge.
            </p>
            <p className="text-pro-muted">
              Even in remote areas with intermittent mobile network connectivity, cached emergency protocols and saved visit notes ensure the consultation proceeds without disruption.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs">
            <div className="rounded-xl border border-pro-border bg-pro-elevated p-4 space-y-1">
              <span className="font-bold text-pro-primary block">Offline Protocol Access</span>
              <p className="text-pro-muted">Emergency obstetric checklists remain cached locally on the worker&apos;s phone.</p>
            </div>
            <div className="rounded-xl border border-pro-border bg-pro-elevated p-4 space-y-1">
              <span className="font-bold text-pro-primary block">EPI Vaccine Tracking</span>
              <p className="text-pro-muted">Aligns directly with the national childhood immunization schedule (BCG, Penta, MR).</p>
            </div>
            <div className="rounded-xl border border-pro-border bg-pro-elevated p-4 space-y-1">
              <span className="font-bold text-pro-primary block">Auditable Consent</span>
              <p className="text-pro-muted">Every record view is logged with patient permission, ensuring medical confidentiality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Disclaimer Callout */}
      <section className="bg-pro-bg py-16">
        <div className="pro-shell max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pro-primary">
            <ShieldCheck size={16} />
            <span>Ethical Commitment</span>
          </div>
          <h2 className="text-2xl font-bold text-pro-text">Our Ethical Guarantee to Healthcare Workers</h2>
          <p className="text-xs sm:text-sm text-pro-muted max-w-2xl mx-auto leading-relaxed">
            We will never build algorithms that claim to diagnose patients without clinical oversight. We build software that respects your professional judgment and empowers mothers to be informed, active partners in their own healthcare.
          </p>
          <div className="pt-2">
            <Link href="/trust" className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm">
              <span>Read Our Clinical AI Integrity Charter</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
