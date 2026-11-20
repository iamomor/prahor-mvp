# M5 Bujhi: a sample report you can actually upload (owner Apurbo)

## The gap
The only sample report in the repo is `public/bujhi/prohor-synthetic-lab-v1.pdf`, but Bujhi upload accepts **JPG, PNG or WEBP only** (`upload-validation.ts`). A judge or teammate following the demo had nothing valid to upload.

## The fix
`public/bujhi/prohor-synthetic-lab-v1.png`: the same synthetic report rendered at 200 dpi (1656 × 2342 px, 78 KB). It is labelled "PROHOR DEMO LAB · SYNTHETIC · Fictional report. Not a real patient."

Evidence (`M5-bujhi/ocr.txt`): Tesseract read "Hemoglobin 11.2 g/dL", and Bujhi's own `parseOcrText` returned `{label: Hemoglobin, value: 11.2, unit: g/dL, reliability: recognized}`. (Local Tesseract 5 was used, the same engine as `tesseract.js` in the browser; the browser run itself is not tested.)

## Steps
1. `git apply --index M5-bujhi.patch   # run from the repo root; the patch is in this folder` (adds the PNG).
2. On the phone you will demo with, download the PNG once (or AirDrop / WhatsApp it to yourself) so it is in the gallery.
3. Bujhi → upload → choose the PNG → wait for OCR → the Hemoglobin field shows 11.2 g/dL.
4. Change the value to 11.3, then back to 11.2 (shows the review is real), tick confirm, **Save reviewed hemoglobin**.
5. Open a private window, sign in → the value is there (click-through rows 7–8).
6. Leave mid-review once: nothing is saved (K4).
7. On slow venue Wi-Fi, OCR downloads its engine from the jsDelivr CDN the first time. Open Bujhi once on the demo phone **before** the demo so it is cached. If OCR still fails, use manual entry (K3).

## Already correct in code (no change needed)
- The label "Account saving supports maternal hemoglobin in g/dL" and the per-field "Read from image, unsupported for account saving" (K2).
- Nothing saves without the explicit confirm step.
