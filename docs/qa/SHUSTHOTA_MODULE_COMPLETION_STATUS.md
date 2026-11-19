# Shusthota implementation status

Updated 20 November 2026. This records repository source status only. It does not establish that a database migration is deployed or that production behavior is verified.

## Implemented source in this branch

| Capability | Status | Notes |
| --- | --- | --- |
| P0 wellness and private diary | Limited | Existing `/api/wellness` and `/api/diary` continue to use separate request schemas and owner-only synthetic records. Diary remains absent from Barta/AI and provider projections. |
| Hydration | Limited | `/api/hydration` supports 1–5000 ml values, today's Asia/Dhaka entries, and at most 100 newest history entries. No target or intake recommendation is set. |
| Daily habits | Limited | Personal labels/symbols, completion, append-only undo and archive events. Up to 100 active habits are returned. Event history is capped at 100 per habit. |
| Activity preferences | Limited | Optional allowlisted self-selected preferences are stored separately from the free-text `activityNote`. No disability inference or exercise prescriptions. |
| Wellness history | Limited | One date- and category-filtered timeline combines supported P0 wellness, hydration, habit events and activity-preference records. Weekly and 30-day presets are available. Neutral item counts only; each source remains capped at 100 with no pagination. Diary is excluded. |
| Bondhon wellness sharing | Limited | Existing Bondhon can share explicitly selected supported P0 wellness fields following consent. Hydration, habit and activity-preference records are not included in provider projections. Diary remains excluded. |
| Reviewed resources | Unavailable | Review metadata schemas exist in `src/features/shusthota/reviewed-content.ts`; there are no approved resources to publish. |
| AI wellness summary | Unavailable | No privacy-reviewed AI integration. An isolated typed provider interface excludes diary text; no generated or calculated output is presented as AI. |
| Clinician-approved activity plans | Unavailable | Approval metadata schema exists, but no verified reviewer workflow or approved plans are present. |
| Reminders | Unavailable | No background scheduling or push delivery infrastructure is present; no active reminder toggle is shown. |

## P1 schema and API

Forward migration: `supabase/migrations/20261119184243_shusthota_p1_wellness_records.sql`.

New routes:

- `GET/POST /api/hydration`
- `GET/POST /api/wellness-habits`
- `GET/POST /api/wellness-habits/:id/events`
- `GET /api/wellness-habit-events`
- `GET/POST /api/wellness/activity-preferences`

The migration uses Mother-gated, owner-only RLS; synthetic-only checks; read/insert grants; append-only rows; retry-key uniqueness; composite same-owner references; and no hard delete. History reads are bounded. The migration was tested in disposable PGlite and was not applied to remote Supabase.

All stored Shusthota records remain synthetic-only. Do not enter real maternal or personal diary data. These changes do not make the product production-ready for real health records.

## Verification completed

- `npm run typecheck`
- `npm run lint`
- `npm run test:contracts` — 225 tests
- `node --test tests/database/shusthota-p1-records.test.mjs` — 4 tests in disposable PGlite
- `npx playwright test --config src/features/shusthota/playwright.config.ts` — 5 API-client tests
- `git diff --check`

No live HTTP, remote database, browser viewport, screen-reader or manual keyboard verification is claimed in this report.
