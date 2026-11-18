# PROHOR Poth — 48-hour release handoff (18 Nov 2026)

**Source:** `prahor-mvp-develop.zip` at accepted `develop` baseline `a6eb847`. This patch is not a claim of runtime/hosted acceptance.

## Required MVP task

From team workflow V3, page 4: accessible searchable text catalog and visit preparation; evidence-labeled sources, unknown accessibility unless actually verified; no fictitious live bookings. Poth domain ownership belongs to **Samin** (page 16), while **Iftee** owns all cross-module accessibility and provides a preserved contribution (pages 3, 8, 13). Obtain a file lease and code review before integration.

## What the patch changes

1. Nearby map requests abort when their search location/radius changes or another search starts, and stale responses cannot overwrite new results; GPS callbacks cannot override a newer manual/city selection.
2. No 10-metre radius tolerance; use exact Haversine checks. Map query cache now retains six-decimal search centre precision instead of three.
3. Mark potentially incomplete maps when Overpass returned 1,200 elements **or** results reach the 300-item application limit. Results are not comprehensive coverage.
4. The imported/source-linked directory adds a district filter, retry/clear button, and explicit result count. The API caps results at 100, so this is not complete pagination.
5. Page landmarks link directly to Emergency 999, nearby map, source-linked records and visit preparation.
6. Focused geography/safety test script runs locally with the repo's existing TypeScript dev dependency, without adding packages.

## Deliberate safety boundaries

- **Zero reviewed records** in `facilities.json` in the supplied archive; do not populate with guessed hospitals or invented maternity/ambulance/accessibility details.
- Community OpenStreetMap results are **not verified**. Map points and geometric centres may not identify entrances; distance is as-the-crow-flies, **not** road distance, route or ETA.
- Phones and opening times from community tags are unverified. Call the facility to confirm care capabilities and whether it is operating.
- SOS `tel:999` opens a dialer; it does not send a message, call automatically or dispatch an ambulance. Local storage on shared devices is not private health storage.
- No appointment booking, live provider integration, emergency obstetric verification or nationwide clinical coverage is claimed.

## Validation on the actual target branch

```powershell
npm run typecheck
npm run lint
node scripts/PROHOR-Poth-FinalCheck-20261118.mjs
npm run build
```

Stop if any command fails. Then launch the app and verify `/poth`, `/api/poth/facilities`, the nearby API and a real browser. The script's assertions cover **core logic only**, not real microphone, GPS, Overpass provider, device, clinical or full accessibility acceptance.

## Manual 48-hour acceptance checklist

- [ ] Samin approves Poth file lease and adopts the prior Iftee contribution.
- [ ] Fresh desktop browser: open Poth; use text directory and visit checklist without a map or GPS.
- [ ] Mobile 320px viewport, 200% zoom, Bangla text: no obscured buttons; logical headings and focus.
- [ ] Keyboard-only: open SOS section, adjust city and radius, search, browse results and open external directions.
- [ ] Rapidly search for Dhaka then change to Sylhet; old Dhaka results must never reappear.
- [ ] Search again while a search is pending; latest query wins; changing radius clears old results.
- [ ] Deny geolocation; manually selected city remains available. Test location permission and GPS outside Bangladesh.
- [ ] Provider error/429/offline: comprehensible status; no fake facilities, source links or emergency assurances.
- [ ] Search 1 km and 20 km; only results physically inside chosen Haversine radius; show truncation warning when capped.
- [ ] Verify the reviewed directory empty-state honestly indicates *unknown coverage*, not missing healthcare.
- [ ] Test status announcement with a real screen reader and keyboard focus with 200% zoom.
- [ ] Review facility sample/demo entries against DGHS before recommending; do not equate registry membership with maternal services.
- [ ] Verify SOS is optional, `999` button uses `tel:999`, clipboard does NOT claim message was sent.
- [ ] Run source/timestamp/secret review; do not commit local CSV review queue before approval.
- [ ] Samin/Omor sign off on develop preview SHA and test evidence; main is final release only.

## Remaining outside the 48-hour MVP

Large and medically reviewed nationwide registry import; verified obstetric services, contact and accessibility audits; managed Overpass service or a production geospatial provider; true entrance coordinates, road routing, live bookings and provider availability. Keep these for post-MVP only unless independently completed and tested.
