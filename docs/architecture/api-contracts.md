# PROHOR — Step 7 API and shared TypeScript contracts

Status: **proposed v1 interface; module-owner review pending**. Lead: Omor. Prepared 16 November 2026. Actual starter behavior is listed separately below; declaring a DTO does not implement a route. [Data model](data-model.md) · [Security](security.md) · [Team decisions](team-contracts.md).

## Common conventions

- App Router routes stay under `/api`; nouns plural, JSON `camelCase`, database columns `snake_case`. Keep existing `/api/ai/chat`, `/api/health`, `/api/care-requests` paths to avoid unnecessary UI churn. The logical SQL table `support_requests` does not force an API rename.
- Proposed success envelope: `{data, requestId, contractVersion:"1"}`. Error: `{error:{code,message,fieldErrors?},requestId}`. `fieldErrors` contains field paths and corrective messages, never submitted private values, SQL details or raw model/parser output. `requestId` is a server correlation UUID, not a care-request ID.
- Every declared mutation validates with its exported strict Zod schema. Derive owner, actor, data mode and initial provenance on the server. Reject unknown keys, client roles, verification, status, `assignedProviderId`, `ownerUserId` and arbitrary resource scopes. Path UUIDs and query parameters need separate validation too.
- Validate auth before private record lookup; use 401 for no session, 404 for inaccessible resource IDs (avoid confirming another mother's record exists), 403 for a known disallowed operation, 400 for malformed JSON/validation, 409 for stale revision/idempotency mismatch, 413 for excess bytes, 415 for unsupported report, 429 for abuse limits, 501 for unimplemented service, 503 for dependency/configuration unavailability. Database list operations may return an empty page under RLS, but do not equate an empty page with proof the user has access to a supplied resource.
- All private responses and sensitive POST responses, **including errors**, use `Cache-Control: no-store`. No service-worker caching of `/api`, auth or private pages. Public directory/guidance caching requires a reviewed invalidation/freshness policy; simplest initial implementation is `no-store` everywhere.
- POSTs that create requests, reviews, observations or commitments require an `Idempotency-Key` UUID header. Store key+actor+operation+payload digest and outcome in a server-only `mutation_receipts` table (additional P0 support table). Unique `(actor_user_id, operation, key)`; changed payload with same key -> 409. Use a keyed digest, no raw private body or response snapshot in this table; store resulting resource IDs and reconstruct after fresh authorization. Report commits additionally have unique extracted-field links. Receipt retention remains a release decision; never turn retry receipts into indefinite clinical copies.
- Signed-in cookie mutations verify Origin against configured application origins; no wildcard credentialed CORS or GET mutations. Do not derive allowed origin from untrusted forwarded headers. Authentication, ownership, consent and abuse limits are server checks, not TypeScript guarantees.
- List endpoints use `limit` (integer 1–50, default 20) and opaque server-validated `cursor`; response `{items,nextCursor}`. Owner timelines sort by timestamp DESC and UUID DESC; cursor includes both. Provider queue uses submitted timestamp/UUID; public lists use a stable indexed order. Bind cursor to current caller/filter; never embed private values in it. Search `q` is optional trimmed text up to 200 characters. IDs in path/query are validated UUIDs; unknown filters are rejected.
- JSON timestamps are offset-aware ISO 8601; dates use `YYYY-MM-DD`. Measurement values are decimal strings and require supported units. Never coerce an empty measurement to zero or infer a missing clinical time. `expectedRevision` protects care state/review changes. Preferences use `expectedUpdatedAt` (`null` means create only).
- Proposed request/response payload map: [`src/lib/contracts/api.ts`](../../src/lib/contracts/api.ts). Import `ApiRequest<"POST /api/health">`, `ApiResponse<...>` and domain schemas from `@/lib/contracts`. The map describes body payloads; path/query/header validation and backend adapters remain implementation work. Proposed response schemas exist for core domain resources; UUID/timestamp aliases are plain strings in some result wrappers and must still be validated when constructing a response. Generate Supabase `Database` types only after approved migrations, in a separate file.

## Actual starter compatibility

| Route | Current accepted request / behavior | Step 7 adoption requirement |
| --- | --- | --- |
| `POST /api/ai/chat` | `{question}`; 400 for bad input, otherwise 501 `{message,status:"not_connected"}` | Adopt `language` and explicit retention semantics/envelope when retrieval is implemented; update Barta caller in same integration PR |
| `GET /api/health` | No configured Supabase -> 503; no user -> 401; authenticated -> 501 `{message}` | Implement owned typed record list and no-store on every path; POST is currently absent |
| `POST /api/care-requests` | `{message,method}`; validates then 501 `{message,status:"not_sent"}`; no auth workflow yet | Coordinate recipient, review and exact-grant inputs with caller; implement auth, RLS, state/events before any success response |
| Other routes listed here | Absent | Proposed only; do not consume as working endpoints |

After the code review, starter handlers use strict subsets of shared domain validators and `no-store` on every outcome, including 400/401/503. Existing callers and smaller payloads remain compatible. The larger v1 response envelope and backend workflows are still proposed; adopt those together with their callers. Never return mock success to make a proposed API appear available. See [review evidence](../qa/CODE_REVIEW.md).

## Shared platform and Adapt

| Method/path | Auth | Input contract | Proposed `data` / success |
| --- | --- | --- | --- |
| `GET /api/me` | User | No body | Profile + trusted roles; never secrets or other profiles |
| `GET /api/access-preferences` | User | No body | `{settings,schemaVersion:2,updatedAt}`; no row -> defaults and `updatedAt:null` |
| `PUT /api/access-preferences` | User | `saveAccessPreferencesRequestSchema` | Complete validated settings + server timestamp; 200; stale -> 409 |

Local preferences require neither endpoint nor account. Version 2 reuses all existing fields plus proposed spacing/read-aloud settings. No role, disability or care rights are inferred from them. Account sync is explicit; do not silently overwrite local choices. Default language remains `bn`; appearance/contrast remain independent. See the [preference field table](data-model.md#adapt-field-and-persistence-agreement-proposal).

## Barta and Shonket public information

| Method/path | Auth | Input | Proposed result |
| --- | --- | --- | --- |
| `POST /api/ai/chat` | Public if ephemeral; authenticated for saved mode | `bartaRequestSchema`: question, language, retention (defaults ephemeral) | `BartaAnswer`; 200 grounded/abstained, 501 not connected, 503 dependency failure |
| `GET /api/safety-guidance` | Public | Language `bn/en`, pagination | Page of clinician-reviewed approved `SafetyGuidance`; never generated on demand |

Example proposed question payload (no patient context):

```json
{"question":"গর্ভকালীন পরিচর্যা সম্পর্কে সাধারণ তথ্য জানতে চাই।","language":"bn","retention":{"mode":"ephemeral"}}
```

Grounded answer: `{status:"grounded",answer,citations:[{sourceId,chunkId,sourceVersion,title,publisher,url,locator,reviewedAt}],limitations:[...]}`. Citation array must be nonempty and every citation resolve to retrieved approved content supporting that answer. No example medical answer or fabricated clinical URL is supplied. Structural schema validation cannot establish medical grounding.

Abstention: `{status:"abstained",answer:null,citations:[],reason,message}`; reasons `insufficient_evidence / outside_education_scope / sources_unavailable`. Not connected: `{status:"not_connected",answer:null,message}`. Neither state includes a fabricated answer. Unsafe/out-of-scope questions must not become diagnosis, triage or prescribing. Approved safety/human help is a separate path, available when AI fails.

Saved mode is `{mode:"saved",conversationId:null|UUID,confirmed:true}`. Only authenticated owners may create/append to their conversation. Ephemeral mode creates no message/conversation rows or raw question logs; any external model processing still needs approved server privacy configuration. Retention opt-in is distinct from permission to share with providers; sharing chat contents is unsupported in v1.

## Jibonrekha: separate maternal and baby history

| Method/path | Input | Proposed result/status |
| --- | --- | --- |
| `GET /api/pregnancies` | Pagination, user session | Page of owned pregnancy records, 200 |
| `POST /api/pregnancies` | `createPregnancyRequestSchema` | Pregnancy record with self-reported provenance, 201 |
| `POST /api/babies` | `createBabyRequestSchema` | Separate baby record; nullable same-owner pregnancy link, 201 |
| `GET /api/health` | Pagination and `subject=mother` plus optional `pregnancyId`, OR `subject=baby` with `babyId` | Page of only that owned subject's observations, 200; default subject mother |
| `POST /api/health` | `createObservationRequestSchema` | Self-reported observation, 201; choose actual maternal/baby table by destination |
| `POST /api/maternal-conditions` | `createMaternalConditionRequestSchema` | Self-reported condition record, 201 |
| `POST /api/symptom-notes` | `createSymptomNoteRequestSchema` | `{id}` of self-reported note, 201 |

All routes in this table require authentication. A pregnancy UUID does not authorize baby access and a baby UUID does not authorize the mother's timeline. Unknown subject/filter combinations fail validation; an inaccessible supplied parent gives 404. Maternal destination is `{subject:"mother",pregnancyId:UUID|null}`; baby is `{subject:"baby",babyId:UUID}`. No request contains an owner, clinician verification or gestational-week measurement generator. Record response includes owner, synthetic data mode, revision, timestamps and provenance; do not return owner DTOs directly to providers.

Unit rules and reserved clinician provenance are in [data-model.md](data-model.md#provenance-and-units). Unsupported kinds are rejected; no automatic range interpretation. Authorized report commit is the sole proposed document-extracted write path.

## Bujhi: upload, extract, review, then commit

All steps require owner auth. Only the proposed `prohor-synthetic-lab-v1` PDF template, <=5 MiB, is in scope. Template fixture approval and actual extractor remain pending.

| Method/path | Input contract | Proposed result/status |
| --- | --- | --- |
| `POST /api/reports` | `createDocumentRequestSchema` | `{documentId,uploadPath}`, 201; server-generated private storage path, no public download URL |
| `POST /api/reports/extract` | `startExtractionRequestSchema` with owned document UUID | `{extractionId,status:"queued"}`, 202; only after verified upload bytes exist |
| `GET /api/reports/extractions/:id` | Owned extraction path UUID | `ExtractionResult`, 200; bounded failure codes, no raw engine stack |
| `POST /api/reports/extractions/:id/reviews` | `reviewExtractionRequestSchema` | Immutable review `{reviewId,revision,destination}`, 201 |
| `POST /api/reports/commit` | `commitDocumentReviewRequestSchema` | `{reviewId,records:[HealthObservation...]}`, 201 for first commit, 200 for replay |

Uploading bytes uses Supabase authenticated Storage with owner/path policies, not an invented multipart endpoint. Metadata request does not mean upload succeeded. Extraction state is `queued / processing / review_required / failed`; only completed reviewable extraction returns fields. Field output preserves raw label/value/unit, nullable typed measurement, nullable confidence, uncertainty reasons, page/locator, and `verification:"unverified"`. Confidence is an engine signal, never clinical correctness.

Review contains one decision per extracted field: `rejected`, or `accepted/corrected` with explicit supported measurement and observed time. The server enforces complete field coverage, extraction membership, accepted-value equality to parsed output, ownership and revision; the schema alone cannot check database membership. Wrong destination or unsupported unit fails. Store raw output separately from corrections. A mother may reject all fields, which completes review but does not enable save.

Commit accepts **only** review ID, revision and `confirmSave:true`. It reloads the immutable reviewed destination and values, refuses all-rejected/stale/deleted/foreign reviews, then atomically creates observations and record links. It sets `source:"document_extracted", verification:"user_verified"` with document/field/review references; never clinician confirmed. Duplicate commit returns the existing links; no repeated observation. No partial batch save on failure.

## Shusthota and Poth

| Method/path | Auth/input | Proposed result |
| --- | --- | --- |
| `GET /api/wellness` | Owner; pagination | Page of optional check-ins |
| `POST /api/wellness` | Owner; `createWellnessEntryRequestSchema` | Created check-in, 201; at least one voluntary field, no inferred diagnosis |
| `GET /api/diary` | Owner; pagination | Page of diary entries, always owner only |
| `POST /api/diary` | Owner; `createDiaryEntryRequestSchema` | Diary entry with `privacy:"owner_only"`, 201 |
| `GET /api/facilities` | Public; `q`, district <=100 chars, pagination | Page of sourced `Facility`; unknown attributes say not verified; `bookingIntegration:"not_integrated"` |
| `POST /api/appointments` | Owner; `saveAppointmentRequestSchema` | `{id,status:"self_recorded"}`, 201; saving a note is not a booking |

No diary text field is accepted on a check-in. Activity/rest notes are consolidated in check-ins for the first MVP. Facility source verification is per fact; absence of a facility result/feature is not evidence a service is unavailable. No invented rows or booking slots. Further CRUD, reminders and structured activity/rest endpoints are future contracts requiring a separate adoption PR.

## Consent and Bondhon simulated provider workflow

| Method/path | Input/auth | Proposed result |
| --- | --- | --- |
| `POST /api/consents` | Owner; `createConsentGrantRequestSchema` | Created exact record/field grant, 201; reject foreign record, self-grant, unknown fields or unusable recipient |
| `POST /api/consents/:id/revoke` | Owner; UUID, no body | `{id,revokedAt}`, 200; repeat returns original timestamp |
| `POST /api/care-requests` | Owner; `createSupportRequestRequestSchema` | Persisted request, 201, initially `submitted`; never claim delivered from client intent |
| `GET /api/care-requests/:id` | Owner or active assigned approved provider | Owned DTO or restricted assigned-request projection; provider attached fields require fresh grant checks |
| `GET /api/care-requests/:id/events` | Same request authorization; pagination | Safe event history page; receipt IDs do not authorize access |
| `GET /api/provider/requests` | Active approved provider; pagination | Assigned simulated requests only; no global mother's-record search |
| `POST /api/provider/requests/:id/acknowledge` | Assigned approved provider; expected revision | Updated request only after explicit provider action and valid delivered state |
| `POST /api/provider/requests/:id/respond` | Assigned approved provider; revision + message | Atomic response message + event; updated request in `responded` state |
| `POST /api/care-requests/:id/close` | Mother or assigned approved provider; expected revision | Updated request; closure does not mean a medical concern is resolved |

Mother explicitly chooses recipient, message, purpose, exact record fields and finite consent expiry, reviews them, then sends. A grant is one resource with a typed field allowlist. No `all_records`, raw document, diary or AI scope exists in v1. A request can contain zero grant IDs when only its mother-approved message is sent. Grant IDs must belong to that mother and recipient, be active, and have matching purposes; the request grant join enforces integrity. Expired/revoked grants must not be replaced by copied snapshots.

The server creates the assignment only to an active approved simulated provider selected by the mother, records submitted status/event, and verifies actual queue persistence before a later delivered event. Assignment alone is not acknowledgement. Delivered receipt, acknowledgement actor/assignment and response-message existence are validated in a locked transaction; arbitrary PATCH/event insertion is unavailable. A backend failure returns an error; the caller keeps its draft with **Not sent** unless the server confirms the existing idempotent request.

`SupportRequest` is the owner/internal model. `ProviderRequestSummary` returns only request ID, timestamps, revision, status, simulated mode, communication method and the explicitly submitted message. `ProviderRequest` adds typed `consentedRecords` containing only exact selected fields; neither includes `ownerUserId` or grant IDs. `sharedRecordProjectionSchema` rejects unknown fields and unsafe provenance payloads. Event history returns `SupportRequestEventSummary`, excluding actor UUIDs and internal receipt/assignment evidence. The server still verifies each returned field against active grants. Sharing only `provenance` returns source/verification/time labels, never raw source notes or file references. No full health objects are embedded by default. See the [authorization algorithm](security.md#consent-and-provider-access-algorithm).

## Adoption and testing

Contract validators are usable now; backend integrations remain proposed. Adopt each operation atomically with its UI caller, route validation, authorization, mapper, response envelope, no-store error behavior and integration tests. Do not import server clients/secrets into shared contract files. Breaking changes require a reviewed version change or coordinated caller rollout.

Run `npm run test:contracts` for schema and lifecycle boundary tests (no browser, server, accounts or database needed), plus typecheck and lint. They test strict inputs, unit/subject combinations, extraction review integrity that can be checked structurally, citation shape, consent allowlists and transition rules. They do **not** prove clinical accuracy, provider delivery, storage security or RLS. Day 2 security/integration tests are separately required in [security.md](security.md#migration-and-database-test-release-gate).
