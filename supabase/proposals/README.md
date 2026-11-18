# Unapproved schema proposals

Files here are **not** in the Supabase migration chain. Do not copy them into a
project SQL editor or migrations directory merely because local tests pass.

`20261118_private_records.sql` is the synthetic append-only self-report candidate
`private-records-v1`. Review its [boundaries and limitations](../../docs/architecture/OMOR_MVP_BOUNDARIES.md)
with Omor, Ifty and Samin after inspecting the actual foundation/history. It does
not provide care delivery, corrections, deduplication or reviewed OCR commits.

The only supplied execution is an isolated, disposable embedded PostgreSQL test:

```powershell
npm.cmd run test:db:private-proposal
```

That command never reads `.env.local`, accepts a DB URL, connects to Supabase or
applies a migration. Actual schema promotion requires a reviewed forward migration,
fresh-chain/RLS/session tests and recorded approval. Never reset shared data.

The `care-backend-v1` candidate loads `20261118_care_backend.sql` and then
`20261118_care_operations.sql` after the private-record proposal. It creates ten
private-schema resources and narrow authenticated RPCs for exact consent, queue
receipts, assignment, status/actions/revoke, audit and retry receipts. It does not
establish hosted persistence. The HTTP adapter is now routed locally; the legacy
form is still a non-sending prototype and SQL remains unapplied. Run:

```powershell
npm.cmd run test:db:care-proposal
npm.cmd run test:contracts -- tests/contracts/care.spec.ts tests/contracts/care-sql.spec.ts
```

These are embedded SQL/injected-identity tests. Read
[the care review package](../../docs/architecture/CARE_BACKEND_REVIEW.md) before any
promotion. New care SQL is deliberately excluded from a foundation-only CLI push.
