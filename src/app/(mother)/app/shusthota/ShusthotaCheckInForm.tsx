"use client";

export function ShusthotaCheckInForm() {
  return (
    <form
      aria-label="Optional wellness check-in (demo)"
      className="space-y-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <fieldset className="space-y-4 border border-pro-border rounded-card p-[var(--pro-pad-card)]">
        <legend className="px-1 text-sm font-semibold text-pro-text">
          How are you feeling today?
          <span className="ml-1.5 font-normal text-pro-muted text-xs">
            (optional)
          </span>
        </legend>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="wellness-mood"
            className="text-sm font-semibold text-pro-text"
          >
            Mood
            <span className="ml-1 font-normal text-pro-muted">(optional)</span>
          </label>
          <select
            id="wellness-mood"
            defaultValue=""
            className={[
              "min-h-[var(--pro-control-h)] w-full rounded-field border border-pro-control-border",
              "bg-pro-elevated px-3 text-pro-text",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            ].join(" ")}
          >
            <option value="">Choose if you wish…</option>
            <option value="good">Feeling good</option>
            <option value="mixed">Mixed feelings</option>
            <option value="tired">Tired</option>
            <option value="anxious">Anxious</option>
            <option value="unwell">Unwell</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="wellness-rest"
            className="text-sm font-semibold text-pro-text"
          >
            Hours of sleep
            <span className="ml-1 font-normal text-pro-muted">(optional)</span>
          </label>
          <input
            id="wellness-rest"
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="e.g. 7"
            className={[
              "min-h-[var(--pro-control-h)] w-full rounded-field border border-pro-control-border",
              "bg-pro-elevated px-3 text-pro-text",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            ].join(" ")}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 border border-pro-border rounded-card p-[var(--pro-pad-card)]">
        <legend className="px-1 text-sm font-semibold text-pro-text">
          Private diary
          <span className="ml-1.5 font-normal text-pro-muted text-xs">
            (optional — never shared by default)
          </span>
        </legend>
        <label htmlFor="wellness-diary" className="sr-only">
          Private diary entry for today
        </label>
        <textarea
          id="wellness-diary"
          rows={4}
          placeholder="Write anything you want to remember today… / আজকের যেকোনো কথা লিখুন…"
          className={[
            "w-full rounded-field border border-pro-control-border bg-pro-elevated px-3 py-2.5 text-pro-text",
            "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
            "resize-y leading-[var(--pro-leading-body)]",
          ].join(" ")}
        />
        <p className="text-xs text-pro-muted">
          🔒 This entry is stored only on your device. It is not shared with
          anyone.
        </p>
      </fieldset>

      <button
        type="submit"
        disabled
        aria-disabled="true"
        className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-pro-primary px-6 text-sm font-semibold text-pro-on-primary opacity-50 cursor-not-allowed"
      >
        Save check-in (feature coming soon)
      </button>
    </form>
  );
}
