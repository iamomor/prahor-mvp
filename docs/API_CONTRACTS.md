# API handoff contracts — Proposed; not implemented yet

All authenticated endpoints: `Cache-Control: no-store`, strict Zod validation, server-side session verification (`getUser()` / `getClaims()`), RLS, no raw private logs, explicit success/failed statuses, no AI secrets in client.

| Endpoint | Owner | Request | Success | Starter state |
|---|---|---|---|---|
| `POST /api/ai/chat` | Ifty | `{question:string}` | `{answer, sources:[{title,url,excerptId}], grounded:boolean, status}` | **501 not connected**, validates input |
| `GET/POST /api/health` | Apubo+Omor | authenticated record schema, source | `{records}` / `{record}` | **501 after auth**, GET only |
| `GET/POST /api/wellness` | Samin+Omor | typed optional logs | authenticated data | not implemented |
| `POST /api/reports/extract` | Ifty+Apubo | supported synthetic file, authenticated | unverified fields | not implemented |
| `GET /api/facilities` | Samin | search query | sourced facilities with verification state | not implemented |
| `POST /api/care-requests` | Omor+Samin | `{message, method}` then scoped consent | `{id, deliveryStatus}` | **501 not sent**, validates input |
| `GET /api/provider/requests` | Omor | provider session | assigned authorized requests only | not implemented |

### Clinical provenance
`self_reported` / `document_extracted` / `clinician_entered` / `clinician_confirmed` with actor, timestamp, original source where supported. No self-entered item auto-labels itself confirmed. Baby record is separate from mother record.

### Care request status contract
`draft` → `submitted` (server created) → `delivered` (recipient delivery verified) → `acknowledged` (provider acknowledged) → `responded`. Distinguish request saved/queued/sent. Never show `delivered` without actual evidence. In Day 1 starter, **all requests stay `not_sent`**.

### Critical negative cases
Unauthenticated private GET must be 401, unauthorized cross-user access 403/404, AI without sources abstains, mistaken OCR cannot auto-write clinical records, provider has no access without approved membership.
