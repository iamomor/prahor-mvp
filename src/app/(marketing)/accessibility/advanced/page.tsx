import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  Keyboard,
  Mic,
  Monitor,
  Braces,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advanced Accessibility Compatibility | PROHOR",
  description:
    "Technical documentation of PROHOR's advanced assistive technology compatibility: deafblind support, Braille display, switch access, speech input, and external AAC device compatibility.",
};

type CompatRow = {
  area: string;
  feature: string;
  layer: "web-app" | "browser-semantics" | "os-at" | "hardware" | "future";
  status: "implemented" | "supported" | "dependent" | "not-tested" | "future";
  notes: string;
};

const COMPAT_TABLE: CompatRow[] = [
  // ── Deafblind / Screen reader ─────────────────────────────────────────
  {
    area: "Deafblind / Screen reader",
    feature: "Semantic HTML landmarks (header, nav, main, footer, section)",
    layer: "web-app",
    status: "implemented",
    notes: "All pages use <header>, <nav aria-label>, <main id='main-content'>, <footer>. Sections use aria-labelledby.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Logical heading hierarchy (H1→H2→H3)",
    layer: "web-app",
    status: "implemented",
    notes: "One H1 per page. Module names use H3 within section H2. No skipped levels in audited routes.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Meaningful accessible names on all interactive controls",
    layer: "web-app",
    status: "implemented",
    notes: "All buttons, links and inputs have visible labels or aria-label. Icon-only controls have aria-label. No 'click here' labels.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Predictable focus sequence",
    layer: "web-app",
    status: "implemented",
    notes: "DOM order matches visual order. Skip link at top of every page. Dialogs trap focus and return focus on close.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Text-first information — no audio-only instruction",
    layer: "web-app",
    status: "implemented",
    notes: "No task requires audio. Read-aloud is opt-in. All status and feedback is available as text.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "No image-only essential information",
    layer: "web-app",
    status: "implemented",
    notes: "All charts have text/table alternatives. Status uses icon + text + colour. Decorative images are aria-hidden.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Live region announcements for dynamic changes",
    layer: "web-app",
    status: "implemented",
    notes: "LiveRegion and InlineLiveRegion components with aria-live='polite' and role='status'. Preference changes, step progress, and error states are announced.",
  },
  {
    area: "Deafblind / Screen reader",
    feature: "Form error announced to screen reader",
    layer: "web-app",
    status: "implemented",
    notes: "AppInput and AppSelect: role='alert' on error span, aria-describedby links error to field, aria-invalid set. Error has icon + text — not colour-only.",
  },
  // ── Braille display ───────────────────────────────────────────────────
  {
    area: "Braille display",
    feature: "Semantic content exposed to screen reader Braille buffer",
    layer: "browser-semantics",
    status: "supported",
    notes: "Standard semantic HTML is consumed by screen readers (NVDA, JAWS, VoiceOver, Orca) which expose it to connected Braille displays. PROHOR does not build a custom Braille renderer.",
  },
  {
    area: "Braille display",
    feature: "Correct roles and labels in accessibility tree",
    layer: "web-app",
    status: "implemented",
    notes: "All interactive elements expose correct ARIA role, name, and state. Verified with browser DevTools accessibility tree.",
  },
  {
    area: "Braille display",
    feature: "Logical reading order for panning",
    layer: "web-app",
    status: "implemented",
    notes: "DOM order reflects visual reading order. No CSS-reordered content that would confuse Braille panning.",
  },
  {
    area: "Braille display",
    feature: "Actual Braille output on physical display",
    layer: "hardware",
    status: "not-tested",
    notes: "NOT TESTED. Actual Braille output depends on the screen reader (NVDA+LibLouis, JAWS, VoiceOver) and the connected Braille hardware. Physical device testing has not been conducted. Semantic foundation is in place.",
  },
  // ── Switch access ─────────────────────────────────────────────────────
  {
    area: "Switch access",
    feature: "Every interactive control is keyboard reachable",
    layer: "web-app",
    status: "implemented",
    notes: "Confirmed: no div-only clickable, no hover-only controls. All buttons, links, inputs are Tab-reachable. Skip link bypasses nav. Modal focus trap works.",
  },
  {
    area: "Switch access",
    feature: "Predictable focus order",
    layer: "web-app",
    status: "implemented",
    notes: "DOM-order focus. tabIndex={-1} used only for programmatic focus management (dialog, guided task heading). tabIndex > 0 not used.",
  },
  {
    area: "Switch access",
    feature: "Standard activation: Enter / Space",
    layer: "web-app",
    status: "implemented",
    notes: "All interactive elements use native <button>, <a>, <input>, <select>. No custom key-capture except Escape to close dialogs (standard pattern).",
  },
  {
    area: "Switch access",
    feature: "No drag-only functionality",
    layer: "web-app",
    status: "implemented",
    notes: "Codebase audit confirms no draggable, ondrag, or drag-based interaction patterns. All AAC phrase ordering uses remove + re-add.",
  },
  {
    area: "Switch access",
    feature: "No hover-only functionality",
    layer: "web-app",
    status: "implemented",
    notes: "Theme swatches in HomepageCare have both aria-label (accessible name) and title (redundant, not harmful). All interactive affordances are keyboard/touch accessible.",
  },
  {
    area: "Switch access",
    feature: "Visible focus indicator",
    layer: "web-app",
    status: "implemented",
    notes: "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus applied to all interactive elements. High contrast mode uses system Highlight colour.",
  },
  {
    area: "Switch access",
    feature: "Physical switch hardware scanning",
    layer: "hardware",
    status: "not-tested",
    notes: "NOT TESTED. External switch devices (single-switch, two-switch, joystick) work through the OS accessibility layer. Standard keyboard-reachable interface is the prerequisite — implemented. Hardware scanning has not been tested.",
  },
  // ── Speech input ──────────────────────────────────────────────────────
  {
    area: "Speech input",
    feature: "Meaningful accessible names match visible labels",
    layer: "web-app",
    status: "implemented",
    notes: "Voice control tools (Dragon, iOS Voice Control, Windows Voice Access) match spoken commands to visible button text or aria-label. All controls audited: no ambiguous or duplicate accessible names within the same view.",
  },
  {
    area: "Speech input",
    feature: "No duplicate ambiguous button labels",
    layer: "web-app",
    status: "implemented",
    notes: "Codebase audit found no instances of multiple unlabelled 'Go', 'Submit', 'OK' buttons on the same page. Each control has a unique, descriptive accessible name.",
  },
  {
    area: "Speech input",
    feature: "Confirmation for consequential actions",
    layer: "web-app",
    status: "implemented",
    notes: "Care request sharing and preference resets require an explicit confirm step. AAC insert requires explicit button press. Nothing is sent on first voice command.",
  },
  {
    area: "Speech input",
    feature: "Voice remains optional — no mandatory microphone permission",
    layer: "web-app",
    status: "implemented",
    notes: "PROHOR never requests microphone access. Voice input is an OS/AT layer capability; the application has no dependency on it.",
  },
  {
    area: "Speech input",
    feature: "Voice control software testing (Dragon, Voice Control)",
    layer: "os-at",
    status: "not-tested",
    notes: "NOT TESTED with actual voice control software. Standard accessible name implementation is the prerequisite — in place. Testing with Dragon NaturallySpeaking, iOS Voice Control, or Windows Voice Access has not been conducted.",
  },
  // ── External AAC devices ──────────────────────────────────────────────
  {
    area: "External AAC devices",
    feature: "Standard text field input compatible with AAC device output",
    layer: "web-app",
    status: "implemented",
    notes: "All text inputs are native <input type='text'> or <textarea>. External AAC devices that output keyboard events (most modern AAC devices) can type into these fields without special integration.",
  },
  {
    area: "External AAC devices",
    feature: "Keyboard navigation compatible with AAC device scanning",
    layer: "web-app",
    status: "implemented",
    notes: "Full keyboard navigation implemented. AAC devices that use Tab-based scanning or arrow key scanning will reach all interactive controls.",
  },
  {
    area: "External AAC devices",
    feature: "Predictable page structure for AAC device word prediction",
    layer: "web-app",
    status: "implemented",
    notes: "Consistent page structure, stable headings, and logical reading order reduce the need for navigation scanning.",
  },
  {
    area: "External AAC devices",
    feature: "Physical AAC device compatibility testing",
    layer: "hardware",
    status: "not-tested",
    notes: "NOT TESTED. Universal AAC device compatibility cannot be claimed without physical device testing. Each AAC device has its own access method (switch, eye gaze, touch, Bluetooth keyboard emulation). The standard keyboard-accessible interface is the prerequisite — implemented.",
  },
  // ── Future ────────────────────────────────────────────────────────────
  {
    area: "Future",
    feature: "Eye-gaze control compatibility",
    layer: "future",
    status: "future",
    notes: "Eye-gaze controllers that emulate pointer/keyboard input will work with current keyboard-accessible interface. Dedicated eye-gaze optimisation (larger targets, dwell time) is planned.",
  },
  {
    area: "Future",
    feature: "Dedicated switch access scanning mode",
    layer: "future",
    status: "future",
    notes: "Current keyboard navigation supports switch scanning. A dedicated scanning focus management mode (with configurable scan rate and visual scan highlight) is a future enhancement.",
  },
  {
    area: "Future",
    feature: "Formal WCAG 2.2 AA external audit",
    layer: "future",
    status: "future",
    notes: "Target is WCAG 2.2 AA. No formal external accessibility audit has been conducted. Known gaps are documented. Engaging a qualified accessibility auditor is a pre-launch requirement.",
  },
];

const STATUS_CONFIG = {
  implemented: {
    label: "Implemented",
    icon: CheckCircle2,
    cls: "bg-pro-success-soft text-pro-success",
  },
  supported: {
    label: "Supported by semantics",
    icon: CheckCircle2,
    cls: "bg-pro-info-soft text-pro-info",
  },
  dependent: {
    label: "AT-dependent",
    icon: Info,
    cls: "bg-pro-info-soft text-pro-info",
  },
  "not-tested": {
    label: "Not tested",
    icon: AlertTriangle,
    cls: "bg-pro-warning-soft text-pro-warning",
  },
  future: {
    label: "Future",
    icon: Clock,
    cls: "bg-pro-surface text-pro-muted",
  },
};

const AREA_ICONS: Record<string, typeof Keyboard> = {
  "Deafblind / Screen reader": Monitor,
  "Braille display": Braces,
  "Switch access": Keyboard,
  "Speech input": Mic,
  "External AAC devices": Keyboard,
  Future: Clock,
};

const AREAS = [...new Set(COMPAT_TABLE.map((r) => r.area))];

export default function AdvancedCompatibilityPage() {
  return (
    <div className="pro-shell space-y-16 py-10 sm:py-16">
      {/* Page header */}
      <div className="space-y-3">
        <p className="pro-eyebrow">Phase 3 — Advanced AT Compatibility</p>
        <h1 className="text-4xl font-semibold text-pro-text leading-tight">
          Advanced assistive technology compatibility
        </h1>
        <p className="max-w-prose text-lg text-pro-muted">
          This page documents PROHOR&apos;s compatibility with advanced assistive technologies — honestly
          separated by what is implemented in the web application, what depends on the browser or
          operating system, what requires physical hardware testing, and what is planned for the future.
        </p>
        <p className="max-w-prose text-sm text-pro-muted" lang="bn">
          এই পাতায় উন্নত সহায়ক প্রযুক্তির সাথে প্রহরের সামঞ্জস্য সততার সাথে নথিভুক্ত করা হয়েছে।
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-card border border-pro-warning-soft bg-pro-warning-soft px-5 py-4 space-y-2">
        <div className="flex items-center gap-2 text-pro-warning">
          <AlertTriangle size={18} aria-hidden="true" />
          <p className="font-semibold text-sm">Important — what this page does and does not claim</p>
        </div>
        <ul className="ml-6 list-disc space-y-1 text-sm text-pro-warning">
          <li>Items marked <strong>Not tested</strong> have not been verified with physical hardware or AT software. The semantic foundation is in place, but actual compatibility is unknown.</li>
          <li>Items marked <strong>Implemented</strong> describe web-layer code that is in place and verifiable via browser DevTools and keyboard testing.</li>
          <li>Items marked <strong>Supported by semantics</strong> describe standard HTML/ARIA patterns that the AT ecosystem reads — actual output depends on the AT software and version.</li>
          <li>No external formal WCAG audit has been conducted. WCAG 2.2 AA is the target.</li>
        </ul>
      </div>

      {/* Layer legend */}
      <section aria-labelledby="legend-heading">
        <h2 id="legend-heading" className="mb-4 text-2xl font-semibold text-pro-text">
          Compatibility layers
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Implemented in web app", desc: "Code present in this repository. Verifiable via browser and keyboard testing." },
            { label: "Supported through browser semantics", desc: "Standard HTML/ARIA that the AT ecosystem consumes. Output depends on AT software." },
            { label: "OS / AT-dependent", desc: "Requires specific screen reader, voice control, or OS accessibility feature. Not controlled by PROHOR." },
            { label: "Physical hardware testing required", desc: "Cannot be verified without the specific physical device. Marked NOT TESTED." },
            { label: "Future development", desc: "Planned enhancement. Not yet implemented." },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-card border border-pro-border bg-pro-elevated p-4 space-y-1">
              <dt className="text-sm font-semibold text-pro-text">{label}</dt>
              <dd className="text-xs text-pro-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Compatibility table by area */}
      {AREAS.map((area) => {
        const rows = COMPAT_TABLE.filter((r) => r.area === area);
        const AreaIcon = AREA_ICONS[area] ?? Monitor;
        return (
          <section key={area} aria-labelledby={`area-${area.replace(/\W+/g, "-")}`}>
            <div className="mb-4 flex items-center gap-3">
              <AreaIcon size={22} className="text-pro-primary" aria-hidden="true" />
              <h2
                id={`area-${area.replace(/\W+/g, "-")}`}
                className="text-2xl font-semibold text-pro-text"
              >
                {area}
              </h2>
            </div>
            <div className="overflow-x-auto rounded-card border border-pro-border">
              <table className="w-full text-sm" aria-label={`${area} compatibility`}>
                <caption className="sr-only">{area} compatibility — PROHOR advanced AT</caption>
                <thead className="bg-pro-surface">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text w-2/5">
                      Feature
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text w-1/5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pro-border bg-pro-elevated">
                  {rows.map((row) => {
                    const cfg = STATUS_CONFIG[row.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={row.feature}>
                        <td className="px-4 py-3 font-medium text-pro-text align-top">
                          {row.feature}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}
                            aria-label={`Status: ${cfg.label}`}
                          >
                            <Icon size={11} aria-hidden="true" className="shrink-0" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-pro-muted text-xs align-top leading-relaxed">
                          {row.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* What was fixed in Phase 3 */}
      <section aria-labelledby="changes-heading">
        <h2 id="changes-heading" className="mb-4 text-2xl font-semibold text-pro-text">
          Phase 3 web-layer improvements
        </h2>
        <div className="rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)] space-y-3">
          <p className="text-sm text-pro-muted">
            The following targeted fixes were made to the PROHOR web layer during Phase 3.
            These improve AT compatibility without claiming unsupported hardware integration.
          </p>
          <ul className="ml-5 list-disc space-y-2 text-sm text-pro-muted">
            <li>
              <strong>AppSelect error state</strong> — added <code>AlertCircle</code> icon to error span,
              matching the fix applied to <code>AppInput</code> in Phase 1. Error is now icon + text + colour,
              never colour-alone (WCAG 1.4.1). Added AT compatibility comment to component documentation.
            </li>
            <li>
              <strong>No drag-only interactions confirmed</strong> — full codebase audit. Zero instances of{" "}
              <code>draggable</code>, <code>onDrag</code>, or mouse-down-only interactions found.
            </li>
            <li>
              <strong>No hover-only affordances confirmed</strong> — all interactive affordances are
              keyboard/touch accessible. <code>title</code> attributes are redundant (backed by{" "}
              <code>aria-label</code>) on the one swatch button where both appear.
            </li>
            <li>
              <strong>No duplicate ambiguous button labels confirmed</strong> — all button accessible
              names within any single view are unique and descriptive.
            </li>
            <li>
              <strong>Speech input compatibility confirmed</strong> — visible label text matches
              accessible name throughout. No controls require knowledge of a hidden <code>aria-label</code>{" "}
              to discover via voice.
            </li>
          </ul>
        </div>
      </section>

      {/* Testing requirements */}
      <section aria-labelledby="testing-heading">
        <h2 id="testing-heading" className="mb-4 text-2xl font-semibold text-pro-text">
          Hardware and AT testing requirements
        </h2>
        <p className="mb-4 max-w-prose text-pro-muted">
          The following testing has not been conducted and must be completed before claiming compatibility.
          The semantic foundation is in place; validation requires the actual device or software.
        </p>
        <div className="overflow-x-auto rounded-card border border-pro-border">
          <table className="w-full text-sm" aria-label="Required hardware and AT tests">
            <thead className="bg-pro-surface">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">Test</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">Required hardware / software</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-pro-text">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-border bg-pro-elevated">
              {[
                {
                  test: "Braille display output — full content",
                  hw: "Refreshabraille / Focus / BrailleNote + NVDA or JAWS or VoiceOver",
                  status: "Not tested",
                },
                {
                  test: "Single-switch scanning navigation",
                  hw: "Any USB/Bluetooth single-switch + OS switch control (iOS, Android, macOS, Windows)",
                  status: "Not tested",
                },
                {
                  test: "Two-switch scanning navigation",
                  hw: "Two-switch setup + OS switch control",
                  status: "Not tested",
                },
                {
                  test: "Eye-gaze pointer input",
                  hw: "Tobii or similar eye-gaze device + Windows Eye Control or Tobii software",
                  status: "Not tested",
                },
                {
                  test: "Dragon NaturallySpeaking voice navigation",
                  hw: "Dragon Professional / Dragon Home — Windows",
                  status: "Not tested",
                },
                {
                  test: "iOS Voice Control",
                  hw: "iPhone / iPad running iOS 13+",
                  status: "Not tested",
                },
                {
                  test: "Windows Voice Access",
                  hw: "Windows 11 build 22H2+",
                  status: "Not tested",
                },
                {
                  test: "External AAC device keyboard emulation",
                  hw: "Tobii Dynavox / PRC-Saltillo / Grid 3 device",
                  status: "Not tested",
                },
                {
                  test: "NVDA + Firefox — full page read",
                  hw: "NVDA 2024.x + Firefox latest — Windows",
                  status: "Not tested",
                },
                {
                  test: "JAWS — full page read",
                  hw: "JAWS 2024 + Chrome/Edge — Windows",
                  status: "Not tested",
                },
                {
                  test: "VoiceOver iOS — touch navigation",
                  hw: "iPhone running iOS 17+",
                  status: "Not tested",
                },
                {
                  test: "TalkBack — Android touch navigation",
                  hw: "Android device running TalkBack 14+",
                  status: "Not tested",
                },
                {
                  test: "Formal WCAG 2.2 AA external audit",
                  hw: "Qualified accessibility auditor",
                  status: "Not conducted",
                },
              ].map(({ test, hw, status }) => (
                <tr key={test}>
                  <td className="px-4 py-3 font-medium text-pro-text align-top">{test}</td>
                  <td className="px-4 py-3 text-pro-muted align-top text-xs">{hw}</td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center gap-1 rounded-pill bg-pro-warning-soft px-2 py-0.5 text-xs font-semibold text-pro-warning">
                      <AlertTriangle size={11} aria-hidden="true" />
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Back link */}
      <div>
        <Link
          href="/accessibility"
          className="inline-flex items-center gap-1.5 text-sm text-pro-primary underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
        >
          ← Back to accessibility overview
        </Link>
      </div>
    </div>
  );
}
