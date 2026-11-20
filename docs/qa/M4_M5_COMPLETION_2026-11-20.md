# M4 Jibonrekha and M5 Bujhi: completion report (2026-11-20)

## Live follow-up (20 Nov 2026)

This section supersedes the account/environment blockers below. Source base:
`debfe4d`, the verified production revision; focused branch:
`omor-m4-m5-live-verification`. All account data used is synthetic.

- Existing mother and approved simulated-provider accounts signed in successfully.
  Two isolated synthetic accounts were provisioned through Supabase Auth; the
  second provider was approved using the existing operator-only review function.
- Existing hosted acceptance on `https://prahor-eight.vercel.app`: **74/74 passed**.
  This was a real application/hosted database run, without intercepted API responses.
  It covers all seven record types, account isolation, provider restrictions,
  reviewed report persistence, idempotency, consent and revocation.
- Direct hosted RLS checks used real authenticated sessions: positive own reads,
  another mother's empty reads and permission-denied updates, provider isolation,
  and anonymous permission denial. The loopback-only `test:rls` guard was retained.
- The M4 data-sheet values were entered through the local production UI against
  hosted Supabase, including the linked baby, separate blood-pressure values,
  condition, visit, correction preserving 85.4 and its reason, and an offline note
  whose input survived and saved on retry. The current forms record dates, not
  the data sheet's individual times of day.
- Browser OCR read the sample as 11.2. The manual fallback had been disconnected
  in the actual source; this follow-up connects it for failed, cancelled, or
  unsupported OCR and keeps the selected image. Saving scope is explicit in
  English and Bangla. General Barta education opens separately from the review.
- The guarded manual-provenance migration was applied to the verified project
  after a disposable-database check. Function security mode, search path and
  grants were preserved. Historical rows were not rewritten.
- A manual 11.5 g/dL value was saved through the finished UI after blocking only
  OCR CDN downloads. A fresh authenticated session retrieved it with the exact
  manual-entry provenance note. Backend responses were real. Timeline and visit
  pack labels now distinguish known manual and OCR provenance; unknown history
  keeps its general source label. Save feedback receives keyboard focus.
- No new test cases are retained, as requested. Existing verification output and
  local screenshots are under ignored `test-results/m4-m5-live/`; credentials,
  cookies and sign-in screenshots are excluded.

Limitations: saving is maternal hemoglobin in g/dL only; this remains a prototype.
Full screen-reader, real-phone, 200% zoom and complete keyboard-only sign-off are
not claimed. Slow/crashed-worker coverage is incomplete; cancelling OCR provides
a manual path. The 74-check hosted run precedes these focused frontend fixes.
Release build and lint must pass before publication; post-publication smoke
evidence should identify the deployed revision.

---

Baseline: HEAD `64d67d2` on `omor-backend-completion`. Nothing committed, merged or deployed. All data synthetic.

## Verification levels used
- **L1** source/unit tests. **L2** local browser (Chromium via Playwright, viewport emulation, not a real phone). **L3** hosted services. **L4** deployed revision.
- **Mock caveat:** no `ACCEPT_*` test accounts exist in this environment, so authenticated screens were run as the real client components with `/api/jibonrekha` and `/api/reports/commit` mocked in the browser (throwaway harness pages, since deleted). OCR was real. Server behaviour is therefore **not** proven here; `scripts/accept-hosted.mjs` already covers it and must be run with accounts (L3/L4 BLOCKED).

## Changes
| File | Purpose |
|---|---|
| `public/bujhi/prohor-synthetic-lab-v1.png` | Uploadable sample (kit PNG, 79,534 bytes). Was missing: repo only had the PDF, which upload refuses. |
| `src/features/bujhi/AccountReportReview.tsx` | Bilingual scope line "Saved now: hemoglobin (g/dL). Other values are shown for reading only."; sample download link; manual haemoglobin route (also for "no field found" dead end); manual draft labelled "OCR did not read it". |
| `src/features/bujhi/ImageMedicalEntry.tsx` | After OCR failure or zero fields, offers "Type the hemoglobin value myself" using the same chosen image. |
| `src/features/bujhi/ocr-service.ts` | Exported `fileSha256` (manual route needs the source hash). |
| `supabase/migrations/20261120010000_bujhi_manual_entry_provenance.sql` | **Prepared, NOT applied.** Observation note for manual entries (empty raw value) reads "manual entry from report image" instead of "local OCR". |

No schema change is needed for the code to work; the migration only fixes a provenance string.

## Acceptance
| ID | Result | Evidence |
|---|---|---|
| M4-01 seven types save/read back | NOT RUN at L3; API contract exists in `accept-hosted.mjs` | needs accounts |
| M4-02 mother/baby separation | PASS L2 (mocked API) | baby FHR absent from mother list, mother weight absent from baby list |
| M4-03 correction keeps original + reason | PASS L2 (mocked API) | 85.4 to 58.4, history shows 85.4 and "Typing mistake", survives reload of mock |
| M4-04 duplicates / failure | PASS L2; server idempotency BLOCKED | double-click sends 1 POST with one idempotency key; 500 and network failure show error, no "saved", input kept, retry saves once |
| M4-05 isolation / provider | BLOCKED | RLS/live tests need accounts; `test:rls:guards` L1 pass |
| M4-06 responsive/a11y | PARTIAL: PASS 320px reflow, focus after save, error focus (L2). NOT DONE: 200% text zoom, Bangla long-label pass, screen reader, real phone |
| M4-07 synthetic demo via UI | NOT RUN (needs account). Data sheet values are all supported by the current forms (weight kg, BP mmHg, Hb g/dL, baby FHR /min, correction). Not checked: the sheet's "Visit" and "Condition" in the account UI |
| M5-01 upload + real OCR | PASS L2 | real Tesseract in Chromium read Hemoglobin 11.2 g/dL from the PNG |
| M5-02 review gate | PASS L2 (mocked API) | no POST after OCR, after edit, or with missing date/confirm; invalid unit refused; edited 11.3 saved with raw 11.2 |
| M5-03 scope label | PASS L2 | English + Bangla visible before upload |
| M5-04 OCR resilience | PASS L2 for blocked CDN (honest failure + manual route, empty value, rawValue "", real 64-hex hash). NOT TESTED: slow network, worker crash, offline OCR (not claimed) |
| M5-05 persistence | BLOCKED L3/L4 | commit RPC idempotency/ownership covered by `accept-hosted.mjs` section 7-8, not run |
| M5-06 usability | PARTIAL: 320px and 390px no horizontal scroll (L2). Keyboard-only, 200% zoom, explanation link not checked |

## Commands
- `tsc --noEmit`: clean. `npm run lint`: 0 errors (3 warnings, existing style). `npm run build`: success.
- Non-browser node tests (unit, rls guards, pwa privacy, config, bujhi, jibonrekha): 103/103 pass.
- Existing browser tests: bujhi upload 1/1, medical-entry 9/9, kit 4/4, records-v2 9/9, bujhi-experience 2/2 (one flake under parallel load, passes alone). `lifeline-experience` 9/10: "main PDF views reflow..." times out at 30 s; **pre-existing**, identical with these changes stashed.
- Not run: `test:db`, `test:rls` (live), Playwright e2e, hosted acceptance.

## Limits and risks
- Only haemoglobin (g/dL) saves (documented MVP limit).
- Until the migration is applied, manual entries are stored with the note "Bujhi local OCR; reviewed by mother", which is inaccurate. Either apply it (guarded; fails loudly if the function text differs; needs authorization for the hosted DB) or hide the manual route.
- OCR engine/language data still load from a CDN; warm the demo phone before presenting.
- The M4/M5 harness scripts were not kept as repo tests (they depended on throwaway pages); no new committed regression tests.

## Minimal deploy
Merge the three TSX/TS files and the PNG; optionally apply the migration; run `node scripts/accept-hosted.mjs <url>` with four accounts.

## Demo walkthrough
Bujhi, tick the CDN consent, upload the PNG (link on the page), see 11.2 g/dL, change to 11.3, pick date and pregnancy, tick confirm, save. Check the reading in Jibonrekha, then correct a mistyped weight and open its history.
