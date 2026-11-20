# Bondhon final care journey

Baseline: the user’s current, clean `iftee-lastminute` export at `5b2c910` (20 November 2026). This update is a UI and client-state refinement of the existing simulated coordination system. It is not a new provider service or clinical feature.

## Structure and user job

The mother explains a routine support need, chooses a named approved demo recipient, selects exact information, reviews the expiry/reply settings, approves once, follows the server-confirmed status, and can withdraw future access.

- Public `/bondhon`: warm introduction, one mother entry, three plain steps, privacy explanation and secondary provider entry. No private requests are fetched by this screen.
- Mother `/app/bondhon`: sharing circle and a plain-text equivalent, one create action, active sharing and separate earlier requests. No fake empty-state records or replies. Partial pagination never claims all sharing is stopped.
- Form: need → recipient → optional support requests → information and time → review/approve. Existing AAC and read-aloud remain available. Nothing is preselected for records or replies.
- Record selection: searchable local list with bilingual measurement labels; select the whole record or individual fields. Quick packs are optional disclosure. Clear counts and exact-value review remain visible.
- Detail: current saved status, next action, progress, permissions, messages, history, sharing receipt. Stop sharing and Close request have different meanings and confirmations.
- Provider `/provider` or `/provider/bondhon`: only authorized queue/detail, expiry and simulated wording. Queue sorting remains **access ending soonest**, not newest first. Locate the proof request by its purpose/message if it is not the first row.

Mobile uses one normal-flow column; desktop uses a sharing overview beside requests and a queue/detail layout. No sticky feature panel overlaps following content. Shared semantic tokens, parent shell, language and Adapt preferences are preserved. The existing parent shell supplies language, adjustment and sign-out controls.

## Behavior corrected or made explicit

- Whitespace-only composition is stopped before proceeding; a recipient removed during refresh must be chosen again.
- Record refresh drops unavailable selections; it never silently adds newly available fields. Record-fetch failure visibly permits message-only review.
- Whole-record selection includes all **displayed** fields of that record; individual-field selection remains available. The review lists the exact values. Search stays in memory and makes no search/analytics request.
- Review shows Bangladesh time. A first submission with an expired review is blocked and must be reviewed again. An ambiguous previous submission can still replay its preserved payload/key after expiry to reconcile the saved result.
- Workspace state remounts when the account or role changes. Provider reads are hidden while revalidating; cancelled and stale reads cannot restore earlier content. Owner DTOs or owner-only grants/audit received on a provider screen are rejected.
- Provider detail without a current coordination receipt is hidden. Historical requests can remain in the queue; they require a new reviewed request to use this UI’s permission workflow. This is a conservative display rule, not a database migration.
- Stop-sharing success requires an exact-request server withdrawal/closure receipt. Unknown responses retain the retry action; no optimistic stopped state is invented.
- Request status and access status remain separate: a responded request can have stopped access. Closing is not medical resolution.
- Internal link navigation from the Bondhon workspace asks before discarding a draft, including links in its shared shell. An ambiguous submission keeps the reviewed request open. The shared Shonket embedding keeps its existing draft handoff and route behavior. Emergency information opens a new tab so an unconfirmed request does not block help or lose its retry key. Drafts remain in memory; browser Back/closing the tab can lose an unsent draft, and browser unload prompts are not guaranteed.
- The private workspace hides on pagehide. A restored browser-cache page reloads through the existing authenticated route before revealing the workspace. This is supplementary UI protection; server auth/no-store remain authoritative. Actual sign-out/Back behavior still needs the hosted proof.
- Dialog defaults focus to keeping the current decision, Escape works when not busy, and focus returns to its trigger. Forms, list navigation and action feedback have explicit focus targets.
- Scope exclusions stay unchanged: **diary, AI conversations and raw files cannot be shared through Bondhon**. A supporter/family role gains no automatic rights. Copying text manually into a message shares that text after approval; existing copies cannot be recalled by revocation.

## Compatibility boundaries

Only the manifest’s Bondhon components, isolated stylesheet, new helpers, tests/config, checker and documents are changed. No shared auth shell, auth routes, API handler, schema, SQL migration, environment file, lockfile, Barta, Poth, Jibonrekha, Shusthota or Shonket source is changed. CareRequestForm’s existing props and Shonket callback contract remain intact. The installer refuses changed prerequisites or changed target files and backs up existing bytes before writing. Compatibility refusal is not a reason to overwrite a teammate’s version.

Existing `scripts/test-bondhon-live.mjs` is retained: its older selectors reference a recipient select and old CTA text. Use the new final browser config for this UI proof; do not treat an outdated-selector failure as proof of a database failure.

## Verification in this preparation environment

- 35 native Node tests passed: 29 existing status/view tests plus 6 journey regressions.
- All Bondhon TS/TSX files and the new Playwright test/config parsed with the available Babel TypeScript parser.
- Patch whitespace, CSS class references and installer LF/CRLF/reapply/conflict tests are checked separately in the package verification report.
- Next, React, TypeScript compiler, project ESLint, Zod and database dependencies are not installed in this preparation environment. Full typecheck, lint, production build, contract/database suites and browser acceptance are **not claimed as passed here**.
- Chromium could not launch in this restricted environment. Responsive, axe, keyboard, screen reader, theme combinations, soft keyboards, actual expiry and two-account access withdrawal remain release checks on the team’s environment. Bangla copy needs a fluent team review. No WCAG certification or bug-free claim is made.

## Run locally

1. Stop any running development server before generating/building types.
2. `node scripts/bondhon-final-check.mjs`
3. Run `node .\node_modules\next\dist\bin\next build --webpack` directly in PowerShell. Check `$LASTEXITCODE` immediately. Exit 0 means success; `--trace-exit` deliberately prints an exit warning and is not needed normally.
4. `node .\node_modules\next\dist\bin\next start -p 3017` in a terminal kept open.
5. In another terminal set `$env:PROHOR_TEST_URL = 'http://127.0.0.1:3017'`, then run `node .\node_modules\@playwright\test\cli.js test --config=playwright.bondhon-final.config.ts`.

The public responsive/axe test runs without accounts. The two-account test is explicitly **skipped** until all four synthetic-account variables are supplied: `PROHOR_TEST_MOTHER_EMAIL`, `PROHOR_TEST_MOTHER_PASSWORD`, `PROHOR_TEST_PROVIDER_EMAIL`, `PROHOR_TEST_PROVIDER_PASSWORD`. Keep credential values local; do not paste or commit them. Use Omor’s existing synthetic test accounts, not real patient accounts.

The two-account test creates one synthetic request from existing synthetic records, acknowledges/replies, revokes it, checks provider denial, and signs both accounts out. It does not edit SQL or generate missing health records. Missing synthetic blood-pressure/haemoglobin prerequisites fail clearly. Use `--grep "M8 two-account"` to run it separately. It creates the four requested proof screenshots under Playwright’s test-results output. These can contain account/record identifiers; review them before sharing.

Full hosted run: follow TWO-ACCOUNT-PROOF.md and record Pass/Fail/Not tested for every row. Automated UI checks supplement the manual screen-reader, keyboard and sign-out/Back check. A successful build alone does not establish permission enforcement.

## Merge and release

After local validation, review `git diff --stat` and stage only the manifest’s files. Preserve concurrent Barta work and generated next-env changes. Commit to the member branch, fetch and check the latest main before integration, resolve real conflicts by reviewing both versions, and push normally. Never force-push. Omor should run the same proof against the resulting deployed commit; the screenshots must correspond to that release.
