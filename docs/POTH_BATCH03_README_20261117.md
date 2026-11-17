# PROHOR Poth — Batch 03: auditable facility-data pipeline

Status: working software foundation; NOT a verified nationwide healthcare directory.

1. Start existing app: `npm run dev`
2. Visit `/poth` and `/api/poth/facilities`
3. Source official facility records from DGHS with permission/appropriate reuse terms.
4. Prepare CSV columns using `POTH_IMPORT_TEMPLATE_20261117.csv` with distinct UUIDs, genuine facility names, district, verified source-linked addresses, source URL and ISO-8601 review timestamps. Check every entry.
5. Import only after source review:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\PROHOR-Poth-ImportReviewedFacilities-20261117.ps1 -CsvPath "F:\DOWNLOADS\reviewed-poth-facilities.csv"
```

The import script does NOT certify services, equipment, communication support, contact details, emergency capabilities or appointment slots. It leaves those empty until field-level review is implemented. Empty dataset is not interpreted as no healthcare facilities.

No private maternal data is processed or saved by the temporary visit-preparation checklist. Never add PHI to facilities.json.

For release: add clinical/content reviewer, validate reuse rights, independently verify source IDs and district spellings, implement field-level evidence and review timestamps, add automated keyboard/e2e tests, and measure real per-district facility coverage. `main` must remain untouched.
