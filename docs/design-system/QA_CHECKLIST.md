# PROHOR — pre-merge and final-release QA checklist

Use for every relevant feature. Record **Pass / Fail / Not tested**, the test device, date, reviewer and evidence link. A checked box is not proof unless backed by an actual test.

## Product & task clarity
- [ ] Primary user job, start point and CTA are obvious.
- [ ] A mother can reach the chosen public task without irrelevant account/profile questions.
- [ ] All eight modules remain available independent of access preferences.
- [ ] No user is asked whether they are “disabled,” “normal,” or “special” in order to navigate.
- [ ] Module labels, back navigation and terminology are consistent.
- [ ] Every primary task has clear completion confirmation and next action.

## Visual craft
- [ ] Components use semantic design tokens; no unreviewed hardcoded colors.
- [ ] Hierarchy works with decoration removed; no random icon-card grids.
- [ ] Spacing/radii/elevation use shared scales; content is neither crowded nor empty by accident.
- [ ] Editorial images are original/approved, informative alt text where needed, and do not replace important text.
- [ ] Quiet Garden, Original Rose, Morning Mist themes render coherently if enabled.
- [ ] Higher contrast works independent of selected theme and remains legible.

## Accessibility
- [ ] Full welcome and core care journey keyboard operable, no traps.
- [ ] Focus is visible and not obscured behind sticky header/footer/dialog.
- [ ] Screen reader announces page heading, control labels, input status and relevant errors.
- [ ] Text >=4.5:1 ordinary, >=3:1 large; essential nontext UI contrast verified.
- [ ] No essential meaning conveyed by color, animation, icon or sound alone.
- [ ] Targets comfortable (~44–48px product target); no precision/drag-only actions.
- [ ] 200% text resize, 400% zoom/320px reflow without lost tasks.
- [ ] Bengali shaping, wrapping, correct `lang` and long translation labels checked.
- [ ] OS/app reduced-motion and forced-colors states respected.
- [ ] Audio and video content has transcript/captions as needed; no audio-only path.
- [ ] AAC and text communication path works without speaking, where implemented.
- [ ] Additional access settings can combine without disabling other options.
- [ ] Theme/text/layout changes preserve form draft, focus context and records.

## Trust, safety and medical provenance
- [ ] Mock clinical data marked synthetic; no invented clinician confirmations.
- [ ] Self-reported, extracted and clinician-confirmed data visibly distinguished.
- [ ] Barta has real source metadata and a safe insufficient-evidence response.
- [ ] AI does not diagnose, prescribe or unilaterally triage.
- [ ] Bujhi supports correcting extraction; no unverified save as confirmed data.
- [ ] Safety guidance is clinician reviewed and available independent of AI.
- [ ] Support request only says delivered/acknowledged when backend confirms it.
- [ ] Provider is labeled simulated if not a real participating health worker.
- [ ] Consent review shows exact records, recipient and purpose.
- [ ] Private diary is not shared by default; revocation and authorization checks tested.

## Responsive, technical and performance
- [ ] 320, 360, 390, 430, 768, 1024, 1280 and 1440px covered as relevant.
- [ ] Safe-area and mobile keyboard do not hide form or send controls.
- [ ] Loading, empty, error, retry, timeout, offline, local-only and success states exist.
- [ ] Connectivity loss does not falsely report data synced or help sent.
- [ ] No runtime/console errors; strict TS typecheck and lint pass.
- [ ] Automated accessibility checks and manual keyboard/SR checks documented.
- [ ] Data ownership and provider permissions enforced server-side.
- [ ] No secrets or real patient information in logs, analytics or commits.
- [ ] Critical demo journey passes in deployed release, not only localhost.

## Release decision
- [ ] Every critical defect fixed or affected functionality disabled transparently.
- [ ] Functionality statuses distinguish real, limited, mock and roadmap.
- [ ] AI tools/data sources and design assets documented.
- [ ] Screenshots and video match deployed build and source code.
- [ ] Known untested disability/device combinations and future validation work recorded.

Score 1–5: task clarity / visual craft / accessibility / localization / safety / privacy / responsiveness / working implementation. Any <4 blocks “ready” without an explicit, documented exception.
