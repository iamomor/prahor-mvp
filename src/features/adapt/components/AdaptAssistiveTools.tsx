"use client";

/**
 * AdaptAssistiveTools — P1 assistive tools section for /app/adapt.
 *
 * Shows tools that are wired to the saved preferences:
 * - AACComposer when communication === "aac"
 * - ReadAloudButton when any content is present
 * - GuidedTaskShell demo when user wants to try guided mode
 * - SimplifiedText demo when simplifiedContent is enabled
 *
 * Status labels are displayed honestly per design.md §4.2.
 * None of these tools are shown by default to users who have not opted in
 * via their communication or other preferences.
 */

import { useState } from "react";
import { useAdaptPreferences } from "../hooks/useAdaptPreferences";
import { AACComposer } from "./AACComposer";
import { dispatchAacInsert } from "../lib/aac-events";
import { ReadAloudButton } from "./ReadAloudButton";
import { GuidedTaskShell, type GuidedStep } from "@/components/accessibility/GuidedTaskShell";
import { SimplifiedText } from "@/components/accessibility/SimplifiedText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  MessageSquareDot,
  Volume2,
  ListChecks,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/** Demo read-aloud text shown in Adapt page. Real modules will pass their own content. */
const DEMO_READ_ALOUD_TEXT =
  "PROHOR helps you access maternal care in Bangla and English. " +
  "Your preferences are saved privately in your browser. " +
  "No automatic audio plays without your explicit action.";

/** Demo guided task steps for the try-it section. */
const DEMO_GUIDED_STEPS: GuidedStep[] = [
  {
    id: "intro",
    title: "Welcome to guided mode",
    titleBn: "নির্দেশিত মোডে স্বাগতম",
    summary: "Guided mode breaks complex tasks into simple, one-at-a-time steps.",
    content: (
      <p className="text-sm text-pro-muted leading-relaxed">
        This demonstration shows how guided mode works. Each step presents one clear task.
        You can go back, skip optional steps, or exit at any time — your progress is saved.{" "}
        <span lang="bn">এই ডেমো দেখায় নির্দেশিত মোড কীভাবে কাজ করে।</span>
      </p>
    ),
  },
  {
    id: "preference-check",
    title: "Review your current preferences",
    titleBn: "আপনার বর্তমান পছন্দ দেখুন",
    content: (
      <p className="text-sm text-pro-muted leading-relaxed">
        Scroll up to see the preference panel. Check that your language, text size,
        and contrast settings are comfortable. Use the panel to adjust anything.{" "}
        <span lang="bn">উপরে স্ক্রল করে পছন্দ প্যানেল দেখুন।</span>
      </p>
    ),
    skippable: true,
  },
  {
    id: "communication-check",
    title: "Choose your communication preference",
    titleBn: "আপনার যোগাযোগ পছন্দ বেছে নিন",
    content: (
      <p className="text-sm text-pro-muted leading-relaxed">
        If you prefer picture-and-text symbols, enable <strong>Picture-and-text (AAC)</strong>{" "}
        in the Communication section above. The AAC composer will appear below when enabled.{" "}
        <span lang="bn">ছবি ও প্রতীক পছন্দ করলে উপরে <strong>Picture-and-text (AAC)</strong> চালু করুন।</span>
      </p>
    ),
    skippable: true,
  },
  {
    id: "done",
    title: "Your settings are saved",
    titleBn: "আপনার পছন্দ সংরক্ষিত হয়েছে",
    summary: "Preferences are saved in your browser and applied immediately on every page.",
    content: (
      <p className="text-sm text-pro-muted leading-relaxed">
        All preferences are saved automatically. They persist across pages and sessions.
        Use <strong>Restore defaults</strong> in the panel above to reset at any time.{" "}
        <span lang="bn">সব পছন্দ স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।</span>
      </p>
    ),
  },
];

/** Demo simplified/original text pair. */
const DEMO_ORIGINAL = (
  <p className="text-sm text-pro-muted leading-relaxed">
    Gestational hypertension is a condition characterised by elevated blood pressure
    (≥140/90 mmHg) developing after 20 weeks of gestation in a previously normotensive woman,
    without proteinuria or other features of preeclampsia.
  </p>
);

const DEMO_SIMPLIFIED = (
  <p className="text-sm text-pro-muted leading-relaxed" lang="bn">
    গর্ভাবস্থায় উচ্চ রক্তচাপ মানে গর্ভধারণের ২০ সপ্তাহ পরে রক্তচাপ বেড়ে যাওয়া।
    এতে সাধারণত প্রস্রাবে প্রোটিন থাকে না।
    এটি একটি পর্যবেক্ষণমূলক ব্যাখ্যা — মূল চিকিৎসা তথ্য নিচে দেখুন।
  </p>
);

type SectionProps = {
  title: string;
  titleBn: string;
  icon: React.ReactNode;
  status: "working" | "prototype" | "limited" | "future";
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function ToolSection({ title, titleBn, icon, status, defaultOpen = false, children }: SectionProps) {
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const open = userToggled ?? defaultOpen;

  return (
    <div className="rounded-card border border-pro-border bg-pro-elevated">
      <button
        type="button"
        onClick={() => setUserToggled(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-[var(--pro-pad-card)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus rounded-card text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-pro-surface text-pro-primary" aria-hidden="true">
            {icon}
          </span>
          <div>
            <p className="font-semibold text-pro-text">
              <span lang="en">{title}</span>
              <span className="ml-1 text-sm font-normal text-pro-muted" lang="bn">({titleBn})</span>
            </p>
            <StatusBadge status={status} className="mt-0.5" />
          </div>
        </div>
        {open
          ? <ChevronUp size={18} className="shrink-0 text-pro-muted" aria-hidden="true" />
          : <ChevronDown size={18} className="shrink-0 text-pro-muted" aria-hidden="true" />
        }
      </button>
      {open && (
        <div className="border-t border-pro-border px-[var(--pro-pad-card)] pb-[var(--pro-pad-card)]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

export function AdaptAssistiveTools() {
  const { prefs } = useAdaptPreferences();
  const [aacInserted, setAacInserted] = useState("");
  const [tryAacPreview, setTryAacPreview] = useState(false);

  const showAac = prefs.communication === "aac" || tryAacPreview;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-pro-text">
          Assistive tools
          <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">সহায়ক সরঞ্জাম</span>
        </h2>
        <p className="mt-1 text-sm text-pro-muted">
          These tools respond to your preferences above. All are opt-in. Status labels are accurate.
        </p>
      </div>

      {/* 1. AAC Composer */}
      <ToolSection
        title="Picture-and-text communication (AAC)"
        titleBn="ছবি ও পাঠ্য যোগাযোগ"
        icon={<MessageSquareDot size={18} />}
        status="prototype"
        defaultOpen={showAac}
      >
        {showAac ? (
          <>
            <AACComposer
              onInsert={(text) => {
                setAacInserted(text);
                dispatchAacInsert(text);
              }}
            />
            {aacInserted && (
              <div className="mt-3 rounded-field border border-pro-success-soft bg-pro-success-soft px-3 py-2 text-sm text-pro-success space-y-2">
                <p className="font-semibold">Inserted into message draft:</p>
                <p className="rounded border border-pro-border bg-pro-elevated p-2 font-mono text-xs text-pro-text" lang="bn">
                  {aacInserted}
                </p>
                <p className="text-xs text-pro-muted">
                  Draft saved in session buffer and dispatched. Nothing is sent automatically.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="/ask"
                    className="pro-btn pro-btn-secondary !min-h-9 !px-3 text-xs font-semibold"
                  >
                    Open Ask Barta with this text →
                  </a>
                  <a
                    href="/app/bondhon"
                    className="pro-btn pro-btn-secondary !min-h-9 !px-3 text-xs font-semibold"
                  >
                    Open Care Circle request →
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-pro-muted">
              To use the AAC picture composer across PROHOR, enable{" "}
              <strong>Picture-and-text (AAC)</strong> in the{" "}
              <strong>Communication preference</strong> section above.
              {" "}<span lang="bn">উপরে যোগাযোগ পছন্দে ছবি ও পাঠ্য চালু করুন।</span>
            </p>
            <button
              type="button"
              onClick={() => setTryAacPreview(true)}
              className="pro-btn pro-btn-secondary !min-h-11 !px-4 text-xs font-semibold"
            >
              Try the AAC composer here
            </button>
          </div>
        )}
      </ToolSection>

      {/* 2. Read-aloud */}
      <ToolSection
        title="Read-aloud"
        titleBn="পড়ে শোনানো"
        icon={<Volume2 size={18} />}
        status="limited"
      >
        <div className="space-y-3">
          <p className="text-sm text-pro-muted">
            Read-aloud uses your browser&apos;s built-in speech synthesis.
            It starts only when you choose Read aloud. Matching voices depend
            on your device and browser; unsupported text stays visible here.
          </p>
          <div className="rounded-field border border-pro-border bg-pro-surface p-3 text-sm text-pro-text leading-relaxed">
            {DEMO_READ_ALOUD_TEXT}
          </div>
          <ReadAloudButton
            text={DEMO_READ_ALOUD_TEXT}
            label="Read the text above"
          />
          <p className="text-xs text-pro-muted">
            Barta responses can be read aloud. Future reviewed healthcare
            content can use the same control. Bangla speech is offered only
            when this browser reports a matching voice.
          </p>
        </div>
      </ToolSection>

      {/* 3. Guided task mode */}
      <ToolSection
        title="Guided task mode"
        titleBn="নির্দেশিত কাজের মোড"
        icon={<ListChecks size={18} />}
        status="working"
      >
        <div className="space-y-3">
          <p className="text-sm text-pro-muted">
            Guided mode breaks complex tasks into one clear step at a time.
            Progress is saved automatically. You can exit, skip optional steps,
            or go back at any time. The full task remains accessible normally.
          </p>
          <GuidedTaskShell
            taskId="adapt-demo"
            taskTitle="Setting up your preferences"
            taskTitleBn="আপনার পছন্দ সেটআপ করুন"
            steps={DEMO_GUIDED_STEPS}
          />
        </div>
      </ToolSection>

      {/* 4. Simplified language demo */}
      <ToolSection
        title="Reviewed simpler wording demo"
        titleBn="সরলীকৃত ভাষার নমুনা"
        icon={<BookOpen size={18} />}
        status="limited"
      >
        <div className="space-y-3">
          <p className="text-sm text-pro-muted">
            When <strong>Reviewed simpler wording</strong> is enabled above,
            components across PROHOR can show approved plain-language alternatives.
            Below is a demonstration. Enable the preference above to see it active.
          </p>
          <div className="rounded-field border border-pro-border bg-pro-surface p-3">
            <p className="mb-2 text-xs font-semibold text-pro-muted uppercase tracking-wide">
              Example — Gestational hypertension
            </p>
            <SimplifiedText
              original={DEMO_ORIGINAL}
              simplified={DEMO_SIMPLIFIED}
              label="gestational hypertension explanation"
            />
          </div>
          <p className="text-xs text-pro-warning bg-pro-warning-soft rounded-pill inline-flex items-center gap-1 px-2 py-0.5 font-semibold">
            ⚠ Limited — simplified content requires individual human review.
            Only approved alternatives are shown. Safety information is never removed.
          </p>
        </div>
      </ToolSection>
    </div>
  );
}
