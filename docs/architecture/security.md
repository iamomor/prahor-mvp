# PROHOR — database security contract

Status: **proposed requirements, not implemented enforcement**. Lead: Omor; domain review required. Step 7 has validated DTOs, not deployed RLS, storage or authorization tests. See [baseline](data-model.md#repository-baseline-and-implementation-boundary) and [review gates](team-contracts.md).

## Authentication, roles and transaction boundaries

Private endpoints validate a Supabase session server-side; do not trust request `ownerUserId`, UI routes, local-storage roles or editable Auth user metadata. In this repository `createServerSupabase()` uses the publishable key plus request cookies and `auth.getUser()`. Preserve the caller's identity for RLS. Never use a browser service-role/secret key. A server secret bypasses RLS and therefore does not replace explicit authorization.

Profile creation is controlled and idempotent against an Auth identity. Roles are many-to-many, assigned only through a trusted workflow. Public Barta, approved safety guidance and published facility listings are available to anonymous readers without a pregnancy profile. Abuse limits do not require collecting health history. Provider approval and clinical credential authorization are separate; simulated providers have no clinical-write privilege.

Every exposed private table has RLS enabled and explicit SQL grants, including INSERT `WITH CHECK` and UPDATE old/new ownership checks. Ownership/parent immutability and allowed status/provenance changes also need constraints or restricted functions: RLS alone does not validate columns. Use a non-exposed schema for worker internals where possible. Views over private records must respect caller security or be unexposed. Do not create a provider-facing view that bypasses RLS.

Preferred provider access is a narrow authenticated RPC/server projection, with no direct provider SELECT on underlying health tables. It checks all current authorization and emits an access audit event before returning only permitted fields. Owner-only policies remain on base tables. If a `SECURITY DEFINER` function is necessary, pin `search_path = ''`, schema-qualify references, revoke default/PUBLIC execution and grant only the reviewed caller role. Obtain caller identity from validated auth context, not a parameter. Avoid mutually recursive policies and arbitrary SQL/resource selectors. Review function owner privileges explicitly.

## RLS and grants policy matrix for Day 2

All unspecified operations are denied. “Owner writes” refers only to permitted fields/workflows, never ownership, clinician verification, role assignment or trusted status changes.

| Resource family | Anonymous | Mother / owner | Assigned approved simulated provider | Trusted server/worker |
| --- | --- | --- | --- | --- |
| Profiles, Adapt, notification preferences | Deny | Own select/allowed update; controlled creation | No other user's settings/profile | Idempotent provisioning only |
| `user_roles`, `provider_profiles` | Deny | Read own role/approval; no self-approval | Read own public-safe approval projection | Approved platform assignment/revocation |
| Maternal and baby records, conditions, notes, observations | Deny | Own read; self-report create; reviewed correction/delete workflow | Exact consented read projection only; no clinical writes | Validate composite ownership; Bujhi commit only after review |
| Wellness entries and optional log families | Deny | Own permitted CRUD | Exact selected check-in projection only | No diagnosis or automated sharing |
| **Wellness diary** | Deny | Own permitted CRUD | **Deny always in v1, including assigned providers and supporters** | No AI/summary/analytics access; maintenance restricted |
| Documents, extraction attempts/fields/reviews/links | Deny | Own structured read; owner upload; review/commit through validated workflow | Deny raw documents/extractions in v1 | Restricted worker reads private file; owner-checked review commit |
| AI conversations/messages/answer sources | Deny | Own only after retention opt-in | Deny | Optional authorized persistence; no raw prompts in telemetry |
| Knowledge sources/chunks | Approved public source metadata only | Same public view | Same public view | Ingestion/review only; approved version required for retrieval |
| AI evaluation results | Deny | Deny (not a personal data surface) | Deny | Synthetic evaluation/reviewer only |
| Safety guidance | Approved clinician-reviewed public content only | Same | Same | Publish/retract reviewed content; no LLM triage |
| Facility directory/accessibility/contacts | Published, reviewed projection with per-attribute verification | Same | Same | Curated source/evidence updates |
| Appointments/checklists/referrals | Deny | Own saved information; no fabricated confirmation | Deny in v1 (not a consent resource) | Future booking/referral evidence checks |
| Support requests and messages | Deny | Own submitted request/read; explicit send/close; no delivery/status patch | Active assignment only; acknowledge/respond through locked workflow | Validate submission, queue receipt and event transaction |
| Assignments, status events, request/grant join | Deny | Read own safe history; no arbitrary mutation | Active assigned request projection only | Append events; trusted assignment/revocation; atomic state change |
| Consent grants/history | Deny | Own grant/revoke through validated workflow | No general grant listing; only relevant current projection | Validate exact owned resource/fields, expiry and recipient |
| Care circle/followups | Deny | Explicit approved supporter relationship and consent | Only request-authorized followup | Membership never implicitly grants records |
| Notifications/reminders | Deny | Own generic previews and preferences | No other user's feed | Respect opt-in and deletion/revocation |
| Audit events | Deny | Future redacted own sharing history via reviewed projection | No audit listing | Append-only; controlled security investigation |
| Preference history | Deny | Own if enabled | Deny | Optional minimized presentation history |

Supporter access is deferred until care-circle membership plus exact consent has its own tests. Do not reuse provider membership as a shortcut. Future clinical tables inherit owner privacy but require new write/projection policies before exposure.

## Consent and provider access algorithm

For every request detail, shared-record read, acknowledgement and response:

1. Validate caller session and active approved `provider` role/profile (`mode=simulated` in this MVP).
2. Fetch active assignment to this request; require the assigned provider to match the request recipient. Never return all requests because a user is a provider. Revocation hides the request immediately on the next read.
3. For request-body access, use the mother's explicit submission consent and active assignment. For each attached health field, additionally load the linked grant and require matching owner, grantee, exact resource, field allowlist and purpose; enforce start/expiry/revocation at database time.
4. Project only selected fields, with minimal source/verification labels necessary to interpret them. Do not expand a baby link into the mother's history, expose raw source notes, or return full document/clinician payloads via a selected `provenance` field. A safe provenance projection contains source/verification and recorded time only. Request metadata/grant pointers do not themselves authorize another query.
5. Persist a minimized read/status audit record as part of the authorized workflow. If authorization or required audit write fails, return no private data. Do not log request/diary/report/question text or the value of a denied record.

Revocation blocks later field access; providers see an accurate unavailable/revoked state instead of a stale cached snapshot. Close/revoke assignment blocks provider reads and responses. A fresh request and fresh consent are required to resume a closed exchange. A grantee cannot transfer grants or update a health fact. Required transaction checks must remain true under concurrent revoke/read operations; use transaction isolation/locking and define the authorization decision instant in policy tests. No permanent snapshot, browser caching or sensitive notification payload bypasses revocation.

Request status and event insert occur in one transaction with a row lock and expected revision. A delivered event checks its queue receipt, an acknowledged event checks its actor/assignment, and a responded event checks its stored message. No client may insert arbitrary event rows or PATCH a status. The structural TypeScript transition helper is not an authorization engine.

## Private medical file storage

- Proposed bucket `medical-reports` is private. Keys are server-generated `<owner_uuid>/<document_uuid>/report.pdf`; original filenames are not trusted path components or logs. Metadata stores the key, not a permanent URL.
- Restrict `storage.objects` by bucket, authenticated owner folder and corresponding owned document row. Specify separate upload/read/delete policies; deny overwriting existing reports and all anonymous/provider access in v1. Files are not public just because directory content is public.
- Upload metadata request enforces the proposed 5 MiB/template limit; server/worker also checks actual file size, PDF bytes, template and allowed processing. Reject active/unrecognized content and unsafe parser output. A fake client MIME type is insufficient.
- Extraction workers use narrowly scoped server access; service-role/secret credentials remain server-only and do not enter NEXT_PUBLIC variables, client imports, logs or repository fixtures. Use an approved processing environment; no real PHI sent to unapproved AI services.
- Prefer authenticated streaming after fresh authorization, with `Cache-Control: no-store`. If temporary upload URLs are used later, bind operation/object and short expiry and explain expiry behavior. Signed download URLs can outlive consent until expiry; avoid them for shared medical files in v1.
- Failed/abandoned uploads and account/document deletion need an idempotent cleanup job. SQL row deletion does not delete a storage object. Deleting metadata before scheduling/verifying object cleanup can orphan files.

## Minimization, retention and audit

No passwords in PROHOR tables. No disability classification, pregnancy-profile requirement for public tasks, location tracking, clinical inference from access settings, or diary/AI transcript in broad summaries. Default chat is ephemeral, not a retained conversation. Log only bounded event codes, UUID pointers, server timestamps, outcome and a correlation UUID; structured API errors must not echo sensitive values. If a denied target does not exist, log the attempted identifier without proving its existence to the caller.

Retention intervals, backup expiry and deletion SLA require an explicit recorded decision before any real-data deployment. Minimized append-only audit storage may need a separate administrative retention/deletion process; “append-only to application users” does not imply permanent retention. Mother-facing revocation does not erase already seen information. No legal or clinical-validation claim is made here.

## Migration and database test release gate

Run on isolated synthetic staging, then test the full clean migration chain. TypeScript contract tests do not prove RLS or delivery. Day 2 must add pgTAP/Supabase policy tests and server integration tests covering:

- Anonymous public read succeeds only for approved/published projections; anonymous private CRUD is denied.
- Two mothers A/B cannot read, mutate or attach each other's pregnancy, baby, document, extraction, review, observation or grant. Check INSERT and UPDATE attempts, not just SELECT.
- Unapproved/unassigned/revoked providers and self-assigned role attempts fail; an approved provider only sees assigned requests. Providers cannot change recipients, status, ownership or clinical provenance directly.
- Valid assignment + exact grant allows only selected fields; wrong recipient/purpose/resource, expired/not-yet-active/revoked grant denies. Test current-session revocation, concurrent revocation and no sensitive notification/cache copies.
- Diary, chat transcripts and raw reports remain inaccessible with every supported grant/role combination. Verify safe provenance projection does not leak source notes/document locators.
- Cross-owner composite FKs and “exactly one subject/resource” constraints reject even trusted-worker mistakes. A self-reported browser write cannot become document/clinician confirmed.
- Fake/foreign receipt, skipped transition, wrong actor, duplicate acknowledgement, stale revision, missing response message and race/retry leave no false status or partial event. Repeated idempotency key produces no duplicate request.
- Unverified/rejected/stale OCR, mismatched field/attempt/review/subject, unsupported kind/unit and all-rejected review cannot write observations. Commit retry returns the same observations; failed batch rolls back all writes.
- Storage denies bucket listing, cross-owner read/upload/delete, overwrites and provider reads. Verify cleanup, orphan/retry behavior, unsupported bytes and oversized actual files.
- All private responses including error paths are `no-store`; access audits contain no health values/text; service-role operations have explicit authorization tests. Deletion removes owned storage/data and revokes provider visibility.

Record actual results and reviewer in [team-contracts.md](team-contracts.md). No check above has been executed against a database during Step 7.

## Technical references checked 16 November 2026

Supabase documents the need for both grants and per-operation RLS, the risks of privileged keys/views, and policy testing in its [Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security). Private uploads/downloads also require policies on `storage.objects`; database metadata policies alone do not secure files. See [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). The architecture above is PROHOR's proposed application of those mechanisms, not a security certification.
