# PROHOR team handoff — Day 1

| Owner | Modules/Work | Day 1 deliverable | Files to avoid editing without approval |
|---|---|---|---|
| **Omor** | PM, app platform, auth, Supabase, provider security, PWA, deploy | Runnable scaffold, API schemas, branch rules, staging checklist | Shared database migrations, root layout, proxy, CI |
| **Iftee** | Adapt, accessibility, UI, login visual direction, responsive shell | Approved component spec, preview of welcome/settings, accessibility audit | `prohor-tokens.css`, `AGENTS.md`, `DESIGN.md` unless separate agreed change |
| **Ifty** | Barta RAG, approved sources, Bujhi extraction | Source manifest, RAG evaluation set, API response contract | Provider permissions, core layout |
| **Apubo** | Jibonrekha, mother/baby records, Bujhi verification UI | Typed health schema, synthetic sample record, forms prototype | Shared migrations without Omor review |
| **Samin** | Shusthota, Poth, care request UI, provider queue UI, E2E test | Wellness and request types; task flows; fixture list | Server authorization policy without Omor review |

## Branch convention
`main` (protected release) <- `develop` (protected integration) <- `omor-platform`, `iftee-frontend`, `ifty-ai`, `apubo-health`, `samin-services`.

## Start commands
```
npm install
cp .env.example .env.local
npm run dev
npm run lint
npm run typecheck
```
**No npm lockfile is included** in this generated kit: run `npm install` once in an internet-connected environment, commit the produced `package-lock.json`, and all members thereafter run `npm ci`.

## PR requirements
Issue + linked route; no broken public links; lint/typecheck/build pass; note demo vs live; keyboard & labels reviewed; screenshot or recorded verification; no protected file edits without owner review. CI is intended to run on every pull request. Ask Omor before changing shared types or migrations.

## Day 1 tasks
1. All members clone and run scaffold on own machine.
2. Team agrees on API contracts in `docs/API_CONTRACTS.md`.
3. Create independent feature PRs from `develop`, even if they only add accessible scaffolding.
4. End Day 1: walkthrough public home, access settings, login, private demo dashboard, module routes, install manifest, and offline fallback. Confirm no real health information is used.
