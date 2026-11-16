# Where PROHOR code lives

Start here when changing the existing app. Keep routes in `src/app`, feature behavior in `src/features`, reusable contracts in `src/lib/contracts`, and rendering in `src/components`. The architecture documents describe planned backend work; they do not register services or routes.

## Active entry points

| Change                                       | Start in                                                                   | Notes                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Global HTML/metadata/styles                  | [layout.tsx](../src/app/layout.tsx), [globals.css](../src/app/globals.css) | Does not currently mount `AppChrome`                                                                             |
| Homepage route/fonts/CSS imports             | [marketing/page.tsx](../src/app/%28marketing%29/page.tsx)                  | Renders `Homepage`; owns pre-paint scripts                                                                       |
| Homepage composition/language/dialogs        | [Homepage.tsx](../src/components/marketing/Homepage.tsx)                   | Active top-level client component                                                                                |
| Hero, Adapt and roadmap sections             | [HomepageStory.tsx](../src/components/marketing/HomepageStory.tsx)         | Delegates to `HeroProductScene.tsx` and `RoadmapExplorer.tsx`                                                    |
| Module tiles/journey/team                    | [HomepageUpgrade.tsx](../src/components/marketing/HomepageUpgrade.tsx)     | Re-exports care sections from `HomepageCare.tsx`                                                                 |
| Local care/visit-question previews           | [HomepageCare.tsx](../src/components/marketing/HomepageCare.tsx)           | Local demos; no private records or provider delivery                                                             |
| Sample screens / shared visit-question state | [ProductScreens.tsx](../src/components/marketing/ProductScreens.tsx)       | `SharedVisitPhones` owns the three linked inputs and client-initialization guard; other screens show sample data |
| Homepage navigation/mobile menu              | [PublicNav.tsx](../src/components/marketing/PublicNav.tsx)                 | Uses `HomeContext`; homepage anchor navigation                                                                   |
| Homepage preferences                         | [HomePreferences.tsx](../src/components/marketing/HomePreferences.tsx)     | Existing v1 preferences plus homepage reading settings                                                           |
| Homepage copy                                | `home-content.ts` and active sections' `copy(...)` calls                   | The older `src/i18n/translations.ts` is not wired to this homepage                                               |
| Other public pages                           | `src/app/(marketing)/<page>/page.tsx`                                      | `(marketing)` groups files; it is not a URL segment                                                              |
| Offline cache policy                         | [public/sw.js](../public/sw.js)                                            | Never cache private records/API responses                                                                        |

Homepage CSS layers, in import order: `homepage.css`, `homepage-story.css`, `homepage-upgrade.css`, `homepage-refinement.css`, `homepage-polish.css`, `homepage-hero.css`, `homepage-navigation.css`, `homepage-care.css`. Check the final matching rule before adding another override. Brand tokens belong in `src/styles/prohor-tokens.css`.

## Server and contract boundaries

| Concern              | File                                                                | Current capability                                             |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Barta                | [api/ai/chat/route.ts](../src/app/api/ai/chat/route.ts)             | Strict question validation; 501 `not_connected`                |
| Care request         | [api/care-requests/route.ts](../src/app/api/care-requests/route.ts) | Strict starter message/method validation; always `not_sent`    |
| Health               | [api/health/route.ts](../src/app/api/health/route.ts)               | Checks auth/config; persistence remains unavailable            |
| API cache protection | [api-response.ts](../src/lib/api-response.ts)                       | Shared `jsonNoStore`, including errors                         |
| Auth callback        | [auth/callback/route.ts](../src/app/auth/callback/route.ts)         | Code exchange, local return path, no-store redirects           |
| Redirect guard       | [routes.ts](../src/lib/routes.ts)                                   | `safeAuthReturnPath`; does not authorize private record access |
| Supabase             | `src/lib/supabase/`, `src/proxy.ts`                                 | Server/browser clients and session refresh                     |
| SQL history          | `supabase/migrations/001_initial.sql`                               | Illustrative starter, not deployed Step 7 schema               |

Files under `src/lib/contracts/` each own one domain:

| File                                            | Responsibility                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| [common.ts](../src/lib/contracts/common.ts)     | IDs, dates, provenance, minimal shareable provenance, response types     |
| [adapt.ts](../src/lib/contracts/adapt.ts)       | Proposed account v2; local v1 remains in `src/lib/access-preferences.ts` |
| [health.ts](../src/lib/contracts/health.ts)     | Mother/baby records and subject-specific measurements                    |
| [wellness.ts](../src/lib/contracts/wellness.ts) | Check-ins and separate owner-only diary                                  |
| [sharing.ts](../src/lib/contracts/sharing.ts)   | One field definition for consent scopes and provider projections         |
| [bondhon.ts](../src/lib/contracts/bondhon.ts)   | Consent grants, care requests, provider DTOs, events/lifecycle           |
| [barta.ts](../src/lib/contracts/barta.ts)       | Sources, citations, grounded/abstained response shapes                   |
| [bujhi.ts](../src/lib/contracts/bujhi.ts)       | Supported synthetic upload, unchanged raw OCR, review/commit payloads    |
| `poth.ts`, `shonket.ts`, `platform.ts`          | Facility, reviewed safety, profile/role/audit shapes                     |
| [api.ts](../src/lib/contracts/api.ts)           | Type-only proposed route payload map; does not create endpoints          |
| [index.ts](../src/lib/contracts/index.ts)       | Public exports; old sharing imports from `bondhon.ts` remain compatible  |

Runtime validators should be imported from their owning file; use `import type` for DTOs. Infer types from schemas instead of maintaining competing interfaces. `safeExtend` preserves refined object checks; copying `.shape` discards those checks. Dependencies flow `common -> health/wellness -> sharing -> bondhon`; `api.ts` imports only types. Validation cannot replace database ownership/consent checks or clinical source review.

## Retained references

`AppChrome.tsx`, `AccessPreferencesPanel.tsx`, `HomeStory.tsx`, `PassOneStory.tsx`, `ProductExhibits.tsx`, `PublicFooter.tsx`, PWA install/registrar components and the `src/features/{auth,barta,bondhon}` starters are not mounted by the current route tree. Editing them does not change the active homepage. `src/app/(mother)/demo.tsx` is not a route; Next.js requires `page.tsx`.

These files retain earlier work. Integrate an intentional route and test it before treating a reference as working. Do not add duplicate module folders/schemas. Planned modules and ownership decisions are in `docs/architecture/team-contracts.md`.

## Checks

Run `npm run typecheck`, `npm run lint`, `npm run test:contracts`, `npm run test:e2e`, and `npm run build`. On PowerShell with script execution disabled, use `npm.cmd`.

Contract tests need no browser/server. E2E excludes those tests; `PROHOR_TEST_URL` selects an explicitly started server without launching another dev server. `PLAYWRIGHT_CHANNEL=msedge` selects installed Edge. See [the code review report](qa/CODE_REVIEW.md) for actual results and limits.
