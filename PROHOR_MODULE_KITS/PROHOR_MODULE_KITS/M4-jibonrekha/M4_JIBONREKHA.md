# M4 Jibonrekha: demo mother and record test (owner Apurbo)

The save paths and live tables exist; baby, condition and visit tables still have 0 rows. Build one complete **synthetic** mother through the UI (not SQL), so the demo timeline is full and the hand test is done at the same time.

## Account
New mother account, e.g. `demo.ayesha+20nov@<team-domain>` (any inbox you control). Name: **Ayesha (synthetic demo)**. Use made-up data only.

## Data to type, in this order (dates are all in the past or near future relative to 20 Nov 2026)

| # | Record type | Field values | Expect on screen |
|---|---|---|---|
| 1 | Pregnancy | Label: `First pregnancy (demo)` · Last period: `2026-05-01` · Due date: `2027-02-05` | About 29 weeks; self-reported label |
| 2 | Baby (expected) | Label: `Baby (expected)` · Pregnancy: #1 · Birth date: empty | Separate from the mother's records |
| 3 | Measurement, mother | Weight `57.6` kg · observed `2026-09-10 10:00` | Unit kg, source self-reported |
| 4 | Measurement, mother | Blood pressure `112` / `72` mmHg (systolic, diastolic) · `2026-10-12 10:00` | Both values with units |
| 5 | Measurement, mother | Weight `85.4` kg · `2026-11-14 10:00` (deliberate typo for #10) | Saved |
| 6 | Measurement, mother | Haemoglobin `11.2` g/dL · `2026-11-14 10:00` (same value as the Bujhi sample) | g/dL shown |
| 7 | Measurement, baby | Fetal heart rate `142` /min · `2026-11-14 10:00` | Shows under the baby, not the mother |
| 8 | Condition | Label: `Low back pain (self-reported)` · documented `2026-10-12` · source note `Told the ANC nurse` | Provenance: self-reported |
| 9 | Visit | Subject mother · `2026-11-14 10:00` · place `Demo Upazila Health Complex (synthetic)` · note `Routine ANC visit` | Appears on the timeline |
| 10 | Correction | Correct #5: new value `58.4` kg · reason `Typing mistake` | Old value kept and marked corrected; new value shown |
| 11 | Note | `Felt baby kicks after dinner (demo)` · `2026-11-18 21:00` | Note on timeline |

## Checks while typing (J1, J3, J4)
- After #4 and #10: open a **private window**, sign in, open Jibonrekha → both appear with units and source (J1).
- On #3, double-click Save quickly → exactly one record (J3, idempotency key).
- Turn data off, try to save #11 → "not saved" message, text kept; turn data on, save.
- #7 never appears in the mother's measurement list (J4).
- After save, keyboard focus lands on the new item or the success message (J5, PR #59).

## Demo line
"Mother and baby records stay separate, every value shows where it came from, and corrections never erase history."

## Not needed tonight
Clinician-entered records (Future).
