# Barta setup and integration review

Reviewed 17 November 2026. Requested implementation: **Iftee's Barta**.

## Decision

Ready for local exploration as a limited educational prototype. **Hold release to main:** the combined develop snapshot has a failing required contract check, Barta browser tests need repair, and the access/help and clinical review boundaries need completion or explicit prototype restrictions.

This is an architecture, source and targeted regression review of `src/`, `src/lib/supabase/`, active SQL migrations and Barta. It is not an exhaustive visual audit of every retained marketing component, clinical validation, a manual screen-reader assessment or verification of the hosted database. Source URLs and medical statements were not independently revalidated in this review.

## Branches actually reviewed

| Checkout/reference | Commit | Meaning |
| --- | --- | --- |
| Original `omor` checkout | `64bc196` | Platform/auth/Adapt foundation; Barta remains an unmounted stub |
| Locally stored `origin/iftee` | `ba21ec4` | Barta education UI, curated retrieval, conversation and optional audio |
| Locally stored `origin/develop` | `985bcdd` | Already includes both `64bc196` and Iftee's work through PR #9 |

These are locally available Git references; no network fetch was performed. Refresh references before making release decisions. Local `develop` itself is older than the stored `origin/develop`.

Prepared review worktrees:

- `D:\prohor-review-iftee`, branch `omor-review-barta-iftee`, tracking `origin/iftee`.
- `D:\prohor-review-develop`, branch `omor-review-barta-develop`, tracking `origin/develop`.

The original checkout remains on `omor`. No commits, pushes, remote database changes or application source fixes were made. Next.js regenerated its generated type-reference file during checks. The develop review worktree uses a directory junction to the original checkout's installed `node_modules`; Iftee's worktree has its own `npm ci` installation.

## Prioritized findings

### P1: Combined develop fails the required API registry check

`src/app/api/ai/barta-audio/route.ts` adds `POST /api/ai/barta-audio`, but `src/lib/contracts/current-api.ts` does not register it. Reproduced on `985bcdd`: **156 contract tests passed, 1 failed**, at `tests/contracts/api-registry.spec.ts:24`. The repository CI runs this suite, so this blocks a green release.

Also update the chat contract: the current registry and canonical architecture document still describe a question-only unavailable stub, while the implemented education route accepts language, retention and previous chunk context and returns additional variants. Passing tests that merely validate the stale catalog do not prove handler/catalog agreement. Coordinate these changes between Omor and Iftee; retain the strict rejection of unknown/private fields.

### P1: Barta's access entry ends at a placeholder; help is not independently reachable

`src/app/(marketing)/ask/page.tsx:18` links to `/accessibility`, whose page currently renders only `page`. `/ask` does not mount the shared preference panel or initialize saved presentation preferences. It also has no always-available reviewed safety/help entry; safety messages appear only after submitting chat input. This conflicts with the repository's persistent adjustment entry and help-without-AI requirements.

Provide a working adjustment control that preserves the current draft/transcript, and a reviewed help route reachable without submitting a question. The primary job is public educational information; private account setup should not be required to try this journey.

### P1 for clinical release: project reference checks are not clinical approval

`education-corpus.ts` and `approved-corpus.ts` activate project-selected references with `reviewedByUserId: null`. `approved-knowledge.ts` deliberately supports a separate `project_reference_check` path. The preview documentation acknowledges that clinical review is unassigned. The UI nevertheless calls these sources reviewed, without displaying the review basis.

Keep this explicitly a limited educational prototype until the designated review process is completed. Distinguish source attribution checks from clinical approval in the UI and records. Fixed safety rules and passing synthetic tests do not establish clinical safety or comprehensive symptom coverage.

### P2: Four Barta browser tests fail; distinguish test defects from product defects

On Iftee's exact snapshot, Edge returned **9 passed / 4 failed**:

1. English speech test: a plain object is supplied as a native `SpeechSynthesisVoice`.
2. Bengali speech test: the same incomplete voice mock pattern is used.
3. Retry test: global `getByRole('alert')` matches both the Barta error and Next's route announcer.
4. Language test: expects `lang="bn"` directly on the message paragraph, although the enclosing answer container sets it and the paragraph inherits it.

The speech mock problem was reproduced separately: the browser throws `Failed to set the 'voice' property on 'SpeechSynthesisUtterance': Failed to convert value to 'SpeechSynthesisVoice'.` Mock `SpeechSynthesisUtterance` consistently with the synthetic voices, or use an appropriate real voice fixture. This is not evidence that real browser speech playback fails. Scope error assertions to the Barta region and test effective language inheritance. Then rerun all four tests and separately check real Bengali/English speech.

### P2: Supabase integration remains unverified here

The current `.env.local` points at a hosted Supabase project and lacks `NEXT_PUBLIC_SITE_URL`. Auth mutations require a valid canonical site origin, so this local configuration is incomplete. An `AI_API_KEY` variable exists but neither current Barta implementation nor Iftee's optional Gemini selector consumes that name.

Docker, standalone Supabase CLI and psql were not available on PATH. Embedded PostgreSQL checks pass, but real Auth signup/confirmation, cookie refresh, PostgREST and two-account RLS sessions were not exercised. Do not infer hosted deployment state from migrations in Git.

### P2: Existing typography differs from repository requirements

The homepage imports five font families with `next/font/google` in `src/app/(marketing)/page.tsx:4-21`, while global CSS also imports Google Fonts. This differs from the stated restrained family count and prohibition on shipping font files. Barta's privacy/help/source copy includes sizes below 1rem. Reconcile the typography policy and implementation before claiming the design definition of done.

### Follow-up hardening before exposing paid services

The chat route calls `request.json()` without a streaming byte bound; audio reads the entire text body before checking length. Chat has no application rate limit, and audio's counter is process-local and shared by all callers. Before public paid Gemini/Azure use, add bounded reads and deployment-appropriate abuse controls with useful retry responses. Public educational access can remain available without forcing account creation.

## What is implemented

| Area | Status |
| --- | --- |
| Public Barta `/ask` on Iftee/develop | Working limited prototype |
| Bundled bilingual passages and source metadata | Working; review limitations above |
| Exact aliases, BM25/trigram shortlist and known follow-ups | Working limited retrieval; no vector database required |
| Ephemeral tab conversation, clear, draft retention on errors | Implemented; selected paths tested |
| Gemini passage selection | Optional development-only preview; not tested live |
| Browser voice and dictation | Optional, browser-dependent; mocks need repair; real audio not verified |
| Azure/eSpeak audio | Optional; not configured or verified here |
| Persisted Barta conversations | Unavailable; saved retention is rejected |
| Supabase profile/auth/Adapt APIs | Implemented platform code; live stack unverified here |
| Clinical records, provider delivery and broad module backends | Future/stub capabilities |

`src/lib/supabase/` holds connection/session helpers; `supabase/` holds database configuration, migrations and SQL tests. They serve different purposes. Active migrations create only `profiles` and `access_preferences`. The wider `supabase/reference/001_initial.sql` is archived illustrative SQL and must not be applied as the Barta setup.

The inspected platform uses Auth `getUser()`, server-side own-profile/role checks, HttpOnly cookies, same-origin mutation checks, RLS owner policies, restricted column grants and an invoker preference RPC. Tests exercise these boundaries. No additional access bypass was reproduced in this review; that does not establish production conformance.

## Try Barta now

An isolated preview was started at `http://127.0.0.1:3011/ask` from Iftee's worktree, with Supabase variables blank. The existing server in `D:\prohor` on port 3000 was left running. If the review server has stopped, restart it in a new PowerShell terminal:

```powershell
Set-Location D:\prohor-review-iftee
$env:NEXT_PUBLIC_SITE_URL = 'http://127.0.0.1:3011'
$env:NEXT_PUBLIC_SUPABASE_URL = ''
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ''
npm.cmd run dev -- --hostname 127.0.0.1 --port 3011
```

No `.env.local`, Supabase account, Gemini key or corpus ingestion step is needed for the basic text education flow. Use `/ask`, not the optional `/barta-demo`. The latter's synthetic demo path requires `PROHOR_BARTA_DEMO=1` in development.

Try these synthetic cases:

1. Choose English; ask `What does ANC mean?`; expand citation details.
2. Ask `What happens there?`; check cited follow-up continuity.
3. Switch to Bangla with a draft present; confirm the draft and older answers remain.
4. Ask `Breastfeeding`; use keyboard Enter on a suggested clarification.
5. Ask an unsupported question; verify abstention rather than invented citations.
6. Submit a synthetic warning-sign case from the existing safety tests; verify fixed text rather than a generated educational answer. This is a software check, not validation of clinical guidance.
7. Simulate request failure; verify the draft remains editable. Clear the conversation and check focus returns to the composer.
8. Check 320px, zoom/text enlargement, keyboard focus and a screen reader; repeat with themes/high contrast after the adjustment entry is connected.

Optional Gemini preview uses `PROHOR_BARTA_AI_PREVIEW=1` and server-only `GEMINI_API_KEY`. It only selects among allowed passage IDs and is disabled outside development. Optional generated speech uses either `BARTA_AZURE_SPEECH_KEY` plus `BARTA_AZURE_SPEECH_REGION`, or `BARTA_ESPEAK_PATH` plus `BARTA_AUDIO_SIGNING_KEY` (at least 32 characters). Configure these only after basic text tests pass, with synthetic inputs. Do not put these secrets in `NEXT_PUBLIC_*` variables.

## Repeatable checks

On a clean, current develop review checkout, install the committed lockfile first:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:contracts
npm.cmd run test:db
npm.cmd run test:rls:guards
npm.cmd run check:contrast
```

With a review server already running, use a second terminal:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
$env:PROHOR_TEST_URL = 'http://127.0.0.1:3011'
npm.cmd run test:e2e -- barta --workers=1
```

Use the matching checkout and port. Full regression (`npm.cmd run test:e2e`) and production build (`npm.cmd run build`) are required after integration fixes; this review did not run the full develop browser suite or its production build. Avoid concurrent build/dev operations in the same checkout.

## Supabase setup is a separate verification step

For full auth/preferences testing, install/start Docker Desktop and use the repository's local Supabase configuration. From the develop review checkout:

```powershell
npx.cmd supabase start
npx.cmd supabase migration list --local
# After inspecting the pending migrations:
npx.cmd supabase migration up --local
```

Set these in that checkout's ignored `.env.local`, using the public key printed for the local stack:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable or anon key>
```

Use a consistent app origin/port and matching Auth callback allowlist. Keep the original hosted `.env.local` intact; do not copy it into the isolated text review. Do not run `db push`, apply archived SQL, or reset populated databases for this review.

Follow `supabase/RLS_TESTING.md` for the two confirmed synthetic fixtures and required environment variables, then run `npm.cmd run test:rls` and `npm.cmd run test:auth:live`. The provider fixture needs trusted local assignment; a mother account must not self-promote. Stop the dev server for that same checkout before the auth runner launches its own server. The offline `npm.cmd run test:auth` also starts its own server.

## Results from this review

| Check | Actual result |
| --- | --- |
| `omor`: typecheck, lint, production build | PASS |
| `omor`: contract tests | 103 passed |
| `omor`: embedded DB migration/RLS/preferences regressions | PASS; disposable PostgreSQL only |
| `omor`: RLS runner guard tests | 5 passed; no actual session testing |
| `omor`: selected token contrast pairs | PASS; not a whole-screen contrast audit |
| `omor`: offline auth browser suite | BLOCKED by an existing Next dev server lock; existing server left untouched |
| `iftee`: npm ci, typecheck, lint | PASS |
| `iftee`: Barta contract tests | 54 passed |
| `iftee`: targeted browser/HTTP suite in Edge | 9 passed, 4 failed as described above |
| `iftee`: targeted keyboard composer submission | PASS |
| `iftee`: answered page at 320px | document width 320px; no horizontal overflow in this state |
| `iftee`: axe on that answered 320px English state | No violations returned for selected WCAG tags; one state only |
| combined `develop`: typecheck/lint | PASS |
| combined `develop`: contract suite | 156 passed, 1 failed: missing audio registry entry |
| Live Gemini/Azure/eSpeak, real mic/voice, manual screen reader, live Supabase | NOT RUN |

Screenshot: `D:\prohor-review-iftee\test-results\barta-review-320.png`. Failed browser screenshots and error contexts are in that worktree's `test-results/` folder.

## Merge/release process

1. Refresh Git references with `git fetch origin`. Preserve local edits; use review worktrees rather than switching a dirty working directory.
2. Since the inspected develop already includes Iftee, create a named member fix branch based on refreshed `origin/develop`; do not replace develop with Iftee's older platform snapshot.
3. Resolve the registry/chat contract mismatch, repair tests, and address or explicitly restrict the access/help/clinical prototype gaps. Keep auth, migrations and RLS from the platform work.
4. Run the checks above, full browser regression, local Auth/RLS integration where applicable, and a production build. Test the combined result, not just the teammate branch.
5. Open a PR into protected `develop` with screenshots, actual test results and working/limited/prototype/future labels. Merge after review and green checks.
6. Open the release PR **`develop` -> `main`**. Merge only the verified release. Never directly push the teammate branch into protected main. Git release and database migration deployment are separate operations.

No release PR, remote push or deployment was performed by this review.
