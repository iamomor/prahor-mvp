# BUJHI (বুঝি) — Medical report understanding: master runbook

Canvas (9 boards): https://claude.ai/artifact/2tJs7Ck43mEbWBFHrbQRrP
Boards: 1 Start · 2 Upload (interactive) · 3 Reading / failed · 4 Review (interactive) · 5 Understand · 6 Confirm & save · 7 All states · 8 Text-only view (blind / low vision) · 9 Desktop (report beside fields)
Companions delivered earlier: Bujhi Playbook PDF, Workbook XLSX, review/commit migration + SQL tests, route files, synthetic fixtures (supported, ambiguous, no-unit, wrong-document PNGs), `ocr-word-confidence.ts`.
Fictional data only. Nothing here ran inside the real app.

## 1. Promise, in one line

**Upload → Extract → Review → Explain → Save to the correct record.** The mother checks every line against her own report before anything becomes part of her record. OCR is never presented as a fact.

## 2. Scope (honest)

| In                                                              | Out (say so in the demo)                             |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| ONE supported synthetic report format `prohor-synthetic-lab-v1` | Real patient reports, other formats, prescriptions   |
| Extraction of labelled values + units + dates                   | Interpreting values, "normal/abnormal", risk         |
| Per-line mother decision: accept / correct / reject             | Auto-accept, bulk accept                             |
| Plain-language explanation of verified terms                    | Diagnosis, advice, treatment                         |
| Authorized save to mother or baby record                        | Silent saves, saving the original file to the record |

## 3. Signature design: "source beside meaning"

Every line is a card with three things side by side: **what the report says** (raw text, record font), **what we read** (parsed), **what you decide** (3 big buttons). Lines the engine is unsure about come first. Certainty is shown in **words + icon + border style**, never a percentage and never a verdict colour. A synthetic report picture (with the active line outlined) stays visible; on desktop it sticks beside the fields. A text-only view mirrors it for screen readers.

## 4. Journey and states (matches contract `bujhi.ts`)

1. **Start**: what can be read, 4-step progress, alternatives (type, speak), my reports.
2. **Upload**: PDF ≤5 MB, tick "this is a fictional report" (`syntheticConfirmed: true`), wrong type/size errors inline.
3. **Reading**: `queued` → `processing` → `review_required` | `failed`(`unsupported_format` | `unreadable` | `engine_unavailable`). No invented percentages or timers. Cancel allowed. Failure always offers manual entry.
4. **Review**: per field accept / correct / reject. Rules below. Report date required for kept lines. Destination: mother or baby.
5. **Understand**: only for lines she kept: what it is (approved source), her verified value, the interval **printed on her report** (labelled as the lab's, not ours), questions to ask her doctor, listen, English/Bangla.
6. **Confirm & save**: exact preview (what will be saved, what was rejected, "file is not saved"), tick, save. Result words: saving… / "Saved in your account" (only after server confirms) / 409 / session expired / unconfirmed.

### Review rules (code: `code/bujhi-review.ts`, tests pass)

- "Looks right" is blocked when there is no parsed measurement, no unit, or `unknown_unit`/`illegible` is flagged. She must correct (with a unit she chooses) or reject. We never guess a unit.
- Corrected value must be a decimal string; unit required (except notes); no comma decimals silently converted.
- Kept lines need a valid date; rejecting everything is allowed and saves nothing.
- Review request = `reviewExtractionRequest` shape with `reviewedByMother: true`. Commit = `reviewId` + `expectedReviewRevision` + `confirmSave: true`; values come from the saved snapshot, not a second client payload.
- Order: `check` (has uncertainty flags) → `low` → `unknown` → `clear`. Threshold 0.9 is a placeholder to tune on fixtures.

### Uncertainty labels (contract enum → Bangla)

illegible → লেখা অস্পষ্ট · unknown_unit → একক নেই বা চেনা যায়নি · ambiguous_label → নাম পরিষ্কার নয় · missing_date → তারিখ নেই · engine_uncertain → পড়ার যন্ত্র নিশ্চিত নয়

## 5. Provenance after save

Saved rows are `document_extracted`, user-verified: badge "রিপোর্ট থেকে নেওয়া · আপনি মিলিয়েছেন". They are not "clinician-confirmed". Editing later adds a correction row (see Jibonrekha runbook).

## 6. Every mother

| Need                   | Design answer                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Cannot see the image   | Text-only view with each line as term + value + certainty; spoken status for progress and decisions |
| Low literacy           | Icons + words, read-aloud, 3 big buttons, no jargon                                                 |
| Motor difficulty       | 48–56px targets, no drag/zoom needed to decide                                                      |
| Helper beside her      | She, not the helper, ticks confirm before save                                                      |
| Poor connection        | Upload/read/save need network; work is kept on the phone; honest offline state                      |
| Fear of numbers        | No verdicts; "ask your doctor" prompts                                                              |
| Wrong/unsupported file | Clear reason + manual entry path                                                                    |

## 7. Safety and trust rules

No "normal/high/low/risk". Printed intervals are shown only as printed on her report. No AI explanation without approved sources; unreviewed text is badged "review pending". No real patient reports in the demo (checkbox + warning state). Barta questions about a result must cite sources and may abstain.

## 8. Task cards

Owners per workflow V2: Iftee extraction engine → Ifty review/domain save → Omor security review; Samin/Apurbo UI. Message owners before editing their files.

1. **Review helpers**: add `bujhi-review.ts` + test (delivered here).
2. **Review UI**: per-field card with 3 decisions; blocked-accept reason; sticky report on desktop. Reuse `ReportReview.tsx` data flow; replace its layout.
3. **Upload UI + validation**: PDF ≤5 MB, synthetic tick, errors (existing `upload-validation.ts`).
4. **Reading screen**: map extraction `status`/`errorCode` to the three failure screens.
5. **Understand screen**: explanation blocks with source line + review-pending badge.
6. **Save screen**: preview + confirm; wire `commit` route and migration (earlier delivery); 409/expired/unconfirmed states.
7. **Text-only view**: `<dl>` per line; live-region messages.
8. **QA pass** with the 4 synthetic fixtures + screenshots.

## 9. Decisions needed

1. **PDF vs image.** Contract `createDocumentRequestSchema` says PDF only (`application/pdf`), while the repo UI and V2 workflow describe an English synthetic _image_ with browser OCR. Pick one path for the demo and make contract and UI agree.
2. Which approved source supplies term explanations (name/version shown on the Understand screen)?
3. Where does the original file live after review (kept, discarded)? Design says "not saved to the record".
4. Confidence threshold and who tunes it.

## 10. Demo script (3 min, fictional)

1. Start: say what is and isn't supported.
2. Upload the synthetic PDF with the tick; start reading.
3. Review: glucose has no unit, "looks right" is refused; choose mg/dL after checking the report; Hb accept; type the smudged date; destination mother.
4. Understand: Hb explanation, printed interval labelled as the lab's.
5. Save: preview, tick, save; show "Saved in your account" only after server confirm.
6. Open Jibonrekha timeline: row shows "from report · you verified".
   Do not claim: real OCR accuracy, clinical validation, other formats.

## 11. QA matrix (not yet run)

- 4 fixtures: supported, ambiguous, no-unit, wrong document. Expected: review with flags; no-unit blocks accept; wrong document → unsupported/unreadable path.
- Keyboard only; NVDA/VoiceOver; text-only view parity with image view.
- 3 themes × contrast × 3 text sizes; 320/390/768/1280; 200% text.
- Offline at each step; session expiry at save; two-tab conflict (409); retry idempotent (no duplicate rows).
- Axe on each screen; Bangla wrapping; clinician review of explanations; native review of Bangla.

## 12. Limits

Design canvas (9 boards), this runbook, one tested helper (`bujhi-review`, dependency-free, not wired). Not rendered by me, not run in the app, not user-tested, no accessibility conformance claim. All Bangla and explanation text is draft and needs native and clinician review.
