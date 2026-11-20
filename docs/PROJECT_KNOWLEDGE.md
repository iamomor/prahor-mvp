# PROHOR | প্রহর — Project knowledge reference

Reusable working reference for future questions and tasks. Created and expanded on 20 Nov 2026 (Asia/Dhaka), from repository documentation and source on branch `omor-mvp-closure`. Study started at `917c3c5`; another session advanced HEAD to `b6351ed` during review (Barta/AAC redesign), and the changed files were rechecked. Existing uncommitted application changes are included as local source, not a deployed release. This is a synthetic hackathon MVP, not a clinically validated product.

**How to use this file:** Consult it whenever accessible at the start of future PROHOR work, then inspect the relevant current source, contracts, migrations and working-tree changes before making changes. Update this reference when implementation or evidence changes; do not silently rewrite historical evidence. It is a map, not proof or authorization to implement unrelated work. **[code]** means source inspection, **[doc]** means a report's claim, and **[ran]** means a locally executed check. Earlier recorded runs are historical; the fresh checks for this expanded review are explicitly listed in section 15. No hosted deployment or clinical approval was verified by this review.

---

## 1. Product in one screen

- **What it is:** a Bangla-first, mobile-first web app and PWA for maternal and child care in Bangladesh. Built for a hackathon (CloudCamp / International AI Builders Congress, domain HealthSphere AI; PersonalMD challenge suggested but not confirmed).
- **Tagline:** *Your Care. Your Way.* / *আপনার যত্ন, আপনার মতো।*
- **Core rule:** PROHOR changes *how* a mother uses it, never her healthcare rights or which features she gets. There is one app for everyone. There is no disability sign-up and no "Standard / Personalized Care" split.
- **Users:** mothers (pregnancy, postpartum, early motherhood, any mix of access needs); simulated providers (doctor/CHW); supporters invited by the mother.
- **Non-negotiables:** no AI diagnosis, triage, prescription or reassurance; help info must work without AI (999); a saved, delivered or acknowledged status must match what the server actually did; nothing is shared by default; the diary and AI chats are never shareable; OCR stays unconfirmed until the mother reviews it; never invent facilities, helplines, sources or provider replies; synthetic data only, clearly labelled.
- **Provenance enum:** `self_reported`, `document_extracted` (+`user_verified`), `clinician_entered`, `clinician_confirmed` (`src/lib/contracts/common.ts`).
- **The 24 capabilities are a roadmap,** not MVP scope. P0/P1/P2 are plan priorities, not status.

### Eight modules (fixed names)
| # | Module | Purpose | Main route(s) | Feature folder |
|---|---|---|---|---|
| 1 | **Adapt** | Access and interaction preferences | `/accessibility`, `/app/accessibility` (`/app/adapt` re-exports it) | `src/features/adapt` |
| 2 | **Barta** | Source-grounded Bangla/English education chat | `/ask` (public), `/app/ask` | `src/features/barta` |
| 3 | **Shonket** | Danger-sign info + human help request | `/safety`, `/safety/information/[slug]`, `/app/care`, `/app/care/{new,review,status,requests}` | `src/features/shonket` |
| 4 | **Jibonrekha** | Mother and baby records, kept separate | `/app/jibonrekha`; demo `/demo/jibonrekha` | `src/features/jibonrekha` |
| 5 | **Bujhi** | Report OCR → review → save; pregnancy-kit guide | `/app/bujhi`, `/app/bujhi/kit`; demos `/demo/bujhi`, `/demo/bujhi/kit`, `/demo/bujhi/legacy` | `src/features/bujhi` |
| 6 | **Shusthota** | Wellness check-ins, hydration, habits, private diary | `/app/shusthota` (`/app/wellbeing` redirects here) | `src/features/shusthota` |
| 7 | **Poth** | Facility directory, nearby search, visit prep, SOS | `/poth` (public), `/app/poth`; `/find-care` → `/poth` | `src/features/poth` |
| 8 | **Bondhon** | Consent-controlled care requests, provider queue, audit | `/bondhon` (public intro), `/app/bondhon`, `/provider`, `/provider/bondhon` | `src/features/bondhon` |

Cross-module: dashboard `src/features/dashboard/MotherDashboard.tsx` (`/app`); shared visit questions `src/features/shared/visit-questions.ts`.

---

## 2. Team and ownership (conflicting sources)

- **Final assignment** in `docs/PROHOR_Team_Roles_Project_Blueprint.md` (says "confirmed by the user"): **Omor** = PM, tech lead, platform/auth/Supabase/RLS/PWA/care-request backend/release; **Apurbo** = frontend, design system, Adapt, accessibility; **Iftee** = AI, Barta RAG, Bujhi extraction engine; **Ifty** = Jibonrekha and the Bujhi review UI; **Samin** = Shusthota, Poth, Shonket UI, Bondhon provider-queue UI, end-to-end QA.
- **Conflicts:** `AGENTS.md` still has the old roles (Iftee = UI/Adapt, Ifty = Barta/Bujhi AI, Apubo = Jibonrekha). `BARTA-ACCESSIBILITY-RUNBOOK.md` says "Ifty (Barta) and Iftee (Adapt)". `PROHOR-SESSION-HANDOFF.md` has a third version. **Ask before relying on an owner name.**
- Git flow: member branch → PR → `develop` → `main`. GitHub repo `iamomor/prahor-mvp`. Message a file's owner before editing it.

---

## 3. Stack, structure and commands

- Next.js 16 (App Router; `src/proxy.ts` is the session-refresh proxy), React 19, TypeScript strict, Tailwind v4, Zod 4, Supabase (`@supabase/ssr`), `tesseract.js` 7 (OCR in the browser), lucide-react. Node ≥ 20.9.
- Tokens: `src/styles/prohor-tokens.css` (`--pro-*`), themes on `html[data-theme]` (`quiet-garden` default, `original-rose`, `morning-mist`), contrast as a separate overlay. Root layout `src/app/layout.tsx` runs a pre-paint preference script and mounts `PreferenceRuntime`.
- Route groups: `(marketing)` public pages; `(auth)` `/sign-in`, `/sign-up`; `/app/*` mother; `/provider/*`; `/supporter`; `/account`; `/auth/{[action],callback,account,denied}`; `/offline`; `/api/*`. `src/app/(mother)/demo.tsx` is an empty file, not a route.
- Commands (`package.json`): `dev` (runs `check-env` + `copy-ocr-assets` first), `build` (`next build --webpack`), `typecheck`, `lint`, `test:e2e` (Playwright), `test:contracts`, `test:auth`, `test:db*`, `test:rls` (local Supabase only), `test:rls:guards`, `test:pwa:privacy`, `check:contrast`, `check:env`, `check:auth-config`. On PowerShell use `npm.cmd` if scripts are blocked.
- Fast non-browser unit tests: `node --test tests/unit/*.test.mjs src/features/*/*.test.mjs` (excluding `*.browser.test.mjs`). They load `.ts` through `node:module` `stripTypeScriptTypes`. **[ran] 100/100 pass on 20 Nov.** Browser tests need Playwright and a running app; `lifeline-experience.browser.test.mjs` has a known timeout (the Next dev overlay intercepts clicks) **[ran]**.
- Env variable names (never copy values into this reference): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (Origin checks for private/auth mutations; public Barta chat is a separate boundary), `OPENROUTER_API_KEY`, `BARTA_OPENROUTER_MODEL`/`_FALLBACK_MODEL`, `GEMINI_API_KEY`, `PROHOR_BARTA_GEMINI_MODEL`, `BARTA_AUDIO_SIGNING_KEY`, `BARTA_AZURE_SPEECH_KEY/REGION`, `BARTA_FISH_*`, `BARTA_ESPEAK_PATH`, `BARTA_RATE_LIMIT_REDIS_URL/TOKEN`, `PROHOR_BARTA_DEMO`, `PROHOR_BARTA_AI_PREVIEW/DEBUG`, `PROHOR_TEST_URL`, `PLAYWRIGHT_CHANNEL`.

---

## 4. Auth, roles and server boundaries [code]

- `src/lib/auth/access.ts` `readIdentity()`: `auth.getUser()` → requires a confirmed email and no anonymous user → reads `profiles` + RPC `prohor_account_access` → `activeRole` ∈ mother/provider/supporter/member. A 503 can mean `profile_missing`.
- `src/lib/auth/require-workspace.ts`: `requireWorkspace(role)` is cached per request and redirects to sign-in (401), `/sign-in?error=profile-unavailable` (503) or `/account` (wrong role). Used in the `/app`, `/provider` and `/supporter` layouts, and again in many pages.
- Sign-up: one self-declared purpose (mother/supporter/doctor/chw); doctor needs an organization and registration number; providers are `mode: "simulated"` and need operator approval (`src/lib/contracts/account.ts`). Supporter scopes are only `visit_preparation` and `care_coordination`, and they never expose health data.
- Auth handlers `src/lib/auth/handlers.ts`: sign-in, sign-up, email link, sign-out (returns JSON and clears cookies). Cookies are httpOnly. `safeAuthReturnPath` in `src/lib/routes.ts` blocks open redirects.
- API pattern: `jsonNoStore` (`src/lib/api-response.ts`), `boundedJson` + `sameOriginPost` (`src/lib/auth/validation.ts`), a `motherDb()` role guard, then Supabase under RLS. Postgres error codes map to HTTP: 42501→403, PT409/40001/23505→409, 22xxx/23514→400, otherwise 503.
- **Care engine:** `src/lib/care/handlers.ts` `handleCare()` handles the care APIs. It enforces method, same-origin for mutations, UUID resource paths, role sets, and an optional `X-Prohor-Account` header (409 if the account changed). Retry-key UUIDs are required for create-consent, create-request, acknowledge, respond, close and follow-up; revoke/open operations have different explicit rules. It calls one `mvp_*` RPC and **re-validates the RPC response with Zod refinements** (owner id, echoed fields). Denials from `mvp_shonket_open_request` become 404 so the reason is not revealed.

### API route map
| Route | Method | Handler / RPC |
|---|---|---|
| `/api/me`, `/api/auth/me` | GET | `handleMeGet` |
| `/api/preferences` | GET/PATCH | `features/adapt/server/handlers.ts` (`access_preferences`, optimistic `expectedUpdatedAt`) |
| `/api/jibonrekha` | GET / POST | reads 8 tables; POST → RPC `jr_save` (types: pregnancy, baby, observation, condition, symptom_note, visit, correction), idempotency key required |
| `/api/wellness` | GET/POST | `wellness_entries` |
| `/api/wellness/activity-preferences` | | `wellness_activity_preferences` |
| `/api/wellness-habits`, `/[id]/events`, `/api/wellness-habit-events` | | habits + events (`wellness_habits_active` view) |
| `/api/hydration` | GET (`?scope=history`, otherwise today in Dhaka) / POST (`retryKey`) | `hydration_entries` |
| `/api/diary` | GET/POST | `wellness_diary_entries` (owner-only) |
| `/api/reports/commit` | POST | RPC `bujhi_commit_reviewed_hemoglobin` (**g/dL hemoglobin only**, `confirmSave: true`, source SHA-256) |
| `/api/health` | GET | returns 501 "persistence not connected" (legacy placeholder) |
| `/api/ai/chat` | POST | Barta pipeline (§5.2) |
| `/api/ai/barta-audio` | POST | speech for a server-issued ticket |
| `/api/poth/facilities` | GET | reviewed `facilities.json` (empty), or `?view=discovery` → registry + OSM directory |
| `/api/poth/nearby` | GET `lat,lon,radius` | live Overpass + committed snapshot, cache, 1.2 s cooldown |
| `/api/care-recipients` | GET | `mvp_care_recipients` |
| `/api/care-records` | GET | `mvp_care_shareable_records` |
| `/api/care-requests` | POST / GET | create: Shonket body (has `concernTypes`/`onset`) → `mvp_shonket_submit_request`, else Bondhon → `mvp_care_create_coordinated_request`; list: `?workflow=shonket` → `mvp_shonket_my_requests`, else `mvp_care_owner_requests` (cursor paging) |
| `/api/care-requests/[id]` | GET | `mvp_care_get_request` |
| `…/[id]/events`, `/coordination`, `/messages`, `/close`, `/revoke`, `/shonket-revoke` | | `mvp_care_request_events`, `_coordination_detail`, `_follow_up`, `_close`, `_revoke_request`, `mvp_shonket_revoke_request` |
| `/api/consents`, `/api/consents/[id]/revoke` | POST | `mvp_care_create_consent`, `mvp_care_revoke_consent` |
| `/api/provider/requests` | GET | `mvp_care_provider_requests` or `mvp_shonket_provider_requests` |
| `/api/provider/requests/[id]/{acknowledge,respond,open}` | POST | `mvp_care_acknowledge`, `mvp_care_respond`, `mvp_shonket_open_request` |

### Database (`supabase/migrations`, 22 files, 16 → 20 Nov)
`profiles`, `access_preferences`; account roles (`account_role_memberships`, `account_onboarding`, `provider_applications`, `supporter_connections`, `account_access_events`); private records (`pregnancy_records`, `baby_records`, `health_observations`, `baby_observations`, `maternal_conditions`, `maternal_symptom_notes`, `wellness_entries`, `wellness_diary_entries`); Jibonrekha history (`jr_visits`, `jr_observation_corrections`, `jr_operation_keys`); `bujhi_document_reviews`; Shusthota P1 (`hydration_entries`, `wellness_habits`, `wellness_habit_events`, `wellness_activity_preferences`); schema `prohor_care` (`support_requests`, `request_events`, `consent_grants`, `request_grants`, `request_permissions`, `assignments`, `audit_events`, `mutation_receipts`, `queue_receipts`, `response_messages`, `provider_approvals`, `follow_up_messages`). Plus `supabase/proposals`, `supabase/reference/001_initial.sql` (old illustration), `supabase/inspection/*.sql`, `supabase/tests`.

---

## 5. Modules: what is built

### 5.1 Adapt
- **Local v1** `src/lib/access-preferences.ts` (key `prohor-access-preferences-v1`, schema v3): theme, `highContrast` (true / false / null = follow the OS), textScale (default/large/extra-large), `layoutDensity` (comfortable/compact/spacious; `spaciousLayout` is a deprecated alias), reducedMotion, simplifiedContent, communication (text/aac), language (bn default), focusedView.
- **Account v2** `src/lib/contracts/adapt.ts`: theme, highContrast (boolean), textScale, spaciousLayout, reducedMotion, simplifiedContent, communication, language, `textSpacing`, `readAloud`. **The two shapes differ** (v2 has no layoutDensity or focusedView; v1 has no textSpacing or readAloud). Sync: `features/adapt/lib/account-controller.ts`, `CloudSyncSection`, `PreferenceConflictDialog`.
- UI: `AdaptSettingsPanel.tsx`; `AACComposer.tsx` with 24 symbols in `lib/aac-phrases.ts` (9 symptoms, 6 body areas, 6 requests, 3 feelings; `generateNaturalPhrase` in en/bn); `ReadAloudButton` + `useSpeechSynthesis`.
- `simplifiedContent` is saved but does nothing yet **[doc: Barta a11y runbook]**.

### 5.2 Barta
- Public `/ask` needs no sign-in. `BartaChatStarter.tsx` → POST `/api/ai/chat`. The AAC composer opens automatically when communication = `aac`.
- **Pipeline order** in `src/app/api/ai/chat/route.ts`: question-bank safety + `safety-gate.ts` (also re-run after stripping greetings and courtesy words) → urgent/crisis return at once → coverage routes (`conversation-coverage.ts`) → other safety reasons → saved retention is rejected (only `ephemeral` works) → PII reply → bleeding clarification → rate limit (`chat-rate-limit.ts`; in-memory unless Redis env is set) → emoji → symptom follow-up → small talk/greeting → exact reviewed match → understood short replies → question-bank intent → `resolveBartaKnowledgeAnswer` with an optional **OpenRouter selector**. The selector (`openrouter-intent.ts`, free models only, 2.2 s timeout) only *chooses* among up to 8 reviewed questions or returns NONE. It never writes medical text.
- Answer union (`src/lib/contracts/barta.ts`): `grounded` (≥1 citation, limitations) / `abstained` (reasons: insufficient_evidence, outside_education_scope, sources_unavailable, urgent_care, crisis_support, mental_health_support) / `clarification` / `conversation` / `not_connected`. The contract keeps duplicate spellings (`answer` vs `answer_bn/en`, `actionLevel` vs `action_level`).
- Knowledge: `approved-corpus.ts`, `approved-knowledge.ts` (lexical retrieval), `education-corpus.ts`, `question-bank-prompts.json` (~808 prompts). The corpus has project reference checks, **not clinician approval** (`reviewedByUserId: null`) **[doc]**.
- Audio: server tickets (`audio-ticket.ts`), bundled clips (`/barta-voice/*.mp3`), Fish/Azure/eSpeak options.
- Safety probe of `safety-gate.ts` alone **[ran]**: "বাচ্চা হওয়ার পর মন খারাপ" → mental_health_support; "নবজাতক সাড়া দিচ্ছে না" → urgent_care; "রোগ নির্ণয় করে" → outside_education_scope (NFC and NFD). **The NFKC bug in the session handoff is fixed in this code.** But "I have fever. I am too weak to get out of bed." and "My face is swollen. I have a headache." → plain *answer* at gate level: `routeBySentence` and the M2 AAC rules described in `BARTA-ACCESSIBILITY-RUNBOOK.md` are **not in this branch**. Whether later stages of the route catch these was not tested.

### 5.3 Shonket
- `/safety` public (`SafetyHome`): 999 card, 16263 DGHS line card with caveats, "Prepare a message" → `/app/care/new`, and reviewed info → `/safety/information`. Topic content `topic-content.ts` comes from **WHO PCPNC 3rd ed. 2015**. It is source-linked and labelled "clinician review pending", not approved.
- `/app/care` `CareHub` links to help. **Current main path:** `/app/care/new` mounts `ConcernForm`, which owns compose → review → submitted steps **inside the same component**, sends the Shonket payload, and links to `/app/care/requests` (`MyRequests`, including revoke). Concern types: headache_vision, bleeding_fluid, baby_movement, breathing_chest, fever, swelling, pain, mood_safety, other; optional onset now/today/this_week/longer; required method text/aac/call. **Retained separate path:** `/app/care/review` still mounts `RequestReview` and the Bondhon `CareRequestForm` using the module-memory `care-request-draft.ts`; `/app/care/status` mounts `RequestStatus`. Do not describe this retained path as the structured form's next step. See section 11 for the two workflows' different status semantics.
- Provider side: `ProviderQueue` on `/provider` (open → acknowledge). Statuses: submitted / delivered / acknowledged. Consent `shonket-demo-2026-11-20` expires and can be revoked; denied access is audited.

### 5.4 Jibonrekha
- `/app/jibonrekha` → `AccountRecords.tsx` (big client component). Task views: home, guide (`CareGuide`, weekly guide), share (`AccountVisitPack`), observation, pregnancy, baby, note, visit, records/history. Gestational week is shown only when there is a real date; it is never guessed.
- Measurements (`src/lib/contracts/health.ts`): mother = weight (kg/g), temperature (Cel/[degF]), systolic and diastolic BP (mm[Hg]), hemoglobin (g/dL), glucose (mg/dL, mmol/L), note; baby = weight, temperature, fetal_heart_rate (/min), note. **hCG is not supported; never map it to another type.** Corrections add a new row and keep the original value plus a reason.
- Demo/local: `/demo/jibonrekha` `LifelineExperience` (sun-arc `LifelineArc`, `lifeline-arc.ts`), `demo-health.ts`, `records-model.ts`, `RecordsWorkspace.tsx` (old 9-tab workspace).

### 5.5 Bujhi
- `/app/bujhi`: two cards (home kit → `/app/bujhi/kit` `KitExperience`; medical report → `AccountReportReview`). If `bujhi_document_reviews` is unavailable, it falls back to local `MedicalEntry` and says so. If there is no pregnancy record, it shows a create form (server action).
- Flow: upload an image (`ReportUpload`, `upload-validation.ts`) → browser Tesseract (`ocr-service.ts`; engine served from `/public/ocr`, copied by `scripts/copy-ocr-assets.mjs`; HEAD commit moved it off the CDN) → review per field → manual fallback ("type the hemoglobin value myself") → confirm → POST `/api/reports/commit`. Sample `public/bujhi/prohor-synthetic-lab-v1.png`.
- **Only hemoglobin in g/dL saves.** Other values are display-only. Saved rows are `document_extracted`/user-verified, not clinician-confirmed. Manual entries get their own provenance note (migration `20261119234616_bujhi_manual_entry_provenance.sql`).
- Helpers: `bujhi-review.ts` (accept is blocked when the unit is missing or unknown), `kit-result.ts`, `report-schema.ts`, `ultrasound.ts`.

### 5.6 Shusthota
- `/app/shusthota` `ShusthotaOverview` stacks: test-environment warning → `Wellbeing` check-in (mood comfortable/mixed/difficult/prefer_not_to_say, energy, activity note, rest note; at least one field required) → `ShusthotaHistory` → `HydrationHabits` → `ActivityPreferences` → `ActivityPlans`, `PrivateDiary`, `ProviderWellnessSharing` (consent grant for wellness entries through `/api/consents`), `RelaxationResources`, `RemindersGuide`, `WellnessTrendSummary`. Client in `features/shusthota/api.ts`.
- No scores, streaks or targets. The diary is owner-only, is never in a sharing scope, and is never sent to Barta.
- Structured sleep and pace / "I am now…" preferences remain proposals. `RemindersGuide` does implement a manual one-time `.ics` calendar download; it does not deliver background reminders. `reviewed-content.ts` currently has empty relaxation-resource and clinician-plan catalogs, and `WellnessTrendSummary` shows an unavailable AI state [code].

### 5.7 Poth
- `PothDirectoryMvp`: hero + 999 strip → `PothFacilityExplorer` (server-indexed discovery over **9 registry records + 7,535 OSM source features** via `directoryCore.ts`) → `PothNearbyMap` (chosen city, optional GPS/manual point, fixed radii, **saved snapshot by default**, optional live Overpass, truncation flag) → `PothVisitPreparation` + `PothSavedVisitQuestions` → `PothCareCoverage` (facility types) → `PothEmergencySOS` (`tel:999` only opens the dialer). Source features include pharmacies and are not a count of unique hospitals or verified clinical facilities.
- `facilities.json` (reviewed list) is `[]`. Nothing is verified. Labels say "not verified"; there is no booking.
- The maternal-specialty bug (F1) is fixed: `nearbyCore.ts` accepts obstetrics, gynaecology, gynecology and maternity.

### 5.8 Bondhon
- `BondhonWorkspace` (mother `/app/bondhon`; provider `/provider`, `/provider/bondhon`): `CareRequestForm` (recipient from `/api/care-recipients`, records from `/api/care-records`, nothing pre-selected, AAC composer, accommodations written/interpreter/step_free/quiet/easy_read/support_person, expiry, allowReplies, review checkbox) → `CareRequestDetail` (events, coordination, follow-up messages, acknowledge/respond for providers) → `SharingNow`/`SharingRing`/`RevokeDialog`.
- Status machine: submitted → delivered → acknowledged → responded → closed; any status before closed can go to closed (`contracts/bondhon.ts`, `bondhon-status.ts`). Provider mode is always `simulated` ("Dr. Demo").
- Shareable record types (`contracts/sharing.ts`): pregnancy_record, maternal_condition, maternal_observation, maternal_symptom_note, baby_record, baby_observation, wellness_entry, each with chosen fields. **No diary, AI chat or raw-document scope exists.**

---

## 6. Verified status (latest evidence)

- `docs/qa/DEMO_READINESS_2026-11-20.md` **[doc]**: local production build against the **hosted** Supabase. 13-step journey passed except Bujhi upload not clicked (⚠) and Shonket content pending review (⚠). Provider gets 403 on `/api/jibonrekha`. typecheck, lint and build passed. Not run: `test:rls`, `test:auth:live`, the full Playwright suite, screen reader, real phones.
- `docs/qa/M4_M5_COMPLETION_2026-11-20.md` **[doc]**: 74/74 hosted acceptance on `https://prahor-eight.vercel.app`; manual Bujhi save verified in a fresh session.
- **[ran] 20 Nov:** non-browser unit tests 100/100; Barta gate probe (§5.2).
- Demo accounts named in the docs: `test.mother@prohor.demo`, `test.provider@prohor.demo` (synthetic; passwords not recorded here).
- What to tell judges: "source-linked to WHO/UNICEF/DGHS", **not** "clinician-reviewed"; "simulated provider", never "a doctor received it".

---

## 7. Gaps, conflicts and open questions (do not guess)

1. **Deployment chronology:** DEMO_READINESS says deployment is pending; later backend/M4–M5 reports describe `prahor-eight.vercel.app` with different revisions. `.vercel` exists locally. None proves that the current dirty checkout is deployed. Verify the exact deployed revision and origin before release work.
2. **Shonket consent migration:** older acceptance says enforcement is missing/undeployed; current `20261120200000_shonket_consent_enforcement.sql` says it was applied on 20 Nov. Its cited `docs/qa/final-2026-11-20/DEPLOYMENT_RECORD.md` is absent in this checkout. Current source enforces consent; hosted application and version remain unverified here.
3. **Barta M2 AAC sentence routing** (`routeBySentence`, fever + too weak, swelling + headache) is not in this branch. The runbook says it was a "tonight" fix. Merge status?
4. **Team roles:** `AGENTS.md`, the Team Blueprint and the session handoff disagree (§2).
5. **Adapt v1 vs v2 shapes differ** (layoutDensity/focusedView vs textSpacing/readAloud). Who owns the mapping?
6. **Bujhi:** contract `bujhi.ts` describes PDF-only uploads of `prohor-synthetic-lab-v1` (≤5 MB), while the live path is an image with browser OCR and only hemoglobin saves. Which source supplies term explanations? Where does the original file live after review?
7. **Jibonrekha route:** the docs mention `(mother)/jibonrekha`; the real route is `src/app/app/jibonrekha`.
8. **Legacy and dead code:** `/api/health` returns 501; `docs/CODE_MAP.md` is stale (it says chat and care requests are not connected). `CODE_MAP` lists unmounted components (`AppChrome`, `AccessPreferencesPanel`, etc.).
9. **Helplines:** policy docs say "999 only"; `SafetyHome` also shows 16263 with a caveat and a source link. Confirm this is approved.
10. **Content review:** all Bangla is a draft until a native speaker reviews it; all health wording needs clinician review; there is no named reviewer yet.
11. **Security to-dos [doc]:** rotate Supabase and AI keys; enable leaked-password protection.
12. **Future or limited:** real clinician integration and external delivery receipts, SMS/feature-phone access, telemedicine, booking, verified facility accessibility, broad registry ingestion/reviewer tools, Easy Read, BdSL, background reminders, connected AI wellness summaries, and full postpartum/newborn/immunization workflows. Nine source-reviewed DGHS identity records and limited supporter invite/accept/revoke code already exist; do not call those wholly absent.
13. **Uncommitted at this review's start:** the live Bondhon test script plus AuthShell, app Ask/Bujhi pages, AACComposer, Barta chat/CSS and several Bujhi components were modified. `.agents/`, `.claude/launch.json`, the supplied major module docs and this reference were untracked. Study includes these changes; preserve them during future work.

---

## 8. Doc index

- Product: `docs/# PROHOR — Complete Product, Featur.txt` (master blueprint v1.0), `docs/PROHOR_PROJECT_CONTEXT_FOR_NEW_CHATS.md`, `docs/PROHOR_Team_Roles_Project_Blueprint.md`, `AGENTS.md`, `design.md`, `.claude/skills/prohor-premium-uiux/SKILL.md`, `docs/design-system/*`.
- Module specs and runbooks (design proposals; mostly not wired in): `SHUSTHOTASPEC.md`, `POTH_V2_RUNBOOK.md`, `JIBONREKHA-LIFELINE-SPEC.md`, `BUJHI-MASTER-RUNBOOK.md`, `BONDHONSPEC.md`, `BARTA-ACCESSIBILITY-RUNBOOK.md`, `PROHOR-SESSION-HANDOFF.md`, `PROHOR-Barta-*.md`, `POTH_FINAL_48H_HANDOFF_20261118.md`, `NATIONWIDE_POTH_HANDOFF.md`.
- Architecture and API: `docs/architecture/*`, `docs/API_*.md`, `docs/AUTHENTICATION.md`, `docs/PWA_PRIVACY.md`, `docs/backend-completion/*`, `supabase/README.md`, `supabase/RLS_TESTING.md`.
- QA evidence: `docs/qa/DEMO_READINESS_2026-11-20.md`, `docs/qa/M4_M5_COMPLETION_2026-11-20.md`, `docs/qa/CURRENT_STATE_AND_NEXT_STEPS_2026-11-19.md`, the module QA files in `docs/{bondhon,bujhi,jibonrekha,poth,shonket}/`.
- Feature-local notes: `src/features/jibonrekha/{INTEGRATION,V2_QA,ARCHIVE_INTEGRATION_20261119}.md`, `src/features/bujhi/{ENTRY_INTEGRATION,UPLOAD,V3_INTEGRATION}.md`, `src/features/shusthota/P1-HYDRATION-HABITS-BACKEND-PROPOSAL.md`.

## 9. Change log
- 2026-11-20: created (docs + code review on `omor-mvp-closure` @ `917c3c5`; no app code changed).
- 2026-11-20: expanded through a second documentation/source study; corrected Shonket entry flow and Poth defaults, added screen/control maps, storage and evidence boundaries, documentation precedence, fresh local verification and unresolved conflicts below. No application code changed.
- 2026-11-20: observed concurrent commit `b6351ed` (15:57 Dhaka) covering the app Ask page, AACComposer, BartaChatStarter, BartaEducationChat and its CSS. Rechecked this source and repeated typecheck/lint; this study did not create that commit or edit those files.

## 10. Reading order, authority and evidence discipline

For future work, use this order:

1. The user's current scope and repository `AGENTS.md`; for UI, read `.claude/skills/prohor-premium-uiux/SKILL.md` and its design-system references. This reference does not override those instructions.
2. The two primary documents: `docs/# PROHOR — Complete Product, Featur.txt` (14 Nov product blueprint) and `docs/PROHOR_PROJECT_CONTEXT_FOR_NEW_CHATS.md` (14 Nov background, intended architecture and ownership). They define goals, not implementation acceptance.
3. Current route → mounted component → API handler → runtime contract → database migration/RPC. Trace the actual path; similarly named retained demos may do something different.
4. Relevant dated implementation/QA reports, with their commit, environment and test scope. Read later follow-ups within a document before treating an earlier blocker as current.
5. Design canvases, runbooks and historical scaffold reports as intent/history. A canvas or passing schema cannot prove a working clinical service, source support, database deployment or device accessibility.

**Status vocabulary:** Working = an implemented behavior with stated verification; Limited = supported subset with explicit boundaries; Prototype/Simulated = demo behavior/data/providers; Future = a proposal or unconnected capability. Source inspection alone establishes implementation presence, not runtime success. A field named `approved`, `reviewed`, `confidence` or `grounded` does not establish professional review or clinical accuracy.

The blueprint's last summary says “desktop-first,” whereas `AGENTS.md`, master context and design-system requirements say mobile-first. Apply the repository's mobile-first requirement. Earlier six-day/seven-day plans and later 48-hour freeze/deadline documents are historical scheduling context. Official competition registration, deadline and submission receipt were not verified; never infer a current deadline from an old sprint plan.

The intended demonstration is equal care journeys through different interaction methods: public entry → optional Adapt → just-in-time sign-in → distinct mother/baby records → sourced education → verified report subset → optional wellness → sourced care discovery → reviewed, finite sharing → simulated provider action → mother-visible status/revocation. No module may infer consent, diagnosis or competence from access preferences.

## 11. Screen and control map for detailed future questions

The following is source-observed behavior, not a fresh browser acceptance report. Most labels are bilingual or locale-selected; some account and retained screens still mix English and Bangla.

### Public website, authentication and shell

- `/` resolves to `src/app/(marketing)/page.tsx` → `components/marketing/Homepage.tsx`. Composition order: HeroStory, ProductStrip, ProblemStory, AdaptStory, CompanionStory, JourneyStory, SupportStory, AudiencePanels, ResponsibleCards, TeamStory, RoadmapStory, FinalCTA and StoryFooter. `PublicNav` handles anchors/mobile navigation. `HomeContext`, `home-content.ts` and per-section copy control the homepage language, separately from older translation tables.
- Homepage controls open preferences/sign-in dialogs and interactive synthetic previews. Preview controls and decorative request/health displays are not live backend actions. A local sample “saved” state must not be described as an account write. Roadmap data is presentation data, not a complete implementation inventory.
- `Homepage` retains the current page while its preference dialog changes appearance. It has a skip link and explicit offline message. CSS is layered through eight homepage stylesheets; inspect the final matching rule before adding an override.
- `/sign-in` and `/sign-up` use `features/auth/EmailSignIn.tsx` and `AuthShell` entry mode. Actions include password sign-in/signup, supported email-link handling, language/access settings and recovery messages. The callback performs actual Auth verification and a safe role-aware redirect. Provider application is not provider approval.
- `features/auth/AccountWorkspace.tsx`, `/account`, `/auth/account` and `/supporter` implement onboarding, approved workspace switching, and scoped supporter invite/accept/revoke. Invitations use a code; no email/SMS delivery is implied. The supported scopes authorize coordination, not health/diary/chat access. This path was not live-tested in this study.
- Mother shell (`AuthShell`): desktop primary links Overview, My pregnancy, Ask PROHOR, Care & support; Explore links Sharing & supporters, Reports, Wellbeing & diary, Find care, Warning signs, Accessibility. Mobile bottom navigation is Home/Journey/Ask/Care; menu drawer exposes the other destinations with focus management. Header contains language/access/account controls. Shell code is locally modified, so do not replace it from an old branch/archive.
- `/app` mounts `MotherDashboard` inside `Workspace`. It reads actual `/api/jibonrekha`, `/api/wellness` and known request state rather than manufacturing clinical values. Dating uses entered EDD first or LMP + 280 days, displayed as an estimate. Empty, missing-date and past-due cases offer record actions. Latest readings omit superseded corrections; visits and wellness are linked to their modules. Urgent-help and all eight module entries remain discoverable.
- Public `/ask` and `/poth` work without authentication by design. Their `/app/*` counterparts inherit the mother layout guard. Historical reports listing `/app/ask` or `/app/poth` as public must not override that current route boundary.

### Adapt: adjust and keep the current task

- `AccessPreferencesPanel` is a wrapper into `features/adapt/components/AdaptSettingsPanel.tsx`; do not assume it is dead because CODE_MAP calls an earlier version unmounted. Controls include appearance, contrast/OS following, text, typography/spacing, layout, motion, language, communication and focused view, plus explicit account comparison/save controls.
- Global `PreferenceRuntime` runs on route changes, focus and preference/storage events. `account-runtime.ts` owns one lifecycle; `PreferenceSyncController` tracks guest/loading/review/ready/saving/error, cancels stale requests, keeps an anonymous device backup, and restores it on account transitions. Loading compares; it does not silently upload device choices. Saving uses If-Match; 409 reloads and requires review again.
- `account-mapping.ts` explicitly maps relaxed ↔ increased spacing and spacious density ↔ the account boolean. Compact density, focused view, fonts and nullable OS-contrast choice remain device concerns. Existing account readAloud is preserved, not reset by a device save. “Sync off” is not deletion; no preferences DELETE endpoint exists.
- AAC is a 24-symbol phrase composer with text, edit/clear/insert/read controls, not symptom classification. Insertion appends without overwriting text and does not submit. `aac-events.ts` uses `prohor-aac-insert`, `prohor-aac-draft-change` and a session-storage recovery key. Over-limit inserted text is retained separately rather than silently truncated. Shared `src/lib/audio-session.ts` prevents competing microphone/read-aloud owners.
- `simplifiedContent` persists, but source search found no general reviewed Easy Read content implementation consuming it. Focused view has presentation behavior; neither setting changes care permissions. External switch/braille/sign-language support is unverified or roadmap, not established by a setting label.

### Barta: compose, explicitly ask, inspect evidence

- `BartaChatStarter` defaults to demo mode but public/account education pages explicitly choose `mode="education"`. `initialQuestion` (including a Shonket/dashboard query-string handoff) only prefills up to 1,200 characters; it never auto-sends.
- It owns draft, turns, answer language, previous public chunk ID, request cancellation and AAC insertion. `BartaEducationChat` renders the conversation, question choices, composer and answer/source/audio UI. Selecting a suggested question is an editable action; actual Ask is explicit. Clear removes tab-memory conversation/context and stops audio.
- Current redesign places the expandable AAC symbol panel inside the composer card, with separate microphone and answer-language controls, a character count, voice-privacy disclosure and explicit send. The account Ask page has a help anchor plus separate 999 / Warning signs / Ask a person actions. AAC selection supports remove, earlier/later ordering, undo, clear, editable generated text and reset-to-phrase. These are source-observed controls, not fresh visual/device acceptance.
- Request state distinguishes checking, response and error; failed HTTP/network requests retain the editable draft. Questions may be sensitive even though this is public education. Browser history is memory-only; optional saved visit questions and AAC drafts are separate tab-storage features, not server transcript retention.
- Optional dictation adds recognized text for review. Browser voice/microphone processing is browser/provider dependent and may use network services. Do not promise offline speech or acoustic Bangla accuracy. Native/signed-ticket/bundled audio has text fallback; real service configuration and quality were not checked here.
- Hosted OpenRouter currently selects an allowed reviewed passage/question rather than writing unrestricted medical answers. Older documents emphasize a development Gemini selector; inspect `openrouter-intent.ts` and the current chat route before describing the active path. Exact aliases, BM25/trigram retrieval and fixed text differ materially from embeddings-based or generative clinical RAG claims.
- Corpus files contain source/version/locator/review basis and expiry/withdrawal logic. “Project reference check” with no named clinical reviewer is not clinician approval. The question bank is evaluation/routing material, not an approved clinical corpus. `IFTEE_CODE_QUALITY_REVIEW.md` reports 808 rows / 796 normalized questions and conflicting metadata; reconciliation is not established.

### Shonket: public safety and a distinct structured request workflow

- `SafetyHome`, `WarningSigns`, `WarningDetail` and the four allowed slugs serve pregnancy, labour-and-childbirth, postpartum and perinatal-mental-health. Unknown slugs are handled by the route. Emergency telephone and human-help actions do not depend on Barta.
- **Publication conflict:** `WarningDetail` currently renders `topicContent[slug].groups` with source and pending-review labels. `docs/qa/SHONKET_CLINICAL_REVIEW_CHECKLIST.md` and the source-verification report instead require unpublished fallback until approval. Pending labels do not resolve this policy difference. No named clinician/Bangla approval is present in the inspected content.
- `ConcernForm` compose controls: optional concern checkboxes and onset radios, required text/AAC/call preference, message ≤1,000 characters, optional AAC insert. Review lists the exact message/categories/onset/method and privacy disclosures. Confirm-and-send sends `language` and `reviewConfirmed:true` with the same UUID retry key. It displays returned ID and a history link. Ambiguous saves disable editing and offer the same-action retry; inputs are held in component memory, not a durable offline queue.
- **Shonket status semantics:** submission persists a request/assignment/queue receipt but returns `submitted`. An assigned simulated provider's explicit `open` persists `delivered`; explicit acknowledge persists `acknowledged`. This differs from Bondhon, whose atomic creation can return delivered immediately after queue persistence. Shonket Phase 01–05 has no response/close path; do not imply the five-stage Bondhon lifecycle applies.
- Current consent migration requires review, language, fixed 30-day request permission, no record fields and no replies. Revoke/expiry blocks the next provider operation; owner status history remains intact. Legacy requests lacking consent fail closed. Denied opens are audited in a bounded way. Database comments claim hosted application, but the referenced deployment evidence is missing locally.
- `MyRequests` loads at most 50 Shonket requests, shows event history/expiry/revocation and stops future sharing. `ProviderQueue` is mounted beside Bondhon on `/provider`, and opens/acknowledges Shonket requests. Retained AskForHelp/RequestReview/RequestStatus components represent an older cross-page path and must be traced separately.

### Jibonrekha: account records versus the richer local Lifeline demo

- Account Today uses `AccountRecords`, `LifelineArc` and `accountJourney`; controls open care guide, visit pack, measurement, records/history, pregnancy, baby, note and visit tasks. It displays a selected pregnancy, its date source, recent recorded visit, and distinct maternal/baby lanes. Missing or past-due dates do not manufacture a current gestational week.
- Add measurement chooses subject and correct pregnancy/baby destination, kind, exact value/unit and date, then reviews before saving. BP is two separate supported observations, not one inferred measurement. Notes and conditions are entered facts; mother input is not clinical confirmation. Server sets owner/provenance/synthetic mode.
- `AccountRecords.save` uses one Idempotency-Key for an unchanged payload, waits for `saved:true` and an ID, resets only after success, reloads records and focuses feedback. Forms keep values after failure, but durable offline/reload recovery is not an account feature. Some error wording says “Nothing was saved” for ambiguous failures; do not extend this to a guarantee about a lost server response.
- Record history filters subject/pregnancy/baby/kind/text, hides superseded rows from the active list, and follows correction links (bounded to 20) to retain original values/reasons. GET caps can omit older history; no complete longitudinal pagination is implemented.
- `CareGuide` uses shared `care-guide-data.ts` and dating helpers for weeks 1–41, day 0–6. Daily navigation does not create a daily test schedule. The PDF audit rejects automatic cutoffs, universal scans and delivery/safety conclusions. Clinical/local Bangla review remains required.
- `AccountVisitPack` starts empty, requires selection and review, then opens selected-only browser print/PDF. It excludes identity, diary and chat and does not transmit to Bondhon. It is not an AI summary or clinician-signed document.
- `/demo/jibonrekha` uses `LifelineExperience` with browser-only synthetic episodes, dates, records, corrections, drafts, visits and print. `/demo/jibonrekha/records` retains the old nine-section `RecordsWorkspace`. Demo metadata/storage and local permissions/audit are not the protected account backend. Never import them automatically on login.

### Bujhi: three different capabilities must stay separate

| Path | What actually happens | Persistence / limits |
|---|---|---|
| `/app/bujhi` report review | Image → local English Tesseract OCR or manual fallback → compare/edit hemoglobin, date, pregnancy, confirmation → commit | Maternal hemoglobin g/dL only, account RPC; raw field/hash and reviewed value retained; original image not uploaded by this path |
| `/demo/bujhi` | Exact bundled synthetic PDF, file signature/size/hash checked, fixed fixture fields selected → accept/correct/reject → understand → review/save | Local synthetic Jibonrekha only; not arbitrary PDF OCR; missing glucose unit blocks acceptance |
| `/demo/bujhi/legacy` / local fallback | `MedicalEntry` manual/image/voice → richer draft and field review | Device-local synthetic records, including ANC/ultrasound context; no equivalent broad account save |
| `/app/bujhi/kit`, `/demo/bujhi/kit` | No photo: choose strip/digital, timing, reading window, urgent symptoms, observed marks → fixed sourced explanation | Account education only; optional demo note saves self-reported text locally after separate review/consent |

- `upload-validation.ts` currently permits JPG/JPEG/PNG/WebP ≤10 MiB with extension/MIME/signature checks. Proposed PDF ≤5 MiB in `contracts/bujhi.ts` is a different contract, not the mounted account upload behavior. Earlier PNG ≤1 MiB/2,048px extraction-endpoint proposal is also not the current route.
- `ocr-service.ts` loads engine/core/English data from same-origin `/ocr`, via `scripts/copy-ocr-assets.mjs`; older reports saying runtime CDN are stale for this source. It maps line/word boxes and uses word confidence threshold 85. Low/unmatched digits need manual review; this threshold is not calibrated clinical accuracy. Worker assets need download; offline OCR is not guaranteed. Cancellation/crash/slow initialization completeness is unverified.
- `AccountReportReview` keeps an image preview, exposes other OCR fields as unsupported, and offers manual hemoglobin using the same source hash with empty raw value. It freezes an immutable payload for retries after uncertain saves; report UUID is replay identity. Changing values resets confirmation. There is no separate deployed review-upload/extract API in this flow.
- `bujhi_commit_reviewed_hemoglobin` is the narrow persistence transaction. The API accepts client-reviewed raw text/hash/value; it does not authenticate the source image or certify OCR. Do not describe the proposed full document/extraction/review identity model as implemented.
- The kit's previously missing urgent-symptom question is now before mark/result, and `explainKit` is called. Account mode does not save the demo kit note. hCG remains unsupported as a health measurement; never remap it to hemoglobin or another numeric kind.

### Shusthota: voluntary entries, not scoring or medical plans

- `Wellbeing` offers optional mood, energy, activity note and rest note; save needs at least one value. Prefer-not-to-say is an actual answer; skip is absence. Success refreshes `ShusthotaHistory`. APIs accept camelCase but return snake_case rows, capped at 100 with no pagination.
- `HydrationHabits` adds a bounded ml amount (1–5,000 per entry, not a prescribed target), creates personal habits, records completion/undo/archive events, and refreshes history. `ActivityPreferences` saves independent chosen activities; none cannot combine with other choices. These P1 tables have owner/synthetic constraints and retry keys.
- `PrivateDiary` is separate append-only storage. The design proposal's lock/export/delete/voice and deletion promises are not established by the mounted API, which exports only GET/POST. Do not promise deletion or secure shared-device locking.
- `ProviderWellnessSharing` creates exact-field wellness consents with explicit recipient/review, through Bondhon's APIs. It does not automatically send diary/check-in information. A grant is not evidence of a delivered care request or provider attention.
- Relaxation resources and clinician activity plans have publication schemas/gates but empty catalogs. AI trend summary has an interface/opt-in disclosure and unavailable state, not an active provider. Local descriptive history summaries are not AI diagnosis. Reminders currently offer a manual `.ics`, not push scheduling, quiet-hours execution or automatic SMS.
- Calendar caveat from source: `RemindersGuide` comments say tomorrow 10:00 Asia/Dhaka, but uses browser-local `setHours(10,0,0,0)` before UTC serialization. Behavior on a non-Dhaka device needs verification/correction before promising that time zone.

### Poth: source records, optional nearby lookup and visit preparation

- `PothFacilityExplorer` uses `/api/poth/facilities?view=discovery`; `discoveryStore` builds the server index once from registry and community JSON. Search supports word-order-independent terms, source/type/division/district/reported-access filters and 20-record pages. It initially displays six loaded records with show-more/fewer, not six total records. It has timeout/retry/stale-response handling.
- Nine individually source-reviewed DGHS identities cover the eight divisions, not a comprehensive registry import. Only 164 community features have recognized district tags. District filtering excludes unknown districts rather than guessing from names or approximate city. Registry and OSM can describe the same real place; no cross-source deduplication is claimed.
- Accessibility is reported available/limited/unavailable/unknown; missing means unknown. Neither registry identity nor an OSM maternity specialty verifies services, entrances, operating hours, wheelchair access or available appointments. `facilities.json` remains an empty separate reviewed-import API path.
- Nearby defaults to snapshot; explicit live mode queries Overpass, merges saved/live and falls back honestly. API validates Bangladesh search extent and radii 1–20 km, computes actual Haversine radius before rounding, caps 300 results and flags provider 1,200-element truncation. Cache/cooldown are process-local. Locations reach the app server, and in live mode the external map provider; do not claim zero coordinate retention in hosting logs. Map tiles load only when opened; text results are usable independently.
- “Prepare a visit here” passes published facility information into in-memory preparation. The eight checklist booleans can be retained in tab storage through `visitChecklist.ts`; facility/location/health text are excluded from that saved payload. Print is isolated; no booking or record sharing occurs. Saved Barta questions use a distinct session-storage helper (20 questions, 1,200 characters each).
- SOS is a dialer/copy/preparation tool; no automatic calling, dispatch, contact notification or location transmission to emergency services is implied. Broader evidence ladder, needs-first verified ranking, compare tray, full offline pack and reviewer back office in `POTH_V2_RUNBOOK.md` are proposals, not the present implementation.

### Bondhon: finite permission, evidence-backed status and withdrawal

- Mother home `SharingNow` groups current requests by recipient, shows expiry/previous sharing, and supports request-level or batched stop actions. Incomplete/loading/paginated results cannot prove “nothing shared.” Load more is significant: it is not a full-account permission census until complete.
- `CareRequestForm` has five stages: message/purpose/method → recipient → exact record fields/accommodations → duration/replies → review/approval. Nothing is selected by default; at most 20 records. Quick packs add named existing fields only. Share-again restores settings/recipient, not old clinical fields/message. Accommodation names request arrangements; they do not grant disability-based rights or promise those arrangements exist.
- Request permission is separate from individual record grants: message-only requests still require finite reviewed permission. Creation/assignment/grants/queue receipt/events/audit are atomic. Empty `consentGrantIds` does not mean approval can be skipped. Direct execution of an old creation RPC is restricted by forward migrations.
- `CareRequestDetail` shows timeline, receipt, approved fields, follow-up and owner-only grant/audit information. Provider queue uses New/In progress/Replied/All open filters. Acknowledge/respond/close require server revision/evidence. Reply permission grants no extra record fields. Closure is administrative, not medical resolution.
- Uncertain submission freezes payload/key and offers exact retry. A stale revision requires re-review. Per-request reconciliation, including mixed batch results and bounded four-write concurrency, avoids assuming disappearance from a page proves withdrawal. Tab closing/reload can lose in-memory retry state; inspect history before replacing an unconfirmed request.
- Revocation blocks later server calls; already read/downloaded/copied data cannot be recalled. UI refreshes at 30 seconds when visible, clears provider data on backgrounding/failure, and uses expiry ticks. It is not instant remote screen erasure or a real-time subscription guarantee.

## 12. Persistence, privacy and architecture map

| Boundary | Main code | Important limitation |
|---|---|---|
| Auth/session/config | `src/lib/auth/*`, `src/lib/supabase/*`, `src/proxy.ts` | HttpOnly server sessions; validate Auth/profile/membership for each protected operation; a client role is never authority |
| Domain contracts | `src/lib/contracts/*` | Shared Zod schemas; current API registry and proposed `api.ts` are distinct; DTOs are not SQL rows |
| Account health | `/api/jibonrekha`, `jr_save`, `20261119020000_jibonrekha_account_history.sql` | Separate subjects, append-only correction, retry receipt, capped reads; full prototype model not persisted |
| Reviewed hemoglobin | `/api/reports/commit`, `bujhi_document_reviews`, `20261119010000`, `20261119234616` | One maternal measurement, source hash/raw and reviewed values, manual provenance string; no stored original file |
| Wellness | `/api/wellness`, `/api/diary`, P1 hydration/habit/activity routes | Owner-only, synthetic and append-only; diary never a care scope; no delete/export contract |
| Care | `src/lib/care/{handlers,server}.ts`, schema `prohor_care`, `mvp_*` RPCs | Exact permission/assignment/projection/audit, simulated queue, no external clinician transport |
| Presentation | `access-preferences.ts`, Adapt runtime/mapping, reading store | Device choices and explicit account save; appearance is not medical or sharing data |
| Local demos | `features/jibonrekha/demo-health.ts`, `records-model.ts`, Lifeline/Bujhi demo code | Fictional browser storage, local permissions/audit and limited conflict checks are not secure server authorization |
| Public discovery | `features/poth/{discoveryStore,directoryCore,nearbyCore}.ts` and JSON | Static source index plus optional upstream query, separate verification from source presence |
| Speech | `audio-session.ts`, Adapt speech engine, Barta audio tickets/providers | Opt-in, browser/server-provider dependence; no guaranteed Bangla/offline capability |
| PWA | `src/app/manifest.ts`, `public/sw.js`, `components/pwa/*` | Narrow public caching, no clinical sync/background help queue |

`public/sw.js` cache v4 installs offline shell/icons and conditionally caches anonymous, successful, eligible `/safety` HTML with no query/cookie/private cache header. It excludes private/API/auth/chat data and Next bundles. This policy's source/tests do not prove that registration/install/offline reload works on a physical device. `next.config.ts` also enables client router `staleTimes` (dynamic 60s/static 300s); inspect actual session/sign-out/cache behavior when modifying private navigation, not just the service worker.

Migration history is forward-only and significant. There are 22 files at this snapshot, from foundation/preferences through roles/private/care, account history/report commit, coordination/hardening, Shusthota P1, manual-report provenance, PT409 conflict handling and Shonket workflow/consent. `supabase/proposals` and `supabase/reference/001_initial.sql` are not instructions to apply old schemas. Source presence and a migration comment do not prove hosted history. Do not reset or replay migrations to “fix” stale documentation.

Permission design uses distinct mother/supporter/provider identities, same-owner composite references, exact fields, finite windows and source labels. Clinical provenance is fixed by the server; simulated providers cannot magically create genuine clinician validation. Care audit/receipts avoid free-text clinical payloads. Retention/deletion, source rights, actual providers and real-data collection remain governance/integration decisions.

## 13. Documentation findings and unresolved questions to carry forward

| Question / discrepancy | Evidence and next check |
|---|---|
| Which current code is deployed? | Reports name several revisions and live/local environments; this checkout has uncommitted UI changes. Verify deployment SHA, exact origin and corresponding DB migrations before release assertions. No remote checked here. |
| Is Shonket draft publication intended? | Current WarningDetail displays source-linked draft groups; clinical checklist/source report say hold all draft content. Resolve with product safety/content owners; do not invent approval. |
| Are latest Shonket migrations applied? | SQL comments claim application, older QA says undeployed; referenced final deployment/source-register files are absent. Inspect actual history and supply missing evidence. |
| Barta AAC multi-sentence safety patch | Runbook describes sentence fallback/M2; current source lacks it, and existing gate probes in the prior reference returned no route for two specified combinations. Existing 57 unit tests do not establish those omitted cases or all 808 prompts. |
| NFKC bug and kit question from old handoff | Current safety source includes normalization fixes; KitExperience calls explainKit and asks urgent symptoms before result. Do not reapply old patches blindly. |
| Full reviewed document backend | Proposed PDF/review/extract endpoints and richer identity chain differ from current image + one-step hemoglobin commit. Choose scope explicitly before extending; no broad report-save claim. |
| Error/retry wording | AccountRecords can say nothing saved after an ambiguous failure; Shonket locks editing after uncertainty; Bujhi freezes the payload. Review each implementation rather than assume one universal retry policy. |
| Who owns each module now? | AGENTS, feature README, 14 Nov team blueprint, handoff and later V2/V3 assignments conflict. Preserve repository instructions; confirm the relevant handoff when ownership matters. |
| Typography authority | AGENTS says restrained families and no font files to users; design.md permits presets/optimized files. Actual homepage uses five next/font families; globals imports four Google families. Resolve policy and loading behavior before font changes. |
| Token drift | DESIGN_SYSTEM_REFERENCE reports Morning Mist differences from provisional tables; check actual CSS and measured pairs. Do not blindly replace current tokens with candidate hexes from a runbook. |
| Local/account preferences | Mapping exists, but full device-only choices are not cloud-synced. Nullable contrast and readAloud behavior need the current controller, not a new competing store. |
| Shusthota richer design | Pace/loss-sensitive language, durable drafts, structured sleep, diary lock/delete/export and scheduled reminders are not established by current mounted APIs. Catalogs empty; AI provider unavailable. |
| Calendar time zone | One-time .ics uses browser-local time despite a Dhaka comment. Test non-Dhaka device expectations before changing or promising it. |
| Poth coverage/verification | 7,544 source records, not unique verified hospitals; nine DGHS identities, unknown service/access data, unknown-district majority. Proposed 3,090-care-only index/evidence ladder is not the current directory. |
| Supporters | Scoped onboarding/invites exist; broad caregiver health access and real care-team delegation are not established. Naming a support person/accommodation does not grant access. |
| Clinical and native Bangla review | No named sign-off established across Barta, Shonket, care guide, kit and wellness content. Source links and synthetic tests are not substitutes. |
| Real-device and accessibility acceptance | Manual screen reader, braille/switch, physical phones, all combinations, native 400% zoom and low-bandwidth behavior remain incomplete. Do not claim certified or universal conformance. |
| Operational security | Older reports request key rotation and leaked-password protection; actual current dashboard state not inspected. Confirm through approved tools without copying credentials. |
| Real-data lifecycle | Synthetic-only constraints do not detect someone typing real text. Current demo warning is essential; append-only diary lacks real-data export/deletion lifecycle. No production health-data authorization is implied. |

The Shonket research source-verification report records **15 source-located, 13 partially verified, 3 conflicting** entries, all still needing clinical/translation publication approval. It corrects WHO source-title/ISBN and country-adaptation confusion and highlights labour-duration, postpartum symptoms and mental-health pathway context differences. These are research findings, not medical instructions. Its source citations were not independently re-fetched in this study. Do not publish candidate support numbers from research tables without verification.

## 14. Documentation coverage and where to look next

The review began with both requested primary documents, then the seven requested module/handoff files. Supporting documentation was examined for architecture, current-versus-historical status, evidence, conflicts and feature links. Large historical reports were navigated by relevant sections, tables, findings and verification limits; screenshots, original external canvases, PDFs/archives referenced by reports and external source pages were not independently re-reviewed. This reference is not a clinical literature review.

| Documentation group | Files / how to use |
|---|---|
| Product/team | Primary blueprint/context, `PROHOR_Team_Roles_Project_Blueprint.md`, `PROHOR-SESSION-HANDOFF.md`, `TEAM_HANDOFF.md`, `SPRINT_OMOR.md`, `OMOR_ISSUE_RESOLUTION.md`, `sprint/day-2-team-assignments.md`; goals, ownership conflicts and historical plans |
| Design | `AGENTS.md`, `design.md`, local PROHOR skill, `DESIGN_SYSTEM_REFERENCE.md`, all eight `docs/design-system/*.md` references and token/CSS definitions; provisional spec versus actual tokens/fonts |
| API/auth | `API_CONTRACTS.md`, `API_ME.md`, `API_PREFERENCES.md`, `AUTHENTICATION.md`, `CODE_MAP.md`, `PWA_PRIVACY.md`; many scaffold statements are historical; prefer current handlers/registry |
| Architecture | `architecture/{data-model,api-contracts,security,team-contracts,validation,OMOR_MVP_BOUNDARIES,CARE_BACKEND_REVIEW}.md`; broad proposals, actual route table, provenance/security and later activation notes |
| Backend evidence | `backend-completion/{handoff,requirements-matrix,verification}.md`; hosted/local distinctions, 74-check run, weak-ETag and PT409 fixes, historical dashboard state |
| Barta | `BARTA-ACCESSIBILITY-RUNBOOK.md`, `BARTA_COVERAGE_INTEGRATION.md`, `PROHOR-Barta-{API-Contract,Source-Register,ANC-Review,Evaluation,Functional-Preview}.md`, QA Barta integration/local and Iftee quality reports; lexical/selector model, citations, audio, M2 gap and review status |
| Bujhi | `BUJHI-MASTER-RUNBOOK.md`, `PROHOR-Bujhi-Extraction-Handoff.md`, `bujhi/{INTEGRATION,IFTY_DESIGN_IMPLEMENTATION,KIT_INTEGRATION,ReportReview-save-patch}.md`, feature `ENTRY_INTEGRATION`, `UPLOAD`, `V3_INTEGRATION`; distinguish account image, exact-PDF fixture and richer local review |
| Jibonrekha | `JIBONREKHA-LIFELINE-SPEC.md`, `jibonrekha/{ACCOUNT_LIFELINE_RESTORE_QA,LIFELINE_PDF_IMPLEMENTATION,CARE_GUIDE_PDF_AUDIT}.md`, feature `INTEGRATION`, `ARCHIVE_INTEGRATION_20261119`, `V2_QA`; account/demo split, date discrepancy, selective print, clinical guide limits |
| Shusthota | `SHUSTHOTASPEC.md`, QA `SHUSTHOTA_BACKEND_VERIFICATION`, `SHUSTHOTA_MODULE_COMPLETION_STATUS`, feature `P1-HYDRATION-HABITS-BACKEND-PROPOSAL`; old missing-water claims superseded by P1; reminders/content gates still limited |
| Poth | `POTH_V2_RUNBOOK.md`, `POTH_FINAL_48H_HANDOFF_20261118.md`, `NATIONWIDE_POTH_HANDOFF.md`, `poth/{DEPTH-UPDATE,FINAL-POLISH}.md`; research/proposals versus current server index/snapshot/live implementation |
| Bondhon | `BONDHONSPEC.md`, `bondhon/{IMPLEMENTATION,MOTHER-UPDATE,V2-INTEGRATION,QA_2026-11-19}.md` and evidence JSON; consent model, retry, loaded-list completeness, batch revoke and historical deployment mismatch |
| Shonket | `shonket/{SHONKET_MASTER_RESEARCH_REPORT,SHONKET_RESEARCH_REGISTER,SHONKET_SOURCE_VERIFICATION_REPORT}.md`, QA phase05 and clinical checklist; source/context/publication holds, now diverging from draft rendering and newer consent code |
| Integration/release QA | QA `CODE_REVIEW`, `DAY2_CODE_REVIEW`, Day3 scope/changed-files/fix/validation/pasted-review, `CURRENT_STATE_AND_NEXT_STEPS_2026-11-19`, Apurbo matrix/handoff, Omor setup/MVP/care/PDF checklists, `DEMO_READINESS_2026-11-20`, `M4_M5_COMPLETION_2026-11-20`; dated snapshots, not a single current readiness verdict |
| Visual history | QA homepage report, `homepage-care`, `hero-refinement`, `navigation-polish`, `navigation-redesign`, `pass-1`, `refinement`, `upgrade` READMEs/regression evidence; original marketing composition, automated reflow/axe/keyboard scope and untested devices |
| Test history | `docs/qa/day3-test-logs/*`, evidence JSON/measurements/accessibility trees, tests and runners; historical counts differ legitimately by snapshot. Existing screenshots are evidence artifacts, not newly inspected visual acceptance. |

Root README/START_HERE and several CODE_MAP/API/Supabase docs still describe the early two-table/stub scaffold. The current tree contains a lockfile, node_modules and a substantially larger migration/API set. `src/server` is only a suggested architecture path and is absent; server logic currently lives in routes, `src/lib` and feature server files.

## 15. Fresh verification for this expanded review

Executed on 20 Nov 2026 in `D:\prohor-omor-day3`, starting at `917c3c5` and ending at `b6351ed` with existing dirty application files. Contracts completed after the concurrent commit; typecheck/lint were repeated after it. Unit checks predate the commit, whose files do not change the tested pure safety/directory/status helpers.

| Check | Observed result | What it proves |
|---|---|---|
| `npx.cmd tsc --noEmit --incremental false` | Exit 0 | Current TypeScript checks, without rewriting incremental state |
| `npm.cmd run lint` | Exit 0, no reported warnings/errors | Current configured ESLint checks |
| `node --test tests/unit/*.test.mjs` | 57 passed, 0 failed | Existing unit coverage for safety routing/rate limit, Bondhon status/view and Poth directory/checklist/maternal tags |
| `npm.cmd run test:contracts` | 244 passed, exit 0 | Existing current contract/handler and included disposable SQL-adapter coverage; not hosted Auth/PostgREST/browser acceptance |
| Directory unit output | 7,544 indexed, 9 registry, 7,535 usable community, 164 tagged districts | Current code's source-index counts, not independent facility verification |
| Referenced final Shonket evidence paths | Both absent | `docs/qa/final-2026-11-20/{DEPLOYMENT_RECORD,SHONKET_SOURCE_REGISTER}.md` cannot substantiate comments locally |

No application code, migrations or tests were edited. No hosted write, migration, deployment, commit, merge, real login, provider contact or emergency call was performed. Full production build, full browser suite, real OCR/audio/GPS/provider calls, manual keyboard/screen reader and physical-device tests were not rerun for this documentation-only study. Older test claims in sections 3/5/6 are retained historical records, not additional fresh checks.

An application hash comparison detected the five files changed by the concurrent Barta/AAC commit; all other snapshotted files under `src`, `scripts` and `supabase` matched. These external changes were preserved. Remaining dirty tracked files at the final inspection were the pre-existing Bondhon live runner, AuthShell, app Bujhi page and four Bujhi components. This task's intended durable edit is only this reference.

CI (`.github/workflows/ci.yml`) uses Node 22, npm ci, lint, typecheck, contracts, build and selected contrast checks on develop/main. It does not supply full browser/device/clinical acceptance. `playwright.config.ts` starts/reuses dev unless `PROHOR_TEST_URL` is supplied; the contract configuration has no browser/server requirement. Poth's final browser tests use their separate config and are not automatically included merely because the default suite passes. Live acceptance scripts can create/revoke synthetic rows; inspect their side effects before running them. Local RLS/live-auth guards intentionally reject hosted targets.

## 16. Maintenance rules for the next task

1. Re-read the user's requested scope and this reference; check branch/HEAD/status and preserve other contributors' local changes.
2. Follow the mounted route to the actual component and current wire contract. Select the account, local-demo or public path deliberately.
3. For persistence/security work, inspect the current migration/RPC and actual approved environment history; source comments are insufficient deployment proof.
4. For UI work, apply PROHOR guidance and test the primary interaction and keyboard path, with relevant theme/text/Bangla/reflow/error states. Use semantic tokens; preserve drafts and autonomy.
5. For any claim of saving/delivery/review, identify the exact evidence and limitations. Never infer professional review, real providers or guaranteed accessibility from synthetic test success.
6. Update the relevant sections here with date, source path, verification scope and unresolved questions. Retain historical contradictions as history or explicitly supersede them with evidence. This file is reusable when accessible; no automatic cross-chat memory availability is assumed.
