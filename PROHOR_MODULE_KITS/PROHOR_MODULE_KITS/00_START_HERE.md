# PROHOR module kits: start here (20 Nov 2026)

Built against `main` at **57e9632**. Every patch below was checked by Claude on a clean copy of that commit.

## What is in this kit

| Module | Real fix in this kit | Files | Who applies | Time |
|---|---|---|---|---|
| M1 Adapt | Test script with exact screens, keys and expected results | `M1-adapt/` | Iftee | 75 min of testing |
| M2 Barta | **Safety fix**: 15 danger-sign phrasings that got a normal answer now go to urgent care; 1 Bangla self-harm phrase now goes to crisis support. **AAC picture-symbol sentences (fever + weak, swelling + headache, bleeding + pelvis, headache + dizzy) keep their safety step**. 7 unit tests | `M2-barta/` | Ifty | 10 min |
| M3 Shonket | Every warning topic now has **Call 999 / Ask a person / Read about this in Barta**; public `/ask?q=` pre-fill | `M3-shonket/` | Samin | 10 min |
| M4 Jibonrekha | Demo-mother data sheet (exact values to type) + test script | `M4-jibonrekha/` | Apurbo | 30 min |
| M5 Bujhi | **Uploadable sample report PNG** (the repo only had a PDF, which upload refuses). OCR + the app's own parser read Hb 11.2 g/dL from it | `M5-bujhi/` (patch, PNG, OCR evidence) | Apurbo | 5 min |
| M6 Shusthota | Wording sweep done (clean); demo labels present; hand-test script | `M6-shusthota/` | Apurbo + Samin | 30 min |
| M7 Poth | **Maternity filter fix**: `gynaecology`/`maternity` OSM tags now count; maternity category goes from 1 to 25 places. Unit test added | `M7-poth/` | Samin | 10 min |
| M8 Bondhon | Two-account test script; diary/AI chat exclusion and simulated labels verified in code | `M8-bondhon/` | Omor + Samin | 40 min |
| All | One combined patch | `ALL-modules.patch` | Omor | 5 min |
| Tracker | Worksheet with 49 task IDs, progress, click-through, sign-offs | `PROHOR_Finish_Line_Worksheet.xlsx` | All | — |
| Submission | README section: honesty table, demo script, run notes | `SUBMISSION_README_SECTION.md` | Omor | 10 min |

## Apply (one PR, fastest)

```bash
git checkout main && git pull
git checkout -b claude/module-kits-20nov
git apply --index ALL-modules.patch        # includes the PNG (binary)
node --test tests/unit/*.mjs               # expect 62 pass, 0 fail
git commit -m "Module kits: Barta danger signs, Shonket actions, Bujhi sample PNG, Poth maternity tags"
git push -u origin claude/module-kits-20nov  # open PR, one reviewer, merge before 09:00
```
Or apply one module at a time: `git apply --index M2-barta/M2-barta.patch` (each patch also applies alone).

## Verified by Claude (02:30–03:00)
- Each patch applies alone and all together to a clean `57e9632`.
- Unit tests on the combined result: **52 pass, 0 fail** (`node --test tests/unit/*.test.mjs` on main 84588e5; Barta danger signs 7).
- Barta safety run (65 phrases): **50/65 before → 65/65 after**, no false alarms on 10 everyday questions. Barta question bank (808 questions): **0 routing changes**. AAC combinations (26, English + Bangla): the 4 per language that lost their safety step now keep it; anxious and help + doctor still get a normal answer (`M2-barta/M2-barta-AAC-safety-run.md`).
- Every changed file parses; Shonket pages server-rendered with all three actions on all 4 topics.

## Not verified by Claude
- `npm ci`, typecheck, lint, `next build`, Playwright: no project install in the sandbox (gate G1/G2).
- Nothing clicked in a deployed browser; no live database writes.
- Bangla wording: language check only by the team (sheet R3). No clinician has reviewed anything (sheet R2).
