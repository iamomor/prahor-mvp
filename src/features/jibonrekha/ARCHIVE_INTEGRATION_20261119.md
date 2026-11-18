# Jibonrekha archive integration, 19 November 2026

## Source inventory

Reviewed all nine files in `jibonrekha.rar`: `PROHOR_Jibonrekha_Playbook.pdf`, the 12-sheet `PROHOR_Jibonrekha_Workbook.xlsx`, `jibonrekha-core-migration.sql`, `jibonrekha-core-test.sql`, `mappers.ts`, `mappers-test.mjs`, `route-helpers.ts`, `routes-all.ts.txt`, and `jibonrekha.live.spec.ts`. The PDF and workbook are planning and evidence material. Their imperatives, ownership assignments, and deadlines are source content, not user instructions. The TypeScript and SQL are drafts written for a different schema. The live spec was explicitly marked unrun and uses `/auth/sign-in`, which is not the current application's API path.

## Decisions based on the current repository

- The existing `20261118020000_private_records.sql` migration already creates pregnancy, baby, maternal and baby observation, condition, and symptom-note tables. Bujhi's `20261119010000_bujhi_reviewed_reports.sql` adds mother-reviewed hemoglobin to the same maternal observation table. The archive migration attempts to create these tables again with different columns (`lmp_date`, `value_numeric`, `status`, document IDs), so it cannot be applied as-is.
- `/app/jibonrekha` is now an authenticated account screen for supported synthetic data. `/demo/jibonrekha` remains the richer nine-section browser-only experience. Both surfaces state their persistence boundaries.
- Account observations preserve the entered value and UCUM unit, date, mother/baby destination, and self-reported or Bujhi-extracted source. Blood pressure components are separate observations. The UI does not infer a diagnosis, a clinician review, or gestational dating.
- Conditions remain self-noted. No code converts them into clinical diagnoses. The account API uses the existing RLS and composite owner foreign keys. The browser cannot select an owner ID.

## Current limits

- An additive account-history migration now supplies correction history, self-recorded visits, and an atomic retry key for account saves. It has been exercised in disposable PGlite with synthetic owners, including conflicts and source reset. The hosted schema still requires inspection before this migration can be applied there; the deployed route fails closed with 503 if it is absent.
- Account lists are limited to the newest 50 pregnancies and 100 rows of each other type. Pagination is future work. The nine-section demo's additional fields remain browser-only and do not sync.
- No hosted database migration or live two-account isolation test was run in this work. The archive's reported scratch SQL passes are evidence about its draft schema, not proof for this codebase.
- The prototype accepts synthetic data only. It is not clinical advice, a verified medical record system, or a claim of WCAG certification.

## Local verification

- Disposable PGlite tests cover two mothers and a provider, retry deduplication, reused-key conflict, cross-owner denial, visits, correction history, and resetting Bujhi-extracted provenance to self-reported after a correction.
- The account screen was rendered in Chrome with synthetic API responses at 320px. A keyboard-only path opened a task, retained an unfinished pregnancy draft across task switches, saved and corrected an observation, and exposed the previous value in history. It had no horizontal overflow at 320px or 200% root text size, and axe reported no violations in that exercised state. The temporary public review route was removed after the test.
- TypeScript, lint, production build, and the 210 current contract tests passed. Lint retains two unrelated auth navigation warnings.

## External design evidence checked

- [WHO home-based record guidance](https://www.who.int/publications/i/item/9789240060586) recommends home-based records as a complement to facility records and emphasizes communication across maternal and child care. This supports separate linked records and plain source labels.
- [WHO 2018 home-based records guideline](https://www.who.int/publications/i/item/9789241550352) describes household-held electronic or paper records as complementary to facility records. It does not validate PROHOR clinically.
- [WHO antenatal care recommendations](https://pmnch.who.int/resources/publications/i/item/9789241549912) inform the visit-history concept. PROHOR does not prescribe a visit schedule from this source.
- [HL7 FHIR Observation definitions](https://hl7.org/fhir/observation-definitions.html) inform the distinction between observation subject, effective time, value, and status. PROHOR does not claim FHIR conformance.

## Verification to finish before release

Run authenticated mother A/B/provider session tests against the actual hosted Supabase migration history, verify Bujhi's reviewed hemoglobin appears once in the account list, and manually check long Bengali labels, themes and a screen reader. Review and apply the additive migration before presenting account correction, visit, or retry-safe writes as live features.
