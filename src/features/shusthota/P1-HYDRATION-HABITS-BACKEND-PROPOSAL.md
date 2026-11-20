# P1 Hydration and Daily Habits — backend proposal

Status: proposal only. No hydration or habit records are currently supported by the approved Shusthota API or wellness schema. The existing `/api/wellness` route accepts only mood, energy, activityNote, and restNote. Do not map water or habits into those unrelated fields.

## Proposed data model

Use separate owner-scoped resources so these records do not become diary text or ambiguous wellness notes:

- `hydration_entries`: `id`, server-derived `owner_user_id`, `amount_ml` (positive bounded integer), `occurred_at`, server `created_at`, and the existing synthetic provenance field while the environment remains synthetic-only.
- `wellness_habits`: `id`, server-derived `owner_user_id`, mother-authored `label` (bounded, non-empty), `created_at`, optional `archived_at`, and synthetic provenance. No prescribed/default clinical habits.
- `wellness_habit_entries`: `id`, server-derived `owner_user_id`, `habit_id`, `occurred_at`, server `created_at`, and synthetic provenance. A record means the mother chose to record the habit; absence means “not recorded,” never failure.

## Required access and validation

- Require a confirmed, approved Mother session on every route; derive ownership from the server session, never the body.
- RLS must enforce owner and Mother membership for reads/inserts. Deny anonymous/provider access and UPDATE/DELETE unless separately reviewed and approved.
- Validate amount bounds and timestamps server-side. Validate habit labels and ensure referenced habits belong to the same owner. Keep all records synthetic-only until privacy/retention and real-data readiness are separately approved.
- Keep diary excluded from these APIs, AI context, and provider projections. Do not add Bondhon scopes implicitly.
- GET history should be newest-first and bounded (100 entries unless product/backend owner approves otherwise); disclose the bound and lack of pagination.

## Proposed endpoints

- `GET/POST /api/hydration`: GET `{entries:[{id,amount_ml,occurred_at,created_at}]}`; POST camelCase `{amountMl,occurredAt}`; success `{saved:true,id}`.
- `GET/POST /api/wellness-habits`: GET `{habits:[{id,label,created_at}]}`; POST `{label}`; success `{saved:true,id}`.
- `GET/POST /api/wellness-habit-entries`: GET `{entries:[{id,habit_id,occurred_at,created_at}]}`; POST `{habitId,occurredAt}`; success `{saved:true,id}`.

All endpoints need current same-origin, no-store, documented 400/401/403/503 behavior, exact shared schemas, route registry entries, tests, and approved migrations/RLS before frontend persistence is enabled. Omor must review endpoint naming, ownership, retention, delete/archive policy, record caps, and whether user-defined habits are allowed.

## Reminders

No Shusthota reminder or push scheduling implementation was found. Do not present reminders as active. A future reminder requires explicit user preference storage, permission UX, service-worker push support, a trusted delivery/scheduling service, timezone/DST handling, opt-out/deletion behavior, and delivery/failure tests.

## Implementation status (20 November 2026)

The proposal has been implemented in source as limited, synthetic-only functionality:

- `GET/POST /api/hydration` stores bounded millilitre entries and reads today's Asia/Dhaka entries or up to 100 recent entries.
- `GET/POST /api/wellness-habits` creates user-defined habits and reads up to 100 active habits.
- `GET/POST /api/wellness-habits/:id/events` records completion, undo and archive events; all are append-only.
- `GET /api/wellness-habit-events` returns a bounded, owner-only event projection for the combined history timeline.
- `GET/POST /api/wellness/activity-preferences` stores optional self-selected preferences, separate from `activityNote`.
- `supabase/migrations/20261119184243_shusthota_p1_wellness_records.sql` adds owner-scoped RLS, synthetic-only checks and insert/read-only grants.
- The Shusthota UI calls the feature API client and waits for server confirmation; no browser storage is used.

The migration and owner-isolation rules pass disposable PGlite tests. This is not proof of live deployment. Live Supabase deployment, Mother A/B HTTP verification and full frontend integration testing remain unverified. Do not enter real health information. Reviewed resources, provider sharing for new P1 record types, AI summaries, activity plans and reminders remain unavailable unless their separate approval and backend dependencies are met.
