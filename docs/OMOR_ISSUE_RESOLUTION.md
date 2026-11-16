# PROHOR — Omor's exact five-issue resolution guide

**Scope:** Read this alongside `architecture/team-contracts.md`, `architecture/api-contracts.md`, and `qa/CODE_REVIEW.md`. This is a **documentation correction**, not a statement that the deployed app is working. Created 16 November 2026 for the five issues raised in the documentation review.

## What was actually corrected in this ZIP

1. `TEAM_HANDOFF.md`: current team owners for Adapt/Frontend (Apurbo), Barta/AI (Iftee) and Jibonrekha/Health (Ifty); explicit note about old branch labels; canonical API documentation pointer.
2. `architecture/team-contracts.md`: preserved older assignments as a history table, marked the newer user-confirmed mapping as current, and separated role decisions from still-pending API approval.
3. `SPRINT_OMOR.md`: updated four incorrect teammate assignments and clarified the Bujhi extraction/review partnership.

**Not changed:** `architecture/api-contracts.md`, `architecture/data-model.md`, `qa/` records, application code, `AGENTS.md`, `DESIGN.md`, `supabase/` and any environment files. No approval was invented.

## Issue 1 — Synchronize ownership (documentation corrected)

- Compare `TEAM_HANDOFF.md` and `architecture/team-contracts.md` with the real repository's `AGENTS.md` and CODEOWNERS rules.
- If `AGENTS.md` or CODEOWNERS still assign the old owners, open a **separate reviewed PR** for these protected files; do not silently overwrite them.
- Branch names may remain `iftee-frontend`, `ifty-ai`, `apubo-health` even though task ownership has changed. If you decide to rename branches, coordinate with all developers first rather than deleting their work.

## Issue 2 — Approve API contracts (not done yet)

1. Open `docs/architecture/api-contracts.md` in the live repository; **do not paste a competing contract template**.
2. Share it with Apurbo (preferences), Iftee (AI/report extraction), Ifty (health/report review), Samin (wellness/help/provider UI); Omor reviews platform authorization.
3. Each owner responds with exact endpoints, request/response field names, validation and errors, auth rules, and whether accepted or changes requested.
4. Record actual reviewer/date/decision/PR link in `docs/architecture/team-contracts.md`. Keep `Status: proposed` until owners approve. Only then finalize schemas/contract tests. Avoid inventing sign-offs.

## Issue 3 — Implement the backend (cannot fix from docs ZIP)

In your **actual application repository**, first inspect `src/app/api`, `src/lib/contracts`, `src/lib/supabase`, `supabase/migrations`, and `package.json`. Use the current code rather than creating duplicate routes.

Suggested sequence: configure Supabase safely (local environment only); make login/session work; review migration/RLS with two synthetic mother accounts; implement health record persistence; then care request persistence + provider authorization; integrate Iftee's source-grounded Barta service. Never use real patient records for demo, never put privileged secrets in frontend, and never label an unsent request as delivered.

The earlier `docs/API_CONTRACTS.md` records `501 not_connected`, `not_sent` and unimplemented health persistence as **historical documented status**. Verify against live handlers before modifying them.

## Issue 4 — Verify tests (cannot declare pass from ZIP alone)

In the actual repository, on a clean working tree:

```powershell
git status
npm run typecheck
npm run lint
npm run test:contracts
npm run build
npm run test:e2e
```

Only run scripts that exist in `package.json`, after dependencies and browser test prerequisites are installed. On Windows PowerShell where `npm` is restricted, try `npm.cmd` instead. Capture date, branch, commit hash, commands, pass/fail and any errors in a **new** report or append a dated note to `docs/qa/CODE_REVIEW.md`. Do not delete older failure evidence; an older failed run and a later passing run can both be accurate.

## Issue 5 — Compare documentation with actual code (requires repository)

Open VS Code at the actual PROHOR repository, not inside the ZIP. Check `git status`, `git branch --show-current`, `git log -1 --oneline`, `package.json`, `src/app/api/`, `supabase/migrations/`, and test scripts. Compare each described endpoint with `docs/CODE_MAP.md` and `docs/architecture/api-contracts.md`. Mark every disputed status **verified**, **not implemented**, or **unknown** with a date and code path. There is no code in this docs archive to run.

## How to apply this corrected ZIP safely

1. **Keep the original `docs.zip` unchanged.**
2. Extract this corrected ZIP to a **separate temporary folder**, not directly into your live repository.
3. Compare only the three changed Markdown files listed at the top with your live repository's versions. If the live versions have newer work, merge just the relevant edits manually; do **not** overwrite newer files blindly.
4. Copy the new resolution guide if desired. Run `git diff -- docs/TEAM_HANDOFF.md docs/architecture/team-contracts.md docs/SPRINT_OMOR.md`.
5. Commit on Omor's working branch and create a pull request to `develop`. Preserve pending approvals until genuine reviews arrive.

**Completion conditions:** Issue 1 after confirmed owner mapping and repository rules agree; Issue 2 after owner sign-off; Issue 3 after real authenticated, secure backend integration tests; Issue 4 after a fresh dated run; Issue 5 after a code-to-docs verification against the live source tree.
