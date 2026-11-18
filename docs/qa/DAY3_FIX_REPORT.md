# Omor: Day 3 conflict fixes and integration handoff

**Cannot see the edits?** Open `D:/prohor-day3-candidate` as your project folder.
Start with [the readable change index](DAY3_CHANGED_FILES.md). Source Control in
the separate `D:/prohor` folder shows Omor's unchanged checkout.

For the newly pasted older plan, see [what is implemented and what remains](DAY3_PASTED_REVIEW_VERIFICATION.md).

This is actual implementation in **`D:/prohor-day3-candidate`**, on the local branch
**`omor-day3-conflict-resolution`**, based on Omor **`a38c00f`**. Changes are
**uncommitted**. A branch name alone does not contain these edits until you commit
them. Your original `D:/prohor` checkout and remote `omor`, teammate branches,
`develop`, `main`, databases and deployments were not modified.

## What to take from each person

| Source | Decision in this candidate |
| --- | --- |
| Omor `a38c00f` | Keep authentication, HttpOnly sessions, authorization, migrations/RLS, strict API schemas, Barta request cancellation, retry behavior, memoization, citations and the in-place settings flow. |
| Iftee `7aa3ca0` | Combine newer Barta corpus/routing, server-only OpenRouter selector, Fish/bundled audio and Poth additions with Omor's safeguards. Text education does not require a live model. |
| Apurbo `aea6bae` | Retain reusable UI primitives, contrast controls, full settings UI, AAC catalog/composer and speech controls. Repair their shared stores and account integration. Do not replace the entire Barta component or platform. |
| Ifty `d530dcd` | This remote branch is an ancestor of Omor and predates the newer supplied archive. Do not merge its old platform/app wholesale. Use the newer supplied ZIP's `jibonrekha` and `bujhi` modules, selected here with provenance recorded. Ifty should reconcile/push his newer work separately. |
| Samin | No current Samin code delivery was supplied. Preserve existing stubs. His directory/services ownership and actual delivery still need coordination. |

The exact snapshot-by-snapshot decisions are in
[DAY3_BRANCH_SELECTION.csv](DAY3_BRANCH_SELECTION.csv). The complete working-file
list and original source mapping are in
[DAY3_SOURCE_SELECTION.json](DAY3_SOURCE_SELECTION.json). Snapshot differences do
not establish authorship of every line.

## Confirmed conflicts repaired

| Problem | Implemented solution and main files |
| --- | --- |
| A: whole-file Barta selection discards another person's work | Keep Omor's live request lifecycle; add Apurbo's AAC/draft insertion around the current chat and Iftee's education additions. `BartaChatStarter.tsx`, `BartaEducationChat.tsx`. |
| B: two AI routing implementations | Retain Iftee's optional OpenRouter passage selector, bounded input, strict result schema, safety/abstention and public educational access. No unrestricted medical generation. `api/ai/chat/route.ts`. |
| C: independent read-aloud controllers | Adapt, Barta and the homepage sample reader share `src/lib/audio-session.ts`. A new owner stops the previous owner before ownership changes. Idle cleanup cannot cancel a different owner. |
| D: competing microphones | Barta dictation and Bujhi recognition use the same coordinator as playback. Preserve Bujhi's local/external-processing consent, cancellation and editable transcript. `use-barta-audio.ts`, `bujhi/speech-service.ts`. |
| E: competing generated-audio endpoints | Keep one endpoint with Fish/bundled/local/Azure selection, signed exact-text/language tickets, fallback, 4 MB output limits and throttle including cached clips. `api/ai/barta-audio/route.ts`, `bundled-speech.ts`. |
| F: local preferences do not match SQL | Keep Omor's existing strict ten-field account schema. Map supported differences explicitly; nullable OS contrast, compact density, focus and font stay local. Never reset saved `readAloud` to false. `account-mapping.ts`, `contracts/adapt.ts`. |
| Compact settings never reached the account API | Both compact and full panels use one controller and existing load/save adapters. Account identity comes from `/api/me`, with no browser-readable session token. `PreferenceRuntime.tsx`, `account-runtime.ts`, `CloudSyncSection.tsx`. |
| Local/account settings silently replace each other | Loading only compares. Review every supported difference; explicitly choose device settings for account save or account settings for this device. Cancel/Escape changes nothing remotely. |
| Failed loads/saves appear successful | A failed GET never falls back to PATCH. Confirm the returned payload and ETag before reporting save success. Failed or newer device edits remain available. |
| Concurrent changes are overwritten | Every save uses the latest exact If-Match ETag. Every 409 reloads and requires another explicit review; no automatic retry. |
| A pending request contaminates another account | Abort/invalidate on refresh, sign-out, account switch and sync-off; ignore stale completions. Keep identity/anonymous backup separate from sync consent. An optional expected-account header prevents an old tab writing A's draft under B's server session. |
| Sync-off then sign-out leaks account settings | Retain account ID and anonymous backup even when sync is off; restore anonymous preferences before starting another account session. |
| Fake cloud deletion | Remove the unsupported deletion action. Turning off sync states that saved account settings remain and an in-flight request may already have reached the server. |
| Device-only fields reset during account application | Preserve compact layout, focused view, font and OS-following contrast. Share the canonical density store across panels. |
| Explicit standard contrast becomes OS-following | Use the shared typed store and tri-state control. Preserve current `false` explicitly, while safely migrating older unversioned data. |
| Denied storage causes a React update loop or loses edits | Stable cached snapshots and in-memory writes retain edits within the page. The UI discloses that reload may lose them if browser storage is unavailable. |
| Settings navigation loses task inputs | In-place native dialogs keep chat and medical-entry/review components mounted and restore trigger focus. Full settings remain available at `/accessibility`. |
| Dictation duplicates the typed question | The child returns only the new transcript; the parent combines it once. AAC/dictation never submits automatically. Over-limit text is retained for review instead of truncated. |
| Early SSR form edits disappear during hydration | Controlled Barta inputs wait until hydration before accepting edits. Language selection no longer resets an early user action. |
| Functional records/review components were not mounted | Public synthetic demonstrations at `/demo/jibonrekha` and `/demo/bujhi`, with legacy aliases. Private routes retain the existing mother/auth gate. No invented health backend. |
| Record screen overflows at 200% text size | Constrain grid tracks and let the shared settings trigger wrap. Preserve long Bangla labels and existing tokens. |
| New Poth routes bypass the API catalog | Add shared query/response contracts and document both routes. Remove the cache-only internal field from nearby responses. Community map results remain explicitly unverified; the reviewed dataset remains empty. |
| Duplicate migration/auth/root-style replacements | Exclude Apurbo's duplicate migration, auth replacements and global typography rewrite. Keep Omor's migrations and platform. Append only focused-view CSS. |

## Remaining limits and owner decisions

- Account load/save is tested against the real handlers and mocked browser sessions.
  Live Supabase sign-in, cookies, deployment configuration and RLS acceptance still
  need a test with two synthetic accounts. No live database operation was performed.
- Omor must review the small `X-Prohor-Account` contract addition in
  `adapt/server/handlers.ts`; it is a guard against account changes, not authorization.
  The ten-field payload, SQL and authentication helpers are unchanged.
- Poth additions need Samin/Omor ownership review. Community results do not verify
  accessibility, services, current availability or booking. The reviewed facility
  import is empty.
- Jibonrekha/Bujhi are **working synthetic local demos**, not secure medical storage.
  Existing `/api/health` and care delivery remain honest unavailable stubs. Multiple
  records, corrections, local review and consent previews are useful prototype work;
  connecting them to production needs a separately approved backend contract.
- Browser OCR works for the tested synthetic English image. Real documents, Bangla
  OCR accuracy and clinical correctness are not established. Voice tests use browser
  mocks; real microphones, speakers, remote voice services and assistive technologies
  still need device testing. Existing explicit consent/fallback paths remain.
- Hosted Fish/Azure/OpenRouter configuration and availability were not exercised with
  paid credentials. Bundled audio's source/licensing and clinical content review are
  still owner responsibilities. Text remains available if audio is unavailable.
- No Samin branch/archive was available for a complete five-person integration.
- The previously supplied Iftee RAR included actual environment credentials. They
  were excluded from the candidate; rotate any credentials shared in that archive.
  No credential values were copied into this report and no rotation was performed.

## Bounded team handoff

- **Omor:** review the account guard and directory contracts; run two-account hosted
  acceptance; rotate exposed archive credentials; own the develop/release PRs.
- **Apurbo:** review the integrated settings/AAC/keyboard flows. Continue from the
  corrected shared controller; do not introduce another preferences API or migration.
- **Iftee:** verify optional hosted audio/selector configuration and approve a single
  extraction adapter contract with Ifty. Preserve approved-source and review boundaries.
- **Ifty:** reconcile the newer archive with his actual branch; review maternal/baby
  destinations and the synthetic-to-backend boundary. Do not replace Omor's platform.
- **Samin:** supply his current delivery and review directory/care/provider ownership
  before competing placeholders or service scaffolds are integrated.

## How you move this into develop

1. Open **this candidate folder** in your editor. Read this report, the selection
   manifest and validation report. Do not copy entire teammate snapshots over it.
2. Inspect all changes, including untracked files, in this folder:

   ```powershell
   cd D:\prohor-day3-candidate
   git status --short
   git diff --check
   git diff
   ```

3. Complete the remaining hosted acceptance checks using synthetic accounts, and
   resolve the explicit owner decisions above. For local retesting use the commands
   in `DAY3_VALIDATION.md`.
4. When you accept the reviewed result, stage the selected source, assets, tests and
   documentation here. Review the staged diff. Commit and push this integration
   branch yourself; no automatic commit/push was performed.

   ```powershell
   git add src public/barta-voice tests docs/qa docs/API_PREFERENCES.md docs/architecture/api-contracts.md package.json package-lock.json
   git diff --cached --check
   git diff --cached --stat
   git commit -m "Integrate day 3 modules and resolve shared feature conflicts"
   git push -u origin omor-day3-conflict-resolution
   ```

5. Open a PR **`omor-day3-conflict-resolution` -> `develop`**. Attach the test report
   and screenshots. Run protected-branch CI and team review there.
6. Do not subsequently merge the old complete teammate snapshots into this result:
   they can reintroduce the files deliberately excluded here. Have teammates start
   their next bounded task from the updated `develop`, preserving their old branches.
7. After `develop` passes hosted acceptance and demo QA, release through the normal
   reviewed **`develop` -> `main`** PR. Do not merge directly to `main` as a shortcut.

If you return to `D:/prohor`, you are back in the separate `omor` worktree. That is
expected: worktrees expose other versions without putting their code into `omor`.
