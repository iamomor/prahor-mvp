# PROHOR backend requirements matrix

Baseline: `origin/main` at `57e9632` (20 Nov 2026). Hosted Supabase project `prahor-mvp` (`xwpdchegbizuswhtqtgc`).
Evidence IDs (`E-<step>…`) refer to the step rows in [verification.md](verification.md) §1. `E-7UI` = §2, `E-L` = §4 (local suites), `E-DB` = §5, `E-0` = account setup.

## Sources

| ID | Document | Used for |
|---|---|---|
| S1 | `# PROHOR — Complete Product, Featur.txt` (Product blueprint v1.0) | Module feature tables (§5), AI rules (§6), 24-capability map (§7), acceptance list (§14) |
| S2 | `PROHOR_PROJECT_CONTEXT_FOR_NEW_CHATS.md` | Locked decisions (§2), P0/P1/P2 per module (§3) |
| S3 | `PROHOR_Team_Roles_Project_Blueprint.md` (39 pp., six-day plan) | Day 3 slice (p. 23), routes/APIs (p. 31), data/consent (pp. 32–33), quality gates (p. 36) |
| S4 | `PROHOR_48_HOUR_MVP_TEAM_WORKFLOW_V2.md` (24 pp.) | Mandatory module minimums (p. 4), 13-step journey (p. 18), negative tests (p. 19) |
| S5 | `PROHOR_Project_Audit_3_2026-11-20.pdf` | Historical snapshot at `cc5ef1b`; used only as leads |

**Missing input:** no separate five-day plan was supplied. The earlier roadmap in S3 (six-day) and S1 (seven-day) was compared with S4 instead.

## Original plan vs revised 48-hour plan (decisions)

| Topic | S1/S3 (earlier plan) | S4 (revised) | Resolution used here |
|---|---|---|---|
| Bujhi | P1 "restricted prototype"; local review acceptable | Reviewed field must reach the authenticated record and survive refresh; local-only = incomplete | S4: server commit required (implemented: `/api/reports/commit`) |
| Poth | Sample/synthetic directory | Honestly sourced or labelled fictional; no fake booking | Current OSM-derived, labelled-unverified data kept |
| Shonket | Clinician-reviewed warning content is P0 | Public non-AI help + structured request into the same care workflow; no invented review | Backend done; clinician review is a **content dependency**, not a backend gap |
| Bondhon | Request + simulated queue P0; granular consent P1 | Reviewed scope, assigned queue, DB status, revocation, minimal audit all mandatory | S4 minimum adopted |
| Ownership | Samin owned Shusthota/Poth/Shonket/Bondhon UI | — | Samin is gone; Omor owns remaining backend work (user instruction 20 Nov) |
| Health API | `/api/health` proposed | `/api/jibonrekha` built | `/api/jibonrekha` is canonical; `/api/health` is an unused 501 stub with no callers |

Classification: **MVP** = required by S4 p. 4/18; **P1-impl** = implemented P1 whose backend must work; **Opt** = optional; **Future** = P2/out of scope.

## Shared platform

| ID | Requirement (source) | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| PLAT-01 | Email sign-in, session refresh, sign-out (S4 p. 11) | MVP | `src/app/auth/[action]/route.ts`, `src/lib/auth/handlers.ts` | Verified working | — | E-13d, E-2a |
| PLAT-02 | Sign-up + one-role onboarding (S4 p. 11) | MVP | `prohor_complete_onboarding` (`20261119000000`) | Verified working | Auth email confirmation is **off** on the project (sign-up returns a session). Acceptable for demo; noted | E-0 |
| PLAT-03 | Server-derived identity/role; no self-promotion (S4 p. 19) | MVP | `readIdentity`, `prohor_switch_workspace`, `prohor_care.actor()` | Verified working | — | E-0, E-3h |
| PLAT-04 | RLS on every private table; care schema RPC-only (S3 p. 36) | MVP | 36 tables RLS-on; `prohor_care.*` forced RLS, no policies | Verified (advisor + cross-account tests) | Advisor "SECURITY DEFINER callable" warnings are the intended RPC gateway | E-4*, E-12* |
| PLAT-05 | Exact site origin for POSTs (S4 p. 11) | MVP | `sameOriginPost`, `NEXT_PUBLIC_SITE_URL` (Vercel prod) | Verified working | — | all POST checks |
| PLAT-06 | Migration history = repo (S4 p. 12) | MVP | 18 files ↔ 18 applied | Verified | Versions of two migrations re-aligned to filenames | E-DB |
| PLAT-07 | Idempotent retries (S4 p. 19) | MVP | `Idempotency-Key` / `retryKey` everywhere | Verified (pregnancy, hydration, care request, Bujhi) | — | E-3b, E-5h, E-7b, E-11c |
| PLAT-08 | No private data in SW cache (S3 p. 36) | MVP | `public/sw.js` | Verified by `test:pwa:privacy` | — | E-L |
| PLAT-10 | Conflicts answer 409, never hang (S4 p. 19) | MVP | `patch_access_preferences`, `jr_save`, `bujhi_commit_reviewed_hemoglobin` | **Was broken → fixed** | Raised `40001`; PostgREST retried until timeout (38–125 s). Migration `20261120000000` → `PT409`; routes map it to 409 | verification §3 D2 |
| PLAT-09 | Deployed app = tested code (S4 p. 20) | MVP | Vercel `prahor`, Git-connected, prod branch `main` | Verified for baseline; fix deploys on merge | — | handoff |

## 01 Adapt

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| ADP-01 | Account preferences save/reload (S4 p. 4) | MVP | `GET/PATCH /api/preferences`, `patch_access_preferences` | **Was broken on Vercel → fixed** | Vercel compression turns the ETag into `W/"…"`. Client rejected every load; server returned 400 on every save. Fixed both sides to accept the weak form | E-2c/d (pre-fix fail), E-L contracts |
| ADP-02 | 409 on stale version (S4 p. 19) | MVP | same | Verified (Live-local, after PLAT-10 fix) | Re-verify after deploy | E-2 |
| ADP-03 | Guest local preferences; no lost drafts | MVP | `src/features/adapt` | Implemented, not re-tested here (UI) | Manual check by Apurbo | — |

## 02 Barta

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| BAR-01 | Source-grounded answer with real citations (S4 p. 4) | MVP | `POST /api/ai/chat`, bundled corpus | Verified (DGHS/WHO citations) | — | E-6a |
| BAR-02 | Danger signs abstain → urgent care (S5 task 4) | MVP | same | Verified: baby not moving, heavy bleeding, fever+fits | — | E-6b–d |
| BAR-03 | No access to records/diary/chat history | MVP | route has no DB client | Verified (diary text not echoed) | — | E-6e |
| BAR-04 | Rate limit | Opt | in-memory, per instance | Implemented (limited) | Fine for demo | — |

## 03 Shonket

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| SHO-01 | Public help without AI (S4 p. 4) | MVP | `/safety` | Verified (200, no sign-in) | — | E-1b |
| SHO-02 | Structured concern + contact method → canonical care workflow | MVP | `AskForHelp` → `/app/care/review` → `CareRequestForm` → `POST /api/care-requests` | Verified (same API as Bondhon) | — | E-11* |
| SHO-03 | Clinician-reviewed warning content | MVP (content) | — | **Content dependency** | Shown honestly as pending; needs a clinician, not code | — |

## 04 Jibonrekha

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| JIB-01 | Pregnancy profile save/read | MVP | `POST/GET /api/jibonrekha`, `jr_save` | Verified | — | E-3a |
| JIB-02 | Distinct linked baby record | MVP | `baby_records` | Verified | — | E-3c |
| JIB-03 | Dated observations with units; subject-specific kinds | MVP | `health_observations`, `baby_observations` | Verified incl. invalid unit + wrong subject rejected | — | E-3d–g |
| JIB-04 | Conditions (self-noted provenance), notes, visits, corrections | MVP | `maternal_conditions`, `maternal_symptom_notes`, `jr_visits`, `jr_observation_corrections` | Verified | — | E-4a–d |
| JIB-05 | Foreign subject IDs rejected | MVP | `jr_save` owner checks | Verified (B → A's pregnancy/baby/observation) | — | E-4e–g |
| JIB-06 | Provider role cannot read records | MVP | `motherDb()` | Verified 403 | — | E-4j |
| JIB-07 | Future timestamps rejected | MVP | `jr_save` | Verified (strict `> now()`). UI sends date-at-midnight so device skew does not bite | — | note |

## 05 Bujhi

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| BUJ-01 | Image → browser OCR → review → confirm → save (S4 p. 4) | MVP | `AccountReportReview`, `ocr-service.ts`, `POST /api/reports/commit`, `bujhi_commit_reviewed_hemoglobin` | Verified in production browser | — | E-7UI |
| BUJ-02 | Explicit confirmation; unsupported unit/field not saved; hCG not mapped | MVP | zod `confirmSave: true`, `reviewedUnit: "g/dL"` | Verified | — | E-7c/d, E-7UI |
| BUJ-03 | Retry dedup, owner-only destination | MVP | review identity in `bujhi_document_reviews` | Verified | — | E-7b, E-7e |
| BUJ-04 | Survives fresh session | MVP | — | Verified | — | E-8 |
| BUJ-05 | OCR engine from CDN (jsdelivr) | Limitation | `tesseract.js` defaults | Works; external dependency | Needs network at demo time | E-7UI |
| BUJ-06 | Only haemoglobin g/dL saves | Limitation | — | By design | Future: more types | — |

## 06 Shusthota

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| SHU-01 | Check-in (mood/energy/activity/rest) | MVP | `/api/wellness`, `wellness_entries` | Verified | — | E-5a |
| SHU-02 | Private diary, owner-only, not shareable | MVP | `/api/diary`, `wellness_diary_entries`; no sharing scope | Verified (B, provider, care-records, provider detail, Barta) | — | E-5b–e, E-11a, E-12f |
| SHU-03 | Hydration, habits, activity preferences | P1-impl | `20261119184243_shusthota_p1_wellness_records` | **Migration applied 20 Nov**; verified | — | E-5f–k |

## 07 Poth

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| POT-01 | Public search, no booking claim | MVP | `GET /api/poth/facilities?view=discovery` (DGHS registry + labelled community data). The plain path is the intentionally empty "reviewed-import" set | Verified (1,395 hits for "hospital") | — | E-9 |
| POT-02 | Nearby (explicit coordinates only), unverified labels | MVP | `GET /api/poth/nearby` (OSM) | Implemented (PR #59), not re-tested here | — | — |
| POT-03 | Visit preparation | MVP | `PothVisitPreparation.tsx` (client-side) | Implemented; no private persistence by contract | — | — |

## 08 Bondhon

| ID | Requirement | Class | Code / DB | Status | Gap → action | Evidence |
|---|---|---|---|---|---|---|
| BON-01 | Reviewed recipient/scope/purpose/method → persisted ID | MVP | `mvp_care_create_coordinated_request` | Verified, status `delivered` | — | E-11b |
| BON-02 | Duplicate submit → same request | MVP | `mutation_receipts` | Verified | — | E-11c |
| BON-03 | Only assigned provider sees/acts | MVP | `mvp_care_provider_requests`, `assignments` | Verified with a second provider Q | — | E-12a–c |
| BON-04 | Consent-scoped detail; no diary | MVP | `request_grants` projection | Verified | — | E-12f |
| BON-05 | Acknowledge/respond with revision check; mother sees status | MVP | `mvp_care_acknowledge/respond` | Verified incl. stale 409 | — | E-12g–j |
| BON-06 | Revocation removes provider access | MVP | `mvp_care_revoke_request` | Verified (detail 404, gone from queue) | — | E-13a–c |
| BON-07 | Minimal audit | MVP | `prohor_care.audit_events` | Implemented (rows written per action) | — | DB |
| BON-08 | Never claim external delivery | MVP | `providerMode: "simulated"` | Verified in payloads | — | — |

## 24 capabilities

| # | Capability | Module | Class | Status |
|---|---|---|---|---|
| 01 | Universal Accessibility Profile | Adapt | MVP | Working (after ETag fix deploys) |
| 02 | Bangla Multimodal AI Companion | Barta | P1-impl | Limited (text + optional audio) |
| 03 | Evidence-grounded Maternal RAG | Barta | MVP | Working |
| 04 | Maternal Safety & Human Handoff | Shonket + Bondhon | MVP | Working (clinician content pending) |
| 05 | 40-week Pregnancy Tracker | Jibonrekha | MVP | Working (limited) |
| 06 | Vitals & Baby Movement Logging | Jibonrekha | MVP | Working (supported kinds) |
| 07 | AI Report & Prescription Reader | Bujhi | MVP (restricted) | Limited: haemoglobin only |
| 08 | Accessible Diary & Notes | Shusthota | MVP | Working |
| 09 | Accessible Appointments | Poth | P1 | Limited: self-recorded visits; no booking |
| 10 | Facility Map & Referral | Poth | P1/P2 | Limited: unverified OSM list/nearby; no referral |
| 11 | Inclusive Mothers' Community | Bondhon | Future | Future |
| 12 | Consent-based Family Link | Bondhon | P1 | Limited: supporter invite RPCs exist, not in this acceptance run |
| 13 | Feature-phone SMS Fallback | Poth | Future | Future |
| 14 | Emotional Wellness Companion | Shusthota | MVP (check-in) | Working (check-in only) |
| 15 | Accessible Telemedicine | Poth | Future | Future |
| 16 | Postpartum Support | Jibonrekha + Shusthota | P2 | Future |
| 17 | Doctor/CHW Follow-up Queue | Bondhon | MVP | Simulated provider; working |
| 18 | Per-mother Health Timeline | Jibonrekha | MVP | Working |
| 19 | Cohort AI Assistant | Bondhon | Future | Future |
| 20 | Evidence & Protocol Overlay | Barta | P1 | Limited: citations shown |
| 21 | District Analytics | Bondhon | Future | Future |
| 22 | Voice-to-SOAP Notes | Bondhon | Future | Future |
| 23 | Clinical Signal Auto-flags | Shonket | Future | Future (needs clinical validation) |
| 24 | Care Continuity & Audit | Bondhon | MVP (minimal) | Working (minimal audit) |
