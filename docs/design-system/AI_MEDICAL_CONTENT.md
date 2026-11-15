# AI, healthcare content, privacy and trust UX

## Medical facts and language model boundaries
PROHOR is an AI-assisted maternal healthcare *information and coordination prototype*, not a diagnostic/treatment system. Don't create UI that implies automated clinician review, guaranteed fetal health status, independent clinical triage, medication advice or real hospital booking when only a demo exists.

## Barta — RAG answers
Only retrieve approved documents in scope, with source metadata: issuer, title, publication/last-reviewed date, locale, URL/record id. Show references that actually support the statements. No fabricated WHO or clinician links. AI must abstain where reviewed material does not cover a question, avoid individual diagnoses, and direct the user to appropriate professional care where necessary. Explain uncertain or incomplete information plainly.

## Bujhi — reports
Supported file types and extraction format are explicit. UI states: Uploading → Extracting → Verify values and units → Read educational explanation → Confirm record target → Save verified data. Keep raw extraction separate from reviewed value; preserve source document and change history. Never auto-write unverified OCR into a clinician-confirmed field.

## Jibonrekha — records
Separate mother and baby entities. For each observation: type, value, unit, time, author, provenance, verification state. A self-reported condition remains self-reported until a clinician confirms it; do not infer based solely on entered values. Charts and summaries offer the underlying source and data table.

## Shonket — urgency and help
Reviewed guidance and immediate-care pathway must exist independent of LLM availability. No scoring high/low risk using an unvalidated model. No unsent request marked delivered. If backend delivery is only simulated, label “demo provider” and ensure real backend acknowledgement corresponds to visible state.

## Shusthota — physical and mental wellness
Voluntary logs, no compulsory walking/steps/sleep thresholds, no user comparison, no speculative mental-health assessment, no shame or streak penalties. Do not prescribe generic exercises for all pregnancies; tailor educational content only where professionally reviewed and appropriate. Private diary excluded from general care summaries by default.

## Poth — care discovery
Accessibility and availability metadata are explicitly sourced and verified. Unknown = “Not verified”; never infer wheelchair access or booking availability from a generic facility category. Public sample directory must say demo data if fictional.

## Bondhon — authorization
Mother selects exact records, recipient, purpose, and sends after reviewing. Consent must be granular and revocable where applicable. AI summary is a draft, not an independent assessment; reviewed before sharing. Family status does not equal authorization. Provider access checked on the server with logs.

## User-facing language
Use “Recorded by you”, “Extracted from report — please check”, “Clinician confirmed”, “Not enough verified information”, “Saved on this device — not sent”, “Delivered to demo care queue”, rather than ambiguous “Normal”, “Safe”, “AI diagnosed”, “Emergency resolved”. Make error messages actionable and non-blaming.

## Verification and disclaimers
Use qualified references and maintain explicit demo labels. Log AI prompt/version, retrieved source ids and result for synthetic test cases where privacy permits. Evaluate hallucination, citation fidelity, Bangla fidelity, accessibility, fallback and unauthorized access. Keep authentic user data out of prompts without explicit authorization and lawful policies.
