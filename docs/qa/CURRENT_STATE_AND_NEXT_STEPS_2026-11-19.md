# PROHOR: current code state and next steps

Reviewed 19 November 2026, Asia/Dhaka. Source: `D:/prohor-omor-day3`, branch
`omor-day3-backend`, HEAD `23206dd667ecf4ee3c8932a43b12a0c02b32dbb7`.

## Decision

PROHOR has a substantial implemented foundation and selected working public/demo
journeys. It is not yet an integrated eight-module MVP. The next phase is to
connect the existing backend and domain screens, repair reproduced auth UI
regressions, and prove the complete journey on one accepted preview.

Do not restart authentication, recreate the repository, repeat the original
integration merges, or treat the old audit's percentages as a current measurement.
There is no defensible new completion percentage from this review.

## Scope and evidence

- Inventoried 295 files under `src`, 11 forward SQL migrations, tests/scripts/CI,
  and 68 repository Markdown files before adding this report. Read the required
  PROHOR skill/design references and examined the relevant architecture, API,
  authentication, integration and QA documents against critical source paths.
- Reviewed the seven supplied Downloads references: 48-hour workflow V2,
  18 November project audit, starter `00_START_HERE`, starter
  `05_OMOR_CODEX_PROMPT`, team roles blueprint, new-chat context, and complete
  product/features blueprint. Their task prompts and historical commands were
  reference material, not authorization to execute deployments or migrations.
- This is a repository-wide integration review with targeted source inspection
  and execution, not a line-by-line certification of every file. No hosted
  dashboard, current remote branch state, teammate laptop, or deployment was
  inspected. No hosted account was created or private hosted record accessed.
- The three initial developer changes were preserved: `package.json`,
  `scripts/test-database-foundation.mjs`, and untracked
  `scripts/test-onboarding-single-role.mjs`. Results include those local edits.
- Local execution: Windows, Node 24.17.0, npm 11.13.0; headless Microsoft Edge.
  CI uses Node 22, which was not rerun locally.

### Important correction to older reports

The canonical API document, `docs/architecture/api-contracts.md`, lines 293 onward,
reports that the care/private forward chain through `20261118070000` was applied
and 23 targeted hosted checks passed across ten care HTTP operations. The latest
source also contains real care adapters and migrations. Older handoffs saying all
care SQL is unapplied or care POST still returns a fixed 501 are superseded.

That hosted result is **documented prior evidence**, not independently rerun in
this audit. Do not blindly reapply/reset the shared database. In particular,
confirm the separate `20261119000000_single_signup_role.sql` migration's actual
hosted status; the earlier activation record does not establish its application.

## Current capability map

| Area | Current status | Evidence and remaining boundary |
| --- | --- | --- |
| Auth/account roles | Working source; live acceptance needs current evidence | Server identity, cookies, protected routes, onboarding, pending provider approval and account UI exist. Browser auth UI has reproduced defects below. |
| Adapt | Working selected paths / limited | Local settings, ten-field account API, conflict handling, AAC and shared audio coordination exist. Selected integration tests pass; complete devices/preferences/SR coverage is not established. |
| Barta | Working limited education prototype | `/ask` calls the public education path with citations, fixed safety fallback and abstention. Bundled matching plus optional model selection is not an unrestricted clinical assistant. No transcript persistence or clinical validation claimed. |
| Shonket | Incomplete task | Safety responses/help exist in Barta and Poth, plus a marketing preview. No standalone implemented Shonket feature folder or dedicated safety/care route is present in this checkout. Unmerged teammate work cannot be assessed. |
| Jibonrekha | Working synthetic browser demo; account persistence incomplete | `/app/jibonrekha` is protected but renders `RecordsWorkspace`, which uses demo storage. `/api/health` returns 501 after authentication; no health POST exists. |
| Bujhi | Working limited local extraction/review; server commit incomplete | English Tesseract OCR, manual/voice entry and correction/rejection are implemented. `ReportReview.tsx:134` calls `saveDemoObservations`. Fresh-session account record/report persistence is absent. |
| Shusthota | Incomplete task | Contracts and SQL tables exist. No implemented feature UI or wellness/diary API routes are present. Marketing representations are not a functioning private diary. |
| Poth | Working limited public discovery | `/poth` offers geography filters, two named examples, nearby external data and visit preparation. `facilities.json` is empty, so the curated facilities API has no seeded catalog. Not a verified nationwide directory or booking service. |
| Bondhon | Implemented backend; connected frontend incomplete | Ten care routes/RPC adapters and detailed SQL tests exist. The existing form is incompatible with the new contract; provider page is a workspace placeholder rather than a queue. |

## Prioritized findings

### P0: no authenticated health save/read journey

`src/app/api/health/route.ts:12` explicitly returns 501 for a signed-in user.
`src/features/jibonrekha/demo-health.ts` writes unscoped fictional browser keys;
protecting a page with login does not convert them into account storage.
`src/features/bujhi/ReportReview.tsx:134` saves into the same demo model.

Implement the smallest account-backed pregnancy/baby/observation path, with
server-derived ownership, validation, provenance and revisioned corrections.
Require a fresh browser session to show the same saved record and a second
mother to be denied access. Keep current local screens clearly synthetic until
the integration is actually replaced. Do not migrate demo browser data silently.

### P0: care backend and frontend are disconnected

`src/features/bondhon/CareRequestStarter.tsx` sends only `{message,method}` and
expects `starterCareResponseSchema`. `src/lib/care/handlers.ts` requires an exact
Origin, UUID `Idempotency-Key`, verified mother identity, and the strict Bondhon
payload including recipient, purpose, consent IDs and review confirmation.
The old form cannot perform this request. `/provider` renders `Workspace`, not
the implemented provider list/detail/acknowledge/respond APIs.

Start now with an explicitly reviewed **message-only** request and
`consentGrantIds: []`. That path does not need health records first. Load real
approved recipients from `/api/care-recipients`, preserve one retry key for an
identical action, and show the returned request ID/status. Add exact record-field
sharing after real owned record IDs exist. Do not use local demo IDs for grants.

### P1: auth header fails mobile reflow and accessible naming

Direct fresh-context Edge measurements at a 320px viewport:

- English sign-in and initial sign-up each have document scroll width **444px**.
- Sign-in with extra-large text and spacious layout reaches **550px**.
- Overflow originates in the header/action group; the large-text header action
  group reaches beyond x=532. Inspect `AuthShell.tsx` and `auth.css:57` onward.
- Axe reports serious `label-content-name-mismatch` on the visible `EN` button
  whose accessible name is `English`.
- The access settings entry is an icon-only summary with an accessible label;
  restore a clear visible label consistent with the product requirement.
- Protected workspace use of `AuthShell` follows its non-entry branch, which has
  no access-preference trigger. Root preference runtime applies settings but
  does not itself provide an adjustment control on these private screens.

Focused existing tests at `tests/auth/offline.spec.ts:95`, `:114` and `:184`
reported failures. The first still searches visible text that the new icon-only
summary removed; this timeout is not evidence that submitting by keyboard is
impossible. A direct keyboard check successfully submitted synthetic inputs to
the unconfigured server, retained the email, announced the unavailable state,
and focused `#auth-status`.

Fix the real reflow/naming/discoverability issues, then update tests to use the
intended accessible controls without weakening their coverage. Test sign-up's
three steps, both languages, 200% text, 320px, contrast and keyboard navigation.

Evidence screenshots (ignored local artifacts):
`test-results/prohor-audit/sign-in-320.png`, `sign-up-320.png`, and
`sign-in-large-text-320.png`.

### P1: sign-out errors are ignored by the client

`Workspace.tsx:16-27` and `AccountWorkspace.tsx:184-192` navigate away in `finally`
even when the sign-out POST fails or throws. The server can return 503 before
clearing cookies. `Workspace` never sets its failure flag true. The query-string
notice does not explicitly assert successful sign-out, but the user receives no
useful warning that their session may remain active on a shared device.

Handle the confirmed response, show a persistent unconfirmed/error state and
retry when appropriate, and test protected-route access after a confirmed logout.
Navigation warnings alone are not the privacy defect; do not mechanically swap
navigation APIs without checking cookie/session behavior.

### P1: public capability claims exceed implementation/evidence

- `src/app/(marketing)/features/page.tsx:68` asserts clinician-reviewed Shonket
  checklists, while current review evidence remains pending.
- The same file at `:119` claims a strictly encrypted Shusthota diary, although
  there is no connected diary implementation here.
- `for-mothers/page.tsx:33` promises secure diary lock-screen controls.
- `features/page.tsx:136` and `how-it-works/page.tsx:68` imply verified facility
  accessibility/readiness beyond the actual limited catalog.

Replace these with accurate Working / Limited / Prototype / Future statements.
Do not turn marketing claims into acceptance evidence or imply clinical approval.

### P1: immutable report commit and format agreement are still missing

`src/lib/contracts/bujhi.ts:9-11` proposes a PDF up to 5 MiB; the actual upload/OCR
path supports images up to 10 MiB and uses an English worker. Agree one supported
synthetic image and field mapping. Persist source/extraction/review identities,
raw evidence, correction decisions and revision before an atomic account commit.
Require ownership, destination and stale-review checks and idempotent retries.
Client `reviewed` state plus a health insert is insufficient for the stated
immutable report acceptance requirement.

### P2: tests, documentation and retained components need reconciliation

- The existing uncommitted `test:db` edit applies only the first two migrations.
  That is a valid foundation test scope, not proof of the full chain's behavior.
  The new onboarding script applies all 11 migrations but asserts only rejection
  of two purposes and acceptance of one mother purpose. Extend meaningful
  account/provider/supporter authorization coverage against the final chain.
- CI runs lint, typecheck, contracts, build and token contrast. It does not run
  browser auth/axe, native SQL/config/privacy tests, onboarding or full E2E.
  Add appropriate fast checks; keep real-session tests tied to a real safe fixture
  environment rather than silently skipping them.
- README/START_HERE still describe early starter behavior. Several care handoffs
  still say SQL is unapplied. The API catalog itself contains historical text
  alongside newer activation evidence and conflicting owner notes.
- `AppChrome.tsx:16` points to nonexistent `/find-care` rather than `/poth`, but
  repository search finds no mounted import of AppChrome. Treat this as stale
  retained code, not a verified current user-facing broken navigation path.
- `PwaRegistrar` likewise has no mounted importer. Service-worker unit tests pass,
  but they do not establish that the current app registers it or is installable.
- Homepage imports five `next/font/google` families and generates font assets,
  conflicting with the repository's two-family/no-shipped-font-files policy.
  Development homepage compilation emitted repeated Google font download
  warnings. Resolve the intended font policy and low-bandwidth behavior.

## Verification performed in this review

| Check | Actual result |
| --- | --- |
| `npm.cmd run typecheck` | Pass |
| `npm.cmd run lint` | Pass exit status; 0 errors, 2 internal-navigation warnings in auth workspaces |
| `npm.cmd run build` | Pass using webpack; confirms compile, not hosted acceptance |
| `npm.cmd run test:contracts` | 203 passed |
| `npm.cmd run check:contrast` | 18 configured palette pairs passed; not full-screen contrast certification |
| `npm.cmd run test:db` | Fresh foundation, legacy preservation and invalid-legacy rollback passed; first two migrations only |
| `npm.cmd run test:db:onboarding` | Full migration application plus two single-role onboarding assertions passed |
| `node --test tests/config/*.test.mjs tests/rls/*.test.mjs tests/database/*.test.mjs` | 69 passed; config, worker privacy, runner guards, private SQL and care SQL; embedded/injected environments |
| `node --test src/features/bujhi/validation.test.mjs src/features/jibonrekha/demo-health.test.mjs src/features/jibonrekha/records-v2.test.mjs` | 28 passed; local parser/review/demo record logic |
| Focused E2E: `tests/day3-integration.spec.ts tests/barta-safety-api.spec.ts --workers=1` | 11 passed against isolated unconfigured app at 127.0.0.1:3007, Edge; preference identity/save is mocked |
| Auth browser suite | Failures observed; broad run interrupted after repeated homepage font warnings; no full-suite pass/count claimed |
| Focused auth rerun: `--grep 'auth form works\|auth screens reflow\|large-text' --timeout=15000` | All three selected tests reported failures; runner interrupted while it remained in teardown without a final summary; log `test-results/auth-focused-audit.log` and failure contexts under `test-results/auth/` |
| Direct auth check | Keyboard unavailable/error/focus/draft path passed; default and large-text reflow failed; serious axe naming finding on both initial auth screens |

Not rerun: hosted Auth/refresh/expiry, local live Supabase session/RLS suites,
deployed all-eight journey, complete E2E suite, actual OCR engine download and
image recognition, real microphone/audio providers, manual human screen-reader
tests, physical mobile devices, 400% browser zoom, or all theme/access combinations.
The live runners require dedicated local Supabase fixtures; their safeguards must
not be bypassed to point them at a hosted database.

## Next process, with concrete acceptance gates

The supplied starter revision 3 is the proposed coordination reference: Omor
platform/security/integration, Iftee accessibility and Barta, Ifty health/review,
Samin wellness/care UI, Apurbo functional QA. Other documents contain conflicting
later/older ownership notes. Record the actual single writer/reviewer for shared
files before implementation; this audit has not assigned leases or messaged anyone.

1. **Omor: issue one current backend handoff.** Review the three existing local
   test changes; identify the accepted source SHA, exact API catalog, schema
   history and pending single-role migration. Preserve working auth. Consolidate
   a current status page, then use the existing branch/PR-to-develop workflow.
   Done: teammates have a reviewed source version, contract/example and exact
   environment setup, with no need to repeat old merges or database activation.
2. **Omor + Iftee: repair the evidenced auth defects.** Keep the current visual
   direction; fix header wrapping, language control name, visible access entry,
   private-screen adjustment access and sign-out failure handling. Done: the
   focused auth tests/axe/reflow pass and confirmed logout denies protected access.
3. **Care UI writer: connect the existing message-only care slice immediately.**
   Recipient -> purpose/message review -> explicit send -> stored request/status
   -> assigned simulated provider queue/detail -> explicit acknowledgement ->
   mother sees refreshed status -> close. Preserve unknown-outcome drafts/retry
   keys. Done: real backend state observed from two separate role sessions;
   foreign mother and unassigned/pending provider denied. This runs alongside #4.
4. **Ifty, reviewed by Omor: connect narrow health persistence.** Owned pregnancy,
   distinct baby, one supported measurement and one note; read/history/correction
   with provenance. Reuse existing schema/identity rather than a second backend.
   Done: save/read survives fresh session, distinct subjects remain separate,
   foreign-owner writes/reads fail, and retry/correction behavior is demonstrated.
5. **Samin: minimal wellness and separate private diary.** Optional check-in,
   account history, owner-only diary save/reload; no default AI/provider sharing.
   Done: another account/provider cannot read the diary. Keep this independent
   from message-only care; sharing a check-in later requires exact consent.
6. **Ifty + extraction owner + Omor: complete one report commit.** Agree the image
   contract, review/correct/reject, persist immutable review, choose mother/baby
   target and commit once. Done: fresh-session history, stale/foreign review
   denial and identical retry without duplicate record IDs.
7. **Care UI writer + Omor: add selected record sharing.** Use real saved IDs,
   exact allowed fields, recipient, purpose and finite consent. Done: assigned
   provider sees only the selection; revoke/expiry blocks subsequent access and
   actions. Diary, raw files and conversations remain excluded.
8. **Samin + Iftee: finish public safety/discovery entry and task navigation.**
   Public safety information works without chat; accurately source/review-label
   it. Poth has useful source-labelled or fictional catalog entries and honest
   unknown accessibility. Mother's dashboard links to implemented tasks. Remove
   unsupported claims; do not imply real booking or clinician delivery.
9. **Apurbo + all owners: accept one common preview/SHA.** Run the continuous
   mother-to-provider flow and all eight minimum tasks with two synthetic mothers
   and two providers; include denied access, revoked/expired consent, uncertain
   network writes/retry, rejected OCR, sign-out/private-cache, keyboard, Bangla,
   mobile reflow and screen-reader checks. Record defects and retest evidence.
10. **Omor: release only after that evidence.** Reviewed develop -> main,
    deployment smoke, known-good rollback reference, accurate README/status
    table, short demo and submission receipt. Verify the earlier exposed-secret
    rotation item from the supplied audit is closed; this review did not inspect
    or print those secret values.

The supplied deadline remains 20 November 2026, 11:30 AM Bangladesh time, with a
19 November 3:30 PM feature-freeze target. These are document-provided constraints,
not a new time allowance. If the freeze has passed, prioritize blockers to the
connected slice and disclose incomplete module outcomes; do not claim eight of
eight because screens or contracts exist. Defer additional homepage polish, new
voice providers, broad map work and the 24-feature roadmap until the core gates pass.

## Changes made by this review

Added this report only as a permanent deliverable. No application fixes, migration
applications, account/provider approvals, commits, pushes, merges, teammate
messages or deployments were performed. Generated test/build evidence is local.
