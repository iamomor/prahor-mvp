import type { Metadata } from "next";
import Link from "next/link";
import { AccessPreferencesPanel } from "@/components/accessibility/AccessPreferencesPanel";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { HealthMetricsChart } from "@/components/accessibility/HealthMetricsChart";
import { AccessibilityDemoForm } from "@/components/accessibility/AccessibilityDemoForm";
import { CheckCircle, Keyboard, Eye, Volume2, Smartphone, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility | PROHOR",
  description:
    "PROHOR is built for every mother. Learn how universal access, independent preferences, and keyboard/screen-reader support work. Adjust your preferences from this page.",
};

type Commitment = {
  icon: React.ReactNode;
  title: string;
  titleBn: string;
  body: string;
};

const COMMITMENTS: Commitment[] = [
  {
    icon: <CheckCircle size={20} aria-hidden="true" />,
    title: "No disability disclosure required",
    titleBn: "অক্ষমতা প্রকাশের কোনো বাধ্যবাধকতা নেই",
    body: "Every feature is available to every mother. Preferences change how you interact, not what care you can access.",
  },
  {
    icon: <Keyboard size={20} aria-hidden="true" />,
    title: "Full keyboard and screen-reader access",
    titleBn: "কীবোর্ড ও স্ক্রিন রিডার সহায়তা",
    body: "All tasks are keyboard-operable. PROHOR uses semantic HTML, landmark regions, correct heading hierarchy, and visible focus indicators.",
  },
  {
    icon: <Eye size={20} aria-hidden="true" />,
    title: "Independent contrast and theme",
    titleBn: "স্বাধীন কনট্রাস্ট ও থিম",
    body: "High contrast is a separate setting from colour theme. Enabling it does not change your chosen theme or any care feature.",
  },
  {
    icon: <Volume2 size={20} aria-hidden="true" />,
    title: "No automatic audio",
    titleBn: "স্বয়ংক্রিয় শব্দ নেই",
    body: "Read-aloud is opt-in. No audio plays without your explicit action. AAC-composed messages are always reviewed before being inserted.",
  },
  {
    icon: <Smartphone size={20} aria-hidden="true" />,
    title: "Responsive at every width",
    titleBn: "প্রতিটি স্ক্রিনে সুন্দরভাবে দেখা যায়",
    body: "Designed from 320px mobile to desktop. Text reflows at 400% zoom. Long Bangla labels wrap correctly.",
  },
  {
    icon: <Globe size={20} aria-hidden="true" />,
    title: "Bangla-first with English support",
    titleBn: "বাংলা প্রথমে, ইংরেজিও সমর্থিত",
    body: "Noto Sans Bengali ensures correct glyph shaping. All content works with Bangla and English. Mixed-language content uses correct lang attributes.",
  },
];

type Limitation = {
  feature: string;
  status: StatusValue;
  note: string;
};

const KNOWN_LIMITATIONS: Limitation[] = [
  {
    feature: "Read-aloud",
    status: "prototype",
    note: "Uses browser Web Speech API. Bangla TTS voice availability depends on the user's OS and browser. Full Bangla TTS is planned.",
  },
  {
    feature: "AAC picture communication",
    status: "prototype",
    note: "A visual demonstration of the composition interface. Messages are never sent automatically. Full integration into care workflows is planned.",
  },
  {
    feature: "Account preference sync",
    status: "limited",
    note: "Preferences are saved in this browser. Cross-device sync via PATCH /api/preferences is planned for the authenticated experience.",
  },
  {
    feature: "WCAG 2.2 AA",
    status: "working",
    note: "This is our target. We have not conducted a formal external audit. Known gaps are documented and being addressed.",
  },
  {
    feature: "Switch access / external AAC devices",
    status: "future",
    note: "Planned for a future release. Current semantic HTML provides a basis for compatibility testing.",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="pro-shell space-y-16 py-10 sm:py-16">

      {/* Page header */}
      <div className="space-y-3">
        <p className="pro-eyebrow" lang="en">Accessibility</p>
        <h1 className="text-4xl font-semibold text-pro-text leading-tight">
          PROHOR adapts to you —{" "}
          <span className="text-pro-primary">not the other way around.</span>
        </h1>
        <p className="max-w-prose text-lg text-pro-muted" lang="bn">
          প্রহর আপনার মতো করে ব্যবহার করুন। কোনো অক্ষমতার লেবেল ছাড়াই, সব মায়ের জন্য সব সেবা।
        </p>
      </div>

      {/* Commitments */}
      <section aria-labelledby="commitments-heading">
        <h2 id="commitments-heading" className="mb-6 text-2xl font-semibold text-pro-text">
          Our accessibility commitments
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {COMMITMENTS.map((c) => (
            <li
              key={c.title}
              className="flex flex-col gap-2 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]"
            >
              <div className="flex items-center gap-2 text-pro-primary">
                {c.icon}
                <h3 className="font-semibold text-pro-text">{c.title}</h3>
              </div>
              <p className="text-xs text-pro-muted" lang="bn">{c.titleBn}</p>
              <p className="text-sm text-pro-muted leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Live preferences panel */}
      <section aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="mb-2 text-2xl font-semibold text-pro-text">
          Adjust your preferences
        </h2>
        <p className="mb-6 max-w-prose text-pro-muted">
          Changes apply immediately and are saved in your browser. You can also access these settings from the{" "}
          <strong>&ldquo;Adjust access&rdquo;</strong> button throughout the application.
        </p>
        <div className="max-w-2xl">
          <AccessPreferencesPanel />
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading" className="mb-6 text-2xl font-semibold text-pro-text">
          Keyboard navigation
        </h2>
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]">
          <table className="w-full text-sm" aria-label="Keyboard shortcuts">
            <thead>
              <tr className="border-b border-pro-border">
                <th className="pb-2 text-left font-semibold text-pro-text">Key</th>
                <th className="pb-2 text-left font-semibold text-pro-text">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-border">
              {[
                { key: "Tab", action: "Move to next interactive element" },
                { key: "Shift + Tab", action: "Move to previous interactive element" },
                { key: "Enter / Space", action: "Activate button or link" },
                { key: "Escape", action: "Close dialog or dismiss popup" },
                { key: "Arrow keys", action: "Navigate within radio groups and tabs" },
              ].map(({ key, action }) => (
                <tr key={key}>
                  <td className="py-2 pr-6">
                    <kbd className="rounded-control border border-pro-border bg-pro-surface px-2 py-0.5 font-mono text-xs">
                      {key}
                    </kbd>
                  </td>
                  <td className="py-2 text-pro-muted">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Known limitations */}
      <section aria-labelledby="limitations-heading">
        <h2 id="limitations-heading" className="mb-2 text-2xl font-semibold text-pro-text">
          Known limitations and status
        </h2>
        <p className="mb-6 max-w-prose text-pro-muted">
          We document limitations honestly rather than claiming capabilities that have not been fully implemented or externally assessed.
        </p>
        <div className="overflow-x-auto rounded-card border border-pro-border">
          <table className="w-full text-sm" aria-label="Accessibility feature status">
            <thead className="bg-pro-surface">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-pro-text">Feature</th>
                <th className="px-4 py-3 text-left font-semibold text-pro-text">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-pro-text">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-border bg-pro-elevated">
              {KNOWN_LIMITATIONS.map(({ feature, status, note }) => (
                <tr key={feature}>
                  <td className="px-4 py-3 font-medium text-pro-text">{feature}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-pro-muted">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Working examples */}
      <section aria-labelledby="examples-heading" className="space-y-8">
        <div>
          <h2 id="examples-heading" className="mb-2 text-2xl font-semibold text-pro-text">
            Working examples
          </h2>
          <p className="max-w-prose text-pro-muted">
            The examples below show accessible patterns in action. Each demonstrates a specific access path: screen reader, low vision, keyboard-only, deaf-friendly, and tremor-friendly.
          </p>
        </div>

        {/* 1. Screen-reader-friendly form */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-4">
          <h3 className="font-semibold text-pro-text">
            1. Screen-reader-friendly form
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">স্ক্রিন রিডার-বান্ধব ফর্ম</span>
          </h3>
          <p className="text-sm text-pro-muted">
            Every field has a persistent visible label (not a placeholder). Error messages are associated via <code>aria-describedby</code> and announced with <code>role=&ldquo;alert&rdquo;</code>. Hint text is linked the same way.
          </p>
          <AccessibilityDemoForm />
        </div>

        {/* 2. Chart with table alternative */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-4">
          <h3 className="font-semibold text-pro-text">
            2. Chart with accessible table alternative
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">চার্টের টেবিল বিকল্প</span>
          </h3>
          <p className="text-sm text-pro-muted">
            Charts have <code>aria-label</code> and a &ldquo;View as table&rdquo; toggle. The table uses <code>scope</code>, a visible caption, and per-bar text values so no data is colour-only.
          </p>
          <HealthMetricsChart />
        </div>

        {/* 3. Keyboard-only task */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3">
          <h3 className="font-semibold text-pro-text">
            3. Keyboard-only task path
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">কীবোর্ড-মাত্র নেভিগেশন</span>
          </h3>
          <p className="text-sm text-pro-muted">
            Every PROHOR task is completable with keyboard alone. Try the following on this page:
          </p>
          <ol className="ml-5 list-decimal space-y-1 text-sm text-pro-muted">
            <li>Press <kbd className="rounded border border-pro-border bg-pro-surface px-1.5 py-0.5 font-mono text-xs">Tab</kbd> to reach the skip link at the top of the page and press <kbd className="rounded border border-pro-border bg-pro-surface px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to jump to the main content.</li>
            <li>Use <kbd className="rounded border border-pro-border bg-pro-surface px-1.5 py-0.5 font-mono text-xs">Tab</kbd> to reach the preference panel sliders and toggle buttons above.</li>
            <li>Use <kbd className="rounded border border-pro-border bg-pro-surface px-1.5 py-0.5 font-mono text-xs">Space</kbd> to toggle preferences.</li>
            <li>Use <kbd className="rounded border border-pro-border bg-pro-surface px-1.5 py-0.5 font-mono text-xs">Arrow keys</kbd> within radio groups (theme selector).</li>
            <li>Reach the demo form above and complete it without touching the mouse.</li>
          </ol>
          <p className="text-sm text-pro-muted">
            Visible focus outlines (<code>focus-visible</code>) are present on every interactive element. No mouse-only interaction exists.
          </p>
        </div>

        {/* 4. Low-vision configuration */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3">
          <h3 className="font-semibold text-pro-text">
            4. Low-vision configuration
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">কম দৃষ্টিশক্তি সহায়তা</span>
          </h3>
          <p className="text-sm text-pro-muted">
            Use the preference panel above or{" "}
            <Link href="/app/adapt" className="text-pro-primary underline focus-visible:outline-3 focus-visible:outline-pro-focus">
              open full settings
            </Link>{" "}
            to combine:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-pro-muted">
            <li><strong>Larger text</strong> — increases all body, label, and interface text; does not clip content.</li>
            <li><strong>High contrast</strong> — increases contrast independent of your chosen colour theme.</li>
            <li><strong>Spacious layout</strong> — increases touch target spacing and padding.</li>
            <li><strong>Relaxed text spacing</strong> — increases letter and line spacing for easier scanning.</li>
          </ul>
          <p className="text-sm text-pro-muted">
            All content reflows correctly at 200% text scale and 400% browser zoom (minimum 320 CSS px viewport).
          </p>
        </div>

        {/* 5. Deaf-friendly text path */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3">
          <h3 className="font-semibold text-pro-text">
            5. Text-first communication path
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">বধিরতা-বান্ধব পথ</span>
          </h3>
          <p className="text-sm text-pro-muted">
            No PROHOR task requires voice or audio. Every interaction path is available through text:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-pro-muted">
            <li><strong>Barta</strong> — maternal guidance is text-based. No spoken-only information exists.</li>
            <li><strong>Shonket</strong> — safety information is written, with visual urgency indicators using icon + text + colour.</li>
            <li><strong>AAC composer</strong> — compose messages from picture symbols, reviewed and confirmed before use (prototype).</li>
            <li><strong>Read-aloud</strong> — opt-in only. Never plays automatically. Its absence does not hide any information.</li>
            <li>All status and feedback is visual: text labels, icons, and status badges — never audio-only.</li>
          </ul>
        </div>

        {/* 6. Tremor-friendly layout */}
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3">
          <h3 className="font-semibold text-pro-text">
            6. Tremor-friendly and motor-accessible layout
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">কম্পন-বান্ধব নিয়ন্ত্রণ</span>
          </h3>
          <p className="text-sm text-pro-muted">
            PROHOR&apos;s design system enforces the following for all interactive controls:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-pro-muted">
            <li><strong>Minimum 44px touch target</strong> — all buttons, toggles, and links meet WCAG 2.5.8. Primary actions use 48px.</li>
            <li><strong>Adequate spacing between controls</strong> — adjacent actions are never packed tightly.</li>
            <li><strong>No drag-only task</strong> — every interaction uses tap, click, or keyboard.</li>
            <li><strong>Confirmation for consequential actions</strong> — data deletion, sharing consent, and care requests require an explicit confirm step.</li>
            <li><strong>No precision-only controls</strong> — no tiny sliders or fine-pointer gestures for critical paths.</li>
            <li><strong>Spacious layout option</strong> — increases all spacing further via the preference panel.</li>
          </ul>
          <p className="text-sm text-pro-muted">
            The preference panel above demonstrates these principles: each toggle is a full-width labeled button, with 44px minimum height and clear separation.
          </p>
        </div>
      </section>

      {/* Feedback / contact */}
      <section aria-labelledby="contact-heading" className="rounded-hero border border-pro-border bg-pro-surface px-6 py-8">
        <h2 id="contact-heading" className="mb-2 text-xl font-semibold text-pro-text">
          Accessibility feedback
        </h2>
        <p className="mb-4 max-w-prose text-pro-muted">
          If you encounter an accessibility barrier, please let us know. We are committed to addressing barriers and do not consider this an optional feature.
        </p>
        <p className="text-sm text-pro-muted" lang="bn">
          আপনি যদি কোনো অ্যাক্সেসযোগ্যতার বাধা পান, আমাদের জানান। আমরা এটিকে ঐচ্ছিক বলে বিবেচনা করি না।
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/app/adapt"
            className="pro-btn pro-btn-primary !min-h-11 !px-4 text-sm focus-visible:outline-3 focus-visible:outline-pro-focus"
          >
            Open full settings
          </Link>
          <a
            href="mailto:accessibility@prohor.health"
            className="pro-btn pro-btn-secondary !min-h-11 !px-4 text-sm focus-visible:outline-3 focus-visible:outline-pro-focus"
          >
            Email accessibility team
          </a>
          <Link
            href="/accessibility/advanced"
            className="pro-btn pro-btn-secondary !min-h-11 !px-4 text-sm focus-visible:outline-3 focus-visible:outline-pro-focus"
          >
            Advanced AT compatibility report
          </Link>
        </div>
      </section>
    </div>
  );
}
