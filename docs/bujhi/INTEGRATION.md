# Bujhi archive integration

Status: limited prototype using synthetic report images.

The playbook, workbook and save patch from the supplied archive are preserved in this directory. The archive's four named PNG fixtures were absent, so four synthetic replacement images are in `tests/fixtures/bujhi/`. The original route and migration drafts target an older schema. They are reference material and have not been installed as account-saving endpoints.

The current Bujhi review at `/demo/bujhi` keeps the existing V3 workflow. Browser OCR now checks the recognized value word against a provisional confidence threshold of 85. An unmatched or low-confidence value is marked uncertain and needs user review. This is a text-recognition signal, not a clinical accuracy assessment.

The account route at `/app/bujhi` accepts one synthetic report image and saves one mother-reviewed hemoglobin measurement in g/dL through `POST /api/reports/commit`. A database transaction stores the raw OCR field, corrected value, source hash, pregnancy link, and observation. The account section of `/app/jibonrekha` reads that observation after reload. Retry uses the same report ID and cannot duplicate a row. Other extracted fields remain visible but unsupported for account saving. The local demo workflow remains available at `/demo/bujhi`.

Apply `supabase/migrations/20261119010000_bujhi_reviewed_reports.sql` to the configured staging Supabase project before using account saving. Until the migration is available, `/app/bujhi` offers the existing local review and labels account saving unavailable. Hosted deployment, a signed-in browser run, and a two-account hosted isolation check remain unverified. The local PostgreSQL regression is in `tests/database/bujhi-review-commit.test.mjs`.

The replacement fixtures were exercised with Tesseract.js 7. The supported image read hemoglobin 11.4 g/dL with 94/100 word confidence. The ambiguous image read 11.72 g/dL with 61/100 confidence. The missing-unit image omitted the unit. The narrative image yielded no supported fields. These results are specific to the synthetic fixtures.

The five remaining source drafts from the archive are preserved unchanged in docs/bujhi/drafts/. They document a proposed account-save workflow and are not deployed.
