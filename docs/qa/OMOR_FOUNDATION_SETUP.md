# Hosted foundation: next operator step

## Current result — foundation applied with specific approval

The operator completed CLI login. Codex linked the exact app-configured project,
verified its empty remote history and reviewed the two-file dry run. The user
explicitly selected **Approve the two foundation migrations**. Only those two
unchanged files were applied; their SHA-256 hashes and directory contents were
checked before execution. Read-only verification now confirms both versions,
exactly two public tables, five owner policies, provisioning, invoker preference
RPC and denied client role/owner mutation privileges. No new private/care proposal
was applied. Do not rerun the apply step as fresh work.

The user separately approved **only** adding
`http://localhost:3000/auth/callback` to the four existing hosted redirects.
A minimal temporary config declared only that field; its preview, manifest hash
and unchanged remote list were checked before applying. A post-change comparison
has zero remaining declared differences. Other hosted settings and existing
redirects were preserved. Preexisting wildcard entries need final release review.
Signup subsequently returned 200, as reported by the user. Confirmation/session/
two-account acceptance remains a distinct step, not inferred from that response.
The operator then observed `otp_expired` at the existing Vercel fallback and no
usable new confirmation. Aggregate checks show one unconfirmed account, fully
provisioned profile/preferences, and no provider accounts. Recent hosted Auth log
categories confirm email throttling. No Auth/SMTP expiry/rate-limit setting or
confirmation requirement was weakened. Do not repeatedly resend or deploy the
local app to try to clear the mail provider's throttle.

The instructions below document the reviewed procedure. They are not standing
approval for another migration, reset, config push or deployment.

18 November 2026. User-supplied SQL results from the queried project:
`profiles_exists=false`, `preferences_exists=false`,
`migration_history_exists=false`, `public_tables=[]`, `auth_user_triggers=[]`.
This is metadata evidence, not proof of authenticated sessions. Confirm the
dashboard/CLI project matches `NEXT_PUBLIC_SUPABASE_URL` privately before changes.

The current migration directory still contains only the two unchanged baseline
files. Their fresh/legacy/rollback tests pass. New private/care SQL remains under
`supabase/proposals` and must not be applied as part of this foundation step.

## Prepare the CLI without applying migrations

Use a **PowerShell terminal**, not the Supabase SQL editor. Supabase CLI 3.2.0 was
downloaded into npm's temporary cache and its version/help verified. It is not a
new app dependency. Login is an operator action; credentials stay private.

```powershell
cd D:\prohor-omor-day3
npx.cmd supabase@3.2.0 login
```

After completing login privately, link the intended synthetic staging/demo project
using its project ref. The ref is the project part of its Supabase URL; do not use
an API key as the ref. Replace `YOUR_PROJECT_REF` before running:

```powershell
npx.cmd supabase@3.2.0 link YOUR_PROJECT_REF
npx.cmd supabase@3.2.0 migration list --remote
npx.cmd supabase@3.2.0 db push --remote --dry-run --skip-vault
```

These exact CLI flags were verified with 3.2.0 help. The last command previews
migrations; it does not apply them. Expected pending versions, in order:

1. `20261116000000_day2_database_foundation.sql`
2. `20261117000000_adapt_atomic_preferences.sql`

Share only pending version names and success/error status. Do not paste tokens,
passwords, connection strings, API keys or full debug output. Avoid `--debug`.
Do not use a different project, `db reset`, history repair, `--include-all`, a
config push, or the archived illustrative `001_initial.sql` to bypass a mismatch.

CLI project caches are now ignored by Git. Linking may create local metadata;
inspect status and preserve any config edits. The repository's local Supabase
Auth site settings are not approval to push that entire config to hosted Auth.

## Concrete apply scope for Omor review

Only after the target and the two-file dry run are reviewed, the intended command
for the human operator is:

```powershell
npx.cmd supabase@3.2.0 db push --remote --skip-vault
```

**Executed only after the specific user approval recorded above.** For future
applications, review the target and pending SQL; do not auto-confirm a new scope
with `--yes` or `SUPABASE_YES`. This modifies
the hosted database and records successful migration versions. The assignment
explicitly forbids automatic migration application; owner review remains the
final step. Empty public tables do not authorize a database reset or clinical/care
proposal promotion. If this is a production project, use a separately approved
staging/deployment plan first.

Do not paste a file path into the SQL editor. For read-only SQL inspection, open
the `.sql` file, copy its **contents**, and paste those SQL statements. The CLI
route is preferred for application because it maintains migration history.

## Verify after an approved operator application

Run `migration list --remote` again and confirm both versions are recorded. Then
run `npm.cmd run check:auth-config`: foundation zero-row probes should resolve.
Use `supabase/inspection/auth_foundation_readonly.sql` to inspect grants/RLS,
provisioning, atomic preference RPC and Auth column shape. A zero-row anonymous
probe is not proof of authenticated RLS.

Configure the exact local/staging Site URL and allowed `/auth/callback` redirects
in hosted Auth. Then verify synthetic signup/confirmation, sign-in, refresh,
sign-out, own profile/preferences, two-account isolation and trusted provider
denial. Existing local-live runners remain restricted to port 54321; hosted
acceptance is separate. Account creation and provider administration must use
controlled synthetic identities and actual authorized state, never fabricated data.

The linked target is labelled production by the CLI. The approved two-migration
application and exact callback addition are recorded above; no history repair,
reset, clinical/care migration, app deployment or full session acceptance is
claimed. The application/handoff branch remains `omor-day3-backend` at `a6eb847`
plus uncommitted working changes.

Verified reference: [Supabase migration CLI](https://supabase.com/docs/reference/cli/supabase-db-push)
and [migration deployment/history](https://supabase.com/docs/guides/deployment/database-migrations).
For the current email failure, [Supabase's OTP error guidance](https://supabase.com/kb/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0)
describes invalid/expired/consumed links and possible email prefetching; the exact
cause of this initial link expiry is not proven. Hosted logs directly establish
the subsequent email throttle, not its reset time.
