# Jibonrekha V2 — QA and change report

Date: 2026-11-18, Asia/Dhaka. Fictional data only, isolated Chrome profiles/VM storage. These results are not clinical validation or WCAG certification.

## Executed automated checks

| Command | Actual result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, 0 errors; one pre-existing anonymous-default-export warning in postcss.config.mjs |
| `node --test src/features/jibonrekha/demo-health.test.mjs src/features/jibonrekha/records-v2.test.mjs src/features/bujhi/validation.test.mjs` | 20/20 PASS |
| `node --test src/features/jibonrekha/records-v2.browser.test.mjs` | 6/6 PASS |
| `node --test src/features/bujhi/medical-entry.browser.test.mjs` | 7/7 PASS against the V2 workspace; Bujhi files unchanged |

Browser checks use http://localhost:3000, avoiding the blocked 127.0.0.1 Next.js development origin. Actual English OCR ran on generated synthetic pixels. Speech tests use a provider test double, not a real microphone. Print tests intercept the iframe print function and inspect the generated summary; they do not exercise an OS printer or PDF download.

## Requirement coverage

| Requirement | Evidence and status |
| --- | --- |
| 1. Mother profile editing | Browser save/reload: name, language, optional G count; typed optional birth date/age/contact; PASS |
| 2. Multiple pregnancy episodes | Browser creates second episode; original observation disappears from that episode; unit tests persist/reload; PASS |
| 3. Gestational age | Unit tests weeks/days, invalid/missing calendar dates; browser estimate display; PASS |
| 4. EDD source tracking | Clinician-document EDD preserved as authoritative calculation reference; disagreement warning; PASS |
| 5. Obstetric history | G/P/A/L, C-section, births/complications/notes supported; G edit persisted in browser; no compulsory disclosure; PASS for tested fields |
| 6. Maternal observations | Existing form save plus optional templates and report context; exact values maintained; PASS |
| 7. Lab units/dates | Bujhi real OCR + storage tests, separate range-only parser regressions; no rounding/conversion; PASS for synthetic cases |
| 8. Conditions/provenance | Browser creates suspected condition/allergy; source/actor/time persist; PASS |
| 9. Medicines/vaccinations | Browser creates fictional medicine with copied dose/frequency and Td dose number; PASS |
| 10. Corrections | Browser corrects 60.00 to 61.250; original retained; PASS |
| 11. Version/audit | Before/after, actor/time/reason, stale revision rejection; browser archive/version display; PASS |
| 12. Mother/baby separation | Legacy and V2 service tests + existing Bujhi mother/baby saves; PASS |
| 13. Multiple babies | Browser creates twins A/B under second episode; twin A feeding note absent from B; PASS |
| 14. Fetal/newborn records | Stage and optional newborn birth weight/date/outcome saved in browser; fetal templates/model support; no clinical validation claimed |
| 15. Growth/vaccination | Baby growth/feeding/milestone categories and measurements + baby-scoped clinical immunization model; weight/unit separation tested in service; complete pediatric/centile validation NOT implemented |
| 16. Appointments/reminders | Browser stores explicit follow-up date, marks completion; no notifications; PASS |
| 17. Search/filters | Search and archived filter exercised in browser; episode/record isolation exercised; all date/category/source/trimester/review controls implemented, not every combination individually asserted |
| 18. Quality warnings | Unit tests mismatch, unsupported units, invalid relationships/dates/provenance and clinical duplicates; browser no-data/required validation; PASS for configured cases; no medical thresholds |
| 19. Bujhi integration | Unchanged seven-test browser suite: real OCR, manual/speech reviewed saves to original demo destinations; PASS |
| 20. Source labels | Self-reported/document-extracted labels and opt-in fictional read-only provider example checked; PASS |
| 21. Duplicate prevention | Report/field retries, atomic storage regression and clinical identity validator; PASS; intentional repeat observations remain separate and flagged |
| 22. Summary/print | Selected destination, identity off by default, explicit review guard, intercepted local print content; PASS; real OS print/PDF NOT tested |
| 23. Consent/sharing | Browser grant/preview/revoke, unit missing-consent rejection, separate mother/baby scopes, no transmission; PASS for simulation only |
| 24. Responsive | All nine sections checked at 320/360/390/430/768/1280 CSS px and 200% root text; PASS for automated reflow checks |
| 25. Access | Keyboard section activation/focus, semantic forms, live errors/status, axe WCAG2/2.1/2.2 A/AA tags across nine sections; PASS automated. Human screen reader NOT tested |
| 26. Compatibility | Legacy observation fields survive reload; original pregnancy mapping retained; Bujhi regression suite passes; PASS |
| 27. Bujhi regression | No Bujhi source/test edits; seven existing browser tests passed with the new adapter/workspace |

Additional browser evidence: failed workspace writes preserve input and emit no false success; retry succeeds; a stale tab cannot overwrite a newer profile; offline local observation saving works after load. Quiet Garden, Original Rose and Morning Mist with standard/higher contrast and reduced motion preserve unsaved profile text and focus. Selected/primary computed foreground differs from background; visual button-label defects were corrected. These checks do not prove every contrast ratio or every preference combination.

## Human/manual and visual checks

- Viewed fresh fictional-only 390px mobile and 1280px desktop screenshots. Fixed invisible selected/primary labels caused by competing text color classes, corrupted inserted Bangla labels, and stale selected-baby/profile labels. Recaptured and inspected the corrected mobile view.
- Temporary screenshots: `%TEMP%/prohor-jibonrekha-v2-mobile.png` and `%TEMP%/prohor-jibonrekha-v2-desktop.png`. They are not committed repository assets.
- NOT executed: NVDA/VoiceOver/braille, physical touch devices, real acoustic Bangla/English recognition, OS printer/PDF dialog, real 400% browser zoom, complete preference matrix, clinical accuracy evaluation, or disabled-user testing.
- Local engineering self-review (1–5, not independent sign-off): hierarchy 4, typography 4, accessible task completion 4 for tested paths, error recovery 4, source/consent integrity 4 for the demo, responsiveness 4, code/contract separation 4. Production privacy/security is incomplete and is not scored as approved.

## Exact task file manifest

Created under `src/features/jibonrekha/`:

- records-model.ts
- records-ui.tsx
- RecordsWorkspace.tsx
- PregnancyProfile.tsx
- ClinicalHistory.tsx
- HealthHistory.tsx
- ConsentAndSummary.tsx
- integration-contracts.ts
- records-v2.test.mjs
- records-v2.browser.test.mjs
- V2_QA.md

Modified under `src/features/jibonrekha/`:

- demo-health.ts
- demo-health.test.mjs
- HealthDashboard.tsx
- MaternalHealthForm.tsx
- BabyHealthRecord.tsx
- INTEGRATION.md

Modified route: `src/app/(mother)/jibonrekha/page.tsx`.

All other pre-existing changes/untracked files belong to prior work. No dependencies, shared components/global CSS/tokens, auth, AI modules, Supabase migrations, Bujhi files, Git branches or history were modified by this V2 task.

## Integration limits

Working demo: mother/pregnancy/baby editors, linked multiple episodes/babies, existing observation flows, clinical histories, correction/archive/version snapshots, explicit appointments, history filters, text/table trends, reviewed summaries/print path and consent-aware local context preview.

Limited: localStorage is unencrypted and user-tamperable; schema validation and optimistic revisions are not trusted server authorization/auditing. No multi-key transaction or true cross-tab lock; no medical diagnosis/triage, centile calculation or clinical authenticity check. Full report context persistence remains a Bujhi integration gap. Selecting different record identities remounts their unsaved forms. Long summaries can span pages. Access/export audit records cover explicit local preview/print actions, not a secure complete access log.

Pending: teammate authentication/authorized record context, async health API and transactional persistence, RLS/schema/uniqueness, provider authorization/signatures, secure consent revocation and deletion/retention, Barta transport and additional field-specific history consent, Bujhi multi-episode/multiple-baby destination contract, notification infrastructure, and real device/assistive-technology review.

Ready for a draft mock-first code review with these limitations visible; not approved for real patient data or production. No commit, push, merge or branch change was performed.
