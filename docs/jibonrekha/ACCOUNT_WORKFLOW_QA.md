# Jibonrekha signed-in workflow review

20 November 2026 · synthetic account data only

## Source and user job

The supplied *PROHOR for a disabled mother full workflow, gaps and upgrades.pdf* was treated as review evidence, not as an instruction source. Its Jibonrekha findings (page 5) call out signed-in records, labelled entry, draft retention and limited browser validation. The cross-cutting findings on pages 7–11 and 16 call for Bengali and assistive-technology testing with actual users. The screenshot shows a saved-date pregnancy arc beside a recent visit. The user's reported failure was that selecting a week in the guide did not update that arc.

A mother should be able to find her current record, browse a chosen educational week, enter information into the right mother or baby record, review it, and see truthful save status. Private records require sign-in. Educational week browsing must not rewrite clinical dates.

## Implemented path and states

1. Overview shows the selected pregnancy, date-derived week when available, recent visit from that pregnancy, and an account-only privacy statement. The week and arc sit in document flow so larger Bengali text cannot overlap the drawing.
2. The guide's week and day controls update the overview's arc when the mother returns. A visible **preview** label distinguishes this from the week derived from the saved date. The due date remains shown separately. A reset button returns to the record's current calculated week. Selections are remembered per pregnancy during the open page session. No date is invented when records lack usable dates.
3. The entry task has three explicit steps: choose mother or baby and context; enter a measurement, unit and date; review destination, value, date and self-reported source; then save. Baby entries require an explicit baby choice. The parent form remains mounted while access preferences open, retaining the draft.
4. The server response must confirm a saved ID before the UI reports success. Network uncertainty leaves the review on screen; retry reuses the exact payload and idempotency key. A confirmed rejection shows the server message. Recent visits, printed packet rows and personal histories use pregnancy context.

The weekly guide links to Bujhi for report review. A visit packet remains a user-selected print/PDF action; it does not send data to a provider. Emergency help uses the reviewed public safety route.

## Cross-module route audit

Audited all JSX links and navigation in `src/features/jibonrekha`, including the signed-in account view and both retained demos. The earlier demo had a Poth button opening `/poth` and Bujhi links opening `/demo/bujhi`; those now open the integrated app routes. The older `/faq` emergency links now open `/safety`. The detailed-demo shortcut in the lifeline demo now opens the signed-in Jibonrekha account instead of another demo.

| Destination | Jibonrekha link | Existing app implementation |
| --- | --- | --- |
| Poth | `/app/poth` | `PothDirectoryMvp` with `embedded` layout; the public `/poth` uses the same component |
| Bujhi | `/app/bujhi` | Signed-in account report review |
| Bondhon | `/app/bondhon` | Signed-in consent and care workspace |
| Shusthota | `/app/shusthota` | App overview |
| Jibonrekha account | `/app/jibonrekha` | Signed-in account records |
| Safety | `/safety` | Public reviewed help, intentionally reachable without sign-in |

Barta has no outbound link in the current Jibonrekha screens; its integrated route is `/app/ask`. External clinical-source links in the week guide remain direct source links, and the demo brand link still goes to the public home page. The browser-only demos do not transfer their local sample records into signed-in modules; the detailed demo says this explicitly next to its Bujhi link. No module UI needed to be copied because all referenced `/app/...` destinations already exist.

## Layout and component tree

At 320–430 CSS px, header actions wrap, the journey panel is a single column, then recent visit, privacy, steps, entry action and mother/baby history. At desktop widths, the journey panel and visit/step cards form two columns. The arc is decorative and the exact week is in text. Components: `AccountRecords` → `LifelineArc`, `CareGuide`, `AccountVisitPack`, `AccessPreferencesControl`. Semantic theme tokens supply surfaces, text, borders and focus.

## Verification

Automated synthetic browser QA: `node scripts/test-jibonrekha-account-ui.mjs` against `npm run dev` on `http://localhost:3000`. The test mounts the real account component on a temporary local route, intercepts its API, and removes the route afterward. It covered keyboard entry, guide week/day to arc preview and reset, switching pregnancy and visit scope, explicit baby choice, three-step review, draft retention when preferences open, confirmed save, uncertain network retry with the same idempotency key, 320/360/390/430/768/1024/1440 widths, 200% root text at 320px, three themes × normal/strong contrast, and axe WCAG 2.x automated rules. The test uses fictional records. Screenshots: [mobile](qa/overview-mobile.png) and [desktop](qa/overview-desktop.png).

Existing journey, arc, guide-data, account-history and database ownership/idempotency tests passed (12 tests). `npm run typecheck -- --incremental false`, `npm run lint` and `npm run build` passed. The production build includes `/app/jibonrekha`; an authenticated live account was not exercised in this QA run.

The routing pass also exercised links in the lifeline demo, detailed records demo and signed-in account fixture. Poth, Bujhi, Shusthota, Bondhon, the Jibonrekha account shortcut and public safety links resolved to their intended route values. An unauthenticated request to `/app/poth` returned the expected sign-in redirect; the public lifeline demo returned HTTP 200.

## Status and limits

**Working in the local account component with a mocked API:** guide preview, review flow, scoped overview/packet/history, truthful save messaging and draft retention in the preferences dialog. **Limited:** the current account form can create pregnancy records but cannot edit dates in an existing pregnancy; guide selections are session-only. The date-derived arc is an estimate based on recorded dates, not a clinician-confirmed gestational age. **Not tested here:** a live authenticated Supabase account, NVDA/VoiceOver or braille hardware, soft keyboard and 400% browser zoom on physical devices, and usability with mothers with varied access preferences. Automated axe checks and synthetic browser tests are evidence for the tested paths, not WCAG certification or a clinical validation claim.
