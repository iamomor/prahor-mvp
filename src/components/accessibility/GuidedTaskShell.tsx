"use client";

/**
 * GuidedTaskShell — optional step-by-step guided task mode.
 *
 * Requirements (Phase 2 P1):
 * - One clear task per step.
 * - Progress indicator (step N of M).
 * - Previous / Next / Skip navigation.
 * - Save and resume via localStorage (by taskId).
 * - Clear completion state.
 * - Exit control — user can leave at any time.
 * - Keyboard accessible (focus managed on step change).
 * - The original full task always remains accessible.
 * - No lock-in: exit at any step without data loss.
 *
 * Status: Working — step navigation, save/resume, keyboard nav, SR announcements.
 * Persistence: localStorage keyed by taskId.
 *
 * Usage:
 *   const steps: GuidedStep[] = [
 *     { id: "step-1", title: "Step 1", titleBn: "ধাপ ১", content: <p>...</p> },
 *     { id: "step-2", title: "Step 2", titleBn: "ধাপ ২", content: <p>...</p>, skippable: true },
 *   ];
 *   <GuidedTaskShell taskId="health-check" taskTitle="Health Check" steps={steps} />
 */

import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  X,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import { AppButton } from "@/components/ui/AppButton";
import type { ReactNode } from "react";

export type GuidedStep = {
  /** Unique identifier for this step — used for save/resume. */
  id: string;
  title: string;
  titleBn?: string;
  /** Summary shown after completion (optional). */
  summary?: string;
  content: ReactNode;
  /** Whether the user may skip this step. */
  skippable?: boolean;
};

type GuidedTaskShellProps = {
  /** Unique task id for localStorage persistence. Use only alphanumeric + hyphens. */
  taskId: string;
  taskTitle: string;
  taskTitleBn?: string;
  steps: GuidedStep[];
  /** Called when user completes all steps. */
  onComplete?: () => void;
  /** Called when user exits early. */
  onExit?: () => void;
  className?: string;
};

const STORAGE_PREFIX = "prohor-guided-task-v1-";

function loadProgress(taskId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${taskId}`);
    const v = raw ? JSON.parse(raw) : null;
    return typeof v?.step === "number" ? v.step : 0;
  } catch {
    return 0;
  }
}

function saveProgress(taskId: string, step: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${taskId}`,
      JSON.stringify({ step, savedAt: Date.now() }),
    );
  } catch { /* Storage unavailable — continue in-memory. */ }
}

function clearProgress(taskId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${taskId}`);
  } catch { /* ignore */ }
}

export function GuidedTaskShell({
  taskId,
  taskTitle,
  taskTitleBn,
  steps,
  onComplete,
  onExit,
  className = "",
}: GuidedTaskShellProps) {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = loadProgress(taskId);
    // Clamp to valid range in case steps changed since last save.
    return saved < steps.length ? saved : 0;
  });
  const [done, setDone] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  const totalSteps = steps.length;

  // Persist progress whenever step changes
  useEffect(() => {
    if (!done) {
      saveProgress(taskId, currentStep);
    }
  }, [currentStep, done, taskId]);

  // Move focus to the step heading when step changes
  useEffect(() => {
    if (stepHeadingRef.current) {
      stepHeadingRef.current.focus();
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (next: number, verb: string) => {
      const step = steps[next];
      setCurrentStep(next);
      setAnnouncement(
        `${verb}. ${step.title}${step.titleBn ? ` / ${step.titleBn}` : ""}. Step ${next + 1} of ${totalSteps}.`,
      );
    },
    [steps, totalSteps],
  );

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1, "Next step");
    } else {
      setDone(true);
      clearProgress(taskId);
      setAnnouncement("All steps complete. Well done!");
      onComplete?.();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      goToStep(currentStep - 1, "Previous step");
    }
  }

  function handleSkip() {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1, "Step skipped");
    }
  }

  function handleExit() {
    setAnnouncement("Guided task exited. Your progress has been saved.");
    onExit?.();
  }

  function handleRestart() {
    clearProgress(taskId);
    setCurrentStep(0);
    setDone(false);
    setAnnouncement(`Restarted. ${steps[0].title}. Step 1 of ${totalSteps}.`);
  }

  const step = steps[currentStep];
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100);

  // ── Completion state ──
  if (done) {
    return (
      <div
        className={[
          "rounded-hero border border-pro-success-soft bg-pro-elevated p-[var(--pro-pad-card)]",
          className,
        ].join(" ")}
        role="region"
        aria-label={`${taskTitle} — complete`}
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 size={48} className="text-pro-success" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold text-pro-text">
              Task complete
              {taskTitleBn && (
                <span className="ml-2 text-base font-normal text-pro-muted" lang="bn">
                  — {taskTitleBn}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-pro-muted">
              You have finished all {totalSteps} steps of{" "}
              <strong>{taskTitle}</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <AppButton variant="secondary" size="sm" onClick={handleRestart}>
              <RotateCcw size={15} aria-hidden="true" />
              Start again
            </AppButton>
          </div>
        </div>
        <InlineLiveRegion message={announcement} />
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-hero border border-pro-border bg-pro-elevated",
        className,
      ].join(" ")}
      role="region"
      aria-label={`Guided task: ${taskTitle}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-pro-border px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pro-muted">
            Guided task
          </p>
          <p className="text-sm font-semibold text-pro-text">
            {taskTitle}
            {taskTitleBn && (
              <span className="ml-1 text-xs font-normal text-pro-muted" lang="bn">
                ({taskTitleBn})
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="rounded-control p-2 text-pro-muted hover:bg-pro-surface hover:text-pro-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Exit guided task (progress is saved)"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-pro-muted">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Task progress: step ${currentStep + 1} of ${totalSteps}`}
          className="h-2 w-full overflow-hidden rounded-full bg-pro-surface"
        >
          <div
            className="h-full rounded-full bg-pro-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="p-4 space-y-4">
        <h2
          ref={stepHeadingRef}
          id={`${uid}-step-heading`}
          tabIndex={-1}
          className="text-lg font-semibold text-pro-text focus-visible:outline-none"
        >
          {step.title}
          {step.titleBn && (
            <span className="ml-2 text-sm font-normal text-pro-muted" lang="bn">
              ({step.titleBn})
            </span>
          )}
        </h2>

        <div className="text-pro-text">{step.content}</div>

        {/* Summary / hint if present */}
        {step.summary && (
          <div className="rounded-field border border-pro-info-soft bg-pro-info-soft px-3 py-2 text-sm text-pro-info">
            <p>{step.summary}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pro-border px-4 py-3">
        <div className="flex gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Previous
          </AppButton>

          {step.skippable && currentStep < totalSteps - 1 && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              aria-label="Skip this step"
            >
              <SkipForward size={15} aria-hidden="true" />
              Skip
            </AppButton>
          )}
        </div>

        <AppButton
          variant="primary"
          size="sm"
          onClick={handleNext}
          aria-label={
            currentStep === totalSteps - 1
              ? "Complete task"
              : "Next step"
          }
        >
          {currentStep === totalSteps - 1 ? (
            <>
              <CheckCircle2 size={15} aria-hidden="true" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </>
          )}
        </AppButton>
      </div>

      <InlineLiveRegion message={announcement} />
    </div>
  );
}
