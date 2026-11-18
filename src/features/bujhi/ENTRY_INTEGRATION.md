# Bujhi medical entry integration — Step 9.3

Status: working fictional-data development experience. Authentication, backend persistence, clinician review, and real AI interpretation remain outside this change. No commit/push/merge is performed.

## Entry and review architecture

`/bujhi` renders `MedicalEntry`, with manual entry first, image OCR second, and speech entry third. These are the only three input methods. Video upload, preview, and processing are not supported. All three follow Input -> Structured Draft -> Data Quality Check -> User Review -> Verification -> Save to Jibonrekha. Manual entry retains the complete antenatal report option (Sections A-J).

All methods build the backward-compatible `ExtractedReport` / `ExtractedReportField` frontend contract and use **the same existing ReportReview and saveDemoObservations**. No separate medical storage key or API has been created.

Manual entry supports Mother/Baby destination, category, name, a string result or note, optional unit, observation date, optional report date/reference interval/notes, and a clear self-reported/pending status. Submission creates an editable draft; it is not a save. Numeric measurements without units require an explicit unit-unavailable/not-applicable acknowledgement. **Clear form for a new entry** deliberately resets the form and allocates a new draft identity on the next submission. Existing draft reviews remain in session.

Review supports correction of label, category, value, unit, dates, range, notes, and destination. Every edit resets checking and records a lightweight correction history. Explicit checking is required before Save Verified Information. Rejected/pending fields are excluded; saved fields remain locked. Changing entry views keeps draft reviews mounted. Refresh/navigation discards unsaved drafts and media, while saved observations remain in the existing demo store.

## Actual OCR

Engine: **Tesseract.js 7.0.0** ([official worker API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md)), pinned in package.json/package-lock.json. It was installed after approval. The engine runs in a browser worker with English (`eng`) data. The selected image stays local; first use may download worker, WebAssembly/core, and English-language assets from Tesseract's configured CDN defaults. A checkbox explains/permits those asset requests before OCR. No medical image upload endpoint is introduced. Do not claim first-use offline operation; manual input remains independent of OCR/network availability.

`ocr-service.ts` lazily loads the engine, hashes image bytes locally for stable source identity, provides real engine progress/confidence, and terminates its worker on completion/cancellation. `ocr-parser.ts` conservatively recognizes a small test-name allow-list. It preserves original numerical strings, units, source snippets, and printed trailing reference text. Unknown lines are shown separately and are not imported as observations. Patient/header details are never automatically turned into health entries. Observation dates/destinations not established by the source remain empty for the user to select. Only unambiguous ISO report dates are recognized automatically; other date formats remain in raw text.

**OCR truly executed in Chrome** against a generated synthetic image and recognized:

- Beta-hCG `2,745.39 mIU/mL`
- Hemoglobin `11.2 g/dL`

The raw result was reviewed and an explicitly checked field was saved to the mother record in the browser test. Engine confidence is page-level text-recognition confidence, not a per-field correctness estimate or clinical confidence. Parsing reliability and user verification are separate dimensions. Missing confidence is displayed as unavailable.

Limitations: no Bangla OCR claim; complex real laboratory tables, rotation/handwriting, multi-page reports, unusual test names/units, and diverse layouts are not validated. An allow-list match is not clinical correctness. Raw text may contain OCR errors; every value/unit/date must be checked against the image. No real patient example images were used.

## Numbers, dates, units, and data guidance

`validation.ts` uses string-based normalization; it never rounds or converts units. Examples `30,000`, `3,000`, `2745.39`, and `2,745.39` retain distinct original strings. A candidate normalization (e.g. `2745.39`) is optional and saved alongside the original only after explicit checkbox selection. Ambiguous grouping/decimal formats and digit-like letter substitutions require correction. Bengali digits and Unicode minus are handled as explicit normalization candidates. Qualitative results and notes remain strings and need no invented numeric result.

Data Review & Guidance checks completeness, exact numeric format, missing units, invalid/conflicting dates, uncertain OCR parsing, unknown laboratory test names, missing snippets, possible duplicates within a draft, and matching stored labels/values/destinations. Stored-match warnings explicitly note that dates may differ and do not block intentional repeat observations. Review status is not clinician confirmation. Guidance explains uncertainty, printed-range context, and professional interpretation without diagnosing pregnancy, predicting viability/outcomes, or prescribing treatment.

## Speech provider and privacy

`speech-service.ts` exposes reusable `transcribeSpeech` and a `SpeechProvider` boundary. Initial provider is the browser Web Speech API, supporting standard/prefixed constructors and language selection `en-US` / `bn-BD`. Start/stop, errors, permission denial, cancellation, transcript preview, and a typed/pasted transcript fallback are present. On-device recognition is preferred where installed/supported. If unavailable, remote browser recognition requires the user's explicit checkbox permission; its provider is controlled by the browser and audio may leave the device. Remote recognition in Microsoft Edge is disabled here to avoid Azure-backed processing. No Azure integration or credentials exist.

The original transcript remains visible before saving. Conservative speech parsing recognizes digit-based blood-pressure phrases such as `120 over 80` or Bengali-digit `১২০ বাই ৮০`; it does not infer `mmHg`, ownership, diagnoses, or unrecognized spoken-number words. Ambiguous speech requires manual correction. Today's date is proposed only when explicitly mentioned, using Asia/Dhaka. Speech never automatically verifies/saves records. Switching away cancels microphone work.

Test status: provider and transcript/draft/save behavior tested with a browser recognition test double; unsupported-provider/manual fallback tested. **No physical microphone, real acoustic transcription, Bangla acoustic accuracy, permission dialog, or real remote speech service was exercised.** A selectable language is not proof of recognition quality.

### Optional Gemini provider — pending, not active

No Gemini endpoint/model/key is implemented. The provider seam can accept a future owner-approved adapter, but audio capture/encoding, server route, consent, authentication, retention, model selection, quota/error handling, and data-use terms require team confirmation. Model names, free-tier eligibility, quotas and prices must be verified from Google's official current documentation at integration time. No free/unlimited claim is made. Credentials must remain server-side and no recording may leave the device without explicit consent. The browser provider/manual fallback works independently of Gemini configuration.

## Saving and provenance

Manual/voice entries use `self_reported`; image OCR uses `document_extracted`. User checking stays `reviewStatus: verified` with reviewer/time metadata, never clinician-confirmed. Mother/Baby IDs are assigned by destination using the existing demo entities. Jibonrekha's existing labels remain accurate: Self-reported or Medical report (user-reviewed), with Not clinically verified.

Necessary health-model extensions are optional: input method, raw and separately normalized values, printed range, report date, notes, source snippet/file identity, actual page OCR confidence, parser reliability, unit-unavailable acknowledgement, and correction history. Original OCR snippets/raw measurements are preserved; full raw OCR text is session-only. All saved information is still synthetic demo data.

Batch saving remains atomic per localStorage write. Identity deduplication now also covers manual/voice drafts carrying stable `(sourceReportId, sourceFieldId)` values, not only extracted reports. Legacy observations still load. Corrupt storage is not overwritten. Cross-tab transactions, production authorization and persisted unsaved review drafts remain unsupported.

## Historical verification and handoff

The results below describe the earlier implementation session, not a fresh verification of this update. Legacy demo-route tests may no longer match the current entry page.

- `npm.cmd run typecheck`: pass at current implementation check.
- `npm.cmd run lint`: pass, with the existing postcss.config.mjs anonymous-default-export warning.
- `node --test src/features/bujhi/validation.test.mjs src/features/jibonrekha/demo-health.test.mjs`: 8 tests passed (numeric formats, Unicode, notes, units, dates, parsing, provenance, IDs, atomic saves, retry deduplication, corrupt-storage protection).
- `node --test src/features/bujhi/medical-entry.browser.test.mjs src/features/bujhi/upload.browser.test.mjs`: 7/7 browser tests passed on the final rerun, including a second real OCR pass over the same image with restored saved dates and no duplicates. Includes real OCR on synthetic pixels, manual and speech drafts, destinations, excluded fields, explicit verification, provenance, refresh, legacy demo flow, keyboard actions, 320–430/1280px reflow, and axe on manual review / demo upload.
- Video preview expectations have been replaced by regression assertions for exactly three entry methods, image-only file inputs, and no video controls. See the current task verification report for actual run results.
- Human manual screen-reader, real mobile picker/touch, all preference combinations, Bangla OCR/acoustic speech, and real complex-report accuracy checks are not executed. No accessibility/clinical certification is claimed.
- npm reported 7 moderate dependency findings on installation; no broad audit-fix or unrelated dependency upgrade was performed.

Backend/auth/AI contracts remain pending with teammates. The staging schema and health API placeholder are unchanged. Review the earlier Jibonrekha INTEGRATION.md for the backend gaps; its pre-OCR test status is historical, superseded by this document for Bujhi entry features.

## File inventory for this step

Created under src/features/bujhi: MedicalEntry.tsx, ManualMedicalEntry.tsx, ImageMedicalEntry.tsx, VoiceMedicalEntry.tsx, DataJudgement.tsx, validation.ts, ocr-parser.ts, ocr-service.ts, speech-parser.ts, speech-service.ts, validation.test.mjs, medical-entry.browser.test.mjs, ENTRY_INTEGRATION.md.

Modified: src/features/bujhi/types.ts, ReportReview.tsx, ReportUpload.tsx, upload.browser.test.mjs, UPLOAD.md; src/features/jibonrekha/demo-health.ts; src/app/(mother)/bujhi/page.tsx; package.json; package-lock.json. Authentication, teammate AI modules, migrations, shared layouts/styles/tokens, marketing, and Git were not changed.


## Video-removal verification ? 2026-11-18

- Source inspection: no video components, inputs, handlers, validators, or processing remain in Bujhi. Exactly manual, image OCR, and voice input methods.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing postcss.config.mjs anonymous-default-export warning.
- `node --test src/features/bujhi/validation.test.mjs src/features/jibonrekha/demo-health.test.mjs`: 8/8 passed.
- `node --test src/features/bujhi/medical-entry.browser.test.mjs`: 5/5 passed in Chrome against http://localhost:3000/bujhi. Includes real English OCR, manual entry, speech-provider test double and unsupported fallback, explicit verification/rejection, mother/baby destinations, local Jibonrekha saving, deduplication, keyboard method switching, 320?430/1280px reflow, and axe on manual review.
- Test URL uses localhost: the earlier 127.0.0.1 run had blocked Next.js development resources. Existing bilingual labels and progressive disclosure selectors were refreshed.
- Physical microphone, acoustic Bangla/English recognition, human screen-reader checks, real mobile devices, all preference combinations, and production backend persistence remain untested. Saving is demo localStorage, not production medical storage.
