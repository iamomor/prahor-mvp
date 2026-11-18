# PROHOR — Day 2 assignments and Day 3 integration gate

Prepared 17 November 2026 for the Day 2 milestone; this is not a new calendar
deadline or a claim that Day 3 is ready. Coordinator: Omor. Final 14 November
ownership supplied by Omor takes precedence over historical role labels.

Canonical payloads/statuses: [API contracts](../architecture/api-contracts.md).
Approval record: [team contracts](../architecture/team-contracts.md).
Verification evidence: [Step 14](../qa/DAY2_CODE_REVIEW.md#step-14-contract-verification-historical-evidence),
[Day 2 review](../qa/DAY2_CODE_REVIEW.md), [Auth](../AUTHENTICATION.md),
[preferences](../API_PREFERENCES.md), [local RLS guide](../../supabase/RLS_TESTING.md).
This document assigns work and collects evidence; it does not approve future APIs.

## Evidence and Git baseline

- Current checkout: `omor`, HEAD `f9a2957`. Substantial platform work is uncommitted;
  do not switch, reset, rebase or merge this dirty checkout to inspect teammates.
- Actual local branches: `apurbo`, `develop`, `iftee`, `ifty`, `main`, `omor`, `samin`.
  Read-only `git ls-remote --heads origin` confirmed these remote member branches
  plus `main`, but **no remote develop**. No branches/refs were changed here.
- Remote tips matched existing local `origin/*` refs at inspection. The table below
  records discoverable committed artifacts, not tested teammate deliveries.
- `gh pr list --state all --limit 15 --json number,title,state,headRefName,baseRefName,url`
  was blocked by missing GitHub CLI authentication. Open PRs, checks, protection
  settings, reviewers and current PR targets are **Not Verified**. Local history
  contains merged PR #7 (Omor) and #6/#4/#3 (Apurbo); that proves historical merges,
  not current readiness or approval of this working tree.
- Unpushed work and work outside these refs are **Not Verified** for every member.
  Missing checkout files do not mean a teammate has done no work.

| Remote branch / tip | Available evidence | What remains Not Verified |
| --- | --- | --- |
| `apurbo` / `f5670c9` | Adapt hook/components, read-aloud, module route files and accessibility tests appear in tree/diff | Keyboard behavior, account preference sync, tests and readiness on an integrated checkout |
| `iftee` / `ba21ec4` | Barta education/corpus/retrieval-related files, source register/evaluation docs, tests, changed chat route and added audio route | Actual grounded answers, source approval, safety/privacy, test results and current wire compatibility |
| `ifty` / `d530dcd` | `/app/health` route and pregnancy-tracker action/service/schema/component files in branch tree | Functional maternal/baby persistence, RLS, same-owner linkage, tests and integration |
| `samin` / `3bfda49` | Commit exists; tip changes `next-env.d.ts`; local main has care form starter | Current wellness/facility deliverables and any unpushed work; do not infer completeness from tip message |
| `omor` / `07e8d83` | Earlier platform update; local HEAD includes its historical merge | Current uncommitted Auth/RLS/preferences work has no verified remote PR delivery |

Important integration collisions discovered from filenames, not a UI audit:
Apurbo's branch has `src/app/(mother)/app/page.tsx`, which would compete with the
current `src/app/app/page.tsx` for `/app`; Omor + Apurbo must retain one protected
route. Apurbo's diff also includes protected `AGENTS.md`, root layout and shared
preferences files: require scoped owner review, not blanket merge approval.
Iftee's branch changes `src/lib/contracts/barta.ts` and `/api/ai/chat` and adds
`/api/ai/barta-audio`; reconcile those with the current catalog before adoption.
The Step 14 catalog describes this checkout, not all unmerged branch routes.

## Exact Day 2 assignments

Statuses describe evidence, not performance ratings. **Verified** means the named
artifact/check was observed; **Blocked** names a demonstrated prerequisite;
**Not Verified** means demonstration/runtime evidence is unavailable.

| Developer | Assigned tasks | Owned files/modules (existing or intended boundary) | Required API endpoints | Dependencies | Acceptance criteria | Verified progress status | Blockers | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Apurbo | Complete welcome/dashboard/navigation; connect Adapt account loading/saving through the existing adapter; preserve unsaved inputs and independent settings | Existing marketing/shared UI/accessibility; `src/features/adapt/` UI; protect Omor's `api/` and `server/` subfolders; coordinate `/app` route | `GET /api/me`, `GET /api/preferences`, `PATCH /api/preferences` | Omor's Auth/profile/RLS; local Supabase; reviewed local/account reconciliation | Change settings, confirm saved timestamp, refresh/sign-out/sign-in and reload; demonstrate keyboard navigation, focus/error announcement and 409 recovery without losing drafts | Verified branch artifacts and local adapter; integrated runtime **Not Verified** | Account sync not connected in current panel; route collision; local backend unavailable | Review branch against platform, agree one protected dashboard, wire adapter and supply keyboard/persistence evidence |
| Iftee | Curate approved Bangla education sources; implement bounded retrieval/answers or honest abstention; provide citation and failure evidence | `src/features/barta/`, source/evaluation docs; Bujhi extraction boundary; coordinate shared Barta schema and AI route with Omor | Current `POST /api/ai/chat` is Mock; future full request/response **Needs Team Approval** | Reviewed source/version register, retrieval engine, secret handling, Omor's transport review | Demonstrate an answer supported by genuine retrieved citations OR explicit insufficient-evidence abstention; include source withdrawal/error cases; no unvalidated clinical advice | Verified remote implementation/test artifacts; grounded runtime and source approval **Not Verified** | Branch/current contract divergence; source/content approvals and evaluations unverified | Present branch demo + exact response samples; review schema/route/audio additions with Omor before integration |
| Ifty | Pregnancy profile, maternal observations/history, distinct linked baby records; Bujhi review boundary stays separate | Existing branch pregnancy-tracker files; intended `src/features/jibonrekha/` and Bujhi review; reuse branch code before moving files | Planned `GET/POST /api/pregnancies`, `POST /api/babies`, `GET/POST /api/health`; optional conditions/notes only after review | Omor's approved health subset/migrations/RLS; shared units/destinations; Apurbo's protected shell | Save/reload synthetic maternal and baby records where backend exists; no cross-subject/owner leakage; otherwise clearly show blocked persistence with a typed fixture demo | Verified branch file inventory; functional save/reload and linked baby flow **Not Verified** | Current GET health is Mock; clinical tables absent; branch implementation compatibility unverified | Review actual tracker contract with Omor; supply separate mother/baby fixtures and negative test plan |
| Samin | Optional wellness form/history, structured help-request review/failure states, explicitly sample/sourced facility directory; prepare provider UI integration | `src/features/shusthota/`, `poth/`, `bondhon/`, `shonket/` UI boundaries; existing care starter | Planned `GET/POST /api/wellness`, `GET /api/facilities`; Mock `POST /api/care-requests`; planned provider actions/listing below | Omor's wellness/consent/assignment backend; actual sourced directory facts; Apurbo shared shell | Forms preserve drafts and validate; mock/sample data labeled; help failure says Not sent; no invented facility, slot or acknowledgement | Verified local care starter returns Not sent; other current deliveries **Not Verified** | Wellness/directory APIs absent; queue/consent backend absent; member runtime evidence unavailable | Provide branch/PR and fixture demo; agree care submission/queue contract with Omor |
| Omor | Complete local verification/delivery of Auth, own profiles, two-table migrations, RLS, account preferences and contracts; coordinate reviews and integration gates | `src/lib/auth`, `src/lib/supabase`, shared contracts, auth/API routes, Adapt server/client adapter, `supabase/`, platform tests/docs | Auth actions, `/api/me`, preferences, legacy identity gates; proposed private domain backend only through separately reviewed scope | Local Supabase + synthetic accounts; owner contract approval; remote integration branch/protection setup | Register/confirm/sign-in/refresh/sign-out; own profile/preferences survive; Ayesha/Nusrat isolation, no role escalation, provider denied blanket access | Source/structural checks and local build Verified; live session success/RLS **Blocked** | Missing local Auth/RLS configuration; no remote develop; PR access unavailable | Set up isolated test evidence, resolve branch/contract collisions, then publish reviewable platform PR when authorized |

No new clinical tables or endpoints are authorized by this coordination task.
If the backend prerequisite is absent, show labeled fixtures and the blocker;
do not call the end-to-end acceptance criterion passed.

## API handoff by member

Import schemas/types from `src/lib/contracts/`. `current-api.ts` describes current
wire behavior; `api.ts` exposes `ProposedApi*` separately. No second validators
tree or copied DTOs. Full fields/statuses/DB ownership are in the canonical API
document; the summaries below do not supersede it.

Common implemented v1 success: `{data,requestId,contractVersion:"1"}`. Safe error:
`{error:{code,message,fieldErrors?:[{path,message}]},requestId}`; never expose SQL,
tokens, clinical input or stack traces. Planned success/errors reuse this envelope
only after owner approval. UUIDs and offset ISO timestamps are shared validators.
Verified server identity determines ownership; no submitted user/role is trusted.

| Consumer / exact methods | Status and request validation | Success / failure contract | Auth/RLS / schema reference |
| --- | --- | --- | --- |
| All; especially Apurbo + Omor: `GET /api/me` | Implemented; no body/target-user selection | 200 v1 `{id,displayName,role}`; 401/404/500 safe errors | Confirmed `getUser()` + own profile through RLS; `platform.ts`, `transport.ts` |
| Apurbo + Omor: `GET /api/preferences`, `PATCH /api/preferences` | Implemented; GET no body; PATCH nonempty strict partial Adapt object <=8 KiB; configured Origin; optional exact `If-Match` | 200 full ten-field `data` plus `schemaVersion:2,updatedAt`, request metadata and ETag; absent row GET returns defaults/null; GET 401/403/500, PATCH additionally 400/409 | Own profile/settings; invoker RPC/RLS only; `adapt.ts`; use `loadAccountPreferences` / `saveAccountPreferences` in `src/features/adapt/api/client.ts` |
| Iftee: `POST /api/ai/chat` | Current Mock strict `{question}` trimmed 1–1200; unknown keys rejected | 400/501 `{message,status:"not_connected"}`; no answer | Public stub; no private context; `current-api.ts` derives fields from `barta.ts` |
| Iftee + Omor: future `POST /api/ai/chat` | **Needs Team Approval**: `question,language:bn/en,retention` (default ephemeral; saved mode requires confirmation and conversation ID/null) | Proposed 200 grounded with citations/limitations OR abstained with null answer/empty citations/reason; 501/503 unavailable paths per canonical document | Public ephemeral; authenticated owner for saved mode; `barta.ts`; review branch schema/audio additions rather than silently changing callers |
| Ifty + Omor: `GET/POST /api/pregnancies`, `POST /api/babies` | Planned: pregnancy dates nullable + label; baby nullable pregnancy UUID + label + nullable birth date; list uses proposed pagination | Proposed 200 owned page / 201 record; common 400/401/403/404/409/500/503 policy; rate-limit 429 reserved | Mother owner + same-owner parent checks; `health.ts`, `common.ts`; backend absent |
| Ifty + Omor: `GET /api/health`, `POST /api/health` | GET currently Mock; proposed GET subject/parent filters and POST `destination,measurement,observedAt,sourceNote` **Needs Team Approval** | Current GET 401/503 `{message}` or valid session 501; proposed 200 page / 201 observation | Current only checks Auth, no records; future mother ownership and separate baby destination; decimal-string units/provenance in `health.ts`; no clinician claims |
| Samin + Omor: `GET/POST /api/wellness` | Planned; POST `occurredAt,mood,energy,activityNote,restNote`; nullable voluntary fields but at least one non-null | Proposed 200 page / 201 check-in; common safe errors | Owner only; `wellness.ts`; diary remains separate, excluded from sharing |
| Samin: `GET /api/facilities` | Planned; reviewed `q`/district filters + pagination | Proposed 200 sourced `Facility` page; safe validation/dependency errors; booking not integrated | Public published facts only; `poth.ts`; fixture data clearly sample, no invented real facility facts |
| Samin + Omor: `POST /api/care-requests` | Current Mock strict `{message:1..1000,method:text/aac/call}` | Current 400/501 `{message,status:"not_sent"}` | Public stub with no delivery/storage; `current-api.ts` |
| Samin + Omor: future `POST /api/care-requests` | **Needs Team Approval**: `recipientUserId,message,method,purpose,consentGrantIds,reviewConfirmed:true` | Proposed 201 persisted `SupportRequest`; safe validation/auth/not-found/conflict/dependency errors; submission is not acknowledgement | Mother owner; approved assigned recipient, current purpose-matched consent; `bondhon.ts`, `sharing.ts` |
| Samin + Omor: `GET /api/provider/requests`, `POST /api/provider/requests/:id/acknowledge`, `POST /api/provider/requests/:id/respond`, `POST /api/care-requests/:id/close` | Planned/**Needs Team Approval**: list pagination; UUID path; actions `expectedRevision`, respond adds message | Proposed 200 restricted page/request; 400/401/403/404/409/500/503; state/evidence checks required | Trusted approved provider + assignment + fresh consent; close also mother; `bondhon.ts`; never arbitrary status PATCH |
| Omor: `POST /api/consents`, `POST /api/consents/:id/revoke` | Planned/**Needs Team Approval**: exact record/field scope, recipient, purpose, finite start/expiry, review confirmation; revoke UUID/no body | Proposed 201 grant / 200 `{id,revokedAt}`; safe common errors | Owner only, no self/foreign grants; `bondhon.ts` + `sharing.ts`; diary/chat/raw reports excluded |

For Apurbo/Omor, the exact ten account settings are `theme,highContrast,textScale,
spaciousLayout,reducedMotion,simplifiedContent,communication,language,textSpacing,
readAloud`. PATCH example: `{"textScale":"large","highContrast":true}`. Preserve
unspecified fields; reload/review a 409 rather than silent retry. Homepage-only
font and compact-density preferences remain local until an approved extension.

Do not use `/api/profile`, `/api/health/observations`, `/api/ai/education`,
`/api/documents/extract` or `/api/access-preferences` as callable aliases. Preserve
implemented names; report naming and full payload adoption remain owner reviews.
Legacy `GET /api/auth/me` and `GET /api/auth/provider` return `{profile}` / `{code}`,
not v1; the latter returns only the provider's own profile, never a patient queue.

## Copy-ready individual handoffs (prepared, not sent)

### Omor — branch `omor`

Today: finish local Auth/profile/preferences and two-account RLS evidence; coordinate
the canonical contract reviews and protected `/app` route. Dependencies: local
Supabase/synthetic accounts, the verified two-worker build configuration, owner reviews and remote
integration workflow. Use [API contracts](../architecture/api-contracts.md),
[Auth](../AUTHENTICATION.md) and [RLS](../../supabase/RLS_TESTING.md). Demonstrate
mother registration/confirmation, sign-in/refresh/sign-out, own profile/settings,
Nusrat denied Ayesha's records and self-promotion rejected. Before Day 3: record
actual results, clear critical collisions and publish reviewable platform changes.
Work on existing `omor`; PR into `develop` after its remote/protection blocker is
resolved. Do not bypass with a direct `main` PR or expose credentials.

### Apurbo — branch `apurbo`

Today: finish welcome/dashboard/navigation and connect Adapt using Omor's existing
load/save adapter. Dependencies: local Auth/preferences backend and agreement with
Omor on the competing `/app` files. Use [current profile/preferences contracts](../architecture/api-contracts.md)
and [persistence guide](../API_PREFERENCES.md); keep local/account reconciliation
explicit. Demonstrate keyboard navigation and settings saved/reloaded after refresh
and a new session, including failed/conflicting saves without draft loss. Before
Day 3: supply integrated persistence/keyboard evidence and resolve route/shared-file
conflicts. Use existing `apurbo`; PR to `develop` once available remotely; request
Omor review for shared platform/protected-file changes.

### Iftee — branch `iftee`

Today: present the Barta branch's retrieval/answer work with source register,
genuine citations or explicit abstention, plus error/safety evidence. Dependencies:
approved versioned sources and Omor review of shared schema/chat/audio changes.
Use [Barta canonical contract](../architecture/api-contracts.md); the checkout's
question-only 501 wire contract remains current until coordinated adoption.
Demonstrate one supported Bangla education response OR insufficient-evidence
abstention with no fabricated citation; label fixture-only content honestly.
Before Day 3: provide reproducible evaluations and owner-reviewed response samples.
Use existing `iftee`; PR to `develop` after Omor resolves its remote availability;
do not independently rename shared APIs or commit model credentials.

### Ifty — branch `ifty`

Today: review existing tracker code and prepare pregnancy/history, maternal
observations and separate linked baby flow against [health contracts](../architecture/api-contracts.md).
Dependencies: Omor's approved table/RLS/API subset and Apurbo's protected shell.
Demonstrate synthetic mother/baby records staying separate; save/reload only when
the real backend exists, otherwise show the typed fixture path and blocked
persistence. Include a foreign-parent/owner rejection case. Before Day 3: supply
the schema comparison, fixture demo, API gaps and executable negative test plan.
Use existing `ifty`; PR to `develop` once available; coordinate shared schema and
migration changes with Omor rather than adding an independent database structure.

### Samin — branch `samin`

Today: deliver optional wellness/history, reviewed structured help-request form
and clearly sample/sourced directory; document the provider UI dependencies.
Dependencies: shared UI, Omor's wellness/consent/assignment backend and reviewed
facility sources. Use [wellness/Poth/Bondhon contracts](../architecture/api-contracts.md).
Demonstrate valid/invalid forms, preserved drafts, labeled sample data and honest
Not sent behavior; provider acknowledgement requires a real authorized action,
never a simulated success presented as delivery. Before Day 3: provide branch/PR,
fixture evidence and agreed care/queue payloads. Use existing `samin`; PR to
`develop` after its blocker is cleared; request Omor backend/security review.

All five PRs should identify commit SHA, routes, current versus fixture behavior,
dependencies, relevant tests and known failures, with affected-owner review.
Resolve shared contracts before merging; release only `develop` -> `main` through
the agreed review process. Existing branch names are used; no branch rename is
requested. The actual remote protection/CI settings remain Not Verified.

## Day 2 readiness checklist

| Gate | Result | Evidence required to close |
| --- | --- | --- |
| Apurbo UI/navigation/account preferences | Not Verified | Integrated keyboard, focus and persistence demo; branch artifacts alone are insufficient |
| Iftee grounded Barta or explicit abstention | Not Verified | Reproduce branch tests, response/source mapping and approved source status |
| Ifty mother/baby save/reload | Blocked | Health backend/tables/RLS absent in this checkout; branch runtime not verified |
| Samin wellness/help/facility flow | Not Verified | Current branch demo with labeled fixtures, form/failure checks and dependency list |
| Omor Auth/RLS/preferences success path | Blocked | Local Supabase plus synthetic sessions; Step 14 live preflight reports missing configuration |
| Shared checkout API structure/compatibility | Verified (structural only) | 102 contract tests passed in Step 14/recheck; eight exported operations catalogued; unmerged branch compatibility remains Not Verified |
| Full build/release artifact | Verified local build; release Not Verified | Latest review capped generation at two workers; production build completed (22 static pages, exit 0). No deployment/remote CI sign-off |
| Named member branches | Verified | Local refs plus read-only remote heads inspection |
| Remote integration branch/PR targets/protections | Blocked / Not Verified | Omor arranges remote `develop` through approved workflow; authenticated PR/protection review still required |
| No committed secrets or real patient data | Not Verified (full audit) | Only `.env.example` tracked among `.env*` paths; `.env.local` ignored. This limited check does not audit history, every branch or all medical fixtures |
| Actual owner contract sign-offs | Not Verified | Real reviewer/date/version/evidence entries in team-contracts approval log |

No tests were rerun for this documentation-only step; cited test/build outcomes
are the existing recorded Step 14 evidence. File references and relative links
in these new/updated handoff documents are checked locally. No teammate was
contacted, PR/issue created, code merged, production migration run or service changed.

## Day 3 integration chain and owners

**Overall: Blocked for the complete journey.** Independently reviewed fixture
demos can proceed, but they do not constitute a working end-to-end care workflow.

| Journey stage | Owner(s) | Dependency / integration gate |
| --- | --- | --- |
| Mother signs in | Omor + Apurbo | Local Auth/confirmation/cookies, own profile and protected shell; actual-session evidence missing |
| Saves maternal/baby information | Ifty + Omor | Approved separate record schema, parent ownership, forward migration/API subset and RLS tests; currently absent |
| Records wellness | Samin + Omor | Optional validated check-in persistence and owner history; private diary excluded; API absent |
| Asks Barta | Iftee + Apurbo; Omor transport | Branch integration, source approval, grounded/abstention evaluations, agreed wire format; current checkout remains 501 |
| Reviews and submits support request | Samin UI + Omor backend | Recipient/purpose/scopes review, finite consent, assignment, atomic persistence/audit and truthful delivery evidence; currently Not sent |
| Authorized simulated provider acknowledges | Omor authorization/backend + Samin UI | Trusted provider, assignment, fresh consent, delivered-state evidence and explicit revision-checked action; provider gate currently shares no records |

Omor's three priorities, in order:

1. Establish isolated local Supabase and synthetic accounts; execute Auth/RLS and
   preference persistence tests; retain the verified two-worker build configuration.
   Keep production untouched and record failures as well as passes.
2. Restore the agreed integration workflow: arrange remote `develop`/protection
   with repository authorization, inspect current PRs, preserve the dirty platform
   work, and coordinate `/app`, shared preferences and Barta schema/route conflicts.
3. Hold owner contract reviews and freeze a minimal Day 3 dependency sequence.
   Record approval before scheduling new health/wellness/consent/request backend
   implementation; accept labeled fixture demos while those dependencies are absent.
