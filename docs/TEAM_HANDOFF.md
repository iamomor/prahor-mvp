# PROHOR team handoff — Day 1

Day 2 coordination: [team assignments, API dependencies, copy-ready messages and
Day 3 readiness](sprint/day-2-team-assignments.md). This supplements the historical
Day 1 record; it does not imply teammate contact or approval.

Step 7 architecture review: [data model](architecture/data-model.md), [API contracts](architecture/api-contracts.md), [security](architecture/security.md), and [owner/deliverable review record](architecture/team-contracts.md). The latest confirmed team-role mapping (14 November 2026 handbook) supersedes the historical assignments; existing branch names may be retained until the team agrees to rename them. Shared DTOs and validators live in `src/lib/contracts/`.

| Owner      | Modules/Work                                                       | Day 1 deliverable                                                         | Files to avoid editing without approval                                     |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Omor**   | PM, app platform, auth, Supabase, provider security, PWA, deploy   | Runnable scaffold, API schemas, branch rules, staging checklist           | Shared database migrations, root layout, proxy, CI                          |
| **Apurbo** | Adapt, accessibility, UI, login visual direction, responsive shell | Approved component spec, preview of welcome/settings, accessibility audit | `prohor-tokens.css`, `AGENTS.md`, `DESIGN.md` unless separate agreed change |
| **Iftee**  | Barta RAG, approved sources, Bujhi extraction                      | Source manifest, RAG evaluation set, API response contract                | Provider permissions, core layout                                           |
| **Ifty**   | Jibonrekha, mother/baby records, Bujhi verification UI             | Typed health schema, synthetic sample record, forms prototype             | Shared migrations without Omor review                                       |
| **Samin**  | Shusthota, Poth, care request UI, provider queue UI, E2E test      | Wellness and request types; task flows; fixture list                      | Server authorization policy without Omor review                             |

## Role mapping (confirmed; separate from API contract sign-off)

The canonical roster is **Omor, Apurbo, Iftee, Ifty, Samin**. “Apubo” in older materials is a historical spelling; use “Apurbo” for the frontend owner and “Ifty” for the health-record owner. Do not infer roles from legacy branch names. Module-owner API reviews and PR approvals are still pending until explicitly recorded.

## Branch convention

The earlier role-suffixed names were a proposal. Actual member branches verified
17 November 2026 are `omor`, `apurbo`, `iftee`, `ifty`, `samin`. Required workflow:
member branch -> PR into `develop` -> reviewed release into `main`.
`develop` exists locally but was absent from remote heads at inspection; Omor must
resolve this before integration PRs. Remote protections/PR targets are Not Verified.

## Start commands

```
npm install
cp .env.example .env.local
npm run dev
npm run lint
npm run typecheck
```

`package-lock.json` is now present. Use `npm ci` for the committed baseline;
coordinate intentional dependency/lockfile updates with Omor.

## PR requirements

Issue + linked route; no broken public links; lint/typecheck/build pass; note demo vs live; keyboard & labels reviewed; screenshot or recorded verification; no protected file edits without owner review. CI is intended to run on every pull request. Ask Omor before changing shared types or migrations.

## Day 1 tasks

1. All members clone and run scaffold on own machine.
2. Team reviews the canonical API draft in `docs/architecture/api-contracts.md` (see `docs/API_CONTRACTS.md` for its pointer); record actual owner approvals before freezing contracts.
3. Create independent feature PRs from `develop`, even if they only add accessible scaffolding.
4. End Day 1: walkthrough public home, access settings, login, private demo dashboard, module routes, install manifest, and offline fallback. Confirm no real health information is used.
