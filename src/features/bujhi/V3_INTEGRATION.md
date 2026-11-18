# Bujhi V3 integration

[Open the local workspace](http://localhost:3000/bujhi).

The primary job is to copy report information into the correct personal health record after comparing it with the source. Bujhi handles personal health data. The current implementation is a fictional, device-local demo.

## Workflow

- Manual entry, image OCR and browser speech all produce the same normalized report draft. Manual entry starts with the type of information, including focused ultrasound groups and optional A–J ANC sections.
- A summary leads into a two-column review on desktop and a single-column review on mobile. The source panel offers image zoom, raw OCR, and line highlights from the OCR engine. The field link and its return button support keyboard comparison.
- Simple Review shows values and review status before the editor. Detailed Report expands the editor with source snippets, original labels and units, dates, and provenance. Field correction resets its check. Excluded fields can be restored for review.
- The report requires an explicit pregnancy choice. Baby observations require a specific record within that pregnancy. Source dating or patient-identifier discrepancies call for an additional confirmation. The pregnancy link is fixed after the first save.
- The existing Jibonrekha demo service saves the checked fields in one batch and deduplicates retries by report and field IDs. Saved observations retain source, record and pregnancy IDs, the original and corrected information, and the user review timestamp. Manual and voice drafts can explicitly be kept locally and reopened after refresh.

## Schema and extraction

- `report-schema.ts` defines the optional A–J ANC context, typed results and source location. `types.ts` defines the shared draft and review contract. `ultrasound.ts` defines scan subtypes, field groups, original labels and units, source fetus labels, and vessel/metric columns. The format extends the existing version-2 contract with optional properties.
- Classification covers early-pregnancy, pregnancy-profile, anomaly, Doppler and other ultrasound, laboratory, ANC, clinical note/prescription, vital sign, standalone observation and unknown. A report can retain fields from multiple sections and the category is editable.
- Tesseract supplies English OCR lines and bounding boxes. The mapper recognizes explicit labels and source headings. Doppler uses an identified vessel header and a complete, aligned row before assigning values to named metrics. Unmapped text stays visible. Multiple EDD strings, fetal headings, and source documents remain distinct. Numerical values and units stay in their source notation, with separately confirmed normalization where available.
- Findings, impressions, limitations and recommendations are stored as separately labelled source observations. Bujhi records user review and preserves source wording. Clinical interpretation belongs to the care provider.

## Scope and limitations

- Local OCR is limited to English text in one JPG, PNG or WebP image per draft. Different images can be reviewed as separate drafts. Multi-page PDF, handwriting, Bangla OCR, unstated dates, unaligned tables, unlabeled measurements, and arbitrary report layouts need manual review. Unknown fields can be entered in review. Original images stay in memory until the page closes.
- Browser speech supports English and Bangla where the selected browser provider offers them. Numeric digits and explicit supported clauses can produce separate fields. Other wording stays editable in the transcript. The microphone path depends on browser support, installed language packs and the user’s privacy choice.
- The brief’s six reference images were unavailable. Automated fixtures are synthetic and cover the described layouts. Current persistence uses browser storage for fictional records and explicitly kept self-reported drafts.
- Production authentication, access enforcement, server persistence, secure private document storage, coordinated saves across clients, clinician verification and optional AI extraction remain integration dependencies.
