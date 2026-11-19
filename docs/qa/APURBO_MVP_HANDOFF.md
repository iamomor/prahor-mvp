# Apurbo MVP Functional QA Handoff

## A. Baseline and evidence rules

- Audited branch: `apurbo-mvp`; baseline/local HEAD: `a6eb847`.
- This is the inspected local snapshot, not necessarily the latest remote `develop`; no fetch/pull was done for this task.
- Source inspection establishes what code and tests say, not that those tests pass or a hosted service works.
- A test result applies only to its tested branch/commit state. The targeted result below was reported as passing, but its exact execution commit SHA was not independently confirmed; it was not rerun during documentation work.

## B. Apurbo responsibility

Workflow V3 assigns Apurbo functional regression, synthetic fixtures, acceptance matrix and documentation. Iftee owns Adapt/accessibility, shared UI/navigation, speech, Barta UI and the Bujhi extraction engine. Ifty owns Jibonrekha and health domain work plus Bujhi review/commit UI and approved adapters. Samin owns wellness/diary, Shonket/Poth and care/provider UI; Omor owns auth, schema/RLS, care/consent/provider backend and platform integration. Apurbo records functional/accessibility findings for the relevant owner and does not take over their implementation.

## C. Completed QA work

Added `tests/mvp-functional/care-request-contract.spec.ts` with six API cases against the **current public starter** contract from `src/lib/contracts/current-api.ts`:

1. Valid `text`, `aac`, and `call` requests independently assert HTTP 501 and the exact full body `{"message":"Not sent. Human-care delivery is not configured in this starter.","status":"not_sent"}`.
2. Empty message, message longer than 1,000 characters, and invalid method independently assert HTTP 400 and exact body `{"message":"Check the request fields. No message was sent.","status":"not_sent"}`.

Execution evidence reported for this file: `npx playwright test tests/mvp-functional/care-request-contract.spec.ts` — **6 passed (15.6s), 1 worker**. Its exact execution commit SHA was not independently confirmed. This is not a full-suite result. Do not interpret 501/`not_sent` as successful delivery. The planned authenticated schema in `src/lib/contracts/bondhon.ts` is not the starter endpoint contract; its adoption is marked planned/needs review in `docs/architecture/api-contracts.md`.

## D. Eight-module status

See [APURBO_FUNCTIONAL_MATRIX.md](APURBO_FUNCTIONAL_MATRIX.md) for routes, behavior, test scope, ownership and wait gates. Summary: Adapt/Barta/Poth are limited; Jibonrekha and Bujhi have local/demo flows but no verified account-backed writes; Shonket and Shusthota flows are absent; Bondhon is an honest not-sent stub. No module is called fully accepted based only on route/component presence.

## E. Cross-module QA scenarios

| Scenario | Current evidence and testability | Blocker / owner | Acceptance evidence needed before Apurbo adds/runs the dependent test |
|---|---|---|---|
| Mother A/B private-record isolation | Jibonrekha/Bujhi use local demo storage; **not testable as server isolation now**. | Ifty domain integration + Omor auth/RLS/API. | Two synthetic authenticated accounts, approved subject DTO, persisted read/write and foreign-owner denial responses. |
| Provider P/Q unauthorized denial | `/api/auth/provider` only gates provider identity; no assigned request queue. **Blocked.** | Omor authorization/assignment; Samin provider UI. | Two provider identities, assigned/unassigned fixture setup and exact approved denial response. |
| Diary exclusion from sharing | No diary implementation or sharing projection. **Blocked.** | Samin diary; Omor sharing contract. | Persisted owner-only diary fixture and a care-share contract proving diary is excluded. |
| Revoked/expired consent | Local demo consent exists, but no server enforcement proven. **Blocked.** | Omor consent implementation; Samin integration. | Approved expiry/revoke rules and persisted grant state, with expected access denial after revoke/expiry. |
| Network/unavailable errors | Barta/Poth expose some failure responses; Bondhon UI catches network failure and displays an unavailable message. This is not explicit timeout/retry acceptance. | Test only existing error paths. | Source-backed response/UI assertion for each path; no delivery claim. |
| Explicit timeout/retry | **Pending**. The Bondhon `not_sent` response does not prove timeout or retry support; no approved care retry behavior is established. | Omor care integration and approved contract. | Approved timeout uncertainty, request/replay semantics and implementation/tests demonstrating persisted outcome reconciliation. |
| Report review/edit/retry/destination | Local synthetic tests cover review and demo destination/dedup behavior. **Local only.** | Iftee extraction interface, Ifty review adapter, Omor commit backend. | Frozen extraction DTO, approved field mapping, authenticated commit/reload, failure retry and duplicate replay evidence. |
| Duplicate submissions | Local demo record/report tests exist; no server care/report idempotency. **Server case blocked.** | Omor write contract/backend; Ifty report integration. | Approved idempotency key or equivalent and server response for a replay, tested against persisted state. |
| Truthful request/provider status | Current starter `not_sent` is testable; no actual request ID/queue/delivery/acknowledgement. | Omor care backend; Samin workflow UI. | Persisted request ID, assignment, explicit provider action and mother-visible status backed by verified state transition. |

## F. NOW / WAIT / BLOCKED

**NOW**

- Maintain isolated synthetic tests for behavior already represented by approved current contracts, such as the care starter's exact valid/invalid responses.
- Add source-backed tests for truthful negative/error states only when they are not already covered.
- Record evidence, tested commit SHA when known (otherwise mark it unconfirmed), environment and explicit limitations in QA docs.
- **Gate 0 / Gate 1 preparation:** preserve the audited baseline and prepare fixtures/checklists for authentication, own-data and role checks; execute those acceptance checks only when Omor provides the confirmed environment and accounts.

**WAIT**

- **Gate 1:** preference/private-data acceptance waits for confirmed Auth, own-data/role setup and Omor's test environment/accounts; Jibonrekha/Bujhi account-backed journeys also need Ifty adapters and Omor's approved persistence/security contracts.
- **Gate 2:** Barta/access integration tests wait for Iftee's stable interfaces.
- **Gate 3:** the continuous mother-to-provider journey waits for the connected records/wellness, reviewed request, assignment and provider-action implementation described by V3; Samin leads E2E, Apurbo records functional evidence.
- Poth assertions about real service details until Samin's directory source/facts are reviewed.

**BLOCKED**

- Server-level two-mother isolation, provider P/Q assignment denial, persisted diary exclusion, server-enforced consent expiry/revocation, report commit/replay, care delivery, and positive provider acknowledgement until implementations and approved contracts exist.
- Explicit timeout/retry acceptance remains pending until an approved contract and implementation/tests establish timeout handling and replay behavior.

## G. Handoff questions / dependencies

1. Omor: What approved test environment and synthetic accounts should be used for hosted preference and private-record authorization acceptance?
2. Omor + Samin: When is the authenticated care/consent/provider contract frozen, including request ID, timeout reconciliation, idempotency and status transition evidence?
3. Iftee + Ifty + Omor: What stable extraction/review/commit interfaces and synthetic report fixture are approved for server-backed Bujhi acceptance?
4. Samin: Which Poth directory dataset and facility claims are reviewed for QA assertions? Current API docs describe an empty reviewed dataset and unverified nearby results.

These are dependencies only for the corresponding live/integration scenarios; they do not block isolated tests of current contracts.

## H. Evidence and limitations

- **Source inspection:** V3 PDF; API contracts; current care route, schemas, UI and tests; module routes/components/contracts/tests listed in the functional matrix.
- **Evidence boundary:** checked-in local/demo tests do not establish hosted persistence, cross-account isolation, provider authorization, real care delivery or server-enforced consent. Those require the relevant authenticated/integrated test environment and implementation evidence.
- **Executed evidence:** The six targeted care contract tests passed as reported above. This documentation task did not rerun them.
- **Not executed here:** all other tests, builds, hosted Supabase/Auth, two-account isolation, provider assignment/denial, real speech/device, clinical review and end-to-end care handoff.
- **Uncertainty:** local HEAD was verified as `a6eb847`, but remote state was intentionally not fetched. The targeted test execution SHA is unknown. The inspected route inventory found no wellness/diary handler in this snapshot; absence claims are limited to that inventory. Source inspection cannot establish live provisioning, real identities, or production delivery.
