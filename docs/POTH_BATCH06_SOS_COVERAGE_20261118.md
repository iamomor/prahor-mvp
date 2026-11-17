# PROHOR Poth — Batch 06: emergency access and maternal care categories

## Added
- Emergency/SOS panel with national emergency number 999 (tap to call), one optional local trusted contact, a user-entered emergency address, editable contact address, and copyable SOS text. This is a manual action; no message is dispatched by PROHOR.
- Emergency information is stored in localStorage only on the current browser and can be cleared. Browser storage is not encrypted or synced; shared devices may reveal it. Avoid health information. Loading the SOS panel does not request GPS or transmit the address.
- Maternal care guidance: hospital, maternity home, birthing centre, upazila complex, maternal-and-child, clinic categories with external map searches. Categories do not verify services.
- OpenStreetMap nearby discovery extends recognized healthcare tags to include birthing_centre, midwife and maternity. Every place remains a community map entry, never verified maternity care. No OSM results are published to facilities.json.

## Emergency provenance and caveats
- Bangladesh national emergency number: 999. See https://www.police.gov.bd/en/hot_line_number and https://www.gov.uk/foreign-travel-advice/bangladesh/getting-help (accessed 2026-11-18). Calling does not guarantee immediate ambulance dispatch.
- Bangladesh 16263 health advice hotline was reported disrupted beginning November 12, 2026; do not promote it as reliably available emergency care until an official status check: https://www.thedailystar.net/news/bangladesh/news/national-health-hotline-be-back-service-within-days-4325906
- No hospital phone numbers, street addresses, emergency beds, maternity services, accessibility characteristics or exact entrances are fabricated by this batch.

## Coverage remains incomplete
- Real DGHS data must be appropriately sourced and reviewed. District selector != district healthcare coverage.
- Accurate pins require facility-specific, coordinate-level provenance and confidence. OSM way centroids may not be entrances.
- Verified SOS help centers need reviewed organization names, contacts, addresses, operating hours, service scope and source dates. Do not label user-supplied addresses or OSM points verified.
- For production: build admin verification workflow, automated tests, privacy review, availability monitoring, geocoder/route service with SLA, provider licensing, emergency-care expert review, accessibility audit and offline emergency-number support.

## QA
Stop dev server. Run `npm run typecheck`, `npm run lint`, and `node scripts/PROHOR-Poth-DataCheck-20261117.mjs` after install. Preview `/poth`, test 999 link without placing a test emergency call, save/edit/clear a dummy contact, copy text, permission denied and empty-map states, mobile and keyboard access. Do NOT call 999 just for testing.

All changes are on iftee; installer never commits or pushes.
