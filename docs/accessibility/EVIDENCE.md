# PROHOR accessibility — evidence and status

**Source of truth for what is verified.** Last updated 20 Nov 2026, on branch `apurbo-mvp` (HEAD `3988bab`, with uncommitted STEP 02–05 work).

**Target:** WCAG 2.2 AA. **Not claimed:** WCAG certification or conformance, full screen-reader support, switch or braille hardware support, clinical validation of Barta, or testing with disabled users. None of these has evidence yet.

How it is built: [README.md](README.md). What still needs people and devices: [VALIDATION_PLAN.md](VALIDATION_PLAN.md).

## Evidence levels

| Level | Meaning | Have it? |
|---|---|---|
| Implemented | Code exists in the app | Yes, for everything listed below |
| Automated-tested | An existing test checks it and passes | Yes, where named below |
| Code-reviewed | Read and checked by the developer or AI assistant in STEP 05 | Yes |
| Human-reviewed | Bangla, clinical, Easy Read or user review | **No** |
| Hardware/AT-tested | Real screen reader, switch or braille device | **No** |

## Test results (20 Nov 2026)

| Command | Result |
|---|---|
| `node --test tests/unit/*.mjs` | **63 / 63 pass** |
| `npm run test:adapt` (presets, Access Card, shared-device isolation, Easy Read) | **25 / 25 pass** |
| `npx playwright test --config playwright.contracts.config.ts` | **243 / 243 pass** |
| `npx playwright test --workers=1` (full default browser suite) | **139 / 148 pass; 9 fail, all pre-existing (below)** |
| `npm run typecheck` | clean (when no dev server is running at the same time; see notes) |
| `npm run lint` | clean |
| `npm run check:contrast` | **18 / 18 pass** |
| `git diff --check` | clean |

### The 9 failures: pre-existing on untouched HEAD

In STEP 03 these were reproduced by running HEAD's own tests against an untouched HEAD copy. They are unchanged in this run.

| Test | Classification |
|---|---|
| `barta-audio.spec.ts` › dictation fills an editable draft… | Pre-existing; fails on HEAD |
| `barta-audio.spec.ts` › read aloud waits for an available Bengali voice… | Pre-existing; fails on HEAD |
| `mvp-functional/care-request-contract.spec.ts` (6 tests) | Pre-existing; the API returns 403 where the test expects 501 |
| `public-assets.spec.ts` › old worker cannot keep serving stale development CSS | Pre-existing; service-worker cache test |

- **Flaky:** `barta-poth-handoff.spec.ts` failed once in STEP 03 (on HEAD and on this branch); it passed 3/3 on repeat and passed in this run.
- **Regressions from STEP 02–05:** none found.

**Environment notes:**
- Run Playwright with `--workers=1`. Several workers cause first-compile timeouts on the dev server.
- `npm run typecheck` can fail with `.next/dev/types/... routes.js` if a dev server is regenerating types at the same time. That is a race, not a code error.
- `next dev` rewrites `next-env.d.ts`; do not commit that change.

## Barta safety evidence (highest priority)

| Check | Verified result | Evidence |
|---|---|---|
| AAC catalog | 24 → **36** items; the original 24 are equal field for field to committed HEAD | `tests/unit/aac-catalog-safety.test.mjs` |
| 12 new items | Unique ids; English and Bangla words (never emoji-only); route as ordinary messages alone; never hide a danger sign when combined | same |
| AAC combinations (M2 kit table) | fever+weakness and swelling+headache → urgent care; bleed+urgent, pain+belly+urgent, baby_movement → urgent; anxious, help+doctor → normal; English and Bangla | same, plus `tests/barta-safety-api.spec.ts` (full chat pipeline) |
| Clarification steps | bleed+pelvis → bleeding clarification; headache+dizzy → headache follow-up | `tests/barta-safety-api.spec.ts` |
| 65-phrase safety run | 64 gate phrases route as recorded; the 1 clarification phrase is left to its own stage | `tests/fixtures/barta-safety-65.tsv` (copied from the M2 kit) |
| 808-question bank | **0 routing changes** against a snapshot taken before the STEP 04 change (47 escalated: 38 urgent, 3 crisis, 3 mental health, 3 out of scope) | `tests/fixtures/barta-bank-escalations.tsv` |
| Existing danger signs | 7 / 7 | `tests/unit/barta-danger-signs.test.mjs` |
| Escalation-only | Code-reviewed: new rules are extra `OR`s on the urgent condition; `routeBySentence` returns only crisis or urgent, and only when nothing else routed | `src/features/barta/safety-gate.ts` |

**Fixture limitation:** the question bank has duplicate ids (168 ids appear more than once), so the bank fixture is keyed by **row position**, and each row also checks that its id still matches. If the bank is reordered or rows are inserted, the test fails. That fixture must then be regenerated from a **pre-change** snapshot and re-verified. Never regenerate it after a routing change to make it pass.

**Clinical status: not clinically reviewed.** The automated results show consistency with the recorded baseline, not clinical correctness. Required review: [VALIDATION_PLAN.md §2](VALIDATION_PLAN.md#2-clinical-review).

## Module by module

"Automated" means a passing existing test. Every module below **still needs** real screen-reader, keyboard-only and user testing ([VALIDATION_PLAN.md](VALIDATION_PLAN.md)).

| Module | Implemented | Automated evidence (route) | Known gaps |
|---|---|---|---|
| **Adapt** | Shared preferences; device/account ownership; `null` never sent as `false`; shared-device isolation; cross-tab updates; presets (preview/apply/undo); Access Card (not stored, printable, urgent card); Easy Read registry | `test:adapt`; `adapt-foundation`, `accessibility-modules`, `accessibility-integration`, `inclusive-interactions` (`/accessibility`); `day3-integration` | 0 approved Easy Read entries; Bangla copy not native-reviewed |
| **Barta** | Typing, voice, AAC (36 symbols), topics; answers announced; urgent replies text-first with `role="alert"` and Call 999; Listen only on press; AAC safety fix | `aac-catalog-safety`, `barta-danger-signs`, `barta-safety-api`, `barta-integration`, `day3-integration`, module matrix (`/ask`) | Clinical review of 2 rules; 2 pre-existing `barta-audio` failures |
| **Shonket** | 999 / 16263 as text links, digits follow the language; human help without AI; Listen only when chosen; focused view keeps safety actions | `shonket-phase1/2`, module matrix and integration (`/safety`) | Warning detail pages await reviewed content; signed-in request flow not browser-tested |
| **Jibonrekha** | Labelled fields with linked errors; drafts survive preference changes | module matrix and draft test (`/demo/jibonrekha/records`) | Signed-in workspace not browser-tested |
| **Bujhi** | Labelled manual entry; OCR progress no longer re-announced every percent; extracted values labelled | module matrix and draft test (`/demo/bujhi`) | Signed-in review/save flow not browser-tested |
| **Shusthota** | Hydration error linked to its field, marked invalid and focused | **None**: every route needs sign-in | Code-reviewed only |
| **Poth** | Text list as the main view; result count announced politely; works without location; map labels translated | `adapt-foundation`, module matrix and integration (`/poth`) | |
| **Bondhon** | Optional closed-list accommodation requests, worded as requests on both sides; validation focuses the error; no diagnosis field | contract check in `inclusive-interactions`; intro route (`/bondhon`) in module matrix | Mother workspace and provider queue need sign-in; not browser-tested |

**What "module matrix" covers:**
- axe (WCAG 2.0/2.1/2.2 A/AA rules): no serious or critical violations;
- no page-level sideways scroll at 320px;
- three preference sets: default; all large/high-contrast/spacious/calm settings; compact in Bangla;
- headings grow with text size;
- no endless animation with reduced motion;
- visible keyboard focus in all three themes.

**What it does not cover:** it checks one public route per module and does not prove other screens.

## Switch and braille readiness

- **Code-reviewed and automated-checked on 7 routes:** every focusable control has a name; no drag-only control; no click-only `div`/`span` (`inclusive-interactions`).
- **Not tested on hardware:** no switch, braille display, TalkBack, NVDA or VoiceOver session has been run. Support is not claimed.

## External validation

| Gate | Status |
|---|---|
| Native Bangla review (12 AAC phrases, Easy Read draft, card/preset copy) | Not done |
| Clinical review (2 ported Barta rules, clarification steps) | Not done |
| Easy Read review with a person with intellectual disability | Not done (0 approved entries) |
| TalkBack / NVDA / VoiceOver, Bangla speech output | Not done |
| 200% text / 400% zoom, forced colours (manual) | Not done (automated 320px only) |
| Switch and braille hardware | Not done |
| Testing with ≥ 2 mothers per target group | Not done |
| Worksheet sign-offs R2 (clinical), R3 (Bangla), R4 (accessibility) | Unsigned |

Record each result here with date, tester, device and a link to the notes.
