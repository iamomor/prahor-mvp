# M8 Bondhon: final two-account proof worksheet

Owners: Omor (backend/deployment), Samin (screens/QA), Iftee (this UI integration).

Release commit: __________  URL: __________  Date/time (Bangladesh): __________
Browser A / viewport: __________  Browser B / viewport: __________  Reviewer: __________
Use the existing synthetic M4 demo mother and a different approved simulated provider account. Use independent browser profiles/contexts. Never use real patient information. No manual database changes to force an outcome.

## Prerequisites

- The release includes the current Bondhon code and the team’s existing reviewed migration chain. This package has no new SQL requirement.
- Omor confirms the correct hosted environment, approved provider role/recipient membership, same-origin auth configuration and both synthetic accounts.
- The demo mother already has synthetic blood-pressure and haemoglobin observations. A blood-pressure observation can be stored as separate systolic/diastolic records; do not invent a combined record. For the supplied **two-record** proof select one existing BP observation and one haemoglobin record. If both BP components are necessary, document a three-record variant explicitly.
- Typecheck, lint, HTTP/database regressions and a production build pass for the candidate commit. Record actual results; no earlier report proves this release.

## Core journey

Mark each row Pass / Fail / Not tested and record what was actually observed.

| # | Actor | Action | Required evidence | Result / notes |
| --- | --- | --- | --- | --- |
| 1 | Mother, phone width | `/app/bondhon` → Ask for help or prepare a visit | Form opens; heading receives focus; no records/replies preselected | |
| 2 | Mother | Visit-preparation purpose, approved provider, two existing BP/haemoglobin records, 1 hour, replies allowed; review and approve | Saved request ID; server status Delivered to simulated queue; end time labelled Bangladesh time; screenshot 02 | |
| 3 | Mother | Read the review before sending | Exact selected fields/values; Not shared includes diary, AI conversations and files; send disabled before approval | |
| 4 | Provider, separate account | `/provider` → locate the unique proof request | Simulated wording and remaining access time. Queue is sorted by ending soonest, so it need not be the newest/top row | |
| 5 | Provider | Open and acknowledge | Exactly the two authorized records and selected fields; no owner audit/grant data; screenshot 05 | |
| 6 | Mother | Refresh current access | Acknowledged by simulated provider; history reports provider-account openings, with no claim that a human read it | |
| 7 | Provider | Review and send `Please bring your ANC card (demo)` | Response persists; no success on a failed write | |
| 8 | Mother | Refresh | Responded status and the exact recorded reply visible | |
| 9 | Mother | Stop sharing → confirm | Server confirms revokedAt or closure; sharing ring has no active recipient for this request; screenshot 09 | |
| 10 | Provider | Refresh the open detail, then reload | No mother message/records/replies visible. Access ended/unavailable shown in open detail; reload removes request from authorized queue. Direct API access denied; screenshot 10 | |
| 11 | Both | Sign out, then Back | No private Bondhon content reappears. Existing route rechecks session, including a restored cache page. Check for transient flashes manually | |

The automated test checks refresh on the open detail plus direct API denial; also do the explicit browser reload in step 10. Browser Back behavior and no-flash behavior need manual observation in your actual browser.

## Additional release checks

| Check | Pass condition | Result / evidence |
| --- | --- | --- |
| Natural expiry | Let a synthetic permission expire naturally; provider reload/read/write denied; mother sees expired status. Do not edit rows to simulate it | |
| Unrelated account | A third synthetic account cannot view the request or records | |
| View only | Replies disabled at review; provider cannot send response/follow-up through UI or API | |
| Lost submission response | UI says unconfirmed; editing is frozen; retry uses the same body/key; one saved request, not a duplicate | |
| Failed withdrawal | UI does not claim stopped; retry/reconciliation uses the exact request and preserved key | |
| Record refresh | Removed fields disappear from selection; newly available fields never become selected automatically | |
| Preferences | English/Bangla, all themes, higher contrast, spacious layout and reduced motion preserve draft/selection/approval intent | |
| Keyboard | Compose → review → approval → send, Stop sharing dialog cancel/confirm, list/detail/back and error focus all work without mouse | |
| Reflow | 320/360/390/430/768/1024/1280/1440 widths; 200% text and 400% zoom; no overlap, clipped actions or horizontal document scroll | |
| Screen reader | Labels, step, record selections, errors, confirmation and changed access are understandable; no repeated per-second live countdown | |
| Shonket integration | Its shared CareRequestForm still receives/returns edited draft and communication method, and navigates to its own saved status | |
| Print | Sharing receipt prints independently without full-app content; printing/cancelling does not break the live view | |

## Failure routing

Record the step, exact UI text, request time, HTTP status and candidate commit. Never include credentials or real medical data. Omor handles auth, permissions, persistence and deployment. Samin/Iftee handle labels, layout, focus and UI-state failures. Do not modify the database by hand or replace working SQL with another implementation.

## Honest release status

Native units: 35 passed in preparation. Full project typecheck/lint/build/contracts/database and browser checks: pending on the candidate installation. Hosted two-account proof: pending. Screen-reader and real-device combinations: not tested here. Visual/accessibility scores are not assigned without rendered review; this package is not release sign-off.

Demo line: “She chooses who sees what and for how long, and stopping is real.” Use that line only after steps 9 and 10 pass on the deployed release.
