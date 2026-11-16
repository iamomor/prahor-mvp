# API contracts entry point

Canonical proposal: [architecture/api-contracts.md](architecture/api-contracts.md). Related: [data model](architecture/data-model.md), [security](architecture/security.md), [team review](architecture/team-contracts.md), [code map](CODE_MAP.md).

| Implemented route         | Current behavior                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `POST /api/ai/chat`       | Strict `{question}` validation; 400 for invalid/unknown fields, otherwise 501 `not_connected`          |
| `POST /api/care-requests` | Strict `{message,method}` validation; 400 for invalid/unknown fields, otherwise 501; always `not_sent` |
| `GET /api/health`         | 503 when unavailable/unconfigured, 401 without valid auth, otherwise 501; no record persistence        |

All outcomes above use `Cache-Control: no-store`. The starter POST handlers reuse shared domain validators while retaining their existing callers' smaller payloads. The larger proposed v1 response envelope and backend workflows are not implemented.

Other operations remain proposals in the canonical document. Shared validators live in `src/lib/contracts/`; database ownership/RLS, clinical grounding and provider delivery require separate implementation and verification. Do not maintain another competing endpoint definition here. Review evidence: [qa/CODE_REVIEW.md](qa/CODE_REVIEW.md).
