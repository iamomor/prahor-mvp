# Omor MVP handoff

## Latest care continuation — 18 November 2026

`D:/prohor-omor-day3`, `omor-day3-backend`, HEAD/base `a6eb847`; uncommitted.
The operator confirmed that a separate session is implementing account roles in
this same tree. Its Auth/account/onboarding/membership/controller files were
preserved and are not claimed as this continuation's work. Earlier checkpoint
sections below are historical where they say care is unrouted or only 501.

**Answer to the requested work order:** backend/consent starts now after the Auth
foundation check, before teammate care UI integration; full functional QA follows
connected backend + UI. Read [the concrete next steps and seven-rule handoff](OMOR_CARE_NEXT_STEPS.md).
Completed PR #11 integration was retained; no old branches were merged again.

### Implemented locally

- Reused existing care SQL/adapters and Auth/client helpers; wired ten local HTTP
  operations for recipient lookup, scoped consent/revoke, request/create/detail/
  events/close, provider list/acknowledge/respond. No competing status PATCH.
- Deliberately upgraded care POST from public 501 stub to the strict reviewed
  authenticated Bondhon DTO + v1 envelopes. Updated canonical catalog/runtime
  validators, dynamic-path registry and HTTP tests together. Private responses
  are `private, no-store`; missing database RPCs return 503 without fake success.
- Added strict minimal recipient response validation. Retained current SQL owner/
  assignment/grant/revision checks, transaction receipts/audit and uncertain-outcome
  handling. Existing form/provider workspace remains a non-sending/empty prototype;
  Samin must supply the connected review/status/revoke/acknowledgement UI.
- Corrected public Auth preflight: compare actual confirmation behavior against
  declared `supabase/config.toml` instead of always demanding confirmation. The
  approved hackathon auto-confirm policy now passes, while missing/ambiguous policy
  or remote mismatch fails closed. No hosted Auth setting changed.
- Added metadata-only care inspection. It executes safely against missing tables
  and validates presence/RLS/grants and exact RPC privilege metadata when installed.
- Updated disposable care/private fixtures for the other session's forward
  onboarding/provider-approval boundary without modifying that implementation.
- Fixed missing `no-store` on the two public nearby-location validation errors
  found by the all-route HTTP check. Updated an obsolete contrast-test checkbox
  selector to the existing radio control; no accessibility UI code was changed.
- Kept native Node database/config tests out of Playwright's broad E2E discovery.

### Hosted read-only evidence

Privately verified linked CLI target equals the app backend. Metadata-only
`db query --remote --read-only` reports applied versions `20261116000000` and
`20261117000000`, public `profiles`/`access_preferences`, correct foundation RLS/
grants/provisioning, and **all 18 proposed private/care tables absent**. Public-key
Auth health/settings checks pass and anonymous table reads are denied. This does
not prove an authenticated session or new persistence. No new SQL, account,
provider approval, Auth setting, Git publication or deployment was performed.

### Verification of this continuation

Windows; Node 24.17.0, npm 11.13.0, Edge for isolated offline browser tests. CI
Node 22, actual GoTrue/session/RLS concurrency and hosted care are untested.
Logs: ignored `test-results/omor-continuation/`.

| Command / environment | Actual result |
| --- | --- |
| `npm.cmd run check:auth-config` | PASS public reachability and declared policy agreement; explicitly not authenticated acceptance |
| `npm.cmd run test:auth-config` | 10 passed |
| `npm.cmd run typecheck` | PASS; production build also passed TypeScript |
| `npm.cmd run lint` | PASS |
| `npm.cmd run check:contrast` | PASS existing semantic-token checks |
| `npm.cmd run build` | PASS; includes new care routes and concurrent account pages |
| `npm.cmd run test:db:care-proposal` | 27 passed; disposable SQL, including inspector privileges, owner/provider denial, expiry/revoke, queue evidence, duplicate retry, audit rollback |
| `npm.cmd run test:db:private-proposal` | 18 passed; all eight proposed private resources and new inspector tested |
| `npm.cmd run test:contracts -- tests/contracts/care.spec.ts tests/contracts/care-sql.spec.ts tests/contracts/api-registry.spec.ts` | 29 passed: 19 care adapters, 4 real-SQL adapters, 6 registry/contracts |
| `npm.cmd run test:rls:guards` | 5 passed; local-live safety restrictions retained |
| `npm.cmd run test:pwa:privacy` | 6 passed; deployed browser/cache/logout still untested |
| `npm.cmd run test:contracts` | 164 passed, 36 failed during concurrent role development. Auth/profile/preferences fixtures and sign-up expectations need reconciliation with new role RPC/inputs; no full-suite PASS claimed. |
| `npm.cmd run test:db` | FAIL: existing foundation-only runner expects exactly two public tables; concurrent role migration introduces five additional tables. Role session must update its migration/fixture coverage; no source rollback performed. |
| `PLAYWRIGHT_CHANNEL=msedge npm.cmd run test:auth` | Latest full rerun: 15 passed, 1 failed. All current wire schemas and care fail-closed HTTP checks pass, plus keyboard/draft/settings/default 320px axe checks. Extra-large text + spacious layout at 320px still overflows on Quiet Garden/standard contrast; Iftee owns repair. |

The first offline run additionally exposed the two nearby validation cache headers
and an obsolete contrast checkbox selector. Those were corrected and rerun; only
the actual combined-preference reflow failure remains in the latest run. This is
not manual screen-reader, full Bangla/device coverage or live-session evidence.

### Files owned by this continuation

- `src/lib/care/{handlers,server}.ts`; `src/lib/contracts/{bondhon,current-api}.ts`.
- Existing `src/app/api/care-requests/route.ts`; new `care-recipients/route.ts`,
  `consents/route.ts`, `consents/[id]/revoke/route.ts`, `care-requests/[id]/route.ts`,
  `care-requests/[id]/{events,close}/route.ts`, `provider/requests/route.ts`,
  `provider/requests/[id]/{acknowledge,respond}/route.ts` under `src/app/api`.
- `src/app/api/poth/nearby/route.ts` (two cache headers only).
- `scripts/check-auth-config.mjs`, `scripts/lib/auth-config-preflight.mjs`,
  `tests/config/auth-config-preflight.test.mjs`.
- `tests/contracts/{api-registry,care,care-sql}.spec.ts`,
  `tests/database/{care-fixtures,care-backend-proposal.test,private-records-proposal.test}.mjs`,
  `tests/auth/offline.spec.ts`, `tests/{api,navigation}.spec.ts`, `playwright.config.ts`.
- `supabase/inspection/care_backend_readonly.sql`; proposal README only (proposal
  SQL files unchanged); architecture `api-contracts.md`, `CARE_BACKEND_REVIEW.md`,
  `OMOR_MVP_BOUNDARIES.md`; QA `OMOR_CARE_NEXT_STEPS.md`, this handoff and
  `OMOR_PDF_EXECUTION_CHECKLIST.md`.

All previous edits remain. The original `next-env.d.ts` bytes/hash are preserved;
framework-generated changes from validation are not part of this handoff. No
environment values/passwords/session tokens or health data were printed/staged.

### Next handoffs and blockers

1. Role session: finish Auth/account contracts and meaningful migration tests;
   reconcile the 36 shared contract failures and foundation runner, then rerun on
   one stable tree. Care fixtures exercise real role onboarding when present.
2. Omor + domain owners: review private append-only limits, record corrections/
   retries, role/care approval and revocation integration; promote only the exact
   approved forward SQL chain after fresh target/history inspection. The attached
   assignment explicitly prohibits automatic migration application. Concrete SQL
   hashes and scope are in `OMOR_CARE_NEXT_STEPS.md`.
3. Ifty health/report and Samin wellness/diary handlers, then Omor route/security
   review. Care UI follows the accepted backend version and actual merged SHA;
   Apurbo can prepare functional fixtures/regressions in parallel.
4. Iftee: repair evidenced combined extra-large/spacious/320px reflow and retest
   keyboard/focus/Bangla/reader coverage under a clean shared UI lease.
5. All owners: actual two-account hosted sessions, persisted private care journey,
   unassigned/revoked denial, immutable report commit/dedup and eight-module common
   preview acceptance. Feature freeze 19 November 3:30 PM; deadline remains
   **20 November 2026, 11:30 AM Bangladesh time**. No release acceptance is claimed.

## Latest MVP Auth decision — 18 November 2026

Omor explicitly chose password sign-up without email confirmation for the
hackathon MVP so the demo can reach `/app` without the hosted email quota.
The hosted setting `auth.email.enable_confirmations` was changed from true to
false after an exact one-field CLI preview; post-push declared diff is empty and
the public Auth settings endpoint now reports `mailer_autoconfirm=true`.
`supabase/config.toml` matches this MVP setting. No SMTP, redirect, migration,
table, or RLS setting was changed in this step. `readIdentity()` still requires a
server-verified Supabase user, a confirmed Auth identity, and an own RLS profile;
new Auth sign-ups are automatically marked confirmed by Supabase. The earlier
unconfirmed account has not been modified and may still fail to sign in. Test a
fresh synthetic email address controlled by the operator at localhost sign-up,
then refresh `/app`. The operator subsequently reported that fresh sign-up opens
`/app`; refresh/sign-out/fresh sign-in are still separate acceptance steps. The UI no
longer offers email-only sign-in or confirmation resend for this MVP. Duplicate
registration is a 409 with a recovery message rather than a false check-email
success. This policy is for the controlled hackathon demo; email ownership is not
verified and the product must not describe it as verified identity. After this
change, read-only aggregates still show one pre-existing account and zero
confirmed accounts; the old account was not retroactively confirmed. Typecheck,
lint, production build and all 198 contract tests pass; a focused 320px browser
check shows no email-only/resend buttons. The pre-existing `next-env.d.ts` hash
remains unchanged. The subsequent role audit's read-only hosted aggregates show
two accounts, one confirmed account, no missing profile/preference rows and zero
provider profiles. The earlier role and module access review identified
the mother/provider runtime, missing supporter and multiple-role implementation,
all-eight permission matrix, evidence and next implementation boundaries.

The following section records earlier diagnosis and work before this decision.

## Current continuation — foundation verified, care candidate implemented

18 November 2026. Same workspace, branch and source HEAD
`a6eb84746af12d6fc8ebb00223fb4f3496e7a91a`; new work is uncommitted.
The full assignment and all-eight live acceptance remain incomplete.

**Hosted foundation — working schema, narrowly approved changes:** user SQL and
linked read-only CLI inspection confirmed no public tables, Auth user triggers or
migration history. The user completed CLI login and explicitly approved only
`20261116000000_day2_database_foundation.sql` and
`20261117000000_adapt_atomic_preferences.sql`. Codex checked their exact hashes,
the two-file migration directory and the remote dry run before applying them to
the app-configured project. The CLI labels it production. No reset/seed/vault or
clinical/care proposal was included.

Post-application **read-only hosted metadata** confirms both recorded versions,
exactly `profiles`/`access_preferences`, five owner policies, RLS on both tables,
`day2_auth_user_created`, postgres-owned provisioning and invoker preference RPC.
Clients cannot insert/delete profiles or update role/owner/timestamps; supported
display-name/preference updates retain their column grants. This is actual hosted
schema evidence, not proof of a browser session or cross-account RLS execution.

The user separately approved adding just the exact local callback to hosted Auth.
The minimal manifest changed only `auth.additional_redirect_urls`, preserving the
four existing entries/default site/other settings. Hash and concurrent-list checks
preceded application; the post-change declared diff is empty. Some retained
redirect entries use wildcards and still need release review. The user then
reported `POST /auth/sign-up` 200. Email confirmation, authenticated refresh,
preferences, sign-out and two-account/provider acceptance are still being verified.
The operator then reported a sign-in redirect/error. Read-only aggregate diagnosis
shows one nonanonymous account, zero confirmed accounts, and no missing profile/
preference rows. This proves successful provisioning but not confirmation; the
confirmed-identity gate remains intact. No password, token or account identity was
requested or printed.
The visible provider failure was `otp_expired`, redirected to the pre-existing
Vercel fallback. A fresh-request attempt did not yield usable new mail. Read-only
recent Auth logs, reduced to categories only, show email-send rate limiting,
expired OTP, invalid credentials and unconfirmed email. Confirmation is now an
external email-delivery/valid-link blocker; no admin-confirmation shortcut or
weakened gate was used. The app need not be pushed to verify localhost; the
deployed Vercel version remains separate from this uncommitted checkout.

**Auth recovery correction (18 November, same checkout):** a newer read-only Auth
log check identified the latest signup `400` as `over_email_send_rate_limit`.
The app now returns an honest `429 email-rate-limited` with a clear form message,
offers an explicit confirmation resend action, and distinguishes a valid-password
unconfirmed account from generic invalid credentials. The Auth email redirect now
requests the exact allowlisted `/auth/callback` URL; the earlier `?next=` suffix
did not exactly match that entry and could have caused a fallback to the hosted
Site URL. A short-lived HttpOnly SameSite cookie preserves the safe task return
path across the exact callback and is cleared there. The older `otp_expired`
event occurred at the provider, so its exact cause is still unproven. No email
was sent during these checks. The browser form retained its input and showed the
rate-limit/resend states through a synthetic intercepted response at 320px with
keyboard activation. Focused Auth contract tests: 24 pass; full contract suite:
199 pass. Typecheck, lint, and production build pass; the original
`next-env.d.ts` edit remains byte-for-byte intact.
Hosted sign-in, `/app` refresh and real confirmation remain blocked until a new
confirmation message is delivered and used successfully. The built-in Supabase
email service is project-rate-limited; repeat signup requests are not a remedy.
The subsequent read-only CLI config diff/pull and public Auth settings check do
not expose the hosted SMTP enabled/host fields. The repository config has no SMTP
section. Custom SMTP status remains unverified until the project dashboard's
Authentication > SMTP Settings page is checked; no mail settings were changed.

**Care — prototype, not routed/applied:** `care-backend-v1` now implements exact
finite consent, recipient approval/assignment, real simulated queue receipts,
detail/events/list, explicit acknowledgement/response/close, mother status/revoke,
mandatory minimal audit and UUID retry receipts in isolated SQL. Provider DTOs
exclude owner/grant pointers/raw provenance/diary. Expired/revoked grants deny
future provider list/read/action/replay. Audit/queue failures roll back and return
no fabricated success. The candidate adapters reuse existing Auth/client/DTOs,
bound bodies and Origin checks, validate returned identities/projections, and
keep ambiguous results unconfirmed. Existing HTTP routes/catalog still have the
honest 501 care/health stubs. No new care migration or merged handoff is approved.

**PWA — implemented source hardening:** public worker cache v3 never intercepts
private/API/auth/provider/report requests. Install fetches omit account credentials;
both install and runtime reject private/no-store/no-cache asset responses. Only
owned old public-shell caches are cleaned up. Actual deployed browser/offline/
sign-out behavior remains untested.

### Latest verification and evidence

Windows, Node 24.17.0/npm 11.13.0. CI Node 22 remains untested. Local evidence is
under ignored `test-results/omor-mvp/`; no keys/passwords/private record data are
logged. Native CLI credentials remain in the operator's own credential storage.

| Check | Current result |
| --- | --- |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS |
| `npm.cmd run test:contracts` | PASS, 196 tests, including 18 care adapter and 3 real SQL-to-adapter cases with injected identity |
| `npm.cmd run test:db:care-proposal` | PASS, 26 embedded SQL security/transaction tests |
| `npm.cmd run test:db:private-proposal` | PASS, 18 tests, including all operator metadata inspection SQL |
| `npm.cmd run test:db` | PASS, fresh/legacy/invalid-legacy rollback scenarios |
| `npm.cmd run test:auth-config` | PASS, 8 tests; healthy anonymous 42501 denial distinguished from missing tables/invalid Auth |
| `npm.cmd run check:auth-config` | PASS public/config preflight; table reads correctly denied to anonymous; not session acceptance |
| `npm.cmd run test:pwa:privacy` | PASS, 6 VM tests of actual worker source |
| `npm.cmd run test:rls:guards` | PASS, 5 tests; local-only guards unchanged |
| `npm.cmd run check:contrast` | PASS, 18 token pairs |
| `npm.cmd run build` | PASS, production build; original next-env bytes restored |
| Local-live Auth/RLS runners | Remain unavailable without local 54321/fixtures; never redirected to hosted |
| Full hosted Auth/eight-module/device acceptance | Incomplete; no build/SQL fixture result substituted |

Relevant local evidence: `approved-foundation-apply.json`,
`hosted-foundation-verified.json`, `approved-callback-apply.json`,
`hosted-auth-provisioning-counts.json`, `hosted-auth-error-categories.json`,
`care-db.log`, `care-contracts.log`, `contracts-care.log`, `build-care.log`.
The source migrations were not edited. Applied SHA-256 values:
`01ccb877e7031908ab271a1ae1aa0b686eed113ee21bc192a646e34c3aed7d19` and
`1cf554d7c83ef85bb74abc0c15fb823ff936441e062ebb59a2336154e5b44096` respectively.

### Additional changed files in this continuation

- `.gitignore`: excludes Supabase generated CLI caches.
- `public/sw.js`: public-only/private-response cache protections.
- `package.json`: adds care-proposal and PWA privacy checks (five new commands total across both phases; no dependency/lock change).
- `src/lib/care/handlers.ts`, `src/lib/care/server.ts`: unwired typed candidate adapters.
- `supabase/proposals/20261118_care_backend.sql`, `20261118_care_operations.sql`: candidate private tables/RPCs; README updated.
- `supabase/inspection/auth_foundation_presence.sql`, `auth_foundation_verify.sql`: read-only single-row metadata checks; original full inspector clarified/extended.
- `supabase/inspection/auth_provisioning_counts.sql`: aggregate-only confirmation/provisioning diagnosis, no user values.
- `tests/database/care-backend-proposal.test.mjs`, `tests/contracts/care.spec.ts`, `care-sql.spec.ts`: new care authorization/transaction/adapter evidence.
- `tests/rls/public-worker.test.mjs`: worker privacy tests.
- Existing config helper/CLI tests: distinguish expected anonymous denial; private proposal test exercises new inspection SQL.
- `docs/architecture/CARE_BACKEND_REVIEW.md`, updated `OMOR_MVP_BOUNDARIES.md` draft.2 and `api-contracts.md`: candidate/adoption details, no live catalog claim.
- `docs/qa/OMOR_FOUNDATION_SETUP.md`, `OMOR_PDF_EXECUTION_CHECKLIST.md`, this handoff: actual approvals/results and every PDF instruction's status.

No commit, stage, push, merge, reset or app deployment occurred. `next-env.d.ts`
retains its original developer edit. The unchanged migration files were applied
only after explicit user approval; this does not authorize future migrations.
No health/review/wellness domain handler or teammate UI was taken over.

### Next gates and writers

Finish real hosted confirmation/session/preferences/sign-out and two-account/role
checks with synthetic users. Omor/Samin/Ifty review private/care scope, transactions,
retention and real-session/concurrency tests before migration/route adoption.
Ifty owns health/review handlers; Samin wellness/diary handlers and care/provider
UI. They need an accepted contract/example and actual reviewed merged SHA before
dependent integration; none exists for this candidate yet. Report image/review/
commit remains pending Iftee/Ifty handoff. Apurbo owns the previously evidenced
combined 200%-text/320px Bangla reflow failure. No full MVP/release sign-off is
implied. Deadline remains **20 November 2026, 11:30 AM Bangladesh time**.

For the current email blocker, stop repeated signup requests. Wait for the hosted
email rate-limit window or configure an independently approved delivery service
privately; then request one fresh confirmation from localhost and use only the
newest link in the same browser. Do not share link tokens/passwords, claim natural
verification from an admin fixture, or push the app as a remedy for email throttling.
The exact throttle reset time and initial token-expiry cause were not established.

See [care review](../architecture/CARE_BACKEND_REVIEW.md),
[foundation record](OMOR_FOUNDATION_SETUP.md), and
[PDF instruction checklist](OMOR_PDF_EXECUTION_CHECKLIST.md).

## Historical first phase — superseded where the continuation records newer evidence

The following records the earlier pre-approval configuration/proposal pass.
Statements there about missing tables or no hosted changes describe that earlier
phase only. Use the current continuation above for present migration/Auth status.

18 November 2026, Bangladesh time. **Authentication/configuration verification +
private-record schema review package; the full backend assignment is incomplete.**

## Checkout and preserved work

- Workspace: `D:/prohor-omor-day3`; branch: `omor-day3-backend`.
- Starting and current source HEAD: `a6eb84746af12d6fc8ebb00223fb4f3496e7a91a`.
- Existing edit: `next-env.d.ts` references `.next/dev/types`. Preserved byte for
  byte after build/tests; SHA-256
  `b8b3a344484b959af5e4e3fc1a1609dac3cb9ece0cdeb6c145be29bc4c491000`.
- No completed integration was restarted. No commit, stage, push, merge, migration
  application, database reset, hosted account creation or deployment occurred.
- Implementation days remain 18-19 November; feature freeze 19 November, 3:30 PM.
  Submission deadline: **20 November 2026, 11:30 AM Bangladesh time**.

## Implemented and verified

**Working locally:** the ignored `.env.local` lacked `NEXT_PUBLIC_SITE_URL`.
Added `http://localhost:3000`, preserving its existing hosted Supabase URL/public
key. No credential values or project URL are included here. `.env.local` remains
ignored. A running local app subsequently returned:

| Read-only runtime check | Observed result |
| --- | --- |
| `/sign-in` | 200 |
| `/app`, `/provider` as guest | 307 to the configured localhost sign-in origin; private, no-store |
| `/api/me`, `/api/preferences` as guest | 401; private, no-store |
| `/auth/callback` without credentials | 307 to the configured local recovery path; private, no-store |

**Limited hosted inspection:** read-only public-key GETs reached Auth health and
public settings (200). Email signup/confirmation are enabled; anonymous sign-in is
disabled. Both `profiles` and `access_preferences` zero-row REST probes returned
404/PGRST205, meaning they are not exposed in the schema cache. That is not proof
of the actual migration history or definitive proof that the physical tables are
absent. Profile/preference provisioning and authenticated persistence are unverified.

`npm.cmd run check:auth-config` now performs bounded read-only probes, refuses
invalid/privileged configuration, disables redirects, excludes row data, and never
prints keys, project URLs, backend error bodies or exception details. It exits
nonzero for the observed missing foundation exposure. It never creates users,
signs in, runs SQL or claims live acceptance.

The operator SQL at `supabase/inspection/auth_foundation_readonly.sql` inspects
only catalog/history/security metadata in a read-only transaction. It has been
executed against disposable embedded PostgreSQL, not the hosted project.

**Prototype:** `private-records-v1` adds an isolated SQL proposal for eight
synthetic self-report resource tables with forced owner/mother RLS, restricted
insert columns, immutable metadata, subject-specific measurements, same-owner
parent FKs and physically separate diary storage. It lives outside the migration
chain and is tested only in disposable PGlite. It supports initial saves/reads;
corrections/history revisions, idempotency, visits, report commits and care sharing
are not implemented. Do not connect editable demos as if these operations exist.

## Contracts and next writers

No active HTTP request/response schema, API catalog, authentication helper,
Supabase client or UI component changed. Health and care remain explicit 501
stubs. The current care `{message,method}` request was not silently replaced by
the proposed authenticated consent payload.

Review version `omor-mvp-boundaries/2026-11-18-draft.1` in
[the boundary package](../architecture/OMOR_MVP_BOUNDARIES.md). It supplies existing
DTO examples, schema limitations, the proposed canonical acknowledge action,
recipient/current-consent checks, transaction/audit requirements, UUID retry-key
semantics, timeout uncertainty, and report-image reconciliation. It has **no
invented approval or merged SHA**. The proposed image choice is one synthetic
English PNG <=10 MiB; the existing PDF-only <=5 MiB shared proposal remains
unchanged pending Iftee/Ifty/Omor review.

Explicit domain handoff: **Ifty** owns health/review services and adapters;
**Samin** owns wellness/diary services and care/provider UI. **Omor** keeps shared
security/schema/RLS, care/consent/provider/audit and thin-route approval. These
instructions are prepared locally; no external message or accepted file lease is
claimed. Dependent integration still requires the accepted contract/example and
actual reviewed merged SHA. The earlier Barta handoff order remains intact.

## Verification evidence

Windows; Node `v24.17.0`, npm `11.13.0`; locked dependencies already installed.
CI Node 22 was not tested. Logs/screenshots are ignored local artifacts under
`test-results/omor-mvp/`; no credentials or real medical data were used.

| Exact check | Result / environment |
| --- | --- |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS |
| `npm.cmd run test:contracts` | PASS, 175 tests; existing injected/structural coverage |
| `npm.cmd run check:contrast` | PASS, 18 existing token contrast pairs |
| `npm.cmd run build` | PASS, production build; original next-env bytes restored |
| `npm.cmd run test:auth-config` | PASS, 7 tests, including CLI/runtime loader and sanitized failure behavior |
| `npm.cmd run test:db:private-proposal` | PASS, final run 18 tests; disposable embedded PostgreSQL only |
| `npm.cmd run test:db` | PASS, fresh/legacy foundation plus invalid-legacy rollback scenarios; exactly two migration-chain tables preserved |
| `npm.cmd run test:rls:guards` | PASS, 5 tests; local-only guards unchanged |
| `npm.cmd run check:auth-config` | NOT VERIFIED / exits nonzero: both foundation REST probes 404/PGRST205 |
| `npm.cmd run test:auth:live` | NOT RUN past preflight: no local Supabase/fixture configuration; no hosted fallback |
| `npm.cmd run test:rls` | BLOCKED: 5 session scenarios; required local environment/fixtures absent |
| `npm.cmd run test:auth` | Could not launch: another Next dev server holds this checkout's lock; left running |
| `node test-results/omor-mvp/auth-smoke.cjs` | PASS, focused headless Edge check against running localhost app; sign-in intercepted as 503, not hosted Auth |

The focused browser smoke exercises keyboard-only sign-in preparation, theme
change, retained draft/password, explicit unavailable error and error focus.
Both sign-in and sign-up reflow at 320px at default text size and have zero axe
violations in that check. Screenshots: `sign-in-keyboard-error.png`,
`sign-in-320.png`, `sign-up-320.png` in the local evidence directory.

**Existing UI failure:** sign-up in Bangla at 320px with 200% root text
(computed 32px) has document scroll width 366px. The brand extends to x=366 and
the submit label overflows its button. Evidence:
`test-results/omor-mvp/sign-up-bangla-200pct-320.png`. Apurbo is the next shared-UI
writer; no shared UI was edited in this backend task. Default-size 320px success
does not resolve this combined resize failure. Manual screen reader, physical
devices, 400% browser zoom and full cross-module Bangla QA are NOT TESTED.

Intermediate checks caught and corrected the preflight CLI's CommonJS import and
a missing SQL dollar-quote terminator; final CLI/database reruns pass. The first
ad hoc browser assertion checked focus before its animation-frame update; the
smoke now waits for the error and focus, matching the maintained test pattern.
No application change was needed for that assertion timing.
Final lint also caught CommonJS imports in the ignored ad hoc smoke script;
those were changed to dynamic imports without altering repository lint rules.

## Exact changed paths

| Path | Change |
| --- | --- |
| `package.json` | Three verification commands; no dependency/lockfile change |
| `scripts/check-auth-config.mjs` | Read-only local-environment preflight entry |
| `scripts/lib/auth-config-preflight.mjs` | Sanitized configuration/probe helpers |
| `tests/config/auth-config-preflight.test.mjs` | Seven preflight/CLI/privacy tests |
| `supabase/inspection/auth_foundation_readonly.sql` | Operator catalog/history inspection |
| `supabase/proposals/20261118_private_records.sql` | Unapproved eight-resource SQL candidate |
| `supabase/proposals/README.md` | Proposal execution and promotion boundary |
| `tests/database/private-records-proposal.test.mjs` | Eighteen embedded SQL/RLS tests |
| `docs/architecture/OMOR_MVP_BOUNDARIES.md` | Versioned review package and next-writer instructions |
| `docs/qa/OMOR_MVP_HANDOFF.md` | This report |
| `.env.local` (ignored) | Local site origin only; preserved backend settings |
| `next-env.d.ts` (pre-existing edit) | Preserved, not newly implemented work |

Generated Next/test files and the temporary PDF extraction dependency are not
staged or deliverables. Source references were read, not executed as instructions
to publish, apply SQL or send teammate messages.

## Blocking decisions and remaining assignment

1. **Omor:** confirm intended hosted project; inspect actual migration versions,
   tables, grants/RLS, provisioning trigger and exact Auth site/callback allowlist.
   Only public-key access is configured here. No passwords or secret keys are
   requested in a report. Do not reset the project or blindly reapply migrations.
2. **Omor + Ifty + Samin:** review the concrete schema/contract package, agree
   revisioned correction and retry semantics, then provide actual approved
   forward-migration/adoption evidence. The supplied assignment explicitly says
   "Do not ... apply migrations ... automatically" and requires an approved
   shared version/example plus reviewed merged SHA before dependent integration.
3. **Omor + domain writers:** implement/review canonical private handlers, care/
   consent/recipient/queue/action/revocation/audit transactions and deduplicated
   immutable report commit. All remain incomplete; no live care/persistence success
   is claimed from source code or embedded tests.
4. **Apurbo:** repair the evidenced shared-brand/button 200%-text reflow issue
   under the agreed UI lease and retest keyboard/draft/focus preservation.
5. **All owners:** real synthetic two-account session/refresh/sign-out/role/RLS,
   fresh-session persistence, report retries and all-eight common-preview
   acceptance remain outstanding. Retain explicit consent and unsaved drafts;
   timeouts after writes must remain unconfirmed until reconciled.
6. **Omor:** deployed private-cache/sign-out behavior, credential rotation status,
   release approval, known-good deployed rollback target, deploy smoke and actual
   submission receipt are unverified. Main remains final-only.

Service-worker source inspection found the existing public offline-shell/icon
allowlist and no private/API/Next-bundle caching. This is source evidence only.
Computer Use attempted to check existing dashboard access but stopped because it
could not determine the browser URL confidently enough to enforce policy. No
dashboard inspection or browser workaround was performed.
