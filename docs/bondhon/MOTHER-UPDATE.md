# Bondhon mother workflow update — 19 November 2026

This update integrates the supplied BONDHON_SPEC.md and status helpers into the existing Bondhon implementation. It uses the existing contracts, semantic design tokens, English/Bangla setting, AAC composer, optional browser read-aloud, and cookie-bound care APIs.

## Included

- Five steps: message, recipient, records/access needs, duration/replies, review/approval. Back retains the current tab's draft. Review approval remains unchecked until the mother acts.
- Optional editable English/Bangla starting phrases for routine pregnancy visits, postnatal care, feeding questions and communication/access arrangements. These are request text, not clinical advice or generated provider responses.
- A text-labelled five-stage request tracker using the existing authenticated events endpoint and saved request snapshot. Unrecorded intermediate stages are not invented. Early closure does not imply a response. Queue delivery is distinguished from provider acknowledgement.
- A request-scoped bond-ring sharing overview and explicit exclusion of diary, AI conversations and raw files. It makes no claim about all historical permissions on the account.
- Exact record permissions show start/end and current state. The field helper requires exact recipient + record type + record ID + active request. Actual provider fields still come only from server-authorized projections.
- Native revoke/close confirmation dialogs support Escape, a safe initial focus and restoration to the trigger.
- Provider detail is hidden on the next one-second display tick after receipt expiry. Backgrounding clears provider detail and events; delayed mutation results cannot repopulate a hidden provider screen. Database authorization remains authoritative.
- Changed revisions invalidate follow-up approval. Submission conflicts return the mother to editing, refresh available options, retain text and require a fresh review. Ambiguous network/5xx submission outcomes retain the same immutable payload/key for retry.
- Record selection uses record type and ID together, avoiding accidental cross-record selection when tables contain the same UUID.

## Compatibility and scope decisions

Compatibility revision: the merged main branch already has RequestTracker.tsx used by Shonket with status/updatedAt props. This update adds BondhonRequestTracker.tsx and preserves that existing tracker and every Shonket caller byte-for-byte. It does not replace their prop contract.

No API routes, contract schemas, SQL migrations, dependencies, authentication files, global tokens or other modules are changed. The existing coordination migration remains 20261119050000_bondhon_coordination.sql and requires Omor's hosted activation.

The supplied spec says that persisted submission alone is not delivery. The existing backend can atomically persist both a request and a simulated queue receipt. A returned delivered status is retained only as server evidence; it is not downgraded to submitted or promoted to acknowledged by the UI.

The supplied standalone helper reported submitted for an empty history and merged fields across grants without record/recipient scoping. Both behaviors are corrected. Its new focused tests replace the standalone test assumptions.

The spec's startsAt/expiresAt grant vocabulary is mapped to the existing coordination approval, whose request expiry is explicit and whose field grants are created atomically by the server. No incompatible request body is introduced.

Existing account-level supporter features are not expanded into Bondhon proxy authority. No new supporter-access switch is added. The proposed 90-day audit retention is not applied: this is a placeholder requiring a reviewed retention decision. Clinical advice, real staffed providers, notifications, clinic accessibility guarantees, cloud drafts and raw-file sharing remain outside this update.

The linked external design canvas was not used as implementation evidence. The supplied written spec and the actual repository contracts determine this integration.

## Installation

1. Stop localhost in its terminal with Ctrl+C. Keep the working checkout on your own member branch.
2. Extract PROHOR-Bondhon-Mother-Update.zip.
3. From the project root run the included Apply-Bondhon-Mother.cjs --check, then run it without --check. The installer validates every existing target before any mutation and backs up originals beside the checkout. A conflicting teammate edit causes a safe stop. Do not force installation over conflicts.
4. Run node scripts/bondhon-check-mother-update.mjs. It runs route type generation, typecheck, lint, helper tests, existing HTTP contracts and production build. Stop the dev server throughout validation to avoid mixed .next/dev/types and .next/types.
5. If stale generated route types persist, remove only .next and tsconfig.tsbuildinfo, then rerun the update checker.
6. Start the production preview with node node_modules/next/dist/bin/next start -p 3017. Set NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3017 and use that exact origin. Changing build-time public configuration requires rebuilding.
7. Follow the existing IMPLEMENTATION.md hosted migration and account-approval instructions. Use /bondhon, /app/bondhon and /provider/bondhon.

No .env files or credentials are included. A successful installation does not solve missing Supabase configuration or account errors. The previous auth-unavailable screen remains a separate configuration/identity check. Run the existing npm.cmd run check:auth-config and send only its redacted diagnostics.

## Verification and release gate

Executed here: seven focused Node tests passed; all changed TypeScript/TSX parsed; installer initial/repeated/conflict checks passed under LF/CRLF fixtures. The new check runner's stop-on-failure behavior is tested with a disposable fixture.

Full dependencies could not be installed here: registry download returned HTTP 403 for zod-validation-error. Typecheck, repository lint, current HTTP/database suites, production build, browser interaction and assistive-technology tests for THIS update are not claimed as passed. The user's previous 43 passing database tests and build exit 0 apply to the preceding checkout.

Before release test the five-step form in English/Bangla, keyboard forward/back, no preselected record/reply/approval, expiry, recipient changes, 409 re-review, exact same-payload retry, provider acknowledgement/reply/revoke/closure, cross-account isolation, 320px width, 200% text, contrast and screen-reader reading order. Use synthetic accounts/records. Record pass/fail and the actual deployed commit.
