# Poth discovery integration

Baseline: the user-supplied PROHOR-Poth-Latest-e38e456.zip, exported from main commit e38e456 after merging it into iftee-lastminute. Only listed Poth feature, API, contract, test and documentation files are changed. Authentication, SQL, environment files, shared layout/theme tokens, Bondhon, Barta, Jibonrekha and the original 7,535-feature OSM snapshot are not edited.

## User journey

Public /poth and embedded PothDirectoryMvp retain their existing entry points. /find-care continues redirecting to /poth. The host supplies the main landmark. One saved directory appears first, followed by optional nearby lookup, visit preparation, expandable care-type explanations and existing emergency information. Shared language settings remain the source of presentation preference. Search and preparation do not require a clinical profile.

The directory searches 7,535 existing community features plus nine source-reviewed DGHS hospital profiles, covering the eight divisions in the official profile selection. These are 7,544 source records, NOT a claim of 7,544 unique, verified hospitals. Different source entries may refer to the same real facility. No cross-source deduplication is asserted. All original community entries are preserved byte-for-byte. No approximate city or facility name is used to invent a district. Only 164 community features carry recognizable district tags in the supplied extract; district filters explicitly exclude records with no district tag. The page explains this and offers name/nearby search instead.

The new view uses the existing public endpoint /api/poth/facilities?view=discovery. Its response is runtime-validated by the client. Requests without view preserve the original facilities.json contract for existing import/API consumers. The existing reviewed-import dataset remains unchanged; the new source-reviewed DGHS selection lives in registry-records.json. Future imports into facilities.json do not automatically become discovery records: reconcile their provenance with registry-records.json before publishing them in the new view. No new auth allowlist or API key is needed.

Directory behavior: 20 results/page, previous/next navigation, source/type/division/district and reported-access filters, multiword search across names and recorded areas, bounded queries, duplicate/unknown query rejection, explicit loading/error/empty states, stale-result protection, timeout and retry. Large source data is indexed server-side; it is not shipped to every browser. The directory is a saved selection and does not require a live DGHS request during a visit.

## Evidence rules

DGHS-listed means the facility identity/administrative area appears in the cited official profile. Phone and email are published contact fields, not proof of successful calling or an appointment line. Khulna's source profile did not publish a mobile number, so none is invented. Profile administrative areas are not verified street addresses or entrances. Registry coordinates with unclear precision have not been imported. Beds, female staff availability, opening hours, prices, accessibility and maternity/emergency capability are not inferred from a facility type or name.

OSM access tags show reported available / limited / unavailable / unknown, always labelled not verified. Missing access metadata is unknown, not a negative finding. No facility is labelled accessibility-verified by this release. The source date of the supplied community extract was not included in this upload (the repository's optional data/poth-community-coverage.json report was outside the export), so collection time is explicitly unknown. DGHS review date is 19 November 2026 and is not an operational verification date. All source records link back to their evidence; OSM attribution and ODbL link are visible.

## Nearby lookup

Default lookup uses the saved snapshot immediately. Live lookup is a separate explicit action. The API labels saved-only versus live-plus-saved results, including fallback after an upstream failure or rate limit. A capped saved fallback now reports its cap. Live responses have a retrieval timestamp, which is NOT an update date for every saved feature. Existing 1–20 km radii remain; distances are straight-line distances to mapped points or feature centres, not road distances or verified entrances. The existing bounding box is a search-support extent, not an authoritative Bangladesh border polygon.

Prior requests are aborted and stale responses are rejected. Late GPS callbacks after leaving the component are invalidated. GPS is never requested automatically. Manual coordinates and city selection remain available. Location is not written to a care record. A chosen point reaches the application server for nearby lookup; live lookup additionally reaches the external map-data provider. Temporary per-instance caches and hosting/provider request logs may contain coordinates; do not claim guaranteed non-retention. The map starts closed, loads external tiles only when opened, and can be closed again. The result list works without map tiles, and expanded result lists have a Show fewer action. This update does not certify uptime of public OSM/Overpass services or the actual operation of any mapped feature.

## Visit preparation and privacy

An explicit Prepare a visit here action carries published name/area/source/phone into an in-page visit checklist. It does not book, contact, save to account or share records. The selection and check marks last until leaving/reloading the page. Barta's existing tab-scoped saved-question component is preserved. Eight optional items cover direct confirmation of services, opening/fees/entrance, physical access, communication, transfer assistance, questions/reports, chosen support and private discussion. Print/save opens an isolated checklist print root with local CSS selectors; no CSS Module global-only rules are introduced. The rest of the app is not included in that print view. Bondhon remains a separate explicit consent journey.

## Primary sources reviewed

All reviewed on 19 November 2026. Source details may change; contact and service availability need direct confirmation.

- Dhaka Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile
- Sir Salimullah Medical College Mitford Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile
- Chattogram Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/751/profile
- Rajshahi Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/1554/profile
- Khulna Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/1800/profile
- Mymensingh Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/392/profile
- Rangpur Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/1612/profile
- Sher-e-bangla Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/1969/profile
- Sylhet MAG Osmani Medical College Hospital: https://hrm.dghs.gov.bd/public/facility-registry/facilities/2186/profile
- National registry and further searching: https://hrm.dghs.gov.bd/public/facility-registry
- OSM data attribution: https://www.openstreetmap.org/copyright

## Validation and release gates

Completed here: 13 native-Node regression tests covering nationwide indexing, eight-division source selection, pagination across all records, strict queries, Bangla/multiword search, honest district handling, reported accessibility, malformed records, unsafe links, source filtering and nearby radius/caps. The existing community snapshot checker confirms 7,535 unique source features. TS/TSX syntax parsing and CSS binding checks are separate from a real TypeScript build.

This environment does not contain the locked Next/React/TypeScript/ESLint dependencies, so full typecheck, lint and production build must run in the user's checkout. A previous system Chromium attempt in this environment was blocked by socket permissions. Browser acceptance, live DGHS availability, live Overpass calls, screen-reader behavior and the integrated signed-in dashboard are NOT claimed tested here. Existing care-type and emergency components retain some bilingual/English explanatory text; this update does not claim every existing sentence is translated or clinically re-reviewed.

Run node scripts/poth-depth-check.mjs in Windows, then run the production build directly in PowerShell. Do not build while a dev server is writing .next. If stale generated route types conflict, stop servers and remove only .next and tsconfig.tsbuildinfo before regenerating; do not edit generated type validators.

Acceptance checklist before commit:

1. Public /poth, /find-care redirect and signed-in Poth embedding load without nested main landmarks or auth requirements for public discovery.
2. Search Dhaka/ঢাকা মেডিকেল, select registry/community and facility type, use next/previous then change a filter. Confirm old results do not flash under new filters.
3. Confirm counts are records, unknown districts and no-results explanations are honest, and unknown accessibility is never shown as verified.
4. Default nearby search returns promptly from saved data. Test live success, failure/rate limiting and saved-only disclosure. Change area/radius during a request and reject stale results. Deny GPS and use a city/manual point.
5. No external map tiles load before opening the map. Open/close it, pan/zoom, check list-only use and Show fewer.
6. Choose a facility, verify preparation details, tick/clear items, confirm Barta questions remain, and inspect print preview for only the checklist.
7. Check widths 320/360/390/430/768/1024/1280/1440, 200% text, shared themes/high contrast, keyboard focus, select/radio/checkbox controls and screen-reader announcements.
8. Preserve current emergency call/SOS functionality and consent boundaries. Never use real health information for testing.
9. Review git diff, commit only the manifest paths to your Iftee branch, and check mergeability against fetched main. No automatic push or SQL operation is part of the installer.


## Final presentation refinement — 20 November 2026

The main directory initially shows six records. Show more reveals the remainder of the loaded page and pagination; Show only six restores the compact state. Filters reset expansion; page navigation keeps it open. Nearby results likewise start at six with more/fewer controls. This does not remove records or reduce the server-side search index.

Latitude and longitude are in a closed, optional advanced disclosure. Ordinary city/GPS searches require neither field. Both fields are required only when explicitly setting a custom point; the Apply control stays disabled until both have values. GPS/custom selection now changes the city selector to a matching label rather than leaving an unrelated city selected. Check expansion/collapse and ordinary search without touching advanced coordinates during browser acceptance.
