# BONDHON — Consent-controlled care coordination (design + build spec)

Design canvas: https://claude.ai/artifact/NNDnLtVpuNQSaRfSTXJUE2 (8 boards: Home, Request flow, Status, Access, Activity, States, Desktop, Provider queue)

## 1. Concept

Signature: the **bond ring** (mother at centre, each recipient a node, a dashed locked node for diary/chat/files) + the **request cord** (5 stages, each lit only by server evidence). The mother always sees who can see what, until when, and what has actually happened.

## 2. Principles

1. Nothing shared by default. Empty state = "nothing shared".
2. Field-level, time-limited, revocable. No open-ended grants.
3. Honest status: submitted is not delivered; delivered is not acknowledged; timeout = "unconfirmed", reconcile before retry.
4. Simulated provider is labelled everywhere (banner + chips). No real clinician is claimed.
5. No verdicts, no advice. 16px+ body, 44px+ targets, icon+word statuses.

## 3. Workflow (mother)

Home -> New request (5 steps: message, recipient, records, duration, review+confirm) -> Done (submitted) -> Status (tracker) -> Close or revoke. Access tab: grants, revoke (honest consequences dialog), supporter switches. Activity: audit.
Send button stays disabled until `reviewConfirmed`. Records start unselected.

## 4. State machine (matches contracts/bondhon.ts)

submitted -> delivered | closed; delivered -> acknowledged | closed; acknowledged -> responded | closed; responded -> closed. Method: text | aac | call. providerMode: simulated.
Code: `code/bondhon-status.ts` (+test) — transitions, evidence-only tracker, `visibleFields` consent gate (revoked/expired/not-yet-started => none).

## 5. Contract mapping

| UI                    | Field                              |
| --------------------- | ---------------------------------- |
| message (<=1000)      | message                            |
| purpose chips (<=300) | purpose                            |
| contact method        | method                             |
| recipient             | recipientUserId                    |
| record picker         | grants[].record {type,id,fields[]} |
| duration              | startsAt / expiresAt               |
| review checkbox       | reviewConfirmed: true              |
| revoke                | revokedAt                          |

Endpoints/exact routes: confirm with Omor; I did not verify them against the repo.

## 6. Components vs repo

Reuse/extend: `CareRequestStarter.tsx`, `BondhonScreen.tsx`, `/provider` page. New: BondRing, RequestTracker, GrantCard, ScopePicker, RevokeDialog. (Names are proposals; not checked against current file contents.)

## 7. PR plan

1. Samin: Home + Request flow + Status UI. 2. Omor: grants/revoke/idempotency/409 handling. 3. Samin: Access + Activity + States. 4. Joint: provider queue (simulated) + QA.

## 8. QA / negative acceptance

- Persisted submission never shows "delivered/acknowledged".
- Timeout shows "unconfirmed"; retry is idempotent (no duplicate).
- Revoked/expired grant: provider detail shows no fields.
- Diary, chat, raw files never appear in any scope.
- Provider needs role + assignment + current consent.
- 409 reloads and re-asks review. Session expiry hides shared data.
- Keyboard-only, 200% zoom, screen-reader names for switches and dialogs.

## 9. Bangla copy

All Bangla is a draft. Needs native speaker + clinician review before demo. Key strings: "এখনও নয়", "জানা যায়নি", "শেয়ার বন্ধ করবেন?".

## 10. Status

Working design: yes. Supporter permissions and audit are P1. Real provider integration: future. Audit retention (90 days) is a placeholder.
