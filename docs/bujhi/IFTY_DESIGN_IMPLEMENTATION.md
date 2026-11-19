# Bujhi design implementation — synthetic PDF demo

Preview route: `/demo/bujhi`. The earlier manual, image and speech demo remains at `/demo/bujhi/legacy`; the existing account route is separate.

## Material coverage

The `bujhi ifty.rar` runbook, review helper and tests, and the nine-board **Bujhi — Medical report understanding.html** canvas were reviewed as design inputs. Their clinical and backend statements are specifications, not evidence that those capabilities work. This implementation follows the visual hierarchy, task order, source-beside-meaning review, and mobile/desktop layouts while using existing PROHOR tokens and components.

| Board | Implementation |
| --- | --- |
| 1 Start | Four steps, supported sample, manual/speech alternatives, honest saved/empty state |
| 2 Upload | Synthetic consent, PDF and size checks, downloadable exact sample |
| 3 Reading / failed | Local file signature and SHA-256 checks, error with retry and manual path |
| 4 Review | Uncertain line first; raw and read values; accept/correct/reject; date and record destination |
| 5 Understand | Kept values only, printed interval labelled as the lab's, questions, Bangla/English, read aloud, linked MedlinePlus sources |
| 6 Confirm / save | Exact included/excluded preview, explicit consent, local save result and Jibonrekha link |
| 7 All states | Explanations for empty, failed, offline, rejected and account limits |
| 8 Text-only | Semantic term/value list matching the sample report |
| 9 Desktop | Report panel beside decisions, sticky on wide viewports |

The sample fixture is `public/bujhi/prohor-synthetic-lab-v1.pdf`, SHA-256 `A5191290916D06F8DA6DC6CF041A479DEED5A16495E820D641816DAAD60868CA`. Its Hb is 11.2 g/dL; glucose `92` has no unit, so direct acceptance is blocked; the printed date is ambiguous and must be entered by the reviewer. An exact file hash match selects fixed fixture fields. This is **not arbitrary PDF extraction or OCR**. Other files fail closed with a manual-entry path. The original PDF is never persisted by the new demo. Only reviewed fields are written to the existing local Jibonrekha detailed-record store, with source metadata. No server or clinician receives the result.

The new demo uses the existing `saveDemoObservations` contract. The account route keeps its existing limited review/commit workflow. The runbook's server revision conflict, session-expired and account-save states cannot be represented as completed in the local demo. The older image and speech flow remains usable through the legacy route.

## QA

- `npm.cmd run typecheck -- --incremental false` — passed.
- `npm.cmd run lint` — passed with one pre-existing warning in `AccountWorkspace.tsx`.
- `npm.cmd run build` — passed.
- `node --test src/features/bujhi/bujhi-experience.browser.test.mjs src/features/bujhi/medical-entry.browser.test.mjs` — 11 passed. Covers exact sample, blocked missing-unit accept, reject-all, consent, Jibonrekha result, keyboard Enter, mobile reflow and axe checks on key states.
- `node --test src/features/bujhi/upload.browser.test.mjs src/features/bujhi/validation.test.mjs src/features/bujhi/bujhi-review.test.mjs` — passed during integration (the older OCR parser has an unrelated pre-existing uncommitted change).

Screenshots: [start mobile](start-mobile.png), [review mobile](review-mobile.png), [review desktop](review-desktop.png). Regenerate them with `node scripts/capture-bujhi.mjs` while the dev server is running.

Remaining validation: native Bangla and clinician review of explanation wording; manual NVDA/VoiceOver and 200% text checks on all theme/contrast combinations. This is a demo, not clinical validation or accessibility certification.
