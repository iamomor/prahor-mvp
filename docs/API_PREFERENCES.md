# Day 2 Step 13 — persistent account preferences

Implemented 17 November 2026. API and SQL behavior are tested locally; actual
Supabase session integration requires the local services and synthetic accounts.
No production migration, deployment, push, merge or database reset was performed.

See the [subsequent code review](qa/DAY2_CODE_REVIEW.md) for the latest regressions
and verification limits. Client errors now consistently use `PreferencesApiError`:
status 0 for transport failure and 500 for malformed/unconfirmed responses. A PATCH
snapshot must include a persisted timestamp and match the supplied changes.

## Structure and ownership

```text
src/app/api/preferences/route.ts             # thin GET/PATCH entry point
src/features/adapt/server/handlers.ts        # auth, validation, HTTP/error mapping
src/features/adapt/server/preferences.ts     # RLS queries and atomic database RPC
src/features/adapt/api/client.ts             # typed, explicit client integration
src/lib/contracts/adapt.ts                  # existing shared Adapt contract
supabase/migrations/20261117000000_adapt_atomic_preferences.sql
supabase/tests/preferences.sql
tests/contracts/preferences.spec.ts
```

No frontend screen, homepage, design token or teammate component was changed.
Apurbo can import the client adapter directly. Account sync is explicit; it does
not silently overwrite anonymous/local settings or remount forms.

## Approved account contract

The existing account schema and database CHECK agree on these ten fields:

| Field | Allowed values / default |
| --- | --- |
| `language` | `bn` (default), `en` |
| `textScale` | `default` (default), `large`, `extra-large` |
| `spaciousLayout` | boolean, false |
| `theme` | `quiet-garden` (default), `original-rose`, `morning-mist` |
| `highContrast` | boolean, false; independent of theme |
| `reducedMotion` | boolean, false |
| `simplifiedContent` | boolean, false; reviewed content only |
| `communication` | `text` (default), `aac` |
| `textSpacing` | `default` (default), `increased` |
| `readAloud` | boolean, false; does not autoplay |

The public homepage has a **separate local reading model** with `font`,
`density: comfortable/compact/spacious`, and `textSpacing: standard/relaxed`.
Its storage and controls are untouched. These are not silently added to the
account schema or discarded from local storage. Apurbo must explicitly reconcile
that model before a future versioned account-contract change: map standard/relaxed
spacing to default/increased only at the UI boundary; compact density and font
selection currently remain local-only. `reducedDistraction` has no existing account
field and is rejected rather than inventing a new mode. These are documented
integration limits, not claims of complete homepage preference synchronization.

## GET /api/preferences

Every request verifies the user with the existing SSR `getUser()` / own-profile
helper. The database query uses only the verified UUID under RLS and selects only
`settings, updated_at, schema_version`. Query-supplied user IDs are ignored.

A missing preference row returns all documented defaults, `updatedAt: null`, and
`ETag: "missing"`. GET never creates a row. Unknown/malformed stored settings or
unexpected schema versions produce an error; nothing is silently sanitized away.

## PATCH /api/preferences

The body is a **nonempty partial object** using only the fields above:

```json
{ "textScale": "large", "highContrast": true }
```

No wrapper or `userId`, `user_id`, role, timestamps, schema version or unknown
fields are accepted. Nulls, incorrect types and unsupported enum values return
400. The existing bounded JSON reader limits input to 8 KiB. The request must
have JSON content type and the configured application Origin. Auth is checked
before preference access; cross-site authenticated writes return 403.

Successful GET and PATCH return the **complete** validated settings:

```json
{
  "data": {
    "theme": "quiet-garden",
    "highContrast": true,
    "textScale": "large",
    "spaciousLayout": false,
    "reducedMotion": false,
    "simplifiedContent": false,
    "communication": "text",
    "language": "bn",
    "textSpacing": "default",
    "readAloud": false
  },
  "schemaVersion": 2,
  "updatedAt": "2026-11-17T00:00:00.123456+00:00",
  "requestId": "d2130000-0000-4000-8000-000000000001",
  "contractVersion": "1"
}
```

Responses set `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`,
and a quoted ETag derived from the exact saved timestamp (no millisecond rounding).
For example: `ETag: "2026-11-17T00:00:00.123456+00:00"`.

| Status | Error code | Meaning |
| --- | --- | --- |
| 200 | — | Loaded defaults/saved settings, or database-confirmed save |
| 400 | `invalid_request` | Invalid body, fields, values or conditional version |
| 401 | `unauthenticated` | Missing/invalid/expired or unconfirmed session |
| 403 | `forbidden` | Origin or database permission denial |
| 409 | `conflict` | Stale `If-Match`; reload and review before retry |
| 500 | `unavailable` | Configuration, Auth, schema, database or persistence failure |

Errors use `{error:{code,message},requestId}` and contain no SQL/provider details,
tokens or submitted values. Failed writes never return a success snapshot.

## Migration and concurrency

The forward migration adds **no tables or columns**. It:

- Grants INSERT only on `access_preferences(user_id, settings)`, with an own-user
  INSERT policy. Existing owner-only SELECT/UPDATE policies and column restrictions
  stay intact; users still cannot delete rows or edit ownership/timestamps.
- Adds `patch_access_preferences(p_patch, p_expected_updated_at, p_check_version)`.
  It has **SECURITY INVOKER**, an empty search path, qualified references and an
  authenticated-only execution grant. It derives `auth.uid()` internally and has
  no user UUID parameter or privileged/RLS-bypassing fallback.
- Creates a missing own row safely, locks that row, merges only the supplied
  fields into the current JSONB object, and returns exactly one persisted row.
  Any failure rolls back the entire function transaction, including row creation.
- Maintains a strictly advancing preference timestamp, even with clock skew, so
  optimistic-concurrency ETags remain useful. Profile timestamp behavior is unchanged.

Concurrent patches to different fields merge under a row lock. Unconditional
updates to the same field serialize with the last accepted patch winning. For
stale-form protection, send the latest response's ETag in `If-Match` (the supplied
client adapter always does). Missing-row conditional creation uses `"missing"`.
A stale version returns 409 without modifying or recreating the row. Wildcards,
weak/multiple ETags and malformed timestamps are not supported.

The older proposed `/api/access-preferences` GET/PUT contracts remain unimplemented;
do not add a second persistence implementation. Use this GET/PATCH route for Adapt.

## Apurbo integration

```ts
import { loadAccountPreferences, saveAccountPreferences }
  from "@/features/adapt/api/client";

const account = await loadAccountPreferences();
// If local/account values differ, ask which to use; preserve unsaved form state.
const confirmed = await saveAccountPreferences({ textScale: "large" }, account.etag);
// Only now announce an account save and apply confirmed.preferences as appropriate.
```

The adapter performs no automatic storage writes or appearance changes. Keep the
entire ten-field account snapshot in Adapt state; the older v1 local sanitizer
does not understand `textSpacing`/`readAloud`. Do not round-trip a full account
snapshot through it or upload default-filled local data as a blanket replacement.
Send only deliberate changed fields. On 409 reload and ask the user to resolve
the conflict; do not retry silently. A 401 leaves anonymous/local preferences usable.
Reload account settings after sign-in, clear account-specific cached snapshots on
sign-out, and keep all care drafts/focus intact while applying preferences.

Existing Apurbo-owned UI is **not wired automatically** in this step; this handoff
and adapter are the integration boundary permitted by the task. The API persists
settings across sessions; the current local-only controls do not become account
sync controls until that integration is made. Read-aloud, AAC and simpler content
remain preferences, not claims those full care features are connected.

## Apply and test locally

With Docker/local Supabase installed, first inspect migration history and then
apply only pending local migrations (no reset):

```powershell
npx.cmd supabase start
npx.cmd supabase migration list --local
npx.cmd supabase migration up --local
```

See [database setup/history precautions](../supabase/README.md) for archived `001`
environments and [Auth setup](AUTHENTICATION.md) for local public-key configuration.
No production command is authorized. Use a confirmed synthetic account only.

```powershell
npm.cmd run test:contracts
npm.cmd run test:db
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:auth -- --grep 'preferences route'
npm.cmd run build
```

The SQL runner applies the full active migration chain only to disposable embedded
PostgreSQL. To run the new SQL assertions against actual **local Supabase**:

```powershell
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -X -v ON_ERROR_STOP=1 -f supabase/tests/preferences.sql
```

That is a transactional database regression check, not real Auth-session evidence.
For real sessions, configure the existing four `PROHOR_RLS_*` variables and confirmed
synthetic Ayesha/Nusrat fixtures using [these commands](../supabase/RLS_TESTING.md),
apply the new local migration, stop any app on port 3000, then run:

```powershell
npm.cmd run test:auth:live
npm.cmd run test:rls
```

The new live test checks account settings after a page refresh and fresh sign-in,
concurrent disjoint patches, stale-version rejection, and Nusrat isolation. It
restores only the synthetic fields it changed. It checks API persistence, not a
newly wired Adapt UI or automatic account/local conflict resolution. Live sessions
remain NOT RUN if local infrastructure or fixture credentials are unavailable.

## Files for Step 13

Verification on 17 November 2026:

| Check | Result |
| --- | --- |
| `test:contracts` | PASS: 94 tests, including 27 new preference/API-adapter tests |
| `test:db` | PASS: fresh/legacy migrations, own missing-row creation, RLS isolation, partial merge, stale versions and clock-skew versions |
| Typecheck / lint | PASS |
| `build` | PASS: production build includes dynamic `/api/preferences` |
| `test:auth -- --grep 'preferences route'` | PASS: real local HTTP GET/PATCH fail safely with account storage disabled |
| `test:auth:live` | NOT RUN: missing local Supabase/session fixture configuration; preflight exits nonzero |

Injected contract tests and embedded SQL role simulations are distinct from real
authenticated sessions. Missing-row behavior and database failures were tested
without deleting or corrupting any live account data. No frontend design changed,
so a new UI accessibility or visual-conformance claim is not made.

Created: the route, two `features/adapt/server` modules, `features/adapt/api/client.ts`,
the forward migration, `supabase/tests/preferences.sql`,
`tests/contracts/preferences.spec.ts`, and this document.

Modified: `src/lib/contracts/adapt.ts`, `src/lib/contracts/api.ts`,
`src/lib/auth/validation.ts` (reuse origin checking for PATCH without changing POST),
`scripts/test-database-foundation.mjs`, `supabase/tests/database_foundation.sql`,
`tests/auth/offline.spec.ts`, `tests/auth/live.spec.ts`, and API documentation.
The API documentation updates are `docs/API_CONTRACTS.md`,
`docs/architecture/api-contracts.md`, and `supabase/README.md`.
# Day 3 integration note

The integration candidate keeps the strict ten-field account payload and existing
database schema. New UI requests include optional `X-Prohor-Account` with the
identity previously read from `/api/me`. A mismatch with the server-verified caller
returns 409 before reading or writing preferences. The header grants no authority.
Clients still send the exact latest ETag through If-Match, reload on conflict, and
require another explicit review before saving. Omor must review this addition
before promotion to `develop`.

Compact density, focused view, typeface and nullable system-following contrast are
device-only preferences. Applying account choices preserves them; saving never
adds these unsupported fields or silently changes the saved `readAloud` value.
Loading compares local/account choices without writing. An explicit review selects
which choices to apply/save. Turning off sync does not delete account settings.
