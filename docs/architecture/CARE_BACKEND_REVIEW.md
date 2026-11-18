# Care backend candidate for review

> **Current status, 19 November 2026:** The candidate status and adoption steps
> below are historical. Read-only inspection of the Supabase project configured
> by this checkout confirms all eight migrations `20261118000000`–`20261118070000`,
> ten care tables with forced RLS, ten authenticated care RPCs, one active
> simulated provider approval, and `20261119000000` applied. A prior live run
> passed 23 targeted checks through all ten care HTTP operations; this inspection
> did not rerun those HTTP checks. The source is in `develop` at `23206dd` and
> remains a simulated backend; Shonket form/status/provider UI is not connected.
> Use the [current API contract](api-contracts.md#consent-and-bondhon-simulated-provider-workflow)
> for integration. Do not reapply the shared database migrations.

Version `care-backend-v1`, 18 November 2026; source baseline
`a6eb84746af12d6fc8ebb00223fb4f3496e7a91a`, branch `omor-day3-backend`.
**Limited local implementation: SQL/adapter tests pass, ten HTTP operations are wired;
database proposals not applied, not merged and not live.**
No reviewer approval, file lease acceptance, hosted session or new merged SHA is
invented. Writer is Omor's backend task; reviewers are Omor/Samin for care DTO/UI
semantics and Ifty/Samin for referenced private data. The task window remains
18-19 November; the next UI writer is Samin after accepted contract/merged SHA.

## What exists in this candidate

- `supabase/proposals/20261118_care_backend.sql`: ten RLS-enabled/forced tables in
  the non-exposed `prohor_care` schema. No application-role schema/table privileges.
  Typed composite FKs bind request/grant owner, recipient and purpose, and bind
  every consent to its exact same-owner resource. Diary/chat/raw files are absent.
- `supabase/proposals/20261118_care_operations.sql`: ten narrow public RPCs; empty
  search paths, explicit postgres ownership and exact-signature execution grants
  only to `authenticated`. Internal helpers are not callable by app roles.
- `src/lib/care/handlers.ts`: candidate HTTP adapter using existing `readIdentity`,
  bounded JSON, Origin checks, optional account-change guard and existing domain
  validators. RPC responses are checked against exact owner/provider DTOs before
  disclosure. Unknown results/timeouts remain unconfirmed with same-key retry copy.
- `src/lib/care/server.ts`: server-only cookie-bound dependency wrapper. Ten local
  HTTP operations now import it. The catalog deliberately upgrades the existing
  care 501 stub to an authenticated v1 contract; missing database RPCs return 503.
  The legacy UI remains a non-sending prototype pending Samin's connected form.

Trusted provider approval is a separate simulated approval row; the existing
`profiles.role` remains the role source. Providers cannot self-approve. RPCs verify
confirmed/non-anonymous identity against current Auth/profile rows; provider reads
and actions also require current approval, recipient match, active assignment,
persisted queue receipt and every attached grant's current window/revocation.

## Local HTTP map; hosted availability pending

| Local canonical operation | Handler operation / RPC |
| --- | --- |
| `GET /api/care-recipients` | `recipients` / `mvp_care_recipients` |
| `POST /api/consents` | `create-consent` / `mvp_care_create_consent` |
| `POST /api/consents/:id/revoke` | `revoke-consent` / `mvp_care_revoke_consent` |
| `POST /api/care-requests` | `create-request` / `mvp_care_create_request` |
| `GET /api/care-requests/:id` | `request-detail` / `mvp_care_get_request` |
| `GET /api/care-requests/:id/events` | `request-events` / `mvp_care_request_events` |
| `GET /api/provider/requests` | `provider-list` / `mvp_care_provider_requests` |
| `POST /api/provider/requests/:id/acknowledge` | `acknowledge` / `mvp_care_acknowledge` |
| `POST /api/provider/requests/:id/respond` | `respond` / `mvp_care_respond` |
| `POST /api/care-requests/:id/close` | `close` / `mvp_care_close` |

`mvp_care_recipients()` is an authenticated-mother directory of approved simulated
provider IDs/display labels, exposed only to mothers at `/api/care-recipients`.
Samin consumes these actual IDs; no hardcoded recipient or self-service approval.
No general patient directory is introduced.
Response-message storage/`responded` status exist, but no new mother-facing message
thread DTO is invented; complete response-text UI/read adoption remains review work.

## Headers, examples, failures and replay

Candidate mutation requests use exact configured Origin and JSON <=8 KiB.
`Idempotency-Key: <UUID>` is required for consent/request create and provider
actions/close. Revoke accepts no body and repeats its first revocation timestamp.
Optional `X-Prohor-Account` mismatch gives 409 before RPC and confers no authority.
Resource IDs are UUIDs. Unknown/duplicate query keys and unsafe cursors are rejected.
Lists use limit 1-50 and a position-only opaque cursor; SQL always reauthorizes
the caller. Cursor positions do not grant access and are not claimed signed tokens.

Existing body validators are unchanged. Synthetic care example:

```json
{"recipientUserId":"e3000000-0000-4000-8000-000000000003","message":"Synthetic reviewed message","method":"aac","purpose":"Synthetic support","consentGrantIds":[],"reviewConfirmed":true}
```

Acknowledgement example: `{"expectedRevision":2}`. The actor/owner/role never
comes from the request body. The candidate emits the existing v1
`{data,requestId,contractVersion:"1"}` envelope; create/replay returns 201 and other
successes 200. Failures are existing v1 errors: 400 invalid input, 401 missing
identity, 403 denied Origin/role/recipient, 404 absent/foreign/unavailable resource,
409 revision/retry/account conflict, 503 unavailable/unconfirmed. All private
success/error responses use `private, no-store` and `no-referrer`.

Retry receipt uniqueness is `(actor,operation,key)` under an advisory transaction
lock. **Instead of storing a clinical/message payload copy or low-entropy hash,
the care implementation compares the canonical retry to the original immutable
request/grant/message rows.** Field/grant order is canonicalized, duplicates are
rejected, and changed payload/revision/target conflicts. Receipts contain only
pointers, operation, key, original revision and server time. This deliberately
replaces the earlier boundary draft's proposed keyed-digest mechanism for care;
report replay is not implemented by this change.

A mother can reconcile her original submission after consent withdrawal/closure;
this never creates another request or restores provider access. Provider action
replay rechecks current grants first. Once access is withdrawn/closed, a provider
cannot use a receipt to retrieve an old snapshot. Provider close returns no shared
records; later reads/replays deny access. A known validation/authorization failure
is a confirmed rejection; network/unknown 5xx/invalid persistence response must not
be presented as certain Not sent. Retain the draft and original key.

## Transactions, revocation and evidence

Submission persists request + submitted event + assignment + exact grant joins +
simulated queue receipt + delivered event + retry receipt + minimal audit in one
transaction. It returns `delivered`/revision 2 only after queue persistence; no
timer or automatic acknowledgement exists. This is delivery to a **simulated app
queue**, not a real clinician. Acknowledge requires delivered state; response needs
an actual assignment-bound message. Request/event writes and expected revisions
are locked. A deferred constraint prevents final request state without matching
evidence, and composite FKs prevent foreign receipts/actors/links.

Lock order is verified identity/profile, retry advisory lock for mutations,
provider approval, request row, assignment, and UUID-ordered grant locks.
Grant revoke takes its own grant lock, never a request lock. All grant windows
are rechecked after lock acquisition. The authorization decision instant is the
database time after grant locks are obtained. Locks last through the projection/
action transaction. Real multi-session contention/expiry timing still needs hosted
or local full-PostgreSQL acceptance; PGlite queues its driver transactions.

Revoking any attached grant hides the entire request from future provider list,
detail/events and actions; it does not alter the mother's request history or
pretend to erase already viewed information. Closing withdraws assignment/message
access, including message-only requests. Closure is not medical resolution.
Access/status audit writes are mandatory before returning sensitive data; failure
rolls back/denies the operation. Audits contain no free text, measurements, diary,
conversation or raw document payloads. Denied-attempt retention is not implemented.

## Tests and adoption requirements

27 embedded SQL tests cover allowed/denied roles, all seven field projection types,
owner separation, finite consent, scope/purpose/recipient mismatch, current expiry/
revocation, queue/action evidence, replay, stale revisions, message-only withdrawal,
audit failure and atomic rollback. 19 adapter tests plus four SQL-to-adapter tests
validate the DTOs/envelopes and real SQL status/revoke/retry behavior with injected
synthetic identity. None proves a GoTrue/browser session or hosted deployment.

Before hosted adoption: recheck the already applied foundation history, obtain private
schema/contract review, promote forward SQL under reviewed migration filenames,
run clean-chain + actual authenticated/session/RLS/concurrency tests, agree receipt/
audit retention and provider administration, review the local HTTP changes/catalog in
one PR, and announce its actual merged SHA before Samin connects UI. Clinical
review, real-world providers and real-data retention remain outside this candidate.

The operator confirmed a separate session is implementing account roles concurrently.
Those source files are preserved. Disposable care fixtures now exercise that
session's onboarding/provider-approval boundary when present; the hosted database
still had only the two foundation migrations at this continuation's read-only check.
Account provider approval and care recipient approval are separate required gates
in these current candidates. The two sessions must reconcile provisioning and role
revocation before deployment; no broad migration push is safe while one is unfinished.
See [activation and exact work order](../qa/OMOR_CARE_NEXT_STEPS.md).
