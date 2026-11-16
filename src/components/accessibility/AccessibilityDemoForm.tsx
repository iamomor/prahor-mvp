"use client";

import { useRef, useState, type FormEvent } from "react";

const controlClassName =
  "min-h-[var(--pro-control-h)] w-full rounded-field border border-pro-control-border bg-pro-surface px-3 text-pro-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";

/** Interactive form example for the otherwise server-rendered accessibility page. */
export function AccessibilityDemoForm() {
  const weekRef = useRef<HTMLInputElement>(null);
  const [weekError, setWeekError] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const week = Number(formData.get("week"));

    if (!Number.isInteger(week) || week < 1 || week > 42) {
      setWeekError("Please enter a number between 1 and 42");
      setStatus("");
      weekRef.current?.focus();
      return;
    }

    setWeekError("");
    setStatus("Example is valid. No data was saved or submitted.");
  }

  return (
    <form
      className="max-w-sm space-y-4"
      aria-label="Accessible form example — demo only, no data is submitted"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="demo-name" className="text-sm font-semibold text-pro-text">
          Your name
          <span className="ml-1 text-xs font-normal text-pro-muted" lang="bn">(আপনার নাম)</span>
        </label>
        <span id="demo-name-hint" className="text-xs text-pro-muted">
          As it appears on your health records
        </span>
        <input
          id="demo-name"
          name="name"
          type="text"
          aria-describedby="demo-name-hint"
          className={controlClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="demo-week" className="text-sm font-semibold text-pro-text">
          Week of pregnancy
          <span className="ml-1 text-xs font-normal text-pro-muted" lang="bn">(গর্ভধারণের সপ্তাহ)</span>
        </label>
        <span id="demo-week-hint" className="text-xs text-pro-muted">
          Enter a number between 1 and 42
        </span>
        {weekError && (
          <span id="demo-week-error" role="alert" className="text-xs font-medium text-pro-danger">
            {weekError}
          </span>
        )}
        <input
          ref={weekRef}
          id="demo-week"
          name="week"
          type="number"
          min={1}
          max={42}
          aria-invalid={weekError ? "true" : undefined}
          aria-describedby={weekError ? "demo-week-hint demo-week-error" : "demo-week-hint"}
          onChange={() => {
            if (weekError) setWeekError("");
            if (status) setStatus("");
          }}
          className={controlClassName}
        />
      </div>
      <button
        type="submit"
        className="min-h-[44px] rounded-control bg-pro-primary px-5 text-sm font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
      >
        Save — <span lang="bn">সংরক্ষণ করুন</span>
      </button>
      <p className="text-xs text-pro-muted italic">
        Demo only — no data is saved or submitted.
      </p>
      <p role="status" aria-live="polite" className="text-sm text-pro-primary">
        {status}
      </p>
    </form>
  );
}
