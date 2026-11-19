# Account Jibonrekha Lifeline restore — 20 Nov 2026

## Scope and source

The account route `/app/jibonrekha` now uses the Today hierarchy and arc from the earlier PDF-aligned Lifeline work while reading only account records from `/api/jibonrekha`. The 14-page PDF mapping is in `LIFELINE_PDF_IMPLEMENTATION.md`; `jibonrekha2.rar` supplied the master runbook and record helpers. `M4_JIBONREKHA.md` supplied the synthetic mother and record checks. Attached documents are design and test references, not proof of clinical validation.

## Implemented on the account route

- Today: source-labelled pregnancy arc or explicit unknown-date state, latest recorded visit, fast actions, separate mother and baby lanes.
- 1–41 week sourced care guide, with Bujhi links staying under `/app`.
- Add measurement: destination/value/date review before account save; failed saves keep input; success focus moves to the status.
- History: mother, baby or combined view; pregnancy, kind and text filters; existing correction history stays available.
- Visit pack: nothing preselected, explicit review, selected-only A4 print/PDF, no automatic identity or sending.
- Visible urgent-help and access-preferences links. Postpartum and baby entry points remain labelled with their limits.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Strict typecheck and feature lint | Pass | `npm.cmd run typecheck -- --incremental false`; scoped ESLint |
| Production build | Pass | `npm.cmd run build` |
| Dating, arc, correction, history and guide tests | Pass | Node test suites, 11 assertions/tests |
| Mother test account sign-in and account page load | Pass | Local Edge automation, `/app/jibonrekha` |
| 320px reflow | Pass | `scrollWidth <= innerWidth`; `screenshots/account-today-320.png` |
| 390px and 1280px Today captures | Pass | Local Edge automation; `screenshots/account-today-desktop.png` |
| Keyboard Add, review and edit without lost value | Pass | Enter key on Add; review visible; value restored |
| Empty pack disabled, selection review and print isolation | Pass | Local Edge automation; print CSS visibility checks |
| Actual account write, correction and cross-window sync | Not tested | Smoke path stopped before Save |
| Manual NVDA/VoiceOver, native Bangla and clinician review | Not tested | Requires human review |

## Current limits

The account backend does not yet store every field or interaction in the browser-only 14-page prototype. Date-change audit, full postpartum/newborn/vaccine records, offline account drafts and direct Visit pack delivery through Bondhon remain limited or future. The account screen does not silently import browser-only sample data. The preview is an MVP using synthetic data and is neither clinical validation nor an accessibility certification.
