# Omor — personal six-day project leadership and engineering checklist

**Release goal**: A truthful installable web/PWA proof of a mother-to-provider care journey, with eight integrated module entry points and accessibility in every path. Day 1 scaffold does not equal a completed product.

## Day 1 — Foundation and unblocking teammates

- [ ] Verify official submission eligibility, date and deliverables; record confirmation.
- [ ] Create GitHub repository; protect `main`, create `develop`, member branches, CI and owner reviews.
- [ ] Install dependencies; run lint/typecheck/build and launch app on phone and desktop.
- [ ] Configure Supabase project URL and publishable key in LOCAL environment; never commit secrets.
- [ ] Review `supabase/migrations/001_initial.sql` with Ifty and Samin; run migrations only after reviewing RLS and staging data.
- [ ] Define API contracts: Barta, health, wellness, report extraction, support requests, provider queue.
- [ ] Own auth + cookie refresh implementation and authorization checks. Demo preview is not production auth.
- [ ] Share typed schema, module owners, route map and agreed `DESIGN.md` with the team.
- [ ] Show PWA manifest, service worker and install workflow (HTTPS in deployment; localhost in development).
- [ ] Arrange a 15-minute daily standup and set Day 3 integration demonstration.
- [ ] Review/merge first contributor PRs rather than writing everyone’s screens.

**Day 1 exit**: Each member can run app; each owns branch and issue; all docs/contract boundaries known; privacy-first PWA shell and no-secret policy present; staging link attempted/verified if infrastructure ready.

## Day 2 — Shared backend and protected data

- [ ] Complete Supabase email auth and callback; test session continuity and signout.
- [ ] RLS test from two separate synthetic accounts; enforce authorization server-side.
- [ ] Implement minimal core records and `care_requests` API; never claim delivery if not delivered.
- [ ] Help Iftee with server-only LLM secrets and trustworthy source ingestion interface.
- [ ] Review Apurbo layout integration and PWA at 360px, 390px, 768px, desktop.
- [ ] Merge tested feature PRs into `develop`; deploy staging.

## Day 3 — First real integrated journey (critical)

- [ ] Prove fictional mother saves a synthetic profile and an observation.
- [ ] Prove Iftee’s real cited Bangla RAG response or explicitly mark not connected.
- [ ] Prove support request arrives at an authorized simulated provider account, with DB-backed status.
- [ ] Record evidence, traces, bug list; stop optional feature development if journey is broken.

## Day 4 — Integration breadth and PWA quality

- [ ] Stabilize module routes, errors, loading and empty states; inspect privacy/consent checks.
- [ ] Test service worker does not cache `/app`, `/api`, `/auth`, `/ask` or private responses.
- [ ] Add install affordance and icon validation; test installed mode on real Android device.
- [ ] Pair with Iftee (extraction) and Ifty (review UI) on report extraction only if working Barta is protected.
- [ ] Review accessibility settings across Jibonrekha, Barta, Shusthota and Bondhon.

## Day 5 — Feature freeze and security release candidate

- [ ] Merge/review all PRs; fix unresolved API & schema contract conflicts.
- [ ] Verify row-level policies, provider membership, consent and negative tests.
- [ ] Verify offline fallback and explicit not-sent statuses; purge old service worker cache if policy changed.
- [ ] Run lint/typecheck/build/Playwright/axe as applicable; triage P0 defects.
- [ ] Deploy release candidate, document missing capabilities and simulated services.

## Day 6 — Release and submission

- [ ] Final PWA/install + browser smoke check on actual phones and desktop.
- [ ] Rehearse one continuous mother-to-provider demo with alternate access configuration.
- [ ] Verify summary and video show actual AI/model behavior, medical data provenance and limits.
- [ ] Produce approved commit tag, repository link, deployed URL, screenshot evidence and rollback plan.
- [ ] Obtain five member sign-off; submit using official portal and confirm receipt.

## Project-manager operating rules

1. One owner per feature, one reviewer per PR, no direct pushes to `main`.
2. 15 minute start standup, 10 minute blocker check, 20 minute build demo each day.
3. Track task status: Ready → Doing → Review → Test → Done; no screenshot-only completion.
4. Priority: functional care journey > accessibility/privacy safety > AI validity > polish > decorative features.
5. When Day 3 slips, cut OCR and secondary theme polish, **not** accessibility and secure record ownership.
6. Team members all test, record evidence and help the release; you do not personally absorb their unfinished modules.
