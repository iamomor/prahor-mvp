# Poth final workflow and presentation update

## Baseline and scope

Prepared against the installed Poth feature contents from the prior depth-update package and the user's successful e506f64/64e29d9 validation logs. The installer checks actual affected-file contents rather than assuming the entire repository is at one historical commit. It preserves unrelated team work, environment files, API contracts, source data, authentication and SQL. Public /poth, /find-care and embedded PothDirectoryMvp entry points remain unchanged. The previous depth-update documentation is historical; the current behavior below supersedes its description of checklist persistence and screen layout.

The supplied M7-poth.rar contains M7_POTH.md and M7-poth.patch, attributed there to Samin. Its maternity-specialty change and three tests are integrated. Do not apply that patch a second time after this installer. If the exact supplied patch is already installed, matching files are recognized as current rather than overwritten.

## User's job and screen hierarchy

A mother can find a place, inspect its evidence and prepare for a visit without granting location permission or sharing health records. The same controls support keyboard use and combined access preferences. There is no ability-based care classification.

1. A short welcome and three task links; emergency calling remains directly reachable.
2. Find a place: name and area first, a quick women/maternity tag filter, and optional additional filters. Six initial cards, explicit expansion/collapse and pagination.
3. Look nearby: city or optional GPS, one primary search action. Coordinates, live refresh and privacy explanation are optional disclosures. The map starts closed; a list is always available.
4. Prepare a visit: chosen place, existing Barta questions, eight checks grouped into visit confirmation, access/communication and bring/plan. Explicit tab-save, print and clear actions.
5. Secondary facility-type explanations, emergency contacts and separate Barta/Bondhon links.

Facility cards show name, recorded area/type, source category and the next useful action. A short visible sentence says services/access are not independently verified. Detailed contact/access evidence and source links remain available inside each card. Dataset counts and completeness/district explanations sit under Sources & coverage. Expanding a result list focuses the first newly revealed card; collapsing returns to the heading. Removing a chosen place and switching SOS display/edit modes also preserve a useful keyboard focus target. OpenStreetMap attribution and ODbL link remain visible; they have not been hidden to make the layout cleaner. Font sizes remain readable; compactness comes from reducing repeated paragraphs and controls, not tiny text.

## Data and maternal-tag behavior

All 7,535 existing community features and all nine DGHS profile records remain unchanged. Counts are source records and may include multiple sources for one real place; no cross-source unique-facility claim is introduced.

The classifier accepts obstetrics, gynaecology, gynecology and maternity as mapped specialties, including semicolon/comma-separated lists. OpenStreetMap documents gynaecology as obstetrics and gynaecology: https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality . On the supplied extract the mapped maternal category changes from 1 to 25 records. The UI labels this women's/maternity care based on tags. It does not infer services from names or claim current maternity, delivery or emergency capability. Every community listing remains unverified; registry identity does not certify accessibility or service availability.

## Preparation storage and consent

Saving is explicit, optional and tab-scoped. The new sessionStorage key prohor-poth-visit-checklist-v1 stores only a version and exactly eight booleans. It stores no facility, location, health text, messages, questions, actor identity or timestamps. On reload a validated saved checklist is restored; malformed, oversized or unsupported state is ignored. A user edit made before restoration prevents a late restore from replacing the edit. Clearing removes saved checks when possible and reports storage failure honestly. Leaving without saving loses changed checks; a previously saved version may remain until cleared or the tab closes.

Selected facilities are in-memory only. Barta questions retain their existing separate tab-storage behavior. Printing creates a temporary isolated print root, replaces checkbox inputs with their checked marks and removes action buttons. It does not book, contact, grant access or submit a care request. Bondhon remains a separate explicit consent journey.

## SOS correction

The existing SOS form used entered values to decide whether to leave edit mode, causing the first typed value to hide an unsaved form. Edit mode now stays open until Save is explicitly selected; validated stored values initialize display mode. Clearing returns to edit mode. Clear/copy controls wait for initial storage loading. A storage-removal failure no longer claims the saved copy was deleted. Emergency 999 calling stays visible; optional trusted-contact/address editing is disclosed separately. No automatic alert or ambulance dispatch is introduced.

## Working, limited and unverified

Implemented: source-labelled saved directory, 6-result previews, maternal-tag matching, saved/live nearby modes, manual/GPS fallback, optional map, visit selection from either result list, grouped checklist, explicit tab-save/restore/clear, print view and SOS edit correction.

Limited: district filtering needs a recorded district; only 164 community records in this extract carry recognized district tags. Saved community collection time was not supplied in the source export. Distances are straight-line distances to mapped points/centres. Public map providers may fail or rate-limit. Current services, opening hours, accessibility, contact reachability and clinical qualifications are not independently verified.

Not offered: appointment booking, emergency dispatch, staffed clinician monitoring or a claim that the dataset is 100% verified. No numerical perfection/WCAG certification score is asserted.

## Validation evidence

Completed in this environment:

- 20 native Node regressions pass: 13 discovery/source-safety tests, 3 supplied maternal-tag tests and 4 checklist serialization/privacy tests.
- Existing snapshot audit confirms 7,535 unique OSM features; the extract is unchanged.
- Updated TS/TSX sources and the browser-test/config sources parse; CSS class bindings and git diff whitespace checks pass.
- Installer preview/apply/reapply, LF/CRLF handling, original-file backup, conflict preservation and unified-patch reproduction are checked before delivery.

Not completed here: full repository TypeScript/lint/production build, browser layout/keyboard acceptance, live provider availability, printer/device checks, screen-reader review or testing with actual disabled mothers. The locked application dependencies are absent here, and a current system Chromium launch failed because the environment denied its process-singleton socket. These limits are release gates, not passing results.

## Windows validation and preview

Stop localhost before code checks/build. Run:

```
node scripts/poth-depth-check.mjs
```

Then build directly in PowerShell using node --trace-uncaught --trace-exit .\node_modules\next\dist\bin\next build --webpack and capture its exit code. Code 0 means the build passed; trace-exit's red code-0 message is not a failure. Keep generated next-env.d.ts/.next files out of feature commits. Do not edit generated route validators.

Start the production preview in one terminal:

```
node .\node_modules\next\dist\bin\next start -p 3017
```

In another terminal run the seven browser checks against that server:

```
node .\node_modules\@playwright\test\cli.js test --config=playwright.poth.config.ts
```

The browser checks use installed Google Chrome by default, isolated synthetic contexts and the public Poth page. They test six-card expansion/collapse with keyboard, the maternal filter, ordinary city search without coordinates/automatic tiles and simulated GPS denial, failed nearby search, tab-save/reload without facility persistence, SOS editing, and widths 320/360/390/430/768/1024/1280/1440 plus enlarged text. They are not included in unrelated default *.spec.ts suites. POTH_BASE_URL can select another local preview origin; POTH_BROWSER_CHANNEL can select an available Playwright browser channel. If Chrome is not installed, configure an available browser rather than treating a launch failure as a product-test result.

Also inspect print preview, shared themes/high contrast, screen-reader announcements, actual location denial and Barta's existing saved-question handoff. Confirm source details remain reachable and no bookings/sharing are implied. Compare the public page and signed-in embedding. Commit only the final package manifest paths on your own Iftee branch after these checks; fetch and review the current PR base before pushing. Never force-push to resolve a conflict.
