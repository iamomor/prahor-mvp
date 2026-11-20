# DOC-20261113-WA0001.pdf → Jibonrekha content map

The supplied 13-page PDF is a requirements draft, **not** a clinically approved source or a user instruction to replace PROHOR's architecture. Its patient-facing topics are represented in the week guide and the source-linked reading library at `src/features/jibonrekha/pregnancy-reference-data.ts`. Medical statements are checked against the linked NHS, NICE, ACOG, RCOG and WHO guidance in that file. The PDF itself is not stored in the repository.

| PDF pages | Topic | Location and status |
| --- | --- | --- |
| 1 | 280 days, due-date estimate, week 40, fetal position/weight/movement | `week-40` library section and the existing week selector. Due date is presented as an estimate. A generic fetal weight or head-down position is **not** assigned to an individual baby. |
| 2–3 | Swelling, back pain, heartburn, fatigue, contractions | `common` library section. Symptoms can be noted in Jibonrekha; the app does not decide their cause. |
| 3–6 | Preeclampsia, bleeding, reduced movement, ruptured membranes, cord prolapse, seizures, infection | `warning` library section, plus a direct `/safety` route. No symptom score, emergency classification or automated reassurance. Serious signs direct readers to human care. |
| 3–6 | Blood pressure, pulse, temperature, urine protein, glucose, haemoglobin, fetal movement/heart rate, fluid, position, cervix, NST/CTG | `monitoring` library section. Current record contracts support only a subset. Pulse, urine protein, NST/CTG, fluid and cervix do **not** have structured verified forms. The UI states this explicitly rather than inventing values. |
| 7 | Stages of labour, contact signs, birth planning | `birth` library section with `/app/poth` and `/app/bondhon` navigation. Directory availability and request delivery are never assumed. |
| 7 | Food groups, fluids, food safety | `food` library section, with the applicable NHS guidance. Personal nutrition and supplement plans remain with the care team. |
| 8–10 | Proposed daily tracker, symptom checklist, vitals, fetal health, risk assessment, contractions, medicines, appointments, birth preparation | Existing week guide, daily notes, records and visit links cover educational/reference and some record tasks. A clinical symptom checker, risk classifier, contraction timer, medication reminders and real appointment booking are **not implemented**. |
| 8–10 | Proposed postpartum and newborn monitoring | `after-birth` library section; mother and baby records stay distinct. Full postpartum, vaccine and infant-growth trackers are **not implemented**. |
| 10 | Proposed clinician consultation and emergency call flow | `/safety`, Poth and consent-controlled Bondhon are linked. No clinician acknowledgement, live consultation or emergency dispatch is implied by the library. |
| 11–12 | Flutter/React Native, React, Python/FastAPI, databases, publication plan | Technical proposals only. PROHOR's existing Next.js architecture and repository rules remain the implementation source of truth. |
| 11–13 | Bilingual access, privacy, offline help, clinician review, early-warning validation | Content uses Bangla and accessible controls; sources are visible. **Clinical review and validation are outstanding**. No unvalidated early-warning algorithm was added. Offline availability of the linked guidance is not guaranteed. |

## Review and safety boundary

- The library is educational. It does not use private records to diagnose, grade risk or create treatment instructions.
- Every clinical content item has a direct source link. Source links are kept separate from personal observations and do not imply clinician confirmation of a record.
- The week selector changes the guide preview only. Account dates and recorded measurements change only through their own reviewed flows.
- Before claiming clinical readiness, a qualified maternal-care and neonatal clinician must review the Bangla wording, local emergency pathways, source suitability for Bangladesh, and later updates to cited guidance.
- The PDF describes a broad roadmap. The user request is fulfilled as a detailed Jibonrekha information experience within the existing product; roadmap proposals that need new validated clinical workflows remain explicitly limited.

## Verification on 20 November 2026

- `npm.cmd run typecheck -- --incremental false`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed, including `/app/jibonrekha` and `/demo/jibonrekha`.
- `PROHOR_TEST_URL=http://localhost:3002 node --test src/features/jibonrekha/lifeline-experience.browser.test.mjs`: **12/12 passed** against a fresh production build. Includes keyboard opening of the source-linked library, 320px reflow, axe checks, week selection, record and visit flows, and theme/contrast checks.
- Visual review: [`screenshots/pregnancy-reference-mobile.png`](screenshots/pregnancy-reference-mobile.png), captured at 390px with the warning-sign topic expanded. Closed topics keep the main week task readable.
- Manual screen-reader and clinician review have **not** been completed. The screenshot and automated checks are evidence of the tested states only, not a certification or clinical approval.
