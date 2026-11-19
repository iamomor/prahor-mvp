# Bondhon implementation and activation

Prepared 19 November 2026 for `prahor-mvp-main(3).zip` plus the current `PROHOR-Bondhon-Integration-Inputs.zip`.

Bondhon now has integrated mother and simulated-provider interfaces, request-level consent, exact field selection, optional accommodations, and a scoped communication history. The existing account, role approval, private-record, care API and semantic design-token systems are reused. This package contains local implementation. Hosted activation and full regression execution are pending.

## Entry points and user journey

- `/bondhon` explains the flow publicly. Private work starts at sign-in.
- `/app/bondhon` belongs to the signed-in mother.
- `/provider/bondhon` belongs to an approved simulated provider account.
- The existing workspace dashboard and homepage Bondhon card link to these flows.
- Poth supplies care discovery and visit preparation. Its existing emergency information remains independently reachable.

The mother selects one approved simulated recipient and enters a routine purpose. She chooses a communication preference and optional accommodations. Individual fields from her latest 100 available synthetic records can be selected. No field or follow-up permission is preselected. The preview displays the exact message, fields, purpose, accommodations, actions and absolute expiry before an unchecked approval control is presented. Approval creates field grants, the request, assignment, simulated queue receipt and request-bound permission in one database transaction.

A request without health records still needs explicit message-sharing permission and expiry. Confirmation describes persisted delivery to the simulated queue. Provider acknowledgement requires a separate authenticated action. Provider replies are written by the authorized account. No automated clinical response is generated.

The mother can view request progress, the versioned permission receipt, recorded responses and recent access/action history. She can revoke future access independently of closing a new request. New purposes, recipients or additional record categories require a new reviewed request. Expired permission has no silent renewal. For historical requests that predate request-bound receipts, withdrawing access closes the request without manufacturing an approval receipt.

## Schema and API integration

Existing request statuses remain `submitted`, `delivered`, `acknowledged`, `responded`, `closed`. The supplied roadmap's larger state vocabulary is not silently imposed on existing clients. Draft and submission-unconfirmed are client states. Consent expiry/revocation are separate from request status.

The existing `POST /api/care-requests` accepts an optional strictly validated `coordination` object. Without it the established contract and RPC remain available. With it an atomic wrapper creates selected grants and binds an expiring permission to this request. The wrapper rejects mixing prior grants with a new selection. A UUID `Idempotency-Key` is bound to the full reviewed submission. Changed replay payloads fail with a conflict. Owner-only replay remains available after expiry/revocation without restoring provider access.

| Route | Purpose |
| --- | --- |
| `GET /api/care-requests` | Bounded owner-only request history with keyset pagination |
| `GET /api/care-records` | Owner-only latest 100 selectable synthetic records, with permitted candidate fields |
| `GET /api/care-requests/:id/coordination` | Current authorized request, recent messages and owner-only grants/audit |
| `POST /api/care-requests/:id/revoke` | Idempotent withdrawal of future request access |
| `POST /api/care-requests/:id/messages` | Reviewed follow-up under the current permission and revision |
| Existing provider list/acknowledge/respond and request close routes | Preserved and connected to the new interfaces |

`prohor_care.request_permissions` stores terms version, receipt language, named request binding, expiry, view/reply choice, optional accommodations and scope references. `follow_up_messages` stores request-scoped messages and retry/revision evidence. Both tables have forced RLS and no direct client table access. Public RPCs derive the actor from the confirmed session and approved account role.

Every provider list/detail/action checks assignment, simulated provider approval, record grants and current request permission. Field filtering occurs in the existing database projection helper. Provider DTOs exclude owner IDs, consent grant objects and owner audit history. All care HTTP successes and errors are private/no-store. The existing public service-worker allowlist is retained.

## Revocation and concurrency boundary

Protected request operations lock the request before permission/grant checks. Existing record-grant locks are taken in stable UUID order, then request permission is checked after lock acquisition. Request-level revocation locks the same request before changing permission. Thus a read already authorized within its transaction may complete before revocation commits. After committed revocation a newly authorized operation denies provider access. The original provider response endpoint also enforces the reply permission at insertion.

The provider interface refreshes access every 30 seconds while visible, clears sensitive data on visibility loss, and refreshes when reopened. Read or authorization failure clears displayed provider detail. Already rendered content, screenshots, copied text and downloaded information cannot be recalled. No immediate cross-device screen-erasure promise is made. New database operations use the current permission even when a client screen has not refreshed.

Follow-up retries bind request, sender, message and original input revision. A failed transaction cannot leave a partial request or orphaned field grants. Unknown network/5xx outcomes preserve the original in-memory retry key and payload, freeze editing and expose a same-action retry. Drafts and retry state are kept in the current tab's memory, with a leave-page warning. Reloading or closing the tab loses this state. Inspect existing request history before making a replacement after losing an unconfirmed submission. Cross-device draft recovery is future work.

## Accessibility and presentation

English and Bangla use the existing Adapt language setting. Native controls, persistent labels, fieldsets, expandable record lists, meaningful headings, text status messages and visible-focus design tokens support keyboard and screen-reader navigation. Review receives focus after composition. The existing optional ReadAloudButton reads the reviewed summary and original request. Existing AAC composition supports the initial request with a 1000-character guard. All actions have a text route. Audio playback depends on available browser voices; no new external speech service or Fish audio coverage is claimed for Bondhon.

Accommodations are written communication, interpreter, step-free access, quiet setting, plain explanations and a chosen support person's presence. They are requests for assistance. They do not prove facility accessibility, reveal a diagnosis automatically or grant a companion account access. Disability and proxy authority are never inferred.

## Roadmap coverage

| Blueprint items | Status in this package |
| --- | --- |
| BON-001–009 | Implemented for selected supported record fields and request-bound view/reply permission. Export APIs, attachments and automatic renewal are absent. Receipt terms/language/time/version are recorded. |
| BON-010–011 | Existing approved simulated provider role and assignment are reused. No new coordinator/supervisor/admin clinical access is granted. |
| BON-012 | Future real-provider identity and credential verification |
| BON-013 | Future supporter/delegate account permissions. Naming a support person in an accommodation request grants no data access. |
| BON-014 | Disability never confers proxy authority. Exceptional legal authority remains outside this prototype. |
| BON-015–021 | Request composition, authorized queue, existing lifecycle, independent request permission, scoped messages and retry handling implemented. Reassignment and purpose expansion use a fresh reviewed request. |
| BON-022 | New reviewed request after closure. Reopening a previous request is future work. |
| BON-023 | Persistent simulation scope and link to existing emergency/care information |
| BON-024 | Future staffed real service |
| BON-025–027 | Native accessible flow, accommodation requests, plain review summary and optional browser read-aloud. Assistive-technology acceptance testing remains pending. |
| BON-028 | No external notification delivery or sensitive notification previews introduced |
| BON-029 | Restricted, policy-version-linked request action history. Cryptographic tamper evidence and field-by-field read tracking are future work. |
| BON-030 | Withdrawal and closure explained separately from deletion. No erasure feature or reviewed production retention schedule is claimed. |
| BON-031 | Existing authorization and record scopes extended with current request permissions |
| BON-032 | Raw attachment delivery/upload and provider offline caches are outside the tool. No new public file URL is created. |
| BON-033 | Existing authentication/account recovery and provider approval reused. Provider MFA setup is future work. |
| BON-034 | Synchronous database checks implemented. Realtime consent event subscriptions are future work. |
| BON-035 | Research-informed consent concepts only. No FHIR API/export or interoperability certification is claimed. |
| BON-036 | Local regression tests and verification runner included. In-app incident reporting is future work. |

## Activation on Windows and Vercel

1. Apply the package to the intended current checkout with `Apply-Bondhon-Update.cjs --check`, then the same command without `--check`. It validates every affected file against the supplied baseline or already-updated version, backs up originals, and aborts on conflicts.
2. Install existing locked dependencies with `npm.cmd ci` if needed. No new dependency or package-lock change is required.
3. Run `node scripts/bondhon-verify.cjs`. It runs strict typecheck, repository lint, care/Bondhon HTTP contracts, disposable PostgreSQL tests, then the production build. Resolve failures before hosted activation.
4. In the intended Supabase project, run `supabase/inspection/bondhon_readonly.sql`. Confirm the existing account/private-record/care migration chain is installed. Apply only the missing forward migrations in recorded order. The new migration is `supabase/migrations/20261119050000_bondhon_coordination.sql`. The installer does not change a hosted database. Do not reset shared tables or reapply earlier migrations blindly.
5. Retain the existing Supabase public URL/key and server auth configuration. `NEXT_PUBLIC_SITE_URL` must match the origin used for POST actions. Configure the correct local and Vercel Preview/Production values. Preview aliases on another origin need the matching approved site configuration. No OpenRouter, Fish or new AI key is needed for this coordination flow.
6. Use the existing trusted administrator provider-review procedure to approve a synthetic provider account. There is no auto-created, universally accessible demo provider.
7. Push the reviewed changes to the intended member branch using the existing team workflow. Verify the exact commit in Vercel has a Ready deployment. The supplied archive is a main-branch snapshot; this package does not decide which newer member commits should be merged or pushed.
8. On that deployment, use separate mother, named-provider and unrelated-provider sessions. Exercise approval, acknowledgement, reply, follow-up, revocation, expiry and closure. Verify the same journey with keyboard and screen reader at 320px, 200% text and Bangla/English before the demonstration.

The main snapshot is commit `6743026d58762cb63cb5ec509dcca3854f936785`. The latest user-supplied integration inputs include a redesigned signed-in shell, a dashboard with child content, new membership-revocation tests and 15 existing migrations ending at `20261119040000`. The three changed source/test files were integrated against those exact inputs. Shell additions are limited to a Bondhon nav item and dashboard link. All 15 supplied migrations are retained byte-for-byte. Bondhon now uses `20261119050000`.

The verifier includes Bujhi's existing database regression and a Bondhon regression sharing selected fields from a saved reviewed hemoglobin record. The broader current checkout was not supplied in full; unchanged payload file compatibility is checked against the existing main snapshot, and the installer stops if any of those files differ locally.

The clinic-directory database from the earlier stopped request is outside this Bondhon update.

## Verification record

- Passed syntax parsing for the latest integrated source and contracts, 315 TypeScript/TSX files, using the installed Playwright Babel parser.
- Passed installer checks on a Windows-line-ending fixture, initial apply, repeated apply, and conflict preservation.
- Passed integrated-current-checkout installer checks and application under LF and CRLF line endings, repeated checks, duplicate migration rejection and preservation of a deliberately changed local shell.
- Passed source preservation assertions for current navigation/header, dashboard children, membership-revocation test assertions and all 15 uploaded existing migrations.
- Passed six executable helper assertions covering active/expired/revoked permission behavior, field formatting and accommodation definitions.
- The new SQL suite contains 12 regression scenarios for atomic creation, exact-field projection, duplicate replay, rollback, message-only revocation, expiry, view-only permissions, scoped follow-up, pagination, field revocation and privilege denial.
- Six new contract tests cover permission state, strict scope validation, atomic adapter/receipt matching, legacy/new grant mixing, role boundaries and provider DTO privacy.
- Full typecheck, lint, PostgreSQL suites and production build have not passed in this workspace. `npm ci` was blocked by HTTP 403 package downloads. Attempts to run checks confirmed missing compiler/linter/PGlite dependencies. Syntax checks are insufficient to establish typing or database correctness.
- Browser interaction, screenshots, axe, real screen-reader/device checks, hosted Supabase migration, live sessions and Vercel deployment remain unverified.

## Research used

The supplied blueprint and roadmap guide scope and acceptance criteria. These primary references were reviewed for the implementation choices. They provide design principles and do not validate this implementation.

- HL7 FHIR R5 Consent defines recipient, purpose, action and time-scoped consent. The local data model borrows those concepts while using the existing PROHOR wire contract. https://hl7.org/fhir/R5/consent.html
- OWASP authorization guidance supports least privilege, default denial, per-request checks and authorization regression tests. https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP transaction authorization guidance informs review of significant data, server enforcement and replay handling. https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html
- W3C status-message guidance informs visible, programmatically announced loading, failure and confirmed-action feedback. https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- W3C accessible-authentication guidance supports preserving existing accessible authentication without adding cognitive puzzles or forced caregiver participation. https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- WHO digital-intervention recommendations inform the distinction between a simulated coordination tool and an accountable real-care service. https://www.who.int/publications/i/item/9789241550505
