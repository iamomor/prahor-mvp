# Jibonrekha "Lifeline": design and build spec

Design canvas (7 artboards, 2 interactive): https://claude.ai/artifact/UNyi5cqQSaRwKrHDkyBU1i
Status: design proposal. Not built in the repo yet. Fictional data only. Needs owner approval before any change to protected design files.

## 1. What is wrong today (from the code)

The records screen opens with **9 section buttons** (overview, pregnancy, mother, baby, timeline, appointments, reports, summary, privacy) plus two selects, a demo box and an Adjust control above the first useful content. It works and passes its tests, but a tired mother has to learn a map before she can add one blood pressure reading.

## 2. The idea

**One line, not nine screens.** Pregnancy is drawn as a sun-arc of three "watches" (the brand idea in design.md 3.3: _prohor_ is a watch of the day). A dot sits on today. Everything else hangs off that line. This is original to PROHOR, uses only existing tokens, and every fact in the picture is also written in words.

## 3. Structure

| Today          | Now                                          | Proposed                                                                                                                                             |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation     | 9 buttons                                    | **4 tabs**: আজ Today, ইতিহাস Timeline, ভিজিট Visits, শেয়ার Share. Pregnancy and baby profiles, reports, privacy live behind "More" and inside Share |
| Add a reading  | open Mother tab, find form, fill many fields | **3 steps**: pick type, type value (date pre-filled), review and save                                                                                |
| Mother vs baby | select + tabs                                | segmented Mother / Baby / Both; shape + word, never colour alone (dot = mother, square = baby)                                                       |
| Sharing        | separate Summary and Privacy tabs            | one **Visit pack** flow: nothing pre-selected, identity off, review, then send or print                                                              |

Cross-module links kept: Bujhi ("verify") opens from an extracted card; Barta context stays an off-by-default switch in Share; Shonket "Urgent help" in every top bar.

## 4. Speed ("very fast") and how to hold it

Budgets are targets to measure, not measurements.

- Home renders from one local read (`getDemoWorkspace`) and server-rendered shell; arc is pure SVG (no chart library, ~1 KB).
- No new dependencies. Keep the existing "mount a section when first visited" pattern for Timeline and Share.
- Fonts: only the active preset's files via `next/font` (design.md 5.6). No image assets on these screens.
- Add flow: type buttons are 1 tap; date defaults to today; no spinner because saving is local first.
- Targets: first useful content under 2.5 s on a mid-range Android on 4G; a tap responds under 200 ms; Add a record in 3 taps and under 15 s. Measure with Lighthouse CI and a Playwright timing test; record the numbers in the PR.

## 5. "No issues for any mother": invariants (to be enforced by the QA in section 8; not yet automated)

1. No verdicts. Never "normal", "high", "on track". Values are shown with date, unit and source.
2. One provenance badge on every value: self, extracted (dashed, "please check"), clinician-entered, clinician-confirmed, demo. Icon + words + border.
3. Honest status: "Saved on this device. Not sent." until a server confirms; never "delivered" without proof.
4. Corrections add, never overwrite: old value stays, shown as "Corrected on 15 Nov. Earlier value kept."
5. Nothing is lost: drafts survive reload, theme change, offline and a failed save; stale writes from another tab are rejected with a clear message.
6. Sharing: nothing pre-selected, identity off, Barta off, explicit review, revocable, revocation shown with time.
7. Safety path: Urgent help visible on every screen, no AI in the path.
8. Works under any preference combination (theme, contrast, 100/112/125% text, density, motion, Bangla/English); targets at least 44 px; body at least 16 px.
9. Condition and baby facts are clinician-documented only; nothing is inferred.

## 6. Build map (reuse first)

| Piece           | Reuse                                                            | New                                                            |
| --------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Shell, tabs     | `RecordsWorkspace.tsx` (replace 9-button nav with 4 tabs + More) | `LifelineTabs` (small)                                         |
| Today           | `HealthDashboard.tsx`                                            | `LifelineArc.tsx` + `lifeline-arc.ts` (included, 5 tests pass) |
| Add             | `saveDemoObservation`, zod schemas in `demo-health.ts`           | `QuickAdd` (3-step, wraps existing form validation)            |
| Timeline        | `HealthHistory.tsx`                                              | shape-coded lane marker                                        |
| Share           | `ConsentAndSummary.tsx`                                          | single Visit-pack flow                                         |
| Badges, notices | `records-ui.tsx`                                                 | `ProvenanceBadge`, `StatusNotice` using design.md 4.4 / 8.2    |

Gestational age: take weeks and days from existing `gestationalDating()` (it already tracks the EDD source); pass into `LifelineArc`. If no EDD, show an empty state, never a guess.

## 7. Plan and PRs (owner: Apubo for UI, Omor for integration; message them first)

1. PR 1 (small): `lifeline-arc.ts`, `LifelineArc.tsx`, test. No behaviour change.
2. PR 2: ProvenanceBadge + StatusNotice extraction, replace local copies.
3. PR 3: 4-tab shell + Today.
4. PR 4: QuickAdd.
5. PR 5: Visit pack.
6. PR 6: QA pass below, screenshots.
   All into `develop`. Existing suites must stay green: `records-v2.test.mjs`, `records-v2.browser.test.mjs`, `demo-health.test.mjs`, and the 7 Bujhi browser tests.

## 8. QA to run (none of this has been run yet)

- Add flow by keyboard only; by screen reader (NVDA/VoiceOver, manual).
- Preference matrix: 3 themes x contrast x 3 text sizes x 3 densities; screenshots at 320, 390, 768, 1280; 200% text; 400% zoom.
- Axe on each tab. Offline add, reload, retry. Two-tab conflict. Correction keeps original. Share with nothing selected stays disabled.
- Bangla strings and long-word wrapping; clinician review of all clinical wording.

## 9. Bangla copy

Every Bangla string on the canvas is a draft written by an AI. A native speaker and a clinician must review before shipping.

## 10. Limits of this deliverable

Design canvas, this spec and one small tested code module only. Not run in the real app, not user-tested, no WCAG conformance claim, contrast taken from design.md's computed pairs, not re-measured here. Typeface presets other than Default are not drawn.
