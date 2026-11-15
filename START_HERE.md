# PROHOR Next.js Web + PWA Day 1 Starter

This is a working **code scaffold**, not an implemented healthcare system. It keeps the previous 18 design-kit files (including AGENTS.md, SKILL.md, prohor-tokens.css, QA_CHECKLIST.md and DESIGN.md) byte-for-byte unchanged.

## Start in 5 minutes (requires internet to install packages)
```bash
npm install
cp .env.example .env.local
npm run dev
```
Then open http://localhost:3000. In Windows PowerShell, use `Copy-Item .env.example .env.local`.

Validate and lock dependency versions before your team clones:
```
npm run lint
npm run typecheck
npm run build
npm run check:contrast
git add package-lock.json
```
**No lockfile is bundled** because dependency download was unavailable in the artifact-building environment. Do not use `npm ci` until Omor commits the generated lockfile.

## What is really working on Day 1
- Responsive original landing page and app navigation; public pages and a clearly labeled synthetic private dashboard preview.
- Three optional theme candidates and independent accessibility preferences from unchanged design-kit source.
- Next App Router manifest, PWA icon assets, privacy-first service worker and offline fallback.
- Conditional Supabase cookie SSR/browser helpers, proxy and email OTP sign-in interface.
- Module routes / feature directories for all 8 modules, typed API validation stubs with explicit **501 not connected/not sent**.
- Documentation of owner workstream, PR rules, API contracts, six-day lead plan and initial CI / Playwright tests.

## What is deliberately not working yet
Actual maternal records, providers, clinical review, Bangla translation throughout, real RAG, OCR, offline data, human-care delivery, fully tested AAC, push messages, validated medical information. Do not pitch this scaffold as a finished MVP.

## First Omor tasks
1. Read `docs/SPRINT_OMOR.md` and `docs/TEAM_HANDOFF.md`.
2. Create repository and `develop` branch; assign module owners and reviews.
3. Run `npm install` (in an internet-connected environment), build/test, commit `package-lock.json`.
4. Configure Supabase sandbox, run reviewed SQL migration, test ownership across 2 synthetic accounts.
5. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in `.env.local`, not git.
6. Review auth callback URL settings in Supabase (localhost and deployed HTTPS URL).
7. Deploy staging before Day 2, demonstrate real mobile viewport and PWA install on HTTPS.
8. Record actual completion evidence each day.

## IMPORTANT notes
- This starter's `src/app/app/layout.tsx` deliberately shows sample-only previews when Supabase is unconfigured. With Supabase configured it protects `/app/*` by server-side user lookup.
- Provider route requires verified membership if Supabase is configured; no self-elevation from client profile.
- The included SQL migration defines initial RLS patterns but must be reviewed and tested with synthetic users before being trusted with any real data.
- Feature `src/features/*` folders are for teammates' domain logic; keep server authorization out of the browser.
- For public API and health-service deployments, add rate limits, audit logs, content clinical review, CSP, privacy policy, robust consent and negative security tests.
