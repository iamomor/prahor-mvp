# PROHOR — Canonical API contracts (Day 2, Step 14)

Updated 18 November 2026. This is the single integration reference. It distinguishes
actual wire behavior from domain proposals. **Implemented means route/code exists,
not deployed or verified against live Supabase.** Domain-owner sign-offs below are
pending; this document does not invent approvals, clinical validation or delivery.

Read with [data model](data-model.md), [security](security.md), [team review](team-contracts.md),
[Auth](../AUTHENTICATION.md), [current profile](../API_ME.md), and [preferences](../API_PREFERENCES.md).

## Status and ownership

- **Implemented:** real route and behavior in the current tree; infrastructure may still be required.
- **Limited:** working educational prototype or optional service; not clinical validation or a deployed backend.
- **Mock:** route exists but is an honest unavailable/501 stub. It does not invent success, records or AI answers.
- **Planned:** no route handler; the existing shared domain schemas are an implementation proposal.
- **Needs Review:** a naming, payload, security or cross-team adoption decision is unresolved. Do not build callers assuming approval.

Final task-confirmed owners (historical AGENTS assignments are not rewritten):

| Developer | Responsibility |
| --- | --- |
| Omor | Shared platform, Auth, database/RLS, API coordination, consent and care-request backend |
| Apurbo | Functional regression, synthetic fixtures, documentation and integration support (starter V3) |
| Iftee | Adapt and all accessibility; shared Barta/AI/audio/extraction interface work (starter V3) |
| Ifty | Jibonrekha maternal/baby records and Bujhi review interface |
| Samin | Wellness, directory, Shonket/Bondhon interfaces and provider workflow UI |

## Contract code and import rules

The established schema home is `src/lib/contracts/`. It already centralizes strict
Zod validators; a second `src/lib/validators/` tree would create competing sources
and is deliberately not added. Domain files are preserved.

- `current-api.ts`: the actual /api method/path pairs, source files, owners,
  status, authentication level, current request validators and status-specific response schemas.
- `transport.ts`: runtime v1 envelope/page validators and proposed path/pagination helpers.
- `api.ts`: `CurrentApiOperations` takes precedence over overlapping future proposals.
  `ApiRequest`/`ApiResponse` remain compatibility aliases; types for an absent method
  still do **not** establish route availability.
- Prefer `CurrentApiRequest<K>` / `CurrentApiResponse<K>` for existing callers.
  Use `ProposedApiRequest<K>` / `ProposedApiResponse<K>` only for owner-reviewed future work.
- `health`, `barta`, `bujhi`, `wellness`, `poth`, `shonket`, `bondhon`, `platform`,
  `adapt`, `common` retain the domain schemas. No server client or secret is imported.

```ts
import { starterBartaRequestSchema, type CurrentApiRequest,
  type ProposedApiRequest } from '@/lib/contracts';
const current: CurrentApiRequest<'POST /api/ai/chat'> = { question: 'Synthetic test question' };
starterBartaRequestSchema.parse(current);
// A future language/retention request is a different proposal, not accepted today:
type FutureBarta = ProposedApiRequest<'POST /api/ai/chat'>;
```

## Current canonical /api routes — source verified

`U` below means Auth `getUser()` verified, confirmed non-anonymous identity and own
profile. `P` additionally requires the trusted DB provider role. No client role or
user UUID is authorization. **Headers, query rules and failure variants are part
of the contract, not merely the body type.**

| Method/path | Status; purpose; owner | Input and authorization | Actual response/status | DB ownership and dependencies |
| --- | --- | --- | --- | --- |
| `GET /api/me` | Implemented; current profile; Omor + Apurbo | U; no body; target-user/role query parameters ignored | 200 v1 `data:{id,displayName,role}`; 401, own-profile 404, unexpected/config/database 500 via v1 error | Own `profiles.user_id=Auth.id`; Auth, provisioning, RLS; no GET initialization |
| `GET /api/preferences` | Implemented; load settings; Omor + Apurbo | U; no body; target-user queries ignored | 200 complete ten-field Adapt v2 `data`, plus `schemaVersion:2,updatedAt,requestId,contractVersion`; missing row -> defaults and null timestamp; 401/403/500 | Own `access_preferences`; Auth/profile, Adapt schema and RLS |
| `PATCH /api/preferences` | Implemented; partial save; Omor + Apurbo | U; exact configured Origin; JSON <=8 KiB; nonempty strict partial `patchAccessPreferencesSchema`; optional `If-Match` from latest GET | 200 complete persisted settings, same envelope and ETag; 400/401/403/409/500 | Own row only; invoker RPC creates missing own row, locks and merges; monotonic version; unspecified values preserved |
| `GET /api/auth/me` | Implemented; Step 11 compatibility; Omor + Apurbo | U; no target-user input | 200 `{profile:{user_id,display_name,role}}`; 401 `{code:'session-required'}`; 503 `{code:'unavailable'}` | Same Auth/profile lookup; preserve existing callers; use `/api/me` for new integrations |
| `GET /api/auth/provider` | Implemented; role gate, not a patient queue; Omor + Samin | P; no target-user input | 200 own legacy profile; 401/403/503 bare-code errors (`session-required/access-denied/unavailable`) | Own profile only; no consent/assignment implementation and no patient records returned |
| `GET /api/health` | Mock; unavailable record persistence; Ifty + Omor | Only Auth `getUser()` is currently checked; no filters consumed | 401/503 `{message}`; valid session -> 501 `{message}`; **no 200 record list** | No record query/write; backend, subject filters, mother/owner authorization and migrations pending |
| `GET /api/jibonrekha` | Limited; synthetic account records; Ifty + Omor | Confirmed mother; no body | 200 `{pregnancies,babies,observations,conditions,symptomNotes,visits,corrections}`; 401/403/503 `{message}` | Owner-scoped RLS reads from existing private-record tables and additive Jibonrekha history tables; maximum 50 pregnancies and 100 of each other record type |
| `POST /api/jibonrekha` | Limited; synthetic account saves; Ifty + Omor | Confirmed mother; same-origin JSON <=8 KiB; strict `type` and record body for pregnancy, baby, supported observation, self-noted condition, symptom note, self-recorded visit, or observation correction; UUID `Idempotency-Key` required | 201 `{saved:true,id}` only after atomic RPC commit; 400/401/403/409/503 `{message}` | `jr_save` owns the write transaction, retry key, source and owner checks. Corrections append a new self-reported row and retain the original. Requires `20261119020000_jibonrekha_account_history.sql`; no offline queue. |
| `POST /api/ai/chat` | Limited educational prototype; Iftee + Omor | Public; strict question/language/retention/optional previousChunkId, or legacy question-only input; JSON <=8 KiB | 200 grounded/abstained/clarification/conversation; 400 invalid or saved mode; 501 unavailable; 503 dependency failure | Bundled project-reference-checked corpus; clinical review pending; no DB or transcript persistence; optional development-only Gemini passage selection |
| `POST /api/ai/barta-audio` | Limited optional speech; Iftee + Omor | Public guide request or exact text/language with signed ticket; JSON <=16,000 bytes | 200 binary WAV/MP3, represented as Uint8Array in the catalog; 400/403/429/502/503 JSON `{message}` | Optional local eSpeak or server-configured Azure; process-local throttle; no transcript persistence |
| `POST /api/care-requests` | Limited simulated care backend; Omor + care UI writer | Confirmed mother; reviewed full Bondhon DTO; exact Origin, JSON <=8 KiB, UUID Idempotency-Key | 201 v1 SupportRequest only after persisted simulated queue receipt; 400/401/403/404/409/503 v1 errors | Cookie-bound RPC; hosted migrations applied and targeted Auth/DB/API checks passed; connected UI and shared preview acceptance pending |

All current outcomes use `Cache-Control: no-store` (private canonical endpoints use
`private, no-store`). Public Barta does not require a Content-Type header.
Care mutations require JSON, exact configured Origin and bounded bodies; absent
RPCs fail closed with 503. Paid AI/speech services need deployment-level abuse controls before public
use; audio's throttle is process-local. GET-only routes have Next.js automatic HEAD;
unsupported methods receive framework 405. These framework responses are outside
the application JSON schemas. No CORS wildcard/credentialed cross-origin access is added.

### Platform examples and headers

```json
{"data":{"id":"10000000-0000-4000-8000-000000000001","displayName":"Ayesha","role":"mother"},"requestId":"40000000-0000-4000-8000-000000000001","contractVersion":"1"}
```

Preference request: `{"textScale":"large","highContrast":true}`. The response
contains all ten existing keys: `theme,highContrast,textScale,spaciousLayout,
reducedMotion,simplifiedContent,communication,language,textSpacing,readAloud`.
Their values/defaults and the homepage-only font/compact-density boundary are in
[the preferences contract](../API_PREFERENCES.md). No new modes or clinical rights.
GET returns `ETag: "missing"` when no row exists, otherwise the quoted exact
`updatedAt` string. PATCH `If-Match` uses that exact value; no wildcard/weak/multiple
ETags. A stale version gives 409; clients reload/review, not silently retry.
Unconditional partial writes merge under the row lock; same-field updates serialize.

## Naming conflicts and compatibility decisions

### Day 3 integration candidate

`GET /api/preferences` and `PATCH /api/preferences` accept the optional
`X-Prohor-Account` header. A value different from the server-verified caller returns
409 before any preferences read/write. This prevents a stale tab from applying one
account's draft to a newly signed-in account. It grants no authorization and changes
no database schema. New UI callers send it and continue to use exact ETag/If-Match.

`POST /api/ai/chat` now retains Iftee's optional server-side OpenRouter selection
of approved passages. Responses remain source-grounded, bounded and validated;
medical diagnosis and unrestricted generation are not added. Optional generated
audio retains signed tickets, a 4 MB response cap and a process-local throttle.
`POST /api/ai/barta-audio` also supports Fish Speech and bundled clips; a configured
bundled clip that is missing returns 404. Provider availability needs deployment
verification; text remains available.

| Method/path | Status | Inputs | Outcomes and limits |
| --- | --- | --- | --- |
| `GET /api/poth/facilities` | Limited; public | q <=120, district <=100, limit 1–100 | 200 `{facilities,sourceType:'reviewed-import',bookingAvailable:false}` or 400 `{error}`. The supplied reviewed dataset is empty; no invented entries or booking. |
| `GET /api/poth/nearby` | Limited; public | explicit Bangladesh lat/lon and allowed radius 1–20 km | 200 `{places,truncated,source:'openstreetmap-unverified',cached}` or 400/429/503 `{error}`. Community data is separate from reviewed directory data; provider tags do not verify clinical services or accessibility. No booking. |

These additions require Omor's contract review before promotion to `develop`.
Record/review features remain explicitly synthetic local demos. No health record,
report extraction, care delivery, wellness or provider backend is invented.

No route is renamed, redirected or newly implemented by Step 14.

| Names in discussion | Canonical/current choice | Resolution/status and rationale |
| --- | --- | --- |
| `/api/me` vs `/api/profile` vs `/api/auth/me` | `/api/me` for new callers | Implemented; `/api/profile` absent. Preserve `/api/auth/me` wire shape as compatibility, not an identical response alias. Removal/migration needs coordinated review. |
| `/api/preferences` vs `/api/access-preferences` | GET/PATCH `/api/preferences` | Implemented. `GET /api/access-preferences` and `PUT /api/access-preferences` are old unimplemented proposals; Needs Review, not callable aliases. Do not implement duplicate persistence. |
| `/api/health` vs `/api/health/observations` | Keep `/api/health` | Current GET is Mock; proposed POST and real observation list are Planned/Needs Review. Alternative path absent; changes require Ifty + Omor approval. |
| `/api/ai/chat` vs `/api/ai/education` | Keep `/api/ai/chat` | Current Mock request is question-only. Full education/RAG payload adoption is Needs Review with Iftee + Omor; no alternate route exists. |
| `/api/reports/extract` vs `/api/documents/extract` | Proposed `/api/reports/extract` from Step 7 | Planned naming, Needs Review by Iftee + Ifty + Omor. Neither exists. Document entities do not force a wire-route rename. |
| Provider generic status PATCH vs explicit actions | Proposed acknowledge/respond/close paths below | Planned; generic status mutation is not supported. Actions require actor/revision/evidence checks; Omor + Samin approval pending. |
| `support_requests` SQL vs `/api/care-requests` | Preserve wire name | Table/model proposal does not justify changing a working caller path; backend adoption pending. |

## Responses, errors and validation

The implemented canonical platform envelope is `{data,requestId,contractVersion:'1'}`.
Preferences add `schemaVersion:2,updatedAt`. V1 error:

```json
{"error":{"code":"invalid_request","message":"Invalid request.","fieldErrors":[{"path":"destination.babyId","message":"Choose a valid owned baby record."}]},"requestId":"40000000-0000-4000-8000-000000000001"}
```

`fieldErrors` is optional, with path <=200 and corrective message <=300 characters;
error message <=500. Never echo submitted medical values, SQL/stack traces,
credentials, tokens or OCR contents. Current canonical handlers return safe generic
messages; field-level errors are a supported shape, not a claim every handler
populates them. Legacy identity/stub responses above remain intentionally distinct.
Do not force their callers onto v1 without coordinated adoption.

| HTTP | V1 code | Meaning / present implementation notes |
| --- | --- | --- |
| 400 | `invalid_request` | Invalid/unknown field, malformed body/value/header; legacy stubs use their documented bare shapes |
| 401 | `unauthenticated` | Missing/invalid/expired authentication; reject before private lookup |
| 403 | `forbidden` | Disallowed Origin/operation/role; no RLS bypass |
| 404 | `not_found` | Missing own profile; future inaccessible resource IDs must not reveal another owner's data |
| 409 | `conflict` | Preference ETag conflict; future revision/idempotency conflict |
| 429 | `rate_limited` | Shared shape reserved; app-level enforcement/Retry-After policy needs implementation/review, not claimed working |
| 500 | `unavailable` | `/api/me` and preferences safely mask unexpected/configuration/DB failures |
| 503 | `unavailable` | Proposed dependency failures; current legacy/health routes retain bare 503 shapes |
| 501 | `not_implemented` | Proposed v1 service-unavailable workflow; existing stubs use their explicit `not_connected/not_sent` responses |
| 413 / 415 | `file_too_large` / `unsupported_format` | Planned Bujhi file limits and supported actual bytes |

Only current schemas/statuses in `currentApiContracts` describe real wire behavior.
Zod validation establishes structure, not clinical correctness, ownership, source
approval, consent, delivery or provider credentials.

## Shared security, IDs and future endpoint conventions

- Confirmed session + RLS-preserving public-key SSR client. Never trust ownership,
  roles, clinician confirmation, assignments or consent from submitted claims.
- Maternal private resources are mother-owned; providers get only narrow currently
  assigned/consented projections. Provider role alone is never blanket access.
- IDs are UUIDs; DB snake_case is explicitly projected to camelCase DTOs. Maternal
  `{subject:'mother',pregnancyId:UUID|null}` and baby `{subject:'baby',babyId:UUID}`
  destinations remain distinct, with same-owner relationships checked server-side.
- ISO 8601 timestamps include an offset. Measurements are precise decimal strings
  with explicit supported units and provenance, never generated from gestational age.
- Owner, original source and verification are server controlled. Bujhi raw extraction
  stays unverified until reviewed; no browser payload becomes clinician-confirmed.
- Diary, AI transcripts and raw reports are excluded from v1 sharing. Public
  education/directory/safety reads need no pregnancy profile and get no private context.
- AI secrets stay server-only. Citations must resolve to real approved source/version
  and support the response; schemas cannot prove retrieval or clinical approval.
- Planned lists use `limit` 1–50 (default 20), opaque cursor <=2048 and `{items,nextCursor}`;
  bind cursors to actor/filter and sort by time + UUID. `paginationQuerySchema` and
  `resourceIdParamsSchema` are proposals, not silently enforced by current GETs.
- Planned mutation idempotency uses an `Idempotency-Key` UUID + actor/operation/digest
  with atomic receipts. Receipt/audit tables are not created in this step; no current
  stub claims durable retry semantics. Owner review is required before real writes.
- Intended DB names below are proposed entities from the data model. **Only profiles
  and access_preferences have active table migrations.** Do not query future tables
  or provision clinical/storage resources based on this contract document alone.

## Planned capability responsibility and dependencies

The following domain sections retain existing schemas and detailed target payloads.
All absent handlers are **Planned**; target behavior overlapping a Mock route is
**Needs Review** for coordinated adoption. No domain schema or medical vocabulary
is changed or approved by Step 14. All proposed private failures use the v1 policy
above (400/401/403/404/409/429/500/503; Bujhi additionally 413/415); GET success is
200 unless noted, creates are 201 and extraction queue acceptance is 202.

| Capability / sections below | Responsible developers | Intended DB / ownership | Dependencies and additional security |
| --- | --- | --- | --- |
| Current profile / preferences | Omor + Apurbo | Own profiles/access_preferences only | Implemented above; Auth, RLS, explicit account/local reconciliation |
| Pregnancy/maternal observations/conditions/notes | Ifty + Omor | pregnancy_records, health_observations, maternal_conditions, maternal_symptom_notes; mother-owned | Auth, parent ownership, supported units/provenance and Bujhi review; no provider direct owner DTOs |
| Separate linked baby records | Ifty + Omor | baby_records + baby_observations; same mother owner, nullable pregnancy link | Auth, same-owner composite relationships; a baby ID does not grant maternal history |
| Wellness / private diary | Samin + Omor | wellness_entries and wellness_diary_entries; owner-only | Private diary never included in check-in or sharing; optional supported wellness only |
| Barta educational AI | Iftee + Omor | Approved knowledge_sources/chunks; conversations/messages only with opt-in | RAG/source review, abstention, privacy/rate limits, no unvalidated diagnosis/triage |
| Bujhi extraction / review | Iftee + Ifty + Omor | medical_documents, document_extractions, extracted_fields, document_reviews, document_record_links; owner-bound | Private Storage, supported fixture, extraction worker, immutable review and atomic verified commit |
| Facility directory / visit preparation | Samin | facility_directory and sourced per-fact accessibility/contact facts; public published projection; appointments self-owned | Reviewed provenance; no invented facilities/access features/slots or booking confirmation |
| Reviewed safety guidance | Samin + Omor | Approved safety_guidance versions; public | Clinical content review and source references; accessible without AI |
| Care submission / provider queue / updates | Omor + Samin | support_requests, assignments, grant joins, status events; mother owner, assigned provider projection | Auth, provider approval, consent, delivery evidence, atomic revisions/audit; never automatic acknowledgement |
| Consent-controlled sharing | Omor, affected domain owners review | consent_grants + exact resource/field scopes; owner-controlled | Finite expiry/revocation + relationship checks; no diary/chat/raw report wildcards |

## Barta and Shonket public information

Status: POST /api/ai/chat is a limited public educational prototype. Ephemeral requests are supported; saved retention is unavailable and rejected (fixed safety replies may precede that rejection). GET safety guidance remains Planned. Owners: Iftee + Omor for Barta; Samin + Omor for reviewed safety. No clinical approval is implied.

| Method/path | Auth | Input | Proposed result |
| --- | --- | --- | --- |
| `POST /api/ai/chat` | Public ephemeral only; saved mode unavailable | `bartaRequestSchema`: question, language, retention (defaults ephemeral), optional previousChunkId; legacy question-only compatibility | `BartaAnswer`; 200 grounded/abstained/clarification/conversation, 400 invalid/unsupported retention, 501 not connected, 503 dependency failure |
| `GET /api/safety-guidance` | Public | Language `bn/en`, pagination | Page of clinician-reviewed approved `SafetyGuidance`; never generated on demand |

Example proposed question payload (no patient context):

```json
{"question":"গর্ভকালীন পরিচর্যা সম্পর্কে সাধারণ তথ্য জানতে চাই।","language":"bn","retention":{"mode":"ephemeral"}}
```

Grounded answer: `{status:"grounded",answer,citations:[{sourceId,chunkId,sourceVersion,title,publisher,url,locator,reviewedAt}],limitations:[...]}`. Citation array must be nonempty and every citation resolve to retrieved approved content supporting that answer. No example medical answer or fabricated clinical URL is supplied. Structural schema validation cannot establish medical grounding.

Abstention: `{status:"abstained",answer:null,citations:[],reason,message}`; reasons `insufficient_evidence / outside_education_scope / sources_unavailable`. Not connected: `{status:"not_connected",answer:null,message}`. Neither state includes a fabricated answer. Unsafe/out-of-scope questions must not become diagnosis, triage or prescribing. Approved safety/human help is a separate path, available when AI fails.

Saved mode is `{mode:"saved",conversationId:null|UUID,confirmed:true}`. Only authenticated owners may create/append to their conversation. Ephemeral mode creates no message/conversation rows or raw question logs; any external model processing still needs approved server privacy configuration. Retention opt-in is distinct from permission to share with providers; sharing chat contents is unsupported in v1.

## Jibonrekha: separate maternal and baby history

Status: Planned, except GET /api/health is Mock and its future list payload is Needs Review. Owners: Ifty + Omor. Existing measurement vocabularies are structural proposals, not clinical approval.

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

Status: Planned; report format, extractor/review integration and naming require owner review. Owners: Iftee + Ifty + Omor.

All steps require owner auth. Only the proposed `prohor-synthetic-lab-v1` PDF template, <=5 MiB, is in scope. Template fixture approval and actual extractor remain pending.

| Method/path | Input contract | Proposed result/status |
| --- | --- | --- |
| `POST /api/reports` | `createDocumentRequestSchema` | `{documentId,uploadPath}`, 201; server-generated private storage path, no public download URL |
| `POST /api/reports/extract` | `startExtractionRequestSchema` with owned document UUID | `{extractionId,status:"queued"}`, 202; only after verified upload bytes exist |
| `GET /api/reports/extractions/:id` | Owned extraction path UUID | `ExtractionResult`, 200; bounded failure codes, no raw engine stack |
| `POST /api/reports/extractions/:id/reviews` | `reviewExtractionRequestSchema` | Immutable review `{reviewId,revision,destination}`, 201 |
| `POST /api/reports/commit` | Current limited synthetic hemoglobin request uses report/pregnancy UUIDs, SHA-256 source hash, raw field, reviewed value and date, and `confirmSave:true` | `{saved:true,observationId}`, 200 for first commit or identical retry. A broader document review contract remains proposed. |

Uploading bytes uses Supabase authenticated Storage with owner/path policies, not an invented multipart endpoint. Metadata request does not mean upload succeeded. Extraction state is `queued / processing / review_required / failed`; only completed reviewable extraction returns fields. Field output preserves raw label/value/unit, nullable typed measurement, nullable confidence, uncertainty reasons, page/locator, and `verification:"unverified"`. Confidence is an engine signal, never clinical correctness.

Review contains one decision per extracted field: `rejected`, or `accepted/corrected` with explicit supported measurement and observed time. The server enforces complete field coverage, extraction membership, accepted-value equality to parsed output, ownership and revision; the schema alone cannot check database membership. Wrong destination or unsupported unit fails. Store raw output separately from corrections. A mother may reject all fields, which completes review but does not enable save.

Commit accepts **only** review ID, revision and `confirmSave:true`. It reloads the immutable reviewed destination and values, refuses all-rejected/stale/deleted/foreign reviews, then atomically creates observations and record links. It sets `source:"document_extracted", verification:"user_verified"` with document/field/review references; never clinician confirmed. Duplicate commit returns the existing links; no repeated observation. No partial batch save on failure.

## Shusthota and Poth

Status: Planned. Owner: Samin; Omor collaborates on private wellness data/security. Directory is public only after source/fact review; diary always owner-only.

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

Status: **Working simulated backend against hosted Supabase; application source
uncommitted, connected UI/shared preview acceptance pending.** All routes below
call the existing cookie-bound care adapter. Forward migrations through
`20261118070000` are applied to the operator-selected app backend: private records,
care tables/RPCs, account-role approval integration, deferred status evidence and
explicit HTTP conflict errors. The proposal files remain historical candidates.
Targeted verification passed all ten HTTP operations with actual hosted Auth and
database persistence (23 checks), including foreign-owner/pending-provider denial,
retry deduplication and revoke. This is a simulated app queue, not clinician
delivery. Omor owns backend/security; the delegated care UI writer consumes this
contract (Apurbo's Shonket work per the operator's latest instruction). No merged
handoff SHA or deployed application preview is claimed.

### Teammate integration prerequisites

1. Receive the reviewed merged source SHA, install its locked dependencies, and
   use the same approved development Supabase URL/public key privately supplied by
   Omor. Do not copy his complete environment file or use service-role credentials.
2. Set `NEXT_PUBLIC_SITE_URL` to the exact local app origin (normally
   `http://localhost:3000`) and restart the app after environment changes. Call
   relative `/api/...` paths on that app; sessions are HttpOnly cookies. Another
   developer cannot call Omor's localhost. Do not add wildcard CORS or move tokens
   into localStorage. Hosted migrations are already applied; do not reapply/reset
   the shared database.
3. Use a synthetic mother account for submission and a separately approved
   simulated provider for the queue. One provider is already operator-approved;
   obtain its login access privately from its owner, or have Omor approve the
   teammate's exact provider application. No new provider is required merely to
   consume the API. Use separate browser profiles/private contexts for the two
   roles. A doctor/CHW signup remains pending until trusted approval.
4. As mother, load `/api/care-recipients`; select the returned UUID rather than
   hardcoding an email/UUID. The request transaction creates its assignment to that
   selected approved provider. There is no manual assignment setup or generic
   patient-access endpoint. Provider must use the provider workspace.
5. Start with an explicitly reviewed message and `consentGrantIds:[]`. This shares
   the submitted message only. Record sharing additionally requires real owned
   saved record IDs, finite reviewed grants and matching recipient/purpose.
   Health/wellness HTTP persistence remains separate unfinished domain work;
   do not send browser-demo record IDs as though they exist in the database.
6. Keep one UUID retry key for an identical reviewed submission/action. Retain
   draft/key on network timeout or unknown failure; retry the identical payload to
   reconcile. Changed content requires a new reviewed action/key. Validate v1
   response DTOs, use returned revisions, display simulated delivery honestly and
   handle loading/empty/expired/denied/conflict/unconfirmed states.

The frontend work is recipient/purpose/message review and submit, optional scoped
record grants, mother detail/events/status/close/revoke, and assigned provider
list/detail/acknowledgement. A stored provider response is supported, but the
current detail DTO does not return response message text; do not promise a message
thread. Revocation blocks future provider reads and actions; it cannot erase what
was already viewed. Keep urgent reviewed help accessible independently of this
non-emergency simulated request path. Full connected-UI QA follows integration.

| Method/path | Input/auth | Local result after database setup |
| --- | --- | --- |
| `GET /api/care-recipients` | Confirmed mother; no body/query | 200 v1 array of `{id,displayName,providerMode:"simulated"}` from trusted current provider approvals; empty array means none configured |
| `POST /api/consents` | Owner; `createConsentGrantRequestSchema` | Created exact record/field grant, 201; reject foreign record, self-grant, unknown fields or unusable recipient |
| `POST /api/consents/:id/revoke` | Owner; UUID, no body | `{id,revokedAt}`, 200; repeat returns original timestamp |
| `POST /api/care-requests` | Owner; `createSupportRequestRequestSchema` | 201 persisted `delivered`/revision 2 only after submitted + delivery events and actual simulated queue receipt in one transaction |
| `GET /api/care-requests/:id` | Owner or active assigned approved provider | Owned DTO or restricted assigned-request projection; provider attached fields require fresh grant checks |
| `GET /api/care-requests/:id/events` | Same request authorization; pagination | Safe event history page; receipt IDs do not authorize access |
| `GET /api/provider/requests` | Active approved provider; pagination | Assigned simulated requests only; no global mother's-record search |
| `POST /api/provider/requests/:id/acknowledge` | Assigned approved provider; expected revision | 200 updated request only after explicit provider action and valid delivered state |
| `POST /api/provider/requests/:id/respond` | Assigned approved provider; revision + message | 200 atomic response message + event; updated request in `responded` state |
| `POST /api/care-requests/:id/close` | Mother or assigned approved provider; expected revision | 200 updated request; closure does not mean a medical concern is resolved |

Mother explicitly chooses recipient, message, purpose, exact record fields and finite consent expiry, reviews them, then sends. A grant is one resource with a typed field allowlist. No `all_records`, raw document, diary or AI scope exists in v1. A request can contain zero grant IDs when only its mother-approved message is sent. Grant IDs must belong to that mother and recipient, be active, and have matching purposes; the request grant join enforces integrity. Expired/revoked grants must not be replaced by copied snapshots.

The server creates the assignment only to an active approved simulated provider selected by the mother, records submitted status/event, and verifies queue persistence before the delivered event in the same transaction. Assignment alone is not acknowledgement. Delivered receipt, acknowledgement actor/assignment and response-message existence are validated in a locked transaction; arbitrary PATCH/event insertion is unavailable. Confirmed pre-write validation/authorization rejection may say **Not sent**. Network loss, invalid persistence responses or unknown 5xx mean **Submission unconfirmed**: preserve draft/key and reconcile by identical retry.

All care results use v1 success/error envelopes, `private, no-store` and
`Referrer-Policy: no-referrer`. Errors: 400 invalid input, 401 missing session,
403 role/Origin denial, 404 unavailable or foreign resource, 409 account/revision/
retry conflict, 503 unavailable/unconfirmed. Care POSTs require exact configured
Origin. Creates, acknowledge/respond/close require `Idempotency-Key: <UUID>`;
revoke has no body and retains its first timestamp. `X-Prohor-Account` optionally
detects stale account drafts; it grants no access. IDs are UUIDs. Provider/events
lists accept `limit=1..50` (default 20) and the previous opaque `cursor`; other
care routes reject all query keys, and duplicate keys are rejected. Retry
payloads are compared to immutable original rows; changed target/payload/revision
returns 409. Provider replays recheck current assignment and grants. Closing a
request withdraws message-only access; revoking any attached grant blocks future
provider list/read/actions. The owner can still reconcile the original request.

The old `{message,method}` care form remains a non-sending UI prototype and must
not be connected as the new submission form. Samin adds explicit recipient,
purpose, exact grant review, retained retry key, status and revocation UI after
reviewed backend adoption. See [care handoff](CARE_BACKEND_REVIEW.md) for examples,
SQL dependencies, simulated provider administration and pending acceptance.

`SupportRequest` is the owner/internal model. `ProviderRequestSummary` returns only request ID, timestamps, revision, status, simulated mode, communication method and the explicitly submitted message. `ProviderRequest` adds typed `consentedRecords` containing only exact selected fields; neither includes `ownerUserId` or grant IDs. `sharedRecordProjectionSchema` rejects unknown fields and unsafe provenance payloads. Event history returns `SupportRequestEventSummary`, excluding actor UUIDs and internal receipt/assignment evidence. The server still verifies each returned field against active grants. Sharing only `provenance` returns source/verification/time labels, never raw source notes or file references. No full health objects are embedded by default. See the [authorization algorithm](security.md#consent-and-provider-access-algorithm).


## Proposed request field dictionary

These are schema definitions; care now has local handlers as documented above,
while private health/wellness/report handlers remain proposals. Except fields
explicitly marked optional/defaulted, listed fields are required even when nullable.
Unknown keys are rejected. Open the linked domain source before adopting a proposal.

| Existing validator / source | Exact request fields and validation summary |
| --- | --- |
| `createPregnancyRequestSchema` — [health.ts](../../src/lib/contracts/health.ts) | `estimatedDueDate:date|null`, `lastMenstrualPeriodDate:date|null`, `label:string(1–100)` |
| `createBabyRequestSchema` — health | `pregnancyId:UUID|null`, `label:string(1–100)`, `birthDate:date|null`; same-owner link checked server-side |
| `createObservationRequestSchema` — health | `destination` maternal/baby union, matching `measurement:{kind,value,unit}`, `observedAt:offset timestamp`, `sourceNote:string(1–500)|null`; no owner/provenance/clinician fields accepted |
| `createMaternalConditionRequestSchema` / `createSymptomNoteRequestSchema` — health | Condition: `pregnancyId:UUID|null,label:string(1–300),documentedAt:timestamp,sourceNote:string(1–500)|null`; note: `pregnancyId:UUID|null,note:string(1–2000),occurredAt:timestamp` |
| `createWellnessEntryRequestSchema` — [wellness.ts](../../src/lib/contracts/wellness.ts) | `occurredAt:timestamp`, nullable `mood:comfortable/mixed/difficult/prefer_not_to_say`, nullable `energy:low/medium/high/prefer_not_to_say`, nullable `activityNote/restNote:string(1–1000)`; at least one voluntary field non-null |
| `createDiaryEntryRequestSchema` — wellness | `text:string(1–10000),occurredAt:timestamp`; server `privacy:owner_only`; never a shareable resource |
| `bartaRequestSchema` — [barta.ts](../../src/lib/contracts/barta.ts) | `question:string(1–1200),language:bn/en`, `retention` defaults to `{mode:ephemeral}`; saved mode requires `conversationId:UUID|null,confirmed:true` |
| `createDocumentRequestSchema` — [bujhi.ts](../../src/lib/contracts/bujhi.ts) | `format:prohor-synthetic-lab-v1`, `contentType:application/pdf`, integer `byteSize:1..5242880`, `syntheticConfirmed:true`; actual uploaded bytes must also be checked |
| `startExtractionRequestSchema` — Bujhi | `documentId:UUID`; owner, actual upload and approved template checks required |
| `reviewExtractionRequestSchema` — Bujhi | Positive `expectedExtractionRevision`, maternal/baby `destination`, 1–100 unique field `decisions`, `reviewedByMother:true`; decisions have `extractedFieldId`, `decision:rejected` or `accepted/corrected` + supported `measurement` + `observedAt` |
| `commitDocumentReviewRequestSchema` — Bujhi | `reviewId:UUID,expectedReviewRevision:positive integer,confirmSave:true`; no second values/destination payload |
| `saveAppointmentRequestSchema` — [poth.ts](../../src/lib/contracts/poth.ts) | `facilityId:UUID|null,facilityLabel:string(1–300),visitDate:date,visitTimeNote:string(1–100)|null,source:self_recorded`; never implies booking |
| `createConsentGrantRequestSchema` — [bondhon.ts](../../src/lib/contracts/bondhon.ts) | `granteeUserId:UUID`, typed `record` + exact field allowlist, `purpose:string(1–300)`, `startsAt/expiresAt:timestamps` with finite ordered expiry, `reviewConfirmed:true`; server rejects self/foreign/inactive grants |
| `createSupportRequestRequestSchema` — Bondhon | `recipientUserId:UUID,message:string(1–1000),method:text/aac/call,purpose:string(1–300),consentGrantIds:unique UUID[](0..20),reviewConfirmed:true` |
| Provider action schemas — Bondhon | Acknowledge/close: `expectedRevision:positive integer`; respond adds `message:string(1–2000)`; current actor, assignment, state and evidence are server-verified |

All future resource paths with `:id` require a UUID; no arbitrary path ID grants
access. Observation `value` is a decimal string (or a note string for note kind),
not a JavaScript number. Supported exact kind/unit/destination unions remain in
`health.ts`; no dictionary is changed or clinically approved in this step.
Knowledge/citation sources and Bujhi raw fields/confidence/uncertainty/locators
remain explicit response schemas. Provider projections and consent share keys
reuse `sharing.ts`; never return full owner records by casting them to a DTO.

## Supporting authentication routes outside /api

These routes are already implemented platform plumbing, not new domain APIs.
Their inputs/response redirects remain as implemented; [Auth details](../AUTHENTICATION.md)
and `src/lib/auth/validation.ts` are authoritative. They require the configured
Origin on POST, use public-key SSR cookies and never accept a provider role.

| Route | Input / actual result | Owner / dependencies |
| --- | --- | --- |
| `POST /auth/sign-up` | Strict `email,password,next?`; signup password 12–128; 200 generic `check-email` or safe `redirectTo`; 400 validation/registration, 403 Origin, 401/503 profile/Auth failure | Omor + Apurbo; Auth + mother provisioning, confirmation, own profile |
| `POST /auth/sign-in` | Strict `email,password,next?`; password 1–128; 200 safe `redirectTo`, generic 400 auth/input, 403 Origin, 401/503 profile/Auth failure | Omor + Apurbo; Auth + profile validation |
| `POST /auth/email-link` | Strict `email,next?`; no implicit account creation; 200 generic `check-email`, 400/403/503 failures | Omor + Apurbo; Auth email delivery/PKCE |
| `POST /auth/sign-out` | Current cookie session; successful Auth termination -> fixed 303 sign-in redirect; 403/503 on failure | Omor; no GET mutation; current-device scope |
| `GET /auth/callback` | PKCE code or supported token-hash type; verifies through Auth before safe role-aware 307 destination; invalid link -> sign-in recovery; bad config -> 503 | Omor; confirmation, SSR cookies, safe path + trusted role |

Auth POST success/error codes are the existing hyphenated `{code}` / `redirectTo`
shapes, not forced onto v1 here. Email <=254; strings are normalized/validated by
the existing Auth schemas; redirect input <=2048 and sanitized again server-side.

## Review gates and unresolved decisions

| Decision | State / responsible reviewers |
| --- | --- |
| Keep current paths/payloads and legacy profile compatibility | Source-verified baseline; no renames/removals performed |
| Barta public language/context integration | Limited — Iftee + Omor; bundled corpus and ephemeral UI integrated. Clinical review, persistent conversation backend and production AI controls remain Needs Review |
| Replace health stub with mother/baby list; add writes and complete CRUD/list coverage | Needs Review — Ifty + Omor; schemas/clinical dictionaries, parent authorization and migrations not approved by this document |
| Report route family, supported fixture and upload/extraction/review engine boundary | Needs Review — Iftee + Ifty + Omor; neither documents/extract nor reports/extract exists |
| Care submission, provider queue/projections/status actions | Needs Review — Omor + Samin; assignment/consent/evidence/audit/idempotency dependencies must exist before success |
| Exact consent scope/purpose/expiry and provider credential approval policy | Needs Review — Omor + affected owners; no diary/AI/raw-report default sharing |
| Retire old access-preferences GET/PUT proposals or legacy auth/me path | Needs Review — Omor + Apurbo; no duplicate endpoints added |
| Expand account schema for homepage-only font/compact density | Needs Review — Apurbo + Omor; existing ten-field schema/local storage preserved |
| Rate limits, Retry-After, receipt retention, pagination cursor signing and real-data retention/deletion | Needs Review — Omor + owners; shapes are not implemented infrastructure |

Approval requires a real reviewer/date/affected version/files and decision in
[team-contracts.md](team-contracts.md). No owner signatures, clinical sources,
provider acknowledgements or source manifests have been invented. Future breaking
changes update schema, document, caller and integration tests together; review a
version change rather than silently changing a working route.

## Verification and adoption

- Contract tests verify strict valid/invalid payloads, metadata/envelope shapes,
  current-vs-proposed separation and filesystem route coverage. Every operation
  in the type map must be present in this document.
- An HTTP check exercises all eight current method/path pairs against the local
  app with Supabase explicitly disabled and validates actual status/response shapes.
  It also checks stub rejection paths and no-store behavior. This does not prove
  successful database/Auth operation or live RLS.
- Existing domain tests cover unit/provenance, mother/baby destinations, raw OCR
  uncertainty/review boundaries, consent allowlists, diary privacy and provider
  transitions. These are structural checks, not clinical or deployment validation.
- Actual Supabase Auth/RLS, private Storage, RAG/extraction, queue delivery, current
  consent/revocation and concurrency need owner-recorded integration evidence.
  None is claimed completed merely because TypeScript compiles or a schema exists.

```powershell
npm.cmd run test:contracts
npm.cmd run test:auth -- --grep 'centralized schemas'
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

See [Step 14 verification](../qa/DAY2_CODE_REVIEW.md#step-14-contract-verification-historical-evidence) for actual PASS/FAIL/NOT RUN
results and the exact changed-file list. No feature route, UI, database table,
production migration or deployed resource is introduced by this contract step.

## 18 November care continuation — hosted backend activated

[care-backend-v1](CARE_BACKEND_REVIEW.md) supplies isolated SQL transactions and
`src/lib/care` adapters using the existing Bondhon validators. Its new
SQL/adapter tests are implementation evidence in disposable PostgreSQL with
injected identity. Ten local HTTP operations now import the adapter and the
current catalog records the deliberate replacement of the 501 care stub. Forward
SQL is now applied and targeted hosted Auth/database/HTTP checks passed. The
connected frontend remains unfinished. The current consent section above
supersedes earlier candidate documents saying the SQL is unapplied. Application
publication, shared preview, complete UI acceptance and a merged handoff SHA
remain pending. No clinical validation or real-provider delivery is claimed.
