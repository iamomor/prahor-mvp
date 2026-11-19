# Backend verification — 20 Nov 2026

All runs used synthetic accounts against the **hosted** Supabase project `prahor-mvp` (`xwpdchegbizuswhtqtgc`).

| Label | Meaning |
|---|---|
| **Live-prod** | `https://prahor-eight.vercel.app` (deployed `main` @ `57e9632`, before this branch) |
| **Live-local** | `next build && next start` of branch `omor-backend-completion` on this machine, talking to hosted Supabase |
| **Local-only** | Repository test suites (mocked or embedded Postgres); no hosted services |

## Accounts used (passwords not recorded here)

| Role in tests | Account | Notes |
|---|---|---|
| Mother A | `test.mother@prohor.demo` | existing synthetic account |
| Mother B | `qa.mother.b@prohor.demo` | created 20 Nov via normal sign-up + `prohor_complete_onboarding` |
| Provider P (assigned) | `test.provider@prohor.demo` | existing simulated provider |
| Provider Q (unassigned) | `qa.provider.q@prohor.demo` | signed up as doctor (pending), then approved as simulated provider by updating `provider_applications`/`account_role_memberships` (the admin step) |

Self-promotion was checked during setup (E-0): `prohor_switch_workspace('provider')` → `42501` for mother B and for pending provider Q.

## 1. Hosted acceptance — `node scripts/accept-hosted.mjs <url>`

Final **Live-local** run of the branch: **74 / 74 passed** (the Poth check was later changed to the `view=discovery` path the UI uses: 1,395 results for "hospital" in both local and prod).

| Step | Checks (all PASS on Live-local) |
|---|---|
| 1 Public | `/`, `/safety`, `/poth`, `/find-care`, `/ask`, `/accessibility` 200 without sign-in; anonymous `/api/jibonrekha` 401 |
| 2 Identity + Adapt | `/api/me` roles; preferences load with ETag; save; **stale If-Match → 409**; **weak `W/"…"` If-Match → 200**; value reloads |
| 3 Jibonrekha | pregnancy 201; same Idempotency-Key → same id; linked baby; maternal weight; baby fetal heart rate; wrong unit 400; maternal-only kind on baby 400; extra `ownerUserId` field 400 |
| 4 Jibonrekha | condition, symptom note, visit, correction 201; B → A's pregnancy/baby/observation **403**; B's read excludes A; A reads all 7 record types; provider → `/api/jibonrekha` 403 |
| 5 Shusthota | check-in, diary 201; B cannot see A's diary; provider `/api/diary` 403; hydration retry returns same id; habit create/archive; B → A's habit 404; activity preferences 201; `["none","walking"]` 400 |
| 6 Barta | Bangla grounded answer with citations; "বাচ্চা নড়ছে না", "খুব বেশি রক্তপাত হচ্ছে", "জ্বর আর খিঁচুনি হচ্ছে" → abstained + urgent-care text; diary marker not echoed |
| 7 Bujhi API | reviewed haemoglobin saved; identical retry → same `observationId`; `mg/dL` 400; `confirmSave:false` 400; B → A's pregnancy 403 |
| 8 Fresh session | new sign-in sees the reviewed observation exactly once |
| 9 Poth | public search returns DGHS registry results |
| 11 Care request | shareable records exclude diary; recipients list; request 201 `delivered` with UUID; duplicate key → same request |
| 12 Provider | P sees it; **Q does not**; Q detail 404; Q acknowledge 404; mother B detail 404; P detail shows 1 consented record, no diary; acknowledge; **stale revision 409**; respond; mother sees `responded` |
| 13 Revoke / sign-out | revoke 200; P detail 404; P coordination 404; request gone from P queue; `POST /auth/sign-out` then `/api/jibonrekha` 401 |

**Live-prod** run (old app code): 71 / 74. The three failures are all preference saves, which return 400 because of the weak-ETag bug fixed in this branch (see §3). Everything else matched Live-local.

## 2. Bujhi in a real browser (Live-prod)

`/app/bujhi` as mother A with `tests/fixtures/bujhi/synth-lab-v1-supported.png`:
consent to download Tesseract → OCR in the browser (assets from `cdn.jsdelivr.net`) → review shows "Beta hCG … unsupported for account saving" → haemoglobin digits flagged "unclear" (the user types the printed value) → **Save is blocked until the comparison checkbox is ticked** → "Saved to your account". 0 page errors.

## 3. Defects found and fixed

| # | Defect | Evidence before | Fix | Evidence after |
|---|---|---|---|---|
| D1 | Vercel compression turns the preferences ETag into `W/"…"`. The client rejected every account load; the server returned 400 on every save | Live-prod: browser sees `W/"2026-…"` with `br` encoding; PATCH 400 | `src/features/adapt/api/client.ts`, `src/features/adapt/server/handlers.ts` strip `W/` | contract tests (weak ETag client + server); Live-local weak If-Match 200 |
| D2 | `patch_access_preferences`, `jr_save`, `bujhi_commit_reviewed_hemoglobin` raised SQLSTATE `40001`; PostgREST retries that until timeout | direct RPC with stale version: 125 s "upstream request timeout"; Live-prod reused Idempotency-Key: ECONNRESET after 38 s | migration `20261120000000_conflicts_without_serialization_retry` (→ `PT409`), routes map `PT409` to 409 | direct RPC: `PT409` in 0.56 s; Live-local reused key: **409 in 0.58 s**; Live-prod (new DB, old app): 503 in 1.4 s until merge |

## 4. Repository checks (Local-only, branch head)

| Command | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | 0 errors, 3 pre-existing unused-import warnings (`ShusthotaHistory.tsx`) |
| `npm run test:contracts` | 235 passed |
| `npm run build` | pass |
| `test:rls:guards` 5/5 · `test:pwa:privacy` 6/6 · `test:db` 3/3 · `test:db:onboarding` 1/1 (replays all 19 migrations incl. the new one) · `test:db:private-proposal` 18/18 · `test:db:care-proposal` 30/30 · `test:auth-config` 10/10 · `test:env` 1/1 · `check:contrast` pass · `tests/unit/poth-directory.test.mjs` 13/13 | pass |
| `test:rls`, `test:auth:live` | **Not run**: local-Supabase-only by design; not pointed at hosted |
| `test:e2e` (Playwright UI suites) | **Not run** as a suite; replaced by the hosted acceptance + Bujhi browser run above |

## 5. Database

- Migrations: 19 in repo = 19 applied (`20261119184243` applied 20 Nov; `20261120000000` applied 20 Nov). Two older recorded versions were re-aligned to their filenames.
- Security advisor: no new findings. The existing "SECURITY DEFINER callable" warnings are the intended RPC gateway, and `prohor_care` tables are RLS-forced with no policies (RPC-only access).
- Performance advisor: INFO only (31 unindexed FKs, 5 unused indexes). Not acted on; irrelevant at demo scale.
- Auth: email confirmation is **off** (sign-up returns a session); leaked-password protection is off. Both are dashboard settings.

## 6. Not verified

- Screen reader, keyboard-only and 320px manual checks (no assistive-technology testing was performed).
- Guest → account preference reconciliation UI, AAC and audio paths.
- Poth nearby (`/api/poth/nearby`) and visit preparation UI.
- Supporter (family) invite/accept RPCs.
- The deployed site with this branch's code: **pending merge to `main`**.
