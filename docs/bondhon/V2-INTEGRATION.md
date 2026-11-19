# Bondhon v2 integration and acceptance

Prepared 19 November 2026. Scope: the supplied Bondhon v2 patch, runbook and 14-page design PDF, integrated with the existing consent-controlled care system. This is a simulated-provider hackathon interface, not a staffed clinical service.

## Mother's journey

1. Review request-based sharing: one card per recipient, each distinct purpose and expiry shown separately, with a time ring and a text equivalent.
2. Start a five-step request: needs/message, approved recipient, access accommodations, exact information/time, explicit review/approval.
3. Add supported basic-record packs only by choice, or select individual fields. Packs exclude symptoms, conditions and wellness entries. No records or review checkbox are preselected. More than 20 selected records is rejected with a visible message.
4. Read the exact review, including recipient, purpose, message, fields, permission actions, accommodations and expiry. Diary, AI conversation and raw-file scopes remain absent.
5. Follow server evidence in the progress tracker, inspect scoped messages, recent action history and a printable demo receipt.
6. Stop a specific request, one recipient's listed requests, or all loaded active requests. Each result is confirmed independently. Unknown outcomes remain unknown and can be retried with the original key.
7. Share again carries over only recipient/purpose/settings. It starts with an empty message and empty record selection and requires new approval.

## Compatibility

Mobile compatibility revision: the current team stylesheet adds minmax(0, 1fr) to workspace/panel/field grids, constrains field widths, and wraps long Bangla/English controls at 320px. Those exact protections are retained alongside the v2 desktop layouts.

- Existing route names, DTOs, SQL migrations, RLS, actor/assignment checks and cookie-bound API clients are preserved.
- `/provider` now embeds the same queue used by `/provider/bondhon`. Desktop uses a queue/detail layout, with a focused detail view on small screens.
- The existing Shonket `RequestTracker.tsx` and its status/updatedAt callers are untouched. Bondhon uses `BondhonRequestTracker.tsx`.
- Existing Shonket initialMessage, initialMethod and onDraftChange handoff props are retained on CareRequestForm.
- Global authentication screens, theme tokens, environment files, Barta and unrelated modules are not part of this package.
- The obsolete BondRing and ProviderQueue modules are removed only when the installer verifies their exact expected baseline. An additional caller outside the supplied patch must be integrated before deletion.

## Corrections made beyond the supplied draft

- Incomplete or loading request pages cannot claim all sharing is empty. Legacy, scheduled and unknown permissions explicitly require review. Load-more is available for mothers as well as providers. Refresh revalidates the number of pages already loaded.
- Cards and rings group by recipient; multiple requests to one person do not inflate the people count. A ring indicates the next ending permission, not the end of all that person's access.
- Disappearing from a paginated active list is never treated as revocation success. Batch results use validated per-request withdrawal/closure evidence. A lost mutation reply is reconciled by reading that exact request. An inaccessible result stays unknown.
- Batch writes are deduplicated and limited to four in flight. Retries preserve one key per request. A closed request is distinguished from a newly stopped permission.
- Invalid clocks, invalid windows and not-yet-started approvals do not appear active. Client expiry alone is not proof that a stop operation succeeded.
- Delivery means the simulated queue has a receipt. It does not prove that the provider has or has not opened/read it. Acknowledgement remains a separate server action.
- Simulated accounts can be operated by demo users. The interface does not falsely promise that no real person can view approved data.
- Reply permission grants no additional record fields. The UI does not claim it can semantically prevent a provider from typing a request for information.
- Unconfirmed submission cannot be discarded through the local Back control. Keep the immutable payload and retry key until reconciliation. Browser navigation remains possible and the existing leave-page warning is retained.
- The existing Shonket draft listener is held through a ref so a parent callback changing identity does not cause repeated draft writes.
- Record selection is keyed by record type and UUID. Privacy-sensitive record types remain opt-in, outside quick packs.
- Timeline grouping respects a maximum 60-second span and receipt version. Read checks are described as access/fetch evidence, not proof of attention. The 100-row server history cap is disclosed.
- A separate print root removes the rest of the app from print layout. Printed/read-aloud receipts include the request, recipient identity, scope and permission dates; they are labelled demo records.
- Native dialogs retain safe initial focus, Escape handling and return focus. Radio choices retain normal keyboard navigation. Essential status chips use 1rem text, existing theme tokens and visible focus.

## Installation and ownership

Use an up-to-date member branch. The package installer checks every affected file before any mutation, backs up originals, and stops on unexpected content. It accepts the exact supplied main baseline or the supplied v2 draft when upgrading. It preserves unrelated local changes. Never force the patch over a compatibility failure.

No new database migration or AI key is needed. Omor's existing hosted Bondhon activation and approved synthetic accounts remain prerequisites for authenticated acceptance. The runbook's proposed audit query filtering, server-supplied clock and richer information-request workflow remain backend proposals, not shipped functionality. No retention period or legal consent claim is introduced.

## Checks and evidence

Executed in this workspace:

- 29 Node regression tests passed, including lifecycle, date localization, private scope isolation, request-list completeness, duplicate recipients, unknown/partial stop results, lost-response reconciliation, preserved retry keys and bounded writes.
- Babel parsed all integrated Bondhon TypeScript/TSX and the provider entry point.
- CSS module class references resolve. A full CSS/compiler/browser check remains part of local acceptance.
- The existing repository's 18 baseline theme contrast checks passed. This is not a whole-screen contrast assessment.
- Installer validation covers initial apply, repeat apply, Windows line endings, upgrade from the original v2 draft, deletion backups and conflict preservation.
- Final patch validates against the recovered supplied baseline.

Blocked/unverified:

`npm ci` was attempted and failed with HTTP 403 downloading zod-validation-error. Full repository TypeScript, ESLint, HTTP/database suites, Next production build, actual React browser rendering, print-dialog behavior, axe, screen readers and live Supabase sessions have not been verified for THIS update. Prior passing checks apply to the previous release. No bug-free or accessibility certification claim is made.

## Windows verification

Stop localhost before validation to avoid mixed generated dev/production route types. Run:

    node scripts/bondhon-v2-check.mjs

Then run the production build directly, separately from the checker (this machine previously returned -1 from spawned builds):

    node --trace-uncaught --trace-exit .\node_modules\next\dist\bin\next build --webpack 2>&1 | Tee-Object -FilePath "$env:TEMP\bondhon-v2-build.log"
    Write-Host "Build exit code: $LASTEXITCODE"

Only exit code 0 establishes a passing build. The trace-exit warning itself is not a build failure.

## Signed-in acceptance checklist

Record pass/fail, tested account roles, device, commit and deployment URL.

- [ ] No requests: complete load before empty-state wording. Unknown/legacy permissions remain reviewable.
- [ ] More than 20 requests: older active sharing is reachable and never mistaken for stopped access.
- [ ] Two requests to the same recipient: one person card, separate scopes/windows; stopping one leaves the other visibly active.
- [ ] Five-step keyboard journey in English/Bangla; AAC/text work without voice. Back retains choices. Final review stays unchecked.
- [ ] Quick packs add only named record fields and can be removed. Individual field selection and 20-record limit work.
- [ ] Expiry windows and Asia/Dhaka dates are clear; changed fields require fresh review. The maximum window has a documented 10-minute clock-skew guard with an exact displayed end time.
- [ ] Timeout preserves original payload/key and blocks draft discard; identical retry creates no duplicate. A 409 requires fresh review.
- [ ] Mixed batch failures identify each request as stopped, closed, active/unconfirmed or unknown. No blanket success.
- [ ] Provider role/assignment/permissions are checked server-side; expired/revoked request data is hidden. Background/return and session expiry are tested.
- [ ] View-only permission blocks replies; approved follow-up stays scoped. No additional data is exposed by a message.
- [ ] History explains its cap and refresh counts. Acknowledgement is never inferred from a read.
- [ ] Receipt prints only its own content and restores the page afterward; read-aloud stays optional.
- [ ] 320/390/768/1440px, 200% text, forced colors, contrast themes, reduced motion, keyboard, NVDA/VoiceOver where available.
- [ ] Mother A, Mother B, assigned provider and unrelated provider complete live isolation/revocation checks.
- [ ] Vercel Ready commit matches the reviewed code; public settings use the correct site origin. No env files or credentials are committed.

Bangla copy is draft pending native-speaker review. Medical/clinical claims are not added by this UI update.


## Scroll and reflow correction — 19 November 2026

The sharing hero previously used sticky positioning and a fixed three-row grid span. Its rows depended on the number of active request cards, so a tall summary could scroll over the full-width privacy notice, especially with no confirmed active requests. The hero and a separate sharing-content column now occupy one ordinary grid row, with the privacy notice below both. Dynamic cards, stop outcomes and notices stay within the content column. No sticky summary, fixed card height, clipping workaround or overlay is used.

The provider queue now stays in page flow rather than creating a nested sticky scroll area. Long text, recipient choices, purpose pills, receipt values and timeline content wrap within their column. Icons do not shrink into adjacent text. The SVG viewBox has top clearance for the upper recipient node. Authentication, API contracts, retry behavior, sharing permissions and SQL are unchanged by this correction.

Validation of this revision: 29 focused view/status tests pass; all 13 Bondhon TS/TSX sources parse; referenced CSS classes exist; git diff whitespace checks pass; installer LF/CRLF/draft fixtures pass. These checks do not replace TypeScript, lint or an application build. A system Chromium launch was attempted for static layout fixtures, but the environment denied its process-singleton socket; no browser-rendering pass is claimed.

Before committing, run the existing v2 checker and direct production build on Windows. Then check the signed-in mother home with zero, one and several active requests; notices and expanded earlier requests; scroll from top to bottom at desktop and 320px width and enlarged text. Verify the privacy notice always follows the taller of the two columns. Check all five form steps, receipt/print preview, keyboard focus and cancellation dialogs, and provider queue/detail/back navigation. Use only synthetic account data. Live consent/revocation and account-role acceptance remain required against the hosted database.
