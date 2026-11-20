# POTH v2 — Resource pack and build runbook (Accessible Healthcare Navigation)

Module 07 · Poth / পথ · Owner: Samin (Poth), Iftee (cross-module accessibility), Omor (schema/RLS/release).
Status: **research + data tooling + proposals.** Nothing here is wired into the app, nothing is committed, and every number below is from the committed OpenStreetMap extract or from cited public pages. Bangla = draft until native + clinician review.

---

## 0. The answer in ten lines

1. Poth already has a working MVP: text search over a reviewed list (currently **0 records**), a live OpenStreetMap "nearby" search, SOS, visit checklist. Good bones, thin data.
2. The repo's committed map extract has **7,535 elements → 3,090 care facilities** after removing pharmacies (3,748) and duplicates (128). That is the honest maximum we can list **today**.
3. Only **3%** of those care records have a phone number, **0%** have any wheelchair tag, **4%** have opening hours. So the thing a mother needs most (a number to call, access facts) is mostly missing. Distance is not the bottleneck; **evidence** is.
4. The biggest coverage jump is **not** more map data. It is the official **DGHS Facility Registry** (code, type, ownership, district, upazila, mobile, coordinates per facility) plus the district/upazila `.gov.bd` portal hospital pages. Both need a data-sharing request or manual, source-linked transcription — we must not scrape around terms we have not read.
5. Product idea that makes Poth stand out: an **evidence ladder** on every card and **needs-first** browsing ("verified step-free" beats "1 km closer"), with an honest count: "4 verified · 61 not verified".
6. Accessibility facts are **never** inferred. Unknown stays "Not verified". A fact is "verified" only if it carries a method, a date and an expiry, and it turns "stale" after 12 months. This is derived in code, not stored.
7. Browse is **local and instant**: a compact care index (297 KB raw / **81 KB gzip** without search keys, 113 KB gzip with) searched in the browser (0.08 ms per query in Node on this server; not measured on a phone). No server round trip, works offline, no Overpass rate limits.
8. Map is **optional and secondary** (list first). Recommendation: no embedded tile map in v1; "Open in maps" deep links per card.
9. Found and quantified one real bug: the nearby classifier looks for `healthcare:speciality=obstetrics`, but the OSM value for obstetrics/gynaecology is `gynaecology`. 22 facilities tagged `gynaecology` plus 5 tagged `maternity` are currently not recognised as maternal.
10. Shipped in this pack: normaliser + tests, call-review queue (656 priority facilities), synthetic demo sample covering every state, strict v2 contract (validated), SQL proposal, and this plan.

---

## 1. What exists in the repo today (audit)

| Piece                     | File                                                                              | State                                                                         |
| ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Page (public + signed-in) | `src/app/app/poth/page.tsx` → `PothDirectoryMvp`                                  | Works; district/division filter only filters 2 hard-coded marketing examples  |
| Reviewed directory API    | `src/app/api/poth/facilities/route.ts`, `pothFacilityStore.ts`, `facilities.json` | Fails closed on bad data; **`facilities.json` is empty**                      |
| Reviewed list UI          | `PothFacilityExplorer.tsx`                                                        | Search + district filter, honest empty state; API cap 100, no pagination      |
| Nearby map                | `PothNearbyMap.tsx`, `nearbyCore.ts`                                              | Live Overpass query; haversine radius; stale-request guards; flags truncation |
| Community extract         | `community-facilities.json`, `data/poth-community-coverage.json`                  | 7,535 elements, 42 tiles, `verifiedClinicalFacilities: 0`                     |
| SOS / visit prep          | `PothEmergencySOS.tsx`, `PothVisitPreparation.tsx`, `PothSavedVisitQuestions.tsx` | Honest: `tel:999` opens a dialer only                                         |
| Contract                  | `src/lib/contracts/poth.ts`, `poth-current.ts`                                    | `verified` requires https source + user id; unknown cannot be verified (good) |
| DB reference              | `supabase/reference/001_initial.sql`                                              | Single `facility_directory` table, `visible=false` default (good)             |

### Findings (all measured on the committed extract)

| #   | Finding                          | Evidence                                                                                                                                                                                                                  | Effect                                                                            |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| F1  | Maternal specialty never matched | `nearbyCore.categoryFromTags` tests `obstetrics`; OSM wiki documents `gynaecology` ("Obstetrics and Gynaecology"); data has 22 × `gynaecology`, 5 × `maternity`, 1 × `obstetrics`, plus typos (`gynochology`, `neunatal`) | Maternal places are shown as plain hospital/clinic. One-line fix, Samin's file    |
| F2  | Phone coverage 3%                | 3,090 care records; 2.9% have a parseable number; only **17** of the maternal-signal or public-type records are reachable by phone                                                                                        | "Call" cannot be the primary button for most results                              |
| F3  | Zero accessibility data          | `wheelchair` tag on 0 of 3,090                                                                                                                                                                                            | Accessibility must come from our verification, never the map                      |
| F4  | Reviewed list empty              | `facilities.json` = `[]`                                                                                                                                                                                                  | A mother sees an empty "reviewed" section; the useful part is hidden              |
| F5  | No district for map records      | `addr:district` present on ~5%                                                                                                                                                                                            | Browse-by-district needs admin boundaries or the DGHS registry                    |
| F6  | Strong geographic skew           | 26.6% of care records fall in a small Dhaka box; one half-degree cell holds 928                                                                                                                                           | Never claim "nationwide coverage"                                                 |
| F7  | Pharmacies dominate              | 3,748 of 6,838 records                                                                                                                                                                                                    | Keep out of default care results (separate "medicine shops", no maternal claim)   |
| F8  | Live dependency                  | Overpass is called per search                                                                                                                                                                                             | Rate limits (429), latency, offline failure. A prebuilt index removes all three   |
| F9  | Public-tier names are hints only | 276 names match "Upazila Health Complex", 151 "Community Clinic", 22 sadar/district, 31 union, 6 MCWC                                                                                                                     | "General Hospital" is a common **private** name, so it is never treated as a tier |
| F10 | Helpline facts conflict/age      | 16263 is widely documented (DGHS health call centre) but a news report describes funding trouble; one government SOP lists `10921` for the women/children helpline while others list `109`                                | Do not hard-code any number except 999 until verified by call/official page       |

---

## 2. Coverage maths (what "maximum" can honestly mean)

Official universe (public sector, Bangladesh Health Facility Survey 2017, via PMC table): **420** upazila health complexes (297 × 50-bed, 112 × 31-bed, 11 × 10-bed), **12** DGHS + **24** DGFP mother-and-child welfare centres, **3,924** + 87 union health & family welfare centres, **1,275** union sub-centres, **13,442** community clinics. (Other sources quote ~14,890 community clinics: counts differ by year.)

| Type                                         | Official (2017)         | Found by name in map extract                              | Share (lower bound) |
| -------------------------------------------- | ----------------------- | --------------------------------------------------------- | ------------------- |
| Upazila health complex                       | 420                     | 276                                                       | ~66%                |
| Mother & child welfare centre                | 36                      | 6                                                         | ~17%                |
| Union health & family welfare                | ~4,011                  | 31                                                        | <1%                 |
| Community clinic                             | 13,442                  | 151                                                       | ~1%                 |
| District / sadar hospital                    | 64 districts            | 22                                                        | ~34%                |
| Private / NGO / not matched to a public type | no national count found | ~2,600 care records (3,090 minus 486 public-type matches) | unknown             |

Name matching is a **lower bound** (Bangla/alternate spellings are missed). Read it as: the map covers hospitals and clinics reasonably in cities and badly at the grassroots, which is exactly where many mothers start.

**Plan to push coverage** (each wave adds records at a stated evidence level; none claims services):

| Wave    | Source                                                                                                            | Adds                                                                                                          | Evidence level                                   | Effort                                                                            | Blocker                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 0 (now) | Committed OSM extract                                                                                             | 3,090 care records, 17 callable maternal/public ones                                                          | E0 community map                                 | done                                                                              | none                                                                                                                              |
| 1       | **DGHS Facility Registry** (HRM public registry; FRED-style API documented on the DGHS Shared Health Record site) | Every registered facility: code, Bangla name, type, ownership, division/district/upazila, mobile, coordinates | E1 official listing                              | Request credentials/data-sharing from DGHS MIS; 1–2 days to import once granted   | **Permission.** The public page loads by script; the API needs a registered client token. Licence/terms not stated. Do not scrape |
| 2       | District/upazila `.gov.bd` hospital & clinic pages and DGHS performance dashboard lists                           | Official names, beds, a phone per UHC/DH (e.g. an upazila portal lists a UHC with phone and bed count)        | E1 official listing, with `sourceUrl` per record | ~64 districts × 15 min manual transcription, split among 5 people ≈ 1 working day | Portal licence not stated → link-out + transcribe facts with citation, don't bulk copy                                            |
| 3       | **Call verification** (volunteers, Bangla script in §9)                                                           | Phone-confirmed services + access facts for the highest-value ~100–150                                        | E2 confirmed by call (12-month expiry)           | 10 min per call, ≈ 25 h for 150                                                   | Reviewer accounts + consent to publish facility-level facts                                                                       |
| 4       | Community "I visited / it's closed" suggestions                                                                   | Corrections and new places                                                                                    | E0 until reviewed                                | ongoing                                                                           | Moderation queue                                                                                                                  |
| 5       | Give back to OSM (phone, wheelchair, specialty tags added by reviewers)                                           | Better source for everyone                                                                                    | —                                                | optional                                                                          | ODbL attribution/share-alike                                                                                                      |

Realistic outcome for a 6-day team: Wave 0 shipped properly + Wave 2 for as many districts as time allows + Wave 3 for ~50–100 facilities in the demo region. Say that on the "About this directory" page.

---

## 3. Data source atlas

| Source                                                                   | What it gives                                                                                                           | Licence / terms                                   | Access                                                  | Verdict                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| OpenStreetMap health tags (Overpass / our 42-tile extract)               | Names, points, some phone/hours/specialty                                                                               | ODbL: attribute; derived databases must stay ODbL | Done (extract committed). Live Overpass has rate limits | **Use as base layer, E0**                                                          |
| HDX "Bangladesh Health Facilities (OSM Export)" (HOT)                    | Monthly OSM export, points + polygons, GeoJSON/GPKG/SHP                                                                 | ODbL; record counts, fields not stated on page    | Public download                                         | Alternative refresh path; same data class as above                                 |
| healthsites.io / Global Healthsites Mapping Project                      | OSM-based health sites, ODbL, API + HDX                                                                                 | ODbL                                              | Public                                                  | Optional second pull; no new authority                                             |
| **DGHS Facility Registry (HRM)**                                         | Official code, type, ownership, admin area, mobile, lat/long, head, last updated. **No** services, beds, street address | Not stated                                        | Public page (script-loaded); FRED-style API needs token | **Top priority request, E1**                                                       |
| DGHS performance dashboard / HSS lists                                   | Names + district + division of UHCs, district hospitals, medical colleges                                               | Public gov pages, licence not stated              | Browse                                                  | Good skeleton for matching and district assignment; cite per record                |
| District/upazila National Portal pages                                   | UHC name, phone, bed count, officer                                                                                     | Not stated                                        | Manual                                                  | E1 per record with `sourceUrl`                                                     |
| data.gov.bd "Doctor Directory" / health datasets                         | Metadata only found; **License Not Specified**                                                                          | Unclear                                           | —                                                       | Do not ingest without clarity                                                      |
| BHFS 2014/2017/2022 (NIPORT, DHS Program)                                | National **service readiness statistics** by facility type; microdata is gated                                          | DHS terms                                         | Reports public; microdata on request                    | Use for **type-level education and counts**, never for a named facility's services |
| EmONC assessments (PLOS ONE 2017 etc.)                                   | Coverage of emergency obstetric signal functions, public/private                                                        | Open access papers                                | Public                                                  | Method reference for the "emergency obstetric 24h" fact definition                 |
| WHO Disability-Inclusive Health Services Toolkit (Western Pacific, 2020) | Physical access audit checklist, communication barriers module                                                          | WHO CC licence                                    | Public                                                  | **Basis for access fact list** (§5)                                                |
| OSM `wheelchair=*`, `healthcare:speciality=*` wiki                       | Documented tag values                                                                                                   | CC                                                | Public                                                  | Mapping table in §5                                                                |

---

## 4. The evidence ladder (the core idea)

Every **fact** (not every facility) carries its own evidence. A card shows the highest honest label.

| Level   | Label (EN / BN draft)                         | Meaning                                                   | Who/what sets it  |
| ------- | --------------------------------------------- | --------------------------------------------------------- | ----------------- |
| E0      | On community map / কমিউনিটি মানচিত্রে আছে     | Name and point from OpenStreetMap                         | Import            |
| E1      | Official listing / সরকারি তালিকায় আছে        | Appears in DGHS registry or a `.gov.bd` page (link shown) | Import + reviewer |
| E2      | Confirmed by call, 12 Nov 2026 / ফোনে নিশ্চিত | A named reviewer phoned and recorded the answer           | Reviewer          |
| E3      | Visited / পরিদর্শন                            | Reviewer saw it                                           | Reviewer          |
| stale   | Check older than 12 months                    | Expired E2/E3                                             | Computed          |
| unknown | Not verified / যাচাই করা হয়নি                | No reliable information                                   | Default           |

Rules (all enforced in `poth-v2-contract.ts`, validated against the demo sample):

- `unknown` can never carry a verification. `official_page` needs an https source. Calls/visits need a named reviewer. Expiry must be after observation.
- **Verified is derived**: `factState(fact, now)` → `unknown | community_reported | verified | stale`. Nothing stores "verified = true".
- A "no" answer is shown plainly ("Not step-free, confirmed by call") — a verified **no** is useful information, not a failure.
- **No score, rank, stars, "accessible" badge or recommendation.** Cards show counts ("3 of 11 access details verified").
- Presence in any registry never implies maternal services. Public-type names (e.g. "Upazila Health Complex") may show an **educational** line "This type of facility is generally a first referral point; confirm what is offered" tagged _general information, not this facility_.
- Permanently closed hides from results; temporarily closed shows a warning.

---

## 5. Accessibility metadata model

11 access facts + 9 service facts, each `yes | no | unknown` with provenance. Chosen from the WHO toolkit's physical-access and communication modules, limited to what a phone call can confirm in two minutes.

| Group         | Key                                                                                                                                                                         | Plain-language question asked of the facility                                                      | OSM equivalent (only where one exists)                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Physical      | `step_free_entrance`                                                                                                                                                        | Can someone enter without steps (ramp or level)?                                                   | `wheelchair=yes/limited/no` (whole-place, coarser)                                                  |
| Physical      | `accessible_toilet`                                                                                                                                                         | Is there a toilet a wheelchair user can use?                                                       | —                                                                                                   |
| Physical      | `adjustable_exam_bed`                                                                                                                                                       | Is there an examination bed a person can transfer onto with help / adjustable height?              | —                                                                                                   |
| Physical      | `clear_signage`                                                                                                                                                             | Is signage large and clear?                                                                        | —                                                                                                   |
| Communication | `sign_language_interpreter`                                                                                                                                                 | Is a sign-language interpreter available (state if by appointment)?                                | —                                                                                                   |
| Communication | `written_communication`                                                                                                                                                     | Will staff communicate in writing at the desk if asked?                                            | —                                                                                                   |
| Communication | `sms_or_text_contact`                                                                                                                                                       | Can the facility be contacted by SMS/text, not only voice?                                         | `contact:*` partly                                                                                  |
| Communication | `easy_read_info`                                                                                                                                                            | Pictorial / simple-language information available?                                                 | —                                                                                                   |
| Sensory       | `quiet_waiting_area`                                                                                                                                                        | A quieter place to wait on request?                                                                | —                                                                                                   |
| Support       | `support_person_allowed`                                                                                                                                                    | May a support person stay throughout?                                                              | —                                                                                                   |
| Support       | `female_provider_on_request`                                                                                                                                                | Can a female provider be requested?                                                                | —                                                                                                   |
| Service       | `antenatal_care`, `normal_delivery`, `caesarean_section`, `emergency_obstetric_24h`, `postnatal_care`, `newborn_care`, `family_planning`, `ultrasound`, `blood_transfusion` | Do you currently provide…? (CEmONC needs surgery + transfusion, per UN signal-function convention) | `healthcare:speciality=gynaecology/maternity/neonatology/obstetric_ultrasonography` = **hint only** |

Rules: never infer disability needs; never ask users to disclose a disability to filter; access filters are **user-chosen needs**, stored only on the device unless the mother saves them (Adapt preferences stay private; Poth may read them locally to pre-select filters only with an explicit "Use my settings" toggle, and never sends them to a facility).

---

## 6. Product design (fast, perfect, unique)

### 6.1 What mothers actually do (jobs)

1. "I need a place near me for check-ups." 2. "Where can I deliver, and is it open at night?" 3. "I use a wheelchair / I'm deaf / I can't speak: where can I go and how do I contact them?" 4. "Give me a number I can call or message, now." 5. "What should I bring?" 6. "This place closed / number is wrong."

### 6.2 Information architecture (mobile first, 390 px)

```
Find care (Poth home)
├─ [999 band: always first, never collapsible]
├─ What do you need?   ( chips )  Check-up · Delivery · After birth · Baby · Scan · Family planning · Emergency
├─ Search box          (Bangla or English, tolerant spelling)  [Use my location]  [Choose district]
├─ My needs  (optional, on-device)  Step-free · Accessible toilet · Written/SMS contact · Sign language · Female provider · Support person
│     └─ toggle: "Verified only"  | shows "12 verified · 214 not verified"
├─ Results (list is the product; map link per card)
│     card: name BN/EN · type chip · distance* · evidence badge · access count · Call / Message / Directions / Save
├─ Compare (up to 3, real <table>)
├─ Saved places (on device, offline)
└─ Prepare my visit  (bring list · questions · who comes with me · how to ask for access)
```

\*distance is straight-line, labelled "as the crow flies, not a route".

### 6.3 Result card anatomy (every state designed)

```
┌──────────────────────────────────────────────┐
│ Demo Upazila Health Complex A      [Official ✓]│  ← name (BN first when language = bn)
│ Upazila health complex · Public · Dhaka        │
│ 2.4 km straight line · open hours: not verified│
│ ▸ Access: 1 of 11 details verified             │  ← count, never a score
│ ▸ Maternal services: not verified              │
│ [ Call ]  [ Message ]  [ Directions ] [ ☆ Save ]│
│ Last checked: never                            │
└──────────────────────────────────────────────┘
```

States: no phone → "No number listed. [Ask us to find one]"; demo → **SYNTHETIC DEMO** banner, no call button; stale → amber "Check older than 12 months"; temporarily closed → warning; permanently closed → hidden; loading/offline/error/empty each worded plainly ("No match in our list. This does not mean care is unavailable.").

### 6.4 Unique options (each answers a real gap)

1. **Evidence badge + "3 of 11 verified"** instead of a trust score.
2. **Needs-first sort**: Verified for your needs → Official → Closest. A "Closest" toggle always available.
3. **Honest filter counts**: "Step-free: 4 verified yes · 3 verified no · 61 not verified" with **Include not verified** switch (off by default only for access filters, not for the whole list).
4. **Contact that fits the person**: Call · Copy number · **Write the message for me** (non-AI template: reason, preferred date, access need → opens SMS/copy) · "Ask someone to call for me" (hands the number to a trusted person via the OS share sheet). Deaf and non-speaking mothers are first-class, not an afterthought.
5. **Compare tray** (max 3): real table, rows = services and access, cells = Yes / No / Not verified + date.
6. **Level-of-care explainer** (general info, clinician-review pending): community clinic → union centre → upazila complex → district/medical college, "where care usually starts and where it is referred". Labelled general, not about a named facility.
7. **Offline pack**: saved places + last results cached, phone numbers included; low-data mode = text only.
8. **Close the loop**: after a visit, "How did contact go?" (number worked / closed / not answered / access matched) → goes to the review queue, never directly public.
9. **Prepare my visit** pulls _titles only_ from Jibonrekha (due date, last visit, medicines names) as an on-device checklist, with a "Not shared with the facility" line; sharing with a provider is Bondhon's consent flow.
10. **Browse by district for public facility types** ("Upazila health complexes in Sylhet") once admin areas are assigned.

### 6.5 Browsing speed (budgets and design)

- Ship a **compact care index** (id, names, kind, type, 5-dp coordinates, bit flags, search key): 3,090 records = 297 KB raw / 81 KB gzip (113 KB gzip with search keys). Lazy-load after first paint; cache in Cache Storage.
- Search on device: normalised keys (Bangla digits → ASCII, `য় ড় ঢ়` decomposed, case-folded) + a small EN↔BN synonym map (hospital/হাসপাতাল, clinic/ক্লিনিক, maternity/মাতৃ, mother-child/মা ও শিশু, sadar/সদর, diagnostic/ডায়াগনস্টিক). Measured 0.08 ms per query over 3,090 records in Node on the build server (phone speed untested).
- Render 20 results, "Show 20 more" (keep keyboard/screen-reader order); no infinite scroll.
- URL carries state (`?need=delivery&district=…&verified=1`) so Back, share and reload work.
- Targets to test on a mid-range Android on slow 3G: first useful list under 3 s, tap target ≥ 48 px, text scales to 200%, no horizontal scroll at 320 px.
- Distance computed **on the device**; location never sent to our server for the list (the current nearby API receives coordinates: replace with the static index).

### 6.6 Map: "optional, only if reliable"

Recommendation: **no embedded tile map in v1.** Reasons: map points are community-mapped (entrances unknown), public OSM tile servers are, per OSM's tile usage policy, not meant for production traffic (policy not re-read this session), and a map-only route excludes screen-reader and low-bandwidth users. Instead: per-card **Open in maps** (OSM link + `geo:` URI), and a later optional clustered map from a self-hosted vector-tile file once the list is stable. Keep `PothNearbyMap` as is until the index replaces it.

### 6.7 Design system fit (Quiet Garden)

Reuse tokens: bg `#fffcf5`, surface `#e6f2e9`, text `#23352d`, primary `#2f6b54`, accent `#f4c96b`, focus `#145da0`, success `#1a6848/#e3f1e8`, warning `#7c4a08/#fbeed2`, danger `#a33138/#f8e1df`; card radius 1rem; Rubik / Roboto Slab (display) / Noto Sans Bengali. Evidence badges use **icon + word** (✓ Official, ☎ Confirmed by call, ◌ Not verified, ⌛ Stale), never colour alone. Facility names in Bangla script need generous line height and no truncation; allow wrapping.

---

## 7. Workflow structure

```
Intent ─► Search/filter ─► Results ─► Detail ─► Action ─► Prepare ─► After visit
  │            │              │          │         │          │          └► "How did it go?" → review queue
  │            │              │          │         │          └► checklist (on device) + questions (Barta-approved)
  │            │              │          │         └► Call / Message / Directions / Save / Request (Bondhon, only if provider is on PROHOR)
  │            │              │          └► facts with evidence, source links, last checked, "Report a problem"
  │            │              └► Compare (≤3) · Save
  │            └► needs chips · verified-only toggle · district · distance
  └► 999 always one tap away
```

Verification pipeline (back office, same data):
`import (OSM/registry) → normalise → review queue (priority: maternal signal + public type + phone) → call → record facts with provenance → publish (visible=true) → monthly staleness sweep → re-queue`.

### Module mapping

| Module                 | Poth ↔ module                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adapt                  | Poth reads display/interaction settings; with explicit "Use my settings" toggle pre-selects needs filters locally. Never infers disability.                                                                                                              |
| Barta                  | "What should I ask?" uses Barta's approved educational snippets; Poth never asks AI to rate facilities. Optional natural-language search = P2.                                                                                                           |
| Shonket                | 999 band first; Poth cards never show "safe/unsafe". Emergency obstetric fact is a _directory fact_, not triage.                                                                                                                                         |
| Jibonrekha             | Visit prep reads titles (due date, last visit) on device; "Referral records" (P2) saves provider-issued referrals; "Log my visit" writes to her timeline.                                                                                                |
| Bujhi                  | Report explanations link back to "Find care" only as navigation.                                                                                                                                                                                         |
| Shusthota              | None shared (diary private).                                                                                                                                                                                                                             |
| Bondhon                | If a facility has a PROHOR provider account, "Send a care request" opens Bondhon's consent flow; otherwise Poth only gives contact methods. No fake queue.                                                                                               |
| Appointments (spec P1) | Honest: "Request a visit" = a note saved by the mother (`self_recorded`) + contact. Real booking only via an integrated provider; the DGHS e-appointment portal reportedly runs pilots in selected areas — treat as a link-out, verify before promising. |

---

## 8. Build plan (slices a reviewer can approve)

| PR   | Scope                                                                                               | Files (new/changed)                                                                                                                               | Needs                        |
| ---- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| P0-1 | Normaliser + tests (in this pack)                                                                   | `scripts/poth-normalize-osm.mjs`, `tests/unit/poth-normalize.test.mjs`                                                                            | none                         |
| P0-2 | Fix F1                                                                                              | `nearbyCore.ts`: accept `gynaecology`, `maternity`, `obstetric_ultrasonography`, `neonatology`, `womens_clinic` as maternal _signals_; add a test | Samin lease                  |
| P0-3 | Static care index + on-device search                                                                | generate `src/features/poth/care-index.json` from the script (care records only), `searchIndex.ts`, replace Overpass call in list path            | Samin; ODbL attribution line |
| P0-4 | Intent chips, evidence badge, needs filters, compare tray, saved places, demo mode                  | `PothFinder.tsx` + cards; uses `poth-sample-demo.json` behind `NEXT_PUBLIC_POTH_DEMO`                                                             | Iftee for a11y review        |
| P1-1 | Contract v2 + DB                                                                                    | `src/lib/contracts/poth-v2.ts`, migration from `poth-directory.sql`                                                                               | Omor schema/RLS review       |
| P1-2 | Reviewer tools                                                                                      | review-queue page (role-gated), fact entry form with provenance, "publish"                                                                        | Omor auth role               |
| P1-3 | Admin areas                                                                                         | point-in-polygon with official boundary file (HDX COD subnational boundaries: confirm licence) or DGHS registry admin fields                      | data                         |
| P2   | Registry import, SMS/feature-phone, optional vector-tile map, OSM give-back, e-appointment link-out | —                                                                                                                                                 | DGHS permission              |

Message file owners before touching their files (Samin owns Poth; Iftee owns cross-module accessibility). No commits or PR without being asked.

---

## 9. Verification kit

**Call script (draft; native-speaker review needed before use).**
EN: "Hello, I'm calling on behalf of PROHOR, a free information service for mothers. We keep a public list of care facilities and I would like to confirm a few facts about the facility, not about any patient. May I ask 10 short questions? I will not record the call."
Questions (answer yes / no / not sure): 1. Is the facility open now and are these the usual days/hours? 2. Do you provide antenatal check-ups? 3. Normal delivery? 4. Caesarean section? 5. Emergency obstetric care at night? 6. Postnatal and newborn care? 7. Step-free entrance (ramp or level)? 8. A toilet a wheelchair user can use? 9. Can a support person stay throughout, and can someone ask for a female provider? 10. Can people contact you by SMS or in writing, and is sign-language support available (by appointment is fine)?
BN draft: "আসসালামু আলাইকুম। আমি প্রহরের পক্ষ থেকে ফোন করছি, এটি মায়েদের জন্য বিনামূল্যের তথ্যসেবা। আমরা স্বাস্থ্যসেবা কেন্দ্রের একটি জনসাধারণের তালিকা রাখি। কোনো রোগীর নয়, প্রতিষ্ঠান সম্পর্কে দশটি ছোট প্রশ্ন করতে পারি? কল রেকর্ড করা হবে না।" (draft)
Record per answer: yes/no/not sure, reviewer id, date. "Not sure" = leave **unknown**. Wrong number → `wrong_number`; closed → ask for date.

**Review queue** (`poth-review-queue.csv`, 656 rows, sorted: phone-reachable maternal/public-type first): columns id, name, kind, tier_by_name, maternal_signal, phone_e164, osm_url + blank result columns. Contains public business numbers from OSM; keep it **local, not committed** (existing handoff rule).

**Staleness**: monthly job marks facts past `expiresAt` as stale and re-queues the facility.

---

## 10. Acceptance tests

Positive: search "ঢাকা" and "dhaka" return the same Bangla/English names; "মা ও শিশু" finds mother-child centres; `gynaecology`-tagged places show a maternal _signal_ (not a claim); a record with a verified "no" displays "No" with its date; stale fact shows amber "check older than 12 months"; saved place and its phone open offline; URL restores filters; keyboard-only completes find → compare → call link; screen reader reads badge text; 320 px and 200% zoom have no clipped Bangla.
Negative (must fail closed): demo record never shows a call button; an `unknown` fact can never render ✓; `official_page` without source is rejected; permanently closed is hidden; no result ever says "recommended", "best", "safe", "accessible" without the verified fact beneath; no page claims booking; empty search says "does not mean care is unavailable"; location is never sent for the list; pharmacies absent from default care results.

---

## 11. Compliance and risk

- **ODbL**: show "© OpenStreetMap contributors" wherever OSM-derived data appears; a database derived from OSM remains ODbL (the review queue and care index qualify). Reviewer-added facts (calls) are ours.
- **Scraping**: do not scrape DGHS or portals; request access or transcribe with source links. Terms were not found on the pages fetched.
- **Phone numbers** are business numbers; remove on request; never show personal numbers (head-of-facility mobiles from the registry stay out of the public UI).
- **Location privacy**: compute distance locally; no analytics on coordinates.
- **Clinical**: type-level education needs clinician review; no verdicts.
- **Helplines**: ship 999 only; any other number needs a verified source and a date.

---

## 12. What is verified and what is not

**Verified (ran/checked in this session):** normaliser runs on the real 7,535-element extract (all numbers above); 4 unit tests pass; v2 contract validates all 12 demo records and rejects 4 negative cases; compact-index size and search timing measured in Node; every external fact below comes from a page I fetched or a search result (cited).
**Not verified:** nothing rendered in a browser or on a phone; app not built or type-checked with the real toolchain; SQL never run on a database; DGHS registry data not retrieved (page is script-loaded, no export seen); Overpass/OSM freshness; the F1 fix not yet applied; Bangla text unreviewed; the 2017 official counts may have changed; name-matching recall unknown; hosting of a care index and ODbL obligations not reviewed by counsel.

## Sources

- BHFS 2017 facility table (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC8424828/table/T2
- DGHS Shared Health Record, Facility Registry API: https://info.shr.dghs.gov.bd/technical-support/facility-registry
- DGHS HRM public Facility Registry: https://hrm.dghs.gov.bd/public/facility-registry
- DGHS performance dashboard facility lists: https://dashboard.dghs.gov.bd/pages/hss_menu.php
- Upazila portal hospital list example (phone, beds): https://barguna.gov.bd/en/site/page/VWsy-%E0%A6%B9%E0%A6%BE%E0%A6%B8%E0%A6%AA%E0%A6%BE%E0%A6%A4%E0%A6%BE%E0%A6%B2-%E0%A6%93-%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BF%E0%A6%A8%E0%A6%BF%E0%A6%95
- HDX HOT health facilities export: https://data.humdata.org/m/dataset/hotosm_bgd_health_facilities
- OSM healthcare:speciality: https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality
- OSM women and girls tagging: https://wiki.openstreetmap.org/wiki/Tagging_in_Support_of_Women_and_Girls
- WHO disability-inclusive health services toolkit: https://www.who.int/publications/i/item/9789290618928
- EmONC signal functions, Bangladesh (PLOS ONE): https://pmc.ncbi.nlm.nih.gov/articles/PMC5665531
- data.gov.bd health dataset (licence not specified): https://data.gov.bd/dataset/doctor-directory
- Helpline context: https://www.jagonews24.com/en/amp/89609 ; https://thecompassforsbc.org/wp-content/uploads/SOP-Mental-Health-Bangladesh.pdf
