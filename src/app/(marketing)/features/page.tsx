import type { Metadata } from "next";
import Link from "next/link";
import {
  SlidersHorizontal,
  Sparkles,
  AlertOctagon,
  GitCommit,
  FileSearch,
  HeartHandshake,
  MapPin,
  Users2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Features — The 8 Modules of the PROHOR Ecosystem",
  description:
    "Explore the 8 integrated modules of PROHOR: Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, and Bondhon. Honest capabilities, real user benefits, and clinical provenance.",
};

const MODULES = [
  {
    id: "adapt",
    name: "Adapt",
    bnName: "অভিযোজন",
    status: "Working MVP Baseline",
    badgeColor: "bg-pro-primary text-pro-on-primary",
    icon: SlidersHorizontal,
    tagline: "Universal Interaction Preferences Engine",
    problem: "Most health apps offer only one static visual design and ignore users with low vision, motor tremors, or non-speaking communication needs.",
    solution: "Adapt allows any mother to choose from 3 verified themes, higher contrast, scalable typography (100% to 125%), spacious layout, and picture AAC communication—without any disability categorization or medical disclosure.",
    capabilities: [
      "Theme selector: Quiet Garden (default), Original Rose, Morning Mist.",
      "Independent higher contrast overlay (data-contrast='more') on any theme.",
      "400% browser zoom and 320px mobile reflow without horizontal scrolling.",
      "Symbol-assisted AAC communication board for visit preparation.",
      "Preserves form drafts and inputs during preference switching.",
    ],
  },
  {
    id: "barta",
    name: "Barta",
    bnName: "বার্তা",
    status: "RAG Prototype",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: Sparkles,
    tagline: "Source-Grounded Maternal Education AI",
    problem: "Generic chatbots hallucinate medical claims, invent dangerous home remedies, and create false confidence during pregnancy complications.",
    solution: "Barta operates solely via retrieval-augmented generation tied to WHO and Bangladesh DGHS clinical guidelines. Every reply includes visible citations, and Barta safely abstains when clinical certainty cannot be verified.",
    capabilities: [
      "Conversational maternal education in authentic colloquial Bangla and English.",
      "Visible clinical citations linking to official WHO and DGHS chapters.",
      "Safe refusal and emergency escalation when maternal red flags are detected.",
      "Zero autonomous diagnosis, symptom triage, or drug prescribing.",
    ],
  },
  {
    id: "shonket",
    name: "Shonket",
    bnName: "সংকেত",
    status: "Source-Linked · Clinical Review Pending",
    badgeColor: "bg-pro-danger/10 text-pro-danger",
    icon: AlertOctagon,
    tagline: "Emergency Signals & Rapid Care Escalation",
    problem: "During maternal emergencies (severe bleeding, eclamptic seizures), mothers often waste critical hours searching confusing forums or chatbots.",
    solution: "Shonket provides direct, source-linked danger-sign checklists (clinical review pending) and instant one-tap dials to national emergency services (999, 16263). It deliberately bypasses AI to ensure immediate human medical escalation.",
    capabilities: [
      "Reviewable checklist of primary obstetric danger signs in plain Bangla.",
      "Direct dialing to Shasthya Batayan (16263) and National Emergency (999).",
      "Immediate hospital preparation guidelines: what to bring, who to contact.",
      "Accessible without requiring prior account registration or login.",
    ],
  },
  {
    id: "jibonrekha",
    name: "Jibonrekha",
    bnName: "জীবনরেখা",
    status: "Core Architecture",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: GitCommit,
    tagline: "Connected Maternal & Infant Longitudinal Health Timeline",
    problem: "Paper antenatal books get easily lost or ruined during floods, disconnecting the mother's pregnancy vitals from her newborn's pediatric care.",
    solution: "Jibonrekha maintains two parallel, synchronized health passports: one for the mother's antenatal/postnatal care and one for the baby's EPI immunizations and growth milestones.",
    capabilities: [
      "Chronological timeline of all 4+ recommended ANC check-ups.",
      "Explicit provenance badges: Self-Reported vs OCR-Extracted vs Clinician-Confirmed.",
      "Integrated Bangladesh National EPI immunization calendar for infants.",
      "Accessible PDF export for portability across different clinics and upazilas.",
    ],
  },
  {
    id: "bujhi",
    name: "Bujhi",
    bnName: "বুঝি",
    status: "OCR Demonstration",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: FileSearch,
    tagline: "Accessible Diagnostic Report Comprehension",
    problem: "Bangladeshi mothers frequently receive paper lab tests packed with unintelligible medical abbreviations that cause anxiety or go ignored.",
    solution: "Bujhi extracts numerical values (hemoglobin, blood glucose, platelet count) using OCR, provides plain-language explanations, and requires the mother to verify before saving.",
    capabilities: [
      "Camera scan / image upload for paper prescription and lab reports.",
      "Confidence score indicators: flags uncertain numbers for manual confirmation.",
      "Plain-language explanation of what clinical numbers mean for daily health.",
      "Prevents unverified AI extraction from polluting permanent clinical records.",
    ],
  },
  {
    id: "shusthota",
    name: "Shusthota",
    bnName: "সুস্থতা",
    status: "Working Prototype",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: HeartHandshake,
    tagline: "Adaptive Wellness & Confidential Emotional Diary",
    problem: "Standard fitness apps impose rigid 10,000-step goals that shame mothers on bed rest or mothers with physical disabilities.",
    solution: "Shusthota reframes daily wellness around gentle rest, hydration, and emotional peace. Its private diary is strictly encrypted and is never shared with providers by default.",
    capabilities: [
      "Voluntary hydration, sleep, and physical rest check-ins without punishment.",
      "Private emotional reflection diary with zero automatic external sharing.",
      "Gentle seated breathing and relaxation exercises.",
      "Non-diagnostic emotional support with links to human counseling if needed.",
    ],
  },
  {
    id: "poth",
    name: "Poth",
    bnName: "পথ",
    status: "Directory Framework",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: MapPin,
    tagline: "Verified Healthcare Facility Directory",
    problem: "Mothers travel long distances only to discover a clinic lacks wheelchair ramps, clean washrooms, or an attending female doctor.",
    solution: "Poth catalogs healthcare facilities across Bangladesh with verified physical accessibility metadata and emergency obstetric readiness indicators.",
    capabilities: [
      "Filter clinics by district, female doctor on duty, and wheelchair ramp access.",
      "Clear distinction between community-verified data and unverified facilities.",
      "Low-bandwidth PWA offline caching of emergency addresses and phone contacts.",
      "Doctor visit preparation checklists tailored to your upcoming appointment.",
    ],
  },
  {
    id: "bondhon",
    name: "Bondhon",
    bnName: "বন্ধন",
    status: "Simulated Care Coordination",
    badgeColor: "bg-pro-surface text-pro-primary",
    icon: Users2,
    tagline: "Granular Consent & Care Circle Coordination",
    problem: "Disabled or pregnant women frequently have their autonomy stripped by family members or caregivers who take over their healthcare communications.",
    solution: "Bondhon lets a mother review a named simulated recipient, individual record fields, purpose and expiry before sharing. Private diary entries and AI conversations remain outside the sharing tool.",
    capabilities: [
      "Account-authorized simulated provider queue with request tracking.",
      "Explicit review of selected health-record fields and communication preferences.",
      "Optional accommodation requests and purpose-scoped follow-up messages.",
      "Request-bound permission expiry, revocation and recorded action history.",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <Sparkles size={14} className="text-pro-primary" />
            <span>The PROHOR Ecosystem</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            Eight connected modules for complete maternal equity
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            Every module in PROHOR is designed to solve a specific healthcare, communication, or accessibility barrier in Bangladesh. Explore their practical capabilities, real-world benefits, and transparent development statuses.
          </p>
        </div>
      </section>

      {/* Deep-Dive Grid of All 8 Modules */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-12">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                id={mod.id}
                className="scroll-mt-24 rounded-2xl border border-pro-border bg-pro-elevated p-6 shadow-xs md:p-8 space-y-6"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pro-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pro-surface text-pro-primary font-bold">
                      <Icon size={24} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-pro-text">{mod.name}</h2>
                        <span className="text-sm text-pro-muted" lang="bn">
                          {mod.bnName}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-pro-primary block">
                        {mod.tagline}
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${mod.badgeColor}`}>
                    {mod.status}
                  </span>
                </div>

                {/* Problem & Solution Strip */}
                <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
                  <div className="rounded-xl border border-pro-border bg-pro-surface/20 p-4 space-y-1">
                    <span className="font-bold text-pro-danger uppercase tracking-wider block text-[0.65rem]">
                      The Healthcare Problem
                    </span>
                    <p className="text-pro-muted">{mod.problem}</p>
                  </div>
                  <div className="rounded-xl border border-pro-border bg-pro-surface/40 p-4 space-y-1">
                    <span className="font-bold text-pro-primary uppercase tracking-wider block text-[0.65rem]">
                      The PROHOR Solution
                    </span>
                    <p className="text-pro-text">{mod.solution}</p>
                  </div>
                </div>

                {/* Capabilities Checklist */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pro-text">
                    Verified Technical Capabilities:
                  </h3>
                  <div className="space-y-2">
                    {mod.capabilities.map((cap) => (
                      <div key={cap} className="flex items-start gap-2 text-xs text-pro-muted">
                        <CheckCircle2 size={15} className="shrink-0 text-pro-primary mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Honest Capability Disclaimer */}
      <section className="bg-pro-surface/30 py-16">
        <div className="pro-shell max-w-4xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-pro-primary">
            <ShieldCheck size={16} />
            <span>Honest Engineering Policy</span>
          </div>
          <h2 className="text-2xl font-bold text-pro-text">Our Transparency Guarantee</h2>
          <p className="text-xs sm:text-sm text-pro-muted max-w-2xl mx-auto leading-relaxed">
            We explicitly label what is a working baseline, what is an AI prototype, and what is planned for Phase 2. We never fabricate clinical partnerships, diagnostic claims, or artificial accuracy statistics.
          </p>
          <div className="pt-2">
            <Link href="/trust" className="pro-btn pro-btn-primary !min-h-12 !px-7 font-bold text-sm">
              <span>Read Our Responsible AI Policy</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
