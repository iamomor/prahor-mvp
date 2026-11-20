# Jibonrekha Lifeline PDF implementation

Source reviewed: all 14 pages of `Jibonrekha — the Lifeline experience.pdf` and all 3 files in `jibonrekha2.rar`. This PDF is a design proposal and fictional storyboard; its wording and simulated clinician entries are not clinical validation.

## Page coverage

| PDF page | Implemented route or view | Status |
| --- | --- | --- |
| 1 | `/demo/jibonrekha` Today: header, demo notice, arc, add, next visit, recent records | Working local demo |
| 2 | Add wizard: type, value/date, review and save | Working local demo |
| 3 | Timeline: mother/baby/both, search, category, dated rows and detail | Working local demo |
| 4 | Share: record selection, identity and Barta off, explicit review | Local print only; no send |
| 5 | Loading, empty, offline, save failure, stale tab and draft recovery | Working states; access revocation remains a future server feature |
| 6–7 | Desktop sidebar, arc, two mother/baby lanes, source labels | Working responsive view |
| 8 | Quiet Garden, Original Rose, Morning Mist and independent contrast | Working via semantic tokens |
| 9 | Date source, date, label, unknown date and history of changed dates | Working local demo |
| 10 | Baby label, optional birth date, movement notes and source-labelled records | Working local demo; growth/vaccines future |
| 11 | Visits, preparation checklist, conditions, symptom notes and Poth link | Working local demo |
| 12 | Detail, append-only correction history and Bujhi link | Working local demo |
| 13 | Postpartum example and links to available note/baby tasks | Limited prototype; full postpartum and Shusthota connection future |
| 14 | Selected-only A4 print table with source and privacy note | Working local print view |

The prior nine-section device demo remains available at `/demo/jibonrekha/records`. The account route `/app/jibonrekha` keeps its server-backed records and a matching four-task shell; it does not use the new fictional demo storage. The new PDF experience does not send records through Bondhon or feed Barta. The report link opens Bujhi, while the sample report row remains marked as unverified.

## Source discrepancy handled

PDF page 9 pairs an LMP of 12 June 2026 with 24 weeks 6 days on 19 November 2026. The calendar interval is 22 weeks 6 days. The setup form calculates 22 weeks 6 days and keeps the entered source visible. The opening fictional clinician-EDD example uses 5 March 2027, which does yield 24 weeks 6 days on 19 November 2026.

## Verification

- Production build and TypeScript strict check passed.
- New Lifeline browser tests: 7 passed (Today, add, correction, date math, selective print, draft/conflict, responsive and axe/theme paths).
- Previous detailed-record browser tests: 9 passed.
- Existing Jibonrekha domain tests and new record/arc helper tests passed.
- Color contrast script passed for all three base themes.
- Manual NVDA/VoiceOver, real low-bandwidth Android, native Bangla review, clinician copy review and live account integration remain unverified.
