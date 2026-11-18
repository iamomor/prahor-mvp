# Omor MVP boundaries for review

**Latest continuation, 18 November:** care HTTP routes are wired locally and the
canonical catalog now records their authenticated v1 payloads. SQL remains outside
the migration chain/unapplied; no merged handoff or hosted care success exists.
The earlier 501/unrouted descriptions below record the previous checkpoint and
are superseded by [the care review](CARE_BACKEND_REVIEW.md) and
[current next steps](../qa/OMOR_CARE_NEXT_STEPS.md). Hosted Auth now matches the
operator-approved hackathon auto-confirm policy. A separate session owns ongoing
account-role changes; do not apply an unfinished combined migration chain.

18 November 2026, Bangladesh time. Review package
`omor-mvp-boundaries/2026-11-18-draft.2`, based on
`a6eb84746af12d6fc8ebb00223fb4f3496e7a91a` on `omor-day3-backend`.
**Private/care prototype approval pending. No private/care contract adoption,
proposal application, merged SHA, domain sign-off or hosted acceptance is claimed.**

Continuation: the two existing foundation migrations have now been applied with
specific user approval and verified against the linked app project. This does not
approve the new private/care proposals. [The care candidate](CARE_BACKEND_REVIEW.md)
has SQL/adapter implementation and tests; its HTTP routes remain unadopted.

The canonical [API catalog](api-contracts.md), [typed contracts](../../src/lib/contracts/index.ts)
and [review log](team-contracts.md) remain authoritative. This package prepares
their next adoption decision; it is not a second API catalog. The existing
integration, Auth, preferences and audio controllers are retained.

## Auth and schema prerequisite

Use `readIdentity(await createServerSupabase())` for validated identity and a
caller-bound client. Both come from the existing platform. A mother-only domain
handler must also require `profile.role === "mother"`. Never accept an actor,
owner, role, verification, data mode or recorded timestamp from a create body.
`X-Prohor-Account` may detect a stale account snapshot but never authorizes access.

`NEXT_PUBLIC_SITE_URL` was absent; the ignored local environment now sets
`http://localhost:3000`. Read-only probes reach hosted Auth with email confirmation
enabled and anonymous sign-in disabled. Initial foundation probes returned
404/PGRST205. The empty schema/history was then verified and the two existing
foundation migrations applied with explicit approval. Recorded versions, tables,
RLS/grants and provisioning are now verified; anonymous REST reads correctly get
42501 permission denial. Hosted confirmation is blocked by an expired link and
email throttling, so session/own-data/provider acceptance remains incomplete.

Run [the read-only SQL inspection](../../supabase/inspection/auth_foundation_readonly.sql)
in the intended project's trusted SQL editor and inspect exact Dashboard site and
callback allowlists. Expected repository migration versions are
`20261116000000` and `20261117000000`; both are now recorded. Compare actual
history/schema again before any new forward repair. No private/care proposal or
shared-data reset is authorized by this package.

## Private-record schema candidate

[SQL candidate](../../supabase/proposals/20261118_private_records.sql), version
`private-records-v1`, lives outside `supabase/migrations` and is exercised only by
`npm.cmd run test:db:private-proposal` in disposable embedded PostgreSQL.

| Candidate resource | Existing DTO/validator | Proposed domain writer |
| --- | --- | --- |
| `pregnancy_records` | `createPregnancyRequestSchema`, `PregnancyRecord` | Ifty |
| `baby_records` | `createBabyRequestSchema`, `BabyRecord` | Ifty |
| `maternal_conditions` | `createMaternalConditionRequestSchema`, `MaternalCondition` | Ifty |
| `health_observations`, `baby_observations` | `createObservationRequestSchema`, `HealthObservation` | Ifty |
| `maternal_symptom_notes` | `createSymptomNoteRequestSchema` | Ifty |
| `wellness_entries` | `createWellnessEntryRequestSchema`, `WellnessEntry` | Samin |
| `wellness_diary_entries` | `createDiaryEntryRequestSchema`, `DiaryEntry` | Samin |

IDs are generated on the server/database. Children use `(parent_id, owner_user_id)`
foreign keys. Maternal pregnancy links may be null; baby observations require a
distinct same-owner baby. Presentation settings confer no access. All new tables
force RLS, allow only own mother SELECT/limited-column INSERT, and deny direct
UPDATE/DELETE and provider/service-role table privileges. Ownership, revision,
identity, synthetic mode, provenance and timestamps are not insertable columns.
The measurement dictionary reuses the existing mother/baby kind/unit subsets;
decimal strings retain their recorded precision. Diary is physically separate.

This candidate supports **initial self-reported saves and owner reads only**.
Revision is fixed at 1 and rows are append-only. It does not implement corrections,
visits, deduplication, report provenance/commit, consent, provider access or HTTP
routes. Do not connect the existing editable local demos to it as though those
operations were complete. Review revisioned correction/history and write retry
semantics before promotion. No approved migration filename is assigned yet.

Examples using the existing validators (all data synthetic):

```json
{"estimatedDueDate":null,"lastMenstrualPeriodDate":null,"label":"Synthetic pregnancy"}
```

```json
{"destination":{"subject":"mother","pregnancyId":null},"measurement":{"kind":"note","value":"Synthetic self-recorded note","unit":null},"observedAt":"2026-11-18T00:00:00Z","sourceNote":null}
```

```json
{"occurredAt":"2026-11-18T00:00:00Z","mood":"prefer_not_to_say","energy":null,"activityNote":null,"restNote":null}
```

## Domain delegation and route approval

- **Ifty:** write health and review domain services/tests in the agreed Jibonrekha/
  Bujhi feature paths after the shared contract/schema review. Preserve separate
  subjects, explicit provenance and immutable reviewed report identity. Supply
  owner/foreign-owner/subject/revision/retry evidence. Do not replace Auth or add
  parallel root APIs.
- **Samin:** write wellness/diary domain services/tests in the agreed feature paths;
  diary is owner-only and cannot enter care summaries or AI context. Build the
  mother/provider care UI against Omor's reviewed canonical contract, preserving
  drafts and accurate send states.
- **Omor:** retains shared Auth/client/security/schema/RLS, care/consent/provider/
  audit backend, and approval/wiring of thin canonical routes. Review domain PRs
  individually before route adoption.
- **Iftee / Apurbo:** retain the existing Barta service-to-interface handoff order.
  Omor announces Iftee's actual reviewed merged SHA before dependent UI work.

These are local handoff instructions for Omor to share; no external teammate
message or file lease has been represented as delivered. Dependent writers need
an accepted version/example and its reviewed merged SHA. `a6eb847` proves only
the current baseline, not approval of this new proposal. No such new SHA exists.

## Care/consent implementation decision to approve next

Keep the existing `POST /api/care-requests` path. Its current public
`{message,method}` -> `not_sent`/501 stub remains unchanged. The proposed
`createSupportRequestRequestSchema` is an explicit future adoption, not an
already accepted current payload. Keep one action shape:
`POST /api/provider/requests/:id/acknowledge` with `expectedRevision`; no arbitrary
status PATCH.

The implementation transaction must:

1. Derive the confirmed mother actor, validate strict input and choose an active,
   trusted approved **simulated** provider. The current `profiles.role` remains the
   trusted role source; do not silently introduce another role system.
2. Validate finite reviewed consent to exact owned record fields, recipient,
   purpose and time window. Enforce typed same-owner resource references in SQL.
   Diary, conversations and raw reports have no share scope.
3. Serialize writes using an actor + operation + UUID `Idempotency-Key` receipt.
   Bind the key to the original immutable canonical request, reject a changed
   payload, and persist request, assignment, grants join, event and audit atomically.
   Receipt storage must not contain copied clinical fields or messages.
4. Treat `submitted` as persisted submission only. Mark `delivered` only after
   verifying a persisted simulated queue receipt. An assigned provider must act
   explicitly to acknowledge. A stored authorized response is required for
   `responded`. Lock the request and verify expected revision for every action.
5. Check active provider approval/assignment and current grants on every list,
   detail and action. Project only exact selected fields with source/verification/
   time labels; no raw provenance notes/locators. Append minimal access/status audit
   records before returning sensitive data; audit failure denies the read.
6. Revoke through a locked transaction, preserve the first revocation timestamp,
   remove future field access and explicitly define message/assignment withdrawal.
   Grant revocation and request/assignment closure are separate authorizations.
   Concurrent reads/actions/revocations must have a documented lock order and
   authorization decision instant; no stale snapshot bypass.

Request detail/events/provider list return the existing restricted DTOs in
`bondhon.ts`, not full owner rows. Error envelopes use the existing v1 schema;
foreign and absent IDs should have the same safe not-found behavior. Every private
success/error response must be `private, no-store` with no private diagnostics.

**Transport/retry decision requiring review:** require an `Idempotency-Key` UUID
for care submission and report commit. Check identity/current authorization again
before returning a replay. A pre-write confirmed validation/authorization
rejection may say **Not sent**. A connection loss, timeout or ambiguous 5xx after
submission means **Submission unconfirmed**; keep the draft and the same key,
reconcile/replay the identical payload, and never create a new key automatically.
The existing nonwriting 501 stub can still truthfully say Not sent. Receipt
retention remains a policy decision. The care candidate binds retries to original
immutable rows without a copied payload/digest; report replay remains unimplemented.

The consent/request/provider/audit SQL and candidate adapter now exist in
[care-backend-v1](CARE_BACKEND_REVIEW.md), with resource/transaction tests.
They are not applied or routed. Approved adoption and real-session acceptance
remain required before replacing the stub or claiming live delivery.

## Report boundary requiring owner approval

The current browser photo validator accepts JPEG/PNG/WebP <=10 MiB. The proposed
server `bujhi.ts` contract instead describes a PDF <=5 MiB. Neither is silently
changed. Proposed narrow reconciliation for Iftee/Ifty/Omor review: one synthetic
English **PNG**, <=10 MiB, using the existing Tesseract workflow; one supported
maternal hemoglobin `g/dL` field. This is a proposal, not an approved clinical
fixture, accuracy claim or implemented server report route. Unsupported hCG must
stay unsaved, never mapped to hemoglobin.

Before commit, persist immutable owner/document/extraction/field/review identities,
raw evidence, source hash, engine/version, revision, complete accept/correct/reject
decisions and explicit destination. Validate actual bytes and supported mapping;
unknown dates require user entry, never inference. Commit reads only that persisted
review, checks same-owner destination/current revisions, and atomically creates
records + source-unique links + receipt. The existing client `reviewed` flag is
insufficient. Replays must return the original IDs, even after a lost response.
Fresh-session, foreign-owner, stale-review and double-commit tests are mandatory.

## Release gates retained

Implementation days are 18-19 November; feature freeze is 19 November at 3:30 PM
Bangladesh time. Deadline remains **20 November 2026, 11:30 AM Bangladesh time**.
No extra days or restarted window. Baseline rollback reference is `a6eb847`, a
source reference only; a known-good deployed rollback target is still unverified.

All eight minimum outcomes need one common preview and actual accepted SHA. Public
service-worker source currently allowlists only offline shell/icons and never
caches API/private routes or Next bundles; deployed sign-out/offline cache behavior
still needs acceptance. Hosted callbacks/sessions, provider scope, exposed-credential
rotation, owner sign-offs, release approval, deploy smoke and submission receipt
remain outstanding. No automatic commit, push, merge, migration or deployment.
