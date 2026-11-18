# PROHOR — Step 7 team handoff and review record

Prepared 16 November 2026. Status: **draft ready for review**; no teammate approval or clinical/security certification is implied. Omor owns architecture/integration. This task authorizes the initial shared contract proposal; future changes follow owner review. [Data model](data-model.md) · [API contracts](api-contracts.md) · [Security](security.md).

Local verification and untested areas are recorded in [validation.md](validation.md).

## Ownership history and confirmed current assignment

The older repository instructions and the latest, user-confirmed 14 November 2026 team handbook use different assignments. The current team mapping below supersedes the former mapping for task ownership; the historical columns remain as an audit crosswalk. This **does not** count as API/schema approval, change branch names automatically, or authorize editing protected `AGENTS.md` / `DESIGN.md`.

| Domain | Historical `AGENTS.md` / handoff owner | Current confirmed owner | Contract reviewers (approval pending) |
| --- | --- | --- | --- |
| Platform, Auth, migrations, RLS, audit, API integration | Omor | Omor | Domain owners and Samin for negative-path QA |
| Adapt / preference contract | Iftee | Apurbo | Existing owner Iftee + Omor |
| Barta / knowledge ingestion | Ifty | Iftee | Existing owner Ifty + Omor |
| Bujhi extraction | Ifty | Iftee | Extraction owner + review-interface owner |
| Jibonrekha / Bujhi verification | Apubo | Ifty | Existing owner Apubo + Omor |
| Shusthota / Poth | Samin | Samin | Omor for data/privacy integration |
| Shonket / Bondhon UI | Samin; Omor backend | Samin; Omor backend | Omor + Samin |

**Confirmed mapping from current handbook:** Omor = platform/backend; Apurbo = frontend/Adapt; Iftee = Barta/RAG + Bujhi extraction; Ifty = Jibonrekha/mother-and-baby records + Bujhi review; Samin = wellness, care-navigation and Shonket/Bondhon UI. “Apubo” appears only as a historical roster/branch spelling. Existing branch names can remain unless the team changes them through a coordinated Git operation. **Pending:** API/data contract approvals, actual teammate reviews and any protected-repository instruction updates.

## Day 1 contracts each owner supplies

| Proposed owner | Concrete handoff to Omor | Review evidence needed |
| --- | --- | --- |
| Apurbo — Adapt | Confirm v1 field compatibility, proposed `textSpacing/readAloud`, defaults, account/local conflict resolution, storage-version migration | Preference schema review; combined preferences never affect authorization; proposed additions clearly not shipped |
| Iftee — Barta | Approved-source manifest with publisher/URL/version/locale/review metadata; actual retrieval/citation structure; abstention/error and synthetic evaluation cases | No fabricated citations; explicit retention defaults; approval/withdrawal tests |
| Iftee — Bujhi extraction | One approved synthetic `prohor-synthetic-lab-v1` text-PDF fixture, field dictionary, engine/version, raw strings, uncertainty and locator mapping | Actual supported bytes/size/template and failure examples; no universal OCR claim |
| Ifty — Jibonrekha/Bujhi review | Pregnancy/baby ownership structure, supported observations/units, provenance, full field review/correction/rejection and destination behavior | Two synthetic mothers plus separate baby identities; no real names/PHI or invented clinician confirmation |
| Samin — Shusthota/Poth | Optional check-in fields, owner-only diary boundary; sourced directory field/verification proposal; self-recorded visit preparation | Diary inaccessible to sharing; unverified accessibility and booking state honest |
| Samin + Omor — Shonket/Bondhon | Structured request inputs, reviewed message/recipient/scopes, assigned-provider queue and real status evidence | Explicit simulated mode, Not sent failure, no auto-acknowledgement, current consent/revocation checks |
| Omor — platform | Reviewed schema subset, versioned API names and DTOs, role model, migration/SQL grant/RLS/Storage ownership, locked writes and audit, adoption plan | Two-owner/provider negative-test matrix; migration plan and shared contracts reviewed before staging |

Source clinical content, actual synthetic report fixtures, source evaluation outcomes and teammate signatures are still required; Step 7 does not manufacture them. Automated test fixtures added here use obviously synthetic UUIDs and nonmedical source placeholders exclusively for structural validation. They are not an approved care dataset or a clinical source manifest.

## Proposed decisions and approval log

| Decision | Proposed result | Status / reviewer |
| --- | --- | --- |
| All eight module coverage | Full logical catalog with shared identities/requests/consent | Draft; all owners |
| First implementation subset | Foundation, then consent + simulated handoff; gated P1/P2 | Draft; Omor + all owners |
| Mother/baby separation | Distinct observation tables and explicit subject destinations; composite ownership FKs | Draft; health/review owner + Omor |
| Provenance | Self-report, mother-verified extraction and separately authorized clinician states | Draft; health + AI owners |
| Preference sync | Versioned settings reusing v1; explicit conflict resolution; independent theme/contrast | Draft; Adapt + Omor |
| AI privacy | Ephemeral default; retained chats opt-in, no provider sharing | Draft; Barta + Omor |
| Report format | One synthetic text PDF <=5 MiB; raw output separate from immutable review | Draft; extraction + verification owners |
| Request naming | `support_requests` SQL; keep `/api/care-requests` wire route | Draft; Omor + Samin |
| Sharing | Exact record/field grants + expiry + current assignment, no diary/chat/raw file scope | Draft; Omor + affected owners |
| Security dependencies | Promote consent/audit/request response to P0; normalized request/grant join and mutation receipts | Draft; Omor + Samin |
| Provider payload | Defined restricted request/queue/event DTOs and per-resource field/provenance projections | Draft; Omor + Samin |
| Retention/deletion | No chat retention by default; explicit approved schedules needed for stored reports/audit/receipts/backups | Pending policy; Omor |
| Owner names/assignments | Current mapping from 14 Nov 2026 handbook recorded; protected repository instructions may need a separately reviewed update | Confirmed mapping; repository alignment still to check |

Approval format: reviewer, date, affected version/files, decision (`accepted / changes requested / deferred`), and evidence/PR reference. Only actual reviewers fill approvals; do not precheck agreement. Omor coordinates final decision, then freezes shared names for integration. Breaking schema/API changes require an updated decision record and affected-owner review in the same PR.

## Step 7 deliverable status

- [x] Inspected the actual starter schema, local preferences, routes, existing handoff and product references.
- [x] Written full logical module/table coverage and a proposed secure MVP sequence.
- [x] Written `docs/architecture/data-model.md` and `docs/architecture/api-contracts.md`.
- [x] Added first shared strict Zod/TypeScript contracts and structural boundary tests.
- [x] Recorded provenance, maternal/baby separation, private diary, consent/provider and Storage requirements before migration work.
- [x] Recorded current/proposed API differences and forward-migration adoption requirements.
- [ ] Module owners review fields, fixtures and MVP subset; role mapping is confirmed by current handbook, but individual contract sign-offs remain pending.
- [ ] Owners approve source content, supported report fixture and clinical review process.
- [ ] Omor approves and implements forward migrations, grants/RLS and private Storage in isolated synthetic staging.
- [ ] Database, server integration, delivery/revocation/concurrency and deletion tests pass with recorded evidence.

The checked items describe produced artifacts, not team agreement or deployed healthcare functionality. Day 2 begins only the approved implementation subset. Keep existing member branch/review workflow and PR into `develop`; no direct release or database changes are authorized by a draft architecture document.
