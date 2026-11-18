# PROHOR code review and fixes

Date: 16 November 2026 (Asia/Dhaka). Scope: repository entry points/imports, shared Step 7 contracts, current API/auth handlers, and the existing browser regression suite. This is a focused code/runtime review, not a claim that every file or future healthcare workflow is bug-free. Start with the [code map](../CODE_MAP.md) to find active and reference files.

## Reproduced defects and changes

| Priority | Finding / reproduction | Fix and regression evidence |
| --- | --- | --- |
| P1 | Auth callback accepted `/\\external.invalid`; resolving it as a URL redirects off-site. Its failure destination `/sign-in` also had no page | `src/lib/routes.ts` rejects external/backslash/control/normalized double-slash paths. Callback falls back to the existing public entry, catches exchange failures and disables caching. Pure return-path tests + HTTP callback test |
| P1 | Validating raw OCR changed `" 10.00 "` to `"10.00"`, losing original extraction evidence | `bujhi.ts` validates raw strings without trimming. Regression failed before the fix and now compares exact raw labels/values/units |
| P2 | Saved wellness schema accepted a record with every check-in field null because copying `.shape` dropped the request refinement | `wellness.ts` uses `safeExtend`, retaining the nonempty check. Regression failed before the fix |
| P2 | Stored consent schema accepted owner = grantee despite the documented rule | `bondhon.ts` validates this invariant on the complete stored grant. Request handlers still need the authenticated owner check. Regression failed before the fix |
| P2 | Provider projection `{fields:{label:undefined}}` passed validation but serialized as empty fields | Sharing requires at least one defined selected value; explicit null is valid. Negative and positive partial-sharing tests |
| P2 | Baby measurement types allowed maternal-only kinds; observation request types allowed a fetal reading on a maternal destination despite runtime rejection | `health.ts` uses subject-specific measurement/observation unions. Compile-time assertions failed before the fix and now pass alongside runtime subject/unit tests |
| P2 | Early API errors lacked `no-store`; starter schemas silently discarded unknown sensitive/status fields | Existing routes use `jsonNoStore` on every outcome and strict subsets of shared field validators. Three initial HTTP tests failed before correction; the final four checks cover handlers and callback. Legacy valid starter payloads still return honest 501 states |
| P2 | Email sign-in could remain busy after a thrown network/configuration failure and requested a nonexistent `/app` destination | Existing reference component uses try/catch/finally, preserves email, and returns through the current public entry. Typechecked/built; actual email exchange not exercised |
| P2 | After reload, a fast fill before client initialization could prepend text to the server-rendered sample instead of replacing it. Captured input events already contained the unwanted sample before the change handler ran | Shared visit inputs are read-only/busy until client initialization, then become editable together. A no-JavaScript/initialized-state check and repeated draft-preservation workflow cover the guard |
| P3 | Consent allowlists/provider fields duplicated the same definitions, permitting future drift | `sharing.ts` derives scope keys and projection schemas from one set of domain field validators. `bondhon.ts` re-exports old names for compatibility |
| P3 | E2E discovered pure contract tests again and attempted a local server even with an explicit external test URL | E2E excludes `tests/contracts`; an explicit `PROHOR_TEST_URL` disables local-server startup |
| P3 | Existing browser test searched for the incorrect text `Higher contrast ? independent of theme`; full-page axe could sample a decorative entrance mid-fade | Use the semantic checkbox name without fragile punctuation; sample stable colors with reduced motion. Separate hero tests still verify animation and pause/reduced-motion behavior. No accessibility rule was excluded |
| P3 | Starting the installed Next.js development server appended generated instructions to the hand-maintained `AGENTS.md` | `agentRules:false` uses the installed version's documented configuration; generated block removed while all PROHOR instructions remain unchanged |

The four new runtime contract regressions were observed failing before correction. Type assertions also exposed the measurement mismatch. Existing passing tests alone were insufficient to catch those gaps.

## Local server finding

The previously running development process served markup but failed its HMR WebSocket handshake; client controls did not initialize. A fresh production instance on port 3100 initialized them without errors. After verifying the original process belonged to `D:\prohor`, it was restarted on port 3000. The same preference-dialog interaction then succeeded with no browser errors. No application/UI workaround was retained for that transient process state; the exact underlying cause was not established.

## Verification

Final command results are recorded below after execution. Browser tests use installed Microsoft Edge because Playwright's bundled Chromium is not installed here.

| Check | Result |
| --- | --- |
| `npm.cmd run test:contracts` | **29 passed**, including original cases and new runtime regressions |
| `npm.cmd run typecheck` | Pass, including compile-time measurement and consent-field assertions |
| `npm.cmd run lint` | Pass; the previous PostCSS export warning was corrected |
| `npm.cmd run build` | Pass after final changes; optimized build and all 17 static pages generated |
| Existing production browser suite | 33/35 passed initially; remaining stale-label/transient-animation tests passed after test corrections |
| Full final browser suite on restarted dev server | **36 passed** in Edge with two workers, including the added initialization guard check |
| Repeated reload/draft and initialization tests | **6 passed**: each workflow repeated three times after fixing the input race |
| Contrast sample script | All 18 configured token pairs pass; not a whole-product accessibility certification |
| Whitespace / local links | `git diff --check` passes; eight documentation files checked with no broken local links |

The browser suite includes API failure states, keyboard interactions/focus return, preserved drafts, Bangla, three themes plus independent contrast, 320–1440px reflow/200% text, reduced motion/forced colors, axe, offline feedback and stale-worker recovery. These are automated checks, not manual screen-reader or real-device certification. The restored development server remains available on port 3000; the temporary production verification server on port 3100 was stopped.

## Maintained structure and remaining limits

Existing app/component/feature folders were retained. Small shared helpers own cross-cutting behavior; domain schema files retain narrow responsibilities. Duplicate legacy API documentation was replaced with a pointer to the canonical contract. Earlier unmounted components were documented rather than deleted. No public deployment, repository push, migration or new care feature was performed. Existing `.env.example` edits were left untouched.

AI generation, private-record persistence, provider delivery, database RLS/Storage policies, clinical source/fixture review, live email sign-in, real-phone behavior and manual screen-reader use remain unverified or unimplemented as documented. TypeScript/Zod checks do not authorize records or prove medical grounding. See [architecture/security.md](../architecture/security.md) for the database/integration release gate.
