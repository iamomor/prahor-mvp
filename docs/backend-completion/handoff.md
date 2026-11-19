# Backend completion handoff — 20 Nov 2026

Branch `omor-backend-completion`, based on `main` @ `57e9632`. Hosted Supabase `prahor-mvp` (`xwpdchegbizuswhtqtgc`). Vercel project `prahor` deploys `main` automatically.

Details: [requirements-matrix.md](requirements-matrix.md) · [verification.md](verification.md)

## Already complete before this work (verified, not rebuilt)

Auth and one-role onboarding, RLS on every private table, Jibonrekha records API (`jr_save`), Bujhi reviewed haemoglobin commit, Shusthota check-in and diary, the Bondhon care backend (consent-scoped requests, assigned simulated provider, acknowledge/respond/revoke, audit), Barta with citations and danger-sign abstention, and the Poth DGHS-registry search.

## Changed in this work

| Area | Change | Files |
|---|---|---|
| Shusthota | Applied missing migration `20261119184243_shusthota_p1_wellness_records` (hydration, habits, activity preferences) | hosted DB only (file already in repo) |
| Adapt | Preferences failed on Vercel: compression weakens ETag to `W/"…"`; client and server now accept it | `src/features/adapt/api/client.ts`, `src/features/adapt/server/handlers.ts` |
| Platform | ETag/retry-key conflicts raised `40001`, which PostgREST retries until timeout. Now `PT409` → HTTP 409 | `supabase/migrations/20261120000000_conflicts_without_serialization_retry.sql`, `src/features/adapt/server/preferences.ts`, `src/app/api/jibonrekha/route.ts`, `src/app/api/reports/commit/route.ts` |
| Tests | Weak-ETag + PT409 contract tests; hosted acceptance suite | `tests/contracts/preferences.spec.ts`, `scripts/accept-hosted.mjs` |

**API contract changes:** none to request/response shapes. A conflict now returns 409 quickly instead of hanging. `If-Match` also accepts the weak `W/"…"` form.

## Migration status

| Migration | Hosted | Notes |
|---|---|---|
| 18 earlier files | applied | recorded versions of `require_request_permission` and `shusthota_p1_wellness_records` aligned to filenames |
| `20261120000000_conflicts_without_serialization_retry` | **applied 20 Nov** | Only the errcode literals change; owner, security mode and grants verified unchanged. Rollback: rerun the same `DO` block with `'PT409'` → `'40001'` |

The database change is already live, and the current production app is compatible with it: conflicts give a fast 503 instead of a hang. The app half of the fix reaches users when the branch is merged.

## Working / Limited / Simulated / Future

| Module | Working | Limited | Simulated | Future |
|---|---|---|---|---|
| Adapt | Account preferences save/reload with conflict detection (**after merge**) | AAC/audio not re-tested here | — | External assistive-device testing |
| Barta | Bangla/English answers with DGHS/WHO citations; danger signs → urgent care | In-memory rate limit; content not clinician-reviewed | — | Voice input, saved history |
| Shonket | Public help without AI; structured request through the Bondhon backend | Clinician-reviewed warning content pending | — | Clinical auto-flags |
| Jibonrekha | Pregnancy, baby, measurements, conditions, notes, visits, corrections; ownership enforced | Supported measurement kinds only | Synthetic data | Newborn growth/immunisation |
| Bujhi | Image → on-device OCR → review → confirm → account save, retry-safe | Haemoglobin g/dL only; OCR engine from jsdelivr CDN; low-confidence digits must be typed | — | More report types |
| Shusthota | Check-in, private diary, hydration, habits, activity preferences | — | Synthetic data | Trend summaries |
| Poth | DGHS registry + labelled community search, nearby, visit preparation | Accessibility "not verified"; no booking | — | Booking, referral, SMS |
| Bondhon | Consent-scoped request, assigned provider queue, acknowledge/respond, revoke, audit | Minimal audit view | **Provider is simulated**; no SMS/email is sent | Community, cohort AI |

## Demo setup

1. Use `https://prahor-eight.vercel.app` after the merge below (or `npm ci && npm run build && npm start` with `.env.local`).
2. Accounts: mother `test.mother@prohor.demo`, simulated provider `test.provider@prohor.demo` (passwords held by Omor). QA extras: `qa.mother.b@prohor.demo`, `qa.provider.q@prohor.demo` (passwords in Omor's local scratch file, not in Git).
3. Re-run acceptance at any time:
   ```
   ACCEPT_MOTHER_A="email:pass" ACCEPT_MOTHER_B="email:pass" \
   ACCEPT_PROVIDER_P="email:pass" ACCEPT_PROVIDER_Q="email:pass" \
   node scripts/accept-hosted.mjs https://prahor-eight.vercel.app
   ```
   It writes clearly labelled synthetic rows (`qa-<timestamp>`) to mother A and creates and revokes one care request.

## Actions only Omor can take

1. **Merge `omor-backend-completion` into `main`** (PR: https://github.com/iamomor/prahor-mvp/pull/new/omor-backend-completion). The automated push to `main` was blocked by this session's safety policy. Vercel deploys automatically on merge. Afterwards run the acceptance script against production and expect 74/74.
2. Optional, in the Supabase dashboard: turn on email confirmation and leaked-password protection. Both are off now; leaving them off is fine for the demo.
3. Clinician review of the Shonket warning content. This is a content dependency, not code.
