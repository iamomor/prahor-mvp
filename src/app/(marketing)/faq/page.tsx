"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, PhoneCall, ShieldAlert } from "lucide-react";

interface FaqCategory {
  category: string;
  id?: string;
  items: { q: string; a: string }[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    category: "Getting Started & Access Modes",
    items: [
      {
        q: "Do I have to create an account or log in to use PROHOR?",
        a: "No. You can explore all public maternal health educational topics, learn how the 8 modules work, review emergency danger signs, and search accessible facilities completely anonymously. You are only prompted to sign in when you choose to save private medical records or track an ongoing pregnancy timeline.",
      },
      {
        q: "Do I need to declare or prove a disability to use the accessibility options?",
        a: "Never. PROHOR completely rejects the idea of segregating users into 'disabled' and 'normal' categories. You can freely turn on High Contrast, increase text size, adjust spacing, or switch to picture-assisted AAC communication at any time from the top navigation. Your preferences are saved locally and never affect your healthcare access rights.",
      },
      {
        q: "Can I use PROHOR in both বাংলা and English?",
        a: "Yes. You can switch between বাংলা and English at any time using the language toggle in the header. Our Bengali typography uses appropriate line heights (1.7) and font fallbacks (Noto Sans Bengali) to ensure complex ligatures remain crisp and readable.",
      },
      {
        q: "Is PROHOR free for mothers in Bangladesh?",
        a: "Yes. PROHOR's public educational guidance, accessibility engine, and personal health tracking tools are 100% free of charge. We believe healthcare access and dignity are fundamental rights.",
      },
    ],
  },
  {
    category: "Medical Information & AI Safety",
    items: [
      {
        q: "Does Barta AI replace my doctor or obstetrician?",
        a: "No, absolutely not. Barta is an educational companion, not an automated clinician. It helps you understand general maternal health topics, pregnancy nutrition, and lab report terms using verified WHO and Bangladesh DGHS guidelines. It will never diagnose illnesses, prescribe medication, or alter a doctor's treatment order.",
      },
      {
        q: "How accurate is Bujhi at reading paper lab reports?",
        a: "Bujhi uses optical character recognition (OCR) to extract values from paper prescriptions and blood tests, but it never assumes 100% accuracy. Bujhi highlights uncertain fields with confidence alerts and requires the mother or a clinician to verify and confirm all numbers before they are saved into the permanent health record.",
      },
      {
        q: "What if Barta doesn't know the answer to my question?",
        a: "When evidence is ambiguous or requires hands-on clinical examination, Barta safely abstains. It will tell you clearly: 'I cannot answer this with medical certainty' and will provide recommended questions to ask your midwife or doctor during your next visit.",
      },
    ],
  },
  {
    category: "Privacy, Shared Phones & Consent",
    items: [
      {
        q: "What happens if I share a smartphone with my husband or family members?",
        a: "PROHOR is engineered specifically for shared-device households in Bangladesh. We feature discreet notifications that never display private health details or diary entries on lock screens. A single tap signs you out cleanly, and your personal emotional diary is kept strictly separate from general clinical timelines.",
      },
      {
        q: "Can family members see my private thoughts or emotional diary?",
        a: "No. In the Bondhon module, you have granular consent control. You can authorize a companion to see clinic appointment dates and ultrasound scan results while keeping your private Shusthota diary completely hidden. No supporter ever gains access to your diary without your explicit, separate permission.",
      },
      {
        q: "Can I download or delete all my healthcare records?",
        a: "Yes. You have full data sovereignty. You can export your entire pregnancy and infant history as an accessible, printable PDF or JSON file anytime. If you choose to delete your account, all your records are permanently purged from our servers.",
      },
    ],
  },
  {
    category: "Technology, PWA & Offline Readiness",
    items: [
      {
        q: "Does PROHOR work on inexpensive Android smartphones?",
        a: "Yes. PROHOR is engineered as a lightweight Progressive Web App (PWA) with a bundle size of approximately 2MB. It runs smoothly on budget smartphones and low-spec browsers with minimal data consumption.",
      },
      {
        q: "Can I use PROHOR when I don't have internet access?",
        a: "Yes, for essential offline features. Emergency hotline numbers (16263, 999), danger-sign checklists, and previously saved doctor summaries remain accessible on your device even without mobile data. Live AI queries with Barta require network access and will honestly notify you when offline.",
      },
    ],
  },
  {
    category: "Emergency Protocols & Danger Signs",
    id: "emergencies",
    items: [
      {
        q: "What are the primary maternal danger signs that require immediate hospital care?",
        a: "If you experience any of the following symptoms, DO NOT wait for online replies or app messages. Travel immediately to the nearest Upazila Health Complex or hospital:\n• Severe vaginal bleeding (soaking more than two pads in an hour)\n• Severe, continuous abdominal pain\n• High fever with chills\n• Severe headache with blurred vision or spots before your eyes\n• Convulsions or seizures\n• Sudden swelling of your face and hands\n• Noticeable cessation or reduction in baby movements in the third trimester",
      },
      {
        q: "What emergency national numbers can I call in Bangladesh?",
        a: "You can call:\n• Shasthya Batayan (স্বাস্থ্য বাতায়ন): 16263 (24/7 Government Health Hotline)\n• National Emergency Service (জাতীয় জরুরি সেবা): 999 (Ambulance, Police, Fire)\n• Women & Children Helpline (নারী ও শিশু নির্যাতন প্রতিরোধ): 109\n• Mental Health Support (জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন): 16122",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "0-0": true, // First item in first category open by default
  });

  function toggle(catIdx: number, itemIdx: number) {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col">
      {/* Editorial Header */}
      <section className="border-b border-pro-border bg-gradient-to-b from-pro-surface/40 to-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pro-control-border bg-pro-elevated px-3.5 py-1 text-xs font-bold text-pro-primary">
            <HelpCircle size={14} className="text-pro-primary" />
            <span>Questions & Answers</span>
          </div>

          <h1 className="pro-editorial text-3xl font-extrabold tracking-tight text-pro-text sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h1>

          <p className="text-base sm:text-lg text-pro-muted leading-relaxed">
            Everything you need to know about PROHOR: our universal accessibility model, evidence-grounded AI, privacy protections, and emergency protocols.
          </p>
        </div>
      </section>

      {/* Accordion Categories */}
      <section className="border-b border-pro-border bg-pro-bg py-16 md:py-24">
        <div className="pro-shell max-w-4xl space-y-16">
          {FAQ_DATA.map((cat, catIdx) => (
            <div key={cat.category} id={cat.id} className="scroll-mt-24 space-y-6">
              <div className="border-b border-pro-border pb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-pro-text sm:text-2xl">{cat.category}</h2>
                {cat.id === "emergencies" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pro-danger/10 px-3 py-1 text-xs font-bold text-pro-danger">
                    <ShieldAlert size={14} /> Immediate Action
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div
                      key={item.q}
                      className={`rounded-2xl border bg-pro-elevated overflow-hidden shadow-2xs transition-colors ${
                        cat.id === "emergencies"
                          ? "border-pro-danger/30 hover:border-pro-danger"
                          : "border-pro-border hover:border-pro-primary"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(catIdx, itemIdx)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-body-${key}`}
                        className="flex w-full min-h-14 items-center justify-between gap-4 p-5 text-left text-sm font-bold text-pro-text hover:bg-pro-surface/40 focus-visible:outline-3 focus-visible:outline-pro-focus"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-pro-primary transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div
                          id={`faq-body-${key}`}
                          className="border-t border-pro-border bg-pro-surface/20 p-5 text-xs text-pro-muted leading-relaxed whitespace-pre-line"
                        >
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Hotlines Strip */}
      <section className="bg-pro-surface/30 py-16">
        <div className="pro-shell max-w-4xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pro-danger">
            <PhoneCall size={15} />
            <span>24/7 National Emergency Contacts</span>
          </div>

          <h2 className="text-2xl font-bold text-pro-text">Need immediate clinical assistance?</h2>

          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto pt-2 text-xs">
            <div className="rounded-xl border border-pro-border bg-pro-elevated p-4">
              <span className="font-bold text-pro-text block">স্বাস্থ্য বাতায়ন</span>
              <a href="tel:16263" className="mt-1 block text-lg font-extrabold text-pro-primary hover:underline">
                16263
              </a>
              <span className="text-[0.65rem] text-pro-muted">Free Govt Health Helpline</span>
            </div>

            <div className="rounded-xl border border-pro-danger/30 bg-pro-elevated p-4">
              <span className="font-bold text-pro-text block">জরুরি সেবা</span>
              <a href="tel:999" className="mt-1 block text-lg font-extrabold text-pro-danger hover:underline">
                999
              </a>
              <span className="text-[0.65rem] text-pro-muted">Ambulance & Emergency</span>
            </div>

            <div className="rounded-xl border border-pro-border bg-pro-elevated p-4">
              <span className="font-bold text-pro-text block">নারী ও শিশু হেল্পলাইন</span>
              <a href="tel:109" className="mt-1 block text-lg font-extrabold text-pro-primary hover:underline">
                109
              </a>
              <span className="text-[0.65rem] text-pro-muted">Support & Protection</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
