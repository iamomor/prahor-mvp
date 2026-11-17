# Day 2 Step 10: authenticated-session RLS tests

These tests use Supabase Auth password sign-in, Auth `getUser()` verification, and
PostgREST requests with real user access tokens. They use the existing
`@supabase/supabase-js` dependency. They do not use SQL `SET ROLE`, service-role
credentials, admin APIs, forged sessions, or SQL editor results as RLS evidence.

The existing `npm run test:db` remains a separate embedded PostgreSQL regression
test. Passing it does **not** establish that authenticated-session tests passed.

## Local-only prerequisites

1. Docker and the Supabase CLI, with the local stack running on port 54321.
2. The existing Day 2 migration applied to the local instance. See [setup and
   migration-history precautions](README.md). No new migration or table is needed.
3. Two dedicated, confirmed **synthetic** local Auth accounts with passwords:
   `ayesha-rls@example.invalid` and `nusrat-rls@example.invalid`. Ayesha's profile
   must have role `mother`. Nusrat's profile must have role `provider` assigned by
   trusted local fixture administration, independently of the tests.
4. The local public publishable/anon key, **never** a secret or service-role key.

The application currently uses email OTP. Password sign-in is used here solely to
obtain repeatable real Auth sessions for the dedicated local test accounts; it
does not change the application's login flow. Confirm the fixture accounts locally
if local email confirmation is enabled. Fixtures may be created through public Auth
signup; their default role will correctly be `mother`. This repository has no
provider approval workflow. A trusted local administrator must prepare Nusrat's
provider fixture before that specific scenario can run. The tests cannot and do
not self-promote her. If Nusrat remains a mother, the other scenarios run but the
provider scenario reports BLOCKED and the process exits 2.

No fixture administration or migration is performed by the session test runner.
Do not point it at a hosted project or production. It accepts only the configured
loopback origins and refuses admin routes, secret/service keys, remote redirects,
and privileged bearer roles on every request. A loopback proxy must also point
to a disposable local stack, never a remote database.

## Exact rerun commands (PowerShell)

Start the local stack and apply pending local migrations after reviewing history:

```powershell
npx.cmd supabase start
npx.cmd supabase migration list --local
npx.cmd supabase migration up --local
```

Prepare the two synthetic fixtures described above, then enter the local public key
and their passwords without storing them in source control:

```powershell
$env:PROHOR_RLS_URL = 'http://127.0.0.1:54321'
$env:PROHOR_RLS_PUBLIC_KEY = Read-Host 'Local publishable or anon key'
$env:PROHOR_RLS_AYESHA_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Synthetic Ayesha password' -AsSecureString)).Password
$env:PROHOR_RLS_NUSRAT_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Synthetic Nusrat password' -AsSecureString)).Password
npm.cmd run test:rls
Remove-Item Env:PROHOR_RLS_AYESHA_PASSWORD, Env:PROHOR_RLS_NUSRAT_PASSWORD, Env:PROHOR_RLS_PUBLIC_KEY, Env:PROHOR_RLS_URL
```

The runner deliberately ignores application `.env` files and `NEXT_PUBLIC_*` /
service-key variables. Tokens, passwords, keys, and raw SDK errors are not printed.
It signs both sessions out locally on completion. Keep these accounts dedicated to
tests, and avoid running the suite concurrently against the same fixtures.

Other checks:

```powershell
npm.cmd run test:rls:guards
npm.cmd run test:db
npm.cmd run typecheck
npm.cmd run lint
```

## Assertions and reporting

| Scenario | Required evidence |
| --- | --- |
| Ayesha owns her data | Exactly one own row per table; update returns one row and persists when reread |
| Nusrat is isolated | Targeted reads/updates return zero rows; Ayesha rereads unchanged rows |
| Unauthenticated access denied | Public-key-only reads/updates return PostgreSQL `42501` and HTTP 401/403 |
| Mother cannot become provider | Role PATCH denied with `42501`; Ayesha rereads role `mother` |
| Provider has no blanket access | Nusrat is confirmed provider in her own row; unrestricted lists contain only her ID, and cross-user reads/updates return zero rows |

An empty cross-user result is expected for RLS filtering. An auth failure, missing
table, malformed payload or unavailable service does not count as successful RLS
enforcement. The suite exits 0 only when all five scenarios pass, 1 on failed
assertions or fixture restoration, and 2 when required setup is missing.

Ayesha's synthetic display name and language are temporarily updated. Original
display name/settings are restored using **her own authenticated session** in a
`finally` block. Server-maintained `updated_at` timestamps advance and are not reset.
Interrupted processes or unavailable services can prevent restoration; check the
dedicated fixtures before reuse. The runner creates/deletes no accounts or tables.

## Scope and remaining risks

Only `profiles` and `access_preferences` exist in this active migration slice.
The provider scenario proves isolation for these tables, not future clinical
records, consent, storage, RPCs or provider queues. Those require their own tests
when implemented. This suite also does not verify browser OTP callback/cookie
handling, credential approval, or production policy state.

The inspected migration already uses owner-only SELECT/UPDATE policies and column
grants for `display_name` / `settings`; no insecure policy was identified that
requires a database change for this step. A source review is not proof that a
deployed environment has the same policies.

## Execution report — 16 November 2026

In this workspace Docker/Supabase CLI are unavailable, no local stack is listening
on port 54321, and the dedicated session-test environment/fixtures are not supplied.
`npm.cmd run test:rls` therefore reports all five scenarios **BLOCKED / NOT RUN**
and exits 2. No authenticated-session scenario is claimed PASS.

| Separate check | Result |
| --- | --- |
| `npm.cmd run test:rls:guards` | PASS, 5 safety-guard tests |
| `npm.cmd run test:db` | PASS, fresh/legacy migrations and invalid-data rollback |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run lint` | PASS |
| `git diff --check` | PASS |

These results are not authenticated-session RLS results. A direct local Auth
health request also confirmed that `127.0.0.1:54321` was unavailable.
