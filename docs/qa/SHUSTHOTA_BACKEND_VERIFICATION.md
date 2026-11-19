# Shusthota backend verification — 2026-11-19 (Omor)

Status: **Limited — approved for frontend integration.** No new APIs. Use `/api/wellness` and `/api/diary` as they are.

## 1. Deployment (verified on Supabase project `xwpdchegbizuswhtqtgc`)
- Migration `20261118020000_private_records` is applied. It creates `wellness_entries` and `wellness_diary_entries`.
- `20261118050000_care_account_roles` is applied. It changes both policies to `owner_user_id = auth.uid() AND mvp_private_is_mother()`. That check needs an approved mother membership and a confirmed, non-anonymous email.
- RLS is enabled and forced. `anon` has no grants. `authenticated` has SELECT, plus INSERT on these columns only: wellness `occurred_at, mood, energy, activity_note, rest_note`; diary `text, occurred_at`.

## 2. RLS test with the existing test accounts
I impersonated each account in a transaction and rolled it back. No rows remain.

| Check | Result |
|---|---|
| Mother A reads own wellness / diary | 1 / 1 (her rows) |
| Mother A inserts wellness and diary | ok |
| Mother A inserts with `owner_user_id` = Mother B | denied (42501) |
| Mother A UPDATE / DELETE | denied (42501) |
| Mother A sets `data_mode = 'real'` | denied (42501) |
| Mother B reads (A's rows exist) | 0 / 0 |
| Provider reads / inserts diary | 0 / denied |
| Anonymous reads | denied |

I did **not** test through HTTP with browser sessions. Apurbo: please sign in as Mother A and Mother B and check `/app/shusthota` once.

## 3. `data_mode = 'synthetic'`: intentional
All 8 private-record tables use the same constraint. The server always sets `data_mode = 'synthetic'`, and clients cannot write that column. For the hackathon demo this is correct. **Do not enter real mother data.** The UI must label diary and check-ins as a demo with synthetic data. To store real data we would need a new migration, a privacy and retention review, and delete/export support. That is future work.

## 4. Contract alignment (done)
In `src/lib/contracts/current-api.ts`, the GET 200 schemas now match the route `select` lists exactly. They are strict, and each response is capped at 100 rows, newest first:
- `GET /api/wellness` → `{ entries: [{ id, occurred_at, created_at, mood, energy, activity_note, rest_note }] }`
- `GET /api/diary` → `{ entries: [{ id, text, privacy: "owner_only", occurred_at, created_at }] }`
- POST request bodies are **camelCase**: `{ occurredAt, mood, energy, activityNote, restNote }` and `{ text, occurredAt }`. POST returns `201 { saved: true, id }`.
- Errors come back as `{ message }` with status 400 / 401 / 403 / 503. Same-origin POST is required.

Note the case difference: GET rows are snake_case and POST bodies are camelCase. Map them in the frontend. Do not change the route.

## 5. Approved for integration: yes, as **Limited**

## 6. Missing fields: stay Limited for the MVP (no schema change)
- Fatigue → use `energy` (`low / medium / high / prefer_not_to_say`).
- Structured activity category → free text `activity_note` (max 1000 characters).
- Structured sleep → free text `rest_note` (max 1000 characters).

The UI must not claim tracking, trends or scoring that these fields do not support.

## Known limits (tell users honestly)
- Entries cannot be edited or deleted, including diary entries. They are append-only by design.
- At most 100 recent entries are returned. There is no pagination.
- Diary entries are never shared with providers or AI. This is enforced by RLS and by the consent scopes.
