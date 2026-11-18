# Omor: care backend handoff and next steps

> **Current handoff, 19 November 2026:** This file records the earlier pre-activation
> work order. Its statements below that care SQL is unapplied, HTTP is only local,
> or account-role approval is unfinished are superseded. Read-only inspection of
> the Supabase project configured by this checkout confirms all eight migrations
> `20261118000000`–`20261118070000`, ten `prohor_care` tables with forced RLS,
> ten authenticated care RPCs, one active simulated care approval, and
> `20261119000000` applied. The previous authenticated hosted HTTP run passed 23
> targeted checks across ten operations; this inspection did not repeat that run.
> Current frontend contract and integration steps are in
> [api-contracts.md](../architecture/api-contracts.md#consent-and-bondhon-simulated-provider-workflow).
> Apurbo owns the Shonket connection; this backend does not provide its UI.

18 November 2026, Bangladesh time. Workspace `D:/prohor-omor-day3`, branch
`omor-day3-backend`, source HEAD `a6eb847`; this continuation is uncommitted.
The operator confirmed another session is writing account roles in the same tree.
This care continuation does not own or overwrite that session's Auth/account files.

## Direct answer: when to do screenshot Step 5

Do backend/API/database/consent work **now, immediately after verifying the existing
login/session foundation and before connecting the care UI**. Do not wait until
full functional QA. Screenshot Step 6 is the combined journey after database,
backend and UI integration. Run small authorization/retry tests during development
as well. Completed PR #11 integration is retained; do not restart its merges/setup.

| Order | Work | Current state and next owner |
| --- | --- | --- |
| 1 | Sign-up, sign-in, refresh, sign-out, own preferences, two-account and trusted-role denial | Operator reports signup/signin/dashboard working; public config probes pass. Actual hosted refresh/sign-out/preferences/two-account acceptance still needs operator evidence. The separate role session must finish and retest its changed Auth contracts. |
| 2 | Freeze DTOs, schema, assignment and consent rules | Local care routes/catalog and examples are ready for Omor/Samin review. No approved merged SHA exists. Private health/wellness corrections, retries and report commit remain domain decisions. |
| 3 | Review/promote/apply forward SQL with RLS | Hosted read-only inspection found only foundation migrations `20261116000000` and `20261117000000`; all 18 proposed private/care tables are absent. The new account-role migration is concurrently unfinished. Review the complete ordered chain before an explicit application decision; never blindly run db push. |
| 4 | Private save/read services | Ifty supplies health/report handlers; Samin wellness/owner-only diary handlers; Omor reviews security and wires canonical routes. `/api/health` remains 501; local demos do not become account persistence through login. |
| 5 | Care/consent/provider backend and connected UI | Local HTTP adapters, SQL transactions and tests are implemented. Samin connects explicit recipient/purpose/scopes/review, stable retry key, status/revoke and assigned provider acknowledgement after backend adoption. Apurbo can use the contract/fixtures for functional regression now. |
| 6 | One immutable reviewed image/report commit | After the private record/care slice: agree actual image type/limit/mapping with Iftee/Ifty, persist immutable review/source/revision and commit idempotently. No current backend implementation or fresh-session report save is claimed. |
| 7 | Full functional QA on one preview/SHA | All eight minimum outcomes, foreign-owner/unassigned-provider denial, expiry/revocation, lost response/retry, private diary/cache/logout and report revision/dedup. Then final release acceptance. |

Deadline stays **20 November 2026, 11:30 AM Bangladesh time**. Keep feature freeze
19 November at 3:30 PM; final morning is smoke/submission buffer. Do not add days.
The attached PDF's old candidate-folder and publication steps are historical;
the operator's present checkout/baseline and starter V3 ownership take precedence.
V3 assigns Adapt/accessibility to Iftee, functional regression to Apurbo,
health/review to Ifty and care/wellness UI to Samin.

## Screenshot Step 5: the seven backend rules

| Required handoff | Concrete local implementation |
| --- | --- |
| Care-request API contract | [Canonical catalog](../architecture/api-contracts.md), [care review](../architecture/CARE_BACKEND_REVIEW.md), strict Bondhon DTOs and ten real route exports. Local implementation only; no deployed/approved contract is asserted. |
| Authentication/identity | Existing server-verified Auth + own DB profile and cookie-bound Supabase client. No client actor/role or service credential. Account-role session remains the writer of shared identity. |
| Consent | Mother-reviewed, exact owned resource/field allowlist, recipient, purpose, start/finite expiry; active grant rechecked for provider reads/actions; idempotent revoke. Diary/chat/raw files have no share scope. |
| Provider assignment/authorization | Trusted simulated care approval plus selected recipient + active assignment + queue receipt + current consent. Provider role alone gives no global patient access. Account-role approval and care approval are distinct candidates needing joint review. |
| Status lifecycle | `submitted` event then `delivered` only with a persisted simulated queue receipt; explicit assigned acknowledgement; stored response before `responded`; explicit close withdraws access. No real clinician delivery is implied. |
| Errors/timeouts/retry | 400/401/403/404/409 rejection; 503 unavailable/unconfirmed. Preserve draft/key on unknown outcome; replay identical payload to reconcile; never invent acknowledgement. |
| Duplicate submission | UUID Idempotency-Key scoped to actor+operation, transaction lock and immutable original payload comparison. Same action/key reconciles; changed payload/target/revision returns 409. Provider replay rechecks current access. |

Example local submission (all IDs below are synthetic test placeholders, **not
hosted recipients**):

```http
POST /api/care-requests
Origin: http://localhost:3000
Content-Type: application/json
Idempotency-Key: e3000000-0000-4000-8000-000000000013

{"recipientUserId":"e3000000-0000-4000-8000-000000000003","message":"Synthetic reviewed message","method":"aac","purpose":"Synthetic support","consentGrantIds":[],"reviewConfirmed":true}
```

Load real approved simulated recipient IDs from `GET /api/care-recipients` in the
authenticated mother session. Empty selection is an honest unavailable state.
Zero grant IDs shares only the explicitly reviewed message. With records, first
create matching reviewed grants via `POST /api/consents`. Never substitute diary,
chat or raw uploads. See the catalog for exact envelope/header/pagination rules.

The existing CareRequestStarter deliberately lacks recipient/grant review and a
retry key. It cannot submit the new contract and remains a non-sending prototype;
do not present it or the protected empty provider workspace as integrated care.

## Exact SQL candidate for review, not execution approval

These unchanged proposal files already exist outside `supabase/migrations`:

| Order after accepted foundation/account work | File | SHA-256 |
| --- | --- | --- |
| 1 | `supabase/proposals/20261118_private_records.sql` | `30b1716c225c32f7e08a4a7409c602648bc41ebe930ae651e9380de7b66e64ff` |
| 2 | `supabase/proposals/20261118_care_backend.sql` | `26ce075a1757c1b440e456883479735493ba6cdb41e248fddfaa431f0f9b39e8` |
| 3 | `supabase/proposals/20261118_care_operations.sql` | `8ac211f720d9a8708ed0e26cb0135f59cdad023046b05aa2a71b7adb53b645ca` |

Private-record SQL supports append-only synthetic self-report create/read, not
corrections, domain idempotency, visits or reviewed report commits. Do not approve
it as the complete health backend. Care stores ten forced-RLS private-schema
tables and exposes ten narrow authenticated RPCs; internal tables/helpers have
no app-role direct access. There is no provider seed or automatic approval.
Review role/care approval provisioning, concurrent revocation, receipt/audit
retention and all owner signoffs before assigning forward migration filenames.

The attached Omor assignment says **"Do not ... apply migrations ... automatically"**.
No new SQL, Auth setting, account, provider, commit, push, merge or deployment was
performed in this continuation. The linked CLI target was privately checked
against the app backend before metadata-only `--read-only` queries. The CLI calls
that project production; hosted mutation approval must identify the exact chain.

Read-only follow-up: [care metadata inspection](../../supabase/inspection/care_backend_readonly.sql).
It reports presence/RLS/grants and RPC privileges without reading private rows or
calling care RPCs. The two pre-existing foundation migrations remain unchanged.

## Evidence and remaining acceptance

See the latest section of [Omor handoff](OMOR_MVP_HANDOFF.md) for exact current
check results, changed files and concurrent-session failures. Logs are local and
ignored under `test-results/omor-continuation/`. SQL/adapter tests use disposable
embedded PostgreSQL and synthetic injected identity; they do not establish a
GoTrue/browser session, hosted database persistence or multi-connection timing.

Manual screen-reader, physical device/voice and hosted all-eight preview checks
remain untested. No clinician-reviewed safety content or clinical validation is
invented. Retest account/role/care together after the other session finishes;
run tests appropriate to any new code before release.
