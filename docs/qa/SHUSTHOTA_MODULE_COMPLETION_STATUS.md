# Shusthota Module Completion Status

Updated 20 November 2026. Module Owner: Apurbo.
Records repository source status and local verification only. Does not claim remote production database deployment or live clinical certification.

## 1. Feature Status Matrix

| Feature                  | UI      | API            | Database              | RLS      | Tests    | Status                                                                       |
| ------------------------ | ------- | -------------- | --------------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| P0 wellness check-in     | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Synthetic-only)                                                     |
| Private diary            | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Synthetic-only, Owner-only)                                         |
| Hydration                | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Synthetic-only, 1–5000ml, 100 bounded)                              |
| Daily Habits             | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Personal habits, Undo, Archive, 100 bounded)                        |
| Activity Preferences     | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Allowlist, No disability inference)                                 |
| Enhanced History         | Working | Working        | Applied (local)       | Enforced | Verified | Limited (Combined timeline, No diary, Date/Category filters)                 |
| Reviewed Resources       | Working | Working        | Schema-ready          | N/A      | Verified | Limited (Strict approval gate, Empty catalog pending clinical sign-off)      |
| Provider Sharing         | Working | Working        | Applied (Bondhon RPC) | Enforced | Verified | Limited (Field selection, Live preview, Explicit consent, Audit, Revocation) |
| AI Wellness Summary      | Working | Boundary-ready | N/A (Isolated)        | N/A      | Verified | Unavailable (Polished honest state, No unreviewed AI dispatch)               |
| Clinician-approved Plans | Working | Working        | Schema-ready          | N/A      | Verified | Limited (Strict approval gate, Empty catalog pending clinical sign-off)      |
| Reminders                | Working | N/A            | N/A                   | N/A      | Verified | Limited (.ics export working; background push unavailable)                   |

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

## 5. Tests Executed & Results

1. `npm run typecheck`: Passed with 0 errors (`tsc --noEmit`).
2. `npm run lint`: Passed with 0 errors and 0 warnings (`eslint .`).
3. `npm run test:contracts`: 235 tests passed in 31.1s (including 6 Shusthota P1 contract tests).
4. `node --test tests/database/shusthota-p1-records.test.mjs`: 4 tests passed in PGlite:
    - Hydration defaults owner & synthetic provenance; isolates owners; rejects invalid values and duplicate retries.
    - Habit events enforce same-owner references, append-only operations, and mother role.
    - Activity preferences are optional, synthetic snapshots with constrained values.
    - Anonymous users cannot read private P1 records and every table forces RLS.
5. `npx playwright test --config src/features/shusthota/playwright.config.ts`: 5 tests passed (snake_case/camelCase validation, no-store headers, status-aware error handling).
6. `node --test tests/database/bondhon-coordination.test.mjs`: 15 tests passed in PGlite (verifying provider coordination, consent scopes, diary exclusion, and revocation).
7. `npm run build`: Production Next.js build passed with 0 errors (all dynamic routes compiled cleanly).
8. `git diff --check`: Passed with 0 whitespace or formatting issues.

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

## 8. Current Branch & Git Status

- **Branch**: `apurbo-mvp` (unchanged)
- **Status**: Clean working tree with all new files and modifications tracked; no commits or pushes performed.
