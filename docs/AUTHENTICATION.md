# Day 2 Step 11 — authentication implementation

Status: **implemented, partially verified; live Supabase acceptance blocked**.

See the [Steps 8–13 code review](qa/DAY2_CODE_REVIEW.md) for subsequent fixes and
current test results. A `status=signed-out` URL is only a navigation hint; the page
does not treat that untrusted query value as proof of session termination.
No production deployment, migration, schema reset, or hosted Auth mutation was
performed. The two-table schema and RLS from Steps 8–10 are reused unchanged.

## Inspection and scope

The repository had a working scaffold for `EmailSignIn`, an email-code callback,
SSR helpers and cookie refresh. It had no routable sign-in/sign-up screens or
private workspace guards. Apurbo's visual/auth-direction ownership is recorded in
`TEAM_HANDOFF.md`; no separate Apurbo authentication implementation was found.
The existing form's structure, branding, token classes and access-preference panel
are reused. The homepage sign-in dialog now links to authentication instead of
saying it is unavailable. Other feature modules are unchanged.

## Architecture and session flow

1. `/sign-up` and `/sign-in` use the existing `EmailSignIn` component, with labelled
   fields, native validation, password-manager/paste support, pending/error states,
   keyboard focus on responses, Bangla/English copy, and existing preferences.
2. The form posts to `/auth/sign-up`, `/auth/sign-in` or `/auth/email-link`.
   These route handlers validate a bounded JSON body and an exact configured
   Origin. Unknown fields (including roles and user IDs) are rejected. Passwords
   are never trimmed, logged, returned, or persisted outside Supabase Auth.
3. Signup calls Supabase Auth. The existing Auth trigger creates a `mother`
   profile and preferences. No application upsert, service credential, or client
   role assignment is used. Duplicate-account responses stay generic. If email
   confirmation is enabled, signup does not establish an authenticated session.
4. `/auth/callback` supports PKCE codes and reviewed email token-hash link types.
   It verifies the link through Auth, validates the returned user, reads that
   user's profile under RLS, and selects a safe destination. Expired/invalid links
   return to sign-in with a recoverable message. Confirmation codes/tokens are
   removed from the destination and responses have no-referrer/no-store headers.
5. Account authentication is **server mediated** through `@supabase/ssr`.
   Cookies are host scoped, HttpOnly, SameSite=Lax and Secure in production.
   The browser receives no session token in auth JSON responses. The existing
   browser Supabase helper remains for public data; do not use it for account
   sessions with this HttpOnly design. Use server routes for future private data.
6. The proxy refreshes sessions and preserves every refreshed cookie on redirects
   and denied responses. It uses Auth `getUser()` plus the caller's own profile,
   never local storage, user metadata, a client UUID or `getSession()` as proof.
   Missing, unconfirmed, anonymous, expired or invalid identities cannot enter a
   private workspace. Profile/configuration/Auth outages fail closed.
7. `/app` and all descendants require a mother. `/provider` and all descendants
   require a trusted DB-assigned provider. Server layouts and page data loading
   repeat authorization, independently of the proxy. Future route handlers must
   also authorize directly; a layout alone does not protect an API handler.
8. `/api/auth/me` returns only the verified caller's projected profile.
   `/api/auth/provider` applies an additional provider-role check. Neither endpoint
   accepts a target user ID or returns records/queues. Provider status never
   bypasses RLS or creates consent.
9. POST `/auth/sign-out` terminates the current session and clears SSR cookies,
   then redirects to a fixed sign-in destination. GET cannot sign out. The UI
   navigates away only after a successful response; failure is announced.

The provider workspace is explicitly simulated and empty: assignment, consent,
clinical records and provider approval workflows are **not connected**. No fake
care acknowledgements or clinical data are shown. Public educational pages remain
available without authentication.

Implementation references: [Supabase SSR client guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs),
[SSR advanced guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide),
and [password authentication](https://supabase.com/docs/guides/auth/passwords).

## Local configuration and commands

Install dependencies and the test browser:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
```

On this Windows machine the downloaded headless shell could not launch; tests
ran successfully with installed Edge. Select it before the browser commands:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
```

With Docker and Supabase CLI installed, start local services and apply only
reviewed pending local migrations. Do not reset an existing database:

```powershell
npx.cmd supabase start
npx.cmd supabase migration list --local
npx.cmd supabase migration up --local
```

If historical migration `001` was applied, first follow the history-reconciliation
warning in [the Supabase README](../supabase/README.md). This step adds no migration.

Copy `.env.example` to `.env.local` if absent and configure:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable or legacy anon key>
```

Use the exact configured site origin in the browser (including port). Do not put
any secret/service-role key in `NEXT_PUBLIC_*`. RLS-bound helpers also reject
privileged keys. Start the app:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000/sign-up`. Create synthetic accounts only. Local email
confirmation is enabled in `supabase/config.toml`; inspect the local email inbox
URL printed by `supabase start`, follow the confirmation link in the same browser
for PKCE, and then sign in. Verify `/app`, refresh, and sign out. Missing profiles
require migration/trigger investigation, not a privileged application fallback.

### Supabase Dashboard / email configuration

For an independently approved staging/production deployment, manually configure:

- Email provider/signup enabled; **Confirm email enabled**; anonymous sign-in
  disabled unless a separate reviewed flow is introduced.
- Site URL set to the exact deployment HTTPS origin. Allow only exact
  `<site-origin>/auth/callback` redirects (localhost is for development only).
- Minimum password length at least 12, suitable Auth rate limits, and reviewed
  abuse protection. For real delivery, configure approved SMTP and templates.
- The default PKCE email link can be used in the originating browser. For a
  server-verifiable token-hash template, use the confirmation/magic-link template:
  `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`.
  The application always supplies a RedirectTo containing `?next=...`; do not use
  that exact `&` template for unrelated flows without a query. Test templates with
  real local email before enabling them externally. Recovery/change-email flows
  are outside this step and must not be routed through the signup callback.
- Provider status assigned only through trusted platform administration after
  approval. There is no self-service provider signup or approval UI in this slice.

Deployment and Dashboard modifications were not performed by this task.

## Automated checks

No-backend checks (the browser suite starts an isolated app on port 3007 and
explicitly clears Supabase configuration so it cannot contact a hosted project):

```powershell
npm.cmd run test:contracts
npm.cmd run test:auth
npm.cmd run test:db
npm.cmd run test:rls:guards
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Contract tests use injected Auth fixtures and directly call the server handlers;
they are not real Supabase login evidence. The embedded SQL regressions independently
verify role/owner immutability and cross-user RLS. Browser checks cover server-side
fail-closed behavior, callback redirects, CSRF, keyboard submission, preference/input
retention, 320px reflow and axe. Traces/videos are disabled in the auth config to
avoid recording credentials or tokens.

### Real authenticated-session tests

Prepare confirmed local `ayesha-rls@example.invalid` (mother) and
`nusrat-rls@example.invalid` (trusted simulated provider), as described in
[Step 10](../supabase/RLS_TESTING.md). Provider assignment must be completed by
trusted local fixture administration; the tests never grant themselves a role.
Stop any existing development server on port 3000 before running live auth tests;
the suite launches its own instance with explicit local Supabase configuration.

```powershell
$env:PROHOR_RLS_URL = 'http://127.0.0.1:54321'
$env:PROHOR_RLS_PUBLIC_KEY = Read-Host 'Local public publishable or anon key'
$env:PROHOR_RLS_AYESHA_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Synthetic Ayesha password' -AsSecureString)).Password
$env:PROHOR_RLS_NUSRAT_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Synthetic Nusrat password' -AsSecureString)).Password
npm.cmd run test:auth:live
npm.cmd run test:rls
Remove-Item Env:PROHOR_RLS_AYESHA_PASSWORD, Env:PROHOR_RLS_NUSRAT_PASSWORD, Env:PROHOR_RLS_PUBLIC_KEY, Env:PROHOR_RLS_URL
```

Live tests use real app cookies and direct server endpoints, then the existing
Step 10 suite uses real Auth sessions for cross-user reads/updates and role denial.
The registration test creates a new synthetic pending account; it does not pretend
email confirmation has completed. The full new-account confirmation journey must
also be checked via the local inbox. Dedicated synthetic fixtures remain in local
Auth; discard them through trusted local administration when no longer needed.

## Verification report and limitations

Verified on 16 November 2026:

| Check | Result |
| --- | --- |
| `test:contracts` | PASS: 48 tests, including 19 auth/server-handler tests |
| `test:auth` with installed Edge | PASS: 6 local HTTP/browser tests, including keyboard, 320px reflow and axe |
| `test:db` | PASS: fresh schema, legacy preservation, atomic rollback and SQL RLS regressions |
| `test:rls:guards` | PASS: 5 local-only credential/request guard tests |
| Typecheck, lint, production build | PASS |
| `test:auth:live` | NOT RUN: preflight blocked by local Supabase/configuration/fixtures |
| `test:rls` | NOT RUN: same missing local session-test setup |

| Requested behavior | Evidence and remaining verification |
| --- | --- |
| Mother registration | PASS in injected server tests and embedded provisioning tests; real new-account confirmation NOT RUN |
| Sign-in / sign-out | PASS in injected server tests, including failure handling; real session lifecycle NOT RUN |
| Persistence after refresh | Implemented using SSR cookies/proxy; real persistence and rotation NOT RUN |
| Invalid credentials / expired sessions | PASS in injected server tests; invalid callback recovery also PASS over local HTTP; genuine token-expiry integration NOT RUN |
| Unauthenticated `/app/*` access | PASS: unconfigured local app fails closed, including direct requests; configured guest redirect NOT RUN |
| Mother denied provider workspace | PASS in direct injected authorization; real signed-in mother integration NOT RUN |
| Authorized provider access | PASS in direct injected authorization; real provider integration NOT RUN |
| No self-promotion | PASS: server input rejection and SQL column-grant tests; authenticated REST scenario NOT RUN |
| No cross-user private profile | PASS: Auth-derived projection and embedded RLS tests; real REST scenario NOT RUN |
| Safe return destinations | PASS: contract tests plus local callback HTTP tests |

Screenshots are generated at `test-results/auth/sign-up-320.png` and
`test-results/auth/sign-in-1280.png` (ignored local QA artifacts). Manual screen
reader/device testing is NOT RUN; automated axe results are not certification.

Live Auth and RLS tests are **NOT RUN** here: Docker/local Supabase and the required
synthetic fixture credentials are unavailable. The live runner exits nonzero and
prints the missing setup instead of reporting success. Production security state
and the complete registration-confirmation journey remain unverified.

Server tests cover invalid/expired identity rejection and injected provider roles.
They do not prove real refresh-token rotation or expiry timing. Manually verify
refresh after actual token expiration on local Supabase, as well as session
persistence after a browser refresh. Sign-out clears the current browser session;
already copied access JWTs may remain valid until their configured expiry, and
other signed-in devices are not signed out by local-scope sign-out.

Rate limiting/email abuse controls remain Supabase/deployment configuration; there
is no in-memory rate limiter presented as distributed protection. Password recovery,
MFA, credential approval, consent-based records and account deletion are future
work. No claim of clinical validation or accessibility certification is made.

## File inventory for Step 11

Created:

- `src/lib/auth/{access,cookies,validation,handlers,require-workspace}.ts`
- `src/lib/supabase/config.ts`
- `src/app/(auth)/layout.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx`
- `src/app/auth/[action]/route.ts`, `src/app/auth/denied/page.tsx`
- `src/app/api/auth/me/route.ts`, `src/app/api/auth/provider/route.ts`
- `src/app/app/{layout,page}.tsx`, `src/app/provider/{layout,page}.tsx`
- `src/features/auth/AuthShell.tsx`, `src/features/auth/Workspace.tsx`
- `tests/contracts/auth.spec.ts`, `tests/auth/{offline,live}.spec.ts`
- `playwright.auth.config.ts`, `scripts/test-auth-live.mjs`, this document

Modified:

- `src/features/auth/EmailSignIn.tsx` — connects existing form to server Auth
- `src/lib/supabase/{server,proxy,browser}.ts` — validated public config, cookies,
  session refresh and server authorization
- `src/app/auth/callback/route.ts` — safe, verified confirmation/login completion
- `src/components/marketing/SignInNotice.tsx` — links existing dialog to sign-in
- `src/components/ui/Brand.tsx` — removes an overriding accessible label so its
  visible bilingual name is also its accessible name (axe finding, no visual change)
- `tests/homepage.spec.ts`, `tests/navigation-polish.spec.ts` — updated dialog title
- `package.json` — auth test commands, no dependency added
- `.env.example` — local placeholders instead of a hosted project configuration
- `supabase/config.toml` — explicitly requires local email confirmation

Pre-existing uncommitted Steps 8–10 work was preserved by Step 11. A later cleanup
removed the empty, unused `src/lib/supabase/client.ts` placeholder; active server
and browser helpers remain. `AGENTS.md`, `DESIGN.md`, design tokens and domain feature modules are
unchanged by Step 11.
