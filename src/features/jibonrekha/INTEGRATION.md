# Jibonrekha V2 — integration handoff

Updated 2026-11-18 (Asia/Dhaka). Status: **working fictional-data demo / limited production readiness**. No real health information is appropriate for localStorage. No authentication, Barta, AI extraction, migrations, shared styles, dependencies, or Git history were changed.

## Current feature ownership and entry points

`src/app/(mother)/jibonrekha/page.tsx` renders `RecordsWorkspace`. It extends the original `HealthDashboard`, `MaternalHealthForm`, and `BabyHealthRecord`; Bujhi is unchanged and read-only in this task.

Nine progressively visited sections: Overview, Pregnancy, Mother's Health, Baby's Health, Timeline, Appointments, Reports, Health Summary, Privacy & Sharing. Hidden visited sections retain inputs during section navigation. Switching pregnancy/baby identities remounts destination-specific forms; save/copy unfinished input before changing destination. The original dashboard forms, counts, baby history and combined timeline remain available in Overview.

## Models and relationships

`records-model.ts` owns typed Zod schemas and deterministic helpers. `integration-contracts.ts` describes proposed async capabilities; it does not create endpoints or authorization.

- MotherProfile: stable mother/user IDs; name; optional age/date of birth/contact; preferred language; optional G/P/A/L, previous C-section, births and complication/history notes. Consent is separate, never inferred from profile information.
- PregnancyEpisode: independent ID, mother ID, label, optional LMP/EDD, EDD source, documented status/start/end dates and notes. Each observation/clinical entry/appointment has a pregnancy association.
- BabyRecord: independent ID, mother ID and pregnancy ID; label/stage; optional birth date, exact birth weight/length and units, sex/gender as provided, delivery mode, documented Apgar/timing and sensitive outcome. A pregnancy may have zero, one or multiple babies. No live-birth outcome is assumed.
- HealthObservation: retains original fields and optional Bujhi metadata. New fields: pregnancyId, enteredAt/enteredBy, revision, updatedAt, archived and versions. Exact values and units remain strings. StructuredResult preserves the original or corrected string; no unit conversion or rounding is performed.
- ClinicalEntry: condition, allergy, medicine/supplement, immunization, encounter or pregnancy event; destination, pregnancy, date, status, optional dose/frequency/end date/dose number, notes and provenance. Status is active/resolved/suspected/unknown, never inferred from a measurement.
- Appointment: explicit user/documented title/date/type/destination, source, notes and completion state. No rule-generated clinical schedule, push notification or reminder delivery exists.
- Consent: mother or individual baby scope, recipient (family/provider/future Barta), explicit observation IDs, allow/revoke and update time. No grant is enabled by default.
- AuditEvent: actor, time, action, target, optional reason and entity-specific before/after snapshots. Observation revisions store previous/corrected values and dates atomically alongside the observation.

## One demo adapter; compatible storage

`demo-health.ts` remains the only persistence adapter. Observations retain `prohor-demo-health-v1` as an array. V2 domain metadata (profiles, episodes, babies, clinical history, appointments, consents, audit) uses `prohor-demo-records-v2` through the same adapter, not a competing observation store. The pre-existing Bujhi draft helper/key remains unchanged and is not wired to complete report-context review/persistence.

Legacy arrays load without requiring optional new metadata. Missing pregnancy IDs map to `demo-pregnancy-001`; saves add an explicit pregnancy ID and service-entry actor/time. Unknown historical author/time is not backfilled during reads. Baby form dates now preserve `YYYY-MM-DD`; older timestamped dates still load and display in Dhaka time. Date precision across real backend integrations is Pending confirmation.

New writes validate mother/baby/pregnancy relationships, real calendar dates, required labels/results, and Bujhi review metadata. V2 schemas validate links, IDs, date ordering, birth measurement units, optional whole-number obstetric counts, provenance and duplicate clinical records. Source/date/format/units/conflict warnings are data-quality guidance, not clinical triage. Unsupported trend units remain recorded and separated without conversion.

`getDemoObservationsStrict` and `getDemoWorkspace` expose read failures to the workspace UI rather than silently showing an empty chart. Existing Bujhi-compatible `getDemoObservations` behavior is retained. Failed writes do not show success or clear inputs. Corrupt data is not overwritten. No user's browser storage is cleared by tests.

Observation batch writes remain one write and idempotent by observation ID or sourceReportId/sourceFieldId across destinations. Exact duplicate clinical records are rejected; discrepancies retain both entries. Existing clinical/baby/pregnancy links cannot be reassigned silently. Archive/restore replaces deletion; source IDs remain reserved after archive.

Workspace saves compare revisions; observation corrections compare per-entry revisions. Cross-tab events warn without silently refreshing uncontrolled form inputs. This reduces stale overwrites, but localStorage offers no cross-tab transaction/locking guarantee. Domain writes and observation writes are separate, not a multi-key database transaction.

## Dating, history and review

Calendar arithmetic uses UTC date boundaries; today's display date is Asia/Dhaka. With recorded LMP, an estimate can be shown. A recorded ultrasound/clinician-document EDD is the chosen reference where available (EDD minus a 280-day reference); it is not independently authenticated. The recorded EDD is never overwritten. Missing or negative dating produces no trimester. LMP/EDD disagreement is displayed with both dates preserved; no arbitrary clinical risk threshold is added. Ended episodes use their documented end date for overview dating.

The timeline groups by date inside the selected pregnancy, with trimester only when dating allows. It includes observations, visits/conditions/events and appointments, with search and date, record/baby, category, source, trimester and review filters. Weight/blood-pressure trend tables separate record/name/unit groups and preserve exact results. No diagnosis, growth centile or risk score is calculated.

Users can correct/archive/restore their own self-reported observations; raw originals and revision history remain. Document-extracted observations stay read-only here: a differing self-reported record preserves the source and is flagged for review rather than replacing it. Clinical records have audit-backed corrections/archive and source/status discrepancy messages. An explicit opt-in fixture demonstrates clearly fictional provider confirmation, with a fictional actor, no diagnosis/measurements, and a read-only entry. The maternal UI cannot create real provider confirmation.

## Bujhi compatibility and limitation

Existing Manual / Image OCR / Voice -> structured draft -> quality checks -> user review -> verification -> local save continues through the same observation adapter. Sources, raw/corrected strings, units, dates, reference intervals, report/field identity, available laboratory/source-location metadata, OCR confidence, correction history and review attribution survive.

Bujhi still chooses the original demo mother/baby IDs and has no pregnancy/multiple-baby selector. Therefore its untagged saves deliberately map to the original episode/baby, regardless of which Jibonrekha record is active. Do not silently route an import using the current workspace selection. Multi-episode/multiple-baby Bujhi targeting needs teammate approval and a confirmed contract. No Bujhi file was modified in V2.

Complete A-J report context is supported by the report model, but Bujhi's current review UI still saves individual verified observations, not separately verified full context. V2 does not claim to close that teammate-owned gap. OCR is English Tesseract with conservative parsing; Bangla OCR/complex-report accuracy remains unvalidated. Speech-provider tests use a test double; no physical microphone/acoustic language accuracy is claimed.

## Privacy, roles and Barta

All consent/role/audit behavior is a local demonstration, not secure access control. Consent is independent for mother and every baby, recipient-specific and observation-specific. Revocation invalidates local Barta preview. The preview requires explicit allowed observation IDs, checks pregnancy/destination/review and excludes archived records. It omits name/contact, diary, raw reports and transcripts. Nothing is transmitted. Current Barta context covers selected observations and a labelled gestational estimate; sending clinical history requires additional explicitly selected fields and a teammate contract.

`RecordsPrincipal`, `RecordsAccessRequest`, `RecordsBackendAdapter` and `PendingBartaContextAdapter` are typed integration seams. Mother, authorized supporter and provider roles require server-side authenticated identity, owner/record authorization, recipient/purpose verification and RLS. Transport/endpoint names, revocation enforcement, retention, export/deletion requests and audit signing are **Pending confirmation**. Client flags are never sufficient authorization.

Summary/export is for the selected pregnancy and destination. Name/contact are off by default; user review is required before invoking browser print. A temporary local iframe contains only the rendered summary, not the application/navigation or unrelated records. Browser Save as PDF can be chosen by the user. Long histories may span multiple pages; no clinical certification, automatic sharing or guaranteed single-page fit is claimed. Automated tests intercept print and inspect its content; actual OS print/PDF delivery is untested.

Offline: local fictional editing works after the page has loaded if storage is available. No first-load offline, encrypted offline medical storage, multi-device sync or reliable remote notification claim is made. Data stays in local browser storage, not analytics/external AI. Large histories/audit logs may hit quota; failure/retry is visible.

## Backend and schema gaps — Pending confirmation

Read-only findings still apply: health GET returns 503 without Supabase, 401 without session, and 501 for the authenticated placeholder. No usable health read/write API has been agreed. Barta chat is not a report extraction endpoint.

Staging `pregnancy_records.user_id` and `baby_records.pregnancy_id/user_id` need deliberate mapping to the new episode/baby IDs. `health_observations` lacks destination foreign keys, pregnancy association, report/field IDs, exact original/corrected/normalized metadata, revision/archival/audit, review attribution, date precision and idempotency uniqueness. Its existing insert policy permits self_reported only. Full profile/history/medication/immunization/appointment/report/consent schemas and secure policies need teammate review. No migrations or RLS were edited.

Replace synchronous demo calls with awaited adapters, pending/error handling, canonical server IDs, transactions, stale-write/conflict responses and revalidation. The server derives actor and timestamps, validates ownership/provenance and protects provider records. Do not auto-upload fictional local data after sign-in. Production needs TLS, secure storage/encryption decisions, retention/deletion policy, authentication/session-expiry handling, consent enforcement and trusted audit/access logs.

## Future interoperability mapping (not FHIR compliance)

| Local model | Possible future resource |
| --- | --- |
| Mother/Baby identity | Patient with distinct identities |
| Pregnancy episode | EpisodeOfCare / pregnancy-specific profile, team decision pending |
| HealthObservation | Observation |
| Clinical condition/allergy | Condition / AllergyIntolerance |
| Medicine/supplement | MedicationStatement |
| Vaccination | Immunization |
| Visit/examination | Encounter |
| Source report + observations | DiagnosticReport with DocumentReference |
| Appointment | Appointment |
| Consent and audit | Consent / Provenance / AuditEvent |

Resource versions, profiles, terminology, consent mapping and validation are Pending confirmation. No FHIR certification or clinical compliance claim is made.

## Verification and review readiness

See [V2_QA.md](./V2_QA.md) for executed commands, coverage and manual limitations. Current evidence is fictional data in isolated browser contexts, not a clinical or accessibility certification. Ready for a draft mock-first code-review PR; real auth/backend/AI/multiple-record import and manual assistive-technology sign-off remain outstanding. No commit, push, merge or branch change was performed.
