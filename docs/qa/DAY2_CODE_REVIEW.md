# Day 2 code review — Steps 8–15

Reviewed 17 November 2026. Scope: code added or changed during this conversation,
including migrations, provisioning/RLS, SSR authentication, callbacks/redirects,
workspace guards, `/api/me`, preference persistence, client adapters and test runners.
This is a source review plus the checks below, not certification or proof that an
uninspected deployed Supabase project has the same configuration/policies.

## Findings fixed

| Finding | Impact | Fix / evidence |
| --- | --- | --- |
| P2: storage failures broke language switching | `saveLocalPreferences()` swallowed failed writes while readers continued returning defaults/old storage. Auth language controls stopped working when storage was blocked or full. | Browser-only memory fallback now retains validated choices after failed writes. Server reads still return defaults, and successful writes resume persistent storage. Both blocked-storage and quota tests failed before the fix and pass afterward. |
| P2: an untrusted URL could claim sign-out | `/sign-in?status=signed-out` displayed “You have signed out” without checking whether sign-out occurred. | The query now produces a neutral sign-in prompt, not a session-termination assertion. The actual POST handler still requires successful Auth sign-out before redirecting. A browser test reproduced the old claim and verifies its removal. |
| P2: incomplete preference-client error/confirmation validation | Transport/JSON failures escaped the documented client error type. A structurally valid defaults-only response could be accepted as a successful PATCH snapshot. | The adapter now maps transport failures to `PreferencesApiError(0)` and invalid responses to status 500. Successful PATCH snapshots require a saved timestamp, a matching ETag and matching supplied values. The existing server never intentionally returned defaults on PATCH; this closes an adapter validation gap, not evidence of a database save failure. Two new contract tests reproduce the gaps and pass after fixing them. |
| P2: loopback callback configuration mismatch | The local test/app setup supports both localhost and 127.0.0.1, but Supabase's callback allowlist included only localhost. Confirmation links generated for the second origin were outside that allowlist. | Added the exact `http://127.0.0.1:3000/auth/callback` local URL. No wildcard/hosted URL was added. Actual local email delivery/confirmation remains NOT RUN. |

Memory fallback is limited to the current browser runtime. If persistent browser
storage is unavailable, a full reload cannot retain those anonymous settings;
this is not represented as account persistence. Account settings remain separate.

## Reviewed security and data-integrity paths

- Provisioning assigns `mother` and ignores editable role metadata. Client grants
  do not permit profile role/owner/timestamp changes. Trigger execution is not a
  client RPC. Both migration files and the original archived SQL were inspected;
  the archive's Git object hash still matches the original tracked file.
- Identity derives from Auth `getUser()` before an own-UUID profile query. Public
  helpers reject privileged keys. Workspace guards and direct API handlers enforce
  server authorization. No preference is used to infer role or care rights.
- Return paths reject external/protocol-relative/backslash/control-character
  redirects. Callback configuration is checked before consuming an Auth link.
  Mutation Origin checks, HttpOnly cookies, refresh-cookie preservation and
  private/no-store responses were traced. Real token rotation remains unverified.
- `/api/me` projects only ID, display name and trusted role. Missing own profiles,
  malformed rows, database errors and caller-selected target IDs have contract tests.
- Preferences validate a closed ten-field schema. Their RPC uses invoker permissions
  and RLS, takes no target UUID, merges partial changes under a row lock, and rejects
  stale versions. Missing-row creation, monotonic versions and rollback paths pass
  embedded PostgreSQL tests. No schema or policy change was needed in this review.
- Test runners use local-only origins/public keys. Live tests use real Auth
  sessions when configured; embedded SQL role simulations and injected Auth
  fixtures are not reported as live authentication evidence.

No additional owner-access or role-promotion bypass was confirmed in these paths
or the executed tests. This does not establish that the application is bug-free.

## Earlier Steps 8–13 checks (historical evidence)

| Check | Result / limits |
| --- | --- |
| `npm.cmd run test:contracts` | PASS: 96 tests, including auth, `/api/me`, preference validation and the two new adapter regression tests |
| `npm.cmd run test:auth` with installed Edge | PASS: 14 browser/HTTP tests, including keyboard paths, storage-failure cases, reflow and axe |
| Theme-combination check (included above) | PASS: 320px, extra-large text, spacious layout, reduced motion, three themes × both contrast settings; inputs retained and axe passed |
| `npm.cmd run test:db` | PASS: fresh/legacy migration paths, invalid-data rollback, owner isolation, role immutability and atomic preference/version assertions in disposable PostgreSQL |
| `npm.cmd run test:rls:guards` | PASS: five network/credential guard tests |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS |
| `npm.cmd run build` | PASS: production build includes both canonical API routes and protected workspaces |
| `git diff --check` | PASS |
| `npm.cmd audit --omit=dev --json` | PASS: no reported production dependency vulnerabilities at review time |
| `npm.cmd audit --json` | Seven moderate development-tool dependency advisories, no high/critical findings; ESLint/typescript-eslint → minimatch chain. These dependency versions are unchanged by this review; do not interpret the production-only audit as a clean full dependency audit. |
| `npm.cmd run test:auth:live` | NOT RUN: required local session-test configuration is missing; preflight refused execution |
| `npm.cmd run test:rls` | NOT RUN: all five real-session scenarios blocked by missing configuration |

No automated result is presented as a manual screen-reader/device test. Email
confirmation, real session refresh/expiry, multi-session database concurrency and
deployed policy state still require local Supabase integration testing.

## Remaining integration/release gaps

1. Supply the local Supabase services and confirmed synthetic Ayesha/Nusrat fixtures
   before running real-session tests. No hosted or production fallback was used.
2. Adapt's existing UI still needs explicit account-loading/save integration and
   local/account conflict handling. The API/client adapter does not automatically
   connect those controls. Homepage font/compact-density values remain local-only.
3. Environments that already tracked archived migration `001` require migration
   history inventory/reconciliation before deployment. This review does not repair
   remote history or reset data.
4. The seven moderate development-tool advisories remain dependency-maintenance
   work. No blanket `npm audit fix` or unrelated dependency update was performed.

## Changes made during this review

- `src/lib/access-preferences.ts` — validated browser-memory fallback
- `src/features/auth/EmailSignIn.tsx` — neutral sign-out navigation message
- `src/features/adapt/api/client.ts` — consistent failures and PATCH confirmation checks
- `supabase/config.toml` — exact second loopback callback URL
- `tests/contracts/preferences.spec.ts` — adapter regression tests
- `tests/auth/offline.spec.ts` — blocked/quota storage, query-message and preference-combination regressions
- `docs/API_PREFERENCES.md`, `docs/AUTHENTICATION.md` — review references/clarifications
- This report

No design tokens, AGENTS/DESIGN files, production resources or migration SQL were
changed during this review. Existing unrelated/uncommitted work was preserved.

## Reproduce

```powershell
npm.cmd run test:contracts
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm.cmd run test:auth
npm.cmd run test:db
npm.cmd run test:rls:guards
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd audit --omit=dev
npm.cmd audit
```

For the pending real-session checks, follow [Auth setup](../AUTHENTICATION.md),
[RLS fixture setup](../../supabase/RLS_TESTING.md) and the existing migration-history
instructions, then run `npm.cmd run test:auth:live` and `npm.cmd run test:rls`.
No production migration/deployment is authorized by these instructions.

## Latest review and cleanup — Steps 8–15

This section supersedes historical test counts/build outcomes above. Reviewed
17 November 2026; no production connections, migrations, deployment or Git writes.

| Finding | Fix and evidence |
| --- | --- |
| Public requests with session cookies lacked an explicit private cache policy | Proxy now sets private/no-store and no-referrer when a request carries session cookies or a response sets cookies. A regression test failed before the fix and passes afterward. Actual hosted CDN/token rotation remains unverified. |
| General E2E discovery collected isolated Auth suites and executed Node RLS tests while listing | `playwright.config.ts` now excludes Auth/RLS directories; they keep their dedicated commands. Discovery changed from 58 mixed tests to 36 general E2E tests, without Node-test side effects. |
| Build spawned 15 page-generation workers and previously exhausted machine memory | `next.config.ts` caps workers at two. Full production build verification is recorded below. |
| The combined eight-route HTTP check exceeded a 30-second cold-compile budget | Raised only this test's total budget to 90 seconds, retaining all assertions. Initial full Auth run: 14 passed, one timed out; targeted rerun of the corrected test passed (8.4 seconds). |

Cleanup:

- Removed 16 stale generated failure screenshots, error contexts and last-run JSON
  files under `tmp/hero-regression-final`, `tmp/hero-regression-results`,
  `tmp/hero-test-results` and `tmp/hero-verification`. Added ignores for these outputs.
  Kept baseline captures and scripts used by `scripts/capture-hero-refinement.mjs`.
- Removed the empty, unreferenced `src/lib/supabase/client.ts` placeholder; active
  `browser.ts` and `server.ts` remain.
- Consolidated `docs/architecture/api-contracts-validation.md` into this report;
  updated its three referring documents. Historical results retain their labels.
- Kept executable contract/Auth/SQL/session-safety regressions and their runners:
  they cover different boundaries and are referenced by npm commands. Tests are
  development-only; deleting these would remove required security coverage.
- No new standalone test/report file was added. Generated outputs from this
  verification are cleared after checking results.

Latest checks (updated as they finish): contracts PASS (103), database regression
PASS (fresh/legacy/rollback), RLS guards PASS (5), typecheck PASS, lint PASS,
E2E discovery PASS (36 intended tests), documentation links PASS (48).
Auth/browser checks: 14 PASS in the full run; the remaining multi-route HTTP
check PASS on its targeted rerun after the timeout adjustment. The full suite was
not rerun after that test-only budget change. No behavioral assertion was relaxed.
Production build PASS: compilation, TypeScript, all 22 static pages and build
traces completed successfully with two page-generation workers (exit 0).
Live Auth/RLS remains NOT RUN: local service/synthetic configuration is missing;
the live preflight refused execution without a remote fallback.

## Step 14 contract verification (historical evidence)

Verified locally on 17 November 2026. The canonical inventory is
[api-contracts.md](../architecture/api-contracts.md). No endpoint, database migration, UI or
teammate-owned feature implementation was added or changed in this step.

### File inventory for this step

| File | Change |
| --- | --- |
| `docs/architecture/api-contracts.md` | Canonical current/planned route tables, ownership, fields, security, naming conflicts, errors and pending review gates |
| `docs/API_CONTRACTS.md` | Short entry point linking the canonical document, preserving starter/legacy distinctions |
| `docs/qa/DAY2_CODE_REVIEW.md` | Consolidated verification and handoff report |
| `src/lib/contracts/current-api.ts` | Eight source-verified operations with derived request schemas, status-specific response schemas and inferred current wire types |
| `src/lib/contracts/transport.ts` | Reusable runtime success/result/page schemas, current user response and explicitly proposed path/pagination validators |
| `src/lib/contracts/api.ts` | Separate future proposals from current operations; current wire types win for overlapping methods/paths |
| `src/lib/contracts/index.ts` | Export shared additions through the existing contract entry point |
| `tests/contracts/api-registry.spec.ts` | Six tests for route coverage, documentation coverage, current/proposed separation, envelopes and path/query validation |
| `tests/auth/offline.spec.ts` | Actual local HTTP checks for all eight operations and invalid stub bodies using centralized response validators |

Other working-tree changes predate Step 14. Existing domain schema definitions,
Auth/session handling, preferences persistence, route handlers, protected design
files and migration files are preserved. The existing `src/lib/contracts/` home
avoids a competing `src/lib/validators/` schema tree.

### Executed checks

| Check | Result | Evidence / limit |
| --- | --- | --- |
| `npm.cmd run test:contracts` | PASS | 102 tests, including six new registry/transport tests; all current method/path exports and proposed type-map operations are documented |
| `npm.cmd run test:auth -- --grep 'centralized schemas'` | PASS | One HTTP test checks eight operations plus two invalid stub payloads, response schema/status and no-store headers |
| `npm.cmd run typecheck` | PASS | TypeScript exits 0, including current/proposed inferred request compatibility |
| `npm.cmd run lint` | PASS | ESLint exits 0 |
| `npm.cmd run build` | FAIL | Compilation and build TypeScript passed; Node ran out of memory during static-page generation using 15 workers (exit 1); no deployment |
| `npm.cmd run test:auth:live` | NOT RUN | Preflight exits 1: no local Supabase at port 54321 and/or synthetic session configuration |

The HTTP suite explicitly blanks Supabase URL/public-key configuration for its
isolated local server. It verifies real unavailable/stub HTTP behavior, not
successful authenticated database requests. Contract unit tests cover valid
identity/preferences responses and authorization failure shapes, but are not
substitutes for actual Auth/RLS sessions. No remote fallback or production write
was used. No new clinical, provider-delivery or accessibility certification is claimed.
The build needs rerunning with adequate available memory before release; its
resource failure does not count as a successful production build.

### Remaining risks and team decisions

- Five current platform operations exist; three other operations are honest Mock
  routes. Future domain contracts do not implement Storage, extraction, RAG,
  consent, queues or provider record access.
- Full Barta/care payload adoption and health/report naming require the affected
  owners' review. Keep existing routes and smaller stub payloads until then.
- Legacy identity routes keep bare `{profile}` / `{code}` responses; new callers
  should use `/api/me`. Unimplemented `/api/access-preferences` GET/PUT proposals
  remain explicitly Needs Review, with no callable alias or duplicate persistence.
- Live session success, mother/provider authorization and RLS need local
  synthetic-account evidence before integration sign-off. The current provider
  gate returns only the provider's own profile and grants no patient access.
- Public POST stubs do not yet implement production rate limits or persistence.
  The standard 429/Retry-After policy is a proposal, not deployed enforcement.
- All owner approvals remain pending; record actual reviewers and decisions in
  [team-contracts.md](../architecture/team-contracts.md), rather than treating this document as approval.

### Exact rerun commands

From `D:\prohor`, using the repository's installed Node dependencies:

```powershell
npm.cmd run test:contracts
npm.cmd run test:auth -- --grep 'centralized schemas'
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

For actual local synthetic sessions, follow [AUTHENTICATION.md](../AUTHENTICATION.md)
and [RLS_TESTING.md](../../supabase/RLS_TESTING.md) to configure/start local
Supabase, review/apply its local migrations and provision the synthetic fixtures.
Then run `npm.cmd run test:auth:live` and `npm.cmd run test:rls`. Required missing
inputs reported by the preflight are `PROHOR_RLS_URL`, `PROHOR_RLS_PUBLIC_KEY`,
`PROHOR_RLS_AYESHA_PASSWORD` and `PROHOR_RLS_NUSRAT_PASSWORD`, or the supported
local CLI configuration described in those guides. Never use hosted production
accounts or service-role credentials in these user-session tests.

