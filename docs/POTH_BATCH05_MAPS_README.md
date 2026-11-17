# PROHOR Poth Batch 05 — nearby map discovery

- Adds /api/poth/nearby and PothNearbyMap to /poth. Uses publicly edited OpenStreetMap data via Overpass, **only after the user clicks Search nearby**. Map iframe uses OpenStreetMap. No Leaflet/npm installation.
- Live map entries are NOT verified clinical facilities. No maternity care, accessibility, opening hours, appointment slots, or correct entrance can be inferred. Nothing is published into facilities.json.
- On-screen division city centres (8) are approximate city points, NOT medical facilities. GPS is opt-in and requires HTTPS or localhost and user consent; denied permission falls back to city selection.
- Straight-line km is not route distance. Directions are external Google Maps links and may lead to an approximate mapped location.
- Overpass is a publicly operated, best-effort community service with rate limits, latency and availability restrictions. For substantial production load use approved hosted/geospatial provider, cache/quotas and map-service monitoring. The API caches queries briefly in-process; this is NOT robust global rate limiting. Do not use for emergency dispatch.
- OSM map iframe shows one selected result at a time; the list supports all results. Site CSP must allow frame-src https://www.openstreetmap.org and connect-src to the app's origin.
- No reviewed official Bangladesh facility entries are populated by this batch. The DGHS Batch04 review workflow remains mandatory before labeling any entry source reviewed.
- Testing: npm run typecheck, npm run lint, /poth, /api/poth/nearby?lat=23.8103&lon=90.4125&radius=3000 (external network required). Test GPS permission denied, map fallback, keyboard, mobile, external routing link. This script does not test official data coverage.
- Do not commit privacy-sensitive location logs. Check with team before production deployment, and retain OSM attribution and provider usage compliance.
