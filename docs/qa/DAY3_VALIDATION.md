# Day 3 candidate: validation and limits

Verified locally on 18 November 2026 against Omor base `a38c00f`, using the isolated
candidate at `D:/prohor-day3-candidate`. The browser checks used Microsoft Edge with
private, synthetic test contexts and the production server on port 3051. No real
medical data, live database migration, remote merge or deployment was used.

## Results

| Check | Observed result |
| --- | --- |
| `npm run typecheck` | Passed on final source. |
| `npm run lint` | Passed on final source. |
| `npm run build` | Passed; production routes generated. |
| `npm run test:contracts` | **175 passed**, including account mapping/controller, identity mismatch guard, repeated 409s, stale requests, signed audio tickets, provider fallback, response size limits and throttling. |
| `npm run test:rls:guards` | **5 passed**. |
| `npm run test:db` | Passed fresh/legacy migrations, two-account RLS, atomic patches and invalid-legacy rollback in disposable local PostgreSQL. This is not hosted Supabase acceptance. |
| `npm run check:contrast` | Passed existing theme/token checks. |
| Ifty parser/records unit suites | **20 passed**. |
| Broad production browser run | **59/63 passed initially**. Four failures were outdated test expectations for tri-state contrast or the AAC action label; corrected assertions, then reran all affected files. |
| Affected browser files rerun | **23/23 passed**, including all four prior failures, Barta, settings and homepage coverage. |
| Final Day 3 browser suite after final controller/label changes | **9/9 passed**. |
| Ifty record/review browser suites | **14/15 passed initially**. The upload test incorrectly expected a disabled button rather than the existing consent guard. Both upload tests then passed (**2/2**) with assertions proving consent denial, local preview cleanup and manual transcript fallback. No unresolved failures remain in these checked cases. |
| Additional axe scan | **0 violations** in the account-review dialog and full Adapt settings, for the configured WCAG 2 A/AA, 2.1 AA and 2.2 AA rules. No page errors in screenshot capture. |
| Poth runtime smoke | Public page mounts without page errors; reviewed directory returns its honest empty dataset; invalid limits/locations return 400. No community map-provider query was sent. |
| Merge/ownership checks | No conflict markers; `git diff --check` passed. Auth helpers, Supabase clients, migrations and auth routes match Omor's baseline. |

Failed intermediate runs remain in the external review workspace. They were used
to find the hydration/audio/reflow defects and to update assertions for deliberate
contract/UI changes. The successful reruns above identify exactly what was rerun;
this report does not invent a single uninterrupted 63/63 execution.

## Behavior exercised

- Account load, partial ETag save and page refresh; original compact settings panel
  reaches `/api/preferences` through `/api/me` identity.
- Cancel/Escape and focus return; repeated conflicts; failed network saves; no false
  confirmation; edits during a pending save remain unsaved.
- Sync-off then sign-out; separate accounts; delayed A loads/saves cannot update B;
  expected-account header rejects stale caller identity before preference access.
- Saved read-aloud value, compact density, focus, font and OS contrast survive the
  supported account/device mapping. Explicit standard contrast stays standard.
- Denied storage retains changes in the page and discloses reload limitations,
  without a React update loop.
- Chat request cancellation/retry, citations, language, stored drafts, one-time AAC
  insertion, no automatic send and retained over-limit incoming text.
- Mocked microphone/speech ownership handoffs between AAC and Barta; old ownership
  remains valid during cancellation. Generated-audio ticket/fallback/size/throttle
  behavior runs against the real server-module code with external providers replaced.
- Real Tesseract English OCR on a synthetic image; exact raw numerical strings,
  explicit field checking, distinct mother/baby destinations and deduplicated saves.
- Record episodes/twins, correction history, consent previews, quota recovery,
  stale tabs, reload/offline local edits, keyboard paths, 320px reflow and 200% text
  scaling across record screens, plus scoped axe checks.

## Evidence

- [Account review, desktop](day3-images/account-review-desktop.png)
- [Full settings, mobile](day3-images/full-settings-mobile.png)
- [Medical review, mobile](day3-images/medical-review-mobile.png)
- [Records, mobile](day3-images/records-mobile.png)
- [Additional axe results](day3-images/axe-results.json)
- Text logs are under `day3-test-logs/`; the full historical review workspace is
  `D:/prohor-team-review-20261118`.

## Reproduce locally

Install the locked dependencies, then run the checks from the candidate folder:

```powershell
cd D:\prohor-day3-candidate
$env:NODE_OPTIONS='--max-old-space-size=768 --max-semi-space-size=8'
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:contracts
npm.cmd run test:rls:guards
npm.cmd run test:db
npm.cmd run check:contrast
node.exe --test src/features/bujhi/validation.test.mjs src/features/jibonrekha/demo-health.test.mjs src/features/jibonrekha/records-v2.test.mjs
$env:NODE_OPTIONS='--max-old-space-size=1536 --max-semi-space-size=8'
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 3051
```

In another PowerShell terminal, with that production server running:

```powershell
cd D:\prohor-day3-candidate
$env:NODE_OPTIONS='--max-old-space-size=768 --max-semi-space-size=8'
$env:PROHOR_TEST_URL='http://127.0.0.1:3051'
$env:PLAYWRIGHT_CHANNEL='msedge'
npx.cmd playwright test --workers=2
node.exe --test --test-concurrency=1 src/features/bujhi/medical-entry.browser.test.mjs src/features/bujhi/upload.browser.test.mjs src/features/jibonrekha/records-v2.browser.test.mjs
```

The real OCR browser test downloads the engine/language data after explicit consent.
No hosted voice or LLM credentials are needed for these local checks.

## Before release

Live Supabase sign-in/refresh/sign-out with two synthetic accounts, hosted provider
configuration, real microphone/speaker behavior and manual screen reader/device QA
remain unverified. Axe and automated keyboard interaction are useful evidence,
not WCAG certification or universal accessibility. Clinical review and production
health/report/care backends remain separate work. See `DAY3_FIX_REPORT.md` for
owner decisions and the reviewed `develop` -> `main` release process.
