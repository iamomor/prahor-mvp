# Component and React implementation standards

## Product UI component API
- `AppShell`: consistent mobile/desktop nav, main landmark, access preferences and persistent Shonket help entry.
- `PageHeader`: breadcrumb, title, optional source/context, single page-level action.
- `AppButton`: `variant=primary|secondary|quiet|destructive`, text label, loading/pending, disabled reasons, target 44–48px.
- `AppField`: persistent visible label and optional hint, format/unit, error id and `aria-describedby`, correct autocomplete.
- `StatusNotice`: states `loading|saved-local|saved-server|delivered|acknowledged|failed|offline`, plain-language persistent text, appropriate announcement.
- `ThemeSelector`: candidate theme cards, selected text + icon + radio semantics, no purely color-coded selection.
- `AccessPreferencesPanel`: independent appearance and functional access controls, immediate preview, reset/restore default, no diagnosis questions.
- `AccessibleDialog`: accessible name, focus restoration, Escape, scroll containment, no content trap.
- `CareRecordCard`: value + unit + observed date + source + verification state. Do not use color-only categories.
- `AIAnswer`: evidence references, “educational information” boundary and follow-up help.
- `ReportVerifier`: source file, extracted fields editable by reviewer, uncertainty markers, save only after confirmation.
- `ConsentReview`: recipient, data types, explicit authorization and cancel/revoke.

## TypeScript and state
React + strict TypeScript. Explicit props; avoid `any`, effect-loop dependencies and a giant global dashboard component. Use server actions/routes for protected state changes; API validation on server; do not use client props for authorization decisions. Keep presentation settings separate from clinical data and permission state. Prefer native browser elements over custom widgets; reach for a tested accessible primitive library when needed.

## Tailwind v4 specifics
Define semantic runtime CSS variables on `html[data-theme]` and independent contrast/motion/text-scale attributes. Define Tailwind alias utilities via `@theme inline` in `src/styles/prohor-tokens.css`. Avoid setting `className="bg-[#2F6B54]"` throughout the app. Use `<button>`, `<label>`, `<fieldset>` rather than clickable divs. Use `focus-visible` styles, `aria-live` sparingly for meaningful async updates, and correct keyboard roving patterns only for truly custom composite widgets.

## Example component markup
```tsx
export function HealthEntrySubmit({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="min-h-12 rounded-xl bg-pro-primary px-5 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-60"
    >
      {pending ? "Saving your entry…" : "Save health entry"}
    </button>
  );
}
```
This only displays a pending state; the parent form must validate, submit, report actual saved status, and preserve data on failure.

## RTL/LTR and Bengali
Bangla is normally left-to-right and should not be assigned `dir="rtl"`. Use `lang="bn"` on Bangla chunks; translations are semantic, not concatenated fragments; allow wrapping and increased line height. Use `font-variant-numeric: tabular-nums` only for relevant aligned data; keep units readable. Ensure screen readers announce mixed-language terms correctly where possible.

## Color accessibility
Every theme needs on-primary text and robust secondary text. Highlight tokens cannot be used as text backgrounds unless pairwise contrast passes; warnings and medical conditions use a clear label, not only yellow/red/green.

## QA before merge
Run `tsc --noEmit` or framework typecheck, eslint, unit tests if present, Playwright happy-path tests and axe checks where configured. Manually test keyboard, focus and 320px. Include screenshot of mobile and desktop, a list of tested themes and a status: **working**, **limited**, **simulated**, or **future**.
