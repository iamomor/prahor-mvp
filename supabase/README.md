# Day 2 database foundation (Steps 8-9)

Step 10 adds [real authenticated-session RLS tests](RLS_TESTING.md). Run
`npm run test:rls` against the local stack with the dedicated synthetic fixtures.
The SQL tests below remain separate regression checks and do not replace it.

Step 13 adds [atomic persistent preferences](../docs/API_PREFERENCES.md) through
`20261117000000_adapt_atomic_preferences.sql`: owner-only missing-row INSERT,
an invoker/RLS RPC and monotonic preference timestamps. No new tables or columns.

Status: **implemented and tested in disposable embedded PostgreSQL**. Actual local
Supabase Auth/PostgREST integration and deployment remain **untested**. No remote
database was contacted and no production migration was executed. The Step 13
account preference API is implemented; its UI integration, provider approval UI,
and all clinical/module tables remain future work.

## Files and migration boundary

- `migrations/20261116000000_day2_database_foundation.sql` creates/upgrades **only**
  `profiles` and `access_preferences`, plus their functions, triggers, and policies.
- `reference/001_initial.sql` preserves the original illustrative SQL **byte for
  byte**. It creates 11 tables and is deliberately outside the active migrations
  directory. Do not apply it as part of Day 2. This relocation supersedes the old
  paths in the Day 1 checklist and Step 7 architecture notes.
- `config.toml` supplies local Supabase configuration; seeding is disabled.
- `tests/database_foundation.sql` exercises two fictional accounts in a transaction
  and rolls back all fixtures. It requires a privileged local database connection.
- `../scripts/test-database-foundation.mjs` runs the migration and that same SQL in
  disposable PGlite PostgreSQL databases without reading `.env` or remote URLs.

The explicit two-table request narrows the broader Step 7 proposal: the single
`profiles.role` is `mother` or `provider`; no separate `user_roles` table is added.
No existing UI, auth callback, Supabase client, or teammate feature is changed.

## Storage and authorization

Both tables use `user_id` as their UUID primary key and cascading foreign key to
`auth.users(id)`. The existing primary-key indexes serve ownership and FK lookups;
extra duplicate indexes are unnecessary. Both have server-maintained timestamps.
Display names are limited to 120 characters and default to empty, allowing onboarding
without a name.

Preferences retain the existing `settings jsonb` shape, rather than adding competing
column names. `schema_version = 2` and a strict CHECK enforce the shared contract:

| Setting | Allowed values / default |
| --- | --- |
| `language` | `bn` (default), `en` |
| `textScale` | `default` (default), `large`, `extra-large` |
| `spaciousLayout` | boolean, false |
| `highContrast` | boolean, false; independent of appearance |
| `reducedMotion` | boolean, false |
| `simplifiedContent` | boolean, false; reviewed simple language only |
| `communication` | `text` (default), `aac` |
| `theme` | `quiet-garden` (default), `original-rose`, `morning-mist` |
| `textSpacing` | `default` (default), `increased` |
| `readAloud` | boolean, false |

Every key is required; unknown keys, nulls, incorrect types and unsupported values
are rejected. Existing v1 objects gain missing defaults without losing values.
Invalid legacy data causes the entire migration to roll back for owner review.
Existing profile names and preference values are preserved; existing Auth accounts
are backfilled. Unknown schema drift must be investigated rather than overwritten.

An Auth insert trigger provisions both rows, always with role `mother`. It ignores
editable user metadata. The narrowly scoped SECURITY DEFINER function has an empty
search path, qualified references, a postgres owner, and no client execution grant.
Clients have SELECT plus column-level UPDATE only (`display_name` or `settings`).
Profiles have no client INSERT/DELETE rights. Step 13 permits owner-only preference
row INSERT; DELETE remains denied. Clients cannot edit identity, roles or timestamps.
RLS independently restricts reads and updates to `auth.uid()`, including providers.
An API update targeting another user normally affects zero rows; it need not throw.

Provider assignment is restricted to trusted database administration/server service
credentials after an independently reviewed approval. This migration does not
implement that approval workflow or grant any access to another user's data.
Service-role credentials bypass RLS and must remain server-only. A role label is
not verification of clinical credentials.

## Apply locally

Prerequisites: Node dependencies (`npm ci`), Docker, Supabase CLI, and `psql` for
the integration SQL. On Windows with restricted PowerShell scripts use `npm.cmd`.

From the repository root, for a **new/disposable local instance**:

```sh
npx supabase start
npx supabase db reset --local
```

`db reset --local` deletes/recreates local database data. Use it only for a
disposable local instance. For an existing local database that must keep its data,
first inspect schema/history and back it up, then use:

```sh
npx supabase migration list --local
npx supabase migration up --local
```

Check that only the intended migration is pending before applying it. Do not use
`db push`, `--linked`, or a production database URL under this task's authorization.
Review and explicit owner approval are required before production deployment.

### If historical `001_initial.sql` was already applied

Inventory the actual tables, grants, triggers and `supabase_migrations.schema_migrations`
first. The forward migration supports the original two table definitions and replaces
their policies/grants; it never drops or changes the other historical tables.
Existing provider memberships are not converted into provider roles automatically.

Because `001` is now archived, an environment tracking it may report a migration
history mismatch. Stop and have Omor reconcile that environment's migration history
after backup/review. Do not reset a populated environment, mark migrations applied
without checking the schema, or reapply the archived SQL. The new migration is
transactional and intended to execute once, tracked by Supabase migration history.

## Verify

Fast automated SQL verification (requires no Docker, Supabase project, or secrets):

```sh
npm run test:db
npm run typecheck
npm run lint
```

The test runs fresh installation, preservation/backfill of legacy rows and grants,
and atomic rollback on invalid legacy preferences. It asserts exactly two public
tables on fresh installation. It runs both fictional identities through owner
reads/updates, cross-user denial in both directions, anonymous/missing-subject
denial, metadata escalation, direct insert/delete denial, role/ownership/timestamp
tampering, constraints, server role assignment, timestamps and cascading deletion.

For the real **local Supabase** integration check after applying the migration:

```sh
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -X -v ON_ERROR_STOP=1 -f supabase/tests/database_foundation.sql
```

Expect successful completion ending with `ROLLBACK`; any SQL error fails the check.
The two `example.invalid` identities exist only inside that transaction. Embedded
verification models Supabase roles and `auth.uid()` but does not verify GoTrue
signup/email delivery, REST behavior, cookies, or the complete Supabase service stack.
Perform a separate local Auth signup/REST smoke check before integrating account sync.

Validation on 16 November 2026: `test:db`, TypeScript, and lint passed in this workspace.
No UI changed; browser, keyboard,
screen reader and axe testing are outside this database-only change.
