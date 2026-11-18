# Day 2 Step 12 — GET /api/me

Implemented 17 November 2026. No schema, RLS, frontend, production database,
deployment, commit or push changes are part of this step.

## Authentication and projection

`src/app/api/me/route.ts` is a dynamic GET route delegating to `handleMeGet`.
It reuses the existing Supabase SSR client and shared `readIdentity` lookup:

1. Validate the cookie session with Supabase Auth `getUser()` on every request.
   Missing/invalid/expired, unconfirmed and anonymous identities are rejected.
2. Select only `user_id, display_name, role` from `profiles`, filtered by the
   verified Auth user UUID. The public key plus caller session preserves RLS.
3. Verify ownership and the trusted role, then map `user_id` to `id` and
   `display_name` to `displayName`. Only `mother/provider` are supported by the
   implemented two-table foundation. User metadata cannot supply a role.
4. Return only the validated projection; no email, timestamps, preferences,
   tokens or other private fields. Blank display names are valid schema defaults.

The route has no target-user input and ignores query parameters such as `userId`,
`user_id` or `role`. It has no service-role fallback and never inserts a profile
on GET. Auth provisioning remains the existing database trigger's responsibility.

The existing Step 11 `/api/auth/me` compatibility endpoint is preserved with its
original response and 503 behavior. Authentication and profile retrieval are
shared, not reimplemented. The new adapter distinguishes a missing profile
without changing workspace guards or old endpoint behavior.

## Response contract

Uses the agreed v1 envelope and `Cache-Control: private, no-store` on every outcome.
Each response has a server-generated correlation UUID. The route also sets
`Referrer-Policy: no-referrer`.

200:

```json
{
  "data": {
    "id": "d2000000-0000-4000-8000-000000000001",
    "role": "mother",
    "displayName": "Ayesha"
  },
  "requestId": "d2000000-0000-4000-8000-000000000010",
  "contractVersion": "1"
}
```

Error example (401):

```json
{
  "error": { "code": "unauthenticated", "message": "Authentication required." },
  "requestId": "d2000000-0000-4000-8000-000000000010"
}
```

| Status | Code | Safe message |
| --- | --- | --- |
| 401 | `unauthenticated` | Authentication required. |
| 404 | `not_found` | Your profile was not found. |
| 500 | `unavailable` | Unable to retrieve your profile. |

Configuration, Auth-service outages, database failures, malformed rows and
unexpected exceptions produce the same generic 500. This is the explicit Step 12
status contract; Step 11 routes retain their existing 503 dependency responses.
Internal errors, credentials and tokens are never included. POST is unsupported
(Next.js returns 405); HEAD follows Next.js automatic GET handling.

## Local setup and commands

Use [the existing Auth setup](AUTHENTICATION.md) and local migration-history
instructions. No new migration or database reset is required. Configure local
`.env.local` (never commit it):

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local public publishable or anon key>
```

```powershell
npm.cmd run dev
```

With local Supabase running and configured, a guest request should return 401:

```powershell
curl.exe -i http://localhost:3000/api/me
```

For a confirmed synthetic Ayesha account, use a cookie session in memory:

```powershell
$prohorPassword = [System.Net.NetworkCredential]::new('', (Read-Host 'Synthetic Ayesha password' -AsSecureString)).Password
$prohorBody = @{ email = 'ayesha-rls@example.invalid'; password = $prohorPassword } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/auth/sign-in' -Headers @{ Origin = 'http://localhost:3000' } -ContentType 'application/json' -Body $prohorBody -SessionVariable prohorSession
Invoke-RestMethod -Uri 'http://localhost:3000/api/me' -WebSession $prohorSession
Remove-Variable prohorPassword, prohorBody
Invoke-WebRequest -Method Post -Uri 'http://localhost:3000/auth/sign-out' -Headers @{ Origin = 'http://localhost:3000' } -WebSession $prohorSession
Remove-Variable prohorSession
```

Run automated checks:

```powershell
npm.cmd run test:contracts
npm.cmd run typecheck
npm.cmd run lint
```

Run only the new contract tests:

```powershell
npx.cmd playwright test --config playwright.contracts.config.ts me.spec.ts
```

The isolated HTTP check starts the app with no Supabase configuration and proves
that the actual route returns a safe 500 rather than data, and rejects POST:

```powershell
npm.cmd run test:auth -- --grep 'GET /api/me'
```

For real-session endpoint tests, prepare the existing confirmed synthetic mother
Ayesha and trusted provider Nusrat and set the four `PROHOR_RLS_*` variables using
[Step 10's exact commands](../supabase/RLS_TESTING.md). Then:

```powershell
npm.cmd run test:auth:live
npm.cmd run test:rls
```

The live suite launches its own local app with explicit loopback Supabase config.
It signs both users in through real Auth, compares roles/IDs, tests guest denial,
and attempts to select Nusrat through Ayesha's query parameters. The existing RLS
suite separately attempts direct cross-user reads/updates and role promotion.
Neither suite uses service credentials. Do not use hosted or production accounts.

## Verification limits

Executed on 17 November 2026:

| Check | Result |
| --- | --- |
| `test:contracts` | PASS: 67 tests, including all 18 new `/api/me` cases |
| TypeScript / lint | PASS |
| `build` | PASS: production build includes dynamic `/api/me` route |
| `test:auth -- --grep 'GET /api/me'` | PASS: actual local HTTP route, unconfigured 500/no-store and POST 405 |
| `test:db` | PASS: existing embedded SQL migration/RLS regressions |
| `test:auth:live` | NOT RUN: missing local Supabase/session fixture configuration; preflight exits nonzero |

Contract tests use synthetic injected Auth/database responses, not real sessions.
The local HTTP test runs with Supabase explicitly disabled. Missing-profile and
database-failure cases are simulated; no live profile is deleted or corrupted.
Actual session/RLS integration is NOT RUN when local Supabase or fixture
credentials are missing. Passing contract tests is not proof of deployed policies.

## Files for this step

Created: `src/app/api/me/route.ts`, `tests/contracts/me.spec.ts`, this document.

Modified: `src/lib/auth/access.ts` (missing-profile reason),
`src/lib/auth/handlers.ts` (canonical adapter), `src/lib/contracts/platform.ts`
(minimal DTO), `src/lib/contracts/api.ts` (route type),
`tests/auth/offline.spec.ts`, `tests/auth/live.spec.ts`,
`docs/architecture/api-contracts.md`, `docs/API_CONTRACTS.md`.
