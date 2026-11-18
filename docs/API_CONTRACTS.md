# API contracts entry point

Canonical integration reference: [architecture/api-contracts.md](architecture/api-contracts.md) (Step 14).
It includes the complete current/planned route tables, owners, inputs, response/error
shapes, authorization, DB ownership, naming conflicts and pending owner decisions.
Related: [data model](architecture/data-model.md), [security](architecture/security.md),
[team review](architecture/team-contracts.md), [code map](CODE_MAP.md).

| Existing route            | Current behavior (Mock status is explicit in the canonical table)                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `POST /api/ai/chat`       | Limited public education: strict question/language/retention/context; legacy question-only compatibility; 200 cited answer/abstention/clarification, 400/501/503 errors; no saved transcript |
| `POST /api/ai/barta-audio` | Optional signed-text or fixed-guide speech; binary WAV/MP3 success, JSON errors; requires server speech configuration |
| `POST /api/care-requests` | Strict `{message,method}` validation; 400 for invalid/unknown fields, otherwise 501; always `not_sent` |
| `GET /api/health`         | 503 when unavailable/unconfigured, 401 without valid auth, otherwise 501; no record persistence        |
| `GET /api/me`             | Step 12: own `{id,displayName,role}` in the v1 envelope; 200/401/404/500, private/no-store; [details](API_ME.md) |
| `GET/PATCH /api/preferences` | Step 13: own complete Adapt v2 settings; atomic partial updates and conditional ETags, private/no-store; [details](API_PREFERENCES.md) |

All outcomes above use `Cache-Control: no-store`. The starter POST handlers reuse shared domain validators while retaining their existing callers' smaller payloads. `/api/me` implements the v1 envelope; the other starter routes retain their existing responses and backend limitations.

The two legacy identity GETs are documented as compatibility routes in the canonical
reference; their existing wire shapes remain unchanged. Other domain operations
remain proposals. Shared validators live in `src/lib/contracts/`; do not create a
competing validator tree. `current-api.ts` and `CurrentApiRequest/CurrentApiResponse`
describe actual route behavior; `ProposedApiRequest/ProposedApiResponse` describe
future adoption payloads. The combined aliases prefer current wire types where
the same path has both a stub and a future domain proposal.

No type declaration proves RLS, clinical grounding, consent or delivery. Review
evidence: [Day 2 code review](qa/DAY2_CODE_REVIEW.md) and
[Step 14 verification](qa/DAY2_CODE_REVIEW.md#step-14-contract-verification-historical-evidence).
