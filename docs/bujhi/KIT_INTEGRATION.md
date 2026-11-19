# Bujhi kit result integration

Input reviewed: `BUJHI_KIT_RESULT_RUNBOOK.md`, `kit-result.ts`, and `kit-result.test.mjs` from the supplied Downloads folder. This delivery contained no new PDF or image canvas. The runbook's 3ক–3চ board descriptions were treated as design references; repository rules and the user's requested Bujhi integration determined implementation.

## User task and scope

A person who has used a home pregnancy test chooses what appeared on the kit and sees cautious, sourced next steps. No photo is uploaded, no result is inferred from an image, and no choice is saved automatically. The optional demo note is self-reported and requires separate consent. The public demo is `/demo/bujhi/kit`; the authenticated educational path is `/app/bujhi/kit`. Both are entered from Bujhi. The account path does not claim account-side kit note persistence because the required owner-only backend contract does not yet exist.

## Board coverage

| Runbook board | Working route behavior |
| --- | --- |
| 3ক Kit | Three short screens: kit type and timing; reading window and urgent symptoms; observed mark. Back and restart preserve or reset answers intentionally. Pure `explainKit` supplies the result key. |
| 3খ KitNext | Outcome-specific next steps and a display-only date window for applicable repeat tests. No reminder is scheduled. |
| 3গ KitSafe | Optional exact-note preview, date and pregnancy destination, consent, local save success/failure. No photo is kept. |
| 3ঘ KitGuide | Text plus theme-token C/T and digital diagrams, source links, reasons a result can be unclear. |
| 3ঙ KitStates | Late, invalid, unclear, urgent, offline, save-failure and account limitations. |
| 3চ KitAccess | Semantic text-only description list; all choices work by keyboard. |

The runbook's missing urgent-symptom question was added before the mark screen. A positive or negative mark read after the manufacturer's window is cautioned, because neither should be trusted outside the instructed time. The kit depiction uses letters, shape/dashes and text, never color alone. Severe symptoms lead directly to emergency information regardless of the selected mark. This is a rule-based educational route, not diagnosis or clinician triage.

## Sources and decisions

- [NHS: Doing a pregnancy test](https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/) supports manufacturer instructions, timing, early negative limitations and repeating after a few days.
- [NHS Gloucestershire: Pregnancy test](https://www.gloshospitals.nhs.uk/our-services/services-we-offer/pathology/tests-and-investigations/pregnancy-test-beta-hcg/) supports the example of retesting at least 48 hours later with first-morning urine when pregnancy is suspected.
- [NHS: Ectopic pregnancy symptoms](https://www.nhs.uk/conditions/ectopic-pregnancy/symptoms/) supports the urgent symptom list and care escalation.
- [Bangladesh Police: Hot line number](https://www.police.gov.bd/en/hot_line_number) and [UK government travel advice](https://www.gov.uk/foreign-travel-advice/bangladesh/getting-help) support Bangladesh's 999 emergency number.

The 48–72 hour calculation is labelled an example and appears only when a repeat may be useful. Invalid or unclear strip outcomes direct the user to a new kit or care, without a timed plan. The source language is draft and needs Bangla and clinician review before use as clinical advice.

## Privacy and record behavior

The demo saves a `general_notes` observation to the selected **mother** record using the existing Jibonrekha local adapter. Provenance is `self_reported`; no numeric measurement, clinician confirmation or new pregnancy episode is created. The precise note is previewed before consent. The local storage write is atomic under the existing adapter, and failure leaves the selected answers on screen. The account route never writes this demo note to an account. No photo, audio or result text is logged by this feature, and no push reminder is created. Existing report review flows and the previously dirty `ocr-parser.ts` are untouched.

## QA evidence

- `node --no-warnings src/features/bujhi/kit-result.test.mjs`: supplied helper cases plus all 7 picks × 3 cycle timings × 3 read windows, including urgent override.
- `node --test src/features/bujhi/kit-experience.browser.test.mjs`: keyboard entry, faint and digital paths, invalid and late cautions, urgent override, guide, text-only view, back navigation, optional save and Jibonrekha handoff, offline notice, storage failure, 320–1280px reflow, 200% text and axe checks.
- TypeScript, ESLint, production build and prior Bujhi browser flows are checked before branch push.

Screenshots: [start mobile](kit-start-mobile.png), [result mobile](kit-result-mobile.png), [result desktop](kit-result-desktop.png). Reproduce with `node scripts/capture-bujhi-kit.mjs` against a local server.

Not manually tested: NVDA/VoiceOver, native Bangla reviewer, all theme and contrast combinations on physical devices, or clinician approval. No accessibility or clinical certification is claimed.
