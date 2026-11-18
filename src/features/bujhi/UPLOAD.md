# Bujhi upload and voice notes

Current Step 9.3 behavior and integration boundaries are documented in [ENTRY_INTEGRATION.md](./ENTRY_INTEGRATION.md).

- Manual health entry is the primary route entry.
- Photo selection/preview uses the existing ReportUpload component and local JPG/JPEG/PNG/WebP format checks, up to 10 MiB. Object URLs are revoked on replace/remove/unmount; no media is stored in localStorage.
- Real English image OCR now runs through Tesseract.js after explicit permission for engine/language asset downloads. Images remain local. Extracted fields remain editable and require explicit review before saving.
- Exactly three input methods are available: manual entry (including the complete antenatal report), image OCR, and voice. Video upload, preview, and processing are not supported.
- The speech-entry method produces a complete transcript and editable draft; remote browser recognition requires explicit consent. No Azure or Gemini integration is active.
- All methods reuse the existing ReportReview and health storage service. Review edits/checks/rejections remain in the current session when switching views. Only explicitly checked fields are saved; no image or speech input is automatically treated as clinician-confirmed.

Run the local dev server before `node --test src/features/bujhi/medical-entry.browser.test.mjs src/features/bujhi/upload.browser.test.mjs`. Acoustic speech, Bangla OCR, and manual assistive-technology checks remain unverified. The legacy upload browser tests reference an earlier demo route; use the medical-entry browser suite for the current page.
