# Bujhi report review — implementation and validation

Date: 20 November 2026 (Asia/Dhaka). Branch: ifty. Status: working local OCR and educational review; limited account persistence; clinical validation pending.

## Evidence and scope

Read all 16 pages of the supplied “PROHOR for a disabled mother: full workflow, gaps and upgrades” PDF. Treat its recommendations as evidence, not instructions to execute unrelated work. Bujhi appears primarily on page 5; pages 7–11 and 16 describe signed-in browser-test, Bangla, screen-reader and device-validation gaps. Its cited commit and test results are historical, not current verification.

The PDF says OCR runs on PROHOR's server. This checkout actually runs Tesseract.js in a browser worker. The implementation preserves that local processing and the explicit permission to download the reader's engine/language assets. No report image or raw OCR is sent to a generative AI provider.

The supplied screenshot corresponds to /app/bujhi and AccountReportReview. It previously offered only a hemoglobin form, with other extracted information hidden in raw text. The backend still accepts maternal hemoglobin in g/dL only. This change does not silently expand that persistence contract.

## User job, risk and information architecture

Job: turn a fictional report photo into checked, understandable information and choose what to save. Personal health information and medical misunderstanding are the main risks.

Entry: the existing signed-in /app/bujhi route. A wide task-first Quiet Garden hero makes report review primary; home-kit interpretation remains a compact secondary task. Adjust how you use PROHOR remains available in place.

Primary path:
1. Add one JPG, PNG or WebP image (up to 10 MiB), with camera/gallery support and synthetic sample.
2. Explicitly permit OCR-engine downloads; inspect local processing progress or cancel.
3. Compare every recognized field with the original. Edit value, unit or printed interval; check or exclude each field. Editing invalidates the prior check. Preserve original text and correction history.
4. Read Bangla or English explanations of checked fields, whole-report coverage, explicit same-unit printed-interval comparisons and clinician questions.
5. Review the limited save scope, select maternal pregnancy and verified observation date, confirm consent and save.
6. Display account success only after an explicit saved-record receipt. Keep the same request identity and payload across uncertain retries. Link to Jibonrekha.

Failure paths: invalid image, download/recognition failure, cancellation, no recognized tests, unclear numbers, missing units/date, unsupported tests, absent printed interval, missing consent and uncertain account save. These do not invent data or report success. The Jibonrekha link offers the existing account manual-entry pathway.

Cross-module paths: home kits, Adapt, Jibonrekha, public safety information and Find Care. No clinician or supporter receives anything automatically.

## Components and layout

- BujhiTasks: responsive task hierarchy, primary report action, home-kit link, access control.
- ImageMedicalEntry → WorkflowProgress + ReportUpload: browser OCR, sample, photo guidance and privacy.
- AccountReportReview → SourcePreview + editable fields: explicit check/understand/save state machine, original/reviewed distinction, checked-field gate and existing account API.
- ReportUnderstanding → report-understanding.ts: shared presentation and pure educational/interval logic.
- ReportReview: uses the same report-wide explanations in the existing local manual/image/voice workflow; existing Quick Answers and optional local read-aloud remain available there.
- ocr-parser.ts: conservative label and unit recognition; never promotes a reference-only interval into a measured result.

Mobile: single-column content, wrapping controls, four steps in two columns, source image in an expandable region. Desktop: two-column hero/upload/check views; result explanations use two reading columns within each observation. Use existing semantic tokens, radii and focus rules; no feature-specific brand colors or font files.

Keyboard and screen-reader behavior: native controls, fieldsets/legends, persistent labels, focus on the new stage heading, status/error regions, explicit buttons for exclusions/restoration. OCR status announces engine-stage changes rather than every percentage. Language/theme changes preserve the draft and checked state. Percentages describe OCR progress, never clinical confidence.

## Working / limited / future

Working:
- Real browser-worker OCR on supported English report images, file validation, cancellation and source preview.
- Conservative CBC/glucose label recognition: hemoglobin, glucose variants, platelets, WBC, RBC, hematocrit and MCV; their supported count units and existing scan extraction.
- Test-specific bilingual educational explanations for those seven test families, linked to primary references.
- Exact user-checked strings remain visible. Printed intervals require explicit comparable units; boundaries are inclusive, with no invented population or trimester thresholds.
- Unknown tests and scan findings retain source wording and explicitly abstain from individualized interpretation.
- Review gates, raw/reviewed provenance, guarded account receipt and stable retry.
- Existing local manual/image/voice review and existing home-kit flows retained.

Limited:
- Account persistence remains maternal hemoglobin in g/dL, as supported by the current authenticated API/RPC.
- Other account-review fields stay in page memory; they are not silently stored as account records.
- English image OCR, one page at a time. No new PDF ingestion, Bangla OCR or handwriting promise.
- Explanations are deterministic source-based educational copy. No generative medical report reviewer is enabled.
- Existing local demo persistence is separate from account persistence.
- Current references support education; local clinician/native-Bangla review has not been completed.
- Browser connectivity/download failures use retry/manual alternatives; the first OCR run requires engine/language assets.

Future gates:
- Clinician-reviewed content across additional test types and pregnancy contexts.
- Evaluated Bangla OCR, multipage/PDF handling and representative extraction benchmarks.
- Additional account-save types with schemas, server permissions, idempotency and mother/baby destination validation.
- Any optional external AI explanation service needs an approved processing/privacy configuration, explicit data-transfer consent, server-only secrets, validated structured output, citation checks and medical evaluation. No diagnostic or treatment output should be enabled by a marketing claim.
- Full authenticated browser journey against a seeded local Supabase account, then staging.
- Testing with mothers, native Bangla reviewers, TalkBack/VoiceOver, switch input and braille hardware.

## References checked

Educational definitions and result-context language are based on:
- [MedlinePlus: hemoglobin](https://medlineplus.gov/lab-tests/hemoglobin-test/)
- [MedlinePlus: complete blood count](https://medlineplus.gov/lab-tests/complete-blood-count-cbc/)
- [MedlinePlus: blood glucose](https://medlineplus.gov/lab-tests/blood-glucose-test/)
- [MedlinePlus: understanding lab results](https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/)

The printed-interval comparison is arithmetic on the checked source, not a diagnosis. Inside the printed interval is not presented as proof of health.

## Validation evidence

Passed:
- Production Next.js build (all 46 static pages), TypeScript strict typecheck and repository lint.
- 21 unit tests across understanding, OCR validation, review and kit result suites.
- 13 existing browser tests, including real synthetic OCR, keyboard actions, draft recovery, A–J context, source preview and axe checks.
- Database reviewed-commit test: ownership, unauthorized access and idempotent retries using in-memory PGlite.
- New repeatable account-component browser check: real synthetic OCR, correction invalidation, checked-result gate, language preservation, keyboard actions, seven widths (320/360/390/430/768/1024/1440), three themes × standard/higher contrast, axe scans, 200% text at 320px, invalid save receipt, interrupted save, identical retry payload and raw provenance.
- The new check caught a large-text hero overflow; min-width, wrapping and grid fixes resolved it.

The account browser check mounts the actual components on a temporary synthetic route, intercepts save requests and removes the route afterward. It does not prove a real authenticated account save. Database authorization is tested separately. It never sends a test image to a model.

Run the local dev server, then `node scripts/test-bujhi-review-ui.mjs` to repeat the component check. It refuses to overwrite an existing fixture route. Screenshots in [qa](qa/) show these actual components in the synthetic harness:
- [Start desktop](qa/report-start-desktop.png)
- [Start mobile](qa/report-start-mobile.png)
- [Understanding desktop](qa/report-understanding-desktop.png)
- [Understanding mobile](qa/report-understanding-mobile.png)

Not tested: physical devices, human screen-reader use, actual 400% browser zoom, live signed-in account save, native Bangla quality, clinician review or clinical outcomes. Do not claim universal accessibility, clinical validation or doctor-equivalent accuracy.

Craft self-review (1–5, bounded to this implementation): task clarity 4; visual hierarchy 4; keyboard/reflow 4; localization 4 (native review pending); source/consent integrity 4; code separation 4. Clinical readiness remains pending regardless of these design scores.
