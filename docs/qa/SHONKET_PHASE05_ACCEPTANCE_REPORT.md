# Shonket Phase 05 acceptance report

Date: 20 November 2026 (Asia/Dhaka). Branch: `apurbo-mvp`. HEAD: `8793781e624a6e3967affffc013eb5f3dc5d0a2f`.

Classification: **Internal testing ready**. Pilot and production acceptance remain blocked. This audit preserves the existing uncommitted Phase 01–04 implementation. No remote write, migration deployment, staging, commit, or push was performed.

## Acceptance matrix

| Requirement | Implementation | Automated evidence | Live evidence | Manual evidence | Status |
|---|---|---|---|---|---|
| Engineering completion | Warning pages, handoffs, request form/history and provider queue exist | Typecheck, full lint, 240 contracts pass | Local production build verification recorded below | NOT TESTED | PARTIAL |
| Four warning topics and unknown route | Four fixed topics; unknown slug returns 404 | Phase 01 browser tests pass | Local app HTTP/browser | NOT TESTED | PASS |
| Emergency actions | Explicit `tel:999`, actual `/app/care/new`, public Barta links | Four mappings and keyboard emergency navigation pass | No emergency call placed | Phone dialer NOT TESTED | PASS |
| Clinical disclaimer | Fallback retained in English/Bangla; no warning signs published | Phase 01 verifies disclaimer | No clinician approval evidence | NOT TESTED | BLOCKED BY CLINICAL APPROVAL |
| Authentication and Mother role | Private workspace authentication and server role checks | Guest redirect and contract/SQL authorization tests pass | Hosted authenticated journey NOT TESTED | NOT TESTED | PARTIAL |
| Backend completion | Shonket RPCs extend existing care tables | SQL-backed care contracts; disposable coordination tests pass | Migration deployment/history NOT TESTED | NOT TESTED | PARTIAL |
| Required consent | Review, privacy disclosures and explicit Confirm and send action exist | No separate consent flag required in Shonket API or RPC | No persisted consent confirmation verified | NOT TESTED | FAIL |
| Retry and ownership | Retry key, owner filtering, provider assignment and revision checks | SQL tests cover retry, cross-owner denial, provider open and acknowledgement | Hosted two-account verification NOT TESTED | NOT TESTED | PARTIAL |
| Request history/status | Server event timeline shown inline in history | SQL tests verify submitted/delivered/acknowledged evidence | Hosted reload and re-login NOT TESTED | NOT TESTED | PARTIAL |
| Barta integration | Exact four questions; editable prefill; explicit submit; bounded payload | Phase 01/education tests pass; real API contract test passes | Hosted AI/source infrastructure NOT TESTED | NOT TESTED | PARTIAL |
| Barta error lifecycle | Draft retained on empty/outage/timeout | Lifecycle results recorded below | NOT TESTED | NOT TESTED | PARTIAL |
| Offline/PWA | Only eligible public safety HTML cached; private routes excluded | Worker tests pass, including cache rejection and offline fallback | Local production response checks recorded below | Installed PWA airplane mode NOT TESTED | PARTIAL |
| Responsive layouts | Public safety pages and Barta use responsive layout | Safety widths 320/360/375/390/414/768/1024/1440 pass; Barta result below | Authenticated screen layouts NOT TESTED | Physical phones NOT TESTED | PARTIAL |
| Accessibility readiness | Semantic controls, route focus and status announcements | Emergency keyboard test passes; Barta axe result below | Authenticated care screens NOT TESTED | Manual keyboard/screen reader NOT TESTED | PARTIAL |
| Clinical readiness | Four-topic review checklist has no supplied reviewers/dates; publication held | Checklist/source audit only | No clinical approval | No qualified review | BLOCKED BY CLINICAL APPROVAL |
| Provider integration readiness | SQL assigns only approved simulated provider; UI labels demo | SQL event/revision and restricted projection tests pass | Real provider delivery not verified | NOT TESTED | DEMO ONLY |
| Release readiness | Suitable for controlled internal testing with these limitations | Core contracts/worker/SQL pass | Hosted migration and care journey unverified | Acceptance checklist pending | PARTIAL |

## Commands and evidence

Fresh logs are in `/tmp/shonket-phase5/` (local, not committed).

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, no warnings in this run. The prior Phase 04 warning was a newly introduced unused `ShonketCareNavigation` import in `src/features/shonket/ShonketPublicFrame.tsx`; the import was removed before this audit. It is absent now.
- `npm run test:contracts`: PASS, 240 tests, including SQL-backed care adapters and Shonket contracts.
- `node --test tests/database/bondhon-coordination.test.mjs tests/rls/public-worker.test.mjs`: PASS, 25 tests; all run, none skipped.
- `npx playwright test tests/shonket-phase1.spec.ts tests/shonket-phase2.spec.ts tests/barta-education.spec.ts tests/barta-integration.spec.ts tests/barta-lifecycle.spec.ts --workers=2`: initial run 15 PASS, 2 FAIL. Barta six-combination axe/reflow test exceeded its 30-second total budget during reload; cancellation test failed to finish homepage navigation within the five-second assertion budget. Production rerun results follow below. Assertions were not removed or weakened.
- `npm run build`: result recorded below.

## Migration review and deployment gate

Migration: `supabase/migrations/20261120100000_shonket_request_workflow.sql`.

It adds `workflow` (default `bondhon`), `concern_types`, and `onset` to `prohor_care.support_requests`; adds concern/onset constraints and two partial indexes (`support_requests_shonket_owner`, `support_requests_shonket_provider`). It creates internal `valid_shonket_concerns`, `shonket_dto`, `guard_shonket_phase_scope` and the `shonket_phase_scope` trigger. It creates four public authenticated RPCs: `mvp_shonket_submit_request`, `mvp_shonket_my_requests`, `mvp_shonket_provider_requests`, `mvp_shonket_open_request`. It replaces shared `mvp_care_get_request`, `mvp_care_provider_requests` and `check_request_evidence`.

It reuses assignments, queue receipts, request events, mutation receipts, audit events, provider approvals, profiles, membership/application roles, and auth users. There is no parallel request store. Existing care schema/table privilege restrictions and RLS remain; no policies are disabled or added. Security-definer functions use an empty search path, actor checks, owner/recipient predicates, and authenticated-only public execution. Provider open records delivery evidence; acknowledgement uses the existing care RPC. Shared provider reads exclude Shonket requests.

Compatibility is tested locally, not established for the hosted deployment. It is **not purely additive** because it replaces shared functions/evidence checks and constrains Shonket transitions. It disallows closing/responding to Shonket requests in this phase. It is **not idempotent**: columns, functions, indexes, constraints and trigger use creation statements that fail if directly rerun. Use migration history once; do not replay the SQL blindly.

Local verification uses PGlite with synthetic auth fixtures and actual ordered migrations. Supabase configuration exists (`prohor-local`, PostgreSQL 17), but the Supabase CLI is absent and no running local Docker database was available. Full local Supabase Auth/PostgREST testing and rollback testing: NOT TESTED. SQL tests are not hosted Supabase evidence.

Configured remote project reference: `xwpdchegbizuswhtqtgc`. Read-only REST-root preflight returned HTTP 401. Intended Dashboard project identity and remote migration history: **NOT TESTED**. No suitable authenticated database inspection connector or linked CLI project was available. The supplied Phase 05 request says migration is undeployed; that statement has not been independently confirmed remotely.

Required future operation: after a human confirms the intended **test** project, inspect its migration history and dependencies read-only; then separately authorize deployment of this migration. Risks include shared Bondhon regressions, deployment locks on support_requests, incompatible existing schema/data, and incorrect simulated-provider configuration. Before deployment take an appropriate backup and record existing shared function definitions. SQL is transactional: a failed application should roll back the transaction. After successful deployment there is no supplied down migration; recovery requires a reviewed forward fix or backup restore. A destructive column drop would lose Shonket data and is not an acceptable automatic rollback. No remote schema/RLS/record change is authorized or performed by this audit.

Live Mother A/B creation, re-login persistence, cross-account denial, idempotency and provider delivery: NOT TESTED until that deployment gate is satisfied. Existing live test scripts create/update remote records and were intentionally not executed.

## Remaining blockers and limitations

- Required consent is not separately enforced/persisted by the Shonket submit contract/RPC. A real consent policy and appropriate audit evidence require a reviewed implementation; no schema was changed during this audit.
- Real provider delivery is **DEMO ONLY — REAL PROVIDER DELIVERY NOT VERIFIED**.
- All four clinical topics are **BLOCKED BY CLINICAL APPROVAL**. Keep the publication hold and existing fallback actions. A coding audit cannot provide medical or translation approval.
- Phase 04 localization remains partial: legacy care review/status/empty components and public Barta page chrome still contain English strings. Current form/history/provider translations are present, but full authenticated bilingual acceptance has not been performed.
- History shows status/details inline; no separate Shonket-specific detail route is verified. Legacy closure is explicitly denied for Shonket by this migration.
- Worker tests model cache behavior with synthetic HTML. Production response eligibility does not prove an installed PWA works end to end offline. JavaScript/CSS bundles are intentionally not worker-cached; cached SSR HTML and phone links need actual device verification.

## Human acceptance checklist

All checks below are **NOT TESTED** manually. Use disposable synthetic accounts in an approved test environment only.

- [ ] On an actual phone inspect all safety topics, Barta, form/review/history and provider queue; resize text and open the keyboard. Confirm all actions remain visible without horizontal scrolling.
- [ ] Activate the 999 link only far enough to verify the dialer/confirmation; cancel without placing an emergency call. Confirm no dialer opens on page load.
- [ ] Install production PWA, visit each safety topic online, enable airplane mode, reload, and verify readable warning fallback, phone link, cache notice and unavailable Barta/care state. Confirm no later background request submission.
- [ ] Switch English/Bangla before and during drafts; verify labels, wrapping, draft preservation and absence of clinical approval claims.
- [ ] Complete public navigation and private form using keyboard only; verify focus visibility/order, validation correction, review, settings dialog Escape and focus return.
- [ ] With a screen reader verify headings, links, field labels/errors, loading, review transitions and request status announcements.
- [ ] After migration approval/deployment, Mother A submits a synthetic request and confirms returned ID, history after reload/re-login, and exact event status. Never interpret submitted as clinician contact.
- [ ] Interrupt connection, retry unchanged request, verify draft and one request ID; check missing-Origin, invalid payload, duplicate and changed-key cases safely.
- [ ] Review/edit/clear each Barta handoff, verify no automatic submission, explicitly submit an educational question, and inspect actual answer citations and errors.
- [ ] Mother B cannot access A's request; each sees only her own data. Logged-out/provider/unassigned-provider access is denied as appropriate. Confirm diary/record/chat contents were not sent to Barta.

Exact new deliverable from this audit: `docs/qa/SHONKET_PHASE05_ACCEPTANCE_REPORT.md`. Existing Phase 01–04 code and unrelated Shusthota edits are preserved.

## Final fresh results

- Production build: **PASS** (`npm run build`), optimized compilation, TypeScript and 54 static pages completed.
- Production retry: **PASS**, 2/2 using `PROHOR_TEST_URL=http://127.0.0.1:3105 npx playwright test tests/barta-integration.spec.ts tests/barta-lifecycle.spec.ts --grep 'reflows|leaving Barta' --workers=1 --timeout=90000`. This retains all assertions and allows a larger total test budget for the six axe/theme combinations. The six Barta axe/reflow combinations and cancellation navigation pass against production. Initial development-server failures remain recorded above; no reproducible code defect was established from them.
- Local production responses: `/safety`, `/safety/information`, and `/safety/information/pregnancy` returned 200, no Set-Cookie, and `s-maxage=31536000`; these meet worker safety-cache header eligibility. `/ask?q=test` returned 200 with private/no-cache/no-store and no cookie. Guest care API returned 401. Private form returned 307 to the configured `http://localhost:3000/sign-in?next=%2Fapp%2Fcare%2Fnew&status=session-required`. A browser probe on port 3105 could not follow this cross-port configured redirect; subsequent direct HTTP inspection confirmed the redirect and API status. This is a local test-origin mismatch, not proof of a production authentication defect.
- `git diff --check`: PASS.
- Full ESLint was run for this audit and produced no warnings/errors. No application code was changed in Phase 05, so no post-fix rerun is needed.

Engineering outcome remains **PARTIAL**: automated regression cases are green on production retry, while required consent evidence, full localization, authenticated browser acceptance and live deployment verification remain unresolved. **Internal testing ready** is the classification, not pilot or production approval.
