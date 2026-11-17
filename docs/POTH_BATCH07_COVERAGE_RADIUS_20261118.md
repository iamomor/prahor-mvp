# PROHOR Poth — Batch 07 Coverage & Radius

## Scope
- Replaces only `PothNearbyMap.tsx` and `/api/poth/nearby/route.ts`; adds `nearbyCore.ts` and `scripts/PROHOR-Poth-NearbyCoreCheck-20261118.cjs`.
- Uses OSM Overpass **at user request**, not official DGHS verification. Discovers hospitals, clinics, maternity-/birthing-tagged points, midwives, doctors, pharmacies. It cannot certify the number or completeness of actual facilities in Bangladesh.
- 1/2/3/5/10/15/20 km radius. Final server-side Haversine filtering excludes outside-radius points. These are straight-line distances and NOT routing distances.
- Displays community-supplied addresses, phones, websites, opening-hours as **unverified**. No guesswork or automatic approval.
- Multi-pin tile-based map: mouse/touch select pins, keyboard map controls, list view. Tile display needs network and must honor [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/). 999 SOS remains separate from this unverified feed.
- Public Overpass has rate limits: per-process basic throttle, 8 minute cache, request cap, fail-closed response. Not robust for high-traffic production. Use a hosted provider or self-hosted extract before release.
- GPS is opt-in. Every search sends coordinates from browser to PROHOR server to Overpass; do not add location logging. Do not claim this is a tracking or dispatch service.
- DGHS source-reviewed directory still requires authorized official source records, service verification, and coordinate review. Empty reviewed `facilities.json` remains empty.

## Run
`node F:\\DOWNLOADS\\PROHOR_Poth_Batch07_CoverageRadius_20261118.cjs`

Installer verifies branch `iftee`, makes temporary backups, performs TypeScript/lint and unit data tests, restores files on failure. It does not commit/push. A dev server must be stopped before installation and restarted after.

## Manual QA
1. Open `/poth` in mobile and desktop; SOS still appears if Batch 06 was installed.
2. Dhaka, 1 km, Search: all returned distances <= 1 km, categories and count coherent.
3. Change to 5 and 20 km; verify results can change and provider does not always cap results.
4. Filter maternity, clinics, hospitals; search name/address; sort and load more; pins match visible filter.
5. Tap a pin, check facility detail and directions. Check the OSM source. Do not place test emergency calls.
6. GPS allow/deny; slow network; airplane mode; Overpass 429/503; external directions fallback.
7. Screen reader, keyboard, 200% zoom, small screens, Bangla fonts.
8. `npm run typecheck`, `npm run lint`, `node scripts/PROHOR-Poth-DataCheck-20261117.mjs`, `node scripts/PROHOR-Poth-NearbyCoreCheck-20261118.cjs`.
