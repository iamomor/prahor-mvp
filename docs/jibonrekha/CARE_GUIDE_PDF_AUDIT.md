# Jibonrekha pregnancy care guide: source and safety audit

Input: `গর্ভাবস্থার ১ম থেকে ৩৮তম সপ্তাহের আল্ট্রাসাউন্ড ও অন্যান্য পরীক্ষার গাইড.pdf` (3 pages, supplied by the user). Reviewed on 2026-11-19. Its content is reference material, not product instructions or a clinical order set.

The guide appears in both the synthetic `/demo/jibonrekha` and the account Jibonrekha screen. The same guide data powers both. It covers completed gestational weeks 1–41 and day 0–6 for navigation. Daily selection **does not** generate daily tests or diagnoses. An unknown pregnancy date stays unknown. Recording a note remains a separate action. The demo remains device-only and synthetic; the account page uses its own authenticated record flow.

| PDF location | Material accounted for | Product treatment |
| --- | --- | --- |
| p.1, weeks 1–4 | LMP-based dating, pregnancy test, β-hCG | Early confirmation and first contact; no universal serial β-hCG instruction. Weeks 1–2 explicitly show no new fixed test. |
| p.1, weeks 5–6 | Early scan, gestational location, heartbeat | Optional early assessment with a note that a very early scan can be inconclusive. |
| p.1, weeks 7–9 | Dating, CBC, blood group/Rh, glucose, TSH, hepatitis B, syphilis, urine | Booking visit, routine tests and clinician-dependent extras; no fixed interpretation of values. |
| p.2, weeks 11–12 | NT scan, optional double marker | Dating scan and optional chromosome screening, with the screening-versus-diagnosis distinction. |
| p.2, weeks 13–16 | Cervical length, urine, blood pressure | Cervical assessment is shown only for an indication; NICE's relevant 16–24-week window is used. BP and prior results are revisited at antenatal contacts. |
| p.2, weeks 18–22 | Anomaly scan, organs, placenta, fluid | Anatomy and placental-location scan, with NICE's narrower 18+0–20+6 offer described and local timing caveat. |
| p.2, weeks 24–27 | OGTT, CBC, Rh antibody test | Glucose and anemia discussion at 24–28 weeks, with individual Rh/Anti-D plan. |
| p.3, weeks 28–32 | Growth scan, CBC, urine, proteinuria, BP | Maternal review at visits; growth ultrasound only when clinically indicated. |
| p.3, weeks 33–35 | Doppler, liver/kidney tests | Clearly conditional, not a universal schedule. |
| p.3, weeks 36–38 | Position, BPP, NST/CTG, CBC, coagulation, viral screening | Birth preparation; surveillance and extra labs only when indicated. No claim that a scan alone determines delivery method or guarantees wellbeing. |
| Beyond PDF, weeks 39–41 | Not in supplied guide | Continuity to due date and post-date discussion, using WHO's later contacts. |

## Clinical editorial decisions

The PDF contains absolute “normal” cutoffs for fetal heart rate, hemoglobin, TSH, OGTT, cervical length, AFI and BPP. These are **not** exposed as automatic pass/fail values. Interpretation depends on gestation, method, laboratory, history and clinical context. The PDF also suggests universal late growth/term scans and CTG/BPP. NICE recommends against routine ultrasound after 28 weeks for an uncomplicated singleton pregnancy, and ACOG frames extra fetal surveillance around indications. The product therefore labels these steps conditional and makes no treatment recommendation. Its statement that a scan can confirm adequate oxygen/nutrition or the delivery route was not carried into UI copy.

No daily clinical schedule exists in the attachment. Every selectable week/day has an explicit everyday information path, note action, urgent-help link, and an explicit explanation when no separate fixed test is specified. This is educational coverage, not a promise that all clinical care can be done in the app.

## Independent sources used for checks

- [WHO antenatal care interventions and contacts](https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/handbooks/programme-manager-s-handbook-mncah/recommendations-on-interventions-along-life-course/maternal)
- [NICE antenatal care NG201](https://www.nice.org.uk/guidance/ng201/chapter/Recommendations)
- [NICE early pregnancy assessment NG126](https://www.nice.org.uk/guidance/NG126/chapter/diagnosis-of-viable-intrauterine-pregnancy-and-of-tubal-ectopic-pregnancy)
- [NICE preterm labour NG25](https://www.nice.org.uk/guidance/ng25/chapter/Recommendations)
- [ACOG routine tests during pregnancy](https://www.acog.org/womens-health/faqs/routine-tests-during-pregnancy)
- [ACOG indications for antenatal fetal surveillance](https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2021/06/indications-for-outpatient-antenatal-fetal-surveillance)

International guidance may differ from local practice. Before this becomes a live clinical guide in Bangladesh, a locally licensed maternity clinician must review the Bangla copy, test choices, local availability and referral pathways. Current status: **educational prototype**, with source links and no automated interpretation.

## Verification record

- Production build, strict typecheck and lint completed; lint has one pre-existing auth navigation warning and no errors.
- New guide browser path checked at 320px, keyboard Enter, larger text, week 1/24/34/38/40, source display, note handoff and automated axe rules.
- Existing Jibonrekha demo and detailed records browser suites, domain tests and three-theme contrast checks passed.
- Captures: [`care-guide-mobile.png`](screenshots/care-guide-mobile.png) and [`care-guide-desktop.png`](screenshots/care-guide-desktop.png).
- A manual NVDA/VoiceOver session, clinical sign-off and Bangladesh-specific service-path review remain outstanding; automated tests do not establish WCAG certification or clinical validation.
