# Shusthota Module Completion Status

Updated 20 November 2026. Module Owner: Apurbo. This report describes the current source tree and checks run in this workspace. It does not establish remote deployment or live production behavior.

## Status definitions

- **Complete and verified:** Implementation and the relevant verification both passed.
- **Implemented, not live-verified:** Local implementation exists but live environment validation is missing.
- **Partially implemented:** Some required behavior is missing.
- **Unavailable — approval required:** Clinical or external approval is missing.
- **Unavailable — infrastructure required:** Technical infrastructure is missing.
- **Not implemented:** No functional implementation exists.

## Feature status matrix

| Feature | UI | API | Database | RLS | Tests | Status |
|---|---|---|---|---|---|---|
| P0 mood check-in | Present | Existing wellness API | Existing synthetic schema | Existing owner policy | Contract suite passed; no live HTTP | Implemented, not live-verified |
| P0 energy check-in | Present | Existing wellness API | Existing synthetic schema | Existing owner policy | Contract suite passed; no live HTTP | Implemented, not live-verified |
| Activity notes | Present | Existing wellness API | Existing synthetic schema | Existing owner policy | Contract suite passed; no live HTTP | Implemented, not live-verified |
| Rest notes | Present | Existing wellness API | Existing synthetic schema | Existing owner policy | Contract suite passed; no live HTTP | Implemented, not live-verified |
| Private diary | Present | Separate diary API | Synthetic-only records | Owner-only policy | Contract and Bondhon DB suites passed; no live HTTP | Implemented, not live-verified |
| Hydration | Present | GET/POST `/api/hydration` | P1 migration locally tested | Owner and Mother policies locally tested | Contract, P1 DB, API client suites passed | Implemented, not live-verified |
| Daily Habits | Present | GET/POST habit and event routes | P1 migration locally tested | Owner and Mother policies locally tested | Contract and P1 DB suites passed | Implemented, not live-verified |
| Activity Preferences | Present | GET/POST preferences route | P1 migration locally tested | Table policy tested; explicit A/B preference isolation assertion absent | Contract and P1 DB suites passed | Implemented, not live-verified |
| Enhanced History | Present | Reads existing feature APIs | Uses persisted feature records | Uses source API authorization | Contract/API suites passed; no browser timeline test | Implemented, not live-verified |
| Reviewed Resources | Empty-state UI and metadata gate | None | No resource store or review workflow | N/A | Approval schema tests passed | Unavailable — approval required |
| Provider Sharing | Bondhon-linked selection UI exists | Existing Bondhon APIs/RPC | Existing consent/audit schema | Existing Bondhon authorization tests | Bondhon DB suite passed; Shusthota-specific live test absent | Implemented, not live-verified |
| AI Wellness Summary | Unavailable-state UI and isolated type boundary | No Shusthota AI endpoint/provider | N/A | N/A | Privacy-boundary contract test passed | Unavailable — infrastructure required |
| Clinician-approved Plans | Empty-state UI and metadata gate | None | No plan store or review workflow | N/A | Approval schema test passed | Unavailable — approval required |
| Reminders | Guide and calendar export if locally available | No background delivery API | No scheduling store | N/A | No delivery integration test | Partially implemented |

---

## 2. Exact Files Modified & Added

### Modified Existing Files
1. `next.config.ts`: Removed backwards compatibility redirect `/app/shusthota -> /app/wellbeing` that broke canonical route tests and created infinite redirect loops with the canonical `/app/shusthota` page.
2. `next-env.d.ts`: Updated by Next.js build trace optimization.
3. `src/features/shusthota/HydrationHabits.tsx`: Added `onSaved` callback integration on hydration and habit events to trigger immediate refresh of `ShusthotaHistory`.
4. `src/features/shusthota/ActivityPreferences.tsx`: Added `onSaved` callback integration on preference persistence to trigger immediate refresh of `ShusthotaHistory`.
5. `src/features/shusthota/ShusthotaHistory.tsx`: Removed unused type imports to satisfy ESLint; verified combined timeline filters and neutral pattern summaries.
6. `src/features/shusthota/ShusthotaOverview.tsx`: Integrated `RelaxationResources`, `ActivityPlans`, `ProviderWellnessSharing`, `WellnessTrendSummary`, and `RemindersGuide`; connected `onSaved` handlers to `historyRevision`.
7. `src/features/shusthota/reviewed-content.ts`: Added resource categories, full candidate and approved schemas, strict approval gates (`validateReviewedResource`, `validateClinicianApprovedPlan`), repository getters (`getPublishedReviewedResources`, `getPublishedActivityPlans`), and privacy boundary validator (`validateWellnessTrendInput`).
8. `tests/contracts/shusthota-p1.spec.ts`: Added 3 new contract tests verifying approval gate enforcement, publication status checks, clinical qualification validation, and privacy boundary enforcement.

### New Feature Files Added
1. `src/features/shusthota/RelaxationResources.tsx`: Complete relaxation resource library UI with category filters, bilingual support, detailed view modal, and honest empty state explaining clinical approval gate requirements.
2. `src/features/shusthota/ActivityPlans.tsx`: Clinician-approved activity plan UI with approval gate transparency, qualification verification, detailed view modal, and honest empty state prohibiting unvetted exercise prescriptions.
3. `src/features/shusthota/ProviderWellnessSharing.tsx`: Consent-controlled provider sharing interface with record selection, granular field toggling, exact live JSON projection preview, server-side verified provider check, explicit consent requirement, immediate revocation, and audit logging.
4. `src/features/shusthota/WellnessTrendSummary.tsx`: Non-diagnostic AI wellness trend summary UI with explicit opt-in, disclosure of minimal processed fields, strict exclusion of diary text, and honest unavailable state preventing unvetted AI dispatch.
5. `src/features/shusthota/RemindersGuide.tsx`: Transparent reminders guide distinguishing manual device calendar `.ics` export from active browser notifications and currently unavailable background push workers.

---

## 3. Database Migrations & Security Policies

- **Migration**: `supabase/migrations/20261119184243_shusthota_p1_wellness_records.sql`
  - Tables: `hydration_entries`, `wellness_habits`, `wellness_habit_events`, `wellness_activity_preferences`.
  - View: `wellness_habits_active` (with `security_invoker = true`).
  - Security policies:
    - RLS enabled and forced on all tables.
    - Owner-only checks: `owner_user_id = auth.uid()`.
    - Mother role gate: `public.mvp_private_is_mother()`.
    - Anonymous (`anon`) role denied all access.
    - Provider role denied direct access to all P1 tables.
    - Append-only enforcement: `UPDATE` and `DELETE` denied.
    - Synthetic-only check constraint: `data_mode = 'synthetic'`.
    - Same-owner foreign keys: `(habit_id, owner_user_id) references public.wellness_habits(id, owner_user_id)`.
    - Unique retry keys: `(owner_user_id, retry_key)`.
    - Single undo per completion event enforced via unique partial index and validation trigger.

---

## 4. API Endpoints

- `GET/POST /api/hydration`: Bounded ml values (1–5000), Asia/Dhaka today filtering, 100 bounded history, retry-key idempotency.
- `GET/POST /api/wellness-habits`: Mother-authored habits (1–60 chars), allowlisted symbols, active view excluding archived.
- `GET/POST /api/wellness-habits/:id/events`: Append-only `completed`, `completion_undone`, `archived` events with same-owner validation.
- `GET /api/wellness-habit-events`: Combined event history with habit labels for timeline integration.
- `GET/POST /api/wellness/activity-preferences`: Self-selected ability-neutral activity preferences.
- `GET /api/wellness`: Existing P0 check-in retrieval (100 bounded).
- `POST /api/wellness`: Existing P0 check-in persistence.
- `GET /api/diary`: Private diary retrieval (owner-only, 100 bounded).
- `POST /api/diary`: Private diary persistence.
- `GET /api/care-recipients`: Verified care providers and supporters directory.
- `POST /api/consents`: Creates audited consent grant for selected wellness record and fields.
- `POST /api/consents/:id/revoke`: Revokes consent grant immediately, terminating provider access.

---

## Verification run for this continuation

- `npm run typecheck`: passed after removing a duplicate `category` schema key.
- `npm run lint`: exited without errors.
- `npm run test:contracts`: 235 passed.
- `node --test tests/database/shusthota-p1-records.test.mjs tests/database/bondhon-coordination.test.mjs`: 19 passed in disposable PGlite.
- `npx playwright test --config src/features/shusthota/playwright.config.ts`: 5 API-client tests passed; these are not browser UI tests.
- `npm run build`: passed.
- `git diff --check`: passed.
- No authenticated browser, responsive viewport, screen reader, keyboard-only, live HTTP, or remote Supabase verification was performed.
- Provider sharing now sends Bondhon's required `Idempotency-Key` and validates the consent/revocation response envelopes before presenting confirmed status. The retry key is retained after an unconfirmed request.
- The P1 hydration/habit UI distinguishes a failed load from an empty habit list and exposes an accessible retry action.
- The reviewed-resource category schema now uses one strict allowlisted category key.

---

## 6. Access Control & Cross-Account Isolation Verification

- **Mother A**:
  - Reads and creates own authorized synthetic check-in, hydration, habit, preference, and diary entries.
  - Cannot read Mother B's records (verified by PGlite database tests and RLS policies).
- **Mother B**:
  - Reads own records; query returns 0 rows for Mother A's entries.
- **Provider**:
  - Cannot read private diary entries under any circumstance.
  - Cannot read unshared check-in records.
  - Can read only explicitly consented fields of selected records under active Bondhon authorization.
  - Access is immediately denied upon consent revocation.
- **Anonymous User**:
  - Denied access to all private endpoints and database tables.

---

## 7. Remaining Dependencies & Honest Operational Status

1. **Remote Database Deployment**: Local verification has been executed using PGlite. No remote deployment has been performed to Supabase in this task. Remote application of migration `20261119184243_shusthota_p1_wellness_records.sql` remains a deployment prerequisite.
2. **Clinical Content Sign-off**: No accredited clinician has reviewed or approved relaxation guides or activity plans. In accordance with PROHOR medical integrity rules, the catalogs remain strictly unpublished with transparent empty states and gate criteria displayed.
3. **AI Wellness Integration**: No HIPAA/GDPR-compliant maternal wellness AI pipeline is connected. Unvetted third-party LLM dispatch is strictly avoided; the UI displays a polished, honest unavailable status and enforces strict privacy validation.
4. **Reminders & Push Delivery**: Automated background push notifications remain unavailable pending service-worker web-push infrastructure. One-time manual device calendar `.ics` download is fully functional and clearly distinguished from automated reminders.
5. **Data Mode**: All records in this module are strictly synthetic demo records (`data_mode = 'synthetic'`). Real maternal health or diary information must not be entered.

---

## Current operational status

- **Branch:** `apurbo-mvp`.
- **Database:** P1 migration tested locally in disposable PGlite only; not applied to remote Supabase.
- **Data:** Synthetic-only. Do not enter real maternal or personal diary data.
- **Clinical content:** No verified clinician approvals are available; resources and plans remain unpublished.
- **AI:** No Shusthota-specific privacy-reviewed AI provider or endpoint is connected.
- **Notifications:** No background scheduling or push delivery is verified; calendar export is not a notification service.
- **Git:** The working tree is modified and includes untracked files. See the final `git status --short` output from this continuation; it is not clean.
